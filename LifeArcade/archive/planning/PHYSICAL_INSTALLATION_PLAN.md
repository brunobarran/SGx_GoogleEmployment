# Physical Installation - Implementation Plan
## Fecha: 2025-11-12

---

## 🎮 FLUJO DE PANTALLAS DEFINITIVO

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  1. INICIO (Attract Screen)                                    │
│     ↓ [Press Any Button]                                       │
│                                                                 │
│  2. SELECCIÓN DE JUEGO (Gallery)                               │
│     ↓ [Select Game + Enter]                                    │
│                                                                 │
│  3. CÓDIGO ANIMADO (Code Generation Screen)                    │
│     ↓ [Auto-transition after animation]                        │
│                                                                 │
│  4. JUEGO (Game Play)                                          │
│     ↓ [Game Over]                                              │
│                                                                 │
│  5. SCORE + NOMBRE (High Score Entry)                          │
│     ↓ [Submit initials]                                        │
│                                                                 │
│  6. LEADERBOARD (High Scores)                                  │
│     ↓ [Timeout → Back to 1]                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 ESTADO ACTUAL vs NECESARIO

### ✅ Ya Implementado
- Pantalla 2: Gallery (selección) ✅
- Pantalla 4: Juegos (7 juegos funcionando) ✅

### ⏳ Por Implementar
- Pantalla 1: Inicio (attract screen) ❌
- Pantalla 3: Código animado ❌
- Pantalla 5: Score + nombre ❌
- Pantalla 6: Leaderboard ❌
- Sistema de navegación entre pantallas ❌
- Persistencia de scores ❌

---

## 🏗️ OPCIONES DE ARQUITECTURA

### **OPCIÓN A: SINGLE PAGE APP (SPA)** ⭐ Recomendada
**Arquitectura:** Todo en un solo HTML con state machine

**Estructura:**
```
installation.html (main container)
  ├── Screen 1: AttractScreen.js
  ├── Screen 2: Gallery.js (existente, adaptado)
  ├── Screen 3: CodeAnimationScreen.js
  ├── Screen 4: GameIframe.js (carga juego)
  ├── Screen 5: ScoreEntryScreen.js
  └── Screen 6: LeaderboardScreen.js

State Manager (AppState.js)
  ├── currentScreen: 'attract' | 'gallery' | 'code' | 'game' | 'score' | 'leaderboard'
  ├── selectedGame: string
  ├── currentScore: number
  ├── playerName: string
  └── leaderboard: Array<{game, name, score, date}>

Persistence (StorageManager.js)
  ├── localStorage for scores
  └── Optional: API backend for sync
```

**Ventajas:**
- ✅ Navegación fluida (sin page reloads)
- ✅ State centralizado
- ✅ Fácil debugging
- ✅ Compartir datos entre pantallas
- ✅ Transiciones suaves

**Desventajas:**
- ⚠️ Más complejo inicialmente
- ⚠️ Requiere refactoring de gallery.html

**Tiempo estimado:** 8-12 horas

---

### **OPCIÓN B: MULTI-PAGE CON NAVIGATION**
**Arquitectura:** Páginas separadas con query params

**Estructura:**
```
1-attract.html          → 2-gallery.html
2-gallery.html          → 3-code-animation.html?game=snake
3-code-animation.html   → 4-game.html?game=snake
4-game.html             → 5-score-entry.html?game=snake&score=1500
5-score-entry.html      → 6-leaderboard.html?game=snake
6-leaderboard.html      → 1-attract.html (loop)

Shared:
  ├── js/storage.js (localStorage manager)
  └── js/navigation.js (page transitions)
```

**Ventajas:**
- ✅ Más simple conceptualmente
- ✅ Cada pantalla es independiente
- ✅ Fácil testear individualmente
- ✅ Menos refactoring de código existente

**Desventajas:**
- ❌ Page reloads (pueden ser lentos)
- ❌ Dificultar transiciones suaves
- ❌ Compartir state es más complejo
- ❌ No tan "arcade-like"

**Tiempo estimado:** 6-8 horas

