import { useState, useCallback, useMemo } from 'react'
import type { Task, TaskStatus } from '@shared/types'
import { DEFAULT_COLUMNS } from '@shared/constants'
import { useTaskStore } from '@renderer/stores/task-store'
import { useUIStore } from '@renderer/stores/ui-store'
import { useBoardStore } from '@renderer/stores/board-store'
import { KanbanColumn } from './KanbanColumn'
import styles from './KanbanBoard.module.css'

export function KanbanBoard(): React.JSX.Element {
  const { projectState, isLoading, addTask, moveTask, initProject } = useTaskStore()
  const { filters, openTaskDetail, activeTaskId } = useUIStore()
  const { draggedTaskId, setDraggedTask, setDragOverColumn, dragOverColumn } = useBoardStore()

  const [initName, setInitName] = useState('')

  const columnOrder = projectState?.columnOrder ?? DEFAULT_COLUMNS

  // Filter tasks
  const filteredTasks = useMemo(() => {
    if (!projectState) return []
    let tasks = projectState.tasks

    if (filters.search) {
      const q = filters.search.toLowerCase()
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.labels.some((l) => l.toLowerCase().includes(q))
      )
    }

    if (filters.priority.length > 0) {
      tasks = tasks.filter((t) => filters.priority.includes(t.priority))
    }

    if (filters.labels.length > 0) {
      tasks = tasks.filter((t) => t.labels.some((l) => filters.labels.includes(l)))
    }

    if (filters.agentStatus.length > 0) {
      tasks = tasks.filter((t) => filters.agentStatus.includes(t.agentStatus))
    }

    return tasks
  }, [projectState, filters])

  // Group tasks by status
  const tasksByStatus = useMemo(() => {
    const map: Record<string, Task[]> = {}
    for (const status of columnOrder) {
      map[status] = filteredTasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.sortOrder - b.sortOrder)
    }
    return map
  }, [filteredTasks, columnOrder])

  const handleTaskClick = useCallback(
    (taskId: string) => {
      openTaskDetail(taskId)
    },
    [openTaskDetail]
  )

  const handleCreateTask = useCallback(
    async (status: TaskStatus, title: string) => {
      await addTask(title, { status })
    },
    [addTask]
  )

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault()
      if (draggedTaskId && dragOverColumn) {
        const targetTasks = tasksByStatus[dragOverColumn] ?? []
        const newSortOrder = targetTasks.length
        await moveTask(draggedTaskId, dragOverColumn, newSortOrder)
      }
      setDraggedTask(null)
      setDragOverColumn(null)
    },
    [draggedTaskId, dragOverColumn, tasksByStatus, moveTask, setDraggedTask, setDragOverColumn]
  )

  const handleInitProject = useCallback(async () => {
    if (initName.trim()) {
      await initProject(initName.trim())
    }
  }, [initName, initProject])

  // Loading state
  if (isLoading) {
    return <div className={styles.loading}>Loading project...</div>
  }

  // No project state — show init screen
  if (!projectState) {
    return (
      <div className={styles.emptyProject}>
        <h2>Welcome to Kanban Agent</h2>
        <p>Create a new project to get started with your AI-powered kanban board.</p>
        <div className={styles.initForm}>
          <input
            className={styles.initInput}
            type="text"
            placeholder="Project name..."
            value={initName}
            onChange={(e) => setInitName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleInitProject()
            }}
          />
          <button className={styles.initButton} onClick={handleInitProject}>
            Create Project
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.board} onDrop={handleDrop} onDragOver={(e) => e.preventDefault()}>
      {columnOrder.map((status) => (
        <KanbanColumn
          key={status}
          status={status}
          tasks={tasksByStatus[status] ?? []}
          onTaskClick={handleTaskClick}
          onCreateTask={(title) => handleCreateTask(status, title)}
          selectedTaskId={activeTaskId}
        />
      ))}
    </div>
  )
}
