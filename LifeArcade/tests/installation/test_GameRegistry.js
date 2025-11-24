/**
 * Tests for GameRegistry
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { GAMES, getGameById, validateGame } from '../../src/installation/GameRegistry.js'

describe('GameRegistry', () => {
  // ======================
  // GAMES Array Structure
  // ======================

  test('GAMES array has 4 entries', () => {
    expect(GAMES).toHaveLength(4)
  })

  test('all games have required fields', () => {
    GAMES.forEach(game => {
      expect(game).toHaveProperty('id')
      expect(game).toHaveProperty('name')
      expect(game).toHaveProperty('path')
      expect(game).toHaveProperty('key')
      expect(game).toHaveProperty('prompt')
      expect(game).toHaveProperty('thinking')
    })
  })

  test('all prompts are non-empty strings', () => {
    GAMES.forEach(game => {
      expect(typeof game.prompt).toBe('string')
      expect(game.prompt.length).toBeGreaterThan(0)
    })
  })

  test('all thinking texts are non-empty strings', () => {
    GAMES.forEach(game => {
      expect(typeof game.thinking).toBe('string')
      expect(game.thinking.length).toBeGreaterThan(0)
    })
  })

  test('all game ids are unique', () => {
    const ids = GAMES.map(g => g.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  test('all game keys are unique', () => {
    const keys = GAMES.map(g => g.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(keys.length)
  })

  test('all game names are unique', () => {
    const names = GAMES.map(g => g.name)
    const uniqueNames = new Set(names)
    expect(uniqueNames.size).toBe(names.length)
  })

  // ======================
  // getGameById()
  // ======================

  test('getGameById returns correct game for space-invaders', () => {
    const game = getGameById('space-invaders')
    expect(game).not.toBeNull()
    expect(game.name).toBe('Cellfront Command')
    expect(game.key).toBe('1')
    expect(game.prompt).toBeTruthy()
    expect(game.thinking).toBeTruthy()
  })

  test('getGameById returns correct game for dino-runner', () => {
    const game = getGameById('dino-runner')
    expect(game).not.toBeNull()
    expect(game.name).toBe('Automata Rush')
    expect(game.key).toBe('2')
  })

  test('getGameById returns correct game for breakout', () => {
    const game = getGameById('breakout')
    expect(game).not.toBeNull()
    expect(game.name).toBe('Cellular Shatter')
    expect(game.key).toBe('3')
  })

  test('getGameById returns correct game for flappy-bird', () => {
    const game = getGameById('flappy-bird')
    expect(game).not.toBeNull()
    expect(game.name).toBe('Hoppy Glider')
    expect(game.key).toBe('4')
  })

  test('getGameById returns null for invalid id', () => {
    expect(getGameById('invalid')).toBeNull()
  })

  test('getGameById returns null for empty string', () => {
    expect(getGameById('')).toBeNull()
  })

  test('getGameById returns null for null', () => {
    expect(getGameById(null)).toBeNull()
  })

  test('getGameById returns null for undefined', () => {
    expect(getGameById(undefined)).toBeNull()
  })

  // ======================
  // validateGame()
  // ======================

  test('validateGame accepts valid game from GAMES array', () => {
    expect(validateGame(GAMES[0])).toBe(true)
    expect(validateGame(GAMES[1])).toBe(true)
    expect(validateGame(GAMES[2])).toBe(true)
    expect(validateGame(GAMES[3])).toBe(true)
  })

  test('validateGame rejects null', () => {
    expect(validateGame(null)).toBe(false)
  })

  test('validateGame rejects undefined', () => {
    expect(validateGame(undefined)).toBe(false)
  })

  test('validateGame rejects non-object', () => {
    expect(validateGame('string')).toBe(false)
    expect(validateGame(123)).toBe(false)
    expect(validateGame(true)).toBe(false)
  })

  test('validateGame rejects incomplete game (missing id)', () => {
    expect(validateGame({ name: 'Test', path: 'test', key: '1' })).toBe(false)
  })

  test('validateGame rejects incomplete game (missing name)', () => {
    expect(validateGame({ id: 'test', path: 'test', key: '1' })).toBe(false)
  })

  test('validateGame rejects incomplete game (missing path)', () => {
    expect(validateGame({ id: 'test', name: 'Test', key: '1' })).toBe(false)
  })

  test('validateGame rejects incomplete game (missing key)', () => {
    expect(validateGame({ id: 'test', name: 'Test', path: 'test' })).toBe(false)
  })

  test('validateGame rejects empty string fields', () => {
    expect(validateGame({
      id: '',
      name: '',
      path: '',
      key: ''
    })).toBe(false)
  })

  test('validateGame rejects null field values', () => {
    expect(validateGame({
      id: null,
      name: 'Test',
      path: 'test',
      key: '1'
    })).toBe(false)
  })

  test('validateGame rejects game without prompt field', () => {
    // prompt and thinking are now required for full games
    const gameWithoutPrompt = {
      id: 'test',
      name: 'Test Game',
      path: 'games/test.html',
      key: '5',
      thinking: 'Some thinking text'
    }
    expect(validateGame(gameWithoutPrompt)).toBe(false)
  })

  test('validateGame rejects game without thinking field', () => {
    const gameWithoutThinking = {
      id: 'test',
      name: 'Test Game',
      path: 'games/test.html',
      key: '5',
      prompt: 'Some prompt text'
    }
    expect(validateGame(gameWithoutThinking)).toBe(false)
  })

  // ======================
  // NEW TESTS: Integration with GameRegistryMetadata
  // ======================

  test('GAMES array includes prompt and thinking content', () => {
    GAMES.forEach(game => {
      expect(game).toHaveProperty('prompt')
      expect(game).toHaveProperty('thinking')
      expect(typeof game.prompt).toBe('string')
      expect(typeof game.thinking).toBe('string')
      expect(game.prompt.length).toBeGreaterThan(50)  // Prompts are long
      expect(game.thinking.length).toBeGreaterThan(50)  // Thinking texts are long
    })
  })

  test('GAMES merges GAMES_METADATA with text content', () => {
    GAMES.forEach(game => {
      // Check metadata fields present
      expect(game).toHaveProperty('id')
      expect(game).toHaveProperty('name')
      expect(game).toHaveProperty('path')
      expect(game).toHaveProperty('key')

      // Check content fields present
      expect(game).toHaveProperty('prompt')
      expect(game).toHaveProperty('thinking')

      // Check path fields present (from metadata)
      expect(game).toHaveProperty('promptPath')
      expect(game).toHaveProperty('thinkingPath')
    })
  })

  test('getGameById returns game with text content', () => {
    const game = getGameById('space-invaders')
    expect(game).toBeDefined()
    expect(game.prompt).toBeDefined()
    expect(game.thinking).toBeDefined()
    expect(game.prompt).toContain('Cellfront Command')  // Prompt mentions game name
  })

  test('Re-exported metadata functions work', async () => {
    // Test that re-exported functions are accessible
    const { GAMES_METADATA, getGameMetadataById, validateGameMetadata } =
      await import('../../src/installation/GameRegistry.js')

    expect(GAMES_METADATA).toBeDefined()
    expect(GAMES_METADATA).toHaveLength(4)

    const metadata = getGameMetadataById('dino-runner')
    expect(metadata).toBeDefined()
    expect(metadata.name).toBe('Automata Rush')

    expect(validateGameMetadata(metadata)).toBe(true)
  })

  test('validateGame requires prompt and thinking fields', () => {
    const gameWithoutContent = {
      id: 'test',
      name: 'Test',
      path: 'test',
      key: '1'
      // Missing prompt and thinking
    }

    expect(validateGame(gameWithoutContent)).toBe(false)
  })
})
