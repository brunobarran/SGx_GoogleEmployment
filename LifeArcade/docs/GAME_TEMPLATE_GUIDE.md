# Game Template Guide - Creating New Arcade Games

**Last Updated:** 2025-11-18
**Difficulty:** Beginner to Intermediate
**Time to Playable Prototype:** 1-2 hours

---

## 🎯 Quick Start

### Prerequisites
- Read `CLAUDE.md` (Core Principles)
- Understand Phase 3 format (`globalCellSize`)
- Basic p5.js knowledge (Global Mode)

### 5-Minute Setup

```bash
# 1. Copy template
cp src/game-template.js public/games/my-game.js

# 2. Copy HTML wrapper
cp public/games/game-wrapper.html public/games/my-game.html

# 3. Update HTML script path
# Edit my-game.html line 12:
<script type="module" src="my-game.js"></script>

# 4. Start dev server
npm run dev

# 5. Test
# Open: http://localhost:5174/games/my-game.html
```

---

## 📋 Template Structure Overview

The game template follows this exact structure:

```javascript
// ===== IMPORTS (Standard - DO NOT MODIFY) =====
import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
// ... standard imports

// ===== CONFIG ===== (CUSTOMIZE THIS)
const CONFIG = {
  width: 1200,
  height: 1920,
  globalCellSize: 30,  // Phase 3: All entities share this
  ui: { /* ... */ },   // DO NOT MODIFY (Google Colors)
  // YOUR GAME PARAMETERS HERE
}

// ===== STATE ===== (CUSTOMIZE THIS)
const state = {
  score: 0,
  lives: 1,           // ALWAYS 1 (arcade mode)
  phase: 'PLAYING',   // PLAYING | DYING | GAMEOVER
  frameCount: 0
  // YOUR GAME STATE HERE
}

// ===== GLOBAL VARIABLES ===== (CUSTOMIZE THIS)
let player
let enemies = []
let maskedRenderer

// ===== SETUP ===== (CUSTOMIZE INITIALIZATION)
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)
  maskedRenderer = new SimpleGradientRenderer(this)  // EXCEPTION: needs 'this'
  initGame()
}

// ===== INIT GAME ===== (CUSTOMIZE ENTITY CREATION)
function initGame() {
  // Create player, enemies, etc.
}

// ===== DRAW LOOP ===== (STANDARD PATTERN)
function draw() {
  // Responsive scaling
  // Background
  // Update/render based on phase
  // postMessage on game over
}

// ===== GAME LOGIC ===== (CUSTOMIZE THIS)
function updateGame() { }
function renderGame() { }
function renderUI() { }

// ===== INPUT ===== (CUSTOMIZE CONTROLS)
function keyPressed() { }

// ===== EXPORTS ===== (DO NOT MODIFY)
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
```

---

## 🎮 Game Type Patterns

### Pattern 1: Platform Game (Dino Runner Style)

**Characteristics:**
- Player runs horizontally, can jump
- Obstacles spawn and scroll left
- Collision ends game
- Score increases over time

**CONFIG Parameters:**
```javascript
const CONFIG = {
  globalCellSize: 30,
  gravity: 2.4,           // Downward acceleration
  jumpForce: -54,         // Jump velocity (negative = up)
  obstacle: {
    speed: -27,           // Scroll speed (negative = left)
    spawnInterval: 90,    // Frames between spawns
    minGap: 300          // Minimum gap between obstacles
  },
  player: {
    groundY: 1600,        // Y position when on ground
    golUpdateRate: 12     // GoL evolution speed
  }
}
```

**Entity Setup:**
```javascript
function initGame() {
  // Player (Modified GoL)
  player = {
    x: 200,
    y: CONFIG.player.groundY - 240,
    width: 240,
    height: 240,
    vy: 0,                // Vertical velocity
    isJumping: false,
    gol: new GoLEngine(8, 8, CONFIG.player.golUpdateRate),
    gradient: GRADIENT_PRESETS.PLAYER
  }
  seedRadialDensity(player.gol, 0.85, 0.0)

  // Obstacles (Visual Only - predictable)
  obstacles = []
}

function spawnObstacle() {
  const obstacle = {
    x: CONFIG.width,
    y: CONFIG.player.groundY - 180,
    width: 120,
    height: 180,
    gol: new GoLEngine(4, 6, 0),  // updateRate: 0 = no evolution
    gradient: GRADIENT_PRESETS.ENEMY_HOT
  }
  maintainDensity(obstacle, 0.75)  // Visual Only
  obstacles.push(obstacle)
}
```

