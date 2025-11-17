# Debug Interface Feature - Implementation Prompt

**Date:** 2025-11-17
**Status:** Planning Phase (NOT IMPLEMENTED)
**Priority:** P1 - Essential for game tuning and rapid iteration

---

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

> **Multi-Phase Implementation Strategy**
>
> This feature is divided into 4 sequential phases to manage complexity:
> - **Phase 1 (Core Debug System):** URL detection, sidebar UI, parameter binding
> - **Phase 2 (Appearance System):** Three appearance modes (Modified GoL, Static, Density)
> - **Phase 3 (Preset System):** Save/load/delete presets, localStorage integration
> - **Phase 4 (Polish & Testing):** Styling, keyboard shortcuts, documentation
>
> **CRITICAL WORKFLOW:**
> 1. Implement phase
> 2. Run manual testing for that phase
> 3. **STOP and provide manual testing guide to user**
> 4. **WAIT for user approval before proceeding to next phase**
> 5. Only after user confirms "✅ Phase N approved", proceed to Phase N+1

---

## 1. Feature Description and Problem Solving

**Feature:** Implement an advanced debug interface that allows rapid iteration on game design, difficulty, and aesthetics across all 4 arcade games (Space Invaders, Dino Runner, Breakout, Flappy Bird).

**Problem it's solving:**
- Game designers need to tune difficulty without modifying source code
- Visual artists need to experiment with GoL appearances in real-time
- Developers need to test edge cases with extreme parameter values
- Team needs to share configurations via presets
- Installation will have ONE final difficulty mode (presets are for development only)

---

## 2. User Story

```
As a game designer working on the LifeArcade installation,
I need a debug interface to modify game parameters in real-time,
So that I can rapidly iterate on difficulty, pacing, and visual aesthetics without restarting or editing code.

Acceptance Criteria (All Phases):
- [ ] Debug mode activates via ?debug=true URL parameter
- [ ] Sidebar panel visible by default when debug mode enabled
- [ ] 15-20 parameters per game exposed with live updates
- [ ] Three appearance modes work correctly (Modified GoL, Static patterns, Density presets)
- [ ] Preset system can save/load/delete/export/import configurations
- [ ] Changes apply immediately without page reload
- [ ] UI follows Google brand colors and is non-intrusive
- [ ] Zero impact on games when debug mode disabled
- [ ] All 4 games support debug interface
- [ ] Documentation complete for designers/developers
```

---

## 3. Solution and Approach

### Phase Goals

**Phase 1 (Core Debug System) - 8-10 hours:**
1. Create debug module with URL parameter detection
2. Build sidebar UI with control groups
3. Implement parameter binding system (sliders → CONFIG)
4. Test with Space Invaders as reference implementation

**Phase 2 (Appearance System) - 4-6 hours:**
5. Implement appearance override system with 3 modes
6. Create dropdown UI for pattern/density selection
7. Test all appearance combinations
8. Replicate to remaining 3 games

**Phase 3 (Preset System) - 4-5 hours:**
9. Implement localStorage save/load/delete
10. Create built-in presets (Default, Easy, Hard, Chaos)
11. Add export/import JSON functionality
12. Test preset persistence across sessions

**Phase 4 (Polish & Testing) - 2-3 hours:**
13. Apply Google brand color styling
14. Add keyboard shortcuts (ESC, R)
15. Write user documentation
16. Create example preset files

**Why this approach:**
- **Foundation first:** Core parameter system must work before adding complexity
- **Validate early:** Test appearance system on one game before replicating
- **Incremental features:** Preset system builds on working parameter system
- **Test-driven:** Manual testing at each phase before proceeding

**Total Estimated Effort:** 18-24 hours

---

## 4. Relevant Files from Codebase

**Reference for architecture and standards:**
- `CLAUDE.md` - Complete development guidelines, GoL rules, p5.js conventions
- `docs/PROJECT_STATUS.md` - Current project state
- `public/games/space-invaders.js` - Reference game structure (CONFIG at lines 26-70)

**Files to create:**
```
LifeArcade/
├── src/debug/
│   ├── DebugInterface.js       # Main debug UI manager (NEW)
│   ├── DebugPresets.js         # Preset system logic (NEW)
│   ├── DebugAppearance.js      # Appearance override system (NEW)
│   └── debug-styles.css        # Sidebar styling (NEW)
└── public/games/
    ├── space-invaders.js       # Add debug initialization (MODIFY)
    ├── dino-runner.js          # Add debug initialization (MODIFY)
    ├── breakout.js             # Add debug initialization (MODIFY)
    └── flappy-bird.js          # Add debug initialization (MODIFY)
```

**Modifications per game (minimal - 4 lines):**
```javascript
// Add to setup() function in each game
const urlParams = new URLSearchParams(window.location.search)
const debugMode = urlParams.get('debug') === 'true'
if (debugMode) {
  import('../src/debug/DebugInterface.js').then(module => {
    module.initDebugInterface(CONFIG, 'space-invaders')
  })
}
```

---

## 5. Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Search for p5.js global variable access
mcp__archon__rag_search_knowledge_base({
  query: "p5js global mode window access CONFIG",
  source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
  match_count: 5
})

// Step 2: Search for localStorage best practices
mcp__archon__rag_search_knowledge_base({
  query: "localStorage JSON preset save load",
  match_count: 5
})

// Step 3: Search for HTML sidebar UI patterns
mcp__archon__rag_search_code_examples({
  query: "HTML sidebar panel controls",
  match_count: 3
})
```

### Available Archon Knowledge Sources

| Source ID | Title | Words | Relevant For |
|-----------|-------|-------|--------------|
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Global mode, window access |
| `2f8c0a8c261af0d8` | Anthropic Algorithmic Art | ~50k | UI patterns, viewer.html |
| `22832de63c03f570` | Vite Documentation | 60k | Module imports, dynamic imports |

### Step 2: Consider Indexing Additional Sources (if needed)

**If Archon searches return insufficient results:**
- MDN Web API - localStorage: https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage
- HTML5 Range Input: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/range

**Note:** Only use external URLs if `rag_search_knowledge_base` queries return insufficient results.

---

## 6. Archon Task Management Integration

### CRITICAL: Use Archon MCP for ALL task management

**Before starting implementation:**

```javascript
// Project ID (from CLAUDE.md)
const PROJECT_ID = "9ebdf1e2-ed0a-422f-8941-98191481f305"

// 1. Create Phase 1 tasks
mcp__archon__manage_task({
  action: "create",
  project_id: PROJECT_ID,
  title: "Phase1: Create DebugInterface.js with sidebar HTML",
  description: `
Create src/debug/DebugInterface.js with:
- initDebugInterface(config, gameName) entry point
- Sidebar HTML structure (350px right panel)
- Control groups: Gameplay, Appearance, Visual
- Parameter binding: sliders → CONFIG updates
- Hide/show toggle functionality

Acceptance:
- Sidebar renders when ?debug=true
- Sliders update CONFIG values in real-time
- Game responds to parameter changes immediately
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "DebugInterface",
  task_order: 10
})

// 2. Create Phase 2 tasks
mcp__archon__manage_task({
  action: "create",
  project_id: PROJECT_ID,
  title: "Phase2: Implement appearance override system",
  description: `
Create src/debug/DebugAppearance.js with:
- Three appearance modes: Modified GoL, Static patterns, Density presets
- window.APPEARANCE_OVERRIDES global registry
- Override entity setup functions (player, enemies, bullets, particles)
- Dropdown UI for pattern selection

Acceptance:
- Static patterns freeze GoL evolution (updateRate = 0)
- Density presets reseed with specified density
- Dropdowns populate with 14 canonical patterns
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "DebugInterface",
  task_order: 20
})

// 3. Create Phase 3 tasks
mcp__archon__manage_task({
  action: "create",
  project_id: PROJECT_ID,
  title: "Phase3: Implement preset system with localStorage",
  description: `
Create src/debug/DebugPresets.js with:
- localStorage save/load/delete functions
- Built-in presets: Default, Easy, Hard, Chaos
- Export/import JSON functionality
- Preset dropdown UI integration

Storage key format: "debug_presets_{gameName}"
Preset structure: { name, timestamp, config, appearances }

Acceptance:
- Presets persist across page reloads
- Export creates downloadable JSON file
- Import loads JSON and updates UI
- Delete removes preset from localStorage
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "DebugInterface",
  task_order: 30
})

// 4. Create Phase 4 tasks
mcp__archon__manage_task({
  action: "create",
  project_id: PROJECT_ID,
  title: "Phase4: Polish, styling, and documentation",
  description: `
Final polish:
- Apply Google brand colors to sidebar (#4285F4 accents)
- Add keyboard shortcuts (ESC to toggle, R to reset)
- Write docs/DEBUG_INTERFACE_USAGE.md for designers
- Create example preset JSON files in docs/presets/

Acceptance:
- Sidebar matches Google brand aesthetic
- ESC key toggles panel visibility
- R key resets to default preset
- Documentation explains all controls
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "DebugInterface",
  task_order: 40
})

// 5. As you work, update task status
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "doing"
})

// 6. When complete, mark as done
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "done"
})

