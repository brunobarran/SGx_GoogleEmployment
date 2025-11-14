# Propuesta: HTML Automático para LLM Generator
## Date: 2025-11-12

---

## 🎯 Problema Identificado

Actualmente el LLM genera **2 archivos**:
1. `games/your-game.js` (código del juego, ~300-500 líneas)
2. `games/your-game.html` (wrapper HTML, ~20 líneas)

**El HTML es 99% idéntico en todos los juegos:**

```html
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Game - Game of Life Arcade</title>  <!-- ⬅️ ÚNICO CAMBIO #1 -->
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Google Sans', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>
  <script type="module" src="/games/your-game.js"></script>  <!-- ⬅️ ÚNICO CAMBIO #2 -->
</body>
</html>
```

**Variables:** Solo título y path del script

---

## ✅ Propuesta: Generación Automática

### Opción A: Generación Server-Side (Recomendada)

**Implementación:**

```javascript
// server/generate-html.js
export function generateGameHTML(gameName, gameTitle) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${gameTitle} - Game of Life Arcade</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Google Sans', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>
  <script type="module" src="/games/${gameName}.js"></script>
</body>
</html>`
}
```

**Uso en LLM Generator Web App:**

```javascript
// Frontend: User requests "Snake game"
const response = await fetch('/api/generate-game', {
  method: 'POST',
  body: JSON.stringify({
    prompt: "Create a Snake game...",
    framework: frameworkDocs
  })
})

const data = await response.json()
// data.js = "// Generated game code..."
// data.gameName = "snake"
// data.gameTitle = "Snake"

// Backend generates HTML automatically
const html = generateGameHTML(data.gameName, data.gameTitle)

// Return both files
return {
  files: [
    { name: 'snake.js', content: data.js },
    { name: 'snake.html', content: html }
  ]
}
```

---

### Opción B: Generación Client-Side (Más simple)

**Implementación:**

```javascript
// Frontend en LLM Generator
function downloadGame(gameCode, gameName, gameTitle) {
  // Generate JS file
  const jsBlob = new Blob([gameCode], { type: 'text/javascript' })
  downloadFile(jsBlob, `${gameName}.js`)

  // Generate HTML automatically
  const html = generateGameHTML(gameName, gameTitle)
  const htmlBlob = new Blob([html], { type: 'text/html' })
  downloadFile(htmlBlob, `${gameName}.html`)
}
```

---

### Opción C: Template HTML Único (Desarrollo local)

Para desarrollo local, crear un template único:

```html
<!-- games/game-template.html -->
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Game Template</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #000;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      font-family: 'Google Sans', Arial, sans-serif;
    }
  </style>
</head>
<body>
  <script src="https://cdn.jsdelivr.net/npm/p5@1.7.0/lib/p5.min.js"></script>
  <!-- Dynamic script loading based on URL -->
  <script type="module">
    // Extract game name from URL: /games/snake.html → snake
    const path = window.location.pathname
    const gameName = path.split('/').pop().replace('.html', '')

    // Load game script dynamically
    import(`/games/${gameName}.js`)
  </script>
</body>
</html>
```

Luego copiar para cada juego con solo cambiar el título.

---

## 📊 Comparación de Opciones

| Aspecto | A: Server-Side | B: Client-Side | C: Template |
|---------|---------------|----------------|-------------|
| **Setup** | Requiere backend | Solo frontend | Solo template |
| **LLM Tokens** | ✅ Ahorra ~200 tokens | ✅ Ahorra ~200 tokens | ⚠️ LLM genera HTML |
| **Flexibilidad** | ✅ Alta | ✅ Alta | ⚠️ Manual |
| **Mantenimiento** | ✅ Un solo lugar | ✅ Un solo lugar | ❌ Múltiples archivos |
| **Deploy** | ⚠️ Necesita server | ✅ Static site | ✅ Static site |
| **Errores LLM** | ✅ 0% (generado) | ✅ 0% (generado) | ⚠️ Posibles |

---

## 💰 Análisis de Tokens

### Tokens Actuales (HTML en prompt):

```
Prompt actual:
- Framework docs: ~12,000 tokens
- Game request: ~500 tokens
- HTML template example: ~200 tokens
- Output instructions: ~300 tokens
TOTAL: ~13,000 tokens

LLM Output:
- Game JS: ~3,000 tokens
- Game HTML: ~200 tokens
TOTAL OUTPUT: ~3,200 tokens

TOTAL REQUEST: ~16,200 tokens
```

### Tokens con HTML Automático:

```
Nuevo Prompt:
- Framework docs: ~12,000 tokens
- Game request: ~500 tokens
- Output instructions: ~300 tokens
TOTAL: ~12,800 tokens

