import { Command } from 'commander'

export function syncCommand(): Command {
  return new Command('sync')
    .description('Sync project state with the Familiar app')
    .action(() => {
      console.log('Not implemented yet')
    })
}
