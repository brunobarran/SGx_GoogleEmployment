# Physical Installation - Development Phases Plan

**Target Resolution:** 1200×1920 (portrait/vertical)
**Total Time:** 24-30 hours
**Screens:** 8 total

---

## Phase 1: Core Infrastructure (5-6 hours)

### Objective
Build the SPA container, state machine, and navigation system.

### Tasks

#### 1.1 HTML Structure (1.5h)
- Create `installation.html` with 8 screen divs
- CSS for fullscreen layouts (NO scrollbars anywhere)
- Responsive design with letterboxing
- White backgrounds (Google minimalism)

**Screens:**
1. `#idle-screen`
2. `#welcome-screen`
3. `#gallery-screen`
4. `#code-screen`
5. `#game-screen`
6. `#score-entry-screen`
7. `#leaderboard-screen`
8. `#qr-screen`

#### 1.2 State Machine (1.5h)
- Create `AppState.js` with navigation logic
- Flow: idle → welcome → gallery → code → game → score → leaderboard → qr → idle
- Observer pattern for screen changes
- Keyboard input handling

#### 1.3 Storage Manager (1h)
- Create `StorageManager.js` for localStorage
- Store leaderboards per game (top 10)
- Methods: saveScore(), getScores(), clearScores()

#### 1.4 Iframe Communication (1h)
- Create `IframeComm.js` for postMessage
- Listen for Game Over from games
- Send acknowledgments

#### 1.5 Input Manager (1h)
- Create `InputManager.js` for keyboard
- Space, Escape, 1-7, Arrow keys
- Prevent default browser behaviors

---

## Phase 2: Screen Implementations (10-12 hours)

### Objective
Implement all 8 screens with Google minimalism aesthetic.

### Tasks

#### 2.1 Idle Screen (2h)
**File:** `src/screens/IdleScreen.js`

**Visual:**
- GoL generative background (40×64 grid, 10fps)
- No text, no prompts, pure visual
- Advances ONLY on Space key (no timeout)

**Implementation:**
- Use `GoLEngine` from `src/core/GoLEngine.js`
- Use `SimpleGradientRenderer` from `src/rendering/`
- Random patterns from `Patterns.js`

#### 2.2 Welcome Screen (1h)
**File:** `src/screens/WelcomeScreen.js`

