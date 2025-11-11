# Coding Prompt: Dinosaur Game - Phase 2 (Entity System)

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

> **Multi-Phase Implementation Strategy**
>
> This project is divided into 3 sequential phases to manage complexity:
> - **Phase 1 (COMPLETED):** Core GoL engine, rendering system, and background ✅
> - **Phase 2 (THIS DOCUMENT):** Entity system, player, obstacles, and collision
> - **Phase 3:** Game loop, state machine, UI, and testing
>
> Complete Phase 2 and validate before proceeding to Phase 3.

---

## Phase 2 Prerequisites

**Before starting Phase 2, verify Phase 1 is complete:**

```bash
# 1. Check all Phase 1 files exist
ls src/core/GoLEngine.js
ls src/rendering/CellRenderer.js
ls src/rendering/GoLBackground.js
ls src/utils/Patterns.js
ls src/utils/Config.js

# 2. Verify tests pass
npm test

# 3. Verify dev server runs
npm run dev
# Navigate to http://localhost:5173 - should show animated GoL background

# 4. Check Archon tasks
# All Phase 1 tasks should have status: "done"
```

**If any of the above fail, complete Phase 1 first before proceeding.**

---

## Feature Description and Problem Solving

**Feature:** Implement the entity system and game mechanics for the Dinosaur Game, including a player character, obstacles, collision detection, and physics.

**Problem it's solving:**
- Creating a reusable entity architecture that can support multiple game types (Dino, Space Invaders, Pac-Man)
- Implementing the Smart Hybrid authenticity strategy: Pure GoL where viable, Modified GoL where needed
- Establishing collision detection that uses fixed hitboxes (not dynamic GoL cells)
- Building player controls that feel responsive while maintaining visual GoL emergence
- Creating obstacles with appropriate GoL authenticity levels

---

## User Story

```
As a player of the Game of Life Arcade installation,
I want to control a dinosaur character that feels alive and organic,
So that I can experience the unique aesthetic of cellular automaton gameplay.

Acceptance Criteria (Phase 2):
- Player character uses Modified GoL with life force injection (never dies completely)
- Player responds to jump controls with < 100ms input latency
- Obstacles (cacti, pterodactyls) use appropriate authenticity strategies
- Collision detection uses fixed hitboxes, not dynamic GoL cells
- Player death triggers Pure GoL explosion effect (R-pentomino or similar)
- All entities maintain visual GoL aesthetic while being gameplay-reliable
- Physics feels natural (gravity, ground collision, jump arc)
- Entity system is reusable for future games (Space Invaders, Pac-Man)
```

---

## Solution and Approach

**Phase 2 Goals:**
1. Implement base entity architecture with CellularSprite class
2. Create player character with Modified GoL and life force injection
3. Build obstacle system (cacti, pterodactyls) with Visual-Only GoL
4. Implement collision detection using fixed hitboxes
5. Add physics system (gravity, velocity, acceleration)
6. Create particle effects using Pure GoL (explosions, trails)
7. Establish input handling with arcade controls

**Why this approach:**
- **Entity architecture:** Base class allows code reuse across all three games
- **Smart Hybrid strategy:** Use appropriate authenticity level per entity type
- **Fixed hitboxes:** Ensures predictable, fair gameplay despite visual emergence
- **Modified GoL for player:** Maintains visual interest while ensuring stability
- **Pure GoL for effects:** Explosions showcase authentic GoL without affecting gameplay

---

## Relevant Files from Codebase

**Reference for architecture and standards:**
- `.claude/CLAUDE.md` - Complete development guidelines, Smart Hybrid strategy, collision patterns

**Files created in Phase 1 (dependencies):**
- `src/core/GoLEngine.js` - B3/S23 engine with double buffer
- `src/rendering/CellRenderer.js` - Batch rendering for cells
- `src/utils/Patterns.js` - Canonical GoL patterns
- `src/utils/Config.js` - Configuration constants

**Files to create in Phase 2:**
```
project-root/
├── src/
│   ├── core/
│   │   ├── InputManager.js           # Keyboard/arcade input handling
│   │   └── PhysicsEngine.js          # Gravity, velocity, acceleration
│   ├── entities/
│   │   ├── CellularSprite.js         # Base class for all GoL entities
│   │   ├── ModifiedGoLSprite.js      # Modified GoL with life force
│   │   ├── Player.js                 # Dinosaur player character
│   │   ├── Obstacle.js               # Base obstacle class
│   │   ├── Cactus.js                 # Ground obstacle
│   │   └── Pterodactyl.js            # Flying obstacle
│   ├── rendering/
│   │   └── ParticleSystem.js         # Pure GoL particle effects
│   └── utils/
│       ├── Collision.js              # Collision detection utilities
│       └── MaskGenerator.js          # Shape masks for bounded GoL
└── tests/
    ├── entities/
    │   ├── test_CellularSprite.js
    │   ├── test_Player.js
    │   └── test_Collision.js
    └── core/
        └── test_PhysicsEngine.js
```

---

## Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Get available knowledge sources
mcp__archon__rag_get_available_sources()

// Step 2: Search for entity/sprite patterns
mcp__archon__rag_search_code_examples({
  query: "game entity sprite class",
  match_count: 5
})

// Step 3: Search for collision detection patterns
mcp__archon__rag_search_knowledge_base({
  query: "collision detection bounding box",
  match_count: 5
})

// Step 4: Search for physics/platformer patterns
mcp__archon__rag_search_code_examples({
  query: "platformer physics gravity jump",
  match_count: 5
})

