import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerWorktreeHandlers } from './worktree-handlers'
import { WorktreeService } from '../services/worktree-service'

vi.mock('electron', () => ({
  ipcMain: {
    handle: vi.fn()
  }
}))

vi.mock('../services/worktree-service', () => ({
  WorktreeService: {
    listWorktrees: vi.fn(),
    createWorktree: vi.fn(),
    removeWorktree: vi.fn(),
    getGitRoot: vi.fn()
  }
}))

describe('worktree-handlers', () => {
  const mockDataService = {
    getProjectRoot: vi.fn().mockReturnValue('/test/project')
  } as any

  let handlers: Record<string, Function>

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}
    ;(ipcMain.handle as any).mockImplementation((channel: string, handler: Function) => {
      handlers[channel] = handler
    })
    registerWorktreeHandlers(mockDataService)
  })

  it('registers all worktree IPC handlers', () => {
    expect(handlers['worktree:list']).toBeDefined()
    expect(handlers['worktree:create']).toBeDefined()
    expect(handlers['worktree:remove']).toBeDefined()
    expect(handlers['worktree:get-git-root']).toBeDefined()
  })

  it('worktree:list calls WorktreeService.listWorktrees with project root', async () => {
    const mockWorktrees = [{ path: '/test', branch: 'main', slug: 'test', isMain: true }]
    ;(WorktreeService.listWorktrees as any).mockReturnValue(mockWorktrees)

    const result = await handlers['worktree:list']()
    expect(WorktreeService.listWorktrees).toHaveBeenCalledWith('/test/project')
    expect(result).toEqual(mockWorktrees)
  })

  it('worktree:create calls WorktreeService.createWorktree', async () => {
    const mockWt = { path: '/test/wt', branch: 'familiar-worktree/cool-fox', slug: 'cool-fox', isMain: false }
    ;(WorktreeService.createWorktree as any).mockReturnValue(mockWt)

    const result = await handlers['worktree:create']({}, 'cool-fox')
    expect(WorktreeService.createWorktree).toHaveBeenCalledWith('/test/project', 'cool-fox')
    expect(result).toEqual(mockWt)
  })

  it('worktree:create works without custom slug', async () => {
    const mockWt = { path: '/test/wt', branch: 'familiar-worktree/auto', slug: 'auto', isMain: false }
    ;(WorktreeService.createWorktree as any).mockReturnValue(mockWt)

    await handlers['worktree:create']({}, undefined)
    expect(WorktreeService.createWorktree).toHaveBeenCalledWith('/test/project', undefined)
  })

  it('worktree:remove calls WorktreeService.removeWorktree', async () => {
    await handlers['worktree:remove']({}, '/some/worktree/path')
    expect(WorktreeService.removeWorktree).toHaveBeenCalledWith('/test/project', '/some/worktree/path')
  })

  it('worktree:get-git-root calls WorktreeService.getGitRoot', async () => {
    ;(WorktreeService.getGitRoot as any).mockReturnValue('/test/project')

    const result = await handlers['worktree:get-git-root']()
    expect(WorktreeService.getGitRoot).toHaveBeenCalledWith('/test/project')
    expect(result).toBe('/test/project')
  })
})
