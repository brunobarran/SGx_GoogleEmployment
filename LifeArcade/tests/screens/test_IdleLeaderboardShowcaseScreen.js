/**
 * Tests for IdleLeaderboardShowcaseScreen
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { IdleLeaderboardShowcaseScreen } from '../../src/screens/IdleLeaderboardShowcaseScreen.js'

describe('IdleLeaderboardShowcaseScreen - Fase 1: selectRandomGame()', () => {
  let mockAppState
  let mockInputManager
  let mockStorageManager
  let mockOnCloseCallback

  beforeEach(() => {
    // Mock AppState
    mockAppState = {
      setTimeout: vi.fn(),
      clearTimeout: vi.fn()
    }

    // Mock InputManager
    mockInputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock StorageManager
    mockStorageManager = {
      getScores: vi.fn()
    }

    // Mock callback
    mockOnCloseCallback = vi.fn()
  })

  test('selectRandomGame() returns null when no games have scores', () => {
    // Mock all games returning empty scores
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const result = screen.selectRandomGame()

    expect(result).toBeNull()
    expect(mockStorageManager.getScores).toHaveBeenCalledTimes(4)
  })

  test('selectRandomGame() returns a game when one game has scores', () => {
    // Mock: only dino-runner has scores
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'dino-runner') {
        return [
          { name: 'AAA', score: 1000, date: '2025-01-01' }
        ]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const result = screen.selectRandomGame()

    expect(result).not.toBeNull()
    expect(result.id).toBe('dino-runner')
    expect(result.name).toBe('GoL Runner')
  })

  test('selectRandomGame() returns a game when multiple games have scores', () => {
    // Mock: all games have scores
    mockStorageManager.getScores.mockReturnValue([
      { name: 'AAA', score: 1000, date: '2025-01-01' },
      { name: 'BBB', score: 500, date: '2025-01-02' }
    ])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const result = screen.selectRandomGame()

    expect(result).not.toBeNull()
    expect(['space-invaders', 'dino-runner', 'breakout', 'flappy-bird']).toContain(result.id)
    expect(['Gemini Invaders', 'GoL Runner', 'Cell Breaker', 'Flappy Life']).toContain(result.name)
  })

  test('selectRandomGame() is random (statistical test)', () => {
    // Mock: two games have scores
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'space-invaders' || gameId === 'breakout') {
        return [{ name: 'AAA', score: 1000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    // Run 100 times and check both games are selected at least once
    const selections = new Set()
    for (let i = 0; i < 100; i++) {
      const result = screen.selectRandomGame()
      selections.add(result.id)
    }

    // Both games should have been selected at least once in 100 tries
    expect(selections.size).toBeGreaterThan(1)
    expect(selections.has('space-invaders')).toBe(true)
    expect(selections.has('breakout')).toBe(true)
  })

  test('show() calls close() immediately when no games have scores', () => {
    // Mock: no games have scores
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()

    // Should have called close() which calls hide() and callback
    expect(screen.isActive).toBe(false)
    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)
  })

  test('show() sets isActive = true when game has scores', () => {
    // Mock: one game has scores
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'space-invaders') {
        return [{ name: 'AAA', score: 1000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()

    expect(screen.isActive).toBe(true)
    expect(screen.selectedGame).not.toBeNull()
    expect(screen.selectedGame.id).toBe('space-invaders')
  })

  test('close() calls hide() and onCloseCallback', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.close()

    expect(screen.isActive).toBe(false)
    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)
  })

  test('hide() sets isActive = false', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.isActive = true
    screen.hide()

    expect(screen.isActive).toBe(false)
  })
})

describe('IdleLeaderboardShowcaseScreen - Fase 2: UI (DOM, table, styles)', () => {
  let mockAppState
  let mockInputManager
  let mockStorageManager
  let mockOnCloseCallback

  beforeEach(() => {
    // Mock AppState
    mockAppState = {
      setTimeout: vi.fn(),
      clearTimeout: vi.fn()
    }

    // Mock InputManager
    mockInputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock StorageManager
    mockStorageManager = {
      getScores: vi.fn()
    }

    // Mock callback
    mockOnCloseCallback = vi.fn()

    // Setup DOM
    document.body.innerHTML = ''
  })

  test('createDOM() creates main container with correct styles', () => {
    mockStorageManager.getScores.mockReturnValue([
      { name: 'AAA', score: 1000, date: '2025-01-01' }
    ])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.selectedGame = { id: 'dino-runner', name: 'GoL Runner' }
    screen.createDOM()

    const element = document.getElementById('idle-leaderboard-showcase')
    expect(element).not.toBeNull()
    expect(element.style.position).toBe('fixed')
    expect(element.style.background).toBe('rgb(255, 255, 255)')
    expect(element.style.zIndex).toBe('200')
  })

  test('createDOM() displays correct title', () => {
    mockStorageManager.getScores.mockReturnValue([
      { name: 'AAA', score: 1000, date: '2025-01-01' }
    ])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.selectedGame = { id: 'breakout', name: 'Cell Breaker' }
    screen.createDOM()

    const element = document.getElementById('idle-leaderboard-showcase')
    const title = element.querySelector('div')
    expect(title.textContent).toBe('Top players of Cell Breaker')
  })

  test('createTable() displays top 5 scores correctly', () => {
    const mockScores = [
      { name: 'AAA', score: 10000, date: '2025-01-01' },
      { name: 'BBB', score: 9000, date: '2025-01-02' },
      { name: 'CCC', score: 8000, date: '2025-01-03' },
      { name: 'DDD', score: 7000, date: '2025-01-04' },
      { name: 'EEE', score: 6000, date: '2025-01-05' },
      { name: 'FFF', score: 5000, date: '2025-01-06' }
    ]

    mockStorageManager.getScores.mockReturnValue(mockScores)

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.selectedGame = { id: 'space-invaders', name: 'Gemini Invaders' }
    screen.createDOM()

    // Should only show top 5
    const element = document.getElementById('idle-leaderboard-showcase')
    const rows = element.querySelectorAll('div[style*="border-bottom"]')
    expect(rows.length).toBe(5)
  })

  test('createRow() creates row with correct data', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const entry = { name: 'XYZ', score: 12345, date: '2025-01-01' }
    const row = screen.createRow(entry, 1)

    const columns = row.querySelectorAll('div')
    expect(columns.length).toBe(3)
    expect(columns[0].textContent).toBe('1')
    expect(columns[1].textContent).toBe('12,345')
    expect(columns[2].textContent).toBe('XYZ')
  })

  test('createRow() highlights rank 1 in black', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const entry = { name: 'ABC', score: 5000, date: '2025-01-01' }
    const rank1Row = screen.createRow(entry, 1)

    const columns = rank1Row.querySelectorAll('div')
    // Rank 1 should use black color (#202124)
    expect(columns[0].style.color).toBe('rgb(32, 33, 36)')
    expect(columns[1].style.color).toBe('rgb(32, 33, 36)')
    expect(columns[2].style.color).toBe('rgb(32, 33, 36)')
  })

  test('createRow() uses gray color for ranks 2-5', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const entry = { name: 'XYZ', score: 3000, date: '2025-01-02' }
    const rank2Row = screen.createRow(entry, 2)

    const columns = rank2Row.querySelectorAll('div')
    // Ranks 2-5 should use gray color (#CACACA)
    expect(columns[0].style.color).toBe('rgb(202, 202, 202)')
    expect(columns[1].style.color).toBe('rgb(202, 202, 202)')
    expect(columns[2].style.color).toBe('rgb(202, 202, 202)')
  })

  test('createRow() uses thicker border for rank 1', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    const entry1 = { name: 'TOP', score: 9999, date: '2025-01-01' }
    const entry2 = { name: 'SEC', score: 8888, date: '2025-01-02' }

    const rank1Row = screen.createRow(entry1, 1)
    const rank2Row = screen.createRow(entry2, 2)

    // Rank 1 should have 4px border
    expect(rank1Row.style.borderBottom).toContain('4px')
    expect(rank1Row.style.borderBottom).toContain('rgb(32, 33, 36)')

    // Rank 2 should have 3px border
    expect(rank2Row.style.borderBottom).toContain('3px')
    expect(rank2Row.style.borderBottom).toContain('rgb(202, 202, 202)')
  })

  test('addStyles() adds CSS animation styles', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.addStyles()

    const styleElement = document.getElementById('idle-showcase-styles')
    expect(styleElement).not.toBeNull()
    expect(styleElement.textContent).toContain('@keyframes fadeIn')
    expect(styleElement.textContent).toContain('animation: fadeIn 0.5s ease-in')
  })

  test('addStyles() does not create duplicate style elements', () => {
    mockStorageManager.getScores.mockReturnValue([])

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.addStyles()
    screen.addStyles()
    screen.addStyles()

    const styleElements = document.querySelectorAll('#idle-showcase-styles')
    expect(styleElements.length).toBe(1)
  })

  test('show() creates DOM when game has scores', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'flappy-bird') {
        return [{ name: 'AAA', score: 5000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()

    const element = document.getElementById('idle-leaderboard-showcase')
    expect(element).not.toBeNull()
    expect(screen.element).not.toBeNull()
  })

  test('hide() removes DOM element', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'dino-runner') {
        return [{ name: 'AAA', score: 3000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    expect(document.getElementById('idle-leaderboard-showcase')).not.toBeNull()

    screen.hide()
    expect(document.getElementById('idle-leaderboard-showcase')).toBeNull()
    expect(screen.element).toBeNull()
  })
})

describe('IdleLeaderboardShowcaseScreen - Fase 3: Behavior (keys, auto-close)', () => {
  let mockAppState
  let mockInputManager
  let mockStorageManager
  let mockOnCloseCallback

  beforeEach(() => {
    // Mock AppState
    mockAppState = {
      setTimeout: vi.fn(),
      clearTimeout: vi.fn()
    }

    // Mock InputManager
    mockInputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock StorageManager
    mockStorageManager = {
      getScores: vi.fn()
    }

    // Mock callback
    mockOnCloseCallback = vi.fn()

    // Setup DOM
    document.body.innerHTML = ''

    // Use fake timers
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('show() registers key press listener', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'space-invaders') {
        return [{ name: 'AAA', score: 1000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()

    expect(mockInputManager.onKeyPress).toHaveBeenCalledTimes(1)
    expect(mockInputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('handleKeyPress() closes showcase on any key', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'breakout') {
        return [{ name: 'BBB', score: 2000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    expect(screen.isActive).toBe(true)

    // Simulate key press
    screen.handleKeyPress(' ')

    expect(screen.isActive).toBe(false)
    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)
  })

  test('auto-close timer triggers after 20 seconds', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'dino-runner') {
        return [{ name: 'CCC', score: 3000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    expect(screen.isActive).toBe(true)
    expect(screen.autoCloseTimerHandle).not.toBeNull()

    // Fast-forward time by 20 seconds
    vi.advanceTimersByTime(20000)

    expect(screen.isActive).toBe(false)
    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)
  })

  test('auto-close timer does not trigger before 20 seconds', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'flappy-bird') {
        return [{ name: 'DDD', score: 4000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    expect(screen.isActive).toBe(true)

    // Fast-forward time by 19 seconds (not enough)
    vi.advanceTimersByTime(19000)

    expect(screen.isActive).toBe(true)
    expect(mockOnCloseCallback).not.toHaveBeenCalled()
  })

  test('hide() clears auto-close timer', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'space-invaders') {
        return [{ name: 'EEE', score: 5000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    expect(screen.autoCloseTimerHandle).not.toBeNull()

    screen.hide()
    expect(screen.autoCloseTimerHandle).toBeNull()
  })

  test('hide() unregisters key press listener', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'breakout') {
        return [{ name: 'FFF', score: 6000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()
    screen.hide()

    expect(mockInputManager.offKeyPress).toHaveBeenCalledTimes(1)
    expect(mockInputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('manual close() prevents auto-close timer from firing', () => {
    mockStorageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'dino-runner') {
        return [{ name: 'GGG', score: 7000, date: '2025-01-01' }]
      }
      return []
    })

    const screen = new IdleLeaderboardShowcaseScreen(
      mockAppState,
      mockInputManager,
      mockStorageManager,
      mockOnCloseCallback
    )

    screen.show()

    // Manually close after 5 seconds
    vi.advanceTimersByTime(5000)
    screen.close()

    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)

    // Fast-forward past 20 seconds
    vi.advanceTimersByTime(20000)

    // Callback should not be called again
    expect(mockOnCloseCallback).toHaveBeenCalledTimes(1)
  })
})
