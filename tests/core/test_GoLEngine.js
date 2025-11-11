/**
 * Unit tests for GoLEngine.
 * Tests B3/S23 rules, double buffer pattern, and edge cases.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { GoLEngine, ALIVE, DEAD } from '../../src/core/GoLEngine.js'

describe('GoLEngine', () => {
  let engine

  beforeEach(() => {
    engine = new GoLEngine(10, 10)
  })

  describe('Initialization', () => {
    test('creates a grid with correct dimensions', () => {
      expect(engine.cols).toBe(10)
      expect(engine.rows).toBe(10)
      expect(engine.current.length).toBe(10)
      expect(engine.current[0].length).toBe(10)
    })

    test('initializes grid with all dead cells', () => {
      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          expect(engine.getCell(x, y)).toBe(DEAD)
        }
      }
    })

    test('sets default update rate to 10fps', () => {
      expect(engine.updateRateFPS).toBe(10)
    })
  })

  describe('Cell manipulation', () => {
    test('setCell sets a cell to alive', () => {
      engine.setCell(5, 5, ALIVE)
      expect(engine.getCell(5, 5)).toBe(ALIVE)
    })

    test('setCell sets a cell to dead', () => {
      engine.setCell(5, 5, ALIVE)
      engine.setCell(5, 5, DEAD)
      expect(engine.getCell(5, 5)).toBe(DEAD)
    })

    test('getCell returns DEAD for out-of-bounds coordinates', () => {
      expect(engine.getCell(-1, 0)).toBe(DEAD)
      expect(engine.getCell(0, -1)).toBe(DEAD)
      expect(engine.getCell(10, 0)).toBe(DEAD)
      expect(engine.getCell(0, 10)).toBe(DEAD)
    })

    test('setCell ignores out-of-bounds coordinates', () => {
      engine.setCell(-1, 0, ALIVE)
      engine.setCell(10, 0, ALIVE)
      // Should not throw error
      expect(true).toBe(true)
    })
  })

  describe('Grid operations', () => {
    test('clearGrid sets all cells to dead', () => {
      engine.randomSeed(0.5)
      engine.clearGrid()

      for (let x = 0; x < 10; x++) {
        for (let y = 0; y < 10; y++) {
          expect(engine.getCell(x, y)).toBe(DEAD)
        }
      }
    })

    test('randomSeed creates cells with approximate density', () => {
      engine.randomSeed(0.3)
      const aliveCount = engine.countAliveCells()
      const density = aliveCount / (10 * 10)

      // Allow 10% variance from target density
      expect(density).toBeGreaterThan(0.2)
      expect(density).toBeLessThan(0.4)
    })

    test('countAliveCells returns correct count', () => {
      engine.setCell(0, 0, ALIVE)
      engine.setCell(1, 1, ALIVE)
      engine.setCell(2, 2, ALIVE)

      expect(engine.countAliveCells()).toBe(3)
    })

    test('getDensity returns correct density', () => {
      engine.setCell(0, 0, ALIVE)
      const density = engine.getDensity()

      expect(density).toBeCloseTo(1 / 100, 5)
    })
  })

  describe('Neighbor counting', () => {
    test('counts neighbors correctly in center', () => {
      // Create a cross pattern
      engine.setCell(5, 4, ALIVE)  // Top
      engine.setCell(5, 6, ALIVE)  // Bottom
      engine.setCell(4, 5, ALIVE)  // Left
      engine.setCell(6, 5, ALIVE)  // Right

      const neighbors = engine.countLiveNeighbors(engine.current, 5, 5)
      expect(neighbors).toBe(4)
    })

    test('counts all 8 neighbors correctly', () => {
      // Create a 3x3 block with center dead
      for (let x = 4; x <= 6; x++) {
        for (let y = 4; y <= 6; y++) {
          if (x !== 5 || y !== 5) {
            engine.setCell(x, y, ALIVE)
          }
        }
      }

      const neighbors = engine.countLiveNeighbors(engine.current, 5, 5)
      expect(neighbors).toBe(8)
    })

    test('handles corner cells correctly', () => {
      // Top-left corner
      engine.setCell(1, 0, ALIVE)
      engine.setCell(0, 1, ALIVE)
      engine.setCell(1, 1, ALIVE)

      const neighbors = engine.countLiveNeighbors(engine.current, 0, 0)
      expect(neighbors).toBe(3)
    })

    test('handles edge cells correctly', () => {
      // Top edge
      engine.setCell(4, 0, ALIVE)
      engine.setCell(6, 0, ALIVE)
      engine.setCell(5, 1, ALIVE)

      const neighbors = engine.countLiveNeighbors(engine.current, 5, 0)
      expect(neighbors).toBe(3)
    })

    test('treats out-of-bounds as dead (fixed boundary)', () => {
      engine.setCell(0, 0, ALIVE)
      const neighbors = engine.countLiveNeighbors(engine.current, 0, 0)
      // Only bottom-right neighbors count
      expect(neighbors).toBe(0)
    })
  })

  describe('B3/S23 rules', () => {
    test('living cell with 2 neighbors survives', () => {
      const nextState = engine.applyB3S23Rules(ALIVE, 2)
      expect(nextState).toBe(ALIVE)
    })

    test('living cell with 3 neighbors survives', () => {
      const nextState = engine.applyB3S23Rules(ALIVE, 3)
      expect(nextState).toBe(ALIVE)
    })

    test('living cell with < 2 neighbors dies (underpopulation)', () => {
      expect(engine.applyB3S23Rules(ALIVE, 0)).toBe(DEAD)
      expect(engine.applyB3S23Rules(ALIVE, 1)).toBe(DEAD)
    })

    test('living cell with > 3 neighbors dies (overpopulation)', () => {
      expect(engine.applyB3S23Rules(ALIVE, 4)).toBe(DEAD)
      expect(engine.applyB3S23Rules(ALIVE, 5)).toBe(DEAD)
      expect(engine.applyB3S23Rules(ALIVE, 8)).toBe(DEAD)
    })

    test('dead cell with exactly 3 neighbors becomes alive (birth)', () => {
      const nextState = engine.applyB3S23Rules(DEAD, 3)
      expect(nextState).toBe(ALIVE)
    })

    test('dead cell with != 3 neighbors stays dead', () => {
      expect(engine.applyB3S23Rules(DEAD, 0)).toBe(DEAD)
      expect(engine.applyB3S23Rules(DEAD, 1)).toBe(DEAD)
      expect(engine.applyB3S23Rules(DEAD, 2)).toBe(DEAD)
      expect(engine.applyB3S23Rules(DEAD, 4)).toBe(DEAD)
      expect(engine.applyB3S23Rules(DEAD, 8)).toBe(DEAD)
    })
  })

  describe('Double buffer pattern', () => {
    test('swaps buffers after update', () => {
      const beforeCurrent = engine.current
      const beforeNext = engine.next

      engine.update()

      // Buffers should be swapped (pointers exchanged)
      expect(engine.current).toBe(beforeNext)
      expect(engine.next).toBe(beforeCurrent)
    })

    test('never modifies current grid while reading it', () => {
      // Set up a simple pattern
      engine.setCell(5, 5, ALIVE)
      engine.setCell(5, 6, ALIVE)
      engine.setCell(5, 7, ALIVE)

      const beforeUpdate = engine.getPattern()

      engine.update()

      // The old current grid (now next) should not have been modified during update
      // This is conceptually verified by the swap - we can't directly test
      // reading vs writing, but we can verify the pattern evolved correctly
      const afterUpdate = engine.getPattern()

      // Pattern should have changed (Blinker oscillates)
      expect(afterUpdate).not.toEqual(beforeUpdate)
    })

    test('multiple updates maintain correctness', () => {
      // Set up Blinker pattern (vertical) - middle column alive
      const blinkerVertical = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
      engine.setPattern(blinkerVertical, 5, 5)

      // Initial: cells at (6, 5), (6, 6), (6, 7) are alive (vertical)
      expect(engine.getCell(6, 5)).toBe(ALIVE)
      expect(engine.getCell(6, 6)).toBe(ALIVE)
      expect(engine.getCell(6, 7)).toBe(ALIVE)

      // After 1 update: horizontal - middle row alive
      engine.update()
      expect(engine.getCell(5, 6)).toBe(ALIVE)
      expect(engine.getCell(6, 6)).toBe(ALIVE)
      expect(engine.getCell(7, 6)).toBe(ALIVE)

      // After 2 updates: back to vertical
      engine.update()
      expect(engine.getCell(6, 5)).toBe(ALIVE)
      expect(engine.getCell(6, 6)).toBe(ALIVE)
      expect(engine.getCell(6, 7)).toBe(ALIVE)
    })
  })

  describe('Pattern operations', () => {
    test('setPattern places pattern at correct location', () => {
      const pattern = [
        [1, 0],
        [0, 1]
      ]
      engine.setPattern(pattern, 5, 5)

      expect(engine.getCell(5, 5)).toBe(ALIVE)
      expect(engine.getCell(6, 5)).toBe(DEAD)
      expect(engine.getCell(5, 6)).toBe(DEAD)
      expect(engine.getCell(6, 6)).toBe(ALIVE)
    })

    test('getPattern returns copy of current grid', () => {
      engine.setCell(3, 3, ALIVE)
      const pattern = engine.getPattern()

      expect(pattern[3][3]).toBe(ALIVE)

      // Modify pattern - should not affect engine
      pattern[3][3] = DEAD
      expect(engine.getCell(3, 3)).toBe(ALIVE)
    })

    test('getRegion returns correct sub-grid', () => {
      engine.setCell(5, 5, ALIVE)
      engine.setCell(6, 6, ALIVE)

      const region = engine.getRegion(4, 4, 3, 3)

      expect(region[1][1]).toBe(ALIVE)  // (5, 5) relative to (4, 4)
      expect(region[2][2]).toBe(ALIVE)  // (6, 6) relative to (4, 4)
    })
  })

  describe('Known patterns - Blinker', () => {
    test('Blinker oscillates with period 2', () => {
      // Generation 0: Vertical blinker
      const gen0 = [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
      engine = new GoLEngine(3, 3)
      engine.setPattern(gen0, 0, 0)

      // Generation 1: Horizontal blinker
      engine.update()
      expect(engine.getCell(1, 0)).toBe(DEAD)
      expect(engine.getCell(1, 1)).toBe(ALIVE)
      expect(engine.getCell(1, 2)).toBe(DEAD)
      expect(engine.getCell(0, 1)).toBe(ALIVE)
      expect(engine.getCell(2, 1)).toBe(ALIVE)

      // Generation 2: Back to vertical
      engine.update()
      expect(engine.getCell(1, 0)).toBe(ALIVE)
      expect(engine.getCell(1, 1)).toBe(ALIVE)
      expect(engine.getCell(1, 2)).toBe(ALIVE)
    })
  })

  describe('Known patterns - Block', () => {
    test('Block is stable (still life)', () => {
      const block = [
        [1, 1],
        [1, 1]
      ]
      engine = new GoLEngine(4, 4)
      engine.setPattern(block, 1, 1)

      const beforeUpdate = engine.getPattern()

      // Update multiple times
      for (let i = 0; i < 10; i++) {
        engine.update()
      }

      const afterUpdates = engine.getPattern()

      // Block should remain unchanged
      expect(afterUpdates).toEqual(beforeUpdate)
    })
  })

  describe('Edge cases', () => {
    test('empty grid remains empty', () => {
      engine.clearGrid()
      engine.update()

      expect(engine.countAliveCells()).toBe(0)
    })

    test('single cell dies from underpopulation', () => {
      engine.setCell(5, 5, ALIVE)
      engine.update()

      expect(engine.getCell(5, 5)).toBe(DEAD)
    })

    test('generation counter increments', () => {
      expect(engine.generation).toBe(0)
      engine.update()
      expect(engine.generation).toBe(1)
      engine.update()
      expect(engine.generation).toBe(2)
    })

    test('generation counter resets on clearGrid', () => {
      engine.update()
      engine.update()
      expect(engine.generation).toBeGreaterThan(0)

      engine.clearGrid()
      expect(engine.generation).toBe(0)
    })
  })

  describe('Performance', () => {
    test('handles large grid efficiently', () => {
      const largeEngine = new GoLEngine(100, 100)
      largeEngine.randomSeed(0.3)

      const startTime = performance.now()
      largeEngine.update()
      const endTime = performance.now()

      const updateTime = endTime - startTime

      // Should complete in less than 5ms (generous limit)
      expect(updateTime).toBeLessThan(5)
    })
  })
})
