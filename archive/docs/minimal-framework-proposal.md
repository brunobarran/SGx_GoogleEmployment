# Minimal Framework Proposal - Rapid Game Iteration

> **Goal:** Build 6-8 arcade games (Dino, Space Invaders, Pong, Pac-Man, Platformer) in 2 weeks
>
> **Philosophy:** Just enough structure to avoid code duplication, not a single line more

---

## 🎯 Design Principles

1. **KISS over Architecture** - Simple classes, not systems
2. **Copy-Paste Friendly** - Easy to duplicate and modify
3. **GoL First** - Visual layer always uses Conway's rules
4. **JSON-Driven** - Entity configs in JSON (LLM-ready)
5. **No Magic** - Explicit over implicit

---

## 🏗️ Framework Architecture

### Directory Structure
```
src/
├── core/
│   ├── GoLEngine.js          ✅ DONE (Phase 1)
│   └── Input.js              ⭐ NEW (100 lines)
├── rendering/
│   ├── CellRenderer.js       ✅ DONE (Phase 1)
│   └── GoLBackground.js      ✅ DONE (Phase 1)
├── framework/
│   ├── Game.js               ⭐ NEW (150 lines) - Base game class
│   ├── Entity.js             ⭐ NEW (200 lines) - All entity logic
│   └── Utils.js              ⭐ NEW (100 lines) - Collision, physics helpers
├── games/
│   ├── dino/
│   │   ├── entities.json     ⭐ NEW - Entity definitions
│   │   └── dino.js           ⭐ NEW (150 lines) - Game-specific code
│   ├── space-invaders/
│   │   ├── entities.json
│   │   └── invaders.js
│   ├── pong/
│   │   ├── entities.json
│   │   └── pong.js
│   ├── pacman/
│   │   ├── entities.json
│   │   └── pacman.js
│   └── platformer/
│       ├── entities.json
│       └── platformer.js
└── utils/
    ├── Patterns.js           ✅ DONE (Phase 1)
    └── Config.js             ✅ DONE (Phase 1)
```

**Total new code:** ~650 lines of framework + ~150 lines per game

---

## 📦 Framework Core (3 Files)

### 1. Game.js - Base Game Class

**Purpose:** Minimal game loop + entity management

