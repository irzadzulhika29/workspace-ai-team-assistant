import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { LayoutDashboard, MessageSquare, Brain, FolderOpen, CalendarDays, Bug, Settings, Plus, Loader2, Trash2, X, Plug, BarChart3, Mail } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { shallow } from 'zustand/shallow'
import SettingsModal from '../ui/SettingsModal'
import { useChatStore } from '../../store/chatStore'
import { sessionApi } from '../../services/sessionService'
import { useSidebar } from '../../context/SidebarContext'

const navItems = [
  { to: '/',                 icon: LayoutDashboard, label: 'Dashboard'         },
  { to: '/chat/supervisor',  icon: MessageSquare,   label: 'Supervisor Agent'  },
  { to: '/chat/knowledge',   icon: Brain,           label: 'Knowledge Agent'   },
  { to: '/workspace/files',  icon: FolderOpen,      label: 'Documents'         },
  { to: '/workspace/calendar', icon: CalendarDays,  label: 'Calendar'          },
  { to: '/workspace/email',  icon: Mail,            label: 'Email'             },
  { to: '/workspace/jira',   icon: Bug,             label: 'Jira'              },
  { to: '/monitoring/tokens', icon: BarChart3,      label: 'Token Monitor'     },
  { to: '/integrations',     icon: Plug,            label: 'Integrations'      },
]

