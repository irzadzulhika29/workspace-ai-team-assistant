import axios from 'axios';
import { urls } from './api';
import { getAuthenticatedUser } from './authService';

const backendUrl = urls.getBackendUrl();

const getCurrentUserId = async () => {
  try {
    const user = await getAuthenticatedUser();
    return user?.id || null;
  } catch (error) {

    return null;
  }
};

export const listDrafts = async (options = {}) => {
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
};

export const getDraft = async (draftId) => {
  const response = await axios.get(
    `${backendUrl}/api/email/drafts/${draftId}`,
    { withCredentials: true }
  );

  return response.data.draft;
};

export const createDraft = async (draftData) => {
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
};

export const updateDraft = async (draftId, updates) => {
  const response = await axios.patch(
    `${backendUrl}/api/email/drafts/${draftId}`,
    updates,
    { withCredentials: true }
  );

  return response.data.draft;
};

export const deleteDraft = async (draftId) => {
  await axios.delete(
    `${backendUrl}/api/email/drafts/${draftId}`,
    { withCredentials: true }
  );
};

export const sendDraft = async (draftId) => {
  const response = await axios.post(
    `${backendUrl}/api/email/drafts/${draftId}/send`,
    {},
    { withCredentials: true }
  );

  return response.data.draft;
};

export const reviseDraft = async (draftId, revisionNote) => {
  const response = await axios.post(
    `${backendUrl}/api/email/drafts/${draftId}/revise`,
    { revision_note: revisionNote },
    { withCredentials: true }
  );

  return response.data.draft;
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
