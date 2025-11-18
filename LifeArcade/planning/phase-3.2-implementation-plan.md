# Phase 3.2 Implementation Plan - Preset Edit & Appearance Integration

**Date:** 2025-11-18
**Type:** Enhancement of Phase 3.1 Preset Management
**Priority:** P1 - Debug Interface Enhancement
**Estimated Time:** 3-4 hours
**Status:** Planning

---

## 🎯 Overview

### Objectives

Enhance the existing Phase 3.1 preset management system to support:

1. **Appearance Integration** - Include `appearances` section in preset JSON files
2. **In-Place Editing** - Modify existing 4 presets (no new presets)
3. **Save Functionality** - Overwrite current preset JSON file
4. **Reset Functionality** - Restore preset from original JSON file

### User Requirements

| Requirement | Description | Status |
|-------------|-------------|--------|
| **No New Presets** | Only modify existing 4 presets per game | ✅ Confirmed |
| **Include Appearances** | Add `appearances` section to JSON | ✅ Planned |
| **Save Button** | Overwrite current preset JSON | ✅ Planned |
| **Reset Button** | Reload from file on disk | ✅ Planned |
| **Update JSON Files** | Write changes to disk on save | ⚠️ Manual workflow |

### Scope

**In Scope:**
- ✅ Modify 4 existing preset JSON files (default, easy, hard, chaos)
- ✅ Add `appearances` section to preset format
- ✅ Implement Save button (export with preset name)
- ✅ Implement Reset button (reload from JSON)
- ✅ Capture current appearances from UI
- ✅ Update tests for new functionality

**Out of Scope:**
- ❌ Creating new presets
- ❌ Deleting presets
- ❌ Automatic file writing (requires backend)
- ❌ Preset validation UI (already exists)

---

## 📋 Current State Analysis

### Existing Files (Phase 3.1)

```
LifeArcade/
├── public/
│   ├── presets/space-invaders/
│   │   ├── default.json      ✅ Exists (NO appearances)
│   │   ├── easy.json          ✅ Exists (NO appearances)
│   │   ├── hard.json          ✅ Exists (NO appearances)
│   │   └── chaos.json         ✅ Exists (NO appearances)
│   └── src/debug/
│       ├── DebugInterface.js  ✅ Has preset UI
│       ├── DebugPresets.js    ✅ Has load/save logic
│       └── debug-styles.css   ✅ Has styling
├── src/debug/
│   ├── DebugInterface.js      ✅ Source code
│   ├── DebugPresets.js        ✅ Source code
│   └── debug-styles.css       ✅ Source code
└── tests/debug/
    ├── test_DebugInterface.js  ✅ 77/77 passing
    └── test_DebugPresets.js    ✅ 27/27 passing
```

### Functionality Gaps

**DebugInterface.js:**
- ✅ Dropdown to select preset
- ✅ Import/Export buttons
- ❌ NO Save button
- ❌ NO Reset button
- ❌ Does NOT capture appearances

**DebugPresets.js:**
- ✅ `loadPreset()` - loads config into CONFIG
- ✅ `saveCurrentPreset()` - creates preset object
- ✅ `exportPresetToJSON()` - downloads JSON file
- ❌ Does NOT include appearances in saved preset
- ❌ Does NOT write to file system

**Preset JSON Files:**
- ✅ Valid Phase 3 format
- ✅ Include config section
- ❌ NO appearances section

---

## 🏗️ Implementation Steps

### STEP 1: Add `appearances` Section to Preset JSON Files (30 min)

**Files to Modify:**
- `public/presets/space-invaders/default.json`
- `public/presets/space-invaders/easy.json`
- `public/presets/space-invaders/hard.json`
- `public/presets/space-invaders/chaos.json`

**Format:**

