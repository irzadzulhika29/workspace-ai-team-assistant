import React from 'react'
import { Calendar, FileSpreadsheet, FileText, Mail, FolderOpen, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import JiraIntegrationCard from '../components/integrations/JiraIntegrationCard'

const googleServices = [
  {
    id: 'drive',
    name: 'Google Drive',
    icon: FolderOpen,
    description: 'Akses dan kelola file di Drive',
    tone: 'text-blue-700 bg-blue-50 border-blue-100',
  },
  {
    id: 'calendar',
    name: 'Google Calendar',
    icon: Calendar,
    description: 'Sinkronisasi event kalender',
    tone: 'text-cyan-700 bg-cyan-50 border-cyan-100',
  },
  {
    id: 'gmail',
    name: 'Gmail',
    icon: Mail,
    description: 'Baca dan kirim email',
    tone: 'text-rose-700 bg-rose-50 border-rose-100',
  },
  {
    id: 'sheets',
    name: 'Google Sheets',
    icon: FileSpreadsheet,
    description: 'Kelola spreadsheet',
    tone: 'text-green-700 bg-green-50 border-green-100',
  },
  {
    id: 'docs',
    name: 'Google Docs',
    icon: FileText,
    description: 'Akses dan review dokumen',
    tone: 'text-amber-700 bg-amber-50 border-amber-100',
  },
]

export default function IntegrationsPage() {
  const { user } = useAuth()

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-5 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <p className="text-[11px] font-mono text-slate-400 uppercase tracking-[0.2em] mb-2">
            Settings / Integrations
          </p>
          <h1 className="text-2xl md:text-3xl font-semibold text-slate-900">Integrations</h1>
          <p className="text-sm text-slate-500 mt-2">
            Kelola koneksi Google Workspace dan Jira untuk AI agent.
          </p>
        </div>

        {/* Connected Status */}
        {user && (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 md:p-6">
            <div className="flex items-start gap-3">
              <CheckCircle2 size={20} className="text-emerald-700 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-lg font-semibold text-slate-900">Connected as {user.name}</p>
                <p className="text-sm text-slate-600 mt-1">{user.email}</p>
                <p className="text-xs text-emerald-700 mt-2">
                  AI Agent dapat mengakses Google Workspace services atas nama Anda.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1.3fr_1fr] gap-6">
          <JiraIntegrationCard authenticated={Boolean(user)} />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Google Workspace</h2>
            <p className="text-sm text-slate-500 mt-1 mb-5">
              AI Agent dapat mengakses layanan Google berikut via OAuth saat Anda login.
            </p>

            <div className="space-y-3">
              {googleServices.map(({ id, name, icon: Icon, description, tone }) => (
                <div key={id} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${tone}`}>
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{name}</p>
                      <p className="text-xs text-slate-500 mt-1">{description}</p>
                    </div>
                    <CheckCircle2 size={16} className="text-emerald-600 flex-shrink-0 mt-1" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 p-4 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-xs text-blue-800 leading-relaxed">
                <strong>Info:</strong> Koneksi Google Workspace dikelola otomatis saat login. 
                AI Agent menggunakan kredensial OAuth Anda untuk mengakses layanan di atas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
