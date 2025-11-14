/**
 * Unit tests for WelcomeScreen.
 * Tests welcome/title screen with "Press SPACE to start".
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { WelcomeScreen } from '../../src/screens/WelcomeScreen.js'

describe('WelcomeScreen - Initialization', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new WelcomeScreen(appState, inputManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
  })

  test('constructor initializes null element', () => {
    screen = new WelcomeScreen(appState, inputManager)

    expect(screen.element).toBeNull()
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new WelcomeScreen(appState, inputManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })
})

describe('WelcomeScreen - Show', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn()
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
          appendChild: vi.fn()
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

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
  })

  test('show creates screen element', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('welcome-screen')
  })

  test('show adds element to DOM', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show creates title content', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('GAME OF LIFE ARCADE')
    expect(screen.element.innerHTML).toContain('Press SPACE to start')
  })

  test('show registers key press listener', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show adds CSS styles if not present', () => {
    document.getElementById = vi.fn(() => null)
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show skips CSS if already present', () => {
    document.getElementById = vi.fn(() => ({ id: 'welcome-screen-styles' }))
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).not.toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Active')
  })
})

describe('WelcomeScreen - Hide', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => ({
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
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide removes key press listener', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes element from DOM', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('WelcomeScreen - Key Handling', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new WelcomeScreen(appState, inputManager)
  })

  test('handleKeyPress transitions on Space', () => {
    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('gallery')
  })

  test('handleKeyPress logs Space press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress(' ')

    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Space pressed - advancing to Gallery')
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress logs Escape press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress('Escape')

    expect(logSpy).toHaveBeenCalledWith('WelcomeScreen: Escape pressed - returning to Idle')
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

describe('WelcomeScreen - Lifecycle', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => ({
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
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', () => {
    screen = new WelcomeScreen(appState, inputManager)

    // Show
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('multiple show-hide cycles', () => {
    screen = new WelcomeScreen(appState, inputManager)

    // Cycle 1
    screen.show()
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(2)

    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('show registers listener, hide unregisters', () => {
    screen = new WelcomeScreen(appState, inputManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('Space advances to gallery during active state', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('gallery')
  })

  test('Escape resets to idle during active state', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })
})

describe('WelcomeScreen - Integration', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      currentScreen: 'welcome'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    global.document = {
      createElement: vi.fn((tag) => ({
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
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → keypress → hide', () => {
    screen = new WelcomeScreen(appState, inputManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()

    // User presses Space
    screen.handleKeyPress(' ')
    expect(appState.transition).toHaveBeenCalledWith('gallery')

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('DOM structure integration', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    // Check DOM elements
    expect(screen.element.id).toBe('welcome-screen')
    expect(screen.element.innerHTML).toContain('welcome-container')
    expect(screen.element.innerHTML).toContain('welcome-title')
    expect(screen.element.innerHTML).toContain('welcome-subtitle')
    expect(screen.element.innerHTML).toContain('welcome-prompt')
  })

  test('style application integration', () => {
    screen = new WelcomeScreen(appState, inputManager)
    screen.show()

    // Check styles
    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('z-index: 100')
    expect(screen.element.style.cssText).toContain('animation: fadeIn')
  })
})
