/**
 * Unit tests for GalleryScreen.
 * Tests game selection gallery with 2x4 grid navigation.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { GalleryScreen } from '../../src/screens/GalleryScreen.js'

describe('GalleryScreen - Initialization', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new GalleryScreen(appState, inputManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
  })

  test('constructor initializes null element', () => {
    screen = new GalleryScreen(appState, inputManager)

    expect(screen.element).toBeNull()
  })

  test('constructor initializes selectedIndex to 0', () => {
    screen = new GalleryScreen(appState, inputManager)

    expect(screen.selectedIndex).toBe(0)
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new GalleryScreen(appState, inputManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })

  test('GAMES static property contains 4 games', () => {
    expect(GalleryScreen.GAMES).toHaveLength(4)
  })

  test('GAMES contains required properties', () => {
    GalleryScreen.GAMES.forEach(game => {
      expect(game).toHaveProperty('id')
      expect(game).toHaveProperty('name')
      expect(game).toHaveProperty('description')
      expect(game).toHaveProperty('path')
      expect(game).toHaveProperty('key')
    })
  })
})

describe('GalleryScreen - Show', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
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
          querySelectorAll: vi.fn(() => [])
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
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('gallery-screen')
  })

  test('show adds element to DOM', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show creates gallery grid content', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('SELECT GAME')
    expect(screen.element.innerHTML).toContain('gallery-grid')
    expect(screen.element.innerHTML).toContain('gallery-item')
  })

  test('show creates all game items', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    GalleryScreen.GAMES.forEach(game => {
      expect(screen.element.innerHTML).toContain(game.name)
      expect(screen.element.innerHTML).toContain(game.description)
      expect(screen.element.innerHTML).toContain(game.key)
    })
  })

  test('show marks first item as selected', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('selected')
    expect(screen.element.innerHTML).toContain('data-index="0"')
  })

  test('show registers key press listener', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show adds CSS styles if not present', () => {
    document.getElementById = vi.fn(() => null)
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show skips CSS if already present', () => {
    document.getElementById = vi.fn(() => ({ id: 'gallery-screen-styles' }))
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(document.head.appendChild).not.toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new GalleryScreen(appState, inputManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('GalleryScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('GalleryScreen: Active')
  })
})

describe('GalleryScreen - Hide', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
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
    screen = new GalleryScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes element from DOM', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new GalleryScreen(appState, inputManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('GalleryScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('GalleryScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('GalleryScreen - Key Handling', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new GalleryScreen(appState, inputManager)
    screen.updateSelection = vi.fn()
  })

  test('handleKeyPress selects game with number key 1', () => {
    screen.handleKeyPress('1')

    expect(screen.selectedIndex).toBe(0)
    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[0])
    expect(appState.transition).toHaveBeenCalledWith('code')
  })

  test('handleKeyPress selects game with number key 2', () => {
    screen.handleKeyPress('2')

    expect(screen.selectedIndex).toBe(1)
    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[1])
    expect(appState.transition).toHaveBeenCalledWith('code')
  })

  test('handleKeyPress navigates up with ArrowUp', () => {
    screen.selectedIndex = 2
    screen.handleKeyPress('ArrowUp')

    expect(screen.selectedIndex).toBe(0)
    expect(screen.updateSelection).toHaveBeenCalled()
  })

  test('handleKeyPress navigates down with ArrowDown', () => {
    screen.selectedIndex = 0
    screen.handleKeyPress('ArrowDown')

    expect(screen.selectedIndex).toBe(2)
    expect(screen.updateSelection).toHaveBeenCalled()
  })

  test('handleKeyPress navigates left with ArrowLeft', () => {
    screen.selectedIndex = 1
    screen.handleKeyPress('ArrowLeft')

    expect(screen.selectedIndex).toBe(0)
    expect(screen.updateSelection).toHaveBeenCalled()
  })

  test('handleKeyPress navigates right with ArrowRight', () => {
    screen.selectedIndex = 0
    screen.handleKeyPress('ArrowRight')

    expect(screen.selectedIndex).toBe(1)
    expect(screen.updateSelection).toHaveBeenCalled()
  })

  test('handleKeyPress confirms selection with Space', () => {
    screen.selectedIndex = 2
    screen.handleKeyPress(' ')

    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[2])
    expect(appState.transition).toHaveBeenCalledWith('code')
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress prevents navigation beyond bounds', () => {
    screen.selectedIndex = 0
    screen.handleKeyPress('ArrowUp')

    expect(screen.selectedIndex).toBe(0)
  })

  test('handleKeyPress prevents right navigation at end', () => {
    screen.selectedIndex = 3
    screen.handleKeyPress('ArrowRight')

    expect(screen.selectedIndex).toBe(3)
  })
})

describe('GalleryScreen - Selection', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    global.document = {
      createElement: vi.fn(() => {
        // Cache the gallery items so querySelectorAll returns the same instances
        const galleryItems = Array(4).fill(null).map((_, index) => {
          const classes = new Set()
          if (index === 0) classes.add('selected') // First item starts selected
          return {
            classList: {
              add: (className) => classes.add(className),
              remove: (className) => classes.delete(className),
              contains: (className) => classes.has(className)
            }
          }
        })

        return {
          id: '',
          innerHTML: '',
          style: { cssText: '' },
          remove: vi.fn(),
          appendChild: vi.fn(),
          querySelectorAll: vi.fn(() => galleryItems)
        }
      }),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('selectGame updates selectedIndex', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.updateSelection = vi.fn()

    screen.selectGame(2)

    expect(screen.selectedIndex).toBe(2)
    expect(screen.updateSelection).toHaveBeenCalled()
  })

  test('updateSelection updates visual classes', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.show()
    screen.selectedIndex = 1

    screen.updateSelection()

    const items = screen.element.querySelectorAll('.gallery-item')
    // Check that the selected item has the 'selected' class
    expect(items[1].classList.contains('selected')).toBe(true)
    // Check that other items don't have the 'selected' class
    expect(items[0].classList.contains('selected')).toBe(false)
    expect(items[2].classList.contains('selected')).toBe(false)
  })

  test('confirmSelection stores game and transitions', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.selectedIndex = 1

    screen.confirmSelection()

    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[1])
    expect(appState.transition).toHaveBeenCalledWith('code')
  })

  test('confirmSelection logs selection', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new GalleryScreen(appState, inputManager)
    screen.selectedIndex = 0

    screen.confirmSelection()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Confirmed selection'))
  })
})

describe('GalleryScreen - Lifecycle', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn()
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

  test('complete show-hide cycle', () => {
    screen = new GalleryScreen(appState, inputManager)

    // Show
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(screen.selectedIndex).toBe(0)

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('multiple show-hide cycles preserve state', () => {
    screen = new GalleryScreen(appState, inputManager)

    // Cycle 1
    screen.show()
    screen.selectedIndex = 2
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.selectedIndex).toBe(2)

    screen.hide()
  })

  test('show registers listener, hide unregisters', () => {
    screen = new GalleryScreen(appState, inputManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })
})

describe('GalleryScreen - Integration', () => {
  let screen, appState, inputManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setGame: vi.fn(),
      currentScreen: 'gallery'
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

  test('screen flow: show → navigate → select → transition', () => {
    screen = new GalleryScreen(appState, inputManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()

    // Navigate with arrows
    screen.updateSelection = vi.fn()
    screen.handleKeyPress('ArrowRight')
    expect(screen.selectedIndex).toBe(1)

    // Confirm with Space
    screen.handleKeyPress(' ')
    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[1])
    expect(appState.transition).toHaveBeenCalledWith('code')

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('quick select flow: show → number key → transition', () => {
    screen = new GalleryScreen(appState, inputManager)
    screen.show()

    // Quick select with number
    screen.handleKeyPress('3')
    expect(screen.selectedIndex).toBe(2)
    expect(appState.setGame).toHaveBeenCalledWith(GalleryScreen.GAMES[2])
    expect(appState.transition).toHaveBeenCalledWith('code')
  })
})