**Update Logic:**
```javascript
function updateGame() {
  // Gravity
  if (player.y < CONFIG.player.groundY - player.height) {
    player.vy += CONFIG.gravity
  } else {
    player.y = CONFIG.player.groundY - player.height
    player.vy = 0
    player.isJumping = false
  }
  player.y += player.vy

  // Spawn obstacles
  if (state.frameCount % CONFIG.obstacle.spawnInterval === 0) {
    spawnObstacle()
  }

  // Update obstacles
  for (let obs of obstacles) {
    obs.x += CONFIG.obstacle.speed
  }

  // Remove off-screen obstacles
  obstacles = obstacles.filter(obs => obs.x > -obs.width)

  // Collision detection (FIXED HITBOXES)
  for (let obs of obstacles) {
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      obs.x, obs.y, obs.width, obs.height
    )) {
      handlePlayerDeath()
    }
  }

  // Score increases over time
  state.score = Math.floor(state.frameCount / 10)
}
```

---

### Pattern 2: Shooter Game (Space Invaders Style)

**Characteristics:**
- Player moves horizontally at bottom
- Enemies in formation at top
- Player shoots bullets upward
- Collision with bullets destroys enemies

**CONFIG Parameters:**
```javascript
const CONFIG = {
  globalCellSize: 30,
  invader: {
    rows: 4,
    cols: 4,
    moveInterval: 30,     // Frames between moves
    speed: 45,            // Horizontal move distance
    golUpdateRate: 15
  },
  player: {
    speed: 18,            // Horizontal speed
    shootCooldown: 15,    // Frames between shots
    golUpdateRate: 12
  },
  bullet: {
    speed: -8,            // Vertical speed (negative = up)
    golUpdateRate: 0      // No evolution
  }
}
```

**Entity Setup:**
```javascript
function initGame() {
  // Player (Modified GoL)
  player = {
    x: CONFIG.width / 2 - 90,
    y: CONFIG.height - 300,
    width: 180,
    height: 180,
    vx: 0,
    shootTimer: 0,
    gol: new GoLEngine(6, 6, CONFIG.player.golUpdateRate),
    gradient: GRADIENT_PRESETS.PLAYER
  }
  seedRadialDensity(player.gol, 0.85, 0.0)
  applyLifeForce(player)

  // Invaders (Modified GoL)
  invaders = []
  const startX = 200
  const startY = 200
  for (let row = 0; row < CONFIG.invader.rows; row++) {
    for (let col = 0; col < CONFIG.invader.cols; col++) {
      const invader = {
        x: startX + col * 240,
        y: startY + row * 240,
        width: 180,
        height: 180,
        gol: new GoLEngine(6, 6, CONFIG.invader.golUpdateRate),
        gradient: GRADIENT_PRESETS.ENEMY_HOT,
        dead: false
      }
      seedRadialDensity(invader.gol, 0.75, 0.0)
      invaders.push(invader)
    }
  }

  bullets = []
}
```

**Update Logic:**
```javascript
function updateGame() {
  // Player movement
  player.x += player.vx
  player.x = Collision.clamp(player.x, 0, CONFIG.width - player.width)

  // Shoot cooldown
  if (player.shootTimer > 0) player.shootTimer--

  // Update invaders (formation movement)
  if (state.frameCount % CONFIG.invader.moveInterval === 0) {
    for (let inv of invaders) {
      if (!inv.dead) {
        inv.x += CONFIG.invader.speed
      }
    }
  }

  // Update bullets
  for (let bullet of bullets) {
    bullet.y += CONFIG.bullet.speed
  }
  bullets = bullets.filter(b => b.y > -b.height)

  // Collision: bullets vs invaders
  for (let bullet of bullets) {
    for (let inv of invaders) {
      if (!inv.dead && Collision.rectRect(
        bullet.x, bullet.y, bullet.width, bullet.height,
        inv.x, inv.y, inv.width, inv.height
      )) {
        inv.dead = true
        bullet.dead = true
        spawnExplosion(inv.x + inv.width/2, inv.y + inv.height/2)
        state.score += 100
      }
    }
  }
  bullets = bullets.filter(b => !b.dead)

  // Check win condition
  if (invaders.every(inv => inv.dead)) {
    state.phase = 'WIN'
  }
}
```

---

### Pattern 3: Physics Game (Breakout Style)

