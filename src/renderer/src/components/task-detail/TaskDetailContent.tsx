import { useState, useEffect, useCallback } from 'react'
import type { Task, TaskPastedFile } from '@shared/types'
import { SplitPanel } from './SplitPanel'
import { ActivityTimeline } from './ActivityTimeline'
import { TaskDetailHeader } from './TaskDetailHeader'
import { TerminalPanel } from '@renderer/components/terminal/TerminalPanel'
import { BlockEditor } from '@renderer/components/editor'
import { PastedFileCard, PreviewDialog } from '@renderer/components/common'
import { TaskFiles } from './TaskFiles'
import { useUIStore } from '@renderer/stores/ui-store'
import { useTaskStore } from '@renderer/stores/task-store'
import styles from './TaskDetailContent.module.css'

interface TaskDetailContentProps {
  taskId: string
  task: Task
  onUpdate: (updates: Partial<Task>) => void
  onClose: () => void
  visible?: boolean
}

export function TaskDetailContent({ taskId, task, onUpdate, onClose }: TaskDetailContentProps): React.JSX.Element {
  const editorPanelWidth = useUIStore((s) => s.editorPanelWidth)
  const setEditorPanelWidth = useUIStore((s) => s.setEditorPanelWidth)
  const [documentContent, setDocumentContent] = useState<string | undefined>(undefined)
  const [documentLoaded, setDocumentLoaded] = useState(false)
  const [previewFile, setPreviewFile] = useState<TaskPastedFile | null>(null)

  const currentTask = useTaskStore((s) => s.getTaskById(taskId))
  const updateTask = useTaskStore((s) => s.updateTask)
  const pastedFiles = currentTask?.pastedFiles ?? []

  const handleRemovePastedFile = useCallback(
    async (filename: string) => {
      if (!currentTask) return
      try {
        await window.api.deletePastedFile(taskId, filename)
        const updated = (currentTask.pastedFiles ?? []).filter((f) => f.filename !== filename)
        await updateTask({ ...currentTask, pastedFiles: updated.length > 0 ? updated : undefined })
      } catch (err) {
        console.warn('Failed to delete pasted file:', err)
      }
    },
    [currentTask, taskId, updateTask]
  )

  // Load document content on mount / taskId change
  useEffect(() => {
    let cancelled = false

    async function loadDocument(): Promise<void> {
      try {
        const content = await window.api.readTaskDocument(taskId)
        if (!cancelled) {
          setDocumentContent(content || '')
          setDocumentLoaded(true)
        }
      } catch {
        // Document may not exist yet — that's fine
        if (!cancelled) {
          setDocumentContent('')
          setDocumentLoaded(true)
        }
      }
    }

    setDocumentLoaded(false)
    loadDocument()

    return () => {
      cancelled = true
    }
  }, [taskId])

  // Re-read document when external file changes are detected
  useEffect(() => {
    const unsub = window.api.watchProjectDir(async () => {
      try {
        const content = await window.api.readTaskDocument(taskId)
        setDocumentContent(content || '')
      } catch {
        // Ignore — task may have been deleted
      }
    })
    return () => unsub()
  }, [taskId])

  return (
    <div className={styles.container}>
      <SplitPanel
        left={
          <div className={styles.leftPanel}>
            <div className={styles.stickyHeader}>
              <TaskDetailHeader task={task} onUpdate={onUpdate} onClose={onClose} />
            </div>
            <div className={styles.scrollArea}>
              <div className={styles.editorSection}>
                {documentLoaded ? (
                  <BlockEditor
                    key={taskId}
                    taskId={taskId}
                    initialContent={documentContent}
                  />
                ) : (
                  <div className={styles.editorArea}>Loading...</div>
                )}
              </div>
              {task.forkedFrom && (
                <div
                  className={styles.forkLink}
                  onClick={() => {
                    const { openTaskDetail } = useUIStore.getState()
                    openTaskDetail(task.forkedFrom!)
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="18" r="3" />
                    <circle cx="6" cy="6" r="3" />
                    <circle cx="18" cy="6" r="3" />
                    <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
                    <path d="M12 12v3" />
                  </svg>
                  <span>Forked from <strong>{task.forkedFrom}</strong></span>
                  {!useTaskStore.getState().getTaskById(task.forkedFrom) && (
                    <span className={styles.forkDeleted}>(deleted)</span>
                  )}
                </div>
              )}
              <TaskFiles taskId={taskId} />
              {pastedFiles.length > 0 && (
                <div className={styles.pastedFilesSection}>
                  <div className={styles.pastedFilesHeader}>Pasted Files</div>
                  <div className={styles.pastedFilesList}>
                    {pastedFiles.map((pf) => (
                      <PastedFileCard
                        key={pf.filename}
                        file={pf}
                        onClick={() => setPreviewFile(pf)}
                        onRemove={() => handleRemovePastedFile(pf.filename)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {task.forks && task.forks.length > 0 && (
                <div className={styles.forksSection}>
                  <div className={styles.forksSectionHeader}>Forks</div>
                  <div className={styles.forksList}>
                    {task.forks.map((forkId) => {
                      const forkTask = useTaskStore.getState().getTaskById(forkId)
                      return (
                        <div
                          key={forkId}
                          className={styles.forkItem}
                          onClick={() => {
                            const { openTaskDetail } = useUIStore.getState()
                            openTaskDetail(forkId)
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="18" r="3" />
                            <circle cx="6" cy="6" r="3" />
                            <circle cx="18" cy="6" r="3" />
                            <path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9" />
                            <path d="M12 12v3" />
                          </svg>
                          <span className={styles.forkItemId}>{forkId}</span>
                          {forkTask && <span className={styles.forkItemTitle}>{forkTask.title}</span>}
                          {!forkTask && <span className={styles.forkDeleted}>(deleted)</span>}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              <div className={styles.activitySection}>
                <ActivityTimeline taskId={taskId} />
              </div>
            </div>
          </div>
        }
        right={
          <TerminalPanel taskId={taskId} />
        }
        defaultLeftWidth={editorPanelWidth}
        minLeftWidth={300}
        maxLeftWidth={800}
        onWidthChange={setEditorPanelWidth}
      />
      {previewFile && (
        <PreviewDialog
          taskId={taskId}
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </div>
  )
}
