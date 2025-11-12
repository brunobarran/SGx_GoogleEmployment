/**
 * Game Template for Vibe Coding - Game of Life Arcade
 *
 * Purpose: Starting point for LLM-generated games
 * Philosophy: Simple, self-contained, GoL visuals on entities only
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from '../core/GoLEngine.js'
import { Patterns } from '../utils/Patterns.js'

// ============================================
// GAME CONFIGURATION
// ============================================
const CONFIG = {
  // Canvas
  width: 800,
  height: 600,

  // Google Brand UI
  ui: {
    backgroundColor: '#FFFFFF',  // Clean white background (NO GoL background)
    textColor: '#5f6368',        // Google Gray 700
    accentColor: '#1a73e8',      // Google Blue
    font: 'Google Sans, Arial, sans-serif',
    fontSize: 16,
    titleSize: 48
  },

  // Physics (if needed)
  gravity: 0.6,
  groundY: 550
}

// Google Brand Colors (use these for entity colors)
const GOOGLE_COLORS = {
  BLUE: { r: 49, g: 134, b: 255 },
  RED: { r: 252, g: 65, b: 61 },
  GREEN: { r: 0, g: 175, b: 87 },
  YELLOW: { r: 255, g: 204, b: 0 }
}

// ============================================
// GAME STATE
// ============================================
const state = {
  score: 0,
  lives: 3,
  level: 1,
  phase: 'MENU',  // MENU, PLAYING, PAUSED, GAMEOVER, WIN
  frameCount: 0
}

// ============================================
// ENTITIES
// ============================================
// Replace these with your game objects
// Each entity can have a GoL engine for visual

let player = {
  x: 100,
  y: 400,
  width: 40,
  height: 40,
  vx: 0,
  vy: 0,

  // GoL visual (OPTIONAL - add if needed)
  gol: null,  // Will be GoLEngine instance if visual is GoL-based

  // Example: Initialize with GoL
  // gol: new GoLEngine(20, 20, 12)  // 20x20 grid, 12fps updates
}

let enemies = []
let bullets = []
let particles = []

// ============================================
// SETUP (p5.js)
// ============================================
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)

  // Initialize game
  initGame()
}

function initGame() {
  // Reset state
  state.score = 0
  state.lives = 3
  state.level = 1
  state.frameCount = 0

  // Initialize entities
  setupPlayer()
  setupEnemies()

  // Start game
  state.phase = 'PLAYING'
}

function setupPlayer() {
  // Example: Player with GoL visual
  player = {
    x: 100,
    y: 400,
    width: 40,
    height: 40,
    vx: 0,
    vy: 0,

    // GoL visual (Modified strategy with life force)
    gol: new GoLEngine(13, 13, 12),  // 13x13 cells, 12fps
    cellSize: 3,  // Each cell is 3x3 pixels
    color: GOOGLE_COLORS.BLUE  // Use Google brand colors
  }

  // Option 1: Single pattern
  player.gol.setPattern(Patterns.BLINKER, 5, 5)

  // Option 2: Multiple patterns for complex shapes (comment out Option 1 if using this)
  // player.gol.setPattern(Patterns.BEACON, 1, 1)   // Body
  // player.gol.setPattern(Patterns.BLOCK, 8, 2)    // Head
  // player.gol.setPattern(Patterns.BLINKER, 2, 8)  // Leg 1
  // player.gol.setPattern(Patterns.BLINKER, 7, 8)  // Leg 2

  // Option 3: Random seed
  // player.gol.randomSeed(0.4)
}

function setupEnemies() {
  // Example: Spawn enemies with varied GoL patterns and colors
  // TODO: Replace with your enemy logic

  /* Example with variety:
  const enemyPatterns = [
    { pattern: Patterns.BEEHIVE, color: GOOGLE_COLORS.RED, scoreValue: 10 },
    { pattern: Patterns.LOAF, color: GOOGLE_COLORS.GREEN, scoreValue: 15 },
    { pattern: Patterns.BOAT, color: GOOGLE_COLORS.YELLOW, scoreValue: 20 }
  ]

  for (let i = 0; i < 3; i++) {
    const info = enemyPatterns[i]
    const enemy = {
      x: 200 + i * 100,
      y: 100,
      width: 30,
      height: 30,
      gol: new GoLEngine(10, 10, 15),
      cellSize: 3,
      color: info.color,
      scoreValue: info.scoreValue,
      dead: false
    }
    enemy.gol.setPattern(info.pattern, 2, 2)
    enemies.push(enemy)
  }
  */
}

