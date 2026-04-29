import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Bug, CheckCircle2, Mail, Circle, RefreshCw } from 'lucide-react'
import axios from 'axios'
import { urls } from '../services/api'
import { calendarApi } from '../services/calendarService'
import { jiraApi } from '../services/jiraService'
import { emailApi } from '../services/emailService'

const DONE_STATUS_KEYWORDS = ['done', 'closed', 'resolved', 'complete', 'completed']

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

export default function Dashboard() {
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

  useEffect(() => {
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
  }, [])

  useEffect(() => {
    const loadJiraProgress = async () => {
      setLoadingJira(true)
      setJiraError('')

      try {
        const items = await jiraApi.fetchIssues()
        const safeItems = Array.isArray(items) ? items : []
        setJiraSummary(buildJiraSummary(safeItems))
      } catch (err) {
        console.error('Dashboard Jira error:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setJiraError(err.message || 'Tidak dapat mengambil progres Jira.')
      } finally {
        setLoadingJira(false)
      }
    }

    // Add small delay to ensure session is ready
    const timer = setTimeout(() => {
      loadJiraProgress()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const loadUnreadEmails = async () => {
      setLoadingEmails(true)
      setEmailError('')

      try {
        const response = await emailApi.listEmails({ 
          q: 'is:unread',
          maxResults: 5
        })
        
        // Fetch details for each email
        const emailDetails = await Promise.all(
          (response.messages || []).slice(0, 5).map(async (msg) => {
            try {
              return await emailApi.getEmail(msg.id)
            } catch (err) {
              console.error('Error fetching email detail:', err)
              return null
            }
          })
        )
        
        setUnreadEmails(emailDetails.filter(Boolean))
      } catch (err) {
        console.error('Dashboard Email error:', err)
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        })
        setEmailError(err.message || 'Tidak dapat mengambil email.')
      } finally {
        setLoadingEmails(false)
      }
    }

    // Add small delay to ensure session is ready
    const timer = setTimeout(() => {
      loadUnreadEmails()
    }, 100)

    return () => clearTimeout(timer)
  }, [])

  const handleRefreshBriefings = async () => {
    setRefreshing(true)
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      
      // Get Google access token
      let googleAccessToken = null
      try {
        const tokenResponse = await axios.get(`${backendUrl}/api/google/token`, {
          withCredentials: true,
          timeout: 8000,
        })
        googleAccessToken = tokenResponse.data.access_token || null
        console.log('Google token fetched:', googleAccessToken ? 'Success' : 'Empty')
      } catch (err) {
        console.warn('Could not fetch Google token:', err.response?.data || err.message)
      }

      // Get Jira credentials and create base64 auth
      let jiraAuthBase64 = null
      let jiraSubdomain = null
      try {
        const jiraResponse = await axios.get(`${backendUrl}/api/integrations/jira/n8n-credentials`, {
          withCredentials: true,
          timeout: 8000,
        })
        console.log('Jira credentials response:', jiraResponse.data)
        const jiraCredentials = jiraResponse.data?.jira_credentials
        if (jiraCredentials?.email && jiraCredentials?.api_token) {
          jiraAuthBase64 = btoa(`${jiraCredentials.email}:${jiraCredentials.api_token}`)
          jiraSubdomain = jiraCredentials.subdomain
          console.log('Jira auth base64 created successfully, subdomain:', jiraSubdomain)
        } else {
          console.log('Jira credentials incomplete:', jiraCredentials)
        }
      } catch (err) {
        console.warn('Could not fetch Jira credentials:', err.response?.data || err.message)
      }

      console.log('Sending briefings request with:', {
        hasGoogleToken: !!googleAccessToken,
        hasJiraAuth: !!jiraAuthBase64,
        jiraSubdomain
      })

      // Hit briefings webhook with tokens (using dynamic URL from api.js)
      const briefingsUrl = urls.getBriefings()
      console.log('Briefings webhook URL:', briefingsUrl)
      
      const response = await fetch(briefingsUrl, {
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
        const errorText = await response.text()
        console.error('Briefings webhook error:', errorText)
        throw new Error('Failed to refresh briefings')
      }
      
      const briefingsResult = await response.json()
      console.log('Briefings response:', briefingsResult)
      
      // Update cards with briefings data from the response structure
      const briefings = briefingsResult.briefings || {}
      console.log('Extracted briefings:', briefings)
      
      // Update Jira card with AI summary
      if (briefings.jira) {
        const jiraBriefing = briefings.jira
        console.log('Setting Jira briefing:', jiraBriefing)
        // Use source_metrics to build summary
        const metrics = jiraBriefing.source_metrics || {}
        setJiraSummary({
          total: metrics.total_issues || 0,
          done: 0, // No done count in response, calculate from status
          percent: 0,
          byStatus: [],
          briefing: jiraBriefing // Store full briefing for display
        })
        setLoadingJira(false)
        setJiraError('')
      }
      
      // Update Calendar card with AI summary
      if (briefings.calendar) {
        console.log('Setting Calendar briefing:', briefings.calendar)
        setCalendarBriefing(briefings.calendar)
        setNextEvents([])
        setCalendarError('')
        setLoadingEvents(false)
      }
      
      // Update Email card with AI summary
      if (briefings.email) {
        console.log('Setting Email briefing:', briefings.email)
        setEmailBriefing(briefings.email)
        setUnreadEmails([])
        setEmailError('')
        setLoadingEmails(false)
      }
      
      console.log('Briefings refreshed successfully')
      console.log('Current state:', {
        jiraSummary,
        calendarBriefing,
        emailBriefing
      })
    } catch (err) {
      console.error('Error refreshing briefings:', err)
      alert('Gagal refresh briefings. Silakan coba lagi.')
    } finally {
      setRefreshing(false)
    }
  }

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center justify-between gap-4 mb-2">
          <span className="text-[11px] font-mono text-brand-600 uppercase tracking-[0.24em]">
            Team Assistant Workspace
          </span>
          <button
            onClick={handleRefreshBriefings}
            disabled={refreshing}
            className="inline-flex items-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-1.5 text-xs font-semibold text-cyan-800 transition-colors hover:bg-cyan-100 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing...' : 'Refresh Briefings'}
          </button>
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold font-headline text-slateui-900 leading-tight tracking-tight">
          Selamat datang, <span className="text-cyan-700">Admin</span>
        </h1>
        <p className="text-slateui-500 mt-3 text-sm max-w-2xl leading-relaxed">
          Satu platform terpadu untuk delegasi tugas operasional, akses knowledge base internal, dan manajemen dokumen SOP.
        </p>
      </div>

      {/* 4 Card Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
        {/* Jira Summary Card */}
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Jira Summary</p>
              <h2 className="text-base font-semibold text-slate-900 mt-1">Progres Issue Hari Ini</h2>
            </div>
            <Bug size={18} className="text-cyan-700" />
          </div>

          {loadingJira ? (
            <div className="space-y-2">
              <div className="skeleton h-20 rounded-xl" />
              <div className="skeleton h-14 rounded-xl" />
            </div>
          ) : jiraError ? (
            <p className="text-sm text-rose-600">{jiraError}</p>
          ) : jiraSummary.briefing ? (
            <>
              {/* AI Briefing Display */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    jiraSummary.briefing.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                    jiraSummary.briefing.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {jiraSummary.briefing.priority === 'high' ? '🔴' : 
                     jiraSummary.briefing.priority === 'medium' ? '🟡' : '🟢'}
                    {jiraSummary.briefing.priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-2">{jiraSummary.briefing.headline}</p>
                {jiraSummary.briefing.summary_points && jiraSummary.briefing.summary_points.length > 0 && (
                  <ul className="text-xs text-slate-600 space-y-1 mb-3">
                    {jiraSummary.briefing.summary_points.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {jiraSummary.briefing.recommendations && jiraSummary.briefing.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Rekomendasi:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {jiraSummary.briefing.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/jira"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Jira
                </Link>
                <Link
                  to="/chat/supervisor"
                  state={{
                    domain: 'jira',
                    intent: 'generate_report',
                    templatePrompt: 'Buatkan laporan progres Jira hari ini',
                    context: { briefing: jiraSummary.briefing }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  Buat Report
                </Link>
              </div>
            </>
          ) : jiraSummary.total === 0 ? (
            <p className="text-sm text-slate-500">Belum ada issue Jira yang terdeteksi.</p>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-4">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div className="text-sm font-semibold text-slate-900">
                    {jiraSummary.total} total issue
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 size={13} />
                    {jiraSummary.done} selesai ({jiraSummary.percent}%)
                  </div>
                </div>

                <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-500"
                    style={{ width: `${jiraSummary.percent}%` }}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/jira"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Jira
                </Link>
                <Link
                  to="/chat/supervisor"
                  state={{
                    domain: 'jira',
                    intent: 'generate_report',
                    templatePrompt: 'Buatkan laporan progres Jira hari ini',
                    context: { summary: jiraSummary }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  Buat Report
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Calendar Summary Card */}
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Calendar Summary</p>
              <h2 className="text-base font-semibold text-slate-900 mt-1">Agenda Hari Ini</h2>
            </div>
            <CalendarDays size={18} className="text-cyan-700" />
          </div>

          {loadingEvents ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : calendarError ? (
            <p className="text-sm text-rose-600">{calendarError}</p>
          ) : calendarBriefing ? (
            <>
              {/* AI Briefing Display */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    calendarBriefing.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                    calendarBriefing.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {calendarBriefing.priority === 'high' ? '🔴' : 
                     calendarBriefing.priority === 'medium' ? '🟡' : '🟢'}
                    {calendarBriefing.priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-2">{calendarBriefing.headline}</p>
                {calendarBriefing.summary_points && calendarBriefing.summary_points.length > 0 && (
                  <ul className="text-xs text-slate-600 space-y-1">
                    {calendarBriefing.summary_points.map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/calendar"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Calendar
                </Link>
              </div>
            </>
          ) : nextEvents.length === 0 ? (
            <p className="text-sm text-slate-500">Belum ada event yang akan datang.</p>
          ) : (
            <>
              <div className="space-y-2.5 mb-4">
                {nextEvents.slice(0, 2).map((event) => {
                  const startDate = event.start?.dateTime || event.start?.date
                  const dateObj = startDate ? new Date(startDate) : null
                  const timeText = event.start?.dateTime && dateObj
                    ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                    : 'Seharian'

                  return (
                    <div key={event.id} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                      <p className="text-sm font-semibold text-slate-900 truncate mb-1">{event.summary || 'Tanpa judul'}</p>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <Clock3 size={12} className="text-slate-400" />
                        {timeText}
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/calendar"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Calendar
                </Link>
                <Link
                  to="/chat/supervisor"
                  state={{
                    domain: 'calendar',
                    intent: 'prepare_meeting',
                    templatePrompt: 'Siapkan agenda untuk meeting terdekat',
                    context: { events: nextEvents.slice(0, 2) }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  Siapkan
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Email Summary Card */}
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Summary</p>
              <h2 className="text-base font-semibold text-slate-900 mt-1">Email Belum Dibaca</h2>
            </div>
            <Mail size={18} className="text-cyan-700" />
          </div>

          {loadingEmails ? (
            <div className="space-y-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <div key={idx} className="skeleton h-16 rounded-xl" />
              ))}
            </div>
          ) : emailError ? (
            <p className="text-sm text-rose-600">{emailError}</p>
          ) : emailBriefing ? (
            <>
              {/* AI Briefing Display */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 mb-3">
                <div className="flex items-start gap-2 mb-2">
                  <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                    emailBriefing.priority === 'high' ? 'bg-rose-100 text-rose-700' :
                    emailBriefing.priority === 'medium' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {emailBriefing.priority === 'high' ? '🔴' : 
                     emailBriefing.priority === 'medium' ? '🟡' : '🟢'}
                    {emailBriefing.priority}
                  </span>
                </div>
                <p className="text-sm font-semibold text-slate-900 mb-2">{emailBriefing.headline}</p>
                {emailBriefing.summary_points && emailBriefing.summary_points.length > 0 && (
                  <ul className="text-xs text-slate-600 space-y-1 mb-3">
                    {emailBriefing.summary_points.slice(0, 3).map((point, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-600 mt-0.5">•</span>
                        <span>{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
                {emailBriefing.recommendations && emailBriefing.recommendations.length > 0 && (
                  <div className="pt-2 border-t border-slate-200">
                    <p className="text-xs font-semibold text-slate-700 mb-1">Rekomendasi:</p>
                    <ul className="text-xs text-slate-600 space-y-1">
                      {emailBriefing.recommendations.slice(0, 2).map((rec, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-600 mt-0.5">→</span>
                          <span>{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/email"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Email
                </Link>
                <Link
                  to="/chat/supervisor"
                  state={{
                    domain: 'email',
                    intent: 'draft_reply',
                    templatePrompt: 'Buatkan draft balasan untuk email penting',
                    context: { briefing: emailBriefing }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  Draft Reply
                </Link>
              </div>
            </>
          ) : unreadEmails.length === 0 ? (
            <p className="text-sm text-slate-500">Tidak ada email yang belum dibaca.</p>
          ) : (
            <>
              <div className="space-y-2.5 mb-4">
                {unreadEmails.slice(0, 3).map((email) => {
                  const getHeader = (name) => {
                    const header = email.payload?.headers?.find(h => h.name.toLowerCase() === name.toLowerCase())
                    return header?.value || ''
                  }

                  const from = getHeader('From')
                  const subject = getHeader('Subject')
                  const senderName = from.match(/^([^<]+)/) ? from.match(/^([^<]+)/)[1].trim() : from

                  return (
                    <div key={email.id} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                      <div className="flex items-start gap-2">
                        <div className="mt-1 shrink-0">
                          <Circle size={8} className="text-cyan-600 fill-cyan-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-slate-900 truncate mb-1">{subject || '(Tanpa subjek)'}</p>
                          <span className="text-xs text-slate-500 truncate">{senderName}</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Link
                  to="/workspace/email"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                >
                  Lihat Email
                </Link>
                <Link
                  to="/chat/supervisor"
                  state={{
                    domain: 'email',
                    intent: 'draft_reply',
                    templatePrompt: 'Buatkan draft balasan untuk email penting',
                    context: { emails: unreadEmails.slice(0, 3) }
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-cyan-200 bg-cyan-50 px-3 py-2 text-sm font-semibold text-cyan-800 transition-colors hover:bg-cyan-100"
                >
                  Draft Reply
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Token Usage Card */}
        <div className="panel p-5">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Token Usage</p>
              <h2 className="text-base font-semibold text-slate-900 mt-1">Penggunaan Hari Ini</h2>
            </div>
            <RefreshCw size={18} className="text-cyan-700" />
          </div>

          <div className="space-y-3 mb-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <p className="text-xs text-slate-500 mb-1">Total Token</p>
              <p className="text-2xl font-bold text-slate-900">-</p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
              <p className="text-xs text-slate-500 mb-1">Workflow Terbanyak</p>
              <p className="text-sm font-semibold text-slate-900">-</p>
            </div>
          </div>

          <Link
            to="/monitoring"
            className="w-full inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50"
          >
            Lihat Detail
          </Link>
        </div>
      </div>
    </div>
  )
}
