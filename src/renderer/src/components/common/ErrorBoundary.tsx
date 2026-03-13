import { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  componentStack: string | null
  copied: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, componentStack: null, copied: false }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('App crashed:', error, info.componentStack)
    this.setState({ componentStack: info.componentStack ?? null })
  }

  handleReload = (): void => {
    window.location.reload()
  }

  buildDebugReport = (): string => {
    const { error, componentStack } = this.state
    const sections: string[] = []

    sections.push('=== Familiar Crash Report ===')
    sections.push(`Timestamp: ${new Date().toISOString()}`)
    sections.push(`URL: ${window.location.href}`)
    sections.push(`Platform: ${navigator.platform}`)
    sections.push(`User Agent: ${navigator.userAgent}`)
    sections.push(`Viewport: ${window.innerWidth}x${window.innerHeight}`)
    sections.push(`Device Pixel Ratio: ${window.devicePixelRatio}`)

    if (error) {
      sections.push('')
      sections.push('--- Error ---')
      sections.push(`Name: ${error.name}`)
      sections.push(`Message: ${error.message}`)
      if (error.stack) {
        sections.push('')
        sections.push('--- Stack Trace ---')
        sections.push(error.stack)
      }
    }

    if (componentStack) {
      sections.push('')
      sections.push('--- Component Stack ---')
      sections.push(componentStack.trim())
    }

    return sections.join('\n')
  }

  handleCopyDebugInfo = (): void => {
    const report = this.buildDebugReport()
    navigator.clipboard.writeText(report).then(() => {
      this.setState({ copied: true })
      setTimeout(() => this.setState({ copied: false }), 2000)
    })
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100vh',
            backgroundColor: 'var(--bg-primary)',
            color: 'var(--text-primary)',
            fontFamily: 'Inter, -apple-system, sans-serif',
            padding: '2rem',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 12,
              backgroundColor: 'rgba(231, 76, 60, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
              fontSize: 24
            }}
          >
            !
          </div>
          <h1
            style={{
              fontSize: 18,
              fontWeight: 600,
              margin: '0 0 8px 0',
              color: 'var(--text-primary)'
            }}
          >
            Something went wrong
          </h1>
          <p
            style={{
              fontSize: 14,
              color: 'var(--text-secondary)',
              margin: '0 0 24px 0',
              maxWidth: 400,
              lineHeight: 1.5
            }}
          >
            The application encountered an unexpected error. You can reload the window to try again.
          </p>
          {this.state.error && (
            <pre
              style={{
                fontSize: 12,
                color: 'var(--text-tertiary)',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '12px 16px',
                maxWidth: 500,
                maxHeight: 120,
                overflow: 'auto',
                marginBottom: 24,
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word'
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={this.handleCopyDebugInfo}
              style={{
                backgroundColor: 'var(--bg-surface)',
                color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseOver={(e) => {
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'var(--bg-hover)'
                ;(e.target as HTMLButtonElement).style.color = 'var(--text-primary)'
              }}
              onMouseOut={(e) => {
                ;(e.target as HTMLButtonElement).style.backgroundColor = 'var(--bg-surface)'
                ;(e.target as HTMLButtonElement).style.color = 'var(--text-secondary)'
              }}
            >
              {this.state.copied ? 'Copied!' : 'Copy Debug Info'}
            </button>
            <button
              onClick={this.handleReload}
              style={{
                backgroundColor: 'var(--accent)',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: 8,
                padding: '10px 24px',
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease'
              }}
              onMouseOver={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent-hover)')
              }
              onMouseOut={(e) =>
                ((e.target as HTMLButtonElement).style.backgroundColor = 'var(--accent)')
              }
            >
              Reload Window
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
