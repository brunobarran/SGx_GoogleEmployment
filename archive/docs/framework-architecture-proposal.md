# Game of Life Arcade Framework - Architecture Proposal

> **Purpose:** Define a generalized, extensible framework that allows an LLM to create any arcade-style game using Conway's Game of Life as the visual engine.
>
> **Use Case:** Developer provides game concept ("Make a Mario Bros-style platformer") → LLM uses this framework to generate game rules, entities, and mechanics.

---

## Executive Summary

### Current State (Phase 1)
- ✅ Core GoL engine (B3/S23, double buffer)
- ✅ Rendering system (batch cells, background)
- ✅ Basic architecture (hardcoded for Dino game)

### Problem
The current architecture is **too specific** to the Dinosaur Game. An LLM would struggle to create different game types (platformers, shooters, puzzle games) because:
- Game logic is tightly coupled to specific entities
- No clear separation between engine/framework and game-specific code
- Missing abstractions for common game patterns
- No declarative way to define game rules

### Proposed Solution
Create a **3-layer architecture**:

```
┌─────────────────────────────────────────────────┐
│  Layer 3: Game Definitions (LLM-Generated)     │
│  - Game rules (JSON/declarative)                │
│  - Entity configurations                        │
│  - Win/lose conditions                          │
│  - Level design                                 │
└─────────────────────────────────────────────────┘
                    ↓ uses
┌─────────────────────────────────────────────────┐
│  Layer 2: Game Framework (Reusable)            │
│  - BaseGame, GameLoop, StateManager             │
│  - Entity system (Player, Enemy, Collectible)   │
│  - Physics, Collision, Input                    │
│  - Smart Hybrid GoL strategies                  │
└─────────────────────────────────────────────────┘
                    ↓ uses
┌─────────────────────────────────────────────────┐
│  Layer 1: GoL Engine (Immutable Core)          │
│  - GoLEngine, CellRenderer                      │
│  - Patterns, MaskGenerator                      │
│  - Performance monitoring                       │
└─────────────────────────────────────────────────┘
```

**Key Principle:** Layer 3 (game-specific) should be **100% declarative JSON + minimal glue code**. LLM generates this layer.

---

## Detailed Architecture

### Layer 1: GoL Engine (Immutable Core)

**Status:** ✅ Already implemented in Phase 1

**Purpose:** Pure GoL simulation. Never changes regardless of game type.

**Components:**
```javascript
// Already implemented
src/core/GoLEngine.js         // B3/S23 engine, double buffer
src/rendering/CellRenderer.js // Batch rendering
src/rendering/GoLBackground.js // Pure GoL background
src/utils/Patterns.js         // Canonical patterns (GLIDER, BLINKER, etc)
src/utils/MaskGenerator.js    // Shape-bounded GoL (Phase 2)
src/utils/Config.js           // Constants
```

**Interface (stable):**
```javascript
// GoLEngine API - NEVER changes
class GoLEngine {
  constructor(cols, rows, updateRateFPS)
  update()                    // Apply B3/S23 rules
  setCell(x, y, state)
  getCell(x, y)
  setPattern(pattern, x, y)
  randomSeed(density)
  clearGrid()
}
```

**No changes needed for this layer.**

---

### Layer 2: Game Framework (Reusable)

**Status:** 🚧 Needs refinement (Phase 2-3)

**Purpose:** Reusable game components. Works for any arcade game type.

#### 2.1 Core Systems

```javascript
src/core/
├── GameLoop.js           // ⭐ NEW: Main loop, frame timing
├── StateManager.js       // ⭐ NEW: State machine (MENU, PLAYING, PAUSED, GAME_OVER)
├── InputManager.js       // ✅ Phase 2: Keyboard/arcade input
├── PhysicsEngine.js      // ✅ Phase 2: Gravity, velocity, acceleration
└── EventBus.js           // ⭐ NEW: Pub/sub for game events
```

**GameLoop (NEW - Critical for framework):**
```javascript
/**
 * Generic game loop - works for any game type.
 *
 * Responsibilities:
 * - Fixed timestep updates (60fps)
 * - Delta time calculation
 * - Update/render separation
 * - Performance monitoring
 */
class GameLoop {
  constructor(gameInstance) {
    this.game = gameInstance
    this.fps = 60
    this.lastFrameTime = 0
    this.deltaTime = 0
    this.paused = false
  }

  start() {
    this.running = true
    this.loop()
  }

  loop() {
    if (!this.running) return

    const currentTime = performance.now()
    this.deltaTime = (currentTime - this.lastFrameTime) / 1000
    this.lastFrameTime = currentTime

    if (!this.paused) {
      this.game.update(this.deltaTime)
    }
    this.game.render()

    requestAnimationFrame(() => this.loop())
  }

  pause() { this.paused = true }
  resume() { this.paused = false }
  stop() { this.running = false }
}
```

