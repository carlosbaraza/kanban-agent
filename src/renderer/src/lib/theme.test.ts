import { describe, it, expect, beforeEach } from 'vitest'
import { applyTheme, resolveThemeId, isDarkTheme } from './theme'

describe('theme utilities', () => {
  beforeEach(() => {
    document.documentElement.removeAttribute('data-theme')
  })

  describe('applyTheme', () => {
    it('sets data-theme attribute on document element', () => {
      applyTheme('dracula')
      expect(document.documentElement.getAttribute('data-theme')).toBe('dracula')
    })
  })

  describe('resolveThemeId', () => {
    it('returns darkTheme when mode is dark', () => {
      expect(resolveThemeId('dark', 'familiar-dark', 'familiar-light', true)).toBe('familiar-dark')
    })

    it('returns lightTheme when mode is light', () => {
      expect(resolveThemeId('light', 'familiar-dark', 'familiar-light', true)).toBe('familiar-light')
    })

    it('returns darkTheme when mode is system and OS prefers dark', () => {
      expect(resolveThemeId('system', 'familiar-dark', 'familiar-light', true)).toBe('familiar-dark')
    })

    it('returns lightTheme when mode is system and OS prefers light', () => {
      expect(resolveThemeId('system', 'familiar-dark', 'familiar-light', false)).toBe('familiar-light')
    })
  })

  describe('isDarkTheme', () => {
    it('returns true for dark theme IDs', () => {
      expect(isDarkTheme('familiar-dark')).toBe(true)
      expect(isDarkTheme('dracula')).toBe(true)
    })

    it('returns false for light theme IDs', () => {
      expect(isDarkTheme('familiar-light')).toBe(false)
      expect(isDarkTheme('solarized-light')).toBe(false)
    })

    it('returns true for unknown IDs (safe fallback)', () => {
      expect(isDarkTheme('unknown')).toBe(true)
    })
  })
})
