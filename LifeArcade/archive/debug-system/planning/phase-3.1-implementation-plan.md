# Phase 3.1: Preset Management - Implementation Plan

**Created:** 2025-11-18
**Status:** Ready for Implementation
**Estimated Time:** 2-3 hours
**Prerequisites:** Phase 3 Migration Complete ✅

---

## 📋 Overview

This document provides a complete implementation plan for Phase 3.1 (Preset Management) to be executed by an LLM coding assistant. The plan is designed to be self-contained and executable without additional context.

### What is Phase 3.1?

Phase 3.1 adds preset management capabilities to the Debug Interface, allowing users to:
- Load 4 built-in presets (Default, Easy, Hard, Chaos)
- Export current configuration as JSON
- Import custom preset files
- Switch between presets with real-time entity recreation

### Success Criteria

✅ 4 preset JSON files created for Space Invaders
✅ `DebugPresets.js` module implemented with validation
✅ Preset dropdown added to Debug Interface UI
✅ Import/Export buttons functional
✅ All presets load correctly and recreate entities
✅ Phase 2 presets are rejected with clear error messages
✅ Unit tests passing (16+ tests)

---

## 📚 Required Reading

Before starting implementation, review these documents in order:

1. **CLAUDE.md** - Core development principles and rules
   - Section 3: Project Architecture
   - Section 4: Code Style (p5.js Global Mode)
   - Section 8: Testing requirements

2. **docs/PROJECT_OVERVIEW.md** - Architecture overview
   - Section: Debug Interface Phase 2 status
   - Section: Phase 3 Global Cell Size

3. **docs/DEBUG_INTERFACE_FEATURE.md** - Debug interface structure
   - Phase 1: Core Debug System (lines 1-500)
   - Phase 2: Appearance System (lines 501-1000)

4. **docs/PRESET_JSON_SPEC.md** - Complete preset specification
   - Schema Definition (lines 1-100)
   - Phase 3 Format Rules (lines 150-250)
   - Validation Rules (lines 300-400)
   - Built-in Preset Guidelines (lines 450-550)

5. **docs/GAME_TEMPLATE_GUIDE.md** - Game configuration patterns
   - Space Invaders example (lines 100-200)

---

## 🎯 Implementation Steps

### Step 1: Create Preset JSON Files (30 minutes)

