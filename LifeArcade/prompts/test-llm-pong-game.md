# LLM Test Prompt - Pong Game with Conway's Game of Life

## Your Task

Create a complete Pong game using the Game of Life Arcade framework. Follow the framework pattern documentation below EXACTLY.

---

## Game Request

**Game:** Classic Pong with cellular automaton aesthetic

**Mechanics:**
- Two paddles: Player (left) vs AI (right)
- Ball bounces between paddles and walls
- Ball speeds up slightly after each paddle hit (max speed cap)
- Point scored when ball passes a paddle
- First to 5 points wins
- AI follows ball Y position with slight delay (not perfect)
- Single life (no continues)

**Visual Design:**
- Player paddle (left): 180×180 blue gradient, Modified GoL (life force)
- AI paddle (right): 180×180 red gradient, Modified GoL (life force)
- Ball: 180×180 yellow gradient, Visual Only (maintain density)
- Background: White (#FFFFFF)
- UI: Google brand colors
- Center line: Dotted line (optional, can use simple rect)

**Controls:**
- W/S or Arrow Up/Down: Move player paddle
- Space: Restart after win/lose

**Specific Requirements:**
1. Ball starts at center, random direction (left or right)
2. Ball speed: starts at 15 px/frame, increases by 1.5 after each hit (max 30)
3. Paddle height: 540 pixels (use 3 segments of 180×180 stacked vertically)
4. Paddle speed: 18 px/frame
5. AI reaction delay: moves toward ball.y with 70% speed
6. Display score: "PLAYER: X | AI: Y"
7. Show controls: "W/S or ↑↓: Move | SPACE: Restart"
8. Win condition: First to 5 points
9. Show "YOU WIN!" or "AI WINS!" at end
10. Ball resets to center after each point

**Technical Specs:**
- Canvas: 1200×1920 (portrait, responsive)
- Paddle segments: 180×180 each (3 segments = 540 total height)
- Ball: 180×180
- Ball initial speed: 15 px/frame
- Ball max speed: 30 px/frame
- Paddle speed: 18 px/frame
- AI speed factor: 0.7 (70% of ball's Y velocity)
- Winning score: 5

**Collision Detection:**
- Use Collision.circleRect() for ball vs paddle (treat ball as circle, paddle as rect)
- Ball bounces off top/bottom walls
- Ball passes left/right boundaries = point scored

**GoL Evolution:**
- Player paddle: GoLEngine(6, 6, 12) with applyLifeForce()
- AI paddle: GoLEngine(6, 6, 12) with applyLifeForce()
- Ball: GoLEngine(6, 6, 0) with maintainDensity() - Visual Only

**Responsive Canvas:**
- BASE_WIDTH = 1200, BASE_HEIGHT = 1920
- ASPECT_RATIO = 0.625 (10:16 portrait)
- Use calculateResponsiveSize() to fit window
- Scale rendering with scaleFactor
- Implement windowResized handler

**postMessage Integration:**
- Send 'gameOver' message to parent on win/lose
- Only in installation mode (window.parent !== window)

**DYING Phase:**
- Use GAMEOVER_CONFIG (MIN_DELAY: 30, MAX_WAIT: 150)
- Show particles during death animation
- Transition to GAMEOVER after particles or max wait

---

## Framework Documentation

Use this documentation to implement the game. Follow it EXACTLY.

---

# Game of Life Arcade - Framework Pattern

## Purpose

This document defines the **standard pattern** for creating games in the GoL Arcade project. It is optimized for LLM consumption to minimize errors when generating new games.

---

## CRITICAL: p5.js Global Mode

**All games in this framework use p5.js GLOBAL MODE, not instance mode.**

### What This Means:

```javascript
// ✅ CORRECT (Global Mode - what we use)
function setup() {
  createCanvas(800, 600)
  fill(255, 0, 0)
  rect(10, 10, 50, 50)
}

// ❌ WRONG (Instance Mode - do NOT use)
function setup() {
  this.createCanvas(800, 600)  // NO 'this'
  this.fill(255, 0, 0)         // NO 'this'
  this.rect(10, 10, 50, 50)    // NO 'this'
}
```

### Key Rules:

1. **NEVER use `this` or `p5` prefix for p5.js functions**
   - `fill()` not `this.fill()` or `p5.fill()`
   - `rect()` not `this.rect()` or `p5.rect()`
   - `random()` not `this.random()` or `p5.random()`

2. **Helper functions do NOT receive `this` or `p5` parameter**
   ```javascript
   // ✅ CORRECT
   renderGameUI(CONFIG, state, controls)
   renderParticles(particles, maskedRenderer)

   // ❌ WRONG
   renderGameUI(this, CONFIG, state, controls)
   renderParticles(particles, maskedRenderer, this)
   ```

3. **Exception: SimpleGradientRenderer constructor**
   ```javascript
   // This is the ONLY place where 'this' is used
   maskedRenderer = new SimpleGradientRenderer(this)
   ```

---

## Quick Start

**To create a new game:**

1. Copy `src/game-template.js` to `games/your-game.js`
2. Modify the marked `// CUSTOMIZE THIS` sections
3. Create HTML file at `games/your-game.html` using standard structure
4. Follow the standards below

---

## Standard Structure

Every game MUST follow this exact structure:

```javascript
// ===== IMPORTS (Standard - DO NOT MODIFY) =====
import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from '../src/utils/UIHelpers.js'

// ===== BASE CONFIGURATION (Portrait 1200×1920) =====
const BASE_WIDTH = 1200
const BASE_HEIGHT = 1920
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT  // 0.625 (10:16 portrait)

const CONFIG = {
  width: 1200,   // Will be updated dynamically
  height: 1920,  // Will be updated dynamically
  ui: { /* STANDARD - DO NOT MODIFY */ }
  // ... game-specific config
}

// Store scale factor for rendering
let scaleFactor = 1
let canvasWidth = BASE_WIDTH
let canvasHeight = BASE_HEIGHT

// Game Over configuration
const GAMEOVER_CONFIG = {
  MIN_DELAY: 30,   // 0.5s minimum feedback
  MAX_WAIT: 150    // 2.5s maximum wait
}

// ===== STATE =====
const state = {
  score: 0,
  lives: 1,  // ALWAYS 1
  phase: 'PLAYING',   // PLAYING | DYING | GAMEOVER | WIN
  frameCount: 0,
  dyingTimer: 0       // Frames since entered DYING phase
}

// ===== ENTITIES =====
let player = null
let enemies = []
let particles = []
let maskedRenderer = null

// ===== RESPONSIVE SIZING =====
function calculateResponsiveSize() {
  const windowAspect = windowWidth / windowHeight
  if (windowAspect > ASPECT_RATIO) {
    return { height: windowHeight, width: windowHeight * ASPECT_RATIO }
  } else {
    return { width: windowWidth, height: windowWidth / ASPECT_RATIO }
  }
}

function updateConfigScale() {
  scaleFactor = canvasHeight / BASE_HEIGHT
}

// ===== SETUP =====
function setup() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  createCanvas(canvasWidth, canvasHeight)
  frameRate(60)
  maskedRenderer = new SimpleGradientRenderer(this)
  initGame()
}

// ===== UPDATE LOOP =====
function draw() {
  state.frameCount++
  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    state.dyingTimer++
    particles = updateParticles(particles, state.frameCount)

    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'

      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'gameOver',
          payload: { score: state.score }
        }, '*')
      }
    }
  } else if (state.phase === 'GAMEOVER') {
    particles = updateParticles(particles, state.frameCount)
  }

  renderGame()
  renderUI()
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

// ===== WINDOW RESIZE =====
function windowResized() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  resizeCanvas(canvasWidth, canvasHeight)
}

// ===== EXPORTS =====
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
```

---

## Standards & Constants

### Entity Sizes (MUST FOLLOW - Portrait 1200×1920)

**All sizes scaled 3x from baseline:**

```javascript
// Main entities (player, paddles, invaders, bricks)
width: 180        // Scaled 3x from 60
height: 180       // Scaled 3x from 60
cellSize: 30      // Scaled 3x from 10
gol: new GoLEngine(6, 6, 12)  // Player (grid size stays same)
gol: new GoLEngine(6, 6, 15)  // Enemies

// Projectiles (bullets, ball)
width: 90         // Scaled 3x from 30
height: 90        // Scaled 3x from 30
cellSize: 30      // Scaled 3x from 10
gol: new GoLEngine(3, 3, 0)   // Visual Only (no evolution)
gol: new GoLEngine(3, 3, 15)  // Or with evolution

// Explosions
width: 90  // or 180 (scaled 3x)
height: 90  // or 180 (scaled 3x)
cellSize: 30      // Scaled 3x from 10
gol: new GoLEngine(3, 3, 30)  // Fast evolution
```

### GoL Evolution Speeds (MUST FOLLOW)

```javascript
Player:       12 fps
Enemies:      15 fps
Bullets:       0 fps (Visual Only) or 15 fps
Explosions:   30 fps (fast chaotic evolution)
```

### UI Configuration (DO NOT MODIFY)

```javascript
ui: {
  backgroundColor: '#FFFFFF',
  textColor: '#5f6368',
  accentColor: '#1a73e8',
  font: 'Google Sans, Arial, sans-serif',
  fontSize: 16
}
```

### State (Standard Fields)

```javascript
state: {
  score: 0,
  lives: 1,           // ALWAYS 1
  phase: 'PLAYING',   // PLAYING | GAMEOVER | WIN
  frameCount: 0
}
```

---

## Helper Functions

### GoLHelpers.js

```javascript
// Seed entities with organic circular shapes
seedRadialDensity(entity.gol, 0.85, 0.0)  // Player
seedRadialDensity(entity.gol, 0.75, 0.0)  // Enemies

// Maintain minimum density (Modified GoL)
applyLifeForce(entity)  // For player, critical enemies

// Maintain exact density (Visual Only - no evolution)
maintainDensity(entity, 0.75)  // For bullets, small obstacles
```

### ParticleHelpers.js

```javascript
// Update all particles (call every frame)
particles = updateParticles(particles, state.frameCount)

// Render particles with alpha
renderParticles(particles, maskedRenderer)
```

### UIHelpers.js

```javascript
// Render standard UI
renderGameUI(CONFIG, state, [
  '← → or A/D: Move',
  'SPACE: Jump'
])

// Render game over screen
renderGameOver(width, height, state.score)

// Render win screen (for games like Breakout)
renderWin(width, height, state.score)
```

---

## Available Methods Reference

### GoLEngine Methods

All methods available on `GoLEngine` instances (created with `new GoLEngine(cols, rows, fps)`):

```javascript
// Core Methods
engine.setCell(x, y, state)              // Set cell to ALIVE (1) or DEAD (0)
engine.getCell(x, y)                     // Get cell state (1 or 0)
engine.clearGrid()                       // Clear all cells to DEAD
engine.randomSeed(density)               // Seed with random cells (density 0.0-1.0)

// Pattern Methods
engine.setPattern(pattern, x, y)         // Stamp a pattern at position
engine.getPattern()                      // Get entire grid as 2D array
engine.getRegion(x, y, width, height)    // Get rectangular region

// Update Methods
engine.update()                          // Update one generation (call every frame)
engine.updateThrottled(frameCount)       // Update with FPS throttling (recommended)

// Statistics
engine.countAliveCells()                 // Count total alive cells
engine.getDensity()                      // Get density (0.0 to 1.0)

// Properties (read-only)
engine.cols                              // Number of columns
engine.rows                              // Number of rows
engine.generation                        // Current generation number
engine.current                           // Current grid (2D array)
```

### Collision Methods

All methods available on the `Collision` utility object:

```javascript
// AABB (rectangle) collision
Collision.rectRect(x1, y1, w1, h1, x2, y2, w2, h2)  // Returns boolean

// Circle collision
Collision.circleCircle(x1, y1, r1, x2, y2, r2)      // Returns boolean

// Circle vs Rectangle collision
Collision.circleRect(cx, cy, r, rx, ry, rw, rh)     // Returns boolean

// Point in Rectangle
Collision.pointInRect(px, py, rx, ry, rw, rh)       // Returns boolean

// Utility functions
Collision.distance(x1, y1, x2, y2)                  // Euclidean distance
Collision.clamp(value, min, max)                    // Clamp value to range
Collision.lerp(a, b, t)                             // Linear interpolation
```

**CRITICAL:** Use `Collision.rectRect()` for rectangle collision, NOT `Collision.check()`

### Patterns Available

Access via `Patterns` object (e.g., `Patterns.BLINKER`):

```javascript
// Still Lifes (never change)
Patterns.BLOCK              // 2×2 square
Patterns.BEEHIVE            // 4×3 hexagon
Patterns.LOAF               // 4×4 loaf shape
Patterns.BOAT               // 3×3 boat

// Oscillators (repeat)
Patterns.BLINKER            // 3×1, period 2
Patterns.TOAD               // 4×2, period 2
Patterns.BEACON             // 4×4, period 2
Patterns.PULSAR             // 13×13, period 3

// Spaceships (move)
Patterns.GLIDER             // 3×3, diagonal
Patterns.LIGHTWEIGHT_SPACESHIP  // 5×4, horizontal

// Methuselahs (evolve for long time)
Patterns.R_PENTOMINO        // 3×3, chaotic
Patterns.ACORN              // 7×3, long evolution
```

**Usage:**
```javascript
// Stamp pattern at position
entity.gol.setPattern(Patterns.PULSAR, 0, 0)
entity.gol.setPattern(Patterns.BLINKER, 2, 2)
```

---

## Gradient Presets

```javascript
GRADIENT_PRESETS.PLAYER         // Blue gradient
GRADIENT_PRESETS.ENEMY_HOT      // Red-orange gradient
GRADIENT_PRESETS.ENEMY_COLD     // Blue-purple gradient
GRADIENT_PRESETS.ENEMY_RAINBOW  // Multi-color gradient
GRADIENT_PRESETS.BULLET         // Yellow gradient
GRADIENT_PRESETS.EXPLOSION      // Red-yellow gradient
```

---

## Entity Creation Pattern

### Player

```javascript
function setupPlayer() {
  player = {
    x: CONFIG.width / 2,
    y: CONFIG.height - 300,
    width: 180,        // Scaled 3x from 60
    height: 180,       // Scaled 3x from 60
    cellSize: 30,      // Scaled 3x from 10
    gol: new GoLEngine(6, 6, 12),
    gradient: GRADIENT_PRESETS.PLAYER
  }

  seedRadialDensity(player.gol, 0.85, 0.0)
  player.gol.setPattern(Patterns.BLINKER, 2, 2)  // Optional accent
}

// Update player
function updatePlayer() {
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)  // Keep player alive
}

// Render player (hide during game over) with scaleFactor
push()
scale(scaleFactor)

if (state.phase !== 'GAMEOVER') {
  maskedRenderer.renderMaskedGrid(
    player.gol,
    player.x,
    player.y,
    player.cellSize,
    player.gradient
  )
}

pop()
```

### Enemies

```javascript
function setupEnemy() {
  const enemy = {
    x: 200,
    y: 100,
    width: 180,        // Scaled 3x from 60
    height: 180,       // Scaled 3x from 60
    cellSize: 30,      // Scaled 3x from 10
    gol: new GoLEngine(6, 6, 15),
    gradient: GRADIENT_PRESETS.ENEMY_HOT,
    dead: false
  }

  seedRadialDensity(enemy.gol, 0.75, 0.0)
  enemies.push(enemy)
}

// Update enemies
enemies.forEach(enemy => {
  enemy.gol.updateThrottled(state.frameCount)
  applyLifeForce(enemy)  // Maintain visual consistency
})
```

### Bullets (Visual Only)

```javascript
function shootBullet() {
  const bullet = {
    x: player.x + player.width / 2,
    y: player.y,
    width: 90,         // Scaled 3x from 30
    height: 90,        // Scaled 3x from 30
    cellSize: 30,      // Scaled 3x from 10
    vy: -24,          // Scaled 3x from -8
    gol: new GoLEngine(3, 3, 0),  // 0 fps = no evolution
    gradient: GRADIENT_PRESETS.BULLET,
    dead: false
  }

  seedRadialDensity(bullet.gol, 0.9, 0.0)
  bullets.push(bullet)
}

// Update bullets (Visual Only - maintain density)
if (state.frameCount % 5 === 0) {
  maintainDensity(bullet, 0.75)
}
```

### Explosions

```javascript
function spawnExplosion(x, y) {
  for (let i = 0; i < 6; i++) {
    const particle = {
      x: x + random(-30, 30),    // Scaled 3x from -10, 10
      y: y + random(-30, 30),    // Scaled 3x from -10, 10
      vx: random(-9, 9),         // Scaled 3x from -3, 3
      vy: random(-9, 9),         // Scaled 3x from -3, 3
      alpha: 255,
      width: 90,                 // Scaled 3x from 30
      height: 90,                // Scaled 3x from 30
      gol: new GoLEngine(3, 3, 30),  // Fast evolution
      cellSize: 30,              // Scaled 3x from 10
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    seedRadialDensity(particle.gol, 0.8, 0.0)
    particles.push(particle)
  }
}
```

---

## HTML Template

Every game MUST use this exact HTML structure:

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Game - Game of Life Arcade</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Google Sans', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>
  <script type="module" src="/games/your-game.js"></script>
</body>
</html>
```

---

## Checklist for New Games (Portrait 1200×1920)

When creating a new game, verify:

- ✅ All imports from template are present
- ✅ BASE_WIDTH = 1200, BASE_HEIGHT = 1920, ASPECT_RATIO = 0.625
- ✅ scaleFactor, canvasWidth, canvasHeight defined
- ✅ GAMEOVER_CONFIG with MIN_DELAY and MAX_WAIT
- ✅ CONFIG.ui is identical to template (DO NOT MODIFY)
- ✅ state.lives = 1 (ALWAYS)
- ✅ state.dyingTimer = 0 in state
- ✅ Player: 180×180, cellSize 30, GoLEngine(6, 6, 12)
- ✅ Enemies: 180×180, cellSize 30, GoLEngine(6, 6, 15)
- ✅ Bullets: 90×90, cellSize 30, GoLEngine(3, 3, 0 or 15)
- ✅ Explosions: 90×90, cellSize 30, GoLEngine(3, 3, 30)
- ✅ Use seedRadialDensity() for all entities
- ✅ Use applyLifeForce() for player/critical enemies
- ✅ Use maintainDensity() for bullets
- ✅ Use updateParticles() and renderParticles() for explosions
- ✅ Use renderGameUI() and renderGameOver()
- ✅ Player hidden during DYING and GAMEOVER
- ✅ Particles continue updating during DYING and GAMEOVER
- ✅ DYING phase with GAMEOVER_CONFIG timers
- ✅ postMessage on game over (installation mode only)
- ✅ Rendering with push/scale/pop pattern
- ✅ calculateResponsiveSize() function implemented
- ✅ updateConfigScale() function implemented
- ✅ windowResized() handler implemented
- ✅ windowResized exported in window.windowResized
- ✅ HTML uses exact template structure

---

## Common Patterns

### Game Over with Explosion and DYING Phase

```javascript
function checkCollisions() {
  if (collision) {
    state.phase = 'DYING'
    state.dyingTimer = 0
    spawnExplosion(player.x + player.width/2, player.y + player.height/2)
  }
}

// In draw()
if (state.phase === 'DYING') {
  state.dyingTimer++
  particles = updateParticles(particles, state.frameCount)

  const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
  const particlesDone = particles.length === 0
  const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

  if ((particlesDone && minDelayPassed) || maxWaitReached) {
    state.phase = 'GAMEOVER'

    // Send postMessage to parent if in installation
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameOver',
        payload: { score: state.score }
      }, '*')
    }
  }
} else if (state.phase === 'GAMEOVER') {
  particles = updateParticles(particles, state.frameCount)  // Continue explosions
}

