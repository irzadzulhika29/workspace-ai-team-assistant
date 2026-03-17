import { useState, useEffect } from 'react'
import { jiraApi } from '../services/jiraService'
import { DONE_STATUS_KEYWORDS } from '../constants/dashboard'

const getIssueStatus = (issue) => {
  if (!issue || typeof issue !== 'object') return 'Unknown'
  return issue.fields?.status?.name || issue.status?.name || issue.status || issue.state || 'Unknown'
}

const buildJiraSummary = (items) => {
  const statusCount = {}
  let doneCount = 0

  for (const issue of items) {
    const status = getIssueStatus(issue)
    const normalizedStatus = String(status).trim() || 'Unknown'
    statusCount[normalizedStatus] = (statusCount[normalizedStatus] || 0) + 1

    const lowerStatus = normalizedStatus.toLowerCase()
    if (DONE_STATUS_KEYWORDS.some((keyword) => lowerStatus.includes(keyword))) {
      doneCount += 1
    }
  }

  const total = items.length
  const percent = total > 0 ? Math.round((doneCount / total) * 100) : 0
  const byStatus = Object.entries(statusCount)
    .sort((a, b) => b[1] - a[1])
    .map(([status, count]) => ({ status, count }))

  return {
    total,
    done: doneCount,
    percent,
    byStatus,
  }
}

export const useJiraProgress = () => {
  const [summary, setSummary] = useState({ total: 0, done: 0, percent: 0, byStatus: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadJiraProgress = async () => {
      setLoading(true)
      setError('')

      try {
        const items = await jiraApi.fetchIssues()
        const safeItems = Array.isArray(items) ? items : []
        setSummary(buildJiraSummary(safeItems))
      } catch (err) {
        setError(err.message || 'Tidak dapat mengambil progres Jira.')
      } finally {
        setLoading(false)
      }
    }

    loadJiraProgress()
  }, [])

  return { summary, loading, error }
}