**StateManager (NEW - Critical for framework):**
```javascript
/**
 * Finite state machine for game states.
 *
 * Works for any game: platformer, shooter, puzzle.
 */
class StateManager {
  constructor() {
    this.states = new Map()
    this.currentState = null
    this.previousState = null
  }

  addState(name, stateInstance) {
    this.states.set(name, stateInstance)
  }

  setState(name) {
    if (this.currentState) {
      this.currentState.exit()
    }
    this.previousState = this.currentState
    this.currentState = this.states.get(name)
    this.currentState.enter()
  }

  update(deltaTime) {
    if (this.currentState) {
      this.currentState.update(deltaTime)
    }
  }

  render() {
    if (this.currentState) {
      this.currentState.render()
    }
  }
}

/**
 * Base state class - extend for specific states.
 */
class GameState {
  enter() {}   // Called when entering state
  exit() {}    // Called when exiting state
  update(dt) {} // Called every frame
  render() {}  // Called every frame
}
```

**EventBus (NEW - Decouples game logic):**
```javascript
/**
 * Event bus for decoupled communication.
 *
 * Examples:
 * - EventBus.emit('PLAYER_DIED', { x, y })
 * - EventBus.on('ENEMY_KILLED', (enemy) => score += 100)
 */
class EventBus {
  constructor() {
    this.listeners = new Map()
  }

  on(eventName, callback) {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, [])
    }
    this.listeners.get(eventName).push(callback)
  }

  emit(eventName, data) {
    if (this.listeners.has(eventName)) {
      this.listeners.get(eventName).forEach(callback => callback(data))
    }
  }

  off(eventName, callback) {
    if (this.listeners.has(eventName)) {
      const callbacks = this.listeners.get(eventName)
      const index = callbacks.indexOf(callback)
      if (index > -1) callbacks.splice(index, 1)
    }
  }
}
```

#### 2.2 Entity System (Component-Based)

**Current approach (Phase 2):** Inheritance hierarchy
```javascript
// Current (Phase 2) - Works but not flexible
CellularSprite
  ├── ModifiedGoLSprite (player, bosses)
  ├── VisualOnlySprite (obstacles)
  └── PureGoLSprite (explosions)
```

**Proposed approach:** **Entity-Component System (ECS-lite)**

```javascript
src/entities/
├── Entity.js                  // ⭐ NEW: Base entity (ID, tags, components)
├── components/                // ⭐ NEW: Reusable components
│   ├── GoLComponent.js        // GoL simulation (Pure/Modified/Visual)
│   ├── TransformComponent.js  // Position, rotation, scale
│   ├── PhysicsComponent.js    // Velocity, acceleration, mass
│   ├── CollisionComponent.js  // Hitbox, collision layer
│   ├── InputComponent.js      // Input mapping
│   ├── HealthComponent.js     // HP, damage, invincibility
│   ├── AIComponent.js         // Behavior tree, state machine
│   └── RenderComponent.js     // Sprite, animation, effects
└── EntityFactory.js           // ⭐ NEW: Create entities from config
```

**Why ECS-lite?**
- ✅ **Composability:** Mix and match components for different entity types
- ✅ **Declarative:** Entities defined as JSON configs
- ✅ **LLM-friendly:** Easy for AI to generate entity definitions
- ✅ **Reusable:** Same components work for platformer, shooter, puzzle

**Example entity definition (JSON - LLM generates this):**
```json
{
  "player": {
    "components": {
      "transform": { "x": 100, "y": 400 },
      "physics": { "gravity": 0.6, "canJump": true },
      "collision": { "type": "circle", "radius": 25, "layer": "player" },
      "gol": {
        "strategy": "Modified",
        "lifeForce": true,
        "size": [20, 20],
        "updateRate": 12
      },
      "input": { "jump": "SPACE", "left": "LEFT", "right": "RIGHT" },
      "health": { "max": 3, "current": 3 }
    }
  },

  "enemy_cactus": {
    "components": {
      "transform": { "x": 800, "y": 400 },
      "collision": { "type": "rect", "width": 30, "height": 40, "layer": "enemy" },
      "gol": { "strategy": "VisualOnly", "size": [12, 16], "pattern": "static_bars" },
      "movement": { "velocityX": -6, "velocityY": 0 }
    }
  },

  "powerup_coin": {
    "components": {
      "transform": { "x": 500, "y": 300 },
      "collision": { "type": "circle", "radius": 10, "layer": "collectible" },
      "gol": { "strategy": "Pure", "pattern": "PULSAR", "updateRate": 10 },
      "collectible": { "scoreValue": 10, "destroyOnCollect": true }
    }
  }
}
```