```javascript
/**
 * Base Game class - extend for each game.
 *
 * Handles:
 * - Game loop (update/render)
 * - Entity management (add/remove)
 * - State (MENU/PLAYING/PAUSED/GAMEOVER)
 * - Input handling
 * - Collision detection
 */
export class Game {
  constructor(canvas) {
    this.canvas = canvas
    this.entities = []
    this.state = 'MENU'
    this.input = new Input()

    // Game state
    this.score = 0
    this.lives = 3
    this.level = 1

    // Background
    this.background = new GoLBackground(canvas)
  }

  /**
   * Main game loop - called every frame (60fps)
   */
  update() {
    // Update background
    this.background.update()

    // Update based on state
    switch(this.state) {
      case 'MENU':
        this.updateMenu()
        break
      case 'PLAYING':
        this.updateGame()
        break
      case 'PAUSED':
        this.updatePaused()
        break
      case 'GAMEOVER':
        this.updateGameOver()
        break
    }

    // Clear input flags
    this.input.update()
  }

  /**
   * Update game logic - override in subclass
   */
  updateGame() {
    // Update all entities
    this.entities.forEach(e => e.update(this))

    // Remove dead entities
    this.entities = this.entities.filter(e => !e.dead)

    // Check collisions
    this.checkCollisions()

    // Game-specific logic (override)
    this.gameLogic()
  }

  /**
   * Check collisions between all entities
   */
  checkCollisions() {
    for (let i = 0; i < this.entities.length; i++) {
      for (let j = i + 1; j < this.entities.length; j++) {
        const a = this.entities[i]
        const b = this.entities[j]

        if (this.collides(a, b)) {
          a.onCollision(b, this)
          b.onCollision(a, this)
        }
      }
    }
  }

  /**
   * Check if two entities collide
   */
  collides(a, b) {
    if (!a.collision || !b.collision) return false

    if (a.collision.type === 'circle' && b.collision.type === 'circle') {
      return Utils.circleCircle(a, b)
    }
    if (a.collision.type === 'rect' && b.collision.type === 'rect') {
      return Utils.rectRect(a, b)
    }
    if (a.collision.type === 'circle' && b.collision.type === 'rect') {
      return Utils.circleRect(a, b)
    }
    if (a.collision.type === 'rect' && b.collision.type === 'circle') {
      return Utils.circleRect(b, a)
    }

    return false
  }

  /**
   * Render everything
   */
  render() {
    // Clear screen
    background(0)

    // Render background
    this.background.render()

    // Render based on state
    switch(this.state) {
      case 'MENU':
        this.renderMenu()
        break
      case 'PLAYING':
        this.renderGame()
        break
      case 'PAUSED':
        this.renderPaused()
        break
      case 'GAMEOVER':
        this.renderGameOver()
        break
    }
  }

  /**
   * Render game - override in subclass
   */
  renderGame() {
    // Render all entities
    this.entities.forEach(e => e.render())

    // Render UI
    this.renderUI()
  }

  /**
   * Render UI - override in subclass
   */
  renderUI() {
    fill(255)
    textSize(16)
    textAlign(LEFT, TOP)
    text(`Score: ${this.score}`, 10, 10)
    text(`Lives: ${this.lives}`, 10, 30)
  }

  /**
   * Add entity to game
   */
  spawn(entity) {
    this.entities.push(entity)
    return entity
  }

  /**
   * Remove entity from game
   */
  remove(entity) {
    entity.dead = true
  }

  /**
   * Load entities from JSON
   */
  loadEntities(json) {
    json.forEach(config => {
      const entity = Entity.fromJSON(config)
      this.spawn(entity)
    })
  }

  // Override these in subclass for game-specific logic
  gameLogic() {}
  updateMenu() {}
  updatePaused() {}
  updateGameOver() {}
  renderMenu() {}
  renderPaused() {}
  renderGameOver() {}
}
```

---

### 2. Entity.js - Universal Entity Class

**Purpose:** One entity class for ALL game objects (player, enemies, obstacles, bullets, powerups)

