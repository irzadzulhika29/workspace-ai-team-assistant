import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, FolderOpen, CalendarDays, Settings, Plus, Loader2, Trash2, X, BarChart3, Mail, ChevronLeft, ChevronRight } from 'lucide-react'
import { FaTasks } from 'react-icons/fa'
import logoPng from '/logo.png'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'
import { Button, NavItem } from '@/components/ui'
import { useChatStore } from '../../store/chatStore'
import { sessionApi } from '../../services/sessionService'
import { useSidebar } from '../../context/SidebarContext'

const navItems = [
  { to: '/',                 icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/chat/supervisor',  icon: MessageSquare,   label: 'Supervisor Agent'  },
  { to: '/workspace/files',  icon: FolderOpen,      label: 'Documents'         },
  { to: '/workspace/calendar', icon: CalendarDays,  label: 'Calendar'          },
  { to: '/workspace/email',  icon: Mail,            label: 'Email'             },
  { to: '/workspace/jira',   icon: FaTasks,         label: 'Jira'              },
  { to: '/monitoring/tokens', icon: BarChart3,      label: 'Token Monitor'     },
  { to: '/settings',         icon: Settings,        label: 'Settings'          },
]

export default function Sidebar() {
  const location = useLocation()
  const isSupervisorPage = location.pathname === '/chat/supervisor'
  const { open: mobileOpen, collapsed, close: closeMobile, toggleCollapse } = useSidebar()

  // ── Supervisor session state ───────────────────────────────────────────
  const {
    supervisorSessions,
    activeSupervisorSessionId,
    setSupervisorSessions,
    setActiveSupervisorSession,
    setSupervisorMessages,
    clearSupervisor,
    isAutoSending,
  } = useChatStore(
    (state) => ({
      supervisorSessions: state.supervisorSessions,
      activeSupervisorSessionId: state.activeSupervisorSessionId,
      setSupervisorSessions: state.setSupervisorSessions,
      setActiveSupervisorSession: state.setActiveSupervisorSession,
      setSupervisorMessages: state.setSupervisorMessages,
      clearSupervisor: state.clearSupervisor,
      isAutoSending: state.isAutoSending,
    }),
    shallow,
  )

  const [loadingSupSessions,   setLoadingSupSessions]   = useState(false)
  const [loadingSupHistory,    setLoadingSupHistory]    = useState(false)
  const [creatingSupSession,   setCreatingSupSession]   = useState(false)

  // ─────────────────────────────────────────────────────────────────────
  // SUPERVISOR helpers
  // ─────────────────────────────────────────────────────────────────────
  const loadSupSessionHistory = useCallback(async (sessionId) => {
    setLoadingSupHistory(true)
    try {
      const riwayat = await sessionApi.ambilRiwayatChat(sessionId)
      const messages = riwayat.map((row) => {
        const msgData = row.message || {}
        const content = msgData.kwargs?.content ?? msgData.data?.content ?? msgData.content ?? ''
        const type    = (msgData.id?.[msgData.id.length - 1] || msgData.type || '').toLowerCase()
        return {
          id:        row.id?.toString() || crypto.randomUUID(),
          role:      type.includes('human') ? 'user' : 'ai',
          content,
          timestamp: row.created_at || new Date().toISOString(),
          actionResults: msgData.actionResults ?? {},
          forwardedEmail: msgData.forwardedEmail ?? null,
          promptCard: msgData.promptCard ?? null,
          documentAttachment: msgData.documentAttachment ?? null,
        }
      })
      setSupervisorMessages(messages)
    } catch (err) {
      console.error('Gagal memuat riwayat supervisor:', err)
      setSupervisorMessages([])
    } finally {
      setLoadingSupHistory(false)
    }
  }, [setSupervisorMessages])

  const handleNewSupChat = useCallback(async () => {
    setCreatingSupSession(true)
    try {
      const sesi = await sessionApi.buatSesiBaru('Obrolan Baru', 'general_chat')
      if (sesi) {
        setActiveSupervisorSession(sesi.id)
        clearSupervisor()
        const sessions = await sessionApi.ambilSemuaSesi('general_chat')
        setSupervisorSessions(sessions)
      }
    } catch (err) {
      console.error('Gagal membuat sesi supervisor baru:', err)
    } finally {
      setCreatingSupSession(false)
    }
  }, [clearSupervisor, setActiveSupervisorSession, setSupervisorSessions])

  const loadSupSessions = useCallback(async () => {
    // Skip loading if auto-sending (Magic Button)
    if (isAutoSending) {
      console.log('Skipping session load - auto-send in progress');
      return;
    }
    
    setLoadingSupSessions(true)
    try {
      const sessions = await sessionApi.ambilSemuaSesi('general_chat')
      setSupervisorSessions(sessions)

      if (sessions.length === 0) {
        setActiveSupervisorSession(null)
        clearSupervisor()
      } else if (sessions.length > 0) {
        const hasActiveSession =
          activeSupervisorSessionId &&
          sessions.some((s) => s.id === activeSupervisorSessionId)

        const targetSessionId = hasActiveSession
          ? activeSupervisorSessionId
          : sessions[0].id

        if (!hasActiveSession) setActiveSupervisorSession(targetSessionId)
        await loadSupSessionHistory(targetSessionId)
      }
    } catch (err) {
      console.error('Gagal memuat sesi supervisor:', err)
    } finally {
      setLoadingSupSessions(false)
    }
  }, [activeSupervisorSessionId, clearSupervisor, loadSupSessionHistory, setActiveSupervisorSession, setSupervisorSessions, isAutoSending])

  useEffect(() => {
    if (isSupervisorPage) loadSupSessions()
  }, [isSupervisorPage, loadSupSessions])

  const handleSelectSupSession = async (sessionId) => {
    if (sessionId === activeSupervisorSessionId) return
    setActiveSupervisorSession(sessionId)
    await loadSupSessionHistory(sessionId)
  }

  // ─────────────────────────────────────────────────────────────────────
  // DELETE handlers
  // ─────────────────────────────────────────────────────────────────────
  const hapusSupSesi = async (e, sessionId) => {
    e.stopPropagation()
    const berhasil = await sessionApi.hapusSesiChat(sessionId)
    if (!berhasil) return
    const sessions = await sessionApi.ambilSemuaSesi('general_chat')
    setSupervisorSessions(sessions)
    if (sessionId === activeSupervisorSessionId) {
      if (sessions.length > 0) {
        setActiveSupervisorSession(sessions[0].id)
        await loadSupSessionHistory(sessions[0].id)
      } else {
        setActiveSupervisorSession(null)
        clearSupervisor()
      }
    }
  }

  // ─────────────────────────────────────────────────────────────────────
  // Helpers
  // ─────────────────────────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins  = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays  = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1)   return 'Baru saja'
    if (diffMins < 60)  return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7)   return `${diffDays} hari lalu`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  const isRouteActive = (path) => (
    path === '/' ? location.pathname === '/' : location.pathname === path
  )

  // Reusable session list renderer
  const renderSessionList = ({
    sessions,
    activeSessionId,
    loading,
    loadingHistory: loadHist,
    creating,
    onNewChat,
    onSelectSession,
    onDeleteSession,
  }) => (
    <div className="mt-3 ml-4 space-y-2 border-l border-neutral-200 pl-4 animate-fade-in">
      <Button
        onClick={onNewChat}
        disabled={creating}
        size="sm"
        className="w-full justify-center gap-2 rounded-lg"
      >
        {creating ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Plus size={12} />
        )}
        {creating ? 'Membuat...' : 'New Chat'}
      </Button>

      <p className="px-1 pt-1 text-[9px] font-mono uppercase tracking-[0.24em] text-neutral-400">
        Riwayat
      </p>

      <div className="max-h-[calc(100vh-380px)] overflow-y-auto sidebar-scrollbar space-y-0.5 pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={14} className="animate-spin text-neutral-500" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="px-1 py-3 text-center text-[10px] text-neutral-500">
            Belum ada sesi.
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId
            return (
              <div
                key={session.id}
                className={`
                  group relative flex w-full items-center gap-1 rounded-lg border
                  transition-all duration-150
                  ${isActive
                    ? 'border-primary-200 bg-primary-50/70 text-neutral-900 shadow-sm'
                    : 'border-transparent text-neutral-500 hover:border-neutral-200 hover:bg-neutral-50 hover:text-neutral-900'
                   }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r-full bg-primary-500" />
                )}
                <button
                  type="button"
                  onClick={() => onSelectSession(session.id)}
                  className="flex items-start gap-2 px-2 py-1.5 text-left flex-1 min-w-0"
                >
                  <MessageSquare
                    size={11}
                    className={`mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-primary-500' : 'text-neutral-400 group-hover:text-primary-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate">
                      {session.judul || 'Obrolan Baru'}
                    </p>
                    <p className={`mt-0.5 text-[9px] ${isActive ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={(e) => onDeleteSession(e, session.id)}
                  title="Hapus sesi"
                  className={`
                    mr-1 flex-shrink-0 rounded p-1 opacity-0 transition-all duration-150 group-hover:opacity-100
                    ${isActive
                     ? 'text-neutral-400 hover:bg-white hover:text-error'
                      : 'text-neutral-400 hover:bg-white hover:text-error'
                     }
                   `}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            )
          })
        )}
      </div>

      {loadHist && (
        <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] text-neutral-500">
          <Loader2 size={10} className="animate-spin" />
          Memuat riwayat...
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside className={`
        fixed left-0 top-0 z-40 flex h-screen flex-col
        border-r border-neutral-200 bg-white/95
        select-none shadow-sm backdrop-blur-xl transition-all duration-300
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
        ${collapsed ? 'md:w-[72px]' : 'md:w-[270px]'}
        w-[270px]
      `}>
        {/* Header */}
        <div className="relative flex items-center justify-between gap-3 border-b border-neutral-200 bg-gradient-stat px-4 py-5 text-white">
          <div className={`flex items-center gap-3 overflow-hidden transition-all duration-300 ${collapsed ? 'md:opacity-0 md:w-0' : 'opacity-100'}`}>
            <div className="flex bg-white/50 rounded-xl h-10 w-10 flex-shrink-0 items-center justify-center   shadow-stat">
              <img src={logoPng} alt="AI Team Assistant" className="h-6 w-6" />
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-base font-bold font-paytone leading-tight text-white">
                AI Team Assistant
              </p>
            </div>
          </div>
          
          {/* Logo only when collapsed (desktop) */}
          <div className={`pointer-events-none absolute inset-0 hidden md:flex items-center justify-center transition-all duration-300 ${collapsed ? 'opacity-100' : 'opacity-0'}`}>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/95 shadow-stat">
              <img src={logoPng} alt="AI Team Assistant" className="h-6 w-6" />
            </div>
          </div>
          
          {/* Close button — mobile only */}
          <button
            onClick={closeMobile}
            type="button"
            className="rounded-lg p-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white md:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto sidebar-scrollbar">
          <p className={`px-3 pb-2 text-[10px] font-mono uppercase tracking-widest text-neutral-400 transition-all duration-300 ${collapsed ? 'md:opacity-0 md:h-0 md:pb-0' : 'opacity-100'}`}>
            Workspace
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <div key={to}>
              <NavItem
                asChild
                icon={<Icon size={16} />}
                label={label}
                active={isRouteActive(to)}
                collapsed={collapsed}
                className="rounded-xl px-3 py-2.5"
                title={collapsed ? label : ''}
              >
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={closeMobile}
                />
              </NavItem>

              {/* Supervisor session sub-menu - hide when collapsed */}
              {!collapsed && to === '/chat/supervisor' && isSupervisorPage && renderSessionList({
                sessions: supervisorSessions,
                activeSessionId: activeSupervisorSessionId,
                loading: loadingSupSessions,
                loadingHistory: loadingSupHistory,
                creating: creatingSupSession,
                onNewChat: handleNewSupChat,
                onSelectSession: handleSelectSupSession,
                onDeleteSession: hapusSupSesi,
              })}
            </div>
          ))}
        </nav>

        {/* Collapse toggle button - positioned at sidebar border center */}
        <button
          onClick={toggleCollapse}
          type="button"
          className={`
            hidden md:flex items-center justify-center
            absolute top-1/2 -translate-y-1/2 -right-4
            w-8 h-8 rounded-full
            bg-white border-2 border-neutral-200
            shadow-sm hover:shadow-md
            text-neutral-500 hover:text-primary-500 hover:border-primary-200
            transition-all duration-200
            z-50
            ${collapsed ? '' : ''}
          `}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? (
            <ChevronRight size={16} />
          ) : (
            <ChevronLeft size={16} />
          )}
        </button>
      </aside>
    </>
  )
}
