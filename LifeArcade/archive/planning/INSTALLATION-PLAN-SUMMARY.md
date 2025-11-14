# Physical Installation - Plan Summary

## 📊 Overview

**Nueva estructura:** 8 pantallas (antes 6)
**Resolución target:** 1200×1920 (portrait/vertical)
**Desarrollo total:** 24-30 horas en 4 fases
**Cambios críticos:** Juegos deben ser modificados a 1200×1920, Game Over flow debe arreglarse

---

## 🎯 Cambios Principales vs Plan Anterior

### 1. Estructura de Pantallas (6 → 8)

**Antes (6 pantallas):**
1. Attract (GoL + logo + "Press Space")
2. Gallery
3. Code Animation
4. Game
5. Score Entry
6. Leaderboard

**Ahora (8 pantallas):**
1. **IDLE** - Solo GoL background, sin texto
2. **WELCOME** - "Press SPACE to start"
3. **GALLERY** - Selección de juego
4. **CODE ANIMATION** - Typewriter fullscreen (NO iframe)
5. **GAME** - Fullscreen 1200×1920 (iframe)
6. **SCORE ENTRY** - 3 letras
7. **LEADERBOARD** - Top 10
8. **QR CODE** - Escanear para jugar en web

### 2. Resolución de Juegos (CRÍTICO)

**Problema:** Los juegos actualmente usan resoluciones variadas (800×600, etc.)

**Solución requerida:**
- **TODOS** los 7 juegos deben modificarse a `createCanvas(1200, 1920)`
- Ajustar gameplay para orientación portrait
- Reposicionar UI elements
- **Estimado:** ~1 hora por juego = 7 horas total

**Archivos a modificar:**
```
games/space-invaders.js   → 1200×1920
games/dino-runner.js      → 1200×1920
games/breakout.js         → 1200×1920
games/asteroids.js        → 1200×1920
games/flappy-bird.js      → 1200×1920
games/snake.js            → 1200×1920
games/pong.js             → 1200×1920
```

### 3. Game Over Flow (CRÍTICO - ACTUALMENTE ROTO)

**Problema actual:**
```
Game → triggerGameOver() → Show popup → Wait Space → Restart
```

**Solución requerida:**
```
Game → triggerGameOver() → Send postMessage → Installation → Score Entry
```

**Cambios en cada juego:**

```javascript
// 1. En triggerGameOver(), AGREGAR:
if (window.parent !== window) {
  window.parent.postMessage({
    type: 'gameOver',
    payload: { score: state.score }
  }, '*')
}

// 2. En draw(), MODIFICAR:
if (state.phase === 'GAMEOVER') {
  if (window.parent === window) {
    renderGameOver(width, height, state.score)  // Solo en modo standalone
  }
}

// 3. En keyPressed(), MODIFICAR:
if (state.phase === 'GAMEOVER' && key === ' ') {
  if (window.parent === window) {
    initGame()  // Solo en modo standalone
  }
  return
}
```

### 4. Sin Scrollbars (CRÍTICO)

**Problema:** El navegador muestra scrollbars si el contenido excede viewport

**Solución:**
```css
body, #installation-container, .screen {
  overflow: hidden;
}
```

**Aplicar a:**
- HTML principal (`installation.html`)
- Todos los juegos (7 archivos)
- Todas las pantallas (8 screens)

### 5. Fondo Blanco (Google Minimalism)

**Cambio:** De negro a blanco completamente

**Aplicar:**
- Fondo de contenido: `#FFFFFF`
- Letterbox bars (responsive): `#FFFFFF` (ya no negro)
- Todos los elementos: Google colors únicamente

---

## 📋 Las 4 Fases de Desarrollo

### Phase 1: Core Infrastructure (5-6 horas)

**Objetivo:** Construir el contenedor SPA y sistema de navegación

**Tareas:**
1. `installation.html` con 8 screen divs
2. `AppState.js` - State machine
3. `StorageManager.js` - localStorage para leaderboards
4. `IframeComm.js` - postMessage handling
5. `InputManager.js` - Keyboard input

**Deliverables:**
- HTML container funcionando
- Navegación entre pantallas funciona
- localStorage guarda scores
- postMessage listener listo

### Phase 2: Screen Implementations (10-12 horas)

