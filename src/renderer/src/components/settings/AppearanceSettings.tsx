import { useUIStore } from '@renderer/stores/ui-store'
import { getDarkThemes, getLightThemes, type ThemePreset } from '@shared/themes'

export function AppearanceSettings(): React.JSX.Element {
  const themeMode = useUIStore((s) => s.themeMode)
  const darkTheme = useUIStore((s) => s.darkTheme)
  const lightTheme = useUIStore((s) => s.lightTheme)
  const setThemeMode = useUIStore((s) => s.setThemeMode)
  const setDarkTheme = useUIStore((s) => s.setDarkTheme)
  const setLightTheme = useUIStore((s) => s.setLightTheme)

  const darkThemes = getDarkThemes()
  const lightThemes = getLightThemes()

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Mode selector */}
      <div>
        <div style={labelStyle}>Mode</div>
        <div style={segmentedControlContainer}>
          {(['system', 'light', 'dark'] as const).map((mode) => (
            <button
              key={mode}
              style={themeMode === mode ? segmentedActive : segmentedButton}
              onClick={() => setThemeMode(mode)}
            >
              {mode === 'system' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <line x1="8" y1="21" x2="16" y2="21" />
                  <line x1="12" y1="17" x2="12" y2="21" />
                </svg>
              ) : mode === 'light' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6 }}>
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              )}
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Dark theme grid */}
      <div style={themeMode === 'light' ? { opacity: 0.5 } : undefined}>
        <div style={labelStyle}>Dark Theme</div>
        {themeMode === 'light' && (
          <div style={subtitleStyle}>Used when mode is Dark or System</div>
        )}
        <div style={gridStyle}>
          {darkThemes.map((preset) => (
            <ThemePreviewCard
              key={preset.id}
              preset={preset}
              selected={darkTheme === preset.id}
              onClick={() => setDarkTheme(preset.id)}
            />
          ))}
        </div>
      </div>

      {/* Light theme grid */}
      <div style={themeMode === 'dark' ? { opacity: 0.5 } : undefined}>
        <div style={labelStyle}>Light Theme</div>
        {themeMode === 'dark' && (
          <div style={subtitleStyle}>Used when mode is Light or System</div>
        )}
        <div style={gridStyle}>
          {lightThemes.map((preset) => (
            <ThemePreviewCard
              key={preset.id}
              preset={preset}
              selected={lightTheme === preset.id}
              onClick={() => setLightTheme(preset.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ThemePreviewCard({
  preset,
  selected,
  onClick
}: {
  preset: ThemePreset
  selected: boolean
  onClick: () => void
}): React.JSX.Element {
  const c = preset.colors

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        border: selected ? `2px solid ${c['--accent']}` : '2px solid transparent',
        borderRadius: 8,
        overflow: 'hidden',
        cursor: 'pointer',
        background: c['--bg-primary'],
        padding: 0,
        textAlign: 'left',
        transition: 'border-color 0.15s ease',
        outline: 'none'
      }}
    >
      {/* Mini task card preview */}
      <div style={{
        padding: '10px 12px',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        borderBottom: `1px solid ${c['--border']}`
      }}>
        {/* Task card row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {/* Status circle */}
          <div style={{
            width: 8, height: 8, borderRadius: '50%',
            border: `1.5px solid ${c['--status-in-progress']}`,
            flexShrink: 0
          }} />
          <span style={{
            fontSize: 11, fontWeight: 500,
            color: c['--text-primary'],
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
          }}>
            Build auth module
          </span>
        </div>
        {/* Labels and badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3,
            backgroundColor: c['--accent-subtle'], color: c['--accent'],
            fontWeight: 500
          }}>
            feature
          </span>
          <span style={{
            fontSize: 9, padding: '1px 5px', borderRadius: 3,
            backgroundColor: c['--overlay-subtle'], color: c['--text-secondary'],
            fontWeight: 500
          }}>
            In Progress
          </span>
          {/* Agent status dot */}
          <div style={{
            width: 5, height: 5, borderRadius: '50%',
            backgroundColor: c['--agent-running'],
            marginLeft: 'auto'
          }} />
        </div>
      </div>

      {/* Mini terminal preview */}
      <div style={{
        padding: '8px 10px',
        fontFamily: "'SF Mono', 'Fira Code', monospace",
        fontSize: 9,
        lineHeight: 1.5,
        backgroundColor: c['--bg-primary'],
        display: 'flex',
        flexDirection: 'column',
        gap: 1,
        borderBottom: `1px solid ${c['--border']}`
      }}>
        <div>
          <span style={{ color: c['--term-green'] }}>$</span>
          <span style={{ color: c['--text-primary'] }}> npm test</span>
        </div>
        <div style={{ color: c['--term-green'] }}>PASS src/auth.test.ts</div>
        <div style={{ color: c['--term-red'] }}>FAIL src/db.test.ts</div>
        <div style={{ color: c['--term-yellow'] }}>warn: retry limit</div>
      </div>

      {/* Footer: theme name + color dots */}
      <div style={{
        padding: '8px 12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: c['--bg-surface']
      }}>
        <span style={{
          fontSize: 11, fontWeight: 500,
          color: c['--text-primary']
        }}>
          {preset.name}
        </span>
        <div style={{ display: 'flex', gap: 3 }}>
          {[
            c['--accent'],
            c['--term-red'],
            c['--term-green'],
            c['--term-yellow'],
            c['--term-magenta'],
            c['--term-cyan']
          ].map((color, i) => (
            <div
              key={i}
              style={{
                width: 8, height: 8, borderRadius: '50%',
                backgroundColor: color
              }}
            />
          ))}
        </div>
      </div>
    </button>
  )
}

const labelStyle: React.CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  color: 'var(--text-primary)',
  marginBottom: 8
}

const subtitleStyle: React.CSSProperties = {
  fontSize: 11,
  color: 'var(--text-tertiary)',
  marginBottom: 8,
  marginTop: -4
}

const segmentedControlContainer: React.CSSProperties = {
  display: 'inline-flex',
  borderRadius: 6,
  border: '1px solid var(--border)',
  overflow: 'hidden',
  backgroundColor: 'var(--bg-surface)'
}

const segmentedBase: React.CSSProperties = {
  padding: '6px 16px',
  fontSize: 12,
  fontWeight: 500,
  cursor: 'pointer',
  border: 'none',
  background: 'none',
  color: 'var(--text-secondary)',
  display: 'flex',
  alignItems: 'center',
  transition: 'background-color 0.15s ease, color 0.15s ease'
}

const segmentedButton: React.CSSProperties = {
  ...segmentedBase
}

const segmentedActive: React.CSSProperties = {
  ...segmentedBase,
  backgroundColor: 'var(--accent)',
  color: '#ffffff'
}

const gridStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: 12
}
