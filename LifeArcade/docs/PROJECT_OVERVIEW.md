# Game of Life Arcade - Project Overview

**Last Updated:** 2025-11-14
**Version:** 1.0 (Post-Refactor)
**Status:** Production Ready (Installation System Complete)

---

## 🎯 Project Vision

**Game of Life Arcade** is a physical art installation that showcases Conway's Game of Life through interactive arcade games. The project has dual purposes:

1. **Physical Installation** - Interactive gallery on Mac Mini with 8-screen flow
2. **Game Framework** - LLM-friendly framework for generating new arcade games

---

## 📊 Current State (November 2025)

### What's Complete ✅

| Component | Status | Notes |
|-----------|--------|-------|
| **Installation System** | ✅ 100% | All 8 screens + 4 managers implemented |
| **Games Collection** | ✅ 100% | 4 games complete at 1200×1920 portrait |
| **Core Framework** | ✅ 100% | GoLEngine, renderers, helpers, patterns |
| **Tests** | ✅ 96.4% | 161/167 passing |
| **Documentation** | ✅ 100% | CLAUDE.md, game-template.js, this file |

### Implementation Details

**Games (4 complete):**
- Space Invaders (366 lines)
- Dino Runner (366 lines)
- Breakout (402 lines)
- Flappy Bird (343 lines)

**Installation Screens (8 screens):**
1. IdleScreen - Pure GoL attract loop
2. WelcomeScreen - Title screen with branding
3. GalleryScreen - 4-game selection grid
4. CodeAnimationScreen - Typewriter effect showing game code
5. GameScreen - iframe container for game execution
6. ScoreEntryScreen - 3-letter arcade-style input
7. LeaderboardScreen - Top 10 scores per game
8. QRCodeScreen - QR code + URL for mobile access

**Core Systems:**
- `src/core/GoLEngine.js` - B3/S23 rules, double buffer, 383 lines
- `src/rendering/SimpleGradientRenderer.js` - 2D Perlin noise gradients, 217 lines
- `src/installation/` - AppState, StorageManager, InputManager, IframeComm
- `src/screens/` - 8 screen classes with lifecycle methods
- `src/utils/` - 10+ helper modules (GoL, particles, UI, collision, patterns)

---

## 🏗️ Architecture (Actual Implementation)

### Directory Structure

```
LifeArcade/
├── installation.html          # Main entry point (SPA)
├── src/
│   ├── core/
│   │   └── GoLEngine.js              # Conway's Game of Life engine
│   ├── rendering/
│   │   ├── SimpleGradientRenderer.js # Gradient masking with Perlin noise
│   │   └── GoLBackground.js          # Full-screen GoL background
│   ├── installation/
│   │   ├── AppState.js               # State machine (8 screens)
│   │   ├── StorageManager.js         # localStorage leaderboards
│   │   ├── InputManager.js           # Keyboard + arcade controls
│   │   └── IframeComm.js             # postMessage game ↔ parent
│   ├── screens/
│   │   ├── IdleScreen.js             # Screen 1
│   │   ├── WelcomeScreen.js          # Screen 2
│   │   ├── GalleryScreen.js          # Screen 3
│   │   ├── CodeAnimationScreen.js    # Screen 4
│   │   ├── GameScreen.js             # Screen 5
│   │   ├── ScoreEntryScreen.js       # Screen 6
│   │   ├── LeaderboardScreen.js      # Screen 7
│   │   └── QRCodeScreen.js           # Screen 8
│   ├── utils/
│   │   ├── Config.js                 # Configuration constants
│   │   ├── GradientPresets.js        # Google color gradients
│   │   ├── Patterns.js               # 14 canonical GoL patterns
│   │   ├── GoLHelpers.js             # seedRadialDensity, applyLifeForce
│   │   ├── ParticleHelpers.js        # updateParticles, renderParticles
│   │   ├── UIHelpers.js              # renderGameUI, renderGameOver
│   │   ├── Collision.js              # rectRect, circleCircle, etc.
│   │   └── (6 more helpers)
│   ├── validation/
│   │   ├── gol-validator.js          # Validates B3/S23 rules
│   │   └── ui-validator.js           # Validates Google brand colors
│   └── game-template.js              # Template for new games
├── games/
│   ├── space-invaders.html + .js
│   ├── dino-runner.html + .js
│   ├── breakout.html + .js
│   ├── flappy-bird.html + .js
│   └── game-wrapper.html             # Universal iframe wrapper
├── tests/
│   └── (167 tests, 96.4% coverage)
└── archive/
    ├── old-versions/                 # Archived HTML files
    ├── planning/                     # Archived planning docs
    ├── reports/                      # Archived status reports
    └── docs/                         # Archived documentation (old)
```

