import { Link } from 'react-router-dom'
import { MessageSquare, Brain, FolderOpen, ArrowRight, Zap, Database, FileStack } from 'lucide-react'
import { useChatStore } from '../store/chatStore'

const CARDS = [
  {
    to:      '/chat/supervisor',
    icon:    MessageSquare,
    title:   'Supervisor Agent',
    desc:    'Delegasikan tugas Jira, Google Calendar, dan operasional ke AI secara otomatis.',
    color:   'text-brand-600',
    bg:      'bg-brand-50',
    border:  'border-brand-200',
    accent:  Zap,
  },
  {
    to:      '/chat/knowledge',
    icon:    Brain,
    title:   'Knowledge Agent',
    desc:    'Tanya jawab berbasis dokumen SOP internal dengan sitasi halaman yang bisa diverifikasi.',
    color:   'text-violet-600',
    bg:      'bg-violet-50',
    border:  'border-violet-200',
    accent:  Database,
  },
  {
    to:      '/workspace/files',
    icon:    FolderOpen,
    title:   'Document Workspace',
    desc:    'Upload SOP, kelola laporan AI, dan atur folder dokumen referensi tim.',
    color:   'text-amber-600',
    bg:      'bg-amber-50',
    border:  'border-amber-200',
    accent:  FileStack,
  },
]

export default function Dashboard() {
  const { supervisorMessages, knowledgeMessages, isConnected } = useChatStore()

  const stats = [
    { label: 'Pesan Supervisor',  value: supervisorMessages.length },
    { label: 'Pesan Knowledge',   value: knowledgeMessages.length  },
    { label: 'Status n8n',        value: isConnected === null ? '—' : isConnected ? 'Online' : 'Offline',
      valueClass: isConnected ? 'text-emerald-600' : isConnected === false ? 'text-red-600' : '' },
  ]

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">
            Team Assistant Workspace
          </span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 leading-tight">
          Selamat datang, <span className="text-brand-600">Tim Jalin Mayantara</span>
        </h1>
        <p className="text-slate-500 mt-2 text-sm max-w-xl">
          Satu platform terpadu untuk delegasi tugas operasional, akses knowledge base internal, dan manajemen dokumen SOP.
        </p>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 mb-8 p-4 bg-white border border-gray-200 rounded-xl">
        {stats.map(({ label, value, valueClass = 'text-slate-800' }) => (
          <div key={label} className="flex flex-col">
            <span className={`text-lg font-bold font-mono ${valueClass}`}>{value}</span>
            <span className="text-xs text-slate-400">{label}</span>
          </div>
        ))}
        <div className="ml-auto text-xs text-slate-400 font-mono">
          {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {CARDS.map(({ to, icon: Icon, title, desc, color, bg, border, accent: Accent }) => (
          <Link
            key={to}
            to={to}
            className={`
              group relative flex flex-col gap-4 p-5 rounded-xl border bg-white
              ${border}
              hover:shadow-md hover:-translate-y-0.5
              transition-all duration-200
            `}
          >
            <div className={`w-10 h-10 ${bg} rounded-lg flex items-center justify-center`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-800 mb-1">{title}</h3>
              <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
            </div>
            <div className={`flex items-center gap-1.5 text-xs font-semibold ${color} mt-auto`}>
              <span>Buka workspace</span>
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
            </div>

            {/* Corner accent */}
            <Accent
              size={40}
              className={`absolute top-4 right-4 opacity-5 ${color}`}
            />
          </Link>
        ))}
      </div>

      {/* Quick tips */}
      <div className="mt-8 p-4 border border-gray-200 rounded-xl bg-white">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Panduan Cepat</p>
        <ul className="space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full mt-2 flex-shrink-0" />
            Gunakan <strong>Settings</strong> di sidebar untuk mengubah URL webhook n8n tanpa perlu rebuild.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-2 flex-shrink-0" />
            Upload dokumen SOP ke folder <strong>Input (SOP)</strong> agar bisa digunakan oleh Knowledge Agent.
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full mt-2 flex-shrink-0" />
            Riwayat chat tersimpan selama sesi aktif browser. Refresh halaman tidak akan menghapus riwayat percakapan.
          </li>
        </ul>
      </div>
    </div>
  )
}
