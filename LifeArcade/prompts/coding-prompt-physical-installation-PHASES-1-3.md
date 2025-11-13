# Coding Prompt: Physical Installation - Phases 1-3

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

> **Multi-Phase Implementation Strategy**
>
> This project is divided into 3 sequential phases to manage complexity:
> - **Phase 1 (Game Resolution & Communication):** Fix all 7 games to 1200×1920 portrait and add postMessage
> - **Phase 2 (Installation System):** Create 8 screens and navigation infrastructure
> - **Phase 3 (Integration & Testing):** Complete end-to-end flow and polish
>
> Complete each phase and validate before proceeding to the next.

---

## Feature Description and Problem Solving

**Feature:** Implement the physical installation system for LifeArcade with 8-screen flow, game integration via iframes, and arcade-style navigation.

**Problem it's solving:**
- Creating a seamless SPA + iframe hybrid architecture for arcade installation
- Integrating existing games (currently 800×600) into portrait installation (1200×1920)
- Establishing Game Over communication flow between games and installation system
- Building arcade-style screen navigation with keyboard controls and auto-timeouts
- Implementing leaderboard persistence across sessions using localStorage

---

## User Story

```
As an arcade installation operator,
I need a complete 8-screen arcade experience with game integration,
So that users can select games, play, enter scores, and view leaderboards in a continuous loop.

Acceptance Criteria (Phases 1-3):
Phase 1:
- All 7 games run at 1200×1920 (portrait orientation)
- Game Over sends postMessage to parent window with score
- Games work both standalone and in installation iframe
- No scrollbars visible in any game

Phase 2:
- 8 screens implemented: Idle, Welcome, Gallery, Code Animation, Game, Score Entry, Leaderboard, QR
- Screen navigation works via keyboard (Space, Escape, 1-7, Arrows)
- Auto-timeouts advance screens when appropriate
- localStorage persists leaderboards per game (top 10)
- postMessage communication system handles Game Over events

Phase 3:
- Complete flow works end-to-end: Idle → ... → QR → Idle
- All 7 games tested in installation
- Transitions are smooth with no visual glitches
- Performance targets met (60fps throughout)
- Escape key returns to Idle from any screen
```

---

## Solution and Approach

**Phase 1 Goals:**
1. Modify all 7 games from 800×600 to 1200×1920 resolution
2. Add postMessage communication on Game Over
3. Fix game layouts and UI for portrait orientation
4. Remove scrollbars from all games

**Phase 2 Goals:**
1. Create 8 screen JavaScript modules
2. Build installation infrastructure (AppState, Storage, Input, Iframe managers)
3. Implement screen navigation with keyboard controls
4. Add leaderboard persistence
5. Create Gallery screen with game selection

**Phase 3 Goals:**
1. Test complete flow end-to-end with all 7 games
2. Add screen transitions and polish
3. Performance optimization
4. Error handling for edge cases

**Why this approach:**
- **Foundation first:** Fix games before building system around them
- **Validate early:** Ensure postMessage works before complex navigation
- **Incremental complexity:** Add one screen at a time
- **Test continuously:** Validate each phase before proceeding

---

## Relevant Files from Codebase

**Current State:**

**✅ Already exists (fully functional):**
```
LifeArcade/
├── src/
│   ├── core/
│   │   └── GoLEngine.js              # B3/S23 engine, ready
│   ├── rendering/
│   │   └── SimpleGradientRenderer.js  # Masked rendering, ready
│   ├── utils/
│   │   ├── Collision.js              # Hitbox collision, ready
│   │   ├── Config.js                 # Global config, ready
│   │   ├── GoLHelpers.js             # Life force, seeding, ready
│   │   ├── GradientPresets.js        # Google colors, ready
│   │   ├── ParticleHelpers.js        # Particle system, ready
│   │   ├── Patterns.js               # GoL patterns, ready
│   │   └── UIHelpers.js              # Game UI rendering, ready
│   └── validation/
│       ├── gol-validator.js          # GoL validation, ready
│       └── ui-validator.js           # UI validation, ready
├── games/                             # 7 games exist but need modification
│   ├── space-invaders.js/html        # 800×600 → needs 1200×1920
│   ├── dino-runner.js/html           # 800×600 → needs 1200×1920
│   ├── breakout.js/html              # 800×600 → needs 1200×1920
│   ├── asteroids.js/html             # 800×600 → needs 1200×1920
│   ├── flappy-bird.js/html           # 800×600 → needs 1200×1920
│   ├── snake.js/html                 # 800×600 → needs 1200×1920
│   └── pong.js/html                  # 800×600 → needs 1200×1920
└── installation.html                  # Shell exists, no JavaScript
```

**❌ Need to create:**
```
LifeArcade/
├── src/
│   ├── installation/                 # Phase 2
│   │   ├── AppState.js              # State machine + navigation
│   │   ├── StorageManager.js        # localStorage wrapper
│   │   ├── InputManager.js          # Keyboard input handler
│   │   └── IframeComm.js            # postMessage handling
│   └── screens/                      # Phase 2
│       ├── IdleScreen.js            # Screen 1: GoL background
│       ├── WelcomeScreen.js         # Screen 2: Title + "Press SPACE"
│       ├── GalleryScreen.js         # Screen 3: 7 games grid
│       ├── CodeAnimationScreen.js   # Screen 4: Typewriter effect
│       ├── GameScreen.js            # Screen 5: iframe container
│       ├── ScoreEntryScreen.js      # Screen 6: 3-letter input
│       ├── LeaderboardScreen.js     # Screen 7: Top 10 table
│       └── QRCodeScreen.js          # Screen 8: QR code
└── tests/installation/               # Phase 3
    ├── test_AppState.js
    ├── test_StorageManager.js
    └── test_IframeComm.js
```

---

## Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Get available knowledge sources
mcp__archon__rag_get_available_sources()

// Step 2: Search for p5.js integration patterns
mcp__archon__rag_search_knowledge_base({
  query: "p5js iframe communication postMessage",
  source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
  match_count: 5
})

// Step 3: Search for Vite configuration
mcp__archon__rag_search_knowledge_base({
  query: "vite dev server multiple html files",
  source_id: "22832de63c03f570",  // Vite Documentation
  match_count: 5
})

// Step 4: Find code examples
mcp__archon__rag_search_code_examples({
  query: "iframe postMessage communication",
  match_count: 3
})
```

### Available Archon Knowledge Sources

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `22832de63c03f570` | Vite Documentation | 60k | Dev server, HMR, build configuration |
| `da752d5fc3c907ba` | Vitest Documentation | 113k | Testing API, matchers, configuration |
| `04f933e8f516da35` | Typed.js (GitHub) | 188k | Typewriter effects, animations |
| `e17c0329eb0f6098` | Prism.js Documentation | 50k | Syntax highlighting |

### Step 2: External URLs (last resort only)

- [MDN - postMessage API](https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage)
- [QRCode.js Library](https://davidshimjs.github.io/qrcodejs/)

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
  title: "Phase 1: Modify Space Invaders to 1200×1920",
  description: "Change canvas size, adjust gameplay for portrait, add postMessage on Game Over, remove scrollbars",
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-GameMods"
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
  filter_value: "Phase1-GameMods"
})
```

**Task Granularity Guidelines:**
- Each task should be 30 minutes to 2 hours of work
- Tasks should have clear, testable acceptance criteria
- Use `feature` field to group related tasks: "Phase1-GameMods", "Phase2-Screens", "Phase3-Integration"

---

## Phase 1 Implementation Plan (Game Modifications)

**Objective:** Modify all 7 games to 1200×1920 portrait and add postMessage communication

**Total Time Estimate:** 7-8 hours (1 hour per game + 1h testing)

### Consolidated Task List (8 Tasks)

**Task 1: Modify Space Invaders Game** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 1: Space Invaders - Resolution & Game Over",
  description: `
Modify Space Invaders for portrait installation.

Changes required:
1. Resolution (15min):
   - Change createCanvas(800, 600) to createCanvas(1200, 1920)
   - Verify canvas displays correctly

2. Gameplay Adjustments (30min):
   - Adjust player start position (center bottom)
   - Adjust enemy grid layout (more rows for portrait)
   - Reposition score/lives UI (top of screen)
   - Verify bullet trajectories work correctly
   - Ensure no elements go off-screen

3. Game Over Communication (10min):
   - Add postMessage in triggerGameOver():
     if (window.parent !== window) {
       window.parent.postMessage({
         type: 'gameOver',
         payload: { score: state.score }
       }, '*')
     }
   - Modify draw() to skip renderGameOver() in installation mode
   - Modify keyPressed() to skip restart in installation mode

4. Remove Scrollbars (5min):
   - Add to CSS: body { overflow: hidden; }

Testing:
- [ ] Game runs at 1200×1920
- [ ] Gameplay works correctly in portrait
- [ ] Game Over sends postMessage (check console)
- [ ] No scrollbars visible
- [ ] Game still works standalone (open .html directly)

File: games/space-invaders.js + space-invaders.html
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-GameMods",
  task_order: 10
})
```

**Task 2-7: Modify Remaining Games** (6 hours)

Create identical tasks for:
- Dino Runner (task_order: 20)
- Breakout (task_order: 30)
- Asteroids (task_order: 40)
- Flappy Bird (task_order: 50)
- Snake (task_order: 60)
- Pong (task_order: 70)

**Each game follows the same pattern:**
1. Change canvas to 1200×1920
2. Adjust gameplay for portrait
3. Add postMessage on Game Over
4. Remove scrollbars
5. Test standalone and installation modes

**Task 8: Test All Games in Installation** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 1: Test all games postMessage",
  description: `
Create minimal test harness to verify postMessage from all 7 games.

Create: tests/installation/test-postmessage.html

Test harness should:
1. Create iframe for each game
2. Listen for postMessage events
3. Log received messages to console
4. Display game name + score when received

Test procedure:
- Load test-postmessage.html
- For each game:
  - Click to load game in iframe
  - Play until Game Over
  - Verify postMessage logged to console
  - Verify score displayed correctly

Acceptance:
- [ ] All 7 games send postMessage on Game Over
- [ ] Scores transmitted correctly
- [ ] No console errors
- [ ] Games don't show popup in iframe mode

Files: tests/installation/test-postmessage.html
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-GameMods",
  task_order: 80
})
```

---

## Phase 2 Implementation Plan (Installation System)

**Objective:** Create 8 screens and navigation infrastructure

**Total Time Estimate:** 12-14 hours

### Consolidated Task List (13 Tasks)

**Task 1: AppState - State Machine** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Create AppState state machine",
  description: `
Create centralized state machine for screen navigation.

Implementation:
- Create src/installation/AppState.js
- Define 8 screen states: 'idle', 'welcome', 'gallery', 'code', 'game', 'score', 'leaderboard', 'qr'
- Implement Observer pattern for screen changes
- Implement transition() method with validation
- Implement reset() method (returns to idle)

State properties:
- currentScreen: string (one of 8 states)
- selectedGame: string | null (game name)
- currentScore: number | null
- playerName: string | null (3 letters)
- timeoutHandles: {} (for auto-advance timers)

Methods:
- transition(newScreen): Validate and change screen
- setGame(gameName): Store selected game
- setScore(score): Store final score
- setPlayerName(name): Store 3-letter name
- reset(): Clear session data, return to idle
- addObserver(callback): Register screen change listener
- notifyObservers(): Trigger all listeners

Acceptance:
- [ ] All 8 screen states defined
- [ ] Transition validation prevents invalid flows
- [ ] Observers notified on state change
- [ ] reset() clears all session data

File: src/installation/AppState.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 10
})
```

