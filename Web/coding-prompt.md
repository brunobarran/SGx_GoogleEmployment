# Mobile Dino Runner - Implementation Prompt

**Date:** 2025-11-19
**Feature:** Mobile-optimized version of LifeArcade dino-runner.js
**Approach:** Self-contained bundle (Option A - KISS principle)
**Orientation:** Portrait only (vertical)

---

## Feature Description

### Problem Statement

The current dino-runner.js game exists only as part of the LifeArcade arcade installation, running at fixed 1200×1920 resolution with keyboard controls designed for a physical arcade cabinet. There is no mobile version available for users to play on their phones or tablets, limiting accessibility and reach.

**Specific issues:**
- Fixed portrait resolution (1200×1920) - not responsive
- Keyboard-only controls - no touch support
- Tightly coupled to LifeArcade installation system (postMessage, iframe communication)
- 12 dependencies from `LifeArcade/src/` directory
- Cannot be deployed independently to GitHub Pages

### User Story

**As a** mobile user visiting the GitHub Pages site
**I want to** play the Dino Runner game on my phone or tablet
**So that** I can experience the Conway's Game of Life aesthetic in a classic endless runner without needing a physical arcade cabinet

**Acceptance scenarios:**
- User taps screen → Dino jumps
- User holds screen → Dino ducks
- Game runs at 60fps on iPhone 12+
- Game displays in portrait orientation only (vertical)
- Game Over screen appears with restart button
- Score displays throughout gameplay
- Game preserves all Game of Life visual aesthetics

---

## Solution

### Chosen Approach: Option A - Self-Contained Bundle

**Why this approach:**

1. **KISS Principle Alignment**
   - No build process (Vite, Webpack, etc.)
   - No `package.json` or `node_modules`
   - No GitHub Actions deployment pipeline
   - Direct HTML → JavaScript execution

2. **Pragmatic File Sizes**
   - Total JavaScript: 2,636 lines (~75 KB)
   - Assets (PNG sprites): 20 KB
   - Total project: ~130 KB uncompressed
   - This is 0.13% of GitHub Pages 100 MB limit
   - Gmail mobile uses 2 MB JS - we use 0.105 MB (20× smaller)

3. **Maximum Portability**
   - Copy folder → Works anywhere (USB, Dropbox, any static host)
   - No dependencies on LifeArcade structure
   - No symlinks (Windows/Git compatibility issues)

4. **Minimal Maintenance**
   - GoL code is stable (B3/S23 unchanged since 1970)
   - LifeArcade is production-ready (95.9% tests passing)
   - Expected updates: < 1 per year
   - Manual sync acceptable

5. **Fast Development**
   - Setup time: 1 hour vs 3 hours (Vite build approach)
   - Edit workflow: F5 refresh vs `npm run build`
   - Deploy: `git push` vs GitHub Actions configuration

**Trade-offs accepted:**
- ✅ Code duplication (2,636 lines) - acceptable for independence
- ✅ No tree-shaking - 105 KB is trivial in 2025
- ✅ Manual updates - GoL code is stable

---

## Relevant Codebase Files

### Primary Source File
- **`LifeArcade/public/games/dino-runner.js`** (842 lines)
  - Main game logic to adapt
  - Controls, physics, rendering, collision detection
  - **Critical sections:**
    - Lines 12-28: Import statements (need path updates)
    - Lines 34-154: CONFIG object (preserve all values)
    - Lines 211-236: `preload()` - PNG sprite loading
    - Lines 556-606: `updatePlayer()` - ADD touch controls here
    - Lines 814-821: `keyPressed()` - REMOVE arcade-specific code

### Dependencies to Copy (11 modules)

**Core Engine:**
- **`LifeArcade/src/core/GoLEngine.js`** (446 lines, 14 KB)
  - Conway's Game of Life B3/S23 implementation
  - Double buffer pattern (CRITICAL: never modify single grid in-place)
  - Must preserve all GoL authenticity

**Rendering:**
- **`LifeArcade/src/rendering/SimpleGradientRenderer.js`** (240 lines, 7.4 KB)
  - Perlin noise animated gradients
  - `renderMaskedGrid()` method - used for all GoL patterns
  - Gradient animation via `updateAnimation()`

**Utilities:**
- **`LifeArcade/src/utils/GradientPresets.js`** (262 lines, 6.2 KB)
  - Google brand color definitions
  - Gradient presets (ENEMY_HOT, ENEMY_COLD, ENEMY_RAINBOW, EXPLOSION)

