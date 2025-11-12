# Lightweight Template Proposal - For Vibe Coding Games

> **Context:** Other developer generates games with vibe coding (Gemini/Claude). Games are standalone files generated from simple prompts.
>
> **Problem:** No consistency in UI, scoring, GoL usage. Need light structure, not heavy framework.
>
> **Solution:** Template + validation, not architecture.

---

## 🎯 What We Actually Need

### NOT This (Too Complex)
❌ Full framework with Entity.js, Component system, JSON schemas
❌ 550 lines of architecture code
❌ Rigid structure that LLM must follow

### But This (Just Right)
✅ **Game template** - Copy-paste starting point for vibe coding
✅ **Shared utilities** - GoL engine, collision helpers (import if needed)
✅ **Validation tools** - Check games follow GoL rules + brand guidelines
✅ **UI/Score standards** - Consistent look across games

---

## 📦 Proposed Structure (Super Light)

```
src/
├── core/
│   ├── GoLEngine.js           ✅ DONE - Import in any game
│   └── Collision.js           ⭐ NEW - Simple helpers (50 lines)
├── rendering/
│   ├── CellRenderer.js        ✅ DONE - Batch rendering
│   └── GoLBackground.js       ✅ DONE - Background
├── template/
│   └── game-template.js       ⭐ NEW - Starting point for vibe coding (100 lines)
├── validation/
│   ├── gol-validator.js       ⭐ NEW - Check B3/S23 rules (50 lines)
│   └── ui-validator.js        ⭐ NEW - Check UI consistency (30 lines)
└── games/
    ├── space-invaders-ca.js   ⭐ NEW - Vibe coded game (standalone)
    ├── dino-runner.js         ⭐ NEW - Vibe coded game (standalone)
    ├── pong-gol.js            ⭐ NEW - Vibe coded game (standalone)
    └── ... (each game is 200-300 lines, self-contained)
```

**Total framework code:** ~230 lines (template + validation)

---

## 🎮 Game Template (Starting Point for Vibe Coding)

**Purpose:** LLM starts from this template, modifies as needed

```javascript
/**
 * Game Template for Vibe Coding
 *
 * Copy this file and modify for your game.
 * LLM can generate games based on this structure.
 */

import { GoLEngine } from '../core/GoLEngine.js'
import { GoLBackground } from '../rendering/GoLBackground.js'

// ============================================
// GAME CONFIG (Modify this)
// ============================================
const GAME_CONFIG = {
  name: 'My Game',
  width: 800,
  height: 600,

  // UI Style (Google Brand Guidelines)
  ui: {
    font: 'Google Sans, sans-serif',
    scoreColor: '#5f6368',  // Google Gray 700
    backgroundColor: '#ffffff',
    textSize: 16
  },

  // Physics
  physics: {
    gravity: 0.6,
    groundY: 550
  }
}

// ============================================
// GAME STATE
// ============================================
let gameState = {
  score: 0,
  lives: 3,
  level: 1,
  state: 'PLAYING'  // MENU, PLAYING, PAUSED, GAMEOVER
}

// ============================================
// ENTITIES (Add your game objects here)
// ============================================
let player = {
  x: 100,
  y: 400,
  vx: 0,
  vy: 0,
  // Add GoL engine if needed:
  // gol: new GoLEngine(20, 20, 12)
}

let enemies = []
let bullets = []

// ============================================
// BACKGROUND (GoL - Always Present)
// ============================================
let background

// ============================================
// SETUP
// ============================================
function setup() {
  createCanvas(GAME_CONFIG.width, GAME_CONFIG.height)
  frameRate(60)

  // Initialize GoL background (REQUIRED)
  background = new GoLBackground(
    GAME_CONFIG.width,
    GAME_CONFIG.height,
    10  // cell size
  )
  background.randomSeed(0.3)

  // Initialize your game objects here
  initGame()
}

function initGame() {
  // TODO: Initialize player, enemies, etc.
}

// ============================================
// UPDATE LOOP
// ============================================
function draw() {
  // Update background (REQUIRED)
  background.update()

  // Update based on state
  if (gameState.state === 'PLAYING') {
    updateGame()
  }

  // Render
  render()
}

function updateGame() {
  // TODO: Update player
  // TODO: Update enemies
  // TODO: Check collisions
  // TODO: Update score
}

// ============================================
// RENDER
// ============================================
function render() {
  // Clear screen
  background(GAME_CONFIG.ui.backgroundColor)

  // Render GoL background (REQUIRED)
  background.render()

  // Render your game objects
  renderGame()

  // Render UI (REQUIRED - consistent across games)
  renderUI()
}

function renderGame() {
  // TODO: Render player, enemies, bullets, etc.
}

function renderUI() {
  // Standard UI (REQUIRED)
  fill(GAME_CONFIG.ui.scoreColor)
  textFont(GAME_CONFIG.ui.font)
  textSize(GAME_CONFIG.ui.textSize)
  textAlign(LEFT, TOP)

  text(`Score: ${gameState.score}`, 20, 20)
  text(`Lives: ${gameState.lives}`, 20, 45)

  if (gameState.state === 'GAMEOVER') {
    textAlign(CENTER, CENTER)
    textSize(48)
    text('GAME OVER', width/2, height/2)
  }
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  // TODO: Handle input
}
```