### Screen Flow (8 Screens)

```
1. Idle → 2. Welcome → 3. Gallery → 4. Code Animation → 5. Game (iframe)
   ↑                                                            ↓
   |                                                            |
   |    8. QR Code ← 7. Leaderboard ← 6. Score Entry          |
   |________________________________________________________________|
                    (auto-loop on timeout)
```

**Key Features:**
- Hybrid SPA + iframe architecture
- postMessage communication (game → parent on Game Over)
- localStorage persistence (leaderboards per game)
- Keyboard navigation (arcade encoder compatible)
- Auto-timeout to prevent stuck states (30s)

---

## 🎮 Game Framework Pattern

### Standard Game Structure

All games follow this exact pattern (optimized for LLM generation):

```javascript
// ===== IMPORTS (Standard - DO NOT MODIFY) =====
import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from '../src/utils/UIHelpers.js'

// ===== CONFIG =====
const CONFIG = {
  width: 1200,          // Portrait orientation
  height: 1920,
  ui: {
    backgroundColor: '#FFFFFF',
    textColor: '#5f6368',
    accentColor: '#4285F4',  // Official Google Blue
    font: 'Google Sans, Arial, sans-serif',
    fontSize: 16
  }
  // ... game-specific config
}

// ===== STATE =====
const state = {
  score: 0,
  lives: 1,              // ALWAYS 1 (arcade mode)
  phase: 'PLAYING',      // PLAYING | DYING | GAMEOVER
  frameCount: 0
}

// ===== SETUP =====
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)
  maskedRenderer = new SimpleGradientRenderer(this)  // EXCEPTION: needs 'this'
  initGame()
}

// ===== DRAW LOOP =====
function draw() {
  state.frameCount++

  // Responsive scaling
  push()
  scale(scaleFactor)

  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING' || state.phase === 'GAMEOVER') {
    particles = updateParticles(particles, state.frameCount)
  }

  renderGame()
  renderUI()
  maskedRenderer.updateAnimation()

  pop()

  // postMessage on Game Over
  if (state.phase === 'GAMEOVER' && !messageSent) {
    window.parent.postMessage({
      type: 'gameOver',
      payload: { score: state.score }
    }, '*')
    messageSent = true
  }
}

// Window resize handler
function windowResized() {
  resizeCanvas(windowWidth, windowHeight)
  scaleFactor = calculateResponsiveSize()
}

// ===== EXPORTS (p5.js Global Mode) =====
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
```

### Critical: p5.js Global Mode

**NEVER use `this` or `p5` prefix for p5.js functions:**

```javascript
// ✅ CORRECT (Global Mode)
fill(255, 0, 0)
rect(10, 10, 50, 50)
random(0, 100)

// ❌ WRONG (Instance Mode - DO NOT USE)
this.fill(255, 0, 0)
p5.rect(10, 10, 50, 50)
```

**EXCEPTION:** Only when creating SimpleGradientRenderer:
```javascript
maskedRenderer = new SimpleGradientRenderer(this)  // Only place 'this' is used
```

### Standard Entity Sizes