```json
{
  "name": "default",
  "version": 3,
  "game": "space-invaders",
  "timestamp": "2025-11-18T10:00:00.000Z",
  "description": "Balanced gameplay with original settings",
  "config": {
    "globalCellSize": 30,
    "invader": { /* ... */ },
    "player": { /* ... */ },
    "bullet": { /* ... */ },
    "explosion": { /* ... */ }
  },
  "appearances": {
    "player": {
      "mode": "modified-gol",
      "pattern": null,
      "period": null
    },
    "invaders": {
      "mode": "modified-gol",
      "pattern": null,
      "period": null
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

**Appearance Modes by Preset:**

| Preset | Player | Invaders | Bullets | Explosions | Rationale |
|--------|--------|----------|---------|------------|-----------|
| **default** | modified-gol | modified-gol | static | pure-gol | Balanced, stable gameplay |
| **easy** | modified-gol | modified-gol | static | pure-gol | Same as default (easier via config) |
| **hard** | modified-gol | oscillator<br/>(blinker, p=2) | static | pure-gol | Visual challenge for hard mode |
| **chaos** | modified-gol | oscillator<br/>(pulsar, p=3) | static | pure-gol | Maximum visual chaos |

**Validation:**
- Use existing `validatePresetFormat()` function
- Already validates `appearances` section (optional)
- Tests already cover this in `test_DebugPresets_Validation.js`

**Implementation:**

```json
// default.json & easy.json - Same appearances
{
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "modified-gol", "pattern": null, "period": null },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}

// hard.json - Blinker for invaders
{
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "oscillator", "pattern": "blinker", "period": 2 },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}

// chaos.json - Pulsar for invaders
{
  "appearances": {
    "player": { "mode": "modified-gol", "pattern": null, "period": null },
    "invaders": { "mode": "oscillator", "pattern": "pulsar", "period": 3 },
    "bullets": { "mode": "static", "pattern": null, "period": null },
    "explosions": { "mode": "pure-gol", "pattern": null, "period": null }
  }
}
```

---

### STEP 2: Modify `DebugPresets.js` - Capture Appearances (45 min)

**File:** `src/debug/DebugPresets.js` (then copy to `public/src/debug/`)

#### Change 1: Update `saveCurrentPreset()` Function

**Before (Phase 3.1):**
```javascript
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
```

**After (Phase 3.2):**
```javascript
/**
 * Save current CONFIG as preset object.
 *
 * @param {string} presetName - Name for the preset
 * @param {Object} config - Current game CONFIG
 * @param {string} gameName - Game identifier
 * @param {Object} appearances - Appearance settings (optional)
 * @returns {Object} Preset object ready for export
 *
 * @example
 * const appearances = {
 *   player: { mode: 'modified-gol', pattern: null, period: null }
 * }
 * const preset = saveCurrentPreset('custom', CONFIG, 'space-invaders', appearances)
 * exportPresetToJSON(preset)
 */
