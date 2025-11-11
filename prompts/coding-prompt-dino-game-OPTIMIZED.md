# Coding Prompt: Dinosaur Game - Phase 1 (Foundation)

> **⚠️ CRITICAL: Version Control Policy**
>
> **DO NOT use git commands. DO NOT commit. DO NOT push to GitHub.**
>
> This is a development-only phase. All git operations will be handled manually after code review.

> **Multi-Phase Implementation Strategy**
>
> This project is divided into 3 sequential phases to manage complexity:
> - **Phase 1 (THIS DOCUMENT):** Core GoL engine, rendering system, and background
> - **Phase 2:** Entity system, player, obstacles, and collision
> - **Phase 3:** Game loop, state machine, UI, and testing
>
> Complete Phase 1 and validate before proceeding to Phase 2.

---

## Feature Description and Problem Solving

**Feature:** Implement the foundational architecture for a Dinosaur Game using Conway's Game of Life aesthetic with procedurally generated cellular automaton visuals.

**Problem it's solving:**
- Creating the core GoL simulation engine that will power all visual elements
- Establishing performance-optimized rendering for thousands of living cells at 60fps
- Building reusable architecture for Pure GoL background that maintains B3/S23 authenticity
- Validating that Mac Mini M4 can handle real-time GoL simulations at target performance

---

## User Story

```
As a developer building the Game of Life Arcade,
I need a robust GoL engine and rendering system,
So that I can create visually stunning games with authentic cellular automaton behavior.

Acceptance Criteria (Phase 1):
- GoL engine correctly implements B3/S23 rules using double buffer pattern
- Engine never modifies grid while reading (mathematically correct)
- Background shows pure GoL simulation at 10fps update rate
- Rendering system batches cells for optimal performance
- Main loop maintains 60fps with background simulation active
- Pattern library includes canonical GoL patterns (BLOCK, BLINKER, GLIDER)
- All core components have unit tests with > 80% coverage
```

---

## Solution and Approach

**Phase 1 Goals:**
1. Implement mathematically correct GoL engine with double buffering
2. Create performance-optimized cell renderer using p5.js batch rendering
3. Build Pure GoL background as proof-of-concept for authenticity strategy
4. Establish project structure and development workflow
5. Validate performance targets (< 1ms for GoL simulation per frame)

**Why this approach:**
- **Foundation first:** GoL engine is the heart of the entire project
- **Validate early:** Prove performance targets are achievable before building game logic
- **Incremental complexity:** Start with stateless background before adding interactive entities
- **Test-driven:** Establish testing patterns from the beginning

---

## Relevant Files from Codebase

**Reference for architecture and standards:**
- `.claude/CLAUDE.md` - Complete development guidelines, GoL rules, coding standards

**Files to create in Phase 1:**
```
project-root/
├── package.json                    # Dependencies: vite, p5.js
├── vite.config.js                  # Dev server configuration
├── index.html                      # Entry point
├── sketch.js                       # p5.js main sketch
├── src/
│   ├── core/
│   │   └── GoLEngine.js           # B3/S23 engine with double buffer
│   ├── rendering/
│   │   ├── CellRenderer.js        # Batch rendering for cells
│   │   └── GoLBackground.js       # Pure GoL background
│   └── utils/
│       ├── Patterns.js            # Canonical GoL patterns
│       └── Config.js              # Configuration constants
└── tests/
    ├── core/
    │   └── test_GoLEngine.js      # Engine unit tests
    └── utils/
        └── test_Patterns.js       # Pattern validation tests
```

---

## Research Strategy

### CRITICAL: Research Order

**1. ALWAYS search Archon knowledge base FIRST before external URLs**

**2. Use Archon MCP tools to find information:**

