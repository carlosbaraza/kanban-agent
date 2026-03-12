import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useDropdownPosition } from './useDropdownPosition'

describe('useDropdownPosition', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 768, writable: true })
  })

  function createMockRef(rect: Partial<DOMRect>): React.RefObject<HTMLElement> {
    const el = document.createElement('div')
    el.getBoundingClientRect = () => ({
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      toJSON: () => {},
      ...rect
    })
    return { current: el }
  }

  it('does nothing when closed', () => {
    const ref = createMockRef({ bottom: 900, right: 1100 })
    renderHook(() => useDropdownPosition(ref, false))
    expect(ref.current!.style.top).toBe('')
    expect(ref.current!.style.bottom).toBe('')
  })

  it('flips upward when overflowing bottom', () => {
    const ref = createMockRef({ bottom: 800, right: 200, left: 100 })
    renderHook(() => useDropdownPosition(ref, true))
    expect(ref.current!.style.top).toBe('auto')
    expect(ref.current!.style.bottom).toBe('calc(100% + 4px)')
  })

  it('shifts left when overflowing right', () => {
    const ref = createMockRef({ bottom: 200, right: 1100, left: 900 })
    renderHook(() => useDropdownPosition(ref, true))
    expect(ref.current!.style.left).toBe('auto')
    expect(ref.current!.style.right).toBe('0px')
  })

  it('shifts right when overflowing left', () => {
    const ref = createMockRef({ bottom: 200, right: 100, left: -10 })
    renderHook(() => useDropdownPosition(ref, true))
    expect(ref.current!.style.right).toBe('auto')
    expect(ref.current!.style.left).toBe('0px')
  })

  it('does not adjust when fully within viewport', () => {
    const ref = createMockRef({ bottom: 400, right: 300, left: 100, top: 100 })
    renderHook(() => useDropdownPosition(ref, true))
    expect(ref.current!.style.top).toBe('')
    expect(ref.current!.style.bottom).toBe('')
    expect(ref.current!.style.left).toBe('')
    expect(ref.current!.style.right).toBe('')
  })

  it('handles null ref gracefully', () => {
    const ref = { current: null }
    expect(() => {
      renderHook(() => useDropdownPosition(ref, true))
    }).not.toThrow()
  })
})