```javascript
/**
 * Universal Entity class.
 *
 * All game objects are entities with different configs:
 * - Player
 * - Enemies
 * - Obstacles
 * - Bullets
 * - Powerups
 * - Walls
 */
export class Entity {
  constructor(config = {}) {
    // Identity
    this.type = config.type || 'entity'
    this.tags = config.tags || []

    // Transform
    this.x = config.x || 0
    this.y = config.y || 0
    this.width = config.width || 40
    this.height = config.height || 40

    // Physics
    this.vx = 0  // velocity x
    this.vy = 0  // velocity y
    this.speed = config.speed || 0
    this.gravity = config.gravity || 0
    this.onGround = false

    // Collision
    this.collision = config.collision || null
    // Examples:
    // { type: 'circle', radius: 20 }
    // { type: 'rect', offsetX: 0, offsetY: 0 }

    // Health
    this.health = config.health || 1
    this.maxHealth = config.maxHealth || this.health
    this.dead = false

    // GoL visual
    this.gol = null
    if (config.gol) {
      this.initGoL(config.gol)
    }

    // AI/Behavior
    this.ai = config.ai || null
    // Examples:
    // { type: 'follow', target: player, speed: 2 }
    // { type: 'patrol', bounds: [x1, x2], speed: 1 }
    // { type: 'static' }

    // Input (for player)
    this.input = config.input || null
    // Example: { jump: 'SPACE', left: 'LEFT', right: 'RIGHT' }

    // Lifetime
    this.lifetime = config.lifetime || null  // frames to live (bullets)
    this.age = 0

    // Callbacks
    this.onCollisionCallback = config.onCollision || null
    this.onDeathCallback = config.onDeath || null
    this.updateCallback = config.update || null
  }

  /**
   * Initialize GoL visual component
   */
  initGoL(config) {
    const cols = config.cols || Math.floor(this.width / 3)
    const rows = config.rows || Math.floor(this.height / 3)

    this.gol = {
      engine: new GoLEngine(cols, rows, config.updateRate || 12),
      strategy: config.strategy || 'Pure',  // Pure, Modified, VisualOnly
      pattern: config.pattern || null,
      lifeForce: config.lifeForce || false,
      cellSize: Math.floor(this.width / cols)
    }

    // Seed with pattern or random
    if (config.pattern) {
      this.gol.engine.setPattern(Patterns[config.pattern], 0, 0)
    } else {
      this.gol.engine.randomSeed(0.4)
    }
  }

  /**
   * Update entity - called every frame
   */
  update(game) {
    this.age++

    // Lifetime check
    if (this.lifetime && this.age > this.lifetime) {
      this.dead = true
      return
    }

    // Update GoL
    if (this.gol) {
      this.updateGoL()
    }

    // Handle input (for player)
    if (this.input) {
      this.handleInput(game.input)
    }

    // AI behavior
    if (this.ai) {
      this.updateAI(game)
    }

    // Physics
    this.updatePhysics(game)

    // Custom update logic
    if (this.updateCallback) {
      this.updateCallback(this, game)
    }

    // Keep in bounds
    if (this.x < 0) this.x = 0
    if (this.x > game.canvas.width) this.x = game.canvas.width
  }

  /**
   * Update GoL simulation
   */
  updateGoL() {
    if (!this.gol) return

    switch(this.gol.strategy) {
      case 'Pure':
        // Pure GoL - just update
        this.gol.engine.update()
        break

      case 'Modified':
        // Modified GoL - update + life force
        this.gol.engine.update()
        if (this.gol.lifeForce) {
          this.applyLifeForce()
        }
        break

      case 'VisualOnly':
        // Visual only - flicker cells
        this.flickerCells()
        break
    }
  }

  /**
   * Apply life force (Modified GoL)
   */
  applyLifeForce() {
    // Count alive cells in core (center 30%)
    const coreSize = Math.floor(this.gol.engine.cols * 0.3)
    const coreX = Math.floor(this.gol.engine.cols * 0.35)
    const coreY = Math.floor(this.gol.engine.rows * 0.35)

    let alive = 0
    for (let x = coreX; x < coreX + coreSize; x++) {
      for (let y = coreY; y < coreY + coreSize; y++) {
        if (this.gol.engine.getCell(x, y)) alive++
      }
    }

    // If too few cells, inject some
    const threshold = coreSize * coreSize * 0.3
    if (alive < threshold) {
      for (let i = 0; i < 3; i++) {
        const x = coreX + Math.floor(Math.random() * coreSize)
        const y = coreY + Math.floor(Math.random() * coreSize)
        this.gol.engine.setCell(x, y, 1)
      }
    }
  }

  /**
   * Flicker cells (VisualOnly)
   */
  flickerCells() {
    // Toggle random edge cells every few frames
    if (this.age % 5 === 0) {
      const x = Math.floor(Math.random() * this.gol.engine.cols)
      const y = Math.floor(Math.random() * this.gol.engine.rows)
      const current = this.gol.engine.getCell(x, y)
      this.gol.engine.setCell(x, y, current ? 0 : 1)
    }
  }

  /**
   * Handle input (for player)
   */
  handleInput(input) {
    if (!this.input) return

    // Horizontal movement
    if (this.input.left && input.isPressed(this.input.left)) {
      this.vx = -this.speed
    } else if (this.input.right && input.isPressed(this.input.right)) {
      this.vx = this.speed
    } else {
      this.vx = 0
    }

    // Jump
    if (this.input.jump && input.justPressed(this.input.jump)) {
      if (this.onGround) {
        this.vy = -this.input.jumpForce || -12
        this.onGround = false
      }
    }
  }

  /**
   * Update AI behavior
   */
  updateAI(game) {
    if (!this.ai) return

    switch(this.ai.type) {
      case 'follow':
        // Follow target (e.g., ghost follows player)
        const target = this.ai.target
        const dx = target.x - this.x
        const dy = target.y - this.y
        const dist = Math.sqrt(dx*dx + dy*dy)
        if (dist > 0) {
          this.vx = (dx / dist) * this.ai.speed
          this.vy = (dy / dist) * this.ai.speed
        }
        break

      case 'patrol':
        // Patrol between two points
        if (this.x <= this.ai.bounds[0]) {
          this.vx = this.ai.speed
        } else if (this.x >= this.ai.bounds[1]) {
          this.vx = -this.ai.speed
        }
        break

      case 'static':
        // Don't move
        this.vx = 0
        this.vy = 0
        break
    }
  }

  /**
   * Update physics
   */
  updatePhysics(game) {
    // Apply gravity
    if (this.gravity) {
      this.vy += this.gravity

      // Terminal velocity
      if (this.vy > 10) this.vy = 10
    }

    // Apply velocity
    this.x += this.vx
    this.y += this.vy

    // Ground collision (simple)
    const groundY = game.canvas.height - 80
    if (this.y + this.height > groundY) {
      this.y = groundY - this.height
      this.vy = 0
      this.onGround = true
    } else {
      this.onGround = false
    }
  }

  /**
   * Handle collision with another entity
   */
  onCollision(other, game) {
    // Custom callback
    if (this.onCollisionCallback) {
      this.onCollisionCallback(this, other, game)
    }
  }

  /**
   * Take damage
   */
  damage(amount) {
    this.health -= amount
    if (this.health <= 0) {
      this.die()
    }
  }

  /**
   * Die
   */
  die() {
    this.dead = true
    if (this.onDeathCallback) {
      this.onDeathCallback(this)
    }
  }

  /**
   * Render entity
   */
  render() {
    if (this.gol) {
      // Render GoL cells
      const grid = this.gol.engine.current
      const cellSize = this.gol.cellSize

      fill(255)
      noStroke()

      for (let x = 0; x < grid.length; x++) {
        for (let y = 0; y < grid[x].length; y++) {
          if (grid[x][y] === 1) {
            rect(this.x + x * cellSize, this.y + y * cellSize, cellSize, cellSize)
          }
        }
      }
    } else {
      // Simple rectangle fallback
      fill(255)
      rect(this.x, this.y, this.width, this.height)
    }

    // Debug: render hitbox
    if (this.collision && Config.DEBUG) {
      noFill()
      stroke(255, 0, 0)
      if (this.collision.type === 'circle') {
        circle(this.x + this.width/2, this.y + this.height/2, this.collision.radius * 2)
      } else {
        rect(this.x, this.y, this.width, this.height)
      }
    }
  }

  /**
   * Create entity from JSON config
   */
  static fromJSON(json) {
    return new Entity(json)
  }
}
```