// Step 5: Search for p5.js keyboard input
mcp__archon__rag_search_knowledge_base({
  query: "p5js keyboard input event",
  source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
  match_count: 3
})
```

### Available Archon Knowledge Sources

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `42a1fc677ff1afe4` | Nature of Code - Cellular Automata | 189k | CA theory, GoL implementation |
| `b10ed112d80b75a1` | Conway's Game of Life (Wikipedia) | 7.6k | B3/S23 rules, pattern catalog |

### Step 2: External References (if needed)

**Chrome Dinosaur Game mechanics:**
- https://chromedino.com/ - Play reference implementation
- Study: jump height, obstacle spacing, difficulty progression

**Note:** Only use external URLs if Archon searches don't provide sufficient game design patterns.

---

## Archon Task Management Integration

### CRITICAL: Use Archon MCP for ALL task management

**Before starting implementation:**

```javascript
// 1. Query existing Phase 1 tasks to verify completion
mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  filter_by: "feature",
  filter_value: "Phase1-Foundation"
})
// Verify all show status: "done"

// 2. Create tasks in Archon for Phase 2
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Implement CellularSprite base class",
  description: "Create base entity class with GoL grid, mask system, and rendering. Foundation for all game entities.",
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities"
})

// 3. As you work, update task status
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "doing"
})

// 4. When complete, mark as done
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "done"
})
```

---

## Phase 2 Implementation Plan

### Consolidated Task List (8 Tasks)

**Task 1: Input Manager for Arcade Controls** (45 minutes)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement InputManager for keyboard/arcade controls",
  description: `
Create InputManager.js for handling keyboard input from arcade controls.

Requirements:
- Support keyboard events (keydown, keyup)
- Track key states (pressed, justPressed, justReleased)
- Map arcade controls to game actions (JUMP, DUCK, START, PAUSE)
- Support both Arrow keys and WASD
- Simple API: input.isPressed('JUMP'), input.justPressed('JUMP')

Arcade button mapping (from CLAUDE.md):
- ArrowUp / KeyW → JUMP
- ArrowDown / KeyS → DUCK
- Space / KeyZ → JUMP (alternative)
- Enter → START
- Escape / KeyC → PAUSE

Implementation:
- Create src/core/InputManager.js
- Track key states in Map: { keyCode: { pressed, justPressed, justReleased } }
- Implement update() to clear justPressed/justReleased flags each frame
- Add action mapping: ARCADE_BUTTON_MAP

Acceptance:
- input.isPressed('JUMP') returns true when Space/ArrowUp/KeyZ held
- input.justPressed('JUMP') returns true only on first frame of press
- justPressed flags cleared after one frame
- No duplicate key events
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 10
})
```

**Implementation details:**
- Simple state machine per key: `{ pressed: false, justPressed: false, justReleased: false }`
- In `update()`: clear justPressed/justReleased flags
- Map multiple keys to same action: `['Space', 'ArrowUp', 'KeyZ'] → 'JUMP'`

---

**Task 2: Physics Engine** (1-1.5 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement PhysicsEngine for gravity and velocity",
  description: `
Create PhysicsEngine.js for managing physics simulation (gravity, velocity, acceleration).

Requirements:
- Apply gravity to entities with physics enabled
- Update velocity based on acceleration
- Update position based on velocity
- Support ground collision (entities can't fall below ground)
- Support terminal velocity (max fall speed)
- Provide jump() method with configurable jump force

Implementation:
- Create src/core/PhysicsEngine.js
- Constants: GRAVITY = 0.6, TERMINAL_VELOCITY = 10, GROUND_Y = <calculated>
- Entity physics state: { velocity: {x, y}, acceleration: {x, y}, onGround: bool }
- applyGravity(entity) - add gravity to velocity.y
- applyVelocity(entity) - add velocity to position
- checkGroundCollision(entity, groundY) - stop at ground, set onGround = true
- jump(entity, force) - set velocity.y = -force (only if onGround)

Integration with Config.js:
- Add PHYSICS_CONFIG to Config.js:
  - GRAVITY, TERMINAL_VELOCITY, JUMP_FORCE, GROUND_Y
  - PLAYER_SPEED, OBSTACLE_SPEED

Acceptance:
- Entity falls with gravity acceleration
- Entity stops at ground level (doesn't fall through)
- Jump applies upward velocity, then gravity brings entity back down
- Terminal velocity prevents infinite acceleration
- onGround flag accurate (true when on ground, false when airborne)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 20
})
```

**Implementation details:**
- Gravity constant: `0.6` (feels natural for 60fps)
- Jump force: `-12` (negative = upward)
- Ground Y: `canvas.height - 80` (20% from bottom)
- Terminal velocity: `10` (prevent infinite fall speed)

---

**Task 3: Collision Detection System** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Utils: Implement collision detection with fixed hitboxes",
  description: `
Create Collision.js with collision detection utilities using fixed hitboxes.

CRITICAL PRINCIPLE:
- Collision uses FIXED hitboxes (circles, rectangles)
- Visual appearance uses DYNAMIC GoL cells
- NEVER use GoL cells for collision (unpredictable)

Requirements:
- Circle-circle collision (player vs powerups)
- Circle-rectangle collision (player vs obstacles)
- Rectangle-rectangle collision (bullets vs enemies, future)
- Support hitbox offset from entity position (for visual alignment)
- Provide debug rendering for hitboxes

