import React from 'react'
import { DASHBOARD_CARDS } from '../constants/dashboard'
import { useCalendarEvents } from '../hooks/useCalendarEvents'
import { useJiraProgress } from '../hooks/useJiraProgress'
import DashboardCard from '../components/dashboard/DashboardCard'
import CalendarSummaryCard from '../components/dashboard/CalendarSummaryCard'
import JiraSummaryCard from '../components/dashboard/JiraSummaryCard'
import QuickGuideSection from '../components/dashboard/QuickGuideSection'

export default function Dashboard() {
  const { events, loading: loadingEvents, error: calendarError } = useCalendarEvents()
  const { summary: jiraSummary, loading: loadingJira, error: jiraError } = useJiraProgress()

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.24em]">
            Team Assistant Workspace
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-semibold text-slate-900 leading-tight">
          Selamat datang, <span className="text-cyan-700">Admin</span>
        </h1>
        <p className="text-slate-500 mt-3 text-sm max-w-2xl leading-relaxed">
          Satu platform terpadu untuk delegasi tugas operasional, akses knowledge base internal, dan manajemen dokumen SOP.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
        {DASHBOARD_CARDS.map((card) => (
          <DashboardCard key={card.to} {...card} />
        ))}
      </div>

      <CalendarSummaryCard events={events} loading={loadingEvents} error={calendarError} />

      <JiraSummaryCard summary={jiraSummary} loading={loadingJira} error={jiraError} />

      <QuickGuideSection />
    </div>
  )
}
