import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup, waitFor } from '@testing-library/react'
import { MoveToWorktreeDialog } from './MoveToWorktreeDialog'

// Mock workspace store
const mockOpenProjects = vi.fn()
const mockActiveProjectPath = vi.fn()

vi.mock('@renderer/stores/workspace-store', () => ({
  useWorkspaceStore: (selector: any) => {
    const state = {
      openProjects: mockOpenProjects(),
      activeProjectPath: mockActiveProjectPath()
    }
    return selector(state)
  }
}))

// Mock task store
vi.mock('@renderer/stores/task-store', () => ({
  useTaskStore: {
    getState: () => ({
      loadProjectState: vi.fn()
    })
  }
}))

// Mock window.api
const mockTaskMoveToWorktree = vi.fn().mockResolvedValue({ movedCount: 1 })

Object.defineProperty(window, 'api', {
  value: {
    taskMoveToWorktree: mockTaskMoveToWorktree
  },
  writable: true
})

describe('MoveToWorktreeDialog', () => {
  const onClose = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockActiveProjectPath.mockReturnValue('/projects/main')
  })

  afterEach(cleanup)

  it('renders dialog with move/copy toggle', () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/feature-a', slug: 'feature-a', branch: 'familiar-worktree/feature-a', isMain: false }
        ]
      }
    ])

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    expect(screen.getByText('Move Task to Worktree')).toBeTruthy()
    expect(screen.getByText('Move')).toBeTruthy()
    expect(screen.getByText('Copy')).toBeTruthy()
    expect(screen.getByText('feature-a')).toBeTruthy()
  })

  it('shows empty state when no worktrees available', () => {
    mockOpenProjects.mockReturnValue([
      { path: '/projects/main', name: 'main', worktrees: [] }
    ])

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    expect(screen.getByText(/No other worktrees available/)).toBeTruthy()
  })

  it('calls onClose when Cancel is clicked', () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'familiar-worktree/wt1', isMain: false }
        ]
      }
    ])

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    fireEvent.click(screen.getByText('Cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('calls taskMoveToWorktree with correct args on confirm', async () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'familiar-worktree/wt1', isMain: false }
        ]
      }
    ])

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    // Click the confirm button (first target is auto-selected)
    fireEvent.click(screen.getByText('Move Task'))

    await waitFor(() => {
      expect(mockTaskMoveToWorktree).toHaveBeenCalledWith(
        ['tsk_123'],
        '/projects/main/.familiar/worktrees/wt1',
        'move'
      )
    })
  })

  it('switches to copy mode when Copy button is clicked', async () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'familiar-worktree/wt1', isMain: false }
        ]
      }
    ])

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    // Click Copy toggle
    fireEvent.click(screen.getByText('Copy'))

    expect(screen.getByText('Copy Task to Worktree')).toBeTruthy()
    expect(screen.getByText(/A copy of the task will be created/)).toBeTruthy()

    // Confirm
    fireEvent.click(screen.getByText('Copy Task'))

    await waitFor(() => {
      expect(mockTaskMoveToWorktree).toHaveBeenCalledWith(
        ['tsk_123'],
        '/projects/main/.familiar/worktrees/wt1',
        'copy'
      )
    })
  })

  it('shows correct label for multiple tasks', () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'familiar-worktree/wt1', isMain: false }
        ]
      }
    ])

    render(
      <MoveToWorktreeDialog taskIds={['tsk_1', 'tsk_2', 'tsk_3']} onClose={onClose} />
    )

    expect(screen.getByText('Move 3 Tasks to Worktree')).toBeTruthy()
    expect(screen.getByText('Move 3 Tasks')).toBeTruthy()
  })

  it('excludes current project from target list', () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'b1', isMain: false },
          { path: '/projects/main/.familiar/worktrees/wt2', slug: 'wt2', branch: 'b2', isMain: false }
        ]
      }
    ])
    mockActiveProjectPath.mockReturnValue('/projects/main/.familiar/worktrees/wt1')

    render(<MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />)

    // wt1 should not be in the list (it's the current project)
    // main and wt2 should be listed
    expect(screen.getByText('main')).toBeTruthy()
    expect(screen.getByText('wt2')).toBeTruthy()
    expect(screen.queryByText('wt1')).toBeNull()
  })

  it('closes on Escape key', () => {
    mockOpenProjects.mockReturnValue([
      {
        path: '/projects/main',
        name: 'main',
        worktrees: [
          { path: '/projects/main/.familiar/worktrees/wt1', slug: 'wt1', branch: 'b1', isMain: false }
        ]
      }
    ])

    const { container } = render(
      <MoveToWorktreeDialog taskIds={['tsk_123']} onClose={onClose} />
    )

    fireEvent.keyDown(container.firstChild!, { key: 'Escape' })
    expect(onClose).toHaveBeenCalled()
  })
})
