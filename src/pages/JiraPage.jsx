import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ExternalLink,
  Flag,
  FolderKanban,
  ListChecks,
  RefreshCw,
  Sparkles,
  UserRound,
  UserMinus,
} from 'lucide-react'
import { jiraApi } from '../services/jiraService'

const JIRA_CACHE_KEY = 'jira_issues_cache_v1'
const IN_PROGRESS_KEYWORDS = ['in progress', 'progress', 'review', 'testing', 'qa', 'doing']
const DONE_KEYWORDS = ['done', 'closed', 'resolved', 'complete', 'completed']
const BLOCKED_KEYWORDS = ['blocked', 'blocker', 'waiting', 'stuck']
const HIGH_PRIORITY_KEYWORDS = ['highest', 'high', 'critical', 'urgent']
const STATUS_CATEGORY_LABELS = {
  new: 'To Do',
  indeterminate: 'In Progress',
  done: 'Done',
}

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

const formatShortDate = (value) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

const normalizeText = (value) => String(value || '').trim().toLowerCase()

const includesKeyword = (value, keywords) => {
  const normalized = normalizeText(value)
  return keywords.some((keyword) => normalized.includes(keyword))
}

const getStatusCategoryKey = (issue) => {
  const categoryKey = normalizeText(
    getField(issue, 'fields.status.statusCategory.key', 'status.statusCategory.key', 'statusCategory.key')
  )

  if (categoryKey) return categoryKey

  const categoryName = normalizeText(
    getField(issue, 'fields.status.statusCategory.name', 'status.statusCategory.name', 'statusCategory.name')
  )

  if (categoryName.includes('progress')) return 'indeterminate'
  if (categoryName.includes('done')) return 'done'
  if (categoryName.includes('to do')) return 'new'

  const status = getField(issue, 'fields.status.name', 'status.name', 'status', 'state')
  if (includesKeyword(status, DONE_KEYWORDS)) return 'done'
  if (includesKeyword(status, IN_PROGRESS_KEYWORDS)) return 'indeterminate'
  return 'new'
}

const buildBrowseUrl = (selfUrl, issueKey) => {
  if (!selfUrl || !issueKey) return ''

  try {
    const url = new URL(selfUrl)
    return `${url.origin}/browse/${issueKey}`
  } catch {
    return ''
  }
}

const isDateToday = (value) => {
  if (!value) return false
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return false

  return date.toDateString() === new Date().toDateString()
}

const isOverdueDate = (value) => {
  if (!value) return false
  const dueDate = new Date(value)
  if (Number.isNaN(dueDate.getTime())) return false

  const today = new Date()
  today.setHours(0, 0, 0, 0)
  dueDate.setHours(0, 0, 0, 0)

  return dueDate < today
}

const normalizeIssue = (issue, index) => {
  const key = getField(issue, 'key', 'id', 'issueKey') || `ISSUE-${index + 1}`
  const summary = getField(issue, 'fields.summary', 'summary', 'title') || 'Tanpa judul issue'
  const status = getField(issue, 'fields.status.name', 'status.name', 'status', 'state') || 'Unknown'
  const statusCategoryKey = getStatusCategoryKey(issue)
  const statusCategoryName =
    getField(issue, 'fields.status.statusCategory.name', 'status.statusCategory.name', 'statusCategory.name') ||
    STATUS_CATEGORY_LABELS[statusCategoryKey] ||
    'Unknown'
  const assignee =
    getField(issue, 'fields.assignee.displayName', 'assignee.displayName', 'assignee.name', 'assignee') ||
    'Belum ditugaskan'
  const priority = getField(issue, 'fields.priority.name', 'priority.name', 'priority') || 'Tanpa prioritas'
  const updatedAt = getField(issue, 'fields.updated', 'updated', 'updatedAt')
  const createdAt = getField(issue, 'fields.created', 'created', 'createdAt')
  const dueDate = getField(issue, 'fields.duedate', 'duedate', 'dueDate')
  const projectName = getField(issue, 'fields.project.name', 'project.name', 'project') || 'Project tidak diketahui'
  const issueType = getField(issue, 'fields.issuetype.name', 'issuetype.name', 'issueType') || 'Issue'
  const reporter =
    getField(issue, 'fields.reporter.displayName', 'reporter.displayName', 'reporter.name', 'reporter') || 'Tidak diketahui'
  const labels = Array.isArray(issue?.fields?.labels) ? issue.fields.labels : []
  const browseUrl = buildBrowseUrl(issue?.self, key)
  const isDone = statusCategoryKey === 'done'
  const isUnassigned = !getField(issue, 'fields.assignee.displayName', 'assignee.displayName', 'assignee.name', 'assignee')
  const isBlocked = includesKeyword(status, BLOCKED_KEYWORDS) || labels.some((label) => includesKeyword(label, BLOCKED_KEYWORDS))
  const isHighPriority = includesKeyword(priority, HIGH_PRIORITY_KEYWORDS)
  const isUpdatedToday = isDateToday(updatedAt)
  const isOverdue = !isDone && isOverdueDate(dueDate)

  return {
    ...issue,
    _key: key,
    _summary: summary,
    _status: status,
    _statusCategoryKey: statusCategoryKey,
    _statusCategoryName: statusCategoryName,
    _assignee: assignee,
    _priority: priority,
    _updatedAt: updatedAt,
    _createdAt: createdAt,
    _dueDate: dueDate,
    _projectName: projectName,
    _issueType: issueType,
    _reporter: reporter,
    _labels: labels,
    _browseUrl: browseUrl,
    _isDone: isDone,
    _isUnassigned: isUnassigned,
    _isBlocked: isBlocked,
    _isHighPriority: isHighPriority,
    _isUpdatedToday: isUpdatedToday,
    _isOverdue: isOverdue,
  }
}

