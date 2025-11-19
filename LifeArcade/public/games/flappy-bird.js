/**
 * Flappy Bird GOL - Endless flying game with Game of Life aesthetic
 *
 * Based on game-template.js
 * Player uses Modified GoL with life force
 * Pipes use Visual Only GoL
 *
 * @author Game of Life Arcade
 * @license ISC
 */

// ============================================
// IMPORTS - Standard imports for all games
// ============================================
import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from '../src/utils/UIHelpers.js'
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from '../src/utils/GameBaseConfig.js'

// ============================================
// CONFIGURATION - BASE REFERENCE (10:16 ratio)
// ============================================

const CONFIG = createGameConfig({
  player: {
    width: 240,    // 80 × 3 = 240
    height: 240,   // 80 × 3 = 240
    cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
    x: 300,        // Keep same (relative positioning)
    startY: 960    // Keep same (relative to canvas height)
  },

  gravity: 2.1,    // 0.7 × 3 = 2.1 (scaled for larger player)
  jumpForce: -42,  // -14 × 3 = -42 (scaled for larger player)
  groundY: 1850,   // Keep same (relative to canvas height)
  ceilingY: 70,    // Keep same (relative to canvas height)

  pipe: {
    width: 360,      // 120 × 3 = 360
    gap: 600,        // Increased from 280×3=840 to 600 for better playability with scaled player
    speed: -15,      // -5 × 3 = -15
    spawnInterval: 100,
    cellSize: 30     // Scaled to 30px (3x from 10px baseline)
  }
})

// Store scale factor for rendering (don't modify CONFIG values)
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

// ============================================
// GAME STATE
// ============================================
const state = createGameState({
  spawnTimer: 0,
  dyingTimer: 0
})

// ============================================
// ENTITIES
// ============================================
let player = null
let pipes = []
let particles = []

// Gradient renderer (DO NOT MODIFY)
let maskedRenderer = null

// ============================================
// RESPONSIVE CANVAS HELPERS
// ============================================
function calculateResponsiveSize() {
  const canvasHeight = windowHeight
  const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size
  scaleFactor = canvasHeight / GAME_DIMENSIONS.BASE_HEIGHT
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
  maskedRenderer = new SimpleGradientRenderer(this)
  initGame()
}

function initGame() {
  state.score = 0
  state.lives = 1
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.spawnTimer = 0

  setupPlayer()
  pipes = []
  particles = []
}

