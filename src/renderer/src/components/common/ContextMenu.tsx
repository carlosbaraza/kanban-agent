import { useEffect, useRef, useCallback, useState, useLayoutEffect } from 'react'

export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  onClick: () => void
  danger?: boolean
  divider?: boolean
}

export interface ContextMenuProps {
  items: ContextMenuItem[]
  position: { x: number; y: number }
  onClose: () => void
}

export function ContextMenu({ items, position, onClose }: ContextMenuProps): React.JSX.Element {
  const menuRef = useRef<HTMLDivElement>(null)
  const focusedIndexRef = useRef<number>(-1)
  const [adjustedPosition, setAdjustedPosition] = useState(position)

  // Measure menu after render and clamp to viewport bounds
  useLayoutEffect(() => {
    const menu = menuRef.current
    if (!menu) {
      setAdjustedPosition(position)
      return
    }

    const pad = 8
    const rect = menu.getBoundingClientRect()
    const x = Math.max(pad, Math.min(position.x, window.innerWidth - rect.width - pad))
    const y = Math.max(pad, Math.min(position.y, window.innerHeight - rect.height - pad))
    setAdjustedPosition({ x, y })
  }, [position])

  const focusItem = useCallback(
    (index: number) => {
      const validItems = items.filter((item) => !item.divider)
      if (index < 0 || index >= validItems.length) return
      focusedIndexRef.current = index
      const el = menuRef.current?.querySelectorAll('[data-context-item]')[index] as HTMLElement
      el?.focus()
    },
    [items]
  )

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const actionItems = items.filter((item) => !item.divider)
      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const next = Math.min(focusedIndexRef.current + 1, actionItems.length - 1)
          focusItem(next)
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prev = Math.max(focusedIndexRef.current - 1, 0)
          focusItem(prev)
          break
        }
        case 'Enter': {
          e.preventDefault()
          if (focusedIndexRef.current >= 0 && focusedIndexRef.current < actionItems.length) {
            actionItems[focusedIndexRef.current].onClick()
            onClose()
          }
          break
        }
        case 'Escape': {
          e.preventDefault()
          onClose()
          break
        }
        default: {
          // Handle shortcut keys (single character)
          const key = e.key.toLowerCase()
          const match = actionItems.find(
            (item) => item.shortcut && item.shortcut.toLowerCase() === key
          )
          if (match) {
            e.preventDefault()
            match.onClick()
            onClose()
          }
          break
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [items, onClose, focusItem])

  // Focus first item on mount
  useEffect(() => {
    focusItem(0)
  }, [focusItem])

  let itemIndex = -1

  return (
    <div
      style={{
        ...menuStyles.overlay,
        pointerEvents: 'none'
      }}
    >
      <div
        ref={menuRef}
        style={{
          ...menuStyles.menu,
          left: adjustedPosition.x,
          top: adjustedPosition.y,
          pointerEvents: 'auto'
        }}
        role="menu"
        onClick={(e) => e.stopPropagation()}
      >
        {items.map((item, i) => {
          if (item.divider) {
            return <div key={`divider-${i}`} style={menuStyles.divider} role="separator" />
          }

          itemIndex++
          const currentIndex = itemIndex

          return (
            <button
              key={item.label}
              data-context-item
              role="menuitem"
              style={{
                ...menuStyles.item,
                ...(item.danger ? menuStyles.itemDanger : {})
              }}
              onClick={(e) => {
                e.stopPropagation()
                item.onClick()
                onClose()
              }}
              onMouseEnter={() => {
                focusedIndexRef.current = currentIndex
              }}
              onFocus={() => {
                focusedIndexRef.current = currentIndex
              }}
            >
              {item.icon && <span style={menuStyles.icon}>{item.icon}</span>}
              <span style={menuStyles.label}>{item.label}</span>
              {item.shortcut && <span style={menuStyles.shortcut}>{item.shortcut}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const menuStyles: Record<string, React.CSSProperties> = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 500
  },
  menu: {
    position: 'fixed',
    minWidth: 180,
    maxWidth: 260,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    boxShadow: 'var(--shadow-lg), 0 0 0 1px var(--overlay-faint)',
    padding: '4px 0',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    animation: 'cmdkFadeIn 100ms ease'
  },
  item: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    padding: '6px 12px',
    fontSize: 13,
    color: 'var(--text-primary)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: 0,
    outline: 'none',
    transition: 'background-color 80ms ease',
    fontFamily: 'inherit'
  },
  itemDanger: {
    color: 'var(--priority-urgent)'
  },
  icon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 16,
    height: 16,
    flexShrink: 0,
    fontSize: 14,
    color: 'var(--text-secondary)'
  },
  label: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  shortcut: {
    fontSize: 11,
    color: 'var(--text-tertiary)',
    fontFamily: "'SF Mono', 'Fira Code', monospace",
    flexShrink: 0
  },
  divider: {
    height: 1,
    backgroundColor: 'var(--border)',
    margin: '4px 0'
  }
}

// Add CSS for hover focus via a style tag (since inline styles can't handle :focus/:hover)
if (typeof document !== 'undefined') {
  const styleId = 'context-menu-styles'
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style')
    style.id = styleId
    style.textContent = `
      [data-context-item]:hover,
      [data-context-item]:focus {
        background-color: var(--accent-subtle) !important;
        outline: none;
      }
    `
    document.head.appendChild(style)
  }
}
