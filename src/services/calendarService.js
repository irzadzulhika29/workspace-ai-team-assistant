import axios from 'axios'
import { urls } from './api'

const buildCalendarParams = () => {
  // Get start of today in local timezone
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  // Get end date (7 days from now)
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 7)
  endDate.setHours(23, 59, 59, 999)
  
  return {
    calendarId: 'primary',
    singleEvents: 'true',
    orderBy: 'startTime',
    maxResults: '50',
    timeMin: today.toISOString(),
    timeMax: endDate.toISOString(),
  }
}

export const calendarApi = {
  fetchCalendarEvents: async () => {
    const response = await axios.get(`${urls.getBackendUrl()}/api/google/calendar`, {
      params: buildCalendarParams(),
      withCredentials: true,
      timeout: 15_000,
    })

    return response.data?.items || []
  },
}