// In renderGame() with scaleFactor
push()
scale(scaleFactor)

if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
  maskedRenderer.renderMaskedGrid(...)  // Hide player during DYING and GAMEOVER
}

renderParticles(particles, maskedRenderer)
pop()
```

### Multiple Enemy Types

```javascript
const ENEMY_TYPES = [
  { gradient: GRADIENT_PRESETS.ENEMY_HOT, density: 0.8 },
  { gradient: GRADIENT_PRESETS.ENEMY_COLD, density: 0.75 },
  { gradient: GRADIENT_PRESETS.ENEMY_RAINBOW, density: 0.7 }
]

function spawnEnemy() {
  const type = random(ENEMY_TYPES)
  const enemy = {
    // ... standard setup
    gradient: type.gradient
  }
  seedRadialDensity(enemy.gol, type.density, 0.0)
}
```

---

## Anti-Patterns (DO NOT DO)

❌ **Don't modify CONFIG.ui values**
```javascript
// WRONG
CONFIG.ui.backgroundColor = '#000000'
```

❌ **Don't use multiple lives**
```javascript
// WRONG
state.lives = 3
```

❌ **Don't use inconsistent sizes**
```javascript
// WRONG
player = { width: 50, height: 50 }  // Must be 180×180 (portrait)
player = { width: 60, height: 60 }  // Old size for 800×600 (obsolete)
```

❌ **Don't evolve bullets**
```javascript
// WRONG
bullet.gol.updateThrottled(state.frameCount)  // Bullets are Visual Only
```

❌ **Don't forget to hide player during game over**
```javascript
// WRONG - Player should not be visible during DYING or GAMEOVER
maskedRenderer.renderMaskedGrid(player.gol, ...)
```

❌ **Don't forget scaleFactor rendering**
```javascript
// WRONG - Direct rendering without scale
function renderGame() {
  maskedRenderer.renderMaskedGrid(player.gol, player.x, player.y, player.cellSize, player.gradient)
}

