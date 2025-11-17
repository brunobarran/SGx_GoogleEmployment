/**
 * Space Invaders with Simple Gradients (KISS)
 * Demonstration of simple gradient system with GoL masks
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from '../src/utils/UIHelpers.js'

// ============================================
// GAME CONFIGURATION - BASE REFERENCE (10:16 ratio)
// All values are proportional to 1200×1920 reference resolution
// ============================================
const BASE_WIDTH = 1200
const BASE_HEIGHT = 1920
const ASPECT_RATIO = BASE_WIDTH / BASE_HEIGHT  // 10:16 = 0.625

const CONFIG = {
  width: 1200,   // Will be updated dynamically
  height: 1920,  // Will be updated dynamically

  ui: {
    backgroundColor: '#FFFFFF',
    textColor: '#5f6368',
    accentColor: '#1a73e8',
    font: 'Google Sans, Arial, sans-serif',
    fontSize: 16
  },

  invader: {
    cols: 4,      // 4 columns for balanced grid layout
    rows: 4,      // 4 rows
    width: 180,   // 6 cells × 30px (scaled 3x from 60px)
    height: 180,  // 6 cells × 30px
    spacing: 60,  // Unified spacing: 60px (same as Breakout padding)
    startX: 180,  // Same as Breakout offsetX for visual consistency
    startY: 200,  // Same as Breakout offsetY - unified starting position
    moveInterval: 30,
    speed: 45,    // 15 × 3 = 45
    cellSize: 30  // Scaled to 30px (3x from 10px baseline)
  },

  player: {
    width: 180,   // 6 cells × 30px (scaled 3x from 60px)
    height: 180,  // 6 cells × 30px
    cellSize: 30, // Scaled to 30px (3x from 10px baseline)
    speed: 18,    // 6 × 3 = 18
    shootCooldown: 15
  },

  bullet: {
    width: 90,    // 3 cells × 30px (scaled 3x from 30px)
    height: 90,   // 3 cells × 30px
    cellSize: 30, // Scaled to 30px (3x from 10px baseline)
    speed: 12     // Bullet vertical speed (negative = upward)
  },

  explosion: {
    width: 180,   // 6 cells × 30px (scaled 3x from 60px)
    height: 180,  // 6 cells × 30px
    cellSize: 30  // Scaled to 30px (3x from 10px baseline)
  },

  background: {
    updateRate: 10  // Background GoL update rate (fps)
  }
}

// Store scale factor for rendering (don't modify CONFIG values)
let scaleFactor = 1
let canvasWidth = BASE_WIDTH
let canvasHeight = BASE_HEIGHT

// ============================================
// GAME OVER CONFIGURATION
// ============================================
const GAMEOVER_CONFIG = {
  MIN_DELAY: 30,   // 0.5s minimum feedback (30 frames at 60fps)
  MAX_WAIT: 150    // 2.5s maximum wait (150 frames at 60fps)
}

// ============================================
// GAME STATE
// ============================================
const state = {
  score: 0,
  lives: 1,
  level: 1,
  phase: 'PLAYING',
  frameCount: 0,
  invaderDirection: 1,
  invaderMoveTimer: 0,
  playerShootCooldown: 0,
  dyingTimer: 0
}

// ============================================
// ENTITIES
// ============================================
let player = null
let invaders = []
let bullets = []
let particles = []

// Simple gradient renderer
let maskedRenderer = null

// ============================================
// RESPONSIVE CANVAS HELPERS
// ============================================
function calculateResponsiveSize() {
  // Use window height as reference, calculate width maintaining 10:16 aspect ratio
  const canvasHeight = windowHeight
  const canvasWidth = canvasHeight * ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size, don't modify CONFIG values
  scaleFactor = canvasHeight / BASE_HEIGHT
}

// ============================================
// p5.js SETUP
// ============================================
function setup() {
  // Calculate responsive canvas size
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height

  // Update scale factor (CONFIG values stay at base resolution)
  updateConfigScale()

  createCanvas(canvasWidth, canvasHeight)
  frameRate(60)

  // Create simple gradient renderer (KISS)
  maskedRenderer = new SimpleGradientRenderer(this)

  // Debug interface initialization (Phase 1)
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.get('debug') === 'true') {
    import('/src/debug/DebugInterface.js').then(module => {
      // Inject CSS
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = '/src/debug/debug-styles.css'
      document.head.appendChild(link)

      // Initialize debug interface with callbacks
      module.initDebugInterface(CONFIG, 'space-invaders', {
        onInvadersChange: () => {
          // Recreate invaders when any invader property changes
          invaders = []
          setupInvaders()
        },
        onPlayerChange: () => {
          // Recreate player when player properties change
          setupPlayer()
        },
        onBulletSpeedChange: () => {
          // Bullet speed is stored in CONFIG.bullet.speed
          // No action needed - bullets read from CONFIG each frame
          console.log('[SpaceInvaders] Bullet speed updated (live)')
        }
      })
    }).catch(err => {
      console.error('[SpaceInvaders] Failed to load debug interface:', err)
    })
  }

  initGame()
}

function initGame() {
  state.score = 0
  state.lives = 1
  state.level = 1
  state.frameCount = 0
  state.invaderDirection = 1
  invaders = []
  bullets = []
  particles = []

  setupPlayer()
  setupInvaders()
}

function setupPlayer() {
  // Calculate size from cellSize (6x6 grid)
  const playerSize = 6 * CONFIG.player.cellSize

  player = {
    x: CONFIG.width / 2 - playerSize / 2,
    y: CONFIG.height - 200,  // Adjusted for portrait
    width: playerSize,  // Calculated: 6 cells × cellSize
    height: playerSize, // Calculated: 6 cells × cellSize
    vx: 0,
    cellSize: CONFIG.player.cellSize,

    // GoL engine - 6x6 grid
    gol: new GoLEngine(6, 6, 12),

    // Gradient configuration
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density: denser in center, very sparse at edges
  seedRadialDensity(player.gol, 0.85, 0.0)

  // Add accent pattern (smaller grid, adjusted position)
  player.gol.setPattern(Patterns.BLINKER, 2, 2)
}

function setupInvaders() {
  const { cols, rows, spacing, startX, startY, cellSize } = CONFIG.invader

  // Calculate size from cellSize (6x6 grid)
  const invaderSize = 6 * cellSize

  console.log('Setting up invaders:', { cols, rows, cellSize, size: invaderSize })

  // Array of organic patterns for variety
  const organicPatterns = [
    { main: Patterns.PULSAR, accent: Patterns.BEACON },
    { main: Patterns.LIGHTWEIGHT_SPACESHIP, accent: Patterns.GLIDER },
    { main: Patterns.TOAD, accent: Patterns.BLINKER },
    { main: Patterns.BEACON, accent: Patterns.SHIP },
    { main: Patterns.POND, accent: Patterns.BOAT },
    { main: Patterns.R_PENTOMINO, accent: Patterns.TUB }
  ]

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const invader = {
        x: startX + col * (invaderSize + spacing),
        y: startY + row * (invaderSize + spacing),
        width: invaderSize,   // Calculated: 6 cells × cellSize
        height: invaderSize,  // Calculated: 6 cells × cellSize
        cellSize,
        dead: false,

        // GoL engine - 6x6 grid
        gol: new GoLEngine(6, 6, 15),

        // Assign gradient based on row
        gradient: row % 3 === 0 ? GRADIENT_PRESETS.ENEMY_HOT :
                  row % 3 === 1 ? GRADIENT_PRESETS.ENEMY_COLD :
                  GRADIENT_PRESETS.ENEMY_RAINBOW
      }

      // Seed with radial density for organic edges (no cells at edges)
      seedRadialDensity(invader.gol, 0.75, 0.0)

      // Pick random accent pattern (smaller grid, adjusted position)
      const patternSet = organicPatterns[Math.floor(Math.random() * organicPatterns.length)]
      invader.gol.setPattern(patternSet.accent, 2, 2)

      invaders.push(invader)
    }
  }

  console.log('Invaders created:', invaders.length)
}

// ============================================
// UPDATE LOOP
// ============================================
function draw() {
  state.frameCount++

  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    // Continue updating particles during death animation
    state.dyingTimer++
    updateParticlesLocal()

    // Transition to GAMEOVER when particles done or timeout reached
    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'

      // Send postMessage to parent if in installation
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'gameOver',
          payload: { score: state.score }
        }, '*')
      }
    }
  }

  renderGame()
  renderUI()

  // Update gradient animations
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    // Only show Game Over screen in standalone mode
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

function updateGame() {
  updatePlayer()
  updateInvaders()
  updateBullets()
  updateParticlesLocal()
  checkCollisions()
  checkWinLose()
}

function updatePlayer() {
  // Movement
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {
    player.vx = -CONFIG.player.speed
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {
    player.vx = CONFIG.player.speed
  } else {
    player.vx = 0
  }

  player.x += player.vx
  player.x = Collision.clamp(player.x, 0, CONFIG.width - player.width)

  // Shoot
  if ((keyIsDown(32) || keyIsDown(90)) && state.playerShootCooldown === 0) {
    shootBullet()
    state.playerShootCooldown = CONFIG.player.shootCooldown
  }

  // Update GoL
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)

  // Cooldown
  if (state.playerShootCooldown > 0) {
    state.playerShootCooldown--
  }
}

function updateInvaders() {
  state.invaderMoveTimer++

  if (state.invaderMoveTimer >= CONFIG.invader.moveInterval) {
    moveInvaders()
    state.invaderMoveTimer = 0
  }

  invaders.forEach(inv => {
    inv.gol.updateThrottled(state.frameCount)
    applyLifeForce(inv)
  })
}

function updateBullets() {
  bullets.forEach(bullet => {
    bullet.y += bullet.vy

    // Visual Only: maintain density
    if (state.frameCount % 5 === 0) {
      maintainDensity(bullet, 0.75)
    }

    // Off screen - use CONFIG.height (base coordinates) not canvas height
    if (bullet.y < 0 || bullet.y > CONFIG.height) {
      bullet.dead = true
    }
  })

  bullets = bullets.filter(b => !b.dead)
}

function updateParticlesLocal() {
  particles = updateParticles(particles, state.frameCount)
}

function moveInvaders() {
  const hitEdge = invaders.some(inv =>
    (state.invaderDirection > 0 && inv.x > CONFIG.width - 240) ||  // Scaled: 80 × 3 = 240
    (state.invaderDirection < 0 && inv.x < 150)  // Scaled: 50 × 3 = 150
  )

  if (hitEdge) {
    invaders.forEach(inv => inv.y += 60)  // Scaled: 20 × 3 = 60
    state.invaderDirection *= -1

    if (invaders.some(inv => inv.y > CONFIG.height - 450)) {  // Scaled: 150 × 3 = 450
      state.lives = 0
    }
  } else {
    invaders.forEach(inv => inv.x += state.invaderDirection * CONFIG.invader.speed)
  }
}

function shootBullet() {
  // Calculate size from cellSize (3×3 grid)
  const bulletSize = 3 * CONFIG.bullet.cellSize

  const bullet = {
    x: player.x + player.width / 2 - bulletSize / 2,
    y: player.y - bulletSize,
    width: bulletSize,   // Calculated: 3 cells × cellSize
    height: bulletSize,  // Calculated: 3 cells × cellSize
    vy: -CONFIG.bullet.speed,  // Use CONFIG value (negative = upward)
    cellSize: CONFIG.bullet.cellSize,
    dead: false,

    // 3x3 grid for 30x30 visual size
    gol: new GoLEngine(3, 3, 0),
    gradient: GRADIENT_PRESETS.BULLET
  }

  // Seed with radial density for organic bullet shape (no cells at edges)
  seedRadialDensity(bullet.gol, 0.9, 0.0)

  bullets.push(bullet)
}

function checkCollisions() {
  // Bullets vs Invaders
  bullets.forEach(bullet => {
    invaders.forEach(invader => {
      if (!bullet.dead && !invader.dead) {
        if (Collision.rectRect(
          bullet.x, bullet.y, bullet.width, bullet.height,
          invader.x, invader.y, invader.width, invader.height
        )) {
          bullet.dead = true
          invader.dead = true
          state.score += 100
          spawnExplosion(invader.x, invader.y)
        }
      }
    })
  })

  invaders = invaders.filter(i => !i.dead)
}

function checkWinLose() {
  if (invaders.length === 0) {
    state.level++
    CONFIG.invader.moveInterval = Math.max(10, CONFIG.invader.moveInterval - 3)
    setupInvaders()
  }

  if (state.lives <= 0 && state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
    state.phase = 'DYING'
    state.dyingTimer = 0
    // Note: postMessage will be sent after particle animation completes
  }
}

// ============================================
// RENDERING WITH MASKED GRADIENTS
// ============================================
function renderGame() {
  push()
  scale(scaleFactor)

  // DEBUG: Visualize hitboxes with simple rectangles
  if (keyIsDown(72)) { // Press 'H' for hitbox visualization
    // Draw simple rectangles where entities should be
    fill(255, 0, 0, 100)
    rect(player.x, player.y, player.width, player.height)

    invaders.forEach(inv => {
      fill(0, 255, 0, 100)
      rect(inv.x, inv.y, inv.width, inv.height)
    })
    pop()
    return // Skip gradient rendering in hitbox mode
  }

  // Render player with masked gradient (hide during DYING and GAMEOVER)
  if (player && state.phase === 'PLAYING') {
    maskedRenderer.renderMaskedGrid(
      player.gol,
      player.x,
      player.y,
      player.cellSize,
      player.gradient
    )
  }

  // Render invaders with masked gradients
  invaders.forEach(invader => {
    maskedRenderer.renderMaskedGrid(
      invader.gol,
      invader.x,
      invader.y,
      invader.cellSize,
      invader.gradient
    )
  })

  // Render bullets with masked gradients
  bullets.forEach(bullet => {
    maskedRenderer.renderMaskedGrid(
      bullet.gol,
      bullet.x,
      bullet.y,
      bullet.cellSize,
      bullet.gradient
    )
  })

  // Render particles with masked gradients
  renderParticles(particles, maskedRenderer)

  pop()
}

function renderUI() {
  push()
  scale(scaleFactor)

  renderGameUI(CONFIG, state, [
    '← → or A/D: Move',
    'SPACE or Z: Shoot'
  ])

  pop()
}

// ============================================
// GAME-SPECIFIC FUNCTIONS
// ============================================

function spawnExplosion(x, y) {
  // Calculate size from cellSize (6×6 grid)
  const explosionSize = 6 * CONFIG.explosion.cellSize

  for (let i = 0; i < 3; i++) {
    const particle = {
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 - 2,
      alpha: 255,
      width: explosionSize,   // Calculated: 6 cells × cellSize
      height: explosionSize,  // Calculated: 6 cells × cellSize
      cellSize: CONFIG.explosion.cellSize,
      dead: false,

      // 6x6 grid for 60x60 visual size (same as invaders)
      gol: new GoLEngine(6, 6, 30),
      gradient: GRADIENT_PRESETS.EXPLOSION
    }

    // Seed with radial density for chaotic, organic explosion (no cells at edges)
    seedRadialDensity(particle.gol, 0.7, 0.0)

    // Add a small pattern in center for chaos
    const explosionPatterns = [Patterns.BLINKER, Patterns.TOAD, Patterns.BEACON]
    const pattern = explosionPatterns[Math.floor(Math.random() * explosionPatterns.length)]
    particle.gol.setPattern(pattern, 1, 1)

    particles.push(particle)
  }
}

// ============================================
// INPUT HANDLING
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    // Only allow restart in standalone mode
    if (window.parent === window) {
      initGame()
      state.phase = 'PLAYING'
    }
  }
}

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
function windowResized() {
  // Recalculate canvas size
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  resizeCanvas(canvasWidth, canvasHeight)

  // No need to modify entity values - scaling happens in rendering
}

// Make functions global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