**Task 2: StorageManager** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Create StorageManager for leaderboards",
  description: `
Create localStorage wrapper for leaderboard persistence.

Implementation:
- Create src/installation/StorageManager.js
- Implement saveScore(gameName, name, score)
- Implement getScores(gameName): Returns top 10 sorted by score descending
- Implement clearScores(gameName): Delete all scores for game
- Handle localStorage quota exceeded errors

Storage format:
Key: 'scores_{gameName}'
Value: JSON array of { name: string, score: number, date: ISO string }

Methods:
- saveScore(gameName, name, score): Add new score, keep top 10
- getScores(gameName): Return sorted array (top 10)
- clearScores(gameName): Delete all scores
- isHighScore(gameName, score): Check if score makes top 10

Error handling:
- Try/catch around all localStorage operations
- If quota exceeded, remove oldest scores
- Return empty array if no scores exist

Acceptance:
- [ ] Scores persist across browser refresh
- [ ] Top 10 maintained per game
- [ ] Scores sorted descending
- [ ] Quota exceeded handled gracefully

File: src/installation/StorageManager.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 20
})
```

**Task 3: InputManager** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Create InputManager for keyboard",
  description: `
Create keyboard input manager for arcade controls.

Implementation:
- Create src/installation/InputManager.js
- Listen for keydown/keyup events
- Prevent default browser behaviors
- Provide simple API for checking key state

Supported keys:
- Space: Primary action (advance, confirm)
- Escape: System reset (return to idle)
- 1-7: Quick game selection
- ArrowUp/Down/Left/Right: Navigation
- Enter: Alternative confirm

Methods:
- isPressed(keyCode): Check if key currently pressed
- wasJustPressed(keyCode): Check if key pressed this frame
- onKeyPress(callback): Register callback for any keypress
- preventDefaults(): Prevent browser shortcuts

Implementation details:
- Track key state in Map
- Clear "just pressed" state each frame
- Prevent: Space scrolling, F11, Ctrl+W, etc.

Acceptance:
- [ ] All arcade keys captured correctly
- [ ] Browser shortcuts disabled
- [ ] wasJustPressed() works correctly
- [ ] No key repeat issues

File: src/installation/InputManager.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 30
})
```

**Task 4: IframeComm** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Create IframeComm for postMessage",
  description: `
Create iframe communication manager for Game Over events.

Implementation:
- Create src/installation/IframeComm.js
- Listen for postMessage from game iframes
- Validate message format and origin
- Trigger callbacks on valid Game Over events
- Handle timeout if no message received

Message format expected from games:
{
  type: 'gameOver',
  payload: { score: number }
}

Methods:
- onGameOver(callback): Register Game Over handler
- startListening(): Begin listening for postMessage
- stopListening(): Remove listeners
- sendAcknowledgment(iframe): Send ack to game

Implementation details:
- Validate message.type === 'gameOver'
- Validate message.payload.score is number
- 15 second timeout if no message received
- Security: Validate origin if deployed

Acceptance:
- [ ] Receives postMessage from games correctly
- [ ] Validates message format
- [ ] Timeout triggers after 15s if no message
- [ ] Acknowledgment sent to game

File: src/installation/IframeComm.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 40
})
```

