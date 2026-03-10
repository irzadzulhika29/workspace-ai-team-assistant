import { NavLink } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Brain, FolderOpen, Settings } from 'lucide-react'
import ConnectionStatus from './ConnectionStatus'
import { useState } from 'react'
import SettingsModal from '../ui/SettingsModal'

const navItems = [
  { to: '/',                 icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/chat/supervisor',  icon: MessageSquare,   label: 'Supervisor Agent'  },
  { to: '/chat/knowledge',   icon: Brain,           label: 'Knowledge Agent'   },
  { to: '/workspace/files',  icon: FolderOpen,      label: 'Documents'         },
]

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <>
      <aside className="
        fixed top-0 left-0 h-screen
        w-[var(--sidebar-width)] z-40
        bg-slate-950 flex flex-col
        border-r border-slate-800
        select-none
      ">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-800">
          <div className="w-7 h-7 rounded-md bg-brand-500 flex items-center justify-center flex-shrink-0">
            <MessageSquare size={14} className="text-white" />
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold leading-tight truncate">
              Team Assistant
            </p>
            <p className="text-slate-500 text-[10px] font-mono leading-tight truncate">
              Jalin Mayantara
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto sidebar-scrollbar">
          <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest px-3 pb-2">
            Workspace
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
                 transition-colors duration-150 relative
                 ${isActive
                   ? 'bg-slate-800 text-white'
                   : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                 }`
              }
            >
              {({ isActive }) => (
                <>
                  {/* Active accent line */}
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-500 rounded-r-full" />
                  )}
                  <Icon size={16} className={isActive ? 'text-brand-400' : 'text-slate-500 group-hover:text-slate-300'} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 pb-4 space-y-1 border-t border-slate-800 pt-3">
          <ConnectionStatus />
          <button
            onClick={() => setSettingsOpen(true)}
            className="
              w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium
              text-slate-400 hover:text-white hover:bg-slate-800/60
              transition-colors duration-150
            "
          >
            <Settings size={16} className="text-slate-500" />
            Settings
          </button>
        </div>
      </aside>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
