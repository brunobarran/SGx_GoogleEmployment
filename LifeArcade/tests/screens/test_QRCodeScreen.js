/**
 * Unit tests for QRCodeScreen.
 * Tests QR code display with auto-timeout to idle.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { QRCodeScreen } from '../../src/screens/QRCodeScreen.js'

describe('QRCodeScreen - Initialization', () => {
  let screen, appState, inputManager

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
        }
      })),
      currentScreen: 'qr'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new QRCodeScreen(appState, inputManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
  })

  test('constructor initializes null element', () => {
    screen = new QRCodeScreen(appState, inputManager)

    expect(screen.element).toBeNull()
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new QRCodeScreen(appState, inputManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })

  test('AUTO_TIMEOUT constant is 15 seconds', () => {
    expect(QRCodeScreen.AUTO_TIMEOUT).toBe(15000)
  })

  test('BASE_URL constant is defined', () => {
    expect(QRCodeScreen.BASE_URL).toBeDefined()
    expect(typeof QRCodeScreen.BASE_URL).toBe('string')
  })
})

describe('QRCodeScreen - Show', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: {
          id: 'space-invaders',
          name: 'Space Invaders'
        }
      })),
      currentScreen: 'qr'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock DOM
    global.document = {
      createElement: vi.fn(() => ({
        id: '',
        innerHTML: '',
        style: { cssText: '' },
        remove: vi.fn(),
        appendChild: vi.fn()
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
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('qr-screen')
  })

  test('show adds element to DOM', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show displays title', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('PLAY ON THE WEB')
  })

  test('show displays game URL', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    const expectedUrl = QRCodeScreen.BASE_URL + 'space-invaders.html'
    expect(screen.element.innerHTML).toContain(expectedUrl)
  })

  test('show generates correct URL for game', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('space-invaders.html')
  })

  test('show displays QR placeholder', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('qr-placeholder')
    expect(screen.element.innerHTML).toContain('QR Code generation available')
  })

  test('show registers key press listener', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show sets auto-advance timeout', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(appState.setTimeout).toHaveBeenCalledWith(
      QRCodeScreen.AUTO_TIMEOUT,
      'idle',
      'qr-timeout'
    )
  })

  test('show adds CSS styles if not present', () => {
    document.getElementById = vi.fn(() => null)
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show skips CSS if already present', () => {
    document.getElementById = vi.fn(() => ({ id: 'qr-screen-styles' }))
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).not.toHaveBeenCalled()
  })

  test('show resets to idle if no game selected', () => {
    appState.getState = vi.fn(() => ({ selectedGame: null }))
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Active (15s auto-advance to Idle)')
  })
})

describe('QRCodeScreen - Hide', () => {
  let screen, appState, inputManager

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
        }
      })),
      currentScreen: 'idle',
      selectedGame: null,
      currentScore: null,
      playerName: null
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
        appendChild: vi.fn()
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide clears auto-advance timeout', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(appState.clearTimeout).toHaveBeenCalledWith('qr-timeout')
  })

  test('hide removes key press listener', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes element from DOM', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide resets app state when transitioning to idle', () => {
    appState.currentScreen = 'idle'
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(appState.selectedGame).toBeNull()
    expect(appState.currentScore).toBeNull()
    expect(appState.playerName).toBeNull()
  })

  test('hide does not reset state for other transitions', () => {
    appState.currentScreen = 'gallery'
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    const originalGame = appState.selectedGame
    screen.hide()

    expect(appState.selectedGame).toBe(originalGame)
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('QRCodeScreen - Key Handling', () => {
  let screen, appState, inputManager

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
        }
      })),
      currentScreen: 'qr'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new QRCodeScreen(appState, inputManager)
  })

  test('handleKeyPress resets on Space', () => {
    screen.handleKeyPress(' ')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress logs Space press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress(' ')

    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Key pressed - returning to Idle')
  })

  test('handleKeyPress logs Escape press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress('Escape')

    expect(logSpy).toHaveBeenCalledWith('QRCodeScreen: Key pressed - returning to Idle')
  })

  test('handleKeyPress ignores other keys', () => {
    screen.handleKeyPress('a')
    screen.handleKeyPress('Enter')
    screen.handleKeyPress('1')

    expect(appState.reset).not.toHaveBeenCalled()
  })

  test('handleKeyPress only responds to Space and Escape', () => {
    const keys = ['ArrowUp', 'ArrowDown', 'Enter', 'a', 'z', '1']

    keys.forEach(key => {
      screen.handleKeyPress(key)
    })

    expect(appState.reset).not.toHaveBeenCalled()
  })
})

describe('QRCodeScreen - URL Generation', () => {
  let screen, appState, inputManager

  beforeEach(() => {
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
        appendChild: vi.fn()
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('show generates URL for space-invaders', () => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'space-invaders', name: 'Space Invaders' }
      }))
    }
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('space-invaders.html')
  })

  test('show generates URL for dino-runner', () => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'dino-runner', name: 'Dino Runner' }
      }))
    }
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('dino-runner.html')
  })

  test('show generates URL for breakout', () => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'breakout', name: 'Breakout' }
      }))
    }
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('breakout.html')
  })

  test('show generates URL for flappy-bird', () => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'flappy-bird', name: 'Flappy Bird' }
      }))
    }
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('flappy-bird.html')
  })

  test('show includes BASE_URL in generated URL', () => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain(QRCodeScreen.BASE_URL)
  })
})

describe('QRCodeScreen - Lifecycle', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' }
      })),
      currentScreen: 'qr'
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
        appendChild: vi.fn()
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', () => {
    screen = new QRCodeScreen(appState, inputManager)

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
    screen = new QRCodeScreen(appState, inputManager)

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
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('show sets timeout, hide clears it', () => {
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()
    expect(appState.setTimeout).toHaveBeenCalledWith(15000, 'idle', 'qr-timeout')

    screen.hide()
    expect(appState.clearTimeout).toHaveBeenCalledWith('qr-timeout')
  })
})

describe('QRCodeScreen - Integration', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'space-invaders', name: 'Space Invaders' }
      })),
      currentScreen: 'qr',
      selectedGame: { id: 'space-invaders', name: 'Space Invaders' },
      currentScore: 5000,
      playerName: 'ACE'
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
        appendChild: vi.fn()
      })),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → display QR → restart → hide', () => {
    screen = new QRCodeScreen(appState, inputManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(screen.element.innerHTML).toContain('PLAY ON THE WEB')
    expect(screen.element.innerHTML).toContain('space-invaders.html')

    // User presses Space to restart
    screen.handleKeyPress(' ')
    expect(appState.reset).toHaveBeenCalled()

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('complete flow with auto-advance timeout to idle', () => {
    screen = new QRCodeScreen(appState, inputManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()

    // Auto-advance timeout set to idle
    expect(appState.setTimeout).toHaveBeenCalledWith(15000, 'idle', 'qr-timeout')

    // Hide screen
    screen.hide()
    expect(appState.clearTimeout).toHaveBeenCalledWith('qr-timeout')
  })

  test('state reset on loop completion', () => {
    appState.currentScreen = 'idle'
    screen = new QRCodeScreen(appState, inputManager)

    screen.show()
    screen.hide()

    // State should be reset when transitioning to idle
    expect(appState.selectedGame).toBeNull()
    expect(appState.currentScore).toBeNull()
    expect(appState.playerName).toBeNull()
  })

  test('QR code display integration', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    // Check QR placeholder elements
    expect(screen.element.innerHTML).toContain('qr-placeholder')
    expect(screen.element.innerHTML).toContain('qr-icon')
    expect(screen.element.innerHTML).toContain('qr-note')

    // Check URL display
    expect(screen.element.innerHTML).toContain('qr-url-box')
    expect(screen.element.innerHTML).toContain('Game URL:')
    expect(screen.element.innerHTML).toContain(QRCodeScreen.BASE_URL + 'space-invaders.html')
  })

  test('footer instructions display', () => {
    screen = new QRCodeScreen(appState, inputManager)
    screen.show()

    expect(screen.element.innerHTML).toContain('qr-footer')
    expect(screen.element.innerHTML).toContain('Scan with your phone')
    expect(screen.element.innerHTML).toContain('Press SPACE to restart')
    expect(screen.element.innerHTML).toContain('Auto-restart in 15s')
  })
})