- **`LifeArcade/src/utils/Collision.js`** (165 lines, ~5 KB)
  - `rectRect()` - used for player vs obstacles
  - CRITICAL: Collision uses FIXED hitboxes, not GoL cells

- **`LifeArcade/src/utils/Patterns.js`** (288 lines, ~8 KB)
  - 13 canonical GoL patterns (BLOCK, BEEHIVE, LOAF, BOAT, TUB, BLINKER, TOAD, BEACON, PULSAR, GLIDER, LWSS, etc.)
  - Pattern coordinates must be preserved exactly

- **`LifeArcade/src/utils/GoLHelpers.js`** (137 lines, ~4 KB)
  - `seedRadialDensity()` - used for explosion particles
  - `applyLifeForce()` - NOT used in dino (player is PNG sprite)

- **`LifeArcade/src/utils/ParticleHelpers.js`** (71 lines, ~2 KB)
  - `updateParticles()` - Pure GoL particle system
  - `renderParticles()` - uses SimpleGradientRenderer

- **`LifeArcade/src/utils/UIHelpers.js`** (95 lines, ~3 KB)
  - `renderGameOver()` - arcade version (REPLACE with mobile overlay)

- **`LifeArcade/src/utils/PatternRenderer.js`** (587 lines, ~15 KB)
  - Creates GoL patterns in STATIC or LOOP mode
  - `createPatternRenderer()` - used for obstacles and clouds
  - IMPORTANT: Returns `{ gol, dimensions }`

- **`LifeArcade/src/debug/HitboxDebug.js`** (238 lines, ~7 KB)
  - `initHitboxDebug()` - call in `setup()`
  - `drawHitboxRect()` - visualize collision boxes
  - Press 'H' to toggle (useful for mobile debugging)

- **`LifeArcade/src/utils/GameBaseConfig.js`** (107 lines, ~3 KB)
  - `GAME_DIMENSIONS` - base resolution constants
  - `createGameState()`, `createGameConfig()` - factory functions
  - Must adapt for mobile (800×1280 instead of 1200×1920)

### Assets
- **`LifeArcade/public/img/dino-sprites/`** (4 PNG files, 20 KB total)
  - `run_0.png` (200×200px)
  - `run_1.png` (200×200px)
  - `duck_run_0.png` (265×121px)
  - `duck_run_1.png` (265×121px)

### Documentation References
- **`LifeArcade/CLAUDE.md`** (832 lines)
  - Section 5: Conway's Game of Life Rules (CRITICAL - must follow B3/S23 exactly)
  - Section 6: Performance Targets (60fps @ portrait resolution)
  - Section 7: Google Brand Colors (official RGB values)
  - Section 10: Common Patterns (DO: Separate visual from logic)
  - Section 14: Known Deviations (Dino Runner PNG sprite approved)

- **`LifeArcade/README.md`**
  - Project structure overview
  - Technology stack (p5.js 1.7.0 global mode)

---

## Implementation Plan

### Foundational Work

1. **Create project structure** in `Web/games/dino-runner-mobile/`
   ```
   Web/games/dino-runner-mobile/
   ├── index.html
   ├── game.js
   ├── lib/          # 11 copied modules
   ├── assets/       # 4 PNG sprites
   └── README.md
   ```

2. **Copy 11 dependency modules** from `LifeArcade/src/` to `lib/`
   - Preserve exact file contents (no modifications yet)
   - Total size: ~75 KB

3. **Copy 4 PNG sprites** from `LifeArcade/public/img/dino-sprites/` to `assets/dino-sprites/`

4. **Update import paths in `lib/` modules**
   - Some modules import other modules (e.g., `PatternRenderer.js` imports `GoLEngine.js`)
   - Change `../core/GoLEngine.js` → `./GoLEngine.js`
   - Files to check: `PatternRenderer.js`, `SimpleGradientRenderer.js`, `ParticleHelpers.js`, `UIHelpers.js`

### Core Implementation

5. **Create `index.html`** with:
   - Responsive viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`
   - p5.js CDN: `<script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>`
   - Module script: `<script type="module" src="game.js"></script>`
   - Embedded CSS:
     - `touch-action: none` on canvas (prevent iOS scroll)
     - Score overlay (top-left, Google Blue #4285F4)
     - Touch hint overlay (bottom, Google Gray #5F6368, fade animation)
     - Game Over overlay (hidden by default, flex center)
   - DOM elements:
     - `#score-display` with `#score` span
     - `#touch-hint` with control instructions
     - `#game-over-overlay` with `#final-score-value` and `#restart-button`