**Task 5: IdleScreen** (2 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement IdleScreen (Screen 1)",
  description: `
Create Idle screen with GoL background animation.

Visual:
- Full-screen GoL background (40×64 grid, 10fps)
- No text, no UI, pure visual showcase
- Advances ONLY on Space key press (no timeout)

Implementation:
- Create src/screens/IdleScreen.js
- Use existing GoLEngine from src/core/
- Use existing SimpleGradientRenderer
- Random seed on initialization (~30% density)
- Update GoL at 10fps (throttled)
- Render at 60fps

Integration:
- Export show() method: Initialize p5.js canvas, start animation
- Export hide() method: Stop animation, clear canvas
- Listen for Space key to trigger transition

Acceptance:
- [ ] GoL background animates smoothly
- [ ] Update rate is 10fps, render is 60fps
- [ ] Space key advances to Welcome screen
- [ ] No timeout (stays on Idle forever if no input)
- [ ] Performance: 60fps sustained

File: src/screens/IdleScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 50
})
```

**Task 6: WelcomeScreen** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement WelcomeScreen (Screen 2)",
  description: `
Create Welcome screen with title and prompt.

Visual:
- White background (#FFFFFF)
- Center: "GAME OF LIFE ARCADE" (Google Blue #4285F4)
- Subtitle: "Conway's Cellular Automaton Games"
- Prompt: "Press SPACE to start" (Google Gray #5f6368)
- Google Sans font, minimal design

Implementation:
- Create src/screens/WelcomeScreen.js
- Pure HTML/CSS, no p5.js needed
- Fade in animation (0.5s)
- Space key advances to Gallery

Integration:
- Export show() method: Display screen, add event listeners
- Export hide() method: Remove event listeners, clear screen

CSS:
- Flexbox for centering
- Google Sans font
- Smooth fade-in transition

Acceptance:
- [ ] Title displays correctly centered
- [ ] Font is Google Sans
- [ ] Colors match Google brand (Blue, Gray)
- [ ] Space key advances to Gallery
- [ ] Fade-in animation smooth

File: src/screens/WelcomeScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 60
})
```

**Task 7: GalleryScreen** (2 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement GalleryScreen (Screen 3)",
  description: `
Create Gallery screen with 7 game selection grid.

Visual:
- 2×4 grid layout (portrait optimized)
- Game tiles with: Thumbnail, Name, Brief description
- Keyboard navigation: 1-7 for quick select, Arrows + Space
- Highlight selected game

Implementation:
- Create src/screens/GalleryScreen.js
- Define 7 games array with metadata
- Render grid with CSS Grid
- Keyboard selection logic
- Highlight current selection

Game metadata:
[
  { id: 'space-invaders', name: 'Space Invaders', path: 'games/space-invaders.html' },
  { id: 'dino-runner', name: 'Dino Runner', path: 'games/dino-runner.html' },
  { id: 'breakout', name: 'Breakout', path: 'games/breakout.html' },
  { id: 'asteroids', name: 'Asteroids', path: 'games/asteroids.html' },
  { id: 'flappy-bird', name: 'Flappy Bird', path: 'games/flappy-bird.html' },
  { id: 'snake', name: 'Snake', path: 'games/snake.html' },
  { id: 'pong', name: 'Pong', path: 'games/pong.html' }
]

Keyboard:
- 1-7: Quick select game
- Arrow keys: Navigate grid
- Space: Confirm selection
- Escape: Return to Idle

Acceptance:
- [ ] All 7 games displayed in grid
- [ ] Keyboard navigation works smoothly
- [ ] Quick select (1-7) works
- [ ] Selection highlights correctly
- [ ] Space advances to Code Animation

File: src/screens/GalleryScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 70
})
```

**Task 8: CodeAnimationScreen** (2 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement CodeAnimationScreen (Screen 4)",
  description: `
Create Code Animation screen with typewriter effect.

Visual:
- Header: "GENERATING: {game-name}.js"
- Body: Code display area with syntax highlighting
- Typewriter effect: character-by-character animation
- Auto-scroll as code appears
- Auto-advance when complete (~5-10s)

Implementation:
- Create src/screens/CodeAnimationScreen.js
- Fetch game source code from games/{game-name}.js
- Apply syntax highlighting with Google colors
- Animate with Typed.js or custom implementation
- Auto-advance to Game screen when complete

Syntax highlighting colors:
- Comments: #5f6368 (Google gray)
- Keywords: #4285F4 (Google blue)
- Strings: #34A853 (Google green)
- Numbers: #FBBC04 (Google yellow)

Implementation notes:
- Use Typed.js for typewriter effect
- Parse code with simple regex for syntax
- Speed: ~50ms per character
- Auto-advance after typing complete + 1s pause

Acceptance:
- [ ] Fetches game source correctly
- [ ] Typewriter effect smooth
- [ ] Syntax highlighting matches Google colors
- [ ] Auto-scrolls as code appears
- [ ] Auto-advances to Game screen

Files: src/screens/CodeAnimationScreen.js
Dependencies: typed.js (install via npm)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 80
})
```

**Task 9: GameScreen** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement GameScreen (Screen 5)",
  description: `
Create Game screen as fullscreen iframe container.

Visual:
- Fullscreen iframe (1200×1920)
- No UI chrome, no borders
- Game fills entire screen

Implementation:
- Create src/screens/GameScreen.js
- Create iframe element dynamically
- Load selected game HTML
- Listen for postMessage (Game Over)
- Handle Escape key to exit early

Integration with IframeComm:
- Use IframeComm to listen for gameOver message
- On message received: Store score, advance to Score Entry
- On Escape: Return to Idle (no score)

Timeout handling:
- If no gameOver message after 30 minutes, return to Idle
- Show warning before timeout (optional)

Acceptance:
- [ ] Game loads in fullscreen iframe
- [ ] No scrollbars or chrome visible
- [ ] Receives postMessage correctly
- [ ] Escape key returns to Idle
- [ ] Timeout works if game hangs

File: src/screens/GameScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 90
})
```

**Task 10: ScoreEntryScreen** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement ScoreEntryScreen (Screen 6)",
  description: `
Create Score Entry screen with arcade-style 3-letter input.

Visual:
- Header: "GAME OVER"
- Display: Final score (large, centered)
- Input: 3 letter boxes (A-Z only)
- Instructions: "← → to change, SPACE to confirm"

Implementation:
- Create src/screens/ScoreEntryScreen.js
- Three letter selectors (A-Z cycle)
- Arrow keys to change letters
- Space to confirm each letter
- Auto-advance when 3 letters entered

Letter selection:
- Start with "A", "A", "A"
- Up/Down arrows cycle through A-Z
- Left/Right arrows move between letter positions
- Space confirms current letter, moves to next
- After 3 letters confirmed: Save to localStorage, advance to Leaderboard

Integration:
- Get score from AppState
- Save to StorageManager when complete
- Advance to Leaderboard

Acceptance:
- [ ] 3 letter input works smoothly
- [ ] Arrow keys cycle A-Z correctly
- [ ] Space confirms and advances
- [ ] Score saved to localStorage
- [ ] Auto-advances to Leaderboard

File: src/screens/ScoreEntryScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 100
})
```

**Task 11: LeaderboardScreen** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement LeaderboardScreen (Screen 7)",
  description: `
Create Leaderboard screen with top 10 scores.

Visual:
- Header: "{GAME_NAME} - TOP 10"
- Table: Rank, Name, Score columns
- Highlight: New entry (if just entered)
- Footer: "Press SPACE to continue"
- Auto-timeout: 30 seconds

Implementation:
- Create src/screens/LeaderboardScreen.js
- Load scores from StorageManager
- Display top 10 sorted descending
- Highlight new entry with Google Blue
- Space or timeout advances to QR

Table format:
Rank  Name   Score
 1    XYZ    25,420
 2    JOE    18,500
 3  ► ABC ◄  12,345  ← New entry (highlighted)
 ...

Integration:
- Get game name from AppState
- Load scores from StorageManager.getScores(gameName)
- Highlight player name if just entered

Acceptance:
- [ ] Displays top 10 scores correctly
- [ ] Scores sorted descending
- [ ] New entry highlighted
- [ ] Space advances to QR
- [ ] 30s timeout works

File: src/screens/LeaderboardScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 110
})
```

**Task 12: QRCodeScreen** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Implement QRCodeScreen (Screen 8)",
  description: `
Create QR Code screen for web version.

Visual:
- Header: "PLAY ON THE WEB"
- QR Code: Large, centered
- URL: Display below QR code
- Footer: "Scan with your phone"
- Auto-timeout: 15 seconds

Implementation:
- Create src/screens/QRCodeScreen.js
- Generate QR code linking to web version of game
- Use QRCode.js library
- Space or timeout returns to Idle

QR code generation:
- URL format: https://yoursite.com/games/{game-name}
- Generate on show() method
- Clear on hide() method

Integration:
- Get game name from AppState
- Generate URL: base URL + game name
- Reset AppState when advancing to Idle

Acceptance:
- [ ] QR code generates correctly
- [ ] URL displays below QR code
- [ ] Space returns to Idle
- [ ] 15s timeout works
- [ ] AppState resets on transition

Files: src/screens/QRCodeScreen.js
Dependencies: qrcodejs (install via npm or CDN)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 120
})
```

**Task 13: Update installation.html** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 2: Update installation.html with modules",
  description: `
Update installation.html to import and initialize all modules.

Changes required:
1. Import all manager modules (AppState, Storage, Input, IframeComm)
2. Import all screen modules (8 screens)
3. Initialize managers on load
4. Register screen observers
5. Start with Idle screen

Implementation:
- Add module imports to installation.html
- Create initialization function
- Wire up AppState observers to screen show/hide
- Add keyboard event routing
- Start application on load

Module initialization order:
1. StorageManager (no dependencies)
2. InputManager (no dependencies)
3. IframeComm (no dependencies)
4. AppState (depends on others)
5. All screens (depend on AppState)

Screen transitions:
- AppState.addObserver((screen) => {
    hideAllScreens()
    screens[screen].show()
  })

Acceptance:
- [ ] All modules import correctly
- [ ] Initialization runs on page load
- [ ] Idle screen shows first
- [ ] Keyboard controls work
- [ ] No console errors

File: installation.html
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase2-Screens",
  task_order: 130
})
```

---

## Phase 3 Implementation Plan (Integration & Testing)

**Objective:** Test complete flow, add polish, optimize performance

**Total Time Estimate:** 4-6 hours

### Consolidated Task List (5 Tasks)

**Task 1: End-to-End Flow Testing** (2 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3: Test complete flow with all 7 games",
  description: `
Test complete installation flow end-to-end with each game.

Test procedure (repeat for each game):
1. Start at Idle screen
2. Press Space → Welcome screen
3. Press Space → Gallery screen
4. Select game (1-7 or arrows + Space)
5. Watch Code Animation
6. Play game until Game Over
7. Enter 3-letter name in Score Entry
8. View Leaderboard
9. View QR code
10. Return to Idle (loop)

For each game, verify:
- [ ] Game loads correctly in iframe
- [ ] Game runs at 1200×1920
- [ ] No scrollbars visible
- [ ] Gameplay works correctly
- [ ] Game Over sends postMessage
- [ ] Score displays correctly in Score Entry
- [ ] Score saves to Leaderboard
- [ ] QR code generates correctly

Edge cases to test:
- [ ] Escape key returns to Idle from any screen
- [ ] Timeouts work correctly (Leaderboard 30s, QR 15s)
- [ ] Multiple play sessions in same browser
- [ ] Browser refresh (leaderboard persists)
- [ ] Invalid scores handled gracefully

Create test log: tests/installation/e2e-test-log.md

Acceptance:
- [ ] All 7 games tested successfully
- [ ] No console errors during any flow
- [ ] All edge cases pass
- [ ] Test log documents results

File: tests/installation/e2e-test-log.md
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase3-Integration",
  task_order: 10
})
```

**Task 2: Screen Transitions** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3: Add CSS transitions between screens",
  description: `
Add smooth CSS transitions between all screens.

Transition types:
- Idle → Welcome: Fade out + fade in (0.5s)
- Welcome → Gallery: Slide left (0.3s)
- Gallery → Code: Slide left (0.3s)
- Code → Game: Fade out (0.2s)
- Game → Score: Fade out + fade in (0.5s)
- Score → Leaderboard: Slide up (0.4s)
- Leaderboard → QR: Fade (0.3s)
- QR → Idle: Fade out + fade in (0.8s)
- Any → Idle (Escape): Instant fade (0.2s)

Implementation:
- Add CSS transitions to installation.html <style>
- Use data-transition attribute on .screen elements
- Use cubic-bezier(0.4, 0, 0.2, 1) (Material Design)
- Coordinate with AppState screen changes

CSS pattern:
.screen {
  transition: opacity 0.3s cubic-bezier(0.4, 0, 0.2, 1),
              transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.screen.hidden {
  opacity: 0;
  pointer-events: none;
}

Acceptance:
- [ ] All transitions smooth and natural
- [ ] No janky animations or frame drops
- [ ] Timing feels correct
- [ ] Escape transitions are instant enough

Files: installation.html (add CSS), AppState.js (coordinate timing)
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase3-Integration",
  task_order: 20
})
```

**Task 3: Error Handling** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3: Add error handling for edge cases",
  description: `
Add robust error handling for failure scenarios.

Error scenarios to handle:
1. Game iframe fails to load
   - Timeout after 10s
   - Show error message
   - Return to Gallery

2. postMessage not received
   - Timeout after 15s
   - Assume game hung
   - Return to Idle (no score)

3. localStorage quota exceeded
   - Catch exception
   - Clear oldest scores
   - Retry save

4. Invalid score data
   - Validate score is number
   - Validate name is 3 letters A-Z
   - Reject invalid data

Implementation locations:
- GameScreen.js: Add iframe load timeout
- IframeComm.js: Add postMessage timeout
- StorageManager.js: Handle quota exceeded
- ScoreEntryScreen.js: Validate name format

Error display:
- Show brief error message (2s)
- Log to console for debugging
- Gracefully recover to safe state

Acceptance:
- [ ] Iframe load errors handled
- [ ] postMessage timeout works
- [ ] localStorage quota errors caught
- [ ] Invalid data rejected
- [ ] All errors logged to console

Files: GameScreen.js, IframeComm.js, StorageManager.js, ScoreEntryScreen.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase3-Integration",
  task_order: 30
})
```

**Task 4: Performance Optimization** (0.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3: Performance optimization and profiling",
  description: `
Optimize performance to meet targets.

Performance targets:
- Idle screen: 60fps (GoL animation)
- Screen transitions: No frame drops
- Game loading: < 1s
- Total memory: < 100MB

Optimizations to implement:
1. Pause p5.js when screen hidden
   - IdleScreen.hide() should stop draw loop
   - IdleScreen.show() should restart draw loop

2. Clear intervals on screen exit
   - All screens should clean up timers in hide()

3. Optimize GoL grid sizes
   - Idle screen: 40×64 (already optimal)

4. Use CSS transforms for transitions
   - Already using, verify no layout recalc

5. Lazy load game iframes
   - Only create iframe when needed
   - Destroy iframe when leaving Game screen

Performance testing:
- Use Chrome DevTools Performance tab
- Record 30 seconds of Idle screen
- Verify 60fps sustained
- Check memory usage < 100MB

Acceptance:
- [ ] Idle screen maintains 60fps
- [ ] No memory leaks during extended session
- [ ] Screen transitions smooth (no drops)
- [ ] Total memory < 100MB

Files: IdleScreen.js, GameScreen.js, installation.html
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase3-Integration",
  task_order: 40
})
```

**Task 5: Final Polish & Documentation** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3: Final polish and documentation",
  description: `
Final polish pass and documentation.

Polish tasks:
1. Remove console.log() debugging statements
2. Add loading indicators where appropriate
3. Verify all Google colors consistent
4. Check font consistency (Google Sans)
5. Verify scrollbars removed everywhere

Documentation tasks:
1. Update README.md with installation instructions
2. Document keyboard controls
3. Document screen flow
4. Add troubleshooting section
5. Document localStorage structure

README.md should include:
- Installation setup instructions
- Development commands (npm run dev)
- Keyboard controls reference
- Screen flow diagram
- Troubleshooting common issues
- Mac Mini kiosk mode instructions

Acceptance:
- [ ] No debugging logs in production code
- [ ] Loading indicators where needed
- [ ] Google design system consistent
- [ ] README.md comprehensive
- [ ] All documentation up to date

Files: README.md, installation.html, all screen files
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase3-Integration",
  task_order: 50
})
```

---

## Testing Strategy (All Phases)

### Phase 1: Unit Tests for Game Modifications

**Test:** Verify postMessage sent correctly

```javascript
// tests/installation/test_postMessage.js
describe('Game postMessage integration', () => {
  test('Space Invaders sends gameOver message', async () => {
    const iframe = document.createElement('iframe')
    iframe.src = 'games/space-invaders.html'
    document.body.appendChild(iframe)

    const messagePromise = new Promise(resolve => {
      window.addEventListener('message', (event) => {
        if (event.data.type === 'gameOver') {
          resolve(event.data)
        }
      })
    })

    // Simulate game over by posting to iframe
    iframe.contentWindow.postMessage({ type: 'triggerGameOver' }, '*')

    const message = await messagePromise
    expect(message.type).toBe('gameOver')
    expect(message.payload.score).toBeGreaterThan(0)
  })
})
```

### Phase 2: Integration Tests for Screens

**Test:** Screen navigation flow

```javascript
// tests/installation/test_navigation.js
describe('Screen navigation', () => {
  test('Complete flow: Idle → Welcome → Gallery', () => {
    const appState = new AppState()

    expect(appState.currentScreen).toBe('idle')

    appState.transition('welcome')
    expect(appState.currentScreen).toBe('welcome')

    appState.transition('gallery')
    expect(appState.currentScreen).toBe('gallery')
  })

  test('Escape key returns to Idle from any screen', () => {
    const appState = new AppState()

    appState.transition('leaderboard')
    appState.reset()

    expect(appState.currentScreen).toBe('idle')
    expect(appState.selectedGame).toBeNull()
    expect(appState.currentScore).toBeNull()
  })
})
```

**Test:** StorageManager persistence

```javascript
// tests/installation/test_StorageManager.js
describe('StorageManager', () => {
  test('Saves and retrieves scores correctly', () => {
    const storage = new StorageManager()

    storage.saveScore('snake', 'ABC', 1000)
    storage.saveScore('snake', 'XYZ', 2000)

    const scores = storage.getScores('snake')

    expect(scores).toHaveLength(2)
    expect(scores[0].score).toBe(2000) // Sorted descending
    expect(scores[1].score).toBe(1000)
  })

  test('Maintains top 10 only', () => {
    const storage = new StorageManager()

    // Add 15 scores
    for (let i = 0; i < 15; i++) {
      storage.saveScore('pong', 'AAA', i * 100)
    }

    const scores = storage.getScores('pong')
    expect(scores).toHaveLength(10) // Only top 10
  })
})
```

### Phase 3: End-to-End Browser Tests

**Use Chrome DevTools MCP for automated testing:**

```javascript
// Test complete flow
const page = await mcp__chrome_devtools__new_page({
  url: "http://localhost:5173/installation.html"
})

// 1. Verify Idle screen
await mcp__chrome_devtools__take_snapshot({ filePath: "test-idle.txt" })

// 2. Press Space to advance
await mcp__chrome_devtools__press_key({ key: "Space" })
await mcp__chrome_devtools__wait_for({ text: "Press SPACE to start", timeout: 2000 })

// 3. Advance to Gallery
await mcp__chrome_devtools__press_key({ key: "Space" })
await mcp__chrome_devtools__wait_for({ text: "Snake", timeout: 2000 })

// 4. Select Snake
await mcp__chrome_devtools__press_key({ key: "6" })

// 5. Wait for Code Animation
await new Promise(resolve => setTimeout(resolve, 8000))

// 6. Verify game loads
await mcp__chrome_devtools__wait_for({ text: "iframe", timeout: 5000 })

// 7. Verify no console errors
const logs = await mcp__chrome_devtools__list_console_messages({ types: ['error'] })
expect(logs.length).toBe(0)
```

---

## Edge Cases for Testing

### Game Integration Edge Cases:
- [ ] **Standalone mode:** Game shows popup when not in iframe
- [ ] **Installation mode:** Game doesn't show popup, sends postMessage
- [ ] **Multiple Game Overs:** Rapid game restart doesn't break postMessage
- [ ] **Score validation:** Negative scores, NaN, Infinity handled
- [ ] **Browser compatibility:** Works in Chrome, Firefox, Safari

### Screen Navigation Edge Cases:
- [ ] **Rapid key presses:** Debounced correctly, no double transitions
- [ ] **Invalid transitions:** Rejected by AppState validation
- [ ] **Timeout conflicts:** Multiple timers don't interfere
- [ ] **Escape during transition:** Returns to Idle cleanly
- [ ] **Browser back button:** Disabled or handled correctly

### Storage Edge Cases:
- [ ] **localStorage disabled:** Gracefully degrade (no persistence)
- [ ] **Quota exceeded:** Oldest scores cleared automatically
- [ ] **Corrupted data:** JSON.parse errors caught, data reset
- [ ] **Concurrent updates:** Multiple tabs don't corrupt data
- [ ] **Private browsing:** localStorage unavailable, handled

### Performance Edge Cases:
- [ ] **Extended session:** No memory leaks after 1 hour
- [ ] **Rapid screen changes:** No performance degradation
- [ ] **Multiple game plays:** Memory released correctly
- [ ] **Low memory:** Graceful degradation
- [ ] **60fps target:** Maintained across all screens

---

## Acceptance Criteria (All Phases)

### Phase 1: Game Modifications

**Functional Requirements:**
- [ ] **FR-1.1:** All 7 games run at 1200×1920 resolution
- [ ] **FR-1.2:** All games send postMessage on Game Over
- [ ] **FR-1.3:** Games work in both standalone and installation modes
- [ ] **FR-1.4:** No scrollbars visible in any game
- [ ] **FR-1.5:** Gameplay works correctly in portrait orientation

**Technical Requirements:**
- [ ] **TR-1.1:** postMessage format correct: `{ type: 'gameOver', payload: { score: number } }`
- [ ] **TR-1.2:** Game Over popup only shown in standalone mode
- [ ] **TR-1.3:** CSS `overflow: hidden` on body
- [ ] **TR-1.4:** Canvas exactly 1200×1920 pixels

### Phase 2: Installation System

**Functional Requirements:**
- [ ] **FR-2.1:** 8 screens implemented and functional
- [ ] **FR-2.2:** Screen navigation works via keyboard
- [ ] **FR-2.3:** Leaderboards persist across browser sessions
- [ ] **FR-2.4:** postMessage communication system works
- [ ] **FR-2.5:** Auto-timeouts advance screens appropriately

**Technical Requirements:**
- [ ] **TR-2.1:** AppState manages all screen transitions
- [ ] **TR-2.2:** StorageManager uses localStorage correctly
- [ ] **TR-2.3:** InputManager prevents browser defaults
- [ ] **TR-2.4:** IframeComm validates message format
- [ ] **TR-2.5:** All modules follow ES6+ module pattern

### Phase 3: Integration & Polish

**Functional Requirements:**
- [ ] **FR-3.1:** Complete flow works end-to-end
- [ ] **FR-3.2:** All 7 games tested and working
- [ ] **FR-3.3:** Transitions smooth with no glitches
- [ ] **FR-3.4:** Error handling works for all edge cases
- [ ] **FR-3.5:** Escape returns to Idle from any screen

**Performance Requirements:**
- [ ] **PR-3.1:** Idle screen maintains 60fps
- [ ] **PR-3.2:** Screen transitions have no frame drops
- [ ] **PR-3.3:** Total memory < 100MB
- [ ] **PR-3.4:** Game loading < 1 second

**Technical Requirements:**
- [ ] **TR-3.1:** No console errors during normal operation
- [ ] **TR-3.2:** All cleanup functions called on screen hide
- [ ] **TR-3.3:** CSS transitions use hardware acceleration
- [ ] **TR-3.4:** Documentation complete and accurate

---

## Validation Commands (All Phases)

**CRITICAL: Version Control Policy**

⚠️ **DO NOT commit or push to git/GitHub during implementation.**

This is a development phase only. Code will be reviewed and committed manually after validation.

### Phase 1 Validation:

```bash
# Start dev server
npm run dev

# Test each game standalone
# Open: http://localhost:5173/games/space-invaders.html
# Verify: 1200×1920, no scrollbars, Game Over popup works

# Test postMessage harness
# Open: http://localhost:5173/tests/installation/test-postmessage.html
# Verify: All 7 games send postMessage
```

### Phase 2 Validation:

```bash
# Start dev server
npm run dev

# Test installation system
# Open: http://localhost:5173/installation.html
# Verify: Idle screen shows, Space advances

# Test each screen
# Verify: All 8 screens accessible via flow

# Test keyboard controls
# Verify: Space, Escape, 1-7, Arrows all work

# Test localStorage
# Open DevTools → Application → Local Storage
# Verify: scores_* keys present after score entry
```

### Phase 3 Validation:

```bash
# Full end-to-end test
npm run dev

# For each of 7 games:
# 1. Complete full flow: Idle → ... → QR → Idle
# 2. Verify no console errors
# 3. Verify smooth transitions
# 4. Verify leaderboard saves

# Performance test
# Open DevTools → Performance
# Record 30s on Idle screen
# Verify: 60fps sustained
# Verify: Memory < 100MB

# Browser compatibility test
# Test in Chrome, Firefox, Safari
# Verify: All features work in all browsers
```

### Final Checklist:

```bash
# Phase 1 complete
- [ ] All 7 games at 1200×1920
- [ ] postMessage working in all games
- [ ] No scrollbars in any game
- [ ] Test harness passes

# Phase 2 complete
- [ ] All 8 screens implemented
- [ ] Navigation works correctly
- [ ] localStorage persists scores
- [ ] postMessage communication works

# Phase 3 complete
- [ ] End-to-end flow tested with all games
- [ ] Transitions smooth
- [ ] Error handling robust
- [ ] Performance targets met
- [ ] Documentation complete

# Ready for production
- [ ] No console errors
- [ ] All Archon tasks marked "done"
- [ ] README.md updated
- [ ] Code follows CLAUDE.md conventions
```

---

## Additional Notes for the Agent

### CRITICAL: Game Modification Pattern

All 7 games follow the **same modification pattern**. Use this template:

```javascript
// 1. Change resolution (in setup())
function setup() {
  createCanvas(1200, 1920)  // Changed from 800×600
  // ... rest of setup
}

// 2. Add postMessage in triggerGameOver()
function triggerGameOver() {
  state.phase = 'GAMEOVER'
  spawnExplosion(player.x, player.y)

  // ADD THIS:
  if (window.parent !== window) {
    window.parent.postMessage({
      type: 'gameOver',
      payload: { score: state.score }
    }, '*')
  }
}

// 3. Modify draw() to skip popup in installation
function draw() {
  // ... game rendering

  if (state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      // Standalone mode: show popup
      renderGameOver(width, height, state.score)
    }
    // Installation mode: don't show popup, parent handles it
  }
}

// 4. Modify keyPressed() to skip restart in installation
function keyPressed() {
  if (state.phase === 'GAMEOVER' && key === ' ') {
    if (window.parent === window) {
      // Standalone mode: allow restart
      initGame()
    }
    // Installation mode: don't restart, parent handles flow
    return
  }
  // ... rest of key handling
}

// 5. Add CSS to HTML wrapper
// In games/game-name.html:
// <style>
//   body { overflow: hidden; }
// </style>
```

### Screen Implementation Pattern

All screens follow the **same module pattern**:

```javascript
// src/screens/ExampleScreen.js
export class ExampleScreen {
  constructor(appState, storage) {
    this.appState = appState
    this.storage = storage
    this.element = null
  }

  show() {
    // Create DOM elements
    // Add event listeners
    // Start animations/timers
  }

  hide() {
    // Remove event listeners
    // Clear timers/intervals
    // Clean up resources
  }
}
```

### Common Pitfalls to Avoid

1. ❌ Forgetting to check `window.parent !== window` before postMessage
2. ❌ Not cleaning up event listeners in screen hide()
3. ❌ Creating multiple timers without clearing old ones
4. ❌ Not validating postMessage format
5. ❌ Testing only in installation mode (games must work standalone too)
6. ❌ Hardcoding URLs in QR code (use config)
7. ❌ Not handling localStorage quota exceeded
8. ❌ Forgetting to pause p5.js when screen hidden

### Success Indicators

Phases 1-3 are complete when:
- ✅ All 7 games work in installation
- ✅ Complete flow tested end-to-end
- ✅ All Archon tasks marked "done"
- ✅ No console errors
- ✅ Performance targets met (60fps)
- ✅ Documentation complete

---

## Phase Deliverables Summary

### Phase 1 Deliverables (7-8 hours):
- Modified games (7 files)
- Test harness for postMessage
- All games at 1200×1920
- postMessage working

### Phase 2 Deliverables (12-14 hours):
- 4 manager modules (AppState, Storage, Input, IframeComm)
- 8 screen modules
- Updated installation.html
- Complete navigation system

### Phase 3 Deliverables (4-6 hours):
- End-to-end test log
- CSS transitions
- Error handling
- Performance optimization
- Final documentation

### Total Estimated Time: 24-30 hours

---

## When Phases 1-3 are Complete

Provide summary message:

```
Phases 1-3 Complete: Physical Installation System ✅

Phase 1 - Game Modifications:
- [x] All 7 games modified to 1200×1920
- [x] postMessage integration complete
- [x] Test harness created and passing

Phase 2 - Installation System:
- [x] 4 manager modules implemented
- [x] 8 screens implemented
- [x] Navigation system working
- [x] localStorage persistence working

Phase 3 - Integration & Polish:
- [x] End-to-end testing complete (all 7 games)
- [x] CSS transitions added
- [x] Error handling robust
- [x] Performance targets met (60fps)
- [x] Documentation updated

All Archon tasks completed (26 total):
- Phase 1: 8 tasks (done)
- Phase 2: 13 tasks (done)
- Phase 3: 5 tasks (done)

Files created/modified:
- 7 game files modified
- 4 manager modules
- 8 screen modules
- 1 installation.html updated
- 3 test files
- Updated README.md

Performance validation:
- Idle screen: 60fps sustained ✅
- Total memory: < 100MB ✅
- Screen transitions: Smooth ✅

Ready for Phase 4 (Production Deployment)
```
