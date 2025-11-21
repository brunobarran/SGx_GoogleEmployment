# Conway's Arcade - Dino Runner

🎮 **[PLAY NOW](https://brunobarran.github.io/conways-arcade/)**

An endless runner powered by Conway's Game of Life cellular automaton.

---

## 🚀 Create Your Own Game

Want to create your own GoL game? Follow these steps:

### Option 1: Use AI (Recommended)

1. Read **[PROMPT.md](./PROMPT.md)**
2. Copy it to Gemini 2.5, Claude, or ChatGPT
3. Ask: "Create a [GAME_TYPE] game following this prompt"
4. Save the output and play!

### Option 2: Modify This Game

1. Clone this repository
2. Study `game.js` to understand the structure
3. Modify the game logic (jump mechanics, obstacles, scoring)
4. Reference `lib/` modules for GoL patterns
5. Test locally: `python -m http.server 8000`
6. Deploy to your own GitHub Pages

---

## 📁 Files

- **index.html** - Game UI and layout
- **game.js** - Game logic (modify this to create variants)
- **lib/** - Core modules (GoL engine, rendering, collision, patterns)
- **assets/** - Sprites (dino character PNG)
- **PROMPT.md** - AI prompt for generating new games

---

## 🧬 Conway's Game of Life

This game uses **B3/S23** cellular automaton:
- **Obstacles:** Real GoL patterns (BLOCK, BEEHIVE, LOAF, etc.)
- **Explosions:** Emergent GoL behavior with radial seeding
- **Background:** Pure GoL still-life patterns

**Exception:** Player uses PNG sprite (approved for brand recognition)

---

## 📖 Documentation

### Core Modules (lib/)

| Module | Description |
|--------|-------------|
| `GoLEngine.js` | Conway's GoL B3/S23 engine (double buffer) |
| `SimpleGradientRenderer.js` | Animated Perlin noise gradients |
| `GradientPresets.js` | Google brand color presets |
| `Collision.js` | Hitbox detection (rect, circle) |
| `Patterns.js` | Canonical GoL patterns (BLINKER, PULSAR, etc.) |
| `GoLHelpers.js` | Helper functions (seedRadialDensity, applyLifeForce) |
| `ParticleHelpers.js` | Particle system (explosions, effects) |
| `PatternRenderer.js` | Static/animated pattern rendering |
| `GameBaseConfig.js` | Responsive canvas configuration |
| `UIHelpers.js` | UI rendering helpers |
| `HitboxDebug.js` | Debug hitbox visualization (press H) |
| `GradientCache.js` | Gradient optimization cache |

---

## 🎨 Features

- ✅ **Conway's Game of Life aesthetics** (B3/S23 cellular automaton)
- ✅ **Mobile + Desktop responsive** (portrait orientation)
- ✅ **Touch and keyboard controls** (tap to jump, space to jump)
- ✅ **Google brand colors** (Material Design palette)
- ✅ **60fps performance** (optimized GoL engine)
- ✅ **Zero build system** (vanilla JS + p5.js CDN)

---

## 🐛 Local Development

```bash
# Clone repository
git clone https://github.com/brunobarran/conways-arcade.git
cd conways-arcade

# Start local server
python -m http.server 8000

# Open browser
# http://localhost:8000
```

**Requirements:**
- Modern browser (Chrome, Firefox, Safari, Edge)
- Python 3 (for local server) or any HTTP server

---

## 🎮 Game Mechanics

### Controls
- **Desktop:** Space or Up Arrow to jump
- **Mobile:** Tap screen to jump
- **Debug:** Press H to toggle hitbox visualization

### Gameplay
- Endless runner with increasing difficulty
- Jump over GoL pattern obstacles
- Score increases over time and per obstacle passed
- Single life (Game Over on collision)

### Obstacles (GoL Patterns)
All obstacles use authentic Conway's Game of Life patterns:

**Still Lifes (Period 1):**
- BLOCK (2×2)
- BEEHIVE (4×3)
- LOAF (4×4)
- BOAT (3×3)
- TUB (3×3)

**Oscillators (Static Rendering):**
- BLINKER (3×1 / 1×3)
- TOAD (4×2)
- BEACON (4×4)

---

## 🚀 Deploy to GitHub Pages

1. Fork this repository
2. Go to Settings → Pages
3. Source: `main` branch, `/ (root)` folder
4. Save and wait ~1 minute
5. Your game will be live at: `https://[username].github.io/conways-arcade/`

---

## 🎯 Example Game Variants You Can Create

Using the PROMPT.md, you can ask an LLM to create:

- **Flappy Bird** - Tap to flap, avoid GoL pattern pipes
- **Space Invaders** - Shoot descending GoL aliens
- **Breakout** - Break bricks made of GoL still-life patterns
- **Snake** - Classic snake with GoL visual aesthetics
- **Pong** - Paddles and ball rendered as GoL patterns
- **Pac-Man** - Maze with GoL ghosts and pellets

---

## 📊 Technical Details

### Performance
- **Target:** 60fps on modern devices
- **GoL Grid:** 30×48 cells (portrait background)
- **Update Rates:** 10-30fps for GoL (throttled)
- **Rendering:** Batch beginShape/endShape for efficiency

### Architecture
- **p5.js Global Mode:** All p5 functions available globally
- **ES6 Modules:** Import/export for clean code organization
- **Double Buffer GoL:** Correct B3/S23 implementation
- **Fixed Hitboxes:** Collision uses fixed rectangles, not GoL cells

---

## 🐛 Troubleshooting

**Q: Game doesn't load**
A: Make sure you're using an HTTP server (not `file://`). ES6 modules require server.

**Q: How do I modify the game?**
A: Edit `game.js` - study the structure and modify game logic sections.

**Q: Can I use this for commercial projects?**
A: Yes! ISC license allows commercial use.

**Q: How do I add more obstacle patterns?**
A: Add patterns to `CONFIG.obstaclePatterns` array in `game.js`. Reference `lib/Patterns.js` for available patterns.

---

## 📄 License

ISC License

Copyright (c) 2024 Bruno Barrán

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

---

## 🙏 Credits

**Conway's Game of Life:** John Horton Conway (1970)
**p5.js:** Processing Foundation
**LifeWiki:** Pattern catalog reference
**Inspiration:** Chrome Dino Game

---

## 🔗 Related Projects

- **LifeArcade:** Physical installation version (Mac Mini kiosk)
- **dino-runner-mobile:** Original mobile implementation

---

**Made with ❤️ and cellular automata**
