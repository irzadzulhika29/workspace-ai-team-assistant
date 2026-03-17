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
import { CONTEXT_OPTIONS, ERROR_MESSAGES } from '../constants/chat'

export default function KnowledgeChat() {
  const {
    knowledgeMessages,
    addKnowledgeMessage,
    clearKnowledge,
    activeKnowledgeSessionId,
  } = useChatStore(
    (state) => ({
      knowledgeMessages: state.knowledgeMessages,
      addKnowledgeMessage: state.addKnowledgeMessage,
      clearKnowledge: state.clearKnowledge,
      activeKnowledgeSessionId: state.activeKnowledgeSessionId,
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
      const data = await chatApi.sendToKnowledge(
        message,
        contextFilter,
        activeKnowledgeSessionId,
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
          ? ERROR_MESSAGES.KNOWLEDGE_TIMEOUT
          : ERROR_MESSAGES.KNOWLEDGE_CONNECTION
      )
    } finally {
      setLoading(false)
    }
  }, [activeKnowledgeSessionId, addKnowledgeMessage, contextFilter])

  return (
    <div className="flex h-screen">
      {/* Main chat area */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Page header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-violet-100 rounded-lg flex items-center justify-center">
              <Brain size={16} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-slate-800">Knowledge Agent</h1>
              <p className="text-xs text-slate-400">RAG · Sitasi dokumen · SOP internal</p>
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
                  border border-gray-200 rounded-lg bg-gray-50 text-slate-700
                  focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500
                  cursor-pointer hover:bg-gray-100 transition-colors
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
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
          {knowledgeMessages.length === 0 && !loading && (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
              <Brain size={36} className="opacity-20" />
              <p className="text-sm font-medium">Mulai bertanya tentang SOP</p>
              <p className="text-xs max-w-xs">
                Contoh: <em>&quot;Berapa hari cuti tahunan karyawan kontrak?&quot;</em> atau <em>&quot;Apa prosedur pengajuan reimbursement?&quot;</em>
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
