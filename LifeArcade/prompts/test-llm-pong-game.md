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
- Player paddle (left): 60×60 blue gradient, Modified GoL (life force)
- AI paddle (right): 60×60 red gradient, Modified GoL (life force)
- Ball: 60×60 yellow gradient, Visual Only (maintain density)
- Background: White (#FFFFFF)
- UI: Google brand colors
- Center line: Dotted line (optional, can use simple rect)

**Controls:**
- W/S or Arrow Up/Down: Move player paddle
- Space: Restart after win/lose

**Specific Requirements:**
1. Ball starts at center, random direction (left or right)
2. Ball speed: starts at 5 px/frame, increases by 0.5 after each hit (max 10)
3. Paddle height: 150 pixels (use 3 segments of 60×60 stacked vertically)
4. Paddle speed: 6 px/frame
5. AI reaction delay: moves toward ball.y with 70% speed
6. Display score: "PLAYER: X | AI: Y"
7. Show controls: "W/S or ↑↓: Move | SPACE: Restart"
8. Win condition: First to 5 points
9. Show "YOU WIN!" or "AI WINS!" at end
10. Ball resets to center after each point

**Technical Specs:**
- Canvas: 800×600
- Paddle segments: 60×60 each (3 segments = 180 total height)
- Ball: 60×60
- Ball initial speed: 5 px/frame
- Ball max speed: 10 px/frame
- Paddle speed: 6 px/frame
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

// ===== CONFIG =====
const CONFIG = {
  width: 800,
  height: 600,
  ui: { /* STANDARD - DO NOT MODIFY */ }
  // ... game-specific config
}

// ===== STATE =====
const state = {
  score: 0,
  lives: 1,  // ALWAYS 1
  phase: 'PLAYING',
  frameCount: 0
}

// ===== ENTITIES =====
let player = null
let enemies = []
let particles = []
let maskedRenderer = null

// ===== SETUP =====
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
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
  } else if (state.phase === 'GAMEOVER') {
    particles = updateParticles(particles, state.frameCount)
  }

  renderGame()
  renderUI()
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    renderGameOver(width, height, state.score)
  }
}

// ===== EXPORTS =====
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
```

---

## Standards & Constants

### Entity Sizes (MUST FOLLOW)

```javascript
// Main entities (player, invaders, bricks)
width: 60
height: 60
cellSize: 10
gol: new GoLEngine(6, 6, 12)  // Player
gol: new GoLEngine(6, 6, 15)  // Enemies

// Projectiles (bullets, ball)
width: 30
height: 30
cellSize: 10
gol: new GoLEngine(3, 3, 0)   // Visual Only (no evolution)
gol: new GoLEngine(3, 3, 15)  // Or with evolution

// Explosions
width: 30  // or 60
height: 30  // or 60
cellSize: 10
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
    y: CONFIG.height - 100,
    width: 60,
    height: 60,
    cellSize: 10,
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

