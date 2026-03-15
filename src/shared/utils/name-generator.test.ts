import { describe, it, expect } from 'vitest'
import { generateWorktreeSlug } from './name-generator'

describe('generateWorktreeSlug', () => {
  it('returns a string in adjective-animal format', () => {
    const slug = generateWorktreeSlug()
    expect(slug).toMatch(/^[a-z]+-[a-z]+$/)
  })

  it('generates different slugs (not always identical)', () => {
    const slugs = new Set<string>()
    for (let i = 0; i < 20; i++) {
      slugs.add(generateWorktreeSlug())
    }
    // With 60 adjectives × 60 animals = 3600 combos, 20 samples should yield at least 2 unique
    expect(slugs.size).toBeGreaterThan(1)
  })

  it('contains only lowercase letters and hyphens', () => {
    for (let i = 0; i < 50; i++) {
      const slug = generateWorktreeSlug()
      expect(slug).toMatch(/^[a-z-]+$/)
    }
  })

  it('has exactly one hyphen separating two parts', () => {
    const slug = generateWorktreeSlug()
    const parts = slug.split('-')
    expect(parts).toHaveLength(2)
    expect(parts[0].length).toBeGreaterThan(0)
    expect(parts[1].length).toBeGreaterThan(0)
  })
})
