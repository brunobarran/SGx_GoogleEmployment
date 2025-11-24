/**
 * Integration Tests for GameRegistry + GameRegistryMetadata
 *
 * Tests the relationship between metadata and full game content.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { GAMES_METADATA } from '../../src/installation/GameRegistryMetadata.js'
import { GAMES, getGameById } from '../../src/installation/GameRegistry.js'

describe('GameRegistry Integration Tests', () => {
  // Test 1: GAMES has same count as GAMES_METADATA
  test('GAMES has same count as GAMES_METADATA', () => {
    expect(GAMES.length).toBe(GAMES_METADATA.length)
  })

  // Test 2: Every metadata entry has corresponding full game
  test('Every metadata entry has corresponding full game', () => {
    GAMES_METADATA.forEach(metadata => {
      const fullGame = getGameById(metadata.id)
      expect(fullGame).toBeDefined()
      expect(fullGame.id).toBe(metadata.id)
      expect(fullGame.name).toBe(metadata.name)
      expect(fullGame.path).toBe(metadata.path)
      expect(fullGame.key).toBe(metadata.key)
    })
  })

  // Test 3: Full games include content not in metadata
  test('Full games include content not in metadata', () => {
    GAMES.forEach(game => {
      const metadata = GAMES_METADATA.find(m => m.id === game.id)

      // Metadata fields present in both
      expect(game.id).toBe(metadata.id)
      expect(game.name).toBe(metadata.name)

      // Content fields ONLY in full games
      expect(game.prompt).toBeDefined()
      expect(game.thinking).toBeDefined()

      // Verify metadata doesn't have these loaded fields
      expect(metadata).not.toHaveProperty('prompt')
      expect(metadata).not.toHaveProperty('thinking')

      // But metadata has path references
      expect(metadata).toHaveProperty('promptPath')
      expect(metadata).toHaveProperty('thinkingPath')
    })
  })

  // Test 4: Text content matches expected patterns
  test('Text content matches expected patterns', () => {
    GAMES.forEach(game => {
      // Prompt should be descriptive paragraph
      expect(game.prompt).toMatch(/\w+\s+\w+/)  // Multiple words
      expect(game.prompt.length).toBeGreaterThan(100)

      // Thinking should be technical/detailed
      expect(game.thinking).toMatch(/\w+\s+\w+/)
      expect(game.thinking.length).toBeGreaterThan(100)
    })
  })

  // Test 5: Metadata and content IDs are synchronized
  test('Metadata and content IDs are synchronized', () => {
    const metadataIds = GAMES_METADATA.map(m => m.id).sort()
    const fullGameIds = GAMES.map(g => g.id).sort()

    expect(fullGameIds).toEqual(metadataIds)
  })
})
