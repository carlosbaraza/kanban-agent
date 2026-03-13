import { useState, useCallback, useRef, useEffect, useMemo } from 'react'
import { icons } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface IconPickerProps {
  selectedIcon?: string
  onSelect: (iconName: string) => void
  onClose: () => void
  anchorRect: DOMRect | null
}

// Convert PascalCase icon names to kebab-case for display/search
function toKebab(name: string): string {
  return name.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase()
}

const iconEntries: Array<{ name: string; kebab: string; Component: LucideIcon }> = Object.entries(
  icons
).map(([name, Component]) => ({
  name,
  kebab: toKebab(name),
  Component
}))

export function IconPicker({
  selectedIcon,
  onSelect,
  onClose,
  anchorRect
}: IconPickerProps): React.JSX.Element {
  const [search, setSearch] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent): void {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    function handleEscape(e: KeyboardEvent): void {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const filtered = useMemo(() => {
    if (!search.trim()) return iconEntries.slice(0, 60)
    const q = search.toLowerCase()
    return iconEntries.filter((e) => e.kebab.includes(q)).slice(0, 60)
  }, [search])

  const handleSelect = useCallback(
    (name: string) => {
      onSelect(toKebab(name))
      onClose()
    },
    [onSelect, onClose]
  )

  const top = anchorRect ? anchorRect.bottom + 4 : 0
  const left = anchorRect ? anchorRect.left : 0

  return (
    <div ref={popoverRef} style={{ ...pickerStyles.popover, top, left }}>
      <input
        ref={inputRef}
        style={pickerStyles.search}
        placeholder="Search icons..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div style={pickerStyles.grid}>
        {filtered.map((entry) => {
          const Icon = entry.Component
          const isSelected = selectedIcon === entry.kebab
          return (
            <button
              key={entry.name}
              style={{
                ...pickerStyles.iconButton,
                ...(isSelected ? pickerStyles.iconButtonSelected : {})
              }}
              title={entry.kebab}
              onClick={() => handleSelect(entry.name)}
            >
              <Icon size={16} />
            </button>
          )
        })}
        {filtered.length === 0 && (
          <div style={pickerStyles.noResults}>No icons found</div>
        )}
      </div>
      <div style={pickerStyles.count}>
        {filtered.length} icon{filtered.length !== 1 ? 's' : ''}
        {search ? ` matching "${search}"` : ''}
      </div>
    </div>
  )
}

/** Render a Lucide icon by its kebab-case name. Returns null if not found. */
export function LucideIconByName({
  name,
  size = 14,
  ...props
}: {
  name: string
  size?: number
  className?: string
  style?: React.CSSProperties
}): React.JSX.Element | null {
  // Convert kebab-case to PascalCase for lookup
  const pascalName = name
    .split('-')
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  const Icon = icons[pascalName as keyof typeof icons]
  if (!Icon) return null
  return <Icon size={size} {...props} />
}

const pickerStyles: Record<string, React.CSSProperties> = {
  popover: {
    position: 'fixed',
    zIndex: 10000,
    width: '280px',
    maxHeight: '320px',
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    display: 'flex',
    flexDirection: 'column',
    padding: '10px'
  },
  search: {
    width: '100%',
    padding: '6px 10px',
    fontSize: '12px',
    borderRadius: '5px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    marginBottom: '8px',
    boxSizing: 'border-box' as const,
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif"
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, 1fr)',
    gap: '4px',
    overflowY: 'auto',
    flex: 1,
    maxHeight: '200px'
  },
  iconButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px',
    borderRadius: '5px',
    border: '1px solid transparent',
    backgroundColor: 'var(--overlay-faint)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'background-color 0.1s, border-color 0.1s'
  },
  iconButtonSelected: {
    backgroundColor: 'var(--accent-subtle)',
    borderColor: 'color-mix(in srgb, var(--accent) 30%, transparent)',
    color: 'var(--accent)'
  },
  noResults: {
    gridColumn: '1 / -1',
    textAlign: 'center' as const,
    color: 'var(--text-tertiary)',
    fontSize: '12px',
    padding: '16px'
  },
  count: {
    marginTop: '6px',
    color: 'var(--text-tertiary)',
    fontSize: '10px',
    textAlign: 'center' as const
  }
}
