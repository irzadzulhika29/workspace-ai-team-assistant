import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

/**
 * @typedef {Object} ChatMessage
 * @property {string}  id
 * @property {'user'|'ai'} role
 * @property {string}  content
 * @property {string}  timestamp
 * @property {string}  [agentUsed]
 * @property {Array}   [sources]
 * @property {Object}  [actionResults]
 * @property {number}  [processingTime]
 * @property {'success'|'error'} [status]
 * @property {Object|null} [forwardedEmail]
 * @property {Object|null} [documentAttachment]
 */

const initialState = {
  supervisorMessages: [],
  isConnected:        null,  // null = unknown, true/false after first check

  // ── Supervisor sessions ─────────────────────────────────────────────────
  supervisorSessions:         [],   // array sesi dari Supabase
  activeSupervisorSessionId:  null, // UUID sesi yang sedang aktif
  
  // ── Auto-send flag (for Magic Button) ──────────────────────────────────
  isAutoSending:              false, // Prevent session reload during auto-send
}

export const useChatStore = create(
  persist(
    (set) => ({
      ...initialState,

      // ── Connection status ─────────────────────────────────────────────────
      setConnected: (status) => set({ isConnected: status }),

      // ── Supervisor ────────────────────────────────────────────────────────
      addSupervisorMessage: (msg) =>
        set((s) => ({
          supervisorMessages: [
            ...s.supervisorMessages,
            { id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...msg },
          ],
        })),

      clearSupervisor: () => set({ supervisorMessages: [] }),

      removeSupervisorMessages: (messageIds) =>
        set((s) => ({
          supervisorMessages: s.supervisorMessages.filter((m) => !messageIds.includes(m.id)),
        })),

      // ── Supervisor sessions ───────────────────────────────────────────────
      setSupervisorSessions: (sessions) => set({ supervisorSessions: sessions }),

      setActiveSupervisorSession: (id) =>
        set({ activeSupervisorSessionId: id }),

      setSupervisorMessages: (messages) => set({ supervisorMessages: messages }),
      
      // ── Auto-send control ─────────────────────────────────────────────────
      setAutoSending: (status) => set({ isAutoSending: status }),
    }),
    {
      name: 'team-workspace-chat',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        supervisorMessages:        state.supervisorMessages,
        activeSupervisorSessionId: state.activeSupervisorSessionId,
      }),
    }
  )
)
