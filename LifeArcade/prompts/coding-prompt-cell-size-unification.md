# Coding Prompt: Cell Size Unification - 30px Across All Games

> **⚠️ CRITICAL: Follow CLAUDE.md Principles**
>
> - **KISS:** Keep it simple, stupid. No over-abstraction.
> - **YAGNI:** You aren't gonna need it. No premature optimization.
> - **Inline calculations over helper functions** for simple math (cols × cellSize)

---

## Feature Description and Problem Solving

**Feature:** Unify cell size across all games and IdleScreen to 30px for visual consistency.

**Problem it's solving:**
- **Visual inconsistency:** IdleScreen background uses 30px cells, but games use 10px-13px cells
- **Different perceived "detail level":** Smaller cells in games look denser/more detailed than IdleScreen
- **Lack of visual cohesion:** Installation doesn't feel unified across screens
- **Scaling challenges:** Different baselines make responsive scaling inconsistent

**Current State:**
```
IdleScreen:      cellSize = 30px (1200px / 40 cols = 30px)
Space Invaders:  cellSize = 13px
Dino Runner:     cellSize = 10px (obstacles) / 13px (player) - MIXED
Breakout:        cellSize = 10px
Flappy Bird:     cellSize = 10px
```

**Target State:**
```
ALL CONTEXTS:    cellSize = 30px (unified)
Scale Factor:    3.0 (10px baseline → 30px target)
```

---

## User Story

```
As a physical installation operator,
I want all GoL cells to have the same visual size across all screens and games,
So that the installation feels cohesive and the GoL aesthetic is consistent throughout the experience.

Acceptance Criteria:
- All cells in IdleScreen, games, and particles are 30px × 30px
- GoL grids remain unchanged (6×6, 8×8, etc. maintained)
- All game elements fit within canvas 1200×1920 (portrait)
- Hitboxes scale proportionally to visual sizes
- Gameplay remains balanced (velocities adjusted manually)
- Code follows KISS principle (inline calculations, no over-abstraction)
```

---

## Solution and Approach

### **Chosen Approach: "Scale Visual, Adjust Layout Manually"**

**Why this approach:**

1. **Normalize baseline first:** Convert all games to 10px cellSize baseline
   - Space Invaders: 13px → 10px (factor 0.769)
   - Dino Runner: Mixed (10/13px) → 10px uniform
   - Breakout: Already 10px ✓
   - Flappy Bird: Already 10px ✓

2. **Scale 3x to target 30px:**
   - Dimensions: width/height multiply by 3
   - cellSize: 10px → 30px
   - Grids: Maintain original (6×6, 8×8, etc.)

3. **Adjust layout manually:**
   - Reduce enemy counts if needed (e.g., invaders 8 cols → 4 cols)
   - Adjust spacing to fit canvas
   - Recalculate positions for centering
   - Tweak velocities for balanced gameplay

4. **Keep it KISS:**
   - ❌ NO ScaleHelpers.js (over-abstraction)
   - ✅ YES inline calculations with comments (6 * 30 = 180px)
   - ❌ NO generic functions for single-use calculations
   - ✅ YES manual adjustments per game after testing

**Why NOT ScaleHelpers.js:**
- **KISS Principle:** `6 * 30` is clearer than `calculateWidth(6, 30)`
- **YAGNI Principle:** Functions like `scaleVelocity(..., damping)` are premature optimization
- **Mac M4 is overpowered:** Don't over-optimize, adjust manually after testing

**Alternative approaches considered:**
- ❌ Reduce grids (6×6 → 3×3): Loses GoL behavior richness
- ❌ Keep cellSize different per context: Defeats purpose of unification
- ❌ Auto-scale everything including layout: Elements don't fit, breaks gameplay

---

## Relevant Files from Codebase

**MUST READ to understand patterns:**

### **Core System:**
```
src/core/GoLEngine.js                    - B3/S23 engine, double buffer pattern
src/rendering/SimpleGradientRenderer.js  - Gradient rendering with cellSize parameter
src/rendering/GoLBackground.js           - Background rendering (already 30px)
src/utils/Config.js                      - Global config (add GAME_SCALE here)
src/utils/GradientPresets.js             - Google colors (no changes needed)
src/utils/Collision.js                   - Hitbox collision (verify proportional scaling)
src/utils/GoLHelpers.js                  - Life force, seeding (no changes)
src/utils/Patterns.js                    - GoL patterns (no changes)
```