Implementation:
- Create src/utils/Collision.js
- circleCircle(a, b) - distance check
- circleRect(circle, rect) - closest point algorithm
- rectRect(a, b) - AABB collision
- renderDebugHitbox(entity, color) - draw hitbox outline

Hitbox types:
{
  type: 'circle',
  x: number,      // Center x
  y: number,      // Center y
  radius: number
}

{
  type: 'rect',
  x: number,      // Top-left x
  y: number,      // Top-left y
  width: number,
  height: number
}

Acceptance:
- circleCircle detects overlap correctly
- circleRect detects overlap correctly
- Debug rendering shows hitboxes aligned with entities
- All collision tests pass (see test cases below)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 30
})
```

**Implementation details:**
- Circle-circle: `dist(a, b) < a.radius + b.radius`
- Circle-rect: Find closest point on rect to circle center, check distance
- AABB: `a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y`

---

**Task 4: Mask Generator for Bounded GoL** (1.5 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Utils: Implement MaskGenerator for shape-bounded GoL",
  description: `
Create MaskGenerator.js to generate shape masks that constrain GoL cells within entity boundaries.

Purpose: Keep GoL cells within entity shape (rectangle, ellipse, custom) so sprites maintain visual identity.

Requirements:
- Generate masks for common shapes: rectangle, ellipse, circle, diamond
- Mask format: 2D boolean array matching grid dimensions
- Support custom masks from image/pattern
- Provide applyMask(grid, mask) to kill cells outside mask

Shape formulas:
- Rectangle: All cells inside bounds are true
- Ellipse: (x - cx)²/a² + (y - cy)²/b² <= 1
- Circle: dist(x, y, cx, cy) <= radius
- Diamond: abs(x - cx) + abs(y - cy) <= radius

Implementation:
- Create src/utils/MaskGenerator.js
- generateRectangleMask(cols, rows)
- generateEllipseMask(cols, rows)
- generateCircleMask(cols, rows, radius)
- generateDiamondMask(cols, rows, radius)
- applyMask(grid, mask) - kill cells where mask[x][y] === false

Usage in CellularSprite:
this.mask = MaskGenerator.generateEllipseMask(this.cols, this.rows)
this.applyMask()  // Call after each GoL update

Acceptance:
- Rectangle mask includes all cells
- Ellipse mask forms smooth oval boundary
- Circle mask forms circular boundary
- applyMask kills cells outside mask boundary
- Masked entities maintain shape over many generations
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 40
})
```

**Implementation details:**
- Masks are generated once and reused (no per-frame regeneration)
- Store mask as `boolean[][]` - `true` = cell allowed, `false` = cell killed
- Apply mask after GoL update: `if (!mask[x][y]) grid[x][y] = DEAD`

---

**Task 5: CellularSprite Base Class** (2-2.5 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Entities: Implement CellularSprite base class",
  description: `
Create CellularSprite.js - base class for all GoL-based entities.

This is the FOUNDATION for all game entities (player, enemies, obstacles, powerups).

Architecture:
- Composition over inheritance where possible
- Separate visual (GoL grid) from logic (position, hitbox, physics)
- Support different authenticity strategies (Pure, Modified, Visual-Only)

Core responsibilities:
1. GoL simulation (owns GoLEngine instance)
2. Mask application (bounded GoL)
3. Rendering (uses CellRenderer)
4. Collision (fixed hitbox)
5. Position/movement (x, y, velocity)

Implementation:
- Create src/entities/CellularSprite.js
- Constructor: (x, y, cols, rows, maskShape = 'ellipse')
- Properties:
  - this.x, this.y - world position
  - this.engine - GoLEngine instance (cols x rows)
  - this.mask - shape mask
  - this.hitbox - fixed collision geometry
  - this.cellSize - size of individual cells
  - this.updateRate - GoL update frequency (fps)
- Methods:
  - update() - update GoL simulation (throttled)
  - render(renderer) - draw cells using CellRenderer
  - applyMask() - constrain cells to shape
  - setPattern(pattern, x, y) - stamp GoL pattern
  - checkCollision(other) - use Collision utils
  - move(dx, dy) - update position

Authenticity Strategy (base class = Pure GoL):
- No modifications to B3/S23 rules
- Subclasses can override update() for Modified GoL

Acceptance:
- CellularSprite creates and manages GoL grid
- Mask constrains cells to shape boundary
- Rendering shows animated GoL cells
- Hitbox remains fixed while cells evolve
- update() throttles GoL updates to specified fps
- Base class provides clean API for subclasses
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 50
})
```

**Implementation details:**
- Store world position separate from grid: `this.x, this.y` (pixels)
- GoL grid is local coordinate space: `[0, cols) × [0, rows)`
- Render grid at world position: `renderer.renderGrid(engine.current, this.x, this.y)`
- Hitbox calculation example: `{ type: 'ellipse', x: this.x, y: this.y, width: cols * cellSize * 0.7, height: rows * cellSize * 0.7 }`

---

**Task 6: ModifiedGoLSprite with Life Force** (1.5-2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Entities: Implement ModifiedGoLSprite with life force injection",
  description: `
Create ModifiedGoLSprite.js - extends CellularSprite with stability modifications.

Purpose: Entities that need visual emergence but must never completely die (player, bosses).

Smart Hybrid Strategy: Modified GoL (80% authentic)
- Still uses B3/S23 rules
- Adds post-processing after rule application
- Maintains visual interest while ensuring stability

Modifications:
1. Life Force Injection - keep core region alive
2. Density Maintenance - prevent over-sparse or over-dense
3. Smart Re-seeding - inject pattern when too few cells remain

