import axios from 'axios';
import { urls } from './api';

const BACKEND_URL = urls.getBackendUrl();

export const emailApi = {
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
      if (error.response?.status === 401) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.');
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw new Error(error.message || 'Tidak dapat mengambil email.');
    }
  },

  getEmail: async (messageId) => {
    const response = await axios.get(
      `${BACKEND_URL}/api/google/gmail/messages/${messageId}`,
      { withCredentials: true }
    );

    return response.data;
  },

  sendEmail: async (emailData) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/google/gmail/messages/send`,
      emailData,
      { withCredentials: true }
    );

    return response.data;
  },

  markAsRead: async (messageId, read = true) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/google/gmail/messages/${messageId}/modify`,
      {
        addLabelIds: read ? [] : ['UNREAD'],
        removeLabelIds: read ? ['UNREAD'] : []
      },
      { withCredentials: true }
    );

    return response.data;
  },

  toggleStar: async (messageId, starred = true) => {
    const response = await axios.post(
      `${BACKEND_URL}/api/google/gmail/messages/${messageId}/modify`,
      {
        addLabelIds: starred ? ['STARRED'] : [],
        removeLabelIds: starred ? [] : ['STARRED']
      },
      { withCredentials: true }
    );

    return response.data;
  },

  searchEmails: async (searchQuery) => {
    return await emailApi.listEmails({ q: searchQuery });
  },

  getLabels: async () => {
    const response = await axios.get(
      `${BACKEND_URL}/api/google/gmail/labels`,
      { withCredentials: true }
    );

    return response.data;
  }
};
