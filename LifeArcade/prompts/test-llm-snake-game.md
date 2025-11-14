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
- Snake head: 180×180 blue gradient, Modified GoL (life force)
- Snake body segments: 180×180 blue gradient, Visual Only (maintain density)
- Food: 180×180 yellow gradient, Pure GoL oscillator (Pulsar pattern, 15fps)
- Background: White (#FFFFFF)
- UI: Google brand colors

**Controls:**
- Arrow keys OR WASD: Change direction
- Space: Restart after game over (standalone mode only)

**Specific Requirements:**
1. Snake moves at constant speed (12 pixels per frame, scaled 3x from 4px)
2. Food respawns immediately when eaten
3. No collisions between body segments during growth
4. Display score and snake length in UI
5. Show controls: "← → ↑ ↓ or WASD: Move"
6. Explosion particles when snake dies
7. Hide all snake segments during DYING/GAMEOVER (show only explosion)
8. Send postMessage on Game Over (installation mode)

**Technical Specs:**
- Canvas: 1200×1920 (portrait, responsive with scaleFactor)
- Snake segment size: 180×180 (scaled 3x from 60×60)
- cellSize: 30 (scaled 3x from 10)
- Food size: 180×180
- Snake speed: 12 pixels/frame at base resolution (scaled 3x from 4px)
- Food pattern: Patterns.PULSAR (period 3 oscillator)
- Explosion: 6 particles, 90×90 each, fast evolution (30fps)
- DYING phase: MIN_DELAY 30 frames, MAX_WAIT 150 frames

---

## Framework Documentation

Use this documentation to implement the game. Follow it EXACTLY.

---

# Game of Life Arcade - Framework Pattern

## Purpose

This document defines the **standard pattern** for creating games in the GoL Arcade project. It is optimized for LLM consumption to minimize errors when generating new games.

**UPDATED:** 2025-11-14 - Portrait 1200×1920 with responsive canvas + postMessage integration

---

## CRITICAL: p5.js Global Mode

**All games in this framework use p5.js GLOBAL MODE, not instance mode.**

### What This Means:

```javascript
// ✅ CORRECT (Global Mode - what we use)
function setup() {
  createCanvas(1200, 1920)
  fill(255, 0, 0)
  rect(10, 10, 50, 50)
}

// ❌ WRONG (Instance Mode - do NOT use)
function setup() {
  this.createCanvas(1200, 1920)  // NO 'this'
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
3. Follow the standards below

**Reference implementation:** `src/game-template.js` contains the complete, updated pattern.

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

// ===== CONFIGURATION - Portrait 1200×1920 =====
const BASE_WIDTH = 1200
const BASE_HEIGHT = 1920
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT  // 0.625

const CONFIG = {
  width: 1200,
  height: 1920,
  ui: { /* STANDARD - DO NOT MODIFY */ }
  // ... game-specific config
}

let scaleFactor = 1
let canvasWidth = BASE_WIDTH
let canvasHeight = BASE_HEIGHT

// ===== GAME OVER CONFIG =====
const GAMEOVER_CONFIG = {
  MIN_DELAY: 30,   // 0.5s minimum
  MAX_WAIT: 150    // 2.5s maximum
}

// ===== STATE =====
const state = {
  score: 0,
  lives: 1,  // ALWAYS 1
  phase: 'PLAYING',  // PLAYING | DYING | GAMEOVER
  frameCount: 0,
  dyingTimer: 0
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

      // Send postMessage to parent if in installation
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
    // Only show Game Over UI in standalone mode
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

// ===== RENDERING with scaleFactor =====
function renderGame() {
  push()
  scale(scaleFactor)

  // Render entities (hide during DYING/GAMEOVER)
  if (state.phase === 'PLAYING') {
    maskedRenderer.renderMaskedGrid(player.gol, player.x, player.y, player.cellSize, player.gradient)
  }

  // Render particles
  renderParticles(particles, maskedRenderer)

  pop()
}

function renderUI() {
  push()
  scale(scaleFactor)
  renderGameUI(CONFIG, state, ['← → or A/D: Move'])
  pop()
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

```javascript
// Main entities (player, invaders, bricks)
width: 180      // Scaled 3x from 60
height: 180     // Scaled 3x from 60
cellSize: 30    // Scaled 3x from 10
gol: new GoLEngine(6, 6, 12)  // Player
gol: new GoLEngine(6, 6, 15)  // Enemies

// Projectiles (bullets, ball)
width: 90       // Scaled 3x from 30
height: 90      // Scaled 3x from 30
cellSize: 30    // Scaled 3x from 10
gol: new GoLEngine(3, 3, 0)   // Visual Only (no evolution)
gol: new GoLEngine(3, 3, 15)  // Or with evolution

// Explosions
width: 90       // Scaled 3x from 30
height: 90      // Scaled 3x from 30
cellSize: 30    // Scaled 3x from 10
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
  phase: 'PLAYING',   // PLAYING | DYING | GAMEOVER | WIN
  frameCount: 0,
  dyingTimer: 0       // Frames since entered DYING phase
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

// Render game over screen (standalone mode only)
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
    y: CONFIG.height - 300,
    width: 180,
    height: 180,
    cellSize: 30,
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

// Render player (hide during DYING/GAMEOVER)
if (state.phase === 'PLAYING') {
  push()
  scale(scaleFactor)
  maskedRenderer.renderMaskedGrid(
    player.gol,
    player.x,
    player.y,
    player.cellSize,
    player.gradient
  )
  pop()
}
```

### Enemies

```javascript
function setupEnemy() {
  const enemy = {
    x: 200,
    y: 100,
    width: 180,
    height: 180,
    cellSize: 30,
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
    width: 90,
    height: 90,
    cellSize: 30,
    vy: -24,  // Scaled 3x from -8
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
      x: x + random(-30, 30),
      y: y + random(-30, 30),
      vx: random(-9, 9),
      vy: random(-9, 9),
      alpha: 255,
      width: 90,
      height: 90,
      gol: new GoLEngine(3, 3, 30),  // Fast evolution
      cellSize: 30,
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    seedRadialDensity(particle.gol, 0.8, 0.0)
    particles.push(particle)
  }
}
```

---

## Game Over Pattern

### Transition to DYING Phase

```javascript
function checkCollisions() {
  if (collision) {
    state.phase = 'DYING'
    state.dyingTimer = 0
    spawnExplosion(player.x + player.width/2, player.y + player.height/2)
  }
}
```

### DYING Phase Management

```javascript
// In draw()
if (state.phase === 'DYING') {
  state.dyingTimer++
  particles = updateParticles(particles, state.frameCount)

  const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
  const particlesDone = particles.length === 0
  const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

  if ((particlesDone && minDelayPassed) || maxWaitReached) {
    state.phase = 'GAMEOVER'

    // Send postMessage if embedded in installation
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameOver',
        payload: { score: state.score }
      }, '*')
    }
  }
}
```

### Standalone vs Installation Mode

```javascript
// In keyPressed()
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    // Only allow restart in standalone mode
    if (window.parent === window) {
      initGame()
    }
  }
}

