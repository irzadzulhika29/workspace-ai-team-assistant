import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Bot,
  Bug,
  Calendar,
  CheckCircle2,
  FileText,
  Mail,
  ShieldCheck,
  Sparkles,
  Users,
  Workflow,
} from 'lucide-react'
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  Badge,
  Button,
  Card,
  CardContent,
} from '@/components/ui'
import { useAuth } from '../context/AuthContext'
import { urls } from '../services/api'

const assurances = [
  'Satu login untuk semua workspace',
  'Riwayat dan dokumen mengikuti akun Anda',
  'Integrasi Google aktif setelah autentikasi',
]

const orbitAgents = [
  {
    title: 'Email Assistant',
    metric: '5 urgent replies',
    icon: Mail,
    badge: { label: 'Needs Reply', variant: 'warning' },
    className: 'lg:absolute lg:left-0 lg:top-10 lg:w-52',
    tone: 'bg-warning-bg text-warning',
  },
  {
    title: 'Calendar Workspace',
    metric: '3 meetings today',
    icon: Calendar,
    badge: { label: 'Needs Prep', variant: 'info' },
    className: 'lg:absolute lg:right-4 lg:top-0 lg:w-56',
    tone: 'bg-info-bg text-info',
  },
  {
    title: 'Jira Summary',
    metric: '4 blockers flagged',
    icon: Bug,
    badge: { label: 'Active', variant: 'urgent' },
    className: 'lg:absolute lg:bottom-8 lg:left-8 lg:w-52',
    tone: 'bg-primary-100 text-primary-700',
  },
  {
    title: 'Document Workspace',
    metric: '12 files ready',
    icon: FileText,
    badge: { label: 'Ready', variant: 'success' },
    className: 'lg:absolute lg:bottom-0 lg:right-0 lg:w-56',
    tone: 'bg-success-bg text-success',
  },
]

const proofPoints = [
  {
    title: 'Manage team ops',
    icon: Users,
    text: 'Pantau pekerjaan, meeting, dan komunikasi dalam satu alur.',
  },
  {
    title: 'Delegate to agents',
    icon: Workflow,
    text: 'Supervisor membagi konteks ke workspace dan agent yang tepat.',
  },
  {
    title: 'Review before send',
    icon: CheckCircle2,
    text: 'Semua draft dan output tetap lewat approval manusia.',
  },
]

const activityFeed = [
  'Draft report generated',
  'Meeting brief prepared',
  'Reply waiting approval',
]

function GoogleMark() {
  return (
    <span className="grid h-9 w-9 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5">
      <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
        <path
          fill="#EA4335"
          d="M12 10.2v3.9h5.4c-.2 1.3-1.5 3.9-5.4 3.9-3.2 0-5.9-2.7-5.9-6s2.7-6 5.9-6c1.8 0 3 .8 3.7 1.5l2.5-2.4C16.6 3.6 14.5 2.7 12 2.7 6.9 2.7 2.8 6.8 2.8 12S6.9 21.3 12 21.3c6.2 0 9.2-4.3 9.2-6.5 0-.4 0-.7-.1-1H12z"
        />
        <path
          fill="#34A853"
          d="M2.8 12c0 1.7.5 3.2 1.4 4.6l3.4-2.6c-.2-.6-.4-1.2-.4-2s.1-1.4.4-2L4.2 7.4A9.2 9.2 0 0 0 2.8 12z"
        />
        <path
          fill="#FBBC05"
          d="M12 21.3c2.5 0 4.6-.8 6.2-2.3l-3-2.3c-.8.6-1.9 1-3.3 1-2.5 0-4.6-1.7-5.3-4l-3.4 2.6c1.6 3 4.8 5 8.8 5z"
        />
        <path
          fill="#4285F4"
          d="M18.2 19c1.8-1.7 3-4.2 3-7.2 0-.6-.1-1.1-.2-1.6H12v3.9h5.4c-.3 1.3-1.1 2.2-2.2 3l3 2.3z"
        />
      </svg>
    </span>
  )
}