export default function Sidebar() {
  const [settingsOpen, setSettingsOpen] = useState(false)
  const location = useLocation()
  const isKnowledgePage  = location.pathname === '/chat/knowledge'
  const isSupervisorPage = location.pathname === '/chat/supervisor'
  const { open: mobileOpen, close: closeMobile } = useSidebar()

  // ── Knowledge session state ───────────────────────────────────────────
  const {
    knowledgeSessions,
    activeKnowledgeSessionId,
    setKnowledgeSessions,
    setActiveKnowledgeSession,
    setKnowledgeMessages,
    clearKnowledge,
    // supervisor
    supervisorSessions,
    activeSupervisorSessionId,
    setSupervisorSessions,
    setActiveSupervisorSession,
    setSupervisorMessages,
    clearSupervisor,
    isAutoSending,
  } = useChatStore(
    (state) => ({
      knowledgeSessions: state.knowledgeSessions,
      activeKnowledgeSessionId: state.activeKnowledgeSessionId,
      setKnowledgeSessions: state.setKnowledgeSessions,
      setActiveKnowledgeSession: state.setActiveKnowledgeSession,
      setKnowledgeMessages: state.setKnowledgeMessages,
      clearKnowledge: state.clearKnowledge,
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

  const [loadingSessions,      setLoadingSessions]      = useState(false)
  const [loadingHistory,       setLoadingHistory]       = useState(false)
  const [creatingSession,      setCreatingSession]      = useState(false)
  const [loadingSupSessions,   setLoadingSupSessions]   = useState(false)
  const [loadingSupHistory,    setLoadingSupHistory]    = useState(false)
  const [creatingSupSession,   setCreatingSupSession]   = useState(false)

  // ─────────────────────────────────────────────────────────────────────
  // KNOWLEDGE helpers
  // ─────────────────────────────────────────────────────────────────────
  const loadSessionHistory = useCallback(async (sessionId) => {
    setLoadingHistory(true)
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
        }
      })
      setKnowledgeMessages(messages)
    } catch (err) {
      console.error('Gagal memuat riwayat knowledge:', err)
      setKnowledgeMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }, [setKnowledgeMessages])

  const handleNewChat = useCallback(async () => {
    setCreatingSession(true)
    try {
      const sesi = await sessionApi.buatSesiBaru('Obrolan Baru', 'rag_chat')
      if (sesi) {
        setActiveKnowledgeSession(sesi.id)
        clearKnowledge()
        const sessions = await sessionApi.ambilSemuaSesi('rag_chat')
        setKnowledgeSessions(sessions)
      }
    } catch (err) {
      console.error('Gagal membuat sesi knowledge baru:', err)
    } finally {
      setCreatingSession(false)
    }
  }, [clearKnowledge, setActiveKnowledgeSession, setKnowledgeSessions])

  const loadSessions = useCallback(async () => {
    setLoadingSessions(true)
    try {
      const sessions = await sessionApi.ambilSemuaSesi('rag_chat')
      setKnowledgeSessions(sessions)

      if (!activeKnowledgeSessionId && sessions.length === 0) {
        await handleNewChat()
      } else if (sessions.length > 0) {
        const hasActiveSession =
          activeKnowledgeSessionId &&
          sessions.some((s) => s.id === activeKnowledgeSessionId)

        const targetSessionId = hasActiveSession
          ? activeKnowledgeSessionId
          : sessions[0].id

        if (!hasActiveSession) setActiveKnowledgeSession(targetSessionId)
        await loadSessionHistory(targetSessionId)
      }
    } catch (err) {
      console.error('Gagal memuat sesi knowledge:', err)
    } finally {
      setLoadingSessions(false)
    }
  }, [activeKnowledgeSessionId, handleNewChat, loadSessionHistory, setActiveKnowledgeSession, setKnowledgeSessions])

  useEffect(() => {
    if (isKnowledgePage) loadSessions()
  }, [isKnowledgePage, loadSessions])

  const handleSelectKnowledgeSession = async (sessionId) => {
    if (sessionId === activeKnowledgeSessionId) return
    setActiveKnowledgeSession(sessionId)
    await loadSessionHistory(sessionId)
  }

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

      if (!activeSupervisorSessionId && sessions.length === 0) {
        await handleNewSupChat()
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
  }, [activeSupervisorSessionId, handleNewSupChat, loadSupSessionHistory, setActiveSupervisorSession, setSupervisorSessions, isAutoSending])

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
  const hapusSesi = async (e, sessionId) => {
    e.stopPropagation()
    const berhasil = await sessionApi.hapusSesiChat(sessionId)
    if (!berhasil) return
    const sessions = await sessionApi.ambilSemuaSesi('rag_chat')
    setKnowledgeSessions(sessions)
    if (sessionId === activeKnowledgeSessionId) {
      if (sessions.length > 0) {
        setActiveKnowledgeSession(sessions[0].id)
        await loadSessionHistory(sessions[0].id)
      } else {
        await handleNewChat()
      }
    }
  }

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
        await handleNewSupChat()
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
    <div className="mt-2 ml-3 pl-3 border-l ghost-divider space-y-1 animate-fade-in">
      <button
        onClick={onNewChat}
        disabled={creating}
        className="
          w-full flex items-center gap-2
          px-2.5 py-1.5 rounded-md text-xs font-medium
          bg-brand-600 hover:bg-brand-700 text-white shadow-[0_12px_24px_rgba(0,97,132,0.18)]
          transition-all duration-200 active:scale-[0.98]
          disabled:opacity-50 disabled:cursor-not-allowed
        "
      >
        {creating ? (
          <Loader2 size={12} className="animate-spin" />
        ) : (
          <Plus size={12} />
        )}
        {creating ? 'Membuat...' : 'New Chat'}
      </button>

      <p className="text-slate-400 text-[9px] font-mono uppercase tracking-widest px-1 pt-1">
        Riwayat
      </p>

      <div className="max-h-[calc(100vh-380px)] overflow-y-auto sidebar-scrollbar space-y-0.5 pr-0.5">
        {loading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 size={14} className="animate-spin text-slate-500" />
          </div>
        ) : sessions.length === 0 ? (
          <p className="text-[10px] text-slate-600 text-center py-3 px-1">
            Belum ada sesi.
          </p>
        ) : (
          sessions.map((session) => {
            const isActive = session.id === activeSessionId
            return (
              <div
                key={session.id}
                className={`
                  w-full flex items-center gap-1 rounded-md
                  transition-all duration-150 group relative
                  ${isActive
                    ? 'bg-white text-slateui-900 shadow-sm'
                    : 'text-slateui-500 hover:text-slateui-900 hover:bg-white/55'
                   }
                `}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-4 bg-brand-600 rounded-r-full" />
                )}
                <button
                  onClick={() => onSelectSession(session.id)}
                  className="flex items-start gap-2 px-2 py-1.5 text-left flex-1 min-w-0"
                >
                  <MessageSquare
                    size={11}
                    className={`mt-0.5 flex-shrink-0 ${
                      isActive ? 'text-brand-600' : 'text-slate-400 group-hover:text-slateui-500'
                    }`}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium truncate">
                      {session.judul || 'Obrolan Baru'}
                    </p>
                    <p className={`text-[9px] mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                      {formatDate(session.created_at)}
                    </p>
                  </div>
                </button>
                <button
                  onClick={(e) => onDeleteSession(e, session.id)}
                  title="Hapus sesi"
                  className={`
                    flex-shrink-0 p-1 mr-1 rounded opacity-0 group-hover:opacity-100
                    transition-opacity duration-150
                    ${isActive
                     ? 'hover:bg-surface-high text-slate-400 hover:text-red-500'
                      : 'hover:bg-surface text-slate-400 hover:text-red-500'
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
        <div className="flex items-center gap-1.5 px-1 py-1 text-[10px] text-slate-500">
          <Loader2 size={10} className="animate-spin" />
          Memuat riwayat...
        </div>
      )}
    </div>
  )

  return (
    <>
      <aside className={`
        fixed top-0 left-0 h-screen z-40
        bg-surface-high/95 backdrop-blur-xl flex flex-col
        border-r border-white/30
        select-none transition-transform duration-300
        w-[240px]
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:w-[var(--sidebar-width)]
      `} style={{ '--sidebar-width': '240px' }}>
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-5 border-b ghost-divider justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-[0_12px_24px_rgba(0,97,132,0.18)]">
              <MessageSquare size={14} className="text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="text-slateui-900 text-base font-bold font-headline leading-tight truncate">
                AI Team Assistant
              </p>
              <p className="text-[10px] uppercase tracking-[0.24em] text-slate-500 mt-1">Executive Canvas</p>
            </div>
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={closeMobile}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto sidebar-scrollbar">
          <p className="text-slate-400 text-[10px] font-mono uppercase tracking-widest px-3 pb-2">
            Workspace
          </p>
          {navItems.map(({ to, icon: Icon, label }) => (
            <div key={to}>
              <NavLink
                to={to}
                end={to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                   transition-all duration-150 relative
                   ${isActive
                       ? 'bg-white text-brand-700 shadow-sm translate-x-1'
                       : 'text-slateui-500 hover:text-slateui-900 hover:bg-white/55'
                     }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-brand-600 rounded-r-full" />
                    )}
                    <Icon size={16} className={isActive ? 'text-brand-600' : 'text-slateui-500 group-hover:text-slateui-700'} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>

              {/* Knowledge session sub-menu */}
              {to === '/chat/knowledge' && isKnowledgePage && renderSessionList({
                sessions: knowledgeSessions,
                activeSessionId: activeKnowledgeSessionId,
                loading: loadingSessions,
                loadingHistory,
                creating: creatingSession,
                onNewChat: handleNewChat,
                onSelectSession: handleSelectKnowledgeSession,
                onDeleteSession: hapusSesi,
              })}

              {/* Supervisor session sub-menu */}
              {to === '/chat/supervisor' && isSupervisorPage && renderSessionList({
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

        <div className="px-4 pb-4 space-y-1 border-t ghost-divider pt-3">
          <button
            onClick={() => setSettingsOpen(true)}
            className="
              w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-slateui-500 hover:text-slateui-900 hover:bg-white/55
              transition-colors duration-150
            "
          >
            <Settings size={16} className="text-slateui-500" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      <SettingsModal open={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  )
}
