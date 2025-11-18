# Phase 3 Migration Guide

**Date:** 2025-11-18
**Status:** Active (52 failing tests to migrate)
**Estimated Time:** 7 hours total to 100% passing

---

## 📋 Overview

Phase 3 introduced **global cell size unification** to simplify configuration and ensure visual consistency across all entities.

### Breaking Changes Summary

| Change | Phase 2 (OLD) | Phase 3 (NEW) |
|--------|---------------|---------------|
| **Cell Size Location** | Per-entity property | Global CONFIG property |
| **Property Name** | `entity.cellSize` | `CONFIG.globalCellSize` |
| **Render Function** | Uses `entity.cellSize` | Uses `CONFIG.globalCellSize` |
| **Update Rates** | Embedded in entity | Separate `golUpdateRate` properties |

---

## 🔴 Priority 0: Fix Debug Interface Tests (4 hours)

### Affected Files
- `tests/debug/test_DebugInterface.js` (5 failures)
- `tests/debug/test_DebugPresets.js` (12 failures)

### Root Cause
Tests expect Phase 2 format with per-entity `cellSize` properties.

### Migration Steps

#### 1. Update Test Mock CONFIG Objects

**❌ Phase 2 (OLD):**
```javascript
const mockConfig = {
  player: {
    cellSize: 30,
    width: 180,
    height: 180,
    speed: 18
  },
  invader: {
    cellSize: 30,
    width: 180,
    height: 180,
    moveInterval: 30
  }
}
```

**✅ Phase 3 (NEW):**
```javascript
const mockConfig = {
  globalCellSize: 30,  // ← Moved to top level
  player: {
    width: 180,        // ← Removed cellSize
    height: 180,
    speed: 18,
    golUpdateRate: 12  // ← Added update rate
  },
  invader: {
    width: 180,        // ← Removed cellSize
    height: 180,
    moveInterval: 30,
    golUpdateRate: 15  // ← Added update rate
  }
}
```

#### 2. Update Preset Validation Tests

**❌ Phase 2 (OLD):**
```javascript
test('validates preset has required fields', () => {
  const preset = {
    name: 'test',
    config: {
      invader: {
        cellSize: 30,  // ← Phase 2 format
        rows: 4
      }
    }
  }
  expect(validatePreset(preset)).toBe(true)
})
```

**✅ Phase 3 (NEW):**
```javascript
test('validates preset has required fields', () => {
  const preset = {
    name: 'test',
    version: 3,           // ← Added version
    config: {
      globalCellSize: 30, // ← Phase 3 format
      invader: {
        rows: 4,
        golUpdateRate: 15  // ← Added update rate
      }
    }
  }
  expect(validatePreset(preset)).toBe(true)
})

test('rejects Phase 2 presets', () => {
  const phase2Preset = {
    name: 'old',
    config: {
      invader: {
        cellSize: 30  // ← Phase 2 format (should fail)
      }
    }
  }
  expect(validatePreset(phase2Preset)).toBe(false)
})
```

#### 3. Update Slider Tests

**❌ Phase 2 (OLD):**
```javascript
test('cell size slider updates player cellSize', () => {
  const slider = document.getElementById('playerCellSize')
  slider.value = 35
  slider.dispatchEvent(new Event('input'))

  expect(CONFIG.player.cellSize).toBe(35)  // ← Phase 2
})
```

**✅ Phase 3 (NEW):**
```javascript
test('cell size slider updates globalCellSize', () => {
  const slider = document.getElementById('globalCellSize')
  slider.value = 35
  slider.dispatchEvent(new Event('input'))

  expect(CONFIG.globalCellSize).toBe(35)  // ← Phase 3 global
})
```

#### 4. Update Entity Recreation Tests

**❌ Phase 2 (OLD):**
```javascript
test('changing cell size recreates entities', () => {
  const oldPlayer = player
  changeCellSize(35)  // Triggers recreation

  expect(player.cellSize).toBe(35)        // ← Phase 2
  expect(player.width).toBe(180)
  expect(player).not.toBe(oldPlayer)
})
```

