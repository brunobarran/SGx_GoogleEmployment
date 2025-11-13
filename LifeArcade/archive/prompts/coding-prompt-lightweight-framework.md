# Coding Prompt: Lightweight Game Framework - Template System

> **⚠️ CRITICAL: Project Context**
>
> **Deadline:** 2 weeks remaining (3 weeks total)
> **Goal:** 6-8 arcade games for physical installation
> **Parallel development:** Another developer building games with vibe coding
> **Your role:** Template + validation system for consistency & quality control
> **Nice-to-have:** Web platform for LLM game generation (post-installation)

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

---

## Feature Description and Problem Solving

**Feature:** Implement a lightweight template system that enables rapid vibe coding game development while ensuring Conway's Game of Life authenticity and Google brand consistency.

**Problem it's solving:**
- **No consistency** across vibe coded games (UI, scoring, GoL usage varies)
- **No quality control** to ensure B3/S23 rules are followed correctly
- **No standardization** for Google brand guidelines
- **Scalability challenge** for future LLM web platform (need validation layer)
- **Time constraint** - 2 weeks to support 6-8 game development

**Why NOT a full framework:**
- ❌ Vibe coding generates standalone games (no need for inheritance/components)
- ❌ LLM generates complete files (no need for JSON configs)
- ❌ 2 week deadline (no time for complex architecture)
- ✅ Template + validation is sufficient

---

## User Story

```
As a game developer using vibe coding (Gemini/Claude),
I need a template starting point and validation tools,
So that my games maintain consistency, follow GoL rules, and meet brand guidelines.

Acceptance Criteria (Lightweight Framework Phase):
- Game template provides clean starting point (< 350 lines)
- Template has NO GoL background (clean white, entities use GoL)
- Template includes Google brand UI (score, lives, minimal style)
- Collision helpers available as optional utilities (< 50 lines)
- Validation tools check B3/S23 rules correctness
- Validation tools check UI brand compliance
- Runtime test validates BLINKER oscillates correctly
- Template works with vibe coding workflow (LLM generates from it)
- 2-3 example games demonstrate template usage
- Documentation explains common patterns and strategies
```

---

## Solution and Approach

**Phase Goals:**
1. Create lightweight game template (< 350 lines)
2. Build validation tools for quality control (< 100 lines)
3. Provide optional collision utilities (< 50 lines)
4. Generate 2-3 example games using template
5. Document template usage for vibe coding/LLM
6. Validate approach supports 6-8 games in 2 weeks

**Why this approach:**
- **Template over framework:** Copy-paste friendly, no learning curve
- **Validation over architecture:** Ensure quality without rigid structure
- **Vibe coding first:** Designed for LLM game generation workflow
- **Minimal overhead:** ~500 lines total vs 2000+ for full framework
- **Time-constrained:** Deliverable in 3-5 days vs 2-3 weeks

---

## Relevant Files from Codebase

**Reference for architecture and standards:**
- `.claude/CLAUDE.md` - Complete development guidelines, GoL rules, Smart Hybrid strategy
- `docs/lightweight-template-proposal.md` - Architecture decision document
- `docs/revised-strategy.md` - Timeline and division of labor

**Files created in Phase 1 (dependencies):**
- `src/core/GoLEngine.js` - B3/S23 engine with double buffer ✅
- `src/rendering/CellRenderer.js` - Batch rendering for cells ✅
- `src/utils/Patterns.js` - Canonical GoL patterns ✅
- `src/utils/Config.js` - Configuration constants ✅

**Files to create in this phase:**
```
project-root/
├── src/
│   ├── template/
│   │   ├── game-template.js       ✅ CREATED (340 lines)
│   │   └── README.md              ✅ CREATED (usage guide)
│   ├── validation/
│   │   ├── gol-validator.js       ⭐ NEW (50 lines)
│   │   └── ui-validator.js        ⭐ NEW (30 lines)
│   └── utils/
│       └── Collision.js           ⭐ NEW (50 lines)
├── examples/
│   ├── space-invaders-ca.js       ⭐ NEW (250-300 lines)
│   ├── dino-runner.js             ⭐ NEW (200-250 lines)
│   └── breakout-gol.js            ⭐ NEW (180-220 lines)
└── tests/
    ├── validation/
    │   ├── test_gol_validator.js  ⭐ NEW
    │   └── test_ui_validator.js   ⭐ NEW
    └── examples/
        └── test_examples.js       ⭐ NEW (integration tests)
```