LLM Output:
- Game JS only: ~3,000 tokens
TOTAL OUTPUT: ~3,000 tokens

TOTAL REQUEST: ~15,800 tokens

AHORRO: ~400 tokens (2.5%)
```

**Costo por request:**
- Claude Sonnet: ~$3 per 1M input tokens
- Ahorro: 400 tokens × $3/1M = $0.0012 por juego
- En 1000 juegos generados: **$1.20 ahorrados**

**Pero el beneficio real NO es el costo, es:**
- ✅ **0% errores en HTML** (antes LLM podía meter bugs)
- ✅ **Prompt más simple** para el LLM
- ✅ **Enfoque en lógica** del juego, no en wrapper

---

## ✅ Recomendación

**Para el LLM Generator Web App: OPCIÓN A (Server-Side)**

**Razones:**
1. **0% errores en HTML** - Generado, no LLM
2. **Prompt más limpio** - Solo pedir el JS
3. **Fácil mantenimiento** - Cambiar template en un lugar
4. **Título automático** - Extraído del prompt o metadata
5. **Escalable** - Agregar meta tags, analytics, etc. fácilmente

**Implementación recomendada:**

```javascript
// Backend API endpoint
app.post('/api/generate-game', async (req, res) => {
  const { prompt, framework } = req.body

  // Call Claude API with ONLY JS generation
  const llmPrompt = `${framework}

${prompt}

Generate ONLY the JavaScript file (games/your-game.js).
DO NOT generate HTML - it will be created automatically.`

  const gameJS = await callClaudeAPI(llmPrompt)

  // Extract game name and title from prompt or code
  const gameName = extractGameName(prompt) // e.g., "snake"
  const gameTitle = extractGameTitle(prompt) // e.g., "Snake"

  // Generate HTML automatically
  const gameHTML = generateGameHTML(gameName, gameTitle)

  return res.json({
    files: [
      { name: `${gameName}.js`, content: gameJS },
      { name: `${gameName}.html`, content: gameHTML }
    ]
  })
})
```

---

## 📝 Actualización del Prompt

**Antes (request HTML + JS):**
```markdown
## Output Instructions

Generate TWO files exactly as shown below...

### File 1: games/snake.js
[JavaScript code]

### File 2: games/snake.html
[HTML code]
```

**Después (solo JS):**
```markdown
## Output Instructions

Generate the complete JavaScript game file ONLY.

The HTML wrapper will be created automatically, so do NOT generate it.

### Output Format:

Return ONLY the complete JavaScript code for games/your-game.js

Begin your code immediately with the imports:

```javascript
// ===== IMPORTS =====
import { GoLEngine } from '../src/core/GoLEngine.js'
...
[REST OF CODE]
```

No explanations, no HTML, ONLY the JavaScript file.
```

---

## 🎯 Beneficios Finales

### Para el LLM:
- ✅ Prompt más simple (solo una tarea)
- ✅ Menos distracciones
- ✅ Enfoque en lógica del juego

### Para el Developer:
- ✅ 0% errores en HTML
- ✅ Mantenimiento centralizado
- ✅ Fácil agregar features (analytics, meta tags, PWA manifest)

### Para el Usuario:
- ✅ Descarga 2 archivos (igual que antes)
- ✅ HTML siempre correcto
- ✅ Experiencia consistente

---

## 🚀 Plan de Implementación

### Fase 1: Update Prompt (inmediato)
1. Modificar `prompts/test-llm-snake-game.md`
2. Quitar sección de HTML
3. Simplificar output instructions

### Fase 2: Server Function (LLM Generator Web App)
1. Crear `generateGameHTML(name, title)` function
2. Agregar a API endpoint
3. Testear con juegos existentes

### Fase 3: Validation (antes de deploy)
1. Generar 5 juegos de prueba
2. Verificar HTML correcto en todos
3. Verificar JS funciona en todos

---

## ✅ Conclusión

**SÍ, deberíamos generar el HTML automáticamente.**

**Razones principales:**
1. El HTML es 99% idéntico (solo título y script path)
2. Reduce complejidad del prompt
3. Elimina posibles errores del LLM
4. Facilita mantenimiento futuro
5. Permite agregar features globales fácilmente

**Siguiente paso:**
Actualizar el prompt de test para solo pedir el JS y validar que funciona igual de bien (o mejor).

---

_Propuesta: 2025-11-12_
_Status: Pendiente de aprobación_
_Impacto: Alto (mejora significativa)_
