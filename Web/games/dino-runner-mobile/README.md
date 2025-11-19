# Dino Runner Mobile 🦖

Mobile version of the arcade Dino Runner game from LifeArcade, powered by Conway's Game of Life.

## 🎮 Play Online

**[PLAY NOW](https://brunobarran.github.io/SGx_GoogleEmployment/games/dino-runner-mobile/)**

## 📱 Controls

- **Tap:** Jump
- **Hold:** Duck (hold for 200ms+)
- **H key:** Toggle hitbox debug (desktop only)

## ✨ Features

- **Conway's Game of Life Aesthetics**
  - PNG sprite player (200×200px run, 265×121px duck)
  - GoL patterns for obstacles (BLOCK, BEEHIVE, LOAF, BOAT, TUB, BLINKER, TOAD, BEACON)
  - LWSS spaceship flying obstacles (pterodactyls)
  - Parallax background with still life patterns
  - Pure GoL explosion particles

- **Mobile-Optimized**
  - Touch controls (tap/hold gestures)
  - Portrait orientation only (vertical display)
  - Responsive design (320px-800px width)
  - 60fps performance on modern devices

- **Google Brand Colors**
  - Blue (#4285F4), Red (#EA4335), Green (#34A853), Yellow (#FBBC04)

## 🏗️ Tech Stack

- **p5.js 1.7.0** (from CDN)
- **Vanilla JavaScript ES6** (modules)
- **Conway's Game of Life B3/S23** algorithm
- **No build step required** (100% client-side)
- **No npm dependencies**

## 💻 Development

### Local Testing

```bash
# Option 1: Open directly in browser
# file:///path/to/index.html

# Option 2: Python HTTP server (recommended)
cd Web/games/dino-runner-mobile
python -m http.server 8000
# Open http://localhost:8000
```

### File Structure

```
dino-runner-mobile/
├── index.html              # Entry point with embedded CSS
├── game.js                 # Main game logic (adapted from LifeArcade)
├── lib/                    # 11 copied modules from LifeArcade
│   ├── GoLEngine.js        # Conway's Game of Life B3/S23
│   ├── SimpleGradientRenderer.js
│   ├── GradientPresets.js
│   ├── Collision.js
│   ├── Patterns.js
│   ├── GoLHelpers.js
│   ├── ParticleHelpers.js
│   ├── PatternRenderer.js
│   ├── HitboxDebug.js
│   └── GameBaseConfig.js
├── assets/
│   └── dino-sprites/       # 4 PNG sprites (20 KB)
│       ├── run_0.png
│       ├── run_1.png
│       ├── duck_run_0.png
│       └── duck_run_1.png
└── README.md
```

### Total Size

- **JavaScript:** ~105 KB (11 lib files + game.js)
- **Assets:** ~20 KB (PNG sprites)
- **HTML/CSS:** ~5 KB
- **Total:** ~130 KB (uncompressed)

## 🎯 Game Mechanics

- **Endless runner:** Increasing difficulty over time
- **Single life:** Game over on collision
- **Score system:** +1 point every 6 frames, +10 per obstacle passed
- **Obstacles:**
  - Ground: Static GoL still lifes and oscillators
  - Flying: LWSS spaceship pterodactyls (60% hitbox)
- **Physics:** Gravity 4, Jump force -60, responsive ground collision

## 🧬 Conway's Game of Life

This game showcases authentic B3/S23 cellular automaton:

- **Background parallax:** Pure GoL still life patterns
- **Obstacles:** Canonical GoL patterns (BLOCK, BEEHIVE, LOAF, etc.)
- **Explosions:** Radial density seeding with emergent behavior

**Deviation:** Player uses PNG sprites (client-approved) instead of GoL for brand recognition.

## 🚀 Deployment

This game is deployed on GitHub Pages from the `main` branch.

### Manual Deploy

```bash
# Commit and push
git add Web/games/dino-runner-mobile
git commit -m "Update mobile dino runner"
git push origin main

# GitHub Pages auto-deploys from /Web folder
```

## 🐛 Debug Mode

Press **H** on desktop to toggle hitbox visualization:
- Green boxes: Player hitbox
- Red boxes: Obstacle hitboxes

Useful for tuning collision detection and understanding pterodactyl reduced hitboxes.

## 📊 Performance

- **Target:** 60fps on iPhone 12+
- **Optimizations:**
  - Small GoL grids (30×48 background, 6×6 sprites)
  - Variable update rates (10-30fps GoL)
  - Batch rendering (beginShape/endShape)
  - Portrait-only responsive (width-constrained)

## 📝 Credits

**Based on LifeArcade** by Bruno Barrán
- Original arcade version: [LifeArcade](https://github.com/brunobarran/SGx_GoogleEmployment/tree/main/LifeArcade)
- Mobile adaptation: Self-contained bundle (Option A - KISS principle)

**Conway's Game of Life:** John Horton Conway (1970)

**Frameworks:**
- [p5.js](https://p5js.org/) - Creative coding library
- [LifeWiki](https://conwaylife.com/wiki/) - Pattern catalog

## 📄 License

ISC

---

**Made with ❤️ and cellular automata**