// Render player (hide during game over)
if (state.phase !== 'GAMEOVER') {
  maskedRenderer.renderMaskedGrid(
    player.gol,
    player.x,
    player.y,
    player.cellSize,
    player.gradient
  )
}
```

### Enemies

```javascript
function setupEnemy() {
  const enemy = {
    x: 200,
    y: 100,
    width: 60,
    height: 60,
    cellSize: 10,
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
    width: 30,
    height: 30,
    cellSize: 10,
    vy: -8,
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
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255,
      width: 30,
      height: 30,
      gol: new GoLEngine(3, 3, 30),  // Fast evolution
      cellSize: 10,
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

## Checklist for New Games

When creating a new game, verify:

- ✅ All imports from template are present
- ✅ CONFIG.ui is identical to template (DO NOT MODIFY)
- ✅ state.lives = 1 (ALWAYS)
- ✅ Player: 60×60, cellSize 10, GoLEngine(6, 6, 12)
- ✅ Enemies: 60×60, cellSize 10, GoLEngine(6, 6, 15)
- ✅ Bullets: 30×30, cellSize 10, GoLEngine(3, 3, 0 or 15)
- ✅ Explosions: 30×30, cellSize 10, GoLEngine(3, 3, 30)
- ✅ Use seedRadialDensity() for all entities
- ✅ Use applyLifeForce() for player/critical enemies
- ✅ Use maintainDensity() for bullets
- ✅ Use updateParticles() and renderParticles() for explosions
- ✅ Use renderGameUI() and renderGameOver()
- ✅ Player hidden during GAMEOVER
- ✅ Particles continue updating during GAMEOVER
- ✅ HTML uses exact template structure

---

## Common Patterns

### Game Over with Explosion

```javascript
function checkCollisions() {
  if (collision) {
    state.phase = 'GAMEOVER'
    spawnExplosion(player.x + player.width/2, player.y + player.height/2)
  }
}

// In draw()
if (state.phase === 'GAMEOVER') {
  particles = updateParticles(particles, state.frameCount)  // Continue explosions
}

// In renderGame()
if (state.phase !== 'GAMEOVER') {
  maskedRenderer.renderMaskedGrid(...)  // Hide player
}
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
player = { width: 50, height: 50 }  // Must be 60×60
```

❌ **Don't evolve bullets**
```javascript
// WRONG
bullet.gol.updateThrottled(state.frameCount)  // Bullets are Visual Only
```

❌ **Don't forget to hide player during game over**
```javascript
// WRONG - Player should not be visible during GAMEOVER
maskedRenderer.renderMaskedGrid(player.gol, ...)
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

// ✅ CORRECT - Explosion continues
function draw() {
  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'GAMEOVER') {
    particles = updateParticles(particles, state.frameCount)
  }
  renderGame()
}
```

**Why:** Explosion particles need to continue animating after player dies.

---

### 4. Showing Player During Game Over

```javascript
// ❌ WRONG - Player visible after death
function renderGame() {
  maskedRenderer.renderMaskedGrid(player.gol, ...)
}

// ✅ CORRECT - Hide player during game over
function renderGame() {
  if (state.phase !== 'GAMEOVER') {
    maskedRenderer.renderMaskedGrid(player.gol, ...)
  }
}
```

**Why:** Player should disappear when explosion happens.

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
- CONFIG with pong-specific settings (paddle dimensions, ball speed, AI settings)
- State with player score and AI score (not generic "score")
- Player paddle (left side, 3 segments vertically stacked)
- AI paddle (right side, 3 segments vertically stacked, follows ball)
- Ball entity with velocity and speed tracking
- Ball physics (bouncing off walls, paddles, speed increase)
- AI logic (follows ball Y with delay/damping)
- Score tracking (player vs AI)
- Win condition check (first to 5)
- Ball reset after each point
- Proper use of all helper functions

**CRITICAL REQUIREMENTS:**
- Paddle segments: 60×60 each, 3 stacked = 180px total height
- Player paddle: Modified GoL with life force, GRADIENT_PRESETS.PLAYER
- AI paddle: Modified GoL with life force, GRADIENT_PRESETS.ENEMY_HOT
- Ball: Visual Only (maintainDensity), GRADIENT_PRESETS.BULLET
- Ball radius: 30 (for collision detection, treat as circle)
- Use Collision.circleRect() for ball vs paddle collision
- Ball speed: starts 5 px/frame, increases +0.5 per hit, max 10
- AI speed: 0.7 * (ball.y - aiPaddle.centerY) per frame
- Display "PLAYER: X | AI: Y" in UI
- Controls: "W/S or ↑↓: Move | SPACE: Restart"
- Win message: "YOU WIN!" or "AI WINS!"
- Use renderWin() helper for win screen (check UIHelpers)

**Note:** The HTML file will be generated automatically with the correct title and script reference, so you don't need to create it.

---

## Validation Checklist

Before submitting, verify your code has:

- ✅ All imports match framework pattern exactly
- ✅ CONFIG.ui identical to template (not modified)
- ✅ state.lives = 1 (not 3)
- ✅ Player paddle: 3 segments of 60×60, Modified GoL
- ✅ AI paddle: 3 segments of 60×60, Modified GoL
- ✅ Ball: 60×60, Visual Only (0 fps evolution)
- ✅ seedRadialDensity() used for all entities
- ✅ applyLifeForce() used for both paddles
- ✅ maintainDensity() used for ball
- ✅ renderGameUI() used for controls
- ✅ renderWin() used for win screen (or custom)
- ✅ Collision.circleRect() used for ball vs paddle
- ✅ NO use of 'this' with helper functions
- ✅ NO use of 'this.' prefix for p5.js functions
- ✅ Collision.clamp() used for paddle boundaries
- ✅ window.setup, window.draw, window.keyPressed exported
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

