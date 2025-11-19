/**
 * DebugAppearance.js
 *
 * Appearance override system for debug interface.
 * Allows switching between 3 appearance modes:
 * - Modified GoL: Current system with lifeForce (Tier 2)
 * - Static Patterns: Frozen canonical patterns (Tier 1 visual)
 * - Loop Patterns: Animated patterns with periodic evolution (Tier 1)
 *
 * REFACTORED (2025-11-18):
 * - Now uses PatternRenderer.js for Static/Loop modes
 * - Eliminates 200+ lines of duplicated code
 * - Maintains 100% backward compatibility with debug UI
 *
 * CRITICAL: Follows CLAUDE.md authenticity tiers:
 * - Tier 1 (Pure GoL): Explosions, power-ups
 * - Tier 2 (Modified GoL): Player, large enemies
 * - Tier 3 (Visual Only): Bullets, small sprites
 *
 * Pattern Types & Phases (Adaptive):
 * - Still Lifes: Static only (1 phase - stable patterns)
 * - Oscillators Period 2 (BLINKER, TOAD, BEACON): 2 phases + Loop
 * - Oscillators Period 3 (PULSAR): 3 phases + Loop
 * - Spaceships Period 4 (GLIDER, LWSS): 4 phases + Loop
 *
 * @module DebugAppearance
 */

import { GoLEngine } from '../core/GoLEngine.js'
import { Patterns } from '../utils/Patterns.js'
import { createPatternRenderer, RenderMode } from '../utils/PatternRenderer.js'

/**
 * Available canonical GoL patterns from Patterns.js
 * Following LifeWiki standards (CLAUDE.md requirement)
 *
 * Auto-generated from Patterns.js to avoid duplication.
 * If new patterns are added to Patterns.js, they automatically appear here.
 */
export const STATIC_PATTERNS = Object.keys(Patterns).reduce((acc, key) => {
  acc[key] = key
  return acc
}, {})

/**
 * Pattern periods for oscillators and spaceships.
 * Used to calculate static snapshots at different phases.
 */
export const PATTERN_PERIODS = {
  BLINKER: 2,
  TOAD: 2,
  BEACON: 2,
  PULSAR: 3,
  GLIDER: 4,
  LIGHTWEIGHT_SPACESHIP: 4
}

/**
 * Appearance modes enum
 */
export const APPEARANCE_MODES = {
  MODIFIED_GOL: 'modified-gol',      // Current system (Tier 2)
  STATIC_PATTERN: 'static-pattern',  // Frozen patterns (Tier 1 visual)
  LOOP_PATTERN: 'loop-pattern'       // Animated loop (Tier 1)
}

/**
 * Global appearance override registry.
 * Injected into window when debug mode active.
 *
 * Structure:
 * {
 *   player: { mode: 'modified-gol', pattern: null, period: null },
 *   invaders: { mode: 'static-pattern', pattern: 'PULSAR', period: 0 },
 *   bullets: { mode: 'loop-pattern', pattern: 'BLINKER', period: null },
 *   explosions: { mode: 'modified-gol', pattern: null, period: null }
 * }
 *
 * period: For static patterns, indicates which phase (0, 1, 2). For loop, null = animate all.
 */
export function initAppearanceOverrides() {
  if (typeof window !== 'undefined') {
    window.APPEARANCE_OVERRIDES = {
      player: { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null },
      invaders: { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null },
      bullets: { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null },
      explosions: { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null }
    }
  }
}

/**
 * Update appearance override for an entity type.
 *
 * @param {string} entityType - Entity type ('player', 'invaders', 'bullets', 'explosions')
 * @param {string} mode - Appearance mode (APPEARANCE_MODES enum)
 * @param {string|null} pattern - Pattern name (for STATIC_PATTERN/LOOP_PATTERN mode)
 * @param {number|null} period - Period phase (for STATIC_PATTERN mode: 0, 1, 2)
 *
 * @example
 * updateAppearanceOverride('player', 'static-pattern', 'GLIDER', 0)
 * updateAppearanceOverride('invaders', 'loop-pattern', 'PULSAR', null)
 */
export function updateAppearanceOverride(entityType, mode, pattern = null, period = null) {
  if (typeof window === 'undefined' || !window.APPEARANCE_OVERRIDES) {
    console.warn('[DebugAppearance] APPEARANCE_OVERRIDES not initialized')
    return
  }

  if (!window.APPEARANCE_OVERRIDES[entityType]) {
    console.warn(`[DebugAppearance] Unknown entity type: ${entityType}`)
    return
  }

  window.APPEARANCE_OVERRIDES[entityType] = {
    mode,
    pattern,
    period
  }

  console.log(`[DebugAppearance] Updated ${entityType}:`, { mode, pattern, period })
}