**✅ Phase 3 (NEW):**
```javascript
test('changing globalCellSize recreates entities', () => {
  const oldPlayer = player
  changeCellSize(35)  // Triggers recreation

  expect(CONFIG.globalCellSize).toBe(35)  // ← Phase 3 global
  expect(player.width).toBe(210)          // ← Width recalculated (6 * 35)
  expect(player).not.toBe(oldPlayer)
})
```

---

## 🟡 Priority 1: Fix Renderer Tests (2 hours)

### Affected Files
- `tests/rendering/test_SimpleGradientRenderer.js` (32 failures)

### Root Cause
1. Mock path mismatches
2. Tests pass `entity.cellSize` to `renderMaskedGrid()`

### Migration Steps

#### 1. Update renderMaskedGrid() Calls

**❌ Phase 2 (OLD):**
```javascript
test('renderMaskedGrid uses entity cellSize', () => {
  const entity = {
    x: 100,
    y: 200,
    cellSize: 30,  // ← Phase 2
    gol: mockGoLEngine
  }

  renderer.renderMaskedGrid(
    entity.gol,
    entity.x,
    entity.y,
    entity.cellSize,  // ← Phase 2
    mockGradient
  )

  expect(p5Mock.rect).toHaveBeenCalledWith(100, 200, 30, 30)
})
```

**✅ Phase 3 (NEW):**
```javascript
test('renderMaskedGrid uses global cellSize', () => {
  const CONFIG = { globalCellSize: 30 }  // ← Phase 3 global
  const entity = {
    x: 100,
    y: 200,
    gol: mockGoLEngine  // ← No cellSize property
  }

  renderer.renderMaskedGrid(
    entity.gol,
    entity.x,
    entity.y,
    CONFIG.globalCellSize,  // ← Phase 3 global
    mockGradient
  )

  expect(p5Mock.rect).toHaveBeenCalledWith(100, 200, 30, 30)
})
```

#### 2. Update Mock Paths

**❌ OLD:**
```javascript
vi.mock('../../src/rendering/SimpleGradientRenderer.js', () => ({
  // Mock implementation
}))
```

**✅ NEW:**
```javascript
// Check actual file location first
vi.mock('../../src/rendering/SimpleGradientRenderer.js', () => ({
  SimpleGradientRenderer: vi.fn().mockImplementation(() => ({
    renderMaskedGrid: vi.fn(),
    updateAnimation: vi.fn(),
    getGradientColor: vi.fn().mockReturnValue([66, 133, 244])
  }))
}))
```

---

## 🟢 Priority 2: Fix Validator Tests (1 hour)

### Affected Files
- `tests/validation/test_GoLValidator.js` (3 failures)

### Root Cause
Edge case handling for Phase 3 format

### Migration Steps

#### 1. Update Format Validation

**❌ Phase 2 (OLD):**
```javascript
test('validates entity has required GoL properties', () => {
  const entity = {
    cellSize: 30,
    gol: mockGoLEngine
  }
  expect(validateEntity(entity)).toBe(true)
})
```

**✅ Phase 3 (NEW):**
```javascript
test('validates entity has required GoL properties', () => {
  const entity = {
    gol: mockGoLEngine,
    // No cellSize required in Phase 3
  }
  const config = {
    globalCellSize: 30
  }
  expect(validateEntity(entity, config)).toBe(true)
})

test('rejects Phase 2 entities with cellSize', () => {
  const phase2Entity = {
    cellSize: 30,  // ← Should be rejected
    gol: mockGoLEngine
  }
  expect(validateEntity(phase2Entity)).toBe(false)
})
```

---

## 📊 Migration Checklist

### Code Changes

- [ ] **1. CONFIG Objects** (15 affected files)
  - [ ] Move `entity.cellSize` to `CONFIG.globalCellSize`
  - [ ] Add `entity.golUpdateRate` properties
  - [ ] Remove per-entity `cellSize` properties

- [ ] **2. Render Calls** (23 affected files)
  - [ ] Change `entity.cellSize` to `CONFIG.globalCellSize`
  - [ ] Update `renderMaskedGrid()` fourth parameter

