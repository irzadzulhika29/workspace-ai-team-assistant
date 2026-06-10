import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Activity, BarChart3, Cpu, RefreshCw, Search, TimerReset, Workflow } from 'lucide-react'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Cell,
  Column,
  EmptyState,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
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

const compareValues = (firstValue, secondValue, direction) => {
  const firstNumber = Number(firstValue)
  const secondNumber = Number(secondValue)

  let result = 0

  if (!Number.isNaN(firstNumber) && !Number.isNaN(secondNumber)) {
    result = firstNumber - secondNumber
  } else {
    result = String(firstValue || '').localeCompare(String(secondValue || ''), 'id', {
      numeric: true,
      sensitivity: 'base',
    })
  }

  return direction === 'descending' ? result * -1 : result
}

const getSortableValue = (row, column) => {
  switch (column) {
    case 'workflow':
      return row.workflow_name || ''
    case 'input':
      return row.input_tokens || 0
    case 'completion':
      return row.completion_tokens || 0
    case 'total':
      return (row.input_tokens || 0) + (row.completion_tokens || 0)
    case 'duration':
      return row.execution_time || 0
    case 'updated':
      return row.timestamp ? new Date(row.timestamp).getTime() : 0
    default:
      return row.execution_id || ''
  }
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
    caption: 'Akumulasi completion token',
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
  const [searchQuery, setSearchQuery] = useState('')
  const [sortDescriptor, setSortDescriptor] = useState({
    column: 'updated',
    direction: 'descending',
  })

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

  const normalizedQuery = searchQuery.trim().toLowerCase()
  const filteredRows = normalizedQuery
    ? rows.filter((row) => {
      const searchable = [
        row.execution_id,
        row.workflow_name,
        row.timestamp,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()

      return searchable.includes(normalizedQuery)
    })
    : rows

  const sortedRows = useMemo(() => {
    return [...filteredRows].sort((firstRow, secondRow) => compareValues(
      getSortableValue(firstRow, sortDescriptor.column),
      getSortableValue(secondRow, sortDescriptor.column),
      sortDescriptor.direction
    ))
  }, [filteredRows, sortDescriptor])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <section>
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="min-w-[280px]">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center rounded-2xl text-[#ff623d]">
                <BarChart3 className="h-10 w-10" />
              </div>
              <h1 className="text-[2rem] font-bold leading-tight text-[#ff623d]">
                Token Monitoring
              </h1>
            </div>
            <p className="mt-1 text-sm text-slate-500">
              Pantau penggunaan token LLM per workflow dari telemetry Supabase.
            </p>
          </div>

          <form onSubmit={(event) => event.preventDefault()} className="w-full max-w-[540px]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Cari workflow atau execution ID..."
                className="h-auto w-full rounded-2xl bg-white px-4 py-4 pl-14 pr-16 text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#ff623d]/20"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 rounded-lg bg-slate-100 px-2 py-1 text-xs font-semibold text-slate-500">
                Ctrl K
              </span>
            </div>
          </form>

          <div className="flex items-center gap-3">
            <Button
              onClick={loadTokenUsage}
              disabled={loading}
              variant="outline"
              size="sm"
              className="gap-2 rounded-2xl text-sm"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Memuat...' : 'Refresh'}
            </Button>
          </div>
        </div>

        {summary.latestTimestamp && (
          <p className="mt-3 text-sm text-slate-500">
            Data terbaru: {formatDateTime(summary.latestTimestamp)}
          </p>
        )}

        {error && (
          <Alert variant="error" title="Gagal memuat token usage" className="mt-4">
            {error}
          </Alert>
        )}
      </section>

      <section className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards(summary).map(({ key, label, value, icon: Icon, caption }) => (
          <div
            key={key}
            className="rounded-[20px] bg-white px-5 py-6 text-left shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff4ef] text-[#ff623d]">
                <Icon className="h-5 w-5" />
              </div>
              <p className="text-[1.05rem] font-medium text-slate-700">{label}</p>
            </div>
            <p className="mt-4 text-[3rem] font-semibold leading-none text-slate-900">
              {value}
            </p>
            <p className="mt-3 text-sm text-slate-500">{caption}</p>
          </div>
        ))}
      </section>

      <section className="mt-4 flex min-h-0 flex-1 overflow-hidden rounded-[24px]">
        <Card className="flex min-h-0 flex-1 flex-col rounded-[20px] border-0 bg-white shadow-md">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <CardDescription className="mt-0 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Log Eksekusi
              </CardDescription>
              <CardTitle className="mt-1 text-sm md:text-base">
                {sortedRows.length} dari {rows.length} data token terbaru
              </CardTitle>
            </div>
            <Badge variant="outline" className="w-fit rounded-full px-3 py-1.5 text-xs">
              Total tokens: {formatNumber(summary.totalTokens)}
            </Badge>
          </CardHeader>
          <CardContent className="min-h-0 flex-1 space-y-3 overflow-y-auto">
            {loading ? (
              <div className="space-y-2 rounded-[18px] border border-slate-200 p-3">
                {Array.from({ length: 6 }).map((_, idx) => (
                  <div key={idx} className="skeleton h-12 rounded-xl" />
                ))}
              </div>
            ) : sortedRows.length === 0 ? (
              <EmptyState
                icon={<BarChart3 size={28} />}
                title={rows.length === 0 ? 'Belum ada data token yang masuk.' : 'Tidak ada data yang cocok.'}
                description={rows.length === 0
                  ? 'Endpoint backend sudah siap. Kirim log eksekusi dari n8n agar data mulai tampil.'
                  : 'Coba ubah kata kunci pencarian untuk melihat eksekusi token lainnya.'}
              />
            ) : (
              <ResizableTableContainer className="overflow-hidden rounded-[18px] border border-slate-200">
                <div className="overflow-x-auto">
                  <Table
                    aria-label="Token usage execution table"
                    sortDescriptor={sortDescriptor}
                    onSortChange={setSortDescriptor}
                  >
                    <TableHeader>
                      <Column id="workflow" isRowHeader allowsSorting>
                        Workflow
                      </Column>
                      <Column id="input" allowsSorting>
                        Input
                      </Column>
                      <Column id="completion" allowsSorting>
                        Completion
                      </Column>
                      <Column id="total" allowsSorting>
                        Total
                      </Column>
                      <Column id="duration" allowsSorting>
                        Durasi
                      </Column>
                      <Column id="updated" allowsSorting>
                        Update
                      </Column>
                    </TableHeader>
                    <TableBody items={sortedRows}>
                      {(row) => {
                        const totalTokens = (row.input_tokens || 0) + (row.completion_tokens || 0)

                        return (
                          <Row id={row.id || `${row.execution_id}-${row.timestamp}`}>
                            <Cell>
                              <div className="min-w-[220px]">
                                <p className="text-sm font-semibold text-slate-900">
                                  {row.workflow_name || 'Tanpa nama workflow'}
                                </p>
                                <p className="mt-1 truncate text-xs text-slate-500">
                                  Eksekusi {row.execution_id || '-'}
                                </p>
                              </div>
                            </Cell>
                            <Cell className="text-sm text-slate-700">
                              {formatNumber(row.input_tokens)}
                            </Cell>
                            <Cell className="text-sm text-slate-700">
                              {formatNumber(row.completion_tokens)}
                            </Cell>
                            <Cell className="text-sm font-semibold text-slate-900">
                              {formatNumber(totalTokens)}
                            </Cell>
                            <Cell className="text-sm text-slate-700">
                              {formatExecutionTime(row.execution_time)}
                            </Cell>
                            <Cell>
                              <div className="min-w-[120px] text-sm text-slate-700">
                                {formatDateTime(row.timestamp)}
                              </div>
                            </Cell>
                          </Row>
                        )
                      }}
                    </TableBody>
                  </Table>
                </div>
              </ResizableTableContainer>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