---

## Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Get available knowledge sources
mcp__archon__rag_get_available_sources()

// Step 2: Search for validation patterns
mcp__archon__rag_search_code_examples({
  query: "validation testing patterns",
  match_count: 5
})

// Step 3: Search for template patterns
mcp__archon__rag_search_knowledge_base({
  query: "game template boilerplate",
  match_count: 5
})

// Step 4: Search for collision detection
mcp__archon__rag_search_code_examples({
  query: "collision detection algorithms",
  match_count: 3
})
```

### Available Archon Knowledge Sources

| Source ID | Title | Words | Relevant Content |
|-----------|-------|-------|------------------|
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | p5.js patterns, collision, rendering |
| `42a1fc677ff1afe4` | Nature of Code - Cellular Automata | 189k | CA patterns, validation |

### External References (if needed)

**Game references:**
- Chrome Dino Game: https://chromedino.com/ (gameplay mechanics)
- Space Invaders: Gameplay patterns

**Note:** Only use external URLs if Archon searches don't provide sufficient information.

---

## Archon Task Management Integration

### CRITICAL: Use Archon MCP for ALL task management

**Before starting implementation:**

```javascript
// 1. Create tasks in Archon for this phase
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Create Collision utilities",
  description: "Simple collision helpers (circle, rect, point). Optional import for vibe coded games.",
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework"
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
```

---

## Implementation Plan

### Consolidated Task List (6 Tasks)

**Task 1: Collision Utilities** (1-2 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Utils: Create collision detection helpers",
  description: `
Create Collision.js with simple collision utilities (optional import for games).

Requirements:
- Circle-circle collision
- Rectangle-rectangle collision (AABB)
- Circle-rectangle collision
- Point-in-rectangle collision
- Distance helper
- Clamp/lerp utilities

Implementation:
- Create src/utils/Collision.js
- Export as object with static methods
- No dependencies (pure functions)
- JSDoc comments for each function
- Examples in comments

Acceptance:
- All collision methods work correctly
- Functions are pure (no side effects)
- Can be imported optionally in games
- Examples show usage
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 10
})
```

**Implementation details:**
- Pure functions, no state
- Simple algorithms (no fancy optimizations)
- Use standard AABB, distance formulas
- 50 lines total

---

**Task 2: GoL Validator** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Validation: Create GoL validator for B3/S23 rules",
  description: `
Create GoLValidator to ensure games follow Conway's rules correctly.

CRITICAL CHECKS:
1. Static validation (code analysis):
   - Uses GoLEngine import
   - No hardcoded sprites (loadImage, .png, .jpg)
   - B3/S23 rules not modified

2. Runtime validation:
   - BLINKER test: Inject vertical blinker, verify horizontal after 1 gen
   - BLOCK test: Still life remains stable
   - Pattern stability test

Implementation:
- Create src/validation/gol-validator.js
- Export GoLValidator class
- Static method: validate(gameCode) - string analysis
- Static method: validateRuntime(golEngine) - pattern tests
- Return { valid: boolean, errors: string[] }

Acceptance:
- Detects missing GoLEngine usage
- Detects hardcoded images
- Runtime BLINKER test passes for correct engines
- Runtime BLINKER test fails for broken engines
- Clear error messages
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 20
})
```

**Implementation details:**
- Static validation: regex/string search for patterns
- Runtime validation: inject known patterns, verify evolution
- BLINKER: Most reliable test (2-generation cycle)
- 50 lines total

---

**Task 3: UI Validator** (1 hour)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Validation: Create UI validator for brand guidelines",
  description: `
