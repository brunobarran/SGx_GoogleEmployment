# Archive - Documentation (Old)

**Date:** 2025-11-14
**Reason:** Superseded by unified PROJECT_OVERVIEW.md

---

## 📋 PURPOSE

This archive contains obsolete documentation files that were:
1. **Superseded** by `docs/PROJECT_OVERVIEW.md` (unified documentation)
2. **Fragmented** across 8 different files (~4,000 lines total)
3. **Outdated** with planning/evaluation from November 12, 2025

All content from these files has been **consolidated, updated, and simplified** in the new single documentation file.

---

## 🗂️ ARCHIVED FILES

### 1. Framework Documentation

**framework-pattern.md** (754 lines)
- Complete pattern guide for creating games
- LLM-optimized examples and anti-patterns
- Common pitfalls and solutions
- **Superseded by:** PROJECT_OVERVIEW.md § "Game Framework Pattern"

### 2. Architecture Documentation

**lightweight-gradient-architecture.md** (412 lines)
- Technical details of gradient rendering system
- Performance optimization explanation
- Native Canvas API vs p5.js comparison
- **Superseded by:** PROJECT_OVERVIEW.md § "Visual Design"

### 3. Planning Documents

**STRATEGIC_VISION_CLARIFIED.md** (679 lines)
- November 12 strategic planning
- Dual purpose vision (Gallery + LLM Generator)
- 4-week implementation roadmap
- **Status:** Vision achieved, installation complete (100%)

**PROJECT_EVALUATION_AND_NEXT_STEPS.md** (695 lines)
- November 12 project evaluation
- 70% complete assessment (outdated)
- Identified gaps and next steps
- **Status:** Gaps resolved, project now 100% complete

### 4. Proposals & Analysis

**HTML_GENERATION_PROPOSAL.md** (382 lines)
- Proposal for automatic HTML generation
- Server-side vs client-side options
- Template system design
- **Status:** Implemented via game-wrapper.html

**LLM_TEST_SNAKE_ANALYSIS.md** (431 lines)
- November 11 LLM generation test (Snake game)
- 95% success rate documented
- Issues and improvements identified
- **Status:** Historical reference (tests successful)

**LLM_TEST_PONG_ANALYSIS.md** (432 lines)
- November 11 LLM generation test (Pong game)
- 90% success rate documented
- Edge cases documented
- **Status:** Historical reference (tests successful)

**PROMPT_UPDATE_SUMMARY.md** (297 lines)
- Summary of prompt updates needed
- Resolution change (800×600 → 1200×1920)
- Template updates required
- **Status:** Updates completed

---

## ✅ CURRENT STATE (Post-Consolidation)

### What Replaced These Files

**Single unified file:** `docs/PROJECT_OVERVIEW.md`

**Sections in new file:**
- 🎯 Project Vision
- 📊 Current State (November 2025)
- 🏗️ Architecture (Actual Implementation)
- 🎮 Game Framework Pattern
- 🎨 Visual Design
- 🧬 Conway's Game of Life
- 📦 Helper Functions Reference
- 🧪 Testing
- 🚀 Deployment
- 🎓 Key Decisions & Rationale
- 📋 Creating New Games
- 🔮 Future Development
- 📞 Quick Reference

**Benefits of consolidation:**
- ✅ Single source of truth
- ✅ Reduced from ~4,000 to ~700 lines
- ✅ Updated with current state (100% complete)
- ✅ Easier to maintain
- ✅ Better for LLM consumption

---

## 🔄 WHAT CHANGED SINCE THESE DOCS

### Installation System (NEW)

**Status then (Nov 12):** 0% complete, planning phase
**Status now (Nov 14):** 100% complete, 8 screens implemented

**Implemented:**
- 8-screen flow (IdleScreen → QRCodeScreen loop)
- 4 managers (AppState, StorageManager, InputManager, IframeComm)
- postMessage game ↔ parent communication
- localStorage leaderboard persistence
- Keyboard navigation + arcade controls

### Resolution & Sizing (UPDATED)

**Planned:** 800×600 landscape
**Actual:** 1200×1920 portrait (vertical display)

**Entity sizes updated:**
- Old: 60×60 @ cellSize 10 → New: 180×180 @ cellSize 30
- Scale factor: 3.0x

### Architecture (SIMPLIFIED)

**Planned:** Complex class hierarchy (CellularSprite, BaseGame, etc.)
**Actual:** Plain objects + helper functions (LLM-friendly)

**Reason:** Simpler for LLM generation, fewer abstractions

### Test Coverage (IMPROVED)

**Status then:** 6/7 tests failing (path issues)
**Status now:** 161/167 tests passing (96.4% coverage)

---

## 📚 STILL USEFUL REFERENCES

While archived, some sections contain valuable historical context:

**LLM Test Results:**
- Snake: 95% generation success
- Pong: 90% generation success
- Validation that framework is LLM-friendly

**Strategic Planning:**
- Decision rationale for dual purpose (Gallery + Generator)
- Timeline and sprint planning (accurately executed)
- Original vision vs final implementation comparison

**Technical Deep Dives:**
- Gradient rendering architecture details
- Performance optimization techniques
- Canvas API vs p5.js comparison

**If you need context** on why certain decisions were made, these docs provide historical background.

---

## ⚠️ IMPORTANT NOTES

### Don't Restore These Files

These archived docs should **NOT** be restored to `docs/`. They represent:
- Fragmented documentation (8 files vs 1)
- Outdated project state (planning vs completed)
- Historical snapshots (November 12 vs November 14)

### Current Documentation is Correct

The **active documentation** (`docs/PROJECT_OVERVIEW.md`) represents the **correct, current state** of the project.

### Reference Only

Use archived files as **reference** for:
- Understanding project evolution
- Historical context for decisions
- LLM generation test results
- Original planning vs execution comparison

---

## 📞 QUESTIONS?

If you need to understand:
- **Current project state** → Read `docs/PROJECT_OVERVIEW.md`
- **How to create games** → Read `src/game-template.js`
- **Development rules** → Read `CLAUDE.md`
- **Installation system** → Read `src/installation/` and `src/screens/`
- **Why something was archived** → Read this file

---

**Last Updated:** 2025-11-14
**Archive Reason:** Documentation consolidation
**Replaced By:** `docs/PROJECT_OVERVIEW.md` (unified, updated)
**Files Archived:** 8 documents (~4,000 lines → 700 lines unified)
