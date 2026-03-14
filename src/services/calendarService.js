const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_CALENDAR_API_KEY
const GOOGLE_CALENDAR_ID = import.meta.env.VITE_GOOGLE_CALENDAR_ID

const buildCalendarUrl = () => {
  const encodedCalendarId = encodeURIComponent(GOOGLE_CALENDAR_ID || '')
  const timeMin = new Date().toISOString()

  const params = new URLSearchParams({
    key: GOOGLE_API_KEY || '',
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
    timeMin,
  })

  return `https://www.googleapis.com/calendar/v3/calendars/${encodedCalendarId}/events?${params.toString()}`
}

export const calendarApi = {
  fetchCalendarEvents: async () => {
    if (!GOOGLE_API_KEY || !GOOGLE_CALENDAR_ID) {
      throw new Error('Konfigurasi Google Calendar belum lengkap di file .env')
    }

    const response = await fetch(buildCalendarUrl())
    const data = await response.json()

    if (!response.ok) {
      throw new Error(data?.error?.message || 'Gagal mengambil data Google Calendar')
    }

    return data.items || []
  },
}
