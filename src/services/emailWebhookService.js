import axios from 'axios';
import { urls } from './api';

/**
 * Email Webhook Service
 * Handles sending email data to n8n webhook for AI draft generation
 */

// Use urls helper to get webhook URL based on settings
const getWebhookUrl = () => {
  const baseUrl = urls.getN8nBaseUrl();
  return `${baseUrl}/webhook-test/email`;
};

/**
 * Get current user info from backend
 * @returns {Promise<Object|null>} User info or null
 */
const getCurrentUser = async () => {
  try {
    const backendUrl = urls.getBackendUrl();
    const response = await axios.get(`${backendUrl}/api/auth/google/status`, {
      withCredentials: true
    });

    if (response.data.connected) {
      return {
        id: response.data.userId || response.data.email, // Use userId if available, fallback to email
        name: response.data.name,
        email: response.data.email,
        picture: response.data.picture
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Format email data for webhook payload
 * @param {Object} email - Email object from Gmail API
 * @param {Object} user - Current user info
 * @returns {Object} Formatted payload
 */
export const formatEmailPayload = (email, user = null) => {
  return {
    user_id: user?.id || user?.email || 'unknown',
    id: email.id,
    threadId: email.threadId,
    labelIds: email.labelIds || [],
    snippet: email.snippet || '',
    internalDate: email.internalDate || '',
    from: email.from || '',
    to: email.to || '',
    cc: email.cc || '',
    bcc: email.bcc || '',
    subject: email.subject || '(No subject)',
    date: email.date || email.internalDate || '',
    body: email.body || '',
    htmlBody: email.htmlBody || '',
    attachments: email.attachments || []
  };
};

/**
 * Send email to webhook for draft generation
 * @param {Object} email - Email object
 * @returns {Promise<Object>} Response from webhook
 */
export const sendEmailToWebhook = async (email) => {
  try {
    // Get current user
    const user = await getCurrentUser();
    
    const payload = formatEmailPayload(email, user);
    const webhookUrl = getWebhookUrl();
    
    console.log('Sending email to webhook:', webhookUrl);
    console.log('Payload:', payload);

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000 // 30 seconds timeout
    });

    console.log('Webhook response:', response.data);
    return {
      success: true,
      data: response.data
    };
  } catch (error) {
    console.error('Error sending email to webhook:', error);
    
    // Return error details
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to send email to webhook'
    };
  }
};

/**
 * Send email to webhook and create draft from response
 * @param {Object} email - Email object
 * @param {Function} createDraftCallback - Callback to create draft in store
 * @returns {Promise<Object>} Result
 */
export const generateDraftFromWebhook = async (email, createDraftCallback) => {
  try {
    // Send email to webhook
    const result = await sendEmailToWebhook(email);

    if (!result.success) {
      throw new Error(result.error);
    }

    // Extract draft from webhook response
    // Response format: { drafts: [{ body_text, body_html, ... }] }
    const draftFromWebhook = result.data?.drafts?.[0];
    
    if (!draftFromWebhook) {
      throw new Error('No draft returned from webhook');
    }

    const draftContent = draftFromWebhook.body_text;
    const draftHtml = draftFromWebhook.body_html;

    if (!draftContent && !draftHtml) {
      throw new Error('No draft content returned from webhook');
    }

    // Extract sender email
    const senderMatch = email.from?.match(/<(.+?)>/);
    const senderEmail = senderMatch ? senderMatch[1] : email.from;

    // Prepare draft data for Supabase
    const draftData = {
      to_email: senderEmail,
      subject: `Re: ${email.subject || '(No subject)'}`,
      body_text: draftContent || '',
      body_html: draftHtml || '',
      source_message_id: email.id,
      source_thread_id: email.threadId,
      source_email_payload: {
        from: email.from,
        to: email.to,
        subject: email.subject,
        snippet: email.snippet,
        date: email.date || email.internalDate,
        body: email.body,
        htmlBody: email.htmlBody
      },
      draft_type: 'reply'
    };

    // Create draft using callback (which will save to Supabase)
    const draft = await createDraftCallback(draftData);

    return {
      success: true,
      draft,
      webhookResponse: result.data
    };
  } catch (error) {
    console.error('Error generating draft from webhook:', error);
    throw error;
  }
};

export default {
  formatEmailPayload,
  sendEmailToWebhook,
  generateDraftFromWebhook,
  getCurrentUser
};
