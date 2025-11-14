# Coding Prompt: Physical Installation - 6-Screen Arcade System

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

> **Multi-Phase Implementation Strategy**
>
> This project is divided into 3 sequential phases to manage complexity:
> - **Phase 1:** Core infrastructure (SPA container, state machine, navigation, storage)
> - **Phase 2:** Screen implementations (6 screens: attract, gallery, code, game, score, leaderboard)
> - **Phase 3:** Integration and polish (transitions, sounds, error handling, testing)
>
> Complete each phase and validate before proceeding to the next.

---

## Feature Description and Problem Solving

**Feature:** Implement the complete 6-screen arcade installation system using Hybrid SPA architecture (SPA container + iframe games) for a **vertical portrait display (1200×1920)**.

**Problem it's solving:**
- Creating seamless navigation flow between 6 distinct screens without page reloads
- Integrating existing games (7 games) into arcade installation without modifying game code
- Managing global state (selected game, score, player name, leaderboard) across screens
- Providing authentic arcade experience with score entry and persistent leaderboards
- Showcasing code generation concept with animated typewriter effect
- Maintaining 60fps performance throughout all screen transitions
- **Optimizing UI layouts for vertical/portrait orientation (1200×1920)**

---

## User Story

```
As a visitor to the Game of Life Arcade installation,
I want a complete arcade experience from attract screen to leaderboard,
So that I can enjoy games, compete for high scores, and appreciate the GoL aesthetic.

Acceptance Criteria:
- Attract screen shows animated GoL background with clear "Press Space" prompt
- Gallery shows all 7 games with keyboard navigation (1-7 or arrows + space)
- Code screen animates game source code with typewriter effect before game loads
- Game runs in isolated iframe without modifying existing game code
- Score entry accepts 3-letter initials using arcade controls (arrows + space)
- Leaderboard displays top 10 scores with highlight for new entry
- All screens use localStorage for persistence (survives browser refresh)
- Flow loops: Attract → Gallery → Code → Game → Score → Leaderboard → Attract
- System maintains 60fps throughout all transitions
- No page reloads - pure SPA navigation
```

---

## Solution and Approach

**Architecture:** Hybrid SPA + Iframes

**Why this approach:**
- **No game modifications:** Games run in iframes, completely isolated
- **Seamless navigation:** SPA container provides instant screen transitions
- **State management:** Centralized AppState manages flow and data
- **Performance:** No page reloads, minimal overhead
- **Maintainability:** Clear separation between container and game logic

**Technology Stack:**
- Vanilla JavaScript ES6+ (no frameworks - YAGNI)
- p5.js for GoL background (Attract screen)
- localStorage for persistence
- postMessage for iframe-to-parent communication
- CSS transitions for screen animations

**Display Specifications:**
- **Resolution:** 1200×1920 (portrait/vertical orientation)
- **Aspect Ratio:** 5:8 (0.625)
- **Canvas:** `createCanvas(1200, 1920)`
- **GoL Background Grid:** 40 cols × 64 rows (2,560 cells, ~30px per cell)
- **Gallery Layout:** 2 columns × 4 rows (optimized for vertical)

**Phase Breakdown:**

**Phase 1: Core Infrastructure** (5-6 hours)
- SPA container HTML structure
- State machine for screen navigation
- Navigation logic and keyboard input
- localStorage manager for scores
- Iframe communication system
- **Game integration (postMessage, conditional Game Over)**

**Phase 2: Screen Implementations** (8-10 hours)
- Screen 1: Attract (GoL background + logo)
- Screen 2: Gallery (adapt existing, integrate into SPA)
- Screen 3: Code Animation (typewriter effect + syntax highlighting)
- Screen 4: Game (iframe loader with postMessage)
- Screen 5: Score Entry (3-letter arcade-style input)
- Screen 6: Leaderboard (top 10 table with highlight)

**Phase 3: Integration & Polish** (3-4 hours)
- Screen transitions and animations
- Sound effects (optional)
- Error handling and edge cases
- Performance optimization
- End-to-end flow testing

---

## Visual Design System (NON-NEGOTIABLE)

### CRITICAL: Google Brand Minimalism

**All screens MUST follow the existing visual design system. DO NOT invent colors or styles.**

### Color Palette (ONLY These Colors)

**Source:** `src/utils/GradientPresets.js`

```javascript
export const GOOGLE_COLORS = {
  BLUE: [66, 133, 244],    // Google Blue #4285F4
  RED: [234, 67, 53],      // Google Red #EA4335
  GREEN: [52, 168, 83],    // Google Green #34A853
  YELLOW: [251, 188, 4],   // Google Yellow #FBBC04
  WHITE: [255, 255, 255]   // White #FFFFFF
}
```

### UI Style Configuration

**Pattern from existing games** (see `games/snake.js` lines 19-34):

```javascript
const UI_STYLE = {
  // Installation screens (portrait):
  background: '#FFFFFF',        // WHITE background (Google style)
  outerBackground: '#FFFFFF',   // White letterbox bars (Google minimalism)
  textColor: '#5f6368',         // Google gray
  accentColor: '#4285F4',       // Google Blue (primary)
  highlightColor: '#34A853',    // Google Green (success)
  errorColor: '#EA4335',        // Google Red (errors)
  warningColor: '#FBBC04',      // Google Yellow (warnings)

  // Typography:
  fontFamily: 'Google Sans, Arial, sans-serif',  // NOT Courier New or monospace
  fontSize: {
    small: 16,
    medium: 24,
    large: 48,
    xlarge: 72
  },
  fontWeight: {
    light: 300,
    regular: 400,
    medium: 500
  },

  // Spacing (from gallery.html):
  spacing: {
    small: '1rem',
    medium: '2rem',
    large: '3rem'
  },

  // Borders (from gallery.html):
  borderRadius: '12px',
  borderWidth: '2px',
  borderColor: '#333',

  // Animations (Material Design from gallery.html):
  transition: {
    fast: '0.2s cubic-bezier(0.4, 0, 0.2, 1)',
    normal: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '0.5s cubic-bezier(0.4, 0, 0.2, 1)'
  }
}
```

### Reference Implementations

**MUST review these files before implementing:**
- `gallery.html` lines 7-276 - Complete visual reference for installation aesthetic
- `games/snake.js` lines 19-34 - CONFIG.ui pattern
- `src/utils/UIHelpers.js` - Standard UI rendering functions

### Syntax Highlighting (Code Animation Screen)

**Use ONLY Google colors:**
```javascript
const SYNTAX_COLORS = {
  comment: '#5f6368',    // Google gray (dimmed)
  keyword: '#4285F4',    // Google Blue
  string: '#34A853',     // Google Green
  number: '#FBBC04',     // Google Yellow
  default: '#FFFFFF'     // White
}
```

### FORBIDDEN (DO NOT USE)

