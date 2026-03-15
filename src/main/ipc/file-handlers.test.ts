import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { ipcMain } from 'electron'
import { registerFileHandlers } from './file-handlers'
import fs from 'fs'
import { cp, rm } from 'fs/promises'
import type { ProjectState, Task } from '../../shared/types'

vi.mock('electron', () => ({
  ipcMain: { handle: vi.fn() },
  app: { getPath: vi.fn().mockReturnValue('/tmp') }
}))

vi.mock('fs', () => ({
  default: {
    readFileSync: vi.fn(),
    writeFileSync: vi.fn(),
    existsSync: vi.fn().mockReturnValue(true),
    mkdirSync: vi.fn()
  },
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
  existsSync: vi.fn().mockReturnValue(true),
  mkdirSync: vi.fn()
}))

vi.mock('fs/promises', () => {
  const mod = {
    writeFile: vi.fn(),
    cp: vi.fn().mockResolvedValue(undefined),
    rm: vi.fn().mockResolvedValue(undefined)
  }
  return { ...mod, default: mod }
})

vi.mock('../../shared/utils/id-generator', () => ({
  generateTaskId: vi.fn().mockReturnValue('tsk_new123')
}))

describe('file-handlers task:move-to-worktree', () => {
  let handlers: Record<string, Function>

  const mockDataService = {
    getProjectRoot: vi.fn().mockReturnValue('/projects/source'),
    readProjectState: vi.fn(),
    writeProjectState: vi.fn(),
    createTask: vi.fn(),
    readTask: vi.fn(),
    updateTask: vi.fn(),
    deleteTask: vi.fn(),
    readTaskDocument: vi.fn(),
    writeTaskDocument: vi.fn(),
    readTaskActivity: vi.fn(),
    appendActivity: vi.fn(),
    saveAttachment: vi.fn(),
    copyTempToAttachment: vi.fn(),
    listTaskFiles: vi.fn(),
    savePastedFile: vi.fn(),
    readPastedFile: vi.fn(),
    deletePastedFile: vi.fn(),
    readSettings: vi.fn(),
    writeSettings: vi.fn(),
    initProject: vi.fn(),
    isInitialized: vi.fn()
  } as any

  const mockFileWatcher = null

  const makeTask = (overrides: Partial<Task> = {}): Task => ({
    id: 'tsk_abc123',
    title: 'Test task',
    status: 'todo',
    priority: 'medium',
    labels: [],
    agentStatus: 'idle',
    createdAt: '2026-01-01T00:00:00Z',
    updatedAt: '2026-01-01T00:00:00Z',
    sortOrder: 0,
    ...overrides
  })

  const makeState = (tasks: Task[]): ProjectState => ({
    projectName: 'test',
    tasks,
    columnOrder: ['todo', 'in-progress', 'in-review', 'done', 'archived'],
    labels: []
  })

  beforeEach(() => {
    vi.clearAllMocks()
    handlers = {}
    ;(ipcMain.handle as any).mockImplementation((channel: string, handler: Function) => {
      handlers[channel] = handler
    })
    registerFileHandlers(mockDataService, () => mockFileWatcher)
  })

  it('registers the task:move-to-worktree handler', () => {
    expect(handlers['task:move-to-worktree']).toBeDefined()
  })

  it('copies a task to target worktree with new ID', async () => {
    const task = makeTask({ id: 'tsk_original' })
    const sourceState = makeState([task])
    const targetState = makeState([])

    ;(fs.readFileSync as any)
      .mockReturnValueOnce(JSON.stringify(sourceState))
      .mockReturnValueOnce(JSON.stringify(targetState))

    const result = await handlers['task:move-to-worktree'](
      {},
      ['tsk_original'],
      '/projects/target',
      'copy'
    )

    expect(result).toEqual({ movedCount: 1 })

    // Should copy the task directory
    expect(cp).toHaveBeenCalledWith(
      '/projects/source/.familiar/tasks/tsk_original',
      '/projects/target/.familiar/tasks/tsk_new123',
      { recursive: true }
    )

    // Should write task.json with new ID
    const writeCalls = (fs.writeFileSync as any).mock.calls
    const taskJsonWrite = writeCalls.find((c: any[]) => c[0].includes('tsk_new123/task.json'))
    expect(taskJsonWrite).toBeTruthy()
    const writtenTask = JSON.parse(taskJsonWrite[1])
    expect(writtenTask.id).toBe('tsk_new123')
    expect(writtenTask.agentStatus).toBe('idle')

    // Source state should NOT be written (copy mode)
    const stateWrites = writeCalls.filter((c: any[]) => c[0].endsWith('state.json'))
    expect(stateWrites).toHaveLength(1) // Only target state
  })

  it('moves a task to target worktree, removing from source', async () => {
    const task = makeTask({ id: 'tsk_move_me' })
    const sourceState = makeState([task])
    const targetState = makeState([])

    ;(fs.readFileSync as any)
      .mockReturnValueOnce(JSON.stringify(sourceState))
      .mockReturnValueOnce(JSON.stringify(targetState))

    const result = await handlers['task:move-to-worktree'](
      {},
      ['tsk_move_me'],
      '/projects/target',
      'move'
    )

    expect(result).toEqual({ movedCount: 1 })

    // Should copy task directory
    expect(cp).toHaveBeenCalledWith(
      '/projects/source/.familiar/tasks/tsk_move_me',
      '/projects/target/.familiar/tasks/tsk_move_me',
      { recursive: true }
    )

    // Should remove source task directory
    expect(rm).toHaveBeenCalledWith(
      '/projects/source/.familiar/tasks/tsk_move_me',
      { recursive: true, force: true }
    )

    // Source state should be written without the moved task
    const writeCalls = (fs.writeFileSync as any).mock.calls
    const sourceStateWrite = writeCalls.find((c: any[]) =>
      c[0] === '/projects/source/.familiar/state.json'
    )
    expect(sourceStateWrite).toBeTruthy()
    const sourceStateWritten: ProjectState = JSON.parse(sourceStateWrite[1])
    expect(sourceStateWritten.tasks).toHaveLength(0)

    // Target state should have the task
    const targetStateWrite = writeCalls.find((c: any[]) =>
      c[0] === '/projects/target/.familiar/state.json'
    )
    expect(targetStateWrite).toBeTruthy()
    const targetStateWritten: ProjectState = JSON.parse(targetStateWrite[1])
    expect(targetStateWritten.tasks).toHaveLength(1)
    expect(targetStateWritten.tasks[0].id).toBe('tsk_move_me')
  })

  it('handles multiple tasks', async () => {
    const task1 = makeTask({ id: 'tsk_1' })
    const task2 = makeTask({ id: 'tsk_2' })
    const sourceState = makeState([task1, task2])
    const targetState = makeState([])

    ;(fs.readFileSync as any)
      .mockReturnValueOnce(JSON.stringify(sourceState))
      .mockReturnValueOnce(JSON.stringify(targetState))

    const result = await handlers['task:move-to-worktree'](
      {},
      ['tsk_1', 'tsk_2'],
      '/projects/target',
      'move'
    )

    expect(result).toEqual({ movedCount: 2 })
    expect(cp).toHaveBeenCalledTimes(2)
    expect(rm).toHaveBeenCalledTimes(2)
  })

  it('skips tasks that do not exist in source state', async () => {
    const task = makeTask({ id: 'tsk_existing' })
    const sourceState = makeState([task])
    const targetState = makeState([])

    ;(fs.readFileSync as any)
      .mockReturnValueOnce(JSON.stringify(sourceState))
      .mockReturnValueOnce(JSON.stringify(targetState))

    const result = await handlers['task:move-to-worktree'](
      {},
      ['tsk_nonexistent'],
      '/projects/target',
      'move'
    )

    expect(result).toEqual({ movedCount: 0 })
    expect(cp).not.toHaveBeenCalled()
  })
})
