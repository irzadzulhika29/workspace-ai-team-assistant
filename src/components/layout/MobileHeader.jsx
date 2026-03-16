import React from 'react'
import { Menu, MessageSquare } from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/':                    'Dashboard',
  '/chat/supervisor':     'Supervisor Agent',
  '/chat/knowledge':      'Knowledge Agent',
  '/workspace/files':     'Documents',
  '/workspace/calendar':  'Calendar',
  '/workspace/jira':      'Jira',
}

export default function MobileHeader() {
  const { toggle } = useSidebar()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'AI Team Assistant'

  return (
    <header className="
      md:hidden flex items-center gap-3 px-4 h-14
      border-b border-slate-200 bg-white/80 backdrop-blur-md
      sticky top-0 z-20
    ">
      <button
        onClick={toggle}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0">
          <MessageSquare size={12} className="text-white" />
        </div>
        <span className="text-sm font-semibold text-slate-900 truncate">{title}</span>
      </div>
    </header>
  )
}