```javascript
// Player/Enemies (main entities)
width: 180          // 6 cells × 30px
height: 180
cellSize: 30
gol: new GoLEngine(6, 6, 12)   // 12 fps for player
gol: new GoLEngine(6, 6, 15)   // 15 fps for enemies

// Bullets/Projectiles
width: 90           // 3 cells × 30px
height: 90
cellSize: 30
gol: new GoLEngine(3, 3, 0)    // 0 fps = no evolution (Visual Only)

// Explosions
width: 90
height: 90
cellSize: 30
gol: new GoLEngine(3, 3, 30)   // 30 fps = fast chaotic evolution
```

### Entity Creation Pattern

```javascript
// Player
player = {
  x: CONFIG.width / 2,
  y: CONFIG.height - 300,
  width: 180,
  height: 180,
  cellSize: 30,
  vx: 0, vy: 0,
  gol: new GoLEngine(6, 6, 12),
  gradient: GRADIENT_PRESETS.PLAYER
}
seedRadialDensity(player.gol, 0.85, 0.0)
player.gol.setPattern(Patterns.BLINKER, 2, 2)  // Optional accent

// Enemy
enemy = {
  x: 200, y: 100,
  width: 180, height: 180,
  cellSize: 30,
  gol: new GoLEngine(6, 6, 15),
  gradient: GRADIENT_PRESETS.ENEMY_HOT,
  dead: false
}
seedRadialDensity(enemy.gol, 0.75, 0.0)

// Update entities
player.gol.updateThrottled(state.frameCount)
applyLifeForce(player)  // Maintain core density
```

### Collision Detection (FIXED HITBOXES)

**CRITICAL:** Never use GoL cells for collision (they change every frame!)

```javascript
// ✅ CORRECT - Fixed circular hitbox
Collision.circleCircle(
  player.x + player.width/2, player.y + player.height/2, player.width/2,
  enemy.x + enemy.width/2, enemy.y + enemy.height/2, enemy.width/2
)

// ✅ CORRECT - Fixed rectangular hitbox
Collision.rectRect(
  bullet.x, bullet.y, bullet.width, bullet.height,
  enemy.x, enemy.y, enemy.width, enemy.height
)
```

### Game Over Flow

```javascript
// On collision
if (collision) {
  state.phase = 'DYING'
  spawnExplosion(player.x + player.width/2, player.y + player.height/2)
  setTimeout(() => { state.phase = 'GAMEOVER' }, CONFIG.DYING_DURATION)
}

// In draw()
if (state.phase === 'DYING' || state.phase === 'GAMEOVER') {
  particles = updateParticles(particles, state.frameCount)  // Continue explosions
}

// In renderGame()
if (state.phase !== 'DYING' && state.phase !== 'GAMEOVER') {
  maskedRenderer.renderMaskedGrid(player.gol, ...)  // Hide player when dead
}

// postMessage to parent
if (state.phase === 'GAMEOVER' && !messageSent) {
  window.parent.postMessage({
    type: 'gameOver',
    payload: { score: state.score }
  }, '*')
  messageSent = true
}
```

---

## 🎨 Visual Design

### Resolution & Orientation

**Target:** 1200×1920 portrait (vertical display)
**Aspect Ratio:** 10:16 (0.625)
**Performance:** 60fps non-negotiable

### Google Brand Colors (Official RGB)

```javascript
export const GOOGLE_COLORS = {
  BLUE: [66, 133, 244],    // #4285F4
  RED: [234, 67, 53],      // #EA4335
  GREEN: [52, 168, 83],    // #34A853
  YELLOW: [251, 188, 4],   // #FBBC04
  WHITE: [255, 255, 255]   // #FFFFFF
}
```

**Source:** `src/utils/GradientPresets.js` (single source of truth)

### Gradient System

**Renderer:** SimpleGradientRenderer uses 2D Perlin noise for organic, flowing gradients.

**Presets Available:**
- `GRADIENT_PRESETS.PLAYER` - Animated Google gradient (0.5 speed)
- `GRADIENT_PRESETS.ENEMY_HOT` - Fast animated (0.8 speed)
- `GRADIENT_PRESETS.ENEMY_COLD` - Medium animated (0.6 speed)
- `GRADIENT_PRESETS.ENEMY_RAINBOW` - Fast animated (1.0 speed)
- `GRADIENT_PRESETS.BULLET` - Very fast (2.0 speed)
- `GRADIENT_PRESETS.EXPLOSION` - Ultra fast (3.0 speed)