Create UIValidator to ensure games follow Google brand guidelines.

CHECKS:
- Score display present (text includes "score" or "Score:")
- Google brand colors used (#5f6368, #1a73e8, #ffffff)
- Clean background (not overly cluttered)
- Minimal UI (not too many gradients/effects)
- Font consistency (Google Sans or Arial)

Implementation:
- Create src/validation/ui-validator.js
- Export UIValidator class
- Static method: validate(gameCode)
- Return { valid: boolean, errors: string[] }

Acceptance:
- Detects missing score display
- Detects non-brand colors
- Detects cluttered UI
- Provides helpful suggestions
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 30
})
```

**Implementation details:**
- String search for UI patterns
- Check color hex codes
- Count certain patterns (e.g., gradient usage)
- 30 lines total

---

**Task 4: Example Game - Space Invaders CA** (3-4 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Example: Create Space Invaders CA using template",
  description: `
Create Space Invaders with Cellular Automata aliens using game template.

Based on vibe coding reference image provided by user:
- Invaders are GoL grids with animated gradients
- Player shoots bullets at invaders
- Clean white background (NO GoL background)
- Google brand colors
- Minimal UI

Requirements:
- Start from src/template/game-template.js
- Player: Modified GoL with life force
- Invaders: Pure or Modified GoL (11x5 formation)
- Bullets: Visual Only GoL (predictable)
- Gradients: 4-8 control points, animated
- Colors: Blue, red, green, yellow, white (Google palette)

Implementation:
- Create examples/space-invaders-ca.js
- Player movement (left/right)
- Shooting (SPACE)
- Invader movement (formation, step down)
- Collision (bullets vs invaders, invaders vs player)
- Score tracking
- Wave progression

Acceptance:
- Game playable and fun
- Validates with GoLValidator (passes)
- Validates with UIValidator (passes)
- Maintains 60fps with 55 invaders
- Visual matches reference style
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 40
})
```

**Implementation details:**
- 250-300 lines (standalone file)
- Import GoLEngine, Collision, Patterns
- Gradient animation for invaders
- Formation movement logic
- 250-300 lines total

---

**Task 5: Example Game - Dino Runner** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Example: Create Dino Runner using template",
  description: `
Create Chrome Dino-style endless runner using game template.

Requirements:
- Start from src/template/game-template.js
- Player: Modified GoL (life force, never completely dies)
- Obstacles: Visual Only GoL (static pattern with flicker)
- Clean white background
- Minimal UI (score, game over)

Implementation:
- Create examples/dino-runner.js
- Player jump (SPACE)
- Gravity physics
- Obstacles spawn and scroll left
- Collision detection
- Score increments over time
- Speed increases gradually
- Game over on collision

Acceptance:
- Game playable and fun
- Validates with GoLValidator (passes)
- Validates with UIValidator (passes)
- Player GoL never dies completely
- Obstacles maintain recognizable shape
- Feels like Chrome Dino game
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 50
})
```

**Implementation details:**
- 200-250 lines (standalone file)
- Simpler than Space Invaders
- Good test of physics + jump
- Obstacle spawning with increasing difficulty
- 200-250 lines total

---

**Task 6: Example Game - Breakout GoL** (2-3 hours)

```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Example: Create Breakout with GoL bricks",
  description: `
Create Breakout/Arkanoid game with GoL aesthetic.

Requirements:
- Start from src/template/game-template.js
- Paddle: Modified GoL with life force
- Ball: Pure GoL (Glider pattern)
- Bricks: Each brick is different GoL pattern (BLOCK, BEEHIVE, BLINKER)
- Explosion: Pure GoL when brick breaks

Implementation:
- Create examples/breakout-gol.js
- Paddle movement (LEFT/RIGHT)
- Ball physics (bounce on walls, paddle, bricks)
- Brick grid (different patterns)
- Collision detection
- Brick explosion effects
- Score per brick
- Win condition (all bricks destroyed)

Acceptance:
- Game playable and fun
- Validates with GoLValidator (passes)
- Validates with UIValidator (passes)
- Each brick uses different GoL pattern
- Explosions use Pure GoL (R-pentomino or similar)
- Ball bounces feel natural
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Lightweight-Framework",
  task_order: 60
})
```

