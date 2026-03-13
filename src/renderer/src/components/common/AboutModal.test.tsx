import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { AboutModal } from './AboutModal'
import { useUIStore } from '@renderer/stores/ui-store'

const mockGetVersion = vi.fn().mockResolvedValue('0.8.1')
const mockOpenExternal = vi.fn().mockResolvedValue(undefined)

;(window as any).api = {
  ...(window as any).api,
  getVersion: mockGetVersion,
  openExternal: mockOpenExternal
}

describe('AboutModal', () => {
  beforeEach(() => {
    useUIStore.setState({ aboutModalOpen: false })
    vi.clearAllMocks()
    mockGetVersion.mockResolvedValue('0.8.1')
  })

  it('renders nothing when closed', () => {
    const { container } = render(<AboutModal />)
    expect(container.firstChild).toBeNull()
  })

  it('renders modal content when open', async () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    expect(screen.getByText('About')).toBeInTheDocument()
    expect(screen.getByText('Familiar')).toBeInTheDocument()
    expect(await screen.findByText('Version 0.8.1')).toBeInTheDocument()
  })

  it('shows app description', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    expect(screen.getByText(/kanban board with embedded terminals/)).toBeInTheDocument()
  })

  it('shows platform and license info', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    expect(screen.getByText('Platform')).toBeInTheDocument()
    expect(screen.getByText('macOS (Electron)')).toBeInTheDocument()
    expect(screen.getByText('License')).toBeInTheDocument()
    expect(screen.getByText('MIT')).toBeInTheDocument()
  })

  it('closes when clicking overlay', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    const overlay = screen.getByTestId('about-overlay')
    fireEvent.click(overlay)

    expect(useUIStore.getState().aboutModalOpen).toBe(false)
  })

  it('closes when pressing Escape', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    fireEvent.keyDown(window, { key: 'Escape' })

    expect(useUIStore.getState().aboutModalOpen).toBe(false)
  })

  it('closes when clicking close button', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    const svgIcon = screen.getByTestId('about-overlay').querySelector('svg')!
    const closeButton = svgIcon.closest('button')!
    fireEvent.click(closeButton)

    expect(useUIStore.getState().aboutModalOpen).toBe(false)
  })

  it('has a GitHub link button', () => {
    useUIStore.setState({ aboutModalOpen: true })
    render(<AboutModal />)

    expect(screen.getByText('GitHub Repository')).toBeInTheDocument()
  })
})