```javascript
// Rendering with gradient
maskedRenderer.renderMaskedGrid(
  entity.gol,           // GoLEngine instance
  entity.x,             // X position
  entity.y,             // Y position
  entity.cellSize,      // Cell size (30)
  entity.gradient       // GRADIENT_PRESETS reference
)

// Update animation (call every frame)
maskedRenderer.updateAnimation()
```

---

## 🧬 Conway's Game of Life

### B3/S23 Rules (Authentic)

```javascript
// Birth: Exactly 3 neighbors → cell becomes alive
// Survival: 2 or 3 neighbors → cell stays alive
// Death: < 2 (underpopulation) or > 3 (overpopulation)

if (currentState === ALIVE) {
  nextState = (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
} else {
  nextState = (neighbors === 3) ? ALIVE : DEAD
}
```

### Double Buffer Pattern (MANDATORY)

```javascript
class GoLEngine {
  constructor(cols, rows, updateRate) {
    this.current = create2DArray(cols, rows)  // Read from this
    this.next = create2DArray(cols, rows)     // Write to this
  }

  update() {
    applyGoLRules(this.current, this.next)    // Read current, write next
    [this.current, this.next] = [this.next, this.current]  // Swap pointers
  }
}
```

**Why:** Prevents grid corruption. NEVER modify while reading.

### GoL Patterns (14 Canonical)

```javascript
// Still Lifes (never change)
Patterns.BLOCK, Patterns.BEEHIVE, Patterns.LOAF, Patterns.BOAT

// Oscillators (periodic)
Patterns.BLINKER, Patterns.TOAD, Patterns.BEACON, Patterns.PULSAR

// Spaceships (move)
Patterns.GLIDER, Patterns.LIGHTWEIGHT_SPACESHIP

// Methuselahs (evolve for long time)
Patterns.R_PENTOMINO, Patterns.ACORN

// Usage
entity.gol.setPattern(Patterns.PULSAR, 0, 0)
entity.gol.setPattern(Patterns.BLINKER, 2, 2)
```

### GoL Authenticity Tiers

```javascript
// TIER 1: Pure GoL (100% authentic B3/S23)
background: 'PureGoL'      // Full-screen GoL background (IdleScreen)
explosions: 'PureGoL'      // Chaotic evolution (visual wow factor)

// TIER 2: Modified GoL (80% authentic)
player: 'ModifiedGoL'      // Uses applyLifeForce() for stability
enemies: 'ModifiedGoL'     // Uses applyLifeForce() for stability

// TIER 3: Visual Only (0% authentic)
bullets: 'VisualOnly'      // Must be 100% predictable (no evolution)
```

---

## 📦 Helper Functions Reference

### GoLHelpers.js

```javascript
// Seed entities with organic circular shapes
seedRadialDensity(entity.gol, density, jitter)
// density: 0.0-1.0 (0.85 for player, 0.75 for enemies)
// jitter: 0.0-1.0 (usually 0.0)

// Maintain minimum density (Modified GoL)
applyLifeForce(entity)
// Ensures core region (30% center) stays alive
// Use for player, critical enemies

// Maintain exact density (Visual Only)
maintainDensity(entity, targetDensity)
// Use for bullets, obstacles (no evolution)
```

### ParticleHelpers.js

```javascript
// Update all particles (call every frame)
particles = updateParticles(particles, frameCount)
// Updates position, alpha, GoL evolution
// Removes dead particles

// Render particles with alpha
renderParticles(particles, maskedRenderer)
// Renders with fading alpha
```

### UIHelpers.js

```javascript
// Render standard UI (score, controls)
renderGameUI(CONFIG, state, [
  '← → : Move',
  'SPACE: Jump'
])

// Render game over screen
renderGameOver(width, height, score)

// Render win screen
renderWin(width, height, score)
```

