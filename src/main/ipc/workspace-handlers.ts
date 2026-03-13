import { ipcMain } from 'electron'
import { WorkspaceManager } from '../services/workspace-manager'
import type { Workspace } from '../../shared/types'

export function registerWorkspaceHandlers(workspaceManager: WorkspaceManager): void {
  ipcMain.handle('workspace:list', async (): Promise<Workspace[]> => {
    return workspaceManager.listWorkspaces()
  })

  ipcMain.handle(
    'workspace:create',
    async (_, name: string, projectPaths: string[]): Promise<Workspace> => {
      return workspaceManager.createWorkspace(name, projectPaths)
    }
  )

  ipcMain.handle(
    'workspace:update',
    async (_, id: string, updates: Partial<Workspace>): Promise<Workspace> => {
      return workspaceManager.updateWorkspace(id, updates)
    }
  )

  ipcMain.handle('workspace:delete', async (_, id: string): Promise<void> => {
    workspaceManager.deleteWorkspace(id)
  })

  ipcMain.handle('workspace:open', async (_, workspaceId: string): Promise<void> => {
    workspaceManager.openWorkspace(workspaceId)
  })

  ipcMain.handle('workspace:open-single', async (_, projectPath: string): Promise<void> => {
    workspaceManager.openSingleProject(projectPath)
  })

  ipcMain.handle('workspace:add-project', async (_, projectPath: string): Promise<void> => {
    workspaceManager.addProjectToWorkspace(projectPath)
  })

  ipcMain.handle('workspace:remove-project', async (_, projectPath: string): Promise<void> => {
    workspaceManager.removeProjectFromWorkspace(projectPath)
  })

  ipcMain.handle('workspace:get-config', async () => {
    return workspaceManager.loadWorkspaceConfig()
  })

  ipcMain.handle('workspace:get-open-projects', async (): Promise<string[]> => {
    return workspaceManager.getOpenProjectPaths()
  })

  ipcMain.handle('workspace:get-active-project', async (): Promise<string | null> => {
    return workspaceManager.getActiveProjectPath()
  })

  ipcMain.handle('workspace:set-active-project', async (_, projectPath: string): Promise<void> => {
    workspaceManager.setActiveProjectPath(projectPath)
  })
}
