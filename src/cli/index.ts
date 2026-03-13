import { Command } from 'commander'
import { initCommand } from './commands/init'
import { addCommand } from './commands/add'
import { listCommand } from './commands/list'
import { statusCommand } from './commands/status'
import { updateCommand } from './commands/update'
import { deleteCommand } from './commands/delete'
import { logCommand } from './commands/log'
import { notifyCommand } from './commands/notify'
import { openCommand, openFolderInApp, resolveProjectRoot } from './commands/open'
import { syncCommand } from './commands/sync'
import { importCommand } from './commands/import'
import { setupCommand } from './commands/setup'
import { doctorCommand } from './commands/doctor'
import { agentsCommand } from './commands/agents'

const program = new Command()

program
  .name('familiar')
  .description('CLI for Familiar — manage tasks from the terminal')
  .version('0.1.0')
  .argument('[path]', 'Path to open in Familiar (directory or file)')
  .action((path?: string) => {
    // Default action: open a folder in the Familiar app
    // `familiar` → open current directory
    // `familiar /some/path` → open that directory (or file's parent)
    const projectRoot = resolveProjectRoot(path)
    openFolderInApp(projectRoot)
  })

program.addCommand(initCommand())
program.addCommand(addCommand())
program.addCommand(listCommand())
program.addCommand(statusCommand())
program.addCommand(updateCommand())
program.addCommand(deleteCommand())
program.addCommand(logCommand())
program.addCommand(notifyCommand())
program.addCommand(openCommand())
program.addCommand(syncCommand())
program.addCommand(importCommand())
program.addCommand(setupCommand())
program.addCommand(doctorCommand())
program.addCommand(agentsCommand())

program.parse()
