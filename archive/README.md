# Archive - Historical Documents

This directory contains archived files that are **not needed for the arcade application** but are kept for historical reference.

## Contents

### `docs/` - Obsolete Architecture Documents

These documents were created during the planning and decision-making phase. The architecture has been decided and implemented, so these are kept only for historical reference:

- `engine-vs-simple-analysis.md` - Comparison of architecture approaches (decision already made)
- `framework-architecture-proposal.md` - Rejected proposal for full framework
- `lightweight-template-proposal.md` - Rejected proposal for lightweight framework
- `minimal-framework-proposal.md` - Rejected proposal for minimal framework
- `revised-strategy.md` - Intermediate decision document
- `PHASE1_COMPLETE.md` - Phase 1 completion report (reference)

**Decision:** The project uses a **template-based approach** with `game-template.js` for LLM-generated games.

### `prompts/` - Development Prompts

These are prompts and transcripts used during development. They were useful for building the foundation but are not needed for the arcade application:

- `transcript-2025-11-10-2017-gol-arcade-planning.md` - Planning session transcript
- `coding-prompt-dino-game-OPTIMIZED.md` - Development prompt for Dino game
- `coding-prompt-dino-game-phase2.md` - Development prompt for Phase 2
- `coding-prompt-lightweight-framework.md` - Development prompt for framework

**Note:** Future prompts for LLM game generation will be created in a new location specific to the arcade pipeline.

## Why Archived?

These files were moved to `archive/` on **November 12, 2025** during project cleanup to focus on the **arcade application**. The project shifted from a general framework to a specific use case:

1. **Arcade Installation** - Physical kiosk with pre-generated games
2. **Web Application** - Online game generation platform

Both applications require:
- Core GoL engine ✅
- Game template ✅
- Pattern library ✅
- LLM generation pipeline (to be built)

These archived documents were part of the exploration phase and are no longer relevant to the current direction.

## Restoration

If you need to restore any of these files:

```bash
# Restore a specific file
cp archive/docs/PHASE1_COMPLETE.md docs/

# Restore all docs
cp -r archive/docs/* docs/

# Restore all prompts
cp -r archive/prompts/* prompts/
```

---

**Last Updated:** November 12, 2025
**Reason:** Project cleanup for arcade application focus