❌ **Colors:**
- Terminal green (#00FF00)
- Cyan (#00FFFF)
- Magenta, purple, orange (except official Google colors)
- Any color not in GOOGLE_COLORS

❌ **Typography:**
- Courier New, Monaco, Consolas (use Google Sans)
- Custom fonts not specified

❌ **Styles:**
- Custom gradients outside GOOGLE_COLORS
- Custom animation timings (use Material Design timings)

### Layout Guidelines

**Portrait orientation optimizations:**
- Stack elements vertically
- Use full width (1200px)
- Generous vertical spacing (2-3rem)
- Centered content with padding
- Reference gallery.html for grid patterns (2×4 for games)

### Responsive Design (CRITICAL for Debugging)

**Target:** 1200×1920 (portrait/vertical) on Mac Mini M4

**Development:** Must work on horizontal screens for debugging

**Implementation:**
```css
/* Outer container: White letterbox bars */
body {
  margin: 0;
  padding: 0;
  background-color: #FFFFFF;  /* White outer (Google minimalism) */
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  overflow: hidden;
}

/* Inner container: White content area, portrait aspect ratio */
#installation-container {
  background-color: #FFFFFF;  /* White content area (Google style) */
  width: 1200px;
  height: 1920px;
  max-height: 100vh;  /* Fit to screen height */
  max-width: calc(100vh * 0.625);  /* Maintain 5:8 aspect ratio */
  position: relative;
  overflow: hidden;
}

/* Screens fill container */
.screen {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
```

**Behavior:**
- **Vertical screen (1200×1920):** Full screen, no letterbox
- **Horizontal screen (1920×1080 or wider):**
  - Height: 100vh (fills screen height)
  - Width: Auto-calculated to maintain 5:8 aspect ratio (~675px)
  - White bars on left/right sides (Google minimalism)
  - White content area in center

**Aspect ratio:** 5:8 (0.625) - Always maintained

**Why this matters:**
- Developers can test on horizontal laptops/monitors
- Installation looks correct on vertical arcade display
- No distortion at any screen size

---

## Relevant Files from Codebase

**Reference for architecture and standards:**
- `CLAUDE.md` - Complete development guidelines, 6-screen flow specs (lines 228-341)

**CRITICAL - Visual Design References:**
- `src/utils/GradientPresets.js` - **OFFICIAL Google colors (MUST USE)**
- `src/utils/UIHelpers.js` - **Standard UI rendering patterns**
- `gallery.html` - **Reference for installation aesthetic** (lines 7-276)
- `games/snake.js` - **Reference for CONFIG.ui pattern** (lines 19-34)

**Existing files to integrate:**
- `LifeArcade/gallery.html` - Current game gallery (will be adapted for Screen 2)
- `LifeArcade/games/*.html` - 7 existing games (will load in iframes)
- `LifeArcade/src/core/GoLEngine.js` - For Attract screen background
- `LifeArcade/src/rendering/SimpleGradientRenderer.js` - Background renderer
- `LifeArcade/src/utils/Patterns.js` - GoL patterns for Attract screen

**Files to create:**

```
LifeArcade/
├── installation.html                   # Main SPA container (ENTRY POINT)
├── src/
│   ├── installation/
│   │   ├── AppState.js                # State machine + navigation logic
│   │   ├── StorageManager.js          # localStorage wrapper for scores
│   │   ├── InputManager.js            # Keyboard input handler
│   │   └── IframeComm.js              # postMessage communication
│   ├── screens/
│   │   ├── AttractScreen.js           # Screen 1: Attract
│   │   ├── GalleryScreen.js           # Screen 2: Game selection
│   │   ├── CodeAnimationScreen.js     # Screen 3: Code typewriter
│   │   ├── GameScreen.js              # Screen 4: Iframe loader
│   │   ├── ScoreEntryScreen.js        # Screen 5: 3-letter input
│   │   └── LeaderboardScreen.js       # Screen 6: Top 10 table
│   └── utils/
│       └── SyntaxHighlighter.js       # For code animation
└── tests/
    └── installation/
        ├── test_AppState.js           # State machine tests
        ├── test_StorageManager.js     # localStorage tests
        └── test_IframeComm.js         # postMessage tests
```

---

## Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Get available knowledge sources
mcp__archon__rag_get_available_sources()

// Step 2: Search Vite dev server setup
mcp__archon__rag_search_knowledge_base({
  query: "dev server port configuration",
  source_id: "22832de63c03f570",  // Vite docs
  match_count: 5
})

// Step 3: Search Vitest testing setup
mcp__archon__rag_search_knowledge_base({
  query: "test setup describe expect",
  source_id: "da752d5fc3c907ba",  // Vitest docs
  match_count: 5
})

// Step 4: Search Typed.js for typewriter effects
mcp__archon__rag_search_knowledge_base({
  query: "typewriter effect setup",
  source_id: "04f933e8f516da35",  // Typed.js docs
  match_count: 5
})

// Step 5: Search Prism.js for syntax highlighting
mcp__archon__rag_search_knowledge_base({
  query: "syntax highlighting javascript",
  source_id: "e17c0329eb0f6098",  // Prism.js docs
  match_count: 5
})

// Step 6: Search GoL patterns for Attract screen
mcp__archon__rag_search_knowledge_base({
  query: "oscillator patterns blinker pulsar",
  source_id: "141a7d7e14c8b58b",  // Conwaylife Wiki
  match_count: 5
})

// Step 7: Search p5.js for canvas setup
mcp__archon__rag_search_knowledge_base({
  query: "createCanvas frameRate setup draw",
  source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
  match_count: 5
})
```

### Available Archon Knowledge Sources

**All major dependencies available in knowledge base - use Archon FIRST!**

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| **Development Tools** ||||
| `22832de63c03f570` | Vite Documentation | 60k | Dev server, HMR, build config, plugins |
| `da752d5fc3c907ba` | Vitest Documentation | 113k | Testing API, matchers, mocking, configuration |
| **Code Animation** ||||
| `04f933e8f516da35` | Typed.js (GitHub) | 188k | Typewriter effects, animations, callbacks, configuration |
| `e17c0329eb0f6098` | Prism.js Documentation | 50k | Syntax highlighting, languages, themes, plugins |
| **Game of Life** ||||
| `141a7d7e14c8b58b` | Conwaylife Wiki | 127k | Complete GoL patterns catalog, rules, theory |
| `42a1fc677ff1afe4` | Nature of Code - CA | 189k | Cellular automata theory, implementation |
| `b10ed112d80b75a1` | Wikipedia - GoL | 7.6k | B3/S23 rules, pattern overview |
| `8c1ae5409263093b` | Wikipedia - Spaceship | 1k | Moving GoL patterns |
| **p5.js** ||||
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `5d5b65af576c1c87` | P5.js GoL Example | 749 | Working GoL implementation example |
| `61fecfc7b8236399` | Processing GoL | 1.4k | Reference GoL implementation |

**Example Searches:**

```javascript
// Vite dev server configuration
mcp__archon__rag_search_knowledge_base({
  query: "dev server configuration port HMR",
  source_id: "22832de63c03f570",
  match_count: 5
})

// Vitest testing setup
mcp__archon__rag_search_knowledge_base({
  query: "test setup describe expect mock",
  source_id: "da752d5fc3c907ba",
  match_count: 5
})

// Typed.js typewriter effects
mcp__archon__rag_search_knowledge_base({
  query: "typewriter animation setup options",
  source_id: "04f933e8f516da35",
  match_count: 5
})

// Prism.js syntax highlighting
mcp__archon__rag_search_knowledge_base({
  query: "syntax highlighting javascript themes",
  source_id: "e17c0329eb0f6098",
  match_count: 5
})

// GoL patterns for Attract screen
mcp__archon__rag_search_knowledge_base({
  query: "oscillator blinker pulsar pattern",
  source_id: "141a7d7e14c8b58b",
  match_count: 5
})
```

### Step 2: External URLs (only if Archon insufficient)

**Note:** All major dependencies now in Archon knowledge base - external URLs rarely needed

- [MDN: Window.postMessage()](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage) - iframe communication (if needed)
- [MDN: Web Storage API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Storage_API) - localStorage reference (if needed)

---

## Archon Task Management Integration

### CRITICAL: Use Archon MCP for ALL task management

**Project ID:** `9ebdf1e2-ed0a-422f-8941-98191481f305`

**Before starting implementation:**

```javascript
// 1. Create tasks in Archon for each phase
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 1: Implement SPA container and state machine",
  description: "Create installation.html with AppState.js managing 6-screen navigation flow. Implement keyboard input and localStorage manager.",
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 10
})

// 2. As you work, update task status
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "doing"
})

// 3. When complete, mark as done
mcp__archon__manage_task({
  action: "update",
  task_id: "<task-id>",
  status: "done"
})

// 4. Query tasks to track progress
mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  filter_by: "feature",
  filter_value: "Physical-Installation"
})
```

**Task Granularity Guidelines:**
- Each task should be 30 minutes to 4 hours of work
- Tasks should have clear, testable acceptance criteria
- Use `feature` field to group: "Physical-Installation"

---

## Phase 1: Core Infrastructure (5-6 hours)

### Consolidated Task List (5 Tasks)

**IMPORTANT:** Task 1.5 must be completed BEFORE Phase 2 to ensure games integrate correctly with the installation.

**Task 1.1: SPA Container and HTML Structure** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Create SPA container HTML with 6 screen divs",
  description: `
Create installation.html as main SPA container with all 6 screens.