// CORRECT - With scaleFactor
function renderGame() {
  push()
  scale(scaleFactor)
  maskedRenderer.renderMaskedGrid(player.gol, player.x, player.y, player.cellSize, player.gradient)
  pop()
}
```

❌ **Don't forget windowResized handler**
```javascript
// WRONG - Missing export
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed

// CORRECT - Include windowResized
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
```

---

## Common Pitfalls

### 1. Using `this` with Helper Functions

```javascript
// ❌ WRONG - Most common error
renderGameUI(this, CONFIG, state, controls)
renderParticles(particles, maskedRenderer, this)
renderGameOver(this, width, height, state.score)

// ✅ CORRECT
renderGameUI(CONFIG, state, controls)
renderParticles(particles, maskedRenderer)
renderGameOver(width, height, state.score)
```

**Why:** Helpers use global p5.js functions, they don't need the p5 instance.

---

### 2. Using `this` or `p5.` Prefix for p5 Functions

```javascript
// ❌ WRONG
this.fill(255)
this.rect(10, 10, 50, 50)
p5.random(0, 100)

// ✅ CORRECT
fill(255)
rect(10, 10, 50, 50)
random(0, 100)
```

**Why:** We use global mode, not instance mode.

---

### 3. Forgetting to Update Particles During Game Over

```javascript
// ❌ WRONG - Explosion stops immediately
function draw() {
  if (state.phase === 'PLAYING') {
    updateGame()
  }
  renderGame()
}

