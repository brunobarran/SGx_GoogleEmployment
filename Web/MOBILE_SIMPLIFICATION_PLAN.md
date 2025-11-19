# Plan de Simplificación - Mobile Dino Runner

## 🎯 Objetivo

Simplificar los controles del juego móvil eliminando el mechanic de "agacharse" (duck) y los pterodáctilos voladores, dejando solo el salto como acción principal.

## 📋 Cambios Requeridos

### 1. **Eliminar Mechanic de Duck (Agacharse)**

#### 1.1 Variables y Constantes a Eliminar
```javascript
// LÍNEA 217-218: Eliminar variables de touch hold
let touchStartTime = 0
const DUCK_THRESHOLD = 200  // ms
```

#### 1.2 Player State a Simplificar
```javascript
// LÍNEA 336: Eliminar isDucking del estado del jugador
isDucking: false,  // ❌ ELIMINAR
```

#### 1.3 Touch Event Handlers a Simplificar
```javascript
// LÍNEA 223: Simplificar handleTouchStart
function handleTouchStart(e) {
  e.preventDefault()
  isTouching = true
  // ❌ ELIMINAR: touchStartTime = millis()
}

// No necesita cambios handleTouchEnd (solo preventDefault)
```

#### 1.4 Lógica de updatePlayer() a Simplificar
```javascript
// LÍNEA 611-626: Simplificar lógica de salto
// ANTES (complejo con duck):
if (isTouching && player.onGround) {
  const touchDuration = millis() - touchStartTime
  if (touchDuration < DUCK_THRESHOLD) {
    if (!player.isDucking) {
      player.vy = CONFIG.jumpForce
      player.onGround = false
    }
    player.isDucking = false
  } else {
    player.isDucking = true
  }
} else {
  player.isDucking = false
}

// DESPUÉS (simple - solo salto):
if (isTouching && player.onGround) {
  player.vy = CONFIG.jumpForce
  player.onGround = false
  isTouching = false  // Consume el tap
}
```

#### 1.5 Controles de Teclado a Simplificar
```javascript
// LÍNEA 636-642: Simplificar lógica de teclado
// ANTES:
if (keyIsDown(32) && player.onGround) { // Space
  if (!player.isDucking) { ... }
  player.isDucking = false
} else if (keyIsDown(40)) { // Down arrow
  player.isDucking = true
} else {
  player.isDucking = false
}

// DESPUÉS:
if (keyIsDown(32) && player.onGround) { // Space
  player.vy = CONFIG.jumpForce
  player.onGround = false
}
```

#### 1.6 Renderizado del Player a Simplificar
```javascript
// LÍNEA 646, 748, 810, 822, 857: Eliminar lógica de duck sprites

// LÍNEA 810: Siempre usar run sprites
const spriteSet = player.sprites.run  // ❌ ELIMINAR: player.isDucking ? player.sprites.duck : player.sprites.run

// LÍNEA 822: Eliminar offset de duck
// ❌ ELIMINAR: const offsetX = player.isDucking ? -32.5 : 0

// LÍNEA 748 y 857: Eliminar hitbox offset de duck
// ❌ ELIMINAR: const playerHitboxOffsetX = player.isDucking ? -32.5 : 0
```

#### 1.7 Duck Sprites a Eliminar del Preload
```javascript
// LÍNEA ~260-280: Eliminar carga de duck sprites
function preload() {
  dinoSprites.run[0] = loadImage('./assets/dino-sprites/run_0.png', ...)
  dinoSprites.run[1] = loadImage('./assets/dino-sprites/run_1.png', ...)
  // ❌ ELIMINAR:
  // dinoSprites.duck[0] = loadImage('./assets/dino-sprites/duck_run_0.png', ...)
  // dinoSprites.duck[1] = loadImage('./assets/dino-sprites/duck_run_1.png', ...)
}

// LÍNEA 188-191: Simplificar estructura de sprites
let dinoSprites = {
  run: []   // ❌ ELIMINAR: duck: []
}
```

---

### 2. **Eliminar Pterodáctilos Voladores**

#### 2.1 Configuración de Patrones a Eliminar
```javascript
// LÍNEA 123-152: Eliminar configuración completa de pterodactyls
// ❌ ELIMINAR TODO EL BLOQUE:
pterodactylPatterns: [
  {
    name: 'LWSS_PHASE_2',
    type: 'flying',
    gridSize: { cols: 7, rows: 6 },
    pattern: PatternName.LIGHTWEIGHT_SPACESHIP,
    phase: 2,
    period: 4,
    gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
  },
  // ... otros 2 patrones
]
```

