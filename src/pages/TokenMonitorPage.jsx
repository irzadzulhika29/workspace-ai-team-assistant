import React, { useCallback, useEffect, useState } from 'react'
import { Activity, AlertCircle, BarChart3, Cpu, RefreshCw, TimerReset, Workflow } from 'lucide-react'
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
    title: 'Total Eksekusi',
    value: formatNumber(summary.totalExecutions),
    icon: Activity,
    tone: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  },
  {
    key: 'workflows',
    title: 'Workflow Aktif',
    value: formatNumber(summary.totalWorkflows),
    icon: Workflow,
    tone: 'text-violet-700 bg-violet-50 border-violet-100',
  },
  {
    key: 'input',
    title: 'Input Tokens',
    value: formatNumber(summary.totalInputTokens),
    icon: TimerReset,
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
  },
  {
    key: 'completion',
    title: 'Completion Tokens',
    value: formatNumber(summary.totalCompletionTokens),
    icon: Cpu,
    tone: 'text-amber-700 bg-amber-50 border-amber-100',
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
            <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
              Token Monitoring Workspace
            </p>
            <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight flex items-center gap-2">
              <BarChart3 size={24} className="text-cyan-700" />
              Monitoring Penggunaan Token
            </h1>
            <p className="text-sm text-slate-500 mt-2">
              Ringkasan penggunaan model LLM per eksekusi workflow dari data Supabase.
            </p>
            {summary.latestTimestamp && (
              <p className="text-xs text-slate-400 mt-1">
                Data terbaru: {formatDateTime(summary.latestTimestamp)}
              </p>
            )}
          </div>

          <button
            onClick={loadTokenUsage}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            {loading ? 'Memuat...' : 'Refresh Data'}
          </button>
        </div>

        {error && (
          <div className="mb-5 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm flex items-start gap-2">
            <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-6">
          {summaryCards(summary).map(({ key, title, value, icon: Icon, tone }) => (
            <div key={key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${tone}`}>
                <Icon size={18} />
              </div>
              <p className="text-xs font-medium text-slate-500 mt-4">{title}</p>
              <p className="text-2xl font-semibold text-slate-900 mt-1">{value}</p>
            </div>
          ))}
        </div>

        <div className="panel p-3 md:p-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-4 px-1">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Log Eksekusi</p>
              <h2 className="text-sm md:text-base font-semibold text-slate-900 mt-1">100 data token terbaru</h2>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-600">
              <span>Total tokens</span>
              <span className="font-semibold text-slate-900">{formatNumber(summary.totalTokens)}</span>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-14 px-4">
              <BarChart3 size={28} className="mx-auto text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-700">Belum ada data token yang masuk.</p>
              <p className="text-xs text-slate-500 mt-1">
                Endpoint backend sudah siap. Kirim log eksekusi dari n8n agar data mulai tampil.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {rows.map((row) => {
                const totalTokens = (row.input_tokens || 0) + (row.completion_tokens || 0)

                return (
                  <div key={row.id || `${row.execution_id}-${row.timestamp}`} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-[11px] font-mono text-cyan-700 tracking-wide break-all">
                          {row.execution_id}
                        </p>
                        <h3 className="text-sm md:text-base font-semibold text-slate-900 mt-1 break-words">
                          {row.workflow_name || 'Tanpa nama workflow'}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 border border-slate-200">
                            {row.workflow_id}
                          </span>
                          <span className="rounded-full bg-violet-50 px-2.5 py-1 border border-violet-100 text-violet-700">
                            {row.llm_model}
                          </span>
                          {row.execution_time && (
                            <span className="rounded-full bg-emerald-50 px-2.5 py-1 border border-emerald-100 text-emerald-700 font-mono">
                              ⏱ {formatExecutionTime(row.execution_time)}
                            </span>
                          )}
                          <span>{formatDateTime(row.timestamp)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 lg:min-w-[300px]">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] text-slate-500">Input</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {formatNumber(row.input_tokens)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
                          <p className="text-[11px] text-slate-500">Completion</p>
                          <p className="text-sm font-semibold text-slate-900 mt-1">
                            {formatNumber(row.completion_tokens)}
                          </p>
                        </div>
                        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-3 py-2">
                          <p className="text-[11px] text-cyan-700">Total</p>
                          <p className="text-sm font-semibold text-cyan-900 mt-1">
                            {formatNumber(totalTokens)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
