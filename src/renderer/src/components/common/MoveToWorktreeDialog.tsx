import { useState, useCallback, useEffect } from 'react'
import { useWorkspaceStore } from '@renderer/stores/workspace-store'
import { useTaskStore } from '@renderer/stores/task-store'
import type { WorktreeInfo } from '@renderer/stores/workspace-store'

interface MoveToWorktreeDialogProps {
  taskIds: string[]
  onClose: () => void
}

export function MoveToWorktreeDialog({
  taskIds,
  onClose
}: MoveToWorktreeDialogProps): React.JSX.Element {
  const [mode, setMode] = useState<'move' | 'copy'>('move')
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const openProjects = useWorkspaceStore((s) => s.openProjects)
  const activeProjectPath = useWorkspaceStore((s) => s.activeProjectPath)

  // Gather all worktrees from main projects, plus main projects themselves
  // Exclude the currently active project
  const targets: { path: string; label: string; branch?: string }[] = []
  for (const project of openProjects) {
    if (project.isWorktree) continue // worktrees are listed under their parent
    if (project.path !== activeProjectPath) {
      targets.push({ path: project.path, label: project.name })
    }
    if (project.worktrees) {
      for (const wt of project.worktrees) {
        if (wt.path !== activeProjectPath) {
          targets.push({ path: wt.path, label: wt.slug, branch: wt.branch })
        }
      }
    }
  }

  // Also include worktrees from current project that aren't open
  const currentProject = openProjects.find((p) => p.path === activeProjectPath)
  if (currentProject?.worktrees) {
    for (const wt of currentProject.worktrees) {
      if (!targets.some((t) => t.path === wt.path)) {
        targets.push({ path: wt.path, label: wt.slug, branch: wt.branch })
      }
    }
  }

  // Auto-select first target
  useEffect(() => {
    if (targets.length > 0 && !selectedPath) {
      setSelectedPath(targets[0].path)
    }
  }, [targets.length, selectedPath])

  const taskCount = taskIds.length

  const handleConfirm = useCallback(async () => {
    if (!selectedPath || loading) return
    setLoading(true)
    try {
      await window.api.taskMoveToWorktree(taskIds, selectedPath, mode)
      // Reload project state to reflect changes
      await useTaskStore.getState().loadProjectState()
      onClose()
    } catch (err) {
      console.error('Failed to move tasks to worktree:', err)
      setLoading(false)
    }
  }, [selectedPath, taskIds, mode, loading, onClose])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) onClose()
    },
    [onClose]
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'Enter' && selectedPath) handleConfirm()
    },
    [onClose, handleConfirm, selectedPath]
  )

  const actionLabel = mode === 'move' ? 'Move' : 'Copy'

  return (
    <div style={styles.overlay} onClick={handleOverlayClick} onKeyDown={handleKeyDown} tabIndex={-1}>
      <div style={styles.wrapper}>
        <div style={styles.header}>
          {actionLabel} {taskCount === 1 ? 'Task' : `${taskCount} Tasks`} to Worktree
        </div>
        <div style={styles.body}>
          {targets.length === 0 ? (
            <p style={styles.emptyText}>
              No other worktrees available. Create a worktree first from the project sidebar.
            </p>
          ) : (
            <>
              <div style={styles.modeToggle}>
                <button
                  style={{
                    ...styles.modeBtn,
                    ...(mode === 'move' ? styles.modeBtnActive : {})
                  }}
                  onClick={() => setMode('move')}
                >
                  Move
                </button>
                <button
                  style={{
                    ...styles.modeBtn,
                    ...(mode === 'copy' ? styles.modeBtnActive : {})
                  }}
                  onClick={() => setMode('copy')}
                >
                  Copy
                </button>
              </div>
              <p style={styles.hint}>
                {mode === 'move'
                  ? 'The task will be removed from this project and added to the target.'
                  : 'A copy of the task will be created in the target project.'}
              </p>
              <label style={styles.label}>Target</label>
              <div style={styles.targetList}>
                {targets.map((target) => (
                  <button
                    key={target.path}
                    style={{
                      ...styles.targetItem,
                      ...(selectedPath === target.path ? styles.targetItemActive : {})
                    }}
                    onClick={() => setSelectedPath(target.path)}
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0 }}
                    >
                      <line x1="6" y1="3" x2="6" y2="15" />
                      <circle cx="18" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <path d="M18 9a9 9 0 0 1-9 9" />
                    </svg>
                    <span style={styles.targetLabel}>{target.label}</span>
                    {target.branch && (
                      <span style={styles.targetBranch}>{target.branch}</span>
                    )}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          {targets.length > 0 && (
            <button
              style={{
                ...styles.confirmButton,
                opacity: selectedPath && !loading ? 1 : 0.5
              }}
              onClick={handleConfirm}
              disabled={!selectedPath || loading}
            >
              {loading ? 'Working...' : `${actionLabel} ${taskCount === 1 ? 'Task' : `${taskCount} Tasks`}`}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: '20vh',
    zIndex: 600,
    animation: 'cmdkFadeIn 120ms ease'
  },
  wrapper: {
    width: '100%',
    maxWidth: 440,
    borderRadius: 8,
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    boxShadow: 'var(--shadow-lg)',
    overflow: 'hidden'
  },
  header: {
    padding: '12px 18px',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    borderBottom: '1px solid var(--border)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  body: {
    padding: '16px 18px'
  },
  emptyText: {
    margin: 0,
    fontSize: 13,
    lineHeight: '1.5',
    color: 'var(--text-tertiary)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  modeToggle: {
    display: 'flex',
    gap: 0,
    marginBottom: 12,
    borderRadius: 6,
    overflow: 'hidden',
    border: '1px solid var(--border)'
  },
  modeBtn: {
    flex: 1,
    padding: '6px 12px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 100ms'
  },
  modeBtnActive: {
    backgroundColor: 'var(--accent)',
    color: '#fff'
  },
  hint: {
    margin: '0 0 14px 0',
    fontSize: 12,
    lineHeight: '1.4',
    color: 'var(--text-tertiary)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  targetList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 2,
    maxHeight: 200,
    overflowY: 'auto' as const
  },
  targetItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 10px',
    fontSize: 13,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: '1px solid transparent',
    borderRadius: 6,
    cursor: 'pointer',
    textAlign: 'left' as const,
    width: '100%',
    transition: 'background-color 100ms'
  },
  targetItemActive: {
    backgroundColor: 'var(--accent)',
    color: '#fff',
    borderColor: 'var(--accent)'
  },
  targetLabel: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const
  },
  targetBranch: {
    fontSize: 11,
    opacity: 0.7,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap' as const,
    maxWidth: 160
  },
  footer: {
    padding: '12px 18px',
    borderTop: '1px solid var(--border)',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: 8
  },
  cancelButton: {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'var(--text-secondary)',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: 6,
    cursor: 'pointer'
  },
  confirmButton: {
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#fff',
    backgroundColor: 'var(--accent)',
    border: '1px solid var(--accent)',
    borderRadius: 6,
    cursor: 'pointer'
  }
}