---

### 3. Utils.js - Collision & Physics Helpers

**Purpose:** Utility functions (collision detection, physics helpers)

```javascript
/**
 * Utility functions for collision detection and physics.
 */
export const Utils = {
  /**
   * Circle-circle collision
   */
  circleCircle(a, b) {
    const ax = a.x + a.width / 2
    const ay = a.y + a.height / 2
    const bx = b.x + b.width / 2
    const by = b.y + b.height / 2

    const dx = ax - bx
    const dy = ay - by
    const dist = Math.sqrt(dx*dx + dy*dy)

    return dist < (a.collision.radius + b.collision.radius)
  },

  /**
   * Rectangle-rectangle collision (AABB)
   */
  rectRect(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    )
  },

  /**
   * Circle-rectangle collision
   */
  circleRect(circle, rect) {
    const cx = circle.x + circle.width / 2
    const cy = circle.y + circle.height / 2
    const r = circle.collision.radius

    // Find closest point on rectangle to circle center
    const closestX = Math.max(rect.x, Math.min(cx, rect.x + rect.width))
    const closestY = Math.max(rect.y, Math.min(cy, rect.y + rect.height))

    // Distance from circle center to closest point
    const dx = cx - closestX
    const dy = cy - closestY
    const dist = Math.sqrt(dx*dx + dy*dy)

    return dist < r
  },

  /**
   * Distance between two points
   */
  distance(x1, y1, x2, y2) {
    const dx = x2 - x1
    const dy = y2 - y1
    return Math.sqrt(dx*dx + dy*dy)
  },

  /**
   * Lerp (linear interpolation)
   */
  lerp(a, b, t) {
    return a + (b - a) * t
  },

  /**
   * Clamp value between min and max
   */
  clamp(value, min, max) {
    return Math.max(min, Math.min(max, value))
  }
}
```

