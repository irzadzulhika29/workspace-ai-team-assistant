import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { google } from 'googleapis';
import crypto from 'crypto';
import prisma from '../lib/prisma.js';

const router = express.Router();

const getSupabaseHeaders = (extraHeaders = {}) => ({
  'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
  'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
  'Content-Type': 'application/json',
  ...extraHeaders,
});

const encodeFilterValue = (value) => encodeURIComponent(String(value));

const buildMemorySessionKey = (userId, sessionId) => `${userId}:${sessionId}`;

const fetchOwnedChatSession = async (sessionId, userId) => {
  const url = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}&select=id&limit=1`;
  const response = await fetch(url, {
    method: 'GET',
    headers: getSupabaseHeaders()
  });

  if (!response.ok) {
    throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
  }

  const rows = await response.json();
  return rows[0] || null;
};

const isValidTokenCount = (value) =>
  Number.isInteger(value) && value >= 0;

// Protected route example
router.get('/protected', requireAuth, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
});

// Return a fresh Google access token for the authenticated user.
// Auto-refreshes if the stored token is expired.
router.get('/google/token', requireAuth, async (req, res) => {
  try {
    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected. Connect your Google account first.',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      expiry_date: tokens.expiresAt ? tokens.expiresAt.getTime() : undefined
    });

    const { token } = await oauth2Client.getAccessToken();

    // Persist refreshed token if it changed
    if (token && token !== tokens.accessToken) {
      await prisma.googleToken.update({
        where: { userId: req.user.id },
        data: {
          accessToken: token,
          expiresAt: new Date(Date.now() + 3600 * 1000)
        }
      });
    }

    res.json({ access_token: token });
  } catch (error) {
    console.error('Error getting Google token:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch documents from Supabase using service role key
router.get('/dokumen', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const url = `${process.env.SUPABASE_URL}/rest/v1/dokumen?user_id=eq.${encodeFilterValue(userId)}&select=*&order=created_at.desc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching dokumen:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete a document from Supabase
router.delete('/dokumen/:documentId', requireAuth, async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user.id;

    // Verify ownership before deleting
    const checkUrl = `${process.env.SUPABASE_URL}/rest/v1/dokumen?id=eq.${encodeFilterValue(documentId)}&user_id=eq.${encodeFilterValue(userId)}&select=id`;
    const checkResponse = await fetch(checkUrl, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!checkResponse.ok) {
      throw new Error(`Supabase error: ${checkResponse.status} ${checkResponse.statusText}`);
    }

    const docs = await checkResponse.json();
    if (!docs || docs.length === 0) {
      return res.status(404).json({ error: 'Document not found or you do not have permission to delete it' });
    }

    // Delete the document
    const deleteUrl = `${process.env.SUPABASE_URL}/rest/v1/dokumen?id=eq.${encodeFilterValue(documentId)}&user_id=eq.${encodeFilterValue(userId)}`;
    const deleteResponse = await fetch(deleteUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!deleteResponse.ok) {
      throw new Error(`Failed to delete document: ${deleteResponse.status} ${deleteResponse.statusText}`);
    }

    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting dokumen:', error);
    res.status(500).json({ error: error.message });
  }
});