Implementation:
- Create src/entities/ModifiedGoLSprite.js
- Extends CellularSprite
- Override update() to apply modifications AFTER B3/S23 rules
- Methods:
  - ensureCoreAlive() - force min cells in center region
  - maintainDensity(targetMin, targetMax) - add/kill cells to maintain range
  - smartReseed(threshold) - inject pattern if below threshold
  - getCoreRegion(percentage) - get center region of grid

Life Force algorithm:
1. Define core region (center 30% of sprite)
2. Count alive cells in core
3. If below threshold (40% of core area):
   - Birth random cells in core region
   - Use pattern injection (small BLOCK or BLINKER)

Density Maintenance:
- Count total alive cells
- Target: 40-60% of mask area
- If below 40%: inject small patterns (BLOCK, BEEHIVE)
- If above 60%: kill random edge cells

Smart Re-seeding:
- Threshold: < 20% of mask area alive
- Action: Inject known stable pattern at center (BEEHIVE or BLOCK)
- Frequency: Max once per 30 frames (avoid thrashing)

Acceptance:
- Player sprite never completely dies (always some core cells alive)
- Density stays within 40-60% range over time
- Re-seeding triggers when sprite gets too sparse
- Visual appearance still shows emergence (not static)
- Modifications feel natural, not artificial
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 60
})
```

**Implementation details:**
- Core region: center 30% (e.g., for 20×20 grid, core is 6×6 center)
- Life force threshold: 40% of core area
- Inject 3-5 cells randomly in core if below threshold
- Use `Patterns.BLOCK` for stability injection

---

**Task 7: Player Entity (Dinosaur)** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Entities: Implement Player (dinosaur) with controls and physics",
  description: `
Create Player.js - dinosaur character using ModifiedGoLSprite with arcade controls.

Smart Hybrid Strategy: Modified GoL with Life Force
- Visually interesting (cells evolve organically)
- Stable (never completely dies)
- Predictable hitbox (fixed collision geometry)

Requirements:
- Extends ModifiedGoLSprite (20×20 grid)
- Responds to JUMP input (InputManager integration)
- Uses PhysicsEngine for gravity and jumping
- Duck functionality (reduces hitbox height)
- Death state (triggers GoL explosion effect)
- Spawn animation (grows from small pattern)

Implementation:
- Create src/entities/Player.js
- Extends ModifiedGoLSprite
- Size: 20×20 cells (cell size: 3-4px) = ~60-80px sprite
- Initial pattern: Vertical BLINKER at center (simple, recognizable)
- Properties:
  - this.state - 'idle', 'jumping', 'ducking', 'dead'
  - this.physics - { velocity, acceleration, onGround }
  - this.hitbox - { type: 'circle', radius: 25 } when idle, smaller when ducking
- Methods:
  - handleInput(inputManager) - check jump/duck keys
  - jump() - apply jump force via PhysicsEngine
  - duck() - reduce hitbox, modify visual (future enhancement)
  - die() - set state to 'dead', trigger explosion
  - update(input, physics) - handle input, update physics, update GoL

Controls:
- JUMP (Space/ArrowUp/KeyZ): Jump if onGround
- DUCK (ArrowDown/KeyS): Duck while held (future)

Physics integration:
- Player has physics state
- PhysicsEngine.applyGravity(player)
- PhysicsEngine.applyVelocity(player)
- PhysicsEngine.checkGroundCollision(player, GROUND_Y)

Hitbox:
- Type: Circle (simplest for dinosaur shape)
- Radius: 25px (covers ~60% of sprite width for forgiveness)
- Position: Centered on sprite (x + width/2, y + height/2)

Acceptance:
- Player sprite shows organic GoL animation
- Jump feels responsive (< 100ms input latency)
- Player falls with gravity, lands on ground
- Hitbox remains fixed while cells evolve
- Player never completely loses all cells (life force active)
- Death state can be triggered (for testing)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 70
})
```

**Implementation details:**
- Grid: 20×20 cells at 3-4px each = 60-80px sprite
- Jump force: `-12` (negative = upward)
- Initial pattern: Vertical BLINKER (3 cells) at center
- Update rate: 12fps (update every 5 frames at 60fps)

---

**Task 8: Obstacle System (Cactus)** (2-2.5 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Entities: Implement Obstacle base class and Cactus",
  description: `
Create Obstacle.js base class and Cactus.js ground obstacle.

Smart Hybrid Strategy for Obstacles: Visual-Only GoL
- Too small for meaningful real GoL
- Must be 100% predictable for fair gameplay
- Use static pattern with flicker animation

Implementation:
- Create src/entities/Obstacle.js (base class)
- Create src/entities/Cactus.js (extends Obstacle)

Obstacle.js (base class):
- Extends CellularSprite
- Properties:
  - this.speed - horizontal movement speed
  - this.scored - flag for score tracking (future)
- Methods:
  - update() - move left by speed
  - isOffscreen() - check if passed left edge
  - remove() - mark for deletion

Cactus.js:
- Extends Obstacle
- Size: 12×16 cells (small obstacle)
- Pattern: Static vertical bars (3-4 variations for visual variety)
- Hitbox: Rectangle { x, y, width: 30, height: 40 }
- Position: Ground level (y = GROUND_Y - height)
- Speed: -6 pixels/frame (scrolls left)

Visual-Only GoL technique:
- Override update() to use static pattern with flicker
- Don't call super.update() (skip GoL simulation)
- Animate by toggling random edge cells every 3-5 frames
- Maintains recognizable shape, looks organic