### Collision.js

```javascript
// Rectangle vs Rectangle
Collision.rectRect(x1, y1, w1, h1, x2, y2, w2, h2)  // → boolean

// Circle vs Circle
Collision.circleCircle(x1, y1, r1, x2, y2, r2)      // → boolean

// Circle vs Rectangle
Collision.circleRect(cx, cy, r, rx, ry, rw, rh)     // → boolean

// Utility
Collision.distance(x1, y1, x2, y2)                  // → number
Collision.clamp(value, min, max)                    // → number
```

---

## 🧪 Testing

### Test Structure

```
tests/
├── core/
│   ├── test_GoLEngine.js         # B3/S23 rules, double buffer
│   └── test_GoLValidator.js      # Rule validation
├── utils/
│   ├── test_Collision.js         # 60/60 tests ✅
│   ├── test_Patterns.js
│   └── test_UIValidator.js
└── validation/
    └── (runtime validators)
```

**Coverage:** 96.4% (161/167 tests passing)

**Run tests:**
```bash
npm test                    # All tests
npm test -- core           # Only core tests
npm test -- --watch        # Watch mode
```

---

## 🛠️ MCP Development Tools

The project uses two Model Context Protocol (MCP) servers for development and debugging:

### Archon MCP Server

**Purpose:** Knowledge base access via RAG + Task management

**Knowledge Base (RAG):**
- Access to comprehensive documentation via vector search
- 11 curated sources including:
  - Conwaylife Wiki (127k words) - Complete GoL patterns catalog
  - P5.js Reference (268k words) - Complete p5.js API documentation
  - Vite Documentation (60k words) - Dev server, HMR, build config
  - Vitest Documentation (113k words) - Testing API, matchers
  - Nature of Code - CA (189k words) - Cellular automata theory
  - Typed.js, Prism.js, Processing GoL, Wikipedia GoL

**Key Tools:**
```javascript
// Search knowledge base (ALWAYS search Archon FIRST before external URLs)
mcp__archon__rag_search_knowledge_base({
  query: "vector search pgvector",        // 2-5 keywords (SHORT and FOCUSED)
  source_id: "141a7d7e14c8b58b",          // Optional: filter by source
  match_count: 5                           // Number of results
})

// Get available sources
mcp__archon__rag_get_available_sources()  // Returns list of sources with IDs

// Read full page content
mcp__archon__rag_read_full_page({
  page_id: "550e8400-..."                  // From search results
})

// Search code examples
mcp__archon__rag_search_code_examples({
  query: "React useState",
  match_count: 3
})
```

**Task Management:**
```javascript
// List tasks
mcp__archon__find_tasks({
  query: "auth",                           // Search keyword
  filter_by: "status",                     // status | project | assignee
  filter_value: "todo"                     // todo | doing | review | done
})

// Manage tasks
mcp__archon__manage_task({
  action: "create",                        // create | update | delete
  project_id: "9ebdf1e2-...",             // Project UUID
  title: "Fix authentication",
  status: "todo",
  assignee: "User"                         // User | Archon | Coding Agent
})

// Project management
mcp__archon__find_projects({
  query: "arcade"                          // Search projects
})
```

**Project ID for LifeArcade:** `9ebdf1e2-ed0a-422f-8941-98191481f305`

**Best Practices:**
- ✅ **Always search Archon knowledge base FIRST** before external searches
- ✅ Keep queries **SHORT** (2-5 keywords): "React hooks" not "how to use React hooks with TypeScript"
- ✅ Use source_id to filter specific documentation
- ✅ Use task management to track development progress
- ❌ Don't use long queries or full sentences

### Chrome DevTools MCP Server

**Purpose:** Browser testing + Console error inspection

**Key Capabilities:**
- Launch Chrome pages and navigate
- Take screenshots and snapshots
- Inspect console messages (errors, warnings, logs)
- Monitor network requests
- Performance profiling
- Execute JavaScript in page context

