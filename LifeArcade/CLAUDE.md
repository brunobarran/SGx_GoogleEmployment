# LifeArcade - Physical Installation Development Rules

## 1. Core Principles

**AUTHENTICITY OVER CONVENIENCE (NON-NEGOTIABLE)**
- Cells must be generated procedurally (no static sprites)
- Background MUST be 100% Pure GoL (B3/S23 rules)
- Use Modified GoL only when gameplay requires it
- Document all deviations from pure B3/S23

**KISS - KEEP IT SIMPLE, STUPID**
- Prefer simple, readable solutions over clever abstractions
- Mac M4 is overpowered - don't over-optimize
- Focus on visual beauty over technical complexity

**YAGNI - YOU AREN'T GONNA NEED IT**
- No features until explicitly needed
- This is an **art installation first, technical demo second**

**ARCADE-FIRST DESIGN**
- Single life only (no continues)
- Keyboard controls (arcade encoder maps to keyboard)
- Full-screen kiosk mode on Mac Mini M4
- **Portrait orientation: 1200×1920 (vertical display)**
- 60fps non-negotiable at 1200×1920

---

## 2. Tech Stack

### Core
- **p5.js 1.7.0** in GLOBAL mode (not instance mode)
- **Conway's Game of Life** (B3/S23 algorithm)
- **Vite 7.2+** for dev server with HMR
- **Vitest 3.x** for testing (96.4% coverage target)

### Frontend
- Vanilla JavaScript (ES6+)
- No frameworks except p5.js
- SPA architecture (Hybrid: SPA + iframes)
- localStorage for persistence (leaderboard)

### Rendering
- SimpleGradientRenderer (2D Perlin noise animated gradients)
- Cell-based rendering (batch beginShape/endShape)

### Google Brand Colors

**Official Google Colors (MUST use these exact values):**

```javascript
export const GOOGLE_COLORS = {
  BLUE: [66, 142, 244],    // Google Blue #428EF4
  RED: [255, 81, 69],      // Google Red #FF5145
  GREEN: [56, 168, 82],    // Google Green #38A852
  YELLOW: [255, 187, 0],   // Google Yellow #FFBB00
  WHITE: [255, 255, 255]   // White #FFFFFF
}
```

