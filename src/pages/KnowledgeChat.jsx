import React, { useState, useCallback } from 'react'
import { Brain, Trash2, ChevronDown } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/chatService'
import ChatBubble from '../components/chat/ChatBubble'
import MessageInput from '../components/chat/MessageInput'
import AgentStatusIndicator from '../components/chat/AgentStatusIndicator'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { getReplyContent } from '../utils/chatResponse'

const CONTEXT_OPTIONS = [
  { value: null,           label: 'Semua Dokumen' },
  { value: 'input',        label: 'Folder: Input (SOP)' },
  { value: 'output',       label: 'Folder: Output' },
]

export default function KnowledgeChat() {
  const {
    knowledgeMessages,
    addKnowledgeMessage,
    clearKnowledge,
    activeKnowledgeSessionId,
    setActiveKnowledgeSession,
  } = useChatStore(
    (state) => ({
      knowledgeMessages: state.knowledgeMessages,
      addKnowledgeMessage: state.addKnowledgeMessage,
      clearKnowledge: state.clearKnowledge,
      activeKnowledgeSessionId: state.activeKnowledgeSessionId,
      setActiveKnowledgeSession: state.setActiveKnowledgeSession,
    }),
    shallow,
  )

  const [loading, setLoading]         = useState(false)
  const [error, setError]             = useState(null)
  const [contextFilter, setContextFilter] = useState(null)
  const bottomRef = useAutoScroll([knowledgeMessages, loading])

  const handleSend = useCallback(async (text) => {
    const message = text.trim()
    if (!message) return

    setError(null)
    addKnowledgeMessage({ role: 'user', content: message })
    setLoading(true)

    try {
      // Auto-create session jika belum ada
      let sessionId = activeKnowledgeSessionId
      if (!sessionId) {
        const { sessionApi } = await import('../services/sessionService')
        const newSession = await sessionApi.buatSesiBaru('Obrolan Baru', 'rag_chat')
        if (newSession) {
          sessionId = newSession.id
          setActiveKnowledgeSession(sessionId)
        }
      }

      const data = await chatApi.sendToKnowledge(
        message,
        contextFilter,
        sessionId,
      )
      addKnowledgeMessage({
        role:           'ai',
        content:        getReplyContent(data),
        agentUsed:      data?.agent_used ?? data?.agentUsed,
        sources:        Array.isArray(data?.sources) ? data.sources : [],
        actionResults:  data?.action_results ?? data?.actionResults ?? {},
        processingTime: data?.processing_time_ms ?? data?.processingTime,
        status:         data?.status,
      })
    } catch (err) {
      setError(
        err.code === 'ECONNABORTED'
          ? 'Request timeout setelah 120 detik. Coba lagi atau periksa koneksi ke n8n.'
          : 'Tidak dapat terhubung ke Knowledge Agent. Periksa URL webhook di Settings.'
      )
    } finally {
      setLoading(false)
    }
  }, [activeKnowledgeSessionId, addKnowledgeMessage, contextFilter, setActiveKnowledgeSession])

  return (
    <div className="flex h-screen bg-surface-sunken/80">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b ghost-divider bg-white/80 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-brand-100 rounded-lg flex items-center justify-center shadow-[0_8px_18px_rgba(0,97,132,0.08)]">
              <Brain size={16} className="text-brand-600" />
            </div>
            <div>
              <h1 className="text-base font-bold font-headline text-slateui-900">Knowledge Agent</h1>
              <p className="text-xs text-slate-500 uppercase tracking-[0.18em]">RAG · Sitasi dokumen · SOP internal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Context filter dropdown */}
            <div className="relative">
              <select
                value={contextFilter ?? ''}
                onChange={(e) => setContextFilter(e.target.value || null)}
                className="
                  appearance-none pl-3 pr-8 py-1.5 text-xs font-medium
                  border border-transparent rounded-xl bg-surface-raised text-slateui-700
                  shadow-[inset_0_0_0_1px_rgba(191,200,207,0.35)]
                  focus:outline-none focus:ring-0 focus:shadow-[inset_0_-2px_0_0_#006184]
                  cursor-pointer hover:bg-white transition-colors
                "
              >
                {CONTEXT_OPTIONS.map(({ value, label }) => (
                  <option key={value ?? '__all'} value={value ?? ''}>
                    {label}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>

            {knowledgeMessages.length > 0 && (
              <button
                onClick={clearKnowledge}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={13} />
                Hapus riwayat
              </button>
            )}
          </div>
        </div>

        {/* Message list */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-5 custom-scrollbar">
          {knowledgeMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
              <Brain size={36} className="opacity-20" />
              <p className="text-sm font-medium">Mulai bertanya tentang SOP</p>
              <p className="text-xs max-w-xs">
                Contoh: <em>&ldquo;Berapa hari cuti tahunan karyawan kontrak?&rdquo;</em> atau <em>&ldquo;Apa prosedur pengajuan reimbursement?&rdquo;</em>
              </p>
            </div>
          )}

          {knowledgeMessages.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}

          {loading && (
            <div className="space-y-2">
              <AgentStatusIndicator agentName="Knowledge Agent" />
              <SkeletonLoader variant="message" lines={4} />
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 animate-fade-in">
              <span className="w-2 h-2 bg-red-500 rounded-full mt-1.5 flex-shrink-0" />
              {error}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <MessageInput
          onSend={handleSend}
          disabled={loading}
          placeholder="Tanya tentang SOP atau kebijakan internal…"
        />
      </div>
    </div>
  )
}
