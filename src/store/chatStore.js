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
 */

const initialState = {
  supervisorMessages: [],
  knowledgeMessages:  [],
  isConnected:        null,  // null = unknown, true/false after first check

  // ── Knowledge sessions ──────────────────────────────────────────────────
  knowledgeSessions:          [],   // array sesi dari Supabase
  activeKnowledgeSessionId:   null, // UUID sesi yang sedang aktif
}

export const useChatStore = create(
  persist(
    (set, get) => ({
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

      // ── Knowledge ─────────────────────────────────────────────────────────
      addKnowledgeMessage: (msg) =>
        set((s) => ({
          knowledgeMessages: [
            ...s.knowledgeMessages,
            { id: crypto.randomUUID(), timestamp: new Date().toISOString(), ...msg },
          ],
        })),

      clearKnowledge: () => set({ knowledgeMessages: [] }),

      // Ganti seluruh array pesan (untuk load riwayat dari Supabase)
      setKnowledgeMessages: (messages) => set({ knowledgeMessages: messages }),

      // ── Knowledge sessions ────────────────────────────────────────────────
      setKnowledgeSessions: (sessions) => set({ knowledgeSessions: sessions }),

      setActiveKnowledgeSession: (id) =>
        set({ activeKnowledgeSessionId: id }),
    }),
    {
      name: 'team-workspace-chat',
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        supervisorMessages:        state.supervisorMessages,
        knowledgeMessages:         state.knowledgeMessages,
        activeKnowledgeSessionId:  state.activeKnowledgeSessionId,
      }),
    }
  )
)