**Usage Guidelines:**
- Background: WHITE (#FFFFFF)
- Primary accent: BLUE (#428EF4)
- Error/Alert: RED (#FF5145)
- Success/Confirm: GREEN (#38A852)
- Warning/Highlight: YELLOW (#FFBB00)

**Defined in:** `src/utils/GradientPresets.js`

### Theme System (Day/Night Mode)

**Implemented:** 2025-11-24
**Optimized:** 2025-11-24

The installation supports **instantaneous theme switching** between day and night modes with full iframe game support.

#### Architecture

**Core Components:**
- **CSS Variables**: All colors defined as CSS custom properties in `:root[data-theme="day"]` and `:root[data-theme="night"]`
- **ThemeManager**: Central state management, observer pattern for extensibility
- **ThemeConstants**: Single source of truth for all theme colors (no hardcoded values)
- **ThemeReceiver**: Shared utility for p5.js games to receive theme updates
- **InputManager Integration**: Keys 1-4 trigger day mode, keys 5-8 trigger night mode
- **Dynamic Video Backgrounds**: Day mode uses `idle.mp4`/`loop.mp4`, night mode uses `idle_dark.mp4`/`loop_dark.mp4`

**Communication Flow:**
```
User presses key 1-8
    ↓
InputManager.getThemeFromKey()
    ↓
ThemeManager.setTheme()
    ↓
    ├─→ applyTheme() (CSS data-theme attribute)
    ├─→ notifyObservers() (video system, etc.)
    └─→ broadcastToIframes() (postMessage to games)
         ↓
    game-wrapper.html intercepts & applies theme
         ↓
    ThemeReceiver in game updates CONFIG colors
```

**Iframe Game Support:**
- **Initial theme via URL**: `?theme=night` prevents white flash on load
- **Keyboard interceptor**: game-wrapper.html captures Escape + keys 1-8 in capture phase
- **Bidirectional sync**: Games can change theme, parent syncs automatically
- **Zero flash**: Theme applied before first p5.js render (0ms)

#### Key Design Decisions

**KISS Principle:**
- ✅ Instantaneous switching (no transitions)
- ✅ No persistence (resets on reload - by design)
- ✅ Unified applyTheme() function (DRY)
- ✅ Guard to prevent redundant applications

**YAGNI Principle:**
- ✅ Single source of truth (ThemeConstants.js)
- ✅ Conditional debug logging (Logger.js)
- ✅ Removed redundant postMessage calls

**Performance:**
- 0ms white flash (theme in URL)
- Guard prevents redundant DOM updates
- Debug logs only in development mode

#### CSS Variables

```css
:root[data-theme="day"] {
  --bg-primary: #FFFFFF;
  --bg-secondary: #F8F9FA;
  --bg-card: #FFFFFF;
  --text-primary: #202124;
  --text-secondary: #7D7D7D;
  --text-tertiary: #5F6368;
  --highlight-blue: var(--google-blue);
  --highlight-red: var(--google-red);
  --highlight-green: var(--google-green);
  --highlight-yellow: var(--google-yellow);
  --border-color: #DADCE0;
  --video-overlay: rgba(255, 255, 255, 0.3);
  --code-bg: #33333E;
  --code-text: #E8EAED;
}

:root[data-theme="night"] {
  --bg-primary: #1A1A1A;
  --bg-secondary: #2D2D2D;
  --bg-card: #242424;
  --text-primary: #E8EAED;
  --text-secondary: #9AA0A6;
  --text-tertiary: #7B8087;
  --highlight-blue: var(--google-blue);
  --highlight-red: var(--google-red);
  --highlight-green: var(--google-green);
  --highlight-yellow: var(--google-yellow);
  --border-color: #3C4043;
  --video-overlay: rgba(0, 0, 0, 0.5);
  --code-bg: #FFFFFF;
  --code-text: #202124;
}
```

#### Theme Constants

**File:** `src/utils/ThemeConstants.js`

```javascript
export const THEME_COLORS = {
  DAY: {
    bg: '#FFFFFF',
    text: '#202124',
    textRgb: [95, 99, 104]  // For p5.js fill()
  },
  NIGHT: {
    bg: '#1A1A1A',
    text: '#E8EAED',
    textRgb: [232, 234, 237]  // For p5.js fill()
  }
}

export function getBackgroundColor(theme) { /* ... */ }
export function getTextColor(theme) { /* ... */ }
export function getTextColorRgb(theme) { /* ... */ }
```

**Usage in games:**
```javascript
import { initThemeReceiver, getBackgroundColor, getTextColor } from '/src/utils/ThemeReceiver.js'

function setup() {
  // Theme applied automatically from URL before first draw
  initThemeReceiver((theme) => {
    CONFIG.ui.backgroundColor = getBackgroundColor(theme)
    CONFIG.ui.score.color = getTextColor(theme)
  })
}
```

#### Debug Logging

**File:** `src/utils/Logger.js`

Conditional logging based on environment:
- `debugLog()` - Only in development (`import.meta.env.DEV`)
- `debugWarn()` - Only in development
- `debugError()` - Always (errors are critical)
- `isDebugEnabled()` - Check debug status

**Manual control:**
```javascript
window.DEBUG = true  // Force enable logs
window.DEBUG = false // Force disable logs
```

#### Video Background Responsive

**Implemented:** 2025-11-24

Videos de fondo aplican las mismas dimensiones responsive que las pantallas:

**Características:**
- **Container dimensions**: `getResponsiveDimensions()` from `ScreenHelper.js`
- **Aspect ratio**: 10:16 (idéntico a screens, portrait 1200×1920)
- **Object fit**: `contain` (respeta proporción, no estira como `cover`)
- **Centrado**: `position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%)`
- **Responsive**: Se adapta automáticamente al viewport (landscape y portrait)

**Implementación:**
```javascript
// installation.html - Función updateVideoContainerSize()
function updateVideoContainerSize() {
  const { containerWidth, containerHeight } = getResponsiveDimensions()
  const videoContainer = document.getElementById('video-container')

  videoContainer.style.width = `${containerWidth}px`
  videoContainer.style.height = `${containerHeight}px`
  videoContainer.style.maxWidth = '100vw'
  videoContainer.style.maxHeight = '100vh'
  videoContainer.style.aspectRatio = '10 / 16'
}
```

**Resize handling:**
- Event listener `window.resize` llama `updateVideoContainerSize()`
- Videos se redimensionan automáticamente en tiempo real
- Inicialización al cargar la página

**Cambios vs versión anterior:**
- ❌ **Antes**: `width: 100%; height: 100%; object-fit: cover` (estiraba al viewport completo)
- ✅ **Ahora**: Container responsive + `object-fit: contain` (respeta aspect ratio y dimensiones de pantallas)

**Beneficios:**
- ✅ Consistencia visual con sistema de pantallas
- ✅ Respeta principio KISS (usa misma lógica que screens)
- ✅ Sin duplicación de código (reutiliza `ScreenHelper.js`)
- ✅ Compatible con temas (day/night video switching)

#### Files

**Core:**
- `src/installation/ThemeManager.js` - Theme state, observer pattern, broadcasting
- `src/installation/ScreenHelper.js` - Responsive dimensions (shared by screens AND videos)
- `src/utils/ThemeConstants.js` - Color constants (single source of truth)
- `src/utils/ThemeReceiver.js` - Shared utility for games
- `src/utils/Logger.js` - Conditional debug logging
- `src/installation/InputManager.js` - Key detection (getThemeFromKey)

**UI:**
- `installation.html` - CSS variables, theme connection, video switching, video responsive container
- `public/games/game-wrapper.html` - Keyboard interceptor, theme application
- All 9 screen files - Updated to use CSS variables
- All 4 games - Theme support via ThemeReceiver

**Tests:**
- `tests/installation/test_ThemeManager.js` - 14/14 passing
- `tests/installation/test_InputManager.js` - 45/45 passing

#### Optimizations Applied (2025-11-24)

1. **Unified applyTheme()** - Eliminated duplicate function, added guard
2. **ThemeConstants.js** - Single source of truth for colors
3. **Removed redundant postMessage** - Theme already applied via URL
4. **Removed hardcoded CSS** - Background set by JavaScript only
5. **Conditional logging** - Debug logs only in development

**Result:** Clean, maintainable, optimized code (9.5/10 quality score)

---

## 3. Project Architecture

```
LifeArcade/
├── src/
│   ├── core/             # GoLEngine (B3/S23)
│   ├── rendering/        # SimpleGradientRenderer, GoLBackground
│   ├── utils/            # Helpers, collision, patterns
│   │   ├── ThemeConstants.js    # Theme color definitions (single source of truth)
│   │   ├── ThemeReceiver.js     # Theme receiver for p5.js games
│   │   ├── Logger.js            # Conditional debug logging
│   │   └── ...                  # Other utilities
│   ├── validation/       # Runtime validators
│   ├── debug/            # Development debugging tools
│   │   ├── HitboxDebug.js       # Hitbox visualization (press H)
│   │   └── README_HitboxDebug.md # Hitbox debug documentation
│   ├── installation/     # Installation system managers
│   │   ├── AppState.js                # State machine (8 screens)
│   │   ├── GameRegistry.js            # Full game catalog (~500KB with texts)
│   │   ├── GameRegistryMetadata.js    # Lightweight metadata only (~2KB)
│   │   ├── StorageManager.js          # localStorage leaderboards
│   │   ├── InputManager.js            # Keyboard + arcade controls
│   │   ├── ThemeManager.js            # Theme state management
│   │   └── IframeComm.js              # postMessage game communication
│   └── screens/          # 8-screen installation flow
│       ├── IdleScreen.js           # Screen 1: GoL attract
│       ├── WelcomeScreen.js        # Screen 2: Title screen
│       ├── GalleryScreen.js        # Screen 3: Game selection
│       ├── CodeAnimationScreen.js  # Screen 4: Code typewriter
│       ├── GameScreen.js           # Screen 5: iframe container
│       ├── ScoreEntryScreen.js     # Screen 6: 3-letter input
│       ├── LeaderboardScreen.js    # Screen 7: Top 10 display
│       └── QRCodeScreen.js         # Screen 8: QR + URL
├── games/                # 4 games implemented (portrait 1200×1920)
│   ├── space-invaders.js      # ✅ Complete
│   ├── dino-runner.js         # ✅ Complete (with hitbox debug)
│   ├── breakout.js            # ✅ Complete
│   ├── flappy-bird.js         # ✅ Complete
│   └── game-wrapper.html      # Universal iframe wrapper
├── tests/                # Mirror src/ structure
│   ├── core/
│   ├── utils/
│   ├── validation/
│   ├── debug/            # Debug tool tests
│   │   └── test_HitboxDebug.js  # Hitbox debug tests (10/10 ✓)
│   └── installation/
├── installation.html     # Main SPA entry point
└── archive/              # Archived obsolete files
    ├── debug-system/     # Debug UI (archived 2025-11-19)
    ├── old-versions/     # Old HTML files (gallery.html, games.html, index.html)
    ├── planning/         # Installation planning docs (implemented)
    └── reports/          # Old status reports
```

### Screen Flow (8 Screens)
```
1. Idle → 2. Welcome → 3. Gallery → 4. Code Animation → 5. Game (iframe) → 6. Score Entry → 7. Leaderboard → 8. QR Code
   ↑__________________________________________________________________________________________________|
                                    (auto-loop on timeout)
```

**Implementation Status:** ✅ All 8 screens fully implemented

**Communication:**
- Screens communicate via AppState (Observer pattern)
- Games send `postMessage` on Game Over
- IframeComm handles game ↔ installation communication
- StorageManager persists leaderboards in localStorage

### Game Registry (Central Game Catalog)

**Files:**
- `src/installation/GameRegistry.js` (Full version ~500KB)
- `src/installation/GameRegistryMetadata.js` (Lightweight ~2KB)
**Tests:** `tests/installation/test_GameRegistry.js` (26/26 passing ✅)

**Purpose:** Single Source of Truth for all available games in the installation.

**Architecture Pattern (Dual Registry):**

GameRegistry and GameRegistryMetadata follow a **lightweight/full pattern** to optimize bundle size:

```
┌─────────────────────────────────────────────────────────────┐
│                    GameRegistryMetadata.js                  │
│                     (Lightweight ~2KB)                      │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ GAMES_METADATA = [                                    │ │
│  │   { id, name, path, key, promptPath, thinkingPath }  │ │
│  │ ]                                                     │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ▲
                              │ imports & extends
                              │
┌─────────────────────────────────────────────────────────────┐
│                      GameRegistry.js                        │
│                   (Full version ~500KB)                     │
│  ┌───────────────────────────────────────────────────────┐ │
│  │ import { GAMES_METADATA } from './GameRegistryMetadata'│ │
│  │ import promptTexts from '*.txt?raw'  // ~500KB        │ │
│  │                                                        │ │
│  │ GAMES = GAMES_METADATA.map(meta => ({                │ │
│  │   ...meta,                                            │ │
│  │   prompt: TEXT_CONTENT[meta.id].prompt,              │ │
│  │   thinking: TEXT_CONTENT[meta.id].thinking           │ │
│  │ }))                                                   │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

**Usage Guidelines:**

| Component | Uses | Reason |
|-----------|------|--------|
| **Screens** (Gallery, CodeAnimation, etc.) | `GameRegistry.js` | Needs full prompt/thinking texts |
| **game-wrapper.html** | `GameRegistryMetadata.js` | Only needs game title/paths |
| **Tests** | Both | Validate consistency |

**Benefits:**
- ✅ Avoids loading ~500KB of text in iframes unnecessarily
- ✅ Single source of truth (GameRegistry extends GameRegistryMetadata)
- ✅ Automatic consistency (metadata changes propagate to both)

**Structure:**
```javascript
export const GAMES = [
  {
    id: 'space-invaders',        // Unique identifier (matches game file)
    name: 'Cellfront Command',   // Official display name (used everywhere)
    prompt: '...',               // AI creation prompt (Gallery carousel)
    thinking: '...',             // Thinking process text (Code animation)
    path: 'games/game-wrapper.html?game=space-invaders',  // iframe path
    key: '1'                     // Keyboard shortcut
  },
  // ... 3 more games
]
```

**Game Assets Location:**
```
public/games/
├── space-invaders.js
├── space-invaders-prompt.txt       # Gallery screen content
├── space-invaders-thinking.txt     # Code animation content
├── dino-runner.js
├── dino-runner-prompt.txt
├── dino-runner-thinking.txt
├── breakout.js
├── breakout-prompt.txt
├── breakout-thinking.txt
├── flappy-bird.js
├── flappy-bird-prompt.txt
├── flappy-bird-thinking.txt
└── game-wrapper.html               # Universal iframe wrapper (title mapping)
```

**Utility Functions:**

1. **`getGameById(id)`** - Retrieve game object by ID
   ```javascript
   const game = getGameById('space-invaders')
   console.log(game.name)     // 'Cellfront Command'
   console.log(game.thinking) // Full thinking text
   ```

2. **`validateGame(game)`** - Validate game object structure
   ```javascript
   if (!validateGame(game)) {
     console.error('Invalid game')
     appState.reset()
     return
   }
   ```

**Usage Examples:**

```javascript
// Import in screens
import { GAMES, getGameById, validateGame } from '../installation/GameRegistry.js'

// GalleryScreen - Display all games
GAMES.forEach((game, index) => {
  createCard(game, index)
})

// CodeAnimationScreen - Get thinking text
const gameData = getGameById(selectedGame.id)
this.targetText = gameData.thinking

// GameScreen, LeaderboardScreen, ScoreEntryScreen - Validate
const game = this.appState.getState().selectedGame
if (!validateGame(game)) {
  this.appState.reset()
  return
}
```

**Related Screens:**
- **GalleryScreen** - Uses `GAMES` array and `prompt` field
- **CodeAnimationScreen** - Uses `thinking` field via `getGameById()`
- **IdleLeaderboardShowcaseScreen** - Uses `GAMES` for random selection
- **GameScreen, LeaderboardScreen, ScoreEntryScreen** - Use `validateGame()` for safety
- **game-wrapper.html** - `GAME_TITLES` mapping must match `name` field

**Benefits:**
- ✅ Single location to add/modify games
- ✅ Consistent naming across all screens
- ✅ Centralized validation
- ✅ Type-safe structure (JSDoc typedefs)

**To Add a 5th Game:**
1. Add game files: `public/games/new-game.js`, `new-game-prompt.txt`, `new-game-thinking.txt`
2. Add entry to `GAMES` array in `GameRegistry.js`
3. Update `GAME_TITLES` in `game-wrapper.html`
4. Done! (all screens update automatically)

### Portrait Display Specifications

**Resolution:** 1200×1920 (vertical/portrait orientation)

**Aspect Ratio:** 5:8 (0.625)

**Design Implications:**
- Canvas size: `createCanvas(1200, 1920)`
- GoL background grid: 40 cols × 64 rows (2,560 cells) for ~30px cell size
- Gallery grid: 2 columns × 4 rows (better for vertical)
- UI layouts: Stack vertically, more scrolling room
- Font sizes: Can be larger due to more vertical space
- Code animation: More lines visible simultaneously

**Example Canvas Setup:**
```javascript
function setup() {
  createCanvas(1200, 1920)  // Portrait
  frameRate(60)
}
```

---

## 4. Code Style

### JavaScript/p5.js Conventions

**Naming:**
```javascript
// Classes: PascalCase
class GoLEngine { }
class SimpleGradientRenderer { }

// Constants: SCREAMING_SNAKE_CASE
const CELL_SIZE = 10
const UPDATE_RATE_FPS = 12

// Variables/functions: camelCase
let currentGeneration = 0
function countLiveNeighbors(grid, x, y) { }
```

**p5.js GLOBAL MODE (Critical):**
```javascript
// ✅ CORRECT (what we use)
function setup() {
  createCanvas(800, 600)    // No 'this.'
  fill(255, 0, 0)           // No 'this.'
}

function draw() {
  background(0)             // No 'this.'
  rect(10, 10, 50, 50)      // No 'this.'
}

// ❌ WRONG (instance mode - do NOT use)
function setup() {
  this.createCanvas(800, 600)  // NO!
  this.fill(255, 0, 0)         // NO!
}
```

**Helper Functions (NO 'this' parameter):**
```javascript
// ✅ CORRECT
renderGameUI(CONFIG, state, controls)
renderParticles(particles, maskedRenderer)

// ❌ WRONG
renderGameUI(this, CONFIG, state, controls)
renderParticles(particles, maskedRenderer, this)
```

**JSDoc for Public APIs:**
```javascript
/**
 * Apply Conway's Game of Life B3/S23 rules.
 *
 * @param {number[][]} current - Current generation grid
 * @param {number[][]} next - Next generation grid (modified in place)
 * @returns {void}
 *
 * @example
 * const current = [[0,1,0], [0,1,0], [0,1,0]]  // Blinker
 * const next = [[0,0,0], [0,0,0], [0,0,0]]
 * applyGoLRules(current, next)
 * // next becomes [[0,0,0], [1,1,1], [0,0,0]]
 */
function applyGoLRules(current, next) {
  // Implementation
}
```

---

## 5. Conway's Game of Life Rules (B3/S23)

### Algorithm (CRITICAL - Must Follow Exactly)

```javascript
function applyGoLRules(currentGrid, nextGrid) {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const neighbors = countLiveNeighbors(currentGrid, x, y)
      const currentState = currentGrid[x][y]

      if (currentState === ALIVE) {
        // Survival: 2 or 3 neighbors → survives
        // Death: < 2 (underpopulation) or > 3 (overpopulation)
        nextGrid[x][y] = (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
      } else {
        // Birth: exactly 3 neighbors → becomes alive
        nextGrid[x][y] = (neighbors === 3) ? ALIVE : DEAD
      }
    }
  }
}
```

### Double Buffer Pattern (MANDATORY)

```javascript
// ✅ CORRECT - Always use two grids
class GoLEngine {
  constructor() {
    this.current = create2DArray(cols, rows)
    this.next = create2DArray(cols, rows)
  }

  update() {
    applyGoLRules(this.current, this.next)
    [this.current, this.next] = [this.next, this.current]  // Swap
  }
}

// ❌ WRONG - Never modify while reading
class BadGoLEngine {
  update() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        this.grid[x][y] = this.calculateNextState(x, y)  // BUG!
      }
    }
  }
}
```

### Authenticity Tiers

```javascript
const AUTHENTICITY_STRATEGY = {
  // TIER 1: Pure GoL (100% authentic B3/S23)
  background: 'PureGoL',      // Showcase, doesn't affect gameplay
  explosions: 'PureGoL',      // Visual effect, wow factor
  powerups: 'PureGoL',        // Oscillators are naturally stable

  // TIER 2: Modified GoL (80% authentic)
  player: 'ModifiedGoL',      // Needs lifeForce for stability
  enemies_large: 'ModifiedGoL', // Visually interesting, stable

  // TIER 3: Visual Only (0% authentic)
  bullets: 'VisualOnly',      // Must be 100% predictable
  enemies_small: 'VisualOnly' // Too small for meaningful GoL
}
```

**Principle:** Use Pure GoL wherever it doesn't harm gameplay.

---

## 6. Performance Targets

**Target:** 60fps on Mac M4 at 1200×1920 (portrait/vertical)

**Budget per frame (16.67ms):**
- GoL simulations: < 1ms (background + sprites)
- Game logic: < 5ms (physics, collision, AI)
- Rendering: < 10ms (draw calls, particles)
- Buffer: 0.67ms (safety margin)

**Optimization Rules:**

1. **Keep grids small:**
```javascript
// ✅ GOOD
const background = new GoLEngine(40, 64)   // 2,560 cells (portrait: 1200×1920)
const sprite = new GoLEngine(20, 20)       // 400 cells

// ❌ AVOID
const background = new GoLEngine(200, 150) // 30,000 cells (too much)
```

2. **Variable update rates:**
```javascript
background.updateRate = 10  // fps (every 6 frames at 60fps)
player.updateRate = 12      // fps (every 5 frames)
explosion.updateRate = 30   // fps (every 2 frames)
```

3. **Batch rendering:**
```javascript
// ✅ GOOD - Single beginShape/endShape
beginShape(QUADS)
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    if (grid[x][y] === ALIVE) {
      vertex(x * cellSize, y * cellSize)
      // ... other vertices
    }
  }
}
endShape()

