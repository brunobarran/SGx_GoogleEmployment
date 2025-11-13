# LLM Test Prompt - Snake Game with Conway's Game of Life

## Your Task

Create a complete Snake game using the Game of Life Arcade framework. Follow the framework pattern documentation below EXACTLY.

---

## Game Request

**Game:** Classic Snake with cellular automaton aesthetic

**Mechanics:**
- Player controls a snake that grows when eating food
- Snake starts with 3 segments at center of screen
- Food appears randomly on screen as a pulsing GoL oscillator
- Snake moves continuously in current direction
- Player changes direction with arrow keys (or WASD)
- Snake grows by 1 segment when eating food
- Score increases by 10 points per food eaten
- Game ends if snake hits wall or itself
- Single life (no continues)

**Visual Design:**
- Snake head: 60×60 blue gradient, Modified GoL (life force)
- Snake body segments: 60×60 blue gradient, Visual Only (maintain density)
- Food: 60×60 yellow gradient, Pure GoL oscillator (Pulsar pattern, 15fps)
- Background: White (#FFFFFF)
- UI: Google brand colors

**Controls:**
- Arrow keys OR WASD: Change direction
- Space: Restart after game over

**Specific Requirements:**
1. Snake moves at constant speed (4 pixels per frame)
2. Food respawns immediately when eaten
3. No collisions between body segments during growth
4. Display score and snake length in UI
5. Show controls at bottom: "← → ↑ ↓ or WASD: Move | SPACE: Restart"
6. Explosion particles when snake dies
7. Hide all snake segments during game over (show only explosion)

**Technical Specs:**
- Canvas: 800×600
- Snake segment size: 60×60 (standard entity size)
- Food size: 60×60
- Snake speed: 4 pixels/frame (60fps = 240 pixels/second)
- Food pattern: Patterns.PULSAR (period 3 oscillator)
- Explosion: 6 particles, 30×30 each, fast evolution (30fps)

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

### Output: games/snake.js

Create the complete Snake game JavaScript file. Include:
- All standard imports
- CONFIG with snake-specific settings (speed, segment size, etc.)
- Snake state (head position, body segments array, direction, length)
- Food state (position, GoL engine)
- Setup functions for snake head, body segments, and food
- Movement logic (continuous movement, direction changes)
- Collision detection (walls, self-collision, food eating)
- Growth logic when eating food
- Score tracking (+10 per food)
- Game over with explosion
- Proper use of all helper functions

**CRITICAL REQUIREMENTS:**
- Snake head: 60×60, Modified GoL with life force
- Snake body: 60×60, Visual Only (maintainDensity)
- Food: 60×60, Pure GoL Pulsar pattern (15fps evolution)
- Use GRADIENT_PRESETS.PLAYER for snake
- Use GRADIENT_PRESETS.BULLET for food
- Movement speed: 4 pixels per frame
- Food respawns immediately when eaten
- Display "SCORE: X | LENGTH: Y" in UI
- Controls: "← → ↑ ↓ or WASD: Move | SPACE: Restart"

**Note:** The HTML file will be generated automatically with the correct title and script reference, so you don't need to create it.

---

## Validation Checklist

Before submitting, verify your code has:

- ✅ All imports match framework pattern exactly
- ✅ CONFIG.ui identical to template (not modified)
- ✅ state.lives = 1 (not 3)
- ✅ Snake segments are 60×60, cellSize 10
- ✅ Food uses Patterns.PULSAR
- ✅ seedRadialDensity() used for all entities
- ✅ applyLifeForce() used for snake head
- ✅ maintainDensity() used for body segments
- ✅ renderGameUI() and renderGameOver() used
- ✅ Snake hidden during GAMEOVER
- ✅ Particles continue during GAMEOVER
- ✅ NO use of 'this' with helper functions
- ✅ NO use of 'this.' prefix for p5.js functions
- ✅ Collision.clamp() used for boundaries
- ✅ window.setup, window.draw, window.keyPressed exported

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

