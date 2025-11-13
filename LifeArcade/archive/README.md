# Game Template - Usage Guide

## 🎯 Purpose

Starting point for vibe coding games. LLM uses this template to generate arcade games with Conway's Game of Life aesthetics.

---

## 🎨 Key Design Decisions

### 1. **Clean White Background** (NO GoL background)
```javascript
background(CONFIG.ui.backgroundColor)  // '#FFFFFF'
```

**Rationale:**
- ✅ Visual clarity - player/enemies stand out
- ✅ Matches reference games (Space Invaders CA, explosions demo)
- ✅ No visual confusion between background and gameplay
- ❌ GoL background would compete with entities

**When to use GoL background:**
- ONLY if specific game aesthetic requires it
- Must be very subtle (low density, muted colors)
- Example: Puzzle game where background is part of mechanics

### 2. **GoL on Entities Only**
```javascript
// Player with GoL visual
player.gol = new GoLEngine(13, 13, 12)

// Enemy with GoL visual
enemy.gol = new GoLEngine(10, 10, 15)
```

**GoL Strategies:**

| Entity Type | Strategy | Rationale |
|-------------|----------|-----------|
| Player | Modified (life force) | Never dies completely, stable |
| Large enemies | Modified OR Pure | Stable or evolving |
| Small obstacles | Visual Only | Too small for real GoL |
| Bullets | Visual Only | Must be predictable |
| Explosions | Pure GoL | Showcase authentic GoL |
| Powerups | Pure GoL (oscillators) | Naturally stable patterns |

### 3. **Google Brand UI**
```javascript
ui: {
  backgroundColor: '#FFFFFF',  // Clean white
  textColor: '#5f6368',        // Google Gray 700
  accentColor: '#1a73e8',      // Google Blue
  font: 'Google Sans, Arial, sans-serif'
}
```

**Requirements:**
- Minimal UI (score, lives, level in corner)
- Clean typography
- Consistent placement across all games
- No clutter

---

## 🚀 Quick Start

### 1. Copy Template
```bash
cp src/template/game-template.js src/games/my-game.js
```

### 2. Customize
```javascript
// Change game name
const CONFIG = {
  // ... add your config
}

// Setup your entities
function setupPlayer() {
  player = {
    x: 100,
    y: 400,
    gol: new GoLEngine(15, 15, 12),  // 15x15 cells, 12fps
    cellSize: 3
  }

  // Seed with pattern
  player.gol.setPattern(Patterns.BLINKER, 7, 7)
}

function setupEnemies() {
  // Spawn your enemies
}

// Implement game logic
function gameLogic() {
  // Spawn enemies
  if (state.frameCount % 60 === 0) {
    spawnEnemy()
  }

  // Check win condition
  if (enemies.length === 0) {
    state.phase = 'WIN'
  }
}
```

### 3. Test
```bash
# Open in browser
open http://localhost:5173
```

---

## 📋 Common Patterns

### Pattern 1: Player with Jump
```javascript
function setupPlayer() {
  player = {
    x: 100,
    y: 400,
    vx: 0,
    vy: 0,
    onGround: true,
    gol: new GoLEngine(13, 13, 12),
    cellSize: 3
  }

  player.gol.randomSeed(0.4)
}

function keyPressed() {
  if (key === ' ' && player.onGround) {
    player.vy = -15  // Jump
    player.onGround = false
  }
}

function updatePlayer() {
  // Gravity
  player.vy += CONFIG.gravity
  player.y += player.vy

  // Ground collision
  if (player.y > CONFIG.groundY) {
    player.y = CONFIG.groundY
    player.vy = 0
    player.onGround = true
  }

  // Update GoL
  player.gol.update()
  applyLifeForce(player)
}
```

### Pattern 2: Moving Enemies
```javascript
function spawnEnemy() {
  const enemy = {
    x: width,
    y: random(100, 500),
    vx: -3,
    vy: 0,
    width: 30,
    height: 30,
    dead: false,
    gol: new GoLEngine(10, 10, 15),
    cellSize: 3
  }

  enemy.gol.randomSeed(0.5)
  enemies.push(enemy)
}

function updateEnemy(enemy) {
  enemy.x += enemy.vx

  // Update GoL
  enemy.gol.update()

  // Remove if off-screen
  if (enemy.x < -50) {
    enemy.dead = true
  }
}
```

### Pattern 3: Shooting Bullets
```javascript
function shootBullet() {
  const bullet = {
    x: player.x + player.width,
    y: player.y + player.height/2,
    vx: 8,
    vy: 0,
    width: 10,
    height: 4,
    age: 0,
    lifetime: 120,  // 2 seconds at 60fps
    dead: false,
    gol: new GoLEngine(3, 2, 30),  // Small, fast update
    cellSize: 3
  }

  bullet.gol.randomSeed(0.8)
  bullets.push(bullet)
}

function keyPressed() {
  if (key === 'z' || key === 'Z') {
    shootBullet()
  }
}
```

### Pattern 4: Explosion Effect (Pure GoL)
```javascript
function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-15, 15),
      y: y + random(-15, 15),
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255,
      dead: false,
      gol: new GoLEngine(10, 10, 30),
      cellSize: 2
    }

    // Use Methuselah pattern (long evolution)
    particle.gol.setPattern(Patterns.R_PENTOMINO, 3, 3)

    particles.push(particle)
  }
}

function updateParticle(particle) {
  particle.gol.update()

  particle.x += particle.vx
  particle.y += particle.vy
  particle.alpha -= 3

  if (particle.alpha <= 0) {
    particle.dead = true
  }
}

function renderEntity(entity) {
  if (entity.alpha) {
    push()
    tint(255, entity.alpha)  // Fade out
  }

  renderGoLCells(entity)

  if (entity.alpha) {
    pop()
  }
}
```

