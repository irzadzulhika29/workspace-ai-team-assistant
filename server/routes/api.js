import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const router = express.Router();
const prisma = new PrismaClient();

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
      return res.status(404).json({ error: 'No Google token found. Connect your Google account first.' });
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
router.get('/dokumen', async (req, res) => {
  try {
    const url = `${process.env.SUPABASE_URL}/rest/v1/dokumen?select=*&order=created_at.desc`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
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

// Create new chat session
router.post('/sessions', async (req, res) => {
  try {
    const { judul = "Obrolan Baru", chat_type = "general_chat" } = req.body;
    const newSessionId = crypto.randomUUID();
    const payload = {
      id: newSessionId,
      judul,
      chat_type,
    };

    const url = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
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
router.get('/sessions', async (req, res) => {
  try {
    const { chat_type } = req.query;
    const filter = chat_type ? `&chat_type=eq.${chat_type}` : "";
    const url = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions?select=id,judul,chat_type,created_at&order=created_at.desc${filter}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
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
router.get('/sessions/:sessionId/history', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Fetch chat history
    const historyUrl = `${process.env.SUPABASE_URL}/rest/v1/n8n_chat_histories?session_id=eq.${sessionId}&order=id.asc`;
    const historyResponse = await fetch(historyUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!historyResponse.ok) {
      throw new Error(`Supabase error: ${historyResponse.status} ${historyResponse.statusText}`);
    }

    const rows = await historyResponse.json();

    // Fetch dokumen output for this session
    const dokumenUrl = `${process.env.SUPABASE_URL}/rest/v1/dokumen?session_id=eq.${sessionId}&kategori=eq.output&order=created_at.asc&select=file_url,nama_file,created_at`;
    const dokumenResponse = await fetch(dokumenUrl, {
      method: 'GET',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
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
router.delete('/sessions/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Delete messages first
    const messagesUrl = `${process.env.SUPABASE_URL}/rest/v1/n8n_chat_histories?session_id=eq.${sessionId}`;
    const messagesResponse = await fetch(messagesUrl, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!messagesResponse.ok) {
      throw new Error(`Failed to delete messages: ${messagesResponse.status}`);
    }

    // Delete session
    const sessionUrl = `${process.env.SUPABASE_URL}/rest/v1/chat_sessions?id=eq.${sessionId}`;
    const sessionResponse = await fetch(sessionUrl, {
      method: 'DELETE',
      headers: {
        'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json'
      }
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
      return res.status(401).json({ error: 'No Google token found' });
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
      return res.status(401).json({ error: 'No Google token found' });
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
      return res.status(401).json({ error: 'No Google token found' });
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

export default router;
