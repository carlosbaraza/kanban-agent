import { useState, useCallback } from 'react'
import type { Task, TaskStatus } from '@shared/types'
import { COLUMN_LABELS } from '@shared/constants'
import { useBoardStore } from '@renderer/stores/board-store'
import { TaskCard } from './TaskCard'
import styles from './KanbanColumn.module.css'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onTaskClick: (taskId: string) => void
  onCreateTask: (title: string) => void
  selectedTaskId?: string | null
}

const STATUS_COLORS: Record<TaskStatus, string> = {
  backlog: 'var(--status-backlog)',
  todo: 'var(--status-todo)',
  'in-progress': 'var(--status-in-progress)',
  'in-review': 'var(--status-in-review)',
  done: 'var(--status-done)',
  cancelled: 'var(--status-cancelled)'
}

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onCreateTask,
  selectedTaskId
}: KanbanColumnProps): React.JSX.Element {
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const { draggedTaskId, dragOverColumn, setDragOverColumn } = useBoardStore()

  const isDragOver = dragOverColumn === status && draggedTaskId !== null

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && newTaskTitle.trim()) {
        onCreateTask(newTaskTitle.trim())
        setNewTaskTitle('')
      }
      if (e.key === 'Escape') {
        setNewTaskTitle('')
        ;(e.target as HTMLInputElement).blur()
      }
    },
    [newTaskTitle, onCreateTask]
  )

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      if (dragOverColumn !== status) {
        setDragOverColumn(status)
      }
    },
    [status, dragOverColumn, setDragOverColumn]
  )

  const handleDragLeave = useCallback(() => {
    setDragOverColumn(null)
  }, [setDragOverColumn])

  return (
    <div
      className={styles.column}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
    >
      <div className={styles.header}>
        <span
          className={styles.statusDot}
          style={{ backgroundColor: STATUS_COLORS[status] }}
        />
        <span className={styles.statusName}>{COLUMN_LABELS[status]}</span>
        <span className={styles.taskCount}>{tasks.length}</span>
      </div>

      <div className={styles.createArea}>
        <input
          className={styles.createInput}
          type="text"
          placeholder="Create task..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={`${styles.taskList} ${isDragOver ? styles.dropTarget : ''}`}>
        {tasks.length === 0 ? (
          <div className={styles.empty}>No tasks</div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onClick={() => onTaskClick(task.id)}
              isDragging={draggedTaskId === task.id}
              isSelected={selectedTaskId === task.id}
            />
          ))
        )}
      </div>
    </div>
  )
}
