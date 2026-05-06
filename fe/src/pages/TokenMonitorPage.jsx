import React, { useCallback, useEffect, useState } from 'react'
import { Activity, BarChart3, Cpu, RefreshCw, TimerReset, Workflow } from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
  StatCard,
} from '@/components/ui'
import { tokenUsageApi } from '../services/tokenUsageService'

const formatDateTime = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const formatNumber = (value) => new Intl.NumberFormat('id-ID').format(value || 0)

const formatExecutionTime = (ms) => {
  if (!ms || ms <= 0) return '-'
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(2)}s`
}

const summaryCards = (summary) => [
  {
    key: 'executions',
    label: 'Total Eksekusi',
    value: formatNumber(summary.totalExecutions),
    icon: Activity,
    caption: 'Jumlah eksekusi workflow yang tercatat',
  },
  {
    key: 'workflows',
    label: 'Workflow Aktif',
    value: formatNumber(summary.totalWorkflows),
    icon: Workflow,
    caption: 'Workflow unik yang mengirim telemetry',
  },
  {
    key: 'input',
    label: 'Input Tokens',
    value: formatNumber(summary.totalInputTokens),
    icon: TimerReset,
    caption: 'Akumulasi prompt/input token',
  },
  {
    key: 'completion',
    label: 'Completion Tokens',
    value: formatNumber(summary.totalCompletionTokens),
    icon: Cpu,
    caption: 'Akumulasi completion token model',
  },
]

export default function TokenMonitorPage() {
  const [rows, setRows] = useState([])
  const [summary, setSummary] = useState({
    totalExecutions: 0,
    totalInputTokens: 0,
    totalCompletionTokens: 0,
    totalTokens: 0,
    totalWorkflows: 0,
    latestTimestamp: null,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadTokenUsage = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const data = await tokenUsageApi.ambilDataToken(100)
      setRows(Array.isArray(data?.rows) ? data.rows : [])
      setSummary(data?.summary || {
        totalExecutions: 0,
        totalInputTokens: 0,
        totalCompletionTokens: 0,
        totalTokens: 0,
        totalWorkflows: 0,
        latestTimestamp: null,
      })
    } catch (err) {
      setError(err.message || 'Tidak dapat mengambil data token usage.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadTokenUsage()
  }, [loadTokenUsage])

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <p className="mb-2 text-[11px] font-mono uppercase tracking-[0.2em] text-neutral-400">
              Token Monitoring Workspace
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-semibold leading-tight text-neutral-900 md:text-3xl">
              <BarChart3 size={24} className="text-primary-500" />
              Monitoring Penggunaan Token
            </h1>
            <p className="mt-2 text-sm text-neutral-500">
              Ringkasan penggunaan model LLM per eksekusi workflow dari data Supabase.
            </p>
            {summary.latestTimestamp && (
              <p className="mt-1 text-xs text-neutral-400">
                Data terbaru: {formatDateTime(summary.latestTimestamp)}
              </p>
            )}
          </div>

          <Button
            onClick={loadTokenUsage}
            disabled={loading}
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memuat...' : 'Refresh Data'}
          </Button>
        </div>

        {error && (
          <Alert variant="error" title="Gagal memuat token usage" className="mb-5">
            {error}
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {summaryCards(summary).map(({ key, label, value, icon: Icon, caption }) => (
            <StatCard
              key={key}
              label={label}
              value={value}
              caption={caption}
              trendIcon={<Icon className="h-4 w-4" />}
            />
          ))}
        </div>

        <Card className="rounded-2xl">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardDescription className="mt-0 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Log Eksekusi
              </CardDescription>
              <CardTitle className="mt-1 text-sm md:text-base">
                100 data token terbaru
              </CardTitle>
            </div>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1.5 text-xs">
              Total tokens: {formatNumber(summary.totalTokens)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <div key={idx} className="skeleton h-24 rounded-xl" />
                ))}
              </div>
            ) : rows.length === 0 ? (
              <EmptyState
                icon={<BarChart3 size={28} />}
                title="Belum ada data token yang masuk."
                description="Endpoint backend sudah siap. Kirim log eksekusi dari n8n agar data mulai tampil."
              />
            ) : (
              rows.map((row) => {
                const totalTokens = (row.input_tokens || 0) + (row.completion_tokens || 0)

                return (
                  <Card
                    key={row.id || `${row.execution_id}-${row.timestamp}`}
                    className="rounded-xl border-neutral-200 bg-white shadow-none hover:border-primary-200 hover:shadow-sm"
                  >
                    <CardContent className="p-4">
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <p className="break-all font-mono text-[11px] tracking-wide text-primary-500">
                            {row.execution_id}
                          </p>
                          <h3 className="mt-1 break-words text-sm font-semibold text-neutral-900 md:text-base">
                            {row.workflow_name || 'Tanpa nama workflow'}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
                            <Badge variant="outline">{row.workflow_id}</Badge>
                            <Badge variant="info">{row.llm_model}</Badge>
                            {row.execution_time && (
                              <Badge variant="success">
                                ⏱ {formatExecutionTime(row.execution_time)}
                              </Badge>
                            )}
                            <span>{formatDateTime(row.timestamp)}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 lg:min-w-[300px]">
                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <p className="text-[11px] text-neutral-500">Input</p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900">
                              {formatNumber(row.input_tokens)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2">
                            <p className="text-[11px] text-neutral-500">Completion</p>
                            <p className="mt-1 text-sm font-semibold text-neutral-900">
                              {formatNumber(row.completion_tokens)}
                            </p>
                          </div>
                          <div className="rounded-xl border border-primary-100 bg-primary-50 px-3 py-2">
                            <p className="text-[11px] text-primary-600">Total</p>
                            <p className="mt-1 text-sm font-semibold text-primary-700">
                              {formatNumber(totalTokens)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
