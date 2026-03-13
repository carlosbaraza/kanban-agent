import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as path from 'path'
import { taskIdToUuid, resolveClaudeSessionCommand } from './claude-session'

const mockExistsSync = vi.fn()
const mockCopyFileSync = vi.fn()
const mockMkdirSync = vi.fn()
const mockHomedir = vi.fn().mockReturnValue('/Users/testuser')

vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal<typeof import('fs')>()
  return {
    ...actual,
    existsSync: (...args: Parameters<typeof actual.existsSync>) => mockExistsSync(...args),
    copyFileSync: (...args: Parameters<typeof actual.copyFileSync>) => mockCopyFileSync(...args),
    mkdirSync: (...args: Parameters<typeof actual.mkdirSync>) => mockMkdirSync(...args)
  }
})

vi.mock('os', async (importOriginal) => {
  const actual = await importOriginal<typeof import('os')>()
  return { ...actual, homedir: () => mockHomedir() }
})

describe('taskIdToUuid', () => {
  it('returns a valid UUID v5 format', () => {
    const uuid = taskIdToUuid('tsk_abc123')
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-5[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/)
  })

  it('is deterministic — same input produces same output', () => {
    expect(taskIdToUuid('tsk_abc123')).toBe(taskIdToUuid('tsk_abc123'))
  })

  it('produces different UUIDs for different task IDs', () => {
    expect(taskIdToUuid('tsk_abc123')).not.toBe(taskIdToUuid('tsk_def456'))
  })
})

