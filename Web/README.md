# Web - Conway's Game of Life Game Generator

**Generate playable arcade games using AI and the Game of Life framework**

## 🎯 How to Use

**Create your own Game of Life arcade game in 3 simple steps:**

### 1. Get the Prompt
Copy the complete prompt from: [`conways-arcade/PROMPT.md`](https://github.com/brunobarran/conways-arcade-test/blob/main/PROMPT.md)

### 2. Use with Gemini 2.5 Pro
Open [Google AI Studio](https://aistudio.google.com/) and:
1. Select **Gemini 2.5 Pro** model (recommended)
2. Paste your game request + the PROMPT.md content
3. Wait for the complete HTML file

### 3. Save and Play
1. Copy the generated HTML code
2. Save as `my-game.html`
3. Double-click to play (works offline, no server needed)

---

## 📝 Example Request

```
I want to create a Space Invaders-style game where:
- Player is at the bottom (can move left/right)
- Enemies spawn at the top in rows
- Player shoots bullets upward
- Score increases when enemies are destroyed
- Game over if enemies reach the bottom

[PASTE ENTIRE PROMPT.md HERE]
```

**What you'll get:** A complete, playable HTML file with your game (~1000-1500 lines)

---

## 🐛 Troubleshooting

**If the game doesn't work:**
- **Keep iterating with Gemini** - describe what's wrong and ask for fixes
- Check browser console (F12) for errors
- Verify all 12 modules were copied correctly
- Make sure exports were removed from inline modules

**Common fixes:**
- "Please remove all export keywords from the inline modules"
- "The gradient colors are not showing, can you fix it?"
- "The collision detection isn't working correctly"

**Gemini is very good at fixing its own code** - just describe the issue clearly!

---

## 🎮 Proven Quality

**Test Results:**
- **Snake:** 10/10 - Perfect implementation
- **Pong:** 9/10 - Minor collision bug (fixed in 1 iteration)
- **Dino Runner:** 10/10 - Perfect mobile game
- **Average:** 95%+ success rate

---

## 🔗 Resources

- **Template Repository:** [github.com/brunobarran/conways-arcade-test](https://github.com/brunobarran/conways-arcade-test)
- **Live Demo:** [brunobarran.github.io/conways-arcade-test](https://brunobarran.github.io/conways-arcade-test/)
- **Prompt File:** [PROMPT.md](https://github.com/brunobarran/conways-arcade-test/blob/main/PROMPT.md)
- **Framework Modules:** [lib/](https://github.com/brunobarran/conways-arcade-test/tree/main/lib)

---

## 🏗️ Technical Details

### What's Under the Hood
- **Conway's Game of Life B3/S23** - Cellular automaton engine
- **p5.js** - Graphics and animation
- **12 Framework Modules** - Copied inline from GitHub
- **Single HTML File** - No build tools, no dependencies
- **Google Brand Colors** - Animated gradient rendering

### Framework Modules (Auto-included)
1. GoLEngine.js - Core cellular automaton
2. GradientPresets.js - Color palettes
3. GradientCache.js - Performance optimization
4. SimpleGradientRenderer.js - Perlin noise gradients
5. Collision.js - Hitbox detection
6. Patterns.js - Canonical GoL patterns
7. GoLHelpers.js - Seeding and life force
8. ParticleHelpers.js - Explosions
9. PatternRenderer.js - Static/loop rendering
10. GameBaseConfig.js - Responsive canvas
11. UIHelpers.js - Score/health display
12. HitboxDebug.js - Debug visualization

**You don't need to understand these** - Gemini handles everything!

---

## 💡 Tips for Better Results

1. **Be specific about game mechanics:**
   - "Player moves with arrow keys at 5 pixels per frame"
   - "Enemies spawn every 2 seconds at random X positions"
   - "Bullets move at 8 pixels per frame upward"

2. **Describe visual style:**
   - "Use Google gradient colors for all entities"
   - "Player should be blue, enemies should be red"
   - "Add particle explosions when enemies die"

3. **Include win/lose conditions:**
   - "Game over if player health reaches 0"
   - "Win when score reaches 1000 points"
   - "Lives decrease when enemy touches player"

4. **Request UI elements:**
   - "Show score in top-left corner"
   - "Display health bar at top-right"
   - "Add FPS counter in bottom-left"

---

## 🚀 Future Enhancements (Planned)

- Web interface (no need to copy/paste prompts)
- Game gallery (share your creations)
- Mobile-optimized games (touch controls)
- Multiplayer support
- Export to LifeArcade

---

_Status: Fully Functional_
_Tested with: Gemini 2.5 Pro_
_Success Rate: 95%+_
