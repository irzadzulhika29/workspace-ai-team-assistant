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
  },
}
