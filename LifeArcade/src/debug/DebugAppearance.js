/**
 * DebugAppearance.js
 *
 * Appearance override system for debug interface.
 * Allows switching between 3 appearance modes:
 * - Modified GoL: Current system with lifeForce (Tier 2)
 * - Static Patterns: Frozen canonical patterns (Tier 1 visual)
 * - Loop Patterns: Animated patterns with periodic evolution (Tier 1)
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
 * OPTION A IMPROVED Implementation (Temporal Grid with Padding):
 * - Patterns evolve in temporary grid at ORIGINAL size (authentic B3/S23)
 * - 20% padding prevents border artifacts (CRITICAL for PULSAR)
 * - CellSize adjusted to make all patterns ~200px visual size
 * - Pattern cell count preserved (BLOCK=4 cells, PULSAR=169 cells)
 *
 * Phase Calculation:
 * - periodPhase directly maps to generations: phase 0 = gen 0, phase 1 = gen 1, etc.
 * - Evolution happens in temporal grid with padding, then snapshot applied to entity grid
 *
 * @module DebugAppearance
 */

import { GoLEngine } from '../core/GoLEngine.js'

/**
 * Available canonical GoL patterns from Patterns.js
 * Following LifeWiki standards (CLAUDE.md requirement)
 */
export const STATIC_PATTERNS = {
  // Still Lifes (stable, no change)
  BLOCK: 'BLOCK',
  BEEHIVE: 'BEEHIVE',
  LOAF: 'LOAF',
  BOAT: 'BOAT',
  TUB: 'TUB',
  POND: 'POND',
  SHIP: 'SHIP',

  // Oscillators (period patterns)
  BLINKER: 'BLINKER',
  TOAD: 'TOAD',
  BEACON: 'BEACON',
  PULSAR: 'PULSAR',

  // Spaceships (moving patterns)
  GLIDER: 'GLIDER',
  LIGHTWEIGHT_SPACESHIP: 'LIGHTWEIGHT_SPACESHIP'
}

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

/**
 * Calculate optimal configuration for a pattern using automatic formula.
 *
 * PHILOSOPHY (CLAUDE.md):
 * - KISS: One formula for all patterns
 * - YAGNI: No manual configuration per pattern
 * - Visual beauty: ~200px target size, patterns fill 80% of grid
 *
 * SCALING RULES:
 * - Pattern ≤3×3: Scale 3x (BLOCK, BOAT, GLIDER)
 * - Pattern 4×5: Scale 2x (BEEHIVE, TOAD, BEACON)
 * - Pattern ≥6×6: Scale 1x (PULSAR, LWSS)
 *
 * OPTION C IMPLEMENTATION:
 * - scaleMultiplier derived from cellSize slider ratio (slider / 30)
 * - Allows slider to affect static patterns proportionally
 *
 * @param {number[][]} pattern - Pattern array (row-major format)
 * @param {number} targetSize - Target sprite size in pixels (default: 200)
 * @param {number} scaleMultiplier - Scale multiplier from slider (default: 1.0)
 * @returns {Object} Configuration {scale, cellSize, gridSize}
 *
 * @example
 * const config = calculateOptimalConfig(Patterns.BLOCK, 200, 1.0)
 * // Returns: { scale: 3, cellSize: 33, gridSize: 8 }
 * // BLOCK 2×2 → scaled 6×6 → 6*33=198px sprite
 *
 * const config = calculateOptimalConfig(Patterns.BLOCK, 200, 1.5)
 * // Returns: { scale: 3, cellSize: 49, gridSize: 8 }
 * // BLOCK 2×2 → scaled 6×6 → 6*49=294px sprite (1.5x larger)
 */
function calculateOptimalConfig(pattern, targetSize = 200, scaleMultiplier = 1.0) {
  const patternHeight = pattern.length
  const patternWidth = pattern[0] ? pattern[0].length : 0
  const patternMaxDim = Math.max(patternHeight, patternWidth)

  // Determine scale factor based on pattern size
  let scale = 1
  if (patternMaxDim <= 3) {
    scale = 3  // Small patterns (2×2, 3×3)
  } else if (patternMaxDim <= 5) {
    scale = 2  // Medium patterns (4×4, 5×5)
  }
  // Large patterns (≥6) stay at scale 1

  // Calculate scaled dimensions
  const scaledWidth = patternWidth * scale
  const scaledHeight = patternHeight * scale
  const scaledMaxDim = Math.max(scaledWidth, scaledHeight)

  // Calculate base cellSize to reach target size
  const baseCellSize = Math.floor(targetSize / scaledMaxDim)

  // OPTION C: Apply scaleMultiplier from slider
  const cellSize = Math.floor(baseCellSize * scaleMultiplier)

  // Grid size with 20% padding (80% fill ratio)
  const gridSize = Math.ceil(scaledMaxDim * 1.2)

  return { scale, cellSize, gridSize }
}

