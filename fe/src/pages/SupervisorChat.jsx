import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react'
import { MessageSquare, Plus, Trash2 } from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { shallow } from 'zustand/shallow'
import { Alert, Button, ConfirmationModal, EmptyState, toast } from '@/components/ui'
import { useChatStore } from '../store/chatStore'
import { chatApi } from '../services/chatService'
import { sessionApi } from '../services/sessionService'
import ChatBubble from '../components/chat/ChatBubble'
import MessageInput from '../components/chat/MessageInput'
import AgentStatusIndicator from '../components/chat/AgentStatusIndicator'
import { useAutoScroll } from '../hooks/useAutoScroll'
import { getReplyContent, normalizeResponsePayload } from '../utils/chatResponse'

const AGENT_STATUS_LABELS = {
  supervisor: 'Supervisor Agent',
  pm:         'Project Manager Agent',
  knowledge:  'Knowledge Agent',
  reporting:  'Reporting Agent',
}

export default function SupervisorChat() {
  const location = useLocation();
  const autoSendProcessed = useRef(false);
  const pendingPromptOverrideRef = useRef(null);
  const processedDashboardNavKeyRef = useRef(null);

  // Reset autoSendProcessed when location changes
  useEffect(() => {
    autoSendProcessed.current = false;
  }, [location.pathname]);

  const {
    supervisorSessions,
    supervisorMessages,
    addSupervisorMessage,
    clearSupervisor,
    removeSupervisorMessages,
    activeSupervisorSessionId,
    setActiveSupervisorSession,
    setSupervisorSessions,
    setAutoSending,
  } = useChatStore(
    (state) => ({
      supervisorSessions: state.supervisorSessions,
      supervisorMessages: state.supervisorMessages,
      addSupervisorMessage: state.addSupervisorMessage,
      clearSupervisor: state.clearSupervisor,
      removeSupervisorMessages: state.removeSupervisorMessages,
      activeSupervisorSessionId: state.activeSupervisorSessionId,
      setActiveSupervisorSession: state.setActiveSupervisorSession,
      setSupervisorSessions: state.setSupervisorSessions,
      setAutoSending: state.setAutoSending,
    }),
    shallow,
  )

  const [loading, setLoading] = useState(false)
  const [agentLabel, setAgentLabel] = useState('Supervisor Agent')
  const [error, setError] = useState(null)
  const [prefilledMessage, setPrefilledMessage] = useState('')
  const [animatedSessionTitle, setAnimatedSessionTitle] = useState('Supervisor Agent')
  const [clearHistoryModalOpen, setClearHistoryModalOpen] = useState(false)
  const [isClearingHistory, setIsClearingHistory] = useState(false)
  const [creatingSession, setCreatingSession] = useState(false)
  const [selectedMessageIds, setSelectedMessageIds] = useState([])
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState(false)
  const [isBulkDeleting, setIsBulkDeleting] = useState(false)
  const bottomRef = useAutoScroll([supervisorMessages, loading])
  const previousSessionTitleRef = useRef('')

  const activeSession = useMemo(
    () =>
      supervisorSessions.find((session) => session.id === activeSupervisorSessionId) || null,
    [activeSupervisorSessionId, supervisorSessions]
  )

  const activeSessionTitle = activeSession?.judul?.trim() || 'Supervisor Agent'

  const syncSupervisorSessions = useCallback(
    async (targetSessionId, { waitForGeneratedTitle = false } = {}) => {
      let latestSession = null
      const maxAttempts = waitForGeneratedTitle ? 5 : 1

      for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
        const sessions = await sessionApi.ambilSemuaSesi('general_chat')
        setSupervisorSessions(sessions)
        latestSession = sessions.find((session) => session.id === targetSessionId) || null

        const hasGeneratedTitle =
          latestSession?.judul &&
          latestSession.judul.trim() &&
          latestSession.judul.trim() !== 'Obrolan Baru'

        if (!waitForGeneratedTitle || hasGeneratedTitle) {
          return latestSession
        }

        await new Promise((resolve) => setTimeout(resolve, 900))
      }

      return latestSession
    },
    [setSupervisorSessions]
  )

  useEffect(() => {
    const nextTitle = activeSessionTitle || 'Supervisor Agent'
    const previousTitle = previousSessionTitleRef.current

    if (!previousTitle) {
      setAnimatedSessionTitle(nextTitle)
      previousSessionTitleRef.current = nextTitle
      return
    }

    if (previousTitle === nextTitle) {
      return
    }

    if (nextTitle === 'Obrolan Baru' || nextTitle === 'Supervisor Agent') {
      setAnimatedSessionTitle(nextTitle)
      previousSessionTitleRef.current = nextTitle
      return
    }

    let index = 0
    setAnimatedSessionTitle('')

    const intervalId = window.setInterval(() => {
      index += 1
      setAnimatedSessionTitle(nextTitle.slice(0, index))

      if (index >= nextTitle.length) {
        window.clearInterval(intervalId)
        previousSessionTitleRef.current = nextTitle
      }
    }, 28)

    return () => {
      window.clearInterval(intervalId)
    }
  }, [activeSessionTitle])

  const handleSend = useCallback(async (text, file, options = {}) => {
    setError(null)

    if (!activeSupervisorSessionId) {
      setError('Belum ada sesi chat aktif. Klik tombol New Chat terlebih dahulu untuk membuat sesi baru.')
      return
    }
    
    const pendingOverride = !options.displayContent && !file ? pendingPromptOverrideRef.current : null
    const shouldUsePendingOverride =
      Boolean(
        pendingOverride &&
        text.trim() &&
        text.trim() === pendingOverride.displayContent &&
        pendingOverride.rawText
      )

    const actualText = shouldUsePendingOverride ? pendingOverride.rawText : text
    const displayContent = options.displayContent
      || (shouldUsePendingOverride ? pendingOverride.displayContent : text)
    const promptCard = options.promptCard
      || (shouldUsePendingOverride ? pendingOverride.promptCard : null)

    if (shouldUsePendingOverride) {
      pendingPromptOverrideRef.current = null
    }
    
    addSupervisorMessage({
      role: 'user',
      content: displayContent,
      forwardedEmail: options.forwardedEmail,
      promptCard,
      documentAttachment: file ? { name: file.name, mimeType: file.type || null } : null,
    })
    setLoading(true)
    setAgentLabel('Supervisor Agent')

    try {
      const sessionId = activeSupervisorSessionId

      if (!sessionId) {
        throw new Error('Belum ada sesi chat aktif. Klik tombol New Chat terlebih dahulu untuk membuat sesi baru.')
      }

      const data = await chatApi.sendToSupervisor(actualText, 'chat', sessionId, file)
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

      await syncSupervisorSessions(sessionId, { waitForGeneratedTitle: true })
    } catch (err) {
      setError(
        err.code === 'ECONNABORTED'
          ? 'Request timeout. Backend n8n tidak merespons dalam 120 detik.'
          : err.response?.status
            ? `Error ${err.response.status}: ${err.response.data?.message ?? 'Terjadi kesalahan.'}`
            : err.message || 'Tidak dapat terhubung ke n8n. Periksa URL webhook di Settings.'
      )
    } finally {
      setLoading(false)
    }
  }, [addSupervisorMessage, activeSupervisorSessionId, syncSupervisorSessions])

  // Handle send email
  const handleSendEmail = useCallback(async (emailDraft) => {
    setError(null)
    
    addSupervisorMessage({ 
      role: 'user', 
      content: `Kirim email ke ${emailDraft.to} dengan subject "${emailDraft.subject}"` 
    })
    setLoading(true)
    setAgentLabel('Communication Agent')

    try {
      const data = await chatApi.sendEmail(emailDraft, activeSupervisorSessionId)
      const normalizedData = normalizeResponsePayload(data)

      addSupervisorMessage({
        role:           'ai',
        content:        getReplyContent(data, ['output', 'myField', 'reply']) || 'Email berhasil dikirim!',
        agentUsed:      'communication',
        processingTime: normalizedData?.processing_time_ms ?? normalizedData?.processingTime,
        status:         normalizedData?.status,
      })

      if (activeSupervisorSessionId) {
        await syncSupervisorSessions(activeSupervisorSessionId)
      }
    } catch (err) {
      setError(
        err.message || 'Gagal mengirim email. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }, [addSupervisorMessage, activeSupervisorSessionId, syncSupervisorSessions])

  // Handle regenerate email
  const handleRegenerateEmail = useCallback(async (emailDraft, improvementText) => {
    setError(null)
    
    addSupervisorMessage({ 
      role: 'user', 
      content: `Buat ulang draft email dengan perbaikan: "${improvementText}"` 
    })
    setLoading(true)
    setAgentLabel('Communication Agent')

    try {
      const data = await chatApi.regenerateEmail(emailDraft, improvementText, activeSupervisorSessionId)
      const normalizedData = normalizeResponsePayload(data)

      const usedAgent = normalizedData?.agent_used ?? normalizedData?.agentUsed
      if (usedAgent && AGENT_STATUS_LABELS[usedAgent]) {
        setAgentLabel(AGENT_STATUS_LABELS[usedAgent])
      }

      addSupervisorMessage({
        role:           'ai',
        content:        getReplyContent(data, ['output', 'myField', 'reply']),
        agentUsed:      usedAgent,
        actionResults:  normalizedData?.action_results ?? normalizedData?.actionResults ?? {},
        processingTime: normalizedData?.processing_time_ms ?? normalizedData?.processingTime,
        status:         normalizedData?.status,
      })

      if (activeSupervisorSessionId) {
        await syncSupervisorSessions(activeSupervisorSessionId)
      }
    } catch (err) {
      setError(
        err.message || 'Gagal membuat ulang draft email. Silakan coba lagi.'
      )
    } finally {
      setLoading(false)
    }
  }, [addSupervisorMessage, activeSupervisorSessionId, syncSupervisorSessions])

  const handleClearHistoryClick = useCallback(() => {
    setClearHistoryModalOpen(true)
  }, [])

  const handleClearHistoryCancel = useCallback(() => {
    setClearHistoryModalOpen(false)
  }, [])

  const toggleSelectMessage = useCallback((id) => {
    setSelectedMessageIds((prev) =>
      prev.includes(id) ? prev.filter((mid) => mid !== id) : [...prev, id]
    )
  }, [])

  const clearSelection = useCallback(() => {
    setSelectedMessageIds([])
  }, [])

  const handleClearHistoryConfirm = useCallback(() => {
    setIsClearingHistory(true)
    clearSupervisor()
    clearSelection()
    setIsClearingHistory(false)
    setClearHistoryModalOpen(false)
  }, [clearSupervisor, clearSelection])

  const handleBulkDeleteClick = useCallback(() => {
    setBulkDeleteModalOpen(true)
  }, [])

  const handleBulkDeleteCancel = useCallback(() => {
    setBulkDeleteModalOpen(false)
  }, [])

  const handleBulkDeleteConfirm = useCallback(async () => {
    if (!activeSupervisorSessionId || selectedMessageIds.length === 0) return
    setIsBulkDeleting(true)
    const berhasil = await sessionApi.hapusPesan(activeSupervisorSessionId, selectedMessageIds)
    setIsBulkDeleting(false)
    setBulkDeleteModalOpen(false)
    if (!berhasil) {
      toast.error('Gagal menghapus pesan.')
      return
    }
    removeSupervisorMessages(selectedMessageIds)
    setSelectedMessageIds([])
    toast.success(`${selectedMessageIds.length} pesan berhasil dihapus.`)
  }, [activeSupervisorSessionId, selectedMessageIds, removeSupervisorMessages])

  const handleCreateChat = useCallback(async () => {
    setCreatingSession(true)
    setError(null)
    clearSelection()

    try {
      const newSession = await sessionApi.buatSesiBaru('Obrolan Baru', 'general_chat')

      if (!newSession) {
        throw new Error('Gagal membuat sesi chat baru.')
      }

      setActiveSupervisorSession(newSession.id)
      clearSupervisor()
      await syncSupervisorSessions(newSession.id)
    } catch (err) {
      setError(err.message || 'Gagal membuat sesi chat baru.')
    } finally {
      setCreatingSession(false)
    }
  }, [clearSupervisor, clearSelection, setActiveSupervisorSession, syncSupervisorSessions])

  useEffect(() => {
    const shouldForceNewSession =
      location.state?.forceNewSession === true &&
      location.state?.navigationSource === 'dashboard'

    if (!shouldForceNewSession) return
    if (processedDashboardNavKeyRef.current === location.key) return

    processedDashboardNavKeyRef.current = location.key

    const createFreshSession = async () => {
      setCreatingSession(true)
      setError(null)

      try {
        const newSession = await sessionApi.buatSesiBaru('Obrolan Baru', 'general_chat')

        if (!newSession) {
          throw new Error('Gagal membuat sesi chat baru.')
        }

        setActiveSupervisorSession(newSession.id)
        clearSupervisor()
        await syncSupervisorSessions(newSession.id)
      } catch (err) {
        setError(err.message || 'Gagal membuat sesi chat baru.')
      } finally {
        setCreatingSession(false)
      }
    }

    createFreshSession()
  }, [
    clearSupervisor,
    location.key,
    location.state,
    setActiveSupervisorSession,
    syncSupervisorSessions,
  ])

  // Handle auto-send from navigation state (Magic Button from Email, Calendar, or Draft Revision)
  useEffect(() => {
    const autoSendMessage = location.state?.autoSendMessage;
    const emailContext = location.state?.emailContext;
    const draftRevision = location.state?.draftRevision;
    const draft = location.state?.draft;
    const preFillOnly = location.state?.preFillOnly; // Explicit flag for pre-fill only
    const displayContent = location.state?.displayContent;
    const promptCard = location.state?.promptCard;

    console.log('[SupervisorChat] Navigation state:', {
      autoSendMessage: autoSendMessage ? 'present' : 'none',
      displayContent: displayContent ? 'present' : 'none',
      preFillOnly,
      emailContext: emailContext ? 'present' : 'none',
      draftRevision,
      autoSendProcessed: autoSendProcessed.current
    });

    // Handle pre-filled message (from FileWorkspace or CalendarPage - explicit pre-fill only)
    if (autoSendMessage && preFillOnly && !autoSendProcessed.current) {
      autoSendProcessed.current = true;
      console.log('[SupervisorChat] Pre-filling message:', autoSendMessage.substring(0, 50) + '...');
      setPrefilledMessage(displayContent || autoSendMessage);
      pendingPromptOverrideRef.current = {
        rawText: autoSendMessage,
        displayContent: displayContent || autoSendMessage,
        promptCard: promptCard || null,
      };
      
      // Clear navigation state after a short delay to ensure React has updated
      setTimeout(() => {
        window.history.replaceState({}, document.title);
      }, 100);
      return;
    }

    // Handle draft revision
    if (draftRevision && draft && !autoSendProcessed.current) {
      autoSendProcessed.current = true;
      
      // Set flag to prevent session reload
      setAutoSending(true);
      
      // Show draft context in chat
      const draftContext = `Draft yang akan direvisi:

To: ${draft.to}
Subject: ${draft.subject}

Content:
${draft.body_text || draft.body_html || '(No content)'}

---

Silakan berikan instruksi revisi untuk draft ini.`;

      addSupervisorMessage({
        role: 'ai',
        content: draftContext,
      });

      // Clear flag
      setTimeout(() => setAutoSending(false), 1000);

      // Clear navigation state
      window.history.replaceState({}, document.title);
      return;
    }

    // Handle auto-send message (from Email or other sources without preFillOnly flag)
    if (autoSendMessage && !preFillOnly && !autoSendProcessed.current) {
      autoSendProcessed.current = true;
      console.log('[SupervisorChat] Auto-sending message');
      
      // Set flag to prevent session reload
      setAutoSending(true);
      
      // Wait for session history to load, then send
      setTimeout(() => {
        handleSend(autoSendMessage, null, {
          displayContent: displayContent || (emailContext ? 'Buatkan draft email balasan yang profesional dan sesuai konteks.' : autoSendMessage),
          forwardedEmail: emailContext,
          promptCard: promptCard || null,
        });
        // Clear flag after send completes
        setTimeout(() => setAutoSending(false), 2000);
      }, 1500);

      // Clear navigation state to prevent re-sending on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state, handleSend, setAutoSending, addSupervisorMessage]);

  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-neutral-50">
      {/* Page header */}
      <div className="sticky top-0 z-20 flex flex-shrink-0 items-center justify-between border-b border-neutral-200 bg-white/95 px-6 py-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50 text-primary-500 shadow-sm">
            <MessageSquare size={16} />
          </div>
          <div>
            <h1 className="text-base font-bold font-headline text-neutral-900">
              {animatedSessionTitle}
              {animatedSessionTitle !== activeSessionTitle ? (
                <span className="ml-0.5 inline-block h-[1em] w-px animate-pulse bg-primary-500 align-middle" />
              ) : null}
            </h1>
            <p className="text-xs uppercase tracking-[0.18em] text-neutral-500">
              Supervisor Agent
            </p>
          </div>
        </div>
        {supervisorMessages.length > 0 && (
          <Button
            onClick={handleClearHistoryClick}
            variant="ghost"
            size="sm"
            className="gap-1.5 px-3 text-xs text-neutral-500 hover:text-error"
          >
            <Trash2 size={13} />
            Hapus riwayat
          </Button>
        )}
      </div>

      {/* Message list */}
      <div className="custom-scrollbar min-h-0 flex-1 overflow-y-auto px-6 py-6 space-y-5">
        {supervisorMessages.length === 0 && !loading && (
          <EmptyState
            icon={<MessageSquare size={36} className="opacity-20" />}
            title={activeSupervisorSessionId ? 'Belum ada percakapan' : 'Mulai percakapan baru'}
            description={
              activeSupervisorSessionId
                ? 'Coba kirim: "Buat tiket Jira untuk bug login page" atau "Jadwalkan meeting review sprint besok jam 10."'
                : 'Belum ada sesi chat aktif. Buat chat baru untuk mulai berdiskusi dengan Supervisor Agent.'
            }
            action={
              !activeSupervisorSessionId ? (
                <Button
                  onClick={handleCreateChat}
                  disabled={creatingSession}
                  className="gap-2"
                >
                  <Plus size={14} />
                  {creatingSession ? 'Membuat...' : 'Create Chat'}
                </Button>
              ) : null
            }
            className="h-full min-h-[320px]"
          />
        )}

        {supervisorMessages.map((msg) => {
          const isSelected = selectedMessageIds.includes(msg.id)
          const isUser = msg.role === 'user'
          return (
            <div
              key={msg.id}
              className={`group relative transition-all duration-150 ${
                isSelected ? 'opacity-85' : ''
              }`}
            >
              {/* Checkbox — muncul saat hover atau jika ada pesan terpilih */}
              <div
                className={`absolute top-1/2 -translate-y-1/2 z-10 transition-all duration-150 ${
                  isUser ? 'right-0' : 'left-0'
                } ${
                  selectedMessageIds.length > 0 || isSelected
                    ? 'opacity-100'
                    : 'opacity-0 group-hover:opacity-100'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() => toggleSelectMessage(msg.id)}
                  className="h-4 w-4 cursor-pointer appearance-none rounded-full border-2 border-neutral-300 bg-white checked:border-primary-500 checked:bg-primary-500 transition-all duration-150 hover:border-primary-400"
                />
              </div>
              <div className={isUser ? 'pr-8' : 'pl-8'}>
                <ChatBubble
                  message={msg}
                  onSendEmail={handleSendEmail}
                  onRegenerateEmail={handleRegenerateEmail}
                />
              </div>
            </div>
          )
        })}

        {loading && (
          <div>
            <AgentStatusIndicator agentName={agentLabel} />
          </div>
        )}

        {error && (
          <Alert variant="error" title="Supervisor chat error" className="animate-fade-in">
            {error}
          </Alert>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Floating action bar for bulk delete */}
      {selectedMessageIds.length > 0 && (
        <div className="flex-shrink-0 flex items-center justify-between border-t border-neutral-200 bg-white px-6 py-3">
          <span className="text-sm text-neutral-600">
            {selectedMessageIds.length} pesan terpilih
          </span>
          <div className="flex items-center gap-2">
            <Button
              onClick={clearSelection}
              variant="ghost"
              size="sm"
              className="text-xs text-neutral-500"
            >
              Batal
            </Button>
            <Button
              onClick={handleBulkDeleteClick}
              variant="destructive"
              size="sm"
              className="gap-1.5 text-xs"
            >
              <Trash2 size={13} />
              Hapus ({selectedMessageIds.length})
            </Button>
          </div>
        </div>
      )}

      {/* Input */}
      <MessageInput
        onSend={handleSend}
        disabled={loading}
        placeholder="Delegasikan tugas ke Supervisor Agent…"
        allowFile={true}
        initialValue={prefilledMessage}
      />

      {clearHistoryModalOpen ? (
        <ConfirmationModal
          open={clearHistoryModalOpen}
          onClose={handleClearHistoryCancel}
          onConfirm={handleClearHistoryConfirm}
          variant="danger"
          title="Hapus Riwayat Chat"
          description="Apakah Anda yakin ingin menghapus riwayat chat pada tampilan ini? Tindakan ini tidak dapat dibatalkan."
          confirmLabel="Hapus"
          cancelLabel="Batal"
          loading={isClearingHistory}
          loadingLabel="Menghapus..."
          icon={Trash2}
        />
      ) : null}

      {bulkDeleteModalOpen ? (
        <ConfirmationModal
          open={bulkDeleteModalOpen}
          onClose={handleBulkDeleteCancel}
          onConfirm={handleBulkDeleteConfirm}
          variant="danger"
          title={`Hapus ${selectedMessageIds.length} Pesan`}
          description={`Apakah Anda yakin ingin menghapus ${selectedMessageIds.length} pesan yang dipilih? Tindakan ini tidak dapat dibatalkan.`}
          confirmLabel="Hapus"
          cancelLabel="Batal"
          loading={isBulkDeleting}
          loadingLabel="Menghapus..."
          icon={Trash2}
        />
      ) : null}
    </div>
  )
}