Cactus variations (3 types):
1. Small cactus: 12×16, thin vertical bar
2. Medium cactus: 12×20, thicker bar
3. Large cactus: 16×24, multi-arm shape

Acceptance:
- Cactus scrolls left at constant speed
- Cactus maintains recognizable shape (no GoL decay)
- Hitbox accurate for collision detection
- isOffscreen() correctly detects when cactus passes left edge
- Visual appearance has subtle organic flicker
- Multiple cactus variations for visual variety
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Entities",
  task_order: 80
})
```

**Implementation details:**
- Static pattern: Vertical bars of alive cells
- Flicker: Toggle 2-3 random edge cells every 5 frames
- Speed: `-6` pixels/frame = ~360px/second at 60fps
- Hitbox: Rectangle slightly smaller than sprite (80% width/height for forgiveness)

---

## Testing Strategy (Phase 2)

### Unit Tests

**Framework:** Vitest (established in Phase 1)

**Critical Test Cases:**

1. **Collision Detection**
   ```javascript
   // tests/utils/test_Collision.js
   describe('Collision', () => {
     test('circleCircle detects overlap', () => {
       const a = { x: 0, y: 0, radius: 10 }
       const b = { x: 15, y: 0, radius: 10 }
       expect(Collision.circleCircle(a, b)).toBe(true)

       const c = { x: 25, y: 0, radius: 10 }
       expect(Collision.circleCircle(a, c)).toBe(false)
     })

     test('circleRect detects overlap', () => {
       const circle = { x: 50, y: 50, radius: 10 }
       const rect = { x: 40, y: 40, width: 20, height: 20 }
       expect(Collision.circleRect(circle, rect)).toBe(true)
     })
   })
   ```

2. **Physics Simulation**
   ```javascript
   // tests/core/test_PhysicsEngine.js
   describe('PhysicsEngine', () => {
     test('applies gravity to falling entity', () => {
       const entity = { y: 100, velocity: { y: 0 }, onGround: false }
       PhysicsEngine.applyGravity(entity)
       expect(entity.velocity.y).toBeGreaterThan(0)
     })

     test('stops entity at ground level', () => {
       const entity = { y: 500, velocity: { y: 5 }, onGround: false }
       const groundY = 400
       PhysicsEngine.checkGroundCollision(entity, groundY)
       expect(entity.y).toBe(groundY)
       expect(entity.onGround).toBe(true)
       expect(entity.velocity.y).toBe(0)
     })

     test('jump only works when on ground', () => {
       const entity = { velocity: { y: 0 }, onGround: true }
       PhysicsEngine.jump(entity, 12)
       expect(entity.velocity.y).toBe(-12)

       entity.onGround = false
       PhysicsEngine.jump(entity, 12)
       expect(entity.velocity.y).toBe(-12)  // No change
     })
   })
   ```

3. **Player Input**
   ```javascript
   // tests/entities/test_Player.js
   describe('Player', () => {
     test('jumps when JUMP pressed and on ground', () => {
       const player = new Player(100, 400)
       player.physics.onGround = true
       player.physics.velocity.y = 0

       const input = new InputManager()
       input.keys['Space'] = true

       player.handleInput(input)
       expect(player.physics.velocity.y).toBeLessThan(0)  // Jumping up
     })

     test('does not jump when in air', () => {
       const player = new Player(100, 300)
       player.physics.onGround = false
       player.physics.velocity.y = 5

       const input = new InputManager()
       input.keys['Space'] = true

       const beforeVelocity = player.physics.velocity.y
       player.handleInput(input)
       expect(player.physics.velocity.y).toBe(beforeVelocity)
     })
   })
   ```

4. **Modified GoL Stability**
   ```javascript
   // tests/entities/test_ModifiedGoLSprite.js
   describe('ModifiedGoLSprite', () => {
     test('life force keeps core region alive', () => {
       const sprite = new ModifiedGoLSprite(100, 100, 20, 20)
       sprite.engine.clearGrid()  // Kill all cells

       sprite.ensureCoreAlive()

       const coreRegion = sprite.getCoreRegion(0.3)
       const aliveCoreCount = sprite.countAliveIn(coreRegion)
       expect(aliveCoreCount).toBeGreaterThan(0)
     })

     test('density maintenance prevents over-sparse grids', () => {
       const sprite = new ModifiedGoLSprite(100, 100, 20, 20)
       sprite.engine.clearGrid()  // Start with all dead

       for (let i = 0; i < 10; i++) {
         sprite.update()  // Density maintenance should activate
       }

       const density = sprite.calculateDensity()
       expect(density).toBeGreaterThan(0.3)  // Should have added cells
     })
   })
   ```

**Run commands:**
```bash
npm test                        # Run all tests (Phase 1 + Phase 2)
npm test -- entities            # Run only entity tests
npm test -- --watch             # Watch mode
npm test -- --coverage          # Coverage report
```

### Integration Testing with Chrome DevTools MCP

**Test scenario: Player Jump and Land**
```javascript
// Use Chrome DevTools MCP to test full gameplay
const page = await mcp__chrome_devtools__new_page({
  url: "http://localhost:5173"
})

// Take initial snapshot
await mcp__chrome_devtools__take_snapshot({
  filePath: "phase2-initial.txt"
})

// Simulate jump input
await mcp__chrome_devtools__press_key({ key: "Space" })

// Wait for jump arc (500ms)
await new Promise(resolve => setTimeout(resolve, 500))

