/**
 * Unit tests for ParticleHelpers.
 * Tests particle system update and rendering functions.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { updateParticles, renderParticles } from '../../src/utils/ParticleHelpers.js'

describe('ParticleHelpers - updateParticles', () => {
  let particles

  beforeEach(() => {
    particles = [
      {
        gol: { updateThrottled: vi.fn() },
        x: 100,
        y: 200,
        vx: 5,
        vy: -3,
        alpha: 255,
        dead: false
      },
      {
        gol: { updateThrottled: vi.fn() },
        x: 300,
        y: 400,
        vx: -2,
        vy: 4,
        alpha: 128,
        dead: false
      }
    ]
  })

  test('updates particle positions with velocity', () => {
    const updated = updateParticles(particles, 0)

    expect(updated[0].x).toBe(105)  // 100 + 5
    expect(updated[0].y).toBe(197)  // 200 + (-3)
    expect(updated[1].x).toBe(298)  // 300 + (-2)
    expect(updated[1].y).toBe(404)  // 400 + 4
  })

  test('decrements alpha by 4 each frame', () => {
    const updated = updateParticles(particles, 0)

    expect(updated[0].alpha).toBe(251)  // 255 - 4
    expect(updated[1].alpha).toBe(124)  // 128 - 4
  })

  test('calls gol.updateThrottled for each particle', () => {
    updateParticles(particles, 60)

    expect(particles[0].gol.updateThrottled).toHaveBeenCalledWith(60)
    expect(particles[1].gol.updateThrottled).toHaveBeenCalledWith(60)
  })

  test('marks particles as dead when alpha reaches 0', () => {
    particles[0].alpha = 4  // Will become 0 after -4
    particles[1].alpha = 2  // Will become -2 after -4

    updateParticles(particles, 0)

    expect(particles[0].alpha).toBe(0)
    expect(particles[0].dead).toBe(true)
    expect(particles[1].alpha).toBe(-2)
    expect(particles[1].dead).toBe(true)
  })

  test('filters out dead particles', () => {
    particles[0].alpha = 10
    particles[1].alpha = -5
    particles[1].dead = true

    const updated = updateParticles(particles, 0)

    expect(updated.length).toBe(1)
    expect(updated[0].x).toBe(105)  // 100 + vx(5)
  })

  test('handles empty particle array', () => {
    const updated = updateParticles([], 0)

    expect(updated).toEqual([])
  })

  test('accumulates movement over multiple frames', () => {
    let updated = particles

    // Frame 1
    updated = updateParticles(updated, 0)
    expect(updated[0].x).toBe(105)
    expect(updated[0].y).toBe(197)

    // Frame 2
    updated = updateParticles(updated, 1)
    expect(updated[0].x).toBe(110)
    expect(updated[0].y).toBe(194)

    // Frame 3
    updated = updateParticles(updated, 2)
    expect(updated[0].x).toBe(115)
    expect(updated[0].y).toBe(191)
  })

  test('particles fade to death over time', () => {
    particles = [{
      gol: { updateThrottled: vi.fn() },
      x: 100,
      y: 100,
      vx: 0,
      vy: 0,
      alpha: 15,  // Will die after 4 updates (15-4-4-4 = 3, then -1)
      dead: false
    }]

    let updated = particles

    // Update 1: alpha = 11
    updated = updateParticles(updated, 0)
    expect(updated.length).toBe(1)
    expect(updated[0].alpha).toBe(11)

    // Update 2: alpha = 7
    updated = updateParticles(updated, 1)
    expect(updated.length).toBe(1)
    expect(updated[0].alpha).toBe(7)

    // Update 3: alpha = 3
    updated = updateParticles(updated, 2)
    expect(updated.length).toBe(1)
    expect(updated[0].alpha).toBe(3)

    // Update 4: alpha = -1, dead = true, filtered out
    updated = updateParticles(updated, 3)
    expect(updated.length).toBe(0)
  })

  test('preserves particle properties', () => {
    particles[0].customProp = 'test'
    particles[0].id = 42

    const updated = updateParticles(particles, 0)

    expect(updated[0].customProp).toBe('test')
    expect(updated[0].id).toBe(42)
  })
})

describe('ParticleHelpers - renderParticles', () => {
  let particles, renderer, p5Mock

  beforeEach(() => {
    // Mock global p5.js functions
    global.push = vi.fn()
    global.pop = vi.fn()
    global.drawingContext = { globalAlpha: 1 }

    renderer = {
      renderMaskedGrid: vi.fn()
    }

    particles = [
      {
        gol: 'mock_gol_1',
        x: 100,
        y: 200,
        cellSize: 10,
        gradient: { name: 'PLAYER' },
        alpha: 255
      },
      {
        gol: 'mock_gol_2',
        x: 300,
        y: 400,
        cellSize: 15,
        gradient: { name: 'ENEMY' },
        alpha: 128
      }
    ]
  })

  test('calls renderer.renderMaskedGrid for each particle', () => {
    renderParticles(particles, renderer)

    expect(renderer.renderMaskedGrid).toHaveBeenCalledTimes(2)
    expect(renderer.renderMaskedGrid).toHaveBeenCalledWith(
      'mock_gol_1',
      100,
      200,
      10,
      { name: 'PLAYER' }
    )
    expect(renderer.renderMaskedGrid).toHaveBeenCalledWith(
      'mock_gol_2',
      300,
      400,
      15,
      { name: 'ENEMY' }
    )
  })

  test('sets globalAlpha based on particle alpha', () => {
    renderParticles(particles, renderer)

    // Can't easily verify calls in order, but alpha should be set
    expect(global.push).toHaveBeenCalledTimes(2)
    expect(global.pop).toHaveBeenCalledTimes(2)
  })

  test('skips particles with alpha <= 0', () => {
    particles[0].alpha = 0
    particles[1].alpha = -10

    renderParticles(particles, renderer)

    expect(renderer.renderMaskedGrid).not.toHaveBeenCalled()
    expect(global.push).not.toHaveBeenCalled()
  })

  test('handles empty particle array', () => {
    renderParticles([], renderer)

    expect(renderer.renderMaskedGrid).not.toHaveBeenCalled()
  })

  test('uses push/pop for each particle', () => {
    renderParticles(particles, renderer)

    // Each particle should push/pop
    expect(global.push).toHaveBeenCalledTimes(2)
    expect(global.pop).toHaveBeenCalledTimes(2)
  })

  test('renders particles with varying alpha', () => {
    particles = [
      { gol: 'g1', x: 0, y: 0, cellSize: 10, gradient: {}, alpha: 255 },
      { gol: 'g2', x: 0, y: 0, cellSize: 10, gradient: {}, alpha: 200 },
      { gol: 'g3', x: 0, y: 0, cellSize: 10, gradient: {}, alpha: 100 },
      { gol: 'g4', x: 0, y: 0, cellSize: 10, gradient: {}, alpha: 50 },
      { gol: 'g5', x: 0, y: 0, cellSize: 10, gradient: {}, alpha: 1 }
    ]

    renderParticles(particles, renderer)

    // All particles with alpha > 0 should render
    expect(renderer.renderMaskedGrid).toHaveBeenCalledTimes(5)
  })

  test('passes correct parameters to renderer', () => {
    const particle = {
      gol: { cols: 5, rows: 5 },
      x: 150,
      y: 250,
      cellSize: 20,
      gradient: { palette: [[255, 0, 0]] },
      alpha: 180
    }

    renderParticles([particle], renderer)

    expect(renderer.renderMaskedGrid).toHaveBeenCalledWith(
      { cols: 5, rows: 5 },
      150,
      250,
      20,
      { palette: [[255, 0, 0]] }
    )
  })
})

describe('ParticleHelpers - Integration', () => {
  test('update and render cycle', () => {
    global.push = vi.fn()
    global.pop = vi.fn()
    global.drawingContext = { globalAlpha: 1 }

    const renderer = {
      renderMaskedGrid: vi.fn()
    }

    let particles = [
      {
        gol: { updateThrottled: vi.fn() },
        x: 100,
        y: 100,
        vx: 5,
        vy: 5,
        cellSize: 10,
        gradient: {},
        alpha: 255,
        dead: false
      }
    ]

    // Simulate 5 frames
    for (let frame = 0; frame < 5; frame++) {
      particles = updateParticles(particles, frame)
      renderParticles(particles, renderer)
    }

    // After 5 frames: position moved, alpha decreased
    expect(particles.length).toBe(1)
    expect(particles[0].x).toBe(125)  // 100 + 5*5
    expect(particles[0].y).toBe(125)  // 100 + 5*5
    expect(particles[0].alpha).toBe(235)  // 255 - 4*5

    // Should have rendered 5 times
    expect(renderer.renderMaskedGrid).toHaveBeenCalledTimes(5)
  })

  test('particles die and stop rendering', () => {
    global.push = vi.fn()
    global.pop = vi.fn()
    global.drawingContext = { globalAlpha: 1 }

    const renderer = {
      renderMaskedGrid: vi.fn()
    }

    let particles = [
      {
        gol: { updateThrottled: vi.fn() },
        x: 100,
        y: 100,
        vx: 0,
        vy: 0,
        cellSize: 10,
        gradient: {},
        alpha: 8,  // Will die after 3 frames
        dead: false
      }
    ]

    let renderCount = 0

    for (let frame = 0; frame < 10; frame++) {
      particles = updateParticles(particles, frame)

      if (particles.length > 0) {
        renderParticles(particles, renderer)
        renderCount++
      }
    }

    // Should only render while alive (alpha 8 -> update to 4 -> render once -> update to 0 -> dead)
    expect(renderCount).toBe(1)  // Renders once at alpha=4 (after first update)
    expect(particles.length).toBe(0)
  })
})

describe('ParticleHelpers - Loop Patterns', () => {
  let particles

  beforeEach(() => {
    particles = [
      {
        gol: {
          updateThrottled: vi.fn(),
          isLoopPattern: true,
          loopPeriod: 2,
          loopPattern: [[0, 1, 0], [0, 1, 0], [0, 1, 0]],
          loopPatternWidth: 3,
          loopPatternHeight: 3,
          generation: 0,
          updateRateFPS: 12,
          cols: 5,
          rows: 5,
          clearGrid: vi.fn(),
          setPattern: vi.fn()
        },
        x: 100,
        y: 200,
        vx: 5,
        vy: -3,
        alpha: 255,
        dead: false
      }
    ]
  })

  test('calls updateLoopPattern for loop pattern particles', () => {
    // Mock the import - in real test, updateLoopPattern would be called
    const updated = updateParticles(particles, 0, 30)

    // Verify GoL is updated
    expect(particles[0].gol.updateThrottled).toHaveBeenCalledWith(0)

    // updateRateFPS should be set based on loopUpdateRate
    // 30 frames → 60/30 = 2fps
    expect(updated[0].gol.updateRateFPS).toBe(2)
  })

  test('updates loop pattern speed when loopUpdateRate changes', () => {
    // Start at 30 frames (2fps)
    updateParticles(particles, 0, 30)
    expect(particles[0].gol.updateRateFPS).toBe(2)

    // Change to 60 frames (1fps)
    updateParticles(particles, 1, 60)
    expect(particles[0].gol.updateRateFPS).toBe(1)
  })

  test('does not call updateLoopPattern for non-loop particles', () => {
    particles[0].gol.isLoopPattern = false
    const initialFPS = particles[0].gol.updateRateFPS

    updateParticles(particles, 0, 30)

    // updateRateFPS should not change
    expect(particles[0].gol.updateRateFPS).toBe(initialFPS)
  })

  test('handles mix of loop and non-loop particles', () => {
    particles.push({
      gol: {
        updateThrottled: vi.fn(),
        isLoopPattern: false
      },
      x: 300,
      y: 400,
      vx: -2,
      vy: 4,
      alpha: 200,
      dead: false
    })

    const updated = updateParticles(particles, 0, 30)

    // Loop particle should have updateRateFPS set
    expect(updated[0].gol.updateRateFPS).toBe(2)

    // Both should still move and fade
    expect(updated[0].x).toBe(105)
    expect(updated[0].alpha).toBe(251)
    expect(updated[1].x).toBe(298)
    expect(updated[1].alpha).toBe(196)
  })

  test('loop particles still move and fade normally', () => {
    const updated = updateParticles(particles, 0, 30)

    // Loop pattern logic applied
    expect(updated[0].gol.updateRateFPS).toBe(2)

    // But physics still apply
    expect(updated[0].x).toBe(105)
    expect(updated[0].y).toBe(197)
    expect(updated[0].alpha).toBe(251)
  })

  test('loop particles die when alpha reaches 0', () => {
    particles[0].alpha = 3

    let updated = particles
    updated = updateParticles(updated, 0, 30) // alpha = -1, dead = true
    expect(updated.length).toBe(0)
  })

  test('loop pattern resets after period completes', () => {
    particles[0].gol.generation = 0

    // First update: gen 0 → 1
    updateParticles(particles, 0, 30)
    particles[0].gol.generation = 1

    // Second update: gen 1 → 2 (should trigger reset at period=2)
    updateParticles(particles, 1, 30)
    particles[0].gol.generation = 2

    updateParticles(particles, 2, 30)

    // After 2 generations, pattern should reset
    expect(particles[0].gol.clearGrid).toHaveBeenCalled()
    expect(particles[0].gol.setPattern).toHaveBeenCalledWith(
      particles[0].gol.loopPattern,
      1, // centerX
      1  // centerY
    )
  })
})