```javascript
// Step 1: Get available knowledge sources
mcp__archon__rag_get_available_sources()

// Step 2: Search for GoL implementation patterns
mcp__archon__rag_search_knowledge_base({
  query: "Game of Life B3/S23 double buffer",
  source_id: "42a1fc677ff1afe4",  // Nature of Code - Cellular Automata
  match_count: 5
})

// Step 3: Search for p5.js rendering optimization
mcp__archon__rag_search_knowledge_base({
  query: "p5js WebGL batch rendering performance",
  source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
  match_count: 5
})

// Step 4: Find code examples
mcp__archon__rag_search_code_examples({
  query: "Game Life implementation pattern",
  match_count: 3
})
```

### Available Archon Knowledge Sources

| Source ID | Title | Words | Content |
|-----------|-------|-------|---------|
| `4d2cf40b9f01cfcd` | P5.js Reference | 268k | Complete p5.js API documentation |
| `42a1fc677ff1afe4` | Nature of Code - Cellular Automata | 189k | CA theory, GoL implementation |
| `b10ed112d80b75a1` | Conway's Game of Life (Wikipedia) | 7.6k | B3/S23 rules, pattern catalog |
| `5d5b65af576c1c87` | P5.js Game of Life Example | 749 | Working GoL implementation |
| `61fecfc7b8236399` | Processing Game of Life | 1.4k | Reference implementation |
| `8c1ae5409263093b` | Spaceship Patterns (Wikipedia) | 1k | Moving GoL patterns |

### Step 2: Consider Indexing Additional Sources (if needed)

**If Archon searches return insufficient GoL pattern details, index LifeWiki:**

The following LifeWiki pages contain essential GoL pattern catalogs not yet in Archon:
- https://conwaylife.com/wiki/Conway%27s_Game_of_Life (complete rules reference)
- https://conwaylife.com/wiki/Oscillator (period-N oscillators catalog)
- https://conwaylife.com/wiki/Still_life (stable patterns like Beehive, Loaf)
- https://conwaylife.com/wiki/Spaceship (moving patterns, speeds)
- https://conwaylife.com/wiki/Methuselah (long-evolution patterns for explosions)

**Note:** Only index these if `rag_search_knowledge_base` queries for "BLINKER", "PULSAR", "BEEHIVE" return insufficient results.

### Step 3: External URLs (last resort only)

- [Chrome Dinosaur Game](https://chromedino.com/) - Mechanics reference (for Phase 2/3)

---

## Archon Task Management Integration

### CRITICAL: Use Archon MCP for ALL task management

**Before starting implementation:**

```javascript
// 1. Create tasks in Archon for Phase 1
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Implement GoL Engine with double buffer",
  description: "Create GoLEngine.js with B3/S23 rules, double buffer pattern, and variable update rates. Must pass Blinker oscillation test.",
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation"
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
  filter_value: "Phase1-Foundation"
})
```

**Task Granularity Guidelines:**
- Each task should be 30 minutes to 4 hours of work
- Tasks should have clear, testable acceptance criteria
- Use `feature` field to group related tasks (e.g., "Phase1-Foundation")

---

## Phase 1 Implementation Plan

### Consolidated Task List (6 Tasks)

**Task 1: Project Setup and Configuration** (45 minutes)
```javascript
// Create in Archon:
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Setup: Project initialization and dev environment",
  description: `
Initialize npm project with Vite and p5.js. Create directory structure matching CLAUDE.md architecture.

Subtasks:
- Create package.json with dependencies: vite@^5.0.0, p5@^1.8.0
- Create vite.config.js with dev server settings
- Create index.html with canvas element
- Create directory structure: src/{core,rendering,utils}/, tests/{core,utils}/
- Create basic sketch.js with empty setup() and draw()
- Run 'npm install' and verify 'npm run dev' works

Acceptance:
- Dev server runs at http://localhost:5173
- Browser shows blank canvas with no console errors
- Hot module reload works when editing sketch.js
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 10
})
```

**Implementation details:**
- Initialize npm project: `npm init -y`
- Install dependencies: `npm install -D vite` and `npm install p5`
- Create `vite.config.js`:
  ```javascript
  export default {
    server: { port: 5173 },
    build: { outDir: 'dist' }
  }
  ```
- Create directory structure
- Create basic `sketch.js` with p5.js template
- Add scripts to `package.json`: `"dev": "vite"`, `"build": "vite build"`

---

**Task 2: GoL Engine with Double Buffer** (2-3 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Core: Implement GoL Engine with B3/S23 rules",
  description: `
