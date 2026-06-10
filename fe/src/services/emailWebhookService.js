import axios from 'axios';
import { urls } from './api';
import { getAuthenticatedUser } from './authService';

const getWebhookUrl = () => {
  return urls.getEmail();
};

const getCurrentUser = async () => {
  try {
    return await getAuthenticatedUser();
  } catch (error) {
    return null;
  }
};

export const formatEmailPayload = (email, user = null) => {
  return {
    user_id: user?.id || user?.email || 'unknown',
    user_name: user?.name || 'Unknown User',
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

export const sendEmailToWebhook = async (email) => {
  try {
    const user = await getCurrentUser();
    
    const payload = formatEmailPayload(email, user);
    const webhookUrl = getWebhookUrl();
    

    const response = await axios.post(webhookUrl, payload, {
      headers: {
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    return {
      success: true,
      data: response.data
    };
  } catch (error) {

    
    return {
      success: false,
      error: error.response?.data || error.message || 'Failed to send email to webhook'
    };
  }
};

export const generateDraftFromWebhook = async (email, fetchDraftsCallback) => {
  const result = await sendEmailToWebhook(email);

  if (!result.success) {
    throw new Error(result.error);
  }

  if (fetchDraftsCallback) {
    await fetchDraftsCallback();
  }

  return {
    success: true,
    webhookResponse: result.data
  };
};

export default {
  formatEmailPayload,
  sendEmailToWebhook,
  generateDraftFromWebhook,
  getCurrentUser
};
