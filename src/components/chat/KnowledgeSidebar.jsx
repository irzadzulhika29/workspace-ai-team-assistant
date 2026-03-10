import { useEffect, useState } from 'react'
import { Plus, MessageSquare, Loader2 } from 'lucide-react'
import { useChatStore } from '../../store/chatStore'
import { sessionApi } from '../../services/sessionService'

/**
 * Sidebar panel for Knowledge Chat sessions.
 * Shows a "New Chat" button and a scrollable list of past sessions.
 */
export default function KnowledgeSidebar() {
  const {
    knowledgeSessions,
    activeKnowledgeSessionId,
    setKnowledgeSessions,
    setActiveKnowledgeSession,
    setKnowledgeMessages,
    clearKnowledge,
  } = useChatStore()

  const [loadingSessions, setLoadingSessions] = useState(false)
  const [loadingHistory, setLoadingHistory]   = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)

  // ── Load sessions on mount ──────────────────────────────────────────────
  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoadingSessions(true)
    try {
      const sessions = await api.ambilSemuaSesi()
      setKnowledgeSessions(sessions)

      // Jika belum ada sesi aktif, auto-buat sesi baru
      if (!activeKnowledgeSessionId && sessions.length === 0) {
        await handleNewChat()
      } else if (!activeKnowledgeSessionId && sessions.length > 0) {
        // Pilih sesi terakhir secara otomatis
        setActiveKnowledgeSession(sessions[0].id)
      }
    } catch (err) {
      console.error('Gagal memuat sesi:', err)
    } finally {
      setLoadingSessions(false)
    }
  }

  // ── Create new session ──────────────────────────────────────────────────
  const handleNewChat = async () => {
    setCreatingSession(true)
    try {
      const sesi = await api.buatSesiBaru('Obrolan Baru')
      if (sesi) {
        setActiveKnowledgeSession(sesi.id)
        clearKnowledge()
        // Refresh daftar sesi
        const sessions = await api.ambilSemuaSesi()
        setKnowledgeSessions(sessions)
      }
    } catch (err) {
      console.error('Gagal membuat sesi baru:', err)
    } finally {
      setCreatingSession(false)
    }
  }

  // ── Switch to existing session ──────────────────────────────────────────
  const handleSelectSession = async (sessionId) => {
    if (sessionId === activeKnowledgeSessionId) return

    setActiveKnowledgeSession(sessionId)
    setLoadingHistory(true)
    try {
      const riwayat = await api.ambilRiwayatChat(sessionId)

      // Transform n8n_chat_histories rows ke format ChatMessage store
      const messages = riwayat.map((row) => ({
        id: row.id?.toString() || crypto.randomUUID(),
        role: row.role === 'user' || row.type === 'human' ? 'user' : 'ai',
        content: row.message || row.content || row.text || '',
        timestamp: row.created_at || row.timestamp || new Date().toISOString(),
      }))

      setKnowledgeMessages(messages)
    } catch (err) {
      console.error('Gagal memuat riwayat:', err)
      setKnowledgeMessages([])
    } finally {
      setLoadingHistory(false)
    }
  }

  // ── Formatting helpers ──────────────────────────────────────────────────
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60_000)
    const diffHours = Math.floor(diffMs / 3_600_000)
    const diffDays = Math.floor(diffMs / 86_400_000)

    if (diffMins < 1) return 'Baru saja'
    if (diffMins < 60) return `${diffMins} menit lalu`
    if (diffHours < 24) return `${diffHours} jam lalu`
    if (diffDays < 7) return `${diffDays} hari lalu`
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="w-64 flex-shrink-0 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* New Chat button */}
      <div className="p-3 border-b border-slate-800">
        <button
          onClick={handleNewChat}
          disabled={creatingSession}
          className="
            w-full flex items-center justify-center gap-2
            px-3 py-2.5 rounded-lg text-sm font-medium
            bg-violet-600 hover:bg-violet-500 text-white
            transition-all duration-200 active:scale-[0.98]
            disabled:opacity-50 disabled:cursor-not-allowed
          "
        >
          {creatingSession ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Plus size={15} />
          )}
          {creatingSession ? 'Membuat...' : 'New Chat'}
        </button>
      </div>

      {/* Session list */}
      <div className="flex-1 overflow-y-auto sidebar-scrollbar px-2 py-2 space-y-0.5">
        <p className="text-slate-600 text-[10px] font-mono uppercase tracking-widest px-2 pb-2 pt-1">
          Riwayat Chat
        </p>

        {loadingSessions ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 size={18} className="animate-spin text-slate-500" />
          </div>
        ) : knowledgeSessions.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-6 px-3">
            Belum ada sesi chat. Klik <strong>New Chat</strong> untuk mulai.
          </p>
        ) : (
          knowledgeSessions.map((session) => {
            const isActive = session.id === activeKnowledgeSessionId
            return (
              <button
                key={session.id}
                onClick={() => handleSelectSession(session.id)}
                className={`
                  w-full flex items-start gap-2.5 px-2.5 py-2 rounded-lg text-left
                  transition-all duration-150 group relative
                  ${isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }
                `}
              >
                {/* Active indicator line */}
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-violet-500 rounded-r-full" />
                )}

                <MessageSquare
                  size={14}
                  className={`mt-0.5 flex-shrink-0 ${
                    isActive ? 'text-violet-400' : 'text-slate-600 group-hover:text-slate-400'
                  }`}
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">
                    {session.judul || 'Obrolan Baru'}
                  </p>
                  <p className={`text-[10px] mt-0.5 ${isActive ? 'text-slate-400' : 'text-slate-600'}`}>
                    {formatDate(session.created_at)}
                  </p>
                </div>
              </button>
            )
          })
        )}
      </div>

      {/* Loading history overlay indicator */}
      {loadingHistory && (
        <div className="px-3 py-2 border-t border-slate-800 flex items-center gap-2 text-xs text-slate-500">
          <Loader2 size={12} className="animate-spin" />
          Memuat riwayat...
        </div>
      )}
    </div>
  )
}
