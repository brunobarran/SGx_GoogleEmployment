/**
 * Unit tests for CodeAnimationScreen.
 * Tests code animation with typewriter effect.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { CodeAnimationScreen } from '../../src/screens/CodeAnimationScreen.js'

describe('CodeAnimationScreen - Initialization', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
  })

  test('constructor initializes null element', () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    expect(screen.element).toBeNull()
  })

  test('constructor initializes animation state', () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    expect(screen.currentText).toBe('')
    expect(screen.targetText).toBe('')
    expect(screen.currentChar).toBe(0)
    expect(screen.intervalHandle).toBeNull()
    expect(screen.timeoutHandle).toBeNull()
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })
})

describe('CodeAnimationScreen - Show', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock DOM
    global.document = {
      createElement: vi.fn((tag) => {
        const element = {
          id: '',
          innerHTML: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn(),
          querySelector: vi.fn(() => ({
            textContent: '',
            scrollTop: 0,
            scrollHeight: 100
          }))
        }
        return element
      }),
      body: {
        appendChild: vi.fn()
      },
      head: {
        appendChild: vi.fn()
      },
      getElementById: vi.fn()
    }

    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('// Test game code\nfunction gameLoop() {\n  // Implementation\n}')
      })
    )

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
    vi.clearAllTimers()
  })

  test('show creates screen element', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('code-screen')
  })

  test('show fetches game code', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(global.fetch).toHaveBeenCalledWith('games/game-wrapper.js?game=test-game')
  })

  test('show handles fetch error gracefully', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('Network error')))
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(screen.targetText).toContain('Error loading game code')
  })

  test('show handles non-ok response', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: false,
        text: () => Promise.resolve('')
      })
    )
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(screen.targetText).toContain('Error loading game code')
  })

  test('show adds element to DOM', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show registers key press listener', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show starts typewriter animation', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.startTypewriter = vi.fn()

    await screen.show()

    expect(screen.startTypewriter).toHaveBeenCalled()
  })

  test('show adds CSS styles if not present', async () => {
    document.getElementById = vi.fn(() => null)
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show resets to idle if no game selected', async () => {
    appState.getState = vi.fn(() => ({ selectedGame: null }))
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show logs activation', async () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Active')
  })
})

describe('CodeAnimationScreen - Hide', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
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
        querySelector: vi.fn(() => ({
          textContent: '',
          scrollTop: 0,
          scrollHeight: 100
        }))
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('// Test code')
      })
    )

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide removes key press listener', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide clears interval', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()
    screen.intervalHandle = setInterval(() => {}, 10)

    screen.hide()

    expect(screen.intervalHandle).toBeNull()
  })

  test('hide clears timeout', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()
    screen.timeoutHandle = setTimeout(() => {}, 1000)

    screen.hide()

    expect(screen.timeoutHandle).toBeNull()
  })

  test('hide removes element from DOM', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide resets animation state', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()
    screen.currentText = 'test'
    screen.currentChar = 5

    screen.hide()

    expect(screen.currentText).toBe('')
    expect(screen.targetText).toBe('')
    expect(screen.currentChar).toBe(0)
  })

  test('hide logs cleanup', async () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new CodeAnimationScreen(appState, inputManager)
    await screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('CodeAnimationScreen - Key Handling', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.advanceToGame = vi.fn()
  })

  test('handleKeyPress advances on Space', () => {
    screen.handleKeyPress(' ')

    expect(screen.advanceToGame).toHaveBeenCalled()
  })

  test('handleKeyPress logs Space press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress(' ')

    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Space pressed - skipping animation')
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress logs Escape press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress('Escape')

    expect(logSpy).toHaveBeenCalledWith('CodeAnimationScreen: Escape pressed - returning to Idle')
  })

  test('handleKeyPress ignores other keys', () => {
    screen.handleKeyPress('a')
    screen.handleKeyPress('Enter')

    expect(screen.advanceToGame).not.toHaveBeenCalled()
    expect(appState.reset).not.toHaveBeenCalled()
  })

  test('advanceToGame transitions to game screen', () => {
    screen.advanceToGame = CodeAnimationScreen.prototype.advanceToGame

    screen.advanceToGame()

    expect(appState.transition).toHaveBeenCalledWith('game')
  })
})

describe('CodeAnimationScreen - Typewriter', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
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
        querySelector: vi.fn(() => ({
          textContent: '',
          scrollTop: 0,
          scrollHeight: 100
        }))
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  test('startTypewriter initializes state', () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.targetText = 'test code'

    screen.startTypewriter()

    expect(screen.currentChar).toBe(0)
    expect(screen.currentText).toBe('')
    expect(screen.intervalHandle).not.toBeNull()
  })

  test('startTypewriter creates interval', () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.targetText = 'test'
    screen.element = {
      querySelector: vi.fn(() => ({
        textContent: '',
        scrollTop: 0,
        scrollHeight: 100
      })),
      remove: vi.fn()
    }

    screen.startTypewriter()

    expect(screen.intervalHandle).not.toBeNull()
  })

  test('startTypewriter updates text incrementally', () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.targetText = 'abc'
    screen.element = {
      querySelector: vi.fn(() => ({
        textContent: '',
        scrollTop: 0,
        scrollHeight: 100
      })),
      remove: vi.fn()
    }

    screen.startTypewriter()

    // Advance 1 character
    vi.advanceTimersByTime(10)
    expect(screen.currentText).toBe('a')
    expect(screen.currentChar).toBe(1)

    // Advance 2 more characters
    vi.advanceTimersByTime(20)
    expect(screen.currentText).toBe('abc')
    expect(screen.currentChar).toBe(3)
  })

  test('startTypewriter sets timeout when complete', () => {
    screen = new CodeAnimationScreen(appState, inputManager)
    screen.targetText = 'ab'
    screen.element = {
      querySelector: vi.fn(() => ({
        textContent: '',
        scrollTop: 0,
        scrollHeight: 100
      })),
      remove: vi.fn()
    }
    screen.advanceToGame = vi.fn()

    screen.startTypewriter()

    // Complete animation
    vi.advanceTimersByTime(30)
    expect(screen.intervalHandle).toBeNull()

    // Wait for auto-advance timeout
    vi.advanceTimersByTime(2000)
    expect(screen.advanceToGame).toHaveBeenCalled()
  })
})

describe('CodeAnimationScreen - Lifecycle', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
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
        querySelector: vi.fn(() => ({
          textContent: '',
          scrollTop: 0,
          scrollHeight: 100
        }))
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('// Test code')
      })
    )

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    // Show
    await screen.show()
    expect(screen.element).not.toBeNull()
    expect(screen.targetText).not.toBe('')

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
    expect(screen.currentText).toBe('')
    expect(screen.targetText).toBe('')
  })

  test('multiple show-hide cycles', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    // Cycle 1
    await screen.show()
    screen.hide()

    // Cycle 2
    await screen.show()
    expect(screen.element).not.toBeNull()

    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('show registers listener, hide unregisters', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })
})

describe('CodeAnimationScreen - Integration', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/game-wrapper.html?game=test-game'
        }
      })),
      currentScreen: 'code'
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
        querySelector: vi.fn(() => ({
          textContent: '',
          scrollTop: 0,
          scrollHeight: 100
        }))
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        text: () => Promise.resolve('// Test game code')
      })
    )

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → fetch → animate → skip → transition', async () => {
    screen = new CodeAnimationScreen(appState, inputManager)

    // Show screen
    await screen.show()
    expect(screen.element).not.toBeNull()
    expect(global.fetch).toHaveBeenCalled()

    // Skip animation
    screen.handleKeyPress(' ')
    expect(appState.transition).toHaveBeenCalledWith('game')

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('full animation completion flow', async () => {
    vi.useFakeTimers()
    screen = new CodeAnimationScreen(appState, inputManager)

    await screen.show()

    // Let animation complete
    screen.targetText = 'ab'
    screen.startTypewriter()
    vi.advanceTimersByTime(30)

    // Wait for auto-advance
    vi.advanceTimersByTime(2000)
    expect(appState.transition).toHaveBeenCalledWith('game')

    vi.useRealTimers()
  })
})