function OrbitCard({ title, metric, icon: Icon, badge, className, tone }) {
  return (
    <Card
      className={`rounded-3xl border-white/10 bg-white/10 shadow-none backdrop-blur-sm hover:shadow-none ${className}`}
    >
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${tone}`}>
            <Icon size={18} />
          </div>
          <Badge variant={badge.variant} className="rounded-full px-2.5 py-1">
            {badge.label}
          </Badge>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{title}</p>
          <p className="mt-1 text-xs text-white/70">{metric}</p>
        </div>
      </CardContent>
    </Card>
  )
}

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

  if (loading) {
    return null
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(255,217,206,0.95)_0%,transparent_28%),radial-gradient(circle_at_85%_18%,rgba(232,67,34,0.12)_0%,transparent_26%),linear-gradient(180deg,#FFF8F6_0%,#F5F5F5_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(232,67,34,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(17,17,17,0.04)_1px,transparent_1px)] bg-[size:28px_28px] opacity-60" />
      <div className="absolute left-[-8rem] top-[-7rem] h-64 w-64 rounded-full bg-primary-200/35 blur-3xl" />
      <div className="absolute bottom-[-9rem] right-[-5rem] h-80 w-80 rounded-full bg-neutral-300/50 blur-3xl" />

      <div className="relative mx-auto flex h-screen w-screen items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid h-full w-full max-w-[1160px] gap-6 lg:grid-cols-[420px_minmax(0,700px)] lg:justify-center">
          <Card className="overflow-hidden rounded-[32px] border-neutral-200/80 bg-white/92 shadow-[0_28px_80px_rgba(17,17,17,0.14)] backdrop-blur-sm hover:shadow-[0_28px_80px_rgba(17,17,17,0.14)]">
            <CardContent className="flex h-full flex-col p-6 sm:p-8 lg:p-10">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative flex h-16 w-16 items-center justify-center rounded-[24px] bg-gradient-stat shadow-stat">
                    <Sparkles className="h-8 w-8 text-white" strokeWidth={2.2} />
                    <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full border-4 border-white bg-success">
                      <span className="h-2 w-2 rounded-full bg-white" />
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-bold tracking-tight text-neutral-900">
                      AI Team Assistant
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-10 space-y-5">
                <div className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.26em] text-primary-500">
                    Workspace Entry Point
                  </p>
                  <h1 className="max-w-[12ch] text-4xl font-bold leading-none tracking-[-0.04em] text-neutral-900 sm:text-5xl">
                    Masuk ke workspace tim Anda
                  </h1>
                  <p className="max-w-xl text-sm leading-7 text-neutral-600 sm:text-base">
                    Masuk dengan Google untuk membuka dashboard, agent, dan workspace yang
                    membantu tim Anda bergerak lebih cepat, lebih rapi, dan tetap terkontrol.
                  </p>
                </div>

                <div className="rounded-[28px] border border-neutral-200 bg-[linear-gradient(180deg,#FFFFFF_0%,#FFF7F3_100%)] p-4 shadow-sm">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-neutral-900">
                        Continue with Google
                      </p>
                    </div>
                    <div className="hidden rounded-full bg-primary-50 px-3 py-1 text-[11px] font-semibold text-primary-700 sm:block">
                      OAuth 2.0
                    </div>
                  </div>

                  <Button
                    onClick={handleGoogleLogin}
                    variant="primary"
                    size="lg"
                    className="group relative h-14 w-full justify-between rounded-2xl px-4 text-left shadow-stat"
                  >
                    <span className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.16)_0%,transparent_38%,rgba(255,255,255,0.12)_100%)] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <span className="relative flex items-center gap-3">
                      <GoogleMark />
                      <span>
                        <span className="block text-sm font-semibold text-white">
                          Continue with Google
                        </span>
                        <span className="block text-xs text-white/70">
                          Masuk dan aktifkan workspace Anda
                        </span>
                      </span>
                    </span>
                    <span className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/12">
                      <ArrowRight className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-x-0.5" />
                    </span>
                  </Button>
                </div>
              </div>

              <div className="mt-8 space-y-4 rounded-[28px] border border-dashed border-neutral-200 bg-neutral-50/80 p-5">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-primary-500" />
                  <p className="text-sm font-semibold text-neutral-900">
                    Trust and access
                  </p>
                </div>
                <p className="text-sm leading-6 text-neutral-600">
                  Akun Google yang Anda gunakan akan menjadi identitas untuk sesi, dokumen,
                  integrasi, dan jejak kerja di dalam workspace.
                </p>
                <div className="space-y-3">
                  {assurances.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-primary-700">
                        <CheckCircle2 size={12} />
                      </span>
                      <p className="text-sm leading-6 text-neutral-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-auto pt-8">
                <div className="flex flex-wrap items-center gap-3">
                  <Badge variant="success" className="rounded-full px-4 py-2 text-xs">
                    <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-success" />
                    Secure OAuth Authentication
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-4 py-2 text-xs">
                    Account-scoped workspace
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <section className="relative h-full overflow-hidden rounded-[32px] border border-neutral-900/5 bg-[linear-gradient(160deg,#111111_0%,#1F1F1F_45%,#2A130E_100%)] px-6 py-6 shadow-[0_36px_90px_rgba(17,17,17,0.24)] sm:px-8 sm:py-8 lg:px-10 lg:py-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(255,95,63,0.34)_0%,transparent_28%),radial-gradient(circle_at_82%_16%,rgba(255,255,255,0.08)_0%,transparent_22%),radial-gradient(circle_at_50%_85%,rgba(232,67,34,0.18)_0%,transparent_35%)]" />
            <div className="absolute inset-x-10 top-[46%] hidden h-px bg-gradient-to-r from-transparent via-white/20 to-transparent lg:block" />
            <div className="absolute left-1/2 top-[42%] hidden h-40 w-40 -translate-x-1/2 rounded-full border border-white/10 lg:block" />
            <div className="absolute left-1/2 top-[42%] hidden h-56 w-56 -translate-x-1/2 rounded-full border border-white/5 lg:block" />

            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="max-w-2xl">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.26em] text-white/70">
                  <Workflow className="h-3.5 w-3.5 text-primary-400" />
                  Team Orchestration
                </div>
                <h2 className="mt-5 max-w-[13ch] text-4xl font-bold leading-none tracking-[-0.05em] text-white sm:text-5xl">
                  AI agents yang bekerja seperti command center tim
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-white/70 sm:text-base">
                  Pantau prioritas, rangkum insight, siapkan output, dan jalankan koordinasi
                  operasional dari satu workspace tanpa kehilangan approval manusia.
                </p>
              </div>

              <div className="relative grid gap-4 lg:min-h-[360px] lg:grid-cols-1">
                <div className="grid gap-4 lg:hidden">
                  {orbitAgents.map((agent) => (
                    <OrbitCard key={agent.title} {...agent} className="" />
                  ))}
                </div>

                <div className="relative hidden h-full lg:block">
                  {orbitAgents.map((agent) => (
                    <OrbitCard key={agent.title} {...agent} />
                  ))}

                  <div className="absolute left-1/2 top-1/2 w-full max-w-[320px] -translate-x-1/2 -translate-y-1/2">
                    <Card className="overflow-hidden rounded-[32px] border-primary-200/60 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.28)] hover:shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-14 w-14 items-center justify-center rounded-[20px] bg-gradient-stat shadow-stat">
                              <Bot className="h-7 w-7 text-white" />
                            </div>
                            <div>
                              <p className="text-base font-bold text-neutral-900">
                                Supervisor Agent
                              </p>
                              <p className="mt-1 text-xs text-neutral-500">
                                Routes context, tasks, and outputs
                              </p>
                            </div>
                          </div>
                          <Badge variant="success" className="rounded-full px-3 py-1">
                            Active
                          </Badge>
                        </div>

                        <div className="mt-5 grid gap-3 sm:grid-cols-3">
                          <div className="rounded-2xl bg-neutral-50 p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                              Email
                            </p>
                            <p className="mt-2 text-lg font-bold text-neutral-900">05</p>
                            <p className="text-xs text-neutral-500">needs reply</p>
                          </div>
                          <div className="rounded-2xl bg-neutral-50 p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                              Calendar
                            </p>
                            <p className="mt-2 text-lg font-bold text-neutral-900">03</p>
                            <p className="text-xs text-neutral-500">prep moments</p>
                          </div>
                          <div className="rounded-2xl bg-neutral-50 p-3">
                            <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
                              Jira
                            </p>
                            <p className="mt-2 text-lg font-bold text-neutral-900">04</p>
                            <p className="text-xs text-neutral-500">blockers flagged</p>
                          </div>
                        </div>

                        <div className="mt-5 rounded-[24px] border border-primary-100 bg-primary-50 p-4">
                          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-primary-600">
                            Insight strip
                          </p>
                          <p className="mt-2 text-sm font-medium leading-6 text-primary-900">
                            12 issues aktif, 5 email butuh balasan, dan 3 meeting hari ini perlu
                            persiapan singkat.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
                <Card className="rounded-[28px] border-white/10 bg-white/6 backdrop-blur-sm hover:shadow-none">
                  <CardContent className="p-5">
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-white">Leads, PMs, and team ops in one loop</p>
                        <p className="mt-2 max-w-xl text-sm leading-6 text-white/65">
                          Semua konteks lintas email, calendar, Jira, dan dokumen tetap terhubung
                          untuk delegasi tugas yang lebih presisi.
                        </p>
                      </div>
                      <AvatarGroup className="shrink-0">
                        <Avatar size="sm" className="bg-white/10">
                          <AvatarFallback>IR</AvatarFallback>
                        </Avatar>
                        <Avatar size="sm" className="bg-white/10">
                          <AvatarFallback>PM</AvatarFallback>
                        </Avatar>
                        <Avatar size="sm" className="bg-white/10">
                          <AvatarFallback>QA</AvatarFallback>
                        </Avatar>
                        <Avatar size="sm" className="bg-white/10">
                          <AvatarFallback>OP</AvatarFallback>
                        </Avatar>
                      </AvatarGroup>
                    </div>
                  </CardContent>
                </Card>

                <Card className="rounded-[28px] border-white/10 bg-white/6 backdrop-blur-sm hover:shadow-none">
                  <CardContent className="space-y-3 p-5">
                    <p className="text-sm font-semibold text-white">Activity stream</p>
                    {activityFeed.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/6 px-3 py-3"
                      >
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-500/15 text-primary-200">
                          <Sparkles className="h-4 w-4" />
                        </span>
                        <p className="text-sm text-white/80">{item}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                {proofPoints.map(({ title, text, icon: Icon }) => (
                  <Card
                    key={title}
                    className="rounded-[28px] border-white/10 bg-white/8 backdrop-blur-sm hover:shadow-none"
                  >
                    <CardContent className="space-y-4 p-5">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-primary-300">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{title}</p>
                        <p className="mt-2 text-sm leading-6 text-white/65">{text}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