---

### 4. Input.js - Keyboard Input Manager

**Purpose:** Track key states (pressed, justPressed, justReleased)

```javascript
/**
 * Input manager for keyboard input.
 */
export class Input {
  constructor() {
    this.keys = {}
    this.justPressedKeys = new Set()
    this.justReleasedKeys = new Set()

    // Key mappings (arcade controls)
    this.mappings = {
      'SPACE': ' ',
      'LEFT': 'ArrowLeft',
      'RIGHT': 'ArrowRight',
      'UP': 'ArrowUp',
      'DOWN': 'ArrowDown',
      'A': 'a',
      'B': 'b',
      'C': 'c',
      'Z': 'z',
      'X': 'x'
    }

    this.setupListeners()
  }

  setupListeners() {
    document.addEventListener('keydown', (e) => {
      if (!this.keys[e.key]) {
        this.justPressedKeys.add(e.key)
      }
      this.keys[e.key] = true
    })

    document.addEventListener('keyup', (e) => {
      this.keys[e.key] = false
      this.justReleasedKeys.add(e.key)
    })
  }

  /**
   * Check if key is currently pressed
   */
  isPressed(key) {
    const mappedKey = this.mappings[key] || key
    return this.keys[mappedKey] || false
  }

  /**
   * Check if key was just pressed this frame
   */
  justPressed(key) {
    const mappedKey = this.mappings[key] || key
    return this.justPressedKeys.has(mappedKey)
  }

  /**
   * Check if key was just released this frame
   */
  justReleased(key) {
    const mappedKey = this.mappings[key] || key
    return this.justReleasedKeys.has(mappedKey)
  }

  /**
   * Clear just pressed/released flags (call at end of frame)
   */
  update() {
    this.justPressedKeys.clear()
    this.justReleasedKeys.clear()
  }
}
```

---

## 🎮 Example Games

### Dino Game (150 lines)

**entities.json:**
```json
{
  "player": {
    "type": "player",
    "x": 100,
    "y": 400,
    "width": 40,
    "height": 40,
    "collision": { "type": "circle", "radius": 20 },
    "gol": {
      "strategy": "Modified",
      "lifeForce": true,
      "pattern": "BLINKER",
      "updateRate": 12
    },
    "input": {
      "jump": "SPACE",
      "jumpForce": 12
    },
    "gravity": 0.6,
    "health": 1
  },

  "obstacle": {
    "type": "obstacle",
    "x": 800,
    "y": 400,
    "width": 30,
    "height": 40,
    "collision": { "type": "rect" },
    "gol": {
      "strategy": "VisualOnly",
      "cols": 10,
      "rows": 13
    },
    "speed": -6
  }
}
```