CRITICAL: Portrait orientation 1200×1920 (vertical display)

Structure:
- Single HTML file with 6 screen divs (hidden by default)
- CSS for screen transitions (fade in/out)
- Base styles: fullscreen, no scroll, arcade aesthetic
- Import all screen JavaScript modules
- Load p5.js for Attract screen

Screens to create:
1. #attract-screen (GoL background + logo)
2. #gallery-screen (game selection grid - 2 cols × 4 rows)
3. #code-screen (code animation display)
4. #game-screen (iframe container)
5. #score-entry-screen (3-letter input)
6. #leaderboard-screen (top 10 table)

HTML Structure:
<body>
  <div id="installation-container">
    <div id="attract-screen" class="screen active">...</div>
    <div id="gallery-screen" class="screen">...</div>
    <div id="code-screen" class="screen">...</div>
    <div id="game-screen" class="screen">...</div>
    <div id="score-entry-screen" class="screen">...</div>
    <div id="leaderboard-screen" class="screen">...</div>
  </div>
</body>

CSS Requirements (CRITICAL - Responsive Design):
- OUTER body: background #FFFFFF (white letterbox bars, Google minimalism)
- INNER #installation-container: background #FFFFFF (white, Google style)
- Container: 1200×1920 portrait, responsive with letterboxing
- max-height: 100vh, max-width: calc(100vh * 0.625) for aspect ratio
- .screen { display: none } by default
- .screen.active { display: flex } for current screen
- Text color: #5f6368 (Google gray)
- Accent color: #4285F4 (Google Blue)
- Font: 'Google Sans, Arial, sans-serif' (NOT Courier New)
- Font sizes: 16px base, 24px medium, 48px titles
- Border-radius: 12px
- Transitions: 0.3s cubic-bezier(0.4, 0, 0.2, 1)
- REFERENCE: "Responsive Design" section above for complete CSS
- REFERENCE: UI_STYLE section for colors
- Vertical layout optimizations

Meta Viewport:
<meta name="viewport" content="width=device-width, initial-scale=1.0">

Acceptance:
- All 6 screen divs exist in HTML
- Only one screen visible at a time (controlled by .active class)
- CSS loaded, no layout issues
- installation.html loads without errors
- Responsive design works (letterboxing on horizontal screens)
- White background (#FFFFFF) in content area
- White letterbox bars (#FFFFFF) on outer body
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 10
})
```

**Implementation notes:**
- Use existing `installation.html` as base (already created)
- Each screen is a `<div class="screen">` with unique ID
- Only screen with `.active` class is visible
- CSS Grid/Flexbox for centering content

---

**Task 1.2: State Machine and Navigation Logic** (2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement AppState.js state machine",
  description: `
Create AppState.js as centralized state machine managing screen flow and global state.

State Structure:
{
  currentScreen: 'attract' | 'gallery' | 'code' | 'game' | 'score' | 'leaderboard',
  selectedGame: null | string,      // e.g., 'snake'
  currentScore: null | number,
  playerName: null | string,        // 3 letters
  leaderboards: { [game]: Array }   // Loaded from localStorage
}

Methods to implement:
- goToScreen(screenName) - Navigate to screen
- selectGame(gameName) - Set selected game
- setScore(score) - Store current score
- setPlayerName(name) - Store 3-letter name
- resetState() - Clear game-specific state

Navigation Flow:
attract → gallery → code → game → score → leaderboard → attract (loop)

Keyboard Input:
- Space: Advance to next screen (context-dependent)
- Escape: Return to attract (from any screen)
- Number keys 1-7: Quick select game (in gallery)

Acceptance:
- State machine transitions between all 6 screens correctly
- Only one screen visible at a time
- State persists across screens
- Keyboard input triggers correct transitions
- resetState() clears game data but keeps leaderboards
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 20
})
```

**Implementation notes:**
- Use ES6 class with state object
- Implement observer pattern for screen changes
- Each screen subscribes to state changes
- Navigation methods update currentScreen and trigger screen swap

```javascript
// Example implementation pattern:
class AppState {
  constructor() {
    this.state = {
      currentScreen: 'attract',
      selectedGame: null,
      currentScore: null,
      playerName: null,
      leaderboards: {}
    }
    this.observers = []
  }

  goToScreen(screenName) {
    this.state.currentScreen = screenName
    this.notifyObservers()
    this.updateDOM()
  }

  updateDOM() {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'))
    // Show current screen
    document.getElementById(`${this.state.currentScreen}-screen`).classList.add('active')
  }
}
```

---

**Task 1.3: localStorage Manager** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement StorageManager.js for leaderboards",
  description: `
Create StorageManager.js for persistent score storage using localStorage.

Data Structure (localStorage):
{
  "scores_snake": [
    { name: "ABC", score: 25420, date: "2025-11-13T14:30:00Z" },
    { name: "XYZ", score: 18500, date: "2025-11-12T10:15:00Z" },
    ...
  ],
  "scores_pong": [...],
  "scores_dino-runner": [...],
  // ... for all 7 games
}

Methods to implement:
- saveScore(game, name, score) - Add score to game's leaderboard
- getScores(game, limit=10) - Get top N scores for game
- getTopScore(game) - Get highest score for game
- getAllLeaderboards() - Load all scores (for init)
- clearScores(game) - Clear game's leaderboard (admin)

Storage Logic:
- Save to localStorage with key "scores_{gameName}"
- Sort by score (descending)
- Keep only top 10 scores
- Add timestamp automatically
- Handle localStorage quota exceeded (clear old data)

Acceptance:
- Scores persist across page reloads
- Top 10 scores maintained per game
- Scores sorted correctly (highest first)
- Date timestamps are ISO 8601 format
- No localStorage errors even when full
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 30
})
```

**Implementation notes:**
- Use `localStorage.setItem()` and `localStorage.getItem()`
- JSON.stringify/parse for objects
- Error handling for quota exceeded
- Key format: `scores_{gameName}` (e.g., `scores_snake`)

```javascript
// Example implementation:
class StorageManager {
  static saveScore(game, name, score) {
    const scores = this.getScores(game, 999) // Get all
    scores.push({ name, score, date: new Date().toISOString() })
    scores.sort((a, b) => b.score - a.score) // Descending
    scores.splice(10) // Keep top 10
    localStorage.setItem(`scores_${game}`, JSON.stringify(scores))
  }

  static getScores(game, limit = 10) {
    const data = localStorage.getItem(`scores_${game}`)
    const scores = data ? JSON.parse(data) : []
    return scores.slice(0, limit)
  }
}
```

---

**Task 1.4: Iframe Communication System** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement IframeComm.js for game communication",
  description: `
Create IframeComm.js for postMessage communication between games (in iframe) and installation (parent).

Communication Flow:
1. Game loads in iframe (Screen 4)
2. Game sends "gameReady" message to parent
3. Game sends "gameOver" message with score to parent
4. Parent responds with "acknowledged"

Message Format:
{
  type: 'gameReady' | 'gameOver' | 'acknowledged',
  payload: { score?: number, game?: string }
}

Methods to implement:
- setupIframe(gameUrl) - Load game in iframe
- listenForMessages() - Set up message listener
- sendMessageToGame(message) - Send to iframe
- onGameReady(callback) - Handle game ready
- onGameOver(callback) - Handle game over with score

Game Modifications Required:
- Add to each game's HTML:
  window.parent.postMessage({ type: 'gameReady' }, '*')
  window.parent.postMessage({ type: 'gameOver', payload: { score: finalScore }}, '*')

Acceptance:
- Parent receives "gameReady" from game
- Parent receives "gameOver" with score
- Score extracted correctly from postMessage
- No security vulnerabilities (validate message origin)
- Works with all 7 existing games
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 40
})
```

**Implementation notes:**
- Use `window.addEventListener('message', handler)`
- Validate message origin for security
- Handle cases where game doesn't send messages (fallback)

```javascript
// Example implementation:
class IframeComm {
  static setupIframe(gameUrl) {
    const iframe = document.getElementById('game-iframe')
    iframe.src = gameUrl
  }