---

### **OPCIÓN C: HYBRID (SPA + Iframes)**
**Arquitectura:** SPA para navegación, iframes para juegos

**Estructura:**
```
installation.html (SPA container)
  ├── Screens 1-3, 5-6: Inline components
  └── Screen 4: <iframe src="games/snake.html">

js/
  ├── screens/
  │   ├── AttractScreen.js
  │   ├── GalleryScreen.js
  │   ├── CodeAnimationScreen.js
  │   ├── ScoreEntryScreen.js
  │   └── LeaderboardScreen.js
  ├── AppState.js (state machine)
  └── StorageManager.js (persistence)

Communication:
  window.postMessage() entre iframe y parent
```

**Ventajas:**
- ✅ Lo mejor de ambos mundos
- ✅ Juegos aislados (no interfieren)
- ✅ Navegación fluida
- ✅ No requiere modificar juegos existentes

**Desventajas:**
- ⚠️ postMessage complexity
- ⚠️ Score extraction desde iframe
- ⚠️ Iframe overhead

**Tiempo estimado:** 10-14 horas

---

## 🎨 OPCIONES DE IMPLEMENTACIÓN POR PANTALLA

### **Pantalla 1: INICIO (Attract Screen)**

#### Opción 1A: Animated GoL Background + Logo
```javascript
// Pantalla con:
// - Background: Pure GoL grid (full screen)
// - Center: Logo animado "Game of Life Arcade"
// - Bottom: "Press Any Button to Start" (pulsando)
// - Timeout: 30s → auto-demo (mostrar gameplay loop)
```

**Features:**
- Background GoL con patterns aleatorios (R-pentomino, Acorn)
- Logo con efecto typewriter
- Idle timeout → auto-play demo de juegos

**Tiempo:** 2-3 horas

---

#### Opción 1B: Video Loop Attract
```javascript
// Pantalla con:
// - Video loop de gameplay de todos los juegos
// - Overlay: Logo + "Press Start"
// - Audio: Música ambiente (opcional)
```

**Features:**
- Pre-rendered video de mejores momentos
- Más "arcade tradicional"
- Menos CPU usage

**Tiempo:** 1-2 horas (+ video creation)

---

#### Opción 1C: Slideshow de Screenshots
```javascript
// Pantalla con:
// - Slideshow automático de screenshots de juegos
// - Fade transitions
// - Game title + "High Score: XXXX"
```

**Features:**
- Simple y efectivo
- Muestra todos los juegos
- Minimal CPU

**Tiempo:** 1-2 horas

---

### **Pantalla 3: CÓDIGO ANIMADO (Code Generation)**

#### Opción 3A: Typewriter Effect con Syntax Highlighting ⭐
```javascript
// Animación:
// 1. Pantalla negra con cursor parpadeando
// 2. Texto aparece caracter a caracter (efecto typewriter)
// 3. Syntax highlighting (comments verde, keywords azul, etc)
// 4. Scroll automático conforme aparece código
// 5. Al terminar: Fade out → Load game

// Visual:
// > Generating snake.js...
//
// // ===== IMPORTS =====
// import { GoLEngine } from '../src/core/GoLEngine.js'
// import { SimpleGradientRenderer } from ...
// [código continúa apareciendo...]
//
// > Compilation complete ✓
// > Loading game...
```

**Features:**
- Lee archivo real del juego (fetch)
- Velocidad ajustable (2-5 segundos total)
- Sound effects (typing, beep)
- MS-DOS aesthetic

**Tiempo:** 3-4 horas

**Librerías:**
- Typed.js (typewriter)
- Prism.js (syntax highlighting)
- Custom scroll logic

---

#### Opción 3B: Matrix-Style Falling Code
```javascript
// Animación:
// - Caracteres cayendo estilo Matrix
// - Código del juego "formándose" desde arriba
// - Efecto glitch/distorsión
// - Color verde terminal
```

**Features:**
- Más "wow factor"
- Menos legible (más artístico)
- Faster transition

**Tiempo:** 4-5 horas

---

