import axios from 'axios'
import { urls } from './api'

const buildCalendarParams = () => ({
  calendarId: 'primary',
  singleEvents: 'true',
  orderBy: 'startTime',
  maxResults: '50',
  timeMin: new Date().toISOString(),
})

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