// ============================================
// UPDATE LOOP (60fps)
// ============================================
function draw() {
  state.frameCount++

  // Clear screen with clean background
  background(CONFIG.ui.backgroundColor)

  // Update and render based on phase
  switch (state.phase) {
    case 'MENU':
      updateMenu()
      renderMenu()
      break

    case 'PLAYING':
      updateGame()
      renderGame()
      renderUI()
      break

    case 'PAUSED':
      renderGame()
      renderUI()
      renderPaused()
      break

    case 'GAMEOVER':
      renderGame()
      renderGameOver()
      break

    case 'WIN':
      renderGame()
      renderWin()
      break
  }
}

// ============================================
// GAME UPDATE
// ============================================
function updateGame() {
  // Update player
  updatePlayer()

  // Update enemies
  enemies.forEach(enemy => updateEnemy(enemy))

  // Update bullets
  bullets.forEach(bullet => updateBullet(bullet))

  // Update particles
  particles.forEach(particle => updateParticle(particle))

  // Remove dead entities
  enemies = enemies.filter(e => !e.dead)
  bullets = bullets.filter(b => !b.dead)
  particles = particles.filter(p => !p.dead)

  // Check collisions
  checkCollisions()

  // Game-specific logic
  gameLogic()
}

function updatePlayer() {
  // Update GoL visual (Modified GoL with life force)
  if (player.gol) {
    player.gol.updateThrottled(state.frameCount)  // Respects updateRate (10-15fps)
    applyLifeForce(player)  // Keep player visually stable
  }

  // Physics
  player.vy += CONFIG.gravity
  player.y += player.vy
  player.x += player.vx

  // Ground collision
  if (player.y > CONFIG.groundY) {
    player.y = CONFIG.groundY
    player.vy = 0
  }

  // TODO: Add your player logic
}

function updateEnemy(enemy) {
  // Choose GoL strategy based on enemy type
  if (enemy.gol) {
    if (enemy.golStrategy === 'modified') {
      // Modified GoL: for bosses, large enemies
      enemy.gol.updateThrottled(state.frameCount)
      applyLifeForce(enemy)
    } else if (enemy.golStrategy === 'visualOnly') {
      // Visual Only: for small obstacles, predictable enemies
      // DON'T call update() - just maintain appearance
      if (state.frameCount % 10 === 0) {
        maintainDensity(enemy, 0.65)
      }
    } else {
      // Pure GoL: for special enemies with natural evolution
      enemy.gol.updateThrottled(state.frameCount)
    }
  }

  // Movement
  enemy.x += enemy.vx
  enemy.y += enemy.vy

  // TODO: Add your enemy logic
}

function updateBullet(bullet) {
  // Bullets usually use Visual Only (predictable appearance)
  if (bullet.gol) {
    // DON'T evolve - just maintain density
    if (state.frameCount % 5 === 0) {
      maintainDensity(bullet, 0.7)
    }
  }

  // Movement
  bullet.x += bullet.vx
  bullet.y += bullet.vy

  // Lifetime
  bullet.age++
  if (bullet.age > bullet.lifetime) {
    bullet.dead = true
  }

  // Off-screen
  if (bullet.x < 0 || bullet.x > width || bullet.y < 0 || bullet.y > height) {
    bullet.dead = true
  }
}

function updateParticle(particle) {
  // Particles use Pure GoL (explosions, effects)
  if (particle.gol) {
    particle.gol.updateThrottled(state.frameCount)  // Natural evolution for wow factor
  }

  particle.x += particle.vx
  particle.y += particle.vy
  particle.alpha -= 2

  if (particle.alpha <= 0) {
    particle.dead = true
  }
}

function checkCollisions() {
  // TODO: Implement collision detection
  // Example: Player vs enemies
  enemies.forEach(enemy => {
    if (collideCircleCircle(
      player.x, player.y, player.width/2,
      enemy.x, enemy.y, enemy.width/2
    )) {
      // Handle collision
      state.lives--
      if (state.lives <= 0) {
        state.phase = 'GAMEOVER'
      }
    }
  })
}

