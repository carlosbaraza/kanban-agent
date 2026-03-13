export interface Workspace {
  id: string // "ws_<nanoid>"
  name: string // User-given name (empty string for implicit single-project)
  projectPaths: string[] // Ordered list of project folder paths
  lastOpenedAt: string // ISO date
  createdAt: string // ISO date
}

export interface WorkspaceConfig {
  workspaces: Workspace[]
  lastWorkspaceId: string | null
}
