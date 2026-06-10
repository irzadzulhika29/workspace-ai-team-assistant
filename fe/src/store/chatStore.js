import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const initialState = {
  supervisorMessages: [],
  isConnected:        null,

  supervisorSessions:         [],
  activeSupervisorSessionId:  null,
  
  isAutoSending:              false,
}

export const useChatStore = create(
  persist(
    (set) => ({
      ...initialState,

      setConnected: (status) => set({ isConnected: status }),

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

      setSupervisorSessions: (sessions) => set({ supervisorSessions: sessions }),

      setActiveSupervisorSession: (id) =>
        set({ activeSupervisorSessionId: id }),

      setSupervisorMessages: (messages) => set({ supervisorMessages: messages }),
      
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