**Location:** `E:\SGx_GoogleEmployment\LifeArcade\presets\space-invaders\`

**Files to Create:** 4 JSON files

#### 1.1: default.json

```json
{
  "name": "default",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:00:00.000Z",
  "description": "Balanced gameplay with original settings",
  "config": {
    "globalCellSize": 30,
    "invader": {
      "rows": 4,
      "cols": 4,
      "spacing": 60,
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
      "golUpdateRate": 8
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

#### 1.2: easy.json

```json
{
  "name": "easy",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:00:00.000Z",
  "description": "Beginner-friendly with slower enemies and larger cells",
  "config": {
    "globalCellSize": 35,
    "invader": {
      "rows": 2,
      "cols": 6,
      "spacing": 80,
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
    },
    "explosion": {
      "golUpdateRate": 6
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

#### 1.3: hard.json

```json
{
  "name": "hard",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:00:00.000Z",
  "description": "Expert challenge with fast enemies and smaller cells",
  "config": {
    "globalCellSize": 25,
    "invader": {
      "rows": 5,
      "cols": 10,
      "spacing": 40,
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
    },
    "explosion": {
      "golUpdateRate": 10
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

#### 1.4: chaos.json

```json
{
  "name": "chaos",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:00:00.000Z",
  "description": "Maximum difficulty with overwhelming enemy count",
  "config": {
    "globalCellSize": 20,
    "invader": {
      "rows": 6,
      "cols": 12,
      "spacing": 30,
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
    },
    "explosion": {
      "golUpdateRate": 12
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

**Verification:**
```bash
# Verify JSON files are valid
cd LifeArcade
node -e "console.log(JSON.parse(require('fs').readFileSync('presets/space-invaders/default.json', 'utf8')))"
# Should output the JSON without errors
```

---

### Step 2: Create DebugPresets.js Module (45 minutes)

**Location:** `E:\SGx_GoogleEmployment\LifeArcade\src\debug\DebugPresets.js`

**Purpose:** Preset validation, loading, saving, and import/export logic

#### 2.1: File Structure

```javascript
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
    // Apply config values (deep merge)
    Object.assign(config, preset.config)

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
```

**Verification:**
```bash
# Test that module can be imported
cd LifeArcade
node -e "import('./src/debug/DebugPresets.js').then(m => console.log('✅ Module loaded:', Object.keys(m)))"
```

---

### Step 3: Update DebugInterface.js (45 minutes)

**Location:** `E:\SGx_GoogleEmployment\LifeArcade\src\debug\DebugInterface.js`

#### 3.1: Add Import Statement

At the top of the file, after existing imports:

```javascript
import {
  validatePresetFormat,
  loadPreset,
  saveCurrentPreset,
  getBuiltInPresets,
  exportPresetToJSON,
  importPresetFromJSON
} from './DebugPresets.js'
```

#### 3.2: Add Preset Dropdown (in `populateControls` function)

Find the `populateControls` function (around line 121) and add this BEFORE the gameplay group:

```javascript
// Add preset controls at the top
const presetGroup = await createPresetGroup(gameName, config, callbacks)
controlsContainer.appendChild(presetGroup)
```

#### 3.3: Create Preset Group Function

Add this new function after `createAppearanceGroup`:

```javascript
/**
 * Create preset control group.
 *
 * @param {string} gameName - Game identifier
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Optional callbacks
 * @returns {Promise<HTMLElement>} Preset group element
 */
async function createPresetGroup(gameName, config, callbacks) {
  const group = document.createElement('div')
  group.className = 'debug-group'

  const title = document.createElement('h3')
  title.className = 'debug-group-title'
  title.textContent = 'Presets'
  group.appendChild(title)

  // Load built-in presets
  const presets = await getBuiltInPresets(gameName)

  // Create dropdown
  const dropdownContainer = document.createElement('div')
  dropdownContainer.className = 'debug-control'
  dropdownContainer.innerHTML = `
    <label class="debug-label">
      <span class="debug-label-text">Load Preset</span>
    </label>
    <select id="preset-selector" class="debug-select">
      <option value="">-- Select Preset --</option>
      ${Object.keys(presets).map(name =>
        `<option value="${name}">${name.charAt(0).toUpperCase() + name.slice(1)}</option>`
      ).join('')}
    </select>
  `
  group.appendChild(dropdownContainer)

  // Add event listener
  const selector = dropdownContainer.querySelector('#preset-selector')
  selector.addEventListener('change', (e) => {
    handlePresetChange(e.target.value, presets, config, callbacks, gameName)
  })

  // Create button container
  const buttonContainer = document.createElement('div')
  buttonContainer.className = 'debug-preset-buttons'
  buttonContainer.innerHTML = `
    <button id="import-preset-btn" class="debug-button">Import JSON</button>
    <button id="export-preset-btn" class="debug-button">Export JSON</button>
  `
  group.appendChild(buttonContainer)

  // Add button event listeners
  buttonContainer.querySelector('#import-preset-btn').addEventListener('click', () => {
    handleImportPreset(config, callbacks, gameName, selector)
  })

  buttonContainer.querySelector('#export-preset-btn').addEventListener('click', () => {
    handleExportPreset(config, gameName)
  })

  return group
}
```

#### 3.4: Add Event Handler Functions

Add these functions at the end of the file, before the closing bracket:

```javascript
/**
 * Handle preset dropdown change.
 *
 * @param {string} presetName - Selected preset name
 * @param {Object} presets - Map of available presets
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Optional callbacks
 * @param {string} gameName - Game identifier
 */
function handlePresetChange(presetName, presets, config, callbacks, gameName) {
  if (!presetName) return

  const preset = presets[presetName]
  if (!preset) {
    console.error(`[DebugInterface] Preset not found: ${presetName}`)
    return
  }

  // Validate preset
  const validation = validatePresetFormat(preset)
  if (!validation.valid) {
    alert(`Cannot load preset: ${validation.reason}`)
    return
  }

  // Load preset
  const success = loadPreset(preset, config)
  if (!success) {
    alert('Failed to load preset')
    return
  }

  // Sync UI with new values
  syncUIWithConfig(config)

  // Trigger callbacks to recreate entities
  if (callbacks.onInvadersChange) callbacks.onInvadersChange()
  if (callbacks.onPlayerChange) callbacks.onPlayerChange()
  if (callbacks.onBulletSpeedChange) callbacks.onBulletSpeedChange()

  console.log(`[DebugInterface] Loaded preset: ${presetName}`)
}

/**
 * Handle import preset button.
 *
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Optional callbacks
 * @param {string} gameName - Game identifier
 * @param {HTMLSelectElement} selector - Preset dropdown element
 */
async function handleImportPreset(config, callbacks, gameName, selector) {
  try {
    const preset = await importPresetFromJSON()

    // Validate game match
    if (preset.game !== gameName) {
      alert(`This preset is for '${preset.game}' but current game is '${gameName}'`)
      return
    }

    // Validate format
    const validation = validatePresetFormat(preset)
    if (!validation.valid) {
      alert(`Invalid preset: ${validation.reason}`)
      return
    }

    // Load preset
    const success = loadPreset(preset, config)
    if (!success) {
      alert('Failed to load preset')
      return
    }

    // Sync UI
    syncUIWithConfig(config)

    // Trigger callbacks
    if (callbacks.onInvadersChange) callbacks.onInvadersChange()
    if (callbacks.onPlayerChange) callbacks.onPlayerChange()
    if (callbacks.onBulletSpeedChange) callbacks.onBulletSpeedChange()

    // Reset dropdown
    selector.value = ''

    console.log(`[DebugInterface] Imported preset: ${preset.name}`)
  } catch (error) {
    alert(`Import failed: ${error.message}`)
  }
}

/**
 * Handle export preset button.
 *
 * @param {Object} config - Game CONFIG object
 * @param {string} gameName - Game identifier
 */
function handleExportPreset(config, gameName) {
  const presetName = prompt('Enter preset name (alphanumeric + hyphens only):', 'custom')
  if (!presetName) return

  // Validate name
  if (!/^[a-zA-Z0-9-]{3,50}$/.test(presetName)) {
    alert('Invalid preset name. Use 3-50 alphanumeric characters (hyphens allowed)')
    return
  }

  // Create preset
  const preset = saveCurrentPreset(presetName, config, gameName)

  // Export
  exportPresetToJSON(preset)

  console.log(`[DebugInterface] Exported preset: ${presetName}`)
}

/**
 * Sync all UI sliders with CONFIG values.
 *
 * @param {Object} config - Game CONFIG object
 */
function syncUIWithConfig(config) {
  // Update all sliders
  document.querySelectorAll('.debug-slider').forEach(slider => {
    const path = slider.dataset.path
    const value = getNestedValue(config, path)

    if (value !== undefined) {
      slider.value = value

      // Update value display
      const valueDisplay = document.getElementById(`value-${slider.id.replace('slider-', '')}`)
      if (valueDisplay) {
        valueDisplay.textContent = value
      }
    }
  })

  console.log('[DebugInterface] UI synced with CONFIG')
}
```

#### 3.5: Add CSS Styles

Add these styles to `src/debug/debug-styles.css`:

```css
/* Preset Controls */
.debug-select {
  width: 100%;
  padding: 8px;
  margin-top: 5px;
  background: #2a2a2a;
  color: #e0e0e0;
  border: 1px solid #444;
  border-radius: 4px;
  font-family: 'Google Sans', Arial, sans-serif;
  font-size: 14px;
  cursor: pointer;
}

.debug-select:hover {
  border-color: #1a73e8;
}

.debug-select:focus {
  outline: none;
  border-color: #1a73e8;
  box-shadow: 0 0 0 2px rgba(26, 115, 232, 0.2);
}

.debug-preset-buttons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.debug-preset-buttons .debug-button {
  flex: 1;
  padding: 8px 12px;
  background: #1a73e8;
  color: white;
  border: none;
  border-radius: 4px;
  font-family: 'Google Sans', Arial, sans-serif;
  font-size: 13px;
  cursor: pointer;
  transition: background 0.2s;
}

.debug-preset-buttons .debug-button:hover {
  background: #1557b0;
}

.debug-preset-buttons .debug-button:active {
  background: #0d47a1;
}
```

**Verification:**
```bash
# Start dev server and test with browser
cd LifeArcade
npm run dev
# Open http://localhost:5174/games/space-invaders.html?debug=true
# Verify preset dropdown appears and works
```

---

### Step 4: Write Tests (30 minutes)

**Location:** `E:\SGx_GoogleEmployment\LifeArcade\tests\debug\test_DebugPresets.js`

Create new test file:

```javascript
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

  test('validates oscillator appearance requirements', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: { globalCellSize: 30 },
      appearances: {
        invaders: {
          mode: 'oscillator',
          pattern: null, // ❌ Missing pattern
          period: null   // ❌ Missing period
        }
      }
    }

    const result = validatePresetFormat(preset)
    expect(result.valid).toBe(false)
    expect(result.reason).toContain('requires')
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
```

**Run Tests:**
```bash
cd LifeArcade
npm test -- test_DebugPresets
# Should show 16 tests passing
```

---

### Step 5: Manual Testing (20 minutes)

#### 5.1: Test Built-in Presets

1. Start dev server: `npm run dev`
2. Open: `http://localhost:5174/games/space-invaders.html?debug=true`
3. Test each preset:
   - Select "Default" → verify 4×4 invaders, cellSize 30
   - Select "Easy" → verify 2×6 invaders, cellSize 35
   - Select "Hard" → verify 5×10 invaders, cellSize 25
   - Select "Chaos" → verify 6×12 invaders, cellSize 20

**Expected:** All sliders update, entities recreate, game remains playable

#### 5.2: Test Export

1. Modify some sliders (e.g., change invader rows to 3)
2. Click "Export JSON"
3. Enter name: "custom"
4. Verify file downloads: `space-invaders-custom-YYYYMMDD-HHMMSS.json`
5. Open JSON file, verify:
   - `version: 3`
   - `globalCellSize` present
   - No per-entity `cellSize`
   - All modified values saved

#### 5.3: Test Import

1. Export a preset as above
2. Modify sliders to different values
3. Click "Import JSON"
4. Select the exported file
5. Verify: sliders update to imported values, entities recreate

#### 5.4: Test Phase 2 Rejection

1. Create a Phase 2 preset file manually:
```json
{
  "name": "phase2-test",
  "version": 2,
  "config": {
    "invader": { "cellSize": 30, "rows": 4 }
  }
}
```
2. Click "Import JSON", select file
3. **Expected:** Alert shows "Preset must be version 3" error

---

## 🚨 Common Issues & Solutions

### Issue 1: Presets Folder Not Found

**Error:** `Failed to load preset: default`

**Solution:**
```bash
# Create presets directory if it doesn't exist
mkdir -p presets/space-invaders
# Verify JSON files exist
ls presets/space-invaders/
# Should show: default.json easy.json hard.json chaos.json
```

### Issue 2: Import Shows No Alert

**Cause:** Promise rejection not caught

**Solution:** Check browser console for errors. Verify `importPresetFromJSON()` has proper error handling.

### Issue 3: Entities Don't Recreate

**Cause:** Callbacks not triggered after preset load

**Solution:** Verify `handlePresetChange()` calls:
- `callbacks.onInvadersChange()`
- `callbacks.onPlayerChange()`
- `callbacks.onBulletSpeedChange()`

### Issue 4: UI Doesn't Update

**Cause:** `syncUIWithConfig()` not called

**Solution:** Add call to `syncUIWithConfig(config)` after `loadPreset()`

---

## ✅ Completion Checklist

Before marking Phase 3.1 complete, verify:

- [ ] 4 preset JSON files created in `presets/space-invaders/`
- [ ] `DebugPresets.js` module implemented with all functions
- [ ] Preset dropdown appears in Debug Interface
- [ ] Import/Export buttons functional
- [ ] Default preset loads correctly
- [ ] Easy preset loads correctly
- [ ] Hard preset loads correctly
- [ ] Chaos preset loads correctly
- [ ] Export creates valid JSON file
- [ ] Import loads custom preset
- [ ] Phase 2 presets are rejected with clear error
- [ ] UI sliders sync after preset load
- [ ] Entities recreate after preset load (invaders count changes)
- [ ] Tests pass: `npm test -- test_DebugPresets`
- [ ] Manual testing completed (all 4 scenarios)

---

## 📊 Success Metrics

After implementation, verify these metrics:

**Functionality:**
- ✅ 4 built-in presets load without errors
- ✅ Export creates valid Phase 3 JSON
- ✅ Import accepts valid Phase 3 presets
- ✅ Import rejects Phase 2 presets
- ✅ UI syncs with preset values
- ✅ Entities recreate (visible change in game)

**Code Quality:**
- ✅ All functions have JSDoc comments
- ✅ Follows p5.js Global Mode (no `this.` prefix)
- ✅ Error handling for all async operations
- ✅ Console logging for debugging
- ✅ Follows existing code style

**Testing:**
- ✅ 16+ unit tests passing
- ✅ Validation tests cover Phase 2/3 formats
- ✅ Load/Save tests verify CONFIG updates
- ✅ Utility tests cover edge cases

---

## 🎯 Next Steps (After Phase 3.1)

Once Phase 3.1 is complete, consider:

1. **Add Presets for Other Games:**
   - Create `presets/dino-runner/` with 4 presets
   - Create `presets/breakout/` with 4 presets
   - Create `presets/flappy-bird/` with 4 presets

2. **Enhance Preset System:**
   - Add preset preview (show config before loading)
   - Add preset comparison (diff between current and preset)
   - Add preset favorites (localStorage)

3. **Fix Remaining Tests:**
   - IdleScreen: 26 failures (p5.js mock issues)
   - ParticleHelpers: 6 failures
   - Other helper tests

---

## 📚 Reference Documents

Keep these documents open while implementing:

1. **PRESET_JSON_SPEC.md** - Complete preset format specification
2. **DEBUG_INTERFACE_FEATURE.md** - UI patterns and examples
3. **CLAUDE.md** - Core development rules
4. **GAME_TEMPLATE_GUIDE.md** - Game configuration examples

---

**Plan Version:** 1.0
**Created:** 2025-11-18
**Status:** ✅ Ready for Implementation
**Estimated Duration:** 2-3 hours
**Priority:** P0 (High)