6. **Create `game.js`** by adapting `dino-runner.js`:

   **Import path updates (11 imports):**
   ```javascript
   // FROM:
   import { GoLEngine } from '/src/core/GoLEngine.js'

   // TO:
   import { GoLEngine } from './lib/GoLEngine.js'
   ```

   **Responsive canvas configuration (PORTRAIT ONLY):**
   ```javascript
   const BASE_WIDTH = 800   // Scaled from 1200
   const BASE_HEIGHT = 1280  // Scaled from 1920
   const ASPECT_RATIO = 0.625  // 10:16 (portrait)

   function calculateResponsiveSize() {
     const maxWidth = window.innerWidth
     const maxHeight = window.innerHeight

     // ALWAYS use width-constrained (portrait only)
     // Ignore landscape orientation
     return {
       width: maxWidth,
       height: maxWidth / ASPECT_RATIO
     }
   }
   ```

   **Touch controls implementation:**
   ```javascript
   let isTouching = false
   let touchStartTime = 0
   const DUCK_THRESHOLD = 200  // ms

   function setup() {
     const { width, height } = calculateResponsiveSize()
     const canvas = createCanvas(width, height)
     canvas.parent('game-container')

     // Touch events (passive: false to allow preventDefault)
     canvas.elt.addEventListener('touchstart', handleTouchStart, { passive: false })
     canvas.elt.addEventListener('touchend', handleTouchEnd, { passive: false })

     // Mouse fallback (desktop testing)
     canvas.elt.addEventListener('mousedown', handleTouchStart)
     canvas.elt.addEventListener('mouseup', handleTouchEnd)

     initGame()
   }

   function handleTouchStart(e) {
     e.preventDefault()
     isTouching = true
     touchStartTime = millis()
   }

   function handleTouchEnd(e) {
     e.preventDefault()
     isTouching = false
   }

   function updatePlayer() {
     // Quick tap = Jump (< 200ms)
     if (isTouching && (millis() - touchStartTime) < DUCK_THRESHOLD && player.onGround) {
       if (!player.isDucking) {
         player.vy = CONFIG.jumpForce
         player.onGround = false
       }
     }

     // Hold = Duck (> 200ms)
     if (isTouching && (millis() - touchStartTime) >= DUCK_THRESHOLD && player.onGround) {
       player.isDucking = true
     } else if (!isTouching) {
       player.isDucking = false
     }

     // ... rest of physics (gravity, ground collision, animation)
   }
   ```

   **Asset path updates:**
   ```javascript
   // FROM:
   dinoSprites.run[0] = loadImage('/img/dino-sprites/run_0.png')

   // TO:
   dinoSprites.run[0] = loadImage('./assets/dino-sprites/run_0.png')
   ```

   **Remove arcade-specific code:**
   ```javascript
   // REMOVE postMessage to parent (lines ~474-478 in original)
   // REMOVE score-value header update (lines ~486-489 in original)
   // REMOVE window.parent checks in keyPressed() (lines ~816-819 in original)
   ```

   **Mobile UI integration:**
   ```javascript
   function draw() {
     // ... game loop

     // Update DOM score
     const scoreElement = document.getElementById('score')
     if (scoreElement) {
       scoreElement.textContent = state.score
     }

     if (state.phase === 'GAMEOVER') {
       showGameOver()
     }
   }

   function showGameOver() {
     const overlay = document.getElementById('game-over-overlay')
     const finalScoreElement = document.getElementById('final-score-value')

     if (overlay && finalScoreElement) {
       overlay.style.display = 'flex'
       finalScoreElement.textContent = state.score
     }
   }

   // Restart button handler
   window.addEventListener('DOMContentLoaded', () => {
     const restartButton = document.getElementById('restart-button')
     if (restartButton) {
       restartButton.addEventListener('click', () => {
         const overlay = document.getElementById('game-over-overlay')
         if (overlay) overlay.style.display = 'none'
         initGame()
       })
     }
   })
   ```

   **Window resize handler:**
   ```javascript
   function windowResized() {
     const { width, height } = calculateResponsiveSize()
     resizeCanvas(width, height)
   }

   window.windowResized = windowResized  // Export for p5.js
   ```

### Integration Work

7. **Create `README.md`** with:
   - Play Now link (GitHub Pages URL)
   - Controls instructions (Tap to Jump, Hold to Duck)
   - Features list (GoL aesthetics, responsive, touch-optimized)
   - Tech stack (p5.js, Vanilla JS, no build step)
   - Development instructions (Python HTTP server)
   - Credits (Based on LifeArcade)