/**
 * Scale a pattern by a factor N using pixel-perfect 2D repetition.
 * Each cell becomes an N×N block of cells.
 *
 * @param {number[][]} pattern - Original pattern (row-major)
 * @param {number} scale - Scale factor (2, 3, 4, etc.)
 * @returns {number[][]} Scaled pattern
 *
 * @example
 * const block = [[1,1], [1,1]]  // 2×2
 * const scaled = scalePattern(block, 2)
 * // Returns: 4×4 pattern with each cell doubled
 */
function scalePattern(pattern, scale) {
  if (scale === 1) return pattern

  const originalHeight = pattern.length
  const originalWidth = pattern[0] ? pattern[0].length : 0

  const scaledHeight = originalHeight * scale
  const scaledWidth = originalWidth * scale

  const scaled = []

  for (let row = 0; row < scaledHeight; row++) {
    scaled[row] = []
    const originalRow = Math.floor(row / scale)

    for (let col = 0; col < scaledWidth; col++) {
      const originalCol = Math.floor(col / scale)
      scaled[row][col] = pattern[originalRow][originalCol]
    }
  }

  return scaled
}

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

  if (override.mode === APPEARANCE_MODES.STATIC_PATTERN) {
    // OPTION A IMPROVED: Temporal grid with 20% padding for authentic B3/S23 evolution
    const patternName = override.pattern || 'BLINKER'
    const pattern = Patterns[patternName] || Patterns.BLINKER
    const periodPhase = override.period !== undefined ? override.period : 0

    // 1. Get original pattern dimensions
    const patternHeight = pattern.length
    const patternWidth = pattern[0] ? pattern[0].length : 0
    const patternMaxDim = Math.max(patternHeight, patternWidth)

    // 2. Create temporal grid with 20% PADDING (CRITICAL for border patterns like PULSAR)
    const paddedWidth = Math.ceil(patternWidth * 1.2)
    const paddedHeight = Math.ceil(patternHeight * 1.2)
    const tempGol = new GoLEngine(paddedWidth, paddedHeight, 0)

    // 3. Center pattern in temporal grid (gives border cells full 8-neighbor context)
    const tempCenterX = Math.floor((paddedWidth - patternWidth) / 2)
    const tempCenterY = Math.floor((paddedHeight - patternHeight) / 2)
    tempGol.setPattern(pattern, tempCenterX, tempCenterY)

    // 4. Evolve N generations in temporal grid (authentic B3/S23 at original size)
    if (periodPhase > 0 && PATTERN_PERIODS[patternName]) {
      const fullPeriod = PATTERN_PERIODS[patternName]
      console.log(`[DebugAppearance] Evolving ${patternName} (period ${fullPeriod}) for ${periodPhase} generations (phase ${periodPhase + 1}/${fullPeriod + 1})`)

      for (let i = 0; i < periodPhase; i++) {
        tempGol.update()
      }
    }

    // 5. Capture evolved pattern snapshot from temporal grid
    const evolvedPattern = tempGol.getPattern()

    // 6. Calculate cellSize to make pattern occupy ~200px (adjustable via slider)
    let entityCellSize = 30  // Default baseline
    if (CONFIG) {
      const configKey = entityType === 'invaders' ? 'invader' : entityType.replace(/s$/, '')
      if (CONFIG[configKey] && CONFIG[configKey].cellSize !== undefined) {
        entityCellSize = CONFIG[configKey].cellSize
      }
    }
    const defaultCellSize = 30
    const scaleMultiplier = entityCellSize / defaultCellSize

    // CellSize inversely proportional to pattern size (normalizes visual size)
    const baseCellSize = Math.floor(200 / patternMaxDim)
    const cellSize = Math.floor(baseCellSize * scaleMultiplier)

    // 7. Grid size uses padded dimensions
    const gridSize = Math.max(paddedWidth, paddedHeight)

    console.log(`[DebugAppearance] ${entityType}: ${patternName} ${patternWidth}×${patternHeight} → padded ${paddedWidth}×${paddedHeight}, cellSize=${cellSize}px, scale=${scaleMultiplier.toFixed(2)}x`)

    // 8. If gol is null, return config for entity to use during creation
    if (!gol) {
      return {
        cellSize: cellSize,
        gridSize: gridSize,
        pattern: evolvedPattern,
        patternName: patternName,
        periodPhase: periodPhase
      }
    }

    // 9. Apply evolved pattern to entity's gol (centered)
    gol.clearGrid()

    const entityCenterX = Math.floor((gol.cols - paddedWidth) / 2)
    const entityCenterY = Math.floor((gol.rows - paddedHeight) / 2)

    // Copy cells from temporal grid to entity grid
    for (let x = 0; x < paddedWidth; x++) {
      for (let y = 0; y < paddedHeight; y++) {
        const targetX = entityCenterX + x
        const targetY = entityCenterY + y
        if (targetX >= 0 && targetX < gol.cols && targetY >= 0 && targetY < gol.rows) {
          gol.current[targetX][targetY] = evolvedPattern[x][y]
        }
      }
    }

    gol.freeze()

    const spriteSize = `${gridSize * cellSize}px`
    console.log(`[DebugAppearance] Applied ${patternName}: ${patternWidth}×${patternHeight} → ${spriteSize} sprite (phase ${periodPhase})`)
    return true
  }

  if (override.mode === APPEARANCE_MODES.LOOP_PATTERN) {
    // LOOP_PATTERN: Apply pattern once, allow continuous evolution with periodic resets
    // This shows clean oscillations without manual frame-by-frame recalculation
    const patternName = override.pattern || 'BLINKER'
    const pattern = Patterns[patternName] || Patterns.BLINKER
    const fullPeriod = PATTERN_PERIODS[patternName] || 2

    // 1. Get original pattern dimensions
    const patternHeight = pattern.length
    const patternWidth = pattern[0] ? pattern[0].length : 0
    const patternMaxDim = Math.max(patternHeight, patternWidth)

    // 2. Calculate cellSize to make pattern occupy ~200px (adjustable via slider)
    let entityCellSize = 30
    if (CONFIG) {
      const configKey = entityType === 'invaders' ? 'invader' : entityType.replace(/s$/, '')
      if (CONFIG[configKey] && CONFIG[configKey].cellSize !== undefined) {
        entityCellSize = CONFIG[configKey].cellSize
      }
    }
    const defaultCellSize = 30
    const scaleMultiplier = entityCellSize / defaultCellSize

    const baseCellSize = Math.floor(200 / patternMaxDim)
    const cellSize = Math.floor(baseCellSize * scaleMultiplier)

    // 3. Grid size with 20% padding (same as static patterns)
    const paddedWidth = Math.ceil(patternWidth * 1.2)
    const paddedHeight = Math.ceil(patternHeight * 1.2)

    console.log(`[DebugAppearance] ${entityType}: ${patternName} (Loop) ${patternWidth}×${patternHeight}, cellSize=${cellSize}px, padded=${paddedWidth}×${paddedHeight}`)

    // 4. If gol is null, return config for entity to use during creation
    if (!gol) {
      return {
        cellSize: cellSize,
        gridSize: paddedWidth,  // Use padded dimensions
        pattern: pattern,
        patternName: patternName,
        loop: true
      }
    }

    // 5. Mark as loop pattern (Pure GoL, no lifeForce)
    // CRITICAL: This flag prevents applyLifeForce from corrupting Pure GoL patterns
    gol.isLoopPattern = true
    gol.loopPeriod = fullPeriod
    gol.loopPattern = pattern
    gol.loopPatternWidth = patternWidth
    gol.loopPatternHeight = patternHeight
    gol.loopResetCounter = 0  // Tracks GoL updates since last reset

    // 6. Apply initial pattern (only once)
    if (!gol.loopInitialized) {
      gol.loopInitialized = true

      gol.clearGrid()
      const centerX = Math.floor((gol.cols - patternWidth) / 2)
      const centerY = Math.floor((gol.rows - patternHeight) / 2)
      gol.setPattern(pattern, centerX, centerY)

      // Unfreeze to allow continuous B3/S23 evolution
      // Speed controlled dynamically by CONFIG.loopUpdateRate → updateRateFPS in handleLoopReset
      gol.unfreeze()

      console.log(`[DebugAppearance] Initialized ${patternName} loop: period=${fullPeriod}, Pure GoL (no lifeForce)`)
    }

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
