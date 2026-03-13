import type { Priority } from '@shared/types'

interface PriorityIconProps {
  priority: Priority
  size?: number
}

/**
 * Linear-style priority icon.
 * - urgent: red/orange exclamation mark triangle
 * - high/medium/low: vertical bars (filled count matches level)
 * - none: three gray horizontal dashes
 */
export function PriorityIcon({ priority, size = 14 }: PriorityIconProps): React.JSX.Element {
  if (priority === 'urgent') {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <path
          d="M8.6 1.2a.7.7 0 0 0-1.2 0L1.1 12.9a.7.7 0 0 0 .6 1.1h12.6a.7.7 0 0 0 .6-1.1L8.6 1.2Z"
          style={{ fill: 'var(--priority-urgent)' }}
          opacity={0.15}
        />
        <path
          d="M8.6 1.2a.7.7 0 0 0-1.2 0L1.1 12.9a.7.7 0 0 0 .6 1.1h12.6a.7.7 0 0 0 .6-1.1L8.6 1.2Z"
          style={{ stroke: 'var(--priority-urgent)' }}
          strokeWidth={1.2}
          fill="none"
        />
        <rect x="7.25" y="5.5" width="1.5" height="4.5" rx="0.75" style={{ fill: 'var(--priority-urgent)' }} />
        <circle cx="8" cy="12" r="0.85" style={{ fill: 'var(--priority-urgent)' }} />
      </svg>
    )
  }

  if (priority === 'none') {
    const barColor = 'var(--priority-none)'
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 16 16"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <rect x="2" y="4.5" width="4" height="1.5" rx="0.75" fill={barColor} opacity={0.5} />
        <rect x="2" y="7.25" width="4" height="1.5" rx="0.75" fill={barColor} opacity={0.5} />
        <rect x="2" y="10" width="4" height="1.5" rx="0.75" fill={barColor} opacity={0.5} />
      </svg>
    )
  }

  // Bar-based icons for high/medium/low
  const barWidth = 3
  const gap = 1.5
  const startX = 3
  const baseY = 13
  const heights = [4, 7, 10]
  const activeColor =
    priority === 'high' ? 'var(--priority-high)' : priority === 'medium' ? 'var(--priority-medium)' : 'var(--priority-low)'
  const inactiveColor = 'var(--priority-none)'
  const activeBars = priority === 'high' ? 3 : priority === 'medium' ? 2 : 1

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      style={{ flexShrink: 0 }}
    >
      {heights.map((h, i) => (
        <rect
          key={i}
          x={startX + i * (barWidth + gap)}
          y={baseY - h}
          width={barWidth}
          height={h}
          rx={1}
          fill={i < activeBars ? activeColor : inactiveColor}
          opacity={i < activeBars ? 1 : 0.3}
        />
      ))}
    </svg>
  )
}
