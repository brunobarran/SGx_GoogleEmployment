/**
 * @file test_WelcomeScreen_Responsive.js
 * @description Unit tests for WelcomeScreen responsive behavior
 *
 * Tests that WelcomeScreen implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - clamp() font sizes with vh units
 * - vh-based spacing (padding, margins)
 * - Proper constraints (max-width, max-height, aspect-ratio)
 *
 * Coverage: 15 tests across 4 viewport categories
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('WelcomeScreen Responsive', () => {
  let dom
  let WelcomeScreen
  let mockAppState
  let mockInputManager

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
    mockAppState = { transition: vi.fn(), reset: vi.fn() }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn() }

    // Import WelcomeScreen after DOM is ready
    const module = await import('../../../src/screens/WelcomeScreen.js')
    WelcomeScreen = module.WelcomeScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dimension calculation', () => {
    test('uses window.innerHeight for container height (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1920px')
    })

    test('calculates width from aspect ratio (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // 1920 * 0.625 = 1200
      expect(screen.element.style.width).toBe('1200px')
    })

    test('adapts to desktop viewport (1920×1080)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1080px')
      // 1080 * 0.625 = 675
      expect(screen.element.style.width).toBe('675px')
    })

    test('adapts to tablet viewport (768×1024)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1024)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1024px')
      // 1024 * 0.625 = 640
      expect(screen.element.style.width).toBe('640px')
    })

    test('adapts to mobile viewport (375×667)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('667px')
      // 667 * 0.625 = 416.875, rounded
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.element.style.width).toBe(`${expectedWidth}px`)
    })

    test('does NOT use fixed 1200px width', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // Should be dynamic, not fixed at 1200
      expect(screen.element.style.width).not.toBe('1200px')
    })

    test('does NOT use fixed 1920px height', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // Should be dynamic, not fixed at 1920
      expect(screen.element.style.height).not.toBe('1920px')
    })
  })

  describe('Font scaling', () => {
    test('title font uses clamp() with vh units', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('welcome-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.welcome-title[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('subtitle font uses clamp() with vh units', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('welcome-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.welcome-subtitle[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Spacing scaling', () => {
    test('margins use clamp() with vh units', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for margins with clamp() and vh
      const styleTag = document.getElementById('welcome-screen-styles')
      expect(styleTag).toBeTruthy()
      // At least one margin should use clamp() with vh
      expect(styleTag.textContent).toMatch(/margin:[^;]*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Constraints', () => {
    test('respects max-width: 100vw', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxWidth).toBe('100vw')
    })

    test('respects max-height: 100vh', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxHeight).toBe('100vh')
    })

    test('preserves aspect-ratio CSS property', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      const aspectRatio = screen.element.style.aspectRatio
      // Should be "10 / 16" or equivalent
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })

    test('uses position: fixed for centering', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.position).toBe('fixed')
    })

    test('uses transform: translate(-50%, -50%) for centering', () => {
      const screen = new WelcomeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.transform).toMatch(/translate\(-50%,\s*-50%\)/)
    })
  })
})