// Take snapshot mid-jump
await mcp__chrome_devtools__take_snapshot({
  filePath: "phase2-jumping.txt"
})

// Wait for landing (500ms)
await new Promise(resolve => setTimeout(resolve, 500))

// Verify player landed
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    return {
      playerY: window.player.y,
      onGround: window.player.physics.onGround,
      velocityY: window.player.physics.velocity.y
    }
  }`
})

// Expected results:
// - playerY should be at GROUND_Y
// - onGround should be true
// - velocityY should be 0
```

**Test scenario: Collision Detection**
```javascript
// Spawn player and obstacle
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    // Position cactus directly in player's path
    const cactus = new Cactus(window.player.x + 100, GROUND_Y)
    window.obstacles.push(cactus)
    return "Cactus spawned"
  }`
})

// Wait for collision (cactus scrolls toward player)
await new Promise(resolve => setTimeout(resolve, 2000))

// Check if collision detected
const result = await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    return {
      playerAlive: window.player.state !== 'dead',
      obstacleCount: window.obstacles.length
    }
  }`
})

// Verify collision resulted in death
expect(result.playerAlive).toBe(false)
```

**Test scenario: Life Force Stability**
```javascript
// Force player sprite to minimal cells
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    // Kill most cells, leaving only 2-3 alive
    window.player.engine.clearGrid()
    window.player.engine.setCell(10, 10, 1)
    window.player.engine.setCell(10, 11, 1)
    return "Player sprite minimized"
  }`
})

// Wait for several GoL updates (life force should activate)
await new Promise(resolve => setTimeout(resolve, 1000))

// Verify life force injected cells
const cellCount = await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    let count = 0
    const grid = window.player.engine.current
    for (let x = 0; x < grid.length; x++) {
      for (let y = 0; y < grid[x].length; y++) {
        if (grid[x][y] === 1) count++
      }
    }
    return count
  }`
})

// Should have more cells than the initial 2-3
expect(cellCount).toBeGreaterThan(10)
```

### Manual Visual Testing

**Checklist:**
1. **Player Animation**
   - [ ] Player sprite shows organic GoL animation
   - [ ] Cells evolve smoothly (not flickering chaotically)
   - [ ] Core region always has some alive cells
   - [ ] Player maintains recognizable shape

2. **Jump Mechanics**
   - [ ] Jump feels responsive (< 100ms latency)
   - [ ] Jump arc looks natural
   - [ ] Player lands smoothly on ground
   - [ ] Cannot double-jump in mid-air

3. **Obstacle Movement**
   - [ ] Cacti scroll smoothly left
   - [ ] Cacti maintain shape (no GoL decay)
   - [ ] Speed feels appropriate for gameplay
   - [ ] Multiple cactus variations visible

4. **Collision Detection**
   - [ ] Collision feels fair (hitbox size appropriate)
   - [ ] No false positives (collision when not touching)
   - [ ] No false negatives (missing collision when touching)
   - [ ] Debug hitboxes align with sprites (if enabled)

5. **Performance**
   - [ ] Maintains 60fps with player + 3-5 obstacles
   - [ ] No frame drops during jumps
   - [ ] GoL simulation stays within budget (< 1ms total)

---

## Edge Cases for Testing

### Physics Edge Cases:
- [ ] **Jump at apex:** Player reaches maximum height, then falls
- [ ] **Ground collision:** Player stops exactly at ground level (doesn't jitter)
- [ ] **Multiple jumps:** Spam jump key - only one jump per ground contact
- [ ] **Terminal velocity:** Falling for extended time doesn't exceed max speed

### Collision Edge Cases:
- [ ] **Near miss:** Player just barely avoids obstacle (no collision)
- [ ] **Edge collision:** Collision at edge of hitbox (not just center)
- [ ] **Multiple obstacles:** Player collides with first obstacle, not all
- [ ] **Dead obstacle:** Offscreen obstacles don't trigger collision

### GoL Stability Edge Cases:
- [ ] **Minimal cells:** Player with only 2-3 cells survives via life force
- [ ] **Over-dense:** Player with 90% density stabilizes via density maintenance
- [ ] **Rapid re-seeding:** Life force doesn't thrash (max once per 30 frames)
- [ ] **Mask boundary:** Cells stay within mask over 1000+ generations

---

## Acceptance Criteria (Phase 2)

### Functional Requirements:
- [ ] **FR-1:** Player character uses ModifiedGoLSprite with life force injection
- [ ] **FR-2:** Player responds to JUMP input with < 100ms latency
- [ ] **FR-3:** Physics simulation applies gravity, velocity, and ground collision
- [ ] **FR-4:** Cactus obstacles scroll left and maintain shape
- [ ] **FR-5:** Collision detection uses fixed hitboxes (not dynamic GoL cells)
- [ ] **FR-6:** Life force keeps player sprite stable (never completely dies)
- [ ] **FR-7:** Input manager tracks pressed, justPressed, justReleased states

### Performance Requirements:
- [ ] **PR-1:** Player GoL simulation < 0.05ms per update (12fps updates)
- [ ] **PR-2:** Obstacle rendering < 0.1ms per obstacle
- [ ] **PR-3:** Main loop maintains 60fps with player + 5 obstacles
- [ ] **PR-4:** Input latency < 100ms (player jumps within 2 frames)

### Technical Requirements:
- [ ] **TR-1:** CellularSprite separates visual (GoL) from logic (hitbox, position)
- [ ] **TR-2:** ModifiedGoLSprite applies modifications AFTER B3/S23 rules
- [ ] **TR-3:** Collision uses fixed geometry defined at entity creation
- [ ] **TR-4:** MaskGenerator constrains cells to shape boundaries
- [ ] **TR-5:** Code follows CLAUDE.md conventions (ES6+, naming, JSDoc)
- [ ] **TR-6:** Unit tests pass with > 80% coverage for entities/ and core/

### Documentation Requirements:
- [ ] **DR-1:** All entity classes have JSDoc comments
- [ ] **DR-2:** Smart Hybrid strategy documented in code comments
- [ ] **DR-3:** README.md updated with Phase 2 features and controls

---

## Validation Commands (Phase 2)

**CRITICAL: Version Control Policy**

⚠️ **DO NOT commit or push to git/GitHub during implementation.**

**Pre-flight checks:**
```bash
# Verify Phase 1 is complete
npm test -- core/test_GoLEngine
npm test -- utils/test_Patterns
ls src/rendering/GoLBackground.js

# Verify dev server runs
npm run dev
# Should show animated GoL background at http://localhost:5173
```

**Development:**
```bash
npm install              # Install any new dependencies
npm run dev              # Start dev server
# Navigate to http://localhost:5173
```

**Testing:**
```bash
npm test                        # Run all tests (Phase 1 + Phase 2)
npm test -- entities            # Run only entity tests
npm test -- --coverage          # Generate coverage report
# Expected: All tests pass, > 80% coverage for entities/ and core/
```

**Chrome DevTools MCP Testing:**
```javascript
// Open browser automation
const page = await mcp__chrome_devtools__new_page({
  url: "http://localhost:5173"
})

// Test player jump
await mcp__chrome_devtools__press_key({ key: "Space" })

// Verify player state
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    return {
      playerY: window.player.y,
      onGround: window.player.physics.onGround,
      cellCount: window.player.countAliveCells()
    }
  }`
})