// ❌ AVOID - Individual rect calls
for (let x = 0; x < cols; x++) {
  for (let y = 0; y < rows; y++) {
    rect(x * cellSize, y * cellSize, cellSize, cellSize)  // Slow!
  }
}
```

---

## 7. Arcade Screen System

### Architecture Principles

**Type:** Hybrid SPA (Single Page Application + iframes)

**Container:** `installation.html` - SPA managing navigation and state
**Games:** Load in `<iframe>` - Isolated execution environment

**Benefits:**
- Smooth transitions (no page reloads)
- Games remain isolated (no modification needed)
- Clear separation of concerns

### Screen Flow

**6-Screen Installation Flow:**
```
1. Attract → 2. Gallery → 3. Code Animation → 4. Game → 5. Score Entry → 6. Leaderboard
     ↑___________________________________________________________________________|
                            (auto-loop on timeout)
```

**Navigation Principles:**
- State-driven screen transitions
- Keyboard-only controls (arcade encoder compatibility)
- Smooth CSS transitions between screens
- Auto-timeouts to prevent stuck states

### Communication Patterns

**iframe ↔ Parent Communication (postMessage):**
```javascript
// Game → Parent: Send game over signal
window.parent.postMessage({
  type: 'gameOver',
  payload: { score: finalScore }
}, '*')

