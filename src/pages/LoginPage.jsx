import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Bot, Calendar, Mail, Bug, FileText, Sparkles } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { urls } from '../services/api'

export default function LoginPage() {
  const navigate = useNavigate()
  const { isAuthenticated, loading } = useAuth()
  const backendUrl = urls.getBackendUrl()

  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/', { replace: true })
    }
  }, [isAuthenticated, loading, navigate])

  const handleGoogleLogin = () => {
    window.location.href = `${backendUrl}/api/auth/google`
  }

  const features = [
    { icon: Bot, label: 'AI Supervisor Agent', color: 'text-cyan-600' },
    { icon: Calendar, label: 'Calendar Management', color: 'text-blue-600' },
    { icon: Mail, label: 'Email Assistant', color: 'text-purple-600' },
    { icon: Bug, label: 'Jira Integration', color: 'text-emerald-600' },
    { icon: FileText, label: 'Document Workspace', color: 'text-amber-600' },
  ]

  if (loading) {
    return null
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-cyan-50 to-blue-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-200/50 [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      
      <div className="relative w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 md:p-10">
          {/* Logo/Icon */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
                <Sparkles className="w-10 h-10 text-white" strokeWidth={2} />
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full border-4 border-white shadow-sm" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
              AI Team Assistant
            </h1>
            <p className="text-slate-600 text-sm md:text-base">
              Workspace untuk Team Lead & Project Manager
            </p>
          </div>

          {/* Login Button */}
          <button
            onClick={handleGoogleLogin}
            className="w-full group relative overflow-hidden rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-700 to-blue-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3">
              <LogIn size={20} />
              <span>Sign in with Google</span>
            </div>
          </button>

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-slate-500 font-medium">Fitur yang tersedia</span>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-3">
            {features.map(({ icon: Icon, label, color }) => (
              <div
                key={label}
                className="flex items-center gap-2 p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-slate-200 transition-colors"
              >
                <Icon size={16} className={color} />
                <span className="text-xs font-medium text-slate-700 leading-tight">{label}</span>
              </div>
            ))}
          </div>

          {/* Footer Info */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <p className="text-xs text-center text-slate-500 leading-relaxed">
              Akses Dashboard, Calendar, Email, Jira, dan AI Agents untuk delegasi tugas operasional
            </p>
          </div>
        </div>

        {/* Bottom Badge */}
        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm border border-white/40 shadow-sm">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium text-slate-700">Secure OAuth Authentication</span>
          </div>
        </div>
      </div>
    </div>
  )
}
