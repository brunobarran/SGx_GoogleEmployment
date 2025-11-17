/**
 * DebugPresets.js
 *
 * Preset management for debug interface.
 * Handles saving, loading, and validation of debug configuration presets.
 *
 * Phase 3 Changes:
 * - Added preset format validation (Phase 2 vs Phase 3)
 * - Phase 3 presets use globalCellSize (top-level)
 * - Phase 2 presets with per-entity cellSize are rejected
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Validate preset format version (Phase 3.1).
 * Rejects Phase 2 presets with per-entity cellSize properties.
 * Requires Phase 3 format with globalCellSize at top level.
 *
 * @param {Object} preset - Preset object to validate
 * @returns {Object} { valid: boolean, reason: string }
 *
 * @example
 * // Valid Phase 3 preset
 * validatePresetFormat({
 *   config: {
 *     globalCellSize: 30,
 *     invader: { golUpdateRate: 15 }
 *   }
 * })
 * // Returns: { valid: true, reason: '' }
 *
 * // Invalid Phase 2 preset
 * validatePresetFormat({
 *   config: {
 *     invader: { cellSize: 30, golUpdateRate: 15 }
 *   }
 * })
 * // Returns: { valid: false, reason: 'Preset uses Phase 2 format...' }
 */
export function validatePresetFormat(preset) {
  if (!preset || !preset.config) {
    return {
      valid: false,
      reason: 'Preset missing config object.'
    }
  }

  // Check for Phase 2 format (old per-entity cellSize)
  const hasOldCellSize =
    preset.config?.invader?.cellSize !== undefined ||
    preset.config?.player?.cellSize !== undefined ||
    preset.config?.bullet?.cellSize !== undefined ||
    preset.config?.explosion?.cellSize !== undefined

  if (hasOldCellSize) {
    return {
      valid: false,
      reason: 'Preset uses Phase 2 format with per-entity cell sizes. Please recreate custom presets using the Phase 3 interface.'
    }
  }

  // Check for Phase 3 format (globalCellSize required)
  if (preset.config.globalCellSize === undefined) {
    return {
      valid: false,
      reason: 'Preset missing globalCellSize property. Please ensure preset is using Phase 3 format.'
    }
  }

  return { valid: true, reason: '' }
}

/**
 * Load preset with validation.
 * Validates format before applying to prevent Phase 2/3 conflicts.
 *
 * @param {Object} preset - Preset object to load
 * @returns {boolean} true if loaded successfully, false if validation failed
 *
 * @example
 * const preset = JSON.parse(localStorage.getItem('myPreset'))
 * if (!loadPreset(preset)) {
 *   alert('Preset format incompatible')
 * }
 */
export function loadPreset(preset) {
  const validation = validatePresetFormat(preset)

  if (!validation.valid) {
    alert(
      `Cannot load preset: ${validation.reason}\n\n` +
      'Please recreate custom presets using the Phase 3 interface.'
    )
    return false
  }

  // Apply preset (actual implementation depends on global CONFIG structure)
  if (typeof window !== 'undefined' && window.DEBUG_CONFIG) {
    Object.assign(window.DEBUG_CONFIG, preset.config)
    console.log('[DebugPresets] Loaded preset:', preset.name)
    return true
  }

  return false
}

/**
 * Save current configuration as preset with version metadata.
 * Automatically adds version: 3 to mark as Phase 3 format.
 *
 * @param {string} presetName - Name for the preset
 * @returns {Object} Saved preset object
 *
 * @example
 * const preset = saveCurrentPreset('My Custom Preset')
 * localStorage.setItem('myPreset', JSON.stringify(preset))
 */
export function saveCurrentPreset(presetName) {
  const preset = {
    name: presetName,
    version: 3,  // Phase 3 format
    timestamp: new Date().toISOString(),
    game: getCurrentGameName(),
    config: JSON.parse(JSON.stringify(window.DEBUG_CONFIG || {})),
    appearances: JSON.parse(JSON.stringify(window.APPEARANCE_OVERRIDES || {}))
  }

  console.log('[DebugPresets] Saved preset:', presetName)
  return preset
}

/**
 * Get current game name from URL or default.
 *
 * @returns {string} Game name
 * @private
 */
function getCurrentGameName() {
  if (typeof window === 'undefined') return 'unknown'

  const params = new URLSearchParams(window.location.search)
  return params.get('game') || 'space-invaders'
}
