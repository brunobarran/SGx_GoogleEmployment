/**
 * Unit tests for DebugAppearance Grid Sizing Logic
 * Tests pattern-driven grid calculation (pattern dimensions + 2 padding)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { calculateGridSize, getPatternMetadata } from '../../src/debug/DebugAppearance.js'

describe('DebugAppearance - Grid Sizing', () => {
  describe('calculateGridSize', () => {
    test('calculates BLINKER grid size (3×3 with padding)', () => {
      const gridSize = calculateGridSize('BLINKER')
      expect(gridSize.cols).toBe(3)  // Pattern already has padding
      expect(gridSize.rows).toBe(3)
    })

    test('calculates PULSAR grid size (13×13)', () => {
      const gridSize = calculateGridSize('PULSAR')
      expect(gridSize.cols).toBe(13)  // Pattern dimensions
      expect(gridSize.rows).toBe(13)
    })

    test('calculates GLIDER grid size (3×3)', () => {
      const gridSize = calculateGridSize('GLIDER')
      expect(gridSize.cols).toBe(3)  // Pattern dimensions
      expect(gridSize.rows).toBe(3)
    })

    test('calculates TOAD grid size (4×4 with padding)', () => {
      const gridSize = calculateGridSize('TOAD')
      expect(gridSize.cols).toBe(4)  // Pattern dimensions
      expect(gridSize.rows).toBe(4)
    })

    test('calculates LIGHTWEIGHT_SPACESHIP grid size (7×6 with padding)', () => {
      const gridSize = calculateGridSize('LIGHTWEIGHT_SPACESHIP')
      expect(gridSize.cols).toBe(7)  // Pattern already has padding
      expect(gridSize.rows).toBe(6)
    })

    test('returns default 7×7 for undefined pattern', () => {
      const gridSize = calculateGridSize(null)
      expect(gridSize.cols).toBe(7)
      expect(gridSize.rows).toBe(7)
    })

    test('returns default 7×7 for invalid pattern name', () => {
      const gridSize = calculateGridSize('NONEXISTENT_PATTERN')
      expect(gridSize.cols).toBe(7)
      expect(gridSize.rows).toBe(7)
    })

    test('handles square patterns correctly', () => {
      // BLINKER is 3×3 (square with padding)
      const blinker = calculateGridSize('BLINKER')
      expect(blinker.cols).toBe(3)
      expect(blinker.rows).toBe(3)
    })

    test('calculates BLOCK grid size (2×2)', () => {
      const gridSize = calculateGridSize('BLOCK')
      expect(gridSize.cols).toBe(2)  // Pattern dimensions
      expect(gridSize.rows).toBe(2)
    })

    test('calculates BEEHIVE grid size (4×3)', () => {
      const gridSize = calculateGridSize('BEEHIVE')
      expect(gridSize.cols).toBe(4)  // Pattern dimensions
      expect(gridSize.rows).toBe(3)
    })
  })

  describe('getPatternMetadata', () => {
    test('returns correct metadata for BLINKER', () => {
      const meta = getPatternMetadata('BLINKER')
      expect(meta.name).toBe('BLINKER')
      expect(meta.dimensions).toBe('3×3')  // Pattern already has padding
      expect(meta.gridSize).toBe('3×3')
    })

    test('returns correct metadata for PULSAR', () => {
      const meta = getPatternMetadata('PULSAR')
      expect(meta.name).toBe('PULSAR')
      expect(meta.dimensions).toBe('13×13')
      expect(meta.gridSize).toBe('13×13')
    })

    test('returns correct metadata for GLIDER', () => {
      const meta = getPatternMetadata('GLIDER')
      expect(meta.name).toBe('GLIDER')
      expect(meta.dimensions).toBe('3×3')
      expect(meta.gridSize).toBe('3×3')
    })

    test('handles pattern with non-square dimensions', () => {
      const meta = getPatternMetadata('LIGHTWEIGHT_SPACESHIP')
      expect(meta.dimensions).toBe('7×6')  // Pattern already has padding
      expect(meta.gridSize).toBe('7×6')
    })

    test('returns correct metadata for BLOCK', () => {
      const meta = getPatternMetadata('BLOCK')
      expect(meta.name).toBe('BLOCK')
      expect(meta.dimensions).toBe('2×2')
      expect(meta.gridSize).toBe('2×2')
    })

    test('returns correct metadata for TOAD', () => {
      const meta = getPatternMetadata('TOAD')
      expect(meta.name).toBe('TOAD')
      expect(meta.dimensions).toBe('4×4')  // Pattern already has padding
      expect(meta.gridSize).toBe('4×4')
    })
  })
})
