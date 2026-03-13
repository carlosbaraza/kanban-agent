import { Header } from './Header'
import { ProjectSidebar } from '../sidebar'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps): React.JSX.Element {
  return (
    <div className="app">
      <Header />
      <div className="app-body">
        <ProjectSidebar />
        <main className="app-main">{children}</main>
      </div>
    </div>
  )
}