/**
 * Get appearance override for an entity type.
 *
 * @param {string} entityType - Entity type
 * @returns {Object|null} Override object or null if not found
 *
 * @example
 * const override = getAppearanceOverride('player')
 * if (override && override.mode === 'static-pattern') {
 *   // Apply static pattern
 * }
 */
export function getAppearanceOverride(entityType) {
  if (typeof window === 'undefined' || !window.APPEARANCE_OVERRIDES) {
    return null
  }

  return window.APPEARANCE_OVERRIDES[entityType] || null
}

// NOTE: calculateOptimalConfig and scalePattern functions removed.
// Now using PatternRenderer.js for all pattern calculations.

/**
 * Apply appearance override to a GoL engine during entity setup.
 * This is the CRITICAL function that game code calls.
 *
 * @param {Object} gol - GoLEngine instance
 * @param {string} entityType - Entity type ('player', 'invaders', 'bullets', 'explosions')
 * @param {Object} Patterns - Patterns module (from src/utils/Patterns.js)
 * @param {Function} seedRadialDensity - Seeding function (from src/utils/PatternSeeding.js)
 * @param {Object} CONFIG - Game CONFIG object with cellSize values (required for Option C)
 * @param {Object} entity - Entity object (player, invader, etc.) - optional
 *
 * @returns {Object|boolean} Tier config {cellSize, gridSize} if override applied, false otherwise
 *
 * @example
 * // In space-invaders.js setupPlayer():
 * import { Patterns } from '../../src/utils/Patterns.js'
 * import { seedRadialDensity } from '../../src/utils/PatternSeeding.js'
 *
 * function setupPlayer() {
 *   const tierConfig = applyAppearanceOverride(null, 'player', Patterns, seedRadialDensity, CONFIG)
 *
 *   if (tierConfig) {
 *     // Use tier-specific settings
 *     player.cellSize = tierConfig.cellSize
 *     player.gol = new GoLEngine(tierConfig.gridSize, tierConfig.gridSize, 0)
 *     // applyAppearanceOverride will configure the gol
 *     applyAppearanceOverride(player.gol, 'player', Patterns, seedRadialDensity, CONFIG)
 *   } else {
 *     // Default Modified GoL setup
 *     player.cellSize = CONFIG.player.cellSize
 *     player.gol = new GoLEngine(6, 6, 12)
 *     seedRadialDensity(player.gol, 0.85, 0.0)
 *     player.gol.setPattern(Patterns.BLINKER, 2, 2)
 *   }
 * }
 */
export function applyAppearanceOverride(gol, entityType, Patterns, seedRadialDensity, CONFIG = null, entity = null) {
  const override = getAppearanceOverride(entityType)

  console.log(`[DebugAppearance] Checking override for ${entityType}:`, override)

  if (!override || override.mode === APPEARANCE_MODES.MODIFIED_GOL) {
    console.log(`[DebugAppearance] Using default Modified GoL for ${entityType}`)
    // Unfreeze in case it was previously frozen
    if (gol) gol.unfreeze()
    return false // Use default Modified GoL setup
  }

  // REFACTORED: Use PatternRenderer for Static/Loop modes
  const patternName = override.pattern || 'BLINKER'
  const globalCellSize = CONFIG?.globalCellSize || 30
  const loopUpdateRate = CONFIG?.loopUpdateRate || 10

  if (override.mode === APPEARANCE_MODES.STATIC_PATTERN) {
    const phase = override.period !== undefined ? override.period : 0

    // Use PatternRenderer to create static pattern
    const renderer = createPatternRenderer({
      mode: RenderMode.STATIC,
      pattern: patternName,
      phase: phase,
      globalCellSize: globalCellSize
    })

    console.log(`[DebugAppearance] Static ${patternName} phase ${phase}: ${renderer.dimensions.width}×${renderer.dimensions.height}px`)

    // If gol is null, return config for entity to use during creation
    if (!gol) {
      return {
        cellSize: renderer.dimensions.cellSize,
        gridSize: renderer.dimensions.gridSize,
        pattern: renderer.gol.getPattern(),
        patternName: patternName,
        periodPhase: phase
      }
    }

    // Copy pattern from renderer to entity gol
    gol.clearGrid()
    const minCols = Math.min(gol.cols, renderer.gol.cols)
    const minRows = Math.min(gol.rows, renderer.gol.rows)

    for (let x = 0; x < minCols; x++) {
      for (let y = 0; y < minRows; y++) {
        gol.current[x][y] = renderer.gol.current[x][y]
      }
    }

    gol.freeze()
    return true
  }

  if (override.mode === APPEARANCE_MODES.LOOP_PATTERN) {
    // Use PatternRenderer to create loop pattern
    const renderer = createPatternRenderer({
      mode: RenderMode.LOOP,
      pattern: patternName,
      globalCellSize: globalCellSize,
      loopUpdateRate: loopUpdateRate
    })

    console.log(`[DebugAppearance] Loop ${patternName} period ${renderer.metadata.period}: ${renderer.dimensions.width}×${renderer.dimensions.height}px`)

    // If gol is null, return config for entity to use during creation
    if (!gol) {
      return {
        cellSize: renderer.dimensions.cellSize,
        gridSize: renderer.dimensions.gridSize,
        pattern: renderer.gol.loopPattern,
        patternName: patternName,
        loop: true
      }
    }

    // Copy pattern and loop metadata from renderer to entity gol
    gol.clearGrid()
    const minCols = Math.min(gol.cols, renderer.gol.cols)
    const minRows = Math.min(gol.rows, renderer.gol.rows)

    for (let x = 0; x < minCols; x++) {
      for (let y = 0; y < minRows; y++) {
        gol.current[x][y] = renderer.gol.current[x][y]
      }
    }

    // Copy loop metadata (CRITICAL for LoopPatternHelpers)
    gol.isLoopPattern = true
    gol.loopPeriod = renderer.metadata.period
    gol.loopPattern = renderer.gol.loopPattern
    gol.loopPatternWidth = renderer.gol.loopPatternWidth
    gol.loopPatternHeight = renderer.gol.loopPatternHeight
    gol.loopResetCounter = 0
    gol.loopLastGeneration = 0
    gol.updateRateFPS = loopUpdateRate

    // Unfreeze to allow continuous evolution
    gol.unfreeze()

    return true
  }

  return false
}