**EntityFactory (NEW):**
```javascript
/**
 * Creates entities from declarative JSON config.
 * LLM generates configs, factory instantiates them.
 */
class EntityFactory {
  constructor(componentRegistry) {
    this.registry = componentRegistry
  }

  /**
   * Create entity from JSON config.
   *
   * @param {Object} config - Entity configuration
   * @returns {Entity} Instantiated entity
   */
  createFromConfig(config) {
    const entity = new Entity()

    for (const [componentName, componentConfig] of Object.entries(config.components)) {
      const ComponentClass = this.registry.get(componentName)
      const component = new ComponentClass(componentConfig)
      entity.addComponent(componentName, component)
    }

    return entity
  }
}
```

#### 2.3 Systems (Process Components)

```javascript
src/systems/
├── PhysicsSystem.js      // Process PhysicsComponents
├── CollisionSystem.js    // Check collisions between CollisionComponents
├── RenderSystem.js       // Render all entities with RenderComponents
├── InputSystem.js        // Process InputComponents
├── GoLSystem.js          // Update all GoLComponents
└── AISystem.js           // Process AIComponents
```

**System pattern:**
```javascript
/**
 * Base system - processes entities with specific components.
 */
class System {
  update(entities, deltaTime) {
    const relevantEntities = entities.filter(e => this.matches(e))
    relevantEntities.forEach(entity => this.processEntity(entity, deltaTime))
  }

  matches(entity) {
    // Override: return true if entity has required components
  }

  processEntity(entity, deltaTime) {
    // Override: process single entity
  }
}

/**
 * Example: PhysicsSystem
 */
class PhysicsSystem extends System {
  matches(entity) {
    return entity.has('physics') && entity.has('transform')
  }

  processEntity(entity, deltaTime) {
    const physics = entity.get('physics')
    const transform = entity.get('transform')

    // Apply gravity
    physics.velocity.y += physics.gravity * deltaTime

    // Apply velocity
    transform.x += physics.velocity.x * deltaTime
    transform.y += physics.velocity.y * deltaTime

    // Ground collision
    if (transform.y > physics.groundY) {
      transform.y = physics.groundY
      physics.velocity.y = 0
      physics.onGround = true
    }
  }
}
```

#### 2.4 Game Rules Engine (NEW - Critical)

```javascript
src/core/
└── RulesEngine.js  // ⭐ NEW: Evaluate game rules (win/lose conditions)
```

**Purpose:** Define win/lose conditions declaratively.

```javascript
/**
 * Rules Engine - evaluates declarative game rules.
 *
 * LLM defines rules in JSON, engine evaluates them.
 */
class RulesEngine {
  constructor(eventBus) {
    this.eventBus = eventBus
    this.rules = []
  }

  addRule(rule) {
    this.rules.push(rule)
  }

  /**
   * Evaluate all rules each frame.
   */
  evaluate(gameState) {
    this.rules.forEach(rule => {
      if (rule.condition(gameState)) {
        rule.action(gameState)
        this.eventBus.emit(rule.event, gameState)
      }
    })
  }
}
```

**Example rules (JSON - LLM generates):**
```json
{
  "rules": [
    {
      "name": "player_death",
      "condition": "player.health <= 0",
      "action": "setState('GAME_OVER')",
      "event": "PLAYER_DIED"
    },
    {
      "name": "win_condition",
      "condition": "enemies.length === 0 && level === maxLevel",
      "action": "setState('WIN')",
      "event": "GAME_WON"
    },
    {
      "name": "enemy_offscreen",
      "condition": "enemy.x < -100",
      "action": "removeEntity(enemy)",
      "event": "ENEMY_REMOVED"
    },
    {
      "name": "score_threshold",
      "condition": "score >= 1000",
      "action": "spawnPowerup('extra_life')",
      "event": "POWERUP_SPAWNED"
    }
  ]
}
```

---

### Layer 3: Game Definitions (LLM-Generated)

**Status:** 🆕 New layer - **LLM generates this**

**Purpose:** Game-specific logic and content. **100% declarative** where possible.

#### 3.1 Game Manifest (JSON)

```javascript
games/
└── mario-gol/                    // Example: Mario Bros clone
    ├── game.json                 // ⭐ Game manifest (LLM generates)
    ├── entities.json             // ⭐ Entity definitions (LLM generates)
    ├── rules.json                // ⭐ Game rules (LLM generates)
    ├── levels/                   // ⭐ Level data (LLM generates)
    │   ├── level1.json
    │   └── level2.json
    └── assets/                   // Optional: custom patterns
        └── patterns.json
```

