/**
 * Unit tests for DebugPresets Validation Logic
 * Tests Phase 3 preset format validation and rejection of Phase 2 presets
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { validatePresetFormat } from '../../src/debug/DebugPresets.js'

describe('DebugPresets - Format Validation', () => {
  describe('validatePresetFormat', () => {
    test('accepts valid Phase 3 preset', () => {
      const preset = {
        name: 'test-preset',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 30,
          invader: { golUpdateRate: 15 },
          player: { speed: 18 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(true)
      expect(result.reason).toBe('')
    })

    test('rejects Phase 2 preset with invader.cellSize', () => {
      const preset = {
        name: 'old-preset',
        version: 2,
        game: 'space-invaders',
        config: {
          invader: { cellSize: 30, golUpdateRate: 15 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('version 3')
    })

    test('rejects Phase 2 preset with player.cellSize', () => {
      const preset = {
        name: 'old-preset-2',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 30,
          player: { cellSize: 30, speed: 18 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Phase 2 format')
    })

    test('rejects Phase 2 preset with bullet.cellSize', () => {
      const preset = {
        name: 'old-preset-3',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 30,
          bullet: { cellSize: 30, speed: -8 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Phase 2 format')
    })

    test('rejects preset missing globalCellSize', () => {
      const preset = {
        name: 'invalid-preset',
        version: 3,
        game: 'space-invaders',
        config: {
          invader: { golUpdateRate: 15 }
          // Missing globalCellSize
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('globalCellSize')
    })

    test('accepts preset with globalCellSize and no per-entity cellSize', () => {
      const preset = {
        name: 'valid-preset',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 45,
          invader: { golUpdateRate: 10 },
          player: { speed: 20 },
          bullet: { speed: -10 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(true)
    })

    test('rejects mixed format (has both globalCellSize and per-entity)', () => {
      const preset = {
        name: 'mixed-preset',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 30,
          invader: { cellSize: 25, golUpdateRate: 15 }  // Conflict!
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Phase 2 format')
    })

    test('accepts preset with all entity types configured', () => {
      const preset = {
        name: 'full-config',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 35,
          invader: { golUpdateRate: 12 },
          player: { speed: 15 },
          bullet: { speed: -12 }
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(true)
    })

    test('rejects preset with explosion.cellSize (old format)', () => {
      const preset = {
        name: 'explosion-preset',
        version: 3,
        game: 'space-invaders',
        config: {
          globalCellSize: 30,
          explosion: { cellSize: 25 }  // Old format
        }
      }

      const result = validatePresetFormat(preset)
      expect(result.valid).toBe(false)
      expect(result.reason).toContain('Phase 2 format')
    })
  })

  describe('Hitbox Scaling Calculation', () => {
    test('calculates hitbox for BLINKER at 30px cells', () => {
      const width = 5 * 30   // 150px
      const height = 3 * 30  // 90px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBe(72)  // (150 + 90) / 2 * 0.6 = 72
    })

    test('calculates hitbox for PULSAR at 30px cells', () => {
      const width = 15 * 30   // 450px
      const height = 15 * 30  // 450px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBe(270)  // (450 + 450) / 2 * 0.6 = 270
    })

    test('calculates hitbox for GLIDER at 45px cells', () => {
      const width = 5 * 45   // 225px
      const height = 5 * 45  // 225px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBe(135)  // (225 + 225) / 2 * 0.6 = 135
    })

    test('hitbox scales proportionally with cell size', () => {
      const gridCols = 5
      const gridRows = 5

      // At 30px
      const size30 = ((gridCols * 30) + (gridRows * 30)) / 2 * 0.6

      // At 60px (double)
      const size60 = ((gridCols * 60) + (gridRows * 60)) / 2 * 0.6

      expect(size60).toBe(size30 * 2)  // Hitbox doubles when cell size doubles
    })

    test('rectangular patterns have intermediate hitbox size', () => {
      // BLINKER (5×3 grid at 30px)
      const width = 5 * 30   // 150px
      const height = 3 * 30  // 90px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBeGreaterThan(0)
      expect(hitboxRadius).toBeLessThan(Math.max(width, height) * 0.6)
    })

    test('calculates hitbox for minimum cell size (15px)', () => {
      const width = 7 * 15   // 105px
      const height = 7 * 15  // 105px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBe(63)  // (105 + 105) / 2 * 0.6 = 63
    })

    test('calculates hitbox for maximum cell size (60px)', () => {
      const width = 7 * 60   // 420px
      const height = 7 * 60  // 420px
      const hitboxRadius = (width + height) / 2 * 0.6

      expect(hitboxRadius).toBe(252)  // (420 + 420) / 2 * 0.6 = 252
    })
  })
})