// Parent → Game: Send acknowledgment
iframe.contentWindow.postMessage({
  type: 'acknowledged'
}, '*')
```

**State Management:**
- Centralized AppState managing current screen and data
- localStorage for leaderboard persistence
- Session-scoped data (score, player name) cleared on loop

**Storage Structure:**
```javascript
// localStorage key format: "scores_{gameName}"
localStorage.setItem('scores_snake', JSON.stringify([
  { name: 'ABC', score: 25420, date: '2025-11-13T...' },
  // ... top 10 scores per game
]))
```

**Design Notes:**
- Screen content and layouts defined in planning documents
- UI specs may change based on client feedback
- Maintain architectural patterns regardless of content changes

---

## 8. Unified Control System

### Overview

**Total Keys:** 19 (7 primary + 8 theme + 4 modifiers)
**Design Philosophy:** Simple, consistent, arcade-friendly

```
MOVIMIENTO:    ↑↓←→ / WASD
CONFIRMAR:     SPACE / M
RESET SUAVE:   N (mantener 3s)
RESET DURO:    N+M (mantener 10s)
TEMA:          1-8 (día: 1-4, noche: 5-8)
```

### Control Functions

#### 🎮 Advance/Confirm
- **SPACE** → Advance screen / Confirm selection
- **M** → Advance screen / Confirm selection (alternative)

#### 🎮 Game Actions (in-game only)
- **SPACE / M / N** → Action (shoot, jump, release ball, etc.)

#### 🧭 Horizontal Navigation (Carousels/Menus)
- **← / A** → Left
- **→ / D** → Right

#### ↕️ Vertical Navigation (Letters/Options)
- **↑ / W** → Up / Increment
- **↓ / S** → Down / Decrement

#### 🎨 Theme System (Works on ALL screens)
- **Keys 1-4** → Day mode
- **Keys 5-8** → Night mode
- Instant color switching (CSS variables + video background)
- Works in games via game-wrapper.html capture phase

#### 🔄 Reset System
- **N (hold 3s)** → Soft Reset (clear session, keep scores)
  - Blocked on IdleScreen
  - Blocked in GameScreen (InputManager disabled)
  - Works on all other screens
- **N+M (hold 10s)** → Hard Reset (clear ALL localStorage + session)
  - Blocked in GameScreen only
  - Deletes all scores permanently

### Control by Screen

| Screen | Navigation | Confirm | Theme | Reset |
|--------|-----------|---------|-------|-------|
| **Idle** | N/A | SPACE/M | 1-8 | N+M (10s) |
| **Welcome** | N/A | SPACE/M | 1-8 | N (3s), N+M (10s) |
| **Gallery** | ← → / A D | SPACE/M | 1-8 | N (3s), N+M (10s) |
| **CodeAnim** | N/A | SPACE/M (skip) | 1-8 | N (3s), N+M (10s) |
| **Game** | ↑↓←→/WASD | SPACE/M/N (game) | 1-8 | ❌ |
| **Score 1-2** | N/A | SPACE/M | 1-8 | N (3s), N+M (10s) |
| **Score 3** | ↑↓←→/WASD | SPACE/M | 1-8 | N (3s), N+M (10s) |
| **Leaderboard** | ← → / A D | SPACE/M | 1-8 | N (3s), N+M (10s) |
| **QR** | N/A | SPACE/M | 1-8 | N (3s), N+M (10s) |

### Key Priority

When N is pressed (outside of games):
1. **Always** → Initiates Soft Reset timer (3s)
2. **If M is also pressed** → Switches to Hard Reset timer (10s)

M is now purely an action/confirm key and does NOT trigger reset alone.

### Removed Keys

- ❌ **Escape** → No longer works on any screen
- ❌ **Enter** → No longer used
- ❌ **Keys 1-4 in Gallery** → No longer select games (only theme)
- ❌ **Z** → Removed from all games (was alternative shoot key)

### GameScreen Special Handling

**InputManager is DISABLED during gameplay:**
- `stopListening()` called when game starts (GameScreen.js:148)
- `clear()` + `startListening()` called when game ends (GameScreen.js:232-233)
- All game controls (WASD, arrows, space, M, N) go directly to iframe
- Escape and theme keys (1-8) captured by game-wrapper.html via postMessage
- Reset system (N/N+M) does NOT work in GameScreen
- **Ghost keys cleared** on game exit to prevent false key states

**Communication Flow:**
```
User in game → presses Escape
    ↓
