import express from 'express';
import { PrismaClient } from '@prisma/client';
import { google } from 'googleapis';

const router = express.Router();
const prisma = new PrismaClient();

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
    throw new Error('No Google tokens found for user');
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
          expiresAt: new Date(Date.now() + (newTokens.expiry_date || 3600) * 1000)
        }
      });
    } else if (newTokens.access_token) {
      await prisma.googleToken.update({
        where: { userId },
        data: {
          accessToken: newTokens.access_token,
          expiresAt: new Date(Date.now() + (newTokens.expiry_date || 3600) * 1000)
        }
      });
    }
  });

  return oauth2Client;
}

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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

export default router;