function gameLogic() {
  // TODO: Game-specific logic
  // - Spawn enemies
  // - Update score
  // - Check win/lose conditions
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  // Render player
  renderEntity(player)

  // Render enemies
  enemies.forEach(enemy => renderEntity(enemy))

  // Render bullets
  bullets.forEach(bullet => renderEntity(bullet))

  // Render particles
  particles.forEach(particle => renderEntity(particle))
}

function renderEntity(entity) {
  if (entity.gol) {
    // Render GoL cells
    renderGoLCells(entity)
  } else {
    // Fallback: simple rectangle
    fill(CONFIG.ui.accentColor)
    noStroke()
    rect(entity.x, entity.y, entity.width, entity.height)
  }
}

function renderGoLCells(entity) {
  const grid = entity.gol.current
  const cellSize = entity.cellSize || 3

  // Use entity color (format: {r, g, b}) or default to accent color
  if (entity.color) {
    fill(entity.color.r, entity.color.g, entity.color.b)
  } else {
    fill(CONFIG.ui.accentColor)
  }
  noStroke()

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        rect(
          entity.x + x * cellSize,
          entity.y + y * cellSize,
          cellSize,
          cellSize
        )
      }
    }
  }
}

function renderUI() {
  // Standard UI (REQUIRED for consistency)
  fill(CONFIG.ui.textColor)
  textFont(CONFIG.ui.font)
  textSize(CONFIG.ui.fontSize)
  textAlign(LEFT, TOP)

  text(`SCORE: ${state.score}`, 20, 20)
  text(`LIVES: ${state.lives}`, 20, 45)
  text(`LEVEL: ${state.level}`, 20, 70)
}

// ============================================
// MENU SCREENS
// ============================================
function updateMenu() {
  // Check for start input
  if (keyIsDown(32)) {  // SPACE
    state.phase = 'PLAYING'
  }
}

function renderMenu() {
  fill(CONFIG.ui.textColor)
  textAlign(CENTER, CENTER)

  textSize(CONFIG.ui.titleSize)
  text('GAME TITLE', width/2, height/2 - 80)

  textSize(CONFIG.ui.fontSize)
  text('Press SPACE to start', width/2, height/2 + 40)
  text('Arrow keys to move', width/2, height/2 + 70)
}

function renderPaused() {
  // Semi-transparent overlay
  fill(0, 0, 0, 150)
  rect(0, 0, width, height)

  fill(255)
  textAlign(CENTER, CENTER)
  textSize(CONFIG.ui.titleSize)
  text('PAUSED', width/2, height/2)

  textSize(CONFIG.ui.fontSize)
  text('Press P to resume', width/2, height/2 + 60)
}

function renderGameOver() {
  // Semi-transparent overlay
  fill(0, 0, 0, 150)
  rect(0, 0, width, height)

  fill(255)
  textAlign(CENTER, CENTER)
  textSize(CONFIG.ui.titleSize)
  text('GAME OVER', width/2, height/2 - 40)

  textSize(CONFIG.ui.fontSize * 1.5)
  text(`Final Score: ${state.score}`, width/2, height/2 + 40)

  textSize(CONFIG.ui.fontSize)
  text('Press SPACE to restart', width/2, height/2 + 100)
}

function renderWin() {
  fill(CONFIG.ui.accentColor)
  textAlign(CENTER, CENTER)
  textSize(CONFIG.ui.titleSize)
  text('YOU WIN!', width/2, height/2 - 40)

  textSize(CONFIG.ui.fontSize * 1.5)
  text(`Score: ${state.score}`, width/2, height/2 + 40)

  textSize(CONFIG.ui.fontSize)
  text('Press SPACE to play again', width/2, height/2 + 100)
}

// ============================================
// INPUT HANDLING
// ============================================
function keyPressed() {
  if (key === ' ' && (state.phase === 'GAMEOVER' || state.phase === 'WIN')) {
    initGame()
  }

  if (key === 'p' || key === 'P') {
    if (state.phase === 'PLAYING') {
      state.phase = 'PAUSED'
    } else if (state.phase === 'PAUSED') {
      state.phase = 'PLAYING'
    }
  }

  // TODO: Add your input handling
}

