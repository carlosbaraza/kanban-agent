import { create } from 'zustand'
import type { TerminalSession, TerminalPane } from '@shared/types'

interface TerminalStore {
  // State
  sessions: Map<string, TerminalSession> // keyed by sessionId
  panesByTask: Map<string, TerminalPane[]> // taskId -> panes
  activePaneByTask: Map<string, string> // taskId -> active paneId

  // Actions
  addSession: (session: TerminalSession) => void
  removeSession: (sessionId: string) => void

  addPane: (taskId: string, pane: TerminalPane) => void
  removePane: (taskId: string, paneId: string) => void
  setActivePane: (taskId: string, paneId: string) => void

  getPanesForTask: (taskId: string) => TerminalPane[]
  getActivePaneForTask: (taskId: string) => string | undefined
}

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  // State
  sessions: new Map<string, TerminalSession>(),
  panesByTask: new Map<string, TerminalPane[]>(),
  activePaneByTask: new Map<string, string>(),

  // Actions
  addSession: (session: TerminalSession): void => {
    set((state) => {
      const next = new Map(state.sessions)
      next.set(session.id, session)
      return { sessions: next }
    })
  },

  removeSession: (sessionId: string): void => {
    set((state) => {
      const next = new Map(state.sessions)
      next.delete(sessionId)
      return { sessions: next }
    })
  },

  addPane: (taskId: string, pane: TerminalPane): void => {
    set((state) => {
      const nextPanes = new Map(state.panesByTask)
      const existing = nextPanes.get(taskId) ?? []
      nextPanes.set(taskId, [...existing, pane])

      const nextActive = new Map(state.activePaneByTask)
      nextActive.set(taskId, pane.id)

      return { panesByTask: nextPanes, activePaneByTask: nextActive }
    })
  },

  removePane: (taskId: string, paneId: string): void => {
    set((state) => {
      const nextPanes = new Map(state.panesByTask)
      const existing = nextPanes.get(taskId) ?? []
      const filtered = existing.filter((p) => p.id !== paneId)

      if (filtered.length === 0) {
        nextPanes.delete(taskId)
      } else {
        nextPanes.set(taskId, filtered)
      }

      const nextActive = new Map(state.activePaneByTask)
      if (nextActive.get(taskId) === paneId) {
        if (filtered.length > 0) {
          nextActive.set(taskId, filtered[filtered.length - 1].id)
        } else {
          nextActive.delete(taskId)
        }
      }

      return { panesByTask: nextPanes, activePaneByTask: nextActive }
    })
  },

  setActivePane: (taskId: string, paneId: string): void => {
    set((state) => {
      const next = new Map(state.activePaneByTask)
      next.set(taskId, paneId)
      return { activePaneByTask: next }
    })
  },

  getPanesForTask: (taskId: string): TerminalPane[] => {
    return get().panesByTask.get(taskId) ?? []
  },

  getActivePaneForTask: (taskId: string): string | undefined => {
    return get().activePaneByTask.get(taskId)
  }
}))
