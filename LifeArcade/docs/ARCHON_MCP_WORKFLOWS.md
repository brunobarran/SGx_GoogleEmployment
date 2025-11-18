# Archon MCP Workflows

**Version:** 1.0
**Status:** Active
**Last Updated:** 2025-11-18

---

## Overview

This document consolidates common Archon MCP workflows for LifeArcade development. Archon MCP provides task management, knowledge base access, and project documentation capabilities integrated into the development process.

**Purpose:**
- Standardize research patterns using RAG (Retrieval-Augmented Generation)
- Define task management flows for feature implementation
- Document project management integration
- Provide workflow templates for common scenarios

---

## Table of Contents

1. [Archon MCP Overview](#archon-mcp-overview)
2. [Research Workflows](#research-workflows)
3. [Task Management Workflows](#task-management-workflows)
4. [Project Management](#project-management)
5. [Common Workflow Templates](#common-workflow-templates)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

---

## Archon MCP Overview

### What is Archon MCP?

**Archon MCP** is a Model Context Protocol server providing:
- **RAG Knowledge Base**: Search curated documentation sources
- **Task Management**: Create, track, and complete implementation tasks
- **Project Management**: Organize features, documents, and versions
- **Code Examples**: Search for implementation patterns

### Available Tools

| Tool | Purpose | Common Use |
|------|---------|-----------|
| `rag_get_available_sources` | List knowledge base sources | Find source IDs for filtering |
| `rag_search_knowledge_base` | Search documentation | Research APIs, patterns, concepts |
| `rag_search_code_examples` | Find code snippets | Implementation examples |
| `rag_read_full_page` | Read complete doc page | Deep dive into specific topics |
| `rag_list_pages_for_source` | Browse source structure | Explore documentation layout |
| `find_tasks` | Query tasks | Check progress, find work |
| `manage_task` | Create/update/delete tasks | Track implementation |
| `find_projects` | List/search projects | Project overview |
| `manage_project` | Create/update projects | Project organization |

### LifeArcade Project ID

**Project ID:** `9ebdf1e2-ed0a-422f-8941-98191481f305`

**Use this ID when:**
- Querying tasks for LifeArcade
- Creating new tasks
- Searching project-specific documents

---

## Research Workflows

### Workflow 1: Quick Documentation Lookup

**Scenario:** Need to verify API syntax or configuration option.

**Steps:**

1. **Search knowledge base** with focused query (2-5 keywords):
   ```javascript
   mcp__archon__rag_search_knowledge_base({
     query: "vite dev server port",
     match_count: 3
   })
   ```

2. **Review results** - check page previews for relevance

3. **Read full page** if needed:
   ```javascript
   mcp__archon__rag_read_full_page({
     page_id: "550e8400-e29b-41d4-a716-446655440000"
   })
   ```

**Example: Vite Configuration**
```javascript
// 1. Search
const results = await mcp__archon__rag_search_knowledge_base({
  query: "vite config server",
  source_id: "22832de63c03f570",  // Vite docs
  match_count: 5
})

// 2. Read specific page
const page = await mcp__archon__rag_read_full_page({
  page_id: results[0].page_id
})

// 3. Apply configuration
// vite.config.js
export default {
  server: {
    port: 5174,
    strictPort: true
  }
}
```

---

### Workflow 2: Deep Research (New Feature)

**Scenario:** Implementing a new feature requiring multiple documentation sources.

**Steps:**

1. **List available sources:**
   ```javascript
   mcp__archon__rag_get_available_sources()
   ```

2. **Search multiple sources** with same query:
   ```javascript
   // Search p5.js docs
   const p5Results = await mcp__archon__rag_search_knowledge_base({
     query: "gradient noise perlin",
     source_id: "4d2cf40b9f01cfcd",  // P5.js Reference
     match_count: 5
   })

   // Search Nature of Code
   const nocResults = await mcp__archon__rag_search_knowledge_base({
     query: "perlin noise 2d",
     source_id: "42a1fc677ff1afe4",  // Nature of Code
     match_count: 5
   })
   ```

3. **Search code examples:**
   ```javascript
   const examples = await mcp__archon__rag_search_code_examples({
     query: "perlin noise animation",
     match_count: 3
   })
   ```

4. **Read full pages** for detailed implementation:
   ```javascript
   const fullDoc = await mcp__archon__rag_read_full_page({
     page_id: p5Results[0].page_id
   })
   ```

5. **Synthesize information** and implement

**Example: Adding Perlin Noise Gradients**
```javascript
// Research flow:
// 1. Search p5.js for noise() API
// 2. Search Nature of Code for theory
// 3. Search code examples for animation patterns
// 4. Read full p5.js noise reference
// 5. Implement:

class SimpleGradientRenderer {
  constructor(p5Instance) {
    this.p5 = p5Instance
    this.noiseOffset = 0
  }

  updateAnimation() {
    this.noiseOffset += 0.01  // Slow drift
  }

  getGradientColor(x, y, gradient) {
    const noiseVal = this.p5.noise(
      x * 0.01,
      y * 0.01,
      this.noiseOffset
    )
    const t = noiseVal  // 0-1 range
    return lerpGradient(gradient, t)
  }
}
```

---

### Workflow 3: Conway's Game of Life Pattern Research

**Scenario:** Need to implement a specific GoL pattern or verify B3/S23 rules.

**Steps:**

1. **Search Conwaylife Wiki** (primary source):
   ```javascript
   const results = await mcp__archon__rag_search_knowledge_base({
     query: "pulsar oscillator period",
     source_id: "141a7d7e14c8b58b",  // Conwaylife Wiki
     match_count: 3
   })
   ```

2. **Search code examples** for implementation:
   ```javascript
   const examples = await mcp__archon__rag_search_code_examples({
     query: "game of life patterns",
     match_count: 5
   })
   ```

3. **Read full pattern documentation:**
   ```javascript
   const pattern = await mcp__archon__rag_read_full_page({
     page_id: results[0].page_id
   })
   ```

4. **Verify B3/S23 rules** if needed:
   ```javascript
   const rules = await mcp__archon__rag_search_knowledge_base({
     query: "b3/s23 birth survival",
     source_id: "141a7d7e14c8b58b",
     match_count: 2
   })
   ```

**Example: Implementing Pulsar Pattern**
```javascript
// Research results:
// - Pulsar is a period-3 oscillator
// - 13×13 bounding box
// - Symmetrical pattern

// Implementation:
const PULSAR = [
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  // ... pattern continues
]

function seedPulsar(gol, centerX, centerY) {
  const startX = centerX - 6
  const startY = centerY - 6
  for (let y = 0; y < 13; y++) {
    for (let x = 0; x < 13; x++) {
      if (PULSAR[y][x] === 1) {
        gol.setCell(startX + x, startY + y, ALIVE)
      }
    }
  }
}
```

---

### Workflow 4: Testing Framework Research

**Scenario:** Writing tests for a new component.

**Steps:**

1. **Search Vitest documentation:**
   ```javascript
   const vitestDocs = await mcp__archon__rag_search_knowledge_base({
     query: "vitest mock vi.fn",
     source_id: "da752d5fc3c907ba",  // Vitest docs
     match_count: 5
   })
   ```

2. **Search code examples** for similar tests:
   ```javascript
   const testExamples = await mcp__archon__rag_search_code_examples({
     query: "vitest test mock",
     match_count: 5
   })
   ```

3. **Read full testing guide:**
   ```javascript
   const guide = await mcp__archon__rag_read_full_page({
     page_id: vitestDocs[0].page_id
   })
   ```

**Example: Testing GoLEngine**
```javascript
// Research:
// - Vitest uses describe/test/expect
// - vi.fn() for mocks
// - beforeEach for setup

// Implementation:
import { describe, test, expect, beforeEach } from 'vitest'
import { GoLEngine } from '../../src/core/GoLEngine.js'

describe('GoLEngine', () => {
  let engine

  beforeEach(() => {
    engine = new GoLEngine(10, 10, 12)
  })

  test('applies B3/S23 rules correctly', () => {
    engine.setPattern([[0,1,0], [0,1,0], [0,1,0]], 4, 4)
    engine.update()
    const result = engine.getPattern(4, 4, 3, 3)
    expect(result).toEqual([[0,0,0], [1,1,1], [0,0,0]])
  })

  test('uses double buffer pattern', () => {
    const beforePtr = engine.current
    engine.update()
    expect(engine.current).not.toBe(beforePtr)
  })
})
```

---

## Task Management Workflows

### Workflow 5: Feature Implementation Flow

**Scenario:** Implementing a new feature from planning to completion.

**Task States:** `todo` → `doing` → `review` → `done`

**Steps:**

1. **Find project tasks:**
   ```javascript
   const tasks = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     filter_by: "status",
     filter_value: "todo"
   })
   ```

2. **Select task and mark as doing:**
   ```javascript
   await mcp__archon__manage_task({
     action: "update",
     task_id: "task-uuid-here",
     status: "doing",
     assignee: "Coding Agent"
   })
   ```

3. **Research phase** (use Research Workflows above)

4. **Implementation** with local TodoWrite tracking:
   ```javascript
   // Use TodoWrite tool for granular progress tracking
   TodoWrite({
     todos: [
       { content: "Create GoLEngine class", status: "in_progress", activeForm: "Creating GoLEngine class" },
       { content: "Write unit tests", status: "pending", activeForm: "Writing unit tests" },
       { content: "Update documentation", status: "pending", activeForm: "Updating documentation" }
     ]
   })
   ```

5. **Mark Archon task for review:**
   ```javascript
   await mcp__archon__manage_task({
     action: "update",
     task_id: "task-uuid-here",
     status: "review"
   })
   ```

6. **After review, mark done:**
   ```javascript
   await mcp__archon__manage_task({
     action: "update",
     task_id: "task-uuid-here",
     status: "done"
   })
   ```

**Example: Implementing Debug Interface Preset System**
```javascript
// 1. Query tasks
const tasks = await mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  query: "preset"
})

// 2. Mark task as doing
await mcp__archon__manage_task({
  action: "update",
  task_id: tasks[0].id,
  status: "doing"
})

// 3. Research
await mcp__archon__rag_search_knowledge_base({
  query: "json validation schema",
  match_count: 5
})

// 4. Implement with TodoWrite tracking (granular progress)
TodoWrite({
  todos: [
    { content: "Create preset JSON files", status: "completed", activeForm: "Creating preset JSON files" },
    { content: "Implement validatePresetFormat()", status: "in_progress", activeForm: "Implementing validatePresetFormat()" },
    { content: "Add UI dropdown", status: "pending", activeForm: "Adding UI dropdown" },
    { content: "Write tests", status: "pending", activeForm: "Writing tests" }
  ]
})

// 5. Mark for review when implementation complete
await mcp__archon__manage_task({
  action: "update",
  task_id: tasks[0].id,
  status: "review"
})
```

---

### Workflow 6: Bug Fix Flow

**Scenario:** Fixing a bug discovered during testing.

**Steps:**

1. **Search for related tasks:**
   ```javascript
   const bugs = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     query: "collision bug",
     filter_by: "status",
     filter_value: "todo"
   })
   ```

2. **If no task exists, create one:**
   ```javascript
   await mcp__archon__manage_task({
     action: "create",
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     title: "Fix collision detection for small enemies",
     description: "Enemies with radius < 15px have incorrect hitbox calculations",
     status: "doing",
     assignee: "Coding Agent"
   })
   ```

3. **Research the issue:**
   ```javascript
   // Search codebase using local tools
   // Search knowledge base for collision algorithms
   const results = await mcp__archon__rag_search_knowledge_base({
     query: "circle collision detection",
     match_count: 3
   })
   ```

4. **Fix and test**

5. **Mark task as done:**
   ```javascript
   await mcp__archon__manage_task({
     action: "update",
     task_id: "bug-task-id",
     status: "done"
   })
   ```

**Example: Fixing Collision Bug**
```javascript
// 1. Create bug task
await mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Fix hitbox sync issue",
  description: "Entity hitbox not syncing after GoL resize",
  status: "doing"
})

// 2. Research collision detection
await mcp__archon__rag_search_code_examples({
  query: "collision rectangle",
  match_count: 5
})

// 3. Implement fix
class Enemy {
  update() {
    this.gol.updateThrottled(frameCount)
    this.x += this.vx
    this.syncHitbox()  // ← FIX: Always sync after position update
  }

  syncHitbox() {
    this.hitbox.x = this.x
    this.hitbox.y = this.y
    // Hitbox size is FIXED (doesn't change with GoL)
  }
}

// 4. Mark done
await mcp__archon__manage_task({
  action: "update",
  task_id: "bug-task-id",
  status: "done"
})
```

---

### Workflow 7: Multi-Step Feature (Task Breakdown)

**Scenario:** Large feature requiring multiple implementation tasks.

**Archon Task Granularity:**
- For feature-specific projects: Create detailed implementation tasks
- For codebase-wide projects: Create feature-level tasks

**Steps:**

1. **Create parent feature task:**
   ```javascript
   await mcp__archon__manage_task({
     action: "create",
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     title: "Implement Preset Management System",
     description: "Add preset import/export functionality to Debug Interface",
     status: "todo",
     feature: "Debug Interface"
   })
   ```

2. **Create subtasks:**
   ```javascript
   const subtasks = [
     "Create preset JSON files (default, easy, hard, chaos)",
     "Implement validatePresetFormat() function",
     "Add preset dropdown to DebugInterface",
     "Implement import/export buttons",
     "Write unit tests for validation",
     "Write integration tests for UI"
   ]

   for (const title of subtasks) {
     await mcp__archon__manage_task({
       action: "create",
       project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
       title: title,
       status: "todo",
       feature: "Debug Interface",
       assignee: "User"
     })
   }
   ```

3. **Work through tasks sequentially:**
   ```javascript
   // Query next task
   const nextTask = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     filter_by: "status",
     filter_value: "todo",
     per_page: 1
   })

   // Mark as doing
   await mcp__archon__manage_task({
     action: "update",
     task_id: nextTask[0].id,
     status: "doing"
   })

   // ... implement ...

   // Mark done and get next
   await mcp__archon__manage_task({
     action: "update",
     task_id: nextTask[0].id,
     status: "done"
   })
   ```

**Example: Debug Interface Phase 3.1**
```javascript
// 1. Create parent task
await mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Phase 3.1: Preset Management UI",
  description: "Complete preset system with import/export",
  status: "doing",
  feature: "Debug Interface"
})

// 2. Create granular subtasks (6 tasks)
const tasks = [
  { title: "Create 4 preset JSON files", order: 10 },
  { title: "Implement DebugPresets.js validation", order: 20 },
  { title: "Add preset dropdown UI", order: 30 },
  { title: "Add import/export buttons", order: 40 },
  { title: "Write unit tests", order: 50 },
  { title: "Manual browser testing", order: 60 }
]

for (const task of tasks) {
  await mcp__archon__manage_task({
    action: "create",
    project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
    title: task.title,
    task_order: task.order,
    status: "todo",
    feature: "Debug Interface"
  })
}

// 3. Work through each task (todo → doing → done)
```

---

## Project Management

### Workflow 8: Creating a New Project

**Scenario:** Starting work on a new game or major feature.

**Steps:**

1. **Create project:**
   ```javascript
   const project = await mcp__archon__manage_project({
     action: "create",
     title: "Flappy Bird Game",
     description: "Implement Flappy Bird with GoL bird sprite and pipe obstacles",
     github_repo: "https://github.com/user/lifearcade"
   })
   ```

2. **Create initial tasks:**
   ```javascript
   const initialTasks = [
     "Research flappy bird mechanics",
     "Design game configuration (gravity, jump force)",
     "Implement bird GoL sprite with lifeForce",
     "Implement pipe obstacles",
     "Add collision detection",
     "Write tests"
   ]

   for (const title of initialTasks) {
     await mcp__archon__manage_task({
       action: "create",
       project_id: project.id,
       title: title,
       status: "todo"
     })
   }
   ```

3. **Create design document:**
   ```javascript
   await mcp__archon__manage_document({
     action: "create",
     project_id: project.id,
     title: "Flappy Bird Design Spec",
     document_type: "spec",
     content: {
       mechanics: {
         gravity: 2.4,
         jumpForce: -54,
         pipeSpeed: -27
       },
       // ... more specs
     }
   })
   ```

---

### Workflow 9: Reviewing Project Status

**Scenario:** Check overall progress on LifeArcade project.

**Steps:**

1. **Get project overview:**
   ```javascript
   const project = await mcp__archon__find_projects({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305"
   })
   ```

2. **Query task statistics:**
   ```javascript
   const todoTasks = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     filter_by: "status",
     filter_value: "todo"
   })

   const doingTasks = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     filter_by: "status",
     filter_value: "doing"
   })

   const doneTasks = await mcp__archon__find_tasks({
     project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
     filter_by: "status",
     filter_value: "done",
     include_closed: true
   })
   ```

3. **Generate status report:**
   ```javascript
   console.log(`LifeArcade Project Status:`)
   console.log(`- TODO: ${todoTasks.length} tasks`)
   console.log(`- DOING: ${doingTasks.length} tasks`)
   console.log(`- DONE: ${doneTasks.length} tasks`)
   console.log(`- Total: ${todoTasks.length + doingTasks.length + doneTasks.length}`)
   ```

---

## Common Workflow Templates

### Template 1: New Game Implementation

```javascript
// 1. Research phase
await mcp__archon__rag_search_knowledge_base({
  query: "game mechanics physics",
  match_count: 5
})

await mcp__archon__rag_search_code_examples({
  query: "platform game collision",
  match_count: 3
})

// 2. Task setup
await mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Implement [Game Name]",
  description: "[Game description and mechanics]",
  status: "doing"
})

// 3. Implementation with TodoWrite tracking
TodoWrite({
  todos: [
    { content: "Create CONFIG object", status: "in_progress", activeForm: "Creating CONFIG object" },
    { content: "Implement game entities", status: "pending", activeForm: "Implementing game entities" },
    { content: "Add collision detection", status: "pending", activeForm: "Adding collision detection" },
    { content: "Create render functions", status: "pending", activeForm: "Creating render functions" },
    { content: "Write tests", status: "pending", activeForm: "Writing tests" }
  ]
})

// 4. Mark Archon task done
await mcp__archon__manage_task({
  action: "update",
  task_id: "task-id",
  status: "done"
})
```

---

### Template 2: Bug Investigation

```javascript
// 1. Search for similar issues
const relatedTasks = await mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  query: "[bug keyword]"
})

// 2. Create bug task if needed
await mcp__archon__manage_task({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  title: "Fix [bug description]",
  description: "Steps to reproduce: ...\nExpected: ...\nActual: ...",
  status: "doing"
})

// 3. Research potential causes
await mcp__archon__rag_search_knowledge_base({
  query: "[related concept]",
  match_count: 5
})

// 4. Fix, test, mark done
await mcp__archon__manage_task({
  action: "update",
  task_id: "bug-task-id",
  status: "done"
})
```

---

### Template 3: Documentation Update

```javascript
// 1. Search existing docs
const docs = await mcp__archon__find_documents({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  query: "[topic]"
})

// 2. Create or update document
await mcp__archon__manage_document({
  action: docs.length > 0 ? "update" : "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  document_id: docs[0]?.id,
  title: "[Document Title]",
  document_type: "guide",
  content: {
    // ... structured content
  }
})

// 3. Create version snapshot
await mcp__archon__manage_version({
  action: "create",
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  field_name: "docs",
  content: [/* updated docs */],
  change_summary: "Updated [topic] documentation"
})
```

---

## Best Practices

### Research Best Practices

1. **Keep queries short and focused:**
   ```javascript
   // ✅ GOOD
   query: "vite dev server"
   query: "collision detection circle"
   query: "game of life patterns"

   // ❌ BAD
   query: "how to configure vite development server with hot module replacement"
   query: "collision detection for circular objects in game development"
   ```

2. **Use source_id filtering for targeted searches:**
   ```javascript
   // ✅ GOOD - Filter to specific documentation
   mcp__archon__rag_search_knowledge_base({
     query: "perlin noise",
     source_id: "4d2cf40b9f01cfcd",  // P5.js docs only
     match_count: 5
   })

   // ❌ LESS EFFICIENT - Search all sources
   mcp__archon__rag_search_knowledge_base({
     query: "perlin noise",
     match_count: 5
   })
   ```

3. **Search multiple sources for complex topics:**
   ```javascript
   // Research both theory and implementation
   const theory = await mcp__archon__rag_search_knowledge_base({
     query: "cellular automata",
     source_id: "42a1fc677ff1afe4",  // Nature of Code
     match_count: 3
   })

   const api = await mcp__archon__rag_search_knowledge_base({
     query: "2d array grid",
     source_id: "4d2cf40b9f01cfcd",  // P5.js
     match_count: 3
   })

   const examples = await mcp__archon__rag_search_code_examples({
     query: "cellular automata",
     match_count: 5
   })
   ```

4. **Read full pages for implementation guides:**
   ```javascript
   // Get overview first
   const results = await mcp__archon__rag_search_knowledge_base({
     query: "vitest testing setup",
     match_count: 5
   })

   // Read complete guide for details
   const guide = await mcp__archon__rag_read_full_page({
     page_id: results[0].page_id
   })
   ```

---

### Task Management Best Practices

1. **Use appropriate task granularity:**
   ```javascript
   // ✅ GOOD - Feature-specific project with detailed tasks
   // Project: "Debug Interface"
   // Tasks:
   //   - "Create preset JSON files"
   //   - "Implement validatePresetFormat()"
   //   - "Add preset dropdown UI"
   //   - "Write unit tests"

   // ✅ GOOD - Codebase-wide project with feature-level tasks
   // Project: "LifeArcade"
   // Tasks:
   //   - "Implement Debug Interface"
   //   - "Create Space Invaders game"
   //   - "Add leaderboard system"

   // ❌ BAD - Too granular for codebase-wide project
   // Project: "LifeArcade"
   // Tasks:
   //   - "Write function validatePresetFormat()"
   //   - "Add button element to HTML"
   ```

2. **Only ONE task in 'doing' status at a time:**
   ```javascript
   // ✅ GOOD
   // Task 1: status = "doing"
   // Task 2: status = "todo"
   // Task 3: status = "todo"

   // ❌ BAD
   // Task 1: status = "doing"
   // Task 2: status = "doing"  // Multiple tasks in progress
   ```

3. **Use 'review' status for completed work awaiting validation:**
   ```javascript
   // After implementation
   await mcp__archon__manage_task({
     action: "update",
     task_id: "task-id",
     status: "review"  // ← Awaiting code review or testing
   })

   // After successful review
   await mcp__archon__manage_task({
     action: "update",
     task_id: "task-id",
     status: "done"
   })
   ```

4. **Use descriptive task titles and detailed descriptions:**
   ```javascript
   // ✅ GOOD
   await mcp__archon__manage_task({
     action: "create",
     project_id: "...",
     title: "Fix collision detection for enemy radius < 15px",
     description: "Small enemies have incorrect hitbox calculations.\n\n" +
                  "Steps to reproduce:\n" +
                  "1. Create enemy with radius 10\n" +
                  "2. Move player to overlap\n" +
                  "3. No collision detected\n\n" +
                  "Expected: Collision should trigger\n" +
                  "Actual: Player passes through enemy"
   })

   // ❌ BAD
   await mcp__archon__manage_task({
     action: "create",
     project_id: "...",
     title: "Fix bug",
     description: "Collision not working"
   })
   ```

5. **Use feature labels for grouping related tasks:**
   ```javascript
   await mcp__archon__manage_task({
     action: "create",
     project_id: "...",
     title: "Add preset validation",
     feature: "Debug Interface",  // ← Group with other Debug Interface tasks
     status: "todo"
   })
   ```

---

### Combined TodoWrite + Archon Workflow

**Use Case:** Track granular implementation steps locally while maintaining high-level Archon task.

**Pattern:**
```javascript
// 1. Archon task (high-level feature)
await mcp__archon__manage_task({
  action: "update",
  task_id: "archon-task-id",
  status: "doing"
})

// 2. TodoWrite for granular tracking (implementation steps)
TodoWrite({
  todos: [
    { content: "Research Vite configuration", status: "completed", activeForm: "Researching Vite configuration" },
    { content: "Create config file", status: "completed", activeForm: "Creating config file" },
    { content: "Test dev server", status: "in_progress", activeForm: "Testing dev server" },
    { content: "Write documentation", status: "pending", activeForm: "Writing documentation" }
  ]
})

// 3. Mark Archon task for review when all todos complete
// (TodoWrite todos are ephemeral, Archon task persists)
await mcp__archon__manage_task({
  action: "update",
  task_id: "archon-task-id",
  status: "review"
})
```

**When to use each:**
- **Archon tasks**: Feature-level tracking, team visibility, project planning
- **TodoWrite**: Step-by-step progress, implementation details, current session work

---

## Troubleshooting

### Issue: Search returns no results

**Cause:** Query too specific or incorrect source_id

**Solution:**
```javascript
// 1. Try broader query
mcp__archon__rag_search_knowledge_base({
  query: "noise",  // Instead of "perlin noise 2d animated gradient"
  match_count: 10
})

// 2. Search without source_id filter
mcp__archon__rag_search_knowledge_base({
  query: "noise",
  match_count: 10  // No source_id
})

// 3. List available sources to verify ID
const sources = await mcp__archon__rag_get_available_sources()
console.log(sources)
```

---

### Issue: Task not showing in queries

**Cause:** Incorrect filter or task was deleted

**Solution:**
```javascript
// 1. Search by task ID directly
const task = await mcp__archon__find_tasks({
  task_id: "specific-task-id"
})

// 2. Search by keyword
const tasks = await mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  query: "preset"
})

// 3. Include closed tasks
const allTasks = await mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  include_closed: true
})
```

---

### Issue: Too many tasks in 'doing' status

**Cause:** Not marking tasks as done after completion

**Solution:**
```javascript
// 1. Query all doing tasks
const doingTasks = await mcp__archon__find_tasks({
  project_id: "9ebdf1e2-ed0a-422f-8941-98191481f305",
  filter_by: "status",
  filter_value: "doing"
})

// 2. Review each and mark done if complete
for (const task of doingTasks) {
  console.log(`Task: ${task.title}`)
  console.log(`Status: ${task.status}`)

  // If actually complete:
  await mcp__archon__manage_task({
    action: "update",
    task_id: task.id,
    status: "done"
  })
}
```

---

### Issue: Can't find documentation page

**Cause:** Page ID changed or URL-based search needed

**Solution:**
```javascript
// 1. List all pages in source
const pages = await mcp__archon__rag_list_pages_for_source({
  source_id: "4d2cf40b9f01cfcd"  // P5.js
})

// 2. Search by URL instead of page_id
const page = await mcp__archon__rag_read_full_page({
  url: "https://p5js.org/reference/p5/noise/"
})

// 3. Search for page first
const results = await mcp__archon__rag_search_knowledge_base({
  query: "noise function",
  source_id: "4d2cf40b9f01cfcd",
  match_count: 1
})

const fullPage = await mcp__archon__rag_read_full_page({
  page_id: results[0].page_id
})
```

---

## Quick Reference

### Knowledge Base Sources

| Source ID | Title | Use For |
|-----------|-------|---------|
| `141a7d7e14c8b58b` | Conwaylife Wiki | GoL patterns, B3/S23 rules |
| `22832de63c03f570` | Vite Documentation | Dev server, build config |
| `da752d5fc3c907ba` | Vitest Documentation | Testing, mocks, matchers |
| `4d2cf40b9f01cfcd` | P5.js Reference | p5.js API, functions |
| `42a1fc677ff1afe4` | Nature of Code | CA theory, algorithms |

### Task Status Flow

```
todo → doing → review → done
  ↑       ↓
  └───────┘ (can move back if issues found)
```

### Common Queries

```javascript
// Research
mcp__archon__rag_search_knowledge_base({ query: "...", match_count: 5 })
mcp__archon__rag_search_code_examples({ query: "...", match_count: 3 })
mcp__archon__rag_read_full_page({ page_id: "..." })

// Tasks
mcp__archon__find_tasks({ project_id: "...", query: "..." })
mcp__archon__manage_task({ action: "create", project_id: "...", title: "..." })
mcp__archon__manage_task({ action: "update", task_id: "...", status: "doing" })

// Projects
mcp__archon__find_projects({ project_id: "..." })
mcp__archon__manage_project({ action: "create", title: "..." })
```

---

## References

- **Archon MCP Server**: Model Context Protocol implementation
- **Project ID**: `9ebdf1e2-ed0a-422f-8941-98191481f305`
- **Related Docs**:
  - `CLAUDE.md` - Core development principles
  - `docs/PROJECT_OVERVIEW.md` - Architecture overview
  - `docs/DEBUG_INTERFACE_FEATURE.md` - Feature implementation example

---

**Document Status:** ✅ Complete
**Version:** 1.0
**Last Updated:** 2025-11-18
