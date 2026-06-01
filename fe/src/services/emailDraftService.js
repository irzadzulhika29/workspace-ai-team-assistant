import axios from 'axios';
import { urls } from './api';
import { getAuthenticatedUser } from './authService';

/**
 * Email Draft Service
 * Handles CRUD operations for email drafts in Supabase
 */

const backendUrl = urls.getBackendUrl();

/**
 * Get current user ID from session
 * @returns {Promise<string|null>} User ID or null
 */
const getCurrentUserId = async () => {
  try {
    const user = await getAuthenticatedUser();
    return user?.id || null;
  } catch (error) {
    console.error('Error getting current user ID:', error);
    return null;
  }
};

/**
 * List email drafts for current user
 * @param {Object} options - Query options
 * @param {string} options.status - Filter by status (draft, sent, failed, archived)
 * @param {number} options.limit - Limit number of results
 * @returns {Promise<Array>} Array of drafts
 */
export const listDrafts = async (options = {}) => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const params = new URLSearchParams({
      user_id: userId,
      status: options.status || 'draft',
      limit: options.limit || 50
    });

    const response = await axios.get(
      `${backendUrl}/api/email/drafts?${params.toString()}`,
      { withCredentials: true }
    );

    return response.data.drafts || [];
  } catch (error) {
    console.error('Error listing drafts:', error);
    throw error;
  }
};

/**
 * Get single draft by ID
 * @param {string} draftId - Draft UUID
 * @returns {Promise<Object>} Draft object
 */
export const getDraft = async (draftId) => {
  try {
    const response = await axios.get(
      `${backendUrl}/api/email/drafts/${draftId}`,
      { withCredentials: true }
    );

    return response.data.draft;
  } catch (error) {
    console.error('Error getting draft:', error);
    throw error;
  }
};

/**
 * Create new email draft
 * @param {Object} draftData - Draft data
 * @param {string} draftData.to_email - Recipient email
 * @param {string} draftData.subject - Email subject
 * @param {string} draftData.body_text - Plain text body
 * @param {string} draftData.body_html - HTML body
 * @param {string} draftData.source_message_id - Original email message ID
 * @param {string} draftData.source_thread_id - Original email thread ID
 * @param {Object} draftData.source_email_payload - Original email full payload
 * @param {string} draftData.cc - CC recipients
 * @param {string} draftData.bcc - BCC recipients
 * @param {string} draftData.draft_type - Type: reply, follow_up, reminder, new_email
 * @param {string} draftData.session_id - Chat session ID (optional)
 * @returns {Promise<Object>} Created draft
 */
export const createDraft = async (draftData) => {
  try {
    const userId = await getCurrentUserId();
    
    if (!userId) {
      throw new Error('User not authenticated');
    }

    const payload = {
      user_id: userId,
      to_email: draftData.to_email || draftData.to,
      subject: draftData.subject || '',
      body_text: draftData.body_text || draftData.content || '',
      body_html: draftData.body_html || '',
      source_message_id: draftData.source_message_id || null,
      source_thread_id: draftData.source_thread_id || null,
      source_email_payload: draftData.source_email_payload || draftData.originalEmail || null,
      cc: draftData.cc || null,
      bcc: draftData.bcc || null,
      draft_type: draftData.draft_type || 'reply',
      session_id: draftData.session_id || null,
      status: 'draft'
    };

    const response = await axios.post(
      `${backendUrl}/api/email/drafts`,
      payload,
      { withCredentials: true }
    );

    return response.data.draft;
  } catch (error) {
    console.error('Error creating draft:', error);
    throw error;
  }
};

/**
 * Update existing draft
 * @param {string} draftId - Draft UUID
 * @param {Object} updates - Fields to update
 * @returns {Promise<Object>} Updated draft
 */
export const updateDraft = async (draftId, updates) => {
  try {
    const response = await axios.patch(
      `${backendUrl}/api/email/drafts/${draftId}`,
      updates,
      { withCredentials: true }
    );

    return response.data.draft;
  } catch (error) {
    console.error('Error updating draft:', error);
    throw error;
  }
};

/**
 * Delete draft
 * @param {string} draftId - Draft UUID
 * @returns {Promise<void>}
 */
export const deleteDraft = async (draftId) => {
  try {
    await axios.delete(
      `${backendUrl}/api/email/drafts/${draftId}`,
      { withCredentials: true }
    );
  } catch (error) {
    console.error('Error deleting draft:', error);
    throw error;
  }
};

/**
 * Send draft (mark as sent and send via Gmail API)
 * @param {string} draftId - Draft UUID
 * @returns {Promise<Object>} Sent draft with sent_message_id
 */
export const sendDraft = async (draftId) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/email/drafts/${draftId}/send`,
      {},
      { withCredentials: true }
    );

    return response.data.draft;
  } catch (error) {
    console.error('Error sending draft:', error);
    throw error;
  }
};

/**
 * Revise draft with AI
 * @param {string} draftId - Draft UUID
 * @param {string} revisionNote - Instructions for revision
 * @returns {Promise<Object>} Revised draft
 */
export const reviseDraft = async (draftId, revisionNote) => {
  try {
    const response = await axios.post(
      `${backendUrl}/api/email/drafts/${draftId}/revise`,
      { revision_note: revisionNote },
      { withCredentials: true }
    );

    return response.data.draft;
  } catch (error) {
    console.error('Error revising draft:', error);
    throw error;
  }
};

export default {
  listDrafts,
  getDraft,
  createDraft,
  updateDraft,
  deleteDraft,
  sendDraft,
  reviseDraft,
  getCurrentUserId
};
