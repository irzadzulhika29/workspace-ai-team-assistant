import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { urls } from '../services/api'

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  checkAuthStatus: () => {},
  logout: () => {},
})

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const backendUrl = urls.getBackendUrl()

  const checkAuthStatus = useCallback(async () => {
    setLoading(true)
    try {
      const response = await fetch(`${backendUrl}/api/auth/google/status`, {
        credentials: 'include',
      })
      const data = await response.json()

      if (data.connected) {
        setUser({
          id: data.userId,
          name: data.name,
          email: data.email,
          jobTitle: data.jobTitle || "",
          picture: data.picture,
          hasGoogleToken: Boolean(data.hasGoogleToken),
        })
      } else {
        setUser(null)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [backendUrl])

  const logout = useCallback(async () => {
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
      setUser(null)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }, [backendUrl])

  useEffect(() => {
    checkAuthStatus()
  }, [checkAuthStatus])

  const value = {
    user,
    loading,
    isAuthenticated: Boolean(user),
    checkAuthStatus,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