**Size:** ~100 lines
**Usage:** LLM copies this and generates game logic

---

## 🔍 Validation Tools

### 1. GoL Validator (50 lines)

**Purpose:** Check that game uses B3/S23 rules correctly

```javascript
/**
 * GoL Validator - checks if games follow Conway's rules
 */
export class GoLValidator {
  /**
   * Validate a game file
   */
  static validate(gameCode) {
    const errors = []

    // Check 1: Uses GoLEngine
    if (!gameCode.includes('GoLEngine')) {
      errors.push('Game must import and use GoLEngine for visuals')
    }

    // Check 2: Has GoL background
    if (!gameCode.includes('GoLBackground')) {
      errors.push('Game must have GoL background')
    }

    // Check 3: No hardcoded sprites (must be procedural)
    if (gameCode.includes('loadImage') || gameCode.includes('.png') || gameCode.includes('.jpg')) {
      errors.push('Visual must be procedural GoL cells, not static images')
    }

    // Check 4: B3/S23 rules not modified
    if (gameCode.includes('neighbors !== 3') && !gameCode.includes('B3/S23')) {
      errors.push('GoL rules appear to be modified. Must follow B3/S23.')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }

  /**
   * Runtime validation - check GoL evolves correctly
   */
  static validateRuntime(golEngine) {
    // Inject known pattern (BLINKER)
    golEngine.clearGrid()
    golEngine.setCell(5, 5, 1)
    golEngine.setCell(5, 6, 1)
    golEngine.setCell(5, 7, 1)

    // Evolve 1 generation
    golEngine.update()

    // Check horizontal blinker
    const isHorizontal = (
      golEngine.getCell(4, 6) === 1 &&
      golEngine.getCell(5, 6) === 1 &&
      golEngine.getCell(6, 6) === 1 &&
      golEngine.getCell(5, 5) === 0 &&
      golEngine.getCell(5, 7) === 0
    )

    if (!isHorizontal) {
      return {
        valid: false,
        error: 'GoL engine does not follow B3/S23 rules (BLINKER test failed)'
      }
    }

    return { valid: true }
  }
}
```

### 2. UI Validator (30 lines)

**Purpose:** Check consistent UI across games

```javascript
/**
 * UI Validator - checks brand guidelines compliance
 */
export class UIValidator {
  static validate(gameCode) {
    const errors = []

    // Check 1: Score display
    if (!gameCode.includes('Score:') && !gameCode.includes('score')) {
      errors.push('Game must display score')
    }

    // Check 2: Google brand colors
    const brandColors = ['#5f6368', '#ffffff', '#000000']
    const hasGoogleColors = brandColors.some(color => gameCode.includes(color))
    if (!hasGoogleColors) {
      errors.push('UI should use Google brand colors')
    }

    // Check 3: Minimal UI
    if (gameCode.includes('gradient') && gameCode.split('gradient').length > 5) {
      errors.push('UI should be minimal, not too many gradients')
    }

    return {
      valid: errors.length === 0,
      errors
    }
  }
}
```