**Implementation details:**
- 180-220 lines (standalone file)
- Showcase variety of GoL patterns
- Explosion effects highlight Pure GoL
- Physics needs to feel right (paddle hit angle affects ball direction)
- 180-220 lines total

---

## Testing Strategy

### Unit Tests

**Framework:** Vitest (established in Phase 1)

**Critical Test Cases:**

1. **Collision Detection**
   ```javascript
   // tests/utils/test_Collision.js
   describe('Collision', () => {
     test('circleCircle detects overlap', () => {
       expect(Collision.circleCircle(0, 0, 10, 15, 0, 10)).toBe(true)
       expect(Collision.circleCircle(0, 0, 10, 25, 0, 10)).toBe(false)
     })

     test('rectRect detects AABB overlap', () => {
       expect(Collision.rectRect(0, 0, 10, 10, 5, 5, 10, 10)).toBe(true)
       expect(Collision.rectRect(0, 0, 10, 10, 20, 20, 10, 10)).toBe(false)
     })
   })
   ```

2. **GoL Validator**
   ```javascript
   // tests/validation/test_gol_validator.js
   describe('GoLValidator', () => {
     test('detects missing GoLEngine import', () => {
       const code = 'function draw() { background(0) }'
       const result = GoLValidator.validate(code)
       expect(result.valid).toBe(false)
       expect(result.errors).toContain('Game must import and use GoLEngine')
     })

     test('detects hardcoded images', () => {
       const code = 'loadImage("sprite.png")'
       const result = GoLValidator.validate(code)
       expect(result.valid).toBe(false)
       expect(result.errors).toContain('Visual must be procedural GoL')
     })

     test('runtime BLINKER test passes for correct engine', () => {
       const engine = new GoLEngine(10, 10, 12)
       const result = GoLValidator.validateRuntime(engine)
       expect(result.valid).toBe(true)
     })
   })
   ```

3. **UI Validator**
   ```javascript
   // tests/validation/test_ui_validator.js
   describe('UIValidator', () => {
     test('detects missing score display', () => {
       const code = 'function draw() { background(255) }'
       const result = UIValidator.validate(code)
       expect(result.valid).toBe(false)
       expect(result.errors).toContain('Game must display score')
     })

     test('passes for valid Google brand colors', () => {
       const code = 'fill("#5f6368"); text("Score: 100", 10, 10)'
       const result = UIValidator.validate(code)
       expect(result.valid).toBe(true)
     })
   })
   ```

**Run commands:**
```bash
npm test                        # Run all tests
npm test -- validation          # Run only validation tests
npm test -- --watch             # Watch mode
npm test -- --coverage          # Coverage report
```

### Integration Testing with Chrome DevTools MCP

**Test scenario: Example game validation**
```javascript
// Use Chrome DevTools MCP to test full games
const page = await mcp__chrome_devtools__new_page({
  url: "http://localhost:5173/examples/space-invaders-ca.js"
})

// Take snapshot
await mcp__chrome_devtools__take_snapshot({
  filePath: "space-invaders-test.txt"
})

// Check console for errors
const messages = await mcp__chrome_devtools__list_console_messages()
const errors = messages.filter(m => m.type === 'error')
expect(errors.length).toBe(0)

// Play for 10 seconds
await new Promise(resolve => setTimeout(resolve, 10000))

// Verify game state
const gameState = await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    return {
      score: state.score,
      phase: state.phase,
      fps: frameRate()
    }
  }`
})

expect(gameState.fps).toBeGreaterThan(58)
```

**Test scenario: Validate example games with validators**
```bash
# Run validation on example games
npm run validate examples/space-invaders-ca.js
npm run validate examples/dino-runner.js
npm run validate examples/breakout-gol.js

