# PatternRenderer Guide

**Version:** Phase 3
**Created:** 2025-11-18
**Status:** Production Ready

## Overview

PatternRenderer is a Pure GoL (B3/S23) pattern rendering library that provides two rendering modes for Conway's Game of Life patterns in LifeArcade games.

**Key Features:**
- Pure GoL implementation (B3/S23 rules only)
- Two modes: STATIC (frozen patterns) and LOOP (animated oscillators)
- Support for 13 canonical GoL patterns
- Random pattern selection from arrays
- 20% padding for border-sensitive patterns
- 100% backward compatible with existing debug interface

**Replaces:** ~125 lines of duplicated code in DebugAppearance.js

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [API Reference](#api-reference)
3. [Pattern Catalog](#pattern-catalog)
4. [Usage Examples](#usage-examples)
5. [Integration Guide](#integration-guide)
6. [Advanced Features](#advanced-features)
7. [Testing](#testing)
8. [Migration from Phase 2](#migration-from-phase-2)

---

## Quick Start

### Basic Static Pattern

```javascript
import { createPatternRenderer, RenderMode, PatternName } from '../src/utils/PatternRenderer.js'

// Create a static BLINKER at phase 1 (horizontal)
const renderer = createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 1,
  globalCellSize: 30
})

// Use the frozen GoL engine
const entity = {
  x: 100,
  y: 100,
  width: renderer.dimensions.width,
  height: renderer.dimensions.height,
  gol: renderer.gol  // Already frozen, ready to render
}
```

### Basic Loop Pattern

```javascript
// Create an oscillating BLINKER (loops every 2 generations)
const renderer = createPatternRenderer({
  mode: RenderMode.LOOP,
  pattern: PatternName.BLINKER,
  globalCellSize: 30,
  loopUpdateRate: 10  // Updates per second
})

const entity = {
  x: 100,
  y: 100,
  width: renderer.dimensions.width,
  height: renderer.dimensions.height,
  gol: renderer.gol
}

// In your update loop:
entity.gol.updateThrottled(frameCount)
handleLoopReset(entity.gol, frameCount)
```

### Random Pattern Selection

```javascript
// Random pattern from array (different each spawn)
const renderer = createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: [PatternName.BLINKER, PatternName.TOAD, PatternName.BEACON],
  // phase omitted = random phase
  globalCellSize: 30
})
```

---

## API Reference

### `createPatternRenderer(config)`

Creates a pattern renderer with specified configuration.

**Parameters:**

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `mode` | `RenderMode` | Yes | - | `STATIC` or `LOOP` |
| `pattern` | `string \| string[]` | Yes | - | Pattern name or array for random selection |
| `phase` | `number` | No | Random | Generation phase (0 to period-1). Omit for random. |
| `globalCellSize` | `number` | No | `30` | Cell size in pixels (shared across all entities) |
| `loopUpdateRate` | `number` | No | `10` | Updates per second (LOOP mode only) |

**Returns:**

```javascript
{
  gol: GoLEngine,          // Configured GoL engine (frozen for STATIC)
  dimensions: {
    width: number,         // Pattern width in pixels
    height: number,        // Pattern height in pixels
    gridSize: number       // Grid size (cols/rows)
  },
  metadata: {
    mode: string,          // 'static' | 'loop'
    pattern: string,       // Resolved pattern name
    phase: number|null,    // Phase (STATIC only)
    period: number         // Pattern period
  }
}
```

**Throws:**
- `Error` if mode is missing or invalid
- `Error` if pattern is missing or invalid
- `Error` if phase is out of range

**Example:**

```javascript
const renderer = createPatternRenderer({
  mode: RenderMode.LOOP,
  pattern: PatternName.PULSAR,
  globalCellSize: 30,
  loopUpdateRate: 12
})

console.log(renderer.metadata)
// { mode: 'loop', pattern: 'PULSAR', phase: null, period: 3 }
```

---

### Helper Functions

#### `getPatternDimensions(patternName, globalCellSize = 30)`

Get pattern dimensions without creating a renderer.

```javascript
const dims = getPatternDimensions(PatternName.PULSAR, 30)
// { width: 468, height: 468, gridSize: 16 }
```

#### `supportsLoopMode(patternName)`

Check if pattern is an oscillator (supports LOOP mode).

```javascript
supportsLoopMode(PatternName.BLINKER)  // true
supportsLoopMode(PatternName.BLOCK)    // false (still life)
```

#### `getPatternPeriod(patternName)`

Get pattern oscillation period.

```javascript
getPatternPeriod(PatternName.BLINKER)  // 2
getPatternPeriod(PatternName.PULSAR)   // 3
getPatternPeriod(PatternName.BLOCK)    // 1 (still life)
```

#### `getPatternsByCategory(category)`

Get all patterns in a category.

```javascript
const oscillators = getPatternsByCategory('oscillators')
// ['BLINKER', 'TOAD', 'BEACON', 'PULSAR']

const stillLifes = getPatternsByCategory('still-lifes')
// ['BLOCK', 'BEEHIVE', 'LOAF', 'BOAT', 'TUB', 'POND', 'SHIP']
```

#### `getRandomPattern(category)`

Get random pattern from a category.

```javascript
const pattern = getRandomPattern('oscillators')
// Random: 'BLINKER' | 'TOAD' | 'BEACON' | 'PULSAR'
```

#### `getAllPatterns()`

Get all available patterns.

```javascript
const all = getAllPatterns()
// All 13 patterns: still-lifes + oscillators + spaceships
```

#### `getPatternCategory(patternName)`

Get category for a pattern.

```javascript
getPatternCategory(PatternName.BLINKER)  // 'oscillators'
getPatternCategory(PatternName.BLOCK)    // 'still-lifes'
```

---

## Pattern Catalog

### Still Lifes (Period 1)

Patterns that never change.

| Pattern | Grid Size | Period | Visual |
|---------|-----------|--------|--------|
| `BLOCK` | 2×2 | 1 | 2×2 square |
| `BEEHIVE` | 4×3 | 1 | Hexagonal shape |
| `LOAF` | 4×4 | 1 | Asymmetric blob |
| `BOAT` | 3×3 | 1 | Small boat shape |
| `TUB` | 3×3 | 1 | Hollow square |
| `POND` | 4×4 | 1 | 2×2 hollow square |
| `SHIP` | 3×3 | 1 | L-shaped |

**Use Cases:**
- Static decorations
- Background elements
- Non-animated entities

**Example:**
```javascript
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLOCK,
  phase: 0,  // Always 0 for still lifes
  globalCellSize: 30
})
```

---

### Oscillators (Period 2-3)

Patterns that cycle through states.

| Pattern | Grid Size | Period | Phases | Visual |
|---------|-----------|--------|--------|--------|
| `BLINKER` | 3×3 | 2 | Vertical ↔ Horizontal | Line that rotates |
| `TOAD` | 4×4 | 2 | Open ↔ Closed | Expanding/contracting |
| `BEACON` | 4×4 | 2 | Corners on/off | Blinking corners |
| `PULSAR` | 13×13 | 3 | 3 distinct phases | Large pulsing cross |

**Use Cases:**
- Animated entities (LOOP mode)
- Visual variety (STATIC mode with different phases)
- Dynamic backgrounds

**Example (Loop):**
```javascript
createPatternRenderer({
  mode: RenderMode.LOOP,
  pattern: PatternName.PULSAR,
  globalCellSize: 30,
  loopUpdateRate: 10  // 10 updates/sec
})
```

**Example (Static Phases):**
```javascript
// BLINKER phase 0 (vertical: |||)
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 0,
  globalCellSize: 30
})

// BLINKER phase 1 (horizontal: ===)
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 1,
  globalCellSize: 30
})
```

---

### Spaceships (Period 4)

Moving patterns (rendered as static snapshots).

| Pattern | Grid Size | Period | Movement | Visual |
|---------|-----------|--------|----------|--------|
| `GLIDER` | 4×4 | 4 | Diagonal | Small moving pattern |
| `LIGHTWEIGHT_SPACESHIP` | 5×4 | 4 | Horizontal | Larger ship |

**Use Cases:**
- Static "frozen" spaceships
- Visual variety (different phases look different)

**Note:** PatternRenderer renders these as STATIC only. For actual movement, use GoLEngine directly without freezing.

**Example:**
```javascript
// GLIDER at phase 2
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.GLIDER,
  phase: 2,  // 0-3 for 4-phase pattern
  globalCellSize: 30
})
```

---

## Usage Examples

### Example 1: Space Invaders Player (Loop)

```javascript
import { createPatternRenderer, RenderMode, PatternName } from '../src/utils/PatternRenderer.js'

function setupPlayer() {
  const renderer = createPatternRenderer({
    mode: RenderMode.LOOP,
    pattern: PatternName.BLINKER,
    globalCellSize: CONFIG.globalCellSize,
    loopUpdateRate: CONFIG.loopUpdateRate
  })

  player = {
    x: CONFIG.width / 2 - renderer.dimensions.width / 2,
    y: CONFIG.height - 200,
    width: renderer.dimensions.width,
    height: renderer.dimensions.height,
    gol: renderer.gol,
    gradient: GRADIENT_PRESETS.PLAYER
  }
}

function updatePlayer() {
  // Movement, input, etc.
  // ...

  // Update loop pattern
  player.gol.updateThrottled(state.frameCount)

  if (player.gol.isLoopPattern) {
    handleLoopReset(player.gol, state.frameCount)
  }
}
```

---

### Example 2: Random Invader Phases (Static)

```javascript
function setupInvaders() {
  const { cols, rows, spacing, startX, startY } = CONFIG.invader

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      // Each invader gets random BLINKER phase (0 or 1)
      const renderer = createPatternRenderer({
        mode: RenderMode.STATIC,
        pattern: PatternName.BLINKER,
        // phase omitted = random
        globalCellSize: CONFIG.globalCellSize
      })

      const invader = {
        x: startX + col * (renderer.dimensions.width + spacing),
        y: startY + row * (renderer.dimensions.height + spacing),
        width: renderer.dimensions.width,
        height: renderer.dimensions.height,
        gol: renderer.gol,  // Frozen at random phase
        gradient: GRADIENT_PRESETS.ENEMY_HOT
      }

      invaders.push(invader)
    }
  }
}
```

---

### Example 3: Random Pattern Selection

```javascript
function spawnPowerup(x, y) {
  // Random oscillator
  const renderer = createPatternRenderer({
    mode: RenderMode.LOOP,
    pattern: [
      PatternName.BLINKER,
      PatternName.TOAD,
      PatternName.BEACON,
      PatternName.PULSAR
    ],
    globalCellSize: 30,
    loopUpdateRate: 12
  })

  const powerup = {
    x: x - renderer.dimensions.width / 2,
    y: y - renderer.dimensions.height / 2,
    width: renderer.dimensions.width,
    height: renderer.dimensions.height,
    gol: renderer.gol,
    gradient: GRADIENT_PRESETS.POWERUP
  }

  console.log(`Spawned: ${renderer.metadata.pattern}`)
  return powerup
}
```

---

### Example 4: Category-Based Selection

```javascript
function createEnemy(type) {
  let patternCategory

  if (type === 'weak') {
    patternCategory = 'still-lifes'  // Non-moving
  } else if (type === 'medium') {
    patternCategory = 'oscillators'  // Animated
  } else {
    patternCategory = 'spaceships'   // Aggressive look
  }

  const pattern = getRandomPattern(patternCategory)

  const renderer = createPatternRenderer({
    mode: type === 'medium' ? RenderMode.LOOP : RenderMode.STATIC,
    pattern: pattern,
    globalCellSize: 30,
    loopUpdateRate: 10
  })

  return {
    width: renderer.dimensions.width,
    height: renderer.dimensions.height,
    gol: renderer.gol
  }
}
```

---

## Integration Guide

### Step 1: Import PatternRenderer

```javascript
import {
  createPatternRenderer,
  RenderMode,
  PatternName
} from '../src/utils/PatternRenderer.js'
```

### Step 2: Replace Pattern Creation

**Before (Manual GoL setup):**
```javascript
const gol = new GoLEngine(6, 6, 10)
seedRadialDensity(gol, 0.75, 0.0)
gol.setPattern(Patterns.BLINKER, 1, 1)
```

**After (PatternRenderer):**
```javascript
const renderer = createPatternRenderer({
  mode: RenderMode.LOOP,
  pattern: PatternName.BLINKER,
  globalCellSize: 30,
  loopUpdateRate: 10
})
const gol = renderer.gol
```

### Step 3: Use Dimensions

```javascript
const entity = {
  x: 100,
  y: 100,
  width: renderer.dimensions.width,   // Use calculated dimensions
  height: renderer.dimensions.height,
  gol: renderer.gol
}
```

### Step 4: Handle Loop Patterns

```javascript
// In update function
if (entity.gol.isLoopPattern) {
  entity.gol.updateThrottled(frameCount)
  handleLoopReset(entity.gol, frameCount)
}
```

---

## Advanced Features

### 20% Padding for Border-Sensitive Patterns

PatternRenderer automatically adds 20% padding to prevent border artifacts.

**How it works:**

```javascript
// Pattern: PULSAR (13×13)
const patternWidth = 13
const patternHeight = 13

// Add 20% padding
const paddedWidth = Math.ceil(13 * 1.2)   // 16
const paddedHeight = Math.ceil(13 * 1.2)  // 16

// Create temporal grid
const tempGol = new GoLEngine(16, 16, 0)

// Center pattern in padded grid
const centerX = Math.floor((16 - 13) / 2)  // 1
const centerY = Math.floor((16 - 13) / 2)  // 1
tempGol.setPattern(Patterns.PULSAR, centerX, centerY)
```

**Why this matters:**
- PULSAR needs space to oscillate (cells near edges)
- Without padding: pattern gets corrupted at borders
- With padding: authentic B3/S23 evolution

---

### Phase Validation

PatternRenderer validates phase ranges automatically.

```javascript
// Valid: BLINKER period 2, phase 0-1
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 1  // OK
})

// Invalid: phase out of range
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 5  // ERROR: phase must be 0-1 for period 2
})
```

---

### Loop Pattern Metadata

Loop patterns have special metadata attached to the GoL engine:

```javascript
const renderer = createPatternRenderer({
  mode: RenderMode.LOOP,
  pattern: PatternName.PULSAR,
  globalCellSize: 30,
  loopUpdateRate: 10
})

console.log(renderer.gol.isLoopPattern)     // true
console.log(renderer.gol.loopPatternPeriod) // 3
console.log(renderer.gol.loopStartGen)      // 0
console.log(renderer.gol.loopResetSnapshot) // 2D array (initial state)
```

---

## Testing

### Unit Tests

PatternRenderer has 73 comprehensive unit tests:

```bash
cd LifeArcade
npm test -- test_PatternRenderer
```

**Test Coverage:**
- Configuration validation (9 tests)
- Static mode single pattern (10 tests)
- Static mode array patterns (3 tests)
- Loop mode single pattern (7 tests)
- Loop mode array patterns (1 test)
- Helper functions (29 tests)
- Edge cases (7 tests)
- GoL Engine integration (4 tests)
- Enums and constants (4 tests)

**Result:** 73/73 passing (100%)

### Integration Tests

Test in-game by checking console logs:

```javascript
// Console output:
[PatternRenderer] Loop: BLINKER period 2, 120×120px, 30fps
[PatternRenderer] Static: PULSAR phase 1/2, 468×468px
```

---

## Migration from Phase 2

### Breaking Changes

**Phase 2 (Old - DEPRECATED):**
```json
{
  "version": 2,
  "config": {
    "player": {
      "cellSize": 40
    },
    "invader": {
      "cellSize": 30
    }
  }
}
```

**Phase 3 (New - CURRENT):**
```json
{
  "version": 3,
  "config": {
    "globalCellSize": 30,
    "player": {},
    "invader": {}
  }
}
```

### Validation

Phase 2 presets are automatically rejected:

```javascript
import { validatePresetFormat } from './DebugPresets.js'

const phase2Preset = {
  version: 2,
  config: {
    player: { cellSize: 40 }
  }
}

const result = validatePresetFormat(phase2Preset)
// {
//   valid: false,
//   reason: "Preset must be version 3 (Phase 3 format). Phase 2 presets are not supported."
// }
```

### Migration Path

**Option 1:** Recreate preset in debug interface (recommended)

**Option 2:** Manual JSON edit:
```javascript
// 1. Change version to 3
preset.version = 3

// 2. Extract globalCellSize (use smallest)
const globalCellSize = Math.min(
  preset.config.player.cellSize,
  preset.config.invader.cellSize
)
preset.config.globalCellSize = globalCellSize

// 3. Remove per-entity cellSize
delete preset.config.player.cellSize
delete preset.config.invader.cellSize
delete preset.config.bullet.cellSize
delete preset.config.explosion.cellSize

// 4. Validate
const result = validatePresetFormat(preset)
if (!result.valid) {
  console.error(result.reason)
}
```

---

## Best Practices

### 1. Use Appropriate Modes

**STATIC for:**
- Invaders (random variety, no animation needed)
- Obstacles (non-moving)
- Background decorations

**LOOP for:**
- Player (visual feedback, alive feeling)
- Powerups (attract attention)
- Dynamic enemies

### 2. Choose Patterns by Gameplay

**Still Lifes:**
- Predictable, stable
- Good for tutorial levels
- Minimal visual noise

**Oscillators:**
- Dynamic, engaging
- Good for advanced levels
- Moderate visual activity

**Spaceships:**
- Aggressive appearance
- Good for boss enemies
- High visual complexity

### 3. Performance Considerations

**Loop patterns:**
- Use conservative loopUpdateRate (10-12 fps)
- Avoid PULSAR for small entities (13×13 grid is large)
- Limit number of simultaneous loop patterns

**Static patterns:**
- Zero performance cost after creation (frozen)
- Safe to use hundreds simultaneously
- Ideal for large numbers of entities

### 4. Visual Consistency

**Use globalCellSize consistently:**
```javascript
// Good: All entities share CONFIG.globalCellSize
const playerRenderer = createPatternRenderer({
  globalCellSize: CONFIG.globalCellSize  // 30
})

const invaderRenderer = createPatternRenderer({
  globalCellSize: CONFIG.globalCellSize  // 30
})

// Bad: Different cell sizes per entity
const playerRenderer = createPatternRenderer({
  globalCellSize: 40  // Inconsistent!
})
```

---

## Troubleshooting

### Pattern looks wrong

**Problem:** Pattern appears corrupted or incomplete

**Solution:** Check if pattern needs more space (20% padding should handle this automatically)

```javascript
// Verify dimensions
const dims = getPatternDimensions(PatternName.PULSAR, 30)
console.log(dims)  // { width: 468, height: 468, gridSize: 16 }

// Check if pattern is properly centered
const renderer = createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.PULSAR,
  phase: 0,
  globalCellSize: 30
})

console.log(renderer.gol.cols)  // Should be 16 (13 + 20% padding)
```

---

### Loop pattern not resetting

**Problem:** Loop pattern keeps evolving beyond its period

**Solution:** Make sure you're calling `handleLoopReset()`

```javascript
// In your update function:
function updatePlayer() {
  player.gol.updateThrottled(state.frameCount)

  // CRITICAL: Must call handleLoopReset for loop patterns
  if (player.gol.isLoopPattern) {
    handleLoopReset(player.gol, state.frameCount)
  }
}
```

---

### Phase out of range error

**Problem:** "Phase must be between 0 and N" error

**Solution:** Check pattern period and use valid phase

```javascript
// Find valid phase range
const period = getPatternPeriod(PatternName.BLINKER)  // 2
console.log(`Valid phases: 0 to ${period - 1}`)       // 0 to 1

// Use valid phase
createPatternRenderer({
  mode: RenderMode.STATIC,
  pattern: PatternName.BLINKER,
  phase: 1  // OK (0-1 valid)
})
```

---

### Random pattern not random

**Problem:** Same pattern appears every time

**Solution:** Make sure you're creating new renderer for each entity

```javascript
// WRONG: Reusing renderer (all entities get same pattern)
const renderer = createPatternRenderer({
  pattern: [PatternName.BLINKER, PatternName.TOAD]
})

for (let i = 0; i < 10; i++) {
  invaders.push({
    gol: renderer.gol  // All share same gol!
  })
}

// CORRECT: Create new renderer per entity
for (let i = 0; i < 10; i++) {
  const renderer = createPatternRenderer({
    pattern: [PatternName.BLINKER, PatternName.TOAD]
  })

  invaders.push({
    gol: renderer.gol  // Each gets unique gol
  })
}
```

---

## Architecture

### File Structure

```
src/utils/PatternRenderer.js  (560 lines)
  ├── RenderMode (enum)
  ├── PatternName (enum)
  ├── createPatternRenderer()
  ├── createStaticRenderer()
  ├── createLoopRenderer()
  ├── Helper functions (8)
  └── Internal utilities

tests/utils/test_PatternRenderer.js  (700+ lines, 73 tests)
  ├── Configuration validation
  ├── Static mode tests
  ├── Loop mode tests
  ├── Helper function tests
  └── Edge case tests

src/debug/DebugAppearance.js  (refactored, -125 lines)
  └── Uses PatternRenderer internally
```

### Dependencies

**PatternRenderer requires:**
- `GoLEngine` (src/core/GoLEngine.js)
- `Patterns` (src/utils/Patterns.js)

**Used by:**
- `DebugAppearance.js` (debug interface)
- `space-invaders.js` (game)
- Future games (dino-runner, breakout, flappy-bird)

---

## Changelog

### Phase 3.2 (2025-11-18) - CURRENT

**Added:**
- PatternRenderer.js (560 lines)
- Comprehensive unit tests (73 tests, 100% passing)
- Support for random pattern selection from arrays
- Helper functions for pattern queries

**Changed:**
- Refactored DebugAppearance.js (-125 lines)
- Updated Space Invaders to use BLINKER patterns
- Added progressive invader speed

**Deprecated:**
- Modified GoL mode (still supported for backward compatibility)
- Phase 2 preset format (validation rejects)

---

## Future Enhancements

### Potential Additions

1. **More Patterns:**
   - PENTADECATHLON (period 15)
   - CLOCK (period 2)
   - GALAXY (period 8)

2. **Pattern Transformations:**
   - Rotate 90/180/270 degrees
   - Mirror horizontal/vertical
   - Scale (2x, 3x)

3. **Composite Patterns:**
   - Multiple patterns in one entity
   - Pattern + accent combinations
   - Dynamic pattern switching

4. **Performance Optimizations:**
   - Pattern caching
   - Shared GoL instances for identical patterns
   - Lazy loading

---

## Credits

**Author:** Claude (Anthropic)
**Project:** LifeArcade - Google Employment Art Installation
**License:** MIT
**Conway's Game of Life:** John Conway (1970)

**References:**
- [LifeWiki](https://conwaylife.com/wiki/) - Pattern catalog
- [CLAUDE.md](../CLAUDE.md) - Project architecture rules
- [DebugPresets.js](../src/debug/DebugPresets.js) - Phase 3 format specification

---

## Support

**Issues:** Report bugs or request features at the project repository

**Questions:** Check existing tests for usage examples

**Documentation:** This guide, CLAUDE.md, and inline JSDoc comments

---

**End of Guide**
