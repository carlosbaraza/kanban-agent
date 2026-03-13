import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerWorkspaceHandlers } from './workspace-handlers'
import type { WorkspaceManager } from '../services/workspace-manager'

// Mock ipcMain
vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  }
}))

describe('workspace-handlers', () => {
  let mockManager: Partial<WorkspaceManager>
  let handlers: Map<string, (...args: any[]) => any>

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = new Map()

    // Capture registered handlers
    vi.mocked(ipcMain.handle).mockImplementation((channel: string, handler: any) => {
      handlers.set(channel, handler)
      return undefined as any
    })

    mockManager = {
      listWorkspaces: vi.fn().mockReturnValue([]),
      createWorkspace: vi.fn().mockReturnValue({ id: 'ws_1', name: 'Test', projectPaths: ['/tmp/a'], lastOpenedAt: '', createdAt: '' }),
      updateWorkspace: vi.fn().mockReturnValue({ id: 'ws_1', name: 'Updated', projectPaths: ['/tmp/a'], lastOpenedAt: '', createdAt: '' }),
      deleteWorkspace: vi.fn(),
      openWorkspace: vi.fn(),
      openSingleProject: vi.fn(),
      addProjectToWorkspace: vi.fn(),
      removeProjectFromWorkspace: vi.fn(),
      loadWorkspaceConfig: vi.fn().mockReturnValue({ workspaces: [], lastWorkspaceId: null }),
      getOpenProjectPaths: vi.fn().mockReturnValue([]),
      getActiveProjectPath: vi.fn().mockReturnValue(null),
      setActiveProjectPath: vi.fn()
    }

    registerWorkspaceHandlers(mockManager as WorkspaceManager)
  })

  it('registers all workspace IPC channels', () => {
    const expectedChannels = [
      'workspace:list',
      'workspace:create',
      'workspace:update',
      'workspace:delete',
      'workspace:open',
      'workspace:open-single',
      'workspace:add-project',
      'workspace:remove-project',
      'workspace:get-config',
      'workspace:get-open-projects',
      'workspace:get-active-project',
      'workspace:set-active-project'
    ]

    for (const channel of expectedChannels) {
      expect(handlers.has(channel), `Missing handler for ${channel}`).toBe(true)
    }
  })

  it('workspace:list calls listWorkspaces', async () => {
    const handler = handlers.get('workspace:list')!
    await handler({})
    expect(mockManager.listWorkspaces).toHaveBeenCalled()
  })

  it('workspace:create passes name and paths', async () => {
    const handler = handlers.get('workspace:create')!
    await handler({}, 'MyWorkspace', ['/tmp/a', '/tmp/b'])
    expect(mockManager.createWorkspace).toHaveBeenCalledWith('MyWorkspace', ['/tmp/a', '/tmp/b'])
  })

  it('workspace:update passes id and updates', async () => {
    const handler = handlers.get('workspace:update')!
    await handler({}, 'ws_1', { name: 'Updated' })
    expect(mockManager.updateWorkspace).toHaveBeenCalledWith('ws_1', { name: 'Updated' })
  })

  it('workspace:delete passes id', async () => {
    const handler = handlers.get('workspace:delete')!
    await handler({}, 'ws_1')
    expect(mockManager.deleteWorkspace).toHaveBeenCalledWith('ws_1')
  })

  it('workspace:open passes workspaceId', async () => {
    const handler = handlers.get('workspace:open')!
    await handler({}, 'ws_1')
    expect(mockManager.openWorkspace).toHaveBeenCalledWith('ws_1')
  })

  it('workspace:open-single passes path', async () => {
    const handler = handlers.get('workspace:open-single')!
    await handler({}, '/tmp/project')
    expect(mockManager.openSingleProject).toHaveBeenCalledWith('/tmp/project')
  })

  it('workspace:add-project passes path', async () => {
    const handler = handlers.get('workspace:add-project')!
    await handler({}, '/tmp/new-project')
    expect(mockManager.addProjectToWorkspace).toHaveBeenCalledWith('/tmp/new-project')
  })

  it('workspace:remove-project passes path', async () => {
    const handler = handlers.get('workspace:remove-project')!
    await handler({}, '/tmp/old-project')
    expect(mockManager.removeProjectFromWorkspace).toHaveBeenCalledWith('/tmp/old-project')
  })

  it('workspace:set-active-project passes path', async () => {
    const handler = handlers.get('workspace:set-active-project')!
    await handler({}, '/tmp/target')
    expect(mockManager.setActiveProjectPath).toHaveBeenCalledWith('/tmp/target')
  })
})
