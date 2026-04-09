import React, { useEffect, useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, HelpCircle, Loader2, PlugZap, Unplug } from 'lucide-react'
import { useIntegrationStore } from '../../store/integrationStore'

const formatDate = (value) => {
  if (!value) return '-'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export default function JiraIntegrationCard({ authenticated }) {
  const { jira, fetchJiraStatus, connectJira, disconnectJira } = useIntegrationStore()
  const [form, setForm] = useState({ subdomain: '', email: '', apiToken: '' })
  const [showGuide, setShowGuide] = useState(false)

  useEffect(() => {
    if (authenticated) {
      fetchJiraStatus()
    }
  }, [authenticated, fetchJiraStatus])

  useEffect(() => {
    if (jira.connected) {
      setForm((current) => ({
        ...current,
        subdomain: jira.subdomain || current.subdomain,
        email: jira.email || current.email,
        apiToken: '',
      }))
    }
  }, [jira.connected, jira.subdomain, jira.email])

  const buttonLabel = useMemo(() => {
    if (jira.saving) return 'Menghubungkan...'
    return jira.connected ? 'Update Koneksi Jira' : 'Connect Jira'
  }, [jira.connected, jira.saving])

  const handleSubmit = async (event) => {
    event.preventDefault()
    await connectJira(form)
    setForm((current) => ({ ...current, apiToken: '' }))
  }

  const handleDisconnect = async () => {
    await disconnectJira()
    setForm((current) => ({ ...current, apiToken: '' }))
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 flex items-center justify-center">
              <PlugZap size={20} />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Jira</h3>
              <p className="text-sm text-slate-500">Connect your Jira workspace</p>
            </div>
          </div>
        </div>

        {jira.connected && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} />
            Active
          </span>
        )}
      </div>

      {jira.error && (
        <div className="mb-4 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-3 text-sm text-rose-700 flex items-start gap-2">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{jira.error}</span>
        </div>
      )}

      {jira.connected && !jira.loading && (
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
          <p className="text-sm font-semibold text-slate-900 break-all">{jira.subdomain}</p>
          <p className="text-sm text-slate-600 mt-1 break-all">{jira.email}</p>
          <p className="text-xs text-slate-500 mt-2">
            Connected {formatDate(jira.connectedAt || jira.updatedAt)}
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Subdomain</label>
          <input
            type="text"
            value={form.subdomain}
            onChange={(event) => setForm((current) => ({ ...current, subdomain: event.target.value }))}
            placeholder="namaproject.atlassian.net"
            disabled={!authenticated || jira.loading || jira.saving || jira.disconnecting}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Atlassian</label>
          <input
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
            placeholder="user@email.com"
            disabled={!authenticated || jira.loading || jira.saving || jira.disconnecting}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <label className="block text-sm font-medium text-slate-700">API Token</label>
            <button
              type="button"
              onClick={() => setShowGuide((value) => !value)}
              className="text-slate-400 hover:text-slate-600"
            >
              <HelpCircle size={16} />
            </button>
          </div>

          {showGuide && (
            <div className="mb-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs text-slate-600">
              Cara mendapatkan API Token: 1) Buka id.atlassian.com 2) Masuk ke Security lalu API Tokens 3) Pilih Create API Token 4) Copy dan paste di sini.
            </div>
          )}

          <input
            type="password"
            value={form.apiToken}
            onChange={(event) => setForm((current) => ({ ...current, apiToken: event.target.value }))}
            placeholder={jira.connected ? 'Masukkan token baru jika ingin update' : 'ATATT3xFf...'}
            disabled={!authenticated || jira.loading || jira.saving || jira.disconnecting}
            className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm outline-none focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 disabled:bg-slate-100 disabled:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!authenticated || jira.loading || jira.saving || jira.disconnecting}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {jira.saving ? <Loader2 size={16} className="animate-spin" /> : <PlugZap size={16} />}
            {buttonLabel}
          </button>

          {jira.connected && (
            <button
              type="button"
              onClick={handleDisconnect}
              disabled={jira.disconnecting || jira.saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {jira.disconnecting ? <Loader2 size={16} className="animate-spin" /> : <Unplug size={16} />}
              {jira.disconnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}

          {!authenticated && (
            <p className="text-xs text-slate-500">Login Google dulu untuk menyimpan kredensial Jira per user.</p>
          )}
        </div>
      </form>
    </div>
  )
}