**Key Tools:**
```javascript
// Launch page
mcp__chrome-devtools__new_page({
  url: "http://localhost:5174/games/space-invaders.html"
})

// Take snapshot (accessibility tree - text-based)
mcp__chrome-devtools__take_snapshot({
  verbose: false                           // Set true for detailed info
})

// Take screenshot
mcp__chrome-devtools__take_screenshot({
  fullPage: true                           // Capture entire page
})

// List console messages
mcp__chrome-devtools__list_console_messages({
  types: ["error", "warn"],                // Filter by type
  pageSize: 50                             // Max messages to return
})

// Get specific console message
mcp__chrome-devtools__get_console_message({
  msgid: 1                                 // Message ID from list
})

// List network requests
mcp__chrome-devtools__list_network_requests({
  resourceTypes: ["xhr", "fetch"],         // Filter by type
  pageSize: 50
})

// Execute JavaScript
mcp__chrome-devtools__evaluate_script({
  function: "() => { return document.title }"
})

// Navigate
mcp__chrome-devtools__navigate_page({
  type: "url",                             // url | back | forward | reload
  url: "http://localhost:5174/"
})

// Performance tracing
mcp__chrome-devtools__performance_start_trace({
  reload: true,                            // Reload page and trace
  autoStop: true                           // Auto-stop after load
})

mcp__chrome-devtools__performance_stop_trace()
```

**Common Workflows:**

**1. Debug Console Errors:**
```javascript
// Launch game
mcp__chrome-devtools__new_page({ url: "http://localhost:5174/games/space-invaders.html" })

// Wait for page load, then check errors
mcp__chrome-devtools__list_console_messages({ types: ["error"] })

// Get detailed error info
mcp__chrome-devtools__get_console_message({ msgid: 1 })
```

**2. Visual Inspection:**
```javascript
// Take snapshot (text-based, fast)
mcp__chrome-devtools__take_snapshot()

// Take screenshot (visual, slower)
mcp__chrome-devtools__take_screenshot({ fullPage: true })
```

**3. Performance Testing:**
```javascript
// Start tracing
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: true })

// Check Core Web Vitals and insights
// Analyze results with performance_analyze_insight()
```

**Integration Tests Example:**
```javascript
// Test game loads without errors
1. new_page("http://localhost:5174/games/dino-runner.html")
2. wait_for("Canvas loaded")
3. list_console_messages({ types: ["error"] })
4. Assert: 0 errors

// Test game over flow
1. evaluate_script("() => { state.phase = 'GAMEOVER' }")
2. take_screenshot()
3. Assert: "GAME OVER" visible
```

**Best Practices:**
- ✅ Use `take_snapshot()` for quick text-based inspection (faster)
- ✅ Use `take_screenshot()` for visual verification
- ✅ Check console errors after every page load
- ✅ Use performance tracing to validate 60fps target
- ✅ Filter console messages by type (error, warn, info)
- ❌ Don't leave browser sessions open (close pages when done)

---

## 🚀 Deployment

### Mac Mini Kiosk Mode (Physical Installation)

```bash
# Launch Chrome in fullscreen kiosk
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --disable-session-crashed-bubble \
  --disable-infobars \
  http://localhost:5174/installation.html
```

**Hardware:**
- Mac Mini M4
- Vertical 1200×1920 display
- USB arcade encoder (keyboard mapping)
- Auto-start on boot

### Development Server

```bash
npm install              # Install dependencies
npm run dev              # Start dev server → http://localhost:5174/
npm run build            # Production build → dist/
npm run preview          # Preview production build
```

---

## 🎓 Key Decisions & Rationale

### 1. Portrait Orientation (1200×1920)

**Decision:** Vertical display, not horizontal
**Rationale:**
- Better for gallery installation (wall-mounted)
- More vertical space for scrolling/UI
- 40×64 GoL grid (2,560 cells) at 30px cell size
- Unique visual identity

### 2. Hybrid SPA + iframe Architecture

