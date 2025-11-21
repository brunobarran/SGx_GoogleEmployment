/**
 * Unit tests for IdleScreen (v2 - DOM based with Showcase integration)
 * Tests idle screen with showcase timer
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { IdleScreen } from '../../src/screens/IdleScreen.js'

describe('IdleScreen - Initialization', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
  })

  test('constructor initializes with dependencies', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
    expect(screen.storageManager).toBe(storageManager)
  })

  test('constructor initializes null/false state', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    expect(screen.element).toBeNull()
    expect(screen.titleElement).toBeNull()
    expect(screen.promptElement).toBeNull()
    expect(screen.isActive).toBe(false)
    expect(screen.showcaseScreen).toBeNull()
    expect(screen.showcaseTimerHandle).toBeNull()
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })
})

describe('IdleScreen - Show', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
    vi.restoreAllMocks()
  })

  test('show() sets isActive to true', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.isActive).toBe(true)
  })

  test('show() creates DOM element', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()

    const element = document.getElementById('idle-screen')
    expect(element).not.toBeNull()
    expect(screen.element).not.toBeNull()
  })

  test('show() creates title and prompt elements', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.titleElement).not.toBeNull()
    expect(screen.promptElement).not.toBeNull()
    expect(screen.titleElement.textContent).toContain("Conway's")
    expect(screen.promptElement.textContent).toBe('Press any key to start')
  })

  test('show() registers key press listener', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show() starts showcase timer (2 minutes)', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.showcaseTimerHandle).not.toBeNull()
  })
})

describe('IdleScreen - Hide', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('hide() sets isActive to false', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(screen.isActive).toBe(false)
  })

  test('hide() removes key press listener', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide() removes DOM element', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    const element = document.getElementById('idle-screen')
    expect(element).toBeNull()
    expect(screen.element).toBeNull()
  })

  test('hide() clears DOM references', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(screen.element).toBeNull()
    expect(screen.titleElement).toBeNull()
    expect(screen.promptElement).toBeNull()
  })

  test('hide() clears showcase timer', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()
    expect(screen.showcaseTimerHandle).not.toBeNull()

    screen.hide()

    expect(screen.showcaseTimerHandle).toBeNull()
  })

  test('hide() closes showcase if active', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    // Manually create showcase mock
    const mockShowcase = {
      hide: vi.fn(),
      isActive: true
    }
    screen.showcaseScreen = mockShowcase

    screen.hide()

    expect(mockShowcase.hide).toHaveBeenCalled()
    expect(screen.showcaseScreen).toBeNull()
  })
})

describe('IdleScreen - Key Handling', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
    vi.useFakeTimers()
    screen = new IdleScreen(appState, inputManager, storageManager)
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
    vi.restoreAllMocks()
  })

  test('handleKeyPress() transitions to welcome on any key', () => {
    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('handleKeyPress() transitions on Enter', () => {
    screen.handleKeyPress('Enter')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('handleKeyPress() transitions on ArrowUp', () => {
    screen.handleKeyPress('ArrowUp')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('handleKeyPress() does not transition when showcase is active', () => {
    screen.show()

    screen.showcaseScreen = {
      isActive: true,
      hide: vi.fn()  // Add mock hide method to avoid errors in hide()
    }

    screen.handleKeyPress(' ')

    expect(appState.transition).not.toHaveBeenCalled()
  })

  test('handleKeyPress() restarts showcase timer on key press', () => {
    screen.show()
    const initialTimer = screen.showcaseTimerHandle

    screen.handleKeyPress(' ')

    // Timer should be restarted (different handle)
    expect(screen.showcaseTimerHandle).not.toBe(initialTimer)
  })
})

describe('IdleScreen - Showcase Integration', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
    vi.restoreAllMocks()
  })

  test('showcase timer triggers after 2 minutes', () => {
    storageManager.getScores.mockImplementation((gameId) => {
      if (gameId === 'dino-runner') {
        return [{ name: 'AAA', score: 1000, date: '2025-01-01' }]
      }
      return []
    })

    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    expect(screen.showcaseScreen).toBeNull()

    // Fast-forward 2 minutes
    vi.advanceTimersByTime(120000)

    expect(screen.showcaseScreen).not.toBeNull()
  })

  test('showcase timer does not trigger before 2 minutes', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    // Fast-forward 1 minute (not enough)
    vi.advanceTimersByTime(60000)

    expect(screen.showcaseScreen).toBeNull()
  })

  test('onShowcaseClosed() clears showcase and restarts timer', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.showcaseScreen = {
      isActive: false
    }

    const initialTimer = screen.showcaseTimerHandle

    screen.onShowcaseClosed()

    expect(screen.showcaseScreen).toBeNull()
    expect(screen.showcaseTimerHandle).not.toBe(initialTimer)
  })

  test('startShowcaseTimer() clears existing timer before creating new one', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    const initialTimer = screen.showcaseTimerHandle

    screen.startShowcaseTimer()

    expect(screen.showcaseTimerHandle).not.toBe(initialTimer)
  })
})

describe('IdleScreen - Lifecycle', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      getScores: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    document.body.innerHTML = ''
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  test('complete show-hide cycle', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    // Show
    screen.show()
    expect(screen.isActive).toBe(true)
    expect(screen.element).not.toBeNull()
    expect(document.getElementById('idle-screen')).not.toBeNull()

    // Hide
    screen.hide()
    expect(screen.isActive).toBe(false)
    expect(screen.element).toBeNull()
    expect(document.getElementById('idle-screen')).toBeNull()
  })

  test('multiple show-hide cycles', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    // Cycle 1
    screen.show()
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.isActive).toBe(true)
    expect(screen.element).not.toBeNull()

    screen.hide()
    expect(screen.isActive).toBe(false)
  })

  test('show registers listener, hide unregisters', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('key press advances to welcome during active state', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()

    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('key press after hide does not break', () => {
    screen = new IdleScreen(appState, inputManager, storageManager)
    screen.show()
    screen.hide()

    expect(() => {
      screen.handleKeyPress(' ')
    }).not.toThrow()
  })
})
