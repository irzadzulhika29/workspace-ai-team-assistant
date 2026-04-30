import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bug,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  Mail,
  RefreshCw,
  Sparkles,
  Circle,
  BarChart3,
} from 'lucide-react'
import axios from 'axios'
import { useAuth } from '../context/AuthContext'
import { urls } from '../services/api'
import { calendarApi } from '../services/calendarService'
import { jiraApi } from '../services/jiraService'
import { emailApi } from '../services/emailService'

const DONE_STATUS_KEYWORDS = ['done', 'closed', 'resolved', 'complete', 'completed']
const BRIEFINGS_STORAGE_KEY = 'dashboard_briefings_cache'

const cardClassName = 'panel flex h-full flex-col overflow-hidden border border-slate-200/80 p-5 md:p-6'
const subCardClassName = 'rounded-2xl border border-slate-200/80 bg-white/90'

const formatPriorityLabel = (priority) => {
  if (priority === 'high') return 'Prioritas Tinggi'
  if (priority === 'medium') return 'Prioritas Sedang'
  if (priority === 'low') return 'Prioritas Rendah'
  return 'Perlu Ditinjau'
}

const getPriorityTone = (priority) => {
  if (priority === 'high') return 'border-rose-200 bg-rose-50 text-rose-700'
  if (priority === 'medium') return 'border-amber-200 bg-amber-50 text-amber-700'
  if (priority === 'low') return 'border-emerald-200 bg-emerald-50 text-emerald-700'
  return 'border-slate-200 bg-slate-100 text-slate-700'
}

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

const extractEmailHeader = (email, name) => {
  const header = email?.payload?.headers?.find((item) => item.name?.toLowerCase() === name.toLowerCase())
  return header?.value || ''
}

const extractSenderName = (from = '') => {
  const match = from.match(/^([^<]+)/)
  return match ? match[1].trim() : from
}

const formatEventTime = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date
  if (!startDate) return 'Waktu belum tersedia'

  const dateObj = new Date(startDate)
  if (!event?.start?.dateTime) return 'Seharian'

  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const HeaderBadge = ({ children }) => (
  <span className="inline-flex items-center gap-2 rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-800">
    <Sparkles size={12} />
    {children}
  </span>
)

const CardHeader = ({ icon: Icon, eyebrow, title, rightSlot }) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-700 shadow-[0_10px_25px_rgba(0,97,132,0.08)]">
        <Icon size={18} />
      </div>
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">{eyebrow}</p>
        <h2 className="mt-2 text-xl font-bold font-headline text-slateui-900">{title}</h2>
      </div>
    </div>
    {rightSlot}
  </div>
)

const ActionLink = ({ to, state, children, primary = false, icon: Icon = null }) => (
  <Link
    to={to}
    state={state}
    className={`inline-flex flex-1 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
      primary
        ? 'bg-brand-600 text-white shadow-[0_12px_24px_rgba(0,97,132,0.18)] hover:bg-brand-700'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
    }`}
  >
    {Icon ? <Icon size={16} /> : null}
    {children}
  </Link>
)

const MetricTile = ({ value, label, accent = 'text-slateui-900' }) => (
  <div className={`${subCardClassName} p-4`}>
    <div className={`text-2xl font-bold font-headline ${accent}`}>{value}</div>
    <div className="mt-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</div>
  </div>
)

