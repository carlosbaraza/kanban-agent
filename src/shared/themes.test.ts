import { describe, it, expect } from 'vitest'
import {
  THEME_PRESETS,
  getThemePreset,
  getDarkThemes,
  getLightThemes
} from './themes'

describe('themes', () => {
  it('has 8 presets total', () => {
    expect(THEME_PRESETS).toHaveLength(8)
  })

  it('has 4 dark and 4 light themes', () => {
    expect(getDarkThemes()).toHaveLength(4)
    expect(getLightThemes()).toHaveLength(4)
  })

  it('dark themes are in correct order', () => {
    const ids = getDarkThemes().map((t) => t.id)
    expect(ids).toEqual(['familiar-dark', 'dracula', 'github-dark', 'nord'])
  })

  it('light themes are in correct order', () => {
    const ids = getLightThemes().map((t) => t.id)
    expect(ids).toEqual(['familiar-light', 'solarized-light', 'github-light', 'catppuccin-latte'])
  })

  it('getThemePreset returns correct preset', () => {
    const preset = getThemePreset('dracula')
    expect(preset).toBeDefined()
    expect(preset!.name).toBe('Dracula')
    expect(preset!.type).toBe('dark')
  })

  it('getThemePreset returns undefined for unknown id', () => {
    expect(getThemePreset('nonexistent')).toBeUndefined()
  })

  it('every preset has all required CSS variable keys', () => {
    const requiredKeys = [
      '--bg-deepest', '--bg-primary', '--bg-surface', '--bg-elevated',
      '--text-primary', '--text-secondary', '--text-tertiary',
      '--accent', '--accent-hover', '--accent-active', '--accent-subtle',
      '--border', '--border-hover',
      '--overlay-faint', '--overlay-subtle', '--overlay-hover', '--overlay-emphasis',
      '--shadow-sm', '--shadow-md', '--shadow-lg', '--shadow-focus',
      '--status-todo', '--status-archived', '--priority-none', '--agent-idle',
      '--term-black', '--term-red', '--term-green', '--term-yellow',
      '--term-blue', '--term-magenta', '--term-cyan', '--term-white',
      '--term-bright-black', '--term-bright-red', '--term-bright-green',
      '--term-bright-yellow', '--term-bright-blue', '--term-bright-magenta',
      '--term-bright-cyan', '--term-bright-white'
    ]
    for (const preset of THEME_PRESETS) {
      for (const key of requiredKeys) {
        expect(preset.colors, `${preset.id} missing ${key}`).toHaveProperty(key)
      }
    }
  })

  it('every preset has a type field of dark or light', () => {
    for (const preset of THEME_PRESETS) {
      expect(['dark', 'light']).toContain(preset.type)
    }
  })

  it('every preset has unique id', () => {
    const ids = THEME_PRESETS.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })
})
