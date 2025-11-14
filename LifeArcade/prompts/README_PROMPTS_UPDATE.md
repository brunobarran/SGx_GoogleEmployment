# ⚠️ PROMPTS REQUIRE UPDATE

**Date:** 2025-11-14
**Status:** LLM prompts need updating for new resolution standard

---

## 📋 CURRENT STATE

The LLM test prompts (`test-llm-snake-game.md`, `test-llm-pong-game.md`) were created for the **old 800×600 resolution pattern**.

The project has since been updated to **1200×1920 portrait resolution** with additional features.

---

## 🎯 WHAT NEEDS UPDATING

### Resolution Changes
- ❌ Old: `Canvas: 800×600`
- ✅ New: `Canvas: 1200×1920` (portrait)

### Entity Size Changes
- ❌ Old: `60×60, cellSize 10`
- ✅ New: `180×180, cellSize 30` (scaled 3x)

### New Features Required
1. **Responsive canvas**
   - `BASE_WIDTH = 1200`
   - `BASE_HEIGHT = 1920`
   - `ASPECT_RATIO = 0.625`
   - `calculateResponsiveSize()`
   - `updateConfigScale()`
   - `scaleFactor`

2. **postMessage integration**
   ```javascript
   if (window.parent !== window) {
     window.parent.postMessage({
       type: 'gameOver',
       payload: { score: state.score }
     }, '*')
   }
   ```

3. **DYING phase**
   - `state.phase = 'DYING'` before `'GAMEOVER'`
   - `state.dyingTimer`
   - `GAMEOVER_CONFIG = { MIN_DELAY: 30, MAX_WAIT: 150 }`

4. **Rendering with scale**
   ```javascript
   push()
   scale(scaleFactor)
   // ... render entities ...
   pop()
   ```

5. **Window resize handler**
   ```javascript
   function windowResized() {
     const size = calculateResponsiveSize()
     canvasWidth = size.width
     canvasHeight = size.height
     updateConfigScale()
     resizeCanvas(canvasWidth, canvasHeight)
   }

   window.windowResized = windowResized
   ```

---

## ✅ REFERENCE

See **`src/game-template.js`** for the complete updated pattern.

All existing games (`space-invaders.js`, `dino-runner.js`, `breakout.js`, `flappy-bird.js`) already follow this new pattern.

---

## 🚀 NEXT STEPS

If you want to use LLMs to generate new games:

1. Update `test-llm-snake-game.md` with new pattern
2. Update `test-llm-pong-game.md` with new pattern
3. Test generation with updated prompts
4. Validate output matches existing game pattern

**Estimated time:** 1-2 hours to update both prompts thoroughly

---

## 📝 NOTES

- The prompts are still valid for the **framework concepts** (GoL helpers, patterns, etc.)
- Only the **technical specifications** (resolution, sizes, postMessage) need updating
- Consider using `game-template.js` directly in prompts instead of embedding full framework docs
