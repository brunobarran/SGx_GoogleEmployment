/**
 * Tests for DebugPresets.js (Phase 3.1)
 *
 * @group debug
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import {
  validatePresetFormat,
  loadPreset,
  saveCurrentPreset,
  isBuiltInPreset,
  isValidPresetName
} from '../../src/debug/DebugPresets.js'

describe('DebugPresets - Validation', () => {
  test('accepts valid Phase 3 preset', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(true)
  })

  test('rejects Phase 2 preset', () => {
    const preset = {
      name: 'old',
      version: 2,
      config: {
        invader: { cellSize: 30, rows: 4 }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('version 3')
  })

  test('rejects preset with per-entity cellSize', () => {
    const preset = {
      name: 'bad',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { cellSize: 30, rows: 4 } // ❌ Phase 2 property
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Phase 2 format detected')
  })

  test('rejects preset missing globalCellSize', () => {
    const preset = {
      name: 'incomplete',
      version: 3,
      game: 'space-invaders',
      config: {
        invader: { rows: 4 }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('globalCellSize')
  })

  test('rejects invalid preset name', () => {
    const preset = {
      name: 'ab', // Too short
      version: 3,
      game: 'space-invaders',
      config: { globalCellSize: 30 }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('3-50')
  })

  test('accepts preset without appearances section', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      }
      // No appearances section - this is valid
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(true)
  })
})

describe('DebugPresets - Load/Save', () => {
  test('loadPreset updates CONFIG correctly', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4 }
    }

    const preset = {
      name: 'test',
      version: 3,
      config: {
        globalCellSize: 35,
        invader: { rows: 6 }
      }
    }

    const success = loadPreset(preset, config)

    expect(success).toBe(true)
    expect(config.globalCellSize).toBe(35)
    expect(config.invader.rows).toBe(6)
  })

  test('loadPreset preserves properties not in preset (deep merge)', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, cols: 4, spacing: 60, moveInterval: 30 },
      ui: { backgroundColor: '#FFFFFF' }
    }

    const preset = {
      name: 'test',
      version: 3,
      config: {
        globalCellSize: 35,
        invader: { rows: 6 }  // Only updating rows, not other props
      }
    }

    const success = loadPreset(preset, config)

    expect(success).toBe(true)
    expect(config.globalCellSize).toBe(35)
    expect(config.invader.rows).toBe(6)
    // These should be preserved
    expect(config.invader.cols).toBe(4)
    expect(config.invader.spacing).toBe(60)
    expect(config.invader.moveInterval).toBe(30)
    expect(config.ui.backgroundColor).toBe('#FFFFFF')
  })

  test('saveCurrentPreset captures current config', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 },
      player: { speed: 18, golUpdateRate: 12 },
      bullet: { speed: -8, golUpdateRate: 0 },
      explosion: { golUpdateRate: 8 }
    }

    const preset = saveCurrentPreset('custom', config, 'space-invaders')

    expect(preset.name).toBe('custom')
    expect(preset.version).toBe(3)
    expect(preset.game).toBe('space-invaders')
    expect(preset.config.globalCellSize).toBe(30)
    expect(preset.config.invader.rows).toBe(4)
  })
})

describe('DebugPresets - Utilities', () => {
  test('isBuiltInPreset identifies built-in presets', () => {
    expect(isBuiltInPreset('default')).toBe(true)
    expect(isBuiltInPreset('easy')).toBe(true)
    expect(isBuiltInPreset('hard')).toBe(true)
    expect(isBuiltInPreset('chaos')).toBe(true)
    expect(isBuiltInPreset('custom')).toBe(false)
  })

  test('isValidPresetName validates name format', () => {
    expect(isValidPresetName('valid-name')).toBe(true)
    expect(isValidPresetName('valid123')).toBe(true)
    expect(isValidPresetName('ab')).toBe(false) // Too short
    expect(isValidPresetName('invalid name')).toBe(false) // Has space
    expect(isValidPresetName('invalid!name')).toBe(false) // Has special char
  })
})