---

## 📋 Vibe Coding Workflow

### Step 1: Developer Uses Template
```bash
cp src/template/game-template.js src/games/my-new-game.js
```

### Step 2: Generate Game with LLM

**Prompt to Gemini/Claude:**
```
Using the game template at src/template/game-template.js as a starting point,
create a [GAME TYPE] game with these requirements:

Game: Space Invaders with Cellular Automata aliens
Visual: Each alien is a small GoL grid with animated gradients
Colors: Use Google brand palette (blue, red, green, yellow, white)
UI: Minimal, classy, aligned with Google brand guidelines
GoL: All visuals must use Conway's B3/S23 rules
Background: Pure GoL simulation (already in template)

Keep the game self-contained in one file.
Import GoLEngine for alien visuals.
Follow the template structure for UI and scoring.
```

### Step 3: Validate Generated Game
```bash
npm run validate src/games/my-new-game.js
```

Output:
```
✅ GoL validation passed
✅ UI validation passed
✅ Runtime GoL test passed (BLINKER oscillates correctly)
✅ Game ready for installation
```

### Step 4: (Optional) Manual Review
- Play game for 2 minutes
- Check 60fps performance
- Verify GoL looks organic
- Test controls

---

## 🛠️ Shared Utilities (Import if Needed)

### Collision.js (50 lines)
```javascript
/**
 * Simple collision helpers - import if needed
 */
export const Collision = {
  circleCircle(x1, y1, r1, x2, y2, r2) {
    const dx = x2 - x1
    const dy = y2 - y1
    const dist = Math.sqrt(dx*dx + dy*dy)
    return dist < (r1 + r2)
  },

  rectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
    return (
      x1 < x2 + w2 &&
      x1 + w1 > x2 &&
      y1 < y2 + h2 &&
      y1 + h1 > y2
    )
  },

  pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh
  }
}
```

**Usage in vibe coded game:**
```javascript
import { Collision } from '../core/Collision.js'

// Check bullet hits enemy
if (Collision.circleCircle(bullet.x, bullet.y, 5, enemy.x, enemy.y, 20)) {
  // Hit!
}
```

---

## 📊 Comparison: Framework vs Template

### My Previous Proposal (Framework)
- **Code:** 550 lines (Game.js, Entity.js, Utils.js, Input.js)
- **Per game:** 150 lines + JSON config
- **Structure:** Rigid (extends Game, uses Entity class)
- **LLM friendly:** ❌ Must understand architecture
- **Vibe coding:** ❌ Doesn't fit workflow

### This Proposal (Template)
- **Code:** 230 lines (template + validation)
- **Per game:** 200-300 lines (standalone)
- **Structure:** Flexible (copy-paste-modify)
- **LLM friendly:** ✅ Simple starting point
- **Vibe coding:** ✅ Fits perfectly

---

## 🎯 What This Achieves

### For Installation (3 Weeks)
✅ **Consistency:** All games have same UI/scoring style
✅ **Quality:** Validation ensures GoL rules followed
✅ **Speed:** Vibe coding generates games in minutes
✅ **6-8 games:** Easy to hit target with parallel development

### For Future Web Platform (LLM Generation)
✅ **Template-based:** LLM starts from template
✅ **Validation:** Auto-check generated games
✅ **Self-contained:** Each game is one file
✅ **Minimal context:** LLM only needs template + prompt

---

## 🚀 Implementation Plan (Revised)

### Week 1 (Template + Validation + 3 games)

**Day 1:**
- Create game-template.js (100 lines)
- Create Collision.js helpers (50 lines)
- Document template usage

**Day 2:**
- Create GoLValidator (50 lines)
- Create UIValidator (30 lines)
- Test validation on Phase 1 code

**Day 3-5:**
- Generate 3 games with vibe coding:
  - Space Invaders CA (using template)
  - Dino Runner (using template)
  - Pong GoL (using template)
- Validate each game
- Fix issues, iterate

