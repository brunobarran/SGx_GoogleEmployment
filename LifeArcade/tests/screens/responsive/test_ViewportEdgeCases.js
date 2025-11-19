/**
 * @file test_ViewportEdgeCases.js
 * @description Unit tests for responsive behavior in extreme viewport sizes
 *
 * Tests edge cases and extreme viewports across representative screens:
 * - Very small (320×568 iPhone SE)
 * - Very large (3840×2160 4K)
 * - Square (1080×1080)
 * - Extreme portrait (360×800 Android)
 * - Landscape (1920×1080)
 * - Content overflow prevention
 *
 * Coverage: 18 tests (3 screens × 6 edge cases)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Viewport Edge Cases', () => {
  let dom

  beforeEach(() => {
    // Create fresh DOM for each test
    dom = new JSDOM('<!DOCTYPE html><html><head></head><body><div id="app"></div></body></html>', {
      url: 'http://localhost',
      pretendToBeVisual: true
    })

    global.window = dom.window
    global.document = dom.window.document
    global.HTMLElement = dom.window.HTMLElement
  })

  // Test 3 representative screens: Simple (Welcome), Complex (Gallery), Critical (ScoreEntry)
  const testScreens = [
    {
      name: 'WelcomeScreen',
      path: '../../../src/screens/WelcomeScreen.js',
      mocks: {
        appState: { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})) },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      }
    },
    {
      name: 'GalleryScreen',
      path: '../../../src/screens/GalleryScreen.js',
      mocks: {
        appState: { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})) },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      }
    },
    {
      name: 'ScoreEntryScreen',
      path: '../../../src/screens/ScoreEntryScreen.js',
      mocks: {
        appState: {
          transition: vi.fn(),
          reset: vi.fn(),
          getState: vi.fn(() => ({
            currentScore: 12345,
            selectedGame: { id: 'test', name: 'Test' }
          }))
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() },
        storageManager: { saveScore: vi.fn() }
      }
    }
  ]

  testScreens.forEach(({ name, path, mocks }) => {
    describe(`${name} - Edge Cases`, () => {
      test('handles very small viewport (320×568 iPhone SE)', async () => {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(320)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(568)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        expect(() => {
          const screen = new ScreenClass(...mockValues)
          screen.show()
        }).not.toThrow()

        const screen = new ScreenClass(...mockValues)
        screen.show()

        const width = parseFloat(screen.element.style.width)
        const height = parseFloat(screen.element.style.height)

        expect(width).toBeGreaterThan(0)
        expect(height).toBeGreaterThan(0)
        expect(width).toBe(568 * 0.625) // 355px
      })

      test('handles very large viewport (3840×2160 4K)', async () => {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(3840)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(2160)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        expect(() => {
          const screen = new ScreenClass(...mockValues)
          screen.show()
        }).not.toThrow()

        const screen = new ScreenClass(...mockValues)
        screen.show()

        const width = parseFloat(screen.element.style.width)
        const height = parseFloat(screen.element.style.height)

        expect(width).toBe(Math.floor(2160 * 0.625)) // 1350px
        expect(height).toBe(2160)
      })

      test('handles square viewport (1080×1080)', async () => {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1080)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        expect(() => {
          const screen = new ScreenClass(...mockValues)
          screen.show()
        }).not.toThrow()

        const screen = new ScreenClass(...mockValues)
        screen.show()

        const width = parseFloat(screen.element.style.width)
        const height = parseFloat(screen.element.style.height)

        // Width should be constrained by aspect ratio (675px)
        expect(width).toBe(Math.floor(1080 * 0.625))
        expect(width).toBeLessThan(height) // Portrait aspect means width < height
      })

      test('handles extreme portrait (360×800 Android)', async () => {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(360)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(800)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        expect(() => {
          const screen = new ScreenClass(...mockValues)
          screen.show()
        }).not.toThrow()

        const screen = new ScreenClass(...mockValues)
        screen.show()

        const width = parseFloat(screen.element.style.width)
        const height = parseFloat(screen.element.style.height)

        expect(width).toBe(Math.floor(800 * 0.625)) // 500px
        expect(height).toBe(800)
      })

      test('handles landscape orientation (1920×1080)', async () => {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1920)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        expect(() => {
          const screen = new ScreenClass(...mockValues)
          screen.show()
        }).not.toThrow()

        const screen = new ScreenClass(...mockValues)
        screen.show()

        // Container should be centered and letterboxed
        expect(screen.element.style.maxWidth).toBe('100vw')
        expect(screen.element.style.maxHeight).toBe('100vh')
        expect(screen.element.style.position).toBe('fixed')
        expect(screen.element.style.transform).toMatch(/translate\(-50%,\s*-50%\)/)
      })

      test('prevents content overflow on tiny viewport (300px height)', async () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(300)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)

        const screen = new ScreenClass(...mockValues)
        screen.show()

        // Screen element should exist and have reasonable dimensions
        expect(screen.element).toBeTruthy()
        expect(parseFloat(screen.element.style.height)).toBe(300)
        expect(parseFloat(screen.element.style.width)).toBeGreaterThan(0)
      })
    })
  })

  describe('Aspect ratio preservation across all viewport sizes', () => {
    test('maintains 10:16 aspect ratio on all tested viewports', async () => {
      const testViewports = [
        { width: 320, height: 568 },   // iPhone SE
        { width: 375, height: 667 },   // iPhone 8
        { width: 768, height: 1024 },  // iPad
        { width: 1080, height: 1920 }, // Full HD portrait
        { width: 1200, height: 1920 }, // Kiosk
        { width: 1920, height: 1080 }, // Full HD landscape
        { width: 3840, height: 2160 }  // 4K
      ]

      const EXPECTED_RATIO = 0.625

      for (const viewport of testViewports) {
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(viewport.width)
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(viewport.height)

        const module = await import('../../../src/screens/WelcomeScreen.js')
        const screen = new module.WelcomeScreen(
          { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})) },
          { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
        )
        screen.show()

        const width = parseFloat(screen.element.style.width)
        const height = parseFloat(screen.element.style.height)
        const actualRatio = width / height

        expect(actualRatio).toBeCloseTo(EXPECTED_RATIO, 2)
      }
    })
  })
})