**game.json (LLM generates this):**
```json
{
  "name": "Mario GoL",
  "type": "platformer",
  "description": "Mario Bros-style game using Conway's Game of Life aesthetic",

  "config": {
    "physics": {
      "gravity": 0.8,
      "jumpForce": -15,
      "maxFallSpeed": 12,
      "friction": 0.9
    },
    "camera": {
      "type": "follow",
      "target": "player",
      "smoothing": 0.1
    },
    "controls": {
      "jump": ["SPACE", "UP", "KeyZ"],
      "left": ["LEFT", "KeyA"],
      "right": ["RIGHT", "KeyD"],
      "run": ["SHIFT", "KeyX"]
    }
  },

  "states": {
    "initial": "MENU",
    "states": [
      { "name": "MENU", "scene": "MainMenu" },
      { "name": "PLAYING", "scene": "GameScene" },
      { "name": "PAUSED", "scene": "PauseMenu" },
      { "name": "GAME_OVER", "scene": "GameOverScene" },
      { "name": "WIN", "scene": "VictoryScene" }
    ]
  },

  "levels": [
    "levels/level1.json",
    "levels/level2.json",
    "levels/level3.json"
  ]
}
```

**entities.json (LLM generates this):**
```json
{
  "player": {
    "components": {
      "transform": { "x": 100, "y": 400 },
      "physics": { "gravity": 0.8, "canJump": true, "mass": 1 },
      "collision": { "type": "rect", "width": 30, "height": 40, "layer": "player" },
      "gol": {
        "strategy": "Modified",
        "lifeForce": true,
        "densityRange": [0.4, 0.6],
        "size": [20, 20],
        "updateRate": 12,
        "initialPattern": "BLINKER"
      },
      "input": {
        "jump": "JUMP",
        "left": "LEFT",
        "right": "RIGHT",
        "run": "RUN"
      },
      "health": { "max": 3, "current": 3, "invincibilityTime": 2000 },
      "animation": {
        "idle": { "gol": "oscillate", "frequency": 0.5 },
        "walking": { "gol": "flow_horizontal", "frequency": 1.0 },
        "jumping": { "gol": "burst", "once": true }
      }
    }
  },

  "enemy_goomba": {
    "components": {
      "transform": { "x": 500, "y": 400 },
      "physics": { "gravity": 0.8 },
      "collision": { "type": "rect", "width": 25, "height": 25, "layer": "enemy" },
      "gol": { "strategy": "VisualOnly", "size": [15, 15], "pattern": "wave" },
      "ai": {
        "type": "patrol",
        "speed": 2,
        "turnOnEdge": true
      },
      "health": { "max": 1, "current": 1 },
      "damage": { "amount": 1, "toPlayer": true }
    }
  },

  "block_brick": {
    "components": {
      "transform": { "x": 300, "y": 300 },
      "collision": { "type": "rect", "width": 40, "height": 40, "layer": "platform", "static": true },
      "gol": { "strategy": "Pure", "size": [15, 15], "pattern": "BLOCK", "updateRate": 0 },
      "breakable": { "hitsRequired": 1, "dropItem": "coin" }
    }
  },

  "collectible_coin": {
    "components": {
      "transform": { "x": 400, "y": 350 },
      "collision": { "type": "circle", "radius": 10, "layer": "collectible" },
      "gol": { "strategy": "Pure", "pattern": "PULSAR", "updateRate": 10 },
      "collectible": { "scoreValue": 100, "sound": "coin_pickup" },
      "animation": { "type": "float", "amplitude": 5, "frequency": 2 }
    }
  },

  "powerup_mushroom": {
    "components": {
      "transform": { "x": 0, "y": 0 },
      "physics": { "gravity": 0.8, "velocityX": 2 },
      "collision": { "type": "rect", "width": 20, "height": 20, "layer": "collectible" },
      "gol": { "strategy": "Modified", "size": [12, 12], "pattern": "GLIDER" },
      "collectible": { "scoreValue": 0, "effect": "grow_player" }
    }
  }
}
```