**Deliverable:** Template + validation + 3 games

---

### Week 2 (3-5 more games + docs)

**Day 6-10:**
- Generate 3-5 more games with vibe coding
- Each game takes 1-2 hours with LLM
- Validate and test each

**Day 11-12:**
- Create prompt guide for LLM generation
- Document validation workflow
- Write game submission guidelines
- Prepare for installation

**Deliverable:** 6-8 games + docs for web platform

---

## 📝 Example Prompts for Vibe Coding

### Space Invaders CA (Your Example)
```
Create a simple Space Invaders game but instead of aliens you shoot evolving Cellular Automata.
For each column of cells use an animated gradient with 4 to 8 control points.
Use this RGB color palette for the gradients:
(49, 134, 255), (252, 65, 61), (0, 175, 87), (255, 204, 0), (255, 255, 255)
The cells should work as a mask that reveals the gradients behind.
Use a white background. Keep the UI elements minimal, classy and aligned with Google brand guidelines.

IMPORTANT: Use the game template at src/template/game-template.js as your starting point.
Import GoLEngine from src/core/GoLEngine.js for alien visuals.
Each alien should be a small GoL grid (10x10 cells) following B3/S23 rules.
```

### Dino Runner
```
Create a Chrome Dino-style endless runner using Conway's Game of Life aesthetic.
Player: Small dinosaur made of GoL cells with life force (never dies completely)
Obstacles: Cacti that are static cell patterns (visual only, no evolution)
Background: Pure GoL simulation (use GoLBackground from template)
Colors: Google brand palette (minimal, clean)
UI: Score counter, lives display, game over screen

Use src/template/game-template.js as base.
Player visuals use GoLEngine with Modified strategy (life force enabled).
```

### Breakout GoL
```
Create a Breakout/Arkanoid game where bricks are Pure GoL patterns.
Paddle: Modified GoL with life force
Ball: Small GoL grid (Glider pattern)
Bricks: Each brick is a different GoL pattern (BLOCK, BEEHIVE, BLINKER, etc)
When ball hits brick, brick explodes (cells scatter)
Colors: Colorful gradients like the Space Invaders example
UI: Google brand minimal style

Start from src/template/game-template.js.
Use GoLEngine for all visuals.
```

---

## 💡 Key Insights

### Why This Works Better

1. **Matches vibe coding workflow**
   - LLM generates standalone files
   - Template is copy-paste friendly
   - No complex architecture to understand

2. **Validation layer = quality control**
   - Ensures GoL rules followed
   - Checks UI consistency
   - Runtime tests (BLINKER validation)

3. **Minimal overhead**
   - Only 230 lines of "framework"
   - Rest is generated per-game
   - No architectural coupling

4. **Scalable to web platform**
   - Same template for LLM generation
   - Same validation for user-generated games
   - Simple prompt → validate → play workflow

### What We Cut (Good Riddance)

❌ Entity.js (200 lines) - not needed for vibe coding
❌ Component system - over-engineering
❌ JSON configs - LLM generates full code anyway
❌ Systems architecture - each game is standalone
❌ BaseGame class - template is enough

### What We Keep (Essential)

✅ GoLEngine (Phase 1) - reusable GoL simulation
✅ Template - starting point for consistency
✅ Validation - quality control
✅ Shared utilities - optional helpers

---

## 🎯 Final Recommendation

**Go with Template + Validation approach:**

1. **Lightweight:** Only ~230 lines of "framework"
2. **Vibe coding friendly:** Works with your workflow
3. **Fast:** Generate 6-8 games in 2 weeks
4. **Quality:** Validation ensures standards
5. **Future-proof:** Same template for web platform

### Next Steps

1. ✅ **Create game-template.js** (today)
2. ✅ **Create validation tools** (tomorrow)
3. ✅ **Generate first game with vibe coding** (validate workflow)
4. ✅ **Iterate rapidly** (3-5 games per week)

**Should I start creating the template now?** 🚀

---

## ❓ Questions

1. Does this match your vision better?
2. Should I create the template.js now?
3. Any modifications to the validation rules?
4. Should we test with one vibe coded game first?
