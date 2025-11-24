/**
 * Unit tests for ThemeManager
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { ThemeManager } from '../../src/installation/ThemeManager.js'

describe('ThemeManager', () => {
  let themeManager
  let originalDocument

  beforeEach(() => {
    // Mock document for DOM operations
    originalDocument = global.document

    global.document = {
      documentElement: {
        setAttribute: vi.fn(),
        getAttribute: vi.fn(() => 'day')
      },
      querySelectorAll: vi.fn(() => [])
    }

    // Create fresh instance
    themeManager = new ThemeManager()
  })

  afterEach(() => {
    global.document = originalDocument
  })

  test('constructor initializes with day theme', () => {
    expect(themeManager.getTheme()).toBe('day')
  })

  test('setTheme changes to night', () => {
    themeManager.setTheme('night')

    expect(themeManager.getTheme()).toBe('night')
    expect(document.documentElement.setAttribute).toHaveBeenCalledWith('data-theme', 'night')
  })

  test('setTheme notifies observers', () => {
    const observer = vi.fn()
    themeManager.addObserver(observer)

    themeManager.setTheme('night')

    expect(observer).toHaveBeenCalledWith('night')
    expect(observer).toHaveBeenCalledTimes(1)
  })

  test('setTheme rejects invalid themes', () => {
    expect(() => themeManager.setTheme('invalid')).toThrow('Invalid theme: invalid')
    expect(themeManager.getTheme()).toBe('day') // Unchanged
  })

  test('addObserver registers callback', () => {
    const observer = vi.fn()
    themeManager.addObserver(observer)

    themeManager.setTheme('night')

    expect(observer).toHaveBeenCalledTimes(1)
  })

  test('removeObserver unregisters callback', () => {
    const observer = vi.fn()
    themeManager.addObserver(observer)
    themeManager.removeObserver(observer)

    themeManager.setTheme('night')

    expect(observer).not.toHaveBeenCalled()
  })

  test('broadcastToIframes sends postMessage to all iframes', () => {
    const mockIframe1 = { contentWindow: { postMessage: vi.fn() } }
    const mockIframe2 = { contentWindow: { postMessage: vi.fn() } }

    global.document.querySelectorAll = vi.fn(() => [mockIframe1, mockIframe2])

    // Create new instance to pick up mocked querySelectorAll
    themeManager = new ThemeManager()
    themeManager.setTheme('night')

    expect(mockIframe1.contentWindow.postMessage).toHaveBeenCalledWith(
      { type: 'themeChange', theme: 'night' },
      '*'
    )
    expect(mockIframe2.contentWindow.postMessage).toHaveBeenCalledWith(
      { type: 'themeChange', theme: 'night' },
      '*'
    )
  })

  test('handles iframes without contentWindow gracefully', () => {
    const mockIframe = { contentWindow: null }
    global.document.querySelectorAll = vi.fn(() => [mockIframe])

    themeManager = new ThemeManager()

    expect(() => themeManager.setTheme('night')).not.toThrow()
  })

  test('setTheme does nothing if theme is already set', () => {
    const observer = vi.fn()
    themeManager.addObserver(observer)

    // Set to day (already day)
    themeManager.setTheme('day')

    // Observer should not be called
    expect(observer).not.toHaveBeenCalled()
  })

  test('getTheme returns current theme', () => {
    expect(themeManager.getTheme()).toBe('day')

    themeManager.setTheme('night')
    expect(themeManager.getTheme()).toBe('night')
  })

  test('addObserver rejects non-function', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    themeManager.addObserver('not a function')

    expect(consoleSpy).toHaveBeenCalledWith('ThemeManager: Observer must be a function')

    consoleSpy.mockRestore()
  })

  test('observers array starts empty', () => {
    expect(themeManager.observers).toEqual([])
  })

  test('multiple observers are all notified', () => {
    const observer1 = vi.fn()
    const observer2 = vi.fn()
    const observer3 = vi.fn()

    themeManager.addObserver(observer1)
    themeManager.addObserver(observer2)
    themeManager.addObserver(observer3)

    themeManager.setTheme('night')

    expect(observer1).toHaveBeenCalledWith('night')
    expect(observer2).toHaveBeenCalledWith('night')
    expect(observer3).toHaveBeenCalledWith('night')
  })

  test('observer errors are caught and logged', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    const errorObserver = vi.fn(() => {
      throw new Error('Observer error')
    })

    themeManager.addObserver(errorObserver)
    themeManager.setTheme('night')

    expect(consoleSpy).toHaveBeenCalledWith(
      'ThemeManager: Observer callback error:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })
})
