/**
 * Unit tests for StorageManager.
 * Tests localStorage wrapper for leaderboard persistence.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { StorageManager } from '../../src/installation/StorageManager.js'

// Mock localStorage
const createLocalStorageMock = () => {
  let store = {}

  return {
    store,
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => {
      store[key] = value
    }),
    removeItem: vi.fn((key) => {
      delete store[key]
    }),
    clear: vi.fn(() => {
      store = {}
    }),
    get length() {
      return Object.keys(store).length
    },
    key: vi.fn((index) => {
      const keys = Object.keys(store)
      return keys[index] || null
    })
  }
}

describe('StorageManager - Initialization', () => {
  let localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
  })

  test('constructor tests localStorage availability', () => {
    const storage = new StorageManager()

    expect(storage.isAvailable).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalledWith('__storage_test__', 'test')
    expect(localStorageMock.removeItem).toHaveBeenCalledWith('__storage_test__')
  })

  test('handles localStorage unavailable gracefully', () => {
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // Make localStorage throw error
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage disabled')
    })

    const storage = new StorageManager()

    expect(storage.isAvailable).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith('localStorage not available - scores will not persist')

    consoleSpy.mockRestore()
  })
})

describe('StorageManager - saveScore', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('saves score to localStorage', () => {
    const result = storage.saveScore('dino-runner', 'ABC', 1000)

    expect(result).toBe(true)
    expect(localStorageMock.setItem).toHaveBeenCalled()

    const savedData = localStorageMock.store['scores_dino-runner']
    const parsed = JSON.parse(savedData)

    expect(parsed).toHaveLength(1)
    expect(parsed[0].name).toBe('ABC')
    expect(parsed[0].score).toBe(1000)
    expect(parsed[0].date).toBeDefined()
  })

  test('converts player name to uppercase', () => {
    storage.saveScore('breakout', 'xyz', 500)

    const savedData = localStorageMock.store['scores_breakout']
    const parsed = JSON.parse(savedData)

    expect(parsed[0].name).toBe('XYZ')
  })

  test('maintains top 10 scores only', () => {
    // Add 15 scores
    for (let i = 0; i < 15; i++) {
      storage.saveScore('flappy-bird', 'TST', i * 100)
    }

    const saved = storage.getScores('flappy-bird')

    expect(saved).toHaveLength(10)
  })

  test('sorts scores descending', () => {
    storage.saveScore('space-invaders', 'AAA', 100)
    storage.saveScore('space-invaders', 'BBB', 500)
    storage.saveScore('space-invaders', 'CCC', 300)

    const scores = storage.getScores('space-invaders')

    expect(scores[0].score).toBe(500)
    expect(scores[1].score).toBe(300)
    expect(scores[2].score).toBe(100)
  })

  test('validates game name', () => {
    const result1 = storage.saveScore('', 'ABC', 100)
    const result2 = storage.saveScore(null, 'ABC', 100)
    const result3 = storage.saveScore(123, 'ABC', 100)

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })

  test('validates player name is 3 letters', () => {
    const result1 = storage.saveScore('game', 'AB', 100)
    const result2 = storage.saveScore('game', 'ABCD', 100)
    const result3 = storage.saveScore('game', '', 100)

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })

  test('validates score is positive number', () => {
    const result1 = storage.saveScore('game', 'ABC', -1)
    const result2 = storage.saveScore('game', 'ABC', 'invalid')
    const result3 = storage.saveScore('game', 'ABC', null)

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })

  test('handles quota exceeded error', () => {
    const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    // First call throws quota error, second succeeds
    let callCount = 0
    localStorageMock.setItem.mockImplementation((key, value) => {
      callCount++
      if (callCount === 1) {
        const error = new Error('Quota exceeded')
        error.name = 'QuotaExceededError'
        throw error
      }
      localStorageMock.store[key] = value
    })

    const result = storage.saveScore('game', 'ABC', 100)

    expect(result).toBe(true)
    expect(consoleWarnSpy).toHaveBeenCalledWith('localStorage quota exceeded, clearing old scores')

    consoleWarnSpy.mockRestore()
  })

  test('returns false when localStorage unavailable', () => {
    storage.isAvailable = false

    const result = storage.saveScore('game', 'ABC', 100)

    expect(result).toBe(false)
  })
})

describe('StorageManager - getScores', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('returns empty array for new game', () => {
    const scores = storage.getScores('new-game')

    expect(scores).toEqual([])
  })

  test('returns saved scores', () => {
    storage.saveScore('game', 'AAA', 100)
    storage.saveScore('game', 'BBB', 200)

    const scores = storage.getScores('game')

    expect(scores).toHaveLength(2)
    expect(scores[0].score).toBe(200)
    expect(scores[1].score).toBe(100)
  })

  test('handles corrupted localStorage data', () => {
    localStorageMock.store['scores_corrupted'] = 'invalid json'

    const scores = storage.getScores('corrupted')

    expect(scores).toEqual([])
  })

  test('validates score objects structure', () => {
    localStorageMock.store['scores_invalid'] = JSON.stringify([
      { name: 'ABC', score: 100, date: '2025-01-01' },
      { name: 'DEF', invalid: 'data' },  // Missing score
      { name: 123, score: 200, date: '2025-01-01' },  // Invalid name type
      { name: 'GHI', score: 300, date: '2025-01-01' }
    ])

    const scores = storage.getScores('invalid')

    expect(scores).toHaveLength(2)  // Only valid scores
    expect(scores[0].name).toBe('GHI')
    expect(scores[1].name).toBe('ABC')
  })

  test('returns empty array when localStorage unavailable', () => {
    storage.isAvailable = false

    const scores = storage.getScores('game')

    expect(scores).toEqual([])
  })

  test('validates game name', () => {
    const scores1 = storage.getScores('')
    const scores2 = storage.getScores(null)
    const scores3 = storage.getScores(123)

    expect(scores1).toEqual([])
    expect(scores2).toEqual([])
    expect(scores3).toEqual([])
  })
})

describe('StorageManager - isHighScore', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('returns true when less than 10 scores exist', () => {
    storage.saveScore('game', 'AAA', 100)

    expect(storage.isHighScore('game', 50)).toBe(true)
    expect(storage.isHighScore('game', 1)).toBe(true)
  })

  test('returns true when score beats lowest top 10', () => {
    // Fill with 10 scores (0-900)
    for (let i = 0; i < 10; i++) {
      storage.saveScore('game', 'TST', i * 100)
    }

    expect(storage.isHighScore('game', 50)).toBe(true)
    expect(storage.isHighScore('game', 1000)).toBe(true)
  })

  test('returns false when score does not beat lowest top 10', () => {
    // Fill with 10 scores (100-1000)
    for (let i = 1; i <= 10; i++) {
      storage.saveScore('game', 'TST', i * 100)
    }

    expect(storage.isHighScore('game', 50)).toBe(false)
    expect(storage.isHighScore('game', 99)).toBe(false)
  })

  test('validates score is positive number', () => {
    expect(storage.isHighScore('game', -1)).toBe(false)
    expect(storage.isHighScore('game', 'invalid')).toBe(false)
    expect(storage.isHighScore('game', null)).toBe(false)
  })

  test('returns true for first score in new game', () => {
    expect(storage.isHighScore('new-game', 1)).toBe(true)
  })
})

describe('StorageManager - clearScores', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('clears scores for game', () => {
    storage.saveScore('game', 'AAA', 100)
    expect(storage.getScores('game')).toHaveLength(1)

    const result = storage.clearScores('game')

    expect(result).toBe(true)
    expect(storage.getScores('game')).toEqual([])
  })

  test('validates game name', () => {
    const result1 = storage.clearScores('')
    const result2 = storage.clearScores(null)
    const result3 = storage.clearScores(123)

    expect(result1).toBe(false)
    expect(result2).toBe(false)
    expect(result3).toBe(false)
  })

  test('returns false when localStorage unavailable', () => {
    storage.isAvailable = false

    const result = storage.clearScores('game')

    expect(result).toBe(false)
  })
})

describe('StorageManager - getAllGames', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('returns empty array when no games saved', () => {
    const games = storage.getAllGames()

    expect(games).toEqual([])
  })

  test('returns list of games with scores', () => {
    storage.saveScore('dino-runner', 'AAA', 100)
    storage.saveScore('breakout', 'BBB', 200)
    storage.saveScore('flappy-bird', 'CCC', 300)

    const games = storage.getAllGames()

    expect(games).toHaveLength(3)
    expect(games).toContain('dino-runner')
    expect(games).toContain('breakout')
    expect(games).toContain('flappy-bird')
  })

  test('ignores non-score keys', () => {
    storage.saveScore('game', 'AAA', 100)
    localStorageMock.store['other_key'] = 'value'
    localStorageMock.store['another_key'] = 'value'

    const games = storage.getAllGames()

    expect(games).toEqual(['game'])
  })

  test('returns empty array when localStorage unavailable', () => {
    storage.isAvailable = false

    const games = storage.getAllGames()

    expect(games).toEqual([])
  })
})

describe('StorageManager - getTotalScoreCount', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('returns 0 when no scores', () => {
    expect(storage.getTotalScoreCount()).toBe(0)
  })

  test('counts scores across all games', () => {
    storage.saveScore('game1', 'AAA', 100)
    storage.saveScore('game1', 'BBB', 200)
    storage.saveScore('game2', 'CCC', 300)
    storage.saveScore('game3', 'DDD', 400)
    storage.saveScore('game3', 'EEE', 500)
    storage.saveScore('game3', 'FFF', 600)

    expect(storage.getTotalScoreCount()).toBe(6)
  })

  test('returns 0 when localStorage unavailable', () => {
    storage.isAvailable = false

    expect(storage.getTotalScoreCount()).toBe(0)
  })
})

describe('StorageManager - Integration', () => {
  let storage, localStorageMock

  beforeEach(() => {
    localStorageMock = createLocalStorageMock()
    global.localStorage = localStorageMock
    storage = new StorageManager()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete leaderboard workflow', () => {
    // Save scores
    storage.saveScore('dino-runner', 'ABC', 1000)
    storage.saveScore('dino-runner', 'DEF', 2000)
    storage.saveScore('dino-runner', 'GHI', 1500)

    // Check if high score
    expect(storage.isHighScore('dino-runner', 1200)).toBe(true)
    expect(storage.isHighScore('dino-runner', 500)).toBe(true)

    // Get sorted leaderboard
    const scores = storage.getScores('dino-runner')
    expect(scores[0].score).toBe(2000)
    expect(scores[1].score).toBe(1500)
    expect(scores[2].score).toBe(1000)

    // Clear leaderboard
    storage.clearScores('dino-runner')
    expect(storage.getScores('dino-runner')).toEqual([])
  })

  test('multiple games maintain separate leaderboards', () => {
    storage.saveScore('game1', 'AAA', 100)
    storage.saveScore('game2', 'BBB', 200)

    const games = storage.getAllGames()
    expect(games).toHaveLength(2)

    expect(storage.getScores('game1')[0].score).toBe(100)
    expect(storage.getScores('game2')[0].score).toBe(200)

    storage.clearScores('game1')
    expect(storage.getScores('game1')).toEqual([])
    expect(storage.getScores('game2')).toHaveLength(1)
  })
})
