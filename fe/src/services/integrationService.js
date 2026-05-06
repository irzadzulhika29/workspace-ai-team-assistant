import axios from 'axios'
import { urls } from './api'

export const integrationApi = {
  ambilJiraCredentialsUntukN8n: async () => {
    try {
      const res = await axios.get(`${urls.getBackendUrl()}/api/integrations/jira/n8n-credentials`, {
        withCredentials: true,
      })
      return res.data?.jira_credentials || null
    } catch {
      return null
    }
  },
}
