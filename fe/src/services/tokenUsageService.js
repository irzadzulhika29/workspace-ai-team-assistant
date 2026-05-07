import axios from 'axios'
import { urls } from './api'

export const tokenUsageApi = {
  ambilDataToken: async (limit = 100, options = {}) => {
    try {
      const res = await axios.get(`${urls.getBackendUrl()}/api/token-usage`, {
        params: { limit, ...options },
      })
      return res.data
    } catch (error) {
      console.error('Gagal mengambil data token usage:', error)
      throw new Error(error.response?.data?.error || 'Tidak dapat mengambil data token usage.')
    }
  },
}