**Characteristics:**
- Paddle moves horizontally at bottom
- Ball bounces off paddle, walls, bricks
- Breaking bricks increases score
- Ball falling below paddle ends game

**CONFIG Parameters:**
```javascript
const CONFIG = {
  globalCellSize: 30,
  paddle: {
    speed: 30,            // Horizontal speed
    width: 450,
    height: 75,
    golUpdateRate: 12
  },
  ball: {
    speed: 18,            // Base speed
    maxAngle: Math.PI/3,  // Max bounce angle
    radius: 120,          // Visual radius
    golUpdateRate: 0      // No evolution
  },
  brick: {
    rows: 3,
    cols: 3,
    width: 240,
    height: 120,
    scoreValue: [30, 40, 50],  // By row
    golUpdateRate: 15
  }
}
```

**Update Logic:**
```javascript
function updateGame() {
  // Paddle movement
  paddle.x += paddle.vx
  paddle.x = Collision.clamp(paddle.x, 0, CONFIG.width - paddle.width)

  // Ball physics
  ball.x += ball.vx
  ball.y += ball.vy

  // Ball vs walls
  if (ball.x <= ball.radius || ball.x >= CONFIG.width - ball.radius) {
    ball.vx *= -1
  }
  if (ball.y <= ball.radius) {
    ball.vy *= -1
  }

  // Ball vs paddle (angle bounce)
  if (Collision.circleRect(
    ball.x, ball.y, ball.radius,
    paddle.x, paddle.y, paddle.width, paddle.height
  )) {
    const hitPos = (ball.x - paddle.x) / paddle.width  // 0 to 1
    const angle = (hitPos - 0.5) * CONFIG.ball.maxAngle * 2
    ball.vx = CONFIG.ball.speed * Math.sin(angle)
    ball.vy = -CONFIG.ball.speed * Math.cos(angle)
  }

  // Ball vs bricks
  for (let brick of bricks) {
    if (!brick.dead && Collision.circleRect(
      ball.x, ball.y, ball.radius,
      brick.x, brick.y, brick.width, brick.height
    )) {
      brick.dead = true
      ball.vy *= -1
      state.score += brick.scoreValue
      spawnExplosion(brick.x + brick.width/2, brick.y + brick.height/2)
    }
  }

  // Ball below paddle = game over
  if (ball.y > CONFIG.height) {
    handlePlayerDeath()
  }
}
```

---

### Pattern 4: Flyer Game (Flappy Bird Style)

**Characteristics:**
- Player flies vertically, affected by gravity
- Tap to flap upward
- Pipes spawn with gaps
- Collision with pipes or bounds ends game

**CONFIG Parameters:**
```javascript
const CONFIG = {
  globalCellSize: 30,
  gravity: 2.1,           // Downward acceleration
  jumpForce: -42,         // Upward impulse
  pipe: {
    speed: -15,           // Scroll speed
    gap: 600,             // Vertical gap
    spawnInterval: 100,   // Frames between pipes
    width: 360,
    golUpdateRate: 0      // No evolution
  },
  player: {
    x: 300,               // Fixed X position
    golUpdateRate: 12
  }
}
```

**Update Logic:**
```javascript
function updateGame() {
  // Gravity
  player.vy += CONFIG.gravity
  player.y += player.vy

  // Clamp to screen bounds
  if (player.y < 0) {
    player.y = 0
    player.vy = 0
  }
  if (player.y > CONFIG.height - player.height) {
    handlePlayerDeath()
  }

  // Spawn pipes
  if (state.frameCount % CONFIG.pipe.spawnInterval === 0) {
    const gapY = random(300, CONFIG.height - 900)
    pipes.push({
      x: CONFIG.width,
      gapY: gapY,
      passed: false
    })
  }

  // Update pipes
  for (let pipe of pipes) {
    pipe.x += CONFIG.pipe.speed

    // Score when passing pipe
    if (!pipe.passed && pipe.x + CONFIG.pipe.width < player.x) {
      pipe.passed = true
      state.score++
    }
  }
  pipes = pipes.filter(p => p.x > -CONFIG.pipe.width)

  // Collision with pipes
  for (let pipe of pipes) {
    // Top pipe collision
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      pipe.x, 0, CONFIG.pipe.width, pipe.gapY
    )) {
      handlePlayerDeath()
    }
    // Bottom pipe collision
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      pipe.x, pipe.gapY + CONFIG.pipe.gap, CONFIG.pipe.width, CONFIG.height
    )) {
      handlePlayerDeath()
    }
  }
}
```

