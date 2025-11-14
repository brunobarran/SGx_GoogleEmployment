/**
 * Unit tests for ScoreEntryScreen.
 * Tests arcade-style 3-letter name input with keyboard navigation.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { ScoreEntryScreen } from '../../src/screens/ScoreEntryScreen.js'

describe('ScoreEntryScreen - Initialization', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: {
          id: 'test-game',
          name: 'Test Game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
      getScores: vi.fn(() => [])
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('constructor initializes with dependencies', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    expect(screen.appState).toBe(appState)
    expect(screen.inputManager).toBe(inputManager)
    expect(screen.storageManager).toBe(storageManager)
  })

  test('constructor initializes null element', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    expect(screen.element).toBeNull()
  })

  test('constructor initializes name state', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    expect(screen.letters).toEqual(['A', 'A', 'A'])
    expect(screen.currentPosition).toBe(0)
  })

  test('constructor binds handleKeyPress method', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    expect(typeof screen.handleKeyPress).toBe('function')
    expect(screen.handleKeyPress.name).toBe('bound handleKeyPress')
  })
})

describe('ScoreEntryScreen - Show', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: {
          id: 'test-game',
          name: 'Test Game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
      getScores: vi.fn(() => [])
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
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element).not.toBeNull()
    expect(screen.element.id).toBe('score-entry-screen')
  })

  test('show adds element to DOM', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(document.body.appendChild).toHaveBeenCalledWith(screen.element)
  })

  test('show sets element styles', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.style.cssText).toContain('position: fixed')
    expect(screen.element.style.cssText).toContain('width: 1200px')
    expect(screen.element.style.cssText).toContain('height: 1920px')
  })

  test('show displays score from state', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('5,000')
  })

  test('show creates letter input boxes', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('score-entry-letters')
    expect(screen.element.innerHTML).toContain('score-entry-letter')
  })

  test('show marks first letter as active', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(screen.element.innerHTML).toContain('active')
  })

  test('show resets name state', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.letters = ['X', 'Y', 'Z']
    screen.currentPosition = 2

    screen.show()

    expect(screen.letters).toEqual(['A', 'A', 'A'])
    expect(screen.currentPosition).toBe(0)
  })

  test('show registers key press listener', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(inputManager.onKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('show adds CSS styles if not present', () => {
    document.getElementById = vi.fn(() => null)
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(document.head.appendChild).toHaveBeenCalled()
  })

  test('show resets to idle if no score', () => {
    appState.getState = vi.fn(() => ({
      currentScore: null,
      selectedGame: { id: 'test' }
    }))
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show resets to idle if no game', () => {
    appState.getState = vi.fn(() => ({
      currentScore: 1000,
      selectedGame: null
    }))
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(appState.reset).toHaveBeenCalled()
  })

  test('show logs activation', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()

    expect(logSpy).toHaveBeenCalledWith('ScoreEntryScreen: Show')
    expect(logSpy).toHaveBeenCalledWith('ScoreEntryScreen: Active')
  })
})

describe('ScoreEntryScreen - Hide', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
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

  test('hide removes key press listener', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(inputManager.offKeyPress).toHaveBeenCalledWith(screen.handleKeyPress)
  })

  test('hide removes element from DOM', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.show()
    const element = screen.element

    screen.hide()

    expect(element.remove).toHaveBeenCalled()
    expect(screen.element).toBeNull()
  })

  test('hide logs cleanup', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.show()

    screen.hide()

    expect(logSpy).toHaveBeenCalledWith('ScoreEntryScreen: Hide')
    expect(logSpy).toHaveBeenCalledWith('ScoreEntryScreen: Cleaned up')
  })

  test('hide handles null element gracefully', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.element = null

    expect(() => {
      screen.hide()
    }).not.toThrow()
  })
})

describe('ScoreEntryScreen - Key Handling', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
      getScores: vi.fn(() => [])
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.updateDisplay = vi.fn()
  })

  test('handleKeyPress increments letter with ArrowUp', () => {
    screen.letters = ['A', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowUp')

    expect(screen.letters[0]).toBe('B')
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('handleKeyPress decrements letter with ArrowDown', () => {
    screen.letters = ['B', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowDown')

    expect(screen.letters[0]).toBe('A')
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('handleKeyPress wraps Z to A on increment', () => {
    screen.letters = ['Z', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowUp')

    expect(screen.letters[0]).toBe('A')
  })

  test('handleKeyPress wraps A to Z on decrement', () => {
    screen.letters = ['A', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowDown')

    expect(screen.letters[0]).toBe('Z')
  })

  test('handleKeyPress moves right with ArrowRight', () => {
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowRight')

    expect(screen.currentPosition).toBe(1)
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('handleKeyPress moves left with ArrowLeft', () => {
    screen.currentPosition = 1

    screen.handleKeyPress('ArrowLeft')

    expect(screen.currentPosition).toBe(0)
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('handleKeyPress moves right with Space', () => {
    screen.currentPosition = 0

    screen.handleKeyPress(' ')

    expect(screen.currentPosition).toBe(1)
  })

  test('handleKeyPress confirms on Space at last position', () => {
    screen.currentPosition = 2
    screen.confirmName = vi.fn()

    screen.handleKeyPress(' ')

    expect(screen.confirmName).toHaveBeenCalled()
  })

  test('handleKeyPress resets on Escape', () => {
    screen.handleKeyPress('Escape')

    expect(appState.reset).toHaveBeenCalled()
  })

  test('handleKeyPress prevents left navigation at start', () => {
    screen.currentPosition = 0

    screen.handleKeyPress('ArrowLeft')

    expect(screen.currentPosition).toBe(0)
  })

  test('handleKeyPress supports W key for up', () => {
    screen.letters = ['A', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('W')

    expect(screen.letters[0]).toBe('B')
  })

  test('handleKeyPress supports S key for down', () => {
    screen.letters = ['B', 'A', 'A']
    screen.currentPosition = 0

    screen.handleKeyPress('S')

    expect(screen.letters[0]).toBe('A')
  })
})

describe('ScoreEntryScreen - Letter Navigation', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
      getScores: vi.fn(() => [])
    }

    global.document = {
      createElement: vi.fn(() => {
        // Cache the elements so querySelectorAll returns the same instances
        const letterElements = Array(3).fill(null).map(() => {
          let _textContent = ''
          const classes = new Set()
          return {
            get textContent() { return _textContent },
            set textContent(value) { _textContent = value },
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
          querySelectorAll: vi.fn(() => letterElements)
        }
      }),
      body: { appendChild: vi.fn() },
      head: { appendChild: vi.fn() },
      getElementById: vi.fn(() => null)
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  test('changeLetter increments correctly', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.letters = ['A', 'B', 'C']
    screen.currentPosition = 1
    screen.updateDisplay = vi.fn()

    screen.changeLetter(1)

    expect(screen.letters[1]).toBe('C')
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('changeLetter decrements correctly', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.letters = ['A', 'B', 'C']
    screen.currentPosition = 1
    screen.updateDisplay = vi.fn()

    screen.changeLetter(-1)

    expect(screen.letters[1]).toBe('A')
  })

  test('nextLetter moves position forward', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.currentPosition = 0
    screen.updateDisplay = vi.fn()

    screen.nextLetter()

    expect(screen.currentPosition).toBe(1)
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('nextLetter confirms at last position', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.currentPosition = 2
    screen.confirmName = vi.fn()

    screen.nextLetter()

    expect(screen.confirmName).toHaveBeenCalled()
  })

  test('previousLetter moves position backward', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.currentPosition = 2
    screen.updateDisplay = vi.fn()

    screen.previousLetter()

    expect(screen.currentPosition).toBe(1)
    expect(screen.updateDisplay).toHaveBeenCalled()
  })

  test('previousLetter prevents negative position', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.currentPosition = 0
    screen.updateDisplay = vi.fn()

    screen.previousLetter()

    expect(screen.currentPosition).toBe(0)
  })

  test('updateDisplay updates letter boxes', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.show()

    // Verify elements were created
    let letterElements = screen.element.querySelectorAll('.score-entry-letter')
    expect(letterElements.length).toBe(3)

    // Update letters and display
    screen.letters = ['X', 'Y', 'Z']
    screen.currentPosition = 1
    screen.updateDisplay()

    // Re-query elements after update to get fresh references
    letterElements = screen.element.querySelectorAll('.score-entry-letter')

    // Check updated values
    expect(letterElements[0].textContent).toBe('X')
    expect(letterElements[1].textContent).toBe('Y')
    expect(letterElements[2].textContent).toBe('Z')

    // Check active class
    expect(letterElements[1].classList.contains('active')).toBe(true)
  })
})

describe('ScoreEntryScreen - Score Confirmation', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: {
          id: 'test-game',
          name: 'Test Game'
        }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
      getScores: vi.fn(() => [])
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
  })

  test('confirmName creates name from letters', () => {
    screen.letters = ['J', 'O', 'E']

    screen.confirmName()

    expect(appState.setPlayerName).toHaveBeenCalledWith('JOE')
  })

  test('confirmName saves score to storage', () => {
    screen.letters = ['B', 'O', 'B']

    screen.confirmName()

    expect(storageManager.saveScore).toHaveBeenCalledWith('test-game', 'BOB', 5000)
  })

  test('confirmName transitions to leaderboard', () => {
    screen.letters = ['A', 'A', 'A']

    screen.confirmName()

    expect(appState.transition).toHaveBeenCalledWith('leaderboard')
  })

  test('confirmName logs success', () => {
    const logSpy = vi.spyOn(console, 'log')
    screen.letters = ['A', 'B', 'C']

    screen.confirmName()

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('Confirmed name - ABC'))
    expect(logSpy).toHaveBeenCalledWith('Score saved successfully')
  })

  test('confirmName logs error on save failure', () => {
    const errorSpy = vi.spyOn(console, 'error')
    storageManager.saveScore = vi.fn(() => false)
    screen.letters = ['X', 'Y', 'Z']

    screen.confirmName()

    expect(errorSpy).toHaveBeenCalledWith('Failed to save score')
  })
})

describe('ScoreEntryScreen - Lifecycle', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
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
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    // Show
    screen.show()
    expect(screen.element).not.toBeNull()
    expect(screen.letters).toEqual(['A', 'A', 'A'])

    // Hide
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('multiple show-hide cycles reset state', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    // Cycle 1
    screen.show()
    screen.letters = ['X', 'Y', 'Z']
    screen.hide()

    // Cycle 2
    screen.show()
    expect(screen.letters).toEqual(['A', 'A', 'A'])
    expect(screen.currentPosition).toBe(0)

    screen.hide()
  })

  test('show registers listener, hide unregisters', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    screen.show()
    expect(inputManager.onKeyPress).toHaveBeenCalledTimes(1)

    screen.hide()
    expect(inputManager.offKeyPress).toHaveBeenCalledTimes(1)
  })
})

describe('ScoreEntryScreen - Integration', () => {
  let screen, appState, inputManager, storageManager

  beforeEach(() => {
    appState = {
      transition: vi.fn(),
      reset: vi.fn(),
      setPlayerName: vi.fn(),
      getState: vi.fn(() => ({
        currentScore: 5000,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      })),
      currentScreen: 'score'
    }

    inputManager = {
      onKeyPress: vi.fn(),
      offKeyPress: vi.fn()
    }

    storageManager = {
      saveScore: vi.fn(() => true),
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

  test('screen flow: show → edit name → confirm → leaderboard', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)

    // Show screen
    screen.show()
    expect(screen.element).not.toBeNull()

    // Edit name
    screen.updateDisplay = vi.fn()
    screen.handleKeyPress('ArrowUp')  // A → B
    screen.handleKeyPress('ArrowRight')  // Move to position 1
    screen.handleKeyPress('ArrowUp')  // A → B
    screen.handleKeyPress('ArrowRight')  // Move to position 2
    screen.handleKeyPress('ArrowUp')  // A → B

    expect(screen.letters).toEqual(['B', 'B', 'B'])
    expect(screen.currentPosition).toBe(2)

    // Confirm
    screen.handleKeyPress(' ')
    expect(appState.setPlayerName).toHaveBeenCalledWith('BBB')
    expect(storageManager.saveScore).toHaveBeenCalledWith('test-game', 'BBB', 5000)
    expect(appState.transition).toHaveBeenCalledWith('leaderboard')

    // Hide screen
    screen.hide()
    expect(screen.element).toBeNull()
  })

  test('full name entry workflow', () => {
    screen = new ScoreEntryScreen(appState, inputManager, storageManager)
    screen.show()
    screen.updateDisplay = vi.fn()

    // Enter "ACE"
    screen.letters = ['A', 'A', 'A']
    screen.currentPosition = 0

    // First letter: A (keep)
    screen.handleKeyPress('ArrowRight')

    // Second letter: A → C
    screen.changeLetter(2)  // A → B → C
    screen.handleKeyPress('ArrowRight')

    // Third letter: A → E
    screen.changeLetter(4)  // A → B → C → D → E
    screen.handleKeyPress(' ')  // Confirm

    expect(appState.setPlayerName).toHaveBeenCalledWith('ACE')
  })
})