// Check console for errors
await mcp__chrome_devtools__list_console_messages()
```

**Performance validation:**
```bash
npm run dev
# Open http://localhost:5173
# Open browser DevTools → Performance tab
# Press 'R' to start recording
# Play game for 10 seconds (jump multiple times)
# Stop recording
# Verify:
# - Main thread FPS: 58-60fps
# - Player GoL time: < 0.05ms per update
# - Obstacle rendering: < 0.1ms per obstacle
# - No long tasks (> 50ms)
```

**Manual gameplay validation:**
```bash
# 1. Player jumps smoothly when Space pressed
# 2. Player falls with gravity and lands on ground
# 3. Cacti scroll left at constant speed
# 4. Collision stops game when player hits cactus
# 5. Player sprite shows organic GoL animation
# 6. No visual glitches or stuttering
# 7. Debug hitboxes align with sprites (if enabled)
```

**Phase 2 Completion Checklist:**
- [ ] All 8 tasks completed in Archon (status: "done")
- [ ] All unit tests pass (0 failures)
- [ ] Coverage > 80% for entities/ and core/
- [ ] Player character responsive and stable
- [ ] Collision detection accurate and fair
- [ ] Performance targets met (60fps sustained)
- [ ] Visual appearance organic and alive
- [ ] No console errors or warnings
- [ ] README.md documents Phase 2 features

**When Phase 2 is complete:**
1. Validate all acceptance criteria above
2. Update all Archon tasks to status: "done"
3. Play-test manually for 5 minutes
4. Verify no crashes or unexpected behavior
5. Commit code with message: "Phase 2 complete: Entity system and player"
6. Proceed to Phase 3 implementation prompt

---

## Additional Notes for the Agent

### CRITICAL: Fixed Hitboxes vs Dynamic GoL

This is **NON-NEGOTIABLE** for fair gameplay:

```javascript
// ✅ CORRECT: Fixed hitbox, dynamic visual
class Player extends ModifiedGoLSprite {
  constructor(x, y) {
    super(x, y, 20, 20)  // 20×20 GoL grid

    // Fixed hitbox defined once
    this.hitbox = {
      type: 'circle',
      x: this.x + this.width / 2,
      y: this.y + this.height / 2,
      radius: 25
    }
  }

  update() {
    super.update()  // Update GoL (visual changes)
    // Hitbox position updates, but geometry stays fixed
    this.hitbox.x = this.x + this.width / 2
    this.hitbox.y = this.y + this.height / 2
  }

  checkCollision(other) {
    // Use FIXED hitbox, NOT dynamic GoL cells
    return Collision.circleCircle(this.hitbox, other.hitbox)
  }
}

// ❌ WRONG: Using GoL cells for collision
class BadPlayer extends CellularSprite {
  checkCollision(other) {
    // NEVER DO THIS - cells change every frame!
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        if (this.engine.current[x][y] === ALIVE) {
          if (other.contains(x, y)) return true
        }
      }
    }
  }
}
```

### Smart Hybrid Authenticity Strategy

```javascript
// Reference: CLAUDE.md lines 95-152

// TIER 1: Pure GoL (100% authentic)
class Explosion extends CellularSprite {
  // No modifications - let B3/S23 evolve naturally
  update() {
    super.update()  // Just call parent (Pure GoL)
  }
}

// TIER 2: Modified GoL (80% authentic)
class Player extends ModifiedGoLSprite {
  update() {
    super.update()  // Runs B3/S23 first
    this.ensureCoreAlive()  // Then applies life force
    this.maintainDensity(0.4, 0.6)  // Then density control
  }
}

