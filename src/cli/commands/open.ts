import { Command } from 'commander'
import { execSync } from 'child_process'
import { resolve, dirname } from 'path'
import { statSync } from 'fs'
import chalk from 'chalk'

const APP_NAME = 'Familiar'

/**
 * Resolve a path argument to a directory.
 * If path is a file, returns its parent directory.
 * If path is a directory, returns it as-is.
 */
export function resolveProjectRoot(inputPath?: string): string {
  const resolved = resolve(inputPath || '.')
  try {
    const stat = statSync(resolved)
    return stat.isFile() ? dirname(resolved) : resolved
  } catch {
    // Path doesn't exist — treat as directory path anyway
    return resolved
  }
}

/**
 * Open a folder in the Familiar app by passing --project-root.
 */
export function openFolderInApp(projectRoot: string): void {
  try {
    execSync(`open -a "${APP_NAME}" --args "--project-root=${projectRoot}"`, { stdio: 'ignore' })
    console.log(chalk.green(`Opening ${chalk.bold(projectRoot)} in ${APP_NAME}...`))
  } catch {
    console.error(chalk.red(`Could not open ${APP_NAME}. Is it installed?`))
    console.error(chalk.dim('You can build it with: npm run build'))
    process.exit(1)
  }
}

export function openCommand(): Command {
  return new Command('open')
    .description('Open the Familiar app (optionally with a task ID)')
    .argument('[id]', 'Task ID to open')
    .action(async (id?: string) => {
      try {
        if (id) {
          // Try to open the app with a deep link or pass the task ID
          execSync(`open -a "${APP_NAME}" --args --task=${id}`, { stdio: 'ignore' })
          console.log(chalk.green(`Opening task ${chalk.bold(id)} in ${APP_NAME}...`))
        } else {
          execSync(`open -a "${APP_NAME}"`, { stdio: 'ignore' })
          console.log(chalk.green(`Opening ${APP_NAME}...`))
        }
      } catch {
        console.error(chalk.red(`Could not open ${APP_NAME}. Is it installed?`))
        console.error(chalk.dim('You can build it with: npm run build'))
        process.exit(1)
      }
    })
}