game-wrapper.html captures (capture phase)
    ↓
Sends postMessage { type: 'exitGame' }
    ↓
GameScreen receives → exitToIdle()
```

### Implementation Files

**Modified Screens:**
- `src/screens/IdleScreen.js` (SPACE/M only)
- `src/screens/WelcomeScreen.js` (SPACE/M only)
- `src/screens/GalleryScreen.js` (+A/D, +M, -selección 1-4, -Escape)
- `src/screens/CodeAnimationScreen.js` (+M, -Escape)
- `src/screens/ScoreEntryScreen.js` (+A/D, +M, -Escape)
- `src/screens/LeaderboardScreen.js` (+A/D, +M, -Escape)
- `src/screens/QRCodeScreen.js` (+M, -Escape)
- `src/screens/GameScreen.js` (handler documented, disabled, ghost keys fix)

**System Managers:**
- `src/installation/InputManager.js` (keyboard event management)
- `src/installation/ResetManager.js` (N/N+M reset logic)
- `src/installation/ThemeManager.js` (keys 1-8 theme switching)
- `public/games/game-wrapper.html` (iframe key capture)

---

## 9. Testing

### Test Structure (Mirror src/)
```
src/core/GoLEngine.js     → tests/core/test_GoLEngine.js
src/utils/Collision.js    → tests/utils/test_Collision.js
src/rendering/SimpleGradientRenderer.js → tests/rendering/test_SimpleGradientRenderer.js
```

### Unit Tests (Vitest)

**Focus:** Individual components in isolation

```javascript
// tests/core/test_GoLEngine.js
import { describe, test, expect } from 'vitest'
import { GoLEngine } from '../../src/core/GoLEngine.js'

