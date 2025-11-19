# UI Iterate - Implement Figma Design for Screen

You are helping implement a screen UI design from Figma for the LifeArcade installation project.

## Context Provided by User:
- **Screen File:** Path to the screen file to iterate on (e.g., @LifeArcade\src\screens\WelcomeScreen.js)
- **Figma Code:** HTML/CSS code exported from Figma (pasted as text)
- **Target Screenshot:** Visual reference of the desired design (attached as image)

## Your Task:

### 1. Read Current Implementation
Read the screen file provided by the user to understand:
- Current structure and public API
- Responsive implementation patterns
- Event handlers and lifecycle methods
- Styling approach

### 2. Create Versioned File
Extract the screen name from the path (e.g., `WelcomeScreen.js` → `WelcomeScreen`)
Create `src/screens/{ScreenName}.v2.js` based on the original file

### 3. Analyze Figma Code
- Extract layout structure (positioning, sizing)
- Identify typography (fonts, sizes, weights)
- Note color palette (Google Brand Colors from CLAUDE.md)
- Map gradient patterns to GoL background decorations
- Understand spacing and alignment

### 4. Implement Design Requirements

**MUST MAINTAIN:**
- ✅ Responsive behavior (aspectRatio 0.625, dynamic dimensions)
- ✅ `clamp()` for all font sizes with vh units
- ✅ `max-width: 100vw` and `max-height: 100vh` constraints
- ✅ Same public interface: `constructor()`, `show()`, `hide()`
- ✅ Same event handlers (handleKeyPress, etc.)
- ✅ GoL background integration (use existing GoLBackground or SimpleGradientRenderer)
- ✅ Google Brand Colors (see CLAUDE.md section 2):
  ```javascript
  BLUE: #4285F4    // Google Blue
  RED: #EA4335     // Google Red
  GREEN: #34A853   // Google Green
  YELLOW: #FBBC04  // Google Yellow
  WHITE: #FFFFFF   // White
  ```

**ADAPT FROM FIGMA:**
- 📐 Layout structure and element positioning
- 🎨 Visual styling (colors, shadows, borders)
- 📝 Typography hierarchy
- ✨ Visual effects (gradients map to GoL patterns or SimpleGradientRenderer)

**IMPORTANT CONVERSIONS:**
```javascript
// Figma uses fixed px at 1200×1920 → Convert to responsive
// Example from Figma code:
font-size: 133.76px  →  font-size: clamp(48px, 7vh, 96px)
width: 732px         →  width: clamp(300px, 60vw, 732px)
height: 467px        →  height: clamp(200px, 24vh, 467px)

// Figma absolute positioning → Convert to centered/flexible
position: absolute; left: 233px; top: 627px
→ Use flexbox/grid with responsive spacing

// Figma gradients on <div> → Map to GoL patterns or SimpleGradientRenderer
background: linear-gradient(180deg, rgba(66, 142, 244, 0) 0%, #428EF4 20%...)
→ Check if it can be a GoL still life pattern or use SimpleGradientRenderer

// Figma container sizes → Calculate responsive percentages
width: 732px out of 1200px = 61%  →  width: clamp(300px, 61vw, 732px)
height: 467px out of 1920px = 24.3%  →  height: clamp(200px, 24vh, 467px)
```

### 5. Implementation Steps

**Step 1: Read the provided screen file**
```javascript
// User provides: @LifeArcade\src\screens\WelcomeScreen.js
// You read it to understand current implementation
```

**Step 2: Create v2 file with Figma design**
- Copy structure from original
- Replace styling with Figma design
- Convert all fixed dimensions to responsive
- Keep same constructor parameters and methods

**Step 3: Iterate based on visual comparison**
- Compare your output with target screenshot
- Adjust spacing, sizing, colors
- Test responsive behavior at different viewports

**Step 4: Auto-update import in installation.html**
```bash
Read installation.html
Edit installation.html to update import from {ScreenName}.js to {ScreenName}.v2.js
```

**Step 5: Commit iteration**
```bash
git add src/screens/{ScreenName}.v2.js installation.html
git commit -m "{ScreenName}: [describe changes - e.g., 'implement Figma title layout']"
git push origin main
```

