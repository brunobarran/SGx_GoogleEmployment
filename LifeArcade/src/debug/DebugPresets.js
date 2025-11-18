/**
 * DebugPresets.js
 *
 * Preset management for Debug Interface (Phase 3.1)
 * Handles validation, loading, saving, and import/export of game presets.
 *
 * CRITICAL: Only Phase 3 format presets are supported (version: 3)
 * Phase 2 presets with per-entity cellSize are REJECTED.
 *
 * @module DebugPresets
 */

// ============================================
// VALIDATION
// ============================================

/**
 * Validate preset format (Phase 3).
 *
 * CRITICAL RULES:
 * - Must have version: 3
 * - Must have config.globalCellSize (NOT per-entity cellSize)
 * - Must reject Phase 2 presets with entity.cellSize properties
 *
 * @param {Object} preset - Preset object to validate
 * @returns {{ valid: boolean, reason: string }} Validation result
 *
 * @example
 * const result = validatePresetFormat(preset)
 * if (!result.valid) {
 *   alert(result.reason)
 * }
 */
export function validatePresetFormat(preset) {
  // 1. Check required fields
  if (!preset.name || typeof preset.name !== 'string') {
    return { valid: false, reason: "Missing or invalid 'name' field" }
  }

  if (preset.version !== 3) {
    return { valid: false, reason: "Preset must be version 3 (Phase 3 format). Phase 2 presets are not supported." }
  }

  if (!preset.game || typeof preset.game !== 'string') {
    return { valid: false, reason: "Missing or invalid 'game' field" }
  }

  if (!preset.config || typeof preset.config !== 'object') {
    return { valid: false, reason: "Missing or invalid 'config' object" }
  }

  // 2. Check Phase 3 format: globalCellSize required
  if (typeof preset.config.globalCellSize !== 'number') {
    return { valid: false, reason: "Missing 'config.globalCellSize' (Phase 3 required)" }
  }

  if (preset.config.globalCellSize < 10 || preset.config.globalCellSize > 100) {
    return { valid: false, reason: "globalCellSize must be between 10-100" }
  }

  // 3. Check Phase 2 format rejection: no per-entity cellSize
  for (const [key, value] of Object.entries(preset.config)) {
    if (key === 'globalCellSize') continue

    if (typeof value === 'object' && value !== null) {
      if ('cellSize' in value) {
        return {
          valid: false,
          reason: `Phase 2 format detected: '${key}.cellSize' not allowed. Use 'config.globalCellSize' instead. Please recreate this preset using the current debug interface.`
        }
      }
    }
  }

  // 4. Validate name format (alphanumeric + hyphens, 3-50 chars)
  if (!/^[a-zA-Z0-9-]{3,50}$/.test(preset.name)) {
    return {
      valid: false,
      reason: "Preset name must be 3-50 alphanumeric characters (hyphens allowed)"
    }
  }

  // 5. Validate appearances format (if present)
  if (preset.appearances) {
    const validModes = ['pure-gol', 'modified-gol', 'oscillator', 'static']

    for (const [entity, appearance] of Object.entries(preset.appearances)) {
      if (!validModes.includes(appearance.mode)) {
        return {
          valid: false,
          reason: `Invalid appearance mode for '${entity}': ${appearance.mode}`
        }
      }

      // Oscillator mode requires pattern and period
      if (appearance.mode === 'oscillator') {
        if (!appearance.pattern || typeof appearance.period !== 'number') {
          return {
            valid: false,
            reason: `Oscillator mode for '${entity}' requires 'pattern' and 'period'`
          }
        }
      }
    }
  }

  return { valid: true, reason: "" }
}

// ============================================
// LOAD / SAVE
// ============================================

/**
 * Load preset into CONFIG object.
 *
 * IMPORTANT: This mutates the CONFIG object.
 * Caller must trigger entity recreation callbacks after loading.
 *
 * @param {Object} preset - Validated preset object
 * @param {Object} config - Game CONFIG object (will be mutated)
 * @returns {boolean} Success status
 *
 * @example
 * const success = loadPreset(preset, CONFIG)
 * if (success) {
 *   callbacks.onInvadersChange()
 *   callbacks.onPlayerChange()
 * }
 */