**dino.js:**
```javascript
import { Game } from '../framework/Game.js'
import { Entity } from '../framework/Entity.js'
import entitiesJSON from './entities.json'

export class DinoGame extends Game {
  constructor(canvas) {
    super(canvas)

    // Load player
    this.player = Entity.fromJSON(entitiesJSON.player)
    this.spawn(this.player)

    // Obstacle spawn timer
    this.spawnTimer = 0
    this.spawnInterval = 90  // frames

    // Start playing
    this.state = 'PLAYING'
  }

  gameLogic() {
    // Spawn obstacles
    this.spawnTimer++
    if (this.spawnTimer >= this.spawnInterval) {
      this.spawnObstacle()
      this.spawnTimer = 0

      // Speed up over time
      this.spawnInterval = Math.max(30, this.spawnInterval - 1)
    }

    // Remove offscreen obstacles
    this.entities.forEach(e => {
      if (e.type === 'obstacle' && e.x < -50) {
        this.remove(e)
        this.score += 10
      }
    })

    // Check player death
    if (this.player.dead) {
      this.state = 'GAMEOVER'
    }

    // Update score
    this.score++
  }

  spawnObstacle() {
    const obstacle = Entity.fromJSON({
      ...entitiesJSON.obstacle,
      x: this.canvas.width,
      onCollision: (self, other, game) => {
        if (other.type === 'player') {
          other.die()
        }
      }
    })

    // Set velocity
    obstacle.vx = entitiesJSON.obstacle.speed

    this.spawn(obstacle)
  }

  renderMenu() {
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(32)
    text('DINO GAME', this.canvas.width/2, this.canvas.height/2 - 50)
    textSize(16)
    text('Press SPACE to start', this.canvas.width/2, this.canvas.height/2 + 50)

    if (this.input.justPressed('SPACE')) {
      this.state = 'PLAYING'
    }
  }

  renderGameOver() {
    fill(255)
    textAlign(CENTER, CENTER)
    textSize(32)
    text('GAME OVER', this.canvas.width/2, this.canvas.height/2 - 50)
    textSize(16)
    text(`Score: ${this.score}`, this.canvas.width/2, this.canvas.height/2)
    text('Press SPACE to restart', this.canvas.width/2, this.canvas.height/2 + 50)

    if (this.input.justPressed('SPACE')) {
      // Reset game
      this.entities = []
      this.player = Entity.fromJSON(entitiesJSON.player)
      this.spawn(this.player)
      this.score = 0
      this.spawnTimer = 0
      this.spawnInterval = 90
      this.state = 'PLAYING'
    }
  }
}
```

---

### Space Invaders (180 lines)

**entities.json:**
```json
{
  "player": {
    "type": "player",
    "x": 400,
    "y": 550,
    "width": 40,
    "height": 30,
    "collision": { "type": "rect" },
    "gol": {
      "strategy": "Modified",
      "lifeForce": true,
      "updateRate": 12
    },
    "input": {
      "left": "LEFT",
      "right": "RIGHT",
      "shoot": "SPACE"
    },
    "speed": 5,
    "health": 3
  },

  "invader": {
    "type": "invader",
    "x": 0,
    "y": 0,
    "width": 30,
    "height": 30,
    "collision": { "type": "rect" },
    "gol": {
      "strategy": "VisualOnly",
      "cols": 10,
      "rows": 10
    },
    "health": 1,
    "scoreValue": 10
  },

  "bullet": {
    "type": "bullet",
    "width": 4,
    "height": 10,
    "collision": { "type": "rect" },
    "gol": {
      "strategy": "VisualOnly",
      "cols": 2,
      "rows": 5
    },
    "lifetime": 120
  }
}
```

