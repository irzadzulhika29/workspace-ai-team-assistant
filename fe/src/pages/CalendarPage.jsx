import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Bell,
  CalendarDays,
  Clock,
  ExternalLink,
  FileText,
  MapPin,
  Presentation,
  RefreshCw,
  Sparkles,
  Users,
  Video,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  Alert,
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Input,
} from '@/components/ui'
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

const formatTimeOnly = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date
  if (!startDate) return '-'

  if (!event?.start?.dateTime) return 'Seharian'

  return new Date(startDate).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatShortDate = (event) => {
  const startDate = event?.start?.dateTime || event?.start?.date
  if (!startDate) return '-'

  return new Date(startDate).toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
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
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.ceil((eventDate - today) / (1000 * 60 * 60 * 24))

  if (diffDays <= 7) return 'thisWeek'
  return 'later'
}

const getAttendeeLabel = (attendee) =>
  attendee?.displayName || attendee?.email || 'Participant'

const getInitials = (value) =>
  String(value || 'AI')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

const getResponseBadgeVariant = (responseStatus) => {
  if (responseStatus === 'accepted') return 'success'
  if (responseStatus === 'declined') return 'error'
  if (responseStatus === 'tentative') return 'warning'
  return 'outline'
}

const getResponseLabel = (responseStatus) => {
  if (responseStatus === 'accepted') return 'Hadir'
  if (responseStatus === 'declined') return 'Tidak hadir'
  if (responseStatus === 'tentative') return 'Mungkin'
  return 'Belum konfirmasi'
}

const getStatusBadgeVariant = (status) => {
  if (status === 'ongoing') return 'success'
  if (status === 'upcoming') return 'info'
  return 'outline'
}

const getStatusLabel = (status) => {
  if (status === 'ongoing') return 'Sedang berlangsung'
  if (status === 'upcoming') return 'Akan datang'
  return 'Selesai'
}

const buildEventDetails = (event) => {
  const startDate = event.start?.dateTime || event.start?.date
  const endDate = event.end?.dateTime || event.end?.date
  const formattedStart = startDate
    ? formatDateTime(event.start?.dateTime, event.start?.date)
    : '-'
  const formattedEnd = endDate
    ? formatDateTime(event.end?.dateTime, event.end?.date)
    : '-'

  let attendeesText = ''
  if (event.attendees && event.attendees.length > 0) {
    const attendeesList = event.attendees
      .map((attendee) => attendee.email || attendee.displayName)
      .filter(Boolean)
      .join(', ')
    attendeesText = attendeesList ? `\nPeserta: ${attendeesList}` : ''
  }

  return `Event: ${event.summary || 'Tanpa judul'}
Waktu: ${formattedStart} - ${formattedEnd}${event.location ? `\nLokasi: ${event.location}` : ''}${attendeesText}${event.description ? `\nDeskripsi: ${event.description}` : ''}${event.hangoutLink ? `\nGoogle Meet: ${event.hangoutLink}` : ''}`
}

