# LifeArcade - Physical Installation Development Rules

## 1. Core Principles

**AUTHENTICITY OVER CONVENIENCE (NON-NEGOTIABLE)**
- Cells must be generated procedurally (no static sprites)
- Background MUST be 100% Pure GoL (B3/S23 rules)
- Use Modified GoL only when gameplay requires it
- Document all deviations from pure B3/S23

**KISS - KEEP IT SIMPLE, STUPID**
- Prefer simple, readable solutions over clever abstractions
- Mac M4 is overpowered - don't over-optimize
- Focus on visual beauty over technical complexity

**YAGNI - YOU AREN'T GONNA NEED IT**
- No features until explicitly needed
- This is an **art installation first, technical demo second**

**ARCADE-FIRST DESIGN**
- Single life only (no continues)
- Keyboard controls (arcade encoder maps to keyboard)
- Full-screen kiosk mode on Mac Mini M4
- **Portrait orientation: 1200×1920 (vertical display)**
- 60fps non-negotiable at 1200×1920

---

## 2. Tech Stack

### Core
- **p5.js 1.7.0** in GLOBAL mode (not instance mode)
- **Conway's Game of Life** (B3/S23 algorithm)
- **Vite 7.2+** for dev server with HMR
- **Vitest 3.x** for testing (96.4% coverage target)

### Frontend
- Vanilla JavaScript (ES6+)
- No frameworks except p5.js
- SPA architecture (Hybrid: SPA + iframes)
- localStorage for persistence (leaderboard)

### Rendering
- SimpleGradientRenderer (2D Perlin noise animated gradients)
- Cell-based rendering (batch beginShape/endShape)

### Google Brand Colors

**Official Google Colors (MUST use these exact values):**

```javascript
export const GOOGLE_COLORS = {
  BLUE: [66, 133, 244],    // Google Blue #4285F4
  RED: [234, 67, 53],      // Google Red #EA4335
  GREEN: [52, 168, 83],    // Google Green #34A853
  YELLOW: [251, 188, 4],   // Google Yellow #FBBC04
  WHITE: [255, 255, 255]   // White #FFFFFF
}
```