export function loadPreset(preset, config) {
  try {
    // Deep merge preset config into game config
    // This preserves properties that aren't in the preset
    for (const [key, value] of Object.entries(preset.config)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        // Deep merge for nested objects (invader, player, etc.)
        if (!config[key]) {
          config[key] = {}
        }
        Object.assign(config[key], value)
      } else {
        // Direct assignment for primitives (globalCellSize, etc.)
        config[key] = value
      }
    }

    console.log(`[DebugPresets] Loaded preset: ${preset.name}`)
    return true
  } catch (error) {
    console.error('[DebugPresets] Failed to load preset:', error)
    return false
  }
}

/**
 * Save current CONFIG as preset object.
 *
 * @param {string} presetName - Name for the preset
 * @param {Object} config - Current game CONFIG
 * @param {string} gameName - Game identifier
 * @returns {Object} Preset object ready for export
 *
 * @example
 * const preset = saveCurrentPreset('my-custom', CONFIG, 'space-invaders')
 * exportPresetToJSON(preset)
 */
export function saveCurrentPreset(presetName, config, gameName) {
  return {
    name: presetName,
    version: 3,
    game: gameName,
    timestamp: new Date().toISOString(),
    config: {
      globalCellSize: config.globalCellSize,
      invader: { ...config.invader },
      player: { ...config.player },
      bullet: { ...config.bullet },
      explosion: { ...config.explosion }
    }
  }
}

// ============================================
// BUILT-IN PRESETS
// ============================================

/**
 * Get built-in presets for a game.
 * Fetches JSON files from presets/{gameName}/ directory.
 *
 * @param {string} gameName - Game identifier
 * @returns {Promise<Object>} Map of preset names to preset objects
 *
 * @example
 * const presets = await getBuiltInPresets('space-invaders')
 * // { default: {...}, easy: {...}, hard: {...}, chaos: {...} }
 */
export async function getBuiltInPresets(gameName) {
  const presetNames = ['default', 'easy', 'hard', 'chaos']
  const presets = {}

  for (const name of presetNames) {
    try {
      const response = await fetch(`/presets/${gameName}/${name}.json`)
      if (!response.ok) {
        console.warn(`[DebugPresets] Failed to load preset: ${name}`)
        continue
      }
      presets[name] = await response.json()
    } catch (error) {
      console.error(`[DebugPresets] Error loading preset ${name}:`, error)
    }
  }

  return presets
}

/**
 * Check if preset name is a built-in preset.
 *
 * @param {string} presetName - Preset name to check
 * @returns {boolean} True if built-in
 */
export function isBuiltInPreset(presetName) {
  return ['default', 'easy', 'hard', 'chaos'].includes(presetName)
}

// ============================================
// IMPORT / EXPORT
// ============================================

/**
 * Export preset as JSON file (download).
 *
 * @param {Object} preset - Preset object to export
 *
 * @example
 * const preset = saveCurrentPreset('custom', CONFIG, 'space-invaders')
 * exportPresetToJSON(preset)
 * // Downloads: space-invaders-custom-20251118-143522.json
 */
export function exportPresetToJSON(preset) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '')
    .replace('T', '-')
    .substring(0, 15) // YYYYMMDD-HHMMSS

  const filename = `${preset.game}-${preset.name}-${timestamp}.json`
  const json = JSON.stringify(preset, null, 2)

  // Create download
  const blob = new Blob([json], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)

  console.log(`[DebugPresets] Exported preset: ${filename}`)
}

/**
 * Import preset from JSON file (file input dialog).
 *
 * @returns {Promise<Object>} Parsed preset object
 *
 * @example
 * const preset = await importPresetFromJSON()
 * const validation = validatePresetFormat(preset)
 * if (validation.valid) {
 *   loadPreset(preset, CONFIG)
 * }
 */
export function importPresetFromJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'

    input.onchange = async (e) => {
      const file = e.target.files[0]
      if (!file) {
        reject(new Error('No file selected'))
        return
      }

      try {
        const text = await file.text()
        const preset = JSON.parse(text)
        resolve(preset)
      } catch (error) {
        reject(new Error('Invalid JSON file'))
      }
    }

    input.click()
  })
}

// ============================================
// UTILITIES
// ============================================

/**
 * Validate preset name format.
 *
 * @param {string} name - Preset name to validate
 * @returns {boolean} True if valid
 */
export function isValidPresetName(name) {
  return /^[a-zA-Z0-9-]{3,50}$/.test(name)
}