- [ ] **3. Entity Creation** (8 affected files)
  - [ ] Update `width/height` calculations to use `CONFIG.globalCellSize`
  - [ ] Remove `cellSize` from entity objects
  - [ ] Add `golUpdateRate` to GoLEngine constructor calls

### Test Changes

- [ ] **4. Mock CONFIG Objects** (17 test files)
  - [ ] Add `globalCellSize` at top level
  - [ ] Remove `cellSize` from entity configs
  - [ ] Add `golUpdateRate` properties

- [ ] **5. Test Assertions** (52 tests)
  - [ ] Change `entity.cellSize` assertions to `CONFIG.globalCellSize`
  - [ ] Update width/height expected values
  - [ ] Add Phase 3 format validation tests

- [ ] **6. Mock Paths** (5 test files)
  - [ ] Verify mock import paths match actual file locations
  - [ ] Update relative paths if files moved

---

## 🔍 Before/After Examples

### Example 1: Space Invaders CONFIG

**❌ Phase 2 (OLD):**
```javascript
const CONFIG = {
  width: 1200,
  height: 1920,
  ui: { /* ... */ },
  invader: {
    cellSize: 30,       // ← Per-entity
    rows: 4,
    cols: 4,
    moveInterval: 30,
    speed: 45
  },
  player: {
    cellSize: 30,       // ← Per-entity
    speed: 18,
    shootCooldown: 15
  },
  bullet: {
    cellSize: 30,       // ← Per-entity
    speed: -8
  }
}
```

**✅ Phase 3 (NEW):**
```javascript
const CONFIG = {
  width: 1200,
  height: 1920,
  globalCellSize: 30, // ← Global (shared by all)
  ui: { /* ... */ },
  invader: {
    rows: 4,
    cols: 4,
    moveInterval: 30,
    speed: 45,
    golUpdateRate: 15   // ← Added
  },
  player: {
    speed: 18,
    shootCooldown: 15,
    golUpdateRate: 12   // ← Added
  },
  bullet: {
    speed: -8,
    golUpdateRate: 0    // ← Added
  }
}
```

### Example 2: Entity Creation

**❌ Phase 2 (OLD):**
```javascript
function createPlayer() {
  player = {
    x: CONFIG.width / 2,
    y: CONFIG.height - 300,
    width: 180,
    height: 180,
    cellSize: CONFIG.player.cellSize,  // ← Per-entity
    gol: new GoLEngine(6, 6, 12),
    gradient: GRADIENT_PRESETS.PLAYER
  }
  seedRadialDensity(player.gol, 0.85, 0.0)
}
```

**✅ Phase 3 (NEW):**
```javascript
function createPlayer() {
  player = {
    x: CONFIG.width / 2,
    y: CONFIG.height - 300,
    width: 180,
    height: 180,
    // ← No cellSize property
    gol: new GoLEngine(6, 6, CONFIG.player.golUpdateRate),  // ← Use golUpdateRate
    gradient: GRADIENT_PRESETS.PLAYER
  }
  seedRadialDensity(player.gol, 0.85, 0.0)
}
```

### Example 3: Rendering

**❌ Phase 2 (OLD):**
```javascript
function renderGame() {
  // Render player
  maskedRenderer.renderMaskedGrid(
    player.gol,
    player.x,
    player.y,
    player.cellSize,  // ← Per-entity
    player.gradient
  )

  // Render enemies
  for (let enemy of enemies) {
    maskedRenderer.renderMaskedGrid(
      enemy.gol,
      enemy.x,
      enemy.y,
      enemy.cellSize,  // ← Per-entity
      enemy.gradient
    )
  }
}
```

**✅ Phase 3 (NEW):**
```javascript
function renderGame() {
  // Render player
  maskedRenderer.renderMaskedGrid(
    player.gol,
    player.x,
    player.y,
    CONFIG.globalCellSize,  // ← Global
    player.gradient
  )

  // Render enemies
  for (let enemy of enemies) {
    maskedRenderer.renderMaskedGrid(
      enemy.gol,
      enemy.x,
      enemy.y,
      CONFIG.globalCellSize,  // ← Global (same for all)
      enemy.gradient
    )
  }
}
```