describe('resolveClaudeSessionCommand', () => {
  beforeEach(() => {
    mockHomedir.mockReturnValue('/Users/testuser')
    mockExistsSync.mockReset()
    mockCopyFileSync.mockReset()
    mockMkdirSync.mockReset()
  })

  it('returns command unchanged if no --resume $VAR pattern', () => {
    const cmd = 'claude --dangerously-skip-permissions'
    expect(resolveClaudeSessionCommand(cmd, 'tsk_abc', '/project')).toBe(cmd)
  })

  it('returns command unchanged for --resume with a literal value (no $)', () => {
    const cmd = 'claude --resume some-uuid'
    expect(resolveClaudeSessionCommand(cmd, 'tsk_abc', '/project')).toBe(cmd)
  })

  it('replaces --resume $VAR with --session-id when no existing session', () => {
    mockExistsSync.mockReturnValue(false)

    const result = resolveClaudeSessionCommand(
      'claude --dangerously-skip-permissions --resume $FAMILIAR_TASK_ID',
      'tsk_abc',
      '/project'
    )

    const uuid = taskIdToUuid('tsk_abc')
    expect(result).toBe(`claude --dangerously-skip-permissions --session-id "${uuid}"`)
  })

  it('replaces --resume $VAR with --resume <uuid> when session exists', () => {
    mockExistsSync.mockReturnValue(true)

    const result = resolveClaudeSessionCommand(
      'claude --dangerously-skip-permissions --resume $FAMILIAR_TASK_ID',
      'tsk_abc',
      '/project'
    )

    const uuid = taskIdToUuid('tsk_abc')
    expect(result).toBe(`claude --dangerously-skip-permissions --resume "${uuid}"`)
  })

  it('checks the correct session file path', () => {
    mockExistsSync.mockReturnValue(false)

    resolveClaudeSessionCommand(
      'claude --resume $FAMILIAR_TASK_ID',
      'tsk_abc',
      '/Users/testuser/dev/my-project'
    )

    const uuid = taskIdToUuid('tsk_abc')
    const expectedPath = path.join(
      '/Users/testuser',
      '.claude',
      'projects',
      '-Users-testuser-dev-my-project',
      `${uuid}.jsonl`
    )
    expect(mockExistsSync).toHaveBeenCalledWith(expectedPath)
  })

  it('handles --resume with quoted $VAR', () => {
    mockExistsSync.mockReturnValue(false)

    const result = resolveClaudeSessionCommand(
      'claude --resume "$FAMILIAR_TASK_ID"',
      'tsk_abc',
      '/project'
    )

    const uuid = taskIdToUuid('tsk_abc')
    expect(result).toBe(`claude --session-id "${uuid}"`)
  })

  it('handles --resume with single-quoted $VAR', () => {
    mockExistsSync.mockReturnValue(false)

    const result = resolveClaudeSessionCommand(
      "claude --resume '$FAMILIAR_TASK_ID'",
      'tsk_abc',
      '/project'
    )

    const uuid = taskIdToUuid('tsk_abc')
    expect(result).toBe(`claude --session-id "${uuid}"`)
  })

  describe('forking', () => {
    it('copies parent session file when forking and parent session exists', () => {
      const childUuid = taskIdToUuid('tsk_child')
      const parentUuid = taskIdToUuid('tsk_parent')
      const projectDir = path.join('/Users/testuser', '.claude', 'projects', '-project')
      const childSessionFile = path.join(projectDir, `${childUuid}.jsonl`)
      const parentSessionFile = path.join(projectDir, `${parentUuid}.jsonl`)

      // Child session doesn't exist, parent session does
      mockExistsSync.mockImplementation((p: string) => {
        if (p === childSessionFile) return false
        if (p === parentSessionFile) return true
        return false
      })

      const result = resolveClaudeSessionCommand(
        'claude --resume $FAMILIAR_TASK_ID',
        'tsk_child',
        '/project',
        'tsk_parent'
      )

      expect(mockCopyFileSync).toHaveBeenCalledWith(parentSessionFile, childSessionFile)
      expect(result).toBe(`claude --resume "${childUuid}"`)
    })

    it('falls back to fresh session when parent session file does not exist', () => {
      const childUuid = taskIdToUuid('tsk_child')

      mockExistsSync.mockReturnValue(false)

      const result = resolveClaudeSessionCommand(
        'claude --resume $FAMILIAR_TASK_ID',
        'tsk_child',
        '/project',
        'tsk_parent'
      )

      expect(mockCopyFileSync).not.toHaveBeenCalled()
      expect(result).toBe(`claude --session-id "${childUuid}"`)
    })

    it('uses existing child session when it already exists (subsequent launches)', () => {
      const childUuid = taskIdToUuid('tsk_child')
      const childSessionFile = path.join(
        '/Users/testuser', '.claude', 'projects', '-project', `${childUuid}.jsonl`
      )

      // Child session already exists
      mockExistsSync.mockImplementation((p: string) => p === childSessionFile)

      const result = resolveClaudeSessionCommand(
        'claude --resume $FAMILIAR_TASK_ID',
        'tsk_child',
        '/project',
        'tsk_parent'
      )

      // Should NOT copy — just resume the existing child session
      expect(mockCopyFileSync).not.toHaveBeenCalled()
      expect(result).toBe(`claude --resume "${childUuid}"`)
    })

    it('handles copy failure gracefully and falls back to fresh session', () => {
      const childUuid = taskIdToUuid('tsk_child')
      const parentUuid = taskIdToUuid('tsk_parent')
      const projectDir = path.join('/Users/testuser', '.claude', 'projects', '-project')
      const childSessionFile = path.join(projectDir, `${childUuid}.jsonl`)
      const parentSessionFile = path.join(projectDir, `${parentUuid}.jsonl`)

      mockExistsSync.mockImplementation((p: string) => {
        if (p === childSessionFile) return false
        if (p === parentSessionFile) return true
        return false
      })
      mockCopyFileSync.mockImplementation(() => {
        throw new Error('EACCES: permission denied')
      })

      const result = resolveClaudeSessionCommand(
        'claude --resume $FAMILIAR_TASK_ID',
        'tsk_child',
        '/project',
        'tsk_parent'
      )

      expect(result).toBe(`claude --session-id "${childUuid}"`)
    })

    it('ignores forkedFrom when command has no --resume $VAR pattern', () => {
      const cmd = 'claude --dangerously-skip-permissions'
      const result = resolveClaudeSessionCommand(cmd, 'tsk_child', '/project', 'tsk_parent')
      expect(result).toBe(cmd)
      expect(mockCopyFileSync).not.toHaveBeenCalled()
    })
  })
})
