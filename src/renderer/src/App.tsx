import { useEffect } from 'react'
import { useTaskStore } from '@renderer/stores/task-store'
import { AppShell } from '@renderer/components/layout'
import { KanbanBoard } from '@renderer/components/board'
import { CommandPalette } from './components/command-palette'

function App(): React.JSX.Element {
  const loadProjectState = useTaskStore((s) => s.loadProjectState)

  useEffect(() => {
    loadProjectState()
  }, [loadProjectState])

  return (
    <AppShell>
      <KanbanBoard />
      <CommandPalette />
    </AppShell>
  )
}

export default App
