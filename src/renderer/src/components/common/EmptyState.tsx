export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps): React.JSX.Element {
  return (
    <div style={emptyStyles.container}>
      {icon && <div style={emptyStyles.icon}>{icon}</div>}
      <h3 style={emptyStyles.title}>{title}</h3>
      {description && <p style={emptyStyles.description}>{description}</p>}
      {action && (
        <button style={emptyStyles.action} onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  )
}

const emptyStyles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center',
    gap: 12
  },
  icon: {
    fontSize: 32,
    color: 'var(--text-tertiary)',
    marginBottom: 4
  },
  title: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
    margin: 0,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  description: {
    fontSize: 13,
    color: 'var(--text-secondary)',
    margin: 0,
    maxWidth: 280,
    lineHeight: 1.5
  },
  action: {
    marginTop: 8,
    padding: '6px 16px',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-primary)',
    backgroundColor: 'var(--accent)',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    transition: 'background-color 100ms ease'
  }
}