// In draw()
if (state.phase === 'GAMEOVER') {
  // Only show Game Over UI in standalone mode
  if (window.parent === window) {
    renderGameOver(width, height, state.score)
  }
}
```

---

## Checklist for New Games

When creating a new game, verify:

- ✅ All imports from template are present
- ✅ BASE_WIDTH = 1200, BASE_HEIGHT = 1920, ASPECT_RATIO defined
- ✅ calculateResponsiveSize() and updateConfigScale() functions present
- ✅ scaleFactor, canvasWidth, canvasHeight variables declared
- ✅ GAMEOVER_CONFIG with MIN_DELAY and MAX_WAIT defined
- ✅ CONFIG.ui is identical to template (DO NOT MODIFY)
- ✅ state.lives = 1 (ALWAYS)
- ✅ state.dyingTimer added
- ✅ state.phase includes 'DYING'
- ✅ Player: 180×180, cellSize 30, GoLEngine(6, 6, 12)
- ✅ Enemies: 180×180, cellSize 30, GoLEngine(6, 6, 15)
- ✅ Bullets: 90×90, cellSize 30, GoLEngine(3, 3, 0 or 15)
- ✅ Explosions: 90×90, cellSize 30, GoLEngine(3, 3, 30)
- ✅ Use seedRadialDensity() for all entities
- ✅ Use applyLifeForce() for player/critical enemies
- ✅ Use maintainDensity() for bullets
- ✅ Use updateParticles() and renderParticles() for explosions
- ✅ Use renderGameUI() and renderGameOver()
- ✅ Player hidden during DYING/GAMEOVER
- ✅ Particles continue updating during DYING/GAMEOVER
- ✅ Rendering uses push/scale/pop pattern
- ✅ postMessage sent on Game Over (if embedded)
- ✅ windowResized handler present
- ✅ window.windowResized exported
- ✅ NO use of 'this' with helper functions
- ✅ NO use of 'this.' prefix for p5.js functions
- ✅ Collision.clamp() used for boundaries

---

## Anti-Patterns (DO NOT DO)

❌ **Don't use old resolution**
```javascript
// WRONG
createCanvas(800, 600)