function SummaryPanel({ loading, aiSummary, hasConflicts, todayEvents, nextEvent }) {
  return (
    <Card className="hover:shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-500">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
              AI Summary
            </p>
            <CardTitle className="mt-1 text-base">Agenda Overview</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="space-y-2">
            <div className="skeleton h-4 w-3/4 rounded-md" />
            <div className="skeleton h-4 w-1/2 rounded-md" />
            <div className="skeleton h-20 rounded-xl" />
          </div>
        ) : aiSummary ? (
          <>
            {aiSummary.headline ? (
              <p className="text-sm font-semibold leading-6 text-neutral-900">
                {aiSummary.headline}
              </p>
            ) : null}

            {aiSummary.summary_points?.length ? (
              <ul className="space-y-2 text-sm text-neutral-600">
                {aiSummary.summary_points.map((point, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="mt-1 text-primary-500">•</span>
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            ) : null}

            <div className="flex flex-wrap gap-2">
              <Badge variant={hasConflicts ? 'warning' : 'success'}>
                {hasConflicts ? 'Ada konflik jadwal' : 'Tidak ada konflik'}
              </Badge>
              <Badge variant="outline">{todayEvents.length} event hari ini</Badge>
            </div>

            {aiSummary.recommendations?.length ? (
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-neutral-400">
                  Rekomendasi
                </p>
                <ul className="space-y-2 text-xs leading-5 text-neutral-600">
                  {aiSummary.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="mt-0.5 text-primary-500">→</span>
                      <span>{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </>
        ) : (
          <div className="space-y-3 text-sm text-neutral-600">
            <p>
              <span className="font-semibold text-neutral-900">{todayEvents.length}</span>{' '}
              event hari ini.
            </p>
            {nextEvent ? (
              <p>
                Terdekat:{' '}
                <span className="font-semibold text-neutral-900">
                  {nextEvent.summary || 'Tanpa judul'}
                </span>
              </p>
            ) : null}
            <Badge variant={hasConflicts ? 'warning' : 'success'}>
              {hasConflicts ? 'Ada konflik jadwal' : 'Tidak ada konflik'}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function EventListCard({
  title,
  items,
  loading,
  emptyText,
  selectedEventId,
  onSelect,
  compactDate = false,
}) {
  return (
    <Card className="hover:shadow-sm">
      <CardHeader className="pb-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-400">
            {title}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="skeleton h-24 rounded-xl" />
          ))
        ) : items.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-8 w-8" />}
            title="Tidak ada event"
            description={emptyText}
            className="px-2 py-8"
          />
        ) : (
          items.map((event) => {
            const status = getEventStatus(event)
            const isSelected = selectedEventId === event.id

            return (
              <button
                key={event.id}
                type="button"
                onClick={() => onSelect(event)}
                className={cn(
                  'w-full rounded-xl border p-4 text-left transition-all',
                  isSelected
                    ? 'border-primary-300 bg-primary-50 shadow-sm'
                    : 'border-neutral-200 bg-white hover:border-primary-200 hover:bg-primary-50/40'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full bg-neutral-100 text-neutral-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="truncate text-sm font-semibold text-neutral-900">
                        {event.summary || 'Tanpa judul'}
                      </p>
                      <Badge variant={getStatusBadgeVariant(status)}>
                        {getStatusLabel(status)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-neutral-500">
                      {compactDate
                        ? `${formatShortDate(event)}, ${formatTimeOnly(event)}`
                        : formatTimeOnly(event)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {event.hangoutLink ? (
                        <Badge variant="info">Has Meet</Badge>
                      ) : null}
                      {event.location ? (
                        <Badge variant="outline">{event.location}</Badge>
                      ) : null}
                    </div>
                  </div>
                </div>
              </button>
            )
          })
        )}
      </CardContent>
    </Card>
  )
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
      setEvents(Array.isArray(items) ? items : [])
      setAiSummary(summary || null)
    } catch (err) {
      setError(err.message || 'Tidak dapat mengambil jadwal kalender.')
      setEvents([])
      setAiSummary(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  useEffect(() => {
    if (!selectedEvent) return

    const nextSelectedEvent = events.find((event) => event.id === selectedEvent.id)
    if (!nextSelectedEvent) {
      setSelectedEvent(null)
      setShowMobileDetail(false)
    } else if (nextSelectedEvent !== selectedEvent) {
      setSelectedEvent(nextSelectedEvent)
    }
  }, [events, selectedEvent])

  const todayEvents = useMemo(
    () => events.filter((event) => getEventGroup(event) === 'today'),
    [events]
  )

  const upcomingEvents = useMemo(
    () =>
      events.filter((event) => {
        const group = getEventGroup(event)
        const status = getEventStatus(event)
        return group !== 'today' && status !== 'past'
      }),
    [events]
  )

  const nextEvent = useMemo(
    () => todayEvents.find((event) => getEventStatus(event) === 'upcoming') || todayEvents[0],
    [todayEvents]
  )

  const hasConflicts = aiSummary?.source_metrics?.has_conflict || false

  const handleEventSelect = (event) => {
    setSelectedEvent(event)

    if (window.innerWidth < 1024) {
      setShowMobileDetail(true)
    }
  }

  const handleBackToList = () => {
    setShowMobileDetail(false)
  }

  const handleQuickAction = (action, event) => {
    const eventDetails = buildEventDetails(event)

    const prompts = {
      agenda: `Buatkan agenda meeting untuk event berikut:\n\n${eventDetails}`,
      slides: `Buatkan slides presentasi untuk event berikut:\n\n${eventDetails}`,
      report: `Buatkan laporan untuk event berikut:\n\n${eventDetails}`,
      followup: `Buatkan email follow-up untuk event berikut:\n\n${eventDetails}`,
    }

    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: prompts[action],
        preFillOnly: true,
      },
    })
  }

  const handleCustomRequest = () => {
    if (!customRequest.trim() || !selectedEvent) return

    const fullPrompt = `${customRequest}\n\nDetail event:\n${buildEventDetails(selectedEvent)}`

    navigate('/chat/supervisor', {
      state: {
        autoSendMessage: fullPrompt,
        preFillOnly: true,
      },
    })
  }

  return (
    <div className="flex h-full flex-col gap-5 p-5 md:p-6">
      <Card className="hover:shadow-sm">
        <CardHeader className="items-center pb-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-400">
              Calendar Workspace
            </p>
            <CardTitle className="mt-1 flex items-center gap-2 text-2xl">
              <CalendarDays className="h-6 w-6 text-primary-500" />
              Jadwal Kalender
            </CardTitle>
          </div>
          <Button onClick={loadEvents} disabled={loading} variant="primary">
            <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
            {loading ? 'Memuat...' : 'Refresh'}
          </Button>
        </CardHeader>
      </Card>

      {error ? (
        <Alert variant="error" title="Calendar sync error">
          {error}
        </Alert>
      ) : null}

      <div className="flex-1 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,380px)_minmax(0,1fr)] lg:gap-5">
        <div className="hidden lg:block">
          <SummaryPanel
            loading={loading}
            aiSummary={aiSummary}
            hasConflicts={hasConflicts}
            todayEvents={todayEvents}
            nextEvent={nextEvent}
          />
        </div>

        <div className={cn('space-y-5 lg:block', showMobileDetail && 'hidden lg:block')}>
          <div className="lg:hidden">
            <SummaryPanel
              loading={loading}
              aiSummary={aiSummary}
              hasConflicts={hasConflicts}
              todayEvents={todayEvents}
              nextEvent={nextEvent}
            />
          </div>

          <EventListCard
            title="Hari Ini"
            items={todayEvents}
            loading={loading}
            emptyText="Tidak ada event hari ini."
            selectedEventId={selectedEvent?.id}
            onSelect={handleEventSelect}
          />

          <EventListCard
            title="Mendatang"
            items={upcomingEvents.slice(0, 10)}
            loading={loading}
            emptyText="Belum ada event mendatang."
            selectedEventId={selectedEvent?.id}
            onSelect={handleEventSelect}
            compactDate
          />
        </div>

        <div className={cn('mt-5 lg:mt-0', showMobileDetail ? 'block' : 'hidden lg:block')}>
          {selectedEvent ? (
            <div className="space-y-5">
              <Button
                onClick={handleBackToList}
                variant="ghost"
                size="sm"
                className="lg:hidden w-fit px-0 text-neutral-600"
              >
                <ArrowLeft className="h-4 w-4" />
                Kembali ke daftar
              </Button>

              <Card className="hover:shadow-sm">
                <CardHeader className="pb-4">
                  <div>
                    <CardTitle className="text-2xl">
                      {selectedEvent.summary || 'Tanpa judul'}
                    </CardTitle>
                    <p className="mt-2 text-sm text-neutral-500">
                      {formatDateTime(
                        selectedEvent.start?.dateTime,
                        selectedEvent.start?.date
                      )}
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {selectedEvent.location ? (
                      <Badge variant="outline" className="rounded-lg px-3 py-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {selectedEvent.location}
                      </Badge>
                    ) : null}
                    {selectedEvent.hangoutLink ? (
                      <a
                        href={selectedEvent.hangoutLink}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Badge
                          variant="info"
                          className="rounded-lg px-3 py-1.5 hover:opacity-90"
                        >
                          <Video className="h-3.5 w-3.5" />
                          Join Meeting
                          <ExternalLink className="h-3 w-3" />
                        </Badge>
                      </a>
                    ) : null}
                  </div>

                  <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                    <h3 className="text-sm font-semibold text-neutral-700">Event Summary</h3>
                    {selectedEvent.description ? (
                      <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-neutral-600">
                        {selectedEvent.description}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm italic text-neutral-500">
                        Belum ada deskripsi detail. AI bisa bantu membuat agenda atau
                        preparation brief berdasarkan judul dan peserta.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {selectedEvent.attendees?.length ? (
                <Card className="hover:shadow-sm">
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-neutral-500" />
                      <CardTitle className="text-base">
                        Peserta ({selectedEvent.attendees.length})
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <AvatarGroup max={5}>
                      {selectedEvent.attendees.map((attendee, index) => (
                        <Avatar key={`${attendee.email || attendee.displayName || index}`} size="sm">
                          <AvatarFallback>
                            {getInitials(getAttendeeLabel(attendee))}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                    </AvatarGroup>

                    <div className="space-y-3">
                      {selectedEvent.attendees.map((attendee, index) => (
                        <div
                          key={`${attendee.email || attendee.displayName || index}`}
                          className="flex items-center gap-3 rounded-xl border border-neutral-200 bg-white px-3 py-3"
                        >
                          <Avatar size="sm">
                            <AvatarFallback>
                              {getInitials(getAttendeeLabel(attendee))}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium text-neutral-800">
                              {attendee.email || 'Email tidak tersedia'}
                            </p>
                            {attendee.displayName ? (
                              <p className="truncate text-xs text-neutral-500">
                                {attendee.displayName}
                              </p>
                            ) : null}
                          </div>
                          <Badge variant={getResponseBadgeVariant(attendee.responseStatus)}>
                            {getResponseLabel(attendee.responseStatus)}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ) : null}

              <Card className="hover:shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-2">
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('agenda', selectedEvent)}
                  >
                    <FileText className="h-4 w-4" />
                    Prepare Agenda
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('slides', selectedEvent)}
                  >
                    <Presentation className="h-4 w-4" />
                    Generate Slides
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('report', selectedEvent)}
                  >
                    <FileText className="h-4 w-4" />
                    Generate Report
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleQuickAction('followup', selectedEvent)}
                  >
                    <Bell className="h-4 w-4" />
                    Draft Reminder
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base">Custom Request</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <Input
                      value={customRequest}
                      onChange={(event) => setCustomRequest(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' && !event.shiftKey) {
                          event.preventDefault()
                          handleCustomRequest()
                        }
                      }}
                      placeholder="Minta AI membuat output dari event ini..."
                      className="flex-1 rounded-xl"
                    />
                    <Button onClick={handleCustomRequest} disabled={!customRequest.trim()}>
                      Kirim
                    </Button>
                  </div>
                  <p className="text-xs text-neutral-500">
                    Contoh: &quot;buat slides sprint review&quot;, &quot;buat laporan
                    blocker&quot;, &quot;buat notes template&quot;
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="flex min-h-[420px] items-center justify-center hover:shadow-sm">
              <EmptyState
                icon={<CalendarDays className="h-12 w-12" />}
                title="Pilih event dari daftar"
                description="Buka salah satu event untuk melihat detail, peserta, dan quick action ke Supervisor."
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
