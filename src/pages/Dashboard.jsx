import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Brain, FolderOpen, ArrowRight, Zap, Database, FileStack, CalendarDays, Clock3, MapPin, Bug, CheckCircle2 } from 'lucide-react'
import { calendarApi } from '../services/calendarService'
import { jiraApi } from '../services/jiraService'

const CARDS = [
  {
    to:      '/chat/supervisor',
    icon:    MessageSquare,
    title:   'Supervisor Agent',
    desc:    'Delegasikan tugas Jira, Google Calendar, dan operasional ke AI secara otomatis.',
    tone:    'text-cyan-700 bg-cyan-50 border-cyan-100',
    accent:  Zap,
  },
  {
    to:      '/chat/knowledge',
    icon:    Brain,
    title:   'Knowledge Agent',
    desc:    'Tanya jawab berbasis dokumen SOP internal dengan sitasi halaman yang bisa diverifikasi.',
    tone:    'text-slate-700 bg-slate-100 border-slate-200',
    accent:  Database,
  },
  {
    to:      '/workspace/files',
    icon:    FolderOpen,
    title:   'Document Workspace',
    desc:    'Upload SOP, kelola laporan AI, dan atur folder dokumen referensi tim.',
    tone:    'text-emerald-700 bg-emerald-50 border-emerald-100',
    accent:  FileStack,
  },
]

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
        setJiraError(err.message || 'Tidak dapat mengambil progres Jira.')
      } finally {
        setLoadingJira(false)
      }
    }

    loadJiraProgress()
  }, [])

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.24em]">
            Team Assistant Workspace
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
          Selamat datang, <span className="text-cyan-700">Admin</span>
        </h1>
        <p className="text-slate-500 mt-3 text-sm max-w-2xl leading-relaxed">
          Satu platform terpadu untuk delegasi tugas operasional, akses knowledge base internal, dan manajemen dokumen SOP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {CARDS.map(({ to, icon: Icon, title, desc, tone, accent: Accent }) => (
          <Link
            key={to}
            to={to}
            className={`
              group relative flex flex-col gap-4 p-5 rounded-2xl border border-slate-200 bg-white
              hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md
              transition-all duration-200 overflow-hidden
            `}
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${tone}`}>
              <Icon size={18} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 mb-1.5">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 mt-auto">
              <span>Buka workspace</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>

            <Accent
              size={44}
              className="absolute -bottom-2 -right-2 opacity-[0.08] text-slate-700"
            />
          </Link>
        ))}
      </div>

      <div className="mt-8 panel p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ringkasan Calendar</p>
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mt-1">3 Event Terdekat</h2>
          </div>
          <Link to="/workspace/calendar" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">
            Lihat semua
          </Link>
        </div>

        {loadingEvents ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, idx) => (
              <div key={idx} className="skeleton h-16 rounded-xl" />
            ))}
          </div>
        ) : calendarError ? (
          <p className="text-sm text-rose-600">{calendarError}</p>
        ) : nextEvents.length === 0 ? (
          <p className="text-sm text-slate-500">Belum ada event yang akan datang.</p>
        ) : (
          <div className="space-y-2.5">
            {nextEvents.map((event) => {
              const startDate = event.start?.dateTime || event.start?.date
              const dateObj = startDate ? new Date(startDate) : null
              const dateText = dateObj
                ? dateObj.toLocaleDateString('id-ID', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })
                : '-'
              const timeText = event.start?.dateTime && dateObj
                ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                : 'Seharian'

              return (
                <div key={event.id} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                  <div className="flex items-start gap-2">
                    <CalendarDays size={15} className="text-cyan-700 mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-slate-900 truncate">{event.summary || 'Tanpa judul'}</p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <Clock3 size={12} className="text-slate-400" />
                          {dateText}, {timeText}
                        </span>
                        <span className="inline-flex items-center gap-1 min-w-0">
                          <MapPin size={12} className="text-slate-400 shrink-0" />
                          <span className="truncate">{event.location || 'Lokasi tidak dicantumkan'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="mt-8 panel p-4 md:p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ringkasan Jira</p>
            <h2 className="text-sm md:text-base font-semibold text-slate-900 mt-1">Progres Penyelesaian Issue</h2>
          </div>
          <Link to="/workspace/jira" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">
            Lihat detail
          </Link>
        </div>

        {loadingJira ? (
          <div className="space-y-2">
            <div className="skeleton h-20 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
            <div className="skeleton h-14 rounded-xl" />
          </div>
        ) : jiraError ? (
          <p className="text-sm text-rose-600">{jiraError}</p>
        ) : jiraSummary.total === 0 ? (
          <p className="text-sm text-slate-500">Belum ada issue Jira yang terdeteksi.</p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <Bug size={15} className="text-cyan-700" />
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

            <div className="space-y-2.5">
              {jiraSummary.byStatus.slice(0, 5).map(({ status, count }) => {
                const statusPercent = Math.round((count / jiraSummary.total) * 100)

                return (
                  <div key={status} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                    <div className="flex items-center justify-between gap-3 text-xs mb-2">
                      <span className="font-medium text-slate-700">{status}</span>
                      <span className="font-mono text-slate-500">{count} issue</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full bg-cyan-500/70"
                        style={{ width: `${statusPercent}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
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
