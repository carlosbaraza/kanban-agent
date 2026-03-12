import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { Tooltip } from './Tooltip'

describe('Tooltip', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders children immediately', () => {
    render(
      <Tooltip content="Hello">
        <button>Hover me</button>
      </Tooltip>
    )
    expect(screen.getByText('Hover me')).toBeTruthy()
  })

  it('does not show tooltip content initially', () => {
    render(
      <Tooltip content="Tip text">
        <button>Trigger</button>
      </Tooltip>
    )
    expect(screen.queryByText('Tip text')).toBeNull()
  })

  it('shows tooltip after hover and delay', () => {
    render(
      <Tooltip content="Tip text" delay={100}>
        <button>Trigger</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Trigger'))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText('Tip text')).toBeTruthy()
  })

  it('hides tooltip on mouse leave', () => {
    render(
      <Tooltip content="Tip text" delay={100}>
        <button>Trigger</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Trigger'))
    act(() => {
      vi.advanceTimersByTime(100)
    })
    expect(screen.getByText('Tip text')).toBeTruthy()

    fireEvent.mouseLeave(screen.getByText('Trigger'))
    expect(screen.queryByText('Tip text')).toBeNull()
  })

  it('does not show tooltip when disabled', () => {
    render(
      <Tooltip content="Tip text" delay={0} disabled>
        <button>Trigger</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Trigger'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    expect(screen.queryByText('Tip text')).toBeNull()
  })

  it('starts hidden (opacity 0) until positioned', () => {
    render(
      <Tooltip content="Tip text" delay={0}>
        <button>Trigger</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Trigger'))
    act(() => {
      vi.advanceTimersByTime(0)
    })
    const tip = screen.getByText('Tip text').closest('[style]') as HTMLElement
    // Before rAF fires, tooltip should be invisible
    expect(tip.style.opacity).toBe('0')
  })

  it('cleans up timer on unmount', () => {
    const { unmount } = render(
      <Tooltip content="Tip text" delay={500}>
        <button>Trigger</button>
      </Tooltip>
    )
    fireEvent.mouseEnter(screen.getByText('Trigger'))
    unmount()
    // Should not throw
    act(() => {
      vi.advanceTimersByTime(500)
    })
  })
})
