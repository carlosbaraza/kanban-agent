import { useState, useRef, useCallback, useEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right'

export interface TooltipProps {
  /** The element that triggers the tooltip on hover */
  children: ReactNode
  /** Content rendered inside the tooltip — can be any JSX */
  content: ReactNode
  /** Placement relative to the trigger element */
  placement?: TooltipPlacement
  /** Delay in ms before showing */
  delay?: number
  /** Whether the tooltip is disabled */
  disabled?: boolean
}

export function Tooltip({
  children,
  content,
  placement = 'top',
  delay = 150,
  disabled = false
}: TooltipProps): React.JSX.Element {
  const [visible, setVisible] = useState(false)
  const [positioned, setPositioned] = useState(false)
  const [coords, setCoords] = useState<{ top: number; left: number }>({ top: 0, left: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const show = useCallback(() => {
    if (disabled) return
    timerRef.current = setTimeout(() => {
      setVisible(true)
      setPositioned(false)
    }, delay)
  }, [delay, disabled])

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setVisible(false)
    setPositioned(false)
  }, [])

  // Position the tooltip after it becomes visible
  useEffect(() => {
    if (!visible || !triggerRef.current) return

    const updatePosition = (): void => {
      const trigger = triggerRef.current
      const tooltip = tooltipRef.current
      if (!trigger || !tooltip) return

      const rect = trigger.getBoundingClientRect()
      const tipRect = tooltip.getBoundingClientRect()
      const gap = 8
      const pad = 8

      // Compute position for a given placement
      const compute = (
        p: TooltipPlacement
      ): { top: number; left: number } => {
        let t = 0
        let l = 0
        switch (p) {
          case 'top':
            t = rect.top - tipRect.height - gap
            l = rect.left + rect.width / 2 - tipRect.width / 2
            break
          case 'bottom':
            t = rect.bottom + gap
            l = rect.left + rect.width / 2 - tipRect.width / 2
            break
          case 'left':
            t = rect.top + rect.height / 2 - tipRect.height / 2
            l = rect.left - tipRect.width - gap
            break
          case 'right':
            t = rect.top + rect.height / 2 - tipRect.height / 2
            l = rect.right + gap
            break
        }
        return { top: t, left: l }
      }

      // Check if a position fits within viewport
      const fits = (pos: { top: number; left: number }): boolean =>
        pos.top >= pad &&
        pos.left >= pad &&
        pos.top + tipRect.height <= window.innerHeight - pad &&
        pos.left + tipRect.width <= window.innerWidth - pad

      const opposite: Record<TooltipPlacement, TooltipPlacement> = {
        top: 'bottom',
        bottom: 'top',
        left: 'right',
        right: 'left'
      }

      // Try preferred placement first, then opposite, then remaining two
      let pos = compute(placement)
      if (!fits(pos)) {
        const altPos = compute(opposite[placement])
        if (fits(altPos)) {
          pos = altPos
        } else {
          // Try the other axis
          const remaining: TooltipPlacement[] =
            placement === 'top' || placement === 'bottom'
              ? ['left', 'right']
              : ['top', 'bottom']
          for (const p of remaining) {
            const rPos = compute(p)
            if (fits(rPos)) {
              pos = rPos
              break
            }
          }
        }
      }

      // Final clamp as safety net
      pos.left = Math.max(pad, Math.min(pos.left, window.innerWidth - tipRect.width - pad))
      pos.top = Math.max(pad, Math.min(pos.top, window.innerHeight - tipRect.height - pad))

      setCoords(pos)
      setPositioned(true)
    }

    // Run on next frame so tooltip is measured
    requestAnimationFrame(updatePosition)
  }, [visible, placement])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        style={{ display: 'inline-flex' }}
      >
        {children}
      </div>
      {visible &&
        createPortal(
          <div
            ref={tooltipRef}
            style={{
              ...styles.tooltip,
              top: coords.top,
              left: coords.left,
              opacity: positioned ? 1 : 0
            }}
            onMouseEnter={hide}
          >
            {content}
          </div>,
          document.body
        )}
    </>
  )
}

const styles: Record<string, React.CSSProperties> = {
  tooltip: {
    position: 'fixed',
    zIndex: 10000,
    padding: '8px 12px',
    borderRadius: '8px',
    backgroundColor: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.45), 0 0 1px rgba(255,255,255,0.05)',
    fontSize: '12px',
    lineHeight: 1.5,
    color: 'var(--text-secondary)',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    maxWidth: '280px',
    pointerEvents: 'none',
    animation: 'tooltip-fade-in 0.15s ease-out'
  },
  arrow: {}
}

// Inject keyframe animation once
if (typeof document !== 'undefined') {
  const id = 'familiar-tooltip-keyframes'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `
      @keyframes tooltip-fade-in {
        from { opacity: 0; transform: translateY(4px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `
    document.head.appendChild(style)
  }
}
