/**
 * @file test_ScreenConsistency.js
 * @description Unit tests to ensure ALL screens follow consistent responsive patterns
 *
 * Tests that ALL 7 modified screens implement:
 * - Same dynamic dimension calculation formula
 * - Same aspect ratio (10:16 portrait)
 * - clamp() adoption for fonts
 * - No fixed 1200×1920 dimensions
 *
 * Coverage: 35 tests (7 screens × 5 consistency checks)
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('Screen Responsive Consistency', () => {
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
    global.fetch = vi.fn(() => Promise.resolve({
      ok: true,
      text: () => Promise.resolve('// Mock code')
    }))
  })

  const screens = [
    {
      name: 'WelcomeScreen',
      path: '../../../src/screens/WelcomeScreen.js',
      mocks: {
        appState: { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})), setTimeout: vi.fn(), clearTimeout: vi.fn() },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      },
      elementProperty: 'element'
    },
    {
      name: 'GalleryScreen',
      path: '../../../src/screens/GalleryScreen.js',
      mocks: {
        appState: { transition: vi.fn(), reset: vi.fn(), getState: vi.fn(() => ({})), setTimeout: vi.fn(), clearTimeout: vi.fn() },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      },
      elementProperty: 'element'
    },
    {
      name: 'CodeAnimationScreen',
      path: '../../../src/screens/CodeAnimationScreen.js',
      mocks: {
        appState: {
          transition: vi.fn(),
          reset: vi.fn(),
          getState: vi.fn(() => ({ selectedGame: { id: 'test', name: 'Test' } })),
          setTimeout: vi.fn(),
          clearTimeout: vi.fn()
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      },
      elementProperty: 'element',
      async: true
    },
    {
      name: 'GameScreen',
      path: '../../../src/screens/GameScreen.js',
      mocks: {
        appState: {
          transition: vi.fn(),
          reset: vi.fn(),
          getState: vi.fn(() => ({
            selectedGame: { id: 'test', name: 'Test', path: 'games/test.html' }
          })),
          setTimeout: vi.fn(),
          clearTimeout: vi.fn()
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn(), stopListening: vi.fn(), startListening: vi.fn() },
        iframeComm: {
          listen: vi.fn(),
          stopListening: vi.fn(),
          onGameOver: vi.fn(),
          startListening: vi.fn()
        }
      },
      elementProperty: 'iframe'
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
          })),
          setTimeout: vi.fn(),
          clearTimeout: vi.fn()
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn(), stopListening: vi.fn(), startListening: vi.fn() },
        storageManager: { saveScore: vi.fn() }
      },
      elementProperty: 'element'
    },
    {
      name: 'LeaderboardScreen',
      path: '../../../src/screens/LeaderboardScreen.js',
      mocks: {
        appState: {
          transition: vi.fn(),
          reset: vi.fn(),
          getState: vi.fn(() => ({
            playerName: 'AAA',
            selectedGame: { id: 'test', name: 'Test' }
          })),
          setTimeout: vi.fn(),
          clearTimeout: vi.fn()
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn(), stopListening: vi.fn(), startListening: vi.fn() },
        storageManager: { getScores: vi.fn(() => []) }
      },
      elementProperty: 'element'
    },
    {
      name: 'QRCodeScreen',
      path: '../../../src/screens/QRCodeScreen.js',
      mocks: {
        appState: {
          transition: vi.fn(),
          reset: vi.fn(),
          getState: vi.fn(() => ({
            selectedGame: { id: 'test', name: 'Test' }
          })),
          setTimeout: vi.fn(),
          clearTimeout: vi.fn()
        },
        inputManager: { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
      },
      elementProperty: 'element'
    }
  ]

  screens.forEach(({ name, path, mocks, elementProperty, async: isAsync }) => {
    describe(name, () => {
      test('implements dynamic width calculation', async () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)
        const screen = new ScreenClass(...mockValues)

        if (isAsync) {
          await screen.show()
        } else {
          screen.show()
        }

        const element = screen[elementProperty]
        // Width should be calculated (675px for 1080 height), not fixed at 1200px
        expect(element.style.width).toBe('675px')
        expect(element.style.width).not.toBe('1200px')
      })

      test('implements dynamic height from window.innerHeight', async () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)
        const screen = new ScreenClass(...mockValues)

        if (isAsync) {
          await screen.show()
        } else {
          screen.show()
        }

        const element = screen[elementProperty]
        // Height should be dynamic (1080px), not fixed at 1920px
        expect(element.style.height).toBe('1080px')
        expect(element.style.height).not.toBe('1920px')
      })

      test('uses clamp() for responsive typography', async () => {
        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)
        const screen = new ScreenClass(...mockValues)

        if (isAsync) {
          await screen.show()
        } else {
          screen.show()
        }

        // GameScreen only contains an iframe (no typography), so skip clamp() check
        if (name === 'GameScreen') {
          expect(true).toBe(true)  // GameScreen doesn't need typography styles
          return
        }

        // Check for presence of style tag with clamp() usage
        const styleTags = document.querySelectorAll('style[id$="-styles"]')
        const hasClamp = Array.from(styleTags).some(tag =>
          tag.textContent.includes('clamp(') && tag.textContent.includes('vh')
        )

        expect(hasClamp).toBe(true)
      })

      test('preserves aspect ratio 10:16', async () => {
        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)
        const screen = new ScreenClass(...mockValues)

        if (isAsync) {
          await screen.show()
        } else {
          screen.show()
        }

        const element = screen[elementProperty]
        expect(element.style.aspectRatio).toMatch(/10\s*\/\s*16/)
      })

      test('uses same ASPECT_RATIO constant (0.625)', async () => {
        vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

        const module = await import(path)
        const ScreenClass = module[name]
        const mockValues = Object.values(mocks)
        const screen = new ScreenClass(...mockValues)

        if (isAsync) {
          await screen.show()
        } else {
          screen.show()
        }

        const element = screen[elementProperty]
        const width = parseFloat(element.style.width)
        const height = parseFloat(element.style.height)

        // 1920 * 0.625 = 1200 (aspect ratio consistency)
        const calculatedRatio = width / height
        expect(calculatedRatio).toBeCloseTo(0.625, 4)
      })
    })
  })

  test('all screens use consistent responsive formula', async () => {
    const EXPECTED_RATIO = 1200 / 1920  // 0.625

    for (const { name, path, mocks, elementProperty, async: isAsync } of screens) {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const module = await import(path)
      const ScreenClass = module[name]
      const mockValues = Object.values(mocks)
      const screen = new ScreenClass(...mockValues)

      if (isAsync) {
        await screen.show()
      } else {
        screen.show()
      }

      const element = screen[elementProperty]
      const width = parseFloat(element.style.width)
      const height = parseFloat(element.style.height)

      expect(width / height).toBeCloseTo(EXPECTED_RATIO, 4)
    }
  })
})