// TIER 3: Visual Only (0% authentic)
class Cactus extends CellularSprite {
  update() {
    // Skip GoL simulation entirely
    this.flickerEdgeCells()  // Just toggle random cells
    this.x -= this.speed  // Move left
  }
}
```

### Life Force Implementation Pattern

```javascript
// Reference: CLAUDE.md lines 428-439

ensureCoreAlive() {
  // 1. Define core region (center 30%)
  const coreStartX = Math.floor(this.cols * 0.35)
  const coreEndX = Math.floor(this.cols * 0.65)
  const coreStartY = Math.floor(this.rows * 0.35)
  const coreEndY = Math.floor(this.rows * 0.65)

  // 2. Count alive cells in core
  let coreAlive = 0
  for (let x = coreStartX; x < coreEndX; x++) {
    for (let y = coreStartY; y < coreEndY; y++) {
      if (this.engine.current[x][y] === ALIVE) coreAlive++
    }
  }

  // 3. If too few, inject cells
  const coreArea = (coreEndX - coreStartX) * (coreEndY - coreStartY)
  const threshold = coreArea * 0.4  // 40% of core

  if (coreAlive < threshold) {
    // Inject small stable pattern (BLOCK)
    const centerX = Math.floor(this.cols / 2)
    const centerY = Math.floor(this.rows / 2)
    this.setPattern(Patterns.BLOCK, centerX, centerY)
  }
}
```

### Common Pitfalls to Avoid

1. ❌ Using GoL cells for collision (use fixed hitboxes!)
2. ❌ Not applying life force modifications (player dies completely)
3. ❌ Forgetting to update hitbox position when entity moves
4. ❌ Applying GoL rules to Visual-Only entities (cacti should be static)
5. ❌ Creating hitboxes too tight (players feel unfair collisions)
6. ❌ Input polling instead of event handling (causes missed inputs)
7. ❌ Not throttling GoL updates (wastes performance)
8. ❌ Modifying B3/S23 rules themselves (modify AFTER rules, not during)

### Success Indicators

Phase 2 is complete when:
- ✅ Player jumps smoothly with Space key
- ✅ Player never completely dies (life force active)
- ✅ Cacti scroll left and maintain shape
- ✅ Collision feels fair and accurate
- ✅ 60fps sustained with player + 5 obstacles
- ✅ All Archon tasks marked "done"
- ✅ All unit tests pass
- ✅ Zero console errors

---

## Phase 2 Deliverables

When you complete Phase 2, provide:

### Summary Message

```
Phase 2 Complete: Entity System and Player ✅

Implementation completed:
- [x] InputManager for arcade controls
- [x] PhysicsEngine (gravity, velocity, jumping)
- [x] Collision detection system (fixed hitboxes)
- [x] MaskGenerator for shape-bounded GoL
- [x] CellularSprite base class
- [x] ModifiedGoLSprite with life force injection
- [x] Player entity (dinosaur) with controls
- [x] Obstacle system (Cactus)

Performance validation:
- Player GoL simulation: 0.04ms per update ✅
- Obstacle rendering: 0.08ms per obstacle ✅
- Main loop: 60fps sustained with player + 5 obstacles ✅
- Input latency: < 100ms ✅

All Archon tasks completed:
- Task 1: InputManager (done)
- Task 2: PhysicsEngine (done)
- Task 3: Collision Detection (done)
- Task 4: MaskGenerator (done)
- Task 5: CellularSprite (done)
- Task 6: ModifiedGoLSprite (done)
- Task 7: Player Entity (done)
- Task 8: Obstacle System (done)

Files created:
- src/core/InputManager.js, PhysicsEngine.js
- src/entities/CellularSprite.js, ModifiedGoLSprite.js
- src/entities/Player.js, Obstacle.js, Cactus.js
- src/utils/Collision.js, MaskGenerator.js
- tests/entities/test_CellularSprite.js, test_Player.js
- tests/core/test_PhysicsEngine.js
- tests/utils/test_Collision.js

Key features:
- Player uses Modified GoL with life force (never dies completely)
- Collision uses fixed hitboxes (fair, predictable gameplay)
- Smart Hybrid strategy: Modified for player, Visual-Only for obstacles
- Input system supports arcade controls
- Physics feels natural (gravity, jump arc)

Ready for Phase 3: Game loop, state machine, UI, and polish
```

### Next Steps

**Phase 3 will include:**
- Game state machine (MENU, PLAYING, PAUSED, GAME_OVER)
- Obstacle spawning system with difficulty progression
- Score tracking and display
- Main menu and game over screens
- Pause functionality
- Death animation (Pure GoL explosion)
- Sound effects (optional)
- Final polish and testing

---

## References

**CLAUDE.md sections:**
- Lines 95-152: Smart Hybrid Authenticity Strategy
- Lines 154-187: JavaScript/ES6+ conventions
- Lines 273-294: Performance optimization (batch rendering)
- Lines 313-356: GoL pattern library
- Lines 358-394: Common patterns and anti-patterns
- Lines 428-439: Life force injection pattern

**Phase 1 files (dependencies):**
- `src/core/GoLEngine.js` - B3/S23 simulation engine
- `src/rendering/CellRenderer.js` - Batch cell rendering
- `src/utils/Patterns.js` - Canonical GoL patterns
- `src/utils/Config.js` - Configuration constants

**External resources:**
- Chrome Dinosaur Game: https://chromedino.com/ (gameplay reference)
- LifeWiki: https://conwaylife.com/wiki/ (GoL patterns)
- p5.js Reference: https://p5js.org/reference/ (API documentation)