// CORRECT
const size = calculateResponsiveSize()
createCanvas(size.width, size.height)
```

❌ **Don't use old entity sizes**
```javascript
// WRONG
player = { width: 60, height: 60, cellSize: 10 }

// CORRECT
player = { width: 180, height: 180, cellSize: 30 }
```

❌ **Don't forget scaleFactor in rendering**
```javascript
// WRONG
maskedRenderer.renderMaskedGrid(...)

// CORRECT
push()
scale(scaleFactor)
maskedRenderer.renderMaskedGrid(...)
pop()
```

❌ **Don't show player during DYING/GAMEOVER**
```javascript
// WRONG
maskedRenderer.renderMaskedGrid(player.gol, ...)

// CORRECT
if (state.phase === 'PLAYING') {
  maskedRenderer.renderMaskedGrid(player.gol, ...)
}
```

❌ **Don't forget postMessage**
```javascript
// WRONG
state.phase = 'GAMEOVER'

// CORRECT
state.phase = 'GAMEOVER'
if (window.parent !== window) {
  window.parent.postMessage({
    type: 'gameOver',
    payload: { score: state.score }
  }, '*')
}
```

---

## Output Instructions

Generate ONLY the JavaScript game file.

**IMPORTANT:** Do NOT generate HTML. Only generate the complete JavaScript code.

### Output: games/snake.js

Create the complete Snake game JavaScript file. Include:
- All standard imports
- BASE_WIDTH, BASE_HEIGHT, ASPECT_RATIO constants
- CONFIG with snake-specific settings (speed scaled 3x)
- scaleFactor, canvasWidth, canvasHeight
- GAMEOVER_CONFIG
- Snake state (head position, body segments array, direction, length)
- Food state (position, GoL engine)
- Setup functions for snake head, body segments, and food
- Movement logic (continuous movement, direction changes)
- Collision detection (walls, self-collision, food eating)
- Growth logic when eating food
- Score tracking (+10 per food)
- DYING phase with explosion
- postMessage integration
- Responsive canvas functions
- windowResized handler
- Rendering with push/scale/pop

**CRITICAL REQUIREMENTS:**
- Resolution: 1200×1920 (portrait, responsive)
- Snake head: 180×180, cellSize 30, Modified GoL with life force
- Snake body: 180×180, cellSize 30, Visual Only (maintainDensity)
- Food: 180×180, cellSize 30, Pure GoL Pulsar pattern (15fps)
- Use GRADIENT_PRESETS.PLAYER for snake
- Use GRADIENT_PRESETS.BULLET for food
- Movement speed: 12 pixels per frame (scaled 3x)
- Food respawns immediately when eaten
- Display "SCORE: X | LENGTH: Y" in UI
- Controls: "← → ↑ ↓ or WASD: Move"
- DYING phase before GAMEOVER
- postMessage on Game Over (if embedded)
- All rendering uses scaleFactor

---

## Validation Checklist

Before submitting, verify your code has:

- ✅ Portrait 1200×1920 with responsive canvas
- ✅ BASE_WIDTH, BASE_HEIGHT, ASPECT_RATIO constants
- ✅ calculateResponsiveSize() and updateConfigScale()
- ✅ scaleFactor applied in all rendering (push/scale/pop)
- ✅ Snake segments are 180×180, cellSize 30
- ✅ Food uses Patterns.PULSAR
- ✅ DYING phase with MIN_DELAY/MAX_WAIT
- ✅ postMessage sent on Game Over
- ✅ windowResized handler
- ✅ window.windowResized exported
- ✅ Speeds scaled 3x (12px instead of 4px)
- ✅ NO 'this' with helpers or p5.js functions

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
window.windowResized = windowResized
```

---

**BEGIN YOUR RESPONSE NOW. Generate the complete JavaScript file.**
