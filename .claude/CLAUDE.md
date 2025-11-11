# Game of Life Arcade - Development Instructions

## Project Overview

Interactive installation featuring 2-3 arcade games (Space Invaders, Pac-Man, Asteroids-style) with Conway's Game of Life aesthetic. Built with HTML/CSS + p5.js for Mac Mini M4, using custom arcade controls and procedurally generated cellular automaton visuals.

**Project ID (Archon MCP):** `9ebdf1e2-ed0a-422f-8941-98191481f305`

## Core Principles

1. **AUTHENTICITY OVER CONVENIENCE**
   - Cells must be generated procedurally with code (no static sprites)
   - Follow Smart Hybrid strategy: Pure GoL where viable, Modified GoL where needed
   - Background MUST be 100% Pure GoL (B3/S23 rules without modifications)

2. **KISS** (Keep It Simple, Stupid)
   - Prefer simple, readable solutions over clever abstractions

3. **YAGNI** (You Aren't Gonna Need It)
   - No persistence, high scores, or multiplayer (physical installation only)
   - Don't build features until they're actually needed

**Architecture:**
```
src/
├── core/           # GoL engine, input manager, state machine
├── rendering/      # Cell renderer, background, particles
├── entities/       # CellularSprite base, Player, Enemy, Bullet
├── games/          # BaseGame, DinoGame/, SpaceInvaders/, PacMan/
├── ui/             # MainMenu, PauseOverlay, HUD
└── utils/          # MaskGenerator, Collision, Patterns, Config
```

Each game is a vertical slice containing game logic, entities, and patterns.

---

## Conway's Game of Life Rules

**B3/S23 Algorithm (CRITICAL):**

```javascript
// For each cell, count its 8 neighbors (Moore neighborhood)
function applyGoLRules(currentGrid, nextGrid) {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      let neighbors = countLiveNeighbors(currentGrid, x, y)
      let currentState = currentGrid[x][y]

      if (currentState === ALIVE) {
        // Survival: 2 or 3 neighbors → survives
        // Death: < 2 (underpopulation) or > 3 (overpopulation) → dies
        nextGrid[x][y] = (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
      } else {
        // Birth: exactly 3 neighbors → becomes alive
        nextGrid[x][y] = (neighbors === 3) ? ALIVE : DEAD
      }
    }
  }
}
```

**CRITICAL: Double Buffer Pattern**
- NEVER modify grid while reading it
- Always use two grids and swap them after each generation
- Otherwise cells affect each other incorrectly

```javascript
// ✅ CORRECT
class GoLGrid {
  constructor() {
    this.current = create2DArray(cols, rows)
    this.next = create2DArray(cols, rows)
  }

  update() {
    this.applyRules(this.current, this.next)
    [this.current, this.next] = [this.next, this.current]  // Swap buffers
  }
}

// ❌ WRONG - Don't do this
class BadGoLGrid {
  update() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.grid[x][y] = this.calculateNextState(x, y)  // Modifying while reading!
      }
    }
  }
}
```

---

## Smart Hybrid Authenticity Strategy

**Different authenticity levels by context:**

```javascript
const AUTHENTICITY_STRATEGY = {
  // TIER 1: Pure GoL (100% authentic B3/S23)
  background: {
    type: 'PureGoL',
    ruleset: 'B3/S23',
    updateRate: 10,  // fps
    rationale: 'Showcase for real GoL, doesn\'t affect gameplay'
  },

  explosions: {
    type: 'PureGoL',
    pattern: 'Methuselahs',  // R-pentomino, etc
    rationale: 'Pure visual effect, wow factor'
  },

  powerups: {
    type: 'PureGoL',
    pattern: 'Oscillators',  // Pulsar, Beacon, Blinker
    rationale: 'Oscillators are naturally stable'
  },

  // TIER 2: Modified GoL (80% authentic)
  player: {
    type: 'ModifiedGoL',
    modifications: ['lifeForce', 'densityControl'],
    rationale: 'Needs stability but maintains emergence'
  },

  enemies_large: {
    type: 'ModifiedGoL',
    modifications: ['reseedSmart'],
    rationale: 'Visually interesting, stable but not critical'
  },

  // TIER 3: Visual Only (0% authentic)
  bullets: {
    type: 'VisualOnly',
    technique: 'static-with-flicker',
    rationale: 'Must be 100% predictable for gameplay'
  },

  enemies_small: {
    type: 'VisualOnly',
    technique: 'wave-animation',
    rationale: 'Too small for meaningful real GoL'
  }
}
```

**Key Principle:** Use Pure GoL wherever it doesn't harm gameplay. Use Modified GoL for critical entities. Use Visual Only only when absolutely necessary.

---

## Code Style & Standards

### JavaScript/p5.js Conventions

**1. Use ES6+ features:**
```javascript
// ✅ GOOD: Classes, arrow functions, destructuring
class Player extends CellularSprite {
  constructor({ x, y, size }) {
    super(x, y, size)
    this.velocity = { x: 0, y: 0 }
  }

  update = () => {
    const { x, y } = this.velocity
    this.move(x, y)
  }
}

// ❌ AVOID: Old-style constructors, var
function Player(x, y) {
  var self = this
  self.x = x
  self.y = y
}
```

**2. Consistent naming:**
```javascript
// Classes: PascalCase
class CellularSprite { }
class GoLBackground { }

// Constants: SCREAMING_SNAKE_CASE
const CELL_SIZE = 10
const UPDATE_RATE_FPS = 12

// Variables/functions: camelCase
let currentGeneration = 0
function countLiveNeighbors(grid, x, y) { }

// Private properties: prefix with underscore
class Sprite {
  constructor() {
    this._internalState = []
  }
}
```

**3. Use JSDoc comments for public APIs:**
```javascript
/**
 * Apply Conway's Game of Life rules to generate next generation.
 *
 * @param {number[][]} current - Current generation grid (2D array)
 * @param {number[][]} next - Next generation grid (2D array, modified in place)
 * @param {string} ruleset - Rule notation (default: 'B3/S23')
 * @returns {void}
 *
 * @example
 * const current = [[0, 1, 0], [0, 1, 0], [0, 1, 0]]  // Blinker pattern
 * const next = [[0, 0, 0], [1, 1, 1], [0, 0, 0]]
 * applyGoLRules(current, next, 'B3/S23')
 */
function applyGoLRules(current, next, ruleset = 'B3/S23') {
  // Implementation
}
```

**4. p5.js globals are allowed in sketch files:**
```javascript
// sketch.js - p5 instance mode preferred but global mode acceptable
function setup() {
  createCanvas(800, 600)
  background(0)
}

function draw() {
  // p5 globals like width, height, frameCount are OK here
  background(0)
  game.update()
  game.render()
}
```

---

## Performance Guidelines

**Target:** 60fps on Mac M4 at 1920x1080

**Budget per frame (16.67ms total):**
- GoL simulations: < 1ms (background + sprites)
- Game logic: < 5ms (physics, collision, AI)
- Rendering: < 10ms (draw calls, particles, effects)
- Buffer: 0.67ms (safety margin)

**GoL Optimization Rules:**

1. **Keep grids small:**
   ```javascript
   // ✅ GOOD: Reasonable grid sizes
   const background = new GoLGrid(60, 40)     // 2400 cells, ~0.1ms at 10fps
   const sprite = new GoLGrid(20, 20)         // 400 cells, ~0.05ms at 12fps

   // ❌ AVOID: Unnecessarily large grids
   const background = new GoLGrid(200, 150)   // 30,000 cells, ~5ms
   ```

2. **Variable update rates:**
   ```javascript
   // Update different elements at different rates
   background.updateRate = 10   // fps (every 6 frames at 60fps)
   player.updateRate = 12       // fps (every 5 frames at 60fps)
   explosion.updateRate = 30    // fps (every 2 frames at 60fps)
   ```

3. **Batch render cells:**
   ```javascript
   // ✅ GOOD: Single beginShape/endShape call
   function renderCells(grid) {
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
   }

   // ❌ AVOID: Individual shape calls in nested loops
   function renderCells(grid) {
     for (let x = 0; x < cols; x++) {
       for (let y = 0; y < rows; y++) {
         rect(x * cellSize, y * cellSize, cellSize, cellSize)  // Slow!
       }
     }
   }
   ```

4. **Use WebGL mode for large canvases:**
   ```javascript
   function setup() {
     createCanvas(1920, 1080, WEBGL)  // Hardware acceleration
   }
   ```

**No need for advanced optimizations** (Quadtrees, spatial hashing, etc) unless profiling shows issues. Mac M4 is overpowered for this project.

---

## GoL Pattern Library

**Use canonical patterns from literature:**

```javascript
// utils/Patterns.js
export const Patterns = {
  // Still Lifes (never change)
  BLOCK: [
    [1, 1],
    [1, 1]
  ],

  BEEHIVE: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0]
  ],

  // Oscillators (repeat after N generations)
  BLINKER: [
    [1, 1, 1]
  ],  // Period 2

  PULSAR: [
    // 13x13 pattern, period 3 (see LifeWiki for full pattern)
  ],

  // Spaceships (move across grid)
  GLIDER: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],  // Speed c/4 diagonal

  LIGHTWEIGHT_SPACESHIP: [
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0]
  ],  // Speed c/2 horizontal

  // Methuselahs (long evolution, small start)
  R_PENTOMINO: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0]
  ]  // 1,103 generations to stabilize
}
```

**Pattern attribution:**
- All patterns MUST come from established GoL literature
- Credit sources in comments (LifeWiki, Golly, etc)
- NEVER invent patterns and call them "GoL" - use real ones

---

## Common Patterns & Anti-Patterns

### ✅ DO: Separate Visual from Logic

```javascript
// ✅ GOOD: Collision uses fixed hitbox, visual is dynamic GoL
class Enemy extends CellularSprite {
  constructor(x, y) {
    super(x, y, 20, 20)  // 20x20 GoL grid
    this.hitbox = { x, y, radius: 10 }  // Fixed circular hitbox
  }

  update() {
    this.updateCells()  // Update GoL simulation (visual only)
    this.move()         // Update position (uses hitbox for collision)
  }

  checkCollision(other) {
    // Use FIXED hitbox, NOT dynamic GoL cells
    return dist(this.hitbox, other.hitbox) < this.hitbox.radius + other.hitbox.radius
  }
}
```

### ❌ DON'T: Mix GoL Simulation with Game Logic

```javascript
// ❌ BAD: Using GoL cell positions for collision (unpredictable)
class Enemy extends CellularSprite {
  checkCollision(other) {
    // This is WRONG - GoL cells change every frame!
    for (let cell of this.aliveCells) {
      if (other.contains(cell.x, cell.y)) {
        return true
      }
    }
  }
}
```

### ✅ DO: Use Life Force for Critical Sprites

```javascript
// ✅ GOOD: Player sprite never dies completely
class Player extends ModifiedGoLSprite {
  updateCells() {
    super.updateCells()  // Apply GoL rules
    this.ensureCoreAlive()  // Then apply life force
  }

  ensureCoreAlive() {
    const coreRegion = this.getCenterRegion(0.3)  // 30% of sprite
    const aliveCoreCount = this.countAliveIn(coreRegion)

    if (aliveCoreCount < coreRegion.area * 0.4) {
      // Force some core cells to live
      this.birthRandomInRegion(coreRegion, 5)
    }
  }
}
```

### ✅ DO: Use Real GoL Patterns

```javascript
// ✅ GOOD: Use established patterns from literature
class PowerUp extends PureGoLSprite {
  constructor(x, y) {
    super(x, y)
    this.seedPattern(Patterns.PULSAR)  // Real oscillator, period 3
  }
}

// ❌ BAD: Making up patterns and calling them "GoL"
class PowerUp extends PureGoLSprite {
  constructor(x, y) {
    super(x, y)
    this.seedRandom()  // Random cells != authentic GoL pattern
  }
}
```

---

## Hardware Integration

**Target hardware:** USB Arcade Encoder (Zero Delay or similar) mapped as keyboard

**Button mapping:**
```javascript
// InputManager.js
const ARCADE_BUTTON_MAP = {
  // Player 1 Controls
  ArrowUp: 'P1_UP',
  ArrowDown: 'P1_DOWN',
  ArrowLeft: 'P1_LEFT',
  ArrowRight: 'P1_RIGHT',
  KeyZ: 'P1_BUTTON_1',  // Primary action (jump, shoot)
  KeyX: 'P1_BUTTON_2',  // Secondary action (special, duck)
  KeyC: 'P1_BUTTON_3',  // Tertiary action (menu, pause)

  // System
  Enter: 'START',
  Escape: 'SELECT'
}

// Simple keyboard-only input manager (no gamepad support - YAGNI)
class InputManager {
  constructor() {
    this.keys = {}
    this.setupKeyboard()
  }

  setupKeyboard() {
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

**Note:** USB arcade encoders are configured to map directly as keyboard inputs, so no Gamepad API support needed.

---

## Development Workflow

**Setup:**
```bash
npm install vite
npm run dev      # Starts dev server with HMR on http://localhost:5173
```

**Production build:**
```bash
npm run build    # Optimized build in dist/
npm run preview  # Test production build locally
```

**Kiosk mode (Mac Mini deployment):**
```bash
# Launch Chrome in fullscreen kiosk mode
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --disable-session-crashed-bubble \
  --disable-infobars \
  http://localhost:5173
```

**Development best practices:**
- Use browser DevTools performance profiler if fps drops
- Test with arcade controls connected (if available)
- Verify all games work in fullscreen mode
- Check memory usage over extended sessions (installation runs for hours)

---

## Archon MCP Integration

**Use Archon tools for:**
- Task management: `find_tasks`, `manage_task`
- Documentation: `find_documents`, `manage_document`
- Research: `rag_search_knowledge_base`, `rag_search_code_examples`

**Task workflow:**
1. Search knowledge base before implementing
2. Create task with clear acceptance criteria
3. Update status: `todo` → `doing` → `review` → `done`
4. Tasks should be 30min-4hr in scope

**Before implementing new features:**
1. Search knowledge base for relevant GoL patterns or techniques
2. Check existing tasks to avoid duplication
3. Create task in Archon before starting work
4. Update task status as you progress

---

## Testing

**Tests mirror the source directory structure.** Every file in `src/` should have a corresponding test file.

**Structure:**
```
src/core/GoLEngine.js     →  tests/core/test_GoLEngine.js
src/entities/Player.js    →  tests/entities/test_Player.js
src/games/dino/DinoGame.js → tests/games/dino/test_DinoGame.js
```

### Unit Tests

**Focus:** Test individual components in isolation

**Examples:**
```javascript
// tests/core/test_GoLEngine.js
describe('GoLEngine', () => {
  test('applies B3/S23 rules correctly for Blinker pattern', () => {
    const engine = new GoLEngine(3, 3)
    // Gen 0: Horizontal blinker
    engine.setPattern([[0,1,0], [0,1,0], [0,1,0]])
    engine.update()
    // Gen 1: Vertical blinker
    expect(engine.getPattern()).toEqual([[0,0,0], [1,1,1], [0,0,0]])
  })

  test('uses double buffer (never modifies while reading)', () => {
    const engine = new GoLEngine(5, 5)
    const beforePtr = engine.current
    engine.update()
    // Pointers should be swapped, not modified in place
    expect(engine.current).not.toBe(beforePtr)
  })
})

// tests/utils/test_Patterns.js
describe('Patterns', () => {
  test('Glider pattern moves diagonally', () => {
    const engine = new GoLEngine(10, 10)
    engine.setPattern(Patterns.GLIDER, 2, 2)

    const initialCenter = engine.getCenterOfMass()

    // After 4 generations, glider moves 1 cell diagonally
    for (let i = 0; i < 4; i++) engine.update()

    const finalCenter = engine.getCenterOfMass()
    expect(finalCenter.x).toBeCloseTo(initialCenter.x + 1)
    expect(finalCenter.y).toBeCloseTo(initialCenter.y + 1)
  })
})
```

**Run unit tests:**
```bash
npm test                    # Run all tests
npm test -- core           # Run only core tests
npm test -- --watch        # Watch mode
```

### Integration Tests

**Focus:** Test multiple components together and full game functionality

**Use Chrome DevTools MCP for browser testing:**

```javascript
// tests/integration/test_DinoGame_browser.js
describe('DinoGame Integration', () => {
  test('game maintains 60fps with GoL background', async () => {
    // Use Chrome DevTools MCP to launch and monitor
    const page = await chrome.newPage('http://localhost:5173')

    // Start performance monitoring
    await chrome.performance.startTracing()

    // Play game for 10 seconds
    await chrome.keyboard.press('Space')  // Start game
    await chrome.wait(10000)

    const metrics = await chrome.performance.getMetrics()

    // Verify fps stays above 58 (allowing 2fps tolerance)
    expect(metrics.averageFPS).toBeGreaterThan(58)

    // Verify GoL simulation doesn't consume more than 1ms
    expect(metrics.golSimulationTime).toBeLessThan(1)
  })

  test('player collision with cactus ends game', async () => {
    const page = await chrome.newPage('http://localhost:5173')

    // Start game
    await chrome.keyboard.press('Space')

    // Wait for first cactus to appear
    await chrome.waitForSelector('.cactus')

    // Don't jump - let collision happen
    await chrome.waitForSelector('.game-over')

    const gameOverVisible = await chrome.isVisible('.game-over')
    expect(gameOverVisible).toBe(true)
  })

  test('GoL background follows B3/S23 rules', async () => {
    const page = await chrome.newPage('http://localhost:5173')

    // Inject known pattern into background
    await chrome.evaluate(() => {
      window.game.background.setPattern(Patterns.BLINKER, 10, 10)
    })

    // Capture pattern state
    const gen0 = await chrome.evaluate(() =>
      window.game.background.getRegion(9, 9, 3, 3)
    )

    // Wait for 2 generations (2 updates at 10fps = ~200ms)
    await chrome.wait(200)

    const gen2 = await chrome.evaluate(() =>
      window.game.background.getRegion(9, 9, 3, 3)
    )

    // Blinker should return to original state after 2 generations
    expect(gen2).toEqual(gen0)
  })
})
```

**Chrome DevTools MCP Usage:**

When testing the game:
1. **Launch game in Chrome:** Use MCP to open `http://localhost:5173`
2. **Monitor performance:** Track FPS, memory, GoL simulation time
3. **Interact with game:** Simulate keyboard input for testing
4. **Inspect canvas:** Verify GoL patterns evolve correctly
5. **Check console:** Verify no errors during gameplay
6. **Memory profiling:** Ensure no memory leaks during extended sessions

**Run integration tests:**
```bash
npm run test:integration              # Run all integration tests
npm run test:integration -- --headed  # Run with visible browser
```

### Testing Best Practices

**DO:**
- Test GoL patterns against known evolution sequences
- Verify double buffer is used (check pointer swaps)
- Test performance (60fps, < 1ms GoL time)
- Use Chrome DevTools MCP for visual/canvas testing
- Test keyboard input handling
- Verify collision detection with fixed hitboxes

**DON'T:**
- Test p5.js internals (trust the library)
- Test visual appearance (use manual testing)
- Over-test simple getters/setters
- Mock the GoL engine (test it directly)

---

## Key Technical Concepts

**Double Buffer Pattern:**
Critical for GoL. Never modify grid while reading it. Always use two grids and swap.

**Bounded GoL:**
Sprites use masks to constrain cells within shape. Cells outside mask are killed each frame.

**Re-seeding:**
When sprite has too few cells (< 20% of mask), inject new pattern to maintain visual identity.

**Density Maintenance:**
Keep cell density within target range (e.g., 40-60%) to prevent sprite from becoming too sparse or dense.

**Life Force Injection:**
Keep core region of sprite always partially alive (for player, critical enemies).

**Fixed Hitboxes:**
Collision uses fixed geometry (circles, rectangles). Visual is dynamic GoL. Never mix them.

---

## What's NOT Decided Yet

These decisions are pending and should be discussed with the user before implementing:

- **Color palette:** Terminal green, neon, multicolor - TBD
- **Typography:** Monospace retro vs bitmap arcade font
- **Audio/sound effects:** Not discussed yet
- **Exact games to implement:** Narrowed to Dinosaur Game first, Space Invaders second, but not finalized
- **Physical control hardware specifics:** Buttons, joystick layout, exact encoder model

---

## Resources

**Game of Life:**
- LifeWiki: https://conwaylife.com/wiki/
- Golly (reference implementation): http://golly.sourceforge.net/
- Nature of Code - Cellular Automata: Available in Archon knowledge base

**p5.js:**
- Official docs: https://p5js.org/reference/
- Examples: https://p5js.org/examples/

**Project Planning:**
- Full planning transcript: `transcript-2025-11-10-2017-gol-arcade-planning.md`
- Archon project: Search `rag_search_knowledge_base` for Game of Life documentation

---

## Final Note

This is an **art installation first, technical demo second**. When in doubt, choose the solution that:
1. Looks more organic and alive (GoL emergence)
2. Is more authentic to Conway's rules (B3/S23)
3. Is simpler to implement (KISS)

The Mac M4 is overpowered for this project. Don't over-optimize. Focus on creating something visually stunning that showcases the beauty of cellular automata.