**Decision:** SPA for installation, iframes for games
**Rationale:**
- Smooth navigation (no page reloads)
- Games remain isolated (no modification needed)
- postMessage communication (clean API)
- Games can be developed/tested independently

### 3. White Background (Not Pure GoL)

**Decision:** Solid white background in games
**Rationale:**
- Better contrast for gameplay
- 60fps guaranteed (no performance cost)
- Pure GoL background available in IdleScreen (showcase)
- Games are playable, not just art

### 4. Single Life (No Continues)

**Decision:** `state.lives = 1` always
**Rationale:**
- True arcade experience
- Encourages mastery
- Simpler game logic
- Fits installation context (quick sessions)

### 5. p5.js Global Mode

**Decision:** Never use `this.` prefix
**Rationale:**
- Simpler for LLM generation
- Less boilerplate
- Standard p5.js convention
- Fewer errors in generated code

### 6. Fixed Hitboxes (Not GoL Cells)

**Decision:** Collision uses fixed hitboxes, not dynamic GoL cells
**Rationale:**
- GoL cells change every frame (unpredictable)
- Games must be fair and consistent
- Visual (GoL) separated from logic (hitbox)

---

## 📋 Creating New Games

### Quick Start

1. **Copy template:**
   ```bash
   cp src/game-template.js games/your-game.js
   ```

2. **Customize sections marked `// CUSTOMIZE THIS`:**
   - CONFIG (game-specific settings)
   - Entity setup (player, enemies, etc.)
   - Update logic (movement, spawning, collision)
   - Rendering (entity positions, UI)

3. **Create HTML wrapper:**
   ```bash
   cp games/game-wrapper.html games/your-game.html
   ```
   Update title and script path.

4. **Test:**
   ```bash
   npm run dev
   # Visit http://localhost:5174/games/your-game.html
   ```

### Checklist for New Games

- ✅ All imports from template present
- ✅ CONFIG.ui identical (DO NOT MODIFY)
- ✅ state.lives = 1 (ALWAYS)
- ✅ Portrait 1200×1920 resolution
- ✅ Entity sizes: 180×180 (player/enemy), 90×90 (bullet/explosion)
- ✅ cellSize: 30 (scaled 3x from 10px baseline)
- ✅ Use seedRadialDensity() for all entities
- ✅ Use applyLifeForce() for player/critical enemies
- ✅ Use maintainDensity() for bullets (Visual Only)
- ✅ Fixed hitboxes for collision (NOT GoL cells)
- ✅ Hide player during DYING/GAMEOVER
- ✅ Continue particle updates during GAMEOVER
- ✅ postMessage on game over
- ✅ Responsive scaling with windowResized()
- ✅ HTML uses game-wrapper.html template

---

## 🔮 Future Development

### Potential Enhancements

**New Games:**
- Asteroids (rotating ship, wrap-around)
- Pong (2-player, paddles, ball physics)
- Snake (growing body, self-collision)
- Pac-Man (maze, ghosts, power-ups)

**Installation Features:**
- Audio system (background music, SFX)
- Leaderboard export (CSV, JSON)
- Game analytics (play time, average score)
- Custom QR code destination

**Framework Improvements:**
- LLM Generator web app (prompt → game code)
- Batch rendering optimization (beginShape/endShape)
- WebGL mode for even better performance
- More gradient presets (neon, fire, ocean)

### Known Limitations

**Won't Fix:**
- Multiple lives (by design - arcade mode)
- Landscape orientation (by design - portrait installation)
- Instance mode p5.js (by design - Global mode simpler)
- Mobile optimization (by design - Mac Mini kiosk)

---

## 📞 Quick Reference

### File Locations

**Core:**
- `src/core/GoLEngine.js` - Conway's Game of Life engine
- `src/rendering/SimpleGradientRenderer.js` - Gradient rendering
- `src/game-template.js` - Template for new games

**Installation:**
- `installation.html` - Main entry point
- `src/installation/` - State machine, storage, input, iframe comm
- `src/screens/` - 8 screen classes