/**
 * Get dropdown options for appearance mode selector.
 *
 * @param {string} entityType - Entity type
 * @returns {Array} Array of option objects {value, label, group}
 */
export function getAppearanceOptions(entityType) {
  const options = []

  // Modified GoL (default)
  options.push({
    value: 'modified-gol',
    label: 'Modified GoL (Current)',
    group: 'Current'
  })

  // Still Lifes - Static only (stable patterns)
  const stillLifes = [
    { value: 'static-BLOCK-0', label: 'Block', group: 'Still Lifes' },
    { value: 'static-BEEHIVE-0', label: 'Beehive', group: 'Still Lifes' },
    { value: 'static-LOAF-0', label: 'Loaf', group: 'Still Lifes' },
    { value: 'static-BOAT-0', label: 'Boat', group: 'Still Lifes' },
    { value: 'static-TUB-0', label: 'Tub', group: 'Still Lifes' }
  ]
  options.push(...stillLifes)

  // Oscillators - Loop + dynamic phases based on period
  const oscillators = [
    // Blinker (period 2) - 2 phases
    { value: 'loop-BLINKER', label: 'Blinker (Loop)', group: 'Oscillators' },
    { value: 'static-BLINKER-0', label: 'Blinker (Phase 1/2)', group: 'Oscillators' },
    { value: 'static-BLINKER-1', label: 'Blinker (Phase 2/2)', group: 'Oscillators' },

    // Toad (period 2) - 2 phases
    { value: 'loop-TOAD', label: 'Toad (Loop)', group: 'Oscillators' },
    { value: 'static-TOAD-0', label: 'Toad (Phase 1/2)', group: 'Oscillators' },
    { value: 'static-TOAD-1', label: 'Toad (Phase 2/2)', group: 'Oscillators' },

    // Beacon (period 2) - 2 phases
    { value: 'loop-BEACON', label: 'Beacon (Loop)', group: 'Oscillators' },
    { value: 'static-BEACON-0', label: 'Beacon (Phase 1/2)', group: 'Oscillators' },
    { value: 'static-BEACON-1', label: 'Beacon (Phase 2/2)', group: 'Oscillators' },

    // Pulsar (period 3) - 3 phases
    { value: 'loop-PULSAR', label: 'Pulsar (Loop)', group: 'Oscillators' },
    { value: 'static-PULSAR-0', label: 'Pulsar (Phase 1/3)', group: 'Oscillators' },
    { value: 'static-PULSAR-1', label: 'Pulsar (Phase 2/3)', group: 'Oscillators' },
    { value: 'static-PULSAR-2', label: 'Pulsar (Phase 3/3)', group: 'Oscillators' }
  ]
  options.push(...oscillators)

  // Spaceships - Loop + dynamic phases based on period
  const spaceships = [
    // Glider (period 4) - 4 phases
    { value: 'loop-GLIDER', label: 'Glider (Loop)', group: 'Spaceships' },
    { value: 'static-GLIDER-0', label: 'Glider (Phase 1/4)', group: 'Spaceships' },
    { value: 'static-GLIDER-1', label: 'Glider (Phase 2/4)', group: 'Spaceships' },
    { value: 'static-GLIDER-2', label: 'Glider (Phase 3/4)', group: 'Spaceships' },
    { value: 'static-GLIDER-3', label: 'Glider (Phase 4/4)', group: 'Spaceships' },

    // LWSS (period 4) - 4 phases
    { value: 'loop-LIGHTWEIGHT_SPACESHIP', label: 'LWSS (Loop)', group: 'Spaceships' },
    { value: 'static-LIGHTWEIGHT_SPACESHIP-0', label: 'LWSS (Phase 1/4)', group: 'Spaceships' },
    { value: 'static-LIGHTWEIGHT_SPACESHIP-1', label: 'LWSS (Phase 2/4)', group: 'Spaceships' },
    { value: 'static-LIGHTWEIGHT_SPACESHIP-2', label: 'LWSS (Phase 3/4)', group: 'Spaceships' },
    { value: 'static-LIGHTWEIGHT_SPACESHIP-3', label: 'LWSS (Phase 4/4)', group: 'Spaceships' }
  ]
  options.push(...spaceships)

  return options
}

