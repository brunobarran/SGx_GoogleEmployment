/**
 * Unit tests for GoLBackground.
 * Tests full-screen GoL background with gradient rendering.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { GoLBackground } from '../../src/rendering/GoLBackground.js'

describe('GoLBackground - Initialization', () => {
  let p5Mock

  beforeEach(() => {
    p5Mock = {
      width: 1200,
      height: 1920,
      frameRate: vi.fn(() => 60),
      fill: vi.fn(),
      noStroke: vi.fn(),
      rect: vi.fn(),
      beginShape: vi.fn(),
      endShape: vi.fn(),
      vertex: vi.fn(),
      textSize: vi.fn(),
      textAlign: vi.fn(),
      textFont: vi.fn(),
      text: vi.fn(),
      LEFT: 'LEFT',
      TOP: 'TOP',
      QUADS: 'QUADS',
      frameCount: 0,
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn()
    }
  })

  test('constructor initializes with default config', () => {
    const bg = new GoLBackground(p5Mock)

    expect(bg.p5).toBe(p5Mock)
    expect(bg.cols).toBe(40)  // VISUAL_CONFIG.GRID_COLS
    expect(bg.rows).toBe(64)  // VISUAL_CONFIG.GRID_ROWS
    expect(bg.updateRate).toBe(10)  // PERFORMANCE_CONFIG.BACKGROUND_UPDATE_RATE
  })

  test('constructor accepts custom grid size', () => {
    const bg = new GoLBackground(p5Mock, { cols: 20, rows: 30 })

    expect(bg.cols).toBe(20)
    expect(bg.rows).toBe(30)
  })

  test('constructor initializes GoL engine', () => {
    const bg = new GoLBackground(p5Mock)

    expect(bg.engine).toBeDefined()
    expect(bg.engine.cols).toBe(40)
    expect(bg.engine.rows).toBe(64)
  })

  test('constructor initializes SimpleGradientRenderer', () => {
    const bg = new GoLBackground(p5Mock)

    expect(bg.renderer).toBeDefined()
  })

  test('constructor accepts custom renderer', () => {
    const customRenderer = { renderMaskedGrid: vi.fn() }
    const bg = new GoLBackground(p5Mock, { renderer: customRenderer })

    expect(bg.renderer).toBe(customRenderer)
  })

  test('initializes with debug mode off', () => {
    const bg = new GoLBackground(p5Mock)

    expect(bg.debugMode).toBe(false)
  })

  test('enables debug mode when specified', () => {
    const bg = new GoLBackground(p5Mock, { debug: true })

    expect(bg.debugMode).toBe(true)
  })

  test('initializes performance stats', () => {
    const bg = new GoLBackground(p5Mock)

    expect(bg.stats).toBeDefined()
    expect(bg.stats.lastUpdateTime).toBe(0)
    expect(bg.stats.lastRenderTime).toBe(0)
    expect(bg.stats.generation).toBe(0)
    expect(bg.stats.aliveCount).toBe(0)
    expect(bg.stats.density).toBe(0)
  })
})

describe('GoLBackground - Seeding', () => {
  let p5Mock, bg

  beforeEach(() => {
    p5Mock = {
      width: 1200,
      height: 1920,
      frameRate: vi.fn(() => 60),
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn()
    }
    bg = new GoLBackground(p5Mock)
  })

  test('randomSeed creates cells', () => {
    bg.randomSeed(0.5)
    bg.update(0)  // Update stats

    const aliveCount = bg.getAliveCount()
    expect(aliveCount).toBeGreaterThan(0)
  })

  test('respects density parameter', () => {
    bg.randomSeed(0.0)
    bg.update(0)
    expect(bg.getAliveCount()).toBe(0)

    bg.clear()
    bg.randomSeed(1.0)
    // Don't update - check immediate seeding result via engine
    expect(bg.engine.countAliveCells()).toBe(40 * 64)  // All cells alive immediately after seed
  })

  test('setPattern places pattern correctly', () => {
    const pattern = [
      [0, 1, 0],
      [0, 1, 0],
      [0, 1, 0]
    ]

    bg.setPattern(pattern, 5, 5)

    expect(bg.engine.getCell(5, 5)).toBe(0)
    expect(bg.engine.getCell(6, 5)).toBe(1)
    expect(bg.engine.getCell(6, 6)).toBe(1)
    expect(bg.engine.getCell(6, 7)).toBe(1)
  })

  test('clear empties grid', () => {
    bg.randomSeed(0.5)
    bg.update(0)
    expect(bg.getAliveCount()).toBeGreaterThan(0)

    bg.clear()
    bg.update(0)
    expect(bg.getAliveCount()).toBe(0)
  })
})

describe('GoLBackground - Update', () => {
  let p5Mock, bg

  beforeEach(() => {
    p5Mock = {
      width: 1200,
      height: 1920,
      frameRate: vi.fn(() => 60),
      frameCount: 0,
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn()
    }
    bg = new GoLBackground(p5Mock, { updateRate: 60 })  // No throttling for testing
  })

  test('updates GoL simulation', () => {
    // Set BLINKER pattern
    bg.setPattern([[0, 1, 0], [0, 1, 0], [0, 1, 0]], 5, 5)

    bg.update(0)  // Frame 0
    bg.update(1)  // Frame 1 - should update

    // Generation should increment
    expect(bg.getGeneration()).toBeGreaterThan(0)
  })

  test('updates statistics', () => {
    bg.randomSeed(0.3)

    bg.update(0)

    expect(bg.stats.updateCount).toBe(1)
    expect(bg.stats.aliveCount).toBeGreaterThan(0)
    expect(bg.stats.density).toBeGreaterThan(0)
  })

  test('tracks update performance', () => {
    bg.update(0)

    expect(bg.stats.lastUpdateTime).toBeGreaterThan(0)
  })

  test('respects throttling', () => {
    bg = new GoLBackground(p5Mock, { updateRate: 10 })  // 10fps = update every 6 frames
    bg.randomSeed(0.3)

    const genBefore = bg.getGeneration()
    bg.update(1)  // Should not update (too soon)

    expect(bg.getGeneration()).toBe(genBefore)
  })
})

describe('GoLBackground - Rendering', () => {
  let p5Mock, bg

  beforeEach(() => {
    p5Mock = {
      width: 1200,
      height: 1920,
      frameRate: vi.fn(() => 60),
      frameCount: 0,
      fill: vi.fn(),
      noStroke: vi.fn(),
      rect: vi.fn(),
      beginShape: vi.fn(),
      endShape: vi.fn(),
      vertex: vi.fn(),
      textSize: vi.fn(),
      textAlign: vi.fn(),
      textFont: vi.fn(),
      text: vi.fn(),
      LEFT: 'LEFT',
      TOP: 'TOP',
      QUADS: 'QUADS',
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn()
    }
    bg = new GoLBackground(p5Mock)
  })

  test('render calls renderer.renderMaskedGrid', () => {
    bg.renderer.renderMaskedGrid = vi.fn()
    bg.randomSeed(0.3)

    bg.render()

    expect(bg.renderer.renderMaskedGrid).toHaveBeenCalled()
  })

  test('render updates animation', () => {
    bg.renderer.updateAnimation = vi.fn()

    bg.render()

    expect(bg.renderer.updateAnimation).toHaveBeenCalled()
  })

  test('render tracks performance', () => {
    bg.render()

    expect(bg.stats.lastRenderTime).toBeGreaterThan(0)
  })

  test('renderSimple uses fallback rendering', () => {
    bg.randomSeed(0.3)
    bg.renderSimple(0, 0, 30)

    expect(p5Mock.fill).toHaveBeenCalledWith(255)
    expect(p5Mock.beginShape).toHaveBeenCalled()
    expect(p5Mock.endShape).toHaveBeenCalled()
  })

  test('renders debug info when enabled', () => {
    bg.debugMode = true
    bg.render()

    expect(p5Mock.text).toHaveBeenCalled()
  })
})

describe('GoLBackground - Utility methods', () => {
  let p5Mock, bg

  beforeEach(() => {
    p5Mock = {
      width: 1200,
      height: 1920,
      frameRate: vi.fn(() => 60),
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn()
    }
    bg = new GoLBackground(p5Mock)
  })

  test('getDensity returns current density', () => {
    bg.randomSeed(0.5)
    bg.update(0)

    const density = bg.getDensity()
    expect(density).toBeGreaterThan(0)
    expect(density).toBeLessThanOrEqual(1)
  })

  test('getAliveCount returns alive cell count', () => {
    bg.randomSeed(0.3)
    bg.update(0)

    expect(bg.getAliveCount()).toBeGreaterThan(0)
  })

  test('getGeneration returns generation count', () => {
    bg.update(0)

    expect(bg.getGeneration()).toBeGreaterThanOrEqual(0)
  })

  test('getStats returns all statistics', () => {
    bg.randomSeed(0.3)
    bg.update(0)

    const stats = bg.getStats()

    expect(stats.generation).toBeDefined()
    expect(stats.aliveCount).toBeDefined()
    expect(stats.density).toBeDefined()
    expect(stats.lastUpdateTime).toBeDefined()
    expect(stats.lastRenderTime).toBeDefined()
    expect(stats.fps).toBeDefined()
  })

  test('setOffset updates position', () => {
    bg.setOffset(100, 200)

    expect(bg.offsetX).toBe(100)
    expect(bg.offsetY).toBe(200)
  })

  test('centerOnCanvas calculates center position', () => {
    bg.centerOnCanvas()

    expect(bg.offsetX).toBeGreaterThanOrEqual(0)
    expect(bg.offsetY).toBeGreaterThanOrEqual(0)
  })

  test('getRegion returns grid region', () => {
    bg.setPattern([[1, 1], [1, 1]], 5, 5)

    const region = bg.getRegion(5, 5, 2, 2)

    expect(region).toEqual([[1, 1], [1, 1]])
  })
})