const SummaryBulletList = ({ items, bulletTone = 'text-cyan-600', className = '' }) => {
  if (!items?.length) return null

  return (
    <ul className={`space-y-2 ${className}`}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`} className="flex items-start gap-2 text-sm leading-6 text-slate-600">
          <span className={`mt-2 inline-block h-1.5 w-1.5 rounded-full ${bulletTone.replace('text-', 'bg-')}`} />
          <span className="flex-1">{item}</span>
        </li>
      ))}
    </ul>
  )
}

const getBriefingsCacheKey = (userId) => `${BRIEFINGS_STORAGE_KEY}:${userId || 'anonymous'}`

const readBriefingsCache = (userId) => {
  try {
    const raw = localStorage.getItem(getBriefingsCacheKey(userId))
    if (!raw) return null

    const parsed = JSON.parse(raw)
    if (!parsed?.briefings || typeof parsed.briefings !== 'object') {
      return null
    }

    return parsed
  } catch (error) {
    console.warn('Failed to read dashboard briefings cache:', error)
    return null
  }
}

const writeBriefingsCache = (userId, payload) => {
  try {
    localStorage.setItem(getBriefingsCacheKey(userId), JSON.stringify(payload))
  } catch (error) {
    console.warn('Failed to write dashboard briefings cache:', error)
  }
}

export default function Dashboard() {
  const { user, loading: authLoading } = useAuth()
  const [nextEvents, setNextEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [calendarError, setCalendarError] = useState('')
  const [jiraSummary, setJiraSummary] = useState({ total: 0, done: 0, percent: 0, byStatus: [] })
  const [loadingJira, setLoadingJira] = useState(true)
  const [jiraError, setJiraError] = useState('')
  const [unreadEmails, setUnreadEmails] = useState([])
  const [loadingEmails, setLoadingEmails] = useState(true)
  const [emailError, setEmailError] = useState('')
  const [refreshing, setRefreshing] = useState(false)
  const [calendarBriefing, setCalendarBriefing] = useState(null)
  const [emailBriefing, setEmailBriefing] = useState(null)
  const [hasCachedBriefings, setHasCachedBriefings] = useState(false)
  const [briefingsCacheResolved, setBriefingsCacheResolved] = useState(false)

  const applyBriefingsPayload = (payload) => {
    const briefings = payload?.briefings || {}
    const jiraBriefing = briefings.jira || null
    const calendarData = briefings.calendar || null
    const emailData = briefings.email || null

    if (jiraBriefing) {
      const metrics = jiraBriefing.source_metrics || {}
      const totalIssues = metrics.total_issues || 0
      const doneIssues = metrics.completed_issues || metrics.done_count || metrics.resolved_count || 0

      setJiraSummary({
        total: totalIssues,
        done: doneIssues,
        percent: totalIssues ? Math.round((doneIssues / totalIssues) * 100) : 0,
        byStatus: [],
        briefing: jiraBriefing,
      })
      setJiraError('')
      setLoadingJira(false)
    }

    if (calendarData) {
      setCalendarBriefing(calendarData)
      setNextEvents([])
      setCalendarError('')
      setLoadingEvents(false)
    }

    if (emailData) {
      setEmailBriefing(emailData)
      setUnreadEmails([])
      setEmailError('')
      setLoadingEmails(false)
    }
  }

  useEffect(() => {
    if (authLoading) return

    const cachedBriefings = readBriefingsCache(user?.id)
    if (cachedBriefings) {
      applyBriefingsPayload(cachedBriefings)
      setHasCachedBriefings(true)
    } else {
      setHasCachedBriefings(false)
    }

    setBriefingsCacheResolved(true)
  }, [authLoading, user?.id])

  useEffect(() => {
    if (!briefingsCacheResolved) return
    if (hasCachedBriefings) return

    const loadEvents = async () => {
      setLoadingEvents(true)
      setCalendarError('')

      try {
        const items = await calendarApi.fetchCalendarEvents()
        setNextEvents(items.slice(0, 3))
      } catch (err) {
        setCalendarError(err.message || 'Tidak dapat mengambil jadwal kalender.')
      } finally {
        setLoadingEvents(false)
      }
    }

    loadEvents()
  }, [briefingsCacheResolved, hasCachedBriefings])

  useEffect(() => {
    if (!briefingsCacheResolved) return
    if (hasCachedBriefings) return

    const loadJiraProgress = async () => {
      setLoadingJira(true)
      setJiraError('')

      try {
        const items = await jiraApi.fetchIssues()
        const safeItems = Array.isArray(items) ? items : []
        setJiraSummary(buildJiraSummary(safeItems))
      } catch (err) {
        console.error('Dashboard Jira error:', err)
        setJiraError(err.message || 'Tidak dapat mengambil progres Jira.')
      } finally {
        setLoadingJira(false)
      }
    }

    const timer = setTimeout(() => {
      loadJiraProgress()
    }, 100)

    return () => clearTimeout(timer)
  }, [briefingsCacheResolved, hasCachedBriefings])

  useEffect(() => {
    if (!briefingsCacheResolved) return
    if (hasCachedBriefings) return

    const loadUnreadEmails = async () => {
      setLoadingEmails(true)
      setEmailError('')

      try {
        const response = await emailApi.listEmails({
          q: 'is:unread',
          maxResults: 5,
        })

        const emailDetails = await Promise.all(
          (response.messages || []).slice(0, 5).map(async (msg) => {
            try {
              return await emailApi.getEmail(msg.id)
            } catch (err) {
              console.error('Error fetching email detail:', err)
              return null
            }
          }),
        )

        setUnreadEmails(emailDetails.filter(Boolean))
      } catch (err) {
        console.error('Dashboard Email error:', err)
        setEmailError(err.message || 'Tidak dapat mengambil email.')
      } finally {
        setLoadingEmails(false)
      }
    }

    const timer = setTimeout(() => {
      loadUnreadEmails()
    }, 100)

    return () => clearTimeout(timer)
  }, [briefingsCacheResolved, hasCachedBriefings])

  const handleRefreshBriefings = async () => {
    setRefreshing(true)

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'

      let googleAccessToken = null
      try {
        const tokenResponse = await axios.get(`${backendUrl}/api/google/token`, {
          withCredentials: true,
          timeout: 8000,
        })
        googleAccessToken = tokenResponse.data.access_token || null
      } catch (err) {
        console.warn('Could not fetch Google token:', err.response?.data || err.message)
      }

      let jiraAuthBase64 = null
      let jiraSubdomain = null
      try {
        const jiraResponse = await axios.get(`${backendUrl}/api/integrations/jira/n8n-credentials`, {
          withCredentials: true,
          timeout: 8000,
        })
        const jiraCredentials = jiraResponse.data?.jira_credentials
        if (jiraCredentials?.email && jiraCredentials?.api_token) {
          jiraAuthBase64 = btoa(`${jiraCredentials.email}:${jiraCredentials.api_token}`)
          jiraSubdomain = jiraCredentials.subdomain
        }
      } catch (err) {
        console.warn('Could not fetch Jira credentials:', err.response?.data || err.message)
      }

      const response = await fetch(urls.getBriefings(), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          google_access_token: googleAccessToken,
          jira_auth_base64: jiraAuthBase64,
          jira_subdomain: jiraSubdomain,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to refresh briefings')
      }

      const briefingsResult = await response.json()
      writeBriefingsCache(user?.id, briefingsResult)
      applyBriefingsPayload(briefingsResult)
      setHasCachedBriefings(true)
    } catch (err) {
      console.error('Error refreshing briefings:', err)
      alert('Gagal refresh briefings. Silakan coba lagi.')
    } finally {
      setRefreshing(false)
    }
  }

  const greetingName = user?.name?.split(' ')[0] || 'Commander'
  const jiraMetrics = jiraSummary.briefing?.source_metrics || {}
  const jiraStatusTiles = jiraSummary.byStatus.slice(0, 3)
  const nextEvent = nextEvents[0]
  const secondaryEvents = nextEvents.slice(1, 3)

  return (
    <div className="relative overflow-hidden px-5 py-6 md:px-8 md:py-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top_left,_rgba(196,231,255,0.65),_transparent_55%)]" />

      <div className="relative mx-auto max-w-6xl">
        <section className="mb-8 flex flex-col gap-5 md:mb-10 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <HeaderBadge>Executive Dashboard</HeaderBadge>
            <h1 className="mt-5 text-3xl font-bold font-headline leading-tight tracking-tight text-slateui-900 md:text-4xl">
              Morning, {greetingName}.
            </h1>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slateui-500 md:text-base">
              Ringkasan operasional untuk Jira, agenda, dan email penting. Layout disusun ulang mengikuti referensi dashboard, dengan visual tetap memakai tema lama workspace ini.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Workspace Mode</p>
              <p className="mt-1 text-sm font-semibold text-slateui-900">Cached Briefings</p>
            </div>
            <button
              onClick={handleRefreshBriefings}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(0,97,132,0.18)] transition-all hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw size={16} className={refreshing ? 'animate-spin' : ''} />
              {refreshing ? 'Refreshing...' : 'Refresh Briefings'}
            </button>
          </div>
        </section>

        <section className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-6">
          <article className={cardClassName}>
            <CardHeader
              icon={Bug}
              eyebrow="Jira Sync"
              title="Progress Issue Hari Ini"
              rightSlot={
                jiraSummary.briefing ? (
                  <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getPriorityTone(jiraSummary.briefing.priority)}`}>
                    {formatPriorityLabel(jiraSummary.briefing.priority)}
                  </span>
                ) : jiraSummary.total > 0 ? (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800">
                    {jiraSummary.percent}% selesai
                  </span>
                ) : null
              }
            />

            {loadingJira ? (
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="skeleton h-20 rounded-2xl" />
                  ))}
                </div>
                <div className="skeleton h-28 rounded-2xl" />
              </div>
            ) : jiraError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{jiraError}</div>
            ) : (
              <>
                <div className="mb-5 grid grid-cols-3 gap-3">
                  {jiraSummary.briefing ? (
                    <>
                      <MetricTile value={jiraMetrics.total_issues || jiraSummary.total || 0} label="Open" />
                      <MetricTile value={jiraMetrics.in_progress_issues || jiraMetrics.active_issues || 0} label="Active" accent="text-cyan-700" />
                      <MetricTile value={jiraMetrics.blocked_issues || jiraMetrics.overdue_issues || 0} label="Blocked" accent="text-rose-700" />
                    </>
                  ) : jiraStatusTiles.length > 0 ? (
                    jiraStatusTiles.map((status) => (
                      <MetricTile key={status.status} value={status.count} label={status.status} accent={status.status.toLowerCase().includes('done') ? 'text-emerald-700' : 'text-slateui-900'} />
                    ))
                  ) : (
                    <>
                      <MetricTile value={jiraSummary.total} label="Issues" />
                      <MetricTile value={jiraSummary.done} label="Done" accent="text-emerald-700" />
                      <MetricTile value={`${jiraSummary.percent}%`} label="Progress" accent="text-cyan-700" />
                    </>
                  )}
                </div>

                {jiraSummary.briefing ? (
                  <div className={`${subCardClassName} mb-5 flex-1 bg-slate-50/80 p-4`}>
                    <p className="text-sm font-semibold leading-6 text-slateui-900">{jiraSummary.briefing.headline}</p>
                    <SummaryBulletList items={jiraSummary.briefing.summary_points?.slice(0, 3)} className="mt-3" />
                    {jiraSummary.briefing.recommendations?.length ? (
                      <div className="mt-4 border-t border-slate-200 pt-4">
                        <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Rekomendasi</p>
                        <SummaryBulletList items={jiraSummary.briefing.recommendations.slice(0, 2)} bulletTone="text-emerald-600" />
                      </div>
                    ) : null}
                  </div>
                ) : jiraSummary.total === 0 ? (
                  <div className={`${subCardClassName} mb-5 flex flex-1 items-center justify-center p-5 text-sm text-slate-500`}>
                    Belum ada issue Jira yang terdeteksi.
                  </div>
                ) : (
                  <div className={`${subCardClassName} mb-5 flex-1 bg-slate-50/80 p-4`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold text-slateui-900">Ringkasan penyelesaian</p>
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 size={13} />
                        {jiraSummary.done} selesai
                      </span>
                    </div>
                    <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-200">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-500"
                        style={{ width: `${jiraSummary.percent}%` }}
                      />
                    </div>
                    <SummaryBulletList
                      items={jiraSummary.byStatus.slice(0, 3).map((status) => `${status.status}: ${status.count} issue`)}
                    />
                  </div>
                )}

                <div className="mt-auto flex gap-3">
                  <ActionLink to="/workspace/jira" primary>
                    Lihat Jira
                  </ActionLink>
                  <ActionLink
                    to="/chat/supervisor"
                    state={{
                      domain: 'jira',
                      intent: 'generate_report',
                      templatePrompt: 'Buatkan laporan progres Jira hari ini',
                      context: jiraSummary.briefing ? { briefing: jiraSummary.briefing } : { summary: jiraSummary },
                    }}
                  >
                    Buat Report
                  </ActionLink>
                </div>
              </>
            )}
          </article>

          <article className={cardClassName}>
            <CardHeader
              icon={CalendarDays}
              eyebrow="Agenda"
              title="Agenda Hari Ini"
              rightSlot={
                nextEvent && !calendarBriefing ? (
                  <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800">
                    Next: {formatEventTime(nextEvent)}
                  </span>
                ) : null
              }
            />

            {loadingEvents ? (
              <div className="space-y-3">
                <div className="skeleton h-36 rounded-2xl" />
                <div className="skeleton h-16 rounded-2xl" />
                <div className="skeleton h-16 rounded-2xl" />
              </div>
            ) : calendarError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{calendarError}</div>
            ) : calendarBriefing ? (
              <>
                <div className={`${subCardClassName} mb-5 flex-1 bg-slate-50/80 p-4`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getPriorityTone(calendarBriefing.priority)}`}>
                      {formatPriorityLabel(calendarBriefing.priority)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-6 text-slateui-900">{calendarBriefing.headline}</p>
                  <SummaryBulletList items={calendarBriefing.summary_points} className="mt-3" />
                </div>

                <div className="mt-auto flex gap-3">
                  <ActionLink
                    to="/chat/supervisor"
                    primary
                    state={{
                      domain: 'calendar',
                      intent: 'prepare_meeting',
                      templatePrompt: 'Siapkan agenda untuk meeting terdekat',
                      context: { briefing: calendarBriefing },
                    }}
                  >
                    Siapkan Brief
                  </ActionLink>
                  <ActionLink to="/workspace/calendar">Lihat Calendar</ActionLink>
                </div>
              </>
            ) : nextEvents.length === 0 ? (
              <div className={`${subCardClassName} flex flex-1 items-center justify-center p-5 text-sm text-slate-500`}>
                Belum ada event yang akan datang.
              </div>
            ) : (
              <>
                <div className="mb-4 rounded-[1.4rem] border border-cyan-100 bg-gradient-to-br from-cyan-50 via-white to-slate-50 p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
                  <p className="text-lg font-semibold font-headline text-slateui-900">
                    {nextEvent?.summary || 'Tanpa judul'}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                    <span className="inline-flex items-center gap-1.5">
                      <Clock3 size={14} className="text-cyan-700" />
                      {formatEventTime(nextEvent)}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} className="text-cyan-700" />
                      {nextEvent?.start?.dateTime ? 'Terjadwal' : 'All day'}
                    </span>
                  </div>
                </div>

                <div className="mb-5 flex-1 space-y-3">
                  {secondaryEvents.map((event) => (
                    <div key={event.id} className={`${subCardClassName} flex items-start gap-4 p-4`}>
                      <div className="min-w-[64px] text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                        {formatEventTime(event)}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slateui-900">{event.summary || 'Tanpa judul'}</p>
                        <p className="mt-1 text-xs text-slate-500">Kalender utama</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-auto flex gap-3">
                  <ActionLink
                    to="/chat/supervisor"
                    primary
                    state={{
                      domain: 'calendar',
                      intent: 'prepare_meeting',
                      templatePrompt: 'Siapkan agenda untuk meeting terdekat',
                      context: { events: nextEvents.slice(0, 2) },
                    }}
                  >
                    Siapkan Brief
                  </ActionLink>
                  <ActionLink to="/workspace/calendar">Lihat Calendar</ActionLink>
                </div>
              </>
            )}
          </article>

          <article className={cardClassName}>
            <CardHeader
              icon={Mail}
              eyebrow="Comms"
              title="Email Belum Dibaca"
              rightSlot={
                <span className="rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-800">
                  {emailBriefing?.source_metrics?.total_unread || unreadEmails.length || 0} unread
                </span>
              }
            />

            {loadingEmails ? (
              <div className="space-y-3">
                <div className="skeleton h-20 rounded-2xl" />
                <div className="skeleton h-20 rounded-2xl" />
                <div className="skeleton h-20 rounded-2xl" />
              </div>
            ) : emailError ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-5 text-sm text-rose-700">{emailError}</div>
            ) : emailBriefing ? (
              <>
                <div className={`${subCardClassName} mb-5 flex-1 bg-slate-50/80 p-4`}>
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getPriorityTone(emailBriefing.priority)}`}>
                      {formatPriorityLabel(emailBriefing.priority)}
                    </span>
                  </div>
                  <p className="text-sm font-semibold leading-6 text-slateui-900">{emailBriefing.headline}</p>
                  <SummaryBulletList items={emailBriefing.summary_points?.slice(0, 3)} className="mt-3" />
                  {emailBriefing.recommendations?.length ? (
                    <div className="mt-4 rounded-2xl border border-slate-200 bg-white/80 p-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Tindak lanjut</p>
                      <SummaryBulletList items={emailBriefing.recommendations.slice(0, 2)} bulletTone="text-amber-600" />
                    </div>
                  ) : null}
                </div>

                <div className="mt-auto flex gap-3">
                  <ActionLink
                    to="/chat/supervisor"
                    primary
                    icon={Mail}
                    state={{
                      domain: 'email',
                      intent: 'draft_reply',
                      templatePrompt: 'Buatkan draft balasan untuk email penting',
                      context: { briefing: emailBriefing },
                    }}
                  >
                    Draft Reply
                  </ActionLink>
                  <ActionLink to="/workspace/email">Lihat Email</ActionLink>
                </div>
              </>
            ) : unreadEmails.length === 0 ? (
              <div className={`${subCardClassName} flex flex-1 items-center justify-center p-5 text-sm text-slate-500`}>
                Tidak ada email yang belum dibaca.
              </div>
            ) : (
              <>
                <div className="mb-5 flex-1 space-y-3">
                  {unreadEmails.slice(0, 2).map((email, index) => {
                    const from = extractEmailHeader(email, 'From')
                    const subject = extractEmailHeader(email, 'Subject')
                    const senderName = extractSenderName(from)

                    return (
                      <div key={email.id} className={`${subCardClassName} p-4 transition-colors hover:bg-slate-50`}>
                        <div className="mb-2 flex items-start justify-between gap-3">
                          <span className="truncate text-sm font-semibold text-slateui-900">{senderName || 'Pengirim tidak diketahui'}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${index === 0 ? 'bg-rose-50 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                            {index === 0 ? 'Urgent' : 'Unread'}
                          </span>
                        </div>
                        <p className="truncate text-base font-semibold font-headline text-slateui-900">{subject || '(Tanpa subjek)'}</p>
                        <div className="mt-2 flex items-start gap-2 text-xs leading-5 text-slate-500">
                          <Circle size={8} className="mt-1 shrink-0 fill-cyan-600 text-cyan-600" />
                          <span className="line-clamp-2">{email.snippet || 'Ringkasan email belum tersedia.'}</span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                <div className="mt-auto flex gap-3">
                  <ActionLink
                    to="/chat/supervisor"
                    primary
                    icon={Mail}
                    state={{
                      domain: 'email',
                      intent: 'draft_reply',
                      templatePrompt: 'Buatkan draft balasan untuk email penting',
                      context: { emails: unreadEmails.slice(0, 3) },
                    }}
                  >
                    Draft Reply
                  </ActionLink>
                  <ActionLink to="/workspace/email">Lihat Email</ActionLink>
                </div>
              </>
            )}
          </article>

          <article className={cardClassName}>
            <CardHeader
              icon={BarChart3}
              eyebrow="Token Economy"
              title="Penggunaan Token"
            />

            <div className="relative mb-5 overflow-hidden rounded-[1.5rem] border border-slate-200 bg-gradient-to-br from-white via-cyan-50/40 to-slate-50 p-5">
              <div className="pointer-events-none absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-100/60 blur-2xl" />
              <div className="relative">
                <div className="flex items-end gap-2">
                  <span className="text-4xl font-bold font-headline tracking-tight text-slateui-900">842k</span>
                  <span className="pb-1 text-sm font-semibold text-slate-500">/ 1M limit</span>
                </div>
                <p className="mt-2 text-sm text-slate-500">Current billing cycle resets in 12 days.</p>
              </div>
            </div>

            <div className="mb-6 flex-1 space-y-4">
              {[
                { label: 'GPT-4 Turbo (Analysis)', value: 65, tone: 'bg-brand-600' },
                { label: 'Claude 3 (Drafting)', value: 25, tone: 'bg-amber-500' },
                { label: 'Embeddings', value: 10, tone: 'bg-slate-300' },
              ].map((item) => (
                <div key={item.label}>
                  <div className="mb-2 flex items-center justify-between gap-3 text-xs font-semibold">
                    <span className="text-slateui-900">{item.label}</span>
                    <span className="text-slate-500">{item.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-slate-200">
                    <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.value}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto flex gap-3">
              <ActionLink to="/monitoring/tokens" primary icon={ChevronRight}>
                Lihat Detail
              </ActionLink>
              <Link
                to="/chat/supervisor"
                state={{
                  domain: 'operations',
                  intent: 'token_review',
                  templatePrompt: 'Tolong rangkum penggunaan token dan berikan rekomendasi efisiensi.',
                }}
                className="inline-flex items-center gap-2 self-center text-sm font-semibold text-cyan-800 transition-colors hover:text-cyan-900"
              >
                Minta analisis
                <ArrowRight size={14} />
              </Link>
            </div>
          </article>
        </section>
      </div>
    </div>
  )
}