**Usage Guidelines:**
- Background: WHITE (#FFFFFF)
- Primary accent: BLUE (#4285F4)
- Error/Alert: RED (#EA4335)
- Success/Confirm: GREEN (#34A853)
- Warning/Highlight: YELLOW (#FBBC04)

**Defined in:** `src/utils/GradientPresets.js`

---

## 3. Project Architecture

```
LifeArcade/
├── src/
│   ├── core/             # GoLEngine (B3/S23), state machine
│   ├── rendering/        # SimpleGradientRenderer, particles
│   ├── utils/            # Helpers, collision, patterns
│   └── validation/       # Runtime validators
├── games/                # 7 games (iframes)
│   ├── space-invaders.js/html
│   ├── dino-runner.js/html
│   ├── breakout.js/html
│   ├── asteroids.js/html
│   ├── flappy-bird.js/html
│   ├── snake.js/html
│   └── pong.js/html
├── screens/              # Arcade screen system (SPA)
│   ├── attract.js        # Screen 1: Attract/Inicio
│   ├── gallery.js        # Screen 2: Game selection
│   ├── code-animation.js # Screen 3: Code typewriter
│   ├── score-entry.js    # Screen 5: 3-initial input
│   └── leaderboard.js    # Screen 6: High scores table
├── tests/                # Mirror src/ structure
│   ├── core/
│   ├── utils/
│   └── validation/
└── installation.html     # Main SPA container
```

### Screen Flow (6 Screens)
```
1. Attract → 2. Gallery → 3. Code Animation → 4. Game (iframe) → 5. Score Entry → 6. Leaderboard
     ↑_______________________________________________________________________________|
                                    (30s timeout loop)
```

### Portrait Display Specifications

**Resolution:** 1200×1920 (vertical/portrait orientation)

**Aspect Ratio:** 5:8 (0.625)

**Design Implications:**
- Canvas size: `createCanvas(1200, 1920)`
- GoL background grid: 40 cols × 64 rows (2,560 cells) for ~30px cell size
- Gallery grid: 2 columns × 4 rows (better for vertical)
- UI layouts: Stack vertically, more scrolling room
- Font sizes: Can be larger due to more vertical space
- Code animation: More lines visible simultaneously

**Example Canvas Setup:**
```javascript
function setup() {
  createCanvas(1200, 1920)  // Portrait
  frameRate(60)
}
```

---

## 4. Code Style

### JavaScript/p5.js Conventions

**Naming:**
```javascript
// Classes: PascalCase
class GoLEngine { }
class SimpleGradientRenderer { }

// Constants: SCREAMING_SNAKE_CASE
const CELL_SIZE = 10
const UPDATE_RATE_FPS = 12

// Variables/functions: camelCase
let currentGeneration = 0
function countLiveNeighbors(grid, x, y) { }
```

**p5.js GLOBAL MODE (Critical):**
```javascript
// ✅ CORRECT (what we use)
function setup() {
  createCanvas(800, 600)    // No 'this.'
  fill(255, 0, 0)           // No 'this.'
}

function draw() {
  background(0)             // No 'this.'
  rect(10, 10, 50, 50)      // No 'this.'
}

// ❌ WRONG (instance mode - do NOT use)
function setup() {
  this.createCanvas(800, 600)  // NO!
  this.fill(255, 0, 0)         // NO!
}
```

**Helper Functions (NO 'this' parameter):**
```javascript
// ✅ CORRECT
renderGameUI(CONFIG, state, controls)
renderParticles(particles, maskedRenderer)

// ❌ WRONG
renderGameUI(this, CONFIG, state, controls)
renderParticles(particles, maskedRenderer, this)
```

**JSDoc for Public APIs:**
```javascript
/**
 * Apply Conway's Game of Life B3/S23 rules.
 *
 * @param {number[][]} current - Current generation grid
 * @param {number[][]} next - Next generation grid (modified in place)
 * @returns {void}
 *
 * @example
 * const current = [[0,1,0], [0,1,0], [0,1,0]]  // Blinker
 * const next = [[0,0,0], [0,0,0], [0,0,0]]
 * applyGoLRules(current, next)
 * // next becomes [[0,0,0], [1,1,1], [0,0,0]]
 */
function applyGoLRules(current, next) {
  // Implementation
}
```

---

## 5. Conway's Game of Life Rules (B3/S23)

### Algorithm (CRITICAL - Must Follow Exactly)

```javascript
function applyGoLRules(currentGrid, nextGrid) {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const neighbors = countLiveNeighbors(currentGrid, x, y)
      const currentState = currentGrid[x][y]

      if (currentState === ALIVE) {
        // Survival: 2 or 3 neighbors → survives
        // Death: < 2 (underpopulation) or > 3 (overpopulation)
        nextGrid[x][y] = (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
      } else {
        // Birth: exactly 3 neighbors → becomes alive
        nextGrid[x][y] = (neighbors === 3) ? ALIVE : DEAD
      }
    }
  }
}
```

### Double Buffer Pattern (MANDATORY)

```javascript
// ✅ CORRECT - Always use two grids
class GoLEngine {
  constructor() {
    this.current = create2DArray(cols, rows)
    this.next = create2DArray(cols, rows)
  }

  update() {
    applyGoLRules(this.current, this.next)
    [this.current, this.next] = [this.next, this.current]  // Swap
  }
}

// ❌ WRONG - Never modify while reading
class BadGoLEngine {
  update() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.grid[x][y] = this.calculateNextState(x, y)  // BUG!
      }
    }
  }
}
```

### Authenticity Tiers

```javascript
const AUTHENTICITY_STRATEGY = {
  // TIER 1: Pure GoL (100% authentic B3/S23)
  background: 'PureGoL',      // Showcase, doesn't affect gameplay
  explosions: 'PureGoL',      // Visual effect, wow factor
  powerups: 'PureGoL',        // Oscillators are naturally stable

  // TIER 2: Modified GoL (80% authentic)
  player: 'ModifiedGoL',      // Needs lifeForce for stability
  enemies_large: 'ModifiedGoL', // Visually interesting, stable

  // TIER 3: Visual Only (0% authentic)
  bullets: 'VisualOnly',      // Must be 100% predictable
  enemies_small: 'VisualOnly' // Too small for meaningful GoL
}
```

**Principle:** Use Pure GoL wherever it doesn't harm gameplay.

---

## 6. Performance Targets

**Target:** 60fps on Mac M4 at 1200×1920 (portrait/vertical)

**Budget per frame (16.67ms):**
- GoL simulations: < 1ms (background + sprites)
- Game logic: < 5ms (physics, collision, AI)
- Rendering: < 10ms (draw calls, particles)
- Buffer: 0.67ms (safety margin)

**Optimization Rules:**

1. **Keep grids small:**
```javascript
// ✅ GOOD
const background = new GoLEngine(40, 64)   // 2,560 cells (portrait: 1200×1920)
const sprite = new GoLEngine(20, 20)       // 400 cells

// ❌ AVOID
const background = new GoLEngine(200, 150) // 30,000 cells (too much)
```

2. **Variable update rates:**
```javascript
background.updateRate = 10  // fps (every 6 frames at 60fps)
player.updateRate = 12      // fps (every 5 frames)
explosion.updateRate = 30   // fps (every 2 frames)
```

3. **Batch rendering:**
```javascript
// ✅ GOOD - Single beginShape/endShape
beginShape(QUADS)
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    if (grid[x][y] === ALIVE) {
      vertex(x * cellSize, y * cellSize)
      // ... other vertices
    }
  }
}
endShape()

// ❌ AVOID - Individual rect calls
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    rect(x * cellSize, y * cellSize, cellSize, cellSize)  // Slow!
  }
}
```

---

## 7. Arcade Screen System

### Architecture Principles

**Type:** Hybrid SPA (Single Page Application + iframes)

**Container:** `installation.html` - SPA managing navigation and state
**Games:** Load in `<iframe>` - Isolated execution environment

**Benefits:**
- Smooth transitions (no page reloads)
- Games remain isolated (no modification needed)
- Clear separation of concerns

### Screen Flow

**6-Screen Installation Flow:**
```
1. Attract → 2. Gallery → 3. Code Animation → 4. Game → 5. Score Entry → 6. Leaderboard
     ↑___________________________________________________________________________|
                            (auto-loop on timeout)
```

**Navigation Principles:**
- State-driven screen transitions
- Keyboard-only controls (arcade encoder compatibility)
- Smooth CSS transitions between screens
- Auto-timeouts to prevent stuck states

### Communication Patterns

**iframe ↔ Parent Communication (postMessage):**
```javascript
// Game → Parent: Send game over signal
window.parent.postMessage({
  type: 'gameOver',
  payload: { score: finalScore }
}, '*')

// Parent → Game: Send acknowledgment
iframe.contentWindow.postMessage({
  type: 'acknowledged'
}, '*')
```

**State Management:**
- Centralized AppState managing current screen and data
- localStorage for leaderboard persistence
- Session-scoped data (score, player name) cleared on loop

**Storage Structure:**
```javascript
// localStorage key format: "scores_{gameName}"
localStorage.setItem('scores_snake', JSON.stringify([
  { name: 'ABC', score: 25420, date: '2025-11-13T...' },
  // ... top 10 scores per game
]))
```

**Design Notes:**
- Screen content and layouts defined in planning documents
- UI specs may change based on client feedback
- Maintain architectural patterns regardless of content changes

---

## 8. Testing

### Test Structure (Mirror src/)
```
src/core/GoLEngine.js     → tests/core/test_GoLEngine.js
src/utils/Collision.js    → tests/utils/test_Collision.js
src/rendering/SimpleGradientRenderer.js → tests/rendering/test_SimpleGradientRenderer.js
```

### Unit Tests (Vitest)

**Focus:** Individual components in isolation

```javascript
// tests/core/test_GoLEngine.js
import { describe, test, expect } from 'vitest'
import { GoLEngine } from '../../src/core/GoLEngine.js'

describe('GoLEngine', () => {
  test('applies B3/S23 rules correctly for Blinker', () => {
    const engine = new GoLEngine(3, 3)
    // Gen 0: Vertical blinker
    engine.setPattern([[0,1,0], [0,1,0], [0,1,0]])
    engine.update()
    // Gen 1: Horizontal blinker
    expect(engine.getPattern()).toEqual([[0,0,0], [1,1,1], [0,0,0]])
  })

  test('uses double buffer (swaps pointers)', () => {
    const engine = new GoLEngine(5, 5)
    const beforePtr = engine.current
    engine.update()
    expect(engine.current).not.toBe(beforePtr)
  })
})
```

### Browser Tests (Chrome DevTools MCP)

```javascript
// tests/integration/test_DinoGame_browser.js
describe('DinoGame Integration', () => {
  test('maintains 60fps with GoL background', async () => {
    const page = await chrome.newPage('http://localhost:5174')
    await chrome.performance.startTracing()

    await chrome.keyboard.press('Space')  // Start game
    await chrome.wait(10000)              // Play 10s

    const metrics = await chrome.performance.getMetrics()
    expect(metrics.averageFPS).toBeGreaterThan(58)
  })
})
```

**Run tests:**
```bash
npm test                    # All tests
npm test -- core           # Only core tests
npm test -- --watch        # Watch mode
```

---

## 9. Development Commands

### Setup
```bash
npm install              # Install dependencies
```

### Development
```bash
npm run dev              # Start dev server → http://localhost:5174/
                         # Vite with HMR
```

### Testing
```bash
npm test                 # Run all tests (Vitest)
npm test -- --watch      # Watch mode
npm test -- core         # Run only core tests
```

### Build & Deploy
```bash
npm run build            # Production build → dist/
npm run preview          # Preview production build
```

### Mac Mini Kiosk Mode
```bash
# Launch Chrome in fullscreen kiosk
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --disable-session-crashed-bubble \
  --disable-infobars \
  http://localhost:5174/installation.html
```

---

## 10. Common Patterns

### ✅ DO: Separate Visual from Logic

```javascript
// Collision uses FIXED hitbox, visual is dynamic GoL
class Enemy {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.gol = new GoLEngine(6, 6, 15)      // Visual
    this.hitbox = {x, y, radius: 30}        // Collision (FIXED)
  }

  update() {
    this.gol.updateThrottled(frameCount)   // Update visual
    this.x += this.vx                      // Update position
    this.hitbox.x = this.x                 // Sync hitbox
  }

  checkCollision(other) {
    // Use FIXED hitbox, NOT GoL cells
    return Collision.circleCircle(
      this.hitbox.x, this.hitbox.y, this.hitbox.radius,
      other.hitbox.x, other.hitbox.y, other.hitbox.radius
    )
  }
}
```

### ✅ DO: Use Life Force for Critical Sprites

```javascript
class Player {
  update() {
    this.gol.updateThrottled(frameCount)
    applyLifeForce(this)  // Ensure core never dies
  }
}

function applyLifeForce(entity) {
  const coreRegion = getCenterRegion(entity, 0.3)
  const aliveCoreCount = countAliveIn(entity.gol, coreRegion)

  if (aliveCoreCount < coreRegion.area * 0.4) {
    birthRandomInRegion(entity.gol, coreRegion, 5)
  }
}
```

### ✅ DO: Use Real GoL Patterns

```javascript
// Use established patterns from LifeWiki
class PowerUp {
  constructor(x, y) {
    this.gol = new GoLEngine(13, 13, 12)
    this.gol.setPattern(Patterns.PULSAR, 0, 0)  // Real oscillator
  }
}
```

### ❌ DON'T: Mix GoL with Game Logic

```javascript
// WRONG - Using GoL cells for collision (unpredictable!)
class Enemy {
  checkCollision(other) {
    for (let cell of this.aliveCells) {
      if (other.contains(cell.x, cell.y)) {
        return true  // BUG: cells change every frame!
      }
    }
  }
}
```

---

## 11. Hardware Integration

### Arcade Controls (USB Encoder → Keyboard)

**Button Mapping:**
```javascript
const ARCADE_CONTROLS = {
  // Movement
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',

  // Actions
  Space: 'BUTTON_1',    // Jump, shoot, confirm
  KeyZ: 'BUTTON_1',     // Alternative
  KeyX: 'BUTTON_2',     // Special, back
  KeyC: 'BUTTON_3',     // Menu, pause

  // System
  Enter: 'START',
  Escape: 'SELECT'
}
```

**Input Manager:**
```javascript
class InputManager {
  constructor() {
    this.keys = {}
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
    })
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  isPressed(keyCode) {
    return this.keys[keyCode] || false
  }
}
```

---

## 12. AI Coding Assistant Instructions

When working with this codebase:

### MUST DO:

1. **Read existing code first** to understand patterns
2. **Use p5.js GLOBAL mode** (never `this.` for p5 functions)
3. **Follow B3/S23 rules exactly** for GoL (double buffer mandatory)
4. **Separate visual (GoL) from logic (hitbox)** for collision
5. **Use established GoL patterns** (Patterns.BLINKER, PULSAR, etc.)
6. **Target 60fps** (profile if drops, optimize GoL grid sizes)
7. **Write tests** mirroring src/ structure
8. **Document deviations** from pure B3/S23 (with rationale)
9. **Use verbose JSDoc** for public APIs with examples
10. **Test in fullscreen** (arcade installation requirement)

### NEVER DO:

1. **Never use p5.js instance mode** (`this.createCanvas()` is WRONG)
2. **Never modify grid while reading** (use double buffer)
3. **Never use GoL cells for collision** (fixed hitboxes only)
4. **Never invent GoL patterns** (use LifeWiki canonical patterns)
5. **Never sacrifice authenticity** without documenting why
6. **Never pass 'this' to helpers** (helpers use globals)
7. **Never skip tests** (96.4% coverage minimum)
8. **Never optimize prematurely** (Mac M4 is overpowered)

### ARCADE-SPECIFIC:

1. **Single life only** (no continues)
2. **Keyboard controls** (arcade encoder maps to keyboard)
3. **Full-screen kiosk** (portrait 1200×1920, vertical orientation)
4. **6 screen flow** (attract → gallery → code → game → score → leaderboard)
5. **localStorage persistence** (leaderboard only)
6. **30s timeouts** (auto-loop to attract screen)
7. **3-letter initials** (A-Z, arcade-style input)

---

## 13. Project Context

**This is an art installation showcasing Conway's Game of Life.**

### Decision Priority:
1. Visual beauty (organic, alive, emergent)
2. Authenticity (B3/S23 where viable)
3. Simplicity (KISS over clever)

### Not Goals:
- ❌ High scores sync (local only)
- ❌ Multiplayer (single player arcade)
- ❌ Mobile support (Mac Mini kiosk only)
- ❌ Audio (TBD by client)

### Key Resources:
- LifeWiki: https://conwaylife.com/wiki/
- Golly: http://golly.sourceforge.net/
- p5.js Docs: https://p5js.org/reference/

### Archon MCP Project ID:
`9ebdf1e2-ed0a-422f-8941-98191481f305`

### Archon RAG Knowledge Base

**CRITICAL: Always search Archon knowledge base BEFORE external searches or URLs**

Use `mcp__archon__rag_search_knowledge_base()` to search available sources:

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| `141a7d7e14c8b58b` | Conwaylife Wiki | 127k | Complete GoL patterns catalog, rules, theory |
| `22832de63c03f570` | Vite Documentation | 60k | Dev server, HMR, build configuration |
| `da752d5fc3c907ba` | Vitest Documentation | 113k | Testing API, matchers, configuration |
| `04f933e8f516da35` | Typed.js (GitHub) | 188k | Typewriter effects, animations, configuration |
| `e17c0329eb0f6098` | Prism.js Documentation | 50k | Syntax highlighting, languages, themes |
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `42a1fc677ff1afe4` | Nature of Code - CA | 189k | Cellular automata theory, GoL implementation |
| `b10ed112d80b75a1` | Wikipedia - GoL | 7.6k | B3/S23 rules, pattern overview |
| `8c1ae5409263093b` | Wikipedia - Spaceship | 1k | Moving GoL patterns |
| `5d5b65af576c1c87` | P5.js GoL Example | 749 | Working GoL implementation |
| `61fecfc7b8236399` | Processing GoL | 1.4k | Reference implementation |

**Research Pattern:**
```javascript
// 1. Search Archon FIRST
const results = await mcp__archon__rag_search_knowledge_base({
  query: "vite dev server configuration",
  source_id: "22832de63c03f570",  // Vite docs
  match_count: 5
})

// 2. Search code examples
const examples = await mcp__archon__rag_search_code_examples({
  query: "vitest test setup",
  match_count: 3
})

// 3. Only use external URLs if Archon searches insufficient
```

---

**When in doubt:** Choose the solution that looks more organic and alive (GoL emergence), is more authentic (B3/S23), and is simpler to implement (KISS).

The Mac M4 is overpowered. Focus on creating something visually stunning.
