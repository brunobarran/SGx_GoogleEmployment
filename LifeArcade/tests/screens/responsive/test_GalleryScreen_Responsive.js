/**
 * @file test_GalleryScreen_Responsive.js
 * @description Unit tests for GalleryScreen responsive behavior
 *
 * Tests that GalleryScreen implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - clamp() font sizes with vh units
 * - vh-based spacing (padding, margins, gaps)
 * - Proper constraints (max-width, max-height, aspect-ratio)
 *
 * Coverage: 15 tests across 4 viewport categories
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('GalleryScreen Responsive', () => {
  let dom
  let GalleryScreen
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
    mockAppState = { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})) }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn() }

    // Import GalleryScreen after DOM is ready
    const module = await import('../../../src/screens/GalleryScreen.js')
    GalleryScreen = module.GalleryScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dimension calculation', () => {
    test('uses window.innerHeight for container height (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1920px')
    })

    test('calculates width from aspect ratio (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // 1920 * 0.625 = 1200
      expect(screen.element.style.width).toBe('1200px')
    })

    test('adapts to desktop viewport (1920×1080)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1080px')
      // 1080 * 0.625 = 675
      expect(screen.element.style.width).toBe('675px')
    })

    test('adapts to tablet viewport (768×1024)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1024)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('1024px')
      // 1024 * 0.625 = 640
      expect(screen.element.style.width).toBe('640px')
    })

    test('adapts to mobile viewport (375×667)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.height).toBe('667px')
      // 667 * 0.625 = 416.875, rounded
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.element.style.width).toBe(`${expectedWidth}px`)
    })

    test('does NOT use fixed 1200px width', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Should be dynamic, not fixed at 1200
      expect(screen.element.style.width).not.toBe('1200px')
    })

    test('does NOT use fixed 1920px height', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Should be dynamic, not fixed at 1920
      expect(screen.element.style.height).not.toBe('1920px')
    })
  })

  describe('Font scaling', () => {
    test('title font uses clamp() with vh units', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('gallery-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.gallery-title[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('game item name font uses clamp() with vh units', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('gallery-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.gallery-item-name[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Spacing scaling', () => {
    test('padding uses clamp() with vh units', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for padding with clamp() and vh
      const styleTag = document.getElementById('gallery-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.gallery-container[^}]*padding:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('grid gap uses clamp() with vh units', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      // Check the style tag content for gap with clamp() and vh
      const styleTag = document.getElementById('gallery-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.gallery-grid[^}]*gap:\s*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Constraints', () => {
    test('respects max-width: 100vw', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxWidth).toBe('100vw')
    })

    test('respects max-height: 100vh', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.maxHeight).toBe('100vh')
    })

    test('preserves aspect-ratio CSS property', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      const aspectRatio = screen.element.style.aspectRatio
      // Should be "10 / 16" or equivalent
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })

    test('uses position: fixed for centering', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.position).toBe('fixed')
    })

    test('uses transform: translate(-50%, -50%) for centering', () => {
      const screen = new GalleryScreen(mockAppState, mockInputManager)
      screen.show()

      expect(screen.element.style.transform).toMatch(/translate\(-50%,\s*-50%\)/)
    })
  })
})
