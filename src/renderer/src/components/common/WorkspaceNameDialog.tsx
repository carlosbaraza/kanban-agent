import { useState, useCallback, useRef, useEffect } from 'react'
import { useWorkspaceStore } from '@renderer/stores/workspace-store'

export function WorkspaceNameDialog(): React.JSX.Element | null {
  const show = useWorkspaceStore((s) => s.showWorkspaceNamePrompt)
  const resolve = useWorkspaceStore((s) => s.resolveWorkspaceNamePrompt)
  const openProjects = useWorkspaceStore((s) => s.openProjects)

  const [name, setName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (show) {
      // Default workspace name from the current project folder name
      const currentName = openProjects[0]?.name || ''
      setName(currentName)
      setTimeout(() => {
        inputRef.current?.focus()
        inputRef.current?.select()
      }, 0)
    }
  }, [show, openProjects])

  const handleConfirm = useCallback(() => {
    const trimmed = name.trim()
    if (trimmed) {
      resolve(trimmed)
    }
  }, [name, resolve])

  const handleCancel = useCallback(() => {
    resolve(null)
  }, [resolve])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        handleConfirm()
      }
      if (e.key === 'Escape') {
        e.preventDefault()
        handleCancel()
      }
    },
    [handleConfirm, handleCancel]
  )

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        handleCancel()
      }
    },
    [handleCancel]
  )

  if (!show) return null

  return (
    <div style={styles.overlay} onClick={handleOverlayClick}>
      <div style={styles.wrapper}>
        <div style={styles.header}>Create Workspace</div>
        <div style={styles.body}>
          <p style={styles.description}>
            You're about to add another project folder. This will create a
            <strong> workspace</strong> — a named collection of project folders you can
            switch between.
          </p>
          <p style={styles.hint}>
            You can rename or manage your workspaces later in Settings.
          </p>
          <label style={styles.label}>Workspace name</label>
          <input
            ref={inputRef}
            style={styles.input}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="My Workspace"
          />
        </div>
        <div style={styles.footer}>
          <button style={styles.cancelButton} onClick={handleCancel}>
            Cancel
          </button>
          <button
            style={{
              ...styles.confirmButton,
              opacity: name.trim() ? 1 : 0.5
            }}
            onClick={handleConfirm}
            disabled={!name.trim()}
          >
            Continue
          </button>
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
  description: {
    margin: '0 0 8px 0',
    fontSize: 13,
    lineHeight: '1.5',
    color: 'var(--text-primary)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
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
  input: {
    width: '100%',
    padding: '8px 12px',
    fontSize: 14,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border)',
    borderRadius: 6,
    outline: 'none',
    boxSizing: 'border-box'
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