8. **Configure GitHub Pages** (no code changes needed):
   - Repository Settings → Pages
   - Source: Deploy from branch `main`
   - Folder: `/Web` (or root if Web is moved)
   - Expected URL: `https://brunobarran.github.io/SGx_GoogleEmployment/games/dino-runner-mobile/`

---

## Step-by-Step Task List

### Phase 1: Setup (15 minutes)

- [ ] **Task 1.1:** Create directory structure
  ```bash
  mkdir -p Web/games/dino-runner-mobile/{lib,assets/dino-sprites}
  ```

- [ ] **Task 1.2:** Copy 11 JavaScript modules to `lib/`
  ```bash
  cp LifeArcade/src/core/GoLEngine.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/rendering/SimpleGradientRenderer.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/GradientPresets.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/Collision.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/Patterns.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/GoLHelpers.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/ParticleHelpers.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/UIHelpers.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/PatternRenderer.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/debug/HitboxDebug.js Web/games/dino-runner-mobile/lib/
  cp LifeArcade/src/utils/GameBaseConfig.js Web/games/dino-runner-mobile/lib/
  ```

- [ ] **Task 1.3:** Copy 4 PNG sprites to `assets/dino-sprites/`
  ```bash
  cp LifeArcade/public/img/dino-sprites/*.png Web/games/dino-runner-mobile/assets/dino-sprites/
  ```

### Phase 2: Fix Import Paths in Dependencies (10 minutes)

- [ ] **Task 2.1:** Update `lib/PatternRenderer.js`
  - Find: `import { GoLEngine } from '../core/GoLEngine.js'`
  - Replace: `import { GoLEngine } from './GoLEngine.js'`
  - Find: `import { Patterns } from './Patterns.js'` (already correct)

- [ ] **Task 2.2:** Update `lib/SimpleGradientRenderer.js`
  - Check for any relative imports (likely none)

- [ ] **Task 2.3:** Update `lib/ParticleHelpers.js`
  - Check for imports of `GoLEngine` or `GradientPresets`
  - Update paths to `./ModuleName.js`

- [ ] **Task 2.4:** Update `lib/UIHelpers.js`
  - Check for relative imports
  - Update paths if needed

### Phase 3: Create HTML Template (10 minutes)

- [ ] **Task 3.1:** Create `index.html` with:
  - [ ] DOCTYPE, meta tags (viewport, charset)
  - [ ] Title: "Dino Runner - Conway's Game of Life Edition"
  - [ ] p5.js CDN script tag (v1.7.0)
  - [ ] Module script tag for `game.js`
  - [ ] CSS styles:
    - [ ] Global reset (`margin: 0`, `touch-action: none`)
    - [ ] `#game-container` (flex center, 100vw×100vh)
    - [ ] `#score-display` (absolute top-left, Google Blue)
    - [ ] `#touch-hint` (absolute bottom, fade animation)
    - [ ] `#game-over-overlay` (hidden flex, dark backdrop)
    - [ ] `#restart-button` (Google Green, touch-friendly padding)
  - [ ] DOM elements:
    - [ ] `<div id="game-container">`
    - [ ] `<div id="score-display">Score: <span id="score">0</span></div>`
    - [ ] `<div id="touch-hint">Tap to Jump • Hold to Duck</div>`
    - [ ] Game Over overlay with score and restart button

### Phase 4: Adapt Game Logic (45 minutes)

- [ ] **Task 4.1:** Copy `LifeArcade/public/games/dino-runner.js` as base for `game.js`

- [ ] **Task 4.2:** Update all import statements (11 imports)
  - [ ] `/src/core/GoLEngine.js` → `./lib/GoLEngine.js`
  - [ ] `/src/rendering/SimpleGradientRenderer.js` → `./lib/SimpleGradientRenderer.js`
  - [ ] `/src/utils/GradientPresets.js` → `./lib/GradientPresets.js`
  - [ ] (Repeat for all 11 imports)

- [ ] **Task 4.3:** Update CONFIG for mobile base resolution
  - [ ] Change `GAME_DIMENSIONS.BASE_WIDTH` from 1200 → 800
  - [ ] Change `GAME_DIMENSIONS.BASE_HEIGHT` from 1920 → 1280
  - [ ] Keep `ASPECT_RATIO` at 0.625 (10:16 portrait)
  - [ ] Adjust `CONFIG.groundY` proportionally (1920 * 0.6 → 1280 * 0.6 = 768)
  - [ ] Adjust `CONFIG.horizonY` proportionally (groundY - 15)

- [ ] **Task 4.4:** Implement `calculateResponsiveSize()` function (PORTRAIT ONLY)
  - [ ] Calculate based on window.innerWidth only
  - [ ] Always use width-constrained mode (ignore landscape)
  - [ ] Return `{ width: maxWidth, height: maxWidth / ASPECT_RATIO }`

