import React, { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarDays, Clock, MapPin, RefreshCw, AlertCircle, Users, ExternalLink, Video, FileText, Presentation, Bell, ArrowLeft } from 'lucide-react'
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

const getEventStatus = (event) => {
  const now = new Date()
  const start = new Date(event.start?.dateTime || event.start?.date)
  const end = new Date(event.end?.dateTime || event.end?.date)
  
  if (now >= start && now <= end) return 'ongoing'
  if (now < start) return 'upcoming'
  return 'past'
}

const isToday = (date) => {
  const today = new Date()
  const eventDate = new Date(date)
  return eventDate.toDateString() === today.toDateString()
}

const isTomorrow = (date) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const eventDate = new Date(date)
  return eventDate.toDateString() === tomorrow.toDateString()
}

const getEventGroup = (event) => {
  const startDate = event.start?.dateTime || event.start?.date
  if (!startDate) return 'later'
  
  if (isToday(startDate)) return 'today'
  if (isTomorrow(startDate)) return 'tomorrow'
  
  const eventDate = new Date(startDate)
  const today = new Date()
  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))
  
  if (diffDays <= 7) return 'thisWeek'
  return 'later'
}

export default function CalendarPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [aiSummary, setAiSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [customRequest, setCustomRequest] = useState('')
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  const loadEvents = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const { items, aiSummary: summary } = await calendarApi.fetchCalendarEvents()
      setEvents(items)
      setAiSummary(summary)
    } catch (err) {
      setError(err.message || 'Tidak dapat mengambil jadwal kalender.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const todayEvents = events.filter(e => getEventGroup(e) === 'today')
  const upcomingEvents = events.filter(e => getEventGroup(e) !== 'today')
  
  const nextEvent = todayEvents.find(e => getEventStatus(e) === 'upcoming') || todayEvents[0]
  const hasConflicts = aiSummary?.source_metrics?.has_conflict || false
  
  const handleEventSelect = (event) => {
    setSelectedEvent(event)
    // Only toggle mobile detail view on mobile
    if (window.innerWidth < 1024) { // lg breakpoint
      setShowMobileDetail(true)
    }
  }
  
  const handleBackToList = () => {
    setShowMobileDetail(false)
  }
  
  const handleQuickAction = (action, event) => {
    // Format event details
    const startDate = event.start?.dateTime || event.start?.date
    const endDate = event.end?.dateTime || event.end?.date
    const formattedStart = startDate ? formatDateTime(event.start?.dateTime, event.start?.date) : '-'
    const formattedEnd = endDate ? formatDateTime(event.end?.dateTime, event.end?.date) : '-'
    
    // Format attendees list
    let attendeesText = ''
    if (event.attendees && event.attendees.length > 0) {
      const attendeesList = event.attendees.map(a => a.email).join(', ')
      attendeesText = `\nPeserta: ${attendeesList}`
    }
    
    const eventDetails = `Event: ${event.summary || 'Tanpa judul'}
Waktu: ${formattedStart} - ${formattedEnd}${event.location ? `
Lokasi: ${event.location}` : ''}${attendeesText}${event.description ? `
Deskripsi: ${event.description}` : ''}${event.hangoutLink ? `
Google Meet: ${event.hangoutLink}` : ''}`

    const prompts = {
      agenda: `Buatkan agenda meeting untuk event berikut:\n\n${eventDetails}`,
      slides: `Buatkan slides presentasi untuk event berikut:\n\n${eventDetails}`,
      report: `Buatkan laporan untuk event berikut:\n\n${eventDetails}`,
      followup: `Buatkan email follow-up untuk event berikut:\n\n${eventDetails}`,
    }
    
    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: prompts[action],
        preFillOnly: true, // Pre-fill the input field, don't auto-send
      }
    })
  }
  
  const handleCustomRequest = () => {
    if (!customRequest.trim() || !selectedEvent) return
    
    // Format event details
    const startDate = selectedEvent.start?.dateTime || selectedEvent.start?.date
    const endDate = selectedEvent.end?.dateTime || selectedEvent.end?.date
    const formattedStart = startDate ? formatDateTime(selectedEvent.start?.dateTime, selectedEvent.start?.date) : '-'
    const formattedEnd = endDate ? formatDateTime(selectedEvent.end?.dateTime, selectedEvent.end?.date) : '-'
    
    // Format attendees list
    let attendeesText = ''
    if (selectedEvent.attendees && selectedEvent.attendees.length > 0) {
      const attendeesList = selectedEvent.attendees.map(a => a.email).join(', ')
      attendeesText = `\nPeserta: ${attendeesList}`
    }
    
    const eventDetails = `Event: ${selectedEvent.summary || 'Tanpa judul'}
Waktu: ${formattedStart} - ${formattedEnd}${selectedEvent.location ? `
Lokasi: ${selectedEvent.location}` : ''}${attendeesText}${selectedEvent.description ? `
Deskripsi: ${selectedEvent.description}` : ''}${selectedEvent.hangoutLink ? `
Google Meet: ${selectedEvent.hangoutLink}` : ''}`

    const fullPrompt = `${customRequest}\n\nDetail event:\n${eventDetails}`
    
    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: fullPrompt,
        preFillOnly: true, // Pre-fill the input field, don't auto-send
      }
    })
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-slate-200 bg-white px-5 md:px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-1">
              Calendar Workspace
            </p>
            <h1 className="text-xl md:text-2xl font-semibold text-slate-900 flex items-center gap-2">
              <CalendarDays size={22} className="text-cyan-700" />
              Jadwal Kalender
            </h1>
          </div>
          <button
            onClick={loadEvents}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memuat...' : 'Refresh'}
          </button>
        </div>
        
        {error && (
          <div className="mt-3 rounded-lg border border-rose-200 bg-rose-50 text-rose-700 px-3 py-2 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* 3-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - AI Summary */}
        <div className="hidden lg:block w-[25%] border-r border-slate-200 bg-slate-50 overflow-y-auto custom-scrollbar">
          <div className="p-4 space-y-4 min-h-screen">
            {/* AI Summary Card */}
            <div className="panel p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <CalendarDays size={16} className="text-cyan-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Summary</p>
                </div>
              </div>
              
              {loading ? (
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ) : aiSummary ? (
                <div className="space-y-3">
                  {/* Headline */}
                  {aiSummary.headline && (
                    <p className="text-sm font-semibold text-slate-900">
                      {aiSummary.headline}
                    </p>
                  )}
                  
                  {/* Summary Points */}
                  {aiSummary.summary_points && aiSummary.summary_points.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {aiSummary.summary_points.map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {/* Conflict Status */}
                  {hasConflicts ? (
                    <p className="text-amber-700 flex items-center gap-1.5 text-sm">
                      <AlertCircle size={14} />
                      Ada konflik jadwal
                    </p>
                  ) : (
                    <p className="text-emerald-700 text-sm">Tidak ada konflik jadwal</p>
                  )}
                  
                  {/* Recommendations */}
                  {aiSummary.recommendations && aiSummary.recommendations.length > 0 && (
                    <div className="pt-2 border-t border-slate-200">
                      <p className="text-xs font-semibold text-slate-600 mb-1.5">Rekomendasi:</p>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {aiSummary.recommendations.map((rec, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-cyan-500 mt-0.5">→</span>
                            <span>{rec}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">{todayEvents.length}</span> event hari ini
                  </p>
                  {nextEvent && (
                    <p className="text-slate-600">
                      Terdekat: <span className="font-medium text-slate-900">{nextEvent.summary}</span>
                    </p>
                  )}
                  {hasConflicts ? (
                    <p className="text-amber-700 flex items-center gap-1.5">
                      <AlertCircle size={14} />
                      Ada konflik jadwal
                    </p>
                  ) : (
                    <p className="text-emerald-700">Tidak ada konflik jadwal</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Center Panel - Event List */}
        <div className={`w-full lg:w-[35%] border-r border-slate-200 bg-white overflow-y-auto custom-scrollbar ${showMobileDetail ? 'hidden' : 'block'}`}>
          <div className="p-4 space-y-5 min-h-screen">
            {/* AI Summary Card - Mobile Only */}
            <div className="lg:hidden panel p-4 bg-slate-50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-100 flex items-center justify-center">
                  <CalendarDays size={16} className="text-cyan-700" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">AI Summary</p>
                </div>
              </div>
              
              {loading ? (
                <div className="space-y-2">
                  <div className="skeleton h-4 w-3/4" />
                  <div className="skeleton h-4 w-1/2" />
                </div>
              ) : aiSummary ? (
                <div className="space-y-3">
                  {aiSummary.headline && (
                    <p className="text-sm font-semibold text-slate-900">
                      {aiSummary.headline}
                    </p>
                  )}
                  
                  {aiSummary.summary_points && aiSummary.summary_points.length > 0 && (
                    <ul className="space-y-1.5 text-sm text-slate-700">
                      {aiSummary.summary_points.slice(0, 3).map((point, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-cyan-600 mt-1">•</span>
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  
                  {hasConflicts ? (
                    <p className="text-amber-700 flex items-center gap-1.5 text-sm">
                      <AlertCircle size={14} />
                      Ada konflik jadwal
                    </p>
                  ) : (
                    <p className="text-emerald-700 text-sm">Tidak ada konflik jadwal</p>
                  )}
                </div>
              ) : (
                <div className="space-y-2 text-sm">
                  <p className="text-slate-700">
                    <span className="font-semibold text-slate-900">{todayEvents.length}</span> event hari ini
                  </p>
                  {nextEvent && (
                    <p className="text-slate-600">
                      Terdekat: <span className="font-medium text-slate-900">{nextEvent.summary}</span>
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Today Events */}
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                Hari Ini
              </h2>
              
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="skeleton h-20 rounded-lg" />
                  ))}
                </div>
              ) : todayEvents.length === 0 ? (
                <div className="panel p-4 text-center">
                  <p className="text-sm text-slate-500">Tidak ada event hari ini</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map((event) => {
                    const status = getEventStatus(event)
                    const startDate = event.start?.dateTime || event.start?.date
                    const dateObj = startDate ? new Date(startDate) : null
                    const timeText = event.start?.dateTime && dateObj
                      ? dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                      : 'Seharian'
                    
                    const isSelected = selectedEvent?.id === event.id
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className={`w-full text-left rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                            : status === 'ongoing'
                            ? 'border-emerald-300 bg-emerald-50 hover:border-emerald-400'
                            : status === 'past'
                            ? 'border-slate-200 bg-slate-50 opacity-60'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <Clock size={14} className={`mt-0.5 flex-shrink-0 ${
                            status === 'ongoing' ? 'text-emerald-600' : 'text-slate-400'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {event.summary || 'Tanpa judul'}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">{timeText}</p>
                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {status === 'ongoing' && (
                                <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                                  Sedang Berlangsung
                                </span>
                              )}
                              {event.hangoutLink && (
                                <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200">
                                  Has Meet
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <div>
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 px-1">
                  Mendatang
                </h2>
                
                <div className="space-y-2">
                  {upcomingEvents.slice(0, 10).map((event) => {
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
                    
                    const isSelected = selectedEvent?.id === event.id
                    
                    return (
                      <button
                        key={event.id}
                        onClick={() => handleEventSelect(event)}
                        className={`w-full text-left rounded-lg border p-3 transition-all ${
                          isSelected
                            ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {event.summary || 'Tanpa judul'}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">
                          {dateText}, {timeText}
                        </p>
                        {event.hangoutLink && (
                          <span className="inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 border border-blue-200 mt-2">
                            Has Meet
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Event Detail */}
        <div className={`w-full lg:w-[40%] bg-white overflow-y-auto custom-scrollbar ${showMobileDetail ? 'block' : 'hidden lg:block'}`}>
          {selectedEvent ? (
            <div className="p-5 md:p-6 space-y-6 min-h-screen">
              {/* Mobile Back Button */}
              <button
                onClick={handleBackToList}
                className="lg:hidden inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-2"
              >
                <ArrowLeft size={16} />
                Kembali ke daftar
              </button>

              {/* Event Detail Header */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold text-slate-900">
                    {selectedEvent.summary || 'Tanpa judul'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    {formatDateTime(selectedEvent.start?.dateTime, selectedEvent.start?.date)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {selectedEvent.location && (
                    <div className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                      <MapPin size={13} className="text-slate-400" />
                      {selectedEvent.location}
                    </div>
                  )}
                  {selectedEvent.hangoutLink && (
                    <a
                      href={selectedEvent.hangoutLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
                    >
                      <Video size={13} />
                      Join Meeting
                      <ExternalLink size={11} />
                    </a>
                  )}
                </div>
              </div>

              {/* Attendees List */}
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="panel p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Users size={14} className="text-slate-500" />
                    <h3 className="text-sm font-semibold text-slate-700">
                      Peserta ({selectedEvent.attendees.length})
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {selectedEvent.attendees.map((attendee, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                          {attendee.email?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-slate-700 truncate">{attendee.email}</p>
                          {attendee.displayName && (
                            <p className="text-xs text-slate-500 truncate">{attendee.displayName}</p>
                          )}
                        </div>
                        {attendee.responseStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            attendee.responseStatus === 'accepted' 
                              ? 'bg-emerald-100 text-emerald-700'
                              : attendee.responseStatus === 'declined'
                              ? 'bg-rose-100 text-rose-700'
                              : attendee.responseStatus === 'tentative'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {attendee.responseStatus === 'accepted' ? 'Hadir' 
                              : attendee.responseStatus === 'declined' ? 'Tidak hadir'
                              : attendee.responseStatus === 'tentative' ? 'Mungkin'
                              : 'Belum konfirmasi'}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Event Summary */}
              <div className="panel p-4">
                <h3 className="text-sm font-semibold text-slate-700 mb-2">Event Summary</h3>
                {selectedEvent.description ? (
                  <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                    {selectedEvent.description}
                  </p>
                ) : (
                  <p className="text-sm text-slate-500 italic">
                    Belum ada deskripsi detail. AI bisa bantu membuat agenda atau preparation brief berdasarkan judul dan peserta.
                  </p>
                )}
              </div>

              {/* Quick Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleQuickAction('agenda', selectedEvent)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText size={14} />
                    Prepare Agenda
                  </button>
                  <button
                    onClick={() => handleQuickAction('slides', selectedEvent)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Presentation size={14} />
                    Generate Slides
                  </button>
                  <button
                    onClick={() => handleQuickAction('report', selectedEvent)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <FileText size={14} />
                    Generate Report
                  </button>
                  <button
                    onClick={() => handleQuickAction('reminder', selectedEvent)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <Bell size={14} />
                    Draft Reminder
                  </button>
                </div>
              </div>

              {/* Custom Request Input */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Custom Request</h3>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customRequest}
                    onChange={(e) => setCustomRequest(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleCustomRequest()
                      }
                    }}
                    placeholder="Minta AI membuat output dari event ini..."
                    className="flex-1 px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleCustomRequest}
                    disabled={!customRequest.trim()}
                    className="px-4 py-2.5 rounded-lg bg-cyan-700 text-white text-sm font-medium hover:bg-cyan-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Kirim
                  </button>
                </div>
                  <p className="text-xs text-slate-500 mt-2">
                    Contoh: &quot;buat slides sprint review&quot;, &quot;buat laporan blocker&quot;, &quot;buat notes template&quot;
                  </p>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-screen flex items-center justify-center p-8">
              <div className="text-center">
                <CalendarDays size={48} className="mx-auto text-slate-300 mb-4" />
                <p className="text-base font-medium text-slate-700">Pilih event dari daftar</p>
                <p className="text-sm text-slate-500 mt-1">untuk melihat detail dan action</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
