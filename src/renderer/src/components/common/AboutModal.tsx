import { useState, useEffect, useCallback } from 'react'
import { useUIStore } from '@renderer/stores/ui-store'
import { APP_NAME } from '@shared/constants'

export function AboutModal(): React.JSX.Element | null {
  const open = useUIStore((s) => s.aboutModalOpen)
  const closeModal = useUIStore((s) => s.closeAboutModal)
  const [version, setVersion] = useState<string>('')

  useEffect(() => {
    if (open) {
      window.api.getVersion().then(setVersion)
    }
  }, [open])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        e.stopPropagation()
        closeModal()
      }
    },
    [closeModal]
  )

  useEffect(() => {
    if (!open) return
    window.addEventListener('keydown', handleKeyDown, true)
    return () => window.removeEventListener('keydown', handleKeyDown, true)
  }, [open, handleKeyDown])

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        closeModal()
      }
    },
    [closeModal]
  )

  if (!open) return null

  return (
    <div style={styles.overlay} onClick={handleOverlayClick} data-testid="about-overlay">
      <div style={styles.wrapper}>
        <div style={styles.header}>
          <span style={styles.headerTitle}>About</span>
          <button style={styles.closeButton} onClick={closeModal}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M11 3L3 11M3 3l8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
        <div style={styles.body}>
          <div style={styles.logoSection}>
            <div style={styles.appIcon}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#5e6ad2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M8 7h8M8 12h5M8 17h7" />
              </svg>
            </div>
            <div style={styles.appName}>{APP_NAME}</div>
            <div style={styles.version}>Version {version}</div>
          </div>

          <div style={styles.description}>
            A kanban board with embedded terminals, purpose-built for agentic AI coding workflows.
          </div>

          <div style={styles.divider} />

          <div style={styles.infoGrid}>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>Platform</span>
              <span style={styles.infoValue}>macOS (Electron)</span>
            </div>
            <div style={styles.infoRow}>
              <span style={styles.infoLabel}>License</span>
              <span style={styles.infoValue}>MIT</span>
            </div>
          </div>

          <div style={styles.divider} />

          <div style={styles.links}>
            <button
              style={styles.linkButton}
              onClick={() => window.api.openExternal('https://github.com/user/familiar')}
            >
              GitHub Repository
            </button>
          </div>
        </div>
        <div style={styles.footer}>
          <span style={styles.hint}>
            Press <kbd style={styles.kbd}>Esc</kbd> to close
          </span>
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
    paddingTop: '16vh',
    zIndex: 500,
    animation: 'cmdkFadeIn 120ms ease'
  },
  wrapper: {
    width: '100%',
    maxWidth: 400,
    borderRadius: 8,
    border: '1px solid #2a2a3c',
    backgroundColor: '#1a1a27',
    boxShadow: '0 16px 70px rgba(0, 0, 0, 0.5)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    padding: '8px 18px',
    borderBottom: '1px solid #2a2a3c',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: '#c8c8d0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#5c5c6e',
    cursor: 'pointer',
    padding: 4,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  body: {
    padding: '24px 18px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 16
  },
  logoSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 8
  },
  appIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  appName: {
    fontSize: 20,
    fontWeight: 700,
    color: '#e0e0e8',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  version: {
    fontSize: 12,
    color: '#5c5c6e',
    fontFamily: "'SF Mono', 'Fira Code', monospace"
  },
  description: {
    fontSize: 13,
    color: '#8e8ea0',
    textAlign: 'center',
    lineHeight: 1.5,
    maxWidth: 320,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#2a2a3c'
  },
  infoGrid: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: 6
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '2px 0'
  },
  infoLabel: {
    fontSize: 12,
    color: '#5c5c6e',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  infoValue: {
    fontSize: 12,
    color: '#c8c8d0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  links: {
    display: 'flex',
    gap: 8
  },
  linkButton: {
    fontSize: 12,
    color: '#5e6ad2',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 4,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'background-color 150ms ease'
  },
  footer: {
    padding: '8px 18px',
    borderTop: '1px solid #2a2a3c',
    display: 'flex',
    justifyContent: 'center'
  },
  hint: {
    fontSize: 11,
    color: '#5c5c6e',
    display: 'flex',
    alignItems: 'center',
    gap: 6
  },
  kbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 22,
    height: 22,
    padding: '0 6px',
    fontSize: 11,
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    color: '#8e8ea0',
    backgroundColor: '#232334',
    borderRadius: 4,
    border: '1px solid #2a2a3c'
  }
}