**Visual:**
- White background
- Center: "GAME OF LIFE ARCADE" (Google Blue #4285F4)
- Subtitle: "Press SPACE to start" (Google Gray #5f6368)
- Minimal, clean Google aesthetics

**Implementation:**
- Pure HTML/CSS, no p5.js
- Font: Google Sans
- Fade in animation (0.5s)

#### 2.3 Gallery Screen (2h)
**File:** `src/screens/GalleryScreen.js`

**Visual:**
- 7 games in 2×4 grid (portrait optimized)
- Game thumbnails with titles
- Keyboard: 1-7 or arrows + Space

**Implementation:**
- Adapt existing `gallery.html`
- Update layout for 1200×1920 portrait
- Integrate into SPA navigation

#### 2.4 Code Animation Screen (2h)
**File:** `src/screens/CodeAnimationScreen.js`

**Visual:**
- Header: "GENERATING: {GAME_NAME}.js"
- Body: Code display area (Google Sans, syntax-colored on white)
- Typewriter effect: character-by-character
- Syntax highlighting: GOOGLE_COLORS only
- Auto-scroll as code appears

**Implementation:**
- Fetch game source code (e.g., `games/snake.js`)
- Parse and apply syntax highlighting
- Animate with Typed.js or custom
- Auto-advance when complete (~5-10s)

**Syntax Colors:**
- Comments: #5f6368 (Google gray)
- Keywords: #4285F4 (Google blue)
- Strings: #34A853 (Google green)
- Numbers: #FBBC04 (Google yellow)

#### 2.5 Game Screen (1.5h)
**File:** `src/screens/GameScreen.js`

**Visual:**
- Fullscreen iframe container (1200×1920)
- No UI chrome, no borders
- Game fills entire screen

**Implementation:**
- Load selected game in iframe
- Listen for postMessage (gameOver event)
- Handle Escape key to exit early
- NO loading screens (games load instantly)

#### 2.6 Score Entry Screen (1.5h)
**File:** `src/screens/ScoreEntryScreen.js`

**Visual:**
- Header: "GAME OVER"
- Score: Display final score (large)
- Input: 3-letter name (arcade style)
- Instructions: "← → to change, SPACE to confirm"

**Implementation:**
- Arcade-style letter selector (A-Z)
- Arrow keys to cycle letters
- Space to confirm each letter
- Auto-advance when 3 letters entered

#### 2.7 Leaderboard Screen (1.5h)
**File:** `src/screens/LeaderboardScreen.js`

**Visual:**
- Header: "{GAME_NAME} - TOP 10"
- Table: Rank, Name, Score
- Highlight: New entry (if applicable)
- Footer: "Press SPACE to continue"

**Implementation:**
- Load scores from StorageManager
- Sort by score descending
- Highlight new entry with Google Blue
- Auto-timeout (30s) OR Space key

#### 2.8 QR Code Screen (1.5h)
**File:** `src/screens/QRCodeScreen.js`

**Visual:**
- Header: "PLAY ON THE WEB"
- QR Code: Large, centered
- URL: Display below QR code
- Footer: "Scan with your phone"

**Implementation:**
- Generate QR code linking to web version
- Use QRCode.js or similar library
- Auto-timeout (15s) OR Space key
- Return to idle screen

---

## Phase 3: Game Integration (6-8 hours)

### Objective
Modify all 7 games to 1200×1920 and fix Game Over flow.

### Critical Issues to Fix

1. **Resolution:** All games currently use various resolutions
2. **Game Over:** All games show popup instead of sending postMessage
3. **Scrollbars:** Some games may have overflow issues

### Changes Per Game (×7 games)

**Files to modify:**
- `games/space-invaders.js`
- `games/dino-runner.js`
- `games/breakout.js`
- `games/asteroids.js`
- `games/flappy-bird.js`
- `games/snake.js`
- `games/pong.js`

**Modifications each game:**

1. **Resolution (15min/game)**
   ```javascript
   // Change from:
   createCanvas(800, 600)  // or whatever current size

   // To:
   createCanvas(1200, 1920)  // Portrait fullscreen
   ```

2. **Gameplay Adjustments (30min/game)**
   - Adjust game elements for portrait orientation
   - Reposition UI elements (score, lives, etc.)
   - Test that gameplay still works well vertically
   - Ensure no elements go off-screen

3. **Game Over Flow (15min/game)**
   ```javascript
   // In triggerGameOver() function, ADD:
   if (window.parent !== window) {
     // We're in installation iframe
     window.parent.postMessage({
       type: 'gameOver',
       payload: { score: state.score }
     }, '*')
   }

   // In draw() function, MODIFY:
   if (state.phase === 'GAMEOVER') {
     if (window.parent === window) {
       // Standalone mode: show popup
       renderGameOver(width, height, state.score)
     }
     // Installation mode: no popup, parent handles it
   }

   // In keyPressed() function, MODIFY:
   if (state.phase === 'GAMEOVER' && key === ' ') {
     if (window.parent === window) {
       // Standalone mode: allow restart
       initGame()
     }
     // Installation mode: no restart, parent handles flow
     return
   }
   ```

4. **Remove Scrollbars (5min/game)**
   ```css
   body {
     margin: 0;
     padding: 0;
     overflow: hidden;
   }

   canvas {
     display: block;
   }
   ```

### Testing Per Game

- [ ] Game runs at 1200×1920
- [ ] Gameplay works in portrait orientation
- [ ] Game Over sends postMessage correctly
- [ ] No popup shown in installation mode
- [ ] No scrollbars visible
- [ ] Game still works in standalone mode

**Time estimate:** ~1 hour per game × 7 games = **7 hours**

---

## Phase 4: Integration & Polish (3-4 hours)

### Objective
Smooth transitions, error handling, and end-to-end testing.

### Tasks

#### 4.1 Screen Transitions (1.5h)

**Transition types:**
- Idle → Welcome: Fade out + fade in (0.5s)
- Welcome → Gallery: Slide left (0.3s)
- Gallery → Code: Slide left (0.3s)
- Code → Game: Fade out (0.2s)
- Game → Score: Fade out game, fade in score (0.5s)
- Score → Leaderboard: Slide up (0.4s)
- Leaderboard → QR: Fade (0.3s)
- QR → Idle: Fade out, fade in (0.8s)

**CSS Implementation:**
- Use CSS transitions on `.screen` class
- Add data-transition attributes
- Use cubic-bezier(0.4, 0, 0.2, 1) (Material Design)

#### 4.2 Error Handling (1h)

**Scenarios:**
- Game fails to load in iframe
- postMessage not received
- localStorage quota exceeded
- Invalid score data

**Implementation:**
- Try/catch blocks around iframe loading
- Timeout for postMessage (15s max)
- Clear oldest scores if quota exceeded
- Validate score data before saving

#### 4.3 End-to-End Testing (1-1.5h)

**Test complete flow:**
1. Start at Idle screen
2. Advance through Welcome
3. Select a game from Gallery
4. Watch Code Animation
5. Play game until Game Over
6. Enter 3-letter name
7. View Leaderboard
8. See QR code
9. Loop back to Idle

**Test variations:**
- Different games
- High score vs low score
- Escape key to exit
- Timeout auto-advances

#### 4.4 Performance Optimization (0.5h)

**Targets:**
- Idle screen: 60fps
- Code animation: Smooth typewriter effect
- Game transitions: No janks
- Total memory: < 100MB

**Optimizations:**
- Pause p5.js when screen hidden
- Clear intervals on screen exit
- Optimize GoL grid sizes
- Use CSS transforms for transitions

---

## Phase Deliverables

### Phase 1 Deliverables
- [ ] `installation.html` with 8 screens
- [ ] `src/installation/AppState.js`
- [ ] `src/installation/StorageManager.js`
- [ ] `src/installation/IframeComm.js`
- [ ] `src/installation/InputManager.js`

### Phase 2 Deliverables
- [ ] `src/screens/IdleScreen.js`
- [ ] `src/screens/WelcomeScreen.js`
- [ ] `src/screens/GalleryScreen.js`
- [ ] `src/screens/CodeAnimationScreen.js`
- [ ] `src/screens/GameScreen.js`
- [ ] `src/screens/ScoreEntryScreen.js`
- [ ] `src/screens/LeaderboardScreen.js`
- [ ] `src/screens/QRCodeScreen.js`

### Phase 3 Deliverables
- [ ] Modified `games/space-invaders.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/dino-runner.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/breakout.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/asteroids.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/flappy-bird.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/snake.js` (1200×1920, Game Over fixed)
- [ ] Modified `games/pong.js` (1200×1920, Game Over fixed)

### Phase 4 Deliverables
- [ ] CSS transitions between all screens
- [ ] Error handling for all failure modes
- [ ] Complete end-to-end flow tested
- [ ] Performance targets met (60fps)

---

## Success Criteria

### Functional
- ✅ All 8 screens implemented and working
- ✅ Complete flow loops correctly
- ✅ All 7 games run at 1200×1920
- ✅ Game Over flow works (postMessage)
- ✅ Leaderboards persist across sessions
- ✅ QR codes generate correctly

### Visual
- ✅ Google minimalism throughout
- ✅ No scrollbars anywhere
- ✅ Smooth transitions between screens
- ✅ Responsive design works (letterboxing)

### Performance
- ✅ 60fps maintained throughout
- ✅ No memory leaks during extended sessions
- ✅ Games load instantly (no loading screens)

### Technical
- ✅ No console errors
- ✅ postMessage communication reliable
- ✅ localStorage operations safe
- ✅ Keyboard input responsive

---

## Testing Checklist

### Per-Screen Testing
- [ ] Idle: GoL animates, auto-advances or Space key
- [ ] Welcome: Instructions visible, Space advances
- [ ] Gallery: All 7 games visible, selection works
- [ ] Code: Typewriter effect smooth, auto-advances
- [ ] Game: Fullscreen iframe works, postMessage received
- [ ] Score Entry: 3-letter input works, saves correctly
- [ ] Leaderboard: Top 10 displayed, highlight works
- [ ] QR: Code generates, timeout works

### Flow Testing
- [ ] Complete flow: Idle → ... → QR → Idle
- [ ] Escape key returns to Idle from any screen
- [ ] Multiple games tested
- [ ] Multiple score entries tested

### Integration Testing
- [ ] All 7 games work in installation
- [ ] Leaderboards separate per game
- [ ] QR codes unique per game
- [ ] State persists across browser refresh

### Performance Testing
- [ ] FPS stays above 58 throughout
- [ ] Memory stays below 100MB
- [ ] No stuttering during transitions
- [ ] No lag during code animation

---

## Notes

**Current Status:**
- Phase 1: Not started
- Phase 2: Not started
- Phase 3: CRITICAL - Game Over flow currently broken
- Phase 4: Not started

**Known Issues:**
1. Games show popup on Game Over (need postMessage)
2. Games are various resolutions (need 1200×1920)
3. Some games may have scrollbars

**Dependencies:**
- Typed.js or custom for typewriter effect
- QRCode.js for QR generation
- Existing gallery.html for reference
- Existing games (all 7)

**Total Estimated Time:** 24-30 hours
