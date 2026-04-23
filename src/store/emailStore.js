import { create } from 'zustand';
import { emailApi } from '../services/emailService';

/**
 * Email Store - Zustand state management for email feature
 */
export const useEmailStore = create((set, get) => ({
  // Email list state
  emails: [],
  nextPageToken: null,
  resultSizeEstimate: 0,
  
  // Selected email for detail view
  selectedEmail: null,
  
  // Filters
  filters: {
    labelIds: 'INBOX',
    query: '',
    unreadOnly: false,
    starredOnly: false
  },
  
  // UI state
  loading: false,
  loadingDetail: false,
  error: null,
  composeModalOpen: false,
  
  /**
   * Fetch emails from Gmail
   * @param {Object} options - Query options
   * @param {boolean} append - If true, append to existing emails (pagination)
   */
  fetchEmails: async (options = {}, append = false) => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      
      // Build query based on filters
      let query = options.query || filters.query || '';
      
      if (filters.unreadOnly && !query.includes('is:unread')) {
        query = query ? `${query} is:unread` : 'is:unread';
      }
      
      if (filters.starredOnly && !query.includes('is:starred')) {
        query = query ? `${query} is:starred` : 'is:starred';
      }
      
      const result = await emailApi.listEmails({
        q: query,
        labelIds: options.labelIds || filters.labelIds,
        maxResults: options.maxResults || 50,
        pageToken: options.pageToken
      });
      
      set({
        emails: append ? [...get().emails, ...result.messages] : result.messages,
        nextPageToken: result.nextPageToken,
        resultSizeEstimate: result.resultSizeEstimate,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching emails:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch emails',
        loading: false 
      });
    }
  },
  
  /**
   * Load more emails (pagination)
   */
  loadMoreEmails: async () => {
    const { nextPageToken } = get();
    
    if (!nextPageToken) {
      return;
    }
    
    await get().fetchEmails({ pageToken: nextPageToken }, true);
  },
  
  /**
   * Select and load email detail
   * @param {string} messageId - Gmail message ID
   */
  selectEmail: async (messageId) => {
    set({ loadingDetail: true, error: null });
    
    try {
      const emailDetail = await emailApi.getEmail(messageId);
      
      set({
        selectedEmail: emailDetail,
        loadingDetail: false
      });
      
      // Mark as read if it's unread
      if (emailDetail.labelIds?.includes('UNREAD')) {
        await emailApi.markAsRead(messageId, true);
        
        // Update email in list
        const { emails } = get();
        const updatedEmails = emails.map(email => 
          email.id === messageId 
            ? { ...email, labelIds: email.labelIds.filter(l => l !== 'UNREAD') }
            : email
        );
        set({ emails: updatedEmails });
      }
    } catch (error) {
      console.error('Error selecting email:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to load email',
        loadingDetail: false 
      });
    }
  },
  
  /**
   * Clear selected email (close detail view)
   */
  clearSelectedEmail: () => {
    set({ selectedEmail: null });
  },
  
  /**
   * Send new email
   * @param {Object} emailData - Email data (to, subject, body, cc, bcc)
   */
  sendEmail: async (emailData) => {
    set({ loading: true, error: null });
    
    try {
      await emailApi.sendEmail(emailData);
      
      set({ 
        loading: false,
        composeModalOpen: false
      });
      
      // Refresh email list
      await get().fetchEmails();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending email:', error);
      set({ 
        error: error.response?.data?.error || error.message || 'Failed to send email',
        loading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  /**
   * Mark email as read/unread
   * @param {string} messageId - Gmail message ID
   * @param {boolean} read - True to mark as read
   */
  markAsRead: async (messageId, read = true) => {
    try {
      await emailApi.markAsRead(messageId, read);
      
      // Update email in list
      const { emails, selectedEmail } = get();
      const updatedEmails = emails.map(email => {
        if (email.id === messageId) {
          const labelIds = read 
            ? email.labelIds.filter(l => l !== 'UNREAD')
            : [...(email.labelIds || []), 'UNREAD'];
          return { ...email, labelIds };
        }
        return email;
      });
      
      set({ emails: updatedEmails });
      
      // Update selected email if it's the same
      if (selectedEmail?.id === messageId) {
        const labelIds = read 
          ? selectedEmail.labelIds.filter(l => l !== 'UNREAD')
          : [...(selectedEmail.labelIds || []), 'UNREAD'];
        set({ selectedEmail: { ...selectedEmail, labelIds } });
      }
    } catch (error) {
      console.error('Error marking email as read:', error);
      set({ error: error.response?.data?.error || error.message });
    }
  },
  
  /**
   * Toggle star on email
   * @param {string} messageId - Gmail message ID
   */
  toggleStar: async (messageId) => {
    try {
      const { emails } = get();
      const email = emails.find(e => e.id === messageId);
      const isStarred = email?.labelIds?.includes('STARRED');
      
      await emailApi.toggleStar(messageId, !isStarred);
      
      // Update email in list
      const updatedEmails = emails.map(e => {
        if (e.id === messageId) {
          const labelIds = isStarred
            ? e.labelIds.filter(l => l !== 'STARRED')
            : [...(e.labelIds || []), 'STARRED'];
          return { ...e, labelIds };
        }
        return e;
      });
      
      set({ emails: updatedEmails });
      
      // Update selected email if it's the same
      const { selectedEmail } = get();
      if (selectedEmail?.id === messageId) {
        const labelIds = isStarred
          ? selectedEmail.labelIds.filter(l => l !== 'STARRED')
          : [...(selectedEmail.labelIds || []), 'STARRED'];
        set({ selectedEmail: { ...selectedEmail, labelIds } });
      }
    } catch (error) {
      console.error('Error toggling star:', error);
      set({ error: error.response?.data?.error || error.message });
    }
  },
  
  /**
   * Set filter
   * @param {string} filterKey - Filter key (labelIds, query, unreadOnly, starredOnly)
   * @param {any} value - Filter value
   */
  setFilter: (filterKey, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterKey]: value
      }
    }));
    
    // Refresh emails with new filter
    get().fetchEmails();
  },
  
  /**
   * Search emails
   * @param {string} searchQuery - Search query
   */
  searchEmails: async (searchQuery) => {
    set(state => ({
      filters: {
        ...state.filters,
        query: searchQuery
      }
    }));
    
    await get().fetchEmails({ query: searchQuery });
  },
  
  /**
   * Open compose modal
   */
  openComposeModal: () => {
    set({ composeModalOpen: true });
  },
  
  /**
   * Close compose modal
   */
  closeComposeModal: () => {
    set({ composeModalOpen: false });
  },
  
  /**
   * Refresh emails (reload current view)
   */
  refreshEmails: async () => {
    await get().fetchEmails();
  }
}));