**Objetivo:** Implementar las 8 pantallas

**Tareas:**
1. **IdleScreen.js** (2h) - GoL background, sin texto
2. **WelcomeScreen.js** (1h) - "Press SPACE to start"
3. **GalleryScreen.js** (2h) - 7 juegos en grid 2×4
4. **CodeAnimationScreen.js** (2h) - Typewriter fullscreen
5. **GameScreen.js** (1.5h) - iframe loader 1200×1920
6. **ScoreEntryScreen.js** (1.5h) - 3-letter input arcade-style
7. **LeaderboardScreen.js** (1.5h) - Top 10 table
8. **QRCodeScreen.js** (1.5h) - QR code para web

**Deliverables:**
- 8 archivos .js en `src/screens/`
- Cada pantalla funciona standalone
- Navegación completa: idle → ... → qr → idle

### Phase 3: Game Integration (6-8 horas)

**Objetivo:** Modificar los 7 juegos para 1200×1920 y arreglar Game Over

**Por cada juego (~1h cada uno):**

1. **Resolution** (15min)
   ```javascript
   createCanvas(1200, 1920)  // Cambiar de lo que sea actual
   ```

2. **Gameplay Adjustments** (30min)
   - Ajustar posiciones para portrait
   - Reposicionar UI (score, lives)
   - Verificar que nada se salga del canvas

3. **Game Over Fix** (15min)
   ```javascript
   // Agregar postMessage logic (ver arriba)
   ```

4. **Remove Scrollbars** (5min)
   ```css
   body { overflow: hidden; }
   ```

**Deliverables:**
- 7 juegos modificados y funcionando a 1200×1920
- Game Over manda postMessage correctamente
- Sin scrollbars en ningún juego
- Juegos funcionan tanto standalone como en installation

### Phase 4: Integration & Polish (3-4 horas)

**Objetivo:** Transiciones, error handling, testing

**Tareas:**
1. **Screen Transitions** (1.5h)
   - CSS transitions entre pantallas
   - Material Design cubic-bezier
   - Smooth fade/slide animations

2. **Error Handling** (1h)
   - iframe fails to load
   - postMessage timeout
   - localStorage quota exceeded

3. **End-to-End Testing** (1-1.5h)
   - Probar flujo completo con cada juego
   - Verificar leaderboards persisten
   - Verificar QR codes generan bien

4. **Performance** (0.5h)
   - Verificar 60fps en Idle
   - Verificar smooth transitions
   - Verificar < 100MB memory

**Deliverables:**
- Transiciones smooth entre todas las pantallas
- Error handling robusto
- Performance targets cumplidos
- Todo el flujo funcionando end-to-end

---

## ✅ Criterios de Éxito

### Funcional
- [ ] 8 pantallas implementadas y funcionando
- [ ] Flujo completo: idle → ... → qr → idle
- [ ] 7 juegos corriendo a 1200×1920
- [ ] Game Over manda postMessage (no popup)
- [ ] Leaderboards persisten en localStorage
- [ ] QR codes generan correctamente

