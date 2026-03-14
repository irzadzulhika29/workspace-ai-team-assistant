import { useCallback, useEffect, useState } from 'react'
import { CalendarDays, Clock3, MapPin, RefreshCw, AlertCircle } from 'lucide-react'
import { calendarApi } from '../services/calendarService'

const formatDateTime = (dateTime, fallbackDate) => {
  const value = dateTime || fallbackDate
  if (!value) return '-'

  const date = new Date(value)

  if (dateTime) {
    return date.toLocaleString('id-ID', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return date.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function CalendarPage() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const items = await calendarApi.fetchCalendarEvents()
      setEvents(items)
    } catch (err) {
      setError(err.message || 'Tidak dapat mengambil jadwal kalender.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
              Google Calendar Workspace
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight flex items-center gap-2">
              <CalendarDays size={24} className="text-cyan-700" />
              Jadwal Kalender Tim
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Menampilkan event terdekat dari Google Calendar kamu.
            </p>
          </div>

          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memuat...' : 'Refresh Jadwal'}
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
                <div key={idx} className="skeleton h-20 rounded-xl" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-14 px-4">
              <CalendarDays size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">Belum ada event yang akan datang.</p>
              <p className="text-xs text-slate-500 mt-1">Coba cek kembali beberapa saat lagi.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {events.map((event) => {
                const isAllDay = Boolean(event.start?.date)
                const startDate = event.start?.dateTime || event.start?.date
                const dateObj = startDate ? new Date(startDate) : new Date()
                const monthName = dateObj.toLocaleDateString('id-ID', { month: 'short' })
                const dayNumber = dateObj.toLocaleDateString('id-ID', { day: '2-digit' })
                const timeString = event.start?.dateTime 
                  ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                  : 'Seharian'

                return (
                  <div
                    key={event.id}
                    className="flex flex-row gap-4 rounded-xl border border-slate-200 bg-white p-4 md:p-5 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    {/* Calendar Date Badge */}
                    <div className="flex flex-col items-center justify-center w-14 h-16 rounded-lg border border-slate-200 bg-slate-50 overflow-hidden shrink-0 shadow-sm">
                      <div className="bg-cyan-700 text-white text-[10px] font-bold uppercase w-full text-center py-1 tracking-wider">
                        {monthName}
                      </div>
                      <div className="flex-1 flex items-center justify-center text-xl font-bold text-slate-700 w-full bg-white">
                        {dayNumber}
                      </div>
                    </div>

                    {/* Event Details */}
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-2 md:gap-4">
                        <div className="min-w-0">
                          <h3 className="text-sm md:text-base font-semibold text-slate-900 truncate">
                            {event.summary || 'Tanpa judul'}
                          </h3>
                          {event.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-1 md:line-clamp-2">
                              {event.description}
                            </p>
                          )}
                        </div>
                        {isAllDay && (
                          <span className="shrink-0 inline-flex items-center w-fit text-[10px] font-medium px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-100">
                            Full Day
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 md:mt-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1.5">
                          <Clock3 size={13} className="text-slate-400" />
                          <span>{timeString}</span>
                        </span>
                        <span className="flex items-center gap-1.5 min-w-0">
                          <MapPin size={13} className="text-slate-400 shrink-0" />
                          <span className="truncate">{event.location || 'Lokasi tidak dicantumkan'}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
