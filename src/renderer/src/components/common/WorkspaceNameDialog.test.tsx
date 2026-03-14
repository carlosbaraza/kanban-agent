import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { WorkspaceNameDialog } from './WorkspaceNameDialog'
import { useWorkspaceStore } from '@renderer/stores/workspace-store'

beforeEach(() => {
  vi.clearAllMocks()
  useWorkspaceStore.setState({
    showWorkspaceNamePrompt: false,
    workspaceNamePromptResolve: null,
    openProjects: [{ path: '/tmp/my-project', name: 'my-project' }]
  })
})

describe('WorkspaceNameDialog', () => {
  it('renders nothing when not shown', () => {
    const { container } = render(<WorkspaceNameDialog />)
    expect(container.firstChild).toBeNull()
  })

  it('renders dialog when showWorkspaceNamePrompt is true', () => {
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: vi.fn()
    })

    render(<WorkspaceNameDialog />)
    expect(screen.getByText('Create Workspace')).toBeTruthy()
    expect(screen.getByPlaceholderText('My Workspace')).toBeTruthy()
  })

  it('defaults input to current project name', () => {
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: vi.fn()
    })

    render(<WorkspaceNameDialog />)
    const input = screen.getByPlaceholderText('My Workspace') as HTMLInputElement
    expect(input.value).toBe('my-project')
  })

  it('calls resolveWorkspaceNamePrompt with name on confirm', () => {
    const resolveFn = vi.fn()
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: resolveFn
    })

    render(<WorkspaceNameDialog />)
    const input = screen.getByPlaceholderText('My Workspace') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'Test Workspace' } })
    fireEvent.click(screen.getByText('Continue'))

    expect(resolveFn).toHaveBeenCalledWith('Test Workspace')
  })

  it('calls resolveWorkspaceNamePrompt with null on cancel', () => {
    const resolveFn = vi.fn()
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: resolveFn
    })

    render(<WorkspaceNameDialog />)
    fireEvent.click(screen.getByText('Cancel'))

    expect(resolveFn).toHaveBeenCalledWith(null)
  })

  it('confirms on Enter key', () => {
    const resolveFn = vi.fn()
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: resolveFn
    })

    render(<WorkspaceNameDialog />)
    const input = screen.getByPlaceholderText('My Workspace') as HTMLInputElement
    fireEvent.change(input, { target: { value: 'My WS' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(resolveFn).toHaveBeenCalledWith('My WS')
  })

  it('cancels on Escape key', () => {
    const resolveFn = vi.fn()
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: resolveFn
    })

    render(<WorkspaceNameDialog />)
    const input = screen.getByPlaceholderText('My Workspace') as HTMLInputElement
    fireEvent.keyDown(input, { key: 'Escape' })

    expect(resolveFn).toHaveBeenCalledWith(null)
  })

  it('shows explanatory text about workspaces', () => {
    useWorkspaceStore.setState({
      showWorkspaceNamePrompt: true,
      workspaceNamePromptResolve: vi.fn()
    })

    render(<WorkspaceNameDialog />)
    expect(screen.getAllByText(/workspace/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/Settings/)).toBeTruthy()
  })
})
