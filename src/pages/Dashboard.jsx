import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { MessageSquare, Brain, FolderOpen, ArrowRight, Zap, Database, FileStack, CalendarDays, Clock3, MapPin } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { useChatStore } from '../store/chatStore'
import { calendarApi } from '../services/calendarService'

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

export default function Dashboard() {
  const { supervisorMessages, knowledgeMessages } = useChatStore(
    (state) => ({
      supervisorMessages: state.supervisorMessages,
      knowledgeMessages: state.knowledgeMessages,
    }),
    shallow,
  )

  const stats = [
    { label: 'Pesan Supervisor',  value: supervisorMessages.length },
    { label: 'Pesan Knowledge',   value: knowledgeMessages.length  },
  ]

  const [nextEvents, setNextEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [calendarError, setCalendarError] = useState('')

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

      <div className="panel-muted p-4 md:p-5 mb-7">
        <div className="flex flex-wrap items-center gap-6">
          {stats.map(({ label, value, valueClass = 'text-slate-900' }) => (
            <div key={label} className="flex flex-col">
              <span className={`text-2xl font-semibold font-mono tracking-tight ${valueClass}`}>{value}</span>
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
          <div className="ml-auto text-xs text-slate-500 font-mono">
            {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
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