Create GoLEngine.js implementing Conway's Game of Life with mathematically correct double buffer pattern.

CRITICAL REQUIREMENTS:
- MUST use double buffer (current + next grids)
- NEVER modify grid while reading
- ALWAYS swap buffers after update
- Implement pure B3/S23 rules (Birth: 3, Survival: 2 or 3)

Implementation:
- Create src/core/GoLEngine.js
- Implement 2D grid utilities (create, clear, copy)
- Implement countLiveNeighbors() with Moore neighborhood (8 neighbors)
- Implement applyB3S23Rules(current, next) - read from current, write to next
- Implement update() method with buffer swap
- Add setCell(), getCell(), clearGrid(), randomSeed() methods
- Add update rate throttling (target fps tracking)
- Add getPattern() and setPattern() for testing

Acceptance:
- Blinker pattern oscillates with period 2 (test validates this)
- Double buffer test: pointers swap, not modified in place
- countLiveNeighbors() handles edges/corners correctly
- randomSeed() creates ~30% density distribution
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 20
})
```

**Implementation details:**
- Use double buffer pattern (see CLAUDE.md lines 68-92)
- Implement B3/S23 rules:
  ```javascript
  applyB3S23(currentState, neighbors) {
    if (currentState === ALIVE) {
      return (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
    } else {
      return (neighbors === 3) ? ALIVE : DEAD
    }
  }
  ```
- Moore neighborhood: count all 8 adjacent cells
- Handle boundary: treat out-of-bounds as dead (fixed boundary, not wrap-around)

---

**Task 3: Pattern Library and Utilities** (1 hour)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Utils: Create canonical GoL pattern library",
  description: `
Create Patterns.js with canonical Game of Life patterns from literature (LifeWiki).

Patterns to implement:
1. BLOCK (2x2 still life) - Never changes
2. BLINKER (1x3 oscillator) - Period 2
3. GLIDER (3x3 spaceship) - Moves diagonally at c/4 speed
4. BEEHIVE (still life) - Never changes
5. PULSAR (oscillator) - Period 3 (future use)

Also create Config.js with game constants.

Requirements:
- ALL patterns must be from LifeWiki/Golly (NO invented patterns)
- Add JSDoc comments with LifeWiki attribution
- Include stampPattern(grid, pattern, x, y) utility
- Pattern format: 2D array where 1=alive, 0=dead

Config.js should export:
- VISUAL_CONFIG: cellSize, colors, gridDimensions
- PERFORMANCE_CONFIG: updateRates, targetFPS
- GAME_CONFIG: placeholder for future physics constants

Acceptance:
- Glider pattern moves 1 cell diagonally per 4 generations (test validates)
- Blinker oscillates with period 2 (test validates)
- BLOCK remains stable forever (test validates)
- All patterns have LifeWiki attribution in JSDoc comments
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 30
})
```

**Implementation details:**
- Pattern format: `[[0,1,0], [0,1,0], [0,1,0]]` for vertical Blinker
- Use patterns from CLAUDE.md lines 313-356
- Add `stampPattern(grid, pattern, x, y)` to write pattern into grid at position

---

**Task 4: Cell Renderer with Batch Rendering** (1.5-2 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Rendering: Implement optimized cell renderer",
  description: `
Create CellRenderer.js with batch rendering for optimal performance.

CRITICAL FOR PERFORMANCE:
- Use beginShape(QUADS) / endShape() for batch rendering
- NEVER call rect() in nested loops (extremely slow)
- Only render alive cells (skip dead cells)
- Support configurable cell size, spacing, and color