---

## ✅ Implementation Checklist

### Phase 1: Setup (5 minutes)
- [ ] Copy `src/game-template.js` to `public/games/my-game.js`
- [ ] Copy `game-wrapper.html` to `my-game.html`
- [ ] Update HTML script path
- [ ] Test game loads: http://localhost:5174/games/my-game.html

### Phase 2: CONFIG (10 minutes)
- [ ] Define `globalCellSize` (usually 30)
- [ ] Add game-specific parameters (speeds, sizes, timings)
- [ ] Keep `CONFIG.ui` unchanged (Google Colors)
- [ ] Define entity update rates (player: 12, enemies: 15, bullets: 0)

### Phase 3: STATE (5 minutes)
- [ ] Set `state.lives = 1` (ALWAYS 1 for arcade)
- [ ] Add game-specific state (enemy count, combo, etc.)
- [ ] Define phase flow: PLAYING → DYING → GAMEOVER

### Phase 4: Entities (30 minutes)
- [ ] Create player with Modified GoL:
  - [ ] `new GoLEngine(6, 6, CONFIG.player.golUpdateRate)`
  - [ ] `seedRadialDensity(player.gol, 0.85, 0.0)`
  - [ ] `applyLifeForce(player)` in update
- [ ] Create enemies:
  - [ ] Modified GoL (large enemies): `applyLifeForce()`
  - [ ] Visual Only (small enemies): `maintainDensity()`
- [ ] Create bullets/projectiles:
  - [ ] Visual Only: `updateRate: 0`, `maintainDensity()`
- [ ] Use FIXED hitboxes for collision (NOT GoL cells)

### Phase 5: Game Loop (30 minutes)
- [ ] Implement `updateGame()`:
  - [ ] Player movement
  - [ ] Enemy movement/AI
  - [ ] Bullet physics
  - [ ] Collision detection (FIXED HITBOXES)
  - [ ] Score calculation
  - [ ] Win/lose conditions
- [ ] Implement `renderGame()`:
  - [ ] Use `maskedRenderer.renderMaskedGrid()` with `CONFIG.globalCellSize`
  - [ ] Hide player during DYING/GAMEOVER phases
  - [ ] Render explosions with `renderParticles()`
- [ ] Update `renderUI()`:
  - [ ] Show score, lives (always 1)
  - [ ] Show controls hint

### Phase 6: Input (10 minutes)
- [ ] Implement `keyPressed()`:
  - [ ] Arrow keys / WASD for movement
  - [ ] Space for jump/shoot
  - [ ] Handle game over restart (optional)
- [ ] Test keyboard controls
- [ ] Ensure arcade encoder compatibility (arrow keys + space)

### Phase 7: Game Over (10 minutes)
- [ ] Implement `handlePlayerDeath()`:
  - [ ] Set `state.phase = 'DYING'`
  - [ ] Spawn explosion at player position
  - [ ] `setTimeout(() => state.phase = 'GAMEOVER', 2000)`
- [ ] Add postMessage in `draw()`:
  ```javascript
  if (state.phase === 'GAMEOVER' && !messageSent) {
    window.parent.postMessage({
      type: 'gameOver',
      payload: { score: state.score }
    }, '*')
    messageSent = true
  }
  ```

### Phase 8: Testing (15 minutes)
- [ ] Test in standalone mode: http://localhost:5174/games/my-game.html
- [ ] Verify 60fps (open DevTools → Performance)
- [ ] Test game over flow:
  - [ ] Player death triggers explosion
  - [ ] DYING phase shows particles
  - [ ] GAMEOVER phase shows score
  - [ ] postMessage sent to parent
- [ ] Test in installation: http://localhost:5174/installation.html
  - [ ] Select game from gallery
  - [ ] Play until game over
  - [ ] Verify score entry screen appears

### Phase 9: Polish (15 minutes)
- [ ] Adjust difficulty (CONFIG parameters)
- [ ] Test collision hitboxes (circle vs rect)
- [ ] Add visual feedback (explosions, particles)
- [ ] Verify Google Colors usage
- [ ] Check portrait orientation (1200×1920)

---

## 🚨 Common Pitfalls

### ❌ WRONG: Using GoL Cells for Collision
```javascript
// DON'T DO THIS - cells change every frame!
function checkCollision() {
  for (let x = 0; x < enemy.gol.cols; x++) {
    for (let y = 0; y < enemy.gol.rows; y++) {
      if (enemy.gol.current[x][y] === ALIVE) {
        // BUG: unpredictable collision
      }
    }
  }
}
```

