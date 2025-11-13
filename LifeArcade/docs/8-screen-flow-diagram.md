# 8-Screen Installation Flow - Visual Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     SCREEN 1: IDLE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │         [GoL Generative Background Animation]        │  │
│  │                                                       │  │
│  │              40×64 cells, 10fps update               │  │
│  │                                                       │  │
│  │           No text, pure visual showcase              │  │
│  │                                                       │  │
│  │         Continue on Space key                         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: IdleScreen.js                              │
│  Uses: GoLEngine, SimpleGradientRenderer, Patterns         │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Space only)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SCREEN 2: WELCOME                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                                                       │  │
│  │           GAME OF LIFE ARCADE                        │  │
│  │           ────────────────────                       │  │
│  │        Conway's Cellular Automaton Games             │  │
│  │                                                       │  │
│  │                                                       │  │
│  │              Press SPACE to start                    │  │
│  │                                                       │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: WelcomeScreen.js                           │
│  Pure HTML/CSS, Google Sans font, minimal design           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Space)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   SCREEN 3: GALLERY                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │   ┌─────────┐ ┌─────────┐   2×4 Grid (Portrait)     │  │
│  │   │ Space   │ │  Dino   │                           │  │
│  │   │Invaders │ │ Runner  │   Keyboard:               │  │
│  │   └─────────┘ └─────────┘   - 1-7: Quick select     │  │
│  │                               - Arrows: Navigate     │  │
│  │   ┌─────────┐ ┌─────────┐   - Space: Confirm        │  │
│  │   │Breakout │ │Asteroids│                           │  │
│  │   └─────────┘ └─────────┘                           │  │
│  │                                                       │  │
│  │   ┌─────────┐ ┌─────────┐                           │  │
│  │   │ Flappy  │ │  Snake  │                           │  │
│  │   │  Bird   │ │         │                           │  │
│  │   └─────────┘ └─────────┘                           │  │
│  │                                                       │  │
│  │   ┌─────────┐                                        │  │
│  │   │  Pong   │                                        │  │
│  │   └─────────┘                                        │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: GalleryScreen.js                           │
│  Adapted from gallery.html, 1200×1920 optimized            │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Select game)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│              SCREEN 4: CODE ANIMATION                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │  GENERATING: snake.js                                │  │
│  │  ────────────────────                                │  │
│  │                                                       │  │
│  │  // Game of Life Arcade - Snake                     │  │
│  │  // ────────────────────────────                    │  │
│  │                                                       │  │
│  │  const CONFIG = {                                    │  │
│  │    width: 1200,                                      │  │
│  │    height: 1920,                                     │  │
│  │    ...                                               │  │
│  │  }                                                   │  │
│  │                                                       │  │
│  │  [Typewriter effect, auto-scrolling]                │  │
│  │                                                       │  │
│  │  Syntax highlighting:                                │  │
│  │  - Comments: #5f6368 (gray)                         │  │
│  │  - Keywords: #4285F4 (blue)                         │  │
│  │  - Strings: #34A853 (green)                         │  │
│  │  - Numbers: #FBBC04 (yellow)                        │  │
│  │                                                       │  │
│  │  Auto-advances when complete (~5-10s)               │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: CodeAnimationScreen.js                     │
│  Uses: Typed.js or custom, Prism.js for syntax             │
│  FULLSCREEN, NOT an iframe                                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Auto after animation complete)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    SCREEN 5: GAME                           │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  │         [Game runs in iframe]                        │  │
│  │                                                       │  │
│  │         Fullscreen: 1200×1920                        │  │
│  │                                                       │  │
│  │         No UI chrome, no borders                     │  │
│  │                                                       │  │
│  │         Escape: Exit to Idle                         │  │
│  │                                                       │  │
│  │                                                       │  │
│  │                                                       │  │
│  │         When Game Over:                              │  │
│  │         game sends postMessage                       │  │
│  │         { type: 'gameOver',                          │  │
│  │           payload: { score: 12345 } }                │  │
│  │                                                       │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: GameScreen.js                              │
│  Listens for postMessage, transitions on gameOver          │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (gameOver postMessage received)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                 SCREEN 6: SCORE ENTRY                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                  GAME OVER                           │  │
│  │                  ─────────                           │  │
│  │                                                       │  │
│  │              Final Score: 12,345                     │  │
│  │                                                       │  │
│  │                                                       │  │
│  │            Enter Your Initials:                      │  │
│  │                                                       │  │
│  │               ┌───┐ ┌───┐ ┌───┐                     │  │
│  │               │ A │ │ B │ │ C │                     │  │
│  │               └───┘ └───┘ └───┘                     │  │
│  │                 ▲                                     │  │
│  │          (← → to change letter)                      │  │
│  │          (Space to confirm)                          │  │
│  │                                                       │  │
│  │       Auto-advances when 3 letters entered           │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: ScoreEntryScreen.js                        │
│  Arcade-style letter selector (A-Z), saves to localStorage │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (3 letters entered)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                SCREEN 7: LEADERBOARD                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │              SNAKE - TOP 10                          │  │
│  │              ──────────────                          │  │
│  │                                                       │  │
│  │   Rank  Name   Score                                │  │
│  │   ────  ────   ─────                                │  │
│  │    1    XYZ    25,420                               │  │
│  │    2    JOE    18,500                               │  │
│  │    3  ► ABC ◄  12,345  ← New entry                  │  │
│  │    4    SAM    10,200                               │  │
│  │    5    MAX     9,800                               │  │
│  │    6    LEO     8,500                               │  │
│  │    7    EVE     7,200                               │  │
│  │    8    ANN     6,100                               │  │
│  │    9    BOB     5,400                               │  │
│  │   10    TOM     4,900                               │  │
│  │                                                       │  │
│  │                                                       │  │
│  │         Press SPACE to continue                      │  │
│  │         Auto-timeout: 30 seconds                     │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: LeaderboardScreen.js                       │
│  Loads from StorageManager, highlights new entry           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Space OR 30s timeout)
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  SCREEN 8: QR CODE                          │
│  ┌───────────────────────────────────────────────────────┐  │
│  │                                                       │  │
│  │                                                       │  │
│  │            PLAY ON THE WEB                           │  │
│  │            ──────────────                            │  │
│  │                                                       │  │
│  │              ┌─────────────┐                         │  │
│  │              │ ▓▓  ▓▓  ▓▓ │                         │  │
│  │              │  ▓▓▓▓▓▓▓▓  │                         │  │
│  │              │ ▓▓  ▓▓  ▓▓ │  Large QR Code          │  │
│  │              │  ▓▓▓▓▓▓▓▓  │                         │  │
│  │              │ ▓▓  ▓▓  ▓▓ │  (Generated with        │  │
│  │              └─────────────┘   QRCode.js)            │  │
│  │                                                       │  │
│  │        https://yoursite.com/games/snake              │  │
│  │                                                       │  │
│  │          Scan with your phone                        │  │
│  │                                                       │  │
│  │         Auto-timeout: 15 seconds                     │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────┘  │
│                                                             │
│  Implementation: QRCodeScreen.js                            │
│  Generates QR for web version of game                      │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ (Space OR 15s timeout)
                              ▼
                      (Loop back to IDLE)
