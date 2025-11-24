import { describe, test, expect } from 'vitest'
import {
  GAMES_METADATA,
  getGameMetadataById,
  validateGameMetadata
} from '../../src/installation/GameRegistryMetadata.js'

describe('GameRegistryMetadata', () => {
  // Test 1: GAMES_METADATA structure
  test('GAMES_METADATA has 4 games', () => {
    expect(GAMES_METADATA).toHaveLength(4)
  })

  // Test 2: All games have required metadata fields
  test('All games have required metadata fields', () => {
    const requiredFields = ['id', 'name', 'path', 'key', 'promptPath', 'thinkingPath']

    GAMES_METADATA.forEach(game => {
      requiredFields.forEach(field => {
        expect(game).toHaveProperty(field)
        expect(typeof game[field]).toBe('string')
        expect(game[field].length).toBeGreaterThan(0)
      })
    })
  })

  // Test 3: Game IDs are unique
  test('Game IDs are unique', () => {
    const ids = GAMES_METADATA.map(g => g.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  // Test 4: Game keys are unique
  test('Game keys are unique', () => {
    const keys = GAMES_METADATA.map(g => g.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  // Test 5: All paths use game-wrapper.html
  test('All game paths use game-wrapper.html', () => {
    GAMES_METADATA.forEach(game => {
      expect(game.path).toContain('game-wrapper.html')
      expect(game.path).toContain(`game=${game.id}`)
    })
  })

  // Test 6: getGameMetadataById - valid game
  test('getGameMetadataById returns correct game', () => {
    const game = getGameMetadataById('space-invaders')
    expect(game).toBeDefined()
    expect(game.id).toBe('space-invaders')
    expect(game.name).toBe('Cellfront Command')
  })

  // Test 7: getGameMetadataById - invalid game
  test('getGameMetadataById returns null for invalid ID', () => {
    const game = getGameMetadataById('nonexistent')
    expect(game).toBeNull()
  })

  // Test 8: validateGameMetadata - valid metadata
  test('validateGameMetadata accepts valid metadata', () => {
    const validGame = GAMES_METADATA[0]
    expect(validateGameMetadata(validGame)).toBe(true)
  })

  // Test 9: validateGameMetadata - missing fields
  test('validateGameMetadata rejects metadata with missing fields', () => {
    const invalidGame = { id: 'test', name: 'Test' }  // Missing path, key
    expect(validateGameMetadata(invalidGame)).toBe(false)
  })

  // Test 10: validateGameMetadata - null values
  test('validateGameMetadata rejects null values', () => {
    expect(validateGameMetadata(null)).toBe(false)
    expect(validateGameMetadata(undefined)).toBe(false)
    expect(validateGameMetadata({})).toBe(false)
  })

  // Test 11: validateGameMetadata - empty strings
  test('validateGameMetadata rejects empty strings', () => {
    const invalidGame = {
      id: '',
      name: 'Test',
      path: 'test',
      key: '1'
    }
    expect(validateGameMetadata(invalidGame)).toBe(false)
  })

  // Test 12: Prompt paths point to correct .txt files
  test('Prompt paths are correctly formatted', () => {
    GAMES_METADATA.forEach(game => {
      expect(game.promptPath).toBe(`/games/${game.id}-prompt.txt`)
    })
  })

  // Test 13: Thinking paths point to correct .txt files
  test('Thinking paths are correctly formatted', () => {
    GAMES_METADATA.forEach(game => {
      expect(game.thinkingPath).toBe(`/games/${game.id}-thinking.txt`)
    })
  })

  // Test 14: Game names match expected display names
  test('Game names match expected display names', () => {
    const expectedNames = {
      'space-invaders': 'Cellfront Command',
      'dino-runner': 'Automata Rush',
      'breakout': 'Cellular Shatter',
      'flappy-bird': 'Hoppy Glider'
    }

    GAMES_METADATA.forEach(game => {
      expect(game.name).toBe(expectedNames[game.id])
    })
  })

  // Test 15: Keys are sequential 1-4
  test('Keys are sequential 1-4', () => {
    const keys = GAMES_METADATA.map(g => g.key).sort()
    expect(keys).toEqual(['1', '2', '3', '4'])
  })
})
