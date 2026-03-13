import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useUIStore } from '../../src/renderer/src/stores/ui-store'

// Mock matchMedia
const mockMatchMedia = vi.fn().mockImplementation((query: string) => ({
  matches: query === '(prefers-color-scheme: dark)',
  media: query,
  addEventListener: vi.fn(),
  removeEventListener: vi.fn()
}))
Object.defineProperty(window, 'matchMedia', { writable: true, value: mockMatchMedia })

describe('Theme system integration', () => {
  beforeEach(() => {
    useUIStore.setState({
      themeMode: 'system',
      darkTheme: 'familiar-dark',
      lightTheme: 'familiar-light'
    })
    document.documentElement.removeAttribute('data-theme')
  })

  it('full cycle: mode changes resolve correct theme', async () => {
    const { resolveThemeId } = await import('../../src/renderer/src/lib/theme')

    // System mode + dark OS = dark theme
    expect(resolveThemeId('system', 'familiar-dark', 'familiar-light', true)).toBe('familiar-dark')

    // System mode + light OS = light theme
    expect(resolveThemeId('system', 'familiar-dark', 'familiar-light', false)).toBe('familiar-light')

    // Force dark
    expect(resolveThemeId('dark', 'dracula', 'familiar-light', false)).toBe('dracula')

    // Force light
    expect(resolveThemeId('light', 'dracula', 'solarized-light', true)).toBe('solarized-light')
  })

  it('theme presets all have unique IDs', async () => {
    const { THEME_PRESETS } = await import('../../src/shared/themes')
    const ids = THEME_PRESETS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('applyTheme sets data-theme attribute', async () => {
    const { applyTheme } = await import('../../src/renderer/src/lib/theme')
    applyTheme('dracula')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dracula')
  })

  it('store cycle: system → light → dark → system', () => {
    const store = useUIStore.getState()
    expect(store.themeMode).toBe('system')

    store.cycleThemeMode()
    expect(useUIStore.getState().themeMode).toBe('light')

    useUIStore.getState().cycleThemeMode()
    expect(useUIStore.getState().themeMode).toBe('dark')

    useUIStore.getState().cycleThemeMode()
    expect(useUIStore.getState().themeMode).toBe('system')
  })

  it('settings fields have defaults', async () => {
    const { DEFAULT_SETTINGS } = await import('../../src/shared/types/settings')
    expect(DEFAULT_SETTINGS.themeMode).toBe('system')
    expect(DEFAULT_SETTINGS.darkTheme).toBe('familiar-dark')
    expect(DEFAULT_SETTINGS.lightTheme).toBe('familiar-light')
  })
})
