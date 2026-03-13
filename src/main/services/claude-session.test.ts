import { describe, it, expect, vi, beforeEach } from 'vitest'
import * as path from 'path'
import { taskIdToUuid, resolveClaudeSessionCommand, ensureForkSessionCopied } from './claude-session'

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
})

describe('ensureForkSessionCopied', () => {
  beforeEach(() => {
    mockHomedir.mockReturnValue('/Users/testuser')
    mockExistsSync.mockReset()
    mockCopyFileSync.mockReset()
    mockMkdirSync.mockReset()
  })

  it('copies parent session file to child path when parent exists and child does not', () => {
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

    const result = ensureForkSessionCopied('tsk_child', 'tsk_parent', '/project')

    expect(result).toBe(true)
    expect(mockCopyFileSync).toHaveBeenCalledWith(parentSessionFile, childSessionFile)
  })

  it('skips copy when child session already exists', () => {
    const childUuid = taskIdToUuid('tsk_child')
    const childSessionFile = path.join(
      '/Users/testuser', '.claude', 'projects', '-project', `${childUuid}.jsonl`
    )

    mockExistsSync.mockImplementation((p: string) => p === childSessionFile)

    const result = ensureForkSessionCopied('tsk_child', 'tsk_parent', '/project')

    expect(result).toBe(false)
    expect(mockCopyFileSync).not.toHaveBeenCalled()
  })

  it('returns false when parent session does not exist', () => {
    mockExistsSync.mockReturnValue(false)

    const result = ensureForkSessionCopied('tsk_child', 'tsk_parent', '/project')

    expect(result).toBe(false)
    expect(mockCopyFileSync).not.toHaveBeenCalled()
  })

  it('handles copy failure gracefully', () => {
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

    const result = ensureForkSessionCopied('tsk_child', 'tsk_parent', '/project')

    expect(result).toBe(false)
  })

  it('after copy, resolveClaudeSessionCommand uses --resume for the child', () => {
    const childUuid = taskIdToUuid('tsk_child')
    const projectDir = path.join('/Users/testuser', '.claude', 'projects', '-project')
    const childSessionFile = path.join(projectDir, `${childUuid}.jsonl`)
    const parentUuid = taskIdToUuid('tsk_parent')
    const parentSessionFile = path.join(projectDir, `${parentUuid}.jsonl`)

    // First call: ensureForkSessionCopied — child doesn't exist, parent does
    mockExistsSync.mockImplementation((p: string) => {
      if (p === childSessionFile) return false
      if (p === parentSessionFile) return true
      return false
    })

    ensureForkSessionCopied('tsk_child', 'tsk_parent', '/project')

    // After copy, child session now exists
    mockExistsSync.mockImplementation((p: string) => {
      if (p === childSessionFile) return true
      return false
    })

    const result = resolveClaudeSessionCommand(
      'claude --resume $FAMILIAR_TASK_ID',
      'tsk_child',
      '/project'
    )

    expect(result).toBe(`claude --resume "${childUuid}"`)
  })
})
