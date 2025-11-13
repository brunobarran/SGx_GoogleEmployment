# SGx Google Employment - Project Structure

This repository contains two separate projects:

## 📁 Project Structure

```
SGx_GoogleEmployment/
├── LifeArcade/           # Physical arcade installation project
│   ├── src/              # Source code (GoL engine, renderers, utils)
│   ├── games/            # 7 playable games
│   ├── tests/            # Test suite (96.4% passing)
│   ├── docs/             # Project documentation
│   └── gallery.html      # Game selection interface
│
└── Web/                  # LLM Generator Web App (coming soon)
    └── (to be created)
```

## 🎮 LifeArcade

**Physical arcade installation with cellular automaton games**

- Target: Mac Mini M4 with arcade controls
- Games: 7 (Space Invaders, Dino Runner, Breakout, Asteroids, Flappy Bird, Snake, Pong)
- Tech: HTML/CSS + p5.js + Conway's Game of Life (B3/S23)
- Status: 75% complete

**To run:**
```bash
cd LifeArcade
npm install
npm run dev
```

**Documentation:**
- `LifeArcade/docs/PROJECT_STATUS_AND_ROADMAP.md` - Overall status
- `LifeArcade/docs/PHYSICAL_INSTALLATION_PLAN.md` - Installation plan
- `LifeArcade/CLAUDE.md` - Development instructions

## 🌐 Web (Coming Soon)

**LLM-powered game generator web app**

- Generate GoL arcade games with Claude API
- Framework-based code generation
- Quality: 90-95% (tested with Snake & Pong)
- Status: 60% complete (framework ready, web app pending)

---

## 📊 Project Status

| Project | Status | Completion |
|---------|--------|------------|
| **LifeArcade** | 🟢 Active | 75% |
| **Web** | 🟡 Planning | 60% (framework only) |

---

## 🚀 Quick Start

### LifeArcade Development
```bash
cd LifeArcade
npm run dev          # Start dev server
npm test             # Run tests
```

### Web App (Future)
```bash
cd Web
npm install
npm run dev
```

---

## 📝 Notes

- Both projects share the same GoL framework concepts
- LifeArcade games can be used as examples for Web generator
- Git repository maintained at root level

---

_Last updated: 2025-11-12_