// 7. Query tasks to track progress
mcp__archon__find_tasks({
  project_id: PROJECT_ID,
  filter_by: "feature",
  filter_value: "DebugInterface"
})
```

**Task Granularity Guidelines:**
- Each phase = 1 task (4 tasks total)
- Each task should be 2-10 hours of work
- Tasks should have clear, testable acceptance criteria
- Use `feature` field to group: "DebugInterface"

---

## 1. Executive Summary

### Purpose
Create an advanced debug interface that allows rapid iteration on game design, difficulty, and aesthetics across all 4 arcade games (Space Invaders, Dino Runner, Breakout, Flappy Bird). This will enable quick tuning of gameplay parameters and visual appearance without modifying source code.

### Key Features
- **15-20 parameters per game** exposed for real-time modification
- **Three appearance modes:** Modified GoL (current system), Static GoL patterns, Density presets
- **URL parameter activation:** `?debug=true` to enable interface
- **Preset system:** Save/load configurations via localStorage
- **Sidebar interface:** Non-intrusive panel inspired by algorithmic-art examples

### Target Users
- Game designers tuning difficulty and pacing
- Visual artists experimenting with aesthetics
- Developers testing edge cases and balancing

---

## 2. Architecture Design

### Activation Method

**URL Parameter Detection:**
```javascript
// Add to each game's setup() function
const urlParams = new URLSearchParams(window.location.search)
const debugMode = urlParams.get('debug') === 'true'

if (debugMode) {
  initDebugInterface()
}
```

**Example URLs:**
```
http://localhost:5174/games/space-invaders.html?debug=true
http://localhost:5174/games/dino-runner.html?debug=true
http://localhost:5174/games/breakout.html?debug=true
http://localhost:5174/games/flappy-bird.html?debug=true
```

### UI Layout Architecture

**Sidebar Panel Design (based on algorithmic-art viewer.html template):**

```html
<div id="debug-panel" style="position: fixed; right: 0; top: 0; width: 350px; height: 100vh;
     background: rgba(255,255,255,0.95); overflow-y: auto;
     box-shadow: -2px 0 10px rgba(0,0,0,0.1); z-index: 9999;">

  <!-- Header -->
  <div class="debug-header" style="padding: 20px; border-bottom: 2px solid #e0e0e0;">
    <h2>Debug Controls</h2>
    <button onclick="toggleDebugPanel()">Hide/Show</button>
  </div>

  <!-- Preset Management -->
  <div class="preset-section" style="padding: 15px; border-bottom: 1px solid #e0e0e0;">
    <h3>Presets</h3>
    <select id="preset-selector" onchange="loadPreset(this.value)">
      <option value="">-- Select Preset --</option>
      <option value="default">Default</option>
      <option value="easy">Easy Mode</option>
      <option value="hard">Hard Mode</option>
      <option value="chaos">Chaos Mode</option>
    </select>
    <button onclick="saveCurrentPreset()">Save Current</button>
    <input type="text" id="preset-name" placeholder="New preset name">
    <button onclick="deletePreset()">Delete</button>
  </div>

  <!-- Parameter Controls -->
  <div class="controls-section" style="padding: 15px;">

    <!-- Gameplay Section -->
    <div class="control-group">
      <h3>Gameplay</h3>

      <label>Player Speed</label>
      <input type="range" id="playerSpeed" min="5" max="50" step="1"
             oninput="updateParam('playerSpeed', this.value)">
      <span class="value-display" id="playerSpeed-value">18</span>

      <!-- More controls... -->
    </div>

    <!-- Entity Appearance Section -->
    <div class="control-group">
      <h3>Entity Appearances</h3>

      <label>Player Appearance</label>
      <select id="playerAppearance" onchange="updateAppearance('player', this.value)">
        <option value="modified-gol">Modified GoL (Current)</option>
        <option value="static-blinker">Static: Blinker</option>
        <option value="static-toad">Static: Toad</option>
        <option value="static-glider">Static: Glider</option>
        <option value="density-high">Density: High (0.85)</option>
        <option value="density-medium">Density: Medium (0.65)</option>
        <option value="density-low">Density: Low (0.45)</option>
      </select>

      <!-- More appearance controls... -->
    </div>

    <!-- Visual/Performance Section -->
    <div class="control-group">
      <h3>Visual & Performance</h3>

      <label>GoL Update Rate (fps)</label>
      <input type="range" id="golUpdateRate" min="5" max="30" step="1"
             oninput="updateParam('golUpdateRate', this.value)">
      <span class="value-display" id="golUpdateRate-value">12</span>

      <!-- More visual controls... -->
    </div>

  </div>

  <!-- Reset & Export -->
  <div class="actions-section" style="padding: 15px; border-top: 2px solid #e0e0e0;">
    <button onclick="resetToDefaults()">Reset to Defaults</button>
    <button onclick="exportConfig()">Export Config JSON</button>
    <button onclick="importConfig()">Import Config JSON</button>
  </div>

</div>
```

### Integration with Existing Games

**Minimal Code Changes Required:**

```javascript
// 1. Wrap CONFIG in mutable object (only if debug mode)
let CONFIG = {
  // ... existing config
}

if (debugMode) {
  window.DEBUG_CONFIG = CONFIG  // Expose for modification
  window.updateParam = (key, value) => {
    // Update CONFIG dynamically
    setNestedValue(CONFIG, key, parseFloat(value))
  }
}

// 2. Add appearance override system
if (debugMode) {
  window.overrideAppearance = (entityType, mode, pattern) => {
    // Override entity.gol setup logic
    switch(mode) {
      case 'static-pattern':
        entity.gol.setPattern(pattern, 0, 0)
        entity.gol.updateRate = 0  // Freeze evolution
        break
      case 'density-preset':
        seedRadialDensity(entity.gol, pattern.density, 0.0)
        break
      // ... other modes
    }
  }
}

// 3. No changes to game logic required (parameters read from CONFIG dynamically)
```

**Backward Compatibility:**
- Without `?debug=true`: Games run exactly as before (zero overhead)
- With `?debug=true`: Debug interface loads, parameters become mutable

---

## 3. Parameters Per Game

### 3.1 Space Invaders (17 parameters)

**File:** `public/games/space-invaders.js`
**CONFIG Location:** Lines 26-70

#### Gameplay Parameters (7)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `invader.cols` | 4 | 2-8 | Number of invader columns |
| `invader.rows` | 4 | 2-8 | Number of invader rows |
| `invader.moveInterval` | 30 | 10-90 | Frames between invader moves |
| `invader.speed` | 45 | 15-90 | Horizontal move distance (px) |
| `player.speed` | 18 | 6-36 | Player horizontal speed (px/frame) |
| `player.shootCooldown` | 15 | 5-45 | Frames between shots |
| `bullet.speed` | -8 | -3 to -15 | Bullet vertical speed (negative = up) |

#### Entity Sizes (4)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `invader.width` | 180 | 90-360 | Invader width (px) |
| `invader.height` | 180 | 90-360 | Invader height (px) |
| `player.width` | 180 | 90-360 | Player width (px) |
| `bullet.width` | 90 | 45-180 | Bullet width (px) |

#### Entity Appearances (5)
| Entity | Current Mode | Options |
|--------|--------------|---------|
| Player | Modified GoL | Modified GoL, Static (Blinker/Toad/Glider), Density (0.45/0.65/0.85) |
| Invaders | Modified GoL | Modified GoL, Static (Pulsar/LWSS/Beacon), Density (0.45/0.65/0.85) |
| Bullets | Visual Only | Visual Only, Static (Block/Tub/Boat), Density (0.60/0.75/0.90) |
| Explosions | Pure GoL | Pure GoL, Static (Blinker/Toad), Density (0.50/0.70/0.90) |

#### Visual Parameters (1)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `invader.gol.updateRate` | 15 | 5-30 | GoL evolution speed (fps) |

---

### 3.2 Dino Runner (16 parameters)

**File:** `public/games/dino-runner.js`
**CONFIG Location:** Lines 28-49

#### Gameplay Parameters (6)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `gravity` | 2.4 | 1.0-4.0 | Downward acceleration |
| `jumpForce` | -54 | -20 to -80 | Jump velocity (negative = up) |
| `obstacle.speed` | -27 | -10 to -50 | Obstacle scroll speed |
| `obstacle.spawnInterval` | 90 | 30-180 | Frames between spawns |
| `obstacle.minInterval` | 30 | 15-90 | Minimum spawn interval (ramps up) |
| `obstacle.speedIncrease` | 0.001 | 0-0.005 | Speed increment per frame |

#### Entity Sizes (3)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `player.width` | 240 | 120-360 | Player width (px) |
| `player.height` | 240 | 120-360 | Player height (px) |
| `obstacle.width` | varies | 60-360 | Obstacle width (depends on type) |

#### Entity Appearances (6)
| Entity | Current Mode | Options |
|--------|--------------|---------|
| Player | Modified GoL | Modified GoL, Static (Blinker/Toad/Beacon), Density (0.45/0.65/0.85) |
| Obstacles (small) | Visual Only | Visual Only, Static (Block/Tub), Density (0.60/0.80) |
| Obstacles (medium) | Visual Only | Visual Only, Static (Boat/Ship), Density (0.55/0.75) |
| Obstacles (tall) | Visual Only | Visual Only, Static (Loaf/Beehive), Density (0.50/0.70) |
| Explosions | Pure GoL | Pure GoL, Static (R-pentomino), Density (0.50/0.70) |

#### Visual Parameters (1)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `player.gol.updateRate` | 12 | 5-30 | GoL evolution speed (fps) |

---

### 3.3 Breakout (18 parameters)

**File:** `public/games/breakout.js`
**CONFIG Location:** Lines 29-62

#### Gameplay Parameters (8)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `paddle.speed` | 30 | 10-60 | Paddle horizontal speed (px/frame) |
| `ball.speed` | 18 | 6-36 | Ball base speed (px/frame) |
| `ball.maxAngle` | π/3 | π/6 to π/2 | Max bounce angle off paddle (radians) |
| `brick.rows` | 3 | 1-6 | Number of brick rows |
| `brick.cols` | 3 | 2-6 | Number of brick columns |
| `brick.scoreValue[0]` | 30 | 10-100 | Score for top row bricks |
| `brick.scoreValue[1]` | 40 | 10-100 | Score for middle row bricks |
| `brick.scoreValue[2]` | 50 | 10-100 | Score for bottom row bricks |

#### Entity Sizes (4)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `paddle.width` | 450 | 200-600 | Paddle width (px) |
| `paddle.height` | 75 | 30-120 | Paddle height (px) |
| `ball.radius` | 120 | 60-180 | Ball visual radius (collision is 50%) |
| `brick.width` | 240 | 120-360 | Brick width (px) |

#### Entity Appearances (5)
| Entity | Current Mode | Options |
|--------|--------------|---------|
| Paddle | Modified GoL | Modified GoL, Static (Blinker horizontal), Density (0.65/0.85) |
| Ball | Visual Only | Visual Only, Static (Block/Tub), Density (0.70/0.90) |
| Bricks (type 1) | Modified GoL | Modified GoL, Static (Ship/Boat/Tub), Density (0.55/0.75) |
| Bricks (type 2) | Modified GoL | Modified GoL, Static (Ship/Boat/Tub), Density (0.55/0.75) |
| Explosions | Pure GoL | Pure GoL, Static (Toad/Beacon), Density (0.60/0.80) |

#### Visual Parameters (1)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `brick.gol.updateRate` | 15 | 5-30 | GoL evolution speed (fps) |

---

### 3.4 Flappy Bird (15 parameters)

**File:** `public/games/flappy-bird.js`
**CONFIG Location:** Lines 31-62

#### Gameplay Parameters (6)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `gravity` | 2.1 | 1.0-4.0 | Downward acceleration |
| `jumpForce` | -42 | -20 to -80 | Jump velocity (negative = up) |
| `pipe.speed` | -15 | -5 to -30 | Pipe scroll speed |
| `pipe.gap` | 600 | 300-900 | Vertical gap between pipes (px) |
| `pipe.spawnInterval` | 100 | 50-200 | Frames between pipe spawns |
| `pipe.width` | 360 | 180-540 | Pipe width (px) |

#### Entity Sizes (2)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `player.width` | 240 | 120-360 | Player width (px) |
| `player.height` | 240 | 120-360 | Player height (px) |

#### Entity Appearances (6)
| Entity | Current Mode | Options |
|--------|--------------|---------|
| Player | Modified GoL | Modified GoL, Static (Blinker/Glider), Density (0.65/0.85) |
| Pipes (top) | Visual Only | Visual Only, Static (Loaf/Beehive), Density (0.55/0.75) |
| Pipes (bottom) | Visual Only | Visual Only, Static (Loaf/Beehive), Density (0.55/0.75) |
| Explosions | Pure GoL | Pure GoL, Static (R-pentomino), Density (0.50/0.70) |

#### Visual Parameters (1)
| Parameter | Current | Range | Description |
|-----------|---------|-------|-------------|
| `player.gol.updateRate` | 12 | 5-30 | GoL evolution speed (fps) |

---

## 4. Appearance System Design

### Three Appearance Modes

#### Mode 1: Modified GoL (Current System)
```javascript
// Uses applyLifeForce() to maintain core density
setupEntity() {
  entity.gol = new GoLEngine(6, 6, 12)
  seedRadialDensity(entity.gol, 0.85, 0.0)
  entity.gol.setPattern(Patterns.BLINKER, 2, 2)
}

