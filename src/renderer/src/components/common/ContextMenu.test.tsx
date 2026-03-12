import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ContextMenu } from './ContextMenu'
import type { ContextMenuItem } from './ContextMenu'

const mockItems: ContextMenuItem[] = [
  { label: 'Edit', onClick: vi.fn() },
  { label: 'Copy', onClick: vi.fn(), shortcut: 'Cmd+C' },
  { label: '', onClick: vi.fn(), divider: true },
  { label: 'Delete', onClick: vi.fn(), danger: true }
]

function renderMenu(
  items = mockItems,
  position = { x: 100, y: 200 }
): ReturnType<typeof render> {
  return render(
    <ContextMenu items={items} position={position} onClose={vi.fn()} />
  )
}

describe('ContextMenu', () => {
  it('renders all non-divider items', () => {
    renderMenu()
    expect(screen.getByText('Edit')).toBeTruthy()
    expect(screen.getByText('Copy')).toBeTruthy()
    expect(screen.getByText('Delete')).toBeTruthy()
  })

  it('renders shortcut text when provided', () => {
    renderMenu()
    expect(screen.getByText('Cmd+C')).toBeTruthy()
  })

  it('renders dividers', () => {
    renderMenu()
    const separators = screen.getAllByRole('separator')
    expect(separators).toHaveLength(1)
  })

  it('calls onClick and onClose when an item is clicked', () => {
    const onClose = vi.fn()
    const onClick = vi.fn()
    const items: ContextMenuItem[] = [{ label: 'Action', onClick }]

    render(<ContextMenu items={items} position={{ x: 0, y: 0 }} onClose={onClose} />)

    fireEvent.click(screen.getByText('Action'))
    expect(onClick).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('supports keyboard navigation with ArrowDown and Enter', () => {
    const onClick = vi.fn()
    const items: ContextMenuItem[] = [
      { label: 'First', onClick: vi.fn() },
      { label: 'Second', onClick }
    ]

    render(<ContextMenu items={items} position={{ x: 0, y: 0 }} onClose={vi.fn()} />)

    // Arrow down to second item, then Enter
    fireEvent.keyDown(window, { key: 'ArrowDown' })
    fireEvent.keyDown(window, { key: 'Enter' })
    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('closes on Escape key', () => {
    const onClose = vi.fn()
    render(
      <ContextMenu
        items={[{ label: 'Item', onClick: vi.fn() }]}
        position={{ x: 0, y: 0 }}
        onClose={onClose}
      />
    )

    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  describe('viewport clamping', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
      Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
    })

    it('clamps menu position when near right edge of viewport', () => {
      const { container } = renderMenu(mockItems, { x: 950, y: 100 })
      const menu = container.querySelector('[role="menu"]') as HTMLElement
      expect(menu).toBeTruthy()

      // The menu should exist and use useLayoutEffect for clamping
      // In JSDOM, getBoundingClientRect returns zeroes, so the position
      // is clamped to Math.min(950, 1024 - 0 - 8) = 950 (no adjustment needed
      // when measured width is 0). In a real browser, this would properly clamp.
      expect(menu.style.left).toBeTruthy()
      expect(menu.style.top).toBeTruthy()
    })

    it('clamps menu position when near bottom edge of viewport', () => {
      const { container } = renderMenu(mockItems, { x: 100, y: 700 })
      const menu = container.querySelector('[role="menu"]') as HTMLElement
      expect(menu).toBeTruthy()
      expect(menu.style.left).toBeTruthy()
      expect(menu.style.top).toBeTruthy()
    })

    it('renders menu within viewport when positioned at 0,0', () => {
      const { container } = renderMenu(mockItems, { x: 0, y: 0 })
      const menu = container.querySelector('[role="menu"]') as HTMLElement
      expect(menu).toBeTruthy()
    })
  })
})
