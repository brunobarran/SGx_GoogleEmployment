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
// GAME CONFIGURATION
// ============================================
const CONFIG = {
  width: 800,
  height: 600,

  ui: {
    backgroundColor: '#FFFFFF',
    textColor: '#5f6368',
    accentColor: '#1a73e8',
    font: 'Google Sans, Arial, sans-serif',
    fontSize: 16
  },

  invader: {
    cols: 7,      // Reduced to fit screen
    rows: 3,      // Reduced to fit screen
    width: 60,    // Reduced size
    height: 60,
    spacing: 80,  // Adjusted spacing
    startX: 50,
    startY: 80,
    moveInterval: 30,
    speed: 15,
    cellSize: 10
  },

  player: {
    width: 60,    // Reduced size
    height: 60,
    cellSize: 10,
    speed: 6,
    shootCooldown: 15
  },

  bullet: {
    width: 30,    // Proportionally reduced
    height: 30,
    cellSize: 10
  },

  explosion: {
    width: 60,    // Same size as invaders
    height: 60,
    cellSize: 10
  }
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
  playerShootCooldown: 0
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
// p5.js SETUP
// ============================================
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)

  // Create simple gradient renderer (KISS)
  maskedRenderer = new SimpleGradientRenderer(this)

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
  player = {
    x: CONFIG.width / 2 - CONFIG.player.width / 2,
    y: CONFIG.height - 120,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    vx: 0,
    cellSize: CONFIG.player.cellSize,

    // GoL engine - 6x6 grid for 60x60 visual size
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
  const { cols, rows, width, height, spacing, startX, startY, cellSize } = CONFIG.invader

  console.log('Setting up invaders:', { cols, rows })

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
        x: startX + col * spacing,
        y: startY + row * spacing,
        width,
        height,
        cellSize,
        dead: false,

        // GoL engine - 6x6 grid for 60x60 visual size
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
  }

  renderGame()
  renderUI()

  // Update gradient animations
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    renderGameOver(width, height, state.score)
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

    // Off screen
    if (bullet.y < 0 || bullet.y > height) {
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
    (state.invaderDirection > 0 && inv.x > CONFIG.width - 80) ||
    (state.invaderDirection < 0 && inv.x < 50)
  )

  if (hitEdge) {
    invaders.forEach(inv => inv.y += 20)
    state.invaderDirection *= -1

    if (invaders.some(inv => inv.y > CONFIG.height - 150)) {
      state.lives = 0
    }
  } else {
    invaders.forEach(inv => inv.x += state.invaderDirection * CONFIG.invader.speed)
  }
}

function shootBullet() {
  const bullet = {
    x: player.x + player.width / 2 - CONFIG.bullet.width / 2,
    y: player.y - CONFIG.bullet.height,
    width: CONFIG.bullet.width,
    height: CONFIG.bullet.height,
    vy: -8,
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

  if (state.lives <= 0) {
    state.phase = 'GAMEOVER'
  }
}

// ============================================
// RENDERING WITH MASKED GRADIENTS
// ============================================
function renderGame() {
  // Debug: Check if entities exist
  if (frameCount % 60 === 0) {
    console.log('Rendering:', {
      player: !!player,
      invaders: invaders.length,
      bullets: bullets.length,
      maskedRenderer: !!maskedRenderer
    })
  }

  // DEBUG: Test if rendering works with simple rectangles
  if (keyIsDown(68)) { // Press 'D' for debug mode
    // Draw simple rectangles where entities should be
    fill(255, 0, 0, 100)
    rect(player.x, player.y, player.width, player.height)

    invaders.forEach(inv => {
      fill(0, 255, 0, 100)
      rect(inv.x, inv.y, inv.width, inv.height)
    })
    return // Skip gradient rendering in debug mode
  }

  // Render player with masked gradient
  if (player) {
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
}

function renderUI() {
  renderGameUI(CONFIG, state, [
    '← → or A/D: Move',
    'SPACE or Z: Shoot'
  ])
}

// ============================================
// GAME-SPECIFIC FUNCTIONS
// ============================================

function spawnExplosion(x, y) {
  for (let i = 0; i < 3; i++) {
    const particle = {
      x: x + Math.random() * 20 - 10,
      y: y + Math.random() * 20 - 10,
      vx: Math.random() * 4 - 2,
      vy: Math.random() * 4 - 2,
      alpha: 255,
      width: CONFIG.explosion.width,
      height: CONFIG.explosion.height,
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
    initGame()
    state.phase = 'PLAYING'
  }
}

// Make functions global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