// ✅ CORRECT - Explosion continues through DYING and GAMEOVER
function draw() {
  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    state.dyingTimer++
    particles = updateParticles(particles, state.frameCount)

    // Check transition to GAMEOVER
    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'

      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'gameOver',
          payload: { score: state.score }
        }, '*')
      }
    }
  } else if (state.phase === 'GAMEOVER') {
    particles = updateParticles(particles, state.frameCount)
  }
  renderGame()
}
```

**Why:** Explosion particles need to continue animating after player dies, and postMessage needs to be sent after visual feedback.

---

### 4. Showing Player During Game Over

```javascript
// ❌ WRONG - Player visible after death
function renderGame() {
  maskedRenderer.renderMaskedGrid(player.gol, ...)
}

// ✅ CORRECT - Hide player during DYING and GAMEOVER
function renderGame() {
  push()
  scale(scaleFactor)

  if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
    maskedRenderer.renderMaskedGrid(player.gol, ...)
  }

  renderParticles(particles, maskedRenderer)
  pop()
}
```

**Why:** Player should disappear when explosion happens (DYING phase), and rendering needs scaleFactor.

---

### 5. Evolving Visual Only Entities

```javascript
// ❌ WRONG - Bullets evolve unpredictably
bullet.gol = new GoLEngine(3, 3, 15)
bullet.gol.updateThrottled(state.frameCount)

