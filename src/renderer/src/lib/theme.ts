import { getThemePreset } from '@shared/themes'

/**
 * Apply a theme by setting the data-theme attribute.
 * CSS selectors in themes.css will activate the matching variable set.
 */
export function applyTheme(themeId: string): void {
  document.documentElement.setAttribute('data-theme', themeId)
}

/**
 * Resolve which theme ID to use given mode, selections, and OS preference.
 */
export function resolveThemeId(
  mode: 'system' | 'light' | 'dark',
  darkTheme: string,
  lightTheme: string,
  systemPrefersDark: boolean
): string {
  if (mode === 'dark') return darkTheme
  if (mode === 'light') return lightTheme
  return systemPrefersDark ? darkTheme : lightTheme
}

/**
 * Check if a theme ID refers to a dark theme.
 * Falls back to true (dark) for unknown IDs.
 */
export function isDarkTheme(themeId: string): boolean {
  const preset = getThemePreset(themeId)
  return preset ? preset.type === 'dark' : true
}