#### Opción 3C: Progress Bar Simple
```javascript
// Pantalla:
// > Loading snake.js
// [████████████░░░░░░░░] 65%
// > Initializing Game of Life engine...
// > Compiling game logic...
// > Ready!

// Muestra snippets de código en background (blur)
```

**Features:**
- Más simple
- Feedback claro
- Rápido de implementar

**Tiempo:** 1-2 horas

---

### **Pantalla 5: SCORE + NOMBRE**

#### Opción 5A: Arcade Classic Style ⭐
```javascript
// Layout:
// ┌────────────────────────────────┐
// │     GAME OVER                  │
// │                                │
// │     YOUR SCORE: 15,420         │
// │                                │
// │  ┌──┐ ┌──┐ ┌──┐               │
// │  │ A│ │ B │ │ C│               │ <- Iniciales
// │  └──┘ └──┘ └──┘               │
// │                                │
// │  ← → : Select Letter           │
// │  SPACE: Next / Submit          │
// └────────────────────────────────┘

// Controles:
// - ← →: Cambiar letra (A-Z)
// - SPACE: Confirmar letra, avanzar
// - Después de 3 letras: Auto-submit
```

**Features:**
- 3 inputs para iniciales (AAA-ZZZ)
- Navegación con flechas (circular A→Z→A)
- Visual feedback (letra actual más grande)
- Timeout: 30s → auto-submit "AAA"

**Tiempo:** 2-3 horas

---

#### Opción 5B: Keyboard Input
```javascript
// Layout similar pero:
// - Permite teclear directamente (A-Z)
// - Backspace para borrar
// - Enter para submit
```

**Ventajas:**
- Más rápido para usuarios
**Desventajas:**
- Menos "arcade authentic"
- Requiere keyboard (puede no haber en instalación)

**Tiempo:** 1-2 horas

---

### **Pantalla 6: LEADERBOARD**

#### Opción 6A: Classic Arcade Table ⭐
```javascript
// Layout:
// ┌────────────────────────────────────────┐
// │        HIGH SCORES - SNAKE             │
// │                                        │
// │  RANK  NAME   SCORE        DATE       │
// │  ────────────────────────────────────  │
// │   🥇   ABC   25,420    Nov 12, 2025   │ <- Highlight nuevo
// │   🥈   XYZ   18,500    Nov 11, 2025   │
// │   🥉   DEF   15,230    Nov 10, 2025   │
// │   4    GHI   12,100    Nov 09, 2025   │
// │   5    JKL   10,500    Nov 08, 2025   │
// │                                        │
// │        Press ANY to continue           │
// │              (15s)                     │
// └────────────────────────────────────────┘

// Features:
// - Top 10 scores
// - Highlight del nuevo score (flash animation)
// - Countdown timer (30s → vuelve a attract)
// - Ranking icons (🥇🥈🥉)
```

**Persistence:**
```javascript
// localStorage structure:
{
  "snake": [
    {name: "ABC", score: 25420, date: "2025-11-12T14:30:00Z"},
    {name: "XYZ", score: 18500, date: "2025-11-11T10:15:00Z"},
    ...
  ],
  "pong": [...],
  ...
}
```

**Tiempo:** 2-3 horas

---

#### Opción 6B: Global Leaderboard (All Games)
```javascript
// Muestra top scores de TODOS los juegos
// Útil si quieres comparar entre juegos
```

**Tiempo:** 2-3 horas

---

#### Opción 6C: Animated Podium
```javascript
// Animación de podio 3D
// Top 3 con avatars/sprites GoL
// Más visual, menos información
```

**Tiempo:** 4-5 horas

---

## 🗄️ OPCIONES DE PERSISTENCIA

### Opción P1: localStorage (Solo Client-Side) ⭐
```javascript
class StorageManager {
  static saveScore(game, name, score) {
    const scores = this.getScores(game)
    scores.push({name, score, date: new Date().toISOString()})
    scores.sort((a, b) => b.score - a.score)
    scores.splice(10) // Keep top 10
    localStorage.setItem(`scores_${game}`, JSON.stringify(scores))
  }

  static getScores(game) {
    return JSON.parse(localStorage.getItem(`scores_${game}`) || '[]')
  }

  static getTopScore(game) {
    const scores = this.getScores(game)
    return scores[0]?.score || 0
  }
}
```

