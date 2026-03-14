import { useEffect, useCallback } from 'react'
import type { ActivityEntry } from '@shared/types'
import { ActivityEntryComponent } from './ActivityEntry'
import styles from './ActivityDialog.module.css'

interface ActivityDialogProps {
  entries: ActivityEntry[]
  noteText: string
  sending: boolean
  onNoteTextChange: (text: string) => void
  onAddNote: () => void
  onClose: () => void
}

export function ActivityDialog({
  entries,
  noteText,
  sending,
  onNoteTextChange,
  onAddNote,
  onClose
}: ActivityDialogProps): React.JSX.Element {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent): void {
      if (e.key === 'Escape') {
        e.stopPropagation()
        onClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        onAddNote()
      }
    },
    [onAddNote]
  )

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <div className={styles.dialogHeader}>
          <span className={styles.dialogTitle}>Activity Log</span>
          <button className={styles.closeButton} onClick={onClose}>
            &times;
          </button>
        </div>
        <div className={styles.dialogBody}>
          {entries.length === 0 ? (
            <div className={styles.empty}>No activity yet</div>
          ) : (
            entries.map((entry) => <ActivityEntryComponent key={entry.id} entry={entry} />)
          )}
        </div>
        <div className={styles.dialogFooter}>
          <input
            className={styles.noteInput}
            value={noteText}
            onChange={(e) => onNoteTextChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Add a note..."
            disabled={sending}
            autoFocus
          />
          <button
            className={styles.sendButton}
            onClick={onAddNote}
            disabled={sending || !noteText.trim()}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