const getLaneKey = (issue) => {
  if (issue._statusCategoryKey === 'done') return 'done'
  if (issue._statusCategoryKey === 'indeterminate') return 'inProgress'
  return 'todo'
}

const buildBoardGroups = (items) => {
  const groups = {
    todo: [],
    inProgress: [],
    done: [],
  }

  for (const issue of items) {
    groups[getLaneKey(issue)].push(issue)
  }

  return groups
}

const buildMetrics = (items) => {
  const todo = items.filter((issue) => issue._statusCategoryKey === 'new')
  const inProgress = items.filter((issue) => issue._statusCategoryKey === 'indeterminate')
  const done = items.filter((issue) => issue._statusCategoryKey === 'done')
  const blocked = items.filter((issue) => issue._isBlocked)
  const highPriority = items.filter((issue) => issue._isHighPriority)
  const unassigned = items.filter((issue) => issue._isUnassigned)
  const overdue = items.filter((issue) => issue._isOverdue)
  const updatedToday = items.filter((issue) => issue._isUpdatedToday)
  const withDueDate = items.filter((issue) => issue._dueDate)
  const lastUpdatedIssue = [...items]
    .filter((issue) => issue._updatedAt)
    .sort((a, b) => new Date(b._updatedAt) - new Date(a._updatedAt))[0]

  const assigneeCounts = items.reduce((acc, issue) => {
    if (issue._isUnassigned) return acc
    const assignee = issue._assignee
    acc[assignee] = (acc[assignee] || 0) + 1
    return acc
  }, {})

  const topAssignee = Object.entries(assigneeCounts).sort((a, b) => b[1] - a[1])[0] || null

  return {
    total: items.length,
    todoCount: todo.length,
    inProgressCount: inProgress.length,
    doneCount: done.length,
    blockedCount: blocked.length,
    highPriorityCount: highPriority.length,
    unassignedCount: unassigned.length,
    overdueCount: overdue.length,
    updatedTodayCount: updatedToday.length,
    dueDateCount: withDueDate.length,
    progressPercent: items.length ? Math.round((done.length / items.length) * 100) : 0,
    lastUpdatedIssue,
    topAssignee,
  }
}

const getPriorityTone = (priority) => {
  if (includesKeyword(priority, ['highest', 'critical', 'urgent'])) {
    return 'bg-rose-100 text-rose-700'
  }
  if (includesKeyword(priority, ['high', 'medium'])) {
    return 'bg-amber-100 text-amber-700'
  }
  return 'bg-slate-100 text-slate-600'
}

const getLaneTheme = (lane) => {
  if (lane === 'todo') {
    return {
      dot: 'bg-[#ff6a45]',
      line: 'bg-[#ff6a45]',
      card: 'border-[#f6d5cb] bg-[#fff3ef]',
      badge: 'bg-[#ffe0d4] text-[#d85a32]',
    }
  }

  if (lane === 'inProgress') {
    return {
      dot: 'bg-[#2563ff]',
      line: 'bg-[#2563ff]',
      card: 'border-[#d5e2ff] bg-[#eef4ff]',
      badge: 'bg-[#dbe8ff] text-[#3f6de0]',
    }
  }

  return {
    dot: 'bg-[#85c981]',
    line: 'bg-[#85c981]',
    card: 'border-[#d5ead3] bg-[#f1f8f0]',
    badge: 'bg-[#d9f0d8] text-[#4f9b55]',
  }
}

