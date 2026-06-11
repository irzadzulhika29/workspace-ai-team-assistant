import { create } from 'zustand';
import { emailApi } from '../services/emailService';
import * as emailDraftService from '../services/emailDraftService';

export const useEmailStore = create((set, get) => ({
  emails: [],
  nextPageToken: null,
  resultSizeEstimate: 0,
  
  selectedEmail: null,
  
  drafts: [],
  
  filters: {
    labelIds: 'INBOX',
    query: '',
    unreadOnly: false,
    starredOnly: false
  },
  
  loading: false,
  loadingDetail: false,
  error: null,
  composeModalOpen: false,
  
  fetchEmails: async (options = {}, append = false) => {
    set({ loading: true, error: null });
    
    try {
      const { filters } = get();
      
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

      set({ 
        error: error.response?.data?.error || error.message || 'Failed to fetch emails',
        loading: false 
      });
    }
  },
  
  loadMoreEmails: async () => {
    const { nextPageToken } = get();
    
    if (!nextPageToken) {
      return;
    }
    
    await get().fetchEmails({ pageToken: nextPageToken }, true);
  },
  
  selectEmail: async (messageId) => {
    set({ loadingDetail: true, error: null });
    
    try {
      const emailDetail = await emailApi.getEmail(messageId);
      
      set({
        selectedEmail: emailDetail,
        loadingDetail: false
      });
      
      if (emailDetail.labelIds?.includes('UNREAD')) {
        await emailApi.markAsRead(messageId, true);
        
        const { emails } = get();
        const updatedEmails = emails.map(email => 
          email.id === messageId 
            ? { ...email, labelIds: email.labelIds.filter(l => l !== 'UNREAD') }
            : email
        );
        set({ emails: updatedEmails });
      }
    } catch (error) {

      set({ 
        error: error.response?.data?.error || error.message || 'Failed to load email',
        loadingDetail: false 
      });
    }
  },
  
  clearSelectedEmail: () => {
    set({ selectedEmail: null });
  },
  
  sendEmail: async (emailData) => {
    set({ loading: true, error: null });
    
    try {
      await emailApi.sendEmail(emailData);
      
      set({ 
        loading: false,
        composeModalOpen: false
      });
      
      await get().fetchEmails();
      
      return { success: true };
    } catch (error) {

      set({ 
        error: error.response?.data?.error || error.message || 'Failed to send email',
        loading: false 
      });
      return { success: false, error: error.message };
    }
  },
  
  markAsRead: async (messageId, read = true) => {
    try {
      await emailApi.markAsRead(messageId, read);
      
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
      
      if (selectedEmail?.id === messageId) {
        const labelIds = read 
          ? selectedEmail.labelIds.filter(l => l !== 'UNREAD')
          : [...(selectedEmail.labelIds || []), 'UNREAD'];
        set({ selectedEmail: { ...selectedEmail, labelIds } });
      }
    } catch (error) {

      set({ error: error.response?.data?.error || error.message });
    }
  },
  
  toggleStar: async (messageId) => {
    try {
      const { emails } = get();
      const email = emails.find(e => e.id === messageId);
      const isStarred = email?.labelIds?.includes('STARRED');
      
      await emailApi.toggleStar(messageId, !isStarred);
      
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
      
      const { selectedEmail } = get();
      if (selectedEmail?.id === messageId) {
        const labelIds = isStarred
          ? selectedEmail.labelIds.filter(l => l !== 'STARRED')
          : [...(selectedEmail.labelIds || []), 'STARRED'];
        set({ selectedEmail: { ...selectedEmail, labelIds } });
      }
    } catch (error) {

      set({ error: error.response?.data?.error || error.message });
    }
  },
  
  setFilter: (filterKey, value) => {
    set(state => ({
      filters: {
        ...state.filters,
        [filterKey]: value
      }
    }));
    
    get().fetchEmails();
  },
  
  searchEmails: async (searchQuery) => {
    set(state => ({
      filters: {
        ...state.filters,
        query: searchQuery
      }
    }));
    
    await get().fetchEmails({ query: searchQuery });
  },
  
  openComposeModal: () => {
    set({ composeModalOpen: true });
  },
  
  closeComposeModal: () => {
    set({ composeModalOpen: false });
  },
  
  refreshEmails: async () => {
    await get().fetchEmails();
  },

  fetchDrafts: async () => {
    set({ loading: true, error: null });

    try {
      const drafts = await emailDraftService.listDrafts({ status: 'draft' });
      set({ drafts, loading: false });
    } catch (error) {

      set({
        error: error.response?.data?.error || error.message || 'Failed to fetch drafts',
        loading: false
      });
    }
  },

  createDraft: async (draftData) => {
    const draft = await emailDraftService.createDraft(draftData);
    
    set(state => ({
      drafts: [draft, ...state.drafts]
    }));

    return draft;
  },

  sendDraft: async (draftId) => {
    set({ loading: true, error: null });

    try {
      const sentDraft = await emailDraftService.sendDraft(draftId);

      set(state => ({
        drafts: state.drafts.filter(d => d.id !== draftId),
        loading: false
      }));

      await get().fetchEmails();

      return { success: true, draft: sentDraft };
    } catch (error) {

      set({
        error: error.response?.data?.error || error.message || 'Failed to send email',
        loading: false
      });
      throw error;
    }
  },

  updateDraft: async (draftId, updates) => {
    const updatedDraft = await emailDraftService.updateDraft(draftId, updates);

    set(state => ({
      drafts: state.drafts.map(d => (d.id === draftId ? updatedDraft : d))
    }));

    return updatedDraft;
  },

  deleteDraft: async (draftId) => {
    await emailDraftService.deleteDraft(draftId);
    
    set(state => ({
      drafts: state.drafts.filter(d => d.id !== draftId)
    }));
  },

  getDraft: (draftId) => {
    const { drafts } = get();
    return drafts.find(d => d.id === draftId);
  }
}));