function setupPlayer() {
  player = {
    x: CONFIG.player.x,
    y: CONFIG.player.startY,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    cellSize: CONFIG.player.cellSize,

    // Physics
    vy: 0,

    // GoL engine - Standard: 6×6 grid at 12fps for player
    gol: new GoLEngine(6, 6, 12),

    // Gradient - Choose from GRADIENT_PRESETS
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density - Standard pattern
  seedRadialDensity(player.gol, 0.85, 0.0)

  // Optional: Add accent pattern for visual interest
  player.gol.setPattern(Patterns.BLINKER, 2, 2)
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
    particles = updateParticles(particles, state.frameCount)

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
  maskedRenderer.updateAnimation()

  // Only show Game Over screen in standalone mode
  if (state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

function updateGame() {
  updatePlayer()
  updatePipes()
  particles = updateParticles(particles, state.frameCount)
  checkCollisions()
  spawnPipes()
}

function updatePlayer() {
  // Jump input
  if (keyIsDown(32) || keyIsDown(UP_ARROW) || keyIsDown(87)) {  // SPACE, UP, or W
    player.vy = CONFIG.jumpForce
  }

  // Apply gravity
  player.vy += CONFIG.gravity
  player.y += player.vy

  // Check ceiling/ground collision
  if (player.y < CONFIG.ceilingY) {
    player.y = CONFIG.ceilingY
    player.vy = 0
  }

  if (player.y > CONFIG.groundY - player.height && state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
    state.phase = 'DYING'
    state.dyingTimer = 0
    spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

    // Note: postMessage will be sent after particle animation completes
  }

  // Update GoL (Modified GoL with life force)
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function spawnPipes() {
  state.spawnTimer++

  if (state.spawnTimer >= CONFIG.pipe.spawnInterval) {
    state.spawnTimer = 0

    // Random gap position (between ceiling and ground)
    const minGapTop = CONFIG.ceilingY + 240  // 80 × 3 = 240
    const maxGapTop = CONFIG.groundY - CONFIG.pipe.gap - 240
    const gapTop = random(minGapTop, maxGapTop)

    // Top pipe
    const topPipe = {
      x: GAME_DIMENSIONS.BASE_WIDTH,
      y: CONFIG.ceilingY,
      width: CONFIG.pipe.width,
      height: gapTop - CONFIG.ceilingY,
      cellSize: CONFIG.pipe.cellSize,
      vx: CONFIG.pipe.speed,
      scored: false,
      gol: new GoLEngine(
        Math.floor(CONFIG.pipe.width / 30),  // cellSize 30 (scaled from 10)
        Math.floor((gapTop - CONFIG.ceilingY) / 30),
        0  // Visual Only (no evolution)
      ),
      gradient: GRADIENT_PRESETS.ENEMY_HOT,
      dead: false
    }

    // Bottom pipe
    const bottomPipe = {
      x: GAME_DIMENSIONS.BASE_WIDTH,
      y: gapTop + CONFIG.pipe.gap,
      width: CONFIG.pipe.width,
      height: CONFIG.groundY - (gapTop + CONFIG.pipe.gap),
      cellSize: CONFIG.pipe.cellSize,
      vx: CONFIG.pipe.speed,
      scored: false,
      gol: new GoLEngine(
        Math.floor(CONFIG.pipe.width / 30),  // cellSize 30 (scaled from 10)
        Math.floor((CONFIG.groundY - (gapTop + CONFIG.pipe.gap)) / 30),
        0  // Visual Only (no evolution)
      ),
      gradient: GRADIENT_PRESETS.ENEMY_COLD,
      dead: false
    }

    // Seed pipes with radial density
    seedRadialDensity(topPipe.gol, 0.75, 0.0)
    seedRadialDensity(bottomPipe.gol, 0.75, 0.0)

    pipes.push(topPipe, bottomPipe)
  }
}

function updatePipes() {
  pipes.forEach(pipe => {
    pipe.x += pipe.vx

    // Visual Only: maintain density
    if (state.frameCount % 8 === 0) {
      maintainDensity(pipe, 0.7)
    }

    // Score when player passes pipe
    if (!pipe.scored && pipe.x + pipe.width < player.x) {
      pipe.scored = true
      state.score++
    }

    // Remove off-screen pipes
    if (pipe.x < -pipe.width) {
      pipe.dead = true
    }
  })

  pipes = pipes.filter(p => !p.dead)
}

function checkCollisions() {
  pipes.forEach(pipe => {
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      pipe.x, pipe.y, pipe.width, pipe.height
    )) {
      if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
        state.phase = 'DYING'
        state.dyingTimer = 0
        spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

        // Note: postMessage will be sent after particle animation completes
      }
    }
  })
}

function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-30, 30),  // -10 to 10 × 3
      y: y + random(-30, 30),
      vx: random(-9, 9),       // -3 to 3 × 3
      vy: random(-9, 9),
      alpha: 255,
      width: 180,   // 60 × 3 = 180
      height: 180,  // 60 × 3 = 180
      gol: new GoLEngine(6, 6, 30),  // 6×6 grid maintained, fast evolution (30fps)
      cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    seedRadialDensity(particle.gol, 0.7, 0.0)
    particles.push(particle)
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  push()
  scale(scaleFactor)

  // Draw ceiling and ground lines
  stroke(CONFIG.ui.textColor)
  strokeWeight(2)
  line(0, CONFIG.ceilingY, GAME_DIMENSIONS.BASE_WIDTH, CONFIG.ceilingY)
  line(0, CONFIG.groundY, GAME_DIMENSIONS.BASE_WIDTH, CONFIG.groundY)

  // Render player with gradient (hide during DYING and GAMEOVER)
  if (state.phase === 'PLAYING') {
    maskedRenderer.renderMaskedGrid(
      player.gol,
      player.x,
      player.y,
      player.cellSize,
      player.gradient
    )
  }

  // Render pipes with gradients
  pipes.forEach(pipe => {
    maskedRenderer.renderMaskedGrid(
      pipe.gol,
      pipe.x,
      pipe.y,
      pipe.cellSize,
      pipe.gradient
    )
  })

  // Render particles with gradients and alpha
  renderParticles(particles, maskedRenderer)

  pop()
}

function renderUI() {
  push()
  scale(scaleFactor)

  renderGameUI(CONFIG, state, [
    'SPACE or ↑ or W: Jump'
  ])

  pop()
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    initGame()
  }
}

// ============================================
// WINDOW RESIZE HANDLER
// ============================================
function windowResized() {
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height
  updateConfigScale()
  resizeCanvas(canvasWidth, canvasHeight)

  // No need to modify entity values - scaling happens in rendering
}

// ============================================
// EXPORTS
// ============================================
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