Implementation:
- Create src/rendering/CellRenderer.js
- Implement renderGrid(grid, x, y, cellSize, color)
- Use p5.js vertex() calls within single beginShape/endShape block
- Add grid-to-screen coordinate transformation
- Support camera offset for scrolling backgrounds (future)
- Add renderCell(x, y, size, color) for individual cells (debugging)

Optimization notes:
- Batch all cells into one draw call
- Pre-calculate vertex positions
- Use WebGL mode for hardware acceleration

Acceptance:
- Rendering 2,400 cells (60x40 grid) takes < 0.5ms per frame
- No individual rect() calls in render loop
- Visual validation: cells appear as white squares on black background
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 40
})
```

**Implementation details:**
- Batch rendering pattern from CLAUDE.md lines 273-294
- Use `beginShape(QUADS)` followed by `vertex()` calls for each cell corner
- Skip rendering if cell is dead: `if (grid[x][y] === ALIVE) { ... }`

---

**Task 5: Pure GoL Background** (1.5 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Rendering: Implement Pure GoL background",
  description: `
Create GoLBackground.js that showcases authentic B3/S23 simulation.

AUTHENTICITY REQUIREMENTS:
- 100% Pure GoL - NO modifications allowed
- Follows B3/S23 rules without ANY tweaks
- Update rate: 10fps (performance optimization)
- This is the showcase for real Conway's Game of Life

Implementation:
- Create src/rendering/GoLBackground.js
- Initialize GoLEngine with 60x40 cell grid (2,400 cells)
- Set update rate to 10fps (updates every 6 frames at 60fps)
- Implement randomSeed() with ~30% initial density
- Implement update() - throttles engine.update() to 10fps
- Implement render() - uses CellRenderer to draw cells

Performance targets:
- GoL simulation: < 0.2ms per update (happens every 6 frames)
- Rendering: < 0.5ms per frame
- Combined budget: < 0.7ms per frame average

Acceptance:
- Background animates at 10fps update rate
- Main loop maintains 60fps
- Known patterns evolve correctly (inject Blinker, verify period 2)
- Visual appearance: organic, flowing cellular patterns
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 50
})
```

**Implementation details:**
- Large grid for visual interest: 60 cols × 40 rows = 2,400 cells
- Update rate throttling:
  ```javascript
  update() {
    if (frameCount % 6 === 0) {  // Every 6 frames = 10fps at 60fps
      this.engine.update()
    }
  }
  ```
- Random seed with ~30% density creates interesting initial patterns

---

**Task 6: Unit Tests for Core Components** (2-3 hours)
```javascript
mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Testing: Unit tests for GoL engine and patterns",
  description: `
Create unit tests for GoLEngine and Pattern library using Vitest.

Test files to create:
1. tests/core/test_GoLEngine.js
2. tests/utils/test_Patterns.js

Critical tests for GoLEngine:
- Double buffer: Verify pointers swap (not modified in place)
- B3/S23 rules: Blinker oscillates with period 2
- countLiveNeighbors: Edge cases (corners, edges, center)
- Boundary handling: Out-of-bounds treated as dead
- randomSeed: Creates ~30% density

Critical tests for Patterns:
- Glider moves diagonally (1 cell per 4 generations)
- Blinker oscillates (period 2)
- BLOCK is stable (never changes)
- stampPattern writes pattern correctly

Setup:
- Install vitest: npm install -D vitest
- Add test script to package.json: "test": "vitest"
- Create tests/ directory structure mirroring src/

Acceptance:
- All tests pass (0 failures)
- Code coverage > 80% for core modules
- Tests validate GoL correctness, not just code coverage
  `,
  status: "todo",
  assignee: "Coding Agent",
  feature: "Phase1-Foundation",
  task_order: 60
})
```

**Implementation details:**
- Use Vitest (faster than Jest, better Vite integration)
- Test examples from CLAUDE.md lines 567-603
- Focus on correctness tests, not just coverage numbers

---

## Testing Strategy (Phase 1)

### Unit Tests

**Framework:** Vitest (recommended for Vite projects)

**Setup:**
```bash
npm install -D vitest
# Add to package.json scripts: "test": "vitest"
```

**Critical Test Cases:**

1. **Double Buffer Verification** (HIGHEST PRIORITY)
   ```javascript
   test('GoLEngine uses double buffer (never modifies while reading)', () => {
     const engine = new GoLEngine(5, 5)
     const beforePtr = engine.current
     engine.update()
     // Pointers must be swapped, not modified in place
     expect(engine.current).not.toBe(beforePtr)
     expect(engine.current).toBe(beforePtr === engine.current ? engine.next : beforePtr)
   })
   ```

2. **B3/S23 Rule Correctness**
   ```javascript
   test('Blinker pattern oscillates with period 2', () => {
     const engine = new GoLEngine(3, 3)
     const gen0 = [[0,1,0], [0,1,0], [0,1,0]]  // Vertical
     const gen1 = [[0,0,0], [1,1,1], [0,0,0]]  // Horizontal

     engine.setPattern(gen0)
     engine.update()
     expect(engine.getPattern()).toEqual(gen1)

     engine.update()
     expect(engine.getPattern()).toEqual(gen0)  // Back to original
   })
   ```

3. **Pattern Movement**
   ```javascript
   test('Glider pattern moves diagonally', () => {
     const engine = new GoLEngine(10, 10)
     engine.setPattern(Patterns.GLIDER, 2, 2)

     const initialCenter = getCenterOfMass(engine.current)

     // After 4 generations, glider moves 1 cell diagonally
     for (let i = 0; i < 4; i++) engine.update()

     const finalCenter = getCenterOfMass(engine.current)
     expect(finalCenter.x).toBeCloseTo(initialCenter.x + 1)
     expect(finalCenter.y).toBeCloseTo(initialCenter.y + 1)
   })
   ```

**Run commands:**
```bash
npm test                    # Run all tests
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

