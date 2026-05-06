import axios from 'axios';
import { urls } from './api';

const BACKEND_URL = urls.getBackendUrl();

/**
 * Email Service - Gmail API wrapper
 */
export const emailApi = {
  /**
   * List emails from inbox
   * @param {Object} options - Query options
   * @param {string} options.q - Gmail search query
   * @param {number} options.maxResults - Max results (default: 50)
   * @param {string} options.pageToken - Pagination token
   * @param {string} options.labelIds - Comma-separated label IDs
   * @returns {Promise<Object>} { messages, nextPageToken, resultSizeEstimate }
   */
  listEmails: async (options = {}) => {
    try {
      const { q, maxResults = 50, pageToken, labelIds = 'INBOX' } = options;
      
      const params = new URLSearchParams();
      if (q) params.append('q', q);
      params.append('maxResults', maxResults);
      if (pageToken) params.append('pageToken', pageToken);
      params.append('labelIds', labelIds);

      const response = await axios.get(
        `${BACKEND_URL}/api/google/gmail/messages?${params.toString()}`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error listing emails:', error);
      // Better error handling
      if (error.response?.status === 401) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Tidak dapat mengambil email.');
    }
  },

  /**
   * Get single email detail
   * @param {string} messageId - Gmail message ID
   * @returns {Promise<Object>} Full email data
   */
  getEmail: async (messageId) => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/google/gmail/messages/${messageId}`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting email:', error);
      throw error;
    }
  },

  /**
   * Send new email
   * @param {Object} emailData - Email data
   * @param {string} emailData.to - Recipient email
   * @param {string} emailData.subject - Email subject
   * @param {string} emailData.body - Email body (HTML or plain text)
   * @param {string} emailData.cc - CC recipients (optional)
   * @param {string} emailData.bcc - BCC recipients (optional)
   * @returns {Promise<Object>} Sent message data
   */
  sendEmail: async (emailData) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/google/gmail/messages/send`,
        emailData,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  /**
   * Mark email as read or unread
   * @param {string} messageId - Gmail message ID
   * @param {boolean} read - True to mark as read, false for unread
   * @returns {Promise<Object>} Modified message data
   */
  markAsRead: async (messageId, read = true) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/google/gmail/messages/${messageId}/modify`,
        {
          addLabelIds: read ? [] : ['UNREAD'],
          removeLabelIds: read ? ['UNREAD'] : []
        },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error marking email as read:', error);
      throw error;
    }
  },

  /**
   * Star or unstar email
   * @param {string} messageId - Gmail message ID
   * @param {boolean} starred - True to star, false to unstar
   * @returns {Promise<Object>} Modified message data
   */
  toggleStar: async (messageId, starred = true) => {
    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/google/gmail/messages/${messageId}/modify`,
        {
          addLabelIds: starred ? ['STARRED'] : [],
          removeLabelIds: starred ? [] : ['STARRED']
        },
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error toggling star:', error);
      throw error;
    }
  },

  /**
   * Search emails
   * @param {string} searchQuery - Gmail search query
   * @returns {Promise<Object>} Search results
   */
  searchEmails: async (searchQuery) => {
    try {
      return await emailApi.listEmails({ q: searchQuery });
    } catch (error) {
      console.error('Error searching emails:', error);
      throw error;
    }
  },

  /**
   * Get Gmail labels
   * @returns {Promise<Object>} Labels data
   */
  getLabels: async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/google/gmail/labels`,
        { withCredentials: true }
      );

      return response.data;
    } catch (error) {
      console.error('Error getting labels:', error);
      throw error;
    }
  }
};