#### 2.2 Lógica de Spawn a Simplificar
```javascript
// LÍNEA 669-672: Eliminar lógica de spawn flying
// ❌ ELIMINAR:
const spawnFlying = random() < 0.3  // 30% chance of pterodactyl
const patternConfig = spawnFlying
  ? random(CONFIG.pterodactylPatterns)
  : random(CONFIG.obstaclePatterns)

// DESPUÉS (siempre ground obstacles):
const patternConfig = random(CONFIG.obstaclePatterns)
```

#### 2.3 Posicionamiento de Obstáculos a Simplificar
```javascript
// LÍNEA 677, 688-692: Eliminar modo flying del renderer
// ANTES:
mode: (patternConfig.type === 'still-life' || patternConfig.type === 'flying') ? RenderMode.STATIC : RenderMode.LOOP,

if (spawnFlying) {
  // Flying obstacles: High enough for ducking dino to pass underneath
  obstacleY = CONFIG.groundY - 120 - hitboxHeight
  // Bottom of pterodactyl should be at least 135px above ground (15px clearance)
}

// DESPUÉS:
mode: (patternConfig.type === 'still-life') ? RenderMode.STATIC : RenderMode.LOOP,
// ❌ ELIMINAR: Toda la lógica de obstacleY condicional
```

#### 2.4 Hitbox de Obstáculos a Simplificar
```javascript
// LÍNEA 699-705: Eliminar lógica de hitbox reducido para pterodactyls
// ANTES:
// Reduce hitbox for flying pterodactyls (KISS: 60% of visual size)
const hitboxScale = 0.7
const visualWidth = ...
const visualHeight = ...
const hitboxWidth = spawnFlying ? visualWidth * 0.6 : visualWidth * hitboxScale
const hitboxHeight = spawnFlying ? visualHeight * 0.6 : visualHeight * hitboxScale

// DESPUÉS (hitbox uniforme):
const hitboxScale = 0.7
const visualWidth = patternConfig.gridSize.cols * CONFIG.CELL_SIZE
const visualHeight = patternConfig.gridSize.rows * CONFIG.CELL_SIZE
const hitboxWidth = visualWidth * hitboxScale
const hitboxHeight = visualHeight * hitboxScale
```

#### 2.5 Metadata de Obstáculos a Limpiar
```javascript
// LÍNEA 718-729: Eliminar campos relacionados con flying
obstacles.push({
  x: canvasWidth,
  y: obstacleY,
  // ... otros campos
  type: patternConfig.type,  // ✅ MANTENER pero ya no tendrá 'flying'
  // ❌ ELIMINAR:
  isFlying: spawnFlying  // Track if this is a flying obstacle
})
```

#### 2.6 Comentarios a Actualizar
```javascript
// LÍNEA 559: Actualizar comentario
// ANTES: Update obstacles (Phase 3.4: GoL patterns + static pterodactyls)
// DESPUÉS: Update obstacles (Phase 3.4: GoL patterns only)

// LÍNEA 568: Actualizar comentario
// ANTES: Still lifes and flying pterodactyls are static
// DESPUÉS: Still lifes are static

// LÍNEA 669: Actualizar comentario
// ANTES: Phase 3.4: Randomly choose between ground obstacles and flying pterodactyls
// DESPUÉS: Phase 3.4: Randomly choose ground obstacle pattern

// LÍNEA 741, 860: Actualizar comentarios que mencionan pterodactyls
// ANTES: Use custom hitbox dimensions if available (for pterodactyls)
// DESPUÉS: Use custom hitbox dimensions if available
```

---

## 🗂️ Archivos a Modificar

### Archivo Principal
- `Web/games/dino-runner-mobile/game.js`

### Archivos de Assets a Eliminar (Opcional - Limpieza)
- `Web/games/dino-runner-mobile/assets/dino-sprites/duck_run_0.png`
- `Web/games/dino-runner-mobile/assets/dino-sprites/duck_run_1.png`

---

## ✅ Checklist de Implementación