```

## Key Navigation Triggers

| From Screen    | To Screen    | Trigger                        |
|----------------|--------------|--------------------------------|
| Idle           | Welcome      | Space (no timeout)              |
| Welcome        | Gallery      | Space                          |
| Gallery        | Code         | Select game (1-7 or Space)     |
| Code           | Game         | Auto (when animation complete) |
| Game           | Score Entry  | postMessage (gameOver)         |
| Score Entry    | Leaderboard  | 3 letters entered              |
| Leaderboard    | QR Code      | Space OR 30s timeout           |
| QR Code        | Idle         | Space OR 15s timeout           |
| **Any Screen** | **Idle**     | **Escape key**                 |

## Critical Technical Requirements

### Resolution
- **All screens:** 1200×1920 (portrait)
- **All games:** MUST be modified to 1200×1920
- **Current games:** Various resolutions (need updating)

### Scrollbars
- **NONE. NOWHERE. NEVER.**
- `overflow: hidden` on `body`, `#installation-container`, `.screen`
- Games must fit exactly in 1200×1920

### Game Over Flow (CURRENTLY BROKEN)
**Current behavior (wrong):**
```
Game → triggerGameOver() → Show popup → Wait for Space → Restart game
```

**New behavior (correct):**
```
Game → triggerGameOver() → Send postMessage → Installation catches it → Show Score Entry
```

