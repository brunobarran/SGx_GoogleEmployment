/**
 * Unit tests for AppState.
 * Tests state machine, observer pattern, and session data management.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi, afterEach } from 'vitest'
import { AppState } from '../../src/installation/AppState.js'

describe('AppState - Initialization', () => {
  let state

  beforeEach(() => {
    state = new AppState()
  })

  test('constructor initializes with IDLE screen', () => {
    expect(state.currentScreen).toBe(AppState.SCREENS.IDLE)
  })

  test('constructor initializes session data as null', () => {
    expect(state.selectedGame).toBeNull()
    expect(state.currentScore).toBeNull()
    expect(state.playerName).toBeNull()
  })

  test('constructor initializes empty observers array', () => {
    expect(state.observers).toEqual([])
  })

  test('constructor initializes empty timeout handles', () => {
    expect(state.timeoutHandles).toEqual({})
  })

  test('SCREENS constant has 8 screens', () => {
    const screens = Object.keys(AppState.SCREENS)
    expect(screens).toHaveLength(8)
    expect(screens).toContain('IDLE')
    expect(screens).toContain('WELCOME')
    expect(screens).toContain('GALLERY')
    expect(screens).toContain('CODE')
    expect(screens).toContain('GAME')
    expect(screens).toContain('SCORE')
    expect(screens).toContain('LEADERBOARD')
    expect(screens).toContain('QR')
  })

  test('TRANSITIONS defines valid state machine flow', () => {
    expect(AppState.TRANSITIONS.idle).toEqual(['welcome'])
    expect(AppState.TRANSITIONS.welcome).toEqual(['gallery', 'idle'])
    expect(AppState.TRANSITIONS.gallery).toEqual(['code', 'idle'])
    expect(AppState.TRANSITIONS.code).toEqual(['game', 'idle'])
    expect(AppState.TRANSITIONS.game).toEqual(['score', 'idle'])
    expect(AppState.TRANSITIONS.score).toEqual(['leaderboard', 'idle'])
    expect(AppState.TRANSITIONS.leaderboard).toEqual(['qr', 'idle'])
    expect(AppState.TRANSITIONS.qr).toEqual(['idle'])
  })
})

describe('AppState - Screen Transitions', () => {
  let state, consoleSpy

  beforeEach(() => {
    state = new AppState()
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  test('transition succeeds for valid transitions', () => {
    const result = state.transition('welcome')

    expect(result).toBe(true)
    expect(state.currentScreen).toBe('welcome')
  })

  test('transition fails for invalid screen name', () => {
    const result = state.transition('invalid-screen')

    expect(result).toBe(false)
    expect(state.currentScreen).toBe('idle')
  })

  test('transition fails for disallowed state change', () => {
    const result = state.transition('game')  // idle → game not allowed

    expect(result).toBe(false)
    expect(state.currentScreen).toBe('idle')
  })

  test('transition logs screen change', () => {
    state.transition('welcome')

    expect(consoleSpy).toHaveBeenCalledWith('Screen transition: idle → welcome')
  })

  test('transition clears all timeouts', () => {
    state.setTimeout(5000, 'idle', 'test')
    expect(Object.keys(state.timeoutHandles)).toHaveLength(1)

    state.transition('welcome')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)
  })

  test('complete flow from idle to qr and back', () => {
    expect(state.transition('welcome')).toBe(true)
    expect(state.currentScreen).toBe('welcome')

    expect(state.transition('gallery')).toBe(true)
    expect(state.currentScreen).toBe('gallery')

    expect(state.transition('code')).toBe(true)
    expect(state.currentScreen).toBe('code')

    expect(state.transition('game')).toBe(true)
    expect(state.currentScreen).toBe('game')

    expect(state.transition('score')).toBe(true)
    expect(state.currentScreen).toBe('score')

    expect(state.transition('leaderboard')).toBe(true)
    expect(state.currentScreen).toBe('leaderboard')

    expect(state.transition('qr')).toBe(true)
    expect(state.currentScreen).toBe('qr')

    expect(state.transition('idle')).toBe(true)
    expect(state.currentScreen).toBe('idle')
  })

  test('any screen can transition to idle', () => {
    state.transition('welcome')
    expect(state.transition('idle')).toBe(true)

    state.transition('welcome')
    state.transition('gallery')
    expect(state.transition('idle')).toBe(true)

    state.transition('welcome')
    state.transition('gallery')
    state.transition('code')
    expect(state.transition('idle')).toBe(true)
  })

  test('cannot skip screens in sequence', () => {
    state.transition('welcome')

    // Try to skip gallery and go directly to code
    expect(state.transition('code')).toBe(false)
    expect(state.currentScreen).toBe('welcome')
  })
})

describe('AppState - Session Data', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('setGame accepts valid game object', () => {
    const game = {
      id: 'space-invaders',
      name: 'Space Invaders',
      path: '/games/space-invaders.js'
    }

    state.setGame(game)

    expect(state.selectedGame).toEqual(game)
  })

  test('setGame rejects null', () => {
    state.setGame(null)

    expect(state.selectedGame).toBeNull()
  })

  test('setGame rejects object without id', () => {
    state.setGame({ name: 'Test', path: '/test.js' })

    expect(state.selectedGame).toBeNull()
  })

  test('setGame rejects object without name', () => {
    state.setGame({ id: 'test', path: '/test.js' })

    expect(state.selectedGame).toBeNull()
  })

  test('setGame rejects object without path', () => {
    state.setGame({ id: 'test', name: 'Test' })

    expect(state.selectedGame).toBeNull()
  })

  test('setScore accepts valid positive number', () => {
    state.setScore(12345)

    expect(state.currentScore).toBe(12345)
  })

  test('setScore accepts zero', () => {
    state.setScore(0)

    expect(state.currentScore).toBe(0)
  })

  test('setScore rejects negative number', () => {
    state.setScore(-100)

    expect(state.currentScore).toBeNull()
  })

  test('setScore rejects non-number', () => {
    state.setScore('12345')

    expect(state.currentScore).toBeNull()
  })

  test('setPlayerName accepts valid 3-letter uppercase name', () => {
    state.setPlayerName('ABC')

    expect(state.playerName).toBe('ABC')
  })

  test('setPlayerName rejects lowercase', () => {
    state.setPlayerName('abc')

    expect(state.playerName).toBeNull()
  })

  test('setPlayerName rejects 2 letters', () => {
    state.setPlayerName('AB')

    expect(state.playerName).toBeNull()
  })

  test('setPlayerName rejects 4 letters', () => {
    state.setPlayerName('ABCD')

    expect(state.playerName).toBeNull()
  })

  test('setPlayerName rejects numbers', () => {
    state.setPlayerName('A12')

    expect(state.playerName).toBeNull()
  })

  test('setPlayerName rejects special characters', () => {
    state.setPlayerName('A@C')

    expect(state.playerName).toBeNull()
  })
})

describe('AppState - Observer Pattern', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('addObserver registers callback', () => {
    const callback = vi.fn()

    state.addObserver(callback)

    expect(state.observers).toHaveLength(1)
    expect(state.observers[0]).toBe(callback)
  })

  test('addObserver rejects non-function', () => {
    state.addObserver('not a function')

    expect(state.observers).toHaveLength(0)
  })

  test('observer callback receives screen changes', () => {
    const callback = vi.fn()
    state.addObserver(callback)

    state.transition('welcome')

    expect(callback).toHaveBeenCalledWith('welcome', 'idle')
  })

  test('multiple observers all get notified', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    state.addObserver(callback1)
    state.addObserver(callback2)
    state.addObserver(callback3)

    state.transition('welcome')

    expect(callback1).toHaveBeenCalledWith('welcome', 'idle')
    expect(callback2).toHaveBeenCalledWith('welcome', 'idle')
    expect(callback3).toHaveBeenCalledWith('welcome', 'idle')
  })

  test('observer errors do not stop other observers', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Observer error')
    })
    const goodCallback = vi.fn()

    state.addObserver(errorCallback)
    state.addObserver(goodCallback)

    state.transition('welcome')

    expect(errorCallback).toHaveBeenCalled()
    expect(goodCallback).toHaveBeenCalled()
  })

  test('subscribe returns unsubscribe function', () => {
    const callback = vi.fn()

    const unsubscribe = state.subscribe(callback)

    expect(typeof unsubscribe).toBe('function')
  })

  test('subscribe callback receives state object', () => {
    const callback = vi.fn()
    state.subscribe(callback)

    state.transition('welcome')

    expect(callback).toHaveBeenCalledWith({
      currentScreen: 'welcome',
      selectedGame: null,
      currentScore: null,
      playerName: null
    })
  })

  test('unsubscribe removes callback', () => {
    const callback = vi.fn()
    const unsubscribe = state.subscribe(callback)

    state.transition('welcome')
    expect(callback).toHaveBeenCalledTimes(1)

    callback.mockClear()
    unsubscribe()

    state.transition('gallery')
    expect(callback).not.toHaveBeenCalled()
  })

  test('subscribe callback receives updated session data', () => {
    const callback = vi.fn()
    state.subscribe(callback)

    state.setGame({ id: 'test', name: 'Test', path: '/test.js' })
    state.setScore(5000)
    state.setPlayerName('XYZ')

    state.transition('welcome')

    expect(callback).toHaveBeenCalledWith({
      currentScreen: 'welcome',
      selectedGame: { id: 'test', name: 'Test', path: '/test.js' },
      currentScore: 5000,
      playerName: 'XYZ'
    })
  })
})

describe('AppState - Timeout Management', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  test('setTimeout creates timeout handle', () => {
    state.setTimeout(5000, 'idle', 'test')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(1)
    expect(state.timeoutHandles.test).toBeDefined()
  })

  test('setTimeout triggers transition after delay', () => {
    state.transition('welcome')
    state.setTimeout(5000, 'idle', 'test')

    vi.advanceTimersByTime(5000)

    expect(state.currentScreen).toBe('idle')
  })

  test('setTimeout replaces existing timeout with same ID', () => {
    state.setTimeout(5000, 'idle', 'test')
    const firstHandle = state.timeoutHandles.test

    state.setTimeout(3000, 'idle', 'test')
    const secondHandle = state.timeoutHandles.test

    expect(Object.keys(state.timeoutHandles)).toHaveLength(1)
    expect(secondHandle).not.toBe(firstHandle)
  })

  test('clearTimeout removes specific timeout', () => {
    state.setTimeout(5000, 'idle', 'test')
    state.clearTimeout('test')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)

    vi.advanceTimersByTime(5000)
    // Should not transition since timeout was cleared
    expect(state.currentScreen).toBe('idle')
  })

  test('clearTimeout handles non-existent ID gracefully', () => {
    expect(() => {
      state.clearTimeout('nonexistent')
    }).not.toThrow()
  })

  test('clearAllTimeouts removes all timeouts', () => {
    state.setTimeout(5000, 'idle', 'timeout1')
    state.setTimeout(3000, 'idle', 'timeout2')
    state.setTimeout(7000, 'idle', 'timeout3')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(3)

    state.clearAllTimeouts()

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)
  })

  test('transition clears all existing timeouts', () => {
    state.setTimeout(5000, 'idle', 'timeout1')
    state.setTimeout(3000, 'idle', 'timeout2')

    state.transition('welcome')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)
  })

  test('timeout removes itself after execution', () => {
    state.transition('welcome')
    state.setTimeout(5000, 'idle', 'test')

    vi.advanceTimersByTime(5000)

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)
  })

  test('multiple timeouts can coexist', () => {
    state.setTimeout(5000, 'idle', 'timeout1')
    state.setTimeout(3000, 'idle', 'timeout2')
    state.setTimeout(7000, 'idle', 'timeout3')

    expect(Object.keys(state.timeoutHandles)).toHaveLength(3)
    expect(state.timeoutHandles.timeout1).toBeDefined()
    expect(state.timeoutHandles.timeout2).toBeDefined()
    expect(state.timeoutHandles.timeout3).toBeDefined()
  })
})

describe('AppState - Reset', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('reset clears session data', () => {
    state.setGame({ id: 'test', name: 'Test', path: '/test.js' })
    state.setScore(5000)
    state.setPlayerName('ABC')

    state.reset()

    expect(state.selectedGame).toBeNull()
    expect(state.currentScore).toBeNull()
    expect(state.playerName).toBeNull()
  })

  test('reset transitions to idle', () => {
    state.transition('welcome')
    state.transition('gallery')

    state.reset()

    expect(state.currentScreen).toBe('idle')
  })

  test('reset clears all timeouts', () => {
    vi.useFakeTimers()

    state.setTimeout(5000, 'idle', 'timeout1')
    state.setTimeout(3000, 'idle', 'timeout2')

    state.reset()

    expect(Object.keys(state.timeoutHandles)).toHaveLength(0)

    vi.useRealTimers()
  })

  test('reset notifies observers', () => {
    const callback = vi.fn()
    state.addObserver(callback)

    state.transition('welcome')
    callback.mockClear()

    state.reset()

    expect(callback).toHaveBeenCalledWith('idle', 'welcome')
  })

  test('reset bypasses transition validation', () => {
    // Set to QR screen (can only go to idle via transition)
    state.currentScreen = 'qr'

    state.reset()

    expect(state.currentScreen).toBe('idle')
  })
})

describe('AppState - getState', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('getState returns current state snapshot', () => {
    const stateSnapshot = state.getState()

    expect(stateSnapshot).toEqual({
      currentScreen: 'idle',
      selectedGame: null,
      currentScore: null,
      playerName: null
    })
  })

  test('getState reflects session data changes', () => {
    state.setGame({ id: 'test', name: 'Test', path: '/test.js' })
    state.setScore(9999)
    state.setPlayerName('XYZ')

    const stateSnapshot = state.getState()

    expect(stateSnapshot.selectedGame.id).toBe('test')
    expect(stateSnapshot.currentScore).toBe(9999)
    expect(stateSnapshot.playerName).toBe('XYZ')
  })

  test('getState reflects screen transitions', () => {
    state.transition('welcome')

    const stateSnapshot = state.getState()

    expect(stateSnapshot.currentScreen).toBe('welcome')
  })

  test('getState returns new object (not reference)', () => {
    const snapshot1 = state.getState()
    const snapshot2 = state.getState()

    expect(snapshot1).not.toBe(snapshot2)
    expect(snapshot1).toEqual(snapshot2)
  })
})

describe('AppState - Integration', () => {
  let state

  beforeEach(() => {
    state = new AppState()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  test('complete gameplay session flow', () => {
    const observer = vi.fn()
    state.addObserver(observer)

    // Start session
    expect(state.transition('welcome')).toBe(true)
    expect(observer).toHaveBeenCalledWith('welcome', 'idle')

    // Select game
    state.setGame({ id: 'space-invaders', name: 'Space Invaders', path: '/games/space-invaders.js' })
    expect(state.transition('gallery')).toBe(true)

    // Animate code
    expect(state.transition('code')).toBe(true)

    // Play game
    expect(state.transition('game')).toBe(true)
    state.setScore(15000)

    // Enter name
    expect(state.transition('score')).toBe(true)
    state.setPlayerName('GOD')

    // View leaderboard
    expect(state.transition('leaderboard')).toBe(true)

    // Show QR code
    expect(state.transition('qr')).toBe(true)

    // Return to idle
    state.reset()

    // Verify all data cleared
    const finalState = state.getState()
    expect(finalState.currentScreen).toBe('idle')
    expect(finalState.selectedGame).toBeNull()
    expect(finalState.currentScore).toBeNull()
    expect(finalState.playerName).toBeNull()
  })

  test('emergency reset from any screen', () => {
    state.transition('welcome')
    state.transition('gallery')
    state.transition('code')
    state.transition('game')

    state.setGame({ id: 'test', name: 'Test', path: '/test.js' })
    state.setScore(5000)

    // Emergency reset
    state.reset()

    expect(state.currentScreen).toBe('idle')
    expect(state.selectedGame).toBeNull()
    expect(state.currentScore).toBeNull()
  })

  test('timeout auto-advance with observer notification', () => {
    vi.useFakeTimers()

    const observer = vi.fn()
    state.addObserver(observer)

    state.transition('welcome')
    state.setTimeout(30000, 'idle', 'inactivity')

    observer.mockClear()

    vi.advanceTimersByTime(30000)

    expect(observer).toHaveBeenCalledWith('idle', 'welcome')
    expect(state.currentScreen).toBe('idle')

    vi.useRealTimers()
  })

  test('multiple sessions with reset between', () => {
    // Session 1
    state.transition('welcome')
    state.setGame({ id: 'game1', name: 'Game 1', path: '/game1.js' })
    state.setScore(1000)
    state.setPlayerName('AAA')

    state.reset()

    // Session 2
    state.transition('welcome')
    state.setGame({ id: 'game2', name: 'Game 2', path: '/game2.js' })
    state.setScore(2000)
    state.setPlayerName('BBB')

    const finalState = state.getState()
    expect(finalState.selectedGame.id).toBe('game2')
    expect(finalState.currentScore).toBe(2000)
    expect(finalState.playerName).toBe('BBB')
  })

  test('subscribe and unsubscribe during session', () => {
    const callback = vi.fn()
    const unsubscribe = state.subscribe(callback)

    state.transition('welcome')
    expect(callback).toHaveBeenCalledTimes(1)

    unsubscribe()

    state.transition('gallery')
    expect(callback).toHaveBeenCalledTimes(1)  // Not called again
  })
})
