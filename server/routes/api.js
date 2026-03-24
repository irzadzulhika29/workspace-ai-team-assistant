import express from 'express';
import { requireAuth } from '../middleware/auth.js';
import { google } from 'googleapis';
import { PrismaClient } from '@prisma/client';

const router = express.Router();
const prisma = new PrismaClient();

// Protected route example
router.get('/protected', requireAuth, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user
  });
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
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime'
    });

    res.json({ files: response.data.items });
  } catch (error) {
    console.error('Error fetching Google Calendar:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
