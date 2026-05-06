import { create } from 'zustand'
import axios from 'axios'
import { urls } from '../services/api'

const initialJiraState = {
  connected: false,
  subdomain: '',
  email: '',
  connectedAt: '',
  updatedAt: '',
  loading: false,
  saving: false,
  disconnecting: false,
  error: null,
}

export const useIntegrationStore = create((set) => ({
  jira: initialJiraState,

  fetchJiraStatus: async () => {
    set((state) => ({ jira: { ...state.jira, loading: true, error: null } }))

    try {
      const res = await axios.get(`${urls.getBackendUrl()}/api/integrations/jira`, {
        withCredentials: true,
      })

      const data = res.data
      set((state) => ({
        jira: {
          ...state.jira,
          connected: Boolean(data.connected),
          subdomain: data.subdomain || '',
          email: data.email || '',
          connectedAt: data.connectedAt || '',
          updatedAt: data.updatedAt || '',
          loading: false,
          error: null,
        },
      }))
    } catch (error) {
      set((state) => ({
        jira: {
          ...state.jira,
          loading: false,
          error: error.response?.data?.error || 'Tidak dapat mengambil status Jira.',
        },
      }))
    }
  },

  connectJira: async (credentials) => {
    set((state) => ({ jira: { ...state.jira, saving: true, error: null } }))

    try {
      const res = await axios.post(`${urls.getBackendUrl()}/api/integrations/jira`, credentials, {
        withCredentials: true,
      })

      const data = res.data
      set((state) => ({
        jira: {
          ...state.jira,
          connected: true,
          subdomain: data.subdomain || '',
          email: data.email || '',
          connectedAt: data.connectedAt || '',
          updatedAt: data.updatedAt || '',
          saving: false,
          error: null,
        },
      }))

      return data
    } catch (error) {
      const message = error.response?.data?.error || 'Gagal menghubungkan Jira.'
      set((state) => ({
        jira: {
          ...state.jira,
          saving: false,
          error: message,
        },
      }))
      throw new Error(message)
    }
  },

  disconnectJira: async () => {
    set((state) => ({ jira: { ...state.jira, disconnecting: true, error: null } }))

    try {
      await axios.delete(`${urls.getBackendUrl()}/api/integrations/jira`, {
        withCredentials: true,
      })

      set({
        jira: {
          ...initialJiraState,
        },
      })
    } catch (error) {
      set((state) => ({
        jira: {
          ...state.jira,
          disconnecting: false,
          error: error.response?.data?.error || 'Gagal memutuskan integrasi Jira.',
        },
      }))
    }
  },
}))
