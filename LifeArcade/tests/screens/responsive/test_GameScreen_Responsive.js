/**
 * @file test_GameScreen_Responsive.js
 * @description Unit tests for GameScreen responsive behavior
 *
 * Tests that GameScreen iframe implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - Proper constraints (max-width, max-height, aspect-ratio)
 *
 * Coverage: 10 tests across 4 viewport categories
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('GameScreen Responsive', () => {
  let dom
  let GameScreen
  let mockAppState
  let mockInputManager
  let mockIframeComm

  beforeEach(async () => {
    // Create fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true
    })

    global.window = dom.window
    global.document = dom.window.document
    global.HTMLElement = dom.window.HTMLElement

    // Mock dependencies
    mockAppState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game', path: 'games/test.html' }
      }))
    }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn(), stopListening: vi.fn(), startListening: vi.fn() }
    mockIframeComm = {
      listen: vi.fn(),
      stopListening: vi.fn(),
      onGameOver: vi.fn(),
      startListening: vi.fn()
    }

    // Import GameScreen after DOM is ready
    const module = await import('../../../src/screens/GameScreen.js')
    GameScreen = module.GameScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Iframe dimension calculation', () => {
    test('iframe uses window.innerHeight for height (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.height).toBe('1920px')
    })

    test('iframe calculates width from aspect ratio (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      // 1920 * 0.625 = 1200
      expect(screen.iframe.style.width).toBe('1200px')
    })

    test('iframe adapts to desktop viewport (1920×1080)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.height).toBe('1080px')
      // 1080 * 0.625 = 675
      expect(screen.iframe.style.width).toBe('675px')
    })

    test('iframe adapts to tablet viewport (768×1024)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1024)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.height).toBe('1024px')
      // 1024 * 0.625 = 640
      expect(screen.iframe.style.width).toBe('640px')
    })

    test('iframe adapts to mobile viewport (375×667)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.height).toBe('667px')
      // 667 * 0.625 = 416.875, rounded
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.iframe.style.width).toBe(`${expectedWidth}px`)
    })

    test('iframe does NOT use fixed 1200px width', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      // Should be dynamic, not fixed at 1200
      expect(screen.iframe.style.width).not.toBe('1200px')
    })

    test('iframe does NOT use fixed 1920px height', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      // Should be dynamic, not fixed at 1920
      expect(screen.iframe.style.height).not.toBe('1920px')
    })
  })

  describe('Constraints', () => {
    test('iframe respects max-width: 100vw', () => {
      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.maxWidth).toBe('100vw')
    })

    test('iframe respects max-height: 100vh', () => {
      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      expect(screen.iframe.style.maxHeight).toBe('100vh')
    })

    test('iframe preserves aspect-ratio CSS property', () => {
      const screen = new GameScreen(mockAppState, mockInputManager, mockIframeComm)
      screen.show()

      const aspectRatio = screen.iframe.style.aspectRatio
      // Should be "10 / 16" or equivalent
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })
  })
})
