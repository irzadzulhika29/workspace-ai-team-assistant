import React from 'react'
import { Menu, MessageSquare } from 'lucide-react'
import { useSidebar } from '../../context/SidebarContext'
import { useLocation } from 'react-router-dom'

const PAGE_TITLES = {
  '/': 'Dashboard',
  '/chat/supervisor': 'AI Workspace Assistant',
  '/workspace/files': 'Documents',
  '/workspace/calendar': 'Calendar',
  '/workspace/email': 'Email',
  '/workspace/jira': 'Jira',
  '/monitoring/tokens': 'Token Monitor',
  '/settings': 'Settings',
}

export default function MobileHeader() {
  const { toggle } = useSidebar()
  const location = useLocation()
  const title = PAGE_TITLES[location.pathname] ?? 'AI Team Assistant'

  return (
    <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-neutral-200 bg-white/95 px-4 shadow-xs backdrop-blur-md md:hidden">
      <button
        onClick={toggle}
        type="button"
        className="rounded-lg p-1.5 text-neutral-500 transition-colors hover:bg-primary-50 hover:text-primary-600"
        aria-label="Toggle menu"
      >
        <Menu size={20} />
      </button>

      <div className="flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-primary-500 shadow-stat">
          <MessageSquare size={12} className="text-white" />
        </div>
        <span className="truncate text-sm font-bold font-headline text-neutral-900">{title}</span>
      </div>
    </header>
  )
}