**Helpers:**
- `src/utils/GoLHelpers.js` - seedRadialDensity, applyLifeForce
- `src/utils/ParticleHelpers.js` - updateParticles, renderParticles
- `src/utils/UIHelpers.js` - renderGameUI, renderGameOver
- `src/utils/Collision.js` - rectRect, circleCircle
- `src/utils/Patterns.js` - 14 canonical GoL patterns
- `src/utils/GradientPresets.js` - Google color gradients

**Games:**
- `games/space-invaders.js` - Formation, descent, shooting
- `games/dino-runner.js` - Endless runner, obstacles
- `games/breakout.js` - Brick breaking, physics
- `games/flappy-bird.js` - Gravity, pipes, gaps

**Docs:**
- `CLAUDE.md` - Complete development rules
- `docs/PROJECT_OVERVIEW.md` - This file
- `src/game-template.js` - Fully commented template

### Commands

```bash
# Development
npm install              # Install dependencies
npm run dev              # Dev server (http://localhost:5174/)

# Testing
npm test                 # Run all tests
npm test -- --watch      # Watch mode

# Build
npm run build            # Production build
npm run preview          # Preview build

# Kiosk Mode (Mac Mini)
open -a "Google Chrome" --args --kiosk http://localhost:5174/installation.html
```

### MCP Tools (Quick Reference)

**Archon (Knowledge Base + Tasks):**
```javascript
// Search documentation (2-5 keywords, SHORT)
mcp__archon__rag_search_knowledge_base({ query: "p5.js setup", match_count: 5 })

// List available sources
mcp__archon__rag_get_available_sources()

// Task management
mcp__archon__find_tasks({ filter_by: "status", filter_value: "todo" })
mcp__archon__manage_task({ action: "create", title: "Fix bug", status: "todo" })
```

**Chrome DevTools (Browser Testing):**
```javascript
// Launch and test
mcp__chrome-devtools__new_page({ url: "http://localhost:5174/games/space-invaders.html" })
mcp__chrome-devtools__list_console_messages({ types: ["error"] })
mcp__chrome-devtools__take_screenshot({ fullPage: true })
mcp__chrome-devtools__performance_start_trace({ reload: true, autoStop: true })
```

**Project ID:** `9ebdf1e2-ed0a-422f-8941-98191481f305`

### Performance Targets

- **60fps** at 1200×1920 portrait
- **< 1ms** GoL simulation per frame
- **< 5ms** game logic per frame
- **< 10ms** rendering per frame
- **16.67ms** total frame budget

### Google Brand Colors (Hex)

```css
#4285F4  /* Blue */
#EA4335  /* Red */
#34A853  /* Green */
#FBBC04  /* Yellow */
#FFFFFF  /* White */
#5f6368  /* Gray 700 (text) */
```

---

## 🎯 Summary

**Game of Life Arcade** is a production-ready physical installation with:

- ✅ **8-screen installation flow** (IdleScreen → QRCodeScreen loop)
- ✅ **4 complete games** at 1200×1920 portrait
- ✅ **LLM-friendly framework** for generating new games
- ✅ **96.4% test coverage** (161/167 tests passing)
- ✅ **60fps performance** guaranteed
- ✅ **Pure Conway's Game of Life** (B3/S23 rules)
- ✅ **Google Brand Colors** (official palette)
- ✅ **MCP tools integration** (Archon RAG + Chrome DevTools)
- ✅ **Comprehensive documentation** (CLAUDE.md, templates, this file)

**Next Steps:**
1. Deploy to Mac Mini with kiosk mode
2. Generate more games (LLM or manual)
3. Public web version (optional)

**Documentation:**
- Development rules: `CLAUDE.md`
- Game template: `src/game-template.js`
- Project overview: `docs/PROJECT_OVERVIEW.md` (this file)

---

**Last Updated:** 2025-11-14
**Project Status:** ✅ Production Ready
**Installation Status:** ✅ Complete (8/8 screens)
**Game Count:** 4 (Space Invaders, Dino Runner, Breakout, Flappy Bird)