### ✅ CORRECT: Fixed Hitboxes
```javascript
// Use fixed geometric shapes
if (Collision.rectRect(
  player.x, player.y, player.width, player.height,
  enemy.x, enemy.y, enemy.width, enemy.height
)) {
  handleCollision()
}
```

---

### ❌ WRONG: Per-Entity Cell Size (Phase 2 Format)
```javascript
// DEPRECATED - Phase 2 format
player = {
  cellSize: 30,  // ❌ Don't do this
  width: 180
}
```

### ✅ CORRECT: Global Cell Size (Phase 3 Format)
```javascript
// Phase 3 format
const CONFIG = {
  globalCellSize: 30  // ✅ All entities share this
}

player = {
  width: 180  // No cellSize property
}

// Rendering
maskedRenderer.renderMaskedGrid(
  player.gol,
  player.x,
  player.y,
  CONFIG.globalCellSize,  // ✅ Use global size
  player.gradient
)
```

---

### ❌ WRONG: Multiple Lives
```javascript
// DON'T DO THIS - arcade mode is single life
state.lives = 3  // ❌ Wrong
```

### ✅ CORRECT: Single Life
```javascript
// Arcade installation requirement
state.lives = 1  // ✅ Always 1
```

---

### ❌ WRONG: p5.js Instance Mode
```javascript
function draw() {
  this.background(0)  // ❌ Wrong - instance mode
  this.rect(10, 10, 50, 50)  // ❌ Wrong
}
```

### ✅ CORRECT: p5.js Global Mode
```javascript
function draw() {
  background(0)  // ✅ Correct - global mode
  rect(10, 10, 50, 50)  // ✅ Correct
}

// EXCEPTION: Only when creating SimpleGradientRenderer
maskedRenderer = new SimpleGradientRenderer(this)  // ✅ Only place 'this' is used
```

---

### ❌ WRONG: Bullets with GoL Evolution
```javascript
// DON'T DO THIS - bullets must be predictable
bullet.gol = new GoLEngine(3, 3, 12)  // ❌ Bullets evolve = unpredictable
```

### ✅ CORRECT: Bullets Visual Only
```javascript
// Bullets must be 100% predictable
bullet.gol = new GoLEngine(3, 3, 0)  // ✅ updateRate: 0 = no evolution
maintainDensity(bullet, 0.75)  // ✅ Visual Only
```

---

## 📚 Reference Examples

### Minimal Platform Game (Dino Runner)
**Files:** `public/games/dino-runner.js`
**Lines:** 366
**Key Features:** Gravity, jumping, obstacle spawning, collision

### Minimal Shooter Game (Space Invaders)
**Files:** `public/games/space-invaders.js`
**Lines:** ~400 (with debug interface)
**Key Features:** Formation movement, shooting, bullet collision

### Minimal Physics Game (Breakout)
**Files:** `public/games/breakout.js`
**Lines:** 402
**Key Features:** Ball physics, paddle bounce, brick collision

### Minimal Flyer Game (Flappy Bird)
**Files:** `public/games/flappy-bird.js`
**Lines:** 343
**Key Features:** Gravity, flapping, pipe spawning, gap collision

---

## 🎯 Success Criteria

Your game is ready for installation when:

- ✅ Runs at 60fps (check DevTools Performance)
- ✅ Portrait orientation (1200×1920)
- ✅ Single life (`state.lives = 1`)
- ✅ postMessage sends score on game over
- ✅ Google Colors used for UI
- ✅ Fixed hitboxes for collision (not GoL cells)
- ✅ Player uses Modified GoL (`applyLifeForce()`)
- ✅ Bullets use Visual Only (`maintainDensity()`)
- ✅ Phase 3 format (`CONFIG.globalCellSize`)
- ✅ p5.js Global Mode (no `this.` for p5 functions)
- ✅ Works in standalone mode
- ✅ Works in installation (gallery → game → score entry)

---

## 🚀 Next Steps

1. **Test Your Game:** Run through complete gameplay cycle
2. **Add to Gallery:** Update `installation.html` gallery screen
3. **Create Presets:** (Optional) Add debug interface presets
4. **Write Tests:** (Optional) Add game validation tests
5. **Deploy:** Test on Mac Mini kiosk

---

**Document Status:** ✅ Complete
**Version:** 1.0
**Maintained By:** Claude Code