### Example 4: Debug Interface Preset

**❌ Phase 2 (OLD):**
```json
{
  "name": "easy",
  "version": 2,
  "config": {
    "invader": {
      "cellSize": 35,
      "rows": 2,
      "cols": 6,
      "moveInterval": 45
    },
    "player": {
      "cellSize": 35,
      "speed": 25
    }
  }
}
```

**✅ Phase 3 (NEW):**
```json
{
  "name": "easy",
  "version": 3,
  "config": {
    "globalCellSize": 35,
    "invader": {
      "rows": 2,
      "cols": 6,
      "moveInterval": 45,
      "golUpdateRate": 15
    },
    "player": {
      "speed": 25,
      "golUpdateRate": 12
    }
  }
}
```

---

## 🛠️ Migration Tools

### Search & Replace Patterns

**1. Find all entity.cellSize references:**
```bash
cd LifeArcade
grep -r "\.cellSize" tests/ src/ --include="*.js"
```

**2. Find all renderMaskedGrid calls:**
```bash
grep -r "renderMaskedGrid" tests/ src/ --include="*.js"
```

**3. Find all CONFIG mocks:**
```bash
grep -r "const mockConfig" tests/ --include="*.js"
```

### Automated Regex Replace (VS Code)

**Find:**
```regex
renderMaskedGrid\((\w+)\.gol,\s*(\w+)\.x,\s*(\w+)\.y,\s*(\w+)\.cellSize
```

**Replace:**
```regex
renderMaskedGrid($1.gol, $2.x, $3.y, CONFIG.globalCellSize
```

---

## ✅ Validation Commands

### 1. Run Tests After Each Priority

```bash
# After P0 (Debug Interface)
npm test -- debug

# After P1 (Renderer)
npm test -- rendering

# After P2 (Validators)
npm test -- validation

# All tests
npm test
```

### 2. Check for Remaining Phase 2 Format

```bash
# Should return 0 results in src/
grep -r "\.cellSize" src/ --include="*.js" | wc -l

# Should return 0 results in tests/ (except negative tests)
grep -r "entity\.cellSize" tests/ --include="*.js" | wc -l
```

### 3. Verify Phase 3 Format

```bash
# Should find globalCellSize in all game files
grep -r "globalCellSize" public/games/*.js | wc -l
# Expected: 4 (one per game)

# Should find version: 3 in all preset files
grep -r '"version": 3' presets/ | wc -l
# Expected: 16 (4 games × 4 presets)
```

---

## 📈 Progress Tracking

### Current Status (2025-11-18)

| Priority | Files | Tests | Status | Est. Time |
|----------|-------|-------|--------|-----------|
| **P0** | 2 | 17 | ⚠️ Pending | 4 hours |
| **P1** | 1 | 32 | ⚠️ Pending | 2 hours |
| **P2** | 1 | 3 | ⚠️ Pending | 1 hour |
| **Total** | **4** | **52** | **0% Complete** | **7 hours** |

### Completion Criteria

- ✅ All 52 failing tests pass
- ✅ No `entity.cellSize` references in src/
- ✅ All games use `CONFIG.globalCellSize`
- ✅ All tests use Phase 3 format
- ✅ Phase 2 presets rejected by validation
- ✅ `npm test` returns 100% passing

---

## 🎯 Summary

**Phase 3 Migration** unifies cell size configuration to eliminate redundancy and improve maintainability.

**Key Changes:**
1. Move `cellSize` from entities to `CONFIG.globalCellSize`
2. Add `golUpdateRate` to entity configs
3. Update all render calls to use global size
4. Add version validation to reject Phase 2 formats

**Benefits:**
- Single source of truth for cell size
- Easier to adjust visual scale globally
- Cleaner entity definitions
- Consistent appearance across all entities

**Effort:** 7 hours to migrate all 52 failing tests to Phase 3 format.

---

**Document Status:** ✅ Complete
**Version:** 1.0
**Last Updated:** 2025-11-18
