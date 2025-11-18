/**
 * Unit tests for GradientPresets.
 * Tests Google brand colors and gradient configurations.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  GOOGLE_COLORS,
  GRADIENT_PRESETS,
  getRandomEnemyGradient,
  createCustomGradient
} from '../../src/utils/GradientPresets.js'

describe('GradientPresets - GOOGLE_COLORS', () => {
  test('GOOGLE_COLORS has all 5 colors', () => {
    expect(Object.keys(GOOGLE_COLORS)).toHaveLength(5)
    expect(GOOGLE_COLORS).toHaveProperty('BLUE')
    expect(GOOGLE_COLORS).toHaveProperty('RED')
    expect(GOOGLE_COLORS).toHaveProperty('GREEN')
    expect(GOOGLE_COLORS).toHaveProperty('YELLOW')
    expect(GOOGLE_COLORS).toHaveProperty('WHITE')
  })

  test('Google Blue is correct RGB', () => {
    expect(GOOGLE_COLORS.BLUE).toEqual([66, 133, 244])
  })

  test('Google Red is correct RGB', () => {
    expect(GOOGLE_COLORS.RED).toEqual([234, 67, 53])
  })

  test('Google Green is correct RGB', () => {
    expect(GOOGLE_COLORS.GREEN).toEqual([52, 168, 83])
  })

  test('Google Yellow is correct RGB', () => {
    expect(GOOGLE_COLORS.YELLOW).toEqual([251, 188, 4])
  })

  test('White is correct RGB', () => {
    expect(GOOGLE_COLORS.WHITE).toEqual([255, 255, 255])
  })

  test('all colors are valid RGB arrays', () => {
    Object.values(GOOGLE_COLORS).forEach(color => {
      expect(Array.isArray(color)).toBe(true)
      expect(color).toHaveLength(3)

      color.forEach(channel => {
        expect(channel).toBeGreaterThanOrEqual(0)
        expect(channel).toBeLessThanOrEqual(255)
        expect(Number.isInteger(channel)).toBe(true)
      })
    })
  })
})

describe('GradientPresets - GRADIENT_PRESETS', () => {
  test('has 10 predefined presets', () => {
    expect(Object.keys(GRADIENT_PRESETS)).toHaveLength(10)
  })

  test('has all required preset types', () => {
    expect(GRADIENT_PRESETS).toHaveProperty('PLAYER')
    expect(GRADIENT_PRESETS).toHaveProperty('ENEMY_HOT')
    expect(GRADIENT_PRESETS).toHaveProperty('ENEMY_COLD')
    expect(GRADIENT_PRESETS).toHaveProperty('ENEMY_RAINBOW')
    expect(GRADIENT_PRESETS).toHaveProperty('BULLET')
    expect(GRADIENT_PRESETS).toHaveProperty('POWERUP')
    expect(GRADIENT_PRESETS).toHaveProperty('BACKGROUND')
    expect(GRADIENT_PRESETS).toHaveProperty('BOSS')
    expect(GRADIENT_PRESETS).toHaveProperty('EXPLOSION')
    expect(GRADIENT_PRESETS).toHaveProperty('SKY')
  })

  test('all presets have required properties', () => {
    Object.values(GRADIENT_PRESETS).forEach(preset => {
      expect(preset).toHaveProperty('name')
      expect(preset).toHaveProperty('palette')
      expect(preset).toHaveProperty('controlPoints')
      expect(preset).toHaveProperty('animationSpeed')
      expect(preset).toHaveProperty('perColumn')
    })
  })

  test('most presets use 4-color Google brand palette', () => {
    const fourColorPresets = [
      'PLAYER', 'ENEMY_HOT', 'ENEMY_COLD', 'ENEMY_RAINBOW',
      'BULLET', 'POWERUP', 'BACKGROUND', 'BOSS', 'EXPLOSION'
    ]

    fourColorPresets.forEach(presetName => {
      const preset = GRADIENT_PRESETS[presetName]
      expect(preset.palette).toHaveLength(4)
      expect(preset.palette[0]).toEqual(GOOGLE_COLORS.BLUE)
      expect(preset.palette[1]).toEqual(GOOGLE_COLORS.RED)
      expect(preset.palette[2]).toEqual(GOOGLE_COLORS.GREEN)
      expect(preset.palette[3]).toEqual(GOOGLE_COLORS.YELLOW)
    })
  })

  test('all presets have valid controlPoints', () => {
    Object.values(GRADIENT_PRESETS).forEach(preset => {
      expect(preset.controlPoints).toBeGreaterThanOrEqual(4)
      expect(preset.controlPoints).toBeLessThanOrEqual(20)
      expect(Number.isInteger(preset.controlPoints)).toBe(true)
    })
  })

  test('all presets have valid animationSpeed', () => {
    Object.values(GRADIENT_PRESETS).forEach(preset => {
      expect(preset.animationSpeed).toBeGreaterThan(0)
      expect(preset.animationSpeed).toBeLessThanOrEqual(3.0)
    })
  })

  test('all presets have perColumn set to true', () => {
    Object.values(GRADIENT_PRESETS).forEach(preset => {
      expect(preset.perColumn).toBe(true)
    })
  })
})

describe('GradientPresets - Individual Presets', () => {
  test('PLAYER preset has correct configuration', () => {
    expect(GRADIENT_PRESETS.PLAYER.name).toBe('Player (Animated)')
    expect(GRADIENT_PRESETS.PLAYER.controlPoints).toBe(16)
    expect(GRADIENT_PRESETS.PLAYER.animationSpeed).toBe(0.5)
    expect(GRADIENT_PRESETS.PLAYER.perColumn).toBe(true)
  })

  test('ENEMY_HOT preset has correct configuration', () => {
    expect(GRADIENT_PRESETS.ENEMY_HOT.name).toBe('Enemy (Animated)')
    expect(GRADIENT_PRESETS.ENEMY_HOT.controlPoints).toBe(16)
    expect(GRADIENT_PRESETS.ENEMY_HOT.animationSpeed).toBe(0.8)
  })

  test('ENEMY_COLD preset has correct configuration', () => {
    expect(GRADIENT_PRESETS.ENEMY_COLD.name).toBe('Enemy (Animated)')
    expect(GRADIENT_PRESETS.ENEMY_COLD.controlPoints).toBe(16)
    expect(GRADIENT_PRESETS.ENEMY_COLD.animationSpeed).toBe(0.6)
  })

  test('ENEMY_RAINBOW preset has correct configuration', () => {
    expect(GRADIENT_PRESETS.ENEMY_RAINBOW.name).toBe('Enemy (Animated)')
    expect(GRADIENT_PRESETS.ENEMY_RAINBOW.controlPoints).toBe(16)
    expect(GRADIENT_PRESETS.ENEMY_RAINBOW.animationSpeed).toBe(1.0)
  })

  test('BULLET preset has fastest animation', () => {
    expect(GRADIENT_PRESETS.BULLET.animationSpeed).toBe(2.0)
  })

  test('POWERUP preset has moderate animation', () => {
    expect(GRADIENT_PRESETS.POWERUP.animationSpeed).toBe(1.5)
  })

  test('BACKGROUND preset has slowest animation', () => {
    expect(GRADIENT_PRESETS.BACKGROUND.animationSpeed).toBe(0.3)
    expect(GRADIENT_PRESETS.BACKGROUND.controlPoints).toBe(20)
  })

  test('BOSS preset has high controlPoints', () => {
    expect(GRADIENT_PRESETS.BOSS.controlPoints).toBe(20)
    expect(GRADIENT_PRESETS.BOSS.animationSpeed).toBe(1.2)
  })

  test('EXPLOSION preset has fastest animation', () => {
    expect(GRADIENT_PRESETS.EXPLOSION.animationSpeed).toBe(3.0)
    expect(GRADIENT_PRESETS.EXPLOSION.controlPoints).toBe(16)
  })

  test('SKY preset has blue-white-blue palette for clouds', () => {
    expect(GRADIENT_PRESETS.SKY.name).toBe('Sky (Animated)')
    expect(GRADIENT_PRESETS.SKY.palette).toHaveLength(3)
    expect(GRADIENT_PRESETS.SKY.palette[0]).toEqual(GOOGLE_COLORS.BLUE)
    expect(GRADIENT_PRESETS.SKY.palette[1]).toEqual(GOOGLE_COLORS.WHITE)
    expect(GRADIENT_PRESETS.SKY.palette[2]).toEqual(GOOGLE_COLORS.BLUE)
  })

  test('SKY preset has slow animation for parallax', () => {
    expect(GRADIENT_PRESETS.SKY.animationSpeed).toBe(0.2)
    expect(GRADIENT_PRESETS.SKY.controlPoints).toBe(12)
    expect(GRADIENT_PRESETS.SKY.perColumn).toBe(true)
  })

  test('SKY preset has slowest animation speed', () => {
    const allSpeeds = Object.values(GRADIENT_PRESETS).map(p => p.animationSpeed)
    const minSpeed = Math.min(...allSpeeds)
    expect(GRADIENT_PRESETS.SKY.animationSpeed).toBe(minSpeed)
  })

  test('animation speeds are ordered correctly', () => {
    expect(GRADIENT_PRESETS.SKY.animationSpeed).toBeLessThan(GRADIENT_PRESETS.BACKGROUND.animationSpeed)
    expect(GRADIENT_PRESETS.BACKGROUND.animationSpeed).toBeLessThan(GRADIENT_PRESETS.PLAYER.animationSpeed)
    expect(GRADIENT_PRESETS.PLAYER.animationSpeed).toBeLessThan(GRADIENT_PRESETS.BULLET.animationSpeed)
    expect(GRADIENT_PRESETS.BULLET.animationSpeed).toBeLessThan(GRADIENT_PRESETS.EXPLOSION.animationSpeed)
  })
})

describe('GradientPresets - getRandomEnemyGradient', () => {
  test('returns one of the three enemy presets', () => {
    const gradient = getRandomEnemyGradient()

    const validPresets = [
      GRADIENT_PRESETS.ENEMY_HOT,
      GRADIENT_PRESETS.ENEMY_COLD,
      GRADIENT_PRESETS.ENEMY_RAINBOW
    ]

    expect(validPresets).toContainEqual(gradient)
  })

  test('returns valid gradient preset structure', () => {
    const gradient = getRandomEnemyGradient()

    expect(gradient).toHaveProperty('name')
    expect(gradient).toHaveProperty('palette')
    expect(gradient).toHaveProperty('controlPoints')
    expect(gradient).toHaveProperty('animationSpeed')
    expect(gradient).toHaveProperty('perColumn')
  })

  test('returns different presets over multiple calls', () => {
    const results = new Set()

    // Call 100 times to get statistical distribution
    for (let i = 0; i < 100; i++) {
      const gradient = getRandomEnemyGradient()
      results.add(gradient.animationSpeed)  // Use speed as unique identifier
    }

    // Should get at least 2 different presets (0.6, 0.8, 1.0)
    expect(results.size).toBeGreaterThanOrEqual(2)
  })

  test('always returns enemy preset', () => {
    for (let i = 0; i < 10; i++) {
      const gradient = getRandomEnemyGradient()
      expect(gradient.name).toBe('Enemy (Animated)')
    }
  })

  test('returns reference to original preset object', () => {
    const gradient = getRandomEnemyGradient()

    // Should be one of the original objects (not a copy)
    const isOriginal =
      gradient === GRADIENT_PRESETS.ENEMY_HOT ||
      gradient === GRADIENT_PRESETS.ENEMY_COLD ||
      gradient === GRADIENT_PRESETS.ENEMY_RAINBOW

    expect(isOriginal).toBe(true)
  })
})

describe('GradientPresets - createCustomGradient', () => {
  test('creates gradient with all required properties', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0], [0, 0, 255]])

    expect(gradient).toHaveProperty('name')
    expect(gradient).toHaveProperty('palette')
    expect(gradient).toHaveProperty('controlPoints')
    expect(gradient).toHaveProperty('animationSpeed')
    expect(gradient).toHaveProperty('perColumn')
  })

  test('uses provided name', () => {
    const gradient = createCustomGradient('CUSTOM_NAME', [[255, 0, 0]])

    expect(gradient.name).toBe('CUSTOM_NAME')
  })

  test('uses provided color palette', () => {
    const colors = [[255, 0, 0], [0, 255, 0], [0, 0, 255]]
    const gradient = createCustomGradient('RGB', colors)

    expect(gradient.palette).toEqual(colors)
    expect(gradient.palette).toHaveLength(3)
  })

  test('uses default controlPoints when not specified', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]])

    expect(gradient.controlPoints).toBe(6)
  })

  test('uses provided controlPoints', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]], 8)

    expect(gradient.controlPoints).toBe(8)
  })

  test('clamps controlPoints to minimum of 4', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]], 2)

    expect(gradient.controlPoints).toBe(4)
  })

  test('clamps controlPoints to maximum of 8', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]], 12)

    expect(gradient.controlPoints).toBe(8)
  })

  test('uses default animationSpeed when not specified', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]])

    expect(gradient.animationSpeed).toBe(0.5)
  })

  test('uses provided animationSpeed', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]], 6, 2.5)

    expect(gradient.animationSpeed).toBe(2.5)
  })

  test('uses default perColumn when not specified', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]])

    expect(gradient.perColumn).toBe(true)
  })

  test('uses provided perColumn', () => {
    const gradient = createCustomGradient('TEST', [[255, 0, 0]], 6, 0.5, false)

    expect(gradient.perColumn).toBe(false)
  })

  test('creates purple to pink gradient', () => {
    const gradient = createCustomGradient(
      'CUSTOM_PURPLE',
      [[128, 0, 128], [255, 192, 203]],
      6,
      0.5,
      true
    )

    expect(gradient.name).toBe('CUSTOM_PURPLE')
    expect(gradient.palette).toEqual([[128, 0, 128], [255, 192, 203]])
    expect(gradient.controlPoints).toBe(6)
    expect(gradient.animationSpeed).toBe(0.5)
    expect(gradient.perColumn).toBe(true)
  })

  test('creates fiery gradient with sharp transitions', () => {
    const gradient = createCustomGradient(
      'FIRE',
      [
        [255, 255, 0],   // Yellow
        [255, 128, 0],   // Orange
        [255, 0, 0],     // Red
        [128, 0, 0]      // Dark red
      ],
      4,
      1.5
    )

    expect(gradient.name).toBe('FIRE')
    expect(gradient.palette).toHaveLength(4)
    expect(gradient.controlPoints).toBe(4)
    expect(gradient.animationSpeed).toBe(1.5)
  })

  test('creates neon gradient', () => {
    const gradient = createCustomGradient('NEON', [[0, 255, 255], [255, 0, 255]])

    expect(gradient.name).toBe('NEON')
    expect(gradient.palette).toEqual([[0, 255, 255], [255, 0, 255]])
  })

  test('handles single color palette', () => {
    const gradient = createCustomGradient('SOLID', [[255, 0, 0]])

    expect(gradient.palette).toHaveLength(1)
    expect(gradient.palette[0]).toEqual([255, 0, 0])
  })

  test('handles many colors in palette', () => {
    const colors = [
      [255, 0, 0],
      [255, 128, 0],
      [255, 255, 0],
      [0, 255, 0],
      [0, 0, 255],
      [128, 0, 128]
    ]
    const gradient = createCustomGradient('RAINBOW', colors)

    expect(gradient.palette).toHaveLength(6)
  })

  test('controlPoints clamping works for various inputs', () => {
    expect(createCustomGradient('T', [[255, 0, 0]], 0).controlPoints).toBe(4)
    expect(createCustomGradient('T', [[255, 0, 0]], 3).controlPoints).toBe(4)
    expect(createCustomGradient('T', [[255, 0, 0]], 4).controlPoints).toBe(4)
    expect(createCustomGradient('T', [[255, 0, 0]], 6).controlPoints).toBe(6)
    expect(createCustomGradient('T', [[255, 0, 0]], 8).controlPoints).toBe(8)
    expect(createCustomGradient('T', [[255, 0, 0]], 10).controlPoints).toBe(8)
    expect(createCustomGradient('T', [[255, 0, 0]], 100).controlPoints).toBe(8)
  })
})

describe('GradientPresets - Integration', () => {
  test('can use GOOGLE_COLORS to create custom gradient', () => {
    const gradient = createCustomGradient(
      'CUSTOM_GOOGLE',
      [GOOGLE_COLORS.BLUE, GOOGLE_COLORS.RED]
    )

    expect(gradient.palette[0]).toEqual([66, 133, 244])
    expect(gradient.palette[1]).toEqual([234, 67, 53])
  })

  test('custom gradient matches preset structure', () => {
    const custom = createCustomGradient('CUSTOM', [[255, 0, 0]], 16, 1.2, true)
    const preset = GRADIENT_PRESETS.PLAYER

    // Should have same properties
    expect(Object.keys(custom).sort()).toEqual(Object.keys(preset).sort())
  })

  test('random enemy gradient can be used as template', () => {
    const enemy = getRandomEnemyGradient()

    // Create custom gradient with same config but different colors
    const custom = createCustomGradient(
      'CUSTOM_ENEMY',
      [[255, 0, 0], [0, 0, 255]],
      enemy.controlPoints,
      enemy.animationSpeed,
      enemy.perColumn
    )

    // Note: controlPoints may be clamped to max of 8, so we check the clamped value
    expect(custom.controlPoints).toBe(Math.min(enemy.controlPoints, 8))
    expect(custom.animationSpeed).toBe(enemy.animationSpeed)
    expect(custom.perColumn).toBe(enemy.perColumn)
  })

  test('all preset types are distinct', () => {
    const presets = Object.values(GRADIENT_PRESETS)
    const animationSpeeds = presets.map(p => p.animationSpeed)

    // Check we have variety in animation speeds
    const uniqueSpeeds = new Set(animationSpeeds)
    expect(uniqueSpeeds.size).toBeGreaterThan(5)  // At least 6 different speeds
  })
})