**Fix required in all 7 games:**
```javascript
// In triggerGameOver()
if (window.parent !== window) {
  window.parent.postMessage({
    type: 'gameOver',
    payload: { score: state.score }
  }, '*')
}
```

### Colors (Google Minimalism)
- Background: `#FFFFFF` (white)
- Text: `#5f6368` (Google gray)
- Primary: `#4285F4` (Google blue)
- Success: `#34A853` (Google green)
- Warning: `#FBBC04` (Google yellow)
- Error: `#EA4335` (Google red)

**NO:**
- Terminal green (`#00FF00`)
- Black backgrounds (`#000000` for content)
- Custom colors

### Typography
- Font: `Google Sans, Arial, sans-serif`
- **NOT:** Courier New, monospace (except Code screen with Google Sans)

## File Structure

```
LifeArcade/
├── installation.html              # Main SPA container
├── src/
│   ├── installation/
│   │   ├── AppState.js           # State machine + navigation
│   │   ├── StorageManager.js     # localStorage wrapper
│   │   ├── InputManager.js       # Keyboard input
│   │   └── IframeComm.js         # postMessage handling
│   └── screens/
│       ├── IdleScreen.js         # Screen 1
│       ├── WelcomeScreen.js      # Screen 2
│       ├── GalleryScreen.js      # Screen 3
│       ├── CodeAnimationScreen.js # Screen 4
│       ├── GameScreen.js         # Screen 5
│       ├── ScoreEntryScreen.js   # Screen 6
│       ├── LeaderboardScreen.js  # Screen 7
│       └── QRCodeScreen.js       # Screen 8
└── games/
    ├── space-invaders.js         # MODIFY: 1200×1920, Game Over fix
    ├── dino-runner.js            # MODIFY: 1200×1920, Game Over fix
    ├── breakout.js               # MODIFY: 1200×1920, Game Over fix
    ├── asteroids.js              # MODIFY: 1200×1920, Game Over fix
    ├── flappy-bird.js            # MODIFY: 1200×1920, Game Over fix
    ├── snake.js                  # MODIFY: 1200×1920, Game Over fix
    └── pong.js                   # MODIFY: 1200×1920, Game Over fix
```

## State Flow (AppState.js)

```javascript
{
  currentScreen: 'idle' | 'welcome' | 'gallery' | 'code' | 'game' | 'score' | 'leaderboard' | 'qr',
  selectedGame: 'snake' | 'space-invaders' | ... | null,
  currentScore: number | null,
  playerName: string | null,  // 3 letters
  leaderboards: {
    'snake': [{ name: 'ABC', score: 12345, date: '...' }, ...],
    'space-invaders': [...],
    ...
  }
}
```

## Performance Targets

- **Idle screen:** 60fps (GoL animation)
- **Code animation:** Smooth typewriter effect
- **Game transitions:** No frame drops
- **Total memory:** < 100MB
- **Load time:** Instant (no loading screens)

## Testing Priorities

1. **Game Over flow:** Test postMessage from all 7 games
2. **Resolution:** Verify all games run at 1200×1920
3. **Scrollbars:** Confirm none visible anywhere
4. **Complete flow:** Idle → ... → QR → Idle
5. **Persistence:** Leaderboards survive refresh

---

**Total Development Time:** 24-30 hours
**Phases:** 4 (Infrastructure, Screens, Games, Polish)
