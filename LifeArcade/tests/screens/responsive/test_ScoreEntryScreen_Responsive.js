/**
 * @file test_ScoreEntryScreen_Responsive.js
 * @description Unit tests for ScoreEntryScreen responsive behavior
 *
 * CRITICAL SCREEN: Tests letter input boxes that were microscopic on mobile
 *
 * Tests that ScoreEntryScreen implements:
 * - Dynamic width/height calculation from window.innerHeight
 * - clamp() font sizes with vh units
 * - vh-based spacing (padding, margins, gaps)
 * - CRITICAL: Letter boxes scale from 60×80px (mobile) to 120×160px (kiosk)
 *
 * Coverage: 17 tests across 4 viewport categories (includes letter box tests)
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { JSDOM } from 'jsdom'

describe('ScoreEntryScreen Responsive', () => {
  let dom
  let ScoreEntryScreen
  let mockAppState
  let mockInputManager
  let mockStorageManager

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
        currentScore: 12345,
        selectedGame: { id: 'test-game', name: 'Test Game' }
      }))
    }
    mockInputManager = { onKeyPress: vi.fn(), offKeyPress: vi.fn() }
    mockStorageManager = { saveScore: vi.fn() }

    // Import ScoreEntryScreen after DOM is ready
    const module = await import('../../../src/screens/ScoreEntryScreen.js')
    ScoreEntryScreen = module.ScoreEntryScreen
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Dimension calculation', () => {
    test('uses window.innerHeight for container height (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.height).toBe('1920px')
    })

    test('calculates width from aspect ratio (kiosk 1920)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1920)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // 1920 * 0.625 = 1200
      expect(screen.element.style.width).toBe('1200px')
    })

    test('adapts to desktop viewport (1920×1080)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.height).toBe('1080px')
      // 1080 * 0.625 = 675
      expect(screen.element.style.width).toBe('675px')
    })

    test('adapts to tablet viewport (768×1024)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1024)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.height).toBe('1024px')
      // 1024 * 0.625 = 640
      expect(screen.element.style.width).toBe('640px')
    })

    test('adapts to mobile viewport (375×667)', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(667)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.height).toBe('667px')
      // 667 * 0.625 = 416.875, rounded
      const expectedWidth = Math.floor(667 * 0.625)
      expect(screen.element.style.width).toBe(`${expectedWidth}px`)
    })

    test('does NOT use fixed 1200px width', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Should be dynamic, not fixed at 1200
      expect(screen.element.style.width).not.toBe('1200px')
    })

    test('does NOT use fixed 1920px height', () => {
      vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(1080)

      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Should be dynamic, not fixed at 1920
      expect(screen.element.style.height).not.toBe('1920px')
    })
  })

  describe('Font scaling', () => {
    test('title font uses clamp() with vh units', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.score-entry-title[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('score font uses clamp() with vh units', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.score-entry-score[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })
  })

  describe('Letter boxes - CRITICAL responsive behavior', () => {
    test('letter box width uses clamp() with vh units', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.score-entry-letter[^}]*width:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('letter box height uses clamp() with vh units', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.score-entry-letter[^}]*height:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('letter box font uses clamp() with vh units', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      // Check the style tag content for clamp() with vh
      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      expect(styleTag.textContent).toMatch(/\.score-entry-letter[^}]*font-size:\s*clamp\([^)]*vh[^)]*\)/)
    })

    test('letter box does NOT use fixed 120px width', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      // Should NOT have "width: 120px" without clamp
      expect(styleTag.textContent).not.toMatch(/\.score-entry-letter[^}]*width:\s*120px/)
    })

    test('letter box does NOT use fixed 160px height', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      const styleTag = document.getElementById('score-entry-screen-styles')
      expect(styleTag).toBeTruthy()
      // Should NOT have "height: 160px" without clamp
      expect(styleTag.textContent).not.toMatch(/\.score-entry-letter[^}]*height:\s*160px/)
    })
  })

  describe('Constraints', () => {
    test('respects max-width: 100vw', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.maxWidth).toBe('100vw')
    })

    test('respects max-height: 100vh', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      expect(screen.element.style.maxHeight).toBe('100vh')
    })

    test('preserves aspect-ratio CSS property', () => {
      const screen = new ScoreEntryScreen(mockAppState, mockInputManager, mockStorageManager)
      screen.show()

      const aspectRatio = screen.element.style.aspectRatio
      // Should be "10 / 16" or equivalent
      expect(aspectRatio).toMatch(/10\s*\/\s*16/)
    })
  })
})
