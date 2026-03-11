import type { Task } from '@shared/types'
import { PRIORITY_COLORS } from '@shared/constants'
import styles from './TaskCard.module.css'

interface TaskCardProps {
  task: Task
  onClick: () => void
  isDragging?: boolean
  isSelected?: boolean
}

const AGENT_STATUS_COLORS: Record<string, string> = {
  idle: 'var(--agent-idle)',
  running: 'var(--agent-running)',
  done: 'var(--agent-done)',
  error: 'var(--agent-error)'
}

export function TaskCard({
  task,
  onClick,
  isDragging = false,
  isSelected = false
}: TaskCardProps): React.JSX.Element {
  const cardClass = [
    styles.card,
    isSelected ? styles.cardSelected : '',
    isDragging ? styles.cardDragging : ''
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={cardClass} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.topRow}>
        <span
          className={styles.priorityDot}
          style={{ backgroundColor: PRIORITY_COLORS[task.priority] }}
          title={`Priority: ${task.priority}`}
        />
        <span className={styles.title}>{task.title}</span>
      </div>

      <div className={styles.bottomRow}>
        {task.labels.map((label) => (
          <span key={label} className={styles.label}>
            {label}
          </span>
        ))}

        {task.agentStatus !== 'idle' && (
          <span
            className={`${styles.agentDot} ${task.agentStatus === 'running' ? styles.agentRunning : ''}`}
            style={{ backgroundColor: AGENT_STATUS_COLORS[task.agentStatus] }}
            title={`Agent: ${task.agentStatus}`}
          />
        )}
      </div>
    </div>
  )
}
