/**
 * Unit tests for IdleScreen.
 * Tests idle/attract screen with GoL background.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { IdleScreen } from '../../src/screens/IdleScreen.js'

describe('IdleScreen - Initialization', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new IdleScreen(appState, inputManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
  })

  test('constructor initializes null state', () => {
    screen = new IdleScreen(appState, inputManager)

    expect(screen.p5Instance).toBeNull()
    expect(screen.golBackground).toBeNull()
    expect(screen.frameCount).toBe(0)
    expect(screen.isActive).toBe(false)
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new IdleScreen(appState, inputManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })
})

describe('IdleScreen - Show', () => {
  let screen, appState, inputManager, p5MockInstance, p5Constructor

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    // Mock p5.js instance
    p5MockInstance = {
      setup: null,
      draw: null,
      windowHeight: 1920,
      windowWidth: 1200,
      width: 1200,
      height: 1920,
      frameCount: 0,
      createCanvas: vi.fn(() => ({
        style: vi.fn()
      })),
      frameRate: vi.fn(),
      background: vi.fn(),
      noLoop: vi.fn(),
      remove: vi.fn()
    }

    // Mock p5 constructor
    p5Constructor = vi.fn((sketchFn) => {
      sketchFn(p5MockInstance)
      return p5MockInstance
    })

    global.p5 = p5Constructor

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
  })

  test('show sets isActive to true', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(screen.isActive).toBe(true)
  })

  test('show creates p5 instance', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(p5Constructor).toHaveBeenCalled()
    expect(screen.p5Instance).not.toBeNull()
  })

  test('show registers key press listener', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('p5 setup creates canvas with correct aspect ratio', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(p5MockInstance.createCanvas).toHaveBeenCalled()
    const [width, height] = p5MockInstance.createCanvas.mock.calls[0]

    // Check aspect ratio (1200:1920 = 0.625)
    const aspectRatio = width / height
    expect(aspectRatio).toBeCloseTo(0.625, 2)
  })

  test('p5 setup sets frame rate to 60', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(p5MockInstance.frameRate).toHaveBeenCalledWith(60)
  })

  test('p5 setup creates GoL background', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(screen.golBackground).not.toBeNull()
  })

  test('p5 setup logs completion', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new IdleScreen(appState, inputManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('IdleScreen: p5.js setup complete')
  })
})

describe('IdleScreen - Hide', () => {
  let screen, appState, inputManager, p5MockInstance, p5Constructor

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    p5MockInstance = {
      setup: null,
      draw: null,
      windowHeight: 1920,
      width: 1200,
      createCanvas: vi.fn(() => ({
        style: vi.fn()
      })),
      frameRate: vi.fn(),
      background: vi.fn(),
      noLoop: vi.fn(),
      remove: vi.fn()
    }

    p5Constructor = vi.fn((sketchFn) => {
      sketchFn(p5MockInstance)
      return p5MockInstance
    })

    global.p5 = p5Constructor

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('hide sets isActive to false', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(screen.isActive).toBe(false)
  })

  test('hide removes key press listener', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes p5 instance', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(p5MockInstance.remove).toHaveBeenCalled()
    expect(screen.p5Instance).toBeNull()
  })

  test('hide clears golBackground reference', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(screen.golBackground).toBeNull()
  })

  test('hide resets frameCount', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.frameCount = 100

    screen.hide()

    expect(screen.frameCount).toBe(0)
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('IdleScreen: Cleaned up')
  })

  test('hide handles null p5Instance gracefully', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.p5Instance = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('IdleScreen - Key Handling', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new IdleScreen(appState, inputManager)
  })

  test('handleKeyPress transitions on Space', () => {
    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('handleKeyPress logs Space press', () => {
    const logSpy = vi.spyOn(console, 'log')

    screen.handleKeyPress(' ')

    expect(logSpy).toHaveBeenCalledWith('IdleScreen: Space pressed - advancing to Welcome')
  })

  test('handleKeyPress ignores other keys', () => {
    screen.handleKeyPress('a')
    screen.handleKeyPress('Enter')
    screen.handleKeyPress('Escape')

    expect(appState.transition).not.toHaveBeenCalled()
  })

  test('handleKeyPress only responds to Space', () => {
    const keys = ['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'a', 'z', '1']

    keys.forEach(key => {
      screen.handleKeyPress(key)
    })

    expect(appState.transition).not.toHaveBeenCalled()
  })
})

describe('IdleScreen - Animation Loop', () => {
  let screen, appState, inputManager, p5MockInstance, p5Constructor

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    p5MockInstance = {
      setup: null,
      draw: null,
      windowHeight: 1920,
      width: 1200,
      createCanvas: vi.fn(() => ({
        style: vi.fn()
      })),
      frameRate: vi.fn(),
      background: vi.fn(),
      noLoop: vi.fn(),
      remove: vi.fn()
    }

    p5Constructor = vi.fn((sketchFn) => {
      sketchFn(p5MockInstance)
      return p5MockInstance
    })

    global.p5 = p5Constructor

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (screen) {
      screen.hide()
    }
  })

  test('draw stops loop when not active', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.isActive = false

    p5MockInstance.draw()

    expect(p5MockInstance.noLoop).toHaveBeenCalled()
  })

  test('draw increments frameCount', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    const initialCount = screen.frameCount

    p5MockInstance.draw()

    expect(screen.frameCount).toBe(initialCount + 1)
  })

  test('draw clears background to white', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    p5MockInstance.draw()

    expect(p5MockInstance.background).toHaveBeenCalledWith(255)
  })

  test('draw updates GoL background', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.golBackground.update = vi.fn()

    p5MockInstance.draw()

    expect(screen.golBackground.update).toHaveBeenCalled()
  })

  test('draw renders GoL background', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.golBackground.render = vi.fn()

    p5MockInstance.draw()

    expect(screen.golBackground.render).toHaveBeenCalled()
  })

  test('draw calculates dynamic cell size', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.golBackground.render = vi.fn()

    p5MockInstance.draw()

    const renderCall = screen.golBackground.render.mock.calls[0]
    const cellSize = renderCall[2]

    // cellSize should be width / 40
    expect(cellSize).toBe(p5MockInstance.width / 40)
  })
})

describe('IdleScreen - Lifecycle', () => {
  let screen, appState, inputManager, p5MockInstance, p5Constructor

  beforeEach(() => {
    appState = {
      transition: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    p5MockInstance = {
      setup: null,
      draw: null,
      windowHeight: 1920,
      width: 1200,
      createCanvas: vi.fn(() => ({
        style: vi.fn()
      })),
      frameRate: vi.fn(),
      background: vi.fn(),
      noLoop: vi.fn(),
      remove: vi.fn()
    }

    p5Constructor = vi.fn((sketchFn) => {
      sketchFn(p5MockInstance)
      return p5MockInstance
    })

    global.p5 = p5Constructor

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('complete show-hide cycle', () => {
    screen = new IdleScreen(appState, inputManager)

    // Show
    screen.show()
    expect(screen.isActive).toBe(true)
    expect(screen.p5Instance).not.toBeNull()
    expect(screen.golBackground).not.toBeNull()

    // Hide
    screen.hide()
    expect(screen.isActive).toBe(false)
    expect(screen.p5Instance).toBeNull()
    expect(screen.golBackground).toBeNull()
    expect(screen.frameCount).toBe(0)
  })

  test('multiple show-hide cycles', () => {
    screen = new IdleScreen(appState, inputManager)

    // Cycle 1
    screen.show()
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.isActive).toBe(true)
    expect(screen.p5Instance).not.toBeNull()

    screen.hide()
    expect(screen.isActive).toBe(false)
  })

  test('show registers listener, hide unregisters', () => {
    screen = new IdleScreen(appState, inputManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })

  test('Space advances to welcome during active state', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    screen.handleKeyPress(' ')

    expect(appState.transition).toHaveBeenCalledWith('welcome')
  })

  test('Space after hide does not break', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()
    screen.hide()

    // Should still work (just won't advance since screen is hidden)
    expect(() => {
      screen.handleKeyPress(' ')
    }).not.toThrow()
  })
})

describe('IdleScreen - Integration', () => {
  let screen, appState, inputManager, p5MockInstance, p5Constructor

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      currentScreen: 'idle'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    p5MockInstance = {
      setup: null,
      draw: null,
      windowHeight: 1920,
      width: 1200,
      createCanvas: vi.fn(() => ({
        style: vi.fn()
      })),
      frameRate: vi.fn(),
      background: vi.fn(),
      noLoop: vi.fn(),
      remove: vi.fn()
    }

    p5Constructor = vi.fn((sketchFn) => {
      sketchFn(p5MockInstance)
      return p5MockInstance
    })

    global.p5 = p5Constructor

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('screen flow: show → animate → keypress → hide', () => {
    screen = new IdleScreen(appState, inputManager)

    // Show screen
    screen.show()
    expect(screen.isActive).toBe(true)

    // Simulate animation frames
    p5MockInstance.draw()
    p5MockInstance.draw()
    p5MockInstance.draw()
    expect(screen.frameCount).toBe(3)

    // User presses Space
    screen.handleKeyPress(' ')
    expect(appState.transition).toHaveBeenCalledWith('welcome')

    // Hide screen
    screen.hide()
    expect(screen.isActive).toBe(false)
    expect(screen.frameCount).toBe(0)
  })

  test('GoL background integration', () => {
    screen = new IdleScreen(appState, inputManager)
    screen.show()

    // Check GoL background was created with correct config
    expect(screen.golBackground).not.toBeNull()

    // Simulate frames
    screen.golBackground.update = vi.fn()
    screen.golBackground.render = vi.fn()

    for (let i = 0; i < 60; i++) {
      p5MockInstance.draw()
    }

    // Should have updated 60 times
    expect(screen.golBackground.update).toHaveBeenCalledTimes(60)
    expect(screen.golBackground.render).toHaveBeenCalledTimes(60)
  })
})
