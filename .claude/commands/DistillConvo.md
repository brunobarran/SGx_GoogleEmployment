# DistillConvo - Conversation Transcript Cleaning

## What This Command Does

When a conversation grows long and contains debugging cycles, failed attempts, or tangents, this command helps you and Claude work together to create a cleaned version that a new Claude can use to continue the work efficiently.

Think of it like editing a rough draft - you keep what matters, delete what doesn't, and end up with something focused and productive.

## The Simple Process

### 1. User invokes: `/DistillConvo`

### 2. Claude analyzes the conversation and proposes what to keep/remove:

```markdown
I'll help create a cleaned transcript of our conversation.

**Current conversation:** ~45k tokens about [main topic]

**I propose to KEEP:**
✓ Initial request and file references
✓ All documentation/files that were read or referenced
✓ Working solution for [problem]
✓ Key decisions about [topic]
✓ Current implementation state

**I propose to REMOVE:**
✗ Failed debugging attempts (multiple sections)
✗ Tangent about [unrelated topic]
✗ Repetitive error messages
✗ Back-and-forth clarifications that led nowhere

This would reduce the conversation to ~8k tokens while preserving all productive work.

Should I proceed with creating the cleaned transcript?
```

### 3. User reviews and approves (or suggests changes)

### 4. Claude creates a timestamped markdown file:

**First, Claude gets the current timestamp:**
```bash
current_timestamp=$(date "+%Y-%m-%d-%H%M")
topic_slug="your-descriptive-topic-name"  # User should specify or Claude infers
filename="transcript-${current_timestamp}-${topic_slug}.md"
```

**Then creates the markdown file:**
```markdown
# [Topic Title] - Distilled Conversation

**Created:** $(date "+%m/%d/%y %I:%M%p ET")  
**Purpose:** [Brief description of what this conversation accomplished]

## Context for Claude

This is a cleaned transcript of a previous conversation with Claude about [project/task]. Debugging cycles, failed attempts, and tangential discussions were removed to manage context limits, so the conversation may seem disjointed in places where sections were deleted. Despite the gaps, all essential context has been preserved so you can understand what was accomplished and continue from where the conversation ends.

## Referenced Documentation

**Files that were read/referenced in the original conversation:**
- `/path/to/document1.md` - [Brief description of what this provided]
- `/path/to/document2.md` - [Brief description of what this provided]
- `project/CLAUDE.md` - [Project context and conventions]

**Key context from documentation:**
- [Important background knowledge that informed decisions]
- [Technical constraints or requirements from docs]
- [Established patterns or conventions that were followed]

---

[The edited conversation starts here, with unproductive portions removed]

I need help implementing the Claude SDK for our KRK project...

I'll help you implement the Claude SDK. Let me first check your current project structure...

[after several debugging attempts were removed]

That's working now, what's next?

The implementation is complete. Next steps would be testing the integration with your existing pipeline...

---

## Handoff Note

The conversation above had ~37k tokens of debugging and exploration removed. You're picking up at a point where [current state summary]. 

**Key context for continuity:**
- Established working patterns: [e.g., "user prefers step-by-step confirmation for database changes"]
- Technical decisions made: [e.g., "we chose Supabase over local Docker for this project"]
- Current tools/approaches in use: [e.g., "using SA scripts for targeted processing"]
- User's communication style: [e.g., "direct, task-focused, values efficiency"]

Please respond to the user's next message as if you had been part of this entire conversation, maintaining the same technical approach and communication patterns established above.
```

### 5. User saves the file and can paste it into a new Claude session

## Key Principles

### Be Intelligent About Context
- If git commands were crucial to solving a problem, keep them
- If they were just routine status checks, remove them
- Consider project-specific patterns (e.g., for KRK, keep state pipeline decisions but remove routine status checks)
- Always preserve file paths and references - these are crucial for continuation
- Use your understanding of what matters for this specific conversation

### Preserve Continuity Where Possible
- Keep questions if their answers matter
- Add brief notes like "[after testing several approaches]" if huge gaps would be confusing
- Ensure the conversation still makes logical sense despite deletions

### Keep It Simple
- Don't rewrite or create fiction
- Just copy the conversation as-is and delete unproductive parts - no need to label who said what
- Preserve the natural conversation flow without adding "User:" or "Claude:" annotations
- Let Claude B's intelligence handle any disjointedness

## What Makes This Work

- **Claude is smart** - Both Claude A and Claude B can handle edited transcripts
- **No deception** - We're transparent about what this is
- **User collaboration** - The user knows what's important to their goals

## Success Metrics

✓ Claude B reads the transcript and continues working without confusion  
✓ All working solutions and key decisions are preserved  
✓ No time wasted on elaborate formatting  

## Example Result

When Claude B receives the cleaned transcript, it will understand:
- This is a continuation of previous work
- Why there are gaps (deliberate editing)
- What was accomplished
- Where to continue from

And it will respond naturally: "I can see you've been working on the subprocess implementation. Based on the discovery that CLI requires per-message spawning, let me continue with..."

## The Bottom Line

This command is about practical token management through intelligent editing. No tricks, no complex templates - just smart deletion of what doesn't matter, clear communication about what happened, and trust in Claude's ability to understand and continue.