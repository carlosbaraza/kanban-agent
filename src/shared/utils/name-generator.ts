/**
 * Generates fun, memorable slug names for worktrees.
 * Format: adjective-animal (e.g., "fuzzy-otter", "cosmic-panda")
 */

const adjectives = [
  'amber', 'bold', 'brave', 'bright', 'calm',
  'clever', 'cosmic', 'crisp', 'daring', 'dusty',
  'eager', 'fancy', 'fierce', 'foggy', 'fuzzy',
  'gentle', 'golden', 'grand', 'happy', 'hasty',
  'icy', 'iron', 'jazzy', 'jolly', 'keen',
  'lazy', 'lemon', 'lucky', 'merry', 'misty',
  'noble', 'nova', 'odd', 'plucky', 'proud',
  'quick', 'quiet', 'rapid', 'rosy', 'rusty',
  'salty', 'shiny', 'silly', 'sleek', 'snowy',
  'spicy', 'stark', 'sunny', 'swift', 'tidy',
  'tiny', 'vivid', 'warm', 'wild', 'witty',
  'zany', 'zippy', 'azure', 'coral', 'lunar'
]

const animals = [
  'badger', 'bear', 'bison', 'bunny', 'camel',
  'cobra', 'crane', 'crow', 'dingo', 'eagle',
  'falcon', 'ferret', 'finch', 'fox', 'gecko',
  'goose', 'hawk', 'heron', 'husky', 'ibis',
  'iguana', 'jackal', 'jay', 'koala', 'lemur',
  'lion', 'llama', 'lynx', 'mole', 'moose',
  'newt', 'otter', 'owl', 'panda', 'parrot',
  'pelican', 'puma', 'quail', 'raven', 'robin',
  'salmon', 'seal', 'shark', 'sloth', 'snail',
  'sparrow', 'squid', 'stork', 'swan', 'tiger',
  'toad', 'toucan', 'trout', 'viper', 'walrus',
  'weasel', 'whale', 'wolf', 'wren', 'yak'
]

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function generateWorktreeSlug(): string {
  return `${randomElement(adjectives)}-${randomElement(animals)}`
}
