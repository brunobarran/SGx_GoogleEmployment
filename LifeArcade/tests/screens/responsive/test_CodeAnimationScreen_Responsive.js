/**
 * @file test_CodeAnimationScreen_Responsive.js
 * @description Unit tests for CodeAnimationScreen responsive behavior
 *
 * Tests that CodeAnimationScreen implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - clamp() font sizes with vh units for code display
 * - vh-based padding
 *
 * Coverage: 12 tests across 4 viewport categories
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('CodeAnimationScreen Responsive', () => {
  let dom
  let CodeAnimationScreen
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
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('// Mock game code\nfunction test() {}')
    }))

    // Mock dependencies
    mockAppState = {
      transition: vi.fn(),
      reset: vi.fn(),
      getState: vi.fn(() => ({
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn() }

    // Import CodeAnimationScreen after DOM is ready
    const module = await import('../../../src/screens/CodeAnimationScreen.js')
    CodeAnimationScreen = module.CodeAnimationScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dimension calculation', () => {
    test('uses window.innerHeight for container height (kiosk 1920)', async () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.height).toBe('1920px')
    })

    test('calculates width from aspect ratio (kiosk 1920)', async () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.width).toBe('1200px')
    })

    test('adapts to desktop viewport (1920×1080)', async () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.height).toBe('1080px')
      expect(screen.element.style.width).toBe('675px')
    })

    test('adapts to mobile viewport (375×667)', async () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.height).toBe('667px')
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.element.style.width).toBe(`${expectedWidth}px`)
    })

    test('does NOT use fixed dimensions', async () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.width).not.toBe('1200px')
      expect(screen.element.style.height).not.toBe('1920px')
    })
  })

  describe('Font and spacing scaling', () => {
    test('code content font uses clamp() with vh units', async () => {
      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      const styleTag = document.getElementById('code-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.code-content[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('padding uses clamp() with vh units', async () => {
      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      const styleTag = document.getElementById('code-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.code-container[^}]*padding:\s*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Constraints', () => {
    test('respects max-width: 100vw', async () => {
      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.maxWidth).toBe('100vw')
    })

    test('respects max-height: 100vh', async () => {
      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      expect(screen.element.style.maxHeight).toBe('100vh')
    })

    test('preserves aspect-ratio CSS property', async () => {
      const screen = new CodeAnimationScreen(mockAppState, mockInputManager)
      await screen.show()

      const aspectRatio = screen.element.style.aspectRatio
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })
  })
})
