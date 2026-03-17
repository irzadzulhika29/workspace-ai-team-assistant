import { useState, useEffect } from 'react'
import { calendarApi } from '../services/calendarService'
import { MAX_CALENDAR_EVENTS } from '../constants/dashboard'

export const useCalendarEvents = (limit = MAX_CALENDAR_EVENTS) => {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setError('')

      try {
        const items = await calendarApi.fetchCalendarEvents()
        setEvents(items.slice(0, limit))
      } catch (err) {
        setError(err.message || 'Tidak dapat mengambil jadwal kalender.')
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [limit])

  return { events, loading, error }
}
