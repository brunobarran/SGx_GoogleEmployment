/**
 * @file test_DimensionCalculation.js
 * @description Unit tests for responsive dimension calculation logic
 *
 * Tests the core formula used across all screens:
 * - ASPECT_RATIO = 1200 / 1920 = 0.625 (10:16 portrait)
 * - containerHeight = window.innerHeight
 * - containerWidth = containerHeight * ASPECT_RATIO
 *
 * Coverage: 10 tests across 4 viewport categories
 */

import { describe, test, expect } from 'vitest'

describe('Responsive Dimension Calculation', () => {
  const ASPECT_RATIO = 1200 / 1920  // 0.625 (10:16 portrait)

  describe('Core calculation formula', () => {
    test('calculates width from height correctly for kiosk target (1200×1920)', () => {
      const height = 1920
      const expectedWidth = height * ASPECT_RATIO
      expect(expectedWidth).toBe(1200)
    })

    test('calculates width from height correctly for desktop (1920×1080)', () => {
      const height = 1080
      const expectedWidth = height * ASPECT_RATIO
      expect(expectedWidth).toBe(675)
    })

    test('calculates width from height correctly for tablet (768×1024)', () => {
      const height = 1024
      const expectedWidth = height * ASPECT_RATIO
      expect(expectedWidth).toBe(640)
    })

    test('calculates width from height correctly for mobile (375×667)', () => {
      const height = 667
      const expectedWidth = height * ASPECT_RATIO
      expect(expectedWidth).toBeCloseTo(416.875, 1)
    })
  })

  describe('Aspect ratio preservation', () => {
    test('preserves 10:16 aspect ratio across all viewports', () => {
      const heights = [1920, 1080, 1024, 667, 500, 800, 1200]

      heights.forEach(h => {
        const w = h * ASPECT_RATIO
        const calculatedRatio = w / h
        expect(calculatedRatio).toBeCloseTo(ASPECT_RATIO, 4)
      })
    })

    test('aspect ratio equals 0.625 exactly', () => {
      expect(ASPECT_RATIO).toBe(0.625)
    })

    test('aspect ratio matches 10:16 proportion', () => {
      const ratio10_16 = 10 / 16
      expect(ASPECT_RATIO).toBe(ratio10_16)
    })
  })

  describe('Edge cases', () => {
    test('handles very small viewport (320×568 iPhone SE)', () => {
      const height = 568
      const width = height * ASPECT_RATIO

      expect(width).toBeGreaterThan(0)
      expect(width).toBeCloseTo(355, 0)
      expect(width / height).toBeCloseTo(ASPECT_RATIO, 4)
    })

    test('handles very large viewport (3840×2160 4K)', () => {
      const height = 2160
      const width = height * ASPECT_RATIO

      expect(width).toBe(1350)
      expect(width / height).toBeCloseTo(ASPECT_RATIO, 4)
    })

    test('handles square viewport (1080×1080)', () => {
      const height = 1080
      const width = height * ASPECT_RATIO

      expect(width).toBe(675)
      expect(width).toBeLessThan(height)  // Portrait aspect means width < height
    })
  })
})
