const JIRA_BASE = 'https://n8n.karyatech.web.id'

const getJiraWebhookUrl = () => {
  const mode = localStorage.getItem('n8n_env_mode')
  return mode === 'dev'
    ? `${JIRA_BASE}/webhook-test/jira`
    : `${JIRA_BASE}/webhook/jira`
}

/** @deprecated gunakan getJiraWebhookUrl() agar mengikuti env mode */
const JIRA_WEBHOOK_URL = getJiraWebhookUrl()

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
    const response = await fetch(getJiraWebhookUrl(), {
      method: 'POST',
    })
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.message || data?.error?.message || 'Gagal mengambil data Jira')
    }

    return pickIssuesArray(data)
  },
}

export { JIRA_WEBHOOK_URL }