# Expected output:
# ✅ GoL validation passed
# ✅ UI validation passed
# ✅ Runtime test passed (BLINKER oscillates correctly)
```

### Manual Testing

**Checklist for each example game:**
1. **Visual Quality**
   - [ ] GoL cells animate organically
   - [ ] Colors match Google brand
   - [ ] UI is minimal and clean
   - [ ] Background is solid color (no GoL background)

2. **Gameplay**
   - [ ] Controls responsive (< 100ms latency)
   - [ ] Collision detection accurate
   - [ ] Game is fun to play
   - [ ] Win/lose conditions clear

3. **Performance**
   - [ ] Maintains 60fps throughout
   - [ ] No frame drops during intense moments
   - [ ] Memory stable over 5 minutes

4. **Validation**
   - [ ] Passes GoLValidator
   - [ ] Passes UIValidator
   - [ ] BLINKER test passes

---

## Edge Cases for Testing

### Validation Edge Cases:
- [ ] **Missing imports:** Game doesn't import GoLEngine
- [ ] **Hardcoded visuals:** Game uses loadImage() or static sprites
- [ ] **Modified B3/S23:** Game changes neighbor rules
- [ ] **Missing UI:** No score display
- [ ] **Wrong colors:** Uses non-brand colors

### Collision Edge Cases:
- [ ] **Overlapping exactly:** Two circles with same center
- [ ] **Edge touching:** Rectangles sharing one edge
- [ ] **Fast moving:** Bullet passes through thin obstacle
- [ ] **Zero size:** Entity with 0 width/height

### Game Edge Cases:
- [ ] **All entities dead:** No enemies, bullets, or particles
- [ ] **Rapid spawning:** 100+ entities spawn at once
- [ ] **Extended play:** Game runs for 30+ minutes
- [ ] **Edge of screen:** Entities at boundary coordinates

---

## Acceptance Criteria

### Functional Requirements:
- [ ] **FR-1:** Collision.js provides circle, rect, and mixed collision detection
- [ ] **FR-2:** GoLValidator detects missing GoLEngine usage
- [ ] **FR-3:** GoLValidator runtime test validates BLINKER oscillation
- [ ] **FR-4:** UIValidator detects missing score and wrong brand colors
- [ ] **FR-5:** Space Invaders CA example is playable and fun
- [ ] **FR-6:** Dino Runner example is playable and fun
- [ ] **FR-7:** Breakout GoL example is playable and fun
- [ ] **FR-8:** All examples pass validation (GoL + UI)

### Performance Requirements:
- [ ] **PR-1:** Collision detection < 0.1ms for 50 entities
- [ ] **PR-2:** Validation runs < 1 second per game
- [ ] **PR-3:** Examples maintain 60fps with typical entity counts
- [ ] **PR-4:** Runtime validation completes < 100ms

### Technical Requirements:
- [ ] **TR-1:** Collision utilities are pure functions (no side effects)
- [ ] **TR-2:** Validators return consistent format { valid, errors }
- [ ] **TR-3:** Examples are self-contained (one file each)
- [ ] **TR-4:** Examples import from framework (GoLEngine, Collision, Patterns)
- [ ] **TR-5:** Code follows CLAUDE.md conventions (ES6+, naming, JSDoc)
- [ ] **TR-6:** All tests pass with > 80% coverage

### Documentation Requirements:
- [ ] **DR-1:** Collision.js has JSDoc comments with examples
- [ ] **DR-2:** Validators have clear error messages
- [ ] **DR-3:** Template README.md explains usage patterns
- [ ] **DR-4:** Example games have header comments explaining mechanics

---

## Validation Commands

**CRITICAL: Version Control Policy**

⚠️ **DO NOT commit or push to git/GitHub during implementation.**

**Pre-flight checks:**
```bash
# Verify Phase 1 is complete
ls src/core/GoLEngine.js
ls src/rendering/CellRenderer.js
ls src/utils/Patterns.js
npm test -- core/test_GoLEngine