/**
 * Parse dropdown value to extract mode, pattern, period.
 *
 * @param {string} value - Dropdown value (e.g., "static-GLIDER-0", "loop-BLINKER")
 * @returns {Object} { mode, pattern, period }
 *
 * @example
 * parseAppearanceValue('static-GLIDER-0')
 * // Returns: { mode: 'static-pattern', pattern: 'GLIDER', period: 0 }
 *
 * parseAppearanceValue('loop-BLINKER')
 * // Returns: { mode: 'loop-pattern', pattern: 'BLINKER', period: null }
 *
 * parseAppearanceValue('modified-gol')
 * // Returns: { mode: 'modified-gol', pattern: null, period: null }
 */
export function parseAppearanceValue(value) {
  if (value === 'modified-gol') {
    return { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null }
  }

  if (value.startsWith('static-')) {
    // Format: "static-PATTERN-PERIOD" (e.g., "static-GLIDER-0")
    const parts = value.replace('static-', '').split('-')
    const period = parseInt(parts.pop(), 10) // Extract last part as period
    const pattern = parts.join('_')  // Rejoin remaining parts (handles LIGHTWEIGHT_SPACESHIP)
    return { mode: APPEARANCE_MODES.STATIC_PATTERN, pattern, period }
  }

  if (value.startsWith('loop-')) {
    // Format: "loop-PATTERN" (e.g., "loop-BLINKER")
    const pattern = value.replace('loop-', '').replace(/-/g, '_')  // Handle LIGHTWEIGHT_SPACESHIP
    return { mode: APPEARANCE_MODES.LOOP_PATTERN, pattern, period: null }
  }

  // Fallback to Modified GoL
  return { mode: APPEARANCE_MODES.MODIFIED_GOL, pattern: null, period: null }
}

/**
 * Calculate optimal grid size for a GoL pattern (Phase 3.1).
 * Strategy: Use pattern dimensions as-is (patterns already include padding).
 *
 * NOTE: Patterns in Patterns.js already have padding integrated.
 * We don't add additional padding here.
 *
 * @param {string} patternName - Pattern name from Patterns module
 * @returns {Object} { cols, rows } - Grid dimensions
 *
 * @example
 * calculateGridSize('BLINKER')
 * // Returns: { cols: 3, rows: 3 }  // BLINKER pattern with padding
 *
 * calculateGridSize('PULSAR')
 * // Returns: { cols: 13, rows: 13 }  // PULSAR pattern dimensions
 *
 * calculateGridSize(null)
 * // Returns: { cols: 7, rows: 7 }  // Default for Modified GoL/Density
 */
export function calculateGridSize(patternName) {
  if (!patternName || !Patterns[patternName]) {
    return { cols: 7, rows: 7 }  // Default for Modified GoL/Density
  }

  const pattern = Patterns[patternName]
  const patternWidth = pattern[0] ? pattern[0].length : 0
  const patternHeight = pattern.length

  return {
    cols: patternWidth,
    rows: patternHeight
  }
}

/**
 * Get pattern metadata for UI display (Phase 3.1).
 * Returns structured information about pattern dimensions and required grid size.
 *
 * @param {string} patternName - Pattern name from Patterns module
 * @returns {Object} { name, dimensions, gridSize } - Pattern metadata
 *
 * @example
 * getPatternMetadata('BLINKER')
 * // Returns: { name: 'BLINKER', dimensions: '3×1', gridSize: '5×3' }
 *
 * getPatternMetadata('PULSAR')
 * // Returns: { name: 'PULSAR', dimensions: '13×13', gridSize: '15×15' }
 */
export function getPatternMetadata(patternName) {
  const pattern = Patterns[patternName]
  const width = pattern[0] ? pattern[0].length : 0
  const height = pattern.length
  const gridSize = calculateGridSize(patternName)

  return {
    name: patternName,
    dimensions: `${width}×${height}`,
    gridSize: `${gridSize.cols}×${gridSize.rows}`
  }
}
