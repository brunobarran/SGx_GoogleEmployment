# Preset JSON Specification

**Version:** 3.0
**Status:** Active
**Last Updated:** 2025-11-18

---

## Overview

This document defines the JSON format specification for LifeArcade game presets. Presets allow users to save, load, and share complete game configurations including difficulty settings, entity behaviors, and visual appearances.

**Purpose:**
- Standardize preset format across all games
- Enable import/export functionality
- Ensure Phase 3 format compatibility
- Provide validation rules for preset management

---

## Table of Contents

1. [Schema Definition](#schema-definition)
2. [Required Fields](#required-fields)
3. [Optional Fields](#optional-fields)
4. [Phase 3 Format Rules](#phase-3-format-rules)
5. [Validation Rules](#validation-rules)
6. [Built-in Preset Guidelines](#built-in-preset-guidelines)
7. [Examples](#examples)
8. [Version Compatibility](#version-compatibility)
9. [Error Handling](#error-handling)

---

## Schema Definition

### Complete Preset Structure

```typescript
interface Preset {
  // Required metadata
  name: string;              // Preset identifier (alphanumeric + hyphens)
  version: 3;                // MUST be 3 for Phase 3 format
  game: string;              // Game identifier (e.g., "space-invaders")

  // Core configuration
  config: {
    globalCellSize: number;  // Phase 3: Global cell size (20-50 recommended)
    [entityName: string]: {  // Entity-specific settings
      [property: string]: number | boolean | string;
    }
  };

  // Optional metadata
  timestamp?: string;        // ISO 8601 format
  author?: string;           // Creator name
  description?: string;      // Human-readable description

  // Optional appearance configuration
  appearances?: {
    [entityName: string]: {
      mode: "pure-gol" | "modified-gol" | "oscillator" | "static";
      pattern?: string | null;     // Pattern name for oscillator mode
      period?: number | null;      // Period for oscillator mode
    }
  };
}
```

---

## Required Fields

### 1. `name` (string)

**Description:** Unique identifier for the preset.

**Rules:**
- Must be alphanumeric with hyphens allowed
- No spaces or special characters
- 3-50 characters in length
- Case-insensitive (stored lowercase)

**Examples:**
```json
"name": "default"          // ✅ Valid
"name": "hard-mode"        // ✅ Valid
"name": "chaos-v2"         // ✅ Valid
"name": "Easy Mode!"       // ❌ Invalid (space and special char)
"name": "ab"               // ❌ Invalid (too short)
```

### 2. `version` (number)

**Description:** Preset format version number.

**Rules:**
- MUST be `3` for Phase 3 format
- Presets with `version: 2` or missing version are rejected
- Used for format validation and migration detection

**Examples:**
```json
"version": 3               // ✅ Valid (Phase 3)
"version": 2               // ❌ Invalid (Phase 2 - rejected)
"version": "3"             // ❌ Invalid (must be number, not string)
```

### 3. `game` (string)

**Description:** Identifier for the game this preset targets.

**Rules:**
- Must match the current game's identifier
- Kebab-case format (lowercase with hyphens)
- Prevents cross-game preset loading

**Valid Game Identifiers:**
- `"space-invaders"`
- `"dino-runner"`
- `"asteroid-shooter"`
- `"flappy-bird"`

**Examples:**
```json
"game": "space-invaders"   // ✅ Valid
"game": "Space Invaders"   // ❌ Invalid (not kebab-case)
"game": "unknown-game"     // ❌ Invalid (game doesn't exist)
```

### 4. `config` (object)

**Description:** Core game configuration object.

**Rules:**
- MUST contain `globalCellSize` property (Phase 3 requirement)
- MUST NOT contain per-entity `cellSize` properties (Phase 2 format)
- Contains entity-specific configuration objects

**Structure:**
```json
{
  "config": {
    "globalCellSize": 30,    // ✅ Required at top level
    "player": {
      "speed": 18,
      "golUpdateRate": 12    // Entity-specific properties
    },
    "invader": {
      "rows": 4,
      "cols": 4,
      "moveInterval": 30,
      "speed": 45,
      "golUpdateRate": 15
    }
  }
}
```

#### 4.1 `config.globalCellSize` (number)

**Description:** Global cell size used by all entities (Phase 3 format).

**Rules:**
- MUST be present at top level of `config`
- Range: 10-100 (recommended: 20-50)
- Integer values only
- Affects all entities uniformly

**Examples:**
```json
"globalCellSize": 30       // ✅ Valid (balanced)
"globalCellSize": 25       // ✅ Valid (smaller cells)
"globalCellSize": 35       // ✅ Valid (larger cells)
"globalCellSize": 5        // ❌ Invalid (too small)
"globalCellSize": 30.5     // ⚠️  Valid but not recommended (use integers)
```

---

## Optional Fields

### 1. `timestamp` (string)

**Description:** ISO 8601 timestamp of preset creation/modification.

**Format:** `YYYY-MM-DDTHH:MM:SS.sssZ`

**Examples:**
```json
"timestamp": "2025-11-18T10:30:00.000Z"   // ✅ Valid
"timestamp": "2025-11-18"                 // ⚠️  Valid but incomplete
"timestamp": "11/18/2025"                 // ❌ Invalid format
```

### 2. `author` (string)

**Description:** Name or identifier of the preset creator.

**Rules:**
- 1-100 characters
- Any printable characters allowed

**Examples:**
```json
"author": "Game Developer"       // ✅ Valid
"author": "player123"            // ✅ Valid
"author": ""                     // ❌ Invalid (empty string)
```

### 3. `description` (string)

**Description:** Human-readable description of the preset's purpose or characteristics.

**Rules:**
- 0-500 characters
- Supports basic markdown formatting (for future UI display)

**Examples:**
```json
"description": "Balanced gameplay for beginners with slower enemies"
"description": "Maximum difficulty with fast-moving invaders and reduced player speed"
"description": ""                // ✅ Valid (empty is allowed)
```

### 4. `appearances` (object) - OPTIONAL AND NOT CURRENTLY USED

**Description:** Entity appearance configuration using GoL patterns.

**IMPORTANT:** This section is optional and is currently NOT included in the built-in presets. Appearance management is handled separately from configuration presets. Including an `appearances` section in your preset JSON is allowed but not recommended for Phase 3.1.

**Structure:**
```typescript
{
  "appearances": {
    [entityName: string]: {
      mode: "pure-gol" | "modified-gol" | "oscillator" | "static";
      pattern?: string | null;
      period?: number | null;
    }
  }
}
```

**Mode Descriptions:**

| Mode | Description | Requires Pattern | Requires Period |
|------|-------------|------------------|-----------------|
| `pure-gol` | Authentic B3/S23 evolution | No | No |
| `modified-gol` | GoL with `applyLifeForce()` | No | No |
| `oscillator` | Repeating pattern sequence | Yes | Yes |
| `static` | No evolution (fixed pattern) | No | No |

**Examples:**
```json
{
  "appearances": {
    "player": {
      "mode": "modified-gol",
      "pattern": null,
      "period": null
    },
    "invaders": {
      "mode": "oscillator",
      "pattern": "blinker",
      "period": 2
    },
    "bullets": {
      "mode": "static",
      "pattern": null,
      "period": null
    },
    "explosions": {
      "mode": "pure-gol",
      "pattern": null,
      "period": null
    }
  }
}
```

**Available Patterns:**
- `"blinker"` (period: 2)
- `"toad"` (period: 2)
- `"beacon"` (period: 2)
- `"pulsar"` (period: 3)
- `"glider"` (period: 4)

---

## Phase 3 Format Rules

### ✅ Phase 3 Format Requirements

1. **Global Cell Size:**
   - `config.globalCellSize` MUST exist at top level
   - NO per-entity `cellSize` properties allowed

2. **Update Rates:**
   - Entities with GoL engines MUST have `golUpdateRate` property
   - Example: `"golUpdateRate": 12`

3. **Version Field:**
   - `version` MUST be `3`

### ❌ Phase 2 Format (Rejected)

**Phase 2 format is NO LONGER SUPPORTED and will be rejected during validation.**

**Rejected Patterns:**
```json
// ❌ Phase 2: Per-entity cellSize (REJECTED)
{
  "version": 2,
  "config": {
    "player": {
      "cellSize": 30,        // ❌ Phase 2 format
      "speed": 18
    }
  }
}

// ❌ Missing version field (REJECTED)
{
  "name": "old-preset",
  "config": {
    "invader": {
      "cellSize": 30         // ❌ Phase 2 format
    }
  }
}
```

### Migration from Phase 2 to Phase 3

**Conversion Steps:**

1. **Extract cell size values:**
   ```javascript
   // Phase 2
   const playerCellSize = config.player.cellSize;
   const invaderCellSize = config.invader.cellSize;
   ```

2. **Verify all entities use same cell size:**
   ```javascript
   if (playerCellSize !== invaderCellSize) {
     console.error("Phase 2 preset has inconsistent cell sizes - cannot auto-migrate");
   }
   ```

3. **Move to globalCellSize:**
   ```javascript
   // Phase 3
   config.globalCellSize = playerCellSize;
   delete config.player.cellSize;
   delete config.invader.cellSize;
   ```

4. **Add golUpdateRate to entities:**
   ```javascript
   config.player.golUpdateRate = 12;    // Default: 12
   config.invader.golUpdateRate = 15;   // Default: 15
   ```

5. **Update version:**
   ```javascript
   preset.version = 3;
   ```

**Example Migration:**

```javascript
// ❌ BEFORE (Phase 2)
{
  "name": "hard",
  "version": 2,
  "config": {
    "player": {
      "cellSize": 25,
      "speed": 12
    },
    "invader": {
      "cellSize": 25,
      "rows": 5,
      "moveInterval": 15
    }
  }
}

// ✅ AFTER (Phase 3)
{
  "name": "hard",
  "version": 3,
  "config": {
    "globalCellSize": 25,
    "player": {
      "speed": 12,
      "golUpdateRate": 12
    },
    "invader": {
      "rows": 5,
      "moveInterval": 15,
      "golUpdateRate": 15
    }
  }
}
```

---

## Validation Rules

### Validation Function Specification

```javascript
/**
 * Validates a preset against Phase 3 format requirements.
 *
 * @param {Object} preset - The preset object to validate
 * @returns {{ valid: boolean, reason: string }} Validation result
 */
function validatePresetFormat(preset) {
  // 1. Check required fields
  if (!preset.name || typeof preset.name !== 'string') {
    return { valid: false, reason: "Missing or invalid 'name' field" };
  }

  if (preset.version !== 3) {
    return { valid: false, reason: "Preset must be version 3 (Phase 3 format)" };
  }

  if (!preset.game || typeof preset.game !== 'string') {
    return { valid: false, reason: "Missing or invalid 'game' field" };
  }

  if (!preset.config || typeof preset.config !== 'object') {
    return { valid: false, reason: "Missing or invalid 'config' object" };
  }

  // 2. Check Phase 3 format: globalCellSize required
  if (typeof preset.config.globalCellSize !== 'number') {
    return { valid: false, reason: "Missing 'config.globalCellSize' (Phase 3 required)" };
  }

  if (preset.config.globalCellSize < 10 || preset.config.globalCellSize > 100) {
    return { valid: false, reason: "globalCellSize must be between 10-100" };
  }

  // 3. Check Phase 2 format rejection: no per-entity cellSize
  for (const [key, value] of Object.entries(preset.config)) {
    if (key === 'globalCellSize') continue;

    if (typeof value === 'object' && value !== null) {
      if ('cellSize' in value) {
        return {
          valid: false,
          reason: `Phase 2 format detected: '${key}.cellSize' not allowed. Use 'config.globalCellSize' instead.`
        };
      }
    }
  }

  // 4. Validate name format
  if (!/^[a-zA-Z0-9-]{3,50}$/.test(preset.name)) {
    return {
      valid: false,
      reason: "Preset name must be 3-50 alphanumeric characters (hyphens allowed)"
    };
  }

  // 5. Validate appearances format (if present)
  if (preset.appearances) {
    for (const [entity, appearance] of Object.entries(preset.appearances)) {
      const validModes = ['pure-gol', 'modified-gol', 'oscillator', 'static'];

      if (!validModes.includes(appearance.mode)) {
        return {
          valid: false,
          reason: `Invalid appearance mode for '${entity}': ${appearance.mode}`
        };
      }

      // Oscillator mode requires pattern and period
      if (appearance.mode === 'oscillator') {
        if (!appearance.pattern || typeof appearance.period !== 'number') {
          return {
            valid: false,
            reason: `Oscillator mode for '${entity}' requires 'pattern' and 'period'`
          };
        }
      }
    }
  }

  return { valid: true, reason: "" };
}
```

### Validation Error Messages

| Error Condition | Error Message |
|-----------------|---------------|
| Missing `name` | `"Missing or invalid 'name' field"` |
| Invalid `version` | `"Preset must be version 3 (Phase 3 format)"` |
| Missing `globalCellSize` | `"Missing 'config.globalCellSize' (Phase 3 required)"` |
| Phase 2 format detected | `"Phase 2 format detected: 'player.cellSize' not allowed. Use 'config.globalCellSize' instead."` |
| Invalid name format | `"Preset name must be 3-50 alphanumeric characters (hyphens allowed)"` |
| Invalid appearance mode | `"Invalid appearance mode for 'invaders': invalid-mode"` |
| Oscillator missing data | `"Oscillator mode for 'bullets' requires 'pattern' and 'period'"` |

---

## Built-in Preset Guidelines

### Preset Tiers

All games should provide 4 built-in presets following this difficulty progression:

| Preset | Difficulty | Target Audience | Characteristics |
|--------|-----------|-----------------|-----------------|
| **Default** | Medium | General players | Balanced, original game settings |
| **Easy** | Low | Beginners | Larger cells, slower enemies, more player advantages |
| **Hard** | High | Experienced players | Smaller cells, faster enemies, reduced player advantages |
| **Chaos** | Extreme | Challenge seekers | Tiny cells, maximum speed, overwhelming enemy count |

### Parameter Scaling Guidelines

**Cell Size:**
- Easy: +15-20% larger (`globalCellSize: 35`)
- Default: Baseline (`globalCellSize: 30`)
- Hard: -15-20% smaller (`globalCellSize: 25`)
- Chaos: -30-40% smaller (`globalCellSize: 20`)

**Enemy Speed:**
- Easy: -30-40% slower
- Default: Baseline (100%)
- Hard: +30-40% faster
- Chaos: +60-80% faster

**Enemy Count:**
- Easy: -50% fewer (`rows: 2, cols: 6` vs `rows: 4, cols: 4`)
- Default: Baseline
- Hard: +50-100% more (`rows: 5, cols: 10`)
- Chaos: +150-200% more (`rows: 6, cols: 12`)

**Player Advantages:**
- Easy: +40% faster movement, -30% shoot cooldown
- Default: Baseline
- Hard: -30% slower movement, +60% shoot cooldown
- Chaos: -40% slower movement, +100% shoot cooldown

### Space Invaders Example Presets

**Default Preset:**
```json
{
  "name": "default",
  "version": 3,
  "game": "space-invaders",
  "description": "Balanced gameplay with original settings",
  "config": {
    "globalCellSize": 30,
    "invader": {
      "rows": 4,
      "cols": 4,
      "moveInterval": 30,
      "speed": 45,
      "golUpdateRate": 15
    },
    "player": {
      "speed": 18,
      "shootCooldown": 15,
      "golUpdateRate": 12
    },
    "bullet": {
      "speed": -8,
      "golUpdateRate": 0
    }
  },
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "modified-gol", "pattern": null, "period": null },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

**Easy Preset:**
```json
{
  "name": "easy",
  "version": 3,
  "game": "space-invaders",
  "description": "Beginner-friendly with slower enemies and larger cells",
  "config": {
    "globalCellSize": 35,
    "invader": {
      "rows": 2,
      "cols": 6,
      "moveInterval": 45,
      "speed": 30,
      "golUpdateRate": 10
    },
    "player": {
      "speed": 25,
      "shootCooldown": 10,
      "golUpdateRate": 15
    },
    "bullet": {
      "speed": -12,
      "golUpdateRate": 0
    }
  },
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "modified-gol", "pattern": null, "period": null },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

**Hard Preset:**
```json
{
  "name": "hard",
  "version": 3,
  "game": "space-invaders",
  "description": "Expert challenge with fast enemies and smaller cells",
  "config": {
    "globalCellSize": 25,
    "invader": {
      "rows": 5,
      "cols": 10,
      "moveInterval": 15,
      "speed": 60,
      "golUpdateRate": 20
    },
    "player": {
      "speed": 12,
      "shootCooldown": 25,
      "golUpdateRate": 10
    },
    "bullet": {
      "speed": -6,
      "golUpdateRate": 0
    }
  },
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "oscillator", "pattern": "blinker", "period": 2 },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

**Chaos Preset:**
```json
{
  "name": "chaos",
  "version": 3,
  "game": "space-invaders",
  "description": "Maximum difficulty with overwhelming enemy count",
  "config": {
    "globalCellSize": 20,
    "invader": {
      "rows": 6,
      "cols": 12,
      "moveInterval": 10,
      "speed": 75,
      "golUpdateRate": 25
    },
    "player": {
      "speed": 10,
      "shootCooldown": 30,
      "golUpdateRate": 8
    },
    "bullet": {
      "speed": -5,
      "golUpdateRate": 0
    }
  },
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "oscillator", "pattern": "pulsar", "period": 3 },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

---

## Examples

### Minimal Valid Preset

```json
{
  "name": "minimal",
  "version": 3,
  "game": "space-invaders",
  "config": {
    "globalCellSize": 30,
    "invader": {
      "rows": 4,
      "cols": 4
    }
  }
}
```

### Complete Preset with All Fields

```json
{
  "name": "complete-example",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:30:00.000Z",
  "author": "Game Developer",
  "description": "Example preset with all optional fields populated",
  "config": {
    "globalCellSize": 30,
    "invader": {
      "rows": 4,
      "cols": 4,
      "moveInterval": 30,
      "speed": 45,
      "golUpdateRate": 15
    },
    "player": {
      "speed": 18,
      "shootCooldown": 15,
      "golUpdateRate": 12
    },
    "bullet": {
      "speed": -8,
      "golUpdateRate": 0
    },
    "explosion": {
      "duration": 30,
      "golUpdateRate": 8
    }
  },
  "appearances": {
    "player": {
      "mode": "modified-gol",
      "pattern": null,
      "period": null
    },
    "invaders": {
      "mode": "oscillator",
      "pattern": "blinker",
      "period": 2
    },
    "bullets": {
      "mode": "static",
      "pattern": null,
      "period": null
    },
    "explosions": {
      "mode": "pure-gol",
      "pattern": null,
      "period": null
    }
  }
}
```

### Custom Preset (User Export)

```json
{
  "name": "my-custom-preset",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T14:22:35.123Z",
  "author": "Player123",
  "description": "My personal favorite difficulty settings",
  "config": {
    "globalCellSize": 28,
    "invader": {
      "rows": 3,
      "cols": 8,
      "moveInterval": 25,
      "speed": 50,
      "golUpdateRate": 18
    },
    "player": {
      "speed": 20,
      "shootCooldown": 12,
      "golUpdateRate": 14
    },
    "bullet": {
      "speed": -10,
      "golUpdateRate": 0
    }
  },
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "modified-gol", "pattern": null, "period": null },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

---

## Version Compatibility

### Version History

| Version | Phase | Date | Status | Breaking Changes |
|---------|-------|------|--------|------------------|
| 3 | Phase 3 | 2025-11-18 | ✅ Current | Global cell size unification |
| 2 | Phase 2 | 2025-11-10 | ❌ Deprecated | Per-entity cell size |
| 1 | Phase 1 | 2025-11-01 | ❌ Obsolete | Initial debug interface |

### Forward Compatibility

**Phase 3 presets are the current standard.** Future phases will maintain backward compatibility with Phase 3 presets through automatic migration.

**Guaranteed compatibility:**
- Phase 3 presets will load correctly in all future phases
- New optional fields may be added without breaking existing presets
- Required fields will not be removed

### Backward Compatibility

**Phase 2 presets are NOT supported.**

**Rejection behavior:**
- `validatePresetFormat()` returns `{ valid: false, reason: "..." }`
- UI displays error message: *"This preset uses Phase 2 format and cannot be loaded. Please recreate using the current debug interface."*
- No automatic migration from Phase 2 to Phase 3

**Rationale:**
- Phase 2 allowed inconsistent cell sizes across entities
- Phase 3 requires global cell size for visual consistency
- Manual recreation ensures user understands new format

---

## Error Handling

### Import Error Scenarios

**1. Invalid JSON Syntax:**
```javascript
try {
  const preset = JSON.parse(fileContent);
} catch (e) {
  alert("Invalid JSON file. Please check file format.");
}
```

**2. Phase 2 Format Detected:**
```javascript
const result = validatePresetFormat(preset);
if (!result.valid && result.reason.includes("Phase 2")) {
  alert("This preset uses Phase 2 format and cannot be loaded.\n\n" +
        "Please recreate using the current debug interface.");
}
```

**3. Wrong Game:**
```javascript
if (preset.game !== currentGame) {
  alert(`Preset is for '${preset.game}' but current game is '${currentGame}'.\n\n` +
        "Please load a preset for the correct game.");
}
```

**4. Missing Required Fields:**
```javascript
if (!preset.config.globalCellSize) {
  alert("Preset is missing 'config.globalCellSize' field.\n\n" +
        "This may be a Phase 2 preset or corrupted file.");
}
```

**5. Out-of-Range Values:**
```javascript
if (preset.config.globalCellSize < 10 || preset.config.globalCellSize > 100) {
  alert("Invalid cell size. Must be between 10-100.");
}
```

### Export Error Scenarios

**1. Browser Download Restrictions:**
```javascript
try {
  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
} catch (e) {
  alert("Failed to download preset. Please check browser permissions.");
}
```

**2. Invalid Preset State:**
```javascript
const result = validatePresetFormat(preset);
if (!result.valid) {
  console.error("Cannot export invalid preset:", result.reason);
  alert("Cannot export: " + result.reason);
}
```

---

## File Naming Conventions

### Built-in Presets

**Location:** `presets/{game-name}/{preset-name}.json`

**Examples:**
```
presets/space-invaders/default.json
presets/space-invaders/easy.json
presets/space-invaders/hard.json
presets/space-invaders/chaos.json
presets/dino-runner/default.json
presets/dino-runner/easy.json
```

### Custom Presets (Exported)

**Format:** `{game-name}-{preset-name}-{timestamp}.json`

**Examples:**
```
space-invaders-my-preset-20251118-143522.json
dino-runner-speed-run-20251118-091045.json
```

**Generation Code:**
```javascript
function generateExportFilename(game, presetName) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, '')
    .replace('T', '-')
    .substring(0, 15); // YYYYMMDD-HHMMSS

  return `${game}-${presetName}-${timestamp}.json`;
}

// Example output: "space-invaders-custom-20251118-143522.json"
```

---

## Testing

### Validation Test Cases

```javascript
// Test 1: Valid Phase 3 preset
const validPreset = {
  name: "test",
  version: 3,
  game: "space-invaders",
  config: {
    globalCellSize: 30,
    invader: { rows: 4 }
  }
};
expect(validatePresetFormat(validPreset).valid).toBe(true);

// Test 2: Reject Phase 2 preset
const phase2Preset = {
  name: "old",
  version: 2,
  config: {
    invader: { cellSize: 30, rows: 4 }
  }
};
expect(validatePresetFormat(phase2Preset).valid).toBe(false);

// Test 3: Reject per-entity cellSize
const invalidPreset = {
  name: "bad",
  version: 3,
  config: {
    globalCellSize: 30,
    invader: { cellSize: 30, rows: 4 } // ❌ Phase 2 property
  }
};
expect(validatePresetFormat(invalidPreset).valid).toBe(false);

// Test 4: Missing globalCellSize
const missingGlobal = {
  name: "incomplete",
  version: 3,
  config: {
    invader: { rows: 4 }
  }
};
expect(validatePresetFormat(missingGlobal).valid).toBe(false);
```

### Load/Save Test Cases

```javascript
// Test 5: Load preset updates CONFIG
loadPreset(validPreset, CONFIG);
expect(CONFIG.globalCellSize).toBe(30);
expect(CONFIG.invader.rows).toBe(4);

// Test 6: Export captures current state
CONFIG.globalCellSize = 35;
CONFIG.player.speed = 25;
const exported = saveCurrentPreset("custom");
expect(exported.config.globalCellSize).toBe(35);
expect(exported.config.player.speed).toBe(25);
expect(exported.version).toBe(3);
```

---

## Best Practices

### For Game Developers

1. **Always create 4 built-in presets:** default, easy, hard, chaos
2. **Test all presets thoroughly** before releasing game
3. **Use consistent scaling factors** across difficulty levels
4. **Document custom entity properties** in game-specific docs
5. **Validate presets in automated tests** to catch format errors

### For Players

1. **Export presets before experimenting** with settings
2. **Use descriptive names** for custom presets (e.g., "speed-run-attempt-3")
3. **Include descriptions** when sharing presets with others
4. **Test imported presets** in a non-critical game session first
5. **Keep backups** of favorite presets outside the game directory

### For UI Developers

1. **Always validate before loading** presets
2. **Show clear error messages** with actionable guidance
3. **Sync all UI elements** after preset loads (sliders, labels, etc.)
4. **Trigger entity recreation callbacks** to apply new settings
5. **Provide confirmation** before overwriting current settings

---

## References

- **Phase 3 Migration Guide:** `docs/PHASE_3_MIGRATION_GUIDE.md`
- **Debug Interface Feature:** `docs/DEBUG_INTERFACE_FEATURE.md`
- **Phase 3.1 Planning:** `archive/planning/phase-3.1-preset-management.md`
- **Core Principles:** `CLAUDE.md`

---

**Document Status:** ✅ Complete
**Version:** 1.0
**Last Updated:** 2025-11-18