  static listenForMessages() {
    window.addEventListener('message', (event) => {
      // Validate origin (optional, for security)
      if (event.data.type === 'gameReady') {
        this.onGameReady()
      } else if (event.data.type === 'gameOver') {
        this.onGameOver(event.data.payload.score)
      }
    })
  }

  static onGameOver(score) {
    // Trigger state transition to score entry screen
    window.appState.setScore(score)
    window.appState.goToScreen('score')
  }
}
```

---

**Task 1.5: Modify Games for Installation Integration** (1-2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Integrate all 7 games with postMessage",
  description: `
Modify all 7 games to send postMessage on Game Over and disable popup/restart in iframe mode.

CRITICAL: Games must work in BOTH standalone and installation modes.

Files to modify:
1. games/space-invaders.js
2. games/dino-runner.js
3. games/breakout.js
4. games/asteroids.js
5. games/flappy-bird.js
6. games/snake.js
7. games/pong.js

Changes per game (3 modifications each):

1. triggerGameOver() - Add postMessage:
   if (window.parent !== window) {
     window.parent.postMessage({
       type: 'gameOver',
       payload: { score: state.score }
     }, '*')
   }

2. draw() - Conditional Game Over popup:
   if (state.phase === 'GAMEOVER' && window.parent === window) {
     renderGameOver(width, height, state.score)
   }

3. keyPressed() - Conditional restart:
   if (state.phase === 'GAMEOVER' && key === ' ') {
     if (window.parent === window) {
       initGame()
     }
     return
   }

Detection pattern:
- window.parent === window → Standalone mode (show popup, allow restart)
- window.parent !== window → Installation mode (send postMessage, no popup, no restart)

Testing:
- Standalone: http://localhost:5173/games/snake.html (popup shows, SPACE restarts)
- Installation: Load in iframe (postMessage sent, no popup, no restart)

Acceptance:
- All 7 games modified correctly
- Standalone mode still works (popup + restart)
- Installation mode sends postMessage with score
- No Game Over popup in iframe mode
- No restart allowed in iframe mode
- postMessage includes correct score value
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 45
})
```

**Implementation notes:**
- Use `window.parent !== window` to detect iframe
- Keep existing standalone functionality intact
- Test each game in both modes
- Ensure postMessage payload matches format: `{ type: 'gameOver', payload: { score: number }}`

**Reference:** See "CRITICAL: Game Integration for Installation" section below for complete examples

---

## Phase 2: Screen Implementations (8-10 hours)

### Consolidated Task List (6 Tasks)

**Task 2.1: Attract Screen** (2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 1: Implement Attract screen with GoL background",
  description: `
Create AttractScreen.js with animated GoL background and logo.

CRITICAL: Portrait orientation 1200×1920

Visual Design:
- Background: Pure GoL simulation (40 cols × 64 rows = 2,560 cells, 10fps)
- Center: "GAME OF LIFE ARCADE" title (large, glowing green text)
- Subtitle: "Conway's Cellular Automaton Games"
- Bottom: "PRESS SPACE TO START" (blinking animation)

GoL Background:
- Use GoLEngine from src/core/GoLEngine.js
- 40×64 grid (portrait), update at 10fps
- Cell size ~30px (1200/40 = 30, 1920/64 = 30)
- Random seed with ~30% density
- Re-seed every 60 seconds to keep interesting

Animations:
- Title: Glow pulse (0.8-1.0 opacity, 4s cycle)
- Prompt: Blink (1.5s cycle)
- Background: Organic GoL evolution

Keyboard Input:
- Space: Go to gallery screen
- Any key: Go to gallery screen

Idle Timeout:
- After 30s of inactivity: Cycle through game screenshots (future enhancement)

Acceptance:
- GoL background animates smoothly
- Title and prompt visible and animated
- Space key triggers transition to gallery
- Performance: 60fps maintained
- Background re-seeds every 60s
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 50
})
```

**Implementation notes:**
- Reuse GoLEngine and CellRenderer from existing src/
- Use p5.js for rendering
- Background should be full-screen
- Text overlay using CSS positioned absolutely

---

**Task 2.2: Gallery Screen** (1.5 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 2: Adapt gallery.html for SPA integration",
  description: `
Create GalleryScreen.js adapting existing gallery.html into Screen 2.

CRITICAL: Change layout to 2 columns × 4 rows for portrait orientation

Changes from existing gallery.html:
- Remove <html>, <head>, <body> tags (keep only content)
- Convert to JavaScript class that injects into #gallery-screen div
- Add SPA navigation: clicking game → AppState.selectGame() → goToScreen('code')
- CHANGE LAYOUT: 2×4 grid (not 3×3) - better for vertical display
- Keep existing keyboard controls (1-7 for games)

Game Grid:
- 7 games in 2×4 grid (1 empty slot in bottom-right)
- Each card shows: game name, number (1-7)
- Hover/selected state: border glow, scale up
- Keyboard: 1-7 keys or arrow keys + space
- Vertical stacking optimized for 1200×1920

Data Structure:
const GAMES = [
  { id: 'space-invaders', name: 'Space Invaders', file: 'games/space-invaders.html' },
  { id: 'dino-runner', name: 'Dino Runner', file: 'games/dino-runner.html' },
  { id: 'breakout', name: 'Breakout', file: 'games/breakout.html' },
  { id: 'asteroids', name: 'Asteroids', file: 'games/asteroids.html' },
  { id: 'flappy-bird', name: 'Flappy Bird', file: 'games/flappy-bird.html' },
  { id: 'snake', name: 'Snake', file: 'games/snake.html' },
  { id: 'pong', name: 'Pong', file: 'games/pong.html' }
]

Navigation:
- Number key 1-7: Select and confirm game
- Arrow keys: Move selection
- Space: Confirm selection
- Escape: Return to attract

Acceptance:
- All 7 games displayed in grid
- Keyboard navigation works (numbers, arrows, space)
- Selecting game triggers AppState.selectGame() and goes to code screen
- Visual feedback for selected game
- Escape returns to attract screen
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 60
})
```

**Implementation notes:**
- Extract CSS and HTML from existing gallery.html
- Convert to JS module that renders into div
- Hook up navigation to AppState

---

**Task 2.3: Code Animation Screen** (3-4 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 3: Implement code animation with typewriter effect",
  description: `
Create CodeAnimationScreen.js with typewriter effect showing game source code.

Visual Design:
- Header: "GENERATING: {GAME_NAME}.js"
- Body: Code display area (Google Sans, syntax-colored on white)
- Animation: Character-by-character typewriter effect
- Syntax highlighting: Use SYNTAX_COLORS (Google Blue/Green/Yellow/Gray only)
- Auto-scroll as code appears

Implementation:
1. Fetch game source code file (e.g., games/snake.js)
2. Parse and apply syntax highlighting
3. Animate character-by-character at 50 chars/sec
4. Scroll viewport to follow cursor
5. After completion: "Compilation complete ✓" message
6. Auto-transition to game screen after 1s

Syntax Highlighting (use ONLY Google colors from SYNTAX_COLORS above):
- Comments (//): #5f6368 (Google gray, dimmed)
- Keywords (const, let, class, function): #4285F4 (Google Blue)
- Strings: #34A853 (Google Green)
- Numbers: #FBBC04 (Google Yellow)
- Default: #FFFFFF (White)

CRITICAL: Reference SYNTAX_COLORS in "Visual Design System" section.
DO NOT use colors outside GOOGLE_COLORS palette.

Performance:
- Use requestAnimationFrame for smooth animation
- Don't block main thread (async character addition)
- Target duration: 3-5 seconds for typical game file

Cursor:
- Blinking cursor (█) at end of text
- Blink rate: 0.7s cycle

Acceptance:
- Fetches real game source code
- Typewriter animation smooth (50 chars/sec)
- Syntax highlighting visible
- Auto-scrolls to follow text
- Auto-transitions to game after completion
- User can skip with Space key
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 70
})
```

**Implementation notes:**
- Fetch with `fetch(games/${gameName}.js)`
- Use regex for basic syntax highlighting (or library like Prism.js)
- Typewriter: setInterval or requestAnimationFrame to add chars
- Skip: Space key jumps to end, triggers immediate transition

**Syntax highlighting regex patterns:**
```javascript
// CSS for syntax highlighting (Google colors ONLY)
const SYNTAX_STYLES = `
  .comment { color: #5f6368; }  /* Google gray */
  .keyword { color: #4285F4; }  /* Google Blue */
  .string { color: #34A853; }   /* Google Green */
  .number { color: #FBBC04; }   /* Google Yellow */
`

