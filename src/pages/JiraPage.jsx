import React, { useCallback, useEffect, useState } from 'react'
import { Bug, RefreshCw, AlertCircle, CircleDot, UserRound, Flag, ListChecks } from 'lucide-react'
import { jiraApi } from '../services/jiraService'

const JIRA_CACHE_KEY = 'jira_issues_cache_v1'

const getField = (issue, ...keys) => {
  for (const key of keys) {
    const value = key.split('.').reduce((acc, part) => acc?.[part], issue)
    if (value !== undefined && value !== null && value !== '') return value
  }
  return ''
}

const formatDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const normalizeIssue = (issue, index) => {
  const key = getField(issue, 'key', 'id', 'issueKey') || `ISSUE-${index + 1}`
  const summary = getField(issue, 'fields.summary', 'summary', 'title') || 'Tanpa judul issue'
  const status = getField(issue, 'fields.status.name', 'status.name', 'status', 'state') || 'Unknown'
  const assignee = getField(issue, 'fields.assignee.displayName', 'assignee.displayName', 'assignee.name', 'assignee') || 'Belum ditugaskan'
  const priority = getField(issue, 'fields.priority.name', 'priority.name', 'priority') || 'Tanpa prioritas'
  const updatedAt = getField(issue, 'fields.updated', 'updated', 'updatedAt')

  return {
    ...issue,
    _key: key,
    _summary: summary,
    _status: status,
    _assignee: assignee,
    _priority: priority,
    _updatedAt: updatedAt,
  }
}

const buildGroupedIssues = (items) => {
  return items.reduce((acc, issue) => {
    const status = issue._status || 'Unknown'
    if (!acc[status]) acc[status] = []
    acc[status].push(issue)
    return acc
  }, {})
}

export default function JiraPage() {
  const [issues, setIssues] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [lastSyncedAt, setLastSyncedAt] = useState('')

  const loadIssues = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const items = await jiraApi.fetchIssues()
      const normalized = items.map(normalizeIssue)
      setIssues(normalized)
      const syncedAt = new Date().toISOString()
      setLastSyncedAt(syncedAt)
      localStorage.setItem(JIRA_CACHE_KEY, JSON.stringify({ issues: normalized, syncedAt }))
    } catch (err) {
      setError(err.message || 'Tidak dapat mengambil issue Jira.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      const cached = localStorage.getItem(JIRA_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        const cachedIssues = Array.isArray(parsed?.issues)
          ? parsed.issues.map(normalizeIssue)
          : []

        if (cachedIssues.length > 0) {
          setIssues(cachedIssues)
          setLastSyncedAt(parsed?.syncedAt || '')
          return
        }
      }
    } catch {
      localStorage.removeItem(JIRA_CACHE_KEY)
    }

    loadIssues()
  }, [loadIssues])

  const groupedIssues = buildGroupedIssues(issues)
  const groupedEntries = Object.entries(groupedIssues)

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
              Jira Workspace
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight flex items-center gap-2">
              <Bug size={24} className="text-cyan-700" />
              Daftar Issue Jira
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Menampilkan issue Jira dari hasil refresh, disimpan lokal agar tidak hilang saat reload.
            </p>
            {lastSyncedAt && (
              <p className="text-xs text-slate-400 mt-1">
                Terakhir sinkron: {formatDate(lastSyncedAt)}
              </p>
            )}
          </div>

          <button
            onClick={loadIssues}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memuat...' : 'Refresh Jira'}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="panel p-3 md:p-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, idx) => (
                <div key={idx} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : issues.length === 0 ? (
            <div className="text-center py-14 px-4">
              <Bug size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">Belum ada issue yang ditampilkan.</p>
              <p className="text-xs text-slate-500 mt-1">Klik tombol refresh untuk menarik data terbaru.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {groupedEntries.map(([status, group]) => (
                  <div key={status} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                    <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wide">{status}</p>
                    <p className="text-xl font-semibold text-slate-900 mt-1">{group.length}</p>
                  </div>
                ))}
              </div>

              {groupedEntries.map(([status, group]) => (
                <div key={status} className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 md:p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <ListChecks size={15} className="text-slate-500" />
                    <p className="text-sm font-semibold text-slate-900">{status}</p>
                    <span className="text-xs text-slate-500">({group.length})</span>
                  </div>

                  <div className="space-y-2.5">
                    {group.map((issue) => (
                      <div key={issue._key} className="rounded-xl border border-slate-200 bg-white p-4">
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <div className="min-w-0">
                            <p className="text-[11px] font-mono text-cyan-700 tracking-wide">{issue._key}</p>
                            <h3 className="text-sm md:text-base font-semibold text-slate-900 break-words">{issue._summary}</h3>
                          </div>
                          <span className="inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                            {issue._status}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound size={13} className="text-slate-400" />
                            {issue._assignee}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Flag size={13} className="text-slate-400" />
                            {issue._priority}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <CircleDot size={13} className="text-slate-400" />
                            Update: {formatDate(issue._updatedAt)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
