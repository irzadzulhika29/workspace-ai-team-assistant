import axios from 'axios'
import { urls } from './api'

const buildCalendarParams = () => {
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - 30)
  startDate.setHours(0, 0, 0, 0)
  
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 90)
  endDate.setHours(23, 59, 59, 999)
  
  return {
    calendarId: 'primary',
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '250',
    timeMin: startDate.toISOString(),
    timeMax: endDate.toISOString(),
  }
}

export const calendarApi = {
  fetchCalendarEvents: async () => {
    let accessToken = null
    try {
      const tokenResponse = await axios.get(`${urls.getBackendUrl()}/api/google/token`, {
        withCredentials: true,
        timeout: 5_000,
      })
      accessToken = tokenResponse.data?.access_token
    } catch {
      // ignore
    }

    const [eventsResponse, summaryResponse] = await Promise.all([
      axios.get(`${urls.getBackendUrl()}/api/google/calendar`, {
        params: buildCalendarParams(),
        withCredentials: true,
        timeout: 15_000,
      }),
      accessToken ? axios.post(urls.getCalendar(), {
        access_token: accessToken,
        timestamp: new Date().toISOString(),
      }, {
        timeout: 5_000,
      }).catch(() => {
        return null
      }) : Promise.resolve(null)
    ])

    return {
      items: eventsResponse.data?.items || [],
      aiSummary: summaryResponse?.data?.summary || null
    }
  },

  createCalendarEvent: async (payload) => {
    const response = await axios.post(
      `${urls.getBackendUrl()}/api/google/calendar`,
      payload,
      {
        withCredentials: true,
        timeout: 15_000,
      }
    )

    return response.data
  },

  deleteCalendarEvent: async (eventId, calendarId = 'primary') => {
    const response = await axios.delete(
      `${urls.getBackendUrl()}/api/google/calendar/${encodeURIComponent(eventId)}`,
      {
        params: { calendarId },
        withCredentials: true,
        timeout: 15_000,
      }
    )

    return response.data
  },
}
