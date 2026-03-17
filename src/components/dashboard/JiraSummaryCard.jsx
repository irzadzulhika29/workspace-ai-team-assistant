import React from 'react'
import { Link } from 'react-router-dom'
import { Bug, CheckCircle2 } from 'lucide-react'
import { MAX_JIRA_STATUS_DISPLAY } from '../../constants/dashboard'

export default function JiraSummaryCard({ summary, loading, error }) {
  return (
    <div className="mt-8 panel p-4 md:p-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ringkasan Jira</p>
          <h2 className="text-sm md:text-base font-semibold text-slate-900 mt-1">Progres Penyelesaian Issue</h2>
        </div>
        <Link to="/workspace/jira" className="text-xs font-semibold text-cyan-700 hover:text-cyan-800">
          Lihat detail
        </Link>
      </div>

      {loading ? (
        <div className="space-y-2">
          <div className="skeleton h-20 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
          <div className="skeleton h-14 rounded-xl" />
        </div>
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : summary.total === 0 ? (
        <p className="text-sm text-slate-500">Belum ada issue Jira yang terdeteksi.</p>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Bug size={15} className="text-cyan-700" />
                {summary.total} total issue
              </div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                <CheckCircle2 size={13} />
                {summary.done} selesai ({summary.percent}%)
              </div>
            </div>

            <div className="h-2.5 rounded-full bg-slate-200 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${summary.percent}%` }}
              />
            </div>
          </div>

          <div className="space-y-2.5">
            {summary.byStatus.slice(0, MAX_JIRA_STATUS_DISPLAY).map(({ status, count }) => {
              const statusPercent = Math.round((count / summary.total) * 100)

              return (
                <div key={status} className="rounded-xl border border-slate-200 bg-white px-3.5 py-3">
                  <div className="flex items-center justify-between gap-3 text-xs mb-2">
                    <span className="font-medium text-slate-700">{status}</span>
                    <span className="font-mono text-slate-500">{count} issue</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
                    <div
                      className="h-full bg-cyan-500/70"
                      style={{ width: `${statusPercent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