// ============================================
// GOL STRATEGY GUIDE
// ============================================
/**
 * Choose the right GoL strategy for each entity:
 *
 * 1. PURE GoL (100% authentic B3/S23):
 *    - Explosions, particle effects, powerups
 *    - Example: spawnExplosion() - particles with R-pentomino
 *    - Update: call updateThrottled() normally
 *
 * 2. MODIFIED GoL (80% authentic with life force):
 *    - Player, bosses, important characters
 *    - Example: player with applyLifeForce()
 *    - Update: call updateThrottled() + applyLifeForce()
 *
 * 3. VISUAL ONLY GoL (0% authentic):
 *    - Small obstacles, bullets, predictable enemies
 *    - Example: cactus in dino runner
 *    - Update: DON'T call update(), use maintainDensity()
 *
 * Rule of thumb:
 * - If it MUST be predictable → Visual Only
 * - If it's critical to gameplay → Modified GoL
 * - If it's just visual flair → Pure GoL
 */

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Apply life force to entity (Modified GoL strategy).
 * Keeps entity visually stable by maintaining minimum cell density.
 *
 * Use for: Player, bosses, important NPCs
 * Don't use for: Bullets, small obstacles (use Visual Only instead)
 *
 * @param {object} entity - Entity with gol property
 */
function applyLifeForce(entity) {
  if (!entity.gol) return

  const engine = entity.gol

  // Strategy: Maintain overall density (recommended for most entities)
  const totalCells = engine.cols * engine.rows
  const aliveCount = engine.countAliveCells()
  const density = aliveCount / totalCells

  // Maintain at least 35% density
  if (density < 0.35) {
    const cellsToInject = Math.floor(totalCells * 0.15)  // Inject 15%
    for (let i = 0; i < cellsToInject; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 1)
    }
  }
}

/**
 * Maintain cell density without GoL evolution (Visual Only strategy).
 * Use for small obstacles, bullets, or entities that need predictable appearance.
 *
 * Visual Only = NO evolution, just maintain visual presence
 *
 * @param {object} entity - Entity with gol property
 * @param {number} targetDensity - Target density (0-1, default: 0.6)
 *
 * @example
 * // For obstacles that should NOT evolve:
 * obstacles.forEach(obs => {
 *   // DON'T call obs.gol.update() or updateThrottled()
 *   maintainDensity(obs, 0.6)  // Keep 60% of cells alive
 * })
 */
function maintainDensity(entity, targetDensity = 0.6) {
  if (!entity.gol) return

  const engine = entity.gol
  const totalCells = engine.cols * engine.rows
  const aliveCount = engine.countAliveCells()
  const currentDensity = aliveCount / totalCells

  // If density too low, revive random cells
  if (currentDensity < targetDensity) {
    const cellsToRevive = Math.floor(totalCells * (targetDensity - currentDensity))
    for (let i = 0; i < cellsToRevive; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 1)
    }
  }

  // Optional: If density too high, kill random cells
  if (currentDensity > targetDensity + 0.1) {
    const cellsToKill = Math.floor(totalCells * (currentDensity - targetDensity))
    for (let i = 0; i < cellsToKill; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 0)
    }
  }
}

/**
 * Spawn explosion particles (Pure GoL)
 */
function spawnExplosion(x, y, count = 5) {
  for (let i = 0; i < count; i++) {
    const particle = {
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255,
      dead: false,

      // Pure GoL (Methuselah pattern)
      gol: new GoLEngine(8, 8, 30),
      cellSize: 2,
      color: GOOGLE_COLORS.YELLOW  // Use Google brand colors
    }

    // Seed with random or pattern
    particle.gol.randomSeed(0.5)
    // OR: particle.gol.setPattern(Patterns.R_PENTOMINO, 0, 0)

    particles.push(particle)
  }
}

/**
 * Circle-circle collision detection
 */
function collideCircleCircle(x1, y1, r1, x2, y2, r2) {
  const dx = x2 - x1
  const dy = y2 - y1
  const dist = Math.sqrt(dx*dx + dy*dy)
  return dist < (r1 + r2)
}

/**
 * Rectangle-rectangle collision detection (AABB)
 */
function collideRectRect(x1, y1, w1, h1, x2, y2, w2, h2) {
  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  )
}

// ============================================
// EXPORT FOR p5.js
// ============================================
// p5.js will automatically use setup() and draw()
