/**
 * Unit tests for Collision utilities.
 * Tests all collision detection functions and utility helpers.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { Collision } from '../../src/utils/Collision.js'

describe('Collision - Circle-Circle', () => {
  test('detects overlapping circles', () => {
    const result = Collision.circleCircle(0, 0, 10, 5, 5, 10)
    expect(result).toBe(true)
  })

  test('detects touching circles (edge case)', () => {
    const result = Collision.circleCircle(0, 0, 10, 20, 0, 10)
    expect(result).toBe(false)  // Exactly touching = not overlapping
  })

  test('detects separated circles', () => {
    const result = Collision.circleCircle(0, 0, 5, 100, 100, 5)
    expect(result).toBe(false)
  })

  test('detects circle inside another circle', () => {
    const result = Collision.circleCircle(0, 0, 50, 10, 10, 5)
    expect(result).toBe(true)
  })

  test('handles identical circles', () => {
    const result = Collision.circleCircle(10, 10, 20, 10, 10, 20)
    expect(result).toBe(true)
  })

  test('works with negative coordinates', () => {
    const result = Collision.circleCircle(-10, -10, 5, -5, -5, 5)
    expect(result).toBe(true)
  })
})

describe('Collision - Rectangle-Rectangle (AABB)', () => {
  test('detects overlapping rectangles', () => {
    const result = Collision.rectRect(0, 0, 50, 50, 25, 25, 50, 50)
    expect(result).toBe(true)
  })

  test('detects touching rectangles (edge case)', () => {
    const result = Collision.rectRect(0, 0, 50, 50, 50, 0, 50, 50)
    expect(result).toBe(false)  // Exactly touching edges = not overlapping
  })

  test('detects separated rectangles', () => {
    const result = Collision.rectRect(0, 0, 50, 50, 100, 100, 50, 50)
    expect(result).toBe(false)
  })

  test('detects rectangle inside another', () => {
    const result = Collision.rectRect(0, 0, 100, 100, 25, 25, 50, 50)
    expect(result).toBe(true)
  })

  test('detects partial overlap (corner)', () => {
    const result = Collision.rectRect(0, 0, 50, 50, 40, 40, 50, 50)
    expect(result).toBe(true)
  })

  test('detects partial overlap (edge)', () => {
    const result = Collision.rectRect(0, 0, 50, 100, 25, 25, 50, 50)
    expect(result).toBe(true)
  })

  test('handles identical rectangles', () => {
    const result = Collision.rectRect(10, 10, 50, 50, 10, 10, 50, 50)
    expect(result).toBe(true)
  })

  test('works with negative coordinates', () => {
    const result = Collision.rectRect(-50, -50, 50, 50, -25, -25, 50, 50)
    expect(result).toBe(true)
  })
})

describe('Collision - Circle-Rectangle', () => {
  test('detects circle overlapping rectangle center', () => {
    const result = Collision.circleRect(50, 50, 10, 0, 0, 100, 100)
    expect(result).toBe(true)
  })

  test('detects circle overlapping rectangle corner', () => {
    const result = Collision.circleRect(5, 5, 10, 0, 0, 50, 50)
    expect(result).toBe(true)
  })

  test('detects circle overlapping rectangle edge', () => {
    const result = Collision.circleRect(50, -5, 10, 0, 0, 100, 50)
    expect(result).toBe(true)
  })

  test('detects circle inside rectangle', () => {
    const result = Collision.circleRect(50, 50, 5, 0, 0, 100, 100)
    expect(result).toBe(true)
  })

  test('detects rectangle inside circle (large circle)', () => {
    const result = Collision.circleRect(50, 50, 100, 40, 40, 20, 20)
    expect(result).toBe(true)
  })

  test('detects separated circle and rectangle', () => {
    const result = Collision.circleRect(200, 200, 10, 0, 0, 50, 50)
    expect(result).toBe(false)
  })

  test('handles touching (edge case)', () => {
    const result = Collision.circleRect(60, 50, 10, 0, 0, 50, 100)
    expect(result).toBe(false)  // Exactly touching = not overlapping
  })

  test('works with negative coordinates', () => {
    const result = Collision.circleRect(-25, -25, 10, -50, -50, 50, 50)
    expect(result).toBe(true)
  })
})

describe('Collision - Point in Rectangle', () => {
  test('detects point inside rectangle', () => {
    const result = Collision.pointInRect(25, 25, 0, 0, 50, 50)
    expect(result).toBe(true)
  })

  test('detects point on rectangle edge (inclusive)', () => {
    expect(Collision.pointInRect(0, 0, 0, 0, 50, 50)).toBe(true)
    expect(Collision.pointInRect(50, 50, 0, 0, 50, 50)).toBe(true)
  })

  test('detects point outside rectangle', () => {
    const result = Collision.pointInRect(100, 100, 0, 0, 50, 50)
    expect(result).toBe(false)
  })

  test('detects point just outside rectangle', () => {
    const result = Collision.pointInRect(51, 25, 0, 0, 50, 50)
    expect(result).toBe(false)
  })

  test('works with negative coordinates', () => {
    const result = Collision.pointInRect(-25, -25, -50, -50, 50, 50)
    expect(result).toBe(true)
  })
})

describe('Collision - Distance', () => {
  test('calculates distance between two points', () => {
    const result = Collision.distance(0, 0, 3, 4)
    expect(result).toBe(5)  // 3-4-5 triangle
  })

  test('calculates zero distance for same point', () => {
    const result = Collision.distance(10, 10, 10, 10)
    expect(result).toBe(0)
  })

  test('calculates horizontal distance', () => {
    const result = Collision.distance(0, 0, 10, 0)
    expect(result).toBe(10)
  })

  test('calculates vertical distance', () => {
    const result = Collision.distance(0, 0, 0, 10)
    expect(result).toBe(10)
  })

  test('calculates diagonal distance', () => {
    const result = Collision.distance(0, 0, 10, 10)
    expect(result).toBeCloseTo(14.142, 3)
  })

  test('works with negative coordinates', () => {
    const result = Collision.distance(-5, -5, 5, 5)
    expect(result).toBeCloseTo(14.142, 3)
  })

  test('is symmetric', () => {
    const d1 = Collision.distance(0, 0, 10, 10)
    const d2 = Collision.distance(10, 10, 0, 0)
    expect(d1).toBe(d2)
  })
})

describe('Collision - Clamp', () => {
  test('clamps value below minimum', () => {
    const result = Collision.clamp(-5, 0, 100)
    expect(result).toBe(0)
  })

  test('clamps value above maximum', () => {
    const result = Collision.clamp(150, 0, 100)
    expect(result).toBe(100)
  })

  test('returns value when within range', () => {
    const result = Collision.clamp(50, 0, 100)
    expect(result).toBe(50)
  })

  test('handles value equal to minimum', () => {
    const result = Collision.clamp(0, 0, 100)
    expect(result).toBe(0)
  })

  test('handles value equal to maximum', () => {
    const result = Collision.clamp(100, 0, 100)
    expect(result).toBe(100)
  })

  test('works with negative ranges', () => {
    const result = Collision.clamp(-150, -100, -50)
    expect(result).toBe(-100)
  })

  test('works with floating point values', () => {
    const result = Collision.clamp(5.7, 0, 10)
    expect(result).toBeCloseTo(5.7, 5)
  })
})

describe('Collision - Linear Interpolation (lerp)', () => {
  test('lerps at t=0 returns start value', () => {
    const result = Collision.lerp(0, 100, 0)
    expect(result).toBe(0)
  })

  test('lerps at t=1 returns end value', () => {
    const result = Collision.lerp(0, 100, 1)
    expect(result).toBe(100)
  })

  test('lerps at t=0.5 returns midpoint', () => {
    const result = Collision.lerp(0, 100, 0.5)
    expect(result).toBe(50)
  })

  test('lerps with arbitrary t value', () => {
    const result = Collision.lerp(0, 100, 0.25)
    expect(result).toBe(25)
  })

  test('works with negative values', () => {
    const result = Collision.lerp(-100, 100, 0.5)
    expect(result).toBe(0)
  })

  test('works with reverse order (b < a)', () => {
    const result = Collision.lerp(100, 0, 0.5)
    expect(result).toBe(50)
  })

  test('works with t > 1 (extrapolation)', () => {
    const result = Collision.lerp(0, 100, 1.5)
    expect(result).toBe(150)
  })

  test('works with t < 0 (extrapolation)', () => {
    const result = Collision.lerp(0, 100, -0.5)
    expect(result).toBe(-50)
  })

  test('handles floating point precision', () => {
    const result = Collision.lerp(0, 1, 0.333333)
    expect(result).toBeCloseTo(0.333333, 5)
  })
})

describe('Collision - Integration tests', () => {
  test('ball vs paddle collision (game scenario)', () => {
    const ballX = 100
    const ballY = 400
    const ballRadius = 10

    const paddleX = 80
    const paddleY = 390
    const paddleWidth = 60
    const paddleHeight = 20

    const result = Collision.circleRect(
      ballX, ballY, ballRadius,
      paddleX, paddleY, paddleWidth, paddleHeight
    )

    expect(result).toBe(true)
  })

  test('player vs enemy collision (game scenario)', () => {
    const playerX = 100
    const playerY = 200
    const playerSize = 40

    const enemyX = 110
    const enemyY = 210
    const enemySize = 30

    const result = Collision.rectRect(
      playerX, playerY, playerSize, playerSize,
      enemyX, enemyY, enemySize, enemySize
    )

    expect(result).toBe(true)
  })

  test('bullet vs enemy collision (game scenario)', () => {
    const bulletX = 150
    const bulletY = 200
    const bulletRadius = 5

    const enemyX = 145
    const enemyY = 195
    const enemyRadius = 15

    const result = Collision.circleCircle(
      bulletX, bulletY, bulletRadius,
      enemyX, enemyY, enemyRadius
    )

    expect(result).toBe(true)
  })

  test('mouse click on button (UI scenario)', () => {
    const mouseX = 425
    const mouseY = 325

    const buttonX = 400
    const buttonY = 300
    const buttonWidth = 100
    const buttonHeight = 50

    const result = Collision.pointInRect(
      mouseX, mouseY,
      buttonX, buttonY, buttonWidth, buttonHeight
    )

    expect(result).toBe(true)
  })

  test('clamping player position to screen bounds', () => {
    const playerX = -50  // Off-screen left
    const screenWidth = 800
    const playerWidth = 40

    const clampedX = Collision.clamp(playerX, 0, screenWidth - playerWidth)

    expect(clampedX).toBe(0)
  })

  test('smooth camera follow with lerp', () => {
    const cameraX = 100
    const targetX = 200
    const smoothFactor = 0.1

    const newCameraX = Collision.lerp(cameraX, targetX, smoothFactor)

    expect(newCameraX).toBe(110)
    expect(newCameraX).toBeGreaterThan(cameraX)
    expect(newCameraX).toBeLessThan(targetX)
  })
})

describe('Collision - Edge cases and robustness', () => {
  test('handles zero-sized circles', () => {
    const result = Collision.circleCircle(0, 0, 0, 0, 0, 10)
    expect(result).toBe(true)  // Point inside circle
  })

  test('handles zero-sized rectangles', () => {
    const result = Collision.rectRect(0, 0, 0, 0, 0, 0, 50, 50)
    expect(result).toBe(false)  // Zero-size rect doesn't overlap
  })

  test('handles very large coordinates', () => {
    const result = Collision.distance(0, 0, 1000000, 1000000)
    expect(result).toBeGreaterThan(0)
  })

  test('handles floating point coordinates', () => {
    const result = Collision.circleCircle(1.5, 2.7, 3.2, 4.1, 5.3, 2.8)
    expect(typeof result).toBe('boolean')
  })
})