# Verify dev server runs
npm run dev
# Should show animated GoL at http://localhost:5173
```

**Development:**
```bash
npm install              # Install dependencies (if any new)
npm run dev              # Start dev server
# Navigate to http://localhost:5173
```

**Testing:**
```bash
npm test                        # Run all tests
npm test -- validation          # Run only validation tests
npm test -- --coverage          # Generate coverage report
# Expected: All tests pass, > 80% coverage for validation/
```

**Validation workflow:**
```bash
# Validate example games
npm run validate examples/space-invaders-ca.js
npm run validate examples/dino-runner.js
npm run validate examples/breakout-gol.js

# Expected output for each:
# ✅ GoL validation passed
# ✅ UI validation passed
# ✅ Runtime test passed (BLINKER oscillates correctly)
# ✅ Game ready for installation
```

**Manual gameplay testing:**
```bash
# 1. Load example in browser
# 2. Play for 2-3 minutes
# 3. Verify:
#    - GoL visuals animate organically
#    - Collision detection feels fair
#    - UI is clean and minimal
#    - Game is fun
#    - No console errors
#    - 60fps stable
```

**Phase Completion Checklist:**
- [ ] All 6 tasks completed in Archon (status: "done")
- [ ] All unit tests pass (0 failures)
- [ ] All 3 example games validate successfully
- [ ] All 3 example games playable and fun
- [ ] Validation tools work correctly
- [ ] Documentation complete (README.md)
- [ ] Performance targets met (60fps sustained)
- [ ] No console errors or warnings

**When this phase is complete:**
1. Validate all acceptance criteria above
2. Update all Archon tasks to status: "done"
3. Play-test each example game for 5 minutes
4. Run full validation suite
5. Commit code with message: "Lightweight framework complete: Template + validation + examples"
6. Ready for parallel vibe coding game development

---

## Additional Notes for the Agent

### CRITICAL: Background Decision

**NO GoL background in games** (from user feedback):
```javascript
// ❌ WRONG - Don't do this
background = new GoLBackground(p)
background.render()

// ✅ CORRECT - Clean solid background
background(CONFIG.ui.backgroundColor)  // '#FFFFFF'
```

**Rationale:**
- GoL background competes with gameplay entities
- Visual confusion between background and player/enemies
- Reference games (Space Invaders CA) use clean backgrounds
- Better visual clarity

**When to use GoL background:**
- ONLY if specific game requires it for mechanics
- Must be very subtle (low density, muted colors)
- NOT the default

---

### Template Usage Pattern

```javascript
// 1. Developer copies template
cp src/template/game-template.js examples/my-game.js

// 2. Customize game logic
function setupPlayer() {
  player = {
    x: 100,
    y: 400,
    gol: new GoLEngine(13, 13, 12),
    cellSize: 3
  }
}

function gameLogic() {
  // Add spawning, scoring, etc.
}