### Manual Visual Testing with Chrome DevTools MCP

**IMPORTANT:** Use Chrome DevTools MCP for browser automation and performance monitoring.

**Test scenario: Background Animation**
```javascript
// Use Chrome DevTools MCP to automate visual testing
const page = await mcp__chrome_devtools__new_page({
  url: "http://localhost:5173"
})

// Take snapshot of initial state
await mcp__chrome_devtools__take_snapshot({ filePath: "phase1-background.txt" })

// Start performance monitoring
await mcp__chrome_devtools__performance_start_trace({
  reload: false,
  autoStop: false
})

// Wait 10 seconds to observe animation
await new Promise(resolve => setTimeout(resolve, 10000))

// Stop tracing and check metrics
await mcp__chrome_devtools__performance_stop_trace()

// Verify:
// - Background shows animated cellular patterns
// - Patterns evolve organically (not static)
// - FPS stays at 58-60fps
// - No visual glitches or tearing
```

**Test scenario: Known Pattern Injection**
```javascript
// Inject known pattern using Chrome DevTools MCP
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    window.background.engine.setPattern([[0,1,0],[0,1,0],[0,1,0]], 10, 10)
    return "Blinker injected at (10, 10)"
  }`
})

// Wait 2 GoL updates (~200ms at 10fps)
await new Promise(resolve => setTimeout(resolve, 200))