describe('GoLEngine', () => {
  test('applies B3/S23 rules correctly for Blinker', () => {
    const engine = new GoLEngine(3, 3)
    // Gen 0: Vertical blinker
    engine.setPattern([[0,1,0], [0,1,0], [0,1,0]])
    engine.update()
    // Gen 1: Horizontal blinker
    expect(engine.getPattern()).toEqual([[0,0,0], [1,1,1], [0,0,0]])
  })

  test('uses double buffer (swaps pointers)', () => {
    const engine = new GoLEngine(5, 5)
    const beforePtr = engine.current
    engine.update()
    expect(engine.current).not.toBe(beforePtr)
  })
})
```

### Browser Tests (Chrome DevTools MCP)

```javascript
// tests/integration/test_DinoGame_browser.js
describe('DinoGame Integration', () => {
  test('maintains 60fps with GoL background', async () => {
    const page = await chrome.newPage('http://localhost:5174')
    await chrome.performance.startTracing()

    await chrome.keyboard.press('Space')  // Start game
    await chrome.wait(10000)              // Play 10s

    const metrics = await chrome.performance.getMetrics()
    expect(metrics.averageFPS).toBeGreaterThan(58)
  })
})
```

**Run tests:**
```bash
npm test                    # All tests
npm test -- core           # Only core tests
npm test -- --watch        # Watch mode
```

---

## 9. Development Commands

### Setup
```bash
npm install              # Install dependencies
```

### Development
```bash
npm run dev              # Start dev server → http://localhost:5174/
                         # Vite with HMR
```

### Testing
```bash
npm test                 # Run all tests (Vitest)
npm test -- --watch      # Watch mode
npm test -- core         # Run only core tests
```

### Build & Deploy
```bash
npm run build            # Production build → dist/
npm run preview          # Preview production build
```

### Mac Mini Kiosk Mode
```bash
# Launch Chrome in fullscreen kiosk
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
  --kiosk \
  --disable-session-crashed-bubble \
  --disable-infobars \
  http://localhost:5174/installation.html
```

---

## 10. Common Patterns

### ✅ DO: Separate Visual from Logic

```javascript
// Collision uses FIXED hitbox, visual is dynamic GoL
class Enemy {
  constructor(x, y) {
    this.x = x
    this.y = y
    this.gol = new GoLEngine(6, 6, 15)      // Visual
    this.hitbox = {x, y, radius: 30}        // Collision (FIXED)
  }

  update() {
    this.gol.updateThrottled(frameCount)   // Update visual
    this.x += this.vx                      // Update position
    this.hitbox.x = this.x                 // Sync hitbox
  }

  checkCollision(other) {
    // Use FIXED hitbox, NOT GoL cells
    return Collision.circleCircle(
      this.hitbox.x, this.hitbox.y, this.hitbox.radius,
      other.hitbox.x, other.hitbox.y, other.hitbox.radius
    )
  }
}
```

### ✅ DO: Use Life Force for Critical Sprites

```javascript
class Player {
  update() {
    this.gol.updateThrottled(frameCount)
    applyLifeForce(this)  // Ensure core never dies
  }
}

