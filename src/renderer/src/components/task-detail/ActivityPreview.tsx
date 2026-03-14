import { useState, useEffect, useCallback } from 'react'
import { nanoid } from 'nanoid'
import type { ActivityEntry } from '@shared/types'
import { formatRelativeTime } from '@renderer/lib/format-time'
import { onFileChange } from '@renderer/lib/file-change-hub'
import { ActivityDialog } from './ActivityDialog'
import styles from './ActivityPreview.module.css'

const TYPE_ICONS: Record<ActivityEntry['type'], string> = {
  status_change: '\u2194',
  agent_event: '\u2699',
  note: '\u270E',
  created: '\u2795',
  updated: '\u270F'
}

interface ActivityPreviewProps {
  taskId: string
}

export function ActivityPreview({ taskId }: ActivityPreviewProps): React.JSX.Element {
  const [entries, setEntries] = useState<ActivityEntry[]>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [sending, setSending] = useState(false)

  // Load activity on mount / taskId change
  useEffect(() => {
    let cancelled = false
    async function load(): Promise<void> {
      try {
        const data = await window.api.readTaskActivity(taskId)
        if (!cancelled) setEntries(data)
      } catch {
        if (!cancelled) setEntries([])
      }
    }
    load()
    return () => {
      cancelled = true
    }
  }, [taskId])

  // Re-read when external file changes are detected
  useEffect(() => {
    return onFileChange(async () => {
      try {
        const data = await window.api.readTaskActivity(taskId)
        setEntries(data)
      } catch {
        // Ignore
      }
    })
  }, [taskId])

  const handleAddNote = useCallback(async () => {
    const trimmed = noteText.trim()
    if (!trimmed) return

    setSending(true)
    const entry: ActivityEntry = {
      id: nanoid(8),
      timestamp: new Date().toISOString(),
      type: 'note',
      message: trimmed
    }

    try {
      await window.api.appendActivity(taskId, entry)
      setEntries((prev) => [...prev, entry])
      setNoteText('')
    } catch (err) {
      console.error('Failed to add note:', err)
    } finally {
      setSending(false)
    }
  }, [noteText, taskId])

  const lastEntry = entries.length > 0 ? entries[entries.length - 1] : null

  return (
    <>
      <div className={styles.container}>
        <span className={styles.label}>Activity</span>
        {lastEntry ? (
          <div className={styles.lastEntry}>
            <span className={styles.icon}>{TYPE_ICONS[lastEntry.type]}</span>
            <span className={styles.message}>{lastEntry.message}</span>
            <span className={styles.time}>{formatRelativeTime(lastEntry.timestamp)}</span>
          </div>
        ) : (
          <span className={styles.empty}>No activity yet</span>
        )}
        <button
          className={styles.expandButton}
          onClick={() => setDialogOpen(true)}
        >
          {entries.length > 0 ? `View all (${entries.length})` : 'View'}
        </button>
      </div>
      {dialogOpen && (
        <ActivityDialog
          entries={entries}
          noteText={noteText}
          sending={sending}
          onNoteTextChange={setNoteText}
          onAddNote={handleAddNote}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </>
  )
}
