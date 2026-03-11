import { useTaskStore } from '@renderer/stores/task-store'
import { Header } from './Header'
import { APP_NAME } from '@shared/constants'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps): React.JSX.Element {
  const projectState = useTaskStore((s) => s.projectState)
  const projectName = projectState?.projectName ?? APP_NAME

  return (
    <div className="app">
      <Header projectName={projectName} />
      <main className="app-main">{children}</main>
    </div>
  )
}