function applyLifeForce(entity) {
  const coreRegion = getCenterRegion(entity, 0.3)
  const aliveCoreCount = countAliveIn(entity.gol, coreRegion)

  if (aliveCoreCount < coreRegion.area * 0.4) {
    birthRandomInRegion(entity.gol, coreRegion, 5)
  }
}
```

### ✅ DO: Use Real GoL Patterns

```javascript
// Use established patterns from LifeWiki
class PowerUp {
  constructor(x, y) {
    this.gol = new GoLEngine(13, 13, 12)
    this.gol.setPattern(Patterns.PULSAR, 0, 0)  // Real oscillator
  }
}
```

### ❌ DON'T: Mix GoL with Game Logic

```javascript
// WRONG - Using GoL cells for collision (unpredictable!)
class Enemy {
  checkCollision(other) {
    for (let cell of this.aliveCells) {
      if (other.contains(cell.x, cell.y)) {
        return true  // BUG: cells change every frame!
      }
    }
  }
}
```

---

## 11. Hardware Integration

### Arcade Controls (USB Encoder → Keyboard)

**Button Mapping:**
```javascript
const ARCADE_CONTROLS = {
  // Movement
  ArrowUp: 'UP',
  ArrowDown: 'DOWN',
  ArrowLeft: 'LEFT',
  ArrowRight: 'RIGHT',

  // Actions
  Space: 'BUTTON_1',    // Jump, shoot, confirm
  KeyZ: 'BUTTON_1',     // Alternative
  KeyX: 'BUTTON_2',     // Special, back
  KeyC: 'BUTTON_3',     // Menu, pause

  // System
  Enter: 'START',
  Escape: 'SELECT'
}
```

**Input Manager:**
```javascript
class InputManager {
  constructor() {
    this.keys = {}
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true
    })
    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false
    })
  }

  isPressed(keyCode) {
    return this.keys[keyCode] || false
  }
}
```

---

## 12. AI Coding Assistant Instructions

When working with this codebase:

### MUST DO:

1. **Read existing code first** to understand patterns
2. **Use p5.js GLOBAL mode** (never `this.` for p5 functions)
3. **Follow B3/S23 rules exactly** for GoL (double buffer mandatory)
4. **Separate visual (GoL) from logic (hitbox)** for collision
5. **Use established GoL patterns** (Patterns.BLINKER, PULSAR, etc.)
6. **Target 60fps** (profile if drops, optimize GoL grid sizes)
7. **Write tests** mirroring src/ structure
8. **Document deviations** from pure B3/S23 (with rationale)
9. **Use verbose JSDoc** for public APIs with examples
10. **Test in fullscreen** (arcade installation requirement)

### NEVER DO:

1. **Never use p5.js instance mode** (`this.createCanvas()` is WRONG)
2. **Never modify grid while reading** (use double buffer)
3. **Never use GoL cells for collision** (fixed hitboxes only)
4. **Never invent GoL patterns** (use LifeWiki canonical patterns)
5. **Never sacrifice authenticity** without documenting why
6. **Never pass 'this' to helpers** (helpers use globals)
7. **Never skip tests** (96.4% coverage minimum)
8. **Never optimize prematurely** (Mac M4 is overpowered)

### ARCADE-SPECIFIC:

1. **Single life only** (no continues)
2. **Keyboard controls** (arcade encoder maps to keyboard)
3. **Full-screen kiosk** (portrait 1200×1920, vertical orientation)
4. **6 screen flow** (attract → gallery → code → game → score → leaderboard)
5. **localStorage persistence** (leaderboard only)
6. **30s timeouts** (auto-loop to attract screen)
7. **3-letter initials** (A-Z, arcade-style input)

### DEBUGGING TOOLS:

**HitboxDebug System** (`src/debug/HitboxDebug.js`)
- Press `H` to toggle hitbox visualization in any game
- Independent from Debug UI system
- Shows collision boxes: player (green), obstacles (red)
- Reusable across all games
- Zero performance impact when disabled

**Usage:**
```javascript
import { initHitboxDebug, drawHitboxRect, drawHitboxes } from '../src/debug/HitboxDebug.js'

function setup() {
  initHitboxDebug()  // Initialize once in setup
}

function draw() {
  // Draw hitboxes (only visible when H is pressed)
  drawHitboxRect(player.x, player.y, player.width, player.height, 'player', '#00FF00')
  drawHitboxes(obstacles, 'obstacle', '#FF0000')
}
```

**See also:** `src/debug/README_HitboxDebug.md` for complete API documentation

---

## 13. Project Context

**This is an art installation showcasing Conway's Game of Life.**

### Decision Priority:
1. Visual beauty (organic, alive, emergent)
2. Authenticity (B3/S23 where viable)
3. Simplicity (KISS over clever)

### Not Goals:
- ❌ High scores sync (local only)
- ❌ Multiplayer (single player arcade)
- ❌ Mobile support (Mac Mini kiosk only)
- ❌ Audio (TBD by client)

### Key Resources:
- LifeWiki: https://conwaylife.com/wiki/
- Golly: http://golly.sourceforge.net/
- p5.js Docs: https://p5js.org/reference/

### Archon MCP Project ID:
`9ebdf1e2-ed0a-422f-8941-98191481f305`

### Archon RAG Knowledge Base

**CRITICAL: Always search Archon knowledge base BEFORE external searches or URLs**

Use `mcp__archon__rag_search_knowledge_base()` to search available sources:

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| `141a7d7e14c8b58b` | Conwaylife Wiki | 127k | Complete GoL patterns catalog, rules, theory |
| `22832de63c03f570` | Vite Documentation | 60k | Dev server, HMR, build configuration |
| `da752d5fc3c907ba` | Vitest Documentation | 113k | Testing API, matchers, configuration |
| `04f933e8f516da35` | Typed.js (GitHub) | 188k | Typewriter effects, animations, configuration |
| `e17c0329eb0f6098` | Prism.js Documentation | 50k | Syntax highlighting, languages, themes |
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `42a1fc677ff1afe4` | Nature of Code - CA | 189k | Cellular automata theory, GoL implementation |
| `b10ed112d80b75a1` | Wikipedia - GoL | 7.6k | B3/S23 rules, pattern overview |
| `8c1ae5409263093b` | Wikipedia - Spaceship | 1k | Moving GoL patterns |
| `5d5b65af576c1c87` | P5.js GoL Example | 749 | Working GoL implementation |
| `61fecfc7b8236399` | Processing GoL | 1.4k | Reference implementation |

**Research Pattern:**
```javascript
// 1. Search Archon FIRST
const results = await mcp__archon__rag_search_knowledge_base({
  query: "vite dev server configuration",
  source_id: "22832de63c03f570",  // Vite docs
  match_count: 5
})

