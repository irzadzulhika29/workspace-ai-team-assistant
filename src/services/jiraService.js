import axios from 'axios'
import { urls } from './api'
import { integrationApi } from './integrationService'

const pickIssuesArray = (payload) => {
  if (Array.isArray(payload)) return payload
  if (!payload || typeof payload !== 'object') return []

  if (Array.isArray(payload.issues)) return payload.issues
  if (Array.isArray(payload.data)) return payload.data
  if (Array.isArray(payload.items)) return payload.items
  if (Array.isArray(payload.result)) return payload.result

  return []
}

const buildJiraAuthBase64 = (jiraCredentials) => {
  if (!jiraCredentials?.email || !jiraCredentials?.api_token) return ''

  return btoa(`${jiraCredentials.email}:${jiraCredentials.api_token}`)
}

const ambilCurrentUser = async () => {
  try {
    const response = await axios.get(`${urls.getBackendUrl()}/api/auth/me`, {
      withCredentials: true,
      timeout: 8_000,
    })
    return response.data ?? null
  } catch {
    return null
  }
}

const normalizeJiraSummary = (payload) => {
  const summary =
    payload?.summary && typeof payload.summary === 'object'
      ? payload.summary
      : payload && typeof payload === 'object'
        ? payload
        : null

  if (!summary) return null

  return {
    domain: summary.domain || 'jira',
    status: summary.status || 'partial',
    priority: summary.priority || 'medium',
    headline: summary.headline || 'Ringkasan Jira belum tersedia',
    summary_points: Array.isArray(summary.summary_points) ? summary.summary_points : [],
    recommendations: Array.isArray(summary.recommendations) ? summary.recommendations : [],
    source_metrics: summary.source_metrics && typeof summary.source_metrics === 'object' ? summary.source_metrics : {},
    generated_at: summary.generated_at || payload?.generated_at || new Date().toISOString(),
  }
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
            fields: ['summary', 'status', 'assignee', 'priority', 'updated', 'project', 'issuetype', 'created', 'duedate', 'labels', 'reporter'],
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

  fetchAiSummaryTest: async () => {
    const [currentUser, jiraCredentials] = await Promise.all([
      ambilCurrentUser(),
      integrationApi.ambilJiraCredentialsUntukN8n(),
    ])

    if (!currentUser?.id) {
      throw new Error('Sesi login telah berakhir. Silakan login kembali.')
    }

    if (!jiraCredentials) {
      throw new Error('Jira belum terhubung. Silakan hubungkan Jira di halaman Integrasi.')
    }

    try {
      const response = await axios.post(
        urls.getJiraSummary(),
        {
          timestamp: new Date().toISOString(),
          user_id: currentUser.id,
          userId: currentUser.id,
          jira_credentials: jiraCredentials,
          jira_subdomain: jiraCredentials.subdomain,
          jira_auth_base64: buildJiraAuthBase64(jiraCredentials),
          jql: 'updated >= -90d ORDER BY updated DESC',
          maxResults: 50,
        },
        {
          timeout: 120_000,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      return normalizeJiraSummary(response.data)
    } catch (error) {
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error)
      }
      throw new Error(error.message || 'Tidak dapat mengambil AI summary Jira.')
    }
  },
}
