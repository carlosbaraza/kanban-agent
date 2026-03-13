# Fork Sessions — Design Spec

## Problem

When working on a task with Claude Code, users sometimes want to branch off into a parallel line of work while preserving the full conversation context. Currently, creating a new task starts a fresh Claude Code session with no prior context, forcing the user to re-explain everything.

## Solution

Add a "Fork" action to tasks that creates a new task and launches Claude Code with `--resume <parent-session-uuid>`, giving the forked task the parent's full conversation history on first launch.

## Data Model

Add two optional fields to the `Task` interface in `src/shared/types/task.ts`:

```typescript
interface Task {
  // ... existing fields
  forkedFrom?: string    // parent task ID (e.g., "tsk_abc123")
  forks?: string[]       // child task IDs (e.g., ["tsk_def456", "tsk_ghi789"])
}
```

Both fields are persisted in `task.json`. This enables bidirectional traversal of the fork tree — agents can navigate parent and child tasks programmatically.

Fork chains are supported: any task can be forked (A → B → C). `forkedFrom` always points to the immediate parent.

## Session Resolution

Modify `resolveClaudeSessionCommand()` in `src/main/services/claude-session.ts`:

When resolving the command for a task:
1. Check if the task has a `forkedFrom` field
2. Check if a session file already exists for the current task's UUID
3. If `forkedFrom` is set AND no session file exists for this task's UUID yet:
   - Compute the parent's UUID via `taskIdToUuid(forkedFrom)`
   - Use `--resume "<parent-uuid>"` instead of `--session-id "<new-uuid>"`
4. Otherwise, use the existing logic (resume own session if it exists, or start fresh)

This means the forked task's first Claude Code launch resumes the parent's conversation. After that, Claude Code continues under the parent's UUID — subsequent `--resume` calls will find the session file and resume normally.

For fork chains: forking C from B uses `--resume <B's-uuid>`. B's session already includes context from A, so C inherits the full chain.

### Required Changes

`resolveClaudeSessionCommand()` currently takes `(command, taskId, projectRoot)`. It needs an additional parameter for the `forkedFrom` task ID:

```typescript
export function resolveClaudeSessionCommand(
  command: string,
  taskId: string,
  projectRoot: string,
  forkedFrom?: string
): string
```

The caller in `electron-pty.ts` needs to read the task's `forkedFrom` field and pass it through. This requires `electron-pty.ts` to have access to the data service or receive the `forkedFrom` value from the renderer via the `pty:create` IPC call.

**Approach:** Add an optional `forkedFrom` parameter to the `pty:create` IPC call. The renderer's `TerminalPanel` reads it from the task store and passes it when creating the PTY session.

## UI Components

### 1. Fork Button — TaskDetailHeader

**Location:** `src/renderer/src/components/task-detail/TaskDetailHeader.tsx`

Add a fork button in the `topBarActions` area, next to the "Open in Finder" button. Uses the `GitFork` icon from Lucide.

**Behavior:** Clicking opens `CreateTaskModal` in fork mode, passing the current task ID.

### 2. CreateTaskModal — Fork Mode

**Location:** `src/renderer/src/components/common/CreateTaskModal.tsx`

The modal accepts an optional `forkFrom?: string` prop (task ID). When set:

- A visual badge is displayed above the title input: "Forking from tsk_abc123" (styled as a subtle chip/pill)
- The title input starts empty — the user types whatever they want
- No labels are copied from the parent
- On submit, the new task is created with `forkedFrom` set to the parent task ID
- The parent task's `forks` array is updated to include the new task ID

### 3. Forked Task — Kanban Card Indicator

**Location:** `src/renderer/src/components/board/TaskCard.tsx`

When a task has `forkedFrom` set, display a small `GitFork` icon on the card. Placement: near the task ID or labels area. The icon is purely decorative on the card (navigation happens in the task detail view).

### 4. Forked Task — Detail View Link to Parent

**Location:** `src/renderer/src/components/task-detail/TaskDetailContent.tsx`

After the labels row in the meta section, show a clickable indicator: a `GitFork` icon + "Forked from tsk_abc123". Clicking navigates to the parent task's detail view.

### 5. Parent Task — Forks List

**Location:** `src/renderer/src/components/task-detail/TaskDetailContent.tsx`

After the attachments/pasted files section, show a "Forks" section if `task.forks` has entries. Each fork is displayed as a clickable link showing the fork's title and ID. Clicking navigates to that task's detail view.

## Task Store Changes

**Location:** `src/renderer/src/stores/task-store.ts`

Modify `addTask()` to:
1. Accept optional `forkedFrom` in the task creation payload
2. If `forkedFrom` is set, update the parent task's `forks` array via `updateTask()`

No new store methods needed — existing `addTask()` and `updateTask()` cover the flow.

## IPC Changes

### Modified: `pty:create`

Add optional `forkedFrom` parameter:

```typescript
// Current signature
ptyCreate(taskId: string, paneId: string, cwd: string): Promise<string>

// New signature
ptyCreate(taskId: string, paneId: string, cwd: string, forkedFrom?: string): Promise<string>
```

Update in:
- `src/preload/index.ts` — add parameter to `ptyCreate`
- `src/renderer/src/env.d.ts` — update type definition
- `src/main/ipc/pty-handlers.ts` — pass `forkedFrom` to PTY create
- `src/main/platform/electron-pty.ts` — pass `forkedFrom` to `resolveClaudeSessionCommand()`

No new IPC handlers needed.

## CLI Changes

### `familiar add` — Optional `--fork-from` flag

Add `--fork-from <taskId>` option to the `add` command in `src/cli/commands/add.ts`. When set:
- Creates the new task with `forkedFrom` set
- Updates the parent task's `forks` array

This enables agents to programmatically fork tasks.

## File Structure

No changes to the `.familiar/` directory structure. Fork metadata lives entirely in `task.json`:

```json
{
  "id": "tsk_def456",
  "title": "Implement caching layer",
  "forkedFrom": "tsk_abc123",
  "forks": [],
  ...
}
```

Parent's `task.json`:
```json
{
  "id": "tsk_abc123",
  "title": "Optimize API performance",
  "forks": ["tsk_def456"],
  ...
}
```

## Edge Cases

1. **Deleting a forked task**: Remove the task ID from the parent's `forks` array. The parent's `forkedFrom` reference in other forks is unaffected.

2. **Deleting a parent task**: Child tasks retain their `forkedFrom` field (now pointing to a deleted task). The UI should handle this gracefully — show "Forked from tsk_abc123 (deleted)" or hide the link.

3. **Archiving**: Forking an archived task is allowed. The fork starts as `todo` regardless.

4. **Session file missing**: If the parent's Claude Code session file doesn't exist when the fork first launches, fall back to `--session-id` (start fresh). Log a warning in the activity.

## Testing

- Unit tests for `resolveClaudeSessionCommand` with `forkedFrom` parameter
- Unit tests for task store `addTask` with fork flow (creates task + updates parent)
- Component tests for `CreateTaskModal` in fork mode (badge display, `forkedFrom` propagation)
- Component tests for `TaskCard` fork icon rendering
- Component tests for fork links in `TaskDetailContent`
- Integration tests for the full fork flow (create fork → verify parent updated → verify session command)
- CLI tests for `familiar add --fork-from`