// 2. Search code examples
const examples = await mcp__archon__rag_search_code_examples({
  query: "vitest test setup",
  match_count: 3
})

// 3. Only use external URLs if Archon searches insufficient
```

---

**When in doubt:** Choose the solution that looks more organic and alive (GoL emergence), is more authentic (B3/S23), and is simpler to implement (KISS).

The Mac M4 is overpowered. Focus on creating something visually stunning.

---

## 14. Known Deviations from Authenticity

This section documents approved exceptions to the "no static sprites" principle.

### Dino Runner - PNG Sprite Player

**Date:** 2025-11-18
**Component:** Player entity in `public/games/dino-runner.js`
**Deviation:** Uses static PNG sprite (`dino.png` 200×200px) instead of procedural GoL pattern

**Rationale:**
- Client requirement for brand recognition and visual identity
- Dino character must be immediately recognizable to users
- Trade-off: Visual identity and user experience over GoL authenticity

**Status:** ✅ APPROVED BY CLIENT

**Implementation Details:**
- Player rendered as static image loaded from `/public/assets/dino.png`
- Hitbox dimensions match sprite exactly (200×200px) for accurate collision
- **Ground obstacles**: Static GoL patterns (still lifes and oscillators in phase 0)
  - Patterns: BLOCK, BEEHIVE, LOAF, BOAT, TUB, BLINKER, TOAD, BEACON
  - All rendered with `RenderMode.STATIC` (no animation)
  - Full-size hitboxes matching pattern dimensions
- **Flying obstacles (Pterodactyls)**: LWSS spaceship patterns
  - Patterns: LWSS Phase 2/4, Phase 3/4, Phase 4/4 (all static)
  - Rendered with `RenderMode.STATIC` at fixed height above horizon
  - Reduced hitboxes: 60% of visual size, centered (KISS approach)
- **Background parallax**: Pure GoL still life patterns (BLOCK, BEEHIVE, LOAF, BOAT, TUB)
- **Clouds**: Multicolor gradients with 20% transparency
- **Explosion particles**: Pure GoL with radial density seeding

**Hitbox Debug System:**
- Press `H` to toggle hitbox visualization
- Reusable module: `src/debug/HitboxDebug.js`
- Works independently from Debug UI
- Shows player (green) and obstacle (red) collision boxes

**Code Location:**
- `public/games/dino-runner.js` - Main game implementation
- `src/debug/HitboxDebug.js` - Hitbox debug system
- `tests/debug/test_HitboxDebug.js` - Unit tests (10/10 passing)

**Documentation:**
- This deviation is isolated to player entity only
- All obstacles remain 100% GoL patterns (static rendering)
- Future games should prioritize GoL authenticity unless client explicitly requires otherwise

### Video Gradient Background

**Date:** 2025-11-24
**Component:** `src/rendering/VideoGradientRenderer.js`
**Deviation:** Uses static video file (`/public/videos/gradient.mp4`) instead of procedural Perlin noise gradient.

**Rationale:**
- Client request for "Rich Aesthetics" and "Visual beauty"
- Video provides a more complex and visually stunning background than procedural noise
- **Tier 3: Visual Only** deviation (does not affect gameplay logic)

**Status:** ✅ IMPLEMENTED + HIGHLY OPTIMIZED

**Implementation Details:**
- New class `VideoGradientRenderer` created as alternative to `SimpleGradientRenderer`
- Uses Canvas API `createPattern` for optimal performance
- Drop-in replacement: same interface as `SimpleGradientRenderer`
- All games updated to use `VideoGradientRenderer` by default
- Original `SimpleGradientRenderer` preserved for backward compatibility

**Performance Optimizations (2025-11-24):**

1. **Texture Lookup Cache** (Primary optimization)
   - Problem: `getImageData()` GPU read-back was causing 2-24ms overhead/frame
   - Solution: Pre-sample video to downscaled ImageData (480×270) for O(1) array access
   - Impact: **50-150× faster** per call (0.05-0.15ms → 0.001-0.003ms)
   - Savings: ~6-23ms/frame depending on entity count

2. **Pattern Caching**
   - Problem: `createPattern()` called per entity (35-75 times/frame)
   - Solution: Create pattern once per frame, reuse across all entities
   - Impact: **90-95% reduction** in pattern overhead

3. **Single Video Draw**
   - Problem: Video decoded and drawn multiple times per frame
   - Solution: Draw video once per frame to lookup canvas
   - Impact: ~1ms saved/frame

**Performance Measurements:**
- Before optimization: 13-20ms overhead/frame (exceeds 60fps budget)
- After optimization: 0.5-2ms overhead/frame
- **Total savings: 10-18ms/frame (~85-90% reduction)**
- Result: ✅ **60fps stable** on all games

**Memory Usage:**
- Lookup texture: 480×270×4 bytes = ~500KB ImageData
- Video element: ~200KB (gradient.mp4)
- Total: ~700KB (acceptable for Mac M4 target)

**Code Location:**
- `src/rendering/VideoGradientRenderer.js` - Video gradient renderer (optimized)
- `src/rendering/SimpleGradientRenderer.js` - Original Perlin noise renderer (preserved)
- `tests/rendering/test_VideoGradientRenderer.js` - Unit tests (12/12 passing)
- All game files in `public/games/` - Updated to use video renderer

