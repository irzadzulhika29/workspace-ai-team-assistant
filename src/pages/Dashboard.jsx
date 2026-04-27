import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, Bug, CheckCircle2, Mail, Circle, RefreshCw } from 'lucide-react'
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

  return (
    <div className="p-5 md:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-brand-600 uppercase tracking-[0.24em]">
            Team Assistant Workspace
          </span>
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

      <div className="mt-8 p-5 panel-muted">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Panduan Cepat</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-cyan-600 rounded-full mt-2 flex-shrink-0" />
            Gunakan <strong>Settings</strong> di sidebar untuk mengubah URL webhook n8n tanpa perlu rebuild.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-slate-600 rounded-full mt-2 flex-shrink-0" />
            Upload dokumen SOP ke folder <strong>Input (SOP)</strong> agar bisa digunakan oleh Knowledge Agent.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full mt-2 flex-shrink-0" />
            Riwayat chat tersimpan selama sesi aktif browser. Refresh halaman tidak akan menghapus riwayat percakapan.
          </li>
        </ul>
      </div>
    </div>
  )
}