**invaders.js:**
```javascript
import { Game } from '../framework/Game.js'
import { Entity } from '../framework/Entity.js'
import entitiesJSON from './entities.json'

export class SpaceInvadersGame extends Game {
  constructor(canvas) {
    super(canvas)

    // Load player
    this.player = Entity.fromJSON(entitiesJSON.player)
    this.spawn(this.player)

    // Spawn invaders
    this.spawnInvaders()

    // Invader movement
    this.invaderDirection = 1  // 1 = right, -1 = left
    this.invaderSpeed = 1
    this.invaderMoveTimer = 0
    this.invaderMoveInterval = 30

    this.state = 'PLAYING'
  }

  spawnInvaders() {
    for (let row = 0; row < 5; row++) {
      for (let col = 0; col < 11; col++) {
        const invader = Entity.fromJSON({
          ...entitiesJSON.invader,
          x: 100 + col * 50,
          y: 50 + row * 40,
          onCollision: (self, other, game) => {
            if (other.type === 'bullet') {
              self.die()
              other.die()
              game.score += self.scoreValue || 10
            }
          }
        })

        this.spawn(invader)
      }
    }
  }

  gameLogic() {
    // Move invaders
    this.invaderMoveTimer++
    if (this.invaderMoveTimer >= this.invaderMoveInterval) {
      this.moveInvaders()
      this.invaderMoveTimer = 0
    }

    // Player shoot
    if (this.input.justPressed('SPACE')) {
      this.playerShoot()
    }

    // Check win/lose
    const invaders = this.entities.filter(e => e.type === 'invader')
    if (invaders.length === 0) {
      this.nextWave()
    }

    if (this.player.dead) {
      this.state = 'GAMEOVER'
    }
  }

  moveInvaders() {
    const invaders = this.entities.filter(e => e.type === 'invader')

    // Check if any invader hit edge
    const hitEdge = invaders.some(inv =>
      (this.invaderDirection > 0 && inv.x > 750) ||
      (this.invaderDirection < 0 && inv.x < 50)
    )

    if (hitEdge) {
      // Move down and reverse direction
      invaders.forEach(inv => inv.y += 20)
      this.invaderDirection *= -1
    } else {
      // Move horizontally
      invaders.forEach(inv => inv.x += this.invaderDirection * this.invaderSpeed)
    }
  }

  playerShoot() {
    const bullet = Entity.fromJSON({
      ...entitiesJSON.bullet,
      x: this.player.x + this.player.width/2,
      y: this.player.y
    })

    bullet.vy = -8

    this.spawn(bullet)
  }

  nextWave() {
    this.level++
    this.spawnInvaders()
    this.invaderSpeed += 0.5
    this.invaderMoveInterval = Math.max(10, this.invaderMoveInterval - 5)
  }
}
```

---

### Pong (120 lines)

**entities.json:**
```json
{
  "paddle": {
    "type": "paddle",
    "width": 15,
    "height": 80,
    "collision": { "type": "rect" },
    "gol": {
      "strategy": "Modified",
      "lifeForce": true,
      "cols": 5,
      "rows": 26
    },
    "speed": 6
  },

  "ball": {
    "type": "ball",
    "width": 15,
    "height": 15,
    "collision": { "type": "circle", "radius": 7 },
    "gol": {
      "strategy": "Pure",
      "pattern": "GLIDER",
      "updateRate": 30
    }
  }
}
```

