# Kanban Agent

A macOS desktop app that gives AI coding agents their own kanban board, terminals, and editor — so you can manage agentic workflows the way you'd manage a team.

![License](https://img.shields.io/badge/license-MIT-blue)
![Platform](https://img.shields.io/badge/platform-macOS-lightgrey)
![Version](https://img.shields.io/badge/version-0.2.0-green)

## Why?

AI coding agents are powerful, but managing multiple agents across different tasks is chaotic. Kanban Agent treats each task like a card on a board — complete with its own persistent terminal sessions, rich text editor, and activity log. You see what every agent is working on, at a glance.

## Features

- **Kanban board** — Drag-and-drop task cards across columns (Backlog, Todo, In Progress, In Review, Done)
- **Embedded terminals** — Each task has dedicated terminal panes backed by persistent tmux sessions that survive app restarts
- **Block editor** — Rich text task descriptions powered by BlockNote
- **CLI companion** — `kanban-agent` CLI lets agents update their own task status, log progress, and send notifications
- **Agent status tracking** — See which tasks have running agents and their current state
- **Command palette** — Quick navigation with `Cmd+K`
- **Activity timeline** — Full history of status changes, agent logs, and updates per task
- **File-based storage** — Everything lives in `.kanban-agent/` — no database, easy to inspect and version control

## Quick Start

```bash
# Install dependencies
npm install

# Start the app in development mode
npm run dev
```

## CLI

The CLI lets agents (or you) manage tasks from the terminal:

```bash
# Initialize a project
kanban-agent init

# Create a task
kanban-agent add "Implement auth flow" --priority high

# Update status
kanban-agent status <task-id> in-progress

# Log progress
kanban-agent log <task-id> "Auth endpoint working, adding tests"

# Send a notification
kanban-agent notify "Done" "Auth flow complete"

# List tasks
kanban-agent list --status in-progress --json
```

### Install the CLI globally

```bash
npm run build:cli
npm link
```

## Build

```bash
# Build the Electron app
npm run build:app

# Build for specific architecture
npm run build:app:arm64   # Apple Silicon
npm run build:app:x64     # Intel
```

## Architecture

```
Electron Main Process
├── Services (data, file watching)
├── IPC handlers (file, pty, tmux, notifications)
└── Platform abstractions (for future browser portability)

React Renderer
├── Zustand stores (tasks, board, UI, terminals)
├── Kanban board (dnd-kit)
├── Block editor (BlockNote)
├── Terminal emulator (xterm.js)
└── Command palette (cmdk)

CLI (standalone)
└── Direct filesystem access to .kanban-agent/
```

## Tech Stack

| | |
|---|---|
| **App** | Electron + electron-vite |
| **UI** | React 19, Zustand, Framer Motion |
| **Terminal** | xterm.js + node-pty + tmux |
| **Editor** | BlockNote + Mantine |
| **DnD** | @dnd-kit |
| **CLI** | Commander.js + tsup |
| **Tests** | Vitest + Testing Library + Playwright |

## Contributing

```bash
npm install          # Install deps
npm run dev          # Dev server with HMR
npm test             # Run tests
npm run typecheck    # Type checking
```

## License

MIT