update() {
  entity.gol.updateThrottled(frameCount)
  applyLifeForce(entity)  // Maintains minimum density
}
```

**UI Control:**
```html
<select id="playerAppearance">
  <option value="modified-gol">Modified GoL (Current)</option>
</select>

<!-- Fine-tune Modified GoL parameters -->
<label>Initial Density</label>
<input type="range" id="playerDensity" min="0.4" max="0.95" step="0.05" value="0.85">

<label>Life Force Minimum</label>
<input type="range" id="playerLifeForceMin" min="0.2" max="0.6" step="0.05" value="0.4">
```

#### Mode 2: Static GoL Patterns
```javascript
// Freeze GoL evolution, use canonical pattern
setupEntity(patternName) {
  entity.gol = new GoLEngine(6, 6, 0)  // updateRate = 0 (frozen)
  entity.gol.setPattern(Patterns[patternName], 0, 0)
  // NO applyLifeForce, NO maintainDensity - pattern stays fixed
}
```

**Available Patterns (from Patterns.js):**
- **Still Lifes:** BLOCK, BEEHIVE, LOAF, BOAT, TUB, POND, SHIP
- **Oscillators:** BLINKER, TOAD, BEACON, PULSAR
- **Spaceships:** GLIDER, LIGHTWEIGHT_SPACESHIP
- **Methuselahs:** R_PENTOMINO, ACORN, DIEHARD

**UI Control:**
```html
<select id="playerAppearance">
  <optgroup label="Still Lifes">
    <option value="static-block">Static: Block</option>
    <option value="static-beehive">Static: Beehive</option>
    <option value="static-loaf">Static: Loaf</option>
    <option value="static-boat">Static: Boat</option>
  </optgroup>
  <optgroup label="Oscillators">
    <option value="static-blinker">Static: Blinker</option>
    <option value="static-toad">Static: Toad</option>
    <option value="static-pulsar">Static: Pulsar</option>
  </optgroup>
  <optgroup label="Spaceships">
    <option value="static-glider">Static: Glider</option>
    <option value="static-lwss">Static: LWSS</option>
  </optgroup>
</select>
```

#### Mode 3: Density Presets
```javascript
// Reseed with specific density, allow evolution
setupEntity(densityPreset) {
  const densities = {
    low: 0.45,
    medium: 0.65,
    high: 0.85
  }

  entity.gol = new GoLEngine(6, 6, 12)
  seedRadialDensity(entity.gol, densities[densityPreset], 0.0)
  // Optional: use maintainDensity() instead of applyLifeForce()
}
```

**UI Control:**
```html
<select id="playerAppearance">
  <optgroup label="Density Presets">
    <option value="density-low">Density: Low (0.45)</option>
    <option value="density-medium">Density: Medium (0.65)</option>
    <option value="density-high">Density: High (0.85)</option>
  </optgroup>
</select>
```

### Implementation Strategy

**Appearance Override System:**
```javascript
// Global appearance registry (injected when debug mode active)
window.APPEARANCE_OVERRIDES = {
  player: { mode: 'modified-gol', pattern: null, density: 0.85 },
  invaders: { mode: 'static-pattern', pattern: 'PULSAR', density: null },
  bullets: { mode: 'density-preset', pattern: null, density: 0.75 }
}

// Modify entity setup functions to check overrides
function setupPlayer() {
  const override = window.APPEARANCE_OVERRIDES?.player

  if (override && override.mode === 'static-pattern') {
    player.gol = new GoLEngine(6, 6, 0)  // Frozen
    player.gol.setPattern(Patterns[override.pattern], 0, 0)
  } else if (override && override.mode === 'density-preset') {
    player.gol = new GoLEngine(6, 6, 12)
    seedRadialDensity(player.gol, override.density, 0.0)
  } else {
    // Default Modified GoL setup
    player.gol = new GoLEngine(6, 6, 12)
    seedRadialDensity(player.gol, 0.85, 0.0)
    player.gol.setPattern(Patterns.BLINKER, 2, 2)
  }
}
```

---

## 5. Preset System

### localStorage Structure

```javascript
// Key format: "debug_presets_{gameName}"
const STORAGE_KEY_FORMAT = 'debug_presets_space_invaders'

// Preset data structure
const preset = {
  name: 'Hard Mode',
  timestamp: '2025-11-17T12:34:56.789Z',
  config: {
    // All CONFIG values at time of save
    invader: {
      cols: 6,
      rows: 6,
      moveInterval: 15,
      speed: 60
    },
    player: {
      speed: 12,
      shootCooldown: 30
    },
    // ... etc
  },
  appearances: {
    player: { mode: 'density-preset', pattern: null, density: 0.65 },
    invaders: { mode: 'static-pattern', pattern: 'PULSAR', density: null },
    bullets: { mode: 'visual-only', pattern: null, density: 0.75 },
    explosions: { mode: 'pure-gol', pattern: null, density: 0.70 }
  }
}
```

### Built-in Presets

**Default Preset (Current Game Settings):**
```javascript
PRESETS.default = {
  name: 'Default',
  config: { /* Original CONFIG values */ },
  appearances: { /* Current appearance modes */ }
}
```

**Easy Mode Preset:**
```javascript
PRESETS.easy = {
  name: 'Easy Mode',
  config: {
    player: { speed: 30, shootCooldown: 8 },  // Faster, rapid fire
    invader: { moveInterval: 60, speed: 30 },  // Slower
    // ... tuned for easier gameplay
  },
  appearances: { /* Same as default */ }
}
```

**Hard Mode Preset:**
```javascript
PRESETS.hard = {
  name: 'Hard Mode',
  config: {
    player: { speed: 12, shootCooldown: 25 },  // Slower, longer cooldown
    invader: { moveInterval: 15, speed: 60, cols: 8, rows: 6 },  // Faster, more enemies
    // ... tuned for harder gameplay
  },
  appearances: { /* Same as default */ }
}
```

**Chaos Mode Preset (Visual Experiment):**
```javascript
PRESETS.chaos = {
  name: 'Chaos Mode',
  config: {
    player: { speed: 50 },  // Super fast
    invader: { moveInterval: 5, speed: 90 },  // Ultra fast
    // ... extreme values
  },
  appearances: {
    player: { mode: 'static-pattern', pattern: 'GLIDER', density: null },
    invaders: { mode: 'pure-gol', pattern: null, density: 0.90 },
    bullets: { mode: 'static-pattern', pattern: 'BLINKER', density: null },
    explosions: { mode: 'static-pattern', pattern: 'R_PENTOMINO', density: null }
  }
}
```

### Preset Management Functions

```javascript
// Save current state as new preset
function saveCurrentPreset() {
  const presetName = document.getElementById('preset-name').value
  if (!presetName) {
    alert('Enter a preset name')
    return
  }

  const preset = {
    name: presetName,
    timestamp: new Date().toISOString(),
    config: JSON.parse(JSON.stringify(CONFIG)),  // Deep clone
    appearances: JSON.parse(JSON.stringify(window.APPEARANCE_OVERRIDES))
  }

  const presets = loadAllPresets()
  presets[presetName] = preset
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))

  refreshPresetDropdown()
}

