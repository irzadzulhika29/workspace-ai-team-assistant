import React from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock3, MapPin } from 'lucide-react'

const formatEventDate = (event) => {
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

  return { dateText, timeText }
}

export default function CalendarSummaryCard({ events, loading, error }) {
  return (
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

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="skeleton h-16 rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : events.length === 0 ? (
        <p className="text-sm text-slate-500">Belum ada event yang akan datang.</p>
      ) : (
        <div className="space-y-2.5">
          {events.map((event) => {
            const { dateText, timeText } = formatEventDate(event)

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
  )
}
