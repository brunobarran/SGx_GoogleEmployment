/**
 * Unit Tests for PatternRenderer.js
 *
 * Tests all public functions and edge cases.
 * Coverage target: 100%
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  createPatternRenderer,
  getPatternDimensions,
  supportsLoopMode,
  getPatternPeriod,
  getPatternsByCategory,
  getRandomPattern,
  getAllPatterns,
  getPatternCategory,
  RenderMode,
  PatternName,
  PatternPeriod,
  PatternCategory
} from '../../src/utils/PatternRenderer.js'
import { GoLEngine } from '../../src/core/GoLEngine.js'

// ============================================
// TEST SUITE: createPatternRenderer
// ============================================

describe('PatternRenderer - createPatternRenderer', () => {
  describe('Configuration Validation', () => {
    test('should throw error if mode is missing', () => {
      expect(() => createPatternRenderer({
        pattern: PatternName.BLINKER
      })).toThrow('[PatternRenderer] config.mode is required')
    })

    test('should throw error if mode is invalid', () => {
      expect(() => createPatternRenderer({
        mode: 'invalid-mode',
        pattern: PatternName.BLINKER
      })).toThrow('[PatternRenderer] Invalid mode')
    })

    test('should throw error if pattern is missing', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC
      })).toThrow('[PatternRenderer] config.pattern is required')
    })

    test('should throw error if pattern is unknown', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: 'INVALID_PATTERN'
      })).toThrow('[PatternRenderer] Unknown pattern')
    })

    test('should throw error if pattern array contains unknown pattern', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: [PatternName.BLINKER, 'INVALID_PATTERN']
      })).toThrow('[PatternRenderer] Unknown pattern')
    })

    test('should throw error if phase is negative', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: -1
      })).toThrow('[PatternRenderer] config.phase must be a number >= 0')
    })

    test('should throw error if phase is not a number', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 'invalid'
      })).toThrow('[PatternRenderer] config.phase must be a number >= 0')
    })

    test('should throw error if globalCellSize is less than 1', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        globalCellSize: 0
      })).toThrow('[PatternRenderer] config.globalCellSize must be a number >= 1')
    })

    test('should throw error if loopUpdateRate is negative', () => {
      expect(() => createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLINKER,
        loopUpdateRate: -1
      })).toThrow('[PatternRenderer] config.loopUpdateRate must be a number >= 0')
    })
  })

  describe('Static Mode - Single Pattern', () => {
    test('should create static BLINKER at phase 0', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 0,
        globalCellSize: 30
      })

      expect(renderer).toHaveProperty('gol')
      expect(renderer).toHaveProperty('dimensions')
      expect(renderer).toHaveProperty('metadata')

      expect(renderer.gol).toBeInstanceOf(GoLEngine)
      expect(renderer.gol.isFrozen()).toBe(true)

      expect(renderer.metadata.pattern).toBe(PatternName.BLINKER)
      expect(renderer.metadata.phase).toBe(0)
      expect(renderer.metadata.period).toBe(2)
      expect(renderer.metadata.mode).toBe(RenderMode.STATIC)
      expect(renderer.metadata.category).toBe(PatternCategory.OSCILLATOR)
    })

    test('should create static BLINKER at phase 1', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 1,
        globalCellSize: 30
      })

      expect(renderer.metadata.phase).toBe(1)
      expect(renderer.gol.isFrozen()).toBe(true)
    })

    test('should clamp phase to valid range', () => {
      // BLINKER period = 2, valid phases: 0, 1
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 5,  // Out of range
        globalCellSize: 30
      })

      expect(renderer.metadata.phase).toBe(1)  // Clamped to period-1
    })

    test('should use random phase if phase not specified', () => {
      // Run multiple times to ensure randomness
      const phases = new Set()

      for (let i = 0; i < 20; i++) {
        const renderer = createPatternRenderer({
          mode: RenderMode.STATIC,
          pattern: PatternName.BLINKER,
          // phase omitted
          globalCellSize: 30
        })

        phases.add(renderer.metadata.phase)
      }

      // Should have seen both phases (0 and 1) with high probability
      expect(phases.size).toBeGreaterThan(1)
      expect(Array.from(phases).every(p => p >= 0 && p < 2)).toBe(true)
    })

    test('should create static PULSAR at phase 0', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.PULSAR,
        phase: 0,
        globalCellSize: 30
      })

      expect(renderer.metadata.pattern).toBe(PatternName.PULSAR)
      expect(renderer.metadata.period).toBe(3)
      expect(renderer.gol.isFrozen()).toBe(true)
    })

    test('should create static still life (BLOCK)', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLOCK,
        phase: 0,
        globalCellSize: 30
      })

      expect(renderer.metadata.pattern).toBe(PatternName.BLOCK)
      expect(renderer.metadata.period).toBe(1)
      expect(renderer.metadata.category).toBe(PatternCategory.STILL_LIFE)
      expect(renderer.gol.isFrozen()).toBe(true)
    })

    test('should use default globalCellSize if not specified', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 0
        // globalCellSize omitted
      })

      expect(renderer.dimensions.cellSize).toBe(30)  // Default
    })

    test('should respect custom globalCellSize', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 0,
        globalCellSize: 50
      })

      expect(renderer.dimensions.cellSize).toBe(50)
    })

    test('should calculate correct dimensions', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 0,
        globalCellSize: 30
      })

      expect(renderer.dimensions).toHaveProperty('gridSize')
      expect(renderer.dimensions).toHaveProperty('cellSize')
      expect(renderer.dimensions).toHaveProperty('width')
      expect(renderer.dimensions).toHaveProperty('height')
      expect(renderer.dimensions).toHaveProperty('hitboxRadius')

      expect(renderer.dimensions.width).toBe(renderer.dimensions.gridSize * 30)
      expect(renderer.dimensions.height).toBe(renderer.dimensions.gridSize * 30)
      expect(renderer.dimensions.hitboxRadius).toBe(renderer.dimensions.width * 0.6)
    })
  })

  describe('Static Mode - Array of Patterns', () => {
    test('should randomly select pattern from array', () => {
      const patterns = [PatternName.BLINKER, PatternName.TOAD, PatternName.BEACON]
      const selectedPatterns = new Set()

      // Run 50 times to ensure all patterns get selected
      for (let i = 0; i < 50; i++) {
        const renderer = createPatternRenderer({
          mode: RenderMode.STATIC,
          pattern: patterns,
          globalCellSize: 30
        })

        selectedPatterns.add(renderer.metadata.pattern)
      }

      // Should have selected multiple patterns (high probability)
      expect(selectedPatterns.size).toBeGreaterThan(1)
      expect(Array.from(selectedPatterns).every(p => patterns.includes(p))).toBe(true)
    })

    test('should use random phase for each selected pattern', () => {
      const patterns = [PatternName.BLINKER, PatternName.TOAD]

      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: patterns,
        // phase omitted = random
        globalCellSize: 30
      })

      const period = PatternPeriod[renderer.metadata.pattern]
      expect(renderer.metadata.phase).toBeGreaterThanOrEqual(0)
      expect(renderer.metadata.phase).toBeLessThan(period)
    })

    test('should work with single-element array', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: [PatternName.BLINKER],
        phase: 0,
        globalCellSize: 30
      })

      expect(renderer.metadata.pattern).toBe(PatternName.BLINKER)
    })
  })

  describe('Loop Mode - Single Pattern', () => {
    test('should create loop BLINKER', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLINKER,
        globalCellSize: 30,
        loopUpdateRate: 10
      })

      expect(renderer.gol).toBeInstanceOf(GoLEngine)
      expect(renderer.gol.isFrozen()).toBe(false)

      expect(renderer.metadata.pattern).toBe(PatternName.BLINKER)
      expect(renderer.metadata.phase).toBeNull()
      expect(renderer.metadata.period).toBe(2)
      expect(renderer.metadata.mode).toBe(RenderMode.LOOP)

      // Check loop metadata
      expect(renderer.gol.isLoopPattern).toBe(true)
      expect(renderer.gol.loopPeriod).toBe(2)
      expect(renderer.gol.loopPattern).toBeDefined()
      expect(renderer.gol.loopPatternWidth).toBeDefined()
      expect(renderer.gol.loopPatternHeight).toBeDefined()
      expect(renderer.gol.loopResetCounter).toBe(0)
      expect(renderer.gol.loopLastGeneration).toBe(0)
    })

    test('should create loop PULSAR', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.PULSAR,
        globalCellSize: 30,
        loopUpdateRate: 10
      })

      expect(renderer.metadata.pattern).toBe(PatternName.PULSAR)
      expect(renderer.metadata.period).toBe(3)
      expect(renderer.gol.isLoopPattern).toBe(true)
      expect(renderer.gol.loopPeriod).toBe(3)
    })

    test('should warn for still life in loop mode', () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn')

      createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLOCK,  // Still life (period 1)
        globalCellSize: 30,
        loopUpdateRate: 10
      })

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('still life (period 1)')
      )

      consoleWarnSpy.mockRestore()
    })

    test('should use default loopUpdateRate if not specified', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLINKER,
        globalCellSize: 30
        // loopUpdateRate omitted
      })

      expect(renderer.gol.updateRateFPS).toBe(10)  // Default
    })

    test('should respect custom loopUpdateRate', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLINKER,
        globalCellSize: 30,
        loopUpdateRate: 15
      })

      expect(renderer.gol.updateRateFPS).toBe(15)
    })

    test('should calculate correct dimensions', () => {
      const renderer = createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.BLINKER,
        globalCellSize: 30,
        loopUpdateRate: 10
      })

      expect(renderer.dimensions).toHaveProperty('gridSize')
      expect(renderer.dimensions).toHaveProperty('cellSize')
      expect(renderer.dimensions).toHaveProperty('width')
      expect(renderer.dimensions).toHaveProperty('height')
      expect(renderer.dimensions).toHaveProperty('hitboxRadius')

      expect(renderer.dimensions.cellSize).toBe(30)
    })
  })

  describe('Loop Mode - Array of Patterns', () => {
    test('should randomly select pattern from array', () => {
      const patterns = [PatternName.BLINKER, PatternName.PULSAR, PatternName.TOAD]
      const selectedPatterns = new Set()

      for (let i = 0; i < 50; i++) {
        const renderer = createPatternRenderer({
          mode: RenderMode.LOOP,
          pattern: patterns,
          globalCellSize: 30,
          loopUpdateRate: 10
        })

        selectedPatterns.add(renderer.metadata.pattern)
      }

      expect(selectedPatterns.size).toBeGreaterThan(1)
      expect(Array.from(selectedPatterns).every(p => patterns.includes(p))).toBe(true)
    })
  })

  describe('Console Logging', () => {
    test('should log static pattern creation', () => {
      const consoleLogSpy = vi.spyOn(console, 'log')

      createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        phase: 0,
        globalCellSize: 30
      })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PatternRenderer] Static: BLINKER')
      )

      consoleLogSpy.mockRestore()
    })

    test('should log loop pattern creation', () => {
      const consoleLogSpy = vi.spyOn(console, 'log')

      createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: PatternName.PULSAR,
        globalCellSize: 30,
        loopUpdateRate: 10
      })

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[PatternRenderer] Loop: PULSAR')
      )

      consoleLogSpy.mockRestore()
    })
  })
})

// ============================================
// TEST SUITE: getPatternDimensions
// ============================================

describe('PatternRenderer - getPatternDimensions', () => {
  test('should calculate dimensions for BLINKER', () => {
    const dims = getPatternDimensions(PatternName.BLINKER, 30)

    expect(dims).toHaveProperty('gridSize')
    expect(dims).toHaveProperty('cellSize')
    expect(dims).toHaveProperty('width')
    expect(dims).toHaveProperty('height')
    expect(dims).toHaveProperty('hitboxRadius')

    expect(dims.cellSize).toBe(30)
    expect(dims.width).toBe(dims.gridSize * 30)
    expect(dims.height).toBe(dims.gridSize * 30)
    expect(dims.hitboxRadius).toBe(dims.width * 0.6)
  })

  test('should calculate dimensions for PULSAR', () => {
    const dims = getPatternDimensions(PatternName.PULSAR, 30)

    expect(dims.gridSize).toBeGreaterThan(0)
    expect(dims.cellSize).toBe(30)
  })

  test('should use default cellSize if not specified', () => {
    const dims = getPatternDimensions(PatternName.BLINKER)

    expect(dims.cellSize).toBe(30)
  })

  test('should respect custom cellSize', () => {
    const dims = getPatternDimensions(PatternName.BLINKER, 50)

    expect(dims.cellSize).toBe(50)
    expect(dims.width).toBe(dims.gridSize * 50)
  })

  test('should throw error for unknown pattern', () => {
    expect(() => getPatternDimensions('INVALID_PATTERN', 30)).toThrow(
      '[PatternRenderer] Unknown pattern'
    )
  })

  test('should work for all canonical patterns', () => {
    const patterns = Object.keys(PatternName)

    patterns.forEach(patternKey => {
      const patternName = PatternName[patternKey]
      expect(() => getPatternDimensions(patternName, 30)).not.toThrow()
    })
  })
})

// ============================================
// TEST SUITE: supportsLoopMode
// ============================================

describe('PatternRenderer - supportsLoopMode', () => {
  test('should return true for oscillators', () => {
    expect(supportsLoopMode(PatternName.BLINKER)).toBe(true)
    expect(supportsLoopMode(PatternName.TOAD)).toBe(true)
    expect(supportsLoopMode(PatternName.BEACON)).toBe(true)
    expect(supportsLoopMode(PatternName.PULSAR)).toBe(true)
  })

  test('should return true for spaceships', () => {
    expect(supportsLoopMode(PatternName.GLIDER)).toBe(true)
    expect(supportsLoopMode(PatternName.LIGHTWEIGHT_SPACESHIP)).toBe(true)
  })

  test('should return false for still lifes', () => {
    expect(supportsLoopMode(PatternName.BLOCK)).toBe(false)
    expect(supportsLoopMode(PatternName.BEEHIVE)).toBe(false)
    expect(supportsLoopMode(PatternName.LOAF)).toBe(false)
    expect(supportsLoopMode(PatternName.BOAT)).toBe(false)
    expect(supportsLoopMode(PatternName.TUB)).toBe(false)
    expect(supportsLoopMode(PatternName.POND)).toBe(false)
    expect(supportsLoopMode(PatternName.SHIP)).toBe(false)
  })

  test('should return false for unknown patterns', () => {
    expect(supportsLoopMode('UNKNOWN_PATTERN')).toBe(false)
  })
})

// ============================================
// TEST SUITE: getPatternPeriod
// ============================================

describe('PatternRenderer - getPatternPeriod', () => {
  test('should return correct period for oscillators', () => {
    expect(getPatternPeriod(PatternName.BLINKER)).toBe(2)
    expect(getPatternPeriod(PatternName.TOAD)).toBe(2)
    expect(getPatternPeriod(PatternName.BEACON)).toBe(2)
    expect(getPatternPeriod(PatternName.PULSAR)).toBe(3)
  })

  test('should return correct period for spaceships', () => {
    expect(getPatternPeriod(PatternName.GLIDER)).toBe(4)
    expect(getPatternPeriod(PatternName.LIGHTWEIGHT_SPACESHIP)).toBe(4)
  })

  test('should return 1 for still lifes', () => {
    expect(getPatternPeriod(PatternName.BLOCK)).toBe(1)
    expect(getPatternPeriod(PatternName.BEEHIVE)).toBe(1)
    expect(getPatternPeriod(PatternName.LOAF)).toBe(1)
  })

  test('should return 1 for unknown patterns', () => {
    expect(getPatternPeriod('UNKNOWN_PATTERN')).toBe(1)
  })
})

// ============================================
// TEST SUITE: getPatternsByCategory
// ============================================

describe('PatternRenderer - getPatternsByCategory', () => {
  test('should return all still lifes', () => {
    const stillLifes = getPatternsByCategory(PatternCategory.STILL_LIFE)

    expect(stillLifes).toBeInstanceOf(Array)
    expect(stillLifes.length).toBeGreaterThan(0)
    expect(stillLifes).toContain(PatternName.BLOCK)
    expect(stillLifes).toContain(PatternName.BEEHIVE)
    expect(stillLifes).toContain(PatternName.LOAF)
    expect(stillLifes).toContain(PatternName.BOAT)
    expect(stillLifes).toContain(PatternName.TUB)
    expect(stillLifes).toContain(PatternName.POND)
    expect(stillLifes).toContain(PatternName.SHIP)
  })

  test('should return all oscillators', () => {
    const oscillators = getPatternsByCategory(PatternCategory.OSCILLATOR)

    expect(oscillators).toBeInstanceOf(Array)
    expect(oscillators.length).toBeGreaterThan(0)
    expect(oscillators).toContain(PatternName.BLINKER)
    expect(oscillators).toContain(PatternName.TOAD)
    expect(oscillators).toContain(PatternName.BEACON)
    expect(oscillators).toContain(PatternName.PULSAR)
  })

  test('should return all spaceships', () => {
    const spaceships = getPatternsByCategory(PatternCategory.SPACESHIP)

    expect(spaceships).toBeInstanceOf(Array)
    expect(spaceships.length).toBeGreaterThan(0)
    expect(spaceships).toContain(PatternName.GLIDER)
    expect(spaceships).toContain(PatternName.LIGHTWEIGHT_SPACESHIP)
  })

  test('should return empty array for unknown category', () => {
    const result = getPatternsByCategory('unknown-category')

    expect(result).toBeInstanceOf(Array)
    expect(result.length).toBe(0)
  })
})

// ============================================
// TEST SUITE: getRandomPattern
// ============================================

describe('PatternRenderer - getRandomPattern', () => {
  test('should return random oscillator', () => {
    const oscillators = getPatternsByCategory(PatternCategory.OSCILLATOR)
    const selectedPatterns = new Set()

    // Run 50 times
    for (let i = 0; i < 50; i++) {
      const pattern = getRandomPattern(PatternCategory.OSCILLATOR)
      selectedPatterns.add(pattern)
      expect(oscillators).toContain(pattern)
    }

    // Should have multiple patterns (high probability)
    expect(selectedPatterns.size).toBeGreaterThan(1)
  })

  test('should return random still life', () => {
    const stillLifes = getPatternsByCategory(PatternCategory.STILL_LIFE)
    const pattern = getRandomPattern(PatternCategory.STILL_LIFE)

    expect(stillLifes).toContain(pattern)
  })

  test('should return random spaceship', () => {
    const spaceships = getPatternsByCategory(PatternCategory.SPACESHIP)
    const pattern = getRandomPattern(PatternCategory.SPACESHIP)

    expect(spaceships).toContain(pattern)
  })

  test('should throw error for unknown category', () => {
    expect(() => getRandomPattern('unknown-category')).toThrow(
      '[PatternRenderer] No patterns found for category'
    )
  })
})

// ============================================
// TEST SUITE: getAllPatterns
// ============================================

describe('PatternRenderer - getAllPatterns', () => {
  test('should return all pattern names', () => {
    const patterns = getAllPatterns()

    expect(patterns).toBeInstanceOf(Array)
    expect(patterns.length).toBe(16)  // 7 still lifes + 4 oscillators + 5 spaceships

    expect(patterns).toContain('BLOCK')
    expect(patterns).toContain('BLINKER')
    expect(patterns).toContain('PULSAR')
    expect(patterns).toContain('GLIDER')
  })

  test('should return array of strings', () => {
    const patterns = getAllPatterns()

    patterns.forEach(pattern => {
      expect(typeof pattern).toBe('string')
    })
  })
})

// ============================================
// TEST SUITE: getPatternCategory
// ============================================

describe('PatternRenderer - getPatternCategory', () => {
  test('should return correct category for still lifes', () => {
    expect(getPatternCategory(PatternName.BLOCK)).toBe(PatternCategory.STILL_LIFE)
    expect(getPatternCategory(PatternName.BEEHIVE)).toBe(PatternCategory.STILL_LIFE)
  })

  test('should return correct category for oscillators', () => {
    expect(getPatternCategory(PatternName.BLINKER)).toBe(PatternCategory.OSCILLATOR)
    expect(getPatternCategory(PatternName.PULSAR)).toBe(PatternCategory.OSCILLATOR)
  })

  test('should return correct category for spaceships', () => {
    expect(getPatternCategory(PatternName.GLIDER)).toBe(PatternCategory.SPACESHIP)
    expect(getPatternCategory(PatternName.LIGHTWEIGHT_SPACESHIP)).toBe(PatternCategory.SPACESHIP)
  })

  test('should return "unknown" for unknown patterns', () => {
    expect(getPatternCategory('UNKNOWN_PATTERN')).toBe('unknown')
  })
})

// ============================================
// TEST SUITE: Enums and Constants
// ============================================

describe('PatternRenderer - Enums and Constants', () => {
  test('RenderMode should have correct values', () => {
    expect(RenderMode.STATIC).toBe('static')
    expect(RenderMode.LOOP).toBe('loop')
  })

  test('PatternName should have all canonical patterns', () => {
    expect(Object.keys(PatternName).length).toBe(16)  // 7 still lifes + 4 oscillators + 5 spaceships
  })

  test('PatternPeriod should match pattern names', () => {
    const patternNames = Object.keys(PatternName)

    patternNames.forEach(key => {
      const patternName = PatternName[key]
      expect(PatternPeriod[patternName]).toBeDefined()
      expect(typeof PatternPeriod[patternName]).toBe('number')
      expect(PatternPeriod[patternName]).toBeGreaterThanOrEqual(1)
    })
  })

  test('PatternCategory should have correct values', () => {
    expect(PatternCategory.STILL_LIFE).toBe('still-life')
    expect(PatternCategory.OSCILLATOR).toBe('oscillator')
    expect(PatternCategory.SPACESHIP).toBe('spaceship')
  })
})

// ============================================
// TEST SUITE: Edge Cases and Integration
// ============================================

describe('PatternRenderer - Edge Cases', () => {
  test('should handle very small globalCellSize', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.STATIC,
      pattern: PatternName.BLINKER,
      phase: 0,
      globalCellSize: 1
    })

    expect(renderer.dimensions.cellSize).toBe(1)
    expect(renderer.dimensions.width).toBeGreaterThan(0)
  })

  test('should handle very large globalCellSize', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.STATIC,
      pattern: PatternName.BLINKER,
      phase: 0,
      globalCellSize: 100
    })

    expect(renderer.dimensions.cellSize).toBe(100)
    expect(renderer.dimensions.width).toBeGreaterThan(0)
  })

  test('should handle loopUpdateRate of 0', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: PatternName.BLINKER,
      globalCellSize: 30,
      loopUpdateRate: 0
    })

    // GoLEngine uses default when 0 passed, verify it doesn't crash
    expect(renderer.gol).toBeInstanceOf(GoLEngine)
    expect(renderer.gol.updateRateFPS).toBeGreaterThanOrEqual(0)
  })

  test('should handle very high loopUpdateRate', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: PatternName.BLINKER,
      globalCellSize: 30,
      loopUpdateRate: 60
    })

    expect(renderer.gol.updateRateFPS).toBe(60)
  })

  test('should work with all patterns in static mode', () => {
    const patterns = Object.values(PatternName)

    patterns.forEach(pattern => {
      expect(() => createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: pattern,
        phase: 0,
        globalCellSize: 30
      })).not.toThrow()
    })
  })

  test('should work with all patterns in loop mode', () => {
    const patterns = Object.values(PatternName)

    patterns.forEach(pattern => {
      expect(() => createPatternRenderer({
        mode: RenderMode.LOOP,
        pattern: pattern,
        globalCellSize: 30,
        loopUpdateRate: 10
      })).not.toThrow()
    })
  })
})

// ============================================
// TEST SUITE: GoL Engine Integration
// ============================================

describe('PatternRenderer - GoL Engine Integration', () => {
  test('static renderer should create frozen engine', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.STATIC,
      pattern: PatternName.BLINKER,
      phase: 0,
      globalCellSize: 30
    })

    expect(renderer.gol.isFrozen()).toBe(true)
  })

  test('loop renderer should create unfrozen engine', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: PatternName.BLINKER,
      globalCellSize: 30,
      loopUpdateRate: 10
    })

    expect(renderer.gol.isFrozen()).toBe(false)
  })

  test('loop renderer should set loop metadata correctly', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: PatternName.PULSAR,
      globalCellSize: 30,
      loopUpdateRate: 10
    })

    expect(renderer.gol.isLoopPattern).toBe(true)
    expect(renderer.gol.loopPeriod).toBe(3)
    expect(renderer.gol.loopPattern).toBeDefined()
    expect(renderer.gol.loopPatternWidth).toBeGreaterThan(0)
    expect(renderer.gol.loopPatternHeight).toBeGreaterThan(0)
  })

  test('static renderer should have pattern cells', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.STATIC,
      pattern: PatternName.BLINKER,
      phase: 0,
      globalCellSize: 30
    })

    // Count alive cells
    let aliveCells = 0
    for (let x = 0; x < renderer.gol.cols; x++) {
      for (let y = 0; y < renderer.gol.rows; y++) {
        if (renderer.gol.current[x][y] === 1) {
          aliveCells++
        }
      }
    }

    expect(aliveCells).toBeGreaterThan(0)
  })

  test('loop renderer should have pattern cells', () => {
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: PatternName.BLINKER,
      globalCellSize: 30,
      loopUpdateRate: 10
    })

    // Count alive cells
    let aliveCells = 0
    for (let x = 0; x < renderer.gol.cols; x++) {
      for (let y = 0; y < renderer.gol.rows; y++) {
        if (renderer.gol.current[x][y] === 1) {
          aliveCells++
        }
      }
    }

    expect(aliveCells).toBeGreaterThan(0)
  })
})