// 3. Test and validate
npm run validate examples/my-game.js
```

---

### GoL Strategy Cheatsheet

| Entity Type | Strategy | Code |
|-------------|----------|------|
| Player | Modified + life force | `applyLifeForce(player)` |
| Large enemies | Pure or Modified | `enemy.gol.update()` |
| Small obstacles | Visual Only | `flickerCells(obstacle)` |
| Bullets | Visual Only | Static pattern |
| Explosions | Pure GoL | R-pentomino, random |
| Powerups | Pure GoL | PULSAR, BLINKER |

---

### Common Pitfalls to Avoid

1. ❌ Adding GoL background by default (user correction)
2. ❌ Over-engineering validation (keep simple string checks)
3. ❌ Complex collision algorithms (basic is enough)
4. ❌ Requiring strict template adherence (allow flexibility)
5. ❌ Too many validation rules (focus on GoL + brand)
6. ❌ Slow runtime validation (should be < 100ms)

---

### Success Indicators

Phase is complete when:
- ✅ Template exists and is documented
- ✅ Validation tools work on example games
- ✅ 3 example games are playable and fun
- ✅ All examples pass validation
- ✅ Examples maintain 60fps
- ✅ All Archon tasks marked "done"
- ✅ Zero console errors in examples
- ✅ Ready for other dev to use template

---

## Timeline (This Phase)

### Days 1-2: Utilities + Validation
**Goal:** Core tools ready

- **Day 1 Morning:** Collision.js (50 lines)
- **Day 1 Afternoon:** GoLValidator (50 lines)
- **Day 2 Morning:** UIValidator (30 lines)
- **Day 2 Afternoon:** Unit tests for validators

**Deliverable:** Collision + validation tools tested

---

### Days 3-4: Example Games
**Goal:** Prove template works

- **Day 3:** Space Invaders CA (250-300 lines)
  - Formation movement
  - Shooting
  - Gradients
  - Validate

- **Day 4 Morning:** Dino Runner (200-250 lines)
  - Jump physics
  - Obstacles
  - Validate

- **Day 4 Afternoon:** Breakout GoL (180-220 lines)
  - Paddle/ball physics
  - Bricks with patterns
  - Validate

**Deliverable:** 3 playable, validated games

---

### Day 5: Documentation + Polish
**Goal:** Ready for parallel development

- **Morning:** Finalize template README.md
- **Afternoon:** Integration tests
- **End of day:** Full validation suite run

**Deliverable:** Complete lightweight framework

---

## Phase Deliverables

When you complete this phase, provide:

### Summary Message

```
Lightweight Framework Complete ✅

Implementation completed:
- [x] Collision utilities (50 lines)
- [x] GoL validator (50 lines)
- [x] UI validator (30 lines)
- [x] Game template (340 lines)
- [x] Template documentation (usage guide)
- [x] Example: Space Invaders CA (validated ✅)
- [x] Example: Dino Runner (validated ✅)
- [x] Example: Breakout GoL (validated ✅)

Validation results:
- GoL validation: All examples pass ✅
- UI validation: All examples pass ✅
- Runtime tests: BLINKER oscillates correctly ✅
- Performance: 60fps sustained ✅

All Archon tasks completed:
- Task 1: Collision utilities (done)
- Task 2: GoL validator (done)
- Task 3: UI validator (done)
- Task 4: Space Invaders CA example (done)
- Task 5: Dino Runner example (done)
- Task 6: Breakout GOL example (done)

Files created:
- src/utils/Collision.js
- src/validation/gol-validator.js
- src/validation/ui-validator.js
- examples/space-invaders-ca.js
- examples/dino-runner.js
- examples/breakout-gol.js
- tests/validation/test_gol_validator.js
- tests/validation/test_ui_validator.js

Framework stats:
- Total framework code: ~500 lines (template + validation + collision)
- Per game: 180-300 lines (self-contained)
- Validation time: < 1 second per game
- Runtime test: < 100ms

Ready for:
- Parallel vibe coding game development (other developer)
- 3-5 more games in next week
- Future LLM web platform integration

Next steps:
- Other developer: Use template for 3-5 more games
- Your role: Validate games as they're completed
- Timeline: 6-8 games total by end of week 2
```

---

## References

**Current codebase:**
- `src/core/GoLEngine.js` - Phase 1 GoL engine
- `src/template/game-template.js` - Created this phase
- `src/template/README.md` - Usage documentation
- `.claude/CLAUDE.md` - Full development guidelines

**Proposal documents:**
- `docs/lightweight-template-proposal.md` - Architecture decision
- `docs/revised-strategy.md` - Timeline and division of labor
- `docs/minimal-framework-proposal.md` - Original framework concept (rejected as too complex)

**Phase 1:**
- `prompts/coding-prompt-dino-game-OPTIMIZED.md` - Phase 1 implementation
- GoL engine, rendering, patterns all complete

**Smart Hybrid Strategy (CLAUDE.md lines 95-152):**
- Pure GoL: Explosions, powerups (100% authentic)
- Modified GoL: Player, bosses (80% authentic, life force)
- Visual Only: Bullets, small obstacles (0% authentic but looks good)