### Visual
- [ ] Google minimalism en todas las pantallas
- [ ] Fondo blanco (#FFFFFF) everywhere
- [ ] SIN scrollbars en ningún lado
- [ ] Transiciones smooth entre pantallas
- [ ] Responsive design (letterboxing en horizontal)

### Performance
- [ ] 60fps en Idle screen (GoL)
- [ ] 60fps en transiciones
- [ ] Sin memory leaks
- [ ] Juegos cargan instantáneamente (sin loading screens)

### Técnico
- [ ] Sin errores en console
- [ ] postMessage communication reliable
- [ ] localStorage operations safe
- [ ] Keyboard input responsive

---

## 🚨 Problemas Críticos a Resolver

### 1. Game Over NO funciona actualmente
**Status:** 🔴 ROTO
**Acción:** Phase 3 - Modificar los 7 juegos
**Prioridad:** ALTA

Los juegos muestran popup en lugar de mandar postMessage. Esto rompe el flujo de instalación.

### 2. Juegos tienen resoluciones incorrectas
**Status:** 🔴 INCORRECTO
**Acción:** Phase 3 - Modificar los 7 juegos
**Prioridad:** ALTA

Los juegos usan 800×600, 1024×768, etc. Deben ser 1200×1920.

### 3. Scrollbars visibles
**Status:** 🟡 POSIBLE
**Acción:** Phase 1 CSS + Phase 3 juegos
**Prioridad:** MEDIA

Puede haber scrollbars si overflow no está hidden.

---

## 📁 Archivos Nuevos a Crear

### Phase 1 (Infrastructure)
```
src/installation/
├── AppState.js
├── StorageManager.js
├── InputManager.js
└── IframeComm.js

installation.html  (SPA container)
```

### Phase 2 (Screens)
```
src/screens/
├── IdleScreen.js
├── WelcomeScreen.js
├── GalleryScreen.js
├── CodeAnimationScreen.js
├── GameScreen.js
├── ScoreEntryScreen.js
├── LeaderboardScreen.js
└── QRCodeScreen.js
```

### Phase 3 (No archivos nuevos, solo modificaciones)
```
games/  (MODIFICAR todos)
├── space-invaders.js
├── dino-runner.js
├── breakout.js
├── asteroids.js
├── flappy-bird.js
├── snake.js
└── pong.js
```

---

## 📚 Documentación Creada

1. **`installation-phases-plan.md`**
   Plan detallado de las 4 fases con todas las tareas

2. **`8-screen-flow-diagram.md`**
   Diagrama visual del flujo completo de pantallas

3. **`INSTALLATION-PLAN-SUMMARY.md`** (este archivo)
   Resumen ejecutivo de la replanificación

4. **`coding-prompt-physical-installation.md`** (archivo original)
   Parcialmente actualizado con nueva estructura

---

## ⏱️ Estimación de Tiempo

| Fase | Horas | Descripción |
|------|-------|-------------|
| Phase 1 | 5-6h | Core infrastructure |
| Phase 2 | 10-12h | 8 screen implementations |
| Phase 3 | 6-8h | Modify 7 games |
| Phase 4 | 3-4h | Polish & testing |
| **TOTAL** | **24-30h** | Complete installation |

---

## 🎨 Design System (NON-NEGOTIABLE)

### Colors (Google Brand)
```javascript
GOOGLE_COLORS = {
  BLUE: #4285F4    // Primary
  RED: #EA4335     // Error
  GREEN: #34A853   // Success
  YELLOW: #FBBC04  // Warning
  WHITE: #FFFFFF   // Background
}

Text: #5f6368 (Google gray)
```

### Typography
- Font: `Google Sans, Arial, sans-serif`
- **NO** Courier New, monospace

### Layout
- Background: `#FFFFFF` (white)
- Outer: `#FFFFFF` (white letterbox bars)
- Overflow: `hidden` (sin scrollbars)

---

## 🔄 Flujo de Navegación

```
IDLE (60s OR Space)
  ↓
WELCOME (Space)
  ↓
GALLERY (Select game)
  ↓
CODE ANIMATION (Auto)
  ↓
GAME (postMessage on gameOver)
  ↓
SCORE ENTRY (3 letters)
  ↓
LEADERBOARD (Space OR 30s)
  ↓
QR CODE (Space OR 15s)
  ↓
IDLE (loop)

ANY SCREEN + Escape → IDLE
```

---

## 🧪 Testing Strategy

### Per-Phase Testing

**Phase 1:**
- [ ] HTML loads without errors
- [ ] State machine transitions work
- [ ] localStorage saves/loads
- [ ] postMessage listener ready

**Phase 2:**
- [ ] Each screen renders correctly
- [ ] Navigation between screens works
- [ ] Keyboard input works
- [ ] No scrollbars visible

**Phase 3:**
- [ ] Each game runs at 1200×1920
- [ ] Game Over sends postMessage
- [ ] No popup in installation mode
- [ ] Game works in standalone mode too

**Phase 4:**
- [ ] Complete flow works end-to-end
- [ ] All 7 games tested
- [ ] Performance targets met
- [ ] No console errors

---

## 📞 Next Steps

1. **Review this plan** con el usuario
2. **Confirm approach** para Game Over fix
3. **Start Phase 1** cuando esté listo
4. **Iterate phase by phase** con validación entre fases

---

**Last Updated:** 2025-11-13
**Status:** Plan completado, listo para implementación
