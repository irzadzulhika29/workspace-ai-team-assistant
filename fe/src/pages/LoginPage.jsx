import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogIn, Bot, Calendar, Mail, Bug, FileText, Sparkles } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@/components/ui'
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
    { icon: Bot, label: 'AI Supervisor Agent', color: 'text-primary-500 bg-primary-50' },
    { icon: Calendar, label: 'Calendar Management', color: 'text-info bg-info-bg' },
    { icon: Mail, label: 'Email Assistant', color: 'text-neutral-700 bg-neutral-100' },
    { icon: Bug, label: 'Jira Integration', color: 'text-success bg-success-bg' },
    { icon: FileText, label: 'Document Workspace', color: 'text-warning bg-warning-bg' },
  ]

  if (loading) {
    return null
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,217,206,0.95)_0%,transparent_32%),radial-gradient(circle_at_bottom_right,rgba(229,229,229,0.9)_0%,transparent_28%),linear-gradient(180deg,#FFF8F6_0%,#F5F5F5_100%)] p-4">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:24px_24px] opacity-60" />

      <div className="relative w-full max-w-md">
        <Card className="overflow-hidden rounded-[2rem] border-white/70 bg-white/88 shadow-xl backdrop-blur-xl">
          <CardContent className="p-8 md:p-10">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-gradient-stat shadow-stat">
                  <Sparkles className="h-10 w-10 text-white" strokeWidth={2} />
                </div>
                <div className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-success shadow-sm">
                  <div className="h-2 w-2 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <div className="mb-8 text-center">
              <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900 md:text-4xl">
                AI Team Assistant
              </h1>
              <p className="mt-2 text-sm text-neutral-500 md:text-base">
                Workspace untuk Team Lead dan Project Manager yang butuh operasi cepat, rapi, dan terhubung.
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              variant="primary"
              size="lg"
              className="group relative w-full overflow-hidden rounded-xl text-base shadow-stat"
            >
              <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.12)_0%,transparent_45%,rgba(255,255,255,0.16)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="relative flex items-center justify-center gap-3">
                <LogIn size={20} />
                <span>Sign in with Google</span>
              </span>
            </Button>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white px-3 font-medium tracking-[0.2em] text-neutral-400">
                  Fitur yang tersedia
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {features.map(({ icon: Icon, label, color }) => (
                <Card
                  key={label}
                  className="rounded-2xl border-neutral-200/80 bg-neutral-50/70 shadow-none hover:border-primary-200 hover:shadow-sm"
                >
                  <CardContent className="flex items-center gap-3 p-3">
                    <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl ${color}`}>
                      <Icon size={16} />
                    </div>
                    <span className="text-xs font-medium leading-tight text-neutral-700">{label}</span>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-8 border-t border-neutral-100 pt-6">
              <p className="text-center text-xs leading-relaxed text-neutral-500">
                Akses Dashboard, Calendar, Email, Jira, dan AI Agents untuk delegasi tugas operasional.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Badge variant="success" className="rounded-full px-4 py-2 text-xs">
            <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-success" />
            Secure OAuth Authentication
          </Badge>
        </div>
      </div>
    </div>
  )
}