export function saveCurrentPreset(presetName, config, gameName, appearances = null) {
  const preset = {
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

  // Add appearances if provided
  if (appearances && Object.keys(appearances).length > 0) {
    preset.appearances = { ...appearances }
  }

  return preset
}
```

#### Change 2: Update `exportPresetToJSON()` Function

**Before (Phase 3.1):**
```javascript
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
```

**After (Phase 3.2):**
```javascript
/**
 * Export preset as JSON file (download).
 *
 * @param {Object} preset - Preset object to export
 * @param {boolean} usePresetName - Use simple preset name (for Save button)
 *
 * @example
 * // Custom preset with timestamp
 * exportPresetToJSON(preset, false)
 * // Downloads: space-invaders-custom-20251118-143522.json
 *
 * // Built-in preset for replacement
 * exportPresetToJSON(preset, true)
 * // Downloads: default.json
 */
export function exportPresetToJSON(preset, usePresetName = false) {
  let filename

  if (usePresetName && isBuiltInPreset(preset.name)) {
    // For built-in presets: simple name for easy file replacement
    filename = `${preset.name}.json`
  } else {
    // For custom presets: timestamped name
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, '')
      .replace('T', '-')
      .substring(0, 15) // YYYYMMDD-HHMMSS

    filename = `${preset.game}-${preset.name}-${timestamp}.json`
  }

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
```

#### Change 3: Update `loadPreset()` to Apply Appearances

**Before (Phase 3.1):**
```javascript
export function loadPreset(preset, config) {
  try {
    // Deep merge preset config into game config
    for (const [key, value] of Object.entries(preset.config)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (!config[key]) {
          config[key] = {}
        }
        Object.assign(config[key], value)
      } else {
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
```

**After (Phase 3.2):**
```javascript
/**
 * Load preset into CONFIG object.
 *
 * IMPORTANT: This mutates the CONFIG object.
 * Caller must trigger entity recreation callbacks after loading.
 * Returns appearances object for caller to apply separately.
 *
 * @param {Object} preset - Validated preset object
 * @param {Object} config - Game CONFIG object (will be mutated)
 * @returns {{ success: boolean, appearances: Object|null }} Load result
 *
 * @example
 * const result = loadPreset(preset, CONFIG)
 * if (result.success) {
 *   if (result.appearances) {
 *     applyAppearanceOverrides(result.appearances)  // Caller handles
 *   }
 *   callbacks.onInvadersChange()
 *   callbacks.onPlayerChange()
 * }
 */
export function loadPreset(preset, config) {
  try {
    // Deep merge preset config into game config
    for (const [key, value] of Object.entries(preset.config)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if (!config[key]) {
          config[key] = {}
        }
        Object.assign(config[key], value)
      } else {
        config[key] = value
      }
    }

    console.log(`[DebugPresets] Loaded preset: ${preset.name}`)

    // Return appearances for caller to apply
    return {
      success: true,
      appearances: preset.appearances || null
    }
  } catch (error) {
    console.error('[DebugPresets] Failed to load preset:', error)
    return { success: false, appearances: null }
  }
}
```

---

### STEP 3: Modify `DebugInterface.js` - Add Save/Reset Buttons (60 min)

**File:** `src/debug/DebugInterface.js` (then copy to `public/src/debug/`)

#### Change 1: Update Preset Group HTML

**Before (Phase 3.1):**
```javascript
const buttonContainer = document.createElement('div')
buttonContainer.className = 'debug-preset-buttons'
buttonContainer.innerHTML = `
  <button id="import-preset-btn" class="debug-button">Import JSON</button>
  <button id="export-preset-btn" class="debug-button">Export JSON</button>
`
```

**After (Phase 3.2):**
```javascript
const buttonContainer = document.createElement('div')
buttonContainer.className = 'debug-preset-buttons'
buttonContainer.innerHTML = `
  <button id="save-preset-btn" class="debug-button debug-button-save">Save</button>
  <button id="reset-preset-btn" class="debug-button debug-button-reset">Reset</button>
  <button id="import-preset-btn" class="debug-button debug-button-secondary">Import</button>
  <button id="export-preset-btn" class="debug-button debug-button-secondary">Export</button>
`
```

#### Change 2: Add New Helper Functions

**Add `captureCurrentAppearances()` function:**

```javascript
/**
 * Capture current appearance settings from UI dropdowns.
 *
 * @returns {Object} Appearances object compatible with preset format
 *
 * @example
 * const appearances = captureCurrentAppearances()
 * // {
 * //   player: { mode: 'modified-gol', pattern: null, period: null },
 * //   invaders: { mode: 'oscillator', pattern: 'blinker', period: 2 }
 * // }
 */
function captureCurrentAppearances() {
  const appearances = {}

  // Get dropdown values for each entity
  const entities = ['player', 'invaders', 'bullets', 'explosions']

  for (const entity of entities) {
    const dropdown = document.getElementById(`${entity}-appearance`)
    if (!dropdown) continue

    const value = dropdown.value

    // Parse dropdown value format: "mode" or "mode-pattern"
    // Examples: "modified-gol", "oscillator-blinker", "static"
    if (value.startsWith('oscillator-')) {
      const pattern = value.replace('oscillator-', '')
      appearances[entity] = {
        mode: 'oscillator',
        pattern: pattern,
        period: getPatternPeriod(pattern)
      }
    } else {
      appearances[entity] = {
        mode: value,
        pattern: null,
        period: null
      }
    }
  }

  return appearances
}

/**
 * Get period for known oscillator patterns.
 *
 * @param {string} pattern - Pattern name
 * @returns {number|null} Pattern period or null
 */
function getPatternPeriod(pattern) {
  const periods = {
    'blinker': 2,
    'toad': 2,
    'beacon': 2,
    'pulsar': 3
  }
  return periods[pattern] || null
}
```

#### Change 3: Add Save Handler

**Add `handleSavePreset()` function:**

```javascript
/**
 * Handle Save button click - overwrites current preset JSON.
 *
 * Workflow:
 * 1. Validate preset selection
 * 2. Confirm overwrite with user
 * 3. Capture current CONFIG + appearances
 * 4. Export JSON with preset name (no timestamp)
 * 5. Instruct user to manually replace file
 *
 * IMPORTANT: File writing requires manual step (Vite cannot write files).
 */
function handleSavePreset() {
  const dropdown = document.getElementById('preset-selector')
  const presetName = dropdown.value

  // Validate selection
  if (!presetName) {
    alert('Please select a preset to save')
    return
  }

  // Confirm overwrite for built-in presets
  if (isBuiltInPreset(presetName)) {
    const confirmSave = confirm(
      `Overwrite built-in preset "${presetName}"?\n\n` +
      `This will export a JSON file that you must manually replace:\n` +
      `public/presets/${gameName}/${presetName}.json\n\n` +
      `Click OK to continue.`
    )
    if (!confirmSave) return
  }

  try {
    // Capture current state
    const appearances = captureCurrentAppearances()
    const preset = saveCurrentPreset(presetName, CONFIG, gameName, appearances)

    // Validate before export
    const validation = validatePresetFormat(preset)
    if (!validation.valid) {
      alert(`Cannot save: ${validation.reason}`)
      return
    }

    // Export with preset name (usePresetName = true)
    exportPresetToJSON(preset, true)

    console.log(`[DebugInterface] Exported ${presetName}.json for manual replacement`)

    // Instructions for user
    alert(
      `Preset exported as "${presetName}.json"\n\n` +
      `To complete save:\n` +
      `1. Locate the downloaded file in your Downloads folder\n` +
      `2. Move/copy to: public/presets/${gameName}/${presetName}.json\n` +
      `3. Replace the existing file\n` +
      `4. Vite will auto-reload the page\n\n` +
      `Your changes are now saved!`
    )

  } catch (error) {
    console.error('[DebugInterface] Save failed:', error)
    alert(`Failed to save preset: ${error.message}`)
  }
}
```

#### Change 4: Add Reset Handler

**Add `handleResetPreset()` function:**

```javascript
/**
 * Handle Reset button click - reload preset from JSON file.
 *
 * Workflow:
 * 1. Validate preset selection
 * 2. Confirm reset with user
 * 3. Fetch fresh preset from public/presets/{game}/{preset}.json
 * 4. Validate preset format
 * 5. Load into CONFIG
 * 6. Apply appearances (if present)
 * 7. Sync UI controls
 * 8. Trigger entity recreation
 */
async function handleResetPreset() {
  const dropdown = document.getElementById('preset-selector')
  const presetName = dropdown.value

  // Validate selection
  if (!presetName) {
    alert('Please select a preset to reset')
    return
  }

  // Confirm reset
  const confirmReset = confirm(
    `Reset to original "${presetName}" preset?\n\n` +
    `This will discard all unsaved changes.`
  )
  if (!confirmReset) return

  try {
    // Fetch fresh preset from JSON file
    const response = await fetch(`/presets/${gameName}/${presetName}.json`)
    if (!response.ok) {
      throw new Error(`Failed to load preset: ${response.statusText}`)
    }

    const preset = await response.json()

    // Validate preset format
    const validation = validatePresetFormat(preset)
    if (!validation.valid) {
      throw new Error(`Invalid preset format: ${validation.reason}`)
    }

    // Load config into CONFIG
    const result = loadPreset(preset, CONFIG)
    if (!result.success) {
      throw new Error('Failed to load preset configuration')
    }

    // Apply appearances if present
    if (result.appearances) {
      applyAppearanceOverrides(result.appearances)
    }

    // Sync UI controls with new CONFIG values
    syncUIWithConfig()

    // Trigger entity recreation callbacks
    if (callbacks.onGlobalCellSizeChange) {
      callbacks.onGlobalCellSizeChange()
    }
    if (callbacks.onInvadersChange) {
      callbacks.onInvadersChange()
    }
    if (callbacks.onPlayerChange) {
      callbacks.onPlayerChange()
    }

    console.log(`[DebugInterface] Reset to preset: ${presetName}`)
    alert(`Preset "${presetName}" reset successfully`)

  } catch (error) {
    console.error('[DebugInterface] Reset failed:', error)
    alert(`Failed to reset preset: ${error.message}`)
  }
}
```

#### Change 5: Update Event Listeners

**In `populateControls()` function, add:**

```javascript
// Add event listeners for Save/Reset buttons
document.getElementById('save-preset-btn').addEventListener('click', handleSavePreset)
document.getElementById('reset-preset-btn').addEventListener('click', handleResetPreset)

// Existing listeners
document.getElementById('import-preset-btn').addEventListener('click', handleImportPreset)
document.getElementById('export-preset-btn').addEventListener('click', handleExportPreset)
```

#### Change 6: Update `handlePresetChange()` to Apply Appearances

**Before (Phase 3.1):**
```javascript
async function handlePresetChange(event) {
  const presetName = event.target.value
  if (!presetName) return

  const presets = await getBuiltInPresets(gameName)
  const preset = presets[presetName]

  if (!preset) {
    alert(`Preset "${presetName}" not found`)
    return
  }

  const validation = validatePresetFormat(preset)
  if (!validation.valid) {
    alert(`Invalid preset: ${validation.reason}`)
    return
  }

  const success = loadPreset(preset, CONFIG)
  if (success) {
    syncUIWithConfig()
    // Trigger callbacks...
  }
}
```

**After (Phase 3.2):**
```javascript
async function handlePresetChange(event) {
  const presetName = event.target.value
  if (!presetName) return

  const presets = await getBuiltInPresets(gameName)
  const preset = presets[presetName]

  if (!preset) {
    alert(`Preset "${presetName}" not found`)
    return
  }

  const validation = validatePresetFormat(preset)
  if (!validation.valid) {
    alert(`Invalid preset: ${validation.reason}`)
    return
  }

  const result = loadPreset(preset, CONFIG)
  if (result.success) {
    // Apply appearances if present
    if (result.appearances) {
      applyAppearanceOverrides(result.appearances)
    }

    syncUIWithConfig()

    // Trigger callbacks...
    if (callbacks.onGlobalCellSizeChange) {
      callbacks.onGlobalCellSizeChange()
    }
    // ...
  }
}
```

---

### STEP 4: Update CSS Styling (10 min)

**File:** `src/debug/debug-styles.css` (then copy to `public/src/debug/`)

**Add button color differentiation:**

```css
/* ===== PRESET BUTTON STYLES (Phase 3.2) ===== */

/* Save button - primary action (Google Green) */
.debug-button-save {
  background: #34A853;  /* Google Green */
}

.debug-button-save:hover {
  background: #2E9348;  /* Darker green */
}

.debug-button-save:active {
  background: #268039;  /* Even darker */
}

/* Reset button - warning action (Google Yellow) */
.debug-button-reset {
  background: #FBBC04;  /* Google Yellow */
  color: #333333;       /* Dark text for contrast */
}

.debug-button-reset:hover {
  background: #E1A704;  /* Darker yellow */
}

.debug-button-reset:active {
  background: #C79603;  /* Even darker */
}

/* Import/Export buttons - secondary (Google Blue) */
.debug-button-secondary {
  background: #4285F4;  /* Google Blue */
}

.debug-button-secondary:hover {
  background: #3367D6;  /* Darker blue */
}

.debug-button-secondary:active {
  background: #2C5AB6;  /* Even darker */
}

/* Button layout - 2x2 grid */
.debug-preset-buttons {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-top: 10px;
}
```

---

### STEP 5: Update Tests (30 min)

**Files:**
- `tests/debug/test_DebugPresets.js`
- `tests/debug/test_DebugInterface.js`

#### New Tests for `test_DebugPresets.js`

**Add to existing test suite:**

```javascript
describe('DebugPresets - Appearances (Phase 3.2)', () => {
  test('saveCurrentPreset captures appearances when provided', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 },
      player: { speed: 18, golUpdateRate: 12 },
      bullet: { speed: -8, golUpdateRate: 0 },
      explosion: { golUpdateRate: 8 }
    }

    const appearances = {
      player: { mode: 'modified-gol', pattern: null, period: null },
      invaders: { mode: 'oscillator', pattern: 'blinker', period: 2 },
      bullets: { mode: 'static', pattern: null, period: null },
      explosions: { mode: 'pure-gol', pattern: null, period: null }
    }

    const preset = saveCurrentPreset('test', config, 'space-invaders', appearances)

    expect(preset.version).toBe(3)
    expect(preset.appearances).toBeDefined()
    expect(preset.appearances.player.mode).toBe('modified-gol')
    expect(preset.appearances.invaders.mode).toBe('oscillator')
    expect(preset.appearances.invaders.pattern).toBe('blinker')
    expect(preset.appearances.invaders.period).toBe(2)
  })

  test('saveCurrentPreset omits appearances when null', () => {
    const config = {
      globalCellSize: 30,
      invader: { rows: 4, golUpdateRate: 15 }
    }

    const preset = saveCurrentPreset('test', config, 'space-invaders', null)

    expect(preset.appearances).toBeUndefined()
  })

  test('loadPreset returns appearances for caller to apply', () => {
    const preset = {
      name: 'test',
      version: 3,
      game: 'space-invaders',
      config: {
        globalCellSize: 30,
        invader: { rows: 4, golUpdateRate: 15 }
      },
      appearances: {
        player: { mode: 'static', pattern: null, period: null }
      }
    }

    const config = { globalCellSize: 25 }
    const result = loadPreset(preset, config)

    expect(result.success).toBe(true)
    expect(result.appearances).toBeDefined()
    expect(result.appearances.player.mode).toBe('static')
    expect(config.globalCellSize).toBe(30)
  })

  test('exportPresetToJSON uses preset name for built-in presets', () => {
    const preset = {
      name: 'default',
      version: 3,
      game: 'space-invaders',
      config: { globalCellSize: 30 }
    }

    // Mock createElement and click
    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportPresetToJSON(preset, true)

    expect(mockAnchor.download).toBe('default.json')
    expect(mockAnchor.click).toHaveBeenCalled()
  })

  test('exportPresetToJSON uses timestamp for custom presets', () => {
    const preset = {
      name: 'custom',
      version: 3,
      game: 'space-invaders',
      config: { globalCellSize: 30 }
    }

    const mockAnchor = {
      href: '',
      download: '',
      click: vi.fn()
    }
    vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)
    vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock')
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {})

    exportPresetToJSON(preset, false)

    expect(mockAnchor.download).toMatch(/^space-invaders-custom-\d{8}-\d{6}\.json$/)
    expect(mockAnchor.click).toHaveBeenCalled()
  })
})
```

#### New Tests for `test_DebugInterface.js`

**Add to existing test suite:**

```javascript
describe('DebugInterface - Save/Reset (Phase 3.2)', () => {
  test('captureCurrentAppearances extracts dropdown values', () => {
    // Mock dropdown elements
    document.body.innerHTML = `
      <select id="player-appearance"><option value="modified-gol" selected>Modified GoL</option></select>
      <select id="invaders-appearance"><option value="oscillator-blinker" selected>Oscillator (Blinker)</option></select>
      <select id="bullets-appearance"><option value="static" selected>Static</option></select>
      <select id="explosions-appearance"><option value="pure-gol" selected>Pure GoL</option></select>
    `

    const appearances = captureCurrentAppearances()

    expect(appearances.player.mode).toBe('modified-gol')
    expect(appearances.player.pattern).toBe(null)

    expect(appearances.invaders.mode).toBe('oscillator')
    expect(appearances.invaders.pattern).toBe('blinker')
    expect(appearances.invaders.period).toBe(2)

    expect(appearances.bullets.mode).toBe('static')
    expect(appearances.explosions.mode).toBe('pure-gol')
  })

  test('handleSavePreset exports current state with appearances', () => {
    // Mock preset selector
    document.body.innerHTML = `
      <select id="preset-selector"><option value="default" selected>Default</option></select>
      <select id="player-appearance"><option value="modified-gol" selected>Modified GoL</option></select>
      <button id="save-preset-btn">Save</button>
    `

    // Mock dependencies
    const exportSpy = vi.spyOn(DebugPresets, 'exportPresetToJSON')
    const validateSpy = vi.spyOn(DebugPresets, 'validatePresetFormat').mockReturnValue({ valid: true })
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    handleSavePreset()

    expect(exportSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'default',
        version: 3,
        appearances: expect.any(Object)
      }),
      true  // usePresetName = true
    )
  })

  test('handleResetPreset reloads from JSON file', async () => {
    // Mock preset selector
    document.body.innerHTML = `
      <select id="preset-selector"><option value="default" selected>Default</option></select>
      <button id="reset-preset-btn">Reset</button>
    `

    // Mock fetch response
    const mockPreset = {
      name: 'default',
      version: 3,
      game: 'space-invaders',
      config: { globalCellSize: 30 },
      appearances: {
        player: { mode: 'modified-gol', pattern: null, period: null }
      }
    }

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockPreset
    })

    // Mock dependencies
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(window, 'alert').mockImplementation(() => {})

    const loadSpy = vi.spyOn(DebugPresets, 'loadPreset').mockReturnValue({
      success: true,
      appearances: mockPreset.appearances
    })

    await handleResetPreset()

    expect(fetch).toHaveBeenCalledWith('/presets/space-invaders/default.json')
    expect(loadSpy).toHaveBeenCalledWith(mockPreset, CONFIG)
    expect(CONFIG.globalCellSize).toBe(30)
  })

  test('handleResetPreset shows error for invalid preset', async () => {
    document.body.innerHTML = `
      <select id="preset-selector"><option value="invalid" selected>Invalid</option></select>
    `

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      statusText: 'Not Found'
    })

    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    await handleResetPreset()

    expect(alertSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to reset preset')
    )
  })
})
```

---

### STEP 6: Copy to `public/` Directory (5 min)

**After all changes, sync to public:**

```bash
# Copy modified source files to public
cp src/debug/DebugInterface.js public/src/debug/
cp src/debug/DebugPresets.js public/src/debug/
cp src/debug/debug-styles.css public/src/debug/
```

**Vite will auto-reload when files in `public/` change.**

---

## 🧪 Testing Strategy

### Unit Tests

**Run after each step:**
```bash
npm test -- debug
```

**Expected results:**
- All existing tests pass (27/27 in DebugPresets, 77/77 in DebugInterface)
- New tests pass (5 new in DebugPresets, 4 new in DebugInterface)

### Manual Testing Workflow

**Scenario: Modify and save "hard" preset**

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Open debug mode:**
   ```
   http://localhost:5174/games/space-invaders.html?debug=true
   ```

3. **Load preset:**
   - Select "hard" from dropdown
   - Verify loads with blinker for invaders

4. **Modify settings:**
   - Change `globalCellSize`: 25 → 28
   - Change `invader.speed`: 60 → 70
   - Change invader appearance: blinker → pulsar

5. **Save:**
   - Click "Save" button
   - Confirm overwrite dialog
   - File downloads as `hard.json`

6. **Replace file:**
   - Locate `hard.json` in Downloads
   - Copy to `public/presets/space-invaders/hard.json`
   - Vite should auto-reload page

7. **Verify persistence:**
   - Click "Reset" button
   - Verify settings return to saved values (28, 70, pulsar)
   - NOT original values (25, 60, blinker)

8. **Test all 4 presets:**
   - Repeat for: default, easy, hard, chaos
   - Verify each loads/saves/resets correctly

### Validation Checklist

- [ ] All 4 preset JSONs include `appearances` section
- [ ] Save button exports JSON with preset name (no timestamp)
- [ ] Reset button reloads from file on disk
- [ ] Appearances captured correctly from UI dropdowns
- [ ] `loadPreset()` returns appearances for caller
- [ ] Manual file replacement workflow works
- [ ] Vite HMR detects file changes
- [ ] All tests pass (104/104 total)
- [ ] CSS button colors applied correctly
- [ ] User instructions clear in alert dialogs

---

## ⚠️ Known Limitations

### 1. Manual File Replacement Required

**Problem:** Vite dev server + browser JavaScript cannot write to file system.

**Workaround:** User must manually replace downloaded JSON file.

**Future Solutions:**
- Backend API endpoint: `POST /api/presets/:game/:name`
- VSCode extension with file watcher
- Git hooks for auto-commit presets

### 2. Appearances Not in CONFIG Object

**Problem:** `appearances` managed separately via `window.APPEARANCE_OVERRIDES`.

**Solution:** `captureCurrentAppearances()` reads from UI dropdowns, not CONFIG.

**Impact:** Works correctly, but architecture is split between CONFIG and APPEARANCE_OVERRIDES.

### 3. Reset Loads Last Saved Version

**Problem:** Reset button loads from file, not original preset.

**Behavior:**
- User modifies preset → clicks Save → replaces file
- User modifies again → clicks Reset
- **Result:** Resets to last saved version (not original)

**Workaround:** Use Git to restore original: `git checkout public/presets/space-invaders/*.json`

### 4. No Undo/Redo

**Problem:** No history of changes.

**Workaround:** Export before making changes, or rely on Git history.

---

## 📊 Success Metrics

### Functional Requirements

- ✅ **Presets include appearances** - All 4 JSONs have valid `appearances` section
- ✅ **Save overwrites preset** - Exports JSON with preset name for easy replacement
- ✅ **Reset restores from file** - Reloads fresh JSON from disk
- ✅ **Appearances captured** - `saveCurrentPreset()` includes UI dropdown values
- ✅ **Manual workflow works** - Download → Replace → HMR reload cycle successful

### Technical Requirements

- ✅ **Tests pass** - 104/104 tests (27 + 5 + 77 + 4 new)
- ✅ **No breaking changes** - Existing functionality preserved
- ✅ **Phase 3 format** - All presets use `version: 3`
- ✅ **Validation works** - `validatePresetFormat()` accepts appearances
- ✅ **Documentation updated** - PRESET_JSON_SPEC.md clarifies appearances optional

### User Experience

- ✅ **Clear instructions** - Alert dialogs guide user through workflow
- ✅ **Visual feedback** - Button colors indicate action type
- ✅ **Error handling** - Validation errors displayed to user
- ✅ **Confirmation dialogs** - Prevent accidental overwrites
- ✅ **Responsive UI** - Works at 1200×1920 portrait

---

## 📅 Implementation Timeline

### Day 1 (2 hours)

**Morning:**
- [ ] STEP 1: Add appearances to 4 preset JSONs (30 min)
- [ ] STEP 2: Modify DebugPresets.js (45 min)
- [ ] STEP 3: Start DebugInterface.js changes (45 min)

**Validation:**
- Run `npm test -- debug`
- Manual test: Load preset with appearances

### Day 1 (1.5 hours)

**Afternoon:**
- [ ] STEP 3: Complete DebugInterface.js (15 min)
- [ ] STEP 4: Update CSS (10 min)
- [ ] STEP 5: Write new tests (30 min)
- [ ] STEP 6: Copy to public/ (5 min)

**Validation:**
- Run all tests: `npm test`
- Manual workflow: Save → Replace → Reset

### Total: 3.5 hours

**Buffer:** +30 min for debugging = **4 hours total**

---

## 🎯 Acceptance Criteria

### Code Quality

- ✅ Follows CLAUDE.md principles (KISS, YAGNI)
- ✅ No breaking changes to existing API
- ✅ JSDoc comments for all new functions
- ✅ Consistent code style with existing files
- ✅ No console errors or warnings

### Functionality

- ✅ 4 presets include valid `appearances` section
- ✅ Save button exports JSON with preset name
- ✅ Reset button reloads from file on disk
- ✅ Appearances captured from UI dropdowns
- ✅ Manual file replacement workflow documented

### Testing

- ✅ All existing tests pass (104/104)
- ✅ 9 new tests added and passing
- ✅ Manual workflow tested for all 4 presets
- ✅ Edge cases handled (invalid preset, missing file)

### Documentation

- ✅ Implementation plan created (this file)
- ✅ PRESET_JSON_SPEC.md updated (appearances optional)
- ✅ Code comments explain manual workflow
- ✅ Alert dialogs provide clear instructions

---

## 📝 Next Steps

### Before Implementation

1. **Review plan** with user/team
2. **Confirm workflow** acceptance (manual file replacement)
3. **Create branch:** `feature/phase-3.2-preset-edit-appearances`

### During Implementation

1. **Follow steps 1-6** sequentially
2. **Run tests** after each step
3. **Commit frequently** with descriptive messages
4. **Document issues** encountered

### After Implementation

1. **Full manual test** of all 4 presets
2. **Update PROJECT_STATUS.md** to Phase 3.2 complete
3. **Merge to main** after validation
4. **Archive plan** to `archive/planning/`

---

## 🔗 Related Documents

- **Phase 3.1 Plan:** `planning/phase-3.1-implementation-plan.md`
- **Preset Spec:** `docs/PRESET_JSON_SPEC.md`
- **Debug Interface:** `docs/DEBUG_INTERFACE_FEATURE.md`
- **Project Status:** `docs/PROJECT_STATUS.md`
- **Development Rules:** `CLAUDE.md`

---

**Plan Status:** ✅ Complete and Ready for Implementation
**Created:** 2025-11-18
**Author:** Claude Code
**Estimated Effort:** 4 hours (including testing)
