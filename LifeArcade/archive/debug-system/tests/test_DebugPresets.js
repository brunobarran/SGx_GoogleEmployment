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

  test('accepts preset with valid appearances section (Phase 3.2)', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      },
      appearances: {
        player: {
          mode: 'modified-gol',
          pattern: null,
          period: null
        },
        invaders: {
          mode: 'oscillator',
          pattern: 'blinker',
          period: 2
        }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(true)
  })

  test('rejects preset with invalid appearance mode', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      },
      appearances: {
        player: {
          mode: 'invalid-mode',  // Invalid mode
          pattern: null,
          period: null
        }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('Invalid appearance mode')
  })

  test('rejects oscillator mode missing pattern or period', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      },
      appearances: {
        invaders: {
          mode: 'oscillator',
          pattern: null,  // Missing pattern
          period: null    // Missing period
        }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('requires \'pattern\' and \'period\'')
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

    const result = loadPreset(preset, config)

    expect(result.success).toBe(true)
    expect(config.globalCellSize).toBe(35)
    expect(config.invader.rows).toBe(6)
  })

  test('loadPreset returns appearances object (Phase 3.2)', () => {
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
      },
      appearances: {
        player: { mode: 'modified-gol', pattern: null, period: null },
        invaders: { mode: 'oscillator', pattern: 'blinker', period: 2 }
      }
    }

    const result = loadPreset(preset, config)

    expect(result.success).toBe(true)
    expect(result.appearances).not.toBeNull()
    expect(result.appearances.player.mode).toBe('modified-gol')
    expect(result.appearances.invaders.mode).toBe('oscillator')
    expect(result.appearances.invaders.pattern).toBe('blinker')
    expect(result.appearances.invaders.period).toBe(2)
  })

  test('loadPreset returns null appearances when not present', () => {
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
      // No appearances
    }

    const result = loadPreset(preset, config)

    expect(result.success).toBe(true)
    expect(result.appearances).toBeNull()
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

  test('saveCurrentPreset includes appearances when provided (Phase 3.2)', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 },
      player: { speed: 18, golUpdateRate: 12 },
      bullet: { speed: -8, golUpdateRate: 0 },
      explosion: { golUpdateRate: 8 }
    }

    const appearances = {
      player: { mode: 'modified-gol', pattern: null, period: null },
      invaders: { mode: 'oscillator', pattern: 'pulsar', period: 3 }
    }

    const preset = saveCurrentPreset('custom', config, 'space-invaders', appearances)

    expect(preset.name).toBe('custom')
    expect(preset.version).toBe(3)
    expect(preset.appearances).not.toBeUndefined()
    expect(preset.appearances.player.mode).toBe('modified-gol')
    expect(preset.appearances.invaders.mode).toBe('oscillator')
    expect(preset.appearances.invaders.pattern).toBe('pulsar')
  })

  test('saveCurrentPreset excludes appearances when not provided', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 },
      player: { speed: 18, golUpdateRate: 12 },
      bullet: { speed: -8, golUpdateRate: 0 },
      explosion: { golUpdateRate: 8 }
    }

    const preset = saveCurrentPreset('custom', config, 'space-invaders')

    expect(preset.appearances).toBeUndefined()
  })

  test('saveCurrentPreset excludes appearances when empty object', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 },
      player: { speed: 18, golUpdateRate: 12 },
      bullet: { speed: -8, golUpdateRate: 0 },
      explosion: { golUpdateRate: 8 }
    }

    const preset = saveCurrentPreset('custom', config, 'space-invaders', {})

    expect(preset.appearances).toBeUndefined()
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