const highlightSyntax = (code) => {
  return code
    .replace(/(\/\/.*$)/gm, '<span class="comment">$1</span>')
    .replace(/\b(const|let|var|class|function|return|if|else)\b/g, '<span class="keyword">$1</span>')
    .replace(/(['"`])(.*?)\1/g, '<span class="string">$1$2$1</span>')
    .replace(/\b(\d+)\b/g, '<span class="number">$1</span>')
}
```

---

**Task 2.4: Game Screen (Iframe Loader)** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 4: Implement game iframe loader",
  description: `
Create GameScreen.js to load and manage game iframes.

IMPORTANT: Games are simple and load instantly - NO loading screens needed.

Functionality:
- Load selected game in iframe (full screen)
- Listen for postMessage from game (gameOver with score)
- Handle Escape key to exit game early (return to gallery)
- Games load instantly (no loading overlay needed)

Iframe Setup:
- <iframe id="game-iframe" src="" frameborder="0">
- Set src from AppState.selectedGame
- Full screen: 100% width/height
- Allow fullscreen, autoplay (for game features)
- Transparent background to show installation white background

Communication:
- On gameOver message: Extract score, go to score entry screen
- Send acknowledgment to game (optional)

Edge Cases:
- Game doesn't send gameOver: Manual exit with Escape
- Escape key: Return to gallery (no confirmation needed)

Exit Behavior:
- Escape key: Immediately return to gallery
- Auto-exit on gameOver message

Acceptance:
- Game loads in iframe immediately
- Full screen display (100% width/height)
- Receives gameOver message with score
- Score transitions to score entry screen
- Escape key returns to gallery immediately
- NO loading screens (games are simple)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 80
})
```

**Implementation notes:**
- Use IframeComm.js for postMessage handling
- Iframe src: `games/${appState.state.selectedGame}.html`
- NO loading overlay needed (games load instantly)
- Iframe should have transparent or white background

---

**Task 2.5: Score Entry Screen** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 5: Implement arcade-style score entry",
  description: `
Create ScoreEntryScreen.js with 3-letter arcade initials input.

Visual Design:
┌────────────────────────┐
│    GAME OVER          │
│  YOUR SCORE: 15,420   │
│                       │
│  ┌──┐ ┌──┐ ┌──┐      │
│  │ A│ │ A │ │ A│      │  <- 3 letter boxes
│  └──┘ └──┘ └──┘      │
│                       │
│  ↑↓: Change Letter    │
│  ←→: Move Cursor      │
│  SPACE: Confirm       │
└────────────────────────┘

Input Mechanics:
- 3 letter boxes, starts at first box with 'A'
- Up/Down arrows: Cycle through A-Z (wraps: Z→A, A→Z)
- Left/Right arrows: Move between 3 boxes
- Space: Confirm entry, move to next box
- After 3rd letter confirmed: Auto-save and go to leaderboard

Visual Feedback:
- Active box: Glowing border, larger size
- Inactive boxes: Normal border
- Current letter: Highlighted

Timeout:
- 30s idle: Auto-submit "AAA" and continue
- Show countdown in corner

Data Flow:
1. Display score from AppState.currentScore
2. Collect 3 letters
3. Call StorageManager.saveScore(game, name, score)
4. Set AppState.playerName
5. Go to leaderboard screen

Acceptance:
- 3-letter input works with arrow keys + space
- Letters cycle A-Z correctly
- Active box highlighted
- Space confirms and advances
- Auto-submit after 3 letters
- Score saved to localStorage
- Transitions to leaderboard
- 30s timeout works
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 90
})
```

**Implementation notes:**
- State: `{ letters: ['A', 'A', 'A'], activeIndex: 0 }`
- Up/Down: Cycle through alphabet (charCode manipulation)
- Left/Right: Change activeIndex (0-2)
- Space: Confirm current letter, increment activeIndex
- After index 2 confirmed: Save and transition

```javascript
// Letter cycling logic:
const cycleLetterUp = (letter) => {
  const code = letter.charCodeAt(0)
  return String.fromCharCode(code === 90 ? 65 : code + 1) // Z→A wrap
}

const cycleLetterDown = (letter) => {
  const code = letter.charCodeAt(0)
  return String.fromCharCode(code === 65 ? 90 : code - 1) // A→Z wrap
}
```

---

**Task 2.6: Leaderboard Screen** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Screen 6: Implement leaderboard display",
  description: `
Create LeaderboardScreen.js displaying top 10 scores for current game.

Visual Design:
┌────────────────────────────────────────┐
│        HIGH SCORES - SNAKE             │
│                                        │
│  RANK  NAME   SCORE        DATE       │
│  ────────────────────────────────────  │
│   🥇   ABC   25,420    Nov 12         │ <- Highlight if new
│   🥈   XYZ   18,500    Nov 11         │
│   🥉   DEF   15,230    Nov 10         │
│   4    GHI   12,100    Nov 09         │
│   ...                                 │
│                                        │
│        Press SPACE to continue         │
│              (15s)                     │
└────────────────────────────────────────┘

Data Loading:
- Load scores from StorageManager.getScores(game)
- Display top 10 scores
- Highlight new entry (if just added)

Table Columns:
- Rank: 1-10 (medals for top 3: 🥇🥈🥉)
- Name: 3 letters
- Score: Formatted with commas (25,420)
- Date: Short format (Nov 12)

Highlighting:
- New entry: Green background, border pulse animation
- Check if playerName matches any entry
- Flash animation for 3 seconds

Auto-Return:
- 15s countdown timer
- Space key: Skip countdown, return to attract
- Countdown shown in bottom corner

Empty Leaderboard:
- Show "No scores yet" message
- Encourage playing games

Acceptance:
- Loads scores from localStorage
- Displays top 10 correctly sorted
- Highlights new entry with animation
- Countdown timer works (15s)
- Space returns to attract screen
- Handles empty leaderboard gracefully
- Score formatting correct (commas)
- Date formatting short and readable
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 100
})
```

**Implementation notes:**
- Load scores: `StorageManager.getScores(appState.state.selectedGame, 10)`
- Number formatting: `score.toLocaleString('en-US')`
- Date formatting:
  ```javascript
  const formatDate = (isoDate) => {
    const d = new Date(isoDate)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
  ```
- Highlight: Check if `playerName === entry.name`
- Countdown: `setInterval` decrementing counter, auto-transition at 0

---

## Phase 3: Integration & Polish (3-4 hours)

### Consolidated Task List (4 Tasks)

**Task 3.1: Screen Transitions** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Polish: Implement smooth screen transitions",
  description: `
Add CSS transitions and animations for screen changes.

Transition Types:
- Attract → Gallery: Fade out + fade in (0.5s)
- Gallery → Code: Slide left (0.3s)
- Code → Game: Fade out (0.2s)
- Game → Score: Fade out game, fade in score (0.5s)
- Score → Leaderboard: Slide up (0.4s)
- Leaderboard → Attract: Fade out, fade in (0.8s)

CSS Implementation:
- Use CSS transitions on .screen class
- Add data-transition attribute for different types
- Use CSS animations for fade/slide effects

Screen Exit/Enter Hooks:
- onExit(screen): Called before hiding screen
- onEnter(screen): Called after showing screen
- Allows cleanup and initialization

Performance:
- Use CSS transforms (GPU accelerated)
- Avoid layout thrashing
- 60fps maintained during transitions

Acceptance:
- All screen transitions smooth
- No layout jumps or flickers
- Transitions feel polished and intentional
- 60fps maintained
- Transition timing feels natural
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 110
})
```

---

**Task 3.2: Error Handling** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Polish: Add comprehensive error handling",
  description: `
Implement error handling for all failure scenarios.