### **Games to Modify (all 4):**
```
games/space-invaders.js                  - Baseline 13px → 10px → 30px
games/dino-runner.js                     - Mixed 10/13px → 10px → 30px
games/breakout.js                        - Baseline 10px → 30px
games/flappy-bird.js                     - Baseline 10px → 30px
games/game-wrapper.html                  - Loader (no changes)
```

### **Installation System (reference only):**
```
src/screens/IdleScreen.js                - Already uses 30px (reference)
installation.html                        - Main container (no changes)
```

---

## Research Links

**GoL and Rendering:**
- [Conway's Game of Life - Wikipedia](https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life)
  - [B3/S23 Rules](#rules)
  - Canonical implementation reference

- [P5.js Reference](https://p5js.org/reference/)
  - [createCanvas()](#canvas)
  - [beginShape()/endShape()](#shape)
  - Batch rendering patterns

**Project-Specific:**
- [LifeArcade CLAUDE.md](../CLAUDE.md)
  - [KISS Principle](#kiss)
  - [YAGNI Principle](#yagni)
  - [Code Style](#code-style)
  - Testing requirements

- [Physical Installation Prompt](./coding-prompt-physical-installation-PHASES-1-3.md)
  - [Game Architecture](#architecture)
  - Resolution and scaling patterns

---

## Implementation Plan

### **Foundational Work Needed:**

1. **Normalize all games to 10px baseline:**
   - Space Invaders: Scale down from 13px to 10px (factor 0.769)
   - Dino Runner: Unify mixed 10/13px to 10px uniform
   - Verify Breakout and Flappy Bird are already 10px

2. **Update Config.js with scale constants:**
   - Add `GAME_SCALE` config object
   - Document baseline (10px) and target (30px)
   - Define scale factor (3.0)

### **Core Implementation Needed:**

1. **Space Invaders:**
   - Update CONFIG with 30px cellSize
   - Scale dimensions: width/height = grid × 30px
   - Adjust layout: Reduce cols from 8 to 4
   - Adjust spacing: Manually calculate to fit canvas
   - Recalculate positions: Center grid horizontally
   - Adjust velocities: Test and tweak manually

2. **Dino Runner:**
   - Update CONFIG with 30px cellSize
   - Scale player and obstacles
   - Adjust obstacle Y positions (bird flight height)
   - Adjust spawn intervals if needed
   - Verify physics (gravity, jump) feel correct

3. **Breakout:**
   - Update CONFIG with 30px cellSize
   - Scale paddle, ball, bricks
   - Reduce brick cols from 8 to 3
   - Recalculate brick grid centering
   - Adjust ball speed for new paddle size

4. **Flappy Bird:**
   - Update CONFIG with 30px cellSize
   - Scale player and pipes
   - Increase gap height for larger player
   - Adjust pipe spawn Y range
   - Verify flap force is adequate

### **Integration Work Needed:**

1. **Verify hitboxes scale correctly:**
   - Collision detection uses width/height (already correct)
   - Test that collisions feel accurate visually
   - No gaps between visual and collision

2. **Verify responsive scaling:**
   - Test at different window sizes
   - cellSize should remain proportional
   - Canvas maintains 1200:1920 aspect ratio

3. **Verify visual consistency:**
   - Compare cell size in IdleScreen vs games
   - Should appear identical size visually
   - No jarring transitions between screens

---

## Step-by-Step Task List

### **Phase 0: Normalize Baseline to 10px**

**Task 1: Normalize Space Invaders (13px → 10px)**
```
File: games/space-invaders.js

Changes:
1. CONFIG.invader.cellSize: 13 → 10
2. CONFIG.invader.width: 80 → 60 (6 cells × 10px)
3. CONFIG.invader.height: 80 → 60
4. CONFIG.invader.spacing: 120 → 90 (120 × 0.769)
5. CONFIG.player.width: 80 → 60
6. CONFIG.player.height: 80 → 60
7. CONFIG.player.cellSize: 13 → 10
8. CONFIG.player.speed: 8 → 6
9. CONFIG.bullet.width: 40 → 30 (3 cells × 10px)
10. CONFIG.bullet.height: 40 → 30
11. CONFIG.bullet.cellSize: 13 → 10
12. CONFIG.explosion.cellSize: 13 → 10

Testing:
- Run game standalone
- Verify all sprites render correctly
- Verify gameplay feels similar (adjust speeds if needed)
```

**Task 2: Normalize Dino Runner (mixed → 10px uniform)**
```
File: games/dino-runner.js

Changes:
1. CONFIG.player.width: 100 → 80 (8 cells × 10px)
2. CONFIG.player.height: 100 → 80
3. CONFIG.player.cellSize: 13 → 10
4. Verify CONFIG.obstacle.cellSize: already 10px ✓
5. setupPlayer(): Adjust y position for new height

Testing:
- Run game standalone
- Verify player size looks correct
- Verify obstacles spawn correctly
- Verify collisions work
```

**Task 3: Verify Breakout and Flappy Bird**
```
Files: games/breakout.js, games/flappy-bird.js

Verification:
- Grep for "cellSize" in both files
- Confirm all are 10px
- No changes needed if confirmed
```

---

### **Phase 1: Update Config.js**

**Task 4: Add GAME_SCALE constants**
```
File: src/utils/Config.js

Add at end of file:
/**
 * Game scale configuration for unified cell size.
 *
 * Baseline: 10px (all games normalized to this)
 * Target: 30px (IdleScreen cell size)
 * Scale Factor: 3.0
 */
export const GAME_SCALE = {
  OLD_CELL_SIZE: 10,   // Baseline
  NEW_CELL_SIZE: 30,   // Target
  SCALE_FACTOR: 3.0    // 30 / 10
}

Testing:
- Import in one game file to verify export works
- No runtime changes yet
```

---

### **Phase 2: Scale Games to 30px**

**Task 5: Space Invaders - Scale 3x with Layout Adjustment**
```
File: games/space-invaders.js

1. Import GAME_SCALE:
   import { GAME_SCALE } from '../src/utils/Config.js'
   const SCALE = GAME_SCALE.SCALE_FACTOR  // 3.0
   const CELL_SIZE = GAME_SCALE.NEW_CELL_SIZE  // 30px

2. Update CONFIG:
   invader: {
     cols: 4,                    // ⚠️ Reduced from 8
     rows: 5,
     width: 6 * CELL_SIZE,       // 180px (6 cells × 30px)
     height: 6 * CELL_SIZE,      // 180px
     spacing: 70,                 // ⚠️ Adjusted manually
     startX: 60,                  // ⚠️ Centered manually
     startY: 200,
     moveInterval: 30,
     speed: 18,                   // ⚠️ Adjust after testing
     cellSize: CELL_SIZE          // 30px
   }

   player: {
     width: 6 * CELL_SIZE,        // 180px
     height: 6 * CELL_SIZE,       // 180px
     cellSize: CELL_SIZE,         // 30px
     speed: 10,                   // ⚠️ Adjust after testing
     shootCooldown: 15
   }

   bullet: {
     width: 3 * CELL_SIZE,        // 90px
     height: 3 * CELL_SIZE,       // 90px
     cellSize: CELL_SIZE          // 30px
   }

   explosion: {
     width: 6 * CELL_SIZE,        // 180px
     height: 6 * CELL_SIZE,       // 180px
     cellSize: CELL_SIZE          // 30px
   }

3. Add validation comment:
   // Validation: Invaders fit in canvas
   // Total width = (4 × 180) + (3 × 70) = 720 + 210 = 930px ✓
   // Canvas width = 1200px, margin = (1200 - 930) / 2 = 135px ✓

4. Update setupPlayer():
   - width/height already set in CONFIG (no change)
   - y position: CONFIG.height - 200 * SCALE (scale position)
   - Grid MAINTAINS 6×6 (do NOT change)

5. Update setupInvaders():
   - width/height already set in CONFIG (no change)
   - Grid MAINTAINS 6×6 (do NOT change)

6. Update shootBullet():
   - width/height already set in CONFIG (no change)
   - Grid MAINTAINS 3×3 (do NOT change)

7. Update spawnExplosion():
   - width/height already set in CONFIG (no change)
   - Grid MAINTAINS 6×6 (do NOT change)

Testing:
- npm run dev
- Open games/game-wrapper.html?game=space-invaders
- Verify all sprites render at correct size
- Verify 4 columns of invaders fit in canvas
- Verify invaders are centered horizontally
- Play game: test collision accuracy
- Adjust speeds if gameplay feels too fast/slow
```

**Task 6: Dino Runner - Scale 3x**
```
File: games/dino-runner.js

1. Import GAME_SCALE:
   import { GAME_SCALE } from '../src/utils/Config.js'
   const SCALE = GAME_SCALE.SCALE_FACTOR  // 3.0
   const CELL_SIZE = GAME_SCALE.NEW_CELL_SIZE  // 30px

2. Update CONFIG:
   player: {
     width: 8 * CELL_SIZE,        // 240px
     height: 8 * CELL_SIZE,       // 240px
     cellSize: CELL_SIZE          // 30px
   }

   obstacle: {
     spawnInterval: 90,
     minInterval: 30,
     speed: -10,                  // ⚠️ Adjust after testing
     speedIncrease: 0.001
   }

3. Update setupPlayer():
   - y: CONFIG.groundY - (8 * CELL_SIZE)
   - width/height from CONFIG
   - Grid MAINTAINS 8×8

4. Update spawnObstacle():
   const types = [
     {
       type: 'cactus',
       cols: 8,
       rows: 10,
       width: 8 * CELL_SIZE,      // 240px
       height: 10 * CELL_SIZE     // 300px
     },
     {
       type: 'bird',
       cols: 10,
       rows: 8,
       width: 10 * CELL_SIZE,     // 300px
       height: 8 * CELL_SIZE,     // 240px
       y: CONFIG.groundY - 500    // ⚠️ Adjusted
     }
   ]

Testing:
- npm run dev
- Open game-wrapper.html?game=dino-runner
- Verify player size
- Verify obstacles spawn correctly
- Verify bird flies at appropriate height
- Test collision accuracy
- Adjust obstacle speed if needed
```

**Task 7: Breakout - Scale 3x with Layout Adjustment**
```
File: games/breakout.js

1. Import GAME_SCALE:
   import { GAME_SCALE } from '../src/utils/Config.js'
   const SCALE = GAME_SCALE.SCALE_FACTOR  // 3.0
   const CELL_SIZE = GAME_SCALE.NEW_CELL_SIZE  // 30px

2. Update CONFIG:
   paddle: {
     width: 15 * CELL_SIZE,       // 450px
     height: 3 * CELL_SIZE,       // 90px
     cellSize: CELL_SIZE,         // 30px
     speed: 12                    // ⚠️ Adjust after testing
   }

   ball: {
     width: 3 * CELL_SIZE,        // 90px
     height: 3 * CELL_SIZE,       // 90px
     cellSize: CELL_SIZE,         // 30px
     speed: 8
   }

   brick: {
     width: 11 * CELL_SIZE,       // 330px
     height: 4 * CELL_SIZE,       // 120px
     cellSize: CELL_SIZE,         // 30px
     cols: 3,                     // ⚠️ Reduced from 8
     rows: 6,
     spacing: 15,
     offsetX: 0,                  // Calculate dynamically
     offsetY: 150
   }

3. Update setupBricks():
   const brickWidth = 11 * CELL_SIZE   // 330px
   const brickHeight = 4 * CELL_SIZE   // 120px

   // Calculate centered offset
   const totalWidth = (cols * brickWidth) + ((cols - 1) * spacing)
   const offsetX = (CONFIG.width - totalWidth) / 2

   // Grid MAINTAINS 11×4

4. Add validation comment:
   // Validation: Bricks fit in canvas
   // Total width = (3 × 330) + (2 × 15) = 990 + 30 = 1020px ✓
   // offsetX = (1200 - 1020) / 2 = 90px (centered) ✓

Testing:
- npm run dev
- Open game-wrapper.html?game=breakout
- Verify paddle size
- Verify 3 columns of bricks centered
- Verify ball size
- Test collision accuracy
- Adjust speeds if needed
```

**Task 8: Flappy Bird - Scale 3x with Gap Adjustment**
```
File: games/flappy-bird.js

1. Import GAME_SCALE:
   import { GAME_SCALE } from '../src/utils/Config.js'
   const SCALE = GAME_SCALE.SCALE_FACTOR  // 3.0
   const CELL_SIZE = GAME_SCALE.NEW_CELL_SIZE  // 30px

2. Update CONFIG:
   player: {
     width: 6 * CELL_SIZE,        // 180px
     height: 6 * CELL_SIZE,       // 180px
     cellSize: CELL_SIZE          // 30px
   }

   pipe: {
     width: 8 * CELL_SIZE,        // 240px
     cellSize: CELL_SIZE,         // 30px
     gap: 500,                    // ⚠️ Increased for larger player
     spacing: 600
   }

3. Update setupPlayer():
   - width/height from CONFIG
   - Grid MAINTAINS 6×6

4. Update spawnPipe():
   const gapY = random(300, CONFIG.height - 800)  // ⚠️ Adjusted range
   const gapHeight = CONFIG.pipe.gap  // 500px
   const pipeWidth = 8 * CELL_SIZE    // 240px

   // Grid: width 8 cells, height variable
   gol: new GoLEngine(8, Math.ceil(height / CELL_SIZE), 15)

Testing:
- npm run dev
- Open game-wrapper.html?game=flappy-bird
- Verify player size
- Verify pipe width
- Verify gap is passable
- Test collision accuracy
- Adjust gap/flap force if needed
```

---

### **Phase 3: Validation and Polish**

**Task 9: Visual Consistency Check**
```
1. Start installation: npm run dev → http://localhost:5173/installation.html
2. Navigate to IdleScreen
3. Measure cell size visually (should be ~30px at 1200×1920)
4. Advance to Gallery
5. Select each game and measure cell sizes
6. All cells should appear same size as IdleScreen

Acceptance:
- Visual inspection confirms uniform cell size
- Take screenshots if needed for comparison
```

**Task 10: Hitbox Verification**
```
For each game:
1. Enable debug hitboxes if available
2. Play game and observe collisions
3. Verify collision occurs when sprites visually touch
4. No gaps or early collisions

Specific tests:
- Space Invaders: Bullet hits invader when visually overlapping
- Dino Runner: Player hits obstacle when visually touching
- Breakout: Ball bounces when visually touching paddle/bricks
- Flappy Bird: Bird dies when touching pipe edges
```

**Task 11: Performance Check**
```
1. Open DevTools → Performance tab
2. Record 30 seconds on IdleScreen
3. Verify sustained 60fps
4. Record 30 seconds in Space Invaders (most complex)
5. Verify sustained 60fps
6. Check memory usage < 100MB

Acceptance:
- FPS stays above 55fps consistently
- No memory leaks during extended play
- No frame drops during transitions
```

**Task 12: Responsive Behavior**
```
1. Test at different window sizes:
   - Small: 600×960 (half size)
   - Large: 1920×3072 (2x size)
2. Verify cellSize scales proportionally
3. Verify aspect ratio maintained
4. Verify gameplay still works

Acceptance:
- Cells appear same relative size at all resolutions
- No layout breaks
- Hitboxes still accurate
```

---

## Testing Strategy

### **Unit Tests**

**No unit tests needed for this feature.**

Rationale:
- Changes are configuration values and layout adjustments
- Simple arithmetic (cols × cellSize) doesn't require unit tests
- KISS principle: Test the integration, not the multiplication

### **Integration Tests**

**Test 1: Cell Size Consistency**
```javascript
// tests/integration/test_cell_size_consistency.js
describe('Cell Size Consistency', () => {
  test('All games use 30px cellSize', () => {
    // Load each game file
    // Parse CONFIG.*.cellSize
    // Assert all equal 30
  })

  test('Visual sizes match grid dimensions', () => {
    // For each game entity (player, enemy, etc.)
    // Assert: width = grid.cols × 30
    // Assert: height = grid.rows × 30
  })
})
```

**Test 2: Layout Validation**
```javascript
// tests/integration/test_layout_validation.js
describe('Layout Fits Canvas', () => {
  test('Space Invaders grid fits in 1200px width', () => {
    const totalWidth = (4 * 180) + (3 * 70)  // 930px
    expect(totalWidth).toBeLessThan(1200)
  })

  test('Breakout bricks fit in 1200px width', () => {
    const totalWidth = (3 * 330) + (2 * 15)  // 1020px
    expect(totalWidth).toBeLessThan(1200)
  })
})
```

### **End-to-End Tests**

**Manual E2E Testing (Chrome DevTools MCP):**

```javascript
// Test complete flow with visual validation
describe('E2E: Cell Size Visual Consistency', () => {
  test('IdleScreen → Space Invaders cell size match', async () => {
    const page = await mcp__chrome_devtools__new_page({
      url: "http://localhost:5173/installation.html"
    })

    // 1. Take screenshot of IdleScreen
    await mcp__chrome_devtools__take_screenshot({
      filePath: "test-idle-cells.png"
    })

    // 2. Advance to Gallery
    await mcp__chrome_devtools__press_key({ key: "Space" })
    await mcp__chrome_devtools__press_key({ key: "Space" })

    // 3. Select Space Invaders
    await mcp__chrome_devtools__press_key({ key: "1" })

    // 4. Wait for game load
    await new Promise(resolve => setTimeout(resolve, 3000))

    // 5. Take screenshot of game
    await mcp__chrome_devtools__take_screenshot({
      filePath: "test-game-cells.png"
    })

    // Manual validation: Compare screenshots
    // Cell sizes should appear identical
  })
})
```

**Gameplay Testing:**

```bash
# Test each game manually
npm run dev

# 1. Space Invaders
# Open: http://localhost:5173/games/game-wrapper.html?game=space-invaders
# - Play until first invader is killed
# - Verify collision feels accurate
# - Verify 4 columns fit well
# - Verify speeds feel balanced

# 2. Dino Runner
# Open: http://localhost:5173/games/game-wrapper.html?game=dino-runner
# - Play for 30 seconds
# - Verify obstacles spawn correctly
# - Verify collision accurate
# - Verify gameplay not too fast/slow

# 3. Breakout
# Open: http://localhost:5173/games/game-wrapper.html?game=breakout
# - Play until first brick broken
# - Verify 3 columns centered
# - Verify ball bounces accurately
# - Verify paddle speed appropriate

# 4. Flappy Bird
# Open: http://localhost:5173/games/game-wrapper.html?game=flappy-bird
# - Play until first pipe passed
# - Verify gap is passable
# - Verify collision accurate
# - Verify flap force sufficient
```

---

## Edge Cases for Testing

### **Rendering Edge Cases:**
- [ ] **Variable grid heights (Flappy Bird pipes):** Verify grid calculation `Math.ceil(height / 30)` doesn't cause visual gaps
- [ ] **Small grids (1×1, 2×2):** Ball in Breakout after scaling - verify single cells render correctly
- [ ] **Large grids (15×N):** Paddle in Breakout - verify no performance issues with wider grids
- [ ] **Grid boundaries:** Verify GoL cells don't leak outside entity visual boundaries

### **Layout Edge Cases:**
- [ ] **Canvas edge collisions:** Player/entities at canvas edges - verify hitboxes don't go off-screen
- [ ] **Centered layouts:** Space Invaders and Breakout grids - verify remain centered at different resolutions
- [ ] **Overlapping sprites:** Multiple explosions at same position - verify z-index and rendering order

### **Gameplay Edge Cases:**
- [ ] **High speed gameplay:** Dino Runner at high game speed - verify collisions still accurate
- [ ] **Simultaneous collisions:** Multiple bullets hitting multiple invaders - verify all detected
- [ ] **Edge-of-gap navigation:** Flappy Bird barely passing through gap - verify collision boundaries fair

### **Performance Edge Cases:**
- [ ] **Many entities:** Space Invaders with all invaders alive + many bullets - verify 60fps maintained
- [ ] **Long sessions:** Play Dino Runner for 5+ minutes - verify no memory leaks or FPS degradation
- [ ] **Rapid transitions:** Quickly switch between games in Gallery - verify cleanup happens correctly

### **Responsive Edge Cases:**
- [ ] **Very small window:** 400×640 - verify canvas scales down proportionally
- [ ] **Very large window:** 2400×3840 - verify canvas scales up without blur
- [ ] **Non-standard aspect ratios:** Verify canvas maintains 10:16 ratio with letterboxing if needed

---

## Acceptance Criteria

### **Visual Consistency:**
- [ ] AC-1: All cells in IdleScreen measure 30px × 30px at 1200×1920 resolution
- [ ] AC-2: All cells in Space Invaders (player, invaders, bullets, explosions) measure 30px × 30px
- [ ] AC-3: All cells in Dino Runner (player, obstacles, explosions) measure 30px × 30px
- [ ] AC-4: All cells in Breakout (paddle, ball, bricks, explosions) measure 30px × 30px
- [ ] AC-5: All cells in Flappy Bird (player, pipes, explosions) measure 30px × 30px
- [ ] AC-6: Visual size of cells appears identical across all screens and games

### **Technical Implementation:**
- [ ] AC-7: `GAME_SCALE` constant added to `src/utils/Config.js`
- [ ] AC-8: All games import and use `GAME_SCALE.NEW_CELL_SIZE` (30px)
- [ ] AC-9: No `ScaleHelpers.js` file created (KISS principle followed)
- [ ] AC-10: All calculations inline with clear comments (e.g., `6 * 30  // 180px`)
- [ ] AC-11: GoL grids maintain original sizes (6×6, 8×8, etc. not reduced)

### **Layout and Fit:**
- [ ] AC-12: Space Invaders: 4 columns of invaders fit within 1200px canvas width
- [ ] AC-13: Space Invaders: Grid is horizontally centered with visible margins
- [ ] AC-14: Breakout: 3 columns of bricks fit within 1200px canvas width
- [ ] AC-15: Breakout: Brick grid is horizontally centered
- [ ] AC-16: Flappy Bird: Pipe gap (500px) is passable by player (180px)
- [ ] AC-17: All games: No elements go off-screen or clip canvas edges

### **Collision and Hitboxes:**
- [ ] AC-18: Space Invaders: Bullets hit invaders when visually overlapping
- [ ] AC-19: Dino Runner: Player dies when visually touching obstacles
- [ ] AC-20: Breakout: Ball bounces when visually touching paddle/bricks
- [ ] AC-21: Flappy Bird: Player dies when visually touching pipe edges
- [ ] AC-22: All games: No "ghost" collisions (collision before visual contact)
- [ ] AC-23: All games: No "miss" collisions (no collision despite visual contact)

### **Gameplay Balance:**
- [ ] AC-24: Space Invaders: Player speed adjusted and gameplay feels balanced
- [ ] AC-25: Space Invaders: Invader movement speed adjusted and gameplay feels balanced
- [ ] AC-26: Dino Runner: Obstacle speed adjusted and game is playable
- [ ] AC-27: Dino Runner: Jump height/gravity feel appropriate for new player size
- [ ] AC-28: Breakout: Ball speed adjusted and gameplay feels balanced
- [ ] AC-29: Flappy Bird: Flap force adjusted and game is playable

### **Performance:**
- [ ] AC-30: IdleScreen maintains 60fps (55+ fps minimum) for 60 seconds
- [ ] AC-31: All games maintain 60fps during active gameplay
- [ ] AC-32: Memory usage stays below 100MB during extended play (5+ minutes)
- [ ] AC-33: No frame drops during screen transitions

### **Responsive Behavior:**
- [ ] AC-34: Canvas scales proportionally at 600×960 (half size)
- [ ] AC-35: Canvas scales proportionally at 1920×3072 (double size)
- [ ] AC-36: Aspect ratio 10:16 maintained at all window sizes
- [ ] AC-37: cellSize scales proportionally with canvas size

### **Code Quality:**
- [ ] AC-38: No console errors in any game
- [ ] AC-39: No console warnings in any game
- [ ] AC-40: All inline calculations have clear comments explaining the math
- [ ] AC-41: Manual adjustments (layout, speeds) have comments explaining rationale
- [ ] AC-42: Code follows CLAUDE.md style guidelines (GLOBAL mode, naming conventions)

---

## Validation Commands

### **Start Development Server:**
```bash
npm run dev
# Server starts at http://localhost:5173/
```

### **Test Installation System:**
```bash
# Open installation in browser
# URL: http://localhost:5173/installation.html

# Test flow:
# 1. Observe IdleScreen (measure cell size)
# 2. Press Space → Welcome
# 3. Press Space → Gallery
# 4. Press 1-4 to select games
# 5. Visual validation: Compare cell sizes
```

### **Test Individual Games:**
```bash
# Space Invaders
# URL: http://localhost:5173/games/game-wrapper.html?game=space-invaders
# - Verify 4 columns of invaders
# - Verify centered layout
# - Play and test collisions

# Dino Runner
# URL: http://localhost:5173/games/game-wrapper.html?game=dino-runner
# - Verify obstacle spawning
# - Verify collision accuracy
# - Test jump physics

# Breakout
# URL: http://localhost:5173/games/game-wrapper.html?game=breakout
# - Verify 3 columns of bricks
# - Verify centered layout
# - Test ball physics

# Flappy Bird
# URL: http://localhost:5173/games/game-wrapper.html?game=flappy-bird
# - Verify pipe gap passable
# - Verify collision accuracy
# - Test flap mechanics
```

### **Visual Size Measurement:**
```javascript
// Open DevTools Console in any game
// Run this snippet to measure cell sizes:

// Find a canvas element
const canvas = document.querySelector('canvas')
console.log('Canvas dimensions:', canvas.width, 'x', canvas.height)

// In IdleScreen: 40 cols, cellSize = canvas.width / 40
console.log('IdleScreen cellSize:', canvas.width / 40)  // Should be 30

// In games: Check CONFIG.cellSize
console.log('Game cellSize:', window.CONFIG?.player?.cellSize)  // Should be 30
```

### **Performance Profiling:**
```bash
# Open DevTools → Performance Tab

# Record IdleScreen:
# 1. Start recording
# 2. Wait 30 seconds
# 3. Stop recording
# 4. Check FPS graph (should be flat at 60fps)
# 5. Check Main Thread (should have no long tasks)

# Record Space Invaders:
# 1. Start recording
# 2. Play for 30 seconds
# 3. Stop recording
# 4. Check FPS (should stay above 55fps)
# 5. Check memory (should be < 100MB)
```

### **Regression Testing:**
```bash
# Verify no functionality broke

# Test 1: PostMessage still works
# - Play any game until Game Over
# - Open DevTools Console
# - Should see: "postMessage sent: {type: 'gameOver', payload: {...}}"

# Test 2: Leaderboard persistence
# - Complete a game
# - Enter initials (e.g., "AAA")
# - View leaderboard
# - Refresh browser
# - Check Application → Local Storage → scores_*
# - Verify score persists

# Test 3: Screen transitions
# - Navigate full flow: Idle → ... → QR → Idle
# - Verify no errors in console
# - Verify smooth transitions
```

### **Lint and Typecheck (Optional):**
```bash
# If project has linting configured:
npm run lint

# Check for syntax errors in modified files:
node -c games/space-invaders.js
node -c games/dino-runner.js
node -c games/breakout.js
node -c games/flappy-bird.js
node -c src/utils/Config.js
```

### **Final Validation Checklist:**
```bash
# Run through this checklist manually:

✓ 1. Start dev server (npm run dev)
✓ 2. Open installation.html
✓ 3. Measure cell size in IdleScreen (should be ~30px)
✓ 4. Navigate to Gallery
✓ 5. Test Space Invaders:
     - Measure cell size (should be ~30px)
     - Verify 4 columns fit
     - Play and test collisions
✓ 6. Return to Gallery (Escape key)
✓ 7. Test Dino Runner:
     - Measure cell size (should be ~30px)
     - Play and test collisions
✓ 8. Return to Gallery
✓ 9. Test Breakout:
     - Measure cell size (should be ~30px)
     - Verify 3 columns centered
     - Play and test collisions
✓ 10. Return to Gallery
✓ 11. Test Flappy Bird:
      - Measure cell size (should be ~30px)
      - Verify gap passable
      - Play and test collisions
✓ 12. Open DevTools → Performance
✓ 13. Profile each game for 30s
✓ 14. Verify all FPS > 55
✓ 15. Verify memory < 100MB
✓ 16. Check Console for errors (should be none)
✓ 17. Test responsive: Resize window, verify scaling
✓ 18. Final visual comparison: All cells same size ✓
```

---

## Additional Notes for Implementation

### **Common Pitfalls to Avoid:**

1. **❌ Don't create ScaleHelpers.js**
   - Keep calculations inline
   - Use comments to explain math
   - KISS over abstraction

2. **❌ Don't change GoL grids**
   - Maintain 6×6, 8×8, etc.
   - Only change cellSize, not grid dimensions

3. **❌ Don't auto-scale velocities**
   - Adjust manually after testing
   - Each game may need different adjustments

4. **❌ Don't forget validation comments**
   - Add inline comments showing layout fits canvas
   - Example: `// Total width = (4 × 180) + (3 × 70) = 930px ✓`

5. **❌ Don't skip manual testing**
   - Automated tests can't verify visual cell size
   - Must play each game to feel collision accuracy

### **Debugging Tips:**

```javascript
// Add temporary debug logging during implementation

console.log('Space Invaders Layout:', {
  cols: CONFIG.invader.cols,
  width: CONFIG.invader.width,
  spacing: CONFIG.invader.spacing,
  totalWidth: (CONFIG.invader.cols * CONFIG.invader.width) +
              ((CONFIG.invader.cols - 1) * CONFIG.invader.spacing),
  canvasWidth: CONFIG.width,
  fits: totalWidth <= CONFIG.width
})

// Remove debug logs before committing
```

### **If Gameplay Feels Off After Scaling:**

**Too Fast:**
- Reduce speed values in CONFIG
- Increase cooldowns/intervals
- Add damping factor manually (e.g., speed * 0.8)

**Too Slow:**
- Increase speed values in CONFIG
- Decrease cooldowns/intervals

**Collisions Inaccurate:**
- Verify hitbox uses entity.width/height
- Check that visual size matches hitbox size
- Add debug rendering for hitboxes temporarily

**Elements Don't Fit:**
- Reduce cols/rows in layout
- Decrease spacing
- Recalculate offsets for centering

---

**When implementation is complete, run the full validation checklist above to confirm 100% confidence in the feature with zero regressions.**