const lanes = [
  { key: 'todo', label: 'To Do' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
]

const tabs = ['Overview', 'Issues', 'Summary', 'Reports']

const MetricCard = ({ title, value, subtitle, icon, accent = 'bg-[#fff0eb] text-[#ff623d]', inlineNote }) => (
  <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</p>
        <p className="mt-3 text-3xl font-semibold text-slate-900">{value}</p>
        {inlineNote ? (
          <p className="mt-2 text-xs font-medium text-slate-500">{inlineNote}</p>
        ) : null}
      </div>
      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accent}`}>{icon}</div>
    </div>
    {subtitle ? <p className="mt-3 text-xs text-slate-500">{subtitle}</p> : null}
  </div>
)

export default function JiraPage() {
  const [issues, setIssues] = useState([])
  const [aiSummary, setAiSummary] = useState(null)
  const [loading, setLoading] = useState(false)
  const [summaryLoading, setSummaryLoading] = useState(false)
  const [activeSummarySlide, setActiveSummarySlide] = useState(0)
  const [error, setError] = useState('')
  const [summaryError, setSummaryError] = useState('')
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

  const loadJiraSummary = useCallback(async () => {
    setSummaryLoading(true)
    setSummaryError('')

    try {
      const summary = await jiraApi.fetchAiSummaryTest()
      setAiSummary(summary)
    } catch (err) {
      setAiSummary(null)
      setSummaryError(err.message || 'Tidak dapat mengambil AI summary Jira.')
    } finally {
      setSummaryLoading(false)
    }
  }, [])

  useEffect(() => {
    try {
      const cached = localStorage.getItem(JIRA_CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        const cachedIssues = Array.isArray(parsed?.issues) ? parsed.issues.map(normalizeIssue) : []

        if (cachedIssues.length > 0) {
          setIssues(cachedIssues)
          setLastSyncedAt(parsed?.syncedAt || '')
          loadJiraSummary()
          return
        }
      }
    } catch {
      localStorage.removeItem(JIRA_CACHE_KEY)
    }

    loadIssues()
    loadJiraSummary()
  }, [loadIssues, loadJiraSummary])

  useEffect(() => {
    setActiveSummarySlide(0)
  }, [aiSummary, summaryError])

  const boardGroups = useMemo(() => buildBoardGroups(issues), [issues])
  const metrics = useMemo(() => buildMetrics(issues), [issues])
  const summarySlides = aiSummary
    ? [
        { key: 'overview', label: 'Overview' },
        { key: 'findings', label: 'Findings' },
        { key: 'actions', label: 'Actions' },
      ]
    : []
  return (
    <div className="h-full overflow-y-auto custom-scrollbar">
      <div className="rounded-[28px] bg-[linear-gradient(90deg,rgba(255,244,239,0.96),rgba(255,238,231,0.88)),url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1400&q=80')] bg-cover bg-center px-6 py-6 text-slate-900 shadow-[0_20px_50px_rgba(255,98,61,0.18)] md:px-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#c95b37]">Jira Workspace</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">Daftar Issue Jira</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-700 md:text-base">
              Menampilkan issue Jira dari hasil refresh, disimpan lokal agar tidak hilang saat reload.
            </p>
            {lastSyncedAt ? (
              <p className="mt-3 inline-flex rounded-full border border-[#f3b7a4] bg-white/80 px-3 py-1 text-xs font-medium text-[#a84d31]">
                Terakhir sinkron: {formatDate(lastSyncedAt)}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={loadIssues}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#e8a38f] bg-white px-5 py-3 text-sm font-semibold text-[#c45734] transition-colors hover:bg-[#fff7f3] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Syncing...' : 'Sync Jira'}
            </button>

            <Link
              to="/chat/supervisor"
              state={{
                domain: 'jira',
                intent: 'create_ticket',
                templatePrompt: 'Buat tiket Jira baru berdasarkan kebutuhan saya.',
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#ff623d] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#ff744f]"
            >
              Create Issue
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-8 px-2">
        {tabs.map((tab, index) => (
          <button
            key={tab}
            type="button"
            className={`pb-3 text-sm font-medium transition-colors ${
              index === 0 ? 'border-b-2 border-[#ff623d] text-[#ff623d]' : 'text-slate-400'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {loading && issues.length === 0 ? (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.45fr_0.95fr_0.95fr_0.95fr_1fr]">
            {Array.from({ length: 5 }).map((_, idx) => (
              <div key={idx} className="skeleton h-28 rounded-3xl" />
            ))}
          </div>
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_1fr_0.9fr]">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div key={idx} className="skeleton h-[520px] rounded-3xl" />
            ))}
          </div>
        </div>
      ) : issues.length === 0 ? (
        <div className="mt-6 rounded-3xl bg-white px-6 py-16 text-center shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
          <Bug size={30} className="mx-auto text-slate-300" />
          <p className="mt-4 text-sm font-medium text-slate-700">Belum ada issue yang ditampilkan.</p>
          <p className="mt-1 text-xs text-slate-500">Klik tombol sync untuk menarik data Jira terbaru.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:flex-nowrap lg:items-start lg:gap-3">
              <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.06)] lg:w-[40%] lg:flex-shrink-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Progress Issue</p>
                    <p className="mt-1 text-xs text-slate-400">Berdasarkan status issue yang dimuat</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fff0eb] text-[#ff623d]">
                    <ListChecks size={22} />
                  </div>
                </div>
                <div className="mt-5 flex items-end justify-between gap-3">
                  <p className="text-4xl font-semibold text-slate-900">{metrics.progressPercent}%</p>
                  <p className="text-xs text-slate-500">
                    {metrics.doneCount}/{metrics.total} issue selesai
                  </p>
                </div>
                <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#ffe1d8]">
                  <div
                    className="h-full rounded-full bg-[#ff623d] transition-all duration-500"
                    style={{ width: `${metrics.progressPercent}%` }}
                  />
                </div>
              </div>

              <div className="flex flex-1 flex-col gap-4 md:flex-row lg:flex-nowrap lg:gap-3">
                <div className="flex-1 min-w-0">
                  <MetricCard
                    title="Issue Prioritas"
                    value={metrics.highPriorityCount}
                    inlineNote="Berdasarkan priority canonical dari Jira"
                    subtitle={`${metrics.inProgressCount} issue masih berjalan`}
                    icon={<Flag size={22} />}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <MetricCard
                    title="Unassigned"
                    value={metrics.unassignedCount}
                    inlineNote="Issue belum punya assignee"
                    subtitle={`${metrics.todoCount} issue masih di tahap to do`}
                    accent="bg-[#eef4ff] text-[#3f6de0]"
                    icon={<UserMinus size={22} />}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <MetricCard
                    title="Overdue"
                    value={metrics.overdueCount}
                    inlineNote={`${metrics.dueDateCount} issue punya due date`}
                    subtitle={`${metrics.updatedTodayCount} issue diupdate hari ini`}
                    accent="bg-[#fff4e5] text-[#d97706]"
                    icon={<AlertTriangle size={22} />}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-[0.9fr_0.9fr_0.9fr_1.15fr] xl:gap-3">
              {lanes.map((lane) => {
                const items = boardGroups[lane.key]
                const theme = getLaneTheme(lane.key)

                return (
                  <div key={lane.key} className="rounded-3xl bg-white p-4 xl:p-3.5 shadow-[0_12px_35px_rgba(15,23,42,0.06)]">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${theme.dot}`} />
                      <p className="text-base font-medium text-slate-900">{lane.label}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">{items.length}</span>
                    </div>
                    <div className={`mt-4 h-[3px] rounded-full ${theme.line}`} />

                    <div className="mt-5 space-y-3">
                      {items.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-8 text-center text-sm text-slate-400">
                          Belum ada issue pada kolom ini.
                        </div>
                      ) : (
                        items.slice(0, 3).map((issue) => (
                          <div key={issue._key} className={`rounded-[22px] border p-4 xl:p-3.5 ${theme.card}`}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-lg bg-white/80 px-2 py-1 text-[11px] font-medium text-slate-600">
                                  {issue._issueType}
                                </span>
                                <span className={`rounded-lg px-2 py-1 text-[11px] font-medium ${getPriorityTone(issue._priority)}`}>
                                  {issue._priority}
                                </span>
                              </div>
                              {issue._browseUrl ? (
                                <a
                                  href={issue._browseUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/80 text-slate-400 transition-colors hover:text-slate-700"
                                  aria-label={`Buka ${issue._key} di Jira`}
                                >
                                  <ExternalLink size={15} />
                                </a>
                              ) : null}
                            </div>

                            <div className="mt-4 flex items-center gap-2">
                              <span className={`rounded-full px-2 py-1 text-[11px] font-medium ${theme.badge}`}>
                                {issue._status}
                              </span>
                              {issue._isBlocked ? (
                                <span className="rounded-full bg-rose-100 px-2 py-1 text-[11px] font-medium text-rose-700">
                                  Blocked
                                </span>
                              ) : null}
                            </div>

                            <h3 className="mt-4 text-lg xl:text-[1.05rem] font-semibold leading-tight text-slate-900">{issue._key}</h3>
                            <p className="mt-2 text-[13px] leading-5 text-slate-600 line-clamp-2">{issue._summary}</p>

                            <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[11px] text-slate-500">
                              <span className="inline-flex items-center gap-1.5">
                                <FolderKanban size={13} className="text-slate-400" />
                                {issue._projectName}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <UserRound size={13} className="text-slate-400" />
                                {issue._assignee}
                              </span>
                              <span className="inline-flex items-center gap-1.5">
                                <CircleDot size={13} className="text-slate-400" />
                                {formatShortDate(issue._updatedAt)}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                              <span
                                className={`rounded-full px-2 py-1 font-medium ${
                                  issue._isOverdue ? 'bg-rose-100 text-rose-700' : 'bg-white/80 text-slate-500'
                                }`}
                              >
                                {issue._dueDate ? `Due ${formatShortDate(issue._dueDate)}` : 'Belum ada due date'}
                              </span>
                              {(Array.isArray(issue._labels) ? issue._labels : []).slice(0, 2).map((label) => (
                                <span key={label} className="rounded-full bg-white/70 px-2 py-1 text-slate-500">
                                  #{label}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))
                      )}

                      {items.length > 3 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-center text-xs font-medium text-slate-500">
                          +{items.length - 3} issue lainnya
                        </div>
                      ) : null}
                    </div>
                  </div>
                )
              })}

              <div className="self-start rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#ff623d]">
                      <Sparkles size={18} />
                    </div>
                    <p className="text-[1.05rem] font-semibold text-slate-900">AI Insights</p>
                  </div>
                  <button
                    type="button"
                    onClick={loadJiraSummary}
                    disabled={summaryLoading}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                    aria-label="Refresh AI summary Jira"
                    title="Refresh AI summary Jira"
                  >
                    <RefreshCw size={16} className={summaryLoading ? 'animate-spin' : ''} />
                  </button>
                </div>

                <div className="mt-5 space-y-4">
                  {summaryLoading ? (
                    <div className="space-y-3">
                      <div className="skeleton h-12 rounded-2xl" />
                      <div className="skeleton h-32 rounded-3xl" />
                      <div className="grid grid-cols-2 gap-3">
                        {Array.from({ length: 4 }).map((_, index) => (
                          <div key={index} className="skeleton h-24 rounded-2xl" />
                        ))}
                      </div>
                    </div>
                  ) : summaryError ? (
                    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                      {summaryError}
                    </div>
                  ) : aiSummary ? (
                    <>
                      <div className="grid grid-cols-3 gap-2 rounded-2xl bg-slate-50 p-1">
                        {summarySlides.map((slide, index) => (
                          <button
                            key={slide.key}
                            type="button"
                            onClick={() => setActiveSummarySlide(index)}
                            className={`rounded-xl px-3 py-2 text-[11px] font-semibold transition-colors ${
                              activeSummarySlide === index
                                ? 'bg-white text-[#ff623d] shadow-sm'
                                : 'text-slate-400 hover:text-slate-600'
                            }`}
                          >
                            {slide.label}
                          </button>
                        ))}
                      </div>

                      <div className={activeSummarySlide === 0 ? 'rounded-3xl border border-[#f4ddd5] bg-[linear-gradient(180deg,#fffaf8_0%,#fff5f1_100%)] px-4 py-4' : 'hidden rounded-3xl border border-[#f4ddd5] bg-[linear-gradient(180deg,#fffaf8_0%,#fff5f1_100%)] px-4 py-4'}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/90 text-[#ff623d] shadow-sm">
                            <Sparkles size={18} />
                          </div>
                          <span className="rounded-full bg-[#ffe9df] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#ff623d]">
                            {aiSummary.priority}
                          </span>
                        </div>
                        <div className="mt-3">
                          <p className="text-sm font-semibold text-slate-900">Ringkasan AI</p>
                          <p className="mt-2 text-sm leading-6 text-slate-600">{aiSummary.headline}</p>
                          <p className="mt-4 text-xs font-medium text-slate-500">Update: {formatDate(aiSummary.generated_at)}</p>
                        </div>
                      </div>

                      <div className={activeSummarySlide === 0 ? 'grid grid-cols-2 gap-3' : 'hidden grid-cols-2 gap-3'}>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Total Issue</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef4ff] text-[#4f73ff]">
                              <ListChecks size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-4xl font-semibold text-slate-900">{aiSummary.source_metrics?.total_issues || 0}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Active Issue</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#f2ebff] text-[#8a63ff]">
                              <CircleDot size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-4xl font-semibold text-slate-900">
                            {(aiSummary.source_metrics?.todo_count || 0) + (aiSummary.source_metrics?.in_progress_count || 0)}
                          </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Unassigned</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#e8f8ee] text-[#39a765]">
                              <UserMinus size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-4xl font-semibold text-slate-900">{aiSummary.source_metrics?.unassigned_count || 0}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">Overdue</p>
                            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff1eb] text-[#ff7a4a]">
                              <AlertTriangle size={18} />
                            </div>
                          </div>
                          <p className="mt-3 text-4xl font-semibold text-slate-900">{aiSummary.source_metrics?.overdue_count || 0}</p>
                        </div>
                      </div>

                      {aiSummary.summary_points?.length ? (
                        <div className={activeSummarySlide === 1 ? 'rounded-3xl border border-slate-200 bg-white px-4 py-4' : 'hidden rounded-3xl border border-slate-200 bg-white px-4 py-4'}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Findings</p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveSummarySlide((prev) => Math.max(prev - 1, 0))}
                                disabled={activeSummarySlide === 0}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Slide sebelumnya"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveSummarySlide((prev) => Math.min(prev + 1, summarySlides.length - 1))}
                                disabled={activeSummarySlide === summarySlides.length - 1}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Slide berikutnya"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                          <ul className="mt-3 space-y-2">
                            {aiSummary.summary_points.map((point, index) => (
                              <li key={`${point}-${index}`} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#ff623d]" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      {aiSummary.recommendations?.length ? (
                        <div className={activeSummarySlide === 2 ? 'rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-4' : 'hidden rounded-3xl border border-dashed border-slate-200 bg-white px-4 py-4'}>
                          <div className="mb-3 flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-900">Actions</p>
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setActiveSummarySlide((prev) => Math.max(prev - 1, 0))}
                                disabled={activeSummarySlide === 0}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Slide sebelumnya"
                              >
                                <ChevronLeft size={16} />
                              </button>
                              <button
                                type="button"
                                onClick={() => setActiveSummarySlide((prev) => Math.min(prev + 1, summarySlides.length - 1))}
                                disabled={activeSummarySlide === summarySlides.length - 1}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label="Slide berikutnya"
                              >
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                          <ul className="mt-3 space-y-2">
                            {aiSummary.recommendations.map((recommendation, index) => (
                              <li key={`${recommendation}-${index}`} className="flex items-start gap-2 text-sm text-slate-700">
                                <span className="mt-0.5 text-emerald-600">-&gt;</span>
                                <span>{recommendation}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ) : null}

                      <div className={activeSummarySlide === 2 ? 'rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4' : 'hidden rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-4'}>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Source Metrics</p>
                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-600">
                          <div className="rounded-xl bg-slate-50 px-3 py-2">To Do: {aiSummary.source_metrics?.todo_count || 0}</div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">In Progress: {aiSummary.source_metrics?.in_progress_count || 0}</div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">Done: {aiSummary.source_metrics?.done_count || 0}</div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">High Priority: {aiSummary.source_metrics?.high_priority_count || 0}</div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">Blocked: {aiSummary.source_metrics?.blocked_count || 0}</div>
                          <div className="rounded-xl bg-slate-50 px-3 py-2">Updated Today: {aiSummary.source_metrics?.updated_today_count || 0}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      Klik tombol refresh untuk test hit AI summary ke webhook `jira-summary`.
                    </div>
                  )}
                </div>
              </div>
            </div>
        </div>
      )}
    </div>
  )
}
