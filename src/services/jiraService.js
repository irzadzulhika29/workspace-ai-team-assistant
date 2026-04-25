import axios from 'axios'
import { urls } from './api'

const pickIssuesArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  if (Array.isArray(payload.issues)) return payload.issues
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.result)) return payload.result

  return []
}

export const jiraApi = {
  fetchIssues: async () => {
    try {
      const res = await axios.post(
        `${urls.getBackendUrl()}/api/integrations/jira/proxy`,
        {
          method: 'POST',
          path: '/rest/api/3/search/jql',
          data: {
            jql: 'updated >= -90d ORDER BY updated DESC',
            maxResults: 50,
            fields: ['summary', 'status', 'assignee', 'priority', 'updated'],
          },
        },
        {
          withCredentials: true,
        }
      )

      return pickIssuesArray(res.data)
    } catch (error) {
      // Better error handling
      if (error.response?.status === 401) {
        throw new Error('Sesi login telah berakhir. Silakan login kembali.')
      }
      if (error.response?.status === 404) {
        throw new Error('Jira belum terhubung. Silakan hubungkan Jira di halaman Integrasi.')
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error(error.message || 'Tidak dapat mengambil issue Jira.')
    }
  },
}
