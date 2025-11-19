/**
 * @file test_QRCodeScreen_Responsive.js
 * @description Unit tests for QRCodeScreen responsive behavior
 *
 * Tests that QRCodeScreen implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - clamp() font sizes with vh units
 * - vh-based spacing and QR placeholder size
 *
 * Coverage: 13 tests across 4 viewport categories
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('QRCodeScreen Responsive', () => {
  let dom
  let QRCodeScreen
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
    mockAppState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' }
      })),
      setTimeout: vi.fn(),
      clearTimeout: vi.fn()
    }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn() }

    // Import QRCodeScreen after DOM is ready
    const module = await import('../../../src/screens/QRCodeScreen.js')
    QRCodeScreen = module.QRCodeScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dimension calculation', () => {
    test('uses window.innerHeight for container height (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1920px')
    })

    test('calculates width from aspect ratio (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.width).toBe('1200px')
    })

    test('adapts to desktop viewport (1920×1080)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1080px')
      expect(screen.element.style.width).toBe('675px')
    })

    test('adapts to mobile viewport (375×667)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('667px')
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.element.style.width).toBe(`${expectedWidth}px`)
    })

    test('does NOT use fixed dimensions', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.width).not.toBe('1200px')
      expect(screen.element.style.height).not.toBe('1920px')
    })
  })

  describe('Font and QR placeholder scaling', () => {
    test('title font uses clamp() with vh units', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      const styleTag = document.getElementById('qr-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.qr-title[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('QR placeholder width uses clamp() with vh units', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      const styleTag = document.getElementById('qr-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.qr-placeholder[^}]*width:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('QR placeholder height uses clamp() with vh units', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      const styleTag = document.getElementById('qr-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.qr-placeholder[^}]*height:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('QR placeholder does NOT use fixed 400px dimensions', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      const styleTag = document.getElementById('qr-screen-styles')
      expect(styleTag).toBeTruthy()
      // Should NOT have "width: 400px" or "height: 400px" without clamp
      expect(styleTag.textContent).not.toMatch(/\.qr-placeholder[^}]*width:\s*400px/)
      expect(styleTag.textContent).not.toMatch(/\.qr-placeholder[^}]*height:\s*400px/)
    })
  })

  describe('Constraints', () => {
    test('respects max-width: 100vw', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxWidth).toBe('100vw')
    })

    test('respects max-height: 100vh', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxHeight).toBe('100vh')
    })

    test('preserves aspect-ratio CSS property', () => {
      const screen = new QRCodeScreen(mockAppState, mockInputManager)
      screen.show()

      const aspectRatio = screen.element.style.aspectRatio
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })
  })
})