**rules.json (LLM generates this):**
```json
{
  "rules": [
    {
      "name": "player_death",
      "description": "Game over when player health reaches zero",
      "condition": {
        "type": "compare",
        "left": "player.health",
        "operator": "<=",
        "right": 0
      },
      "actions": [
        { "type": "setState", "state": "GAME_OVER" },
        { "type": "emitEvent", "event": "PLAYER_DIED" },
        { "type": "playSound", "sound": "game_over" }
      ]
    },

    {
      "name": "enemy_stomped",
      "description": "Kill enemy when jumped on from above",
      "condition": {
        "type": "and",
        "conditions": [
          { "type": "collision", "entity1": "player", "entity2": "enemy" },
          { "type": "compare", "left": "player.velocity.y", "operator": ">", "right": 0 },
          { "type": "compare", "left": "player.y", "operator": "<", "right": "enemy.y" }
        ]
      },
      "actions": [
        { "type": "removeEntity", "entity": "enemy" },
        { "type": "addScore", "amount": 100 },
        { "type": "playerBounce", "force": -8 },
        { "type": "spawnEffect", "type": "explosion", "position": "enemy" },
        { "type": "playSound", "sound": "enemy_defeat" }
      ]
    },

    {
      "name": "coin_collected",
      "description": "Collect coins and add to score",
      "condition": {
        "type": "collision",
        "entity1": "player",
        "entity2": "coin",
        "layer1": "player",
        "layer2": "collectible"
      },
      "actions": [
        { "type": "removeEntity", "entity": "coin" },
        { "type": "addScore", "amount": 100 },
        { "type": "playSound", "sound": "coin_pickup" }
      ]
    },

    {
      "name": "level_complete",
      "description": "Win when all enemies defeated and flag reached",
      "condition": {
        "type": "and",
        "conditions": [
          { "type": "compare", "left": "enemies.count", "operator": "===", "right": 0 },
          { "type": "collision", "entity1": "player", "entity2": "flag" }
        ]
      },
      "actions": [
        { "type": "setState", "state": "LEVEL_COMPLETE" },
        { "type": "loadLevel", "level": "next" },
        { "type": "playSound", "sound": "level_complete" }
      ]
    },

    {
      "name": "brick_break",
      "description": "Break brick when hit from below",
      "condition": {
        "type": "and",
        "conditions": [
          { "type": "collision", "entity1": "player", "entity2": "brick" },
          { "type": "compare", "left": "player.velocity.y", "operator": "<", "right": 0 },
          { "type": "compare", "left": "player.y", "operator": ">", "right": "brick.y" }
        ]
      },
      "actions": [
        { "type": "removeEntity", "entity": "brick" },
        { "type": "spawnEffect", "type": "brick_shatter", "position": "brick" },
        { "type": "spawnEntity", "type": "coin", "position": "brick" },
        { "type": "playSound", "sound": "brick_break" }
      ]
    }
  ]
}
```

**level1.json (LLM generates this):**
```json
{
  "name": "World 1-1",
  "background": {
    "gol": {
      "strategy": "Pure",
      "updateRate": 10,
      "density": 0.3,
      "color": "#0066FF"
    }
  },

  "camera": {
    "bounds": { "left": 0, "right": 3200, "top": 0, "bottom": 480 }
  },

  "entities": [
    { "type": "player", "x": 100, "y": 400 },

    // Ground platforms
    { "type": "block_platform", "x": 0, "y": 440, "width": 3200, "height": 40 },

    // Enemies
    { "type": "enemy_goomba", "x": 300, "y": 400 },
    { "type": "enemy_goomba", "x": 500, "y": 400 },
    { "type": "enemy_koopa", "x": 800, "y": 400 },

    // Coins
    { "type": "collectible_coin", "x": 250, "y": 300 },
    { "type": "collectible_coin", "x": 270, "y": 300 },
    { "type": "collectible_coin", "x": 290, "y": 300 },

    // Breakable bricks
    { "type": "block_brick", "x": 400, "y": 300 },
    { "type": "block_brick", "x": 440, "y": 300 },
    { "type": "block_brick", "x": 480, "y": 300 },

    // Question block with powerup
    { "type": "block_question", "x": 460, "y": 300, "contains": "mushroom" },

    // Pipes
    { "type": "pipe", "x": 600, "y": 360, "height": 80 },
    { "type": "pipe", "x": 1000, "y": 320, "height": 120 },

    // Goal flag
    { "type": "flag", "x": 3000, "y": 200 }
  ],

  "music": "overworld_theme",
  "timeLimit": 300
}
```

#### 3.2 Minimal Glue Code (Only if needed)

```javascript
games/mario-gol/
└── src/
    ├── MarioGame.js          // Game class (minimal - just initialization)
    └── custom/               // Custom components (only if framework doesn't provide)
        ├── GrowPlayerEffect.js
        └── PipeWarpComponent.js
```

**MarioGame.js (minimal glue code):**
```javascript
import { BaseGame } from '../../framework/BaseGame.js'
import gameManifest from './game.json'
import entities from './entities.json'
import rules from './rules.json'

/**
 * Mario GoL Game - mostly just loads configs.
 */
export class MarioGame extends BaseGame {
  constructor() {
    super(gameManifest)

    // Load entity definitions
    this.loadEntities(entities)

    // Load game rules
    this.loadRules(rules)

    // Load first level
    this.loadLevel(gameManifest.levels[0])
  }

  // Optional: custom initialization
  init() {
    super.init()

    // Register custom components (if any)
    this.registerComponent('growPlayer', GrowPlayerEffect)
    this.registerComponent('pipeWarp', PipeWarpComponent)
  }
}
```