- [ ] **Task 4.5:** Update `setup()` function
  - [ ] Call `calculateResponsiveSize()`
  - [ ] Create canvas with responsive dimensions
  - [ ] Set canvas parent to `'game-container'`
  - [ ] Add touch event listeners (`touchstart`, `touchend`, `{ passive: false }`)
  - [ ] Add mouse event listeners (fallback for desktop)

- [ ] **Task 4.6:** Implement touch control functions
  - [ ] `handleTouchStart(e)` - set `isTouching = true`, record `touchStartTime`
  - [ ] `handleTouchEnd(e)` - set `isTouching = false`
  - [ ] Both must call `e.preventDefault()`

- [ ] **Task 4.7:** Update `updatePlayer()` for touch controls
  - [ ] Add touch-based jump logic (tap < 200ms)
  - [ ] Add touch-based duck logic (hold > 200ms)
  - [ ] Keep existing physics (gravity, ground collision)
  - [ ] Keep animation frame update

- [ ] **Task 4.8:** Update asset paths in `preload()`
  - [ ] `/img/dino-sprites/run_0.png` → `./assets/dino-sprites/run_0.png`
  - [ ] (Repeat for all 4 sprite paths)

- [ ] **Task 4.9:** Integrate DOM score updates in `draw()`
  - [ ] Get `#score` element
  - [ ] Update `textContent` with `state.score`

- [ ] **Task 4.10:** Implement `showGameOver()` function
  - [ ] Show `#game-over-overlay` (`display: 'flex'`)
  - [ ] Update `#final-score-value` with final score

- [ ] **Task 4.11:** Add restart button event listener
  - [ ] Listen for click on `#restart-button`
  - [ ] Hide overlay
  - [ ] Call `initGame()` to reset

- [ ] **Task 4.12:** Implement `windowResized()` handler
  - [ ] Call `calculateResponsiveSize()`
  - [ ] Call `resizeCanvas(width, height)`
  - [ ] Export to `window.windowResized` for p5.js

- [ ] **Task 4.13:** Remove arcade-specific code
  - [ ] Delete `postMessage` to parent window (~line 474)
  - [ ] Delete `score-value` header update (~line 486)
  - [ ] Delete `window.parent === window` check in `keyPressed()` (~line 816)
  - [ ] Keep hitbox debug system (press 'H' still useful)

### Phase 5: Documentation (5 minutes)

- [ ] **Task 5.1:** Create `README.md` with:
  - [ ] Title and description
  - [ ] Play Now link (GitHub Pages URL - placeholder initially)
  - [ ] Controls section (Tap, Hold, H key)
  - [ ] Features list
  - [ ] Tech stack
  - [ ] Development instructions (Python HTTP server)
  - [ ] Credits to LifeArcade

---

## Testing Strategy

### Unit Testing (N/A for this implementation)

**Rationale:** This is a standalone game with copied dependencies. The original LifeArcade has 1,216 passing tests (95.9% coverage) validating the GoL engine and utilities. We trust the copied modules are correct.

**If unit tests were required:**
- Test `calculateResponsiveSize()` with various window dimensions
- Test touch timing logic (< 200ms = jump, > 200ms = duck)
- Mock `millis()` and `createCanvas()` (p5.js functions)

**Not implemented because:**
- Adds complexity (test framework, mocking p5.js globals)
- Original code is already tested in LifeArcade
- Manual testing is faster and sufficient for this scope

### Integration Testing (Manual Browser Testing)

**Primary testing method:** Interactive testing in real browsers

**Test Suite:**

1. **Desktop Chrome (Development baseline)**
   - [ ] Game loads without console errors
   - [ ] Canvas renders at correct size
   - [ ] Mouse click = jump (desktop fallback works)
   - [ ] Mouse hold = duck
   - [ ] Score updates in real-time
   - [ ] Obstacles spawn and move
   - [ ] Parallax background visible
   - [ ] Collision detection works (game over on hit)
   - [ ] Game Over overlay appears
   - [ ] Restart button works
   - [ ] Hitbox debug toggle ('H' key) works
   - [ ] Window resize preserves aspect ratio

2. **Mobile Safari (iOS)**
   - [ ] Touch events work (no iOS scroll interference)
   - [ ] Tap to jump responsive (< 50ms latency)
   - [ ] Hold to duck responsive
   - [ ] 60fps sustained (use Safari Dev Tools → Timeline)
   - [ ] No double-tap zoom
   - [ ] No pinch-zoom
   - [ ] Portrait orientation displays correctly
   - [ ] Score visible and readable
   - [ ] Game Over overlay readable
   - [ ] Restart button tappable (large enough)