// Verify pattern oscillated
await mcp__chrome_devtools__evaluate_script({
  function: `() => {
    const region = window.background.engine.getRegion(9, 9, 3, 3)
    return { region, message: "Should be horizontal now" }
  }`
})
```

**Manual verification checklist:**
1. Run `npm run dev`
2. Navigate to http://localhost:5173
3. Verify:
   - Background shows animated cellular patterns
   - Patterns evolve organically (not static)
   - Main loop shows ~60fps in console
   - No visual glitches or tearing

---

## Edge Cases for Testing

### GoL Engine Edge Cases:
- [ ] **Grid boundaries:** Cells on edges/corners count neighbors correctly
- [ ] **Empty grid:** All-dead grid remains dead (no spontaneous generation)
- [ ] **Full grid:** All-alive grid evolves to expected pattern (mass die-off)
- [ ] **Single cell:** Dies from underpopulation
- [ ] **Buffer consistency:** Swapping buffers multiple times maintains correctness

### Pattern Library Edge Cases:
- [ ] **Pattern placement:** stampPattern at grid boundaries doesn't crash
- [ ] **Pattern rotation:** Rotated patterns still behave correctly
- [ ] **Overlapping patterns:** Multiple patterns stamped on same grid don't corrupt

### Performance Edge Cases:
- [ ] **Large grid:** 60x40 cells maintains < 1ms simulation time
- [ ] **Dense grid:** 60% alive cells doesn't degrade performance
- [ ] **Sparse grid:** 10% alive cells still renders correctly

---

## Acceptance Criteria (Phase 1)

### Functional Requirements:
- [ ] **FR-1:** GoL engine implements B3/S23 rules correctly (Blinker test passes)
- [ ] **FR-2:** Engine uses double buffer pattern (pointer swap test passes)
- [ ] **FR-3:** Background shows Pure GoL simulation at 10fps update rate
- [ ] **FR-4:** Pattern library includes BLOCK, BLINKER, GLIDER with LifeWiki attribution
- [ ] **FR-5:** Config.js exports VISUAL_CONFIG, PERFORMANCE_CONFIG, GAME_CONFIG

### Performance Requirements:
- [ ] **PR-1:** GoL simulation (60x40 cells) takes < 0.2ms per update
- [ ] **PR-2:** Cell rendering (2,400 cells) takes < 0.5ms per frame
- [ ] **PR-3:** Main loop maintains 60fps with background active
- [ ] **PR-4:** Total GoL budget (simulation + rendering) < 0.7ms per frame average

### Technical Requirements:
- [ ] **TR-1:** Double buffer NEVER modifies grid while reading
- [ ] **TR-2:** All patterns are canonical (from LifeWiki/Golly, not invented)
- [ ] **TR-3:** Code follows CLAUDE.md conventions (ES6+, naming, JSDoc)
- [ ] **TR-4:** Unit tests pass with > 80% coverage for core modules
- [ ] **TR-5:** No console errors or warnings during dev server runtime

### Documentation Requirements:
- [ ] **DR-1:** All public APIs have JSDoc comments
- [ ] **DR-2:** Pattern library includes LifeWiki attribution
- [ ] **DR-3:** README.md includes setup and run instructions for Phase 1

---

## Validation Commands (Phase 1)

**CRITICAL: Version Control Policy**

⚠️ **DO NOT commit or push to git/GitHub during implementation.**

This is a development phase only. Code will be reviewed and committed manually after validation.

**Pre-flight checks:**
```bash
node --version  # Should be >= 18.x
npm --version   # Should be >= 9.x
ls .claude/CLAUDE.md  # Should exist
```

**Setup and development:**
```bash
npm install              # Install dependencies
npm run dev              # Start dev server
# Navigate to http://localhost:5173
```

**Testing:**
```bash
npm test                 # Run all unit tests
npm test -- --coverage   # Generate coverage report
# Expected: All tests pass, > 80% coverage for core/
```

**Performance validation:**
```bash
npm run dev
# Open http://localhost:5173
# Open browser DevTools → Performance tab
# Record 10 seconds
# Verify:
# - Main thread FPS: 58-60fps
# - GoL simulation time: < 0.2ms per update (every 6 frames)
# - Rendering time: < 0.5ms per frame
```

**Manual visual validation:**
```bash
# 1. Background animates
# 2. Patterns evolve organically
# 3. No visual glitches
# 4. FPS counter shows ~60fps (if enabled)
```

**Phase 1 Completion Checklist:**
- [ ] All 6 tasks completed in Archon (status: "done")
- [ ] All unit tests pass (0 failures)
- [ ] Coverage > 80% for src/core/ and src/utils/
- [ ] Background animates at 60fps with 10fps GoL updates
- [ ] Performance targets met (< 0.7ms total per frame)
- [ ] Visual validation: Background looks organic and alive
- [ ] No console errors or warnings
- [ ] README.md documents Phase 1 setup and usage

**When Phase 1 is complete:**
1. Validate all acceptance criteria above
2. Update all Archon tasks to status: "done"
3. Commit code with message: "Phase 1 complete: GoL engine and background"
4. Proceed to Phase 2 implementation prompt

---

## Additional Notes for the Agent

### CRITICAL: Double Buffer Pattern

This is **NON-NEGOTIABLE** and the #1 source of GoL implementation bugs:

```javascript
// ✅ CORRECT
class GoLEngine {
  constructor(cols, rows) {
    this.current = create2DArray(cols, rows)
    this.next = create2DArray(cols, rows)
  }

