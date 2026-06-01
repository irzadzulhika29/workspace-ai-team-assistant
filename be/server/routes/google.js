import express from 'express';
import { google } from 'googleapis';
import prisma from '../lib/prisma.js';

const router = express.Router();

/**
 * Middleware to verify n8n API key or user session
 */
const authenticateRequest = async (req, res, next) => {
  // Check for n8n API key in header
  const n8nApiKey = req.headers['x-n8n-api-key'];
  if (n8nApiKey === process.env.N8N_API_KEY) {
    // Request from n8n - get user from query/body
    const userId = req.query.userId || req.body.userId;
    if (!userId) {
      return res.status(400).json({ error: 'userId required' });
    }
    req.userId = userId;
    return next();
  }

  // Check for user session
  if (req.user) {
    req.userId = req.user.id;
    return next();
  }

  return res.status(401).json({ error: 'Unauthorized' });
};

/**
 * Get Google OAuth2 client for a user
 */
async function getGoogleClient(userId) {
  const tokens = await prisma.googleToken.findUnique({
    where: { userId }
  });

  if (!tokens) {
    const error = new Error('Google account not connected');
    error.code = 'GOOGLE_NOT_CONNECTED';
    throw error;
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : undefined
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (newTokens) => {
    if (newTokens.refresh_token) {
      await prisma.googleToken.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          refreshToken: newTokens.refresh_token,
          expiresAt: newTokens.expiry_date ? new Date(newTokens.expiry_date) : new Date(Date.now() + 3600 * 1000)
        }
      });
    } else if (newTokens.access_token) {
      await prisma.googleToken.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          expiresAt: newTokens.expiry_date ? new Date(newTokens.expiry_date) : new Date(Date.now() + 3600 * 1000)
        }
      });
    }
  });

  return oauth2Client;
}

const respondGoogleError = (res, error, fallbackMessage) => {
  if (error?.code === 'GOOGLE_NOT_CONNECTED') {
    return res.status(403).json({
      error: fallbackMessage || 'Google account not connected',
      code: 'GOOGLE_NOT_CONNECTED',
      requiresGoogleAuth: true,
    });
  }

  return res.status(500).json({ error: error.message });
};

/**
 * Proxy endpoint for Google Sheets API
 * n8n can call this endpoint instead of Google Sheets directly
 */
