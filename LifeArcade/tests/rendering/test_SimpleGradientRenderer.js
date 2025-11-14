/**
 * Unit tests for SimpleGradientRenderer.
 * Tests Perlin noise gradient rendering with animation.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { SimpleGradientRenderer } from '../../src/rendering/SimpleGradientRenderer.js'
import { GoLEngine } from '../../src/core/GoLEngine.js'
import { GOOGLE_COLORS } from '../../src/utils/GradientPresets.js'

describe('SimpleGradientRenderer - Initialization', () => {
  let p5Mock, renderer

  beforeEach(() => {
    // Mock p5.js instance
    p5Mock = {
      noise: vi.fn((x, y, z) => 0.5),  // Mock Perlin noise
      lerp: vi.fn((a, b, t) => a + (b - a) * t),  // Mock linear interpolation
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      createGraphics: vi.fn(() => ({
        noStroke: vi.fn(),
        fill: vi.fn(),
        rect: vi.fn()
      }))
    }
  })

  test('constructor initializes with p5 instance', () => {
    renderer = new SimpleGradientRenderer(p5Mock)

    expect(renderer.p5).toBe(p5Mock)
    expect(renderer.animationOffset).toBe(0)
  })

  test('initializes with Google color palette', () => {
    renderer = new SimpleGradientRenderer(p5Mock)

    expect(renderer.palette).toHaveLength(4)
    expect(renderer.palette[0]).toEqual(GOOGLE_COLORS.BLUE)
    expect(renderer.palette[1]).toEqual(GOOGLE_COLORS.RED)
    expect(renderer.palette[2]).toEqual(GOOGLE_COLORS.GREEN)
    expect(renderer.palette[3]).toEqual(GOOGLE_COLORS.YELLOW)
  })

  test('initializes with 20 control points', () => {
    renderer = new SimpleGradientRenderer(p5Mock)

    expect(renderer.controlPoints).toBe(20)
  })

  test('animation offset starts at 0', () => {
    renderer = new SimpleGradientRenderer(p5Mock)

    expect(renderer.animationOffset).toBe(0)
  })
})

describe('SimpleGradientRenderer - getGradientColor', () => {
  let p5Mock, renderer

  beforeEach(() => {
    p5Mock = {
      noise: vi.fn((x, y, z) => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn()
    }
    renderer = new SimpleGradientRenderer(p5Mock)
  })

  test('returns RGB array with 3 values', () => {
    const [r, g, b] = renderer.getGradientColor(100, 200)

    expect(r).toBeGreaterThanOrEqual(0)
    expect(r).toBeLessThanOrEqual(255)
    expect(g).toBeGreaterThanOrEqual(0)
    expect(g).toBeLessThanOrEqual(255)
    expect(b).toBeGreaterThanOrEqual(0)
    expect(b).toBeLessThanOrEqual(255)
  })

  test('calls p5.noise with scaled coordinates', () => {
    renderer.getGradientColor(1000, 2000)

    expect(p5Mock.noise).toHaveBeenCalled()
    const call = p5Mock.noise.mock.calls[0]

    // Should scale coordinates with noiseScale (0.002)
    expect(call[0]).toBeCloseTo(1000 * 0.002, 2)
    expect(call[1]).toBeCloseTo(2000 * 0.002, 2)
  })

  test('uses animationOffset for time dimension', () => {
    renderer.animationOffset = 10
    renderer.getGradientColor(100, 200)

    expect(p5Mock.noise).toHaveBeenCalled()
    const call = p5Mock.noise.mock.calls[0]

    // Third parameter should be offset * 0.5
    expect(call[2]).toBeCloseTo(10 * 0.5, 2)
  })

  test('calls lerp for color interpolation', () => {
    renderer.getGradientColor(100, 200)

    // Should interpolate between two palette colors
    expect(p5Mock.lerp).toHaveBeenCalled()
    expect(p5Mock.lerp.mock.calls.length).toBeGreaterThanOrEqual(3)  // R, G, B
  })

  test('generates different colors for different positions', () => {
    // Reset mocks to return different noise values
    p5Mock.noise.mockReturnValueOnce(0.2).mockReturnValueOnce(0.8)

    const color1 = renderer.getGradientColor(0, 0)
    const color2 = renderer.getGradientColor(1000, 1000)

    // Colors should be different (not a perfect test, but checks they're not identical)
    const isDifferent = color1[0] !== color2[0] || color1[1] !== color2[1] || color1[2] !== color2[2]
    expect(isDifferent).toBe(true)
  })
})

describe('SimpleGradientRenderer - updateAnimation', () => {
  let p5Mock, renderer

  beforeEach(() => {
    p5Mock = {
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn()
    }
    renderer = new SimpleGradientRenderer(p5Mock)
  })

  test('increments animationOffset', () => {
    const before = renderer.animationOffset

    renderer.updateAnimation()

    expect(renderer.animationOffset).toBeGreaterThan(before)
  })

  test('increments by 0.005 each frame', () => {
    renderer.animationOffset = 0

    renderer.updateAnimation()

    expect(renderer.animationOffset).toBeCloseTo(0.005, 5)
  })

  test('accumulates over multiple frames', () => {
    renderer.animationOffset = 0

    for (let i = 0; i < 100; i++) {
      renderer.updateAnimation()
    }

    expect(renderer.animationOffset).toBeCloseTo(0.5, 2)
  })

  test('offset affects getGradientColor output', () => {
    renderer.animationOffset = 0
    renderer.getGradientColor(100, 200)
    const firstCall = p5Mock.noise.mock.calls[0]

    p5Mock.noise.mockClear()
    renderer.updateAnimation()  // Increment offset
    renderer.getGradientColor(100, 200)
    const secondCall = p5Mock.noise.mock.calls[0]

    // Time parameter (z) should be different
    expect(secondCall[2]).toBeGreaterThan(firstCall[2])
  })
})

describe('SimpleGradientRenderer - renderMaskedGrid', () => {
  let p5Mock, renderer, engine

  beforeEach(() => {
    p5Mock = {
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn()
    }
    renderer = new SimpleGradientRenderer(p5Mock)
    engine = new GoLEngine(5, 5, 10)
  })

  test('calls p5 rendering functions', () => {
    engine.setCell(2, 2, 1)  // Set one alive cell

    renderer.renderMaskedGrid(engine, 100, 200, 10, {})

    expect(p5Mock.push).toHaveBeenCalled()
    expect(p5Mock.noStroke).toHaveBeenCalled()
    expect(p5Mock.pop).toHaveBeenCalled()
  })

  test('only renders alive cells', () => {
    engine.clearGrid()
    engine.setCell(1, 1, 1)
    engine.setCell(3, 3, 1)

    renderer.renderMaskedGrid(engine, 0, 0, 10, {})

    // Should call fill and rect for each alive cell
    expect(p5Mock.fill).toHaveBeenCalledTimes(2)
    expect(p5Mock.rect).toHaveBeenCalledTimes(2)
  })

  test('applies offset to cell positions', () => {
    engine.clearGrid()
    engine.setCell(2, 2, 1)

    renderer.renderMaskedGrid(engine, 100, 200, 30, {})

    // Should render at (100 + 2*30, 200 + 2*30) = (160, 260)
    expect(p5Mock.rect).toHaveBeenCalledWith(160, 260, 30, 30)
  })

  test('samples gradient color at cell center', () => {
    engine.clearGrid()
    engine.setCell(0, 0, 1)

    p5Mock.noise.mockClear()
    renderer.renderMaskedGrid(engine, 50, 100, 20, {})

    // Should sample at (50 + 0*20 + 10, 100 + 0*20 + 10) = (60, 110)
    expect(p5Mock.noise).toHaveBeenCalled()
    const call = p5Mock.noise.mock.calls[0]
    expect(call[0]).toBeCloseTo(60 * 0.002, 4)
    expect(call[1]).toBeCloseTo(110 * 0.002, 4)
  })

  test('handles empty grid gracefully', () => {
    engine.clearGrid()

    expect(() => {
      renderer.renderMaskedGrid(engine, 0, 0, 10, {})
    }).not.toThrow()

    // Should not render any cells
    expect(p5Mock.rect).not.toHaveBeenCalled()
  })

  test('handles full grid', () => {
    // Fill entire grid
    for (let x = 0; x < 5; x++) {
      for (let y = 0; y < 5; y++) {
        engine.setCell(x, y, 1)
      }
    }

    renderer.renderMaskedGrid(engine, 0, 0, 10, {})

    // Should render all 25 cells
    expect(p5Mock.rect).toHaveBeenCalledTimes(25)
  })
})

describe('SimpleGradientRenderer - createGradient', () => {
  let p5Mock, renderer, graphicsMock

  beforeEach(() => {
    graphicsMock = {
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn()
    }

    p5Mock = {
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn(),
      createGraphics: vi.fn(() => graphicsMock)
    }
    renderer = new SimpleGradientRenderer(p5Mock)
  })

  test('creates p5.Graphics buffer', () => {
    const gradient = renderer.createGradient(100, 200, {
      palette: [[255, 0, 0], [0, 255, 0]]
    })

    expect(p5Mock.createGraphics).toHaveBeenCalledWith(100, 200)
    expect(gradient).toBe(graphicsMock)
  })

  test('draws vertical gradient', () => {
    const config = {
      palette: [[255, 0, 0], [0, 255, 0]]
    }

    renderer.createGradient(100, 50, config)

    // Should draw 50 horizontal lines (one per pixel height)
    expect(graphicsMock.rect).toHaveBeenCalledTimes(50)
  })

  test('interpolates between palette colors', () => {
    const config = {
      palette: [[255, 0, 0], [0, 0, 255]]  // Red to Blue
    }

    renderer.createGradient(100, 10, config)

    // Should call lerp for color interpolation
    expect(p5Mock.lerp).toHaveBeenCalled()
  })

  test('respects custom palette', () => {
    const customPalette = [
      [100, 100, 100],
      [200, 200, 200]
    ]
    const config = { palette: customPalette }

    renderer.createGradient(50, 50, config)

    // Should use custom colors (check fill was called)
    expect(graphicsMock.fill).toHaveBeenCalled()
  })
})

describe('SimpleGradientRenderer - Integration', () => {
  let p5Mock, renderer, engine

  beforeEach(() => {
    p5Mock = {
      noise: vi.fn(() => 0.5),
      lerp: vi.fn((a, b, t) => a + (b - a) * t),
      push: vi.fn(),
      pop: vi.fn(),
      noStroke: vi.fn(),
      fill: vi.fn(),
      rect: vi.fn()
    }
    renderer = new SimpleGradientRenderer(p5Mock)
    engine = new GoLEngine(10, 10, 10)
  })

  test('animated gradient changes over time', () => {
    engine.setCell(5, 5, 1)

    // Render frame 1
    p5Mock.noise.mockClear()
    renderer.renderMaskedGrid(engine, 0, 0, 10, {})
    const noiseCall1 = p5Mock.noise.mock.calls[0][2]  // Time parameter

    // Update animation
    renderer.updateAnimation()

    // Render frame 2
    p5Mock.noise.mockClear()
    renderer.renderMaskedGrid(engine, 0, 0, 10, {})
    const noiseCall2 = p5Mock.noise.mock.calls[0][2]  // Time parameter

    // Time parameter should increase
    expect(noiseCall2).toBeGreaterThan(noiseCall1)
  })

  test('renders organic flowing pattern', () => {
    // Seed with BLINKER pattern
    engine.clearGrid()
    engine.setCell(5, 4, 1)
    engine.setCell(5, 5, 1)
    engine.setCell(5, 6, 1)

    renderer.renderMaskedGrid(engine, 0, 0, 10, {})

    // Should render 3 cells with gradient colors
    expect(p5Mock.fill).toHaveBeenCalledTimes(3)
    expect(p5Mock.rect).toHaveBeenCalledTimes(3)
  })

  test('gradient samples at different positions', () => {
    engine.setCell(0, 0, 1)
    engine.setCell(9, 9, 1)

    p5Mock.noise.mockClear()
    renderer.renderMaskedGrid(engine, 0, 0, 10, {})

    // Should sample noise at 2 different positions
    expect(p5Mock.noise).toHaveBeenCalledTimes(2)

    const call1 = p5Mock.noise.mock.calls[0]
    const call2 = p5Mock.noise.mock.calls[1]

    // Positions should be different
    expect(call1[0]).not.toBeCloseTo(call2[0])
    expect(call1[1]).not.toBeCloseTo(call2[1])
  })
})