  update() {
    // Read from current, write to next
    this.applyRules(this.current, this.next)

    // Swap pointers (not copy data!)
    [this.current, this.next] = [this.next, this.current]
  }
}

// ❌ WRONG
class BadGoLEngine {
  update() {
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // NEVER DO THIS - modifies while reading!
        this.grid[x][y] = this.calculateNextState(x, y)
      }
    }
  }
}
```

### Performance Optimization Patterns

```javascript
// ✅ GOOD: Batch rendering
function renderCells(grid) {
  beginShape(QUADS)
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === ALIVE) {
        const px = x * cellSize
        const py = y * cellSize
        vertex(px, py)
        vertex(px + cellSize, py)
        vertex(px + cellSize, py + cellSize)
        vertex(px, py + cellSize)
      }
    }
  }
  endShape()
}

// ❌ BAD: Individual rect() calls
function renderCells(grid) {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === ALIVE) {
        rect(x * cellSize, y * cellSize, cellSize, cellSize)  // SLOW!
      }
    }
  }
}
```

### Common Pitfalls to Avoid

1. ❌ Modifying grid while reading it (use double buffer!)
2. ❌ Rendering cells individually (use batch rendering!)
3. ❌ Forgetting to swap buffers after update
4. ❌ Creating grids larger than necessary (60x40 is sufficient for background)
5. ❌ Inventing patterns instead of using canonical ones from LifeWiki
6. ❌ Testing visual appearance instead of behavior (test Blinker oscillation, not "does it look right")

### Success Indicators

Phase 1 is complete when:
- ✅ Blinker oscillates with period 2 (test passes)
- ✅ Glider moves diagonally (test passes)
- ✅ Background animates at 60fps
- ✅ GoL simulation takes < 0.2ms per update
- ✅ All Archon tasks marked "done"
- ✅ Zero console errors
- ✅ Code follows CLAUDE.md conventions

---

## Phase 1 Deliverables

When you complete Phase 1, provide:

### Summary Message

```
Phase 1 Complete: GoL Engine and Background ✅

Implementation completed:
- [x] Project setup with Vite + p5.js
- [x] GoL engine with double buffer pattern
- [x] Pattern library (BLOCK, BLINKER, GLIDER)
- [x] Batch cell renderer
- [x] Pure GoL background (60x40 cells, 10fps)
- [x] Unit tests (>80% coverage)

Performance validation:
- GoL simulation: 0.15ms per update ✅
- Rendering: 0.4ms per frame ✅
- Main loop: 60fps sustained ✅

All Archon tasks completed:
- Task 1: Project Setup (done)
- Task 2: GoL Engine (done)
- Task 3: Pattern Library (done)
- Task 4: Cell Renderer (done)
- Task 5: GoL Background (done)
- Task 6: Unit Tests (done)

Files created:
- package.json, vite.config.js, index.html, sketch.js
- src/core/GoLEngine.js
- src/rendering/CellRenderer.js, GoLBackground.js
- src/utils/Patterns.js, Config.js
- tests/core/test_GoLEngine.js
- tests/utils/test_Patterns.js

Ready for Phase 2: Entity system and player implementation
```
