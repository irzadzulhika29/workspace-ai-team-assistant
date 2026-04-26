import { google } from 'googleapis';
import prisma from '../lib/prisma.js';

/**
 * Get Gmail API client for user
 * @param {Object} user - User object with id
 * @returns {Promise<Object>} Gmail API client
 */
const getGmailClient = async (user) => {
  // Get user's Google tokens
  const tokens = await prisma.googleToken.findUnique({
    where: { userId: user.id }
  });

  if (!tokens) {
    throw new Error('Google tokens not found for user');
  }

  // Create OAuth2 client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_CALLBACK_URL
  );

  // Set credentials
  oauth2Client.setCredentials({
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expiry_date: tokens.expiresAt ? new Date(tokens.expiresAt).getTime() : null
  });

  // Handle token refresh
  oauth2Client.on('tokens', async (newTokens) => {
    console.log('Refreshing Google tokens for user:', user.id);
    
    const updateData = {
      accessToken: newTokens.access_token
    };

    if (newTokens.refresh_token) {
      updateData.refreshToken = newTokens.refresh_token;
    }

    if (newTokens.expiry_date) {
      updateData.expiresAt = new Date(newTokens.expiry_date);
    }

    await prisma.googleToken.update({
      where: { userId: user.id },
      data: updateData
    });
  });

  return google.gmail({ version: 'v1', auth: oauth2Client });
};

/**
 * Create email message in RFC 2822 format
 * @param {Object} emailData - Email data
 * @returns {string} Base64 encoded email
 */
const createEmailMessage = (emailData) => {
  const { to, cc, bcc, subject, body } = emailData;

  const lines = [];
  lines.push(`To: ${to}`);
  
  if (cc) {
    lines.push(`Cc: ${cc}`);
  }
  
  if (bcc) {
    lines.push(`Bcc: ${bcc}`);
  }
  
  lines.push(`Subject: ${subject}`);
  lines.push('Content-Type: text/html; charset=utf-8');
  lines.push('');
  lines.push(body);

  const email = lines.join('\r\n');
  
  // Encode to base64url
  return Buffer.from(email)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

/**
 * Send email via Gmail API
 * @param {Object} emailData - Email data
 * @param {Object} user - User object
 * @returns {Promise<Object>} Sent message info
 */
export const sendEmail = async (emailData, user) => {
  try {
    const gmail = await getGmailClient(user);
    
    const raw = createEmailMessage(emailData);

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw
      }
    });

    return response.data;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

export const emailApi = {
  sendEmail
};

export default emailApi;