Error Scenarios:
1. Game file not found (404)
2. localStorage quota exceeded
3. Iframe fails to load
4. postMessage timeout (game doesn't respond)
5. Invalid state transitions
6. Corrupt localStorage data

Error Handling Strategy:
- Try/catch around all localStorage operations
- Fallback to default state if localStorage corrupt
- Show error overlay with friendly message
- Log errors to console for debugging
- Auto-recovery where possible

Error Overlay:
- Semi-transparent black background
- Error message in red
- Instructions to user (press Space to continue)
- Return to safe state (attract screen)

localStorage Quota:
- Catch QuotaExceededError
- Clear oldest scores to make room
- Retry save operation
- Notify user if still fails

Iframe Timeouts:
- 5s timeout for gameReady
- If no message, show game anyway (assume ready)
- 10s timeout for gameOver
- If no message, allow manual exit

Acceptance:
- All error scenarios handled gracefully
- No unhandled exceptions
- Error messages user-friendly
- System recovers to safe state
- Errors logged to console
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 120
})
```

---

**Task 3.3: Sound Effects (Optional)** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Polish: Add arcade sound effects (optional)",
  description: `
Add sound effects for key interactions (optional enhancement).

Sound Events:
- Screen transition: Whoosh sound
- Letter change (score entry): Beep
- Letter confirm: Higher beep
- Score save: Success chime
- Game start: Start jingle
- Game over: Game over sound

Implementation:
- Use Web Audio API or <audio> elements
- Pre-load all sounds on page load
- Volume control (configurable)
- Mute option (M key toggles)

Sound Files:
- Use royalty-free arcade sounds
- 8-bit/chiptune aesthetic
- Short (< 1s each)
- Small file size (< 50kb each)

Performance:
- Don't block on audio loading
- Audio failures should not break app
- Use audio sprites for efficiency (optional)

Acceptance:
- Sounds play at correct moments
- Audio doesn't block interactions
- Mute toggle works
- Audio files load without errors
- Fallback if audio not supported
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 130
})
```

**Note:** This task is OPTIONAL. Skip if time-constrained.

---

**Task 3.4: End-to-End Testing** (1-2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Testing: End-to-end flow validation",
  description: `
Test complete flow from attract to leaderboard using Chrome DevTools MCP.

Test Scenario 1: Happy Path
1. Load installation.html
2. Wait on attract screen
3. Press Space → verify gallery appears
4. Press 1 → verify code animation starts
5. Wait for code animation → verify game loads
6. Simulate gameOver message → verify score entry appears
7. Enter initials "TST" → verify leaderboard appears
8. Verify "TST" highlighted in leaderboard
9. Wait 15s → verify return to attract

Test Scenario 2: Quick Game Select
1. From attract, press Space
2. From gallery, press 6 (Snake)
3. Skip code animation with Space
4. Play game briefly
5. Send gameOver message manually
6. Enter initials quickly
7. Verify score appears in leaderboard

Test Scenario 3: Error Recovery
1. Try to load non-existent game
2. Verify error handling
3. Return to safe state
4. Continue flow normally

Chrome DevTools MCP Tests:
- Use mcp__chrome_devtools__new_page
- Use mcp__chrome_devtools__press_key for input
- Use mcp__chrome_devtools__evaluate_script to check state
- Use mcp__chrome_devtools__take_screenshot for visual verification

Performance Validation:
- Run mcp__chrome_devtools__performance_start_trace
- Complete full flow
- Verify 60fps maintained throughout

Acceptance:
- All 3 test scenarios pass
- No console errors during flow
- Performance stays at 60fps
- Scores persist after page reload
- State transitions are correct
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Physical-Installation",
  task_order: 140
})
```

---

## Testing Strategy

### Unit Tests (Vitest)

**Framework:** Vitest (fast, Vite-integrated)

**Setup:**
```bash
npm install -D vitest
# Add to package.json: "test": "vitest"
```

**Critical Test Cases:**

**1. AppState.js Tests** (tests/installation/test_AppState.js)
```javascript
describe('AppState', () => {
  test('transitions between screens correctly', () => {
    const state = new AppState()
    state.goToScreen('gallery')
    expect(state.state.currentScreen).toBe('gallery')
  })

  test('selectGame sets selectedGame', () => {
    const state = new AppState()
    state.selectGame('snake')
    expect(state.state.selectedGame).toBe('snake')
  })

  test('resetState clears game data but keeps leaderboards', () => {
    const state = new AppState()
    state.selectGame('snake')
    state.setScore(1000)
    state.resetState()
    expect(state.state.selectedGame).toBeNull()
    expect(state.state.currentScore).toBeNull()
  })
})
```

**2. StorageManager.js Tests** (tests/installation/test_StorageManager.js)
```javascript
describe('StorageManager', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  test('saves score to localStorage', () => {
    StorageManager.saveScore('snake', 'ABC', 1000)
    const scores = StorageManager.getScores('snake')
    expect(scores[0]).toEqual({
      name: 'ABC',
      score: 1000,
      date: expect.any(String)
    })
  })

  test('keeps only top 10 scores', () => {
    for (let i = 0; i < 15; i++) {
      StorageManager.saveScore('snake', 'TST', i * 100)
    }
    const scores = StorageManager.getScores('snake')
    expect(scores.length).toBe(10)
    expect(scores[0].score).toBe(1400) // Highest
  })

  test('sorts scores descending', () => {
    StorageManager.saveScore('snake', 'AAA', 100)
    StorageManager.saveScore('snake', 'BBB', 500)
    StorageManager.saveScore('snake', 'CCC', 300)
    const scores = StorageManager.getScores('snake')
    expect(scores[0].score).toBe(500)
    expect(scores[1].score).toBe(300)
    expect(scores[2].score).toBe(100)
  })
})
```

**3. IframeComm.js Tests** (tests/installation/test_IframeComm.js)
```javascript
describe('IframeComm', () => {
  test('receives gameReady message', (done) => {
    IframeComm.listenForMessages()
    IframeComm.onGameReady(() => {
      expect(true).toBe(true)
      done()
    })
    // Simulate message from iframe
    window.postMessage({ type: 'gameReady' }, '*')
  })

  test('receives gameOver message with score', (done) => {
    IframeComm.listenForMessages()
    IframeComm.onGameOver((score) => {
      expect(score).toBe(1500)
      done()
    })
    window.postMessage({ type: 'gameOver', payload: { score: 1500 }}, '*')
  })
})
```

---

### Integration Tests (Chrome DevTools MCP)

**Test File:** tests/integration/test_installation_flow.js

```javascript
// Use Chrome DevTools MCP for browser automation

describe('Installation Flow Integration', () => {
  test('complete flow: attract → gallery → game → score → leaderboard', async () => {
    // 1. Load page
    await mcp__chrome_devtools__new_page({
      url: 'http://localhost:5173/installation.html'
    })

    // 2. Verify attract screen visible
    const attractVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('attract-screen').classList.contains('active')
      }`
    })
    expect(attractVisible).toBe(true)

    // 3. Press Space to go to gallery
    await mcp__chrome_devtools__press_key({ key: 'Space' })
    await new Promise(r => setTimeout(r, 500)) // Wait for transition

    // 4. Verify gallery visible
    const galleryVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('gallery-screen').classList.contains('active')
      }`
    })
    expect(galleryVisible).toBe(true)

    // 5. Select Snake game (key 6)
    await mcp__chrome_devtools__press_key({ key: '6' })
    await new Promise(r => setTimeout(r, 500))

    // 6. Verify code screen visible
    const codeVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('code-screen').classList.contains('active')
      }`
    })
    expect(codeVisible).toBe(true)

    // 7. Skip code animation
    await mcp__chrome_devtools__press_key({ key: 'Space' })
    await new Promise(r => setTimeout(r, 500))

    // 8. Verify game screen visible
    const gameVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('game-screen').classList.contains('active')
      }`
    })
    expect(gameVisible).toBe(true)

    // 9. Simulate game over
    await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        window.postMessage({ type: 'gameOver', payload: { score: 1234 }}, '*')
      }`
    })
    await new Promise(r => setTimeout(r, 500))

    // 10. Verify score entry visible
    const scoreVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('score-entry-screen').classList.contains('active')
      }`
    })
    expect(scoreVisible).toBe(true)

    // 11. Enter initials "AAA"
    await mcp__chrome_devtools__press_key({ key: 'Space' })
    await mcp__chrome_devtools__press_key({ key: 'Space' })
    await mcp__chrome_devtools__press_key({ key: 'Space' })
    await new Promise(r => setTimeout(r, 500))

    // 12. Verify leaderboard visible
    const leaderboardVisible = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        return document.getElementById('leaderboard-screen').classList.contains('active')
      }`
    })
    expect(leaderboardVisible).toBe(true)

    // 13. Verify score saved
    const scoreSaved = await mcp__chrome_devtools__evaluate_script({
      function: `() => {
        const scores = JSON.parse(localStorage.getItem('scores_snake') || '[]')
        return scores.some(s => s.score === 1234 && s.name === 'AAA')
      }`
    })
    expect(scoreSaved).toBe(true)
  })
})
```

