import { useState, useCallback } from 'react'
import { MessageSquare, Trash2 } from 'lucide-react'
import { shallow } from 'zustand/shallow'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/chatService'
import ChatBubble from '../components/chat/ChatBubble'
import MessageInput from '../components/chat/MessageInput'
import AgentStatusIndicator from '../components/chat/AgentStatusIndicator'
import SkeletonLoader from '../components/ui/SkeletonLoader'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { getReplyContent, normalizeResponsePayload } from '../utils/chatResponse'

const AGENT_STATUS_LABELS = {
  supervisor: 'Supervisor Agent',
  pm:         'Project Manager Agent',
  knowledge:  'Knowledge Agent',
  reporting:  'Reporting Agent',
}

export default function SupervisorChat() {
  const {
    supervisorMessages,
    addSupervisorMessage,
    clearSupervisor,
    activeSupervisorSessionId,
  } = useChatStore(
    (state) => ({
      supervisorMessages: state.supervisorMessages,
      addSupervisorMessage: state.addSupervisorMessage,
      clearSupervisor: state.clearSupervisor,
      activeSupervisorSessionId: state.activeSupervisorSessionId,
    }),
    shallow,
  )

  const [loading, setLoading] = useState(false)
  const [agentLabel, setAgentLabel] = useState('Supervisor Agent')
  const [error, setError] = useState(null)
  const bottomRef = useAutoScroll([supervisorMessages, loading])

  const handleSend = useCallback(async (text, file) => {
    setError(null)
    
    // Create UI message (show filename if no text, or both)
    const displayContent = file && text ? `${text}\n\n*(Attachment: ${file.name})*` : file ? `*(Attachment: ${file.name})*` : text
    
    addSupervisorMessage({ role: 'user', content: displayContent })
    setLoading(true)
    setAgentLabel('Supervisor Agent')

    try {
      const data = await chatApi.sendToSupervisor(text, 'chat', activeSupervisorSessionId, file)
      const normalizedData = normalizeResponsePayload(data)

      const usedAgent = normalizedData?.agent_used ?? normalizedData?.agentUsed
      if (usedAgent && AGENT_STATUS_LABELS[usedAgent]) {
        setAgentLabel(AGENT_STATUS_LABELS[usedAgent])
      }

      addSupervisorMessage({
        role:           'ai',
        content:        getReplyContent(data, ['output', 'myField', 'reply']),
        agentUsed:      usedAgent,
        sources:        Array.isArray(normalizedData?.sources) ? normalizedData.sources : [],
        actionResults:  normalizedData?.action_results ?? normalizedData?.actionResults ?? {},
        processingTime: normalizedData?.processing_time_ms ?? normalizedData?.processingTime,
        status:         normalizedData?.status,
      })
    } catch (err) {
      setError(
        err.code === 'ECONNABORTED'
          ? 'Request timeout. Backend n8n tidak merespons dalam 120 detik.'
          : err.response?.status
            ? `Error ${err.response.status}: ${err.response.data?.message ?? 'Terjadi kesalahan.'}`
            : 'Tidak dapat terhubung ke n8n. Periksa URL webhook di Settings.'
      )
    } finally {
      setLoading(false)
    }
  }, [addSupervisorMessage, activeSupervisorSessionId])

  return (
    <div className="flex flex-col h-screen">
      {/* Page header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-100 rounded-lg flex items-center justify-center">
            <MessageSquare size={16} className="text-brand-600" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-slate-800">Supervisor Agent</h1>
            <p className="text-xs text-slate-400">Delegasi tugas · Jira · Google Calendar</p>
          </div>
        </div>
        {supervisorMessages.length > 0 && (
          <button
            onClick={clearSupervisor}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={13} />
            Hapus riwayat
          </button>
        )}
      </div>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 custom-scrollbar">
        {supervisorMessages.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center h-full text-center gap-3 text-slate-400">
            <MessageSquare size={36} className="opacity-20" />
            <p className="text-sm font-medium">Belum ada percakapan</p>
            <p className="text-xs max-w-xs">
              Coba kirim: <em>&quot;Buat tiket Jira untuk bug login page&quot;</em> atau <em>&quot;Jadwalkan meeting review sprint besok jam 10.&quot;</em>
            </p>
          </div>
        )}

        {supervisorMessages.map((msg) => (
          <ChatBubble key={msg.id} message={msg} />
        ))}

        {loading && (
          <div className="space-y-2">
            <AgentStatusIndicator agentName={agentLabel} />
            <SkeletonLoader variant="message" lines={3} />
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
        placeholder="Delegasikan tugas ke Supervisor Agent…"
        allowFile={true}
      />
    </div>
  )
}