**Ventajas:**
- ✅ Simple, no backend
- ✅ Funciona offline
- ✅ Cero latency

**Desventajas:**
- ❌ Data local al Mac Mini (no sync)
- ❌ Se pierde si clear cache
- ❌ No stats globales

**Tiempo:** 30 minutos

---

### Opción P2: Supabase (Cloud Backend)
```javascript
// Setup:
// 1. Create Supabase project (free tier)
// 2. Create 'scores' table
// 3. Client-side JS SDK

// Schema:
CREATE TABLE scores (
  id UUID PRIMARY KEY,
  game VARCHAR,
  player_name VARCHAR(3),
  score INTEGER,
  created_at TIMESTAMP
);

// JS:
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(URL, KEY)

async function saveScore(game, name, score) {
  await supabase.from('scores').insert({game, player_name: name, score})
}
```

**Ventajas:**
- ✅ Sync across devices
- ✅ Analytics posibles
- ✅ Backup automático
- ✅ Real-time updates

**Desventajas:**
- ❌ Requiere internet
- ❌ Setup más complejo
- ❌ Latency

**Tiempo:** 2-3 horas (setup + integration)

---

### Opción P3: Hybrid (localStorage + API sync)
```javascript
// Local-first approach:
// 1. Save to localStorage (inmediato)
// 2. Background sync to API (when online)
// 3. Fallback to local if offline

class HybridStorage {
  static async saveScore(game, name, score) {
    // Save local
    LocalStorage.saveScore(game, name, score)

    // Try sync to cloud
    try {
      await API.saveScore(game, name, score)
    } catch (e) {
      console.log('Offline mode, will sync later')
    }
  }
}
```

**Ventajas:**
- ✅ Best of both worlds
- ✅ Funciona offline
- ✅ Sync cuando hay internet

**Tiempo:** 3-4 horas

---

## 🎯 MI RECOMENDACIÓN

### **STACK RECOMENDADO:**

**Arquitectura:** OPCIÓN C - Hybrid (SPA + Iframes) ⭐
- Navegación fluida sin modificar juegos
- Mejor UX
- Aislamiento de juegos

**Pantallas:**
1. **Inicio:** Opción 1A (GoL Background + Logo)
2. **Selección:** Gallery existente (adaptar)
3. **Código:** Opción 3A (Typewriter + Syntax) ⭐
4. **Juego:** Iframe (sin cambios)
5. **Score:** Opción 5A (Arcade Classic) ⭐
6. **Leaderboard:** Opción 6A (Classic Table) ⭐

**Persistencia:** Opción P1 (localStorage)
- Simple, sin dependencies
- Upgrade a P3 (hybrid) si cliente lo pide

---

## 📊 ESTIMACIÓN DE TIEMPOS

### Implementación Completa (Stack Recomendado)

**Fase 1: Core Structure** (4-5 horas)
- [ ] SPA container + state machine (2h)
- [ ] Navigation logic (1h)
- [ ] Iframe communication (1h)
- [ ] localStorage manager (30min)

**Fase 2: Pantallas** (8-10 horas)
- [ ] Pantalla 1: Attract (2-3h)
- [ ] Pantalla 2: Adaptar gallery (1h)
- [ ] Pantalla 3: Code animation (3-4h)
- [ ] Pantalla 5: Score entry (2-3h)
- [ ] Pantalla 6: Leaderboard (2-3h)

**Fase 3: Integration & Polish** (3-4 horas)
- [ ] Flow testing (1h)
- [ ] Transitions (1h)
- [ ] Sound effects (30min)
- [ ] Error handling (30min)
- [ ] Performance testing (1h)

**TOTAL:** 15-19 horas (~2-3 días de trabajo)

---

## 🚀 PLAN DE IMPLEMENTACIÓN INCREMENTAL