### 6. Testing Checklist

Before marking as complete, verify:
- [ ] Matches target screenshot visually at 1200×1920
- [ ] Scales properly to 1920×1080 (desktop)
- [ ] Scales properly to 375×667 (mobile)
- [ ] No text overflow or microscopic fonts
- [ ] Uses Google Brand Colors correctly
- [ ] Background elements render smoothly
- [ ] Maintains same public API as original
- [ ] Event handlers still work (keyboard navigation)

### 7. Auto-Update Import and Test

After creating the `.v2.js` file, automatically update the import in `installation.html`:

```bash
# Find and replace the import statement
Read installation.html
Edit installation.html to change:
  import { {ScreenName} } from './src/screens/{ScreenName}.js'
To:
  import { {ScreenName} } from './src/screens/{ScreenName}.v2.js'
```

Then inform user to test at: `http://localhost:5173/installation.html`

### 8. Iteration Protocol

After creating the `.v2.js` file:
1. **Auto-update import** in `installation.html` (use Read + Edit tools)
2. Explain what you changed and why
3. Show code diff for key changes
4. Tell user: "✅ Import updated. Test at http://localhost:5173/installation.html"
5. Wait for feedback
6. Iterate based on feedback
7. Commit when user confirms it looks good

### 9. DO NOT:
- ❌ Modify the original `{ScreenName}.js` file
- ❌ Break responsive behavior (no fixed 1200×1920 dimensions)
- ❌ Remove GoL background integration
- ❌ Change public API (constructor parameters, method names)
- ❌ Use colors outside Google Brand palette without asking
- ❌ Remove event handlers or keyboard navigation
- ❌ Assume - always ask if uncertain about a design decision

### 10. Communication Style
- Show code diffs for each iteration
- Explain design decisions (e.g., "I used clamp(48px, 7vh, 96px) instead of fixed 133px to maintain readability on mobile")
- Ask clarifying questions about ambiguous Figma elements
- Propose alternatives when Figma design conflicts with responsive requirements
- Note any Figma elements that need to be simplified for responsiveness

## Example Response Format:

### Iteration 1: Initial Implementation

**Analysis:**
- Current file has basic title/subtitle layout
- Figma design adds decorative GoL-style gradient bars
- Title font is larger in Figma (133.76px vs current 64px)
- Layout uses centered flexbox (good, keep this)

**Changes:**
1. Created `WelcomeScreen.v2.js` based on Figma layout
2. Converted title from fixed 64px → clamp(48px, 7vh, 96px) (Figma: 133.76px)
3. Added subtitle "Conway's Arcade" (Figma shows two-line title)
4. Changed prompt to "Press any key to start" (matching Figma)
5. Maintained responsive container dimensions
6. Kept same event handlers (handleKeyPress)

**Code Diff:**
```javascript
// Old (WelcomeScreen.js):
.welcome-title {
  font-size: clamp(24px, 3.33vh, 64px);
  color: #4285F4;
  margin: 0 0 clamp(8px, 1.04vh, 20px) 0;
}

// New (WelcomeScreen.v2.js):
.welcome-title {
  font-size: clamp(48px, 7vh, 96px);
  color: #202124;
  margin: 0;
  line-height: 1;
}
```

**Responsive Calculations:**
- Title size: 133.76px at 1920px height = 6.97vh → rounded to 7vh
- Container width: 732px / 1200px = 61% → clamp(300px, 61vw, 732px)
- Subtitle prompt: 55px at 1920px height = 2.86vh → clamp(24px, 3vh, 55px)

**Testing:**
✅ Import automatically updated in `installation.html`

Please test at http://localhost:5173/installation.html
1. Check if layout matches screenshot at 1200×1920
2. Resize browser to test responsiveness
3. Press keys to verify navigation still works

**Questions:**
- Should I add the decorative GoL gradient bars from Figma, or keep the clean design?
- The Figma colors show #202124 (dark gray) for title. Should I keep Google Blue (#4285F4) or match Figma?

---

Ready to start! Please provide:
1. **Screen File Path:** (e.g., @LifeArcade\src\screens\WelcomeScreen.js)
2. **Figma Code:** (paste as text)
3. **Target Screenshot:** (attach image)