**pong.js:**
```javascript
import { Game } from '../framework/Game.js'
import { Entity } from '../framework/Entity.js'
import entitiesJSON from './entities.json'

export class PongGame extends Game {
  constructor(canvas) {
    super(canvas)

    // Left paddle (player)
    this.leftPaddle = Entity.fromJSON({
      ...entitiesJSON.paddle,
      x: 20,
      y: canvas.height / 2 - 40,
      input: { up: 'UP', down: 'DOWN' },
      update: (self, game) => {
        if (game.input.isPressed('UP')) self.y -= self.speed
        if (game.input.isPressed('DOWN')) self.y += self.speed
        self.y = Utils.clamp(self.y, 0, game.canvas.height - self.height)
      }
    })

    // Right paddle (AI)
    this.rightPaddle = Entity.fromJSON({
      ...entitiesJSON.paddle,
      x: canvas.width - 35,
      y: canvas.height / 2 - 40,
      update: (self, game) => {
        // Simple AI - follow ball
        const ball = game.ball
        const targetY = ball.y - self.height / 2
        const diff = targetY - self.y

        if (Math.abs(diff) > 5) {
          self.y += Math.sign(diff) * self.speed * 0.7
        }

        self.y = Utils.clamp(self.y, 0, game.canvas.height - self.height)
      }
    })

    // Ball
    this.ball = Entity.fromJSON({
      ...entitiesJSON.ball,
      x: canvas.width / 2,
      y: canvas.height / 2,
      vx: 5,
      vy: 3,
      onCollision: (self, other, game) => {
        if (other.type === 'paddle') {
          self.vx *= -1
          self.x += self.vx * 2  // Push away from paddle
        }
      }
    })

    this.spawn(this.leftPaddle)
    this.spawn(this.rightPaddle)
    this.spawn(this.ball)

    this.leftScore = 0
    this.rightScore = 0

    this.state = 'PLAYING'
  }

  gameLogic() {
    // Ball out of bounds
    if (this.ball.x < 0) {
      // Right scores
      this.rightScore++
      this.resetBall()
    } else if (this.ball.x > this.canvas.width) {
      // Left scores
      this.leftScore++
      this.resetBall()
    }

    // Ball bounce on top/bottom
    if (this.ball.y < 0 || this.ball.y > this.canvas.height) {
      this.ball.vy *= -1
    }

    // Win condition
    if (this.leftScore >= 5 || this.rightScore >= 5) {
      this.state = 'GAMEOVER'
    }
  }

  resetBall() {
    this.ball.x = this.canvas.width / 2
    this.ball.y = this.canvas.height / 2
    this.ball.vx = (Math.random() > 0.5 ? 1 : -1) * 5
    this.ball.vy = (Math.random() - 0.5) * 6
  }

  renderUI() {
    fill(255)
    textSize(32)
    textAlign(CENTER, TOP)
    text(`${this.leftScore}  ${this.rightScore}`, this.canvas.width/2, 20)
  }
}
```

---

## 📊 Framework Stats

### Code Size
- **Framework core:** ~550 lines (Game.js + Entity.js + Utils.js + Input.js)
- **Per game:** ~100-180 lines
- **Total for 5 games:** ~1,200 lines

### Time Estimate
- **Framework:** 2 days (Game.js, Entity.js, Utils.js, Input.js)
- **Dino Game:** 1 day
- **Space Invaders:** 1.5 days
- **Pong:** 0.5 days
- **Pac-Man:** 2 days
- **Platformer:** 2 days
- **Total:** ~9 days for framework + 5 games

### Pros
- ✅ **Minimal:** Only ~550 lines of framework
- ✅ **Fast:** Copy-paste friendly, quick iteration
- ✅ **JSON-driven:** Entities defined in JSON (LLM-ready)
- ✅ **GoL integrated:** All visuals use Conway's rules
- ✅ **Flexible:** Easy to extend per-game

### Cons
- ❌ **Some duplication:** Game logic not fully abstracted
- ❌ **Limited rules engine:** Uses callbacks, not declarative
- ❌ **Basic collision:** Only simple shapes

---

## 🚀 Implementation Plan (2 Weeks)

### Week 1 (Framework + 2 games)
**Day 1-2:** Build framework core
- Game.js (game loop, entity management, collision)
- Entity.js (universal entity class)
- Utils.js (collision detection)
- Input.js (keyboard input)

**Day 3:** Dino Game
- entities.json
- dino.js
- Test, debug, polish

**Day 4-5:** Space Invaders
- entities.json
- invaders.js
- Test, debug, polish

**Deliverable:** Framework + 2 complete games

---

### Week 2 (3 more games + docs)
**Day 6:** Pong
- entities.json
- pong.js
- Test, debug

**Day 7-8:** Pac-Man
- entities.json (ghosts, pellets, walls)
- pacman.js
- Test, debug

**Day 9-10:** Platformer
- entities.json (player, platforms, enemies)
- platformer.js
- Test, debug

**Day 11-12:** Documentation
- Framework usage guide
- JSON schema definitions
- Example games
- Prepare for LLM integration

**Deliverable:** 5 games + documentation

---

## 📝 Next Steps

1. **Approve this proposal** - Does this architecture make sense?

2. **Start framework implementation** - I can generate Game.js, Entity.js, Utils.js, Input.js today

3. **Build first game (Dino)** - Validate framework works

4. **Iterate rapidly** - Build remaining games

What do you think? Should I start generating the framework code?