router.post('/sheets/spreadsheets/:spreadsheetId/values/:range', authenticateRequest, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;
    const { values, valueInputOption = 'USER_ENTERED' } = req.body;

    const auth = await getGoogleClient(req.userId);
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error appending to sheet:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get spreadsheet data
 */
router.get('/sheets/spreadsheets/:spreadsheetId/values/:range', authenticateRequest, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;

    const auth = await getGoogleClient(req.userId);
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error reading sheet:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Update spreadsheet data
 */
router.put('/sheets/spreadsheets/:spreadsheetId/values/:range', authenticateRequest, async (req, res) => {
  try {
    const { spreadsheetId, range } = req.params;
    const { values, valueInputOption = 'USER_ENTERED' } = req.body;

    const auth = await getGoogleClient(req.userId);
    const sheets = google.sheets({ version: 'v4', auth });

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId,
      range,
      valueInputOption,
      requestBody: { values }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error updating sheet:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get user's Google Drive files
 */
router.get('/drive/files', authenticateRequest, async (req, res) => {
  try {
    const { q, pageSize = 10 } = req.query;

    const auth = await getGoogleClient(req.userId);
    const drive = google.drive({ version: 'v3', auth });

    const response = await drive.files.list({
      q,
      pageSize: parseInt(pageSize),
      fields: 'files(id, name, mimeType, createdTime, modifiedTime)'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error listing files:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get user's Google Calendar events
 */
router.get('/calendar/events', authenticateRequest, async (req, res) => {
  try {
    const { calendarId = 'primary', timeMin, timeMax, maxResults = 10 } = req.query;

    const auth = await getGoogleClient(req.userId);
    const calendar = google.calendar({ version: 'v3', auth });

    const response = await calendar.events.list({
      calendarId,
      timeMin,
      timeMax,
      maxResults: parseInt(maxResults),
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error listing events:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get Gmail messages (inbox list)
 * GET /api/google/gmail/messages
 * Query params:
 *   - q: Gmail search query (e.g., "is:unread", "from:example@gmail.com")
 *   - maxResults: Number of messages (default: 50)
 *   - pageToken: For pagination
 *   - labelIds: Comma-separated label IDs (e.g., "INBOX,UNREAD")
 */
router.get('/gmail/messages', authenticateRequest, async (req, res) => {
  try {
    const { q, maxResults = 50, pageToken, labelIds } = req.query;

    const auth = await getGoogleClient(req.userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const params = {
      userId: 'me',
      maxResults: parseInt(maxResults),
      pageToken
    };

    // Add labelIds if provided
    if (labelIds) {
      params.labelIds = labelIds.split(',');
    } else {
      params.labelIds = ['INBOX']; // Default to INBOX
    }

    // Add search query if provided
    if (q) {
      params.q = q;
    }

    const response = await gmail.users.messages.list(params);

    // Get message details for each message (snippet, headers)
    const messages = response.data.messages || [];
    const detailedMessages = await Promise.all(
      messages.map(async (msg) => {
        const detail = await gmail.users.messages.get({
          userId: 'me',
          id: msg.id,
          format: 'metadata',
          metadataHeaders: ['From', 'To', 'Subject', 'Date']
        });

        const headers = detail.data.payload.headers;
        const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

        return {
          id: detail.data.id,
          threadId: detail.data.threadId,
          labelIds: detail.data.labelIds,
          snippet: detail.data.snippet,
          internalDate: detail.data.internalDate,
          from: getHeader('From'),
          to: getHeader('To'),
          subject: getHeader('Subject'),
          date: getHeader('Date')
        };
      })
    );

    res.json({
      messages: detailedMessages,
      nextPageToken: response.data.nextPageToken,
      resultSizeEstimate: response.data.resultSizeEstimate
    });
  } catch (error) {
    console.error('Error listing Gmail messages:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get single Gmail message detail
 * GET /api/google/gmail/messages/:id
 */
router.get('/gmail/messages/:id', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;

    const auth = await getGoogleClient(req.userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.get({
      userId: 'me',
      id,
      format: 'full'
    });

    const message = response.data;
    const headers = message.payload.headers;
    const getHeader = (name) => headers.find(h => h.name === name)?.value || '';

    // Extract email body
    let body = '';
    let htmlBody = '';

    const getBody = (payload) => {
      if (payload.body.data) {
        const decodedBody = Buffer.from(payload.body.data, 'base64').toString('utf-8');
        if (payload.mimeType === 'text/html') {
          htmlBody = decodedBody;
        } else {
          body = decodedBody;
        }
      }

      if (payload.parts) {
        payload.parts.forEach(part => {
          if (part.mimeType === 'text/plain' && part.body.data) {
            body = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.mimeType === 'text/html' && part.body.data) {
            htmlBody = Buffer.from(part.body.data, 'base64').toString('utf-8');
          } else if (part.parts) {
            getBody(part);
          }
        });
      }
    };

    getBody(message.payload);

    // Extract attachments info
    const attachments = [];
    const extractAttachments = (parts) => {
      if (!parts) return;
      parts.forEach(part => {
        if (part.filename && part.body.attachmentId) {
          attachments.push({
            filename: part.filename,
            mimeType: part.mimeType,
            size: part.body.size,
            attachmentId: part.body.attachmentId
          });
        }
        if (part.parts) {
          extractAttachments(part.parts);
        }
      });
    };

    extractAttachments(message.payload.parts);

    res.json({
      id: message.id,
      threadId: message.threadId,
      labelIds: message.labelIds,
      snippet: message.snippet,
      internalDate: message.internalDate,
      from: getHeader('From'),
      to: getHeader('To'),
      cc: getHeader('Cc'),
      bcc: getHeader('Bcc'),
      subject: getHeader('Subject'),
      date: getHeader('Date'),
      body: body || htmlBody,
      htmlBody,
      attachments
    });
  } catch (error) {
    console.error('Error getting Gmail message:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Modify Gmail message (mark as read, star, etc)
 * POST /api/google/gmail/messages/:id/modify
 * Body: { addLabelIds: [], removeLabelIds: [] }
 */
router.post('/gmail/messages/:id/modify', authenticateRequest, async (req, res) => {
  try {
    const { id } = req.params;
    const { addLabelIds = [], removeLabelIds = [] } = req.body;

    const auth = await getGoogleClient(req.userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.messages.modify({
      userId: 'me',
      id,
      requestBody: {
        addLabelIds,
        removeLabelIds
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error modifying Gmail message:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Send Gmail message
 * POST /api/google/gmail/messages/send
 * Body: { to, subject, body, cc?, bcc? }
 */
router.post('/gmail/messages/send', authenticateRequest, async (req, res) => {
  try {
    const { to, subject, body, cc, bcc } = req.body;

    const auth = await getGoogleClient(req.userId);
    const gmail = google.gmail({ version: 'v1', auth });

    // Build email in RFC 2822 format
    const emailLines = [
      `To: ${to}`,
      cc ? `Cc: ${cc}` : '',
      bcc ? `Bcc: ${bcc}` : '',
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      '',
      body
    ].filter(line => line !== '');

    const email = emailLines.join('\r\n');
    const encodedEmail = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedEmail
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error sending Gmail message:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

/**
 * Get Gmail labels
 * GET /api/google/gmail/labels
 */
router.get('/gmail/labels', authenticateRequest, async (req, res) => {
  try {
    const auth = await getGoogleClient(req.userId);
    const gmail = google.gmail({ version: 'v1', auth });

    const response = await gmail.users.labels.list({
      userId: 'me'
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error listing Gmail labels:', error);
    respondGoogleError(res, error, 'Google account not connected');
  }
});

export default router;