---

## 🎨 Visual Enhancements

### Gradients (Like Space Invaders CA)
```javascript
// Create gradient for entity
function createGradient(entity) {
  entity.gradient = {
    colors: [
      color(49, 134, 255),   // Blue
      color(252, 65, 61),    // Red
      color(0, 175, 87),     // Green
      color(255, 204, 0),    // Yellow
      color(255, 255, 255)   // White
    ],
    offset: 0
  }
}

function renderGoLCellsWithGradient(entity) {
  const grid = entity.gol.current
  const cellSize = entity.cellSize || 3

  // Animate gradient
  entity.gradient.offset += 0.01

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        // Map position to gradient
        const t = (y / grid[x].length + entity.gradient.offset) % 1
        const c = lerpGradient(entity.gradient.colors, t)

        fill(c)
        noStroke()
        rect(
          entity.x + x * cellSize,
          entity.y + y * cellSize,
          cellSize,
          cellSize
        )
      }
    }
  }
}

function lerpGradient(colors, t) {
  const scaled = t * (colors.length - 1)
  const index = Math.floor(scaled)
  const frac = scaled - index

  if (index >= colors.length - 1) {
    return colors[colors.length - 1]
  }

  return lerpColor(colors[index], colors[index + 1], frac)
}
```

### Cell Glow Effect
```javascript
function renderGoLCellsWithGlow(entity) {
  const grid = entity.gol.current
  const cellSize = entity.cellSize || 3

  // Draw glow first (larger, semi-transparent)
  fill(entity.color.r, entity.color.g, entity.color.b, 100)
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        rect(
          entity.x + x * cellSize - 1,
          entity.y + y * cellSize - 1,
          cellSize + 2,
          cellSize + 2
        )
      }
    }
  }

  // Draw solid cells on top
  fill(entity.color.r, entity.color.g, entity.color.b)
  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        rect(
          entity.x + x * cellSize,
          entity.y + y * cellSize,
          cellSize,
          cellSize
        )
      }
    }
  }
}
```

---

## ✅ Validation Checklist

Before submitting game:

### GoL Requirements
- [ ] NO static images/sprites (all visuals are procedural)
- [ ] GoLEngine used for all entity visuals
- [ ] B3/S23 rules not modified (unless documented)
- [ ] BLINKER pattern oscillates correctly (runtime test)

### UI Requirements
- [ ] Score displayed in top-left
- [ ] Lives displayed (if applicable)
- [ ] Level displayed (if applicable)
- [ ] Google brand colors used
- [ ] Clean white background (or solid color)
- [ ] Minimal, uncluttered UI

### Performance Requirements
- [ ] Maintains 60fps with 10+ entities
- [ ] GoL grid sizes reasonable (< 30x30 per entity)
- [ ] No memory leaks (entities cleaned up)

### Gameplay Requirements
- [ ] MENU → PLAYING → GAMEOVER flow works
- [ ] SPACE to start/restart
- [ ] Controls clearly documented
- [ ] Win/lose conditions clear

---

## 🔧 Troubleshooting

### "Player visual looks static"
```javascript
// Check GoL is updating
player.gol.update()  // Must be called every frame

// Check update rate isn't too slow
player.gol = new GoLEngine(13, 13, 12)  // 12fps is good

// Apply life force if cells are dying
applyLifeForce(player)
```

### "Performance is slow"
```javascript
// Reduce GoL grid sizes
player.gol = new GoLEngine(10, 10, 12)  // Smaller = faster

// Reduce update rate
player.gol = new GoLEngine(13, 13, 8)  // 8fps instead of 12

// Limit entity count
if (enemies.length > 20) {
  enemies.shift()  // Remove oldest
}
```

### "Collision detection not working"
```javascript
// Debug: Draw hitboxes
function renderEntity(entity) {
  renderGoLCells(entity)

  // Debug hitbox
  noFill()
  stroke(255, 0, 0)
  rect(entity.x, entity.y, entity.width, entity.height)
}
```

---

## 📚 Reference

### Available Patterns
From `src/utils/Patterns.js`:
- `BLOCK` - 2x2 still life
- `BEEHIVE` - 4x3 still life
- `BLINKER` - 1x3 oscillator (period 2)
- `TOAD` - 4x2 oscillator (period 2)
- `PULSAR` - 13x13 oscillator (period 3)
- `GLIDER` - 3x3 spaceship
- `LIGHTWEIGHT_SPACESHIP` - 5x4 spaceship
- `R_PENTOMINO` - Methuselah (1,103 generations)

### GoL Strategies
- **Pure:** Just B3/S23, no modifications (explosions, powerups)
- **Modified:** B3/S23 + life force (player, bosses)
- **Visual Only:** Static pattern + flicker (small obstacles, bullets)

### Color Palette (Google Brand)
```javascript
const GOOGLE_COLORS = {
  blue: color(49, 134, 255),
  red: color(252, 65, 61),
  green: color(0, 175, 87),
  yellow: color(255, 204, 0),
  white: color(255, 255, 255),
  gray700: color(95, 99, 104)
}
```

---

## 🚀 Next Steps

1. Copy template to new game file
2. Customize game logic
3. Test thoroughly
4. Run validation: `npm run validate src/games/your-game.js`
5. Submit for review