---

## Key Framework Components (To Implement)

### Priority 1: Essential for Framework (Phase 2-3)

1. **BaseGame** - Abstract game class
2. **GameLoop** - Main loop with delta time
3. **StateManager** - FSM for game states
4. **EventBus** - Pub/sub events
5. **Entity + Component system** - ECS-lite architecture
6. **EntityFactory** - Create entities from JSON
7. **RulesEngine** - Evaluate declarative rules
8. **Systems** - Physics, Collision, Render, Input, GoL

### Priority 2: Nice to Have (Phase 3+)

9. **LevelLoader** - Load level JSON files
10. **AudioManager** - Sound effects and music
11. **CameraSystem** - Follow player, smooth scrolling
12. **ParticleSystem** - Pure GoL explosions/effects
13. **AnimationSystem** - GoL-based animations

---

## LLM Interaction Pattern

### Step 1: User Request
```
User: "Create a Space Invaders-style game with GoL aesthetic"
```

### Step 2: LLM Analyzes Request
```javascript
// LLM extracts game characteristics:
{
  gameType: "shooter",
  perspective: "top-down",
  playerMovement: "horizontal",
  enemyPattern: "grid_formation",
  mechanics: ["shoot", "dodge", "waves"],
  winCondition: "clear_all_enemies",
  loseCondition: "player_hit_or_enemy_reaches_bottom"
}
```

### Step 3: LLM Generates game.json
```json
{
  "name": "Space Invaders GoL",
  "type": "shooter",
  "config": {
    "physics": { "gravity": 0 },
    "controls": {
      "left": ["LEFT", "KeyA"],
      "right": ["RIGHT", "KeyD"],
      "shoot": ["SPACE", "KeyZ"]
    }
  }
}
```

### Step 4: LLM Generates entities.json
```json
{
  "player": {
    "components": {
      "transform": { "x": 400, "y": 550 },
      "collision": { "type": "rect", "width": 40, "height": 30, "layer": "player" },
      "gol": { "strategy": "Modified", "lifeForce": true, "size": [25, 20] },
      "input": { "left": "LEFT", "right": "RIGHT", "shoot": "SHOOT" },
      "movement": { "speed": 5, "bounds": { "minX": 20, "maxX": 780 } },
      "health": { "max": 3, "current": 3 }
    }
  },

  "enemy_invader": {
    "components": {
      "transform": { "x": 0, "y": 0 },
      "collision": { "type": "rect", "width": 30, "height": 30, "layer": "enemy" },
      "gol": { "strategy": "VisualOnly", "size": [18, 18], "pattern": "wave" },
      "ai": { "type": "formation", "movePattern": "horizontal_step_down" },
      "health": { "max": 1, "current": 1 }
    }
  },

  "bullet_player": {
    "components": {
      "transform": { "x": 0, "y": 0 },
      "collision": { "type": "rect", "width": 4, "height": 10, "layer": "player_bullet" },
      "gol": { "strategy": "VisualOnly", "size": [3, 8], "pattern": "static" },
      "movement": { "velocityY": -10 },
      "lifetime": { "duration": 2000 }
    }
  }
}
```

### Step 5: LLM Generates rules.json
```json
{
  "rules": [
    {
      "name": "bullet_hits_enemy",
      "condition": {
        "type": "collision",
        "entity1": "bullet_player",
        "entity2": "enemy_invader"
      },
      "actions": [
        { "type": "removeEntity", "entity": "bullet_player" },
        { "type": "removeEntity", "entity": "enemy_invader" },
        { "type": "addScore", "amount": 10 },
        { "type": "spawnEffect", "type": "explosion", "position": "enemy_invader" }
      ]
    },

    {
      "name": "wave_complete",
      "condition": {
        "type": "compare",
        "left": "enemies.count",
        "operator": "===",
        "right": 0
      },
      "actions": [
        { "type": "nextWave" },
        { "type": "addScore", "amount": 100 }
      ]
    },

    {
      "name": "player_hit",
      "condition": {
        "type": "collision",
        "entity1": "player",
        "entity2": "bullet_enemy"
      },
      "actions": [
        { "type": "removeEntity", "entity": "bullet_enemy" },
        { "type": "damagePlayer", "amount": 1 },
        { "type": "playSound", "sound": "player_hit" }
      ]
    },

    {
      "name": "game_over",
      "condition": {
        "type": "compare",
        "left": "player.health",
        "operator": "<=",
        "right": 0
      },
      "actions": [
        { "type": "setState", "state": "GAME_OVER" }
      ]
    }
  ]
}
```

