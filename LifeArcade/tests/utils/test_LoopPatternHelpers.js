/**
 * Unit tests for LoopPatternHelpers
 *
 * Tests dynamic loop pattern speed control and periodic resets.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { updateLoopPattern } from '../../src/utils/LoopPatternHelpers.js'

describe('LoopPatternHelpers', () => {
  describe('updateLoopPattern', () => {
    let mockGol
    let consoleLogSpy

    beforeEach(() => {
      // Mock GoL engine with loop pattern metadata
      mockGol = {
        isLoopPattern: true,
        loopPeriod: 2, // BLINKER period
        loopPattern: [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
        loopPatternWidth: 3,
        loopPatternHeight: 3,
        generation: 0,
        updateRateFPS: 12,
        cols: 5,
        rows: 5,
        clearGrid: vi.fn(),
        setPattern: vi.fn()
      }

      consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    it('should skip non-loop patterns', () => {
      mockGol.isLoopPattern = false
      updateLoopPattern(mockGol, 30, true)

      expect(mockGol.updateRateFPS).toBe(12) // Unchanged
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should convert loopUpdateRate to updateRateFPS correctly', () => {
      // loopUpdateRate = 30 frames → 60/30 = 2fps
      updateLoopPattern(mockGol, 30, true)

      expect(mockGol.updateRateFPS).toBe(2)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Speed updated: 2.0fps')
      )
    })

    it('should clamp targetFPS between 0.5 and 60', () => {
      // loopUpdateRate = 5 frames → 60/5 = 12fps (within range)
      updateLoopPattern(mockGol, 5, false)
      expect(mockGol.updateRateFPS).toBe(12)

      // loopUpdateRate = 120 frames → 60/120 = 0.5fps (clamped to 0.5)
      updateLoopPattern(mockGol, 120, false)
      expect(mockGol.updateRateFPS).toBe(0.5)

      // loopUpdateRate = 1 frame → 60/1 = 60fps (clamped to 60)
      updateLoopPattern(mockGol, 1, false)
      expect(mockGol.updateRateFPS).toBe(60)
    })

    it('should initialize tracking properties on first call', () => {
      expect(mockGol.loopLastGeneration).toBeUndefined()
      expect(mockGol.loopResetCounter).toBeUndefined()

      updateLoopPattern(mockGol, 30, false)

      expect(mockGol.loopLastGeneration).toBe(0)
      expect(mockGol.loopResetCounter).toBe(0)
    })

    it('should not update updateRateFPS if value unchanged', () => {
      // First call sets updateRateFPS to 2 (logs)
      updateLoopPattern(mockGol, 30, true)
      consoleLogSpy.mockClear()

      // Second call with same value - should not log
      updateLoopPattern(mockGol, 30, true)
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should track generations and increment reset counter', () => {
      mockGol.loopPeriod = 5 // Use period > 3 to avoid reset during test

      mockGol.generation = 0
      updateLoopPattern(mockGol, 30, false)
      expect(mockGol.loopResetCounter).toBe(0)
      expect(mockGol.loopLastGeneration).toBe(0)

      // Generation advances to 1 - triggers increment
      mockGol.generation = 1
      updateLoopPattern(mockGol, 30, false)
      expect(mockGol.loopResetCounter).toBe(1)
      expect(mockGol.loopLastGeneration).toBe(1)

      // Generation advances to 2 - triggers increment
      mockGol.generation = 2
      updateLoopPattern(mockGol, 30, false)
      expect(mockGol.loopResetCounter).toBe(2)
      expect(mockGol.loopLastGeneration).toBe(2)
    })

    it('should reset pattern after loopPeriod generations', () => {
      mockGol.generation = 0
      mockGol.loopPeriod = 2 // BLINKER

      // Initialize at generation 0
      updateLoopPattern(mockGol, 30, true)
      consoleLogSpy.mockClear()
      expect(mockGol.loopResetCounter).toBe(0)

      // Generation 0 → 1 (first update)
      mockGol.generation = 1
      updateLoopPattern(mockGol, 30, true)
      expect(mockGol.loopResetCounter).toBe(1)
      expect(mockGol.clearGrid).not.toHaveBeenCalled()

      // Generation 1 → 2 (second update, triggers reset at period=2)
      mockGol.generation = 2
      updateLoopPattern(mockGol, 30, true)

      expect(mockGol.loopResetCounter).toBe(0) // Reset to 0
      expect(mockGol.clearGrid).toHaveBeenCalledTimes(1)
      expect(mockGol.setPattern).toHaveBeenCalledWith(
        mockGol.loopPattern,
        1, // centerX = Math.floor((5 - 3) / 2) = 1
        1  // centerY = Math.floor((5 - 3) / 2) = 1
      )
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Pattern reset after 2 generations')
      )
    })

    it('should not log when logChanges is false', () => {
      // Clear console spy from previous tests
      consoleLogSpy.mockClear()

      // Configure BEFORE any calls
      mockGol.updateRateFPS = 2 // targetFPS = 60/30 = 2
      mockGol.loopPeriod = 10 // High period to avoid reset during test
      mockGol.generation = 0

      updateLoopPattern(mockGol, 30, false)
      expect(consoleLogSpy).not.toHaveBeenCalled()

      // Advance through generations - should not log
      mockGol.generation = 1
      updateLoopPattern(mockGol, 30, false)
      expect(consoleLogSpy).not.toHaveBeenCalled()

      mockGol.generation = 2
      updateLoopPattern(mockGol, 30, false)
      expect(consoleLogSpy).not.toHaveBeenCalled()
    })

    it('should handle multiple period cycles correctly', () => {
      mockGol.loopPeriod = 3 // PULSAR

      // Initialize at gen 0
      mockGol.generation = 0
      updateLoopPattern(mockGol, 30, false)

      // Cycle through generations 1-9
      for (let gen = 1; gen <= 9; gen++) {
        mockGol.generation = gen
        updateLoopPattern(mockGol, 30, false)
      }

      // Should have reset 3 times (at counter=3, 6, 9)
      // counter increments: 1,2,3(reset), 1,2,3(reset), 1,2,3(reset)
      expect(mockGol.clearGrid).toHaveBeenCalledTimes(3)
      expect(mockGol.loopResetCounter).toBe(0) // Reset to 0 after last cycle
    })

    it('should update speed when loopUpdateRate changes', () => {
      // Start at 30 frames (2fps)
      updateLoopPattern(mockGol, 30, true)
      expect(mockGol.updateRateFPS).toBe(2)

      // Change to 60 frames (1fps)
      consoleLogSpy.mockClear()
      updateLoopPattern(mockGol, 60, true)
      expect(mockGol.updateRateFPS).toBe(1)
      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('Speed updated: 1.0fps')
      )
    })

    it('should handle edge case: generation does not advance', () => {
      mockGol.generation = 5
      updateLoopPattern(mockGol, 30, false)

      const initialCounter = mockGol.loopResetCounter

      // Generation stays the same
      updateLoopPattern(mockGol, 30, false)

      // Counter should not increment
      expect(mockGol.loopResetCounter).toBe(initialCounter)
    })
  })
})
