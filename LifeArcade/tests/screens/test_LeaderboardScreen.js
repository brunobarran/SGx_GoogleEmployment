/**
 * Unit tests for LeaderboardScreen.
 * Tests top 10 scores display with auto-timeout.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { LeaderboardScreen } from '../../src/screens/LeaderboardScreen.js'

describe('LeaderboardScreen - Initialization', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game'
        },
        playerName: 'ABC'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [])
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
    expect(screen.storageManager).toBe(storageManager)
  })

  test('constructor initializes null element', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    expect(screen.element).toBeNull()
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })

  test('AUTO_TIMEOUT constant is 30 seconds', () => {
    expect(LeaderboardScreen.AUTO_TIMEOUT).toBe(30000)
  })
})

describe('LeaderboardScreen - Show', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game'
        },
        playerName: 'ABC'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [
        { name: 'ABC', score: 5000 },
        { name: 'DEF', score: 4000 },
        { name: 'GHI', score: 3000 }
      ])
    }

    // Mock DOM
    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      })),
      body: {
        appendChild: vi.fn()
      },
      head: {
        appendChild: vi.fn()
      },
      getElementById: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
  })

  test('show creates screen element', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('leaderboard-screen')
  })

  test('show loads scores from storage', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(storageManager.getScores).toHaveBeenCalledWith('test-game')
  })

  test('show adds element to DOM', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show displays game name in title', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('TEST GAME - TOP 10')
  })

  test('show displays score entries', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('ABC')
    expect(screen.element.innerHTML).toContain('5,000')
    expect(screen.element.innerHTML).toContain('DEF')
    expect(screen.element.innerHTML).toContain('4,000')
  })

  test('show highlights player entry', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('highlight')
    expect(screen.element.innerHTML).toContain('► ABC ◄')
  })

  test('show displays empty message when no scores', () => {
    storageManager.getScores = vi.fn(() => [])
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('No scores yet')
  })

  test('show registers key press listener', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show sets auto-advance timeout', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(appState.setTimeout).toHaveBeenCalledWith(
      LeaderboardScreen.AUTO_TIMEOUT,
      'qr',
      'leaderboard-timeout'
    )
  })

  test('show adds CSS styles if not present', () => {
    document.getElementById = vi.fn(() => null)
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show skips CSS if already present', () => {
    document.getElementById = vi.fn(() => ({ id: 'leaderboard-screen-styles' }))
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(document.head.appendChild).not.toHaveBeenCalled()
  })

  test('show resets to idle if no game selected', () => {
    appState.getState = vi.fn(() => ({ selectedGame: null, playerName: 'ABC' }))
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Active (30s auto-advance)')
  })
})

describe('LeaderboardScreen - Hide', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' },
        playerName: 'ABC'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [])
    }

    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide clears auto-advance timeout', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(appState.clearTimeout).toHaveBeenCalledWith('leaderboard-timeout')
  })

  test('hide removes key press listener', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes element from DOM', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('LeaderboardScreen - Key Handling', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' },
        playerName: 'ABC'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [])
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
  })

  test('handleKeyPress transitions on Space', () => {
    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('qr')
  })

  test('handleKeyPress logs Space press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress(' ')

    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Space pressed - advancing to QR')
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress logs Escape press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress('Escape')

    expect(logSpy).toHaveBeenCalledWith('LeaderboardScreen: Escape pressed - returning to Idle')
  })

  test('handleKeyPress ignores other keys', () => {
    screen.handleKeyPress('a')
    screen.handleKeyPress('Enter')
    screen.handleKeyPress('1')

    expect(appState.transition).not.toHaveBeenCalled()
    expect(appState.reset).not.toHaveBeenCalled()
  })

  test('handleKeyPress only responds to Space and Escape', () => {
    const keys = ['ArrowUp', 'ArrowDown', 'Enter', 'a', 'z', '1']

    keys.forEach(key => {
      screen.handleKeyPress(key)
    })

    expect(appState.transition).not.toHaveBeenCalled()
    expect(appState.reset).not.toHaveBeenCalled()
  })
})

describe('LeaderboardScreen - Score Display', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' },
        playerName: 'JOE'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('show displays top 10 scores', () => {
    const scores = Array.from({ length: 10 }, (_, i) => ({
      name: `P${i}`,
      score: 10000 - i * 1000
    }))
    storageManager = {
      getScores: vi.fn(() => scores)
    }
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    scores.forEach(entry => {
      expect(screen.element.innerHTML).toContain(entry.name)
    })
  })

  test('show formats scores with commas', () => {
    storageManager = {
      getScores: vi.fn(() => [{ name: 'ABC', score: 123456 }])
    }
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('123,456')
  })

  test('show displays rank numbers', () => {
    storageManager = {
      getScores: vi.fn(() => [
        { name: 'A', score: 1000 },
        { name: 'B', score: 900 },
        { name: 'C', score: 800 }
      ])
    }
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toMatch(/1.*2.*3/s)
  })

  test('show highlights current player entry', () => {
    storageManager = {
      getScores: vi.fn(() => [
        { name: 'ABC', score: 5000 },
        { name: 'JOE', score: 4000 },
        { name: 'DEF', score: 3000 }
      ])
    }
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('► JOE ◄')
    expect(screen.element.innerHTML).toContain('highlight')
  })

  test('show displays empty state correctly', () => {
    storageManager = {
      getScores: vi.fn(() => [])
    }
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('No scores yet')
    expect(screen.element.innerHTML).toContain('Be the first!')
  })
})

describe('LeaderboardScreen - Lifecycle', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' },
        playerName: 'ABC'
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [])
    }

    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    // Show
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(appState.setTimeout).toHaveBeenCalled()

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
    expect(appState.clearTimeout).toHaveBeenCalled()
  })

  test('multiple show-hide cycles', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    // Cycle 1
    screen.show()
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(appState.setTimeout).toHaveBeenCalledTimes(2)

    screen.hide()
    expect(appState.clearTimeout).toHaveBeenCalledTimes(2)
  })

  test('show registers listener, hide unregisters', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('show sets timeout, hide clears it', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    screen.show()
    expect(appState.setTimeout).toHaveBeenCalledWith(30000, 'qr', 'leaderboard-timeout')

    screen.hide()
    expect(appState.clearTimeout).toHaveBeenCalledWith('leaderboard-timeout')
  })
})

describe('LeaderboardScreen - Integration', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' },
        playerName: 'ACE'
      })),
      currentScreen: 'leaderboard'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn(() => [
        { name: 'ACE', score: 8000 },
        { name: 'BOB', score: 7000 },
        { name: 'CAT', score: 6000 }
      ])
    }

    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn(),
        querySelectorAll: vi.fn(() => [])
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → display scores → advance → hide', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(storageManager.getScores).toHaveBeenCalledWith('test-game')

    // User presses Space to advance
    screen.handleKeyPress(' ')
    expect(appState.transition).toHaveBeenCalledWith('qr')

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('complete flow with auto-advance timeout', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()

    // Auto-advance timeout set
    expect(appState.setTimeout).toHaveBeenCalledWith(30000, 'qr', 'leaderboard-timeout')

    // Hide screen
    screen.hide()
    expect(appState.clearTimeout).toHaveBeenCalledWith('leaderboard-timeout')
  })

  test('score display integration', () => {
    screen = new LeaderboardScreen(appState, inputManager, storageManager)
    screen.show()

    // Check all scores displayed
    expect(screen.element.innerHTML).toContain('ACE')
    expect(screen.element.innerHTML).toContain('8,000')
    expect(screen.element.innerHTML).toContain('BOB')
    expect(screen.element.innerHTML).toContain('7,000')
    expect(screen.element.innerHTML).toContain('CAT')
    expect(screen.element.innerHTML).toContain('6,000')

    // Check player highlight
    expect(screen.element.innerHTML).toContain('► ACE ◄')
  })
})