### Step 6: Framework Loads and Runs Game

```javascript
// Framework automatically:
1. Parses game.json
2. Creates entity instances from entities.json
3. Loads rules into RulesEngine
4. Initializes systems (Physics, Collision, Render, etc)
5. Starts GameLoop
6. Game is playable!
```

---

## Migration Path from Current Code

### Phase 2 (Entity System)
**Status:** In progress
**Changes needed:**
- ✅ Keep CellularSprite as-is (it works)
- ✅ Keep ModifiedGoLSprite (life force pattern works)
- ⚠️ **Add** component wrappers (GoLComponent wraps CellularSprite)
- ⚠️ **Add** Entity class (holds components)
- ⚠️ **Add** EntityFactory (creates entities from JSON)

**Result:** Hybrid approach - inheritance for GoL, components for game logic

### Phase 3 (Game Framework)
**Changes needed:**
- ⚠️ **Refactor** sketch.js → BaseGame class
- ⚠️ **Add** GameLoop (extract from sketch.js)
- ⚠️ **Add** StateManager (MENU, PLAYING, PAUSED, GAME_OVER)
- ⚠️ **Add** EventBus (decouple game logic)
- ⚠️ **Add** Systems (PhysicsSystem, CollisionSystem, RenderSystem)
- ⚠️ **Add** RulesEngine (declarative win/lose conditions)

**Result:** Fully modular framework, LLM can generate games

---

## Benefits of This Architecture

### For Current Development
1. ✅ **Separation of concerns** - Clear boundaries between layers
2. ✅ **Testability** - Each component can be unit tested
3. ✅ **Reusability** - Build Dino Game, reuse 80% for Space Invaders
4. ✅ **Maintainability** - Change game rules without touching engine

### For LLM Game Generation
1. ✅ **Declarative** - Most game logic is JSON (easy for AI to generate)
2. ✅ **Composable** - Mix and match components for different entity types
3. ✅ **Validated** - Framework validates JSON schemas
4. ✅ **Extensible** - LLM can add custom components if needed
5. ✅ **Debuggable** - Clear error messages when configs are invalid

### For End Users (Art Installation)
1. ✅ **Variety** - Easy to create multiple games
2. ✅ **Consistency** - All games share GoL aesthetic
3. ✅ **Performance** - Framework optimizes rendering/simulation
4. ✅ **Reliability** - Well-tested core prevents crashes

---

## Example: LLM Creates Breakout Game

**User prompt:**
```
"Create a Breakout/Arkanoid-style game with GoL aesthetic"
```

**LLM generates (automatically):**

```json
// game.json
{
  "name": "Breakout GoL",
  "type": "breakout",
  "config": {
    "physics": { "gravity": 0 },
    "controls": { "left": ["LEFT"], "right": ["RIGHT"], "launch": ["SPACE"] }
  }
}

// entities.json
{
  "paddle": {
    "components": {
      "transform": { "x": 400, "y": 550 },
      "collision": { "type": "rect", "width": 80, "height": 15, "layer": "paddle" },
      "gol": { "strategy": "Modified", "lifeForce": true, "size": [30, 8] },
      "input": { "left": "LEFT", "right": "RIGHT" },
      "movement": { "speed": 8, "bounds": { "minX": 0, "maxX": 800 } }
    }
  },

  "ball": {
    "components": {
      "transform": { "x": 400, "y": 300 },
      "collision": { "type": "circle", "radius": 8, "layer": "ball" },
      "gol": { "strategy": "Pure", "pattern": "GLIDER", "size": [6, 6], "updateRate": 30 },
      "physics": { "velocityX": 5, "velocityY": -5, "bounceOnWalls": true },
      "lifetime": { "resetOnLoss": true }
    }
  },

  "brick": {
    "components": {
      "transform": { "x": 0, "y": 0 },
      "collision": { "type": "rect", "width": 60, "height": 20, "layer": "brick", "static": true },
      "gol": { "strategy": "Pure", "size": [20, 10], "pattern": "random", "updateRate": 5 },
      "health": { "max": 1, "current": 1 },
      "breakable": { "scoreValue": 10 }
    }
  }
}

// rules.json
{
  "rules": [
    {
      "name": "ball_hits_brick",
      "condition": { "type": "collision", "entity1": "ball", "entity2": "brick" },
      "actions": [
        { "type": "bounce", "entity": "ball" },
        { "type": "removeEntity", "entity": "brick" },
        { "type": "addScore", "amount": 10 },
        { "type": "spawnEffect", "type": "explosion", "position": "brick" }
      ]
    },

    {
      "name": "ball_lost",
      "condition": { "type": "compare", "left": "ball.y", "operator": ">", "right": 600 },
      "actions": [
        { "type": "removeEntity", "entity": "ball" },
        { "type": "decrementLives" },
        { "type": "respawnBall" }
      ]
    },

    {
      "name": "level_complete",
      "condition": { "type": "compare", "left": "bricks.count", "operator": "===", "right": 0 },
      "actions": [
        { "type": "setState", "state": "LEVEL_COMPLETE" },
        { "type": "nextLevel" }
      ]
    }
  ]
}

// level1.json
{
  "name": "Level 1",
  "entities": [
    { "type": "paddle", "x": 400, "y": 550 },
    { "type": "ball", "x": 400, "y": 300 },

    // Brick grid (5 rows x 10 columns)
    // LLM generates 50 brick instances...
    { "type": "brick", "x": 50, "y": 50 },
    { "type": "brick", "x": 120, "y": 50 },
    // ... etc
  ]
}
```

