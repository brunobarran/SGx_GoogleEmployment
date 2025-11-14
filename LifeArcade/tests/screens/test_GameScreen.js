/**
 * Unit tests for GameScreen.
 * Tests fullscreen iframe container for games with postMessage communication.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { GameScreen } from '../../src/screens/GameScreen.js'

describe('GameScreen - Initialization', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
    expect(screen.iframeComm).toBe(iframeComm)
  })

  test('constructor initializes null elements', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    expect(screen.element).toBeNull()
    expect(screen.iframe).toBeNull()
    expect(screen.gameTimeoutHandle).toBeNull()
    expect(screen.escapeHandler).toBeNull()
  })

  test('constructor binds methods', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
    expect(typeof screen.handleGameOver).toBe('function')
    expect(screen.handleGameOver.name).toBe('bound handleGameOver')
  })

  test('MAX_GAME_TIME constant is 30 minutes', () => {
    expect(GameScreen.MAX_GAME_TIME).toBe(30 * 60 * 1000)
  })
})

describe('GameScreen - Show', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    // Mock DOM
    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'iframe') {
          return {
            src: '',
            tabIndex: 0,
            style: { cssText: '' },
            onload: null,
            focus: vi.fn(),
            click: vi.fn(),
            addEventListener: vi.fn(),
            contentWindow: {
              focus: vi.fn()
            }
          }
        }
        return {
          id: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn()
        }
      }),
      body: {
        appendChild: vi.fn()
      },
      activeElement: null
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.setTimeout = vi.fn((fn, delay) => 123)
    global.clearTimeout = vi.fn()

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
  })

  test('show creates screen element', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('game-screen')
  })

  test('show creates iframe with game path', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(screen.iframe).not.toBeNull()
    expect(screen.iframe.src).toBe('games/test-game.html')
  })

  test('show adds element to DOM', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets iframe styles', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(screen.iframe.style.cssText).toContain('position: fixed')
    expect(screen.iframe.style.cssText).toContain('width: 1200px')
    expect(screen.iframe.style.cssText).toContain('height: 1920px')
  })

  test('show stops InputManager listening', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(inputManager.stopListening).toHaveBeenCalled()
  })

  test('show starts IframeComm listening', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(iframeComm.startListening).toHaveBeenCalledWith(GameScreen.MAX_GAME_TIME)
    expect(iframeComm.onGameOver).toHaveBeenCalledWith(screen.handleGameOver)
  })

  test('show adds native Escape listener', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(window.addEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    expect(screen.escapeHandler).not.toBeNull()
  })

  test('show sets game timeout', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), GameScreen.MAX_GAME_TIME)
    expect(screen.gameTimeoutHandle).not.toBeNull()
  })

  test('show resets to idle if no game selected', () => {
    appState.getState = vi.fn(() => ({ selectedGame: null }))
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('GameScreen: Show')
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Loading Test Game'))
  })

  test('show sets iframe focus on load', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    vi.useFakeTimers()

    screen.show()

    // Trigger onload
    screen.iframe.onload()

    // Advance past focus delay
    vi.advanceTimersByTime(100)

    expect(screen.iframe.focus).toHaveBeenCalled()
    expect(screen.iframe.contentWindow.focus).toHaveBeenCalled()

    vi.useRealTimers()
  })
})

describe('GameScreen - Hide', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'iframe') {
          return {
            src: '',
            tabIndex: 0,
            style: { cssText: '' },
            onload: null,
            focus: vi.fn(),
            click: vi.fn(),
            addEventListener: vi.fn(),
            contentWindow: { focus: vi.fn() }
          }
        }
        return {
          id: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn()
        }
      }),
      body: { appendChild: vi.fn() },
      activeElement: null
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.setTimeout = vi.fn((fn, delay) => 123)
    global.clearTimeout = vi.fn()

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide stops IframeComm listening', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()

    screen.hide()

    expect(iframeComm.stopListening).toHaveBeenCalled()
    expect(iframeComm.offGameOver).toHaveBeenCalledWith(screen.handleGameOver)
  })

  test('hide restarts InputManager listening', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()

    screen.hide()

    expect(inputManager.startListening).toHaveBeenCalled()
  })

  test('hide removes native Escape listener', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()
    const handler = screen.escapeHandler

    screen.hide()

    expect(window.removeEventListener).toHaveBeenCalledWith('keydown', handler)
    expect(screen.escapeHandler).toBeNull()
  })

  test('hide clears game timeout', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()

    const timeoutHandle = screen.gameTimeoutHandle

    screen.hide()

    expect(clearTimeout).toHaveBeenCalledWith(timeoutHandle)
    expect(screen.gameTimeoutHandle).toBeNull()
  })

  test('hide removes element from DOM', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
    expect(screen.iframe).toBeNull()
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('GameScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('GameScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('GameScreen - Game Over Handling', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})

    screen = new GameScreen(appState, inputManager, iframeComm)
  })

  test('handleGameOver stores valid score and transitions', () => {
    screen.handleGameOver(1500)

    expect(appState.setScore).toHaveBeenCalledWith(1500)
    expect(appState.transition).toHaveBeenCalledWith('score')
  })

  test('handleGameOver handles null score (timeout)', () => {
    screen.exitToIdle = vi.fn()

    screen.handleGameOver(null)

    expect(screen.exitToIdle).toHaveBeenCalled()
    expect(appState.setScore).not.toHaveBeenCalled()
  })

  test('handleGameOver handles invalid negative score', () => {
    screen.exitToIdle = vi.fn()

    screen.handleGameOver(-100)

    expect(screen.exitToIdle).toHaveBeenCalled()
    expect(appState.setScore).not.toHaveBeenCalled()
  })

  test('handleGameOver handles non-number score', () => {
    screen.exitToIdle = vi.fn()

    screen.handleGameOver('not a number')

    expect(screen.exitToIdle).toHaveBeenCalled()
    expect(appState.setScore).not.toHaveBeenCalled()
  })

  test('handleGameOver logs received score', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleGameOver(2500)

    expect(logSpy).toHaveBeenCalledWith('GameScreen: Game Over received, score:', 2500)
  })

  test('exitToIdle resets app state', () => {
    screen.exitToIdle()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('exitToIdle logs exit', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.exitToIdle()

    expect(logSpy).toHaveBeenCalledWith('GameScreen: Exiting to Idle')
  })
})

describe('GameScreen - Key Handling', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new GameScreen(appState, inputManager, iframeComm)
    screen.exitToIdle = vi.fn()
  })

  test('handleKeyPress exits on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(screen.exitToIdle).toHaveBeenCalled()
  })

  test('handleKeyPress logs Escape press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress('Escape')

    expect(logSpy).toHaveBeenCalledWith('GameScreen: Escape pressed - exiting to Idle')
  })

  test('handleKeyPress ignores other keys', () => {
    screen.handleKeyPress(' ')
    screen.handleKeyPress('Enter')
    screen.handleKeyPress('a')

    expect(screen.exitToIdle).not.toHaveBeenCalled()
  })
})

describe('GameScreen - Lifecycle', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'iframe') {
          return {
            src: '',
            tabIndex: 0,
            style: { cssText: '' },
            onload: null,
            focus: vi.fn(),
            click: vi.fn(),
            addEventListener: vi.fn(),
            contentWindow: { focus: vi.fn() }
          }
        }
        return {
          id: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn()
        }
      }),
      body: { appendChild: vi.fn() },
      activeElement: null
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.setTimeout = vi.fn((fn, delay) => 123)
    global.clearTimeout = vi.fn()

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    // Show
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(screen.iframe).not.toBeNull()
    expect(inputManager.stopListening).toHaveBeenCalled()

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
    expect(screen.iframe).toBeNull()
    expect(inputManager.startListening).toHaveBeenCalled()
  })

  test('multiple show-hide cycles', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    // Cycle 1
    screen.show()
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(inputManager.stopListening).toHaveBeenCalledTimes(2)

    screen.hide()
    expect(inputManager.startListening).toHaveBeenCalledTimes(2)
  })

  test('show disables input, hide re-enables', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    screen.show()
    expect(inputManager.stopListening).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.startListening).toHaveBeenCalledTimes(1)
  })
})

describe('GameScreen - Integration', () => {
  let screen, appState, inputManager, iframeComm

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setScore: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'test-game',
          name: 'Test Game',
          path: 'games/test-game.html'
        }
      })),
      currentScreen: 'game'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn(),
      stopListening: vi.fn(),
      startListening: vi.fn()
    }

    iframeComm = {
      onGameOver: vi.fn(),
      offGameOver: vi.fn(),
      startListening: vi.fn(),
      stopListening: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => {
        if (tag === 'iframe') {
          return {
            src: '',
            tabIndex: 0,
            style: { cssText: '' },
            onload: null,
            focus: vi.fn(),
            click: vi.fn(),
            addEventListener: vi.fn(),
            contentWindow: { focus: vi.fn() }
          }
        }
        return {
          id: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn()
        }
      }),
      body: { appendChild: vi.fn() },
      activeElement: null
    }

    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    global.setTimeout = vi.fn((fn, delay) => 123)
    global.clearTimeout = vi.fn()

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → game over → score entry', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    // Show screen
    screen.show()
    expect(screen.iframe).not.toBeNull()
    expect(iframeComm.onGameOver).toHaveBeenCalled()

    // Game ends
    screen.handleGameOver(5000)
    expect(appState.setScore).toHaveBeenCalledWith(5000)
    expect(appState.transition).toHaveBeenCalledWith('score')

    // Hide screen
    screen.hide()
    expect(screen.iframe).toBeNull()
  })

  test('screen flow: show → escape → idle', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    // Show screen
    screen.show()
    expect(screen.iframe).not.toBeNull()

    // User escapes
    screen.handleKeyPress('Escape')
    expect(appState.reset).toHaveBeenCalled()

    // Hide screen
    screen.hide()
  })

  test('input manager handoff', () => {
    screen = new GameScreen(appState, inputManager, iframeComm)

    // Before show: input manager active
    expect(inputManager.stopListening).not.toHaveBeenCalled()

    // Show: input manager disabled for iframe
    screen.show()
    expect(inputManager.stopListening).toHaveBeenCalled()

    // Hide: input manager re-enabled
    screen.hide()
    expect(inputManager.startListening).toHaveBeenCalled()
  })
})