// Load preset and apply to game
function loadPreset(presetName) {
  const presets = loadAllPresets()
  const preset = presets[presetName]

  if (!preset) return

  // Apply config values
  Object.assign(CONFIG, preset.config)

  // Apply appearance overrides
  Object.assign(window.APPEARANCE_OVERRIDES, preset.appearances)

  // Update UI sliders/selects to reflect loaded values
  syncUIWithConfig()

  // Reinitialize game with new settings
  initGame()
}

// Delete preset
function deletePreset() {
  const presetName = document.getElementById('preset-selector').value
  if (!presetName || presetName === 'default') {
    alert('Cannot delete default preset')
    return
  }

  const presets = loadAllPresets()
  delete presets[presetName]
  localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))

  refreshPresetDropdown()
}

// Export preset as JSON file
function exportConfig() {
  const presetName = document.getElementById('preset-selector').value
  const presets = loadAllPresets()
  const preset = presets[presetName] || {
    name: 'current',
    config: CONFIG,
    appearances: window.APPEARANCE_OVERRIDES
  }

  const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${preset.name}_preset.json`
  a.click()
}

// Import preset from JSON file
function importConfig() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = (e) => {
    const file = e.target.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      const preset = JSON.parse(e.target.result)
      const presets = loadAllPresets()
      presets[preset.name] = preset
      localStorage.setItem(STORAGE_KEY, JSON.stringify(presets))
      refreshPresetDropdown()
    }
    reader.readAsText(file)
  }
  input.click()
}
```

---

## 6. Implementation Considerations

### Code Structure

**New Files to Create:**
```
src/debug/
├── DebugInterface.js       # Main debug UI manager
├── DebugPresets.js         # Preset system logic
├── DebugAppearance.js      # Appearance override system
└── debug-styles.css        # Sidebar styling
```

**Modified Files:**
```
public/games/space-invaders.js   # Add debug initialization
public/games/dino-runner.js      # Add debug initialization
public/games/breakout.js         # Add debug initialization
public/games/flappy-bird.js      # Add debug initialization
```

**Changes Per Game (Minimal):**
```javascript
// Add to setup() function (4 lines)
const urlParams = new URLSearchParams(window.location.search)
const debugMode = urlParams.get('debug') === 'true'
if (debugMode) {
  import('../src/debug/DebugInterface.js').then(module => {
    module.initDebugInterface(CONFIG, 'space-invaders')
  })
}
```

### Testing Approach

**Manual Testing:**
- Test each parameter range for all 4 games
- Verify appearance modes render correctly
- Test preset save/load/delete functionality
- Test export/import JSON functionality
- Test UI responsiveness (sidebar scrolling)

**No Automated Tests Required (P2 Priority):**
- Debug interface is developer/designer tool
- Used in standalone game testing (not installation)
- Focus on functional correctness over test coverage

### Backward Compatibility

**Without `?debug=true`:**
- Zero code changes executed
- Zero performance overhead
- Games run identically to current version

**With `?debug=true`:**
- Debug module loads asynchronously (no blocking)
- Games remain playable while tuning parameters
- Changes apply immediately (no page reload needed)

---

## 7. UI/UX Design Patterns

### Based on Anthropic Algorithmic-Art Skill

**Key Patterns from viewer.html Template:**

1. **Sidebar Layout:**
   - Fixed right panel (350px width)
   - Scrollable content area
   - Semi-transparent background (0.95 alpha)
   - Drop shadow for depth

2. **Control Groups:**
   - Logical grouping by category (Gameplay, Appearance, Visual)
   - Collapsible sections (optional enhancement)
   - Clear headers (h3 tags)

3. **Parameter Controls:**
   - Range sliders with live value display
   - Dropdowns for categorical choices (appearance modes)
   - Consistent spacing and alignment

4. **Preset Management:**
   - Dropdown selector at top
   - Save/Delete/Export/Import buttons
   - Visual indication of current preset

5. **Responsive Behavior:**
   - Hide/Show toggle for sidebar (minimize distraction)
   - Keyboard shortcuts (ESC to toggle, R to reset)

### Color Scheme (Google Brand Colors)

```css
#debug-panel {
  background: rgba(255, 255, 255, 0.95);  /* White with transparency */
  color: #5f6368;  /* Google Gray */
  border-left: 3px solid #4285F4;  /* Google Blue accent */
}

.control-group h3 {
  color: #1a73e8;  /* Google Blue (darker) */
  border-bottom: 2px solid #e0e0e0;
}

button {
  background: #4285F4;  /* Google Blue */
  color: white;
}

button:hover {
  background: #1a73e8;  /* Google Blue (darker) */
}

input[type="range"] {
  accent-color: #4285F4;  /* Google Blue slider thumb */
}
```

---

## 8. Example Usage Workflow

### Scenario: Tuning Space Invaders Difficulty

**Step 1: Enable Debug Mode**
```
http://localhost:5174/games/space-invaders.html?debug=true
```

**Step 2: Load "Hard Mode" Preset**
- Open debug panel (visible by default)
- Select "Hard Mode" from preset dropdown
- Game restarts with new parameters

**Step 3: Fine-Tune Parameters**
- Adjust "Invader Move Interval" slider: 15 → 12 frames (even faster)
- Adjust "Invader Columns" slider: 4 → 6 columns (more enemies)
- Adjust "Player Shoot Cooldown" slider: 15 → 20 frames (harder)

**Step 4: Experiment with Appearance**
- Change "Player Appearance" dropdown: Modified GoL → Static: Glider
- Change "Invader Appearance" dropdown: Modified GoL → Density: High (0.85)
- Observe visual changes in real-time

**Step 5: Save New Preset**
- Enter name: "Ultra Hard Mode"
- Click "Save Current"
- New preset appears in dropdown

**Step 6: Export Configuration**
- Click "Export Config JSON"
- Save file: `ultra_hard_mode_preset.json`
- Share with team for review

**Step 7: Reset to Default**
- Click "Reset to Defaults"
- Game returns to original CONFIG values

---

## 9. Future Enhancements (P2-P3 Priority)

### P2 Enhancements (Optional)
- **Collapsible Control Groups:** Hide sections to reduce clutter
- **Search/Filter Parameters:** Quickly find specific control
- **Real-time FPS Counter:** Monitor performance impact
- **Undo/Redo History:** Revert parameter changes
- **Comparison Mode:** Side-by-side preset comparison

### P3 Enhancements (Low Priority)
- **Visual Pattern Editor:** Draw custom GoL patterns
- **Animation Recording:** Capture gameplay for analysis
- **A/B Testing Mode:** Randomly switch between presets
- **Multi-game Presets:** Apply settings across multiple games

---

## 10. Success Criteria

**Feature is successful if:**

1. ✅ All 4 games support debug mode via `?debug=true`
2. ✅ 15-20 parameters per game are exposed and functional
3. ✅ Three appearance modes work correctly (Modified GoL, Static, Density)
4. ✅ Preset system can save/load/delete/export/import
5. ✅ Changes apply immediately without page reload
6. ✅ UI is non-intrusive and can be hidden/shown
7. ✅ Zero impact on games when debug mode disabled
8. ✅ Documentation complete for designers/developers

---

## 11. Risks and Mitigations

### Risk 1: Performance Impact
**Risk:** Debug UI updates on every frame slow down game
**Mitigation:** Update UI only when slider moves (event-driven, not frame-driven)

### Risk 2: CONFIG Mutation Bugs
**Risk:** Direct CONFIG mutation breaks game logic
**Mitigation:** Use deep cloning for presets, validate parameter ranges

### Risk 3: Appearance Override Complexity
**Risk:** Overriding entity setup breaks existing GoL logic
**Mitigation:** Centralized override system, test all 3 modes per entity type

### Risk 4: localStorage Quota Exceeded
**Risk:** Too many presets fill localStorage
**Mitigation:** Limit to 10 custom presets per game, warn user on save

### Risk 5: Parameter Range Safety
**Risk:** Invalid values (e.g., 0 invaders) crash game
**Mitigation:** Input validation on all sliders, clamp to safe ranges

---

## 12. Next Steps

### Phase 1: Core Implementation (Estimated 8-10 hours)
1. Create `src/debug/DebugInterface.js` with sidebar HTML/CSS
2. Implement parameter binding system (sliders → CONFIG)
3. Add URL parameter detection to all 4 games
4. Test parameter updates for Space Invaders (reference implementation)

### Phase 2: Appearance System (Estimated 4-6 hours)
5. Implement `DebugAppearance.js` with 3 modes
6. Create dropdown UI for pattern/density selection
7. Test all appearance combinations for one game
8. Replicate to remaining 3 games

### Phase 3: Preset System (Estimated 4-5 hours)
9. Implement `DebugPresets.js` with localStorage logic
10. Create built-in presets (Default, Easy, Hard, Chaos)
11. Add export/import JSON functionality
12. Test preset save/load/delete across all games

### Phase 4: Polish & Documentation (Estimated 2-3 hours)
13. Add keyboard shortcuts (ESC to toggle, R to reset)
14. Style sidebar with Google brand colors
15. Write user documentation for designers
16. Create example preset files for team

**Total Estimated Effort:** 18-24 hours

---

## 13. User Requirements - CONFIRMED

1. **Preset Purpose:** ✅ CONFIRMED - Presets serve as starting points for configuration. The installation will have a single difficulty mode (final tuned settings). Presets are for experimentation/testing only.

2. **UI Visibility:** ✅ CONFIRMED - When `?debug=true`, panel MUST be visible by default. User can hide manually if needed, but default state is SHOWN.

3. **Entity Coverage:** ✅ CONFIRMED - Current entity types are sufficient for first iteration. No additional entities needed.

4. **Export Metadata:** ✅ CLARIFIED - Metadata refers to:
   - `timestamp`: When preset was created (e.g., "2025-11-17T12:34:56.789Z")
   - `name`: Preset name
   - `game`: Which game this preset belongs to

   **Decision:** Include minimal metadata (name + timestamp) for organization. Full config + appearances are primary data.

5. **Installation Integration:** ✅ CONFIRMED - Debug mode will NOT work inside installation iframes. Only for standalone game testing (`/games/*.html?debug=true`). Installation uses finalized configs.

---

---

## 14. Testing Strategy

### Manual Testing Approach

**Framework:** Manual testing only (no automated tests for debug interface)

**Reason:** Debug interface is a developer tool used in standalone mode, not production code.

### Phase 1 Testing (Core Debug System)

**Test Scenario 1: URL Parameter Detection**
```bash
# Test case: Debug mode enables
1. Navigate to: http://localhost:5174/games/space-invaders.html?debug=true
2. Verify: Sidebar visible on right side
3. Verify: No console errors

# Test case: Normal mode (no debug)
1. Navigate to: http://localhost:5174/games/space-invaders.html
2. Verify: No sidebar present
3. Verify: Game runs identically to before
```

**Test Scenario 2: Parameter Live Updates**
```bash
# Test case: Player speed adjustment
1. Open debug mode: ?debug=true
2. Locate "Player Speed" slider
3. Move slider from 18 to 30
4. Verify: Player moves faster immediately
5. Verify: No page reload required

# Test case: Invader move interval
1. Adjust "Invader Move Interval" from 30 to 10
2. Verify: Invaders move more frequently
3. Verify: Game difficulty increases noticeably
```

**Test Scenario 3: Sidebar Toggle**
```bash
# Test case: Hide/show functionality
1. Click "Hide" button
2. Verify: Sidebar collapses or hides
3. Click again (or press ESC)
4. Verify: Sidebar reappears
```

### Phase 2 Testing (Appearance System)

**Test Scenario 4: Static Pattern Mode**
```bash
# Test case: Freeze player with static pattern
1. Select "Player Appearance" dropdown
2. Choose "Static: Blinker"
3. Verify: Player shape becomes Blinker pattern
4. Verify: Player shape NEVER changes (frozen GoL)
5. Verify: Player position still moves normally
```

**Test Scenario 5: Density Preset Mode**
```bash
# Test case: High density preset
1. Select "Player Appearance" dropdown
2. Choose "Density: High (0.85)"
3. Verify: Player reseeded with high density
4. Verify: Player GoL still evolves (not frozen)
5. Verify: Player appears "fuller" visually
```

**Test Scenario 6: All Entity Types**
```bash
# Test each entity type (player, invaders, bullets, explosions)
1. Test Modified GoL mode (default)
2. Test Static pattern mode (select various patterns)
3. Test Density preset mode (low/medium/high)
4. Verify: All modes work for all entity types
```

### Phase 3 Testing (Preset System)

**Test Scenario 7: Save Custom Preset**
```bash
# Test case: Create and save preset
1. Adjust 5+ parameters (speeds, sizes, appearances)
2. Enter preset name: "My Custom Config"
3. Click "Save Current"
4. Verify: Preset appears in dropdown
5. Verify: localStorage contains preset
```

**Test Scenario 8: Load Preset**
```bash
# Test case: Load built-in preset
1. Select "Hard Mode" from dropdown
2. Verify: All parameters update to preset values
3. Verify: UI sliders reflect new values
4. Verify: Game restarts with new config
5. Play briefly to confirm difficulty increased
```

**Test Scenario 9: Delete Preset**
```bash
# Test case: Delete custom preset
1. Select custom preset from dropdown
2. Click "Delete"
3. Verify: Preset removed from dropdown
4. Verify: localStorage updated
5. Try to delete "Default" preset
6. Verify: Error message (cannot delete default)
```

**Test Scenario 10: Export/Import JSON**
```bash
# Test case: Export preset
1. Select preset from dropdown
2. Click "Export Config JSON"
3. Verify: JSON file downloads
4. Open JSON in text editor
5. Verify: Contains config, appearances, metadata

# Test case: Import preset
1. Click "Import Config JSON"
2. Select previously exported file
3. Verify: Preset loads and appears in dropdown
4. Verify: Game updates with imported config
```

**Test Scenario 11: Persistence**
```bash
# Test case: Preset persists across sessions
1. Create custom preset "Test Persistence"
2. Close browser tab
3. Reopen: http://localhost:5174/games/space-invaders.html?debug=true
4. Verify: Custom preset still in dropdown
5. Load preset
6. Verify: Settings restored correctly
```

### Phase 4 Testing (Polish & Styling)

**Test Scenario 12: Google Brand Colors**
```bash
# Test case: Visual styling matches Google brand
1. Open debug mode
2. Verify: Sidebar background is white
3. Verify: Accent color is Google Blue (#4285F4)
4. Verify: Buttons use blue background
5. Verify: Overall aesthetic matches installation
```

**Test Scenario 13: Keyboard Shortcuts**
```bash
# Test case: ESC toggles panel
1. Press ESC key
2. Verify: Sidebar hides
3. Press ESC again
4. Verify: Sidebar shows

# Test case: R resets to default
1. Adjust multiple parameters
2. Press R key
3. Verify: All parameters reset to default preset
4. Verify: Game restarts with default config
```

### Cross-Game Testing

**Test Scenario 14: All 4 Games Support Debug Mode**
```bash
# Test each game independently
1. space-invaders.html?debug=true
   - Verify: 17 parameters exposed
   - Verify: All controls work

2. dino-runner.html?debug=true
   - Verify: 16 parameters exposed
   - Verify: Gravity/jump adjustments work

3. breakout.html?debug=true
   - Verify: 18 parameters exposed
   - Verify: Ball speed/paddle size adjustments work

4. flappy-bird.html?debug=true
   - Verify: 15 parameters exposed
   - Verify: Gravity/jump/pipe gap adjustments work
```

### Edge Cases for Testing

**Debug Interface Edge Cases:**
- [ ] **Invalid parameter values:** Slider set to min/max extremes doesn't crash
- [ ] **localStorage quota:** 10 presets don't exceed storage limit
- [ ] **Corrupt localStorage:** Malformed JSON is handled gracefully
- [ ] **Rapid slider changes:** Moving slider quickly doesn't cause lag
- [ ] **Multiple tabs:** Debug mode in two tabs doesn't conflict
- [ ] **URL parameter case:** ?debug=TRUE (uppercase) is handled
- [ ] **Missing CONFIG:** Game without CONFIG doesn't crash debug init

**Appearance System Edge Cases:**
- [ ] **Pattern too large:** Static pattern larger than entity grid is clipped
- [ ] **Density extremes:** 0.0 and 1.0 density presets render correctly
- [ ] **Mid-game appearance change:** Changing appearance during gameplay doesn't crash
- [ ] **Invalid pattern name:** Unknown pattern name defaults to current mode

**Preset System Edge Cases:**
- [ ] **Duplicate preset names:** Saving with existing name overwrites
- [ ] **Empty preset name:** Error message displayed
- [ ] **Malformed JSON import:** Error message, no crash
- [ ] **Preset for wrong game:** Importing space-invaders preset into dino-runner handles gracefully

---

## 15. Acceptance Criteria (All Phases)

### Functional Requirements:
- [ ] **FR-1:** Debug mode activates via `?debug=true` URL parameter
- [ ] **FR-2:** Sidebar panel visible by default when debug enabled
- [ ] **FR-3:** 15-20 parameters per game exposed and functional
- [ ] **FR-4:** Three appearance modes work correctly (Modified GoL, Static, Density)
- [ ] **FR-5:** Preset system can save/load/delete/export/import
- [ ] **FR-6:** Changes apply immediately without page reload
- [ ] **FR-7:** All 4 games support debug interface

### Performance Requirements:
- [ ] **PR-1:** Debug UI updates don't cause frame drops (60fps maintained)
- [ ] **PR-2:** Parameter changes apply within 1 frame
- [ ] **PR-3:** Preset loading completes within 100ms
- [ ] **PR-4:** Zero overhead when debug mode disabled

### Technical Requirements:
- [ ] **TR-1:** No modifications to core game logic (only CONFIG updates)
- [ ] **TR-2:** p5.js GLOBAL mode compatible (no `this.` usage)
- [ ] **TR-3:** Code follows CLAUDE.md conventions (ES6+, naming, JSDoc)
- [ ] **TR-4:** localStorage structure matches specification
- [ ] **TR-5:** No console errors or warnings during debug mode
- [ ] **TR-6:** Works in standalone mode only (not in installation iframes)

### Documentation Requirements:
- [ ] **DR-1:** docs/DEBUG_INTERFACE_USAGE.md created for designers
- [ ] **DR-2:** Example preset JSON files in docs/presets/
- [ ] **DR-3:** README.md updated with debug mode instructions

---

## 16. Validation Commands

### Pre-flight Checks

```bash
node --version  # Should be >= 18.x
npm --version   # Should be >= 9.x
ls CLAUDE.md    # Should exist
ls public/games/space-invaders.js  # Should exist
```

### Development and Testing

```bash
# Start dev server
npm run dev

# Test Space Invaders with debug mode
# Navigate to: http://localhost:5174/games/space-invaders.html?debug=true

# Test without debug mode (verify no impact)
# Navigate to: http://localhost:5174/games/space-invaders.html
```

### Manual Visual Validation

```bash
# Phase 1 Checklist:
# - [ ] Sidebar renders on right side
# - [ ] Parameter sliders update CONFIG
# - [ ] Game responds to changes immediately
# - [ ] Hide/show toggle works

# Phase 2 Checklist:
# - [ ] Static patterns freeze GoL
# - [ ] Density presets reseed entities
# - [ ] All dropdowns populate correctly
# - [ ] All entity types support all modes

# Phase 3 Checklist:
# - [ ] Presets save to localStorage
# - [ ] Presets load correctly
# - [ ] Presets persist across sessions
# - [ ] Export downloads JSON file
# - [ ] Import loads JSON file

# Phase 4 Checklist:
# - [ ] Google brand colors applied
# - [ ] ESC key toggles panel
# - [ ] R key resets to default
# - [ ] Documentation complete
```

### Cross-Game Validation

```bash
# Test each game independently
http://localhost:5174/games/space-invaders.html?debug=true
http://localhost:5174/games/dino-runner.html?debug=true
http://localhost:5174/games/breakout.html?debug=true
http://localhost:5174/games/flappy-bird.html?debug=true

# Verify for each:
# - [ ] Debug panel renders
# - [ ] All parameters exposed
# - [ ] All controls functional
# - [ ] Presets work
# - [ ] No console errors
```

### Phase Completion Checklists

**Phase 1 Complete When:**
- [ ] All Archon Phase 1 tasks marked "done"
- [ ] Sidebar renders with controls
- [ ] Parameter binding works for Space Invaders
- [ ] Zero console errors
- [ ] Manual testing checklist complete

**Phase 2 Complete When:**
- [ ] All Archon Phase 2 tasks marked "done"
- [ ] Three appearance modes functional
- [ ] All entity types support overrides
- [ ] Appearance system replicated to 3 other games
- [ ] Manual testing checklist complete

**Phase 3 Complete When:**
- [ ] All Archon Phase 3 tasks marked "done"
- [ ] Preset save/load/delete works
- [ ] Export/import JSON functional
- [ ] localStorage persistence validated
- [ ] Manual testing checklist complete

**Phase 4 Complete When:**
- [ ] All Archon Phase 4 tasks marked "done"
- [ ] Google brand styling applied
- [ ] Keyboard shortcuts work (ESC, R)
- [ ] Documentation complete
- [ ] Example presets created
- [ ] All acceptance criteria pass

**All Phases Complete When:**
- [ ] All 4 Archon tasks marked "done"
- [ ] All 4 games support debug mode
- [ ] All manual test scenarios pass
- [ ] All acceptance criteria met
- [ ] Documentation complete
- [ ] Zero console errors across all games

---

## 17. Common Pitfalls to Avoid

### p5.js Global Mode Issues

```javascript
// ❌ WRONG - Instance mode syntax
function updateParam(key, value) {
  this.CONFIG[key] = value  // NO! p5.js is in global mode
}

// ✅ CORRECT - Global mode syntax
function updateParam(key, value) {
  CONFIG[key] = value  // Direct access, no 'this'
  // OR
  window.CONFIG[key] = value  // Explicit global
}
```

### localStorage Pitfalls

```javascript
// ❌ WRONG - Not stringifying objects
localStorage.setItem('preset', presetObject)  // Saves "[object Object]"

// ✅ CORRECT - Stringify before saving
localStorage.setItem('preset', JSON.stringify(presetObject))

// ❌ WRONG - Not handling parse errors
const preset = JSON.parse(localStorage.getItem('preset'))  // Crashes if malformed

// ✅ CORRECT - Wrap in try/catch
try {
  const preset = JSON.parse(localStorage.getItem('preset'))
} catch (e) {
  console.error('Failed to load preset:', e)
  // Use default preset
}
```

### Parameter Binding Pitfalls

```javascript
// ❌ WRONG - Not updating nested CONFIG
function updateParam(key, value) {
  CONFIG[key] = value  // Only works for top-level keys
}
// Fails for: updateParam('player.speed', 30)

// ✅ CORRECT - Handle nested paths
function updateParam(path, value) {
  const keys = path.split('.')
  let obj = CONFIG
  for (let i = 0; i < keys.length - 1; i++) {
    obj = obj[keys[i]]
  }
  obj[keys[keys.length - 1]] = parseFloat(value)
}
```

### Appearance Override Pitfalls

```javascript
// ❌ WRONG - Overriding after entity created
function setupPlayer() {
  player.gol = new GoLEngine(6, 6, 12)
  // Override happens AFTER setup - too late!
}

// ✅ CORRECT - Check overrides BEFORE creating GoL
function setupPlayer() {
  const override = window.APPEARANCE_OVERRIDES?.player

  if (override && override.mode === 'static-pattern') {
    player.gol = new GoLEngine(6, 6, 0)  // Frozen
    player.gol.setPattern(Patterns[override.pattern], 0, 0)
  } else {
    // Default Modified GoL setup
    player.gol = new GoLEngine(6, 6, 12)
    seedRadialDensity(player.gol, 0.85, 0.0)
  }
}
```

### Common Mistakes to Avoid

1. ❌ Forgetting to check `debugMode` before importing debug module
2. ❌ Not handling missing CONFIG gracefully (games might have different structures)
3. ❌ Updating parameters without triggering game restart when needed
4. ❌ Not clamping parameter values to safe ranges (can break gameplay)
5. ❌ Storing sensitive data in localStorage (debug configs only)
6. ❌ Testing only in debug mode (always verify normal mode still works)
7. ❌ Not documenting which parameters need game restart vs live update

---

## 18. Additional Notes for the Agent

### CRITICAL: Backward Compatibility

```javascript
// Games MUST work identically without ?debug=true
// This code should NEVER execute in normal mode:

if (debugMode) {
  // Debug code here - only runs when ?debug=true
  import('../src/debug/DebugInterface.js').then(...)
}

// Rest of game code runs normally regardless of debug mode
```

### Success Indicators

Debug interface is complete when:
- ✅ All 4 games support `?debug=true`
- ✅ 15-20 parameters per game functional
- ✅ Three appearance modes work for all entity types
- ✅ Preset system saves/loads/exports/imports
- ✅ UI follows Google brand colors
- ✅ Keyboard shortcuts work (ESC, R)
- ✅ Zero impact on games when debug disabled
- ✅ All manual test scenarios pass
- ✅ Documentation complete
- ✅ All Archon tasks marked "done"
- ✅ Zero console errors

---

## 19. Phase Deliverables

When you complete each phase, provide:

### Phase 1 Summary Message

```
Phase 1 Complete: Core Debug System ✅

Implementation completed:
- [x] URL parameter detection (?debug=true)
- [x] Sidebar UI with control groups
- [x] Parameter binding system (sliders → CONFIG)
- [x] Tested with Space Invaders

Files created:
- src/debug/DebugInterface.js (350 lines)
- src/debug/debug-styles.css (150 lines)

Files modified:
- public/games/space-invaders.js (+4 lines for debug init)

Manual testing performed:
- Parameter updates apply immediately ✅
- Game responds to all slider changes ✅
- Hide/show toggle works ✅
- Zero console errors ✅

Archon tasks:
- Task: "Phase1: Create DebugInterface.js with sidebar HTML" (done)
```

**⚠️ STOP HERE - Manual Testing Guide for User**

```markdown
# Phase 1 Manual Testing Guide

## Prerequisites
1. Ensure dev server is running: `npm run dev`
2. Open browser to: http://localhost:5174/games/space-invaders.html?debug=true

## Test Checklist (User performs these tests)

### Test 1: Debug Panel Appears
- [ ] Navigate to URL with ?debug=true
- [ ] Verify: Sidebar visible on right side (350px width)
- [ ] Verify: White background with Google Blue accents
- [ ] Verify: Control groups visible (Gameplay, Appearance, Visual)

### Test 2: URL Parameter Detection
- [ ] Navigate WITHOUT ?debug=true (normal URL)
- [ ] Verify: No sidebar present
- [ ] Verify: Game runs normally (no performance impact)
- [ ] Add ?debug=true to URL
- [ ] Verify: Sidebar appears

### Test 3: Parameter Live Updates
- [ ] Locate "Player Speed" slider
- [ ] Note current player movement speed
- [ ] Move slider from 18 to 30
- [ ] Verify: Player immediately moves faster (no page reload)
- [ ] Move slider back to 10
- [ ] Verify: Player immediately moves slower

### Test 4: Multiple Parameters
- [ ] Adjust "Invader Move Interval" from 30 to 10
- [ ] Verify: Invaders move more frequently
- [ ] Adjust "Invader Columns" (if present)
- [ ] Verify: Number of invaders changes on next game restart

### Test 5: Hide/Show Toggle
- [ ] Click "Hide/Show" button
- [ ] Verify: Sidebar collapses or hides
- [ ] Click button again
- [ ] Verify: Sidebar reappears

### Test 6: Console Errors
- [ ] Open browser DevTools (F12)
- [ ] Navigate to Console tab
- [ ] Verify: Zero errors, zero warnings
- [ ] Adjust multiple sliders rapidly
- [ ] Verify: Still no errors

### Test 7: Game Functionality
- [ ] Play Space Invaders for 30 seconds
- [ ] Verify: Game plays normally
- [ ] Verify: 60fps maintained (check DevTools Performance)
- [ ] Adjust parameters mid-game
- [ ] Verify: Changes apply without breaking game

## Pass Criteria

Phase 1 is approved if:
- ✅ All 7 test scenarios pass
- ✅ Sidebar renders correctly
- ✅ Parameters update game behavior
- ✅ Zero console errors
- ✅ Game remains playable

## User Response Required

Please respond with ONE of:
1. "✅ Phase 1 approved" - Proceed to Phase 2
2. "❌ Issues found: [describe issues]" - Fix issues before Phase 2
```

**Agent: WAIT for user response before implementing Phase 2**

### Phase 2 Summary Message

```
Phase 2 Complete: Appearance System ✅

Implementation completed:
- [x] Three appearance modes implemented
- [x] Appearance override system functional
- [x] Pattern dropdowns populated (14 canonical patterns)
- [x] Replicated to all 4 games

Files created:
- src/debug/DebugAppearance.js (280 lines)

Files modified:
- public/games/space-invaders.js (appearance override checks)
- public/games/dino-runner.js (appearance override checks)
- public/games/breakout.js (appearance override checks)
- public/games/flappy-bird.js (appearance override checks)

Manual testing performed:
- Static patterns freeze GoL correctly ✅
- Density presets reseed with correct density ✅
- All entity types support all modes ✅
- Zero console errors ✅

Archon tasks:
- Task: "Phase2: Implement appearance override system" (done)
```

**⚠️ STOP HERE - Manual Testing Guide for User**

```markdown
# Phase 2 Manual Testing Guide

## Prerequisites
1. Ensure dev server is running: `npm run dev`
2. Phase 1 must be approved and functional

## Test Checklist (User performs these tests)

### Test 1: Modified GoL Mode (Default)
- [ ] Open: http://localhost:5174/games/space-invaders.html?debug=true
- [ ] Locate "Player Appearance" dropdown
- [ ] Verify: "Modified GoL (Current)" is selected
- [ ] Verify: Player shape evolves and changes over time
- [ ] Verify: Player core remains visible (doesn't disappear)

### Test 2: Static Pattern Mode
- [ ] Select "Player Appearance" → "Static: Blinker"
- [ ] Verify: Player shape becomes Blinker pattern
- [ ] Observe for 10 seconds
- [ ] Verify: Player shape NEVER changes (frozen GoL)
- [ ] Verify: Player still moves normally
- [ ] Try other patterns: "Static: Glider", "Static: Pulsar"
- [ ] Verify: Each pattern appears and stays frozen

### Test 3: Density Preset Mode
- [ ] Select "Player Appearance" → "Density: High (0.85)"
- [ ] Verify: Player reseeded with many cells (looks "full")
- [ ] Verify: Player shape still evolves (NOT frozen)
- [ ] Select "Density: Low (0.45)"
- [ ] Verify: Player reseeded with fewer cells (looks "sparse")
- [ ] Verify: Visual difference between high/medium/low is clear

### Test 4: All Entity Types (Space Invaders)
- [ ] Test "Invader Appearance" dropdown
  - [ ] Modified GoL: evolves
  - [ ] Static: Pulsar (frozen)
  - [ ] Density: Medium (0.65)
- [ ] Test "Bullet Appearance" dropdown
  - [ ] Visual Only: maintains density
  - [ ] Static: Block (frozen)
  - [ ] Density: High (0.90)
- [ ] Shoot and hit invader
- [ ] Verify: Explosion appears (test explosions too)

### Test 5: Cross-Game Validation
- [ ] Test Dino Runner: http://localhost:5174/games/dino-runner.html?debug=true
  - [ ] Player appearance changes work
  - [ ] Obstacle appearance changes work
- [ ] Test Breakout: http://localhost:5174/games/breakout.html?debug=true
  - [ ] Paddle appearance changes work
  - [ ] Ball appearance changes work
  - [ ] Brick appearance changes work
- [ ] Test Flappy Bird: http://localhost:5174/games/flappy-bird.html?debug=true
  - [ ] Player appearance changes work
  - [ ] Pipe appearance changes work

### Test 6: Pattern Dropdown Population
- [ ] Open any game with ?debug=true
- [ ] Click "Player Appearance" dropdown
- [ ] Verify: 14+ patterns listed (Still Lifes, Oscillators, Spaceships)
- [ ] Verify: Patterns grouped by type (optgroups)
- [ ] Verify: All patterns have descriptive names

### Test 7: Console Errors
- [ ] Open DevTools Console
- [ ] Change appearance modes rapidly (10+ times)
- [ ] Verify: Zero console errors
- [ ] Play game for 1 minute with static patterns
- [ ] Verify: No errors, game remains stable

## Pass Criteria

Phase 2 is approved if:
- ✅ All 7 test scenarios pass
- ✅ Three appearance modes work correctly
- ✅ Static patterns freeze GoL evolution
- ✅ Density presets reseed with correct density
- ✅ All 4 games support appearance system
- ✅ Zero console errors

## User Response Required

Please respond with ONE of:
1. "✅ Phase 2 approved" - Proceed to Phase 3
2. "❌ Issues found: [describe issues]" - Fix issues before Phase 3
```

**Agent: WAIT for user response before implementing Phase 3**

### Phase 3 Summary Message

```
Phase 3 Complete: Preset System ✅

Implementation completed:
- [x] localStorage save/load/delete
- [x] Built-in presets (Default, Easy, Hard, Chaos)
- [x] Export/import JSON functionality
- [x] Preset persistence validated

Files created:
- src/debug/DebugPresets.js (420 lines)

Manual testing performed:
- Presets save to localStorage ✅
- Presets load correctly ✅
- Presets persist across sessions ✅
- Export downloads JSON ✅
- Import loads JSON ✅
- Delete removes presets ✅

Archon tasks:
- Task: "Phase3: Implement preset system with localStorage" (done)
```

**⚠️ STOP HERE - Manual Testing Guide for User**

```markdown
# Phase 3 Manual Testing Guide

## Prerequisites
1. Ensure dev server is running: `npm run dev`
2. Phases 1 and 2 must be approved and functional

## Test Checklist (User performs these tests)

### Test 1: Built-in Preset Loading
- [ ] Open: http://localhost:5174/games/space-invaders.html?debug=true
- [ ] Locate "Preset" dropdown at top of sidebar
- [ ] Verify: Dropdown contains: Default, Easy, Hard, Chaos
- [ ] Select "Easy Mode"
- [ ] Verify: All parameter sliders update to new values
- [ ] Verify: Game restarts automatically
- [ ] Play briefly and verify difficulty is easier
- [ ] Select "Hard Mode"
- [ ] Verify: Parameters change to harder values
- [ ] Play briefly and verify difficulty is harder

### Test 2: Save Custom Preset
- [ ] Adjust 5+ parameters manually:
  - [ ] Player speed → 25
  - [ ] Invader move interval → 20
  - [ ] Invader columns → 6
  - [ ] Player appearance → Static: Glider
  - [ ] Invader appearance → Density: High
- [ ] Enter preset name: "My Test Config"
- [ ] Click "Save Current"
- [ ] Verify: "My Test Config" appears in dropdown
- [ ] Open browser DevTools → Application → Local Storage
- [ ] Verify: Key "debug_presets_space-invaders" exists
- [ ] Verify: JSON contains your preset

### Test 3: Load Custom Preset
- [ ] Select "Default" preset (reset to known state)
- [ ] Verify: Parameters reset
- [ ] Select "My Test Config" from dropdown
- [ ] Verify: All 5+ parameters restore to saved values
- [ ] Verify: Appearance settings restore correctly
- [ ] Verify: Game restarts with saved config

### Test 4: Preset Persistence Across Sessions
- [ ] Close browser tab completely
- [ ] Reopen: http://localhost:5174/games/space-invaders.html?debug=true
- [ ] Verify: "My Test Config" still in dropdown
- [ ] Select "My Test Config"
- [ ] Verify: Settings load correctly (same as before)

### Test 5: Delete Custom Preset
- [ ] Select "My Test Config" from dropdown
- [ ] Click "Delete" button
- [ ] Verify: "My Test Config" removed from dropdown
- [ ] Check localStorage
- [ ] Verify: Preset no longer in JSON
- [ ] Try to delete "Default" preset
- [ ] Verify: Error message appears (cannot delete default)

### Test 6: Export Preset to JSON
- [ ] Create or select a preset
- [ ] Click "Export Config JSON"
- [ ] Verify: JSON file downloads (e.g., "my_test_config_preset.json")
- [ ] Open JSON file in text editor
- [ ] Verify: Contains sections: name, timestamp, game, config, appearances
- [ ] Verify: All parameter values present in config section
- [ ] Verify: Appearance overrides present in appearances section

### Test 7: Import Preset from JSON
- [ ] Delete the preset from debug interface (if present)
- [ ] Click "Import Config JSON"
- [ ] Select the previously exported JSON file
- [ ] Verify: Preset loads and appears in dropdown
- [ ] Verify: Preset name matches JSON file
- [ ] Select imported preset
- [ ] Verify: All parameters load correctly
- [ ] Verify: Game restarts with imported config

### Test 8: localStorage Quota Handling
- [ ] Create 10 custom presets with different names
- [ ] Verify: All 10 save successfully
- [ ] Try to create 11th preset
- [ ] Verify: Either saves (if quota allows) or shows error message

### Test 9: Malformed JSON Import
- [ ] Create invalid JSON file (e.g., missing bracket)
- [ ] Try to import invalid file
- [ ] Verify: Error message appears (no crash)
- [ ] Verify: Debug interface still functional

### Test 10: Cross-Game Preset Isolation
- [ ] Save preset "TestA" in Space Invaders
- [ ] Navigate to Dino Runner with ?debug=true
- [ ] Verify: "TestA" does NOT appear (games have separate presets)
- [ ] Save preset "TestB" in Dino Runner
- [ ] Return to Space Invaders
- [ ] Verify: Only "TestA" present (not "TestB")

## Pass Criteria

Phase 3 is approved if:
- ✅ All 10 test scenarios pass
- ✅ Built-in presets load correctly
- ✅ Custom presets save/load/delete work
- ✅ Presets persist across browser sessions
- ✅ Export/import JSON functional
- ✅ Error handling works (invalid JSON, delete default)
- ✅ Zero console errors

## User Response Required

Please respond with ONE of:
1. "✅ Phase 3 approved" - Proceed to Phase 4
2. "❌ Issues found: [describe issues]" - Fix issues before Phase 4
```

**Agent: WAIT for user response before implementing Phase 4**

### Phase 4 Summary Message

```
Phase 4 Complete: Polish & Documentation ✅

Implementation completed:
- [x] Google brand colors applied
- [x] Keyboard shortcuts (ESC, R)
- [x] User documentation written
- [x] Example presets created

Files created:
- docs/DEBUG_INTERFACE_USAGE.md (600 lines)
- docs/presets/space-invaders-hard.json
- docs/presets/dino-runner-easy.json
- docs/presets/breakout-chaos.json
- docs/presets/flappy-bird-hard.json

Files modified:
- src/debug/debug-styles.css (Google colors applied)
- src/debug/DebugInterface.js (keyboard shortcuts added)
- README.md (debug mode section added)

Manual testing performed:
- ESC toggles panel visibility ✅
- R resets to default preset ✅
- Sidebar matches Google brand aesthetic ✅
- Documentation complete and accurate ✅

Archon tasks:
- Task: "Phase4: Polish, styling, and documentation" (done)
```

**⚠️ STOP HERE - Final Manual Testing Guide for User**

```markdown
# Phase 4 Manual Testing Guide

## Prerequisites
1. Ensure dev server is running: `npm run dev`
2. Phases 1, 2, and 3 must be approved and functional

## Test Checklist (User performs these tests)

### Test 1: Google Brand Colors
- [ ] Open: http://localhost:5174/games/space-invaders.html?debug=true
- [ ] Verify sidebar visual appearance:
  - [ ] Background: White (#FFFFFF)
  - [ ] Headers: Google Blue (#4285F4) or darker variant
  - [ ] Buttons: Google Blue background (#4285F4)
  - [ ] Button hover: Darker blue (#1a73e8)
  - [ ] Text: Google Gray (#5f6368)
  - [ ] Accent borders: Google Blue
- [ ] Compare with installation.html aesthetic
- [ ] Verify: Debug sidebar matches installation style

### Test 2: Keyboard Shortcut - ESC (Toggle Panel)
- [ ] With sidebar visible, press ESC key
- [ ] Verify: Sidebar hides or collapses
- [ ] Press ESC again
- [ ] Verify: Sidebar reappears
- [ ] Test rapid ESC presses (5+ times quickly)
- [ ] Verify: Toggle remains stable, no flickering

### Test 3: Keyboard Shortcut - R (Reset to Default)
- [ ] Adjust 10+ parameters to non-default values
- [ ] Change multiple appearance settings
- [ ] Press R key
- [ ] Verify: ALL parameters reset to default preset
- [ ] Verify: Game restarts automatically
- [ ] Verify: Sidebar sliders show default values

### Test 4: User Documentation - README.md
- [ ] Open: E:\SGx_GoogleEmployment\LifeArcade\README.md
- [ ] Verify: Section on debug mode exists
- [ ] Verify: Explains ?debug=true activation
- [ ] Verify: Links to DEBUG_INTERFACE_USAGE.md

### Test 5: User Documentation - DEBUG_INTERFACE_USAGE.md
- [ ] Open: E:\SGx_GoogleEmployment\LifeArcade\docs\DEBUG_INTERFACE_USAGE.md
- [ ] Verify: File exists and is readable
- [ ] Verify: Contains sections:
  - [ ] Overview and activation
  - [ ] Parameter descriptions
  - [ ] Appearance mode explanations
  - [ ] Preset system usage
  - [ ] Keyboard shortcuts reference
  - [ ] Troubleshooting section
- [ ] Verify: Screenshots or clear instructions present

### Test 6: Example Preset Files
- [ ] Check directory: E:\SGx_GoogleEmployment\LifeArcade\docs\presets\
- [ ] Verify files exist:
  - [ ] space-invaders-hard.json
  - [ ] dino-runner-easy.json
  - [ ] breakout-chaos.json
  - [ ] flappy-bird-hard.json
- [ ] Open one JSON file in text editor
- [ ] Verify: Valid JSON format
- [ ] Verify: Contains name, timestamp, config, appearances
- [ ] Import one file using debug interface
- [ ] Verify: Loads correctly

### Test 7: Cross-Game Final Validation
- [ ] Test all 4 games with ?debug=true:
  - [ ] space-invaders.html
  - [ ] dino-runner.html
  - [ ] breakout.html
  - [ ] flappy-bird.html
- [ ] For each game verify:
  - [ ] Sidebar renders with Google colors
  - [ ] ESC toggles panel
  - [ ] R resets to default
  - [ ] All parameters functional
  - [ ] All appearance modes work
  - [ ] Presets save/load correctly

### Test 8: Performance Impact
- [ ] Open DevTools → Performance tab
- [ ] Start recording
- [ ] Play game for 30 seconds with debug panel visible
- [ ] Stop recording
- [ ] Verify: 58-60fps maintained
- [ ] Verify: No significant frame drops
- [ ] Verify: Debug UI updates don't cause lag

### Test 9: Normal Mode (No Debug)
- [ ] Open: http://localhost:5174/games/space-invaders.html (NO ?debug=true)
- [ ] Verify: No sidebar present
- [ ] Verify: Game runs identically to before feature
- [ ] Open DevTools Console
- [ ] Verify: Zero errors related to debug system
- [ ] Check Performance
- [ ] Verify: Same 60fps as always (zero overhead)

### Test 10: Documentation Completeness
- [ ] Read DEBUG_INTERFACE_USAGE.md fully
- [ ] Attempt to use debug interface following only the docs
- [ ] Verify: All features are documented
- [ ] Verify: No confusion or missing information
- [ ] Check for typos or unclear instructions

## Pass Criteria

Phase 4 is approved if:
- ✅ All 10 test scenarios pass
- ✅ Google brand colors applied correctly
- ✅ Both keyboard shortcuts work (ESC, R)
- ✅ Documentation complete and accurate
- ✅ Example presets load successfully
- ✅ All 4 games support full debug interface
- ✅ 60fps maintained with debug enabled
- ✅ Zero overhead when debug disabled
- ✅ Zero console errors

## Final Acceptance

🎉 **ALL PHASES COMPLETE** if Phase 4 approved!

Debug Interface Feature is ready for:
- Team training on debug usage
- Difficulty tuning phase
- Visual experimentation
- Preset sharing with team

## User Response Required

Please respond with ONE of:
1. "✅ Phase 4 approved - Feature complete!" - Feature deployment ready
2. "❌ Issues found: [describe issues]" - Fix issues in Phase 4
```

**Agent: WAIT for user final approval**

### Final Summary Message

```
Debug Interface Feature Complete ✅

All 4 Phases Completed:
- [x] Phase 1: Core Debug System
- [x] Phase 2: Appearance System
- [x] Phase 3: Preset System
- [x] Phase 4: Polish & Documentation

Implementation Summary:
- 4 new modules created (DebugInterface, DebugAppearance, DebugPresets, styles)
- 4 games modified (minimal 4-line changes each)
- 66 parameters exposed across all games
- 3 appearance modes functional
- Preset system with export/import
- Google brand styling applied
- Complete user documentation

Files Created (5):
- src/debug/DebugInterface.js (350 lines)
- src/debug/DebugAppearance.js (280 lines)
- src/debug/DebugPresets.js (420 lines)
- src/debug/debug-styles.css (200 lines)
- docs/DEBUG_INTERFACE_USAGE.md (600 lines)
- docs/presets/*.json (4 example files)

Files Modified (5):
- public/games/space-invaders.js (+4 lines)
- public/games/dino-runner.js (+4 lines)
- public/games/breakout.js (+4 lines)
- public/games/flappy-bird.js (+4 lines)
- README.md (+20 lines debug section)

Total Lines Added: ~2,100 lines

All Acceptance Criteria Met:
- [x] FR-1 through FR-7 (Functional Requirements)
- [x] PR-1 through PR-4 (Performance Requirements)
- [x] TR-1 through TR-6 (Technical Requirements)
- [x] DR-1 through DR-3 (Documentation Requirements)

All Archon Tasks Complete:
- [x] Phase1: Core Debug System (done)
- [x] Phase2: Appearance System (done)
- [x] Phase3: Preset System (done)
- [x] Phase4: Polish & Documentation (done)

Manual Testing: All 14 test scenarios passed ✅
Edge Cases: All tested and handled ✅
Cross-Game Validation: All 4 games functional ✅

Ready for Deployment:
- Merge to development branch
- Test on Mac Mini M4
- Share with design/dev team
- Begin difficulty tuning phase

Feature implementation time: ~22 hours (within estimated 18-24h range)
```

---

**Document Status:** Implementation Guide Complete ✅
**Ready for Review:** YES ✅
**Ready for Implementation:** YES ✅ (All requirements confirmed, all sections complete)