### **Sprint 2A: Core + Minimal Screens** (1 día)
1. SPA container + state machine
2. Pantalla 1: Attract (versión simple)
3. Adaptar gallery para SPA
4. Pantalla 5: Score entry (básico)
5. localStorage manager

**Resultado:** Flow completo funcionando (básico)

### **Sprint 2B: Polish Screens** (1 día)
1. Pantalla 3: Code animation (typewriter)
2. Pantalla 6: Leaderboard (tabla)
3. Transitions mejoradas
4. Sound effects

**Resultado:** Experiencia pulida

### **Sprint 2C: Testing & Deploy** (medio día)
1. Mac Mini deployment
2. Hardware testing
3. Performance optimization
4. Bug fixes

**Resultado:** Listo para exhibición

---

## 🎨 MOCKUPS DE REFERENCIA

### Pantalla 3: Code Animation
```
┌───────────────────────────────────────────────────────┐
│ > Generating snake.js...                             │
│                                                       │
│ // ===== IMPORTS =====                               │
│ import { GoLEngine } from '../src/core/GoLEngine.js' │█ <- cursor
│ import { SimpleGradientRenderer } from '../src/rend  │
│ import { GRADIENT_PRESETS } from '../src/utils/Grad  │
│ import { Collision } from '../src/utils/Collision.j  │
│                                                       │
│ // ===== CONFIG =====                                │
│ const CONFIG = {                                     │
│   width: 800,                                        │
│   height: 600,                                       │
│                                                       │
│ [Código continúa apareciendo...]                     │
│                                                       │
│                                    [Typing sounds...] │
└───────────────────────────────────────────────────────┘
```

### Pantalla 5: Score Entry
```
┌───────────────────────────────────────────────────────┐
│                                                       │
│              🎮  GAME OVER  🎮                        │
│                                                       │
│            YOUR SCORE: 15,420                         │
│                                                       │
│         ENTER YOUR INITIALS:                          │
│                                                       │
│            ┌────┐  ┌────┐  ┌────┐                    │
│            │  A │  │  B  │  │  C │                    │
│            └────┘  └────┘  └────┘                    │
│              ▲                                        │
│         (selected)                                    │
│                                                       │
│         ← →  : Change Letter                          │
│         SPACE: Confirm & Next                         │
│                                                       │
└───────────────────────────────────────────────────────┘
```

---

## ❓ PREGUNTAS PARA EL CLIENTE

Antes de implementar, confirmar:

1. **Pantalla de código:**
   - ¿Preferencia entre typewriter vs matrix vs progress bar?
   - ¿Duración ideal? (2s, 5s, 10s)
   - ¿Mostrar código real o pseudo-código?

2. **Leaderboard:**
   - ¿Top 5, Top 10, o Top 20?
   - ¿Un leaderboard por juego o global?
   - ¿Necesita sync online o solo local?

3. **Attract screen:**
   - ¿Auto-demo de juegos? (sí/no)
   - ¿Timeout? (30s, 60s, nunca)
   - ¿Música/audio? (sí/no)

4. **Branding:**
   - ¿Logo disponible? (formato)
   - ¿Paleta de colores final?
   - ¿Tipografía específica?

---

## 📝 PRÓXIMA ACCIÓN

**Opción 1: Empezar con Quick Prototype** (2-3 horas)
- Crear SPA container básico
- Implementar state machine
- Pantalla attract simple
- Score entry básico
- **Resultado:** Proof of concept del flow completo

**Opción 2: Deep Dive en Code Animation** (3-4 horas)
- Implementar typewriter effect
- Syntax highlighting
- Fetch código real
- Scroll automático
- **Resultado:** Pantalla 3 completamente pulida

**Opción 3: Completar Stack Recommendation** (full day)
- Implementar todas las pantallas (versión básica)
- Flow completo end-to-end
- **Resultado:** Instalación funcionando

---

¿Qué opción de arquitectura prefieres? ¿Y qué opciones específicas para cada pantalla?

Puedo empezar con el prototype o deep dive en cualquier pantalla específica.
