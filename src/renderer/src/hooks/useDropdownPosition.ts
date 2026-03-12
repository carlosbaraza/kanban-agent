import { useLayoutEffect, type RefObject } from 'react'

/**
 * Adjusts a dropdown element's position so it stays within viewport bounds.
 * Call this hook when the dropdown is visible, passing a ref to the dropdown element.
 * It measures the element after render and flips/shifts it if it would overflow.
 */
export function useDropdownPosition(
  dropdownRef: RefObject<HTMLElement | null>,
  isOpen: boolean
): void {
  useLayoutEffect(() => {
    const el = dropdownRef.current
    if (!isOpen || !el) return

    const pad = 8
    const rect = el.getBoundingClientRect()

    // Flip upward if overflowing bottom
    if (rect.bottom > window.innerHeight - pad) {
      el.style.top = 'auto'
      el.style.bottom = 'calc(100% + 4px)'
    }

    // Shift left if overflowing right
    if (rect.right > window.innerWidth - pad) {
      el.style.left = 'auto'
      el.style.right = '0'
    }

    // Shift right if overflowing left
    if (rect.left < pad) {
      el.style.right = 'auto'
      el.style.left = '0'
    }
  }, [dropdownRef, isOpen])
}
