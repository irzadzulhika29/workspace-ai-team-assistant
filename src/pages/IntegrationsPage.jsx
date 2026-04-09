import React, { useEffect, useState } from 'react'
import { Calendar, CheckCircle2, FileSpreadsheet, FileText, Loader2, LogIn, LogOut } from 'lucide-react'
import { urls } from '../services/api'
import JiraIntegrationCard from '../components/integrations/JiraIntegrationCard'

const googleIntegrations = [
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    description: 'Connect and manage your spreadsheets',
    tone: 'text-green-700 bg-green-50 border-green-100',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Sync your calendar events',
    tone: 'text-blue-700 bg-blue-50 border-blue-100',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    icon: FileText,
    description: 'Access and review your documents',
    tone: 'text-amber-700 bg-amber-50 border-amber-100',
  },
]

export default function IntegrationsPage() {
  const backendUrl = urls.getBackendUrl()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/auth/google/status`, {
          credentials: 'include',
        })
        const data = await response.json()

        if (data.connected) {
          setUser({
            name: data.name,
            email: data.email,
            picture: data.picture,
          })
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuthStatus()
  }, [backendUrl])

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`
  }

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await fetch(`${backendUrl}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    } catch (error) {
      console.error('Logout failed:', error)
    } finally {
      setUser(null)
      setLoggingOut(false)
    }
  }

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-cyan-700 animate-spin" />
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
            Settings / Integrations
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-500 mt-2">
            Connect Google services dan workspace Jira per user agar backend dan AI agent bisa memakai kredensial yang sesuai.
          </p>
        </div>

        {!user ? (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 text-blue-700 font-semibold">
                  <LogIn size={18} />
                  Sign in with Google
                </div>
                <p className="text-sm text-slate-600 mt-2">
                  Login diperlukan untuk menyimpan koneksi integrasi berdasarkan user yang sedang aktif.
                </p>
              </div>

              <button
                onClick={handleGoogleLogin}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
              >
                <LogIn size={16} />
                Sign in with Google
              </button>
            </div>
          </div>
        ) : (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-start gap-3">
                <CheckCircle2 size={20} className="text-emerald-700 mt-0.5" />
                <div>
                  <p className="text-lg font-semibold text-slate-900">Connected as {user.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {user.picture && (
                  <img src={user.picture} alt={user.name} className="w-11 h-11 rounded-full border border-white/80" />
                )}
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loggingOut ? <Loader2 size={16} className="animate-spin" /> : <LogOut size={16} />}
                  {loggingOut ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
          <JiraIntegrationCard authenticated={Boolean(user)} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Google Workspace</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              Google integrasi dikelola lewat OAuth dan digunakan untuk Sheets, Calendar, dan Docs.
            </p>

            <div className="space-y-3">
              {googleIntegrations.map(({ id, name, icon: Icon, description, tone }) => (
                <div key={id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tone}`}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500 mt-1">{description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