---

### Manual Testing Checklist

**Flow Testing:**
- [ ] Attract screen shows GoL background
- [ ] Space advances from attract to gallery
- [ ] Gallery shows all 7 games
- [ ] Number keys 1-7 select games
- [ ] Code animation shows real source code
- [ ] Code animation can be skipped with Space
- [ ] Game loads in iframe
- [ ] Game Over message triggers score entry
- [ ] Score entry accepts 3 letters
- [ ] Leaderboard shows top 10 scores
- [ ] New score is highlighted
- [ ] 15s countdown returns to attract
- [ ] Escape returns to attract from any screen

**Edge Cases:**
- [ ] localStorage quota exceeded handled
- [ ] Invalid game name handled
- [ ] Iframe load failure handled
- [ ] postMessage timeout handled
- [ ] Empty leaderboard displays correctly
- [ ] Multiple entries with same score sorted correctly
- [ ] Score entry timeout (30s) works

**Performance:**
- [ ] 60fps maintained on all screens
- [ ] Transitions smooth
- [ ] No memory leaks during extended session
- [ ] localStorage operations don't block UI

**Responsive Design:**
- [ ] White background (#FFFFFF) in content area
- [ ] White letterbox bars (#FFFFFF) on outer edges
- [ ] Works correctly on horizontal screens (1920×1080 laptop)
- [ ] Maintains 5:8 aspect ratio at all screen sizes
- [ ] Content fills screen height on horizontal displays
- [ ] No distortion or stretching
- [ ] Works correctly on vertical screen (1200×1920 target)

**Visual Design (Google Style):**
- [ ] All colors from GOOGLE_COLORS palette only
- [ ] Font is Google Sans (not Courier New)
- [ ] White background throughout (#FFFFFF)
- [ ] Text is Google gray (#5f6368)
- [ ] Accents are Google Blue (#4285F4)
- [ ] No loading screens (games load instantly)

---

## Acceptance Criteria

### Functional Requirements:
- [ ] **FR-1:** All 6 screens implemented and functional
- [ ] **FR-2:** Navigation flow works: attract → gallery → code → game → score → leaderboard → attract
- [ ] **FR-3:** Keyboard controls work on all screens
- [ ] **FR-4:** Games load in iframes without modification
- [ ] **FR-5:** Scores persist in localStorage across sessions
- [ ] **FR-6:** Leaderboard displays top 10 scores per game
- [ ] **FR-7:** New scores are highlighted in leaderboard
- [ ] **FR-8:** Code animation shows real game source code

### Performance Requirements:
- [ ] **PR-1:** System maintains 60fps on all screens at 1200×1920
- [ ] **PR-2:** Screen transitions smooth (no jank)
- [ ] **PR-3:** GoL background (40×64 cells) runs at 10fps without impacting main loop
- [ ] **PR-4:** Code animation runs at 50 chars/sec smoothly
- [ ] **PR-5:** No memory leaks during 1 hour session

### Technical Requirements:
- [ ] **TR-1:** Pure SPA architecture (no page reloads)
- [ ] **TR-2:** Games isolated in iframes (no cross-contamination)
- [ ] **TR-3:** postMessage communication works reliably
- [ ] **TR-4:** localStorage operations error-handled
- [ ] **TR-5:** Code follows CLAUDE.md conventions
- [ ] **TR-6:** All Archon tasks marked "done"

### User Experience Requirements:
- [ ] **UX-1:** Clear visual feedback for all interactions
- [ ] **UX-2:** Transitions feel polished and intentional
- [ ] **UX-3:** Error messages user-friendly
- [ ] **UX-4:** Keyboard controls consistent across screens
- [ ] **UX-5:** Arcade aesthetic maintained throughout

---

## Validation Commands

**Pre-flight checks:**
```bash
cd LifeArcade
ls installation.html  # Should exist
npm run dev           # Start dev server
```

**Development:**
```bash
npm run dev
# Navigate to http://localhost:5173/installation.html
```

**Testing:**
```bash
npm test                         # Run unit tests
npm test -- --coverage           # Coverage report
npm test -- installation         # Test only installation modules
```

**Performance validation:**
```bash
# Open http://localhost:5173/installation.html
# Open browser DevTools → Performance tab
# Record complete flow (attract → leaderboard)
# Verify:
# - FPS: 58-60fps throughout
# - No long tasks (> 50ms)
# - Memory stable (no leaks)
```

**Manual validation:**
```bash
# Test complete flow:
# 1. Wait on attract (verify GoL animates)
# 2. Press Space → gallery appears
# 3. Press 6 → Snake code animation
# 4. Wait or skip → game loads
# 5. Play briefly → game over
# 6. Enter initials → leaderboard
# 7. Wait 15s → back to attract
# 8. Refresh page → scores persist
```

**localStorage inspection:**
```javascript
// In browser console:
Object.keys(localStorage)
  .filter(k => k.startsWith('scores_'))
  .forEach(k => console.log(k, JSON.parse(localStorage[k])))
```

---

## Additional Notes for the Agent

### CRITICAL: Game Integration for Installation

**Games MUST be modified to integrate with the installation system.**

Currently, games show a Game Over popup and wait for SPACE to restart. This flow must change for the physical installation.

### Required Changes to All 7 Games

**File pattern:** `games/{game-name}.js`

**1. Add postMessage on Game Over**

Find the `triggerGameOver()` function and add postMessage BEFORE showing Game Over screen:

```javascript
// ❌ CURRENT (games/{game}.js):
function triggerGameOver() {
  state.phase = 'GAMEOVER'
  spawnExplosion(...)  // Visual effect
}

// ✅ NEW (for installation):
function triggerGameOver() {
  state.phase = 'GAMEOVER'
  spawnExplosion(...)  // Visual effect

  // Send score to parent installation
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'gameOver',
      payload: { score: state.score }
    }, '*')
  }
}
```

**2. Remove Game Over Popup in Installation Mode**

Modify the `draw()` function to NOT show Game Over screen when in iframe:

```javascript
// ❌ CURRENT:
function draw() {
  // ... game logic ...

  if (state.phase === 'GAMEOVER') {
    renderGameOver(width, height, state.score)  // Shows popup
  }
}

// ✅ NEW (conditional rendering):
function draw() {
  // ... game logic ...

  if (state.phase === 'GAMEOVER') {
    // Only show Game Over popup if NOT in iframe (standalone mode)
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
    // In iframe mode, just show frozen game state (no popup)
    // Installation will handle transition to Score Entry screen
  }
}
```

**3. Disable SPACE Restart in Installation Mode**

Modify `keyPressed()` to prevent restart when in iframe:

```javascript
// ❌ CURRENT:
function keyPressed() {
  // Restart on SPACE during GAMEOVER
  if (state.phase === 'GAMEOVER' && (key === ' ' || keyCode === 32)) {
    initGame()  // Restart game
    return
  }
  // ... other controls ...
}

// ✅ NEW (conditional restart):
function keyPressed() {
  // Restart on SPACE during GAMEOVER (only in standalone mode)
  if (state.phase === 'GAMEOVER' && (key === ' ' || keyCode === 32)) {
    // Only allow restart if NOT in iframe
    if (window.parent === window) {
      initGame()
    }
    return
  }
  // ... other controls ...
}
```

### Detection Pattern

**How to detect if game is in iframe:**
```javascript
const isInIframe = window.parent !== window
const isStandalone = window.parent === window
```

### Complete Integration Example

```javascript
// games/snake.js (example)

function triggerGameOver() {
  state.phase = 'GAMEOVER'
  spawnExplosion(snake.head.x + snake.head.width / 2, snake.head.y + snake.head.height / 2)

  // ✅ Send postMessage to installation
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'gameOver',
      payload: { score: state.score }
    }, '*')
  }
}

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

  // ✅ Only show popup in standalone mode
  if (state.phase === 'GAMEOVER' && window.parent === window) {
    renderGameOver(width, height, state.score)
  }
}

function keyPressed() {
  // ✅ Only allow restart in standalone mode
  if (state.phase === 'GAMEOVER' && (key === ' ' || keyCode === 32)) {
    if (window.parent === window) {
      initGame()
    }
    return
  }

  // ... other controls ...
}
```

### Why These Changes Are Necessary

**Current standalone flow:**
```
Game → triggerGameOver() → Show popup → Wait for SPACE → Restart game
```

**New installation flow:**
```
Game → triggerGameOver() → Send postMessage → Installation transitions to Score Entry → (game stays frozen in iframe)
```

### Testing Both Modes

**Standalone mode (direct access):**
- URL: `http://localhost:5173/games/snake.html`
- Behavior: Game Over popup shows, SPACE restarts
- `window.parent === window` → true

**Installation mode (iframe):**
- URL: `http://localhost:5173/installation.html`
- Game loaded in `<iframe src="games/snake.html">`
- Behavior: postMessage sent, no popup, no restart
- `window.parent !== window` → true

### Apply to All 7 Games

This modification must be applied to:
1. `games/space-invaders.js`
2. `games/dino-runner.js`
3. `games/breakout.js`
4. `games/asteroids.js`
5. `games/flappy-bird.js`
6. `games/snake.js`
7. `games/pong.js`

**Each game has:**
- `triggerGameOver()` function → Add postMessage
- `draw()` function → Conditional renderGameOver()
- `keyPressed()` function → Conditional initGame()

---

### Common Pitfalls to Avoid

1. ❌ **NOT modifying games for installation** (games MUST be modified per Task 1.5)
2. ❌ **Using page reloads** instead of SPA navigation
3. ❌ **Blocking UI thread** during localStorage operations
4. ❌ **Not validating postMessage origin** (security risk)
5. ❌ **Hardcoding game list** (use data structure)
6. ❌ **Not handling localStorage quota exceeded**
7. ❌ **Forgetting to clean up event listeners** (memory leaks)
8. ❌ **Not escaping HTML** in code animation (XSS risk)
9. ❌ **INVENTING COLORS** - Only use GOOGLE_COLORS from GradientPresets.js
10. ❌ **Using terminal green (#00FF00)** or any non-Google colors
11. ❌ **Using Courier New or monospace fonts** (use Google Sans)
12. ❌ **Not following gallery.html aesthetic** (MUST match existing design)
13. ❌ **Custom animation timings** (use Material Design timings from UI_STYLE)
14. ❌ **Using black background (#000000) for content** (use WHITE #FFFFFF, Google style)
15. ❌ **Not implementing responsive design** (must work on horizontal screens for debugging)
16. ❌ **Breaking aspect ratio** (must maintain 5:8 ratio with letterboxing)

---

### Success Indicators

Implementation is complete when:
- ✅ All 6 screens functional
- ✅ Complete flow works end-to-end
- ✅ Scores persist across sessions
- ✅ All Archon tasks marked "done"
- ✅ Unit tests pass
- ✅ Integration test passes
- ✅ 60fps maintained
- ✅ Zero console errors
- ✅ Code follows CLAUDE.md conventions
- ✅ **Visual design matches Google minimalism (white background)**
- ✅ **Only uses colors from GOOGLE_COLORS (no custom colors)**
- ✅ **Typography uses Google Sans (no Courier New)**
- ✅ **All CSS follows UI_STYLE specifications**
- ✅ **Responsive design works (letterboxing on horizontal screens)**
- ✅ **Aspect ratio 5:8 maintained at all screen sizes**
- ✅ **No loading screens (games load instantly)**

---

## Deliverables

When you complete all 3 phases, provide:

### Summary Message

```
Physical Installation Complete: 6-Screen Arcade System ✅

Implementation completed:
- [x] Phase 1: Core Infrastructure
  - [x] SPA container (installation.html)
  - [x] State machine (AppState.js)
  - [x] localStorage manager (StorageManager.js)
  - [x] Iframe communication (IframeComm.js)
  - [x] **Game integration (all 7 games modified for postMessage)**

- [x] Phase 2: Screen Implementations
  - [x] Screen 1: Attract (GoL background)
  - [x] Screen 2: Gallery (game selection)
  - [x] Screen 3: Code Animation (typewriter)
  - [x] Screen 4: Game (iframe loader)
  - [x] Screen 5: Score Entry (3-letter input)
  - [x] Screen 6: Leaderboard (top 10 table)

- [x] Phase 3: Integration & Polish
  - [x] Screen transitions
  - [x] Error handling
  - [x] Sound effects (optional)
  - [x] End-to-end testing

Performance validation:
- 60fps maintained throughout ✅
- Transitions smooth ✅
- localStorage operations fast ✅

All Archon tasks completed:
- Phase 1: 5/5 tasks done (including game integration)
- Phase 2: 6/6 tasks done
- Phase 3: 4/4 tasks done

Files created:
- installation.html (SPA container)
- src/installation/AppState.js
- src/installation/StorageManager.js
- src/installation/InputManager.js
- src/installation/IframeComm.js
- src/screens/AttractScreen.js
- src/screens/GalleryScreen.js
- src/screens/CodeAnimationScreen.js
- src/screens/GameScreen.js
- src/screens/ScoreEntryScreen.js
- src/screens/LeaderboardScreen.js
- tests/installation/test_AppState.js
- tests/installation/test_StorageManager.js
- tests/installation/test_IframeComm.js

Files modified:
- games/space-invaders.js (postMessage integration)
- games/dino-runner.js (postMessage integration)
- games/breakout.js (postMessage integration)
- games/asteroids.js (postMessage integration)
- games/flappy-bird.js (postMessage integration)
- games/snake.js (postMessage integration)
- games/pong.js (postMessage integration)

Ready for deployment to Mac Mini M4 in kiosk mode
```

---

## Phase Completion Checklist

**Phase 1 Complete:**
- [ ] installation.html created with 6 screen divs
- [ ] AppState.js implements state machine
- [ ] StorageManager.js handles localStorage
- [ ] IframeComm.js handles postMessage
- [ ] **All 7 games modified for installation (postMessage, conditional Game Over)**
- [ ] **Games work in both standalone and iframe modes**
- [ ] Unit tests pass
- [ ] All Phase 1 Archon tasks marked "done"

**Phase 2 Complete:**
- [ ] AttractScreen.js shows GoL background
- [ ] GalleryScreen.js displays 7 games
- [ ] CodeAnimationScreen.js animates code
- [ ] GameScreen.js loads games in iframe
- [ ] ScoreEntryScreen.js accepts 3 letters
- [ ] LeaderboardScreen.js shows top 10
- [ ] All Phase 2 Archon tasks marked "done"

**Phase 3 Complete:**
- [ ] Screen transitions smooth
- [ ] Error handling comprehensive
- [ ] Sound effects added (optional)
- [ ] End-to-end test passes
- [ ] Performance validated (60fps)
- [ ] All Phase 3 Archon tasks marked "done"

**Final Validation:**
- [ ] Complete flow tested manually
- [ ] Scores persist after page reload
- [ ] All acceptance criteria met
- [ ] No console errors
- [ ] README.md updated with installation instructions
- [ ] Ready for Mac Mini deployment

---

**Next Steps After Completion:**

1. Test on Mac Mini M4 hardware
2. Configure Chrome kiosk mode
3. Test with physical arcade controls
4. Add games' postMessage integration (enhancement)
5. Deploy to production

---

_End of Implementation Plan_
