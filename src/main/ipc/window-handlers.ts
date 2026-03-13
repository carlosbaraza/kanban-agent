import { ipcMain, BrowserWindow, dialog, app, shell } from 'electron'
import { DataService } from '../services/data-service'
import { WorkspaceManager } from '../services/workspace-manager'

export function registerWindowHandlers(
  mainWindow: BrowserWindow,
  dataService: DataService,
  workspaceManager: WorkspaceManager
): void {
  ipcMain.handle('window:open-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory', 'createDirectory']
    })
    return result.filePaths[0] || null
  })

  ipcMain.handle('project:set-root', async (_, newRoot: string) => {
    // Use WorkspaceManager to switch projects
    workspaceManager.openSingleProject(newRoot)
    // Update the legacy dataService reference for backward compatibility
    dataService.setProjectRoot(newRoot)
    return true
  })

  ipcMain.handle('app:version', async () => {
    return app.getVersion()
  })

  ipcMain.handle('shell:open-path', async (_, path: string) => {
    return shell.openPath(path)
  })

  ipcMain.handle('shell:open-external', async (_, url: string) => {
    return shell.openExternal(url)
  })
}