### Fase 1: Simplificar Controles (Eliminar Duck)
- [ ] **1.1** Eliminar variables `touchStartTime` y `DUCK_THRESHOLD`
- [ ] **1.2** Eliminar `isDucking` del player state
- [ ] **1.3** Simplificar `handleTouchStart()` (eliminar registro de tiempo)
- [ ] **1.4** Simplificar `updatePlayer()` - lógica de touch a solo salto
- [ ] **1.5** Simplificar controles de teclado - eliminar flecha abajo
- [ ] **1.6** Simplificar renderizado del player:
  - [ ] Siempre usar `player.sprites.run`
  - [ ] Eliminar offset de duck en renderizado
  - [ ] Eliminar offset de duck en hitbox
- [ ] **1.7** Eliminar carga de duck sprites en `preload()`
- [ ] **1.8** Simplificar estructura `dinoSprites` (solo run)

### Fase 2: Eliminar Pterodáctilos
- [ ] **2.1** Eliminar `CONFIG.pterodactylPatterns` (líneas 123-152)
- [ ] **2.2** Simplificar lógica de spawn (eliminar `spawnFlying`)
- [ ] **2.3** Eliminar modo `flying` del renderer
- [ ] **2.4** Simplificar cálculo de hitbox (eliminar caso pterodactyl)
- [ ] **2.5** Eliminar campo `isFlying` de metadata de obstáculos
- [ ] **2.6** Actualizar comentarios que mencionan pterodactyls/flying

### Fase 3: Testing
- [ ] **3.1** Verificar que touch solo hace saltar
- [ ] **3.2** Verificar que no hay obstáculos voladores
- [ ] **3.3** Verificar que solo aparecen run sprites
- [ ] **3.4** Verificar colisiones funcionan correctamente
- [ ] **3.5** Testear en móvil real

### Fase 4: Deployment
- [ ] **4.1** Commit cambios en branch main (carpeta Web/)
- [ ] **4.2** Copiar a branch gh-pages
- [ ] **4.3** Push y verificar en GitHub Pages

---

## 📊 Impacto de los Cambios

### Líneas de Código Eliminadas: ~50-60 líneas
- Variables y constantes: 2 líneas
- Player state: 1 línea
- Touch handlers: 1 línea
- updatePlayer logic: ~15 líneas
- Keyboard logic: ~6 líneas
- Render logic: ~10 líneas
- Sprite preload: ~8 líneas
- Pterodactyl config: ~30 líneas
- Spawn logic: ~20 líneas
- Comentarios actualizados: ~5 líneas

### Líneas de Código Simplificadas: ~30 líneas
- Touch event handlers
- Player update logic
- Obstacle spawn logic
- Hitbox calculation
- Renderer mode selection

### Mejoras de UX
- ✅ Control más simple e intuitivo (solo tap para saltar)
- ✅ Menos frustración (no hay duck accidental por hold)
- ✅ Gameplay más directo y arcade
- ✅ Mejor para móvil (un solo gesto)

### Beneficios Técnicos
- ✅ Código más simple y mantenible
- ✅ Menos estados a gestionar
- ✅ Menos assets a cargar
- ✅ Lógica más predecible

---

## 🎮 Gameplay Resultante

**Control Final:**
- **Tap en pantalla** → Salta
- **Barra espaciadora** → Salta (desktop fallback)

**Obstáculos:**
- Solo obstáculos terrestres (still lifes y oscillators)
- Patrones: BLOCK, BEEHIVE, LOAF, BOAT, TUB, BLINKER, TOAD, BEACON
- Todos aparecen en el suelo
- Todos se esquivan saltando

**Experiencia:**
- Gameplay tipo Flappy Bird pero corriendo
- Una sola acción: timing del salto
- Perfecto para móvil portrait

---

## 🚀 Próximos Pasos

1. **Revisar este plan** con el usuario para confirmar
2. **Implementar Fase 1** (eliminar duck)
3. **Implementar Fase 2** (eliminar pterodactyls)
4. **Testing completo** en móvil
5. **Deploy a gh-pages**

---

## 📝 Notas Adicionales

### Touch Hints a Actualizar
Actualizar el texto del touch hint en `index.html`:

```html
<!-- ANTES -->
<div id="touch-hint">Tap rápido = saltar | Mantener = agacharse</div>

<!-- DESPUÉS -->
<div id="touch-hint">Tap para saltar</div>
```

### README a Actualizar
Actualizar la sección de controles en `README.md`:

```markdown
## Controls

### Mobile (Touch)
- **Tap screen**: Jump

### Desktop (Fallback)
- **Space**: Jump
```

---

**Estimación de tiempo:** 30-45 minutos
**Complejidad:** Baja (principalmente eliminar código existente)
**Riesgo:** Muy bajo (cambios aislados y bien definidos)
