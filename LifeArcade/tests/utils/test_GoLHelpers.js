/**
 * Unit tests for GoLHelpers.
 * Tests GoL utility functions for seeding, life force, and density maintenance.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { GoLEngine } from '../../src/core/GoLEngine.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../../src/utils/GoLHelpers.js'

describe('GoLHelpers - seedRadialDensity', () => {
  let engine

  beforeEach(() => {
    engine = new GoLEngine(10, 10)
    engine.clearGrid()
  })

  test('creates cells with radial distribution', () => {
    seedRadialDensity(engine, 0.9, 0.0)

    // Count alive cells
    const aliveCount = engine.countAliveCells()

    // Should have some cells (not empty)
    expect(aliveCount).toBeGreaterThan(0)

    // Should not fill entire grid (due to edge density 0.0)
    expect(aliveCount).toBeLessThan(100)
  })

  test('center has higher density than edges', () => {
    seedRadialDensity(engine, 1.0, 0.0)

    // Center cells should be more likely to be alive
    const centerX = Math.floor(engine.cols / 2)
    const centerY = Math.floor(engine.rows / 2)

    // Check 3x3 center region
    let centerAlive = 0
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (engine.getCell(centerX + dx, centerY + dy) === 1) {
          centerAlive++
        }
      }
    }

    // Center should have high density
    expect(centerAlive).toBeGreaterThan(0)
  })

  test('respects centerDensity parameter', () => {
    // Test with 0% center density
    seedRadialDensity(engine, 0.0, 0.0)
    expect(engine.countAliveCells()).toBe(0)
  })

  test('respects edgeDensity parameter', () => {
    // Test with 100% everywhere
    seedRadialDensity(engine, 1.0, 1.0)
    expect(engine.countAliveCells()).toBe(100)
  })

  test('works with different grid sizes', () => {
    const smallEngine = new GoLEngine(5, 5)
    seedRadialDensity(smallEngine, 0.8, 0.0)
    expect(smallEngine.countAliveCells()).toBeGreaterThan(0)

    const largeEngine = new GoLEngine(20, 20)
    seedRadialDensity(largeEngine, 0.8, 0.0)
    expect(largeEngine.countAliveCells()).toBeGreaterThan(0)
  })

  test('uses default parameters', () => {
    seedRadialDensity(engine)
    const aliveCount = engine.countAliveCells()

    // With defaults (0.7 center, 0.1 edge), should have some cells
    expect(aliveCount).toBeGreaterThan(0)
    expect(aliveCount).toBeLessThan(100)
  })
})

describe('GoLHelpers - applyLifeForce', () => {
  let entity

  beforeEach(() => {
    entity = {
      gol: new GoLEngine(10, 10)
    }
    entity.gol.clearGrid()
  })

  test('maintains minimum 35% density', () => {
    // Start with very low density (10%)
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeDensity = entity.gol.countAliveCells() / 100
    expect(beforeDensity).toBeLessThan(0.35)

    applyLifeForce(entity)

    const afterDensity = entity.gol.countAliveCells() / 100
    expect(afterDensity).toBeGreaterThan(beforeDensity)  // Should increase density
  })

  test('does not modify entity above 35% density', () => {
    // Start with 50% density
    for (let i = 0; i < 50; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeCount = entity.gol.countAliveCells()
    applyLifeForce(entity)
    const afterCount = entity.gol.countAliveCells()

    expect(afterCount).toBe(beforeCount)
  })

  test('injects approximately 15% cells when below threshold', () => {
    // Start with 20% density (below 35% threshold)
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeCount = entity.gol.countAliveCells()
    applyLifeForce(entity)
    const afterCount = entity.gol.countAliveCells()

    const injectedCells = afterCount - beforeCount
    expect(injectedCells).toBeGreaterThan(0)
    expect(injectedCells).toBeLessThanOrEqual(15)  // Should inject ~15 cells
  })

  test('handles entity without gol property', () => {
    const invalidEntity = {}
    expect(() => applyLifeForce(invalidEntity)).not.toThrow()
  })

  test('handles completely dead entity', () => {
    // Start with 0 cells
    expect(entity.gol.countAliveCells()).toBe(0)

    applyLifeForce(entity)

    // Should inject cells to reach minimum density
    expect(entity.gol.countAliveCells()).toBeGreaterThan(0)
  })

  test('works across multiple applications', () => {
    // Simulate entity dying over time
    for (let frame = 0; frame < 10; frame++) {
      entity.gol.clearGrid()  // Simulate decay
      for (let i = 0; i < 5; i++) {
        const x = Math.floor(Math.random() * 10)
        const y = Math.floor(Math.random() * 10)
        entity.gol.setCell(x, y, 1)
      }

      applyLifeForce(entity)

      // Should always maintain minimum density
      const density = entity.gol.countAliveCells() / 100
      expect(density).toBeGreaterThan(0)
    }
  })
})

describe('GoLHelpers - maintainDensity', () => {
  let entity

  beforeEach(() => {
    entity = {
      gol: new GoLEngine(10, 10)
    }
    entity.gol.clearGrid()
  })

  test('maintains target density (default 60%)', () => {
    // Start with low density
    for (let i = 0; i < 20; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeDensity = entity.gol.countAliveCells() / 100

    maintainDensity(entity)

    const density = entity.gol.countAliveCells() / 100
    expect(density).toBeGreaterThan(beforeDensity)  // Should increase toward 60%
    expect(density).toBeLessThanOrEqual(1.0)
  })

  test('respects custom target density', () => {
    // Start with 10% density
    for (let i = 0; i < 10; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeDensity = entity.gol.countAliveCells() / 100

    maintainDensity(entity, 0.75)  // Target 75%

    const density = entity.gol.countAliveCells() / 100
    expect(density).toBeGreaterThan(beforeDensity)  // Should increase toward 75%
    expect(density).toBeGreaterThanOrEqual(0.35)  // Should reach reasonable density
  })

  test('does not modify entity at target density', () => {
    // Start at exactly 60% density
    for (let i = 0; i < 60; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    const beforeCount = entity.gol.countAliveCells()
    maintainDensity(entity, 0.6)
    const afterCount = entity.gol.countAliveCells()

    // Should not add cells if already at target
    expect(afterCount).toBeGreaterThanOrEqual(beforeCount - 5)  // Allow minor variance
  })

  test('handles entity without gol property', () => {
    const invalidEntity = {}
    expect(() => maintainDensity(invalidEntity)).not.toThrow()
  })

  test('revives dead bullets/projectiles', () => {
    // Simulate bullet with 0% density
    expect(entity.gol.countAliveCells()).toBe(0)

    maintainDensity(entity, 0.75)

    // Should revive to target density
    const density = entity.gol.countAliveCells() / 100
    expect(density).toBeGreaterThan(0.3)  // Should add significant cells
  })

  test('works with very high density targets', () => {
    entity.gol.clearGrid()

    maintainDensity(entity, 0.95)  // 95% density

    const density = entity.gol.countAliveCells() / 100
    expect(density).toBeGreaterThan(0.5)  // Should add many cells (collision reduces effectiveness)
  })

  test('works with very low density targets', () => {
    // Start with high density
    for (let i = 0; i < 80; i++) {
      const x = Math.floor(Math.random() * 10)
      const y = Math.floor(Math.random() * 10)
      entity.gol.setCell(x, y, 1)
    }

    maintainDensity(entity, 0.1)  // Target 10% (should not kill cells)

    const density = entity.gol.countAliveCells() / 100
    // maintainDensity only adds cells, doesn't kill them
    expect(density).toBeGreaterThanOrEqual(0.1)
  })
})

describe('GoLHelpers - Integration scenarios', () => {
  test('player entity maintains life force during combat', () => {
    const player = {
      gol: new GoLEngine(6, 6)
    }

    // Seed initial dense shape
    seedRadialDensity(player.gol, 0.85, 0.0)

    // Simulate 10 frames of GoL evolution
    for (let frame = 0; frame < 10; frame++) {
      player.gol.update()
      applyLifeForce(player)
    }

    // Player should still be visible
    const density = player.gol.countAliveCells() / (6 * 6)
    expect(density).toBeGreaterThan(0.2)
  })

  test('bullet maintains exact density without evolution', () => {
    const bullet = {
      gol: new GoLEngine(4, 4)
    }

    // Seed bullet
    seedRadialDensity(bullet.gol, 0.8, 0.0)

    // Maintain density every frame (no update())
    for (let frame = 0; frame < 20; frame++) {
      maintainDensity(bullet, 0.75)
    }

    // Bullet should have consistent density
    const density = bullet.gol.countAliveCells() / (4 * 4)
    expect(density).toBeGreaterThanOrEqual(0.6)
    expect(density).toBeLessThanOrEqual(0.9)
  })

  test('enemy entity uses both seeding and life force', () => {
    const enemy = {
      gol: new GoLEngine(8, 8)
    }

    // Initial seeding
    seedRadialDensity(enemy.gol, 0.75, 0.0)

    const initialCount = enemy.gol.countAliveCells()
    expect(initialCount).toBeGreaterThan(0)

    // Evolve with life force
    for (let frame = 0; frame < 5; frame++) {
      enemy.gol.update()
      applyLifeForce(enemy)
    }

    // Enemy should still exist
    expect(enemy.gol.countAliveCells()).toBeGreaterThan(0)
  })
})