3. **Android Chrome**
   - [ ] All iOS Safari tests repeated
   - [ ] Samsung Internet browser (if available)

4. **Tablet Testing (iPad, Android Tablet - Portrait Mode)**
   - [ ] Larger portrait screens handled correctly
   - [ ] 10:16 aspect ratio preserved
   - [ ] Touch controls still work (not too small)
   - [ ] Note: Game is portrait-only, landscape not supported

### End-to-End Testing (Manual Gameplay)

**Play-through test:**
1. Open game URL
2. Wait for sprites to load (check console for load messages)
3. Tap screen → Dino jumps
4. Hold screen → Dino ducks
5. Play until first obstacle collision
6. Verify Game Over screen appears
7. Check final score matches gameplay score
8. Tap restart button
9. Verify game resets correctly (score = 0, obstacles cleared)
10. Play until score > 100 to test difficulty increase
11. Rotate device (if mobile) → verify game keeps portrait aspect (ignores landscape)

**Performance test:**
1. Open Chrome DevTools → Performance tab
2. Start recording
3. Play for 30 seconds
4. Stop recording
5. Check FPS graph → should be 60fps sustained
6. Check frame time → should be < 16.67ms per frame

### Edge Cases for Testing

**Responsive behavior (PORTRAIT ONLY):**
- [ ] Very small screens (320px width - iPhone SE)
- [ ] Medium screens (375px - 428px - modern iPhones)
- [ ] Large screens (768px - iPads in portrait)
- [ ] Desktop portrait windows (narrow browser window)
- [ ] Note: Landscape rotation NOT supported (game stays portrait aspect)

**Touch timing edge cases:**
- [ ] Rapid tap-tap-tap (should jump 3 times if grounded)
- [ ] Hold exactly 200ms (boundary case for duck threshold)
- [ ] Hold while in air (should not duck until grounded)
- [ ] Multi-touch (two fingers) - should treat as single touch
- [ ] Touch during Game Over (should not affect game state)

**Asset loading:**
- [ ] Slow network (throttle to 3G in DevTools)
- [ ] Missing sprite file (404) - check graceful degradation
- [ ] p5.js CDN failure - game should fail gracefully

