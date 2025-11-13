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

// ============================================
// CONFIGURATION - BASE REFERENCE (10:16 ratio)
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

  player: {
    width: 80,
    height: 80,
    cellSize: 10,
    x: 300,
    startY: 960
  },

  gravity: 0.7,
  jumpForce: -14,
  groundY: 1850,
  ceilingY: 70,

  pipe: {
    width: 120,
    gap: 280,
    speed: -5,
    spawnInterval: 100,
    cellSize: 10
  }
}

// Store scale factor for rendering (don't modify CONFIG values)
let scaleFactor = 1
let canvasWidth = BASE_WIDTH
let canvasHeight = BASE_HEIGHT

// ============================================
// GAME STATE
// ============================================
const state = {
  score: 0,
  lives: 1,
  phase: 'PLAYING',
  frameCount: 0,
  spawnTimer: 0
}

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
  const canvasWidth = canvasHeight * ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size
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
  } else if (state.phase === 'GAMEOVER') {
    // Continue updating particles during game over for explosion effect
    particles = updateParticles(particles, state.frameCount)
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

  if (player.y > CONFIG.groundY - player.height && state.phase !== 'GAMEOVER') {
    state.phase = 'GAMEOVER'
    spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

    // Send postMessage to parent if in installation
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameOver',
        payload: { score: state.score }
      }, '*')
    }
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
    const minGapTop = CONFIG.ceilingY + 80
    const maxGapTop = CONFIG.groundY - CONFIG.pipe.gap - 80
    const gapTop = random(minGapTop, maxGapTop)

    // Top pipe
    const topPipe = {
      x: BASE_WIDTH,
      y: CONFIG.ceilingY,
      width: CONFIG.pipe.width,
      height: gapTop - CONFIG.ceilingY,
      cellSize: CONFIG.pipe.cellSize,
      vx: CONFIG.pipe.speed,
      scored: false,
      gol: new GoLEngine(
        Math.floor(CONFIG.pipe.width / 10),
        Math.floor((gapTop - CONFIG.ceilingY) / 10),
        0  // Visual Only (no evolution)
      ),
      gradient: GRADIENT_PRESETS.ENEMY_HOT,
      dead: false
    }

    // Bottom pipe
    const bottomPipe = {
      x: BASE_WIDTH,
      y: gapTop + CONFIG.pipe.gap,
      width: CONFIG.pipe.width,
      height: CONFIG.groundY - (gapTop + CONFIG.pipe.gap),
      cellSize: CONFIG.pipe.cellSize,
      vx: CONFIG.pipe.speed,
      scored: false,
      gol: new GoLEngine(
        Math.floor(CONFIG.pipe.width / 10),
        Math.floor((CONFIG.groundY - (gapTop + CONFIG.pipe.gap)) / 10),
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
      if (state.phase !== 'GAMEOVER') {
        state.phase = 'GAMEOVER'
        spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

        // Send postMessage to parent if in installation
        if (window.parent !== window) {
          window.parent.postMessage({
            type: 'gameOver',
            payload: { score: state.score }
          }, '*')
        }
      }
    }
  })
}

function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255,
      width: 60,
      height: 60,
      gol: new GoLEngine(6, 6, 30),  // Fast evolution (30fps)
      cellSize: 10,
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
  line(0, CONFIG.ceilingY, BASE_WIDTH, CONFIG.ceilingY)
  line(0, CONFIG.groundY, BASE_WIDTH, CONFIG.groundY)

  // Render player with gradient (hide during game over)
  if (state.phase !== 'GAMEOVER') {
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
