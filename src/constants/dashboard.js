import { MessageSquare, Brain, FolderOpen, Zap, Database, FileStack } from 'lucide-react'

// Display limits
export const MAX_CALENDAR_EVENTS = 3
export const MAX_JIRA_STATUS_DISPLAY = 5

// Jira status keywords
export const DONE_STATUS_KEYWORDS = ['done', 'closed', 'resolved', 'complete', 'completed']

// Dashboard cards configuration
export const DASHBOARD_CARDS = [
  {
    to: '/chat/supervisor',
    icon: MessageSquare,
    title: 'Supervisor Agent',
    desc: 'Delegasikan tugas Jira, Google Calendar, dan operasional ke AI secara otomatis.',
    tone: 'text-cyan-700 bg-cyan-50 border-cyan-100',
    accent: Zap,
  },
  {
    to: '/chat/knowledge',
    icon: Brain,
    title: 'Knowledge Agent',
    desc: 'Tanya jawab berbasis dokumen SOP internal dengan sitasi halaman yang bisa diverifikasi.',
    tone: 'text-slate-700 bg-slate-100 border-slate-200',
    accent: Database,
  },
  {
    to: '/workspace/files',
    icon: FolderOpen,
    title: 'Document Workspace',
    desc: 'Upload SOP, kelola laporan AI, dan atur folder dokumen referensi tim.',
    tone: 'text-emerald-700 bg-emerald-50 border-emerald-100',
    accent: FileStack,
  },
]
