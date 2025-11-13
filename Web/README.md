# Web - LLM Game Generator

**LLM-powered Conway's Game of Life arcade game generator**

## 🎯 Overview

Web app that generates playable arcade games using Claude API and the Game of Life framework from LifeArcade.

## 🚀 Features (Planned)

- **Game Request Form:** User describes game mechanics
- **Real-time Generation:** Live code generation with progress
- **Code Preview:** Syntax-highlighted JavaScript output
- **Instant Play:** Test game in browser immediately
- **Download:** Get JS + HTML files
- **Quality Scoring:** Automated validation (90-95% accuracy)

## 🏗️ Tech Stack (Proposed)

### Backend
- Node.js + Express
- Anthropic Claude API (Sonnet 4.5)
- Framework docs injection (from LifeArcade)
- HTML auto-generation (server-side)

### Frontend
- React or Vue.js
- Monaco Editor (code display)
- p5.js (game preview)
- Tailwind CSS

### Quality Assurance
- Code validation (import checks)
- Runtime testing (iframe sandbox)
- Error detection (common LLM mistakes)
- Scoring system (like Snake/Pong analysis)

## 📊 Status

**Current:** 60% complete (framework ready, web app pending)

**Completed:**
- ✅ Framework validated (LifeArcade)
- ✅ Prompt templates (Snake, Pong)
- ✅ Quality benchmarks (90-95%)
- ✅ HTML auto-generation strategy
- ✅ "Available Methods" reference

**Pending:**
- ⏳ Backend API setup
- ⏳ Frontend UI
- ⏳ Claude API integration
- ⏳ Quality assurance automation
- ⏳ Deployment

## 🎮 Proven Quality

**Test Results:**
- **Snake:** 72/76 checks (95%) - 2 method name bugs
- **Pong:** 18/20 checks (90%) - 1 export typo
- **Average:** 92.5% success rate

**Key Insights:**
- LLM follows framework patterns correctly
- "Available Methods" section reduces errors
- Advanced physics implemented successfully (vector normalization in Pong)
- Minimal bugs, quick fixes

## 📁 Project Structure (Planned)

```
Web/
├── backend/
│   ├── server.js              # Express server
│   ├── routes/
│   │   └── generate.js        # Game generation endpoint
│   ├── services/
│   │   ├── claude.js          # Claude API client
│   │   ├── generator.js       # Game generator logic
│   │   └── validator.js       # Code validation
│   └── utils/
│       ├── html-gen.js        # HTML auto-generation
│       └── framework-loader.js # Load LifeArcade docs
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── GameForm.jsx   # Request form
│   │   │   ├── CodePreview.jsx # Code display
│   │   │   ├── GamePreview.jsx # Play test
│   │   │   └── Gallery.jsx     # Examples
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── public/
│
└── shared/
    └── framework-pattern.md  # Symlink to LifeArcade docs
```

## 🚀 Quick Start (Future)

```bash
# Install dependencies
npm install

# Start backend
cd backend
npm run dev

# Start frontend (separate terminal)
cd frontend
npm run dev

# Open http://localhost:3000
```

## 🔗 Integration with LifeArcade

**Shared Resources:**
- Framework documentation (`../LifeArcade/docs/framework-pattern.md`)
- Helper functions reference
- Test prompts (Snake, Pong)
- Quality benchmarks

**Benefits:**
- Consistent framework across projects
- Generated games work in LifeArcade
- Real examples for testing
- Shared maintenance

## 📝 Implementation Plan

### Phase 1: Backend MVP (1 week)
- [ ] Express server setup
- [ ] Claude API integration
- [ ] Prompt engineering (use test prompts as base)
- [ ] HTML auto-generation
- [ ] Basic validation

### Phase 2: Frontend MVP (1 week)
- [ ] React app setup
- [ ] Game request form
- [ ] Code preview (Monaco)
- [ ] Download functionality
- [ ] Example gallery

### Phase 3: Quality Assurance (3-5 days)
- [ ] Automated testing (iframe sandbox)
- [ ] Bug detection (common errors)
- [ ] Quality scoring (0-100%)
- [ ] Suggest fixes

### Phase 4: Deployment (2-3 days)
- [ ] Deploy to Vercel/Railway
- [ ] Environment variables
- [ ] CORS & security
- [ ] Analytics

**Total:** 3-4 weeks

## 💡 Future Enhancements

- User accounts (save generated games)
- Payment integration (freemium model)
- Game templates (e.g., "platformer", "shooter")
- Multiplayer games
- Export to LifeArcade directly
- Community gallery (share games)
- API access for developers

## 📊 Business Model (Ideas)

### Freemium
- **Free:** 5 games/month, basic validation
- **Pro:** Unlimited, advanced validation, templates
- **Enterprise:** API access, custom framework

### Pricing (Estimated)
- Free: $0/month
- Pro: $20/month
- Enterprise: Custom

## 🔗 Links

- LifeArcade: `../LifeArcade/`
- Framework Docs: `../LifeArcade/docs/framework-pattern.md`
- Test Prompts: `../LifeArcade/prompts/`
- Analysis: `../LifeArcade/docs/LLM_TEST_*_ANALYSIS.md`

---

## 🎯 Next Steps

1. Review implementation plan
2. Setup backend (Express + Claude API)
3. Create simple frontend
4. Test end-to-end flow
5. Iterate based on results

---

_Status: Planning Phase_
_Ready to Start: Yes (framework validated)_
_Estimated Time: 3-4 weeks to MVP_