**Game state:**
- [ ] Multiple restarts in a row (memory leaks?)
- [ ] Restart during DYING phase (particles still animating)
- [ ] Window resize during gameplay (portrait aspect maintained)
- [ ] Device rotation (game keeps portrait aspect, doesn't break)
- [ ] Browser tab hidden/shown (should pause/resume correctly)

**GoL authenticity edge cases:**
- [ ] Verify obstacles use correct patterns (BLOCK, BEEHIVE, LOAF, etc.)
- [ ] Verify parallax clouds are still life patterns (don't evolve)
- [ ] Verify LWSS pterodactyls are frozen at correct phase
- [ ] Verify explosion particles use radial density seeding

---

## Acceptance Criteria

### Functional Requirements

- [x] **AC-1:** Game runs in web browser without build step
  - User can double-click `index.html` OR use simple HTTP server
  - No `npm install` required

- [x] **AC-2:** Touch controls work on mobile devices
  - Quick tap (< 200ms) makes dino jump
  - Hold (> 200ms) makes dino duck
  - Release stops ducking

- [x] **AC-3:** Mouse controls work on desktop
  - Click = jump
  - Hold = duck
  - Allows testing without mobile device

- [x] **AC-4:** Game is responsive across devices
  - Displays in portrait orientation only (vertical)
  - Preserves 10:16 aspect ratio (portrait)
  - Works on screen widths 320px - 800px (mobile portrait)

- [x] **AC-5:** Score displays and updates in real-time
  - Score visible in top-left corner
  - Updates every frame (or every 6 frames as in original)

- [x] **AC-6:** Game Over screen appears on collision
  - Shows final score
  - Shows restart button
  - Restart button resets game to initial state

- [x] **AC-7:** All Game of Life aesthetics preserved
  - Player uses PNG sprites (approved deviation)
  - Obstacles use GoL patterns (BLOCK, BEEHIVE, LOAF, BOAT, TUB, BLINKER, TOAD, BEACON)
  - Flying obstacles use LWSS spaceship
  - Parallax background uses still life patterns
  - Explosions use radial density seeding
  - Google brand colors maintained (#4285F4, #EA4335, #34A853, #FBBC04)

### Performance Requirements

- [x] **AC-8:** 60fps sustained on iPhone 12 or equivalent
  - No frame drops during normal gameplay
  - Chrome DevTools Performance tab shows < 16.67ms frame time

- [x] **AC-9:** Touch latency < 50ms
  - Tap-to-jump feels immediate
  - No perceivable delay between touch and action

- [x] **AC-10:** Total bundle size < 200 KB
  - JavaScript + HTML + CSS < 150 KB
  - Assets (sprites) < 50 KB
  - Loads in < 1 second on 4G connection

### Code Quality Requirements

- [x] **AC-11:** No console errors or warnings
  - Clean browser console on game load
  - Clean console during gameplay
  - Clean console on Game Over and restart

- [x] **AC-12:** All assets load successfully
  - 4 PNG sprites load without 404 errors
  - p5.js CDN loads successfully
  - Fallback behavior if CDN fails (optional enhancement)

- [x] **AC-13:** Game is deployable to GitHub Pages
  - Works with relative paths (no absolute `/` paths)
  - No server-side dependencies
  - No build artifacts required in repo

### Accessibility Requirements

- [x] **AC-14:** Mobile browsers don't interfere with game
  - iOS Safari doesn't scroll page on touch
  - No double-tap zoom
  - No pinch-zoom during gameplay
  - No context menus on long-press

- [x] **AC-15:** Touch targets are large enough
  - Entire canvas is touch target (easy to tap)
  - Restart button is at least 44×44px (iOS guideline)

---

## Validation Commands

### Step 1: Local Development Testing

```bash
# Navigate to project directory
cd Web/games/dino-runner-mobile

# Start simple HTTP server (Python 3)
python -m http.server 8000

# OR use Python 2
python -m SimpleHTTPServer 8000

# Open browser to http://localhost:8000
```

**Manual checks:**
- [ ] No 404 errors in Network tab
- [ ] No JavaScript errors in Console tab
- [ ] Canvas appears and is responsive
- [ ] Game starts and is playable
- [ ] All sprites load (check console for `loaded:` messages)

### Step 2: Browser DevTools Validation

**Chrome DevTools:**
```javascript
// Open Console tab, run:
console.log('p5 version:', p5.VERSION)  // Should show 1.7.0
console.log('Canvas size:', width, height)  // Should show responsive dimensions
console.log('Frame rate:', frameRate())  // Should show ~60
```

**Performance validation:**
1. Open DevTools → Performance tab
2. Click Record
3. Play game for 30 seconds
4. Stop recording
5. Check FPS in graph → should be solid green bar at 60fps
6. Check Main thread activity → should show < 16ms per frame

### Step 3: Mobile Device Testing (iOS)

**Safari Web Inspector (Mac + iPhone connected via cable):**
1. Enable Safari → Develop menu on Mac
2. Connect iPhone via USB
3. Open game on iPhone Safari
4. Mac Safari → Develop → [Your iPhone] → localhost:8000
5. Console tab should show no errors
6. Timelines tab → JavaScript & Events → Record gameplay
7. Verify 60fps in timeline graph

**iOS Simulator (Xcode):**
```bash
# Open iOS Simulator
open -a Simulator

# Navigate Safari to http://localhost:8000 (from Mac's server)
# OR use ngrok for HTTPS testing:
ngrok http 8000
# Then visit ngrok URL on simulator
```

### Step 4: Android Device Testing

**Chrome Remote Debugging:**
1. Enable Developer Options on Android device
2. Enable USB Debugging
3. Connect via USB to computer
4. Chrome on computer → `chrome://inspect`
5. Find device → Inspect
6. Console tab should show no errors
7. Performance tab → Record gameplay → Verify 60fps

### Step 5: Git Validation (Before Deploy)

```bash
# Ensure no uncommitted changes
git status

# Verify all files are tracked
git ls-files Web/games/dino-runner-mobile/

# Expected output:
# Web/games/dino-runner-mobile/index.html
# Web/games/dino-runner-mobile/game.js
# Web/games/dino-runner-mobile/README.md
# Web/games/dino-runner-mobile/lib/GoLEngine.js
# ... (11 lib files)
# Web/games/dino-runner-mobile/assets/dino-sprites/run_0.png
# ... (4 sprite files)
```

### Step 6: GitHub Pages Deploy Validation

```bash
# Commit and push
git add Web/games/dino-runner-mobile
git commit -m "Add mobile dino runner game (self-contained)"
git push origin main

# Configure GitHub Pages (if not already):
# 1. Go to repo Settings → Pages
# 2. Source: Deploy from branch main
# 3. Folder: /Web (or / if Web is at root)
# 4. Save

# Wait 1-2 minutes for deployment
# Visit: https://brunobarran.github.io/SGx_GoogleEmployment/games/dino-runner-mobile/
```

**Production validation:**
- [ ] Open GitHub Pages URL on desktop Chrome
- [ ] Open GitHub Pages URL on mobile Safari (iPhone)
- [ ] Open GitHub Pages URL on mobile Chrome (Android)
- [ ] Test all acceptance criteria on production URL
- [ ] Share URL with colleague/friend for third-party testing

### Step 7: Regression Testing (Zero Regressions)

**Check LifeArcade is unaffected:**
```bash
cd LifeArcade
npm run dev
# Visit http://localhost:5174/installation.html
```

**Verify:**
- [ ] LifeArcade dev server still works
- [ ] No files modified in `LifeArcade/src/` or `LifeArcade/public/`
- [ ] Dino runner in arcade installation still works (keyboard controls)
- [ ] No broken imports or missing files

**Git diff should show:**
```bash
git diff main --name-only

# Expected (only new files):
# Web/games/dino-runner-mobile/index.html
# Web/games/dino-runner-mobile/game.js
# Web/games/dino-runner-mobile/README.md
# Web/games/dino-runner-mobile/lib/...
# Web/games/dino-runner-mobile/assets/...

# Should NOT show:
# LifeArcade/src/...  ← NO CHANGES
# LifeArcade/public/...  ← NO CHANGES
```

### Step 8: Final Confidence Check

**Complete checklist (100% confidence):**

- [ ] **Build:** No build step required ✓
- [ ] **Dependencies:** No npm packages needed ✓
- [ ] **Assets:** All 4 sprites load without errors ✓
- [ ] **Controls:** Touch and mouse both work ✓
- [ ] **Performance:** 60fps on iPhone 12+ ✓
- [ ] **Responsive:** Portrait mode works on 320px to 800px width ✓
- [ ] **Orientation:** Portrait only (landscape ignored) ✓
- [ ] **Game Over:** Overlay appears and restart works ✓
- [ ] **Score:** Updates in real-time ✓
- [ ] **GoL Authenticity:** All patterns preserved ✓
- [ ] **GitHub Pages:** Deployed and accessible ✓
- [ ] **Regressions:** Zero changes to LifeArcade ✓
- [ ] **Documentation:** README.md complete ✓

**If all ✓ above:** Feature is 100% complete with zero regressions.

---

## Additional Notes

### KISS Principle Validation

**Complexity metrics (should be LOW):**
- Dependencies: 0 npm packages ✓
- Build steps: 0 ✓
- Configuration files: 0 (no package.json, vite.config.js, etc.) ✓
- Lines of configuration: 0 ✓
- Deploy steps: 1 (git push) ✓

**Developer experience (should be SIMPLE):**
- Setup time: < 5 minutes (copy files)
- Edit-test cycle: F5 refresh (instant)
- Deploy time: < 2 minutes (git push + GitHub Actions)

### Future Enhancements (Out of Scope)

**NOT included in this implementation:**
- Progressive Web App (PWA) with service worker
- Offline mode
- Leaderboard (localStorage or backend)
- Social sharing (Twitter, Facebook)
- Sound effects
- Vibration feedback
- Swipe gestures (up = jump, down = duck)
- Difficulty selector (easy, medium, hard)
- Multiple game modes

**These can be added later as separate features.**

### Maintenance Strategy

**If LifeArcade updates GoL modules:**
1. Check `LifeArcade/CHANGELOG.md` (if exists)
2. Identify changed files
3. Copy updated files to `Web/games/dino-runner-mobile/lib/`
4. Test game locally
5. Commit with message: `"Sync lib/ from LifeArcade v2.x.x"`

**Expected update frequency:** < 1 per year (GoL code is stable)

---

## Completion Criteria

**This feature is DONE when:**

1. ✅ All 18 files exist in `Web/games/dino-runner-mobile/`
2. ✅ Game loads in browser without build step
3. ✅ Touch controls work on iOS and Android
4. ✅ Game runs at 60fps on iPhone 12+
5. ✅ All 15 acceptance criteria pass
6. ✅ Game is deployed to GitHub Pages
7. ✅ Zero regressions in LifeArcade (git diff confirms)
8. ✅ README.md documents usage and credits

**Sign-off validation:**
```bash
# Final command to verify everything
cd Web/games/dino-runner-mobile
ls -la  # Should show index.html, game.js, lib/, assets/, README.md
python -m http.server 8000  # Test locally
# Play game for 2 minutes → All features work → DONE ✓
```

---

**End of Implementation Prompt**
