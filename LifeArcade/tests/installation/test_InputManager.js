/**
 * Unit tests for InputManager.
 * Tests keyboard input handling for arcade controls.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { InputManager } from '../../src/installation/InputManager.js'

describe('InputManager - Initialization', () => {
  let manager, addEventListenerSpy, removeEventListenerSpy

  beforeEach(() => {
    // Mock window.addEventListener
    addEventListenerSpy = vi.fn()
    removeEventListenerSpy = vi.fn()
    global.window = {
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    if (manager) {
      manager.destroy()
    }
  })

  test('constructor initializes empty state', () => {
    manager = new InputManager()

    expect(manager.pressedKeys.size).toBe(0)
    expect(manager.justPressedKeys.size).toBe(0)
    expect(manager.keyPressCallbacks).toEqual([])
  })

  test('constructor starts listening for events', () => {
    manager = new InputManager()

    // Should register keydown and keyup handlers
    const keydownCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keydown')
    const keyupCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'keyup')

    expect(keydownCalls.length).toBeGreaterThanOrEqual(1)
    expect(keyupCalls.length).toBe(1)
  })

  test('KEYS constant has all arcade controls', () => {
    expect(InputManager.KEYS.SPACE).toBe(' ')
    expect(InputManager.KEYS.ESCAPE).toBe('Escape')
    expect(InputManager.KEYS.ENTER).toBe('Enter')
    expect(InputManager.KEYS.ARROW_UP).toBe('ArrowUp')
    expect(InputManager.KEYS.ARROW_DOWN).toBe('ArrowDown')
    expect(InputManager.KEYS.ARROW_LEFT).toBe('ArrowLeft')
    expect(InputManager.KEYS.ARROW_RIGHT).toBe('ArrowRight')
    expect(InputManager.KEYS.ONE).toBe('1')
    expect(InputManager.KEYS.A).toBe('a')
    expect(InputManager.KEYS.D).toBe('d')
    expect(InputManager.KEYS.W).toBe('w')
    expect(InputManager.KEYS.S).toBe('s')
  })
})

describe('InputManager - Event Listening', () => {
  let manager, addEventListenerSpy, removeEventListenerSpy

  beforeEach(() => {
    addEventListenerSpy = vi.fn()
    removeEventListenerSpy = vi.fn()
    global.window = {
      addEventListener: addEventListenerSpy,
      removeEventListener: removeEventListenerSpy
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  test('startListening registers event handlers', () => {
    // Reset mocks
    addEventListenerSpy.mockClear()

    manager.stopListening()
    manager.startListening()

    // Should add keydown and keyup listeners
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', manager.handleKeyDown)
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', manager.handleKeyUp)
  })

  test('stopListening removes event handlers', () => {
    manager.stopListening()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', manager.handleKeyDown)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', manager.handleKeyUp)
  })
})

describe('InputManager - Key State Tracking', () => {
  let manager

  beforeEach(() => {
    // Mock window with working event listeners
    const listeners = new Map()
    global.window = {
      addEventListener: (event, callback) => {
        if (!listeners.has(event)) {
          listeners.set(event, [])
        }
        listeners.get(event).push(callback)
      },
      removeEventListener: (event, callback) => {
        if (listeners.has(event)) {
          const callbacks = listeners.get(event)
          const index = callbacks.indexOf(callback)
          if (index > -1) {
            callbacks.splice(index, 1)
          }
        }
      },
      trigger: (event, data) => {
        if (listeners.has(event)) {
          listeners.get(event).forEach(cb => cb(data))
        }
      }
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()

    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
    vi.useRealTimers()
  })

  test('handleKeyDown tracks pressed key', () => {
    const event = {
      key: 'ArrowUp',
      preventDefault: vi.fn()
    }

    manager.handleKeyDown(event)

    expect(manager.isPressed('ArrowUp')).toBe(true)
  })

  test('handleKeyUp removes pressed key', () => {
    const downEvent = { key: 'ArrowUp', preventDefault: vi.fn() }
    const upEvent = { key: 'ArrowUp' }

    manager.handleKeyDown(downEvent)
    expect(manager.isPressed('ArrowUp')).toBe(true)

    manager.handleKeyUp(upEvent)
    expect(manager.isPressed('ArrowUp')).toBe(false)
  })

  test('isPressed returns false for unpressed key', () => {
    expect(manager.isPressed('ArrowUp')).toBe(false)
  })

  test('wasJustPressed tracks first press only', () => {
    const event = { key: 'ArrowUp', preventDefault: vi.fn() }

    manager.handleKeyDown(event)

    expect(manager.wasJustPressed('ArrowUp')).toBe(true)

    // Second keydown (held) should not trigger justPressed
    manager.handleKeyDown(event)
    expect(manager.pressedKeys.has('ArrowUp')).toBe(true)
  })

  test('justPressed clears after timeout', () => {
    const event = { key: 'ArrowUp', preventDefault: vi.fn() }

    manager.handleKeyDown(event)
    expect(manager.wasJustPressed('ArrowUp')).toBe(true)

    vi.advanceTimersByTime(100)

    expect(manager.wasJustPressed('ArrowUp')).toBe(false)
    expect(manager.isPressed('ArrowUp')).toBe(true)  // Still pressed
  })

  test('handleKeyDown prevents default for arcade keys', () => {
    const event = { key: ' ', preventDefault: vi.fn() }

    manager.handleKeyDown(event)

    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('handleKeyDown does not prevent default for non-arcade keys', () => {
    const event = { key: 'x', preventDefault: vi.fn() }

    manager.handleKeyDown(event)

    expect(event.preventDefault).not.toHaveBeenCalled()
  })

  test('multiple keys can be pressed simultaneously', () => {
    const event1 = { key: 'ArrowUp', preventDefault: vi.fn() }
    const event2 = { key: 'ArrowLeft', preventDefault: vi.fn() }
    const event3 = { key: ' ', preventDefault: vi.fn() }

    manager.handleKeyDown(event1)
    manager.handleKeyDown(event2)
    manager.handleKeyDown(event3)

    expect(manager.isPressed('ArrowUp')).toBe(true)
    expect(manager.isPressed('ArrowLeft')).toBe(true)
    expect(manager.isPressed(' ')).toBe(true)
  })
})

describe('InputManager - Callback System', () => {
  let manager

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.useFakeTimers()

    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
    vi.useRealTimers()
  })

  test('onKeyPress registers callback', () => {
    const callback = vi.fn()

    manager.onKeyPress(callback)

    expect(manager.keyPressCallbacks).toHaveLength(1)
    expect(manager.keyPressCallbacks[0]).toBe(callback)
  })

  test('onKeyPress rejects non-function', () => {
    manager.onKeyPress('not a function')

    expect(manager.keyPressCallbacks).toHaveLength(0)
  })

  test('callback receives key and event on press', () => {
    const callback = vi.fn()
    manager.onKeyPress(callback)

    const event = { key: 'ArrowUp', preventDefault: vi.fn() }
    manager.handleKeyDown(event)

    expect(callback).toHaveBeenCalledWith('ArrowUp', event)
  })

  test('multiple callbacks all get triggered', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()
    const callback3 = vi.fn()

    manager.onKeyPress(callback1)
    manager.onKeyPress(callback2)
    manager.onKeyPress(callback3)

    const event = { key: ' ', preventDefault: vi.fn() }
    manager.handleKeyDown(event)

    expect(callback1).toHaveBeenCalled()
    expect(callback2).toHaveBeenCalled()
    expect(callback3).toHaveBeenCalled()
  })

  test('callback errors do not stop other callbacks', () => {
    const errorCallback = vi.fn(() => {
      throw new Error('Callback error')
    })
    const goodCallback = vi.fn()

    manager.onKeyPress(errorCallback)
    manager.onKeyPress(goodCallback)

    const event = { key: 'Enter', preventDefault: vi.fn() }
    manager.handleKeyDown(event)

    expect(errorCallback).toHaveBeenCalled()
    expect(goodCallback).toHaveBeenCalled()
  })

  test('offKeyPress removes callback', () => {
    const callback = vi.fn()

    manager.onKeyPress(callback)
    expect(manager.keyPressCallbacks).toHaveLength(1)

    manager.offKeyPress(callback)
    expect(manager.keyPressCallbacks).toHaveLength(0)
  })

  test('offKeyPress handles non-existent callback gracefully', () => {
    const callback = vi.fn()

    expect(() => {
      manager.offKeyPress(callback)
    }).not.toThrow()
  })

  test('callback only fires on first press, not hold', () => {
    const callback = vi.fn()
    manager.onKeyPress(callback)

    const event = { key: 'ArrowUp', preventDefault: vi.fn() }

    // First press
    manager.handleKeyDown(event)
    expect(callback).toHaveBeenCalledTimes(1)

    // Held (repeat keydown)
    manager.handleKeyDown(event)
    expect(callback).toHaveBeenCalledTimes(1)  // Not called again
  })
})

describe('InputManager - Utility Methods', () => {
  let manager

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  test('isArcadeKey returns true for space', () => {
    expect(manager.isArcadeKey(' ')).toBe(true)
  })

  test('isArcadeKey returns true for arrows', () => {
    expect(manager.isArcadeKey('ArrowUp')).toBe(true)
    expect(manager.isArcadeKey('ArrowDown')).toBe(true)
    expect(manager.isArcadeKey('ArrowLeft')).toBe(true)
    expect(manager.isArcadeKey('ArrowRight')).toBe(true)
  })

  test('isArcadeKey returns true for WASD', () => {
    expect(manager.isArcadeKey('w')).toBe(true)
    expect(manager.isArcadeKey('W')).toBe(true)
    expect(manager.isArcadeKey('a')).toBe(true)
    expect(manager.isArcadeKey('A')).toBe(true)
    expect(manager.isArcadeKey('s')).toBe(true)
    expect(manager.isArcadeKey('S')).toBe(true)
    expect(manager.isArcadeKey('d')).toBe(true)
    expect(manager.isArcadeKey('D')).toBe(true)
  })

  test('isArcadeKey returns true for number keys 1-7', () => {
    expect(manager.isArcadeKey('1')).toBe(true)
    expect(manager.isArcadeKey('2')).toBe(true)
    expect(manager.isArcadeKey('3')).toBe(true)
    expect(manager.isArcadeKey('4')).toBe(true)
    expect(manager.isArcadeKey('5')).toBe(true)
    expect(manager.isArcadeKey('6')).toBe(true)
    expect(manager.isArcadeKey('7')).toBe(true)
  })

  test('isArcadeKey returns true for Escape and Enter', () => {
    expect(manager.isArcadeKey('Escape')).toBe(true)
    expect(manager.isArcadeKey('Enter')).toBe(true)
  })

  test('isArcadeKey returns false for other keys', () => {
    expect(manager.isArcadeKey('x')).toBe(false)
    expect(manager.isArcadeKey('Tab')).toBe(false)
    expect(manager.isArcadeKey('Shift')).toBe(false)
    expect(manager.isArcadeKey('8')).toBe(false)
  })

  test('clear removes all pressed keys', () => {
    const event1 = { key: 'ArrowUp', preventDefault: vi.fn() }
    const event2 = { key: ' ', preventDefault: vi.fn() }

    manager.handleKeyDown(event1)
    manager.handleKeyDown(event2)

    expect(manager.pressedKeys.size).toBe(2)

    manager.clear()

    expect(manager.pressedKeys.size).toBe(0)
    expect(manager.justPressedKeys.size).toBe(0)
  })

  test('getPressedKeys returns array of pressed keys', () => {
    const event1 = { key: 'ArrowUp', preventDefault: vi.fn() }
    const event2 = { key: 'ArrowLeft', preventDefault: vi.fn() }

    manager.handleKeyDown(event1)
    manager.handleKeyDown(event2)

    const pressed = manager.getPressedKeys()

    expect(pressed).toHaveLength(2)
    expect(pressed).toContain('ArrowUp')
    expect(pressed).toContain('ArrowLeft')
  })

  test('getPressedKeys returns empty array when no keys pressed', () => {
    expect(manager.getPressedKeys()).toEqual([])
  })

  test('destroy stops listening and clears state', () => {
    const removeEventListenerSpy = vi.fn()
    global.window.removeEventListener = removeEventListenerSpy

    const callback = vi.fn()
    manager.onKeyPress(callback)

    const event = { key: 'ArrowUp', preventDefault: vi.fn() }
    manager.handleKeyDown(event)

    manager.destroy()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', manager.handleKeyDown)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', manager.handleKeyUp)
    expect(manager.keyPressCallbacks).toEqual([])
    expect(manager.pressedKeys.size).toBe(0)
  })
})

describe('InputManager - Browser Default Prevention', () => {
  let manager, preventDefaultListeners

  beforeEach(() => {
    preventDefaultListeners = []

    global.window = {
      addEventListener: (event, callback) => {
        if (event === 'keydown') {
          preventDefaultListeners.push(callback)
        }
      },
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
  })

  test('preventDefaults is called during construction', () => {
    // Should have registered multiple keydown listeners for default prevention
    expect(preventDefaultListeners.length).toBeGreaterThan(0)
  })

  test('F11 is prevented', () => {
    const event = { key: 'F11', preventDefault: vi.fn() }

    // Trigger all prevent default listeners
    preventDefaultListeners.forEach(listener => listener(event))

    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('Ctrl+W is prevented', () => {
    const event = { key: 'w', ctrlKey: true, preventDefault: vi.fn() }

    preventDefaultListeners.forEach(listener => listener(event))

    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('Backspace on body is prevented', () => {
    global.document = { body: {} }
    const event = {
      key: 'Backspace',
      target: global.document.body,
      preventDefault: vi.fn()
    }

    preventDefaultListeners.forEach(listener => listener(event))

    expect(event.preventDefault).toHaveBeenCalled()
  })

  test('Backspace in input field is not prevented', () => {
    const inputElement = { tagName: 'INPUT' }
    const event = {
      key: 'Backspace',
      target: inputElement,
      preventDefault: vi.fn()
    }

    preventDefaultListeners.forEach(listener => listener(event))

    // Should not prevent default for backspace in input
    expect(event.preventDefault).not.toHaveBeenCalled()
  })
})

describe('InputManager - Integration', () => {
  let manager

  beforeEach(() => {
    global.window = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    }

    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.useFakeTimers()

    manager = new InputManager()
  })

  afterEach(() => {
    manager.destroy()
    vi.useRealTimers()
  })

  test('complete key press lifecycle', () => {
    const callback = vi.fn()
    manager.onKeyPress(callback)

    const downEvent = { key: 'ArrowUp', preventDefault: vi.fn() }
    const upEvent = { key: 'ArrowUp' }

    // Press
    manager.handleKeyDown(downEvent)
    expect(manager.isPressed('ArrowUp')).toBe(true)
    expect(manager.wasJustPressed('ArrowUp')).toBe(true)
    expect(callback).toHaveBeenCalledWith('ArrowUp', downEvent)

    // Wait 100ms for justPressed to clear
    vi.advanceTimersByTime(100)
    expect(manager.wasJustPressed('ArrowUp')).toBe(false)
    expect(manager.isPressed('ArrowUp')).toBe(true)

    // Release
    manager.handleKeyUp(upEvent)
    expect(manager.isPressed('ArrowUp')).toBe(false)
  })

  test('tracking multiple simultaneous keys', () => {
    const downUp = { key: 'ArrowUp', preventDefault: vi.fn() }
    const downLeft = { key: 'ArrowLeft', preventDefault: vi.fn() }
    const downSpace = { key: ' ', preventDefault: vi.fn() }

    manager.handleKeyDown(downUp)
    manager.handleKeyDown(downLeft)
    manager.handleKeyDown(downSpace)

    const pressed = manager.getPressedKeys()
    expect(pressed).toHaveLength(3)
    expect(pressed).toContain('ArrowUp')
    expect(pressed).toContain('ArrowLeft')
    expect(pressed).toContain(' ')

    manager.handleKeyUp({ key: 'ArrowLeft' })
    expect(manager.getPressedKeys()).toHaveLength(2)
    expect(manager.isPressed('ArrowUp')).toBe(true)
    expect(manager.isPressed('ArrowLeft')).toBe(false)
    expect(manager.isPressed(' ')).toBe(true)
  })

  test('callback registration and removal during gameplay', () => {
    const callback1 = vi.fn()
    const callback2 = vi.fn()

    manager.onKeyPress(callback1)

    const event1 = { key: 'ArrowUp', preventDefault: vi.fn() }
    manager.handleKeyDown(event1)
    expect(callback1).toHaveBeenCalledTimes(1)

    manager.onKeyPress(callback2)

    const event2 = { key: 'ArrowDown', preventDefault: vi.fn() }
    manager.handleKeyDown(event2)
    expect(callback1).toHaveBeenCalledTimes(2)
    expect(callback2).toHaveBeenCalledTimes(1)

    manager.offKeyPress(callback1)

    const event3 = { key: 'ArrowLeft', preventDefault: vi.fn() }
    manager.handleKeyDown(event3)
    expect(callback1).toHaveBeenCalledTimes(2)  // Not called again
    expect(callback2).toHaveBeenCalledTimes(2)
  })

  test('clearing state mid-gameplay', () => {
    const event1 = { key: 'ArrowUp', preventDefault: vi.fn() }
    const event2 = { key: ' ', preventDefault: vi.fn() }

    manager.handleKeyDown(event1)
    manager.handleKeyDown(event2)

    expect(manager.getPressedKeys()).toHaveLength(2)

    manager.clear()

    expect(manager.getPressedKeys()).toHaveLength(0)
    expect(manager.isPressed('ArrowUp')).toBe(false)
    expect(manager.isPressed(' ')).toBe(false)
  })

  test('start and stop listening mid-session', () => {
    const removeEventListenerSpy = vi.fn()
    const addEventListenerSpy = vi.fn()
    global.window.removeEventListener = removeEventListenerSpy
    global.window.addEventListener = addEventListenerSpy

    manager.stopListening()
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', manager.handleKeyDown)
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keyup', manager.handleKeyUp)

    removeEventListenerSpy.mockClear()
    addEventListenerSpy.mockClear()

    manager.startListening()
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', manager.handleKeyDown)
    expect(addEventListenerSpy).toHaveBeenCalledWith('keyup', manager.handleKeyUp)
  })
})