// ✅ CORRECT - Bullets maintain density
bullet.gol = new GoLEngine(3, 3, 0)  // 0 fps
if (state.frameCount % 5 === 0) {
  maintainDensity(bullet, 0.75)
}
```

**Why:** Bullets need predictable appearance for gameplay.

---

### 6. Wrong Import Paths

```javascript
// ❌ WRONG - Missing '../'
import { updateParticles } from '../utils/ParticleHelpers.js'

// ✅ CORRECT - Relative to games/
import { updateParticles } from '../src/utils/ParticleHelpers.js'
```

**Why:** Games are in `games/`, helpers are in `src/utils/`.

---

### 7. Using Multiple Lives

```javascript
// ❌ WRONG
state.lives = 3

// ✅ CORRECT
state.lives = 1  // ALWAYS 1
```

**Why:** This is an arcade installation, one life only.

---

## File Locations

- **Helpers**: `src/utils/GoLHelpers.js`, `ParticleHelpers.js`, `UIHelpers.js`
- **Template**: `src/game-template.js`
- **Games**: `games/your-game.js`
- **HTML**: `games/your-game.html`
- **Core**: `src/core/GoLEngine.js`
- **Rendering**: `src/rendering/SimpleGradientRenderer.js`
- **Presets**: `src/utils/GradientPresets.js`

---

## Example: Minimal Working Game

See `src/game-template.js` for a complete, working example with all patterns implemented correctly.

---

## Questions?

If unsure about any pattern:
1. Check `src/game-template.js`
2. Check existing games: `games/space-invaders.js`, `games/dino-runner.js`, `games/breakout.js`, `games/asteroids.js`, `games/flappy-bird.js`
3. All games follow this exact pattern

---

## Output Instructions

Generate ONLY the JavaScript game file. The HTML wrapper will be created automatically.

**IMPORTANT:** Do NOT generate HTML. Only generate the complete JavaScript code.

### Output: games/pong.js

Create the complete Pong game JavaScript file. Include:
- All standard imports
- BASE_WIDTH, BASE_HEIGHT, ASPECT_RATIO constants
- scaleFactor, canvasWidth, canvasHeight variables
- GAMEOVER_CONFIG with MIN_DELAY and MAX_WAIT
- CONFIG with pong-specific settings (paddle dimensions, ball speed, AI settings)
- State with player score, AI score, dyingTimer
- Player paddle (left side, 3 segments vertically stacked)
- AI paddle (right side, 3 segments vertically stacked, follows ball)
- Ball entity with velocity and speed tracking
- Ball physics (bouncing off walls, paddles, speed increase)
- AI logic (follows ball Y with delay/damping)
- Score tracking (player vs AI)
- Win condition check (first to 5)
- Ball reset after each point
- Proper use of all helper functions
- Responsive canvas functions (calculateResponsiveSize, updateConfigScale)
- windowResized handler
- DYING phase management
- postMessage integration

**CRITICAL REQUIREMENTS:**
- Canvas: 1200×1920 (portrait, responsive)
- Paddle segments: 180×180 each, 3 stacked = 540px total height
- Player paddle: Modified GoL with life force, GRADIENT_PRESETS.PLAYER
- AI paddle: Modified GoL with life force, GRADIENT_PRESETS.ENEMY_HOT
- Ball: Visual Only (maintainDensity), GRADIENT_PRESETS.BULLET
- Ball size: 180×180, cellSize 30
- Ball radius: 90 (for collision detection, treat as circle)
- Use Collision.circleRect() for ball vs paddle collision
- Ball speed: starts 15 px/frame, increases +1.5 per hit, max 30
- Paddle speed: 18 px/frame
- AI speed: 0.7 * (ball.y - aiPaddle.centerY) per frame
- Display "PLAYER: X | AI: Y" in UI
- Controls: "W/S or ↑↓: Move | SPACE: Restart"
- Win message: "YOU WIN!" or "AI WINS!"
- Use renderWin() helper for win screen (check UIHelpers)
- Render with push/scale(scaleFactor)/pop pattern
- Export windowResized in window.windowResized

**Note:** The HTML file will be generated automatically with the correct title and script reference, so you don't need to create it.

---

## Validation Checklist

Before submitting, verify your code has:

- ✅ All imports match framework pattern exactly
- ✅ BASE_WIDTH = 1200, BASE_HEIGHT = 1920, ASPECT_RATIO = 0.625
- ✅ scaleFactor, canvasWidth, canvasHeight defined
- ✅ GAMEOVER_CONFIG with MIN_DELAY: 30, MAX_WAIT: 150
- ✅ CONFIG.ui identical to template (not modified)
- ✅ state.lives = 1 (not 3)
- ✅ state.dyingTimer = 0 in state
- ✅ Player paddle: 3 segments of 180×180, cellSize 30, Modified GoL
- ✅ AI paddle: 3 segments of 180×180, cellSize 30, Modified GoL
- ✅ Ball: 180×180, cellSize 30, Visual Only (0 fps evolution)
- ✅ Ball radius: 90 for collision detection
- ✅ Ball speed: starts 15, increases 1.5 per hit, max 30
- ✅ Paddle speed: 18 px/frame
- ✅ seedRadialDensity() used for all entities
- ✅ applyLifeForce() used for both paddles
- ✅ maintainDensity() used for ball
- ✅ renderGameUI() used for controls
- ✅ renderWin() used for win screen (or custom)
- ✅ Collision.circleRect() used for ball vs paddle
- ✅ NO use of 'this' with helper functions
- ✅ NO use of 'this.' prefix for p5.js functions
- ✅ Collision.clamp() used for paddle boundaries
- ✅ calculateResponsiveSize() function implemented
- ✅ updateConfigScale() function implemented
- ✅ windowResized() handler implemented
- ✅ Rendering with push/scale(scaleFactor)/pop
- ✅ DYING phase with timer and postMessage
- ✅ postMessage only if window.parent !== window
- ✅ renderGameOver only if window.parent === window
- ✅ window.setup, window.draw, window.keyPressed, window.windowResized exported
- ✅ Ball bounces off top/bottom walls
- ✅ Ball speeds up after each paddle hit
- ✅ AI follows ball with delay (not perfect)
- ✅ Score resets ball to center

---

## Output Format

Return ONLY the JavaScript code. No explanations, no markdown formatting, no HTML.

Start directly with the imports and end with the exports:

```javascript
// ===== IMPORTS (Standard - DO NOT MODIFY) =====
import { GoLEngine } from '../src/core/GoLEngine.js'
...

[YOUR COMPLETE GAME CODE]

...
// ===== EXPORTS =====
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
```

---

**BEGIN YOUR RESPONSE NOW. Generate the complete JavaScript file.**