**Result:** Fully playable Breakout game in ~200 lines of JSON (generated by LLM)

---

## Implementation Roadmap

### Phase 2 (Current) - Entity System Foundation
- [x] InputManager
- [x] PhysicsEngine
- [x] Collision detection
- [x] CellularSprite base class
- [x] ModifiedGoLSprite
- [ ] **NEW: Entity class**
- [ ] **NEW: Component base classes**
- [ ] **NEW: EntityFactory**

**Estimated time:** 2-3 weeks

### Phase 3 - Game Framework Core
- [ ] **NEW: BaseGame class**
- [ ] **NEW: GameLoop**
- [ ] **NEW: StateManager**
- [ ] **NEW: EventBus**
- [ ] **NEW: Systems (Physics, Collision, Render, Input, GoL)**
- [ ] **NEW: RulesEngine**
- [ ] Refactor Dino Game to use framework

**Estimated time:** 3-4 weeks

### Phase 4 - LLM Integration
- [ ] JSON schema definitions
- [ ] Config validation
- [ ] LevelLoader
- [ ] Error handling and debugging
- [ ] Documentation for LLM
- [ ] Example game prompts

**Estimated time:** 2 weeks

### Phase 5 - Polish
- [ ] AudioManager
- [ ] CameraSystem
- [ ] ParticleSystem
- [ ] AnimationSystem
- [ ] Performance profiling
- [ ] Create 2-3 example games (Space Invaders, Pac-Man, Breakout)

**Estimated time:** 3 weeks

**Total estimated time:** 10-12 weeks

---

## Next Steps

### Immediate (Phase 2)
1. **Continue Phase 2 implementation** (Player, Obstacles, Collision)
2. **Prototype Entity + Component system** alongside existing code
3. **Test hybrid approach** (inheritance for GoL, components for game logic)

### After Phase 2 Complete
1. **Design BaseGame API**
2. **Implement GameLoop + StateManager**
3. **Refactor Dino Game** to use framework
4. **Validate** framework works for one complete game

### After Framework Validated
1. **Create second game** (Space Invaders or Breakout) to test reusability
2. **Document framework** for LLM consumption
3. **Build LLM integration** (JSON generation + validation)

---

## Questions for Discussion

1. **ECS vs Inheritance?**
   - Proposed: Hybrid (inheritance for GoL, components for game logic)
   - Alternative: Pure ECS (everything is a component)

2. **How declarative should rules be?**
   - Proposed: JSON with simple expressions
   - Alternative: Allow JavaScript functions in JSON (more flexible, less safe)

3. **JSON validation strategy?**
   - Use JSON Schema for validation?
   - Runtime validation with clear error messages?

4. **Performance vs flexibility trade-offs?**
   - How much flexibility do we allow LLM?
   - Should we limit entities per game for performance?

5. **LLM context management?**
   - How much of framework docs fit in LLM context?
   - Should we create "profiles" for different game types?

---

## Conclusion

This framework architecture provides:

✅ **Clean separation** between engine, framework, and game-specific code
✅ **Declarative game definitions** (LLM-friendly JSON)
✅ **Reusable components** (build once, use for any game type)
✅ **Extensibility** (add custom components when needed)
✅ **Maintainability** (clear structure, testable)
✅ **Performance** (optimized core, modular systems)

**Goal:** An LLM should be able to create a new playable arcade game by generating 3-5 JSON files, with minimal or zero custom JavaScript code.

---

## References

- Current codebase: `src/core/`, `src/rendering/`, `src/utils/`
- CLAUDE.md: Lines 23-35 (architecture), 95-152 (Smart Hybrid strategy)
- Phase 1: GoL engine implementation
- Phase 2: Entity system (in progress)
- ECS patterns: Unity DOTS, Bevy, EnTT
- Declarative game engines: Godot scenes, Unreal Blueprints
