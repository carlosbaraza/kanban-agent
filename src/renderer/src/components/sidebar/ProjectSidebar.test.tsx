import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ProjectSidebar } from './ProjectSidebar'
import { useWorkspaceStore } from '@renderer/stores/workspace-store'
import { useTaskStore } from '@renderer/stores/task-store'
import type { ProjectState } from '@shared/types'

// Mock window.api
vi.stubGlobal('window', {
  api: {
    setProjectRoot: vi.fn().mockResolvedValue(true),
    readProjectState: vi.fn().mockResolvedValue(null),
    isInitialized: vi.fn().mockResolvedValue(true),
    openDirectory: vi.fn().mockResolvedValue(null),
    workspaceAddProject: vi.fn().mockResolvedValue(undefined),
    workspaceRemoveProject: vi.fn().mockResolvedValue(undefined),
    workspaceSetActiveProject: vi.fn().mockResolvedValue(undefined),
    workspaceGetOpenProjects: vi.fn().mockResolvedValue([]),
    workspaceGetActiveProject: vi.fn().mockResolvedValue(null),
    workspaceGetConfig: vi.fn().mockResolvedValue({ workspaces: [], lastWorkspaceId: null })
  }
})

beforeEach(() => {
  vi.clearAllMocks()
})

const mockProjectState: ProjectState = {
  version: 1,
  projectName: 'Test',
  tasks: [
    {
      id: 'tsk_1',
      title: 'Task 1',
      status: 'todo',
      priority: 'none',
      labels: [],
      agentStatus: 'idle',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sortOrder: 0
    }
  ],
  columnOrder: ['todo', 'in-progress', 'in-review', 'done', 'archived'],
  labels: []
}

describe('ProjectSidebar', () => {
  it('returns null when sidebarVisible is false', () => {
    useWorkspaceStore.setState({
      sidebarVisible: false,
      openProjects: [],
      activeProjectPath: null,
      sidebarExpanded: false
    })

    const { container } = render(<ProjectSidebar />)
    expect(container.innerHTML).toBe('')
  })

  it('renders sidebar when visible with project icons', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: false
    })

    render(<ProjectSidebar />)
    expect(screen.getByTestId('project-sidebar')).toBeTruthy()
  })

  it('shows project names when expanded', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: true
    })

    render(<ProjectSidebar />)
    expect(screen.getByText('alpha')).toBeTruthy()
    expect(screen.getByText('beta')).toBeTruthy()
  })

  it('highlights the active project', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: false
    })

    render(<ProjectSidebar />)
    const activeItem = screen.getByTestId('project-item-alpha')
    expect(activeItem.className).toContain('Active')
  })

  it('shows task count for active project when expanded', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: true
    })
    useTaskStore.setState({
      projectState: mockProjectState
    })

    render(<ProjectSidebar />)
    expect(screen.getByText('1 tasks')).toBeTruthy()
  })

  it('renders add project button', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: false
    })

    render(<ProjectSidebar />)
    expect(screen.getByTestId('add-project-button')).toBeTruthy()
  })

  it('renders toggle button', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: false
    })

    render(<ProjectSidebar />)
    expect(screen.getByTestId('sidebar-toggle')).toBeTruthy()
  })

  it('collapsed sidebar has collapsed class', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: false
    })

    render(<ProjectSidebar />)
    const sidebar = screen.getByTestId('project-sidebar')
    expect(sidebar.className).toContain('Collapsed')
  })

  it('expanded sidebar has expanded class', () => {
    useWorkspaceStore.setState({
      sidebarVisible: true,
      openProjects: [
        { path: '/tmp/alpha', name: 'alpha' },
        { path: '/tmp/beta', name: 'beta' }
      ],
      activeProjectPath: '/tmp/alpha',
      sidebarExpanded: true
    })

    render(<ProjectSidebar />)
    const sidebar = screen.getByTestId('project-sidebar')
    expect(sidebar.className).toContain('Expanded')
  })
})