// Insert token usage execution data from n8n
router.post('/token-usage', async (req, res) => {
  try {
    const n8nApiKey = req.headers['x-n8n-api-key'];
    if (!process.env.N8N_API_KEY || n8nApiKey !== process.env.N8N_API_KEY) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      execution_id,
      timestamp,
      workflow_id,
      workflow_name,
      llm_model,
      input_tokens,
      completion_tokens,
      execution_time,
    } = req.body;

    if (
      !execution_id ||
      !workflow_id ||
      !workflow_name ||
      !llm_model ||
      !isValidTokenCount(input_tokens) ||
      !isValidTokenCount(completion_tokens)
    ) {
      return res.status(400).json({
        error: 'execution_id, workflow_id, workflow_name, llm_model, input_tokens, and completion_tokens are required'
      });
    }

    const payload = {
      execution_id,
      workflow_id,
      workflow_name,
      llm_model,
      input_tokens,
      completion_tokens,
    };

    if (timestamp) {
      payload.timestamp = timestamp;
    }

    if (execution_time !== undefined && execution_time !== null) {
      payload.execution_time = execution_time;
    }

    const url = `${process.env.SUPABASE_URL}/rest/v1/execution_token_usage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: getSupabaseHeaders({
        'Prefer': 'return=representation'
      }),
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    const rows = await response.json();
    res.json(rows[0] || payload);
  } catch (error) {
    console.error('Error inserting token usage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get token usage summary and recent execution logs
router.get('/token-usage', async (req, res) => {
  try {
    const requestedLimit = Number.parseInt(req.query.limit, 10);
    const limit = Number.isInteger(requestedLimit)
      ? Math.min(Math.max(requestedLimit, 1), 500)
      : 100;
    const period = String(req.query.period || '').trim().toLowerCase();

    let periodStart = null;
    let periodEnd = null;

    if (period === 'current_month') {
      const now = new Date();
      periodStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
      periodEnd = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0, 0));
    }

    const filterSegments = [];
    if (periodStart) {
      filterSegments.push(`timestamp=gte.${encodeURIComponent(periodStart.toISOString())}`);
    }
    if (periodEnd) {
      filterSegments.push(`timestamp=lt.${encodeURIComponent(periodEnd.toISOString())}`);
    }

    const filterQuery = filterSegments.length ? `&${filterSegments.join('&')}` : '';

    const recentUrl = `${process.env.SUPABASE_URL}/rest/v1/execution_token_usage?select=id,execution_id,timestamp,workflow_id,workflow_name,llm_model,input_tokens,completion_tokens,execution_time&order=timestamp.desc&limit=${limit}${filterQuery}`;
    const summaryUrl = `${process.env.SUPABASE_URL}/rest/v1/execution_token_usage?select=workflow_id,workflow_name,input_tokens,completion_tokens,timestamp${filterQuery}`;

    const [recentResponse, summaryResponse] = await Promise.all([
      fetch(recentUrl, {
        method: 'GET',
        headers: getSupabaseHeaders()
      }),
      fetch(summaryUrl, {
        method: 'GET',
        headers: getSupabaseHeaders()
      })
    ]);

    if (!recentResponse.ok) {
      throw new Error(`Supabase error: ${recentResponse.status} ${recentResponse.statusText}`);
    }

    if (!summaryResponse.ok) {
      throw new Error(`Supabase error: ${summaryResponse.status} ${summaryResponse.statusText}`);
    }

    const rows = await recentResponse.json();
    const summaryRows = await summaryResponse.json();

    const summary = summaryRows.reduce((acc, row) => {
      acc.totalExecutions += 1;
      acc.totalInputTokens += row.input_tokens || 0;
      acc.totalCompletionTokens += row.completion_tokens || 0;

      const workflowKey = row.workflow_id || row.workflow_name;
      if (workflowKey) {
        acc._workflowSet.add(workflowKey);
      }

      return acc;
    }, {
      totalExecutions: 0,
      totalInputTokens: 0,
      totalCompletionTokens: 0,
      _workflowSet: new Set(),
    });

    res.json({
      rows,
      summary: {
        totalExecutions: summary.totalExecutions,
        totalInputTokens: summary.totalInputTokens,
        totalCompletionTokens: summary.totalCompletionTokens,
        totalTokens: summary.totalInputTokens + summary.totalCompletionTokens,
        totalWorkflows: summary._workflowSet.size,
        latestTimestamp: rows[0]?.timestamp || null,
      },
      period: {
        type: period || 'all_time',
        start: periodStart ? periodStart.toISOString() : null,
        end: periodEnd ? periodEnd.toISOString() : null,
      },
    });
  } catch (error) {
    console.error('Error fetching token usage:', error);
    res.status(500).json({ error: error.message });
  }
});

// Create new chat session
router.post('/sessions', requireAuth, async (req, res) => {
  try {
    const { judul = "Obrolan Baru", chat_type = "general_chat" } = req.body;
    const newSessionId = crypto.randomUUID();
    const userId = req.user.id;
    const payload = {
      id: newSessionId,
      user_id: userId,
      judul,
      chat_type,
    };

    const url = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        ...getSupabaseHeaders(),
        'Prefer': 'return=representation'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    const rows = await response.json();
    res.json(rows[0] || payload);
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all chat sessions
router.get('/sessions', requireAuth, async (req, res) => {
  try {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');

    const { chat_type } = req.query;
    const userId = req.user.id;
    const filters = [`user_id=eq.${encodeFilterValue(userId)}`];

    if (chat_type) {
      filters.push(`chat_type=eq.${encodeFilterValue(chat_type)}`);
    }

    const url = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions?select=id,judul,chat_type,created_at&${filters.join('&')}&order=created_at.desc`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!response.ok) {
      throw new Error(`Supabase error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error fetching sessions:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get chat history for a session
router.get('/sessions/:sessionId/history', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const ownedSession = await fetchOwnedChatSession(sessionId, userId);

    if (!ownedSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Fetch chat history from chat_messages table
    const historyUrl = `${process.env.SUPABASE_URL}/rest/v1/chat_messages?session_id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}&order=created_at.asc&select=id,session_id,input,output,created_at`;
    const historyResponse = await fetch(historyUrl, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    if (!historyResponse.ok) {
      throw new Error(`Supabase error: ${historyResponse.status} ${historyResponse.statusText}`);
    }

    const rows = await historyResponse.json();

    // Fetch dokumen output for this session
    const dokumenUrl = `${process.env.SUPABASE_URL}/rest/v1/dokumen?session_id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}&kategori=eq.output&order=created_at.asc&select=file_url,nama_file,created_at`;
    const dokumenResponse = await fetch(dokumenUrl, {
      method: 'GET',
      headers: getSupabaseHeaders()
    });

    let dokumen = [];
    if (dokumenResponse.ok) {
      dokumen = await dokumenResponse.json();
    }

    res.json({ history: rows, dokumen });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete chat session
router.delete('/sessions/:sessionId', requireAuth, async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;
    const ownedSession = await fetchOwnedChatSession(sessionId, userId);

    if (!ownedSession) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Delete messages first from chat_messages table
    const messagesUrl = `${process.env.SUPABASE_URL}/rest/v1/chat_messages?session_id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}`;
    const messagesResponse = await fetch(messagesUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to delete messages: ${messagesResponse.status}`);
    }

    const dokumenUrl = `${process.env.SUPABASE_URL}/rest/v1/dokumen?session_id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}`;
    const dokumenResponse = await fetch(dokumenUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!dokumenResponse.ok) {
      throw new Error(`Failed to delete documents: ${dokumenResponse.status}`);
    }

    const memorySessionKey = buildMemorySessionKey(userId, sessionId);

    const memoriesUrl = `${process.env.SUPABASE_URL}/rest/v1/n8n_memories?session_id=eq.${encodeFilterValue(memorySessionKey)}`;
    const memoriesResponse = await fetch(memoriesUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!memoriesResponse.ok) {
      throw new Error(`Failed to delete memories: ${memoriesResponse.status}`);
    }

    const historyMemoriesUrl = `${process.env.SUPABASE_URL}/rest/v1/n8n_chat_histories?session_id=eq.${encodeFilterValue(memorySessionKey)}`;
    const historyMemoriesResponse = await fetch(historyMemoriesUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!historyMemoriesResponse.ok) {
      throw new Error(`Failed to delete legacy memories: ${historyMemoriesResponse.status}`);
    }

    // Delete session
    const sessionUrl = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${encodeFilterValue(sessionId)}&user_id=eq.${encodeFilterValue(userId)}`;
    const sessionResponse = await fetch(sessionUrl, {
      method: 'DELETE',
      headers: getSupabaseHeaders()
    });

    if (!sessionResponse.ok) {
      throw new Error(`Failed to delete session: ${sessionResponse.status}`);
    }

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Google Docs
router.get('/google/docs', requireAuth, async (req, res) => {
  try {
    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.document'",
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50
    });

    res.json({ files: response.data.files });
  } catch (error) {
    console.error('Error fetching Google Docs:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Google Sheets
router.get('/google/sheets', requireAuth, async (req, res) => {
  try {
    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const drive = google.drive({ version: 'v3', auth: oauth2Client });
    
    const response = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet'",
      fields: 'files(id, name, modifiedTime, webViewLink)',
      orderBy: 'modifiedTime desc',
      pageSize: 50
    });

    res.json({ files: response.data.files });
  } catch (error) {
    console.error('Error fetching Google Sheets:', error);
    res.status(500).json({ error: error.message });
  }
});

// Fetch Google Calendar events
router.get('/google/calendar', requireAuth, async (req, res) => {
  try {
    const { calendarId = 'primary', timeMin, timeMax, maxResults = 50 } = req.query;

    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId,
      ...(timeMin ? { timeMin } : {}),
      ...(timeMax ? { timeMax } : {}),
      maxResults: parseInt(maxResults, 10),
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/google/calendar', requireAuth, async (req, res) => {
  try {
    const {
      calendarId = 'primary',
      summary,
      description,
      location,
      attendees,
      start,
      end,
      allDay = false,
      timeZone,
      addGoogleMeet = false,
    } = req.body || {};

    if (!summary?.trim()) {
      return res.status(400).json({ error: 'Summary is required.' });
    }

    if (!start || !end) {
      return res.status(400).json({ error: 'Start and end are required.' });
    }

    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    const normalizedTimeZone = timeZone || 'Asia/Jakarta';

    const eventResource = {
      summary: summary.trim(),
      ...(description ? { description } : {}),
      ...(location ? { location } : {}),
      ...(Array.isArray(attendees) && attendees.length
        ? {
            attendees: attendees
              .filter((attendee) => attendee?.email)
              .map((attendee) => ({ email: attendee.email })),
          }
        : {}),
      ...(allDay
        ? {
            start: { date: start },
            end: { date: end },
          }
        : {
            start: { dateTime: start, timeZone: normalizedTimeZone },
            end: { dateTime: end, timeZone: normalizedTimeZone },
          }),
    };

    const response = await calendar.events.insert({
      calendarId,
      requestBody: eventResource,
      ...(addGoogleMeet
        ? {
            conferenceDataVersion: 1,
            requestBody: {
              ...eventResource,
              conferenceData: {
                createRequest: {
                  requestId: crypto.randomUUID(),
                  conferenceSolutionKey: { type: 'hangoutsMeet' },
                },
              },
            },
          }
        : {}),
    });

    res.status(201).json(response.data);
  } catch (error) {
    console.error('Error creating Google Calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

router.delete('/google/calendar/:eventId', requireAuth, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { calendarId = 'primary' } = req.query;

    if (!eventId) {
      return res.status(400).json({ error: 'Event ID is required.' });
    }

    const tokens = await prisma.googleToken.findUnique({
      where: { userId: req.user.id }
    });

    if (!tokens) {
      return res.status(403).json({
        error: 'Google account not connected',
        code: 'GOOGLE_NOT_CONNECTED',
        requiresGoogleAuth: true,
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    oauth2Client.setCredentials({
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    await calendar.events.delete({
      calendarId,
      eventId,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting Google Calendar event:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;

