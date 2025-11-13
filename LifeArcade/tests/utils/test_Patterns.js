/**
 * Unit tests for Patterns library.
 * Tests canonical GoL patterns and pattern utilities.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach } from 'vitest'
import {
  Patterns,
  stampPattern,
  rotatePattern90,
  flipPatternHorizontal,
  flipPatternVertical
} from '../../src/utils/Patterns.js'
import { GoLEngine, ALIVE, DEAD } from '../../src/core/GoLEngine.js'

describe('Patterns', () => {
  describe('Pattern format validation', () => {
    test('BLOCK is 2x2', () => {
      expect(Patterns.BLOCK.length).toBe(2)
      expect(Patterns.BLOCK[0].length).toBe(2)
    })

    test('BLINKER is 3x3', () => {
      expect(Patterns.BLINKER.length).toBe(3)
      expect(Patterns.BLINKER[0].length).toBe(3)
    })

    test('GLIDER is 3x3', () => {
      expect(Patterns.GLIDER.length).toBe(3)
      expect(Patterns.GLIDER[0].length).toBe(3)
    })

    test('all patterns contain only 0s and 1s', () => {
      Object.values(Patterns).forEach(pattern => {
        pattern.forEach(row => {
          row.forEach(cell => {
            expect([0, 1]).toContain(cell)
          })
        })
      })
    })
  })

  describe('Still life patterns', () => {
    test('BLOCK remains stable', () => {
      const engine = new GoLEngine(4, 4)
      engine.setPattern(Patterns.BLOCK, 1, 1)

      const gen0 = engine.getPattern()

      // Update 10 times
      for (let i = 0; i < 10; i++) {
        engine.update()
      }

      const gen10 = engine.getPattern()

      // Pattern should be unchanged
      expect(gen10).toEqual(gen0)
    })

    test('BEEHIVE remains stable', () => {
      const engine = new GoLEngine(6, 5)
      engine.setPattern(Patterns.BEEHIVE, 1, 1)

      const gen0 = engine.getPattern()

      for (let i = 0; i < 10; i++) {
        engine.update()
      }

      const gen10 = engine.getPattern()

      expect(gen10).toEqual(gen0)
    })

    test('BOAT remains stable', () => {
      const engine = new GoLEngine(5, 5)
      engine.setPattern(Patterns.BOAT, 1, 1)

      const gen0 = engine.getPattern()

      for (let i = 0; i < 10; i++) {
        engine.update()
      }

      const gen10 = engine.getPattern()

      expect(gen10).toEqual(gen0)
    })
  })

  describe('Oscillator patterns', () => {
    test('BLINKER oscillates with period 2', () => {
      const engine = new GoLEngine(5, 5)
      engine.setPattern(Patterns.BLINKER, 1, 1)

      const gen0 = engine.getPattern()

      // After 1 update: should be different (horizontal)
      engine.update()
      const gen1 = engine.getPattern()
      expect(gen1).not.toEqual(gen0)

      // After 2 updates: back to original (vertical)
      engine.update()
      const gen2 = engine.getPattern()
      expect(gen2).toEqual(gen0)
    })

    test('TOAD oscillates with period 2', () => {
      const engine = new GoLEngine(6, 4)
      engine.setPattern(Patterns.TOAD, 1, 1)

      const gen0 = engine.getPattern()

      engine.update()
      const gen1 = engine.getPattern()
      expect(gen1).not.toEqual(gen0)

      engine.update()
      const gen2 = engine.getPattern()
      expect(gen2).toEqual(gen0)
    })

    test('BEACON oscillates with period 2', () => {
      const engine = new GoLEngine(6, 6)
      engine.setPattern(Patterns.BEACON, 1, 1)

      const gen0 = engine.getPattern()

      engine.update()
      const gen1 = engine.getPattern()
      expect(gen1).not.toEqual(gen0)

      engine.update()
      const gen2 = engine.getPattern()
      expect(gen2).toEqual(gen0)
    })
  })

  describe('Spaceship patterns', () => {
    test('GLIDER moves diagonally', () => {
      const engine = new GoLEngine(20, 20)
      engine.setPattern(Patterns.GLIDER, 5, 5)

      // Helper to calculate center of mass
      function getCenterOfMass(grid) {
        let sumX = 0, sumY = 0, count = 0
        for (let x = 0; x < grid.length; x++) {
          for (let y = 0; y < grid[x].length; y++) {
            if (grid[x][y] === ALIVE) {
              sumX += x
              sumY += y
              count++
            }
          }
        }
        return { x: sumX / count, y: sumY / count }
      }

      const initialCenter = getCenterOfMass(engine.current)

      // Glider moves 1 cell diagonally per 4 generations (c/4 speed)
      for (let i = 0; i < 4; i++) {
        engine.update()
      }

      const finalCenter = getCenterOfMass(engine.current)

      // Should have moved approximately 1 cell diagonally
      const deltaX = finalCenter.x - initialCenter.x
      const deltaY = finalCenter.y - initialCenter.y

      // Allow small tolerance for center of mass calculation
      expect(Math.abs(deltaX)).toBeGreaterThan(0.5)
      expect(Math.abs(deltaY)).toBeGreaterThan(0.5)
    })

    test('LIGHTWEIGHT_SPACESHIP moves horizontally', () => {
      const engine = new GoLEngine(20, 10)
      engine.setPattern(Patterns.LIGHTWEIGHT_SPACESHIP, 5, 3)

      function getCenterOfMass(grid) {
        let sumX = 0, sumY = 0, count = 0
        for (let x = 0; x < grid.length; x++) {
          for (let y = 0; y < grid[x].length; y++) {
            if (grid[x][y] === ALIVE) {
              sumX += x
              sumY += y
              count++
            }
          }
        }
        return { x: sumX / count, y: sumY / count }
      }

      const initialCenter = getCenterOfMass(engine.current)

      // LWSS moves 1 cell horizontally per 2 generations (c/2 speed)
      for (let i = 0; i < 4; i++) {
        engine.update()
      }

      const finalCenter = getCenterOfMass(engine.current)

      // Should have moved horizontally
      const deltaX = finalCenter.x - initialCenter.x
      expect(Math.abs(deltaX)).toBeGreaterThan(1)
    })
  })

  describe('Methuselah patterns', () => {
    test('R_PENTOMINO evolves for many generations', () => {
      const engine = new GoLEngine(50, 50)
      engine.setPattern(Patterns.R_PENTOMINO, 25, 25)

      const gen0Count = engine.countAliveCells()

      // After 100 generations, should have expanded
      for (let i = 0; i < 100; i++) {
        engine.update()
      }

      const gen100Count = engine.countAliveCells()

      // R-pentomino starts with 5 cells, grows significantly
      expect(gen100Count).toBeGreaterThan(gen0Count)
    })

    test('DIEHARD eventually dies out', () => {
      const engine = new GoLEngine(30, 20)
      engine.setPattern(Patterns.DIEHARD, 10, 10)

      // Diehard stabilizes after 130 generations (dies completely)
      for (let i = 0; i < 150; i++) {
        engine.update()
      }

      const finalCount = engine.countAliveCells()

      // Should be dead or nearly dead
      expect(finalCount).toBeLessThan(10)
    })
  })

  describe('stampPattern utility', () => {
    test('stamps pattern at correct location', () => {
      const grid = Array(10).fill(null).map(() => Array(10).fill(DEAD))
      const pattern = [
        [1, 0],
        [0, 1]
      ]

      stampPattern(grid, pattern, 5, 5, 10, 10)

      expect(grid[5][5]).toBe(ALIVE)
      expect(grid[6][5]).toBe(DEAD)
      expect(grid[5][6]).toBe(DEAD)
      expect(grid[6][6]).toBe(ALIVE)
    })

    test('handles patterns at grid boundaries', () => {
      const grid = Array(10).fill(null).map(() => Array(10).fill(DEAD))
      const pattern = [
        [1, 1],
        [1, 1]
      ]

      // Stamp at edge - should clip
      stampPattern(grid, pattern, 9, 9, 10, 10)

      expect(grid[9][9]).toBe(ALIVE)
      // Other cells would be out of bounds
    })

    test('does not modify cells outside pattern', () => {
      const grid = Array(10).fill(null).map(() => Array(10).fill(DEAD))
      const pattern = [[1]]

      stampPattern(grid, pattern, 5, 5, 10, 10)

      expect(grid[5][5]).toBe(ALIVE)
      expect(grid[4][5]).toBe(DEAD)
      expect(grid[6][5]).toBe(DEAD)
    })
  })

  describe('rotatePattern90 utility', () => {
    test('rotates 2x2 pattern 90 degrees clockwise', () => {
      const pattern = [
        [1, 0],
        [0, 0]
      ]
      const rotated = rotatePattern90(pattern)

      expect(rotated).toEqual([
        [0, 1],
        [0, 0]
      ])
    })

    test('rotates 3x3 pattern correctly', () => {
      const pattern = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
      const rotated = rotatePattern90(pattern)

      expect(rotated).toEqual([
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0]
      ])
    })

    test('rotating 4 times returns to original', () => {
      const original = Patterns.GLIDER
      let rotated = original

      for (let i = 0; i < 4; i++) {
        rotated = rotatePattern90(rotated)
      }

      expect(rotated).toEqual(original)
    })
  })

  describe('flipPatternHorizontal utility', () => {
    test('flips pattern horizontally', () => {
      const pattern = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
      const flipped = flipPatternHorizontal(pattern)

      expect(flipped).toEqual([
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0]
      ])
    })

    test('flipping twice returns to original', () => {
      const original = Patterns.GLIDER
      const flipped = flipPatternHorizontal(flipPatternHorizontal(original))

      expect(flipped).toEqual(original)
    })
  })

  describe('flipPatternVertical utility', () => {
    test('flips pattern vertically', () => {
      const pattern = [
        [1, 0, 0],
        [0, 1, 0],
        [0, 0, 1]
      ]
      const flipped = flipPatternVertical(pattern)

      expect(flipped).toEqual([
        [0, 0, 1],
        [0, 1, 0],
        [1, 0, 0]
      ])
    })

    test('flipping twice returns to original', () => {
      const original = Patterns.GLIDER
      const flipped = flipPatternVertical(flipPatternVertical(original))

      expect(flipped).toEqual(original)
    })
  })

  describe('Pattern authenticity', () => {
    test('all patterns have at least one alive cell', () => {
      Object.entries(Patterns).forEach(([name, pattern]) => {
        const aliveCount = pattern.flat().filter(cell => cell === 1).length
        expect(aliveCount).toBeGreaterThan(0)
      })
    })

    test('all patterns are non-empty', () => {
      Object.entries(Patterns).forEach(([name, pattern]) => {
        expect(pattern.length).toBeGreaterThan(0)
        expect(pattern[0].length).toBeGreaterThan(0)
      })
    })
  })
})
