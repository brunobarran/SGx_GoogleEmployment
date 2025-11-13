/**
 * Dino Runner - Chrome Dino style endless runner
 *
 * Based on game-template.js
 * Player uses Modified GoL with life force
 * Obstacles use Visual Only GoL
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

  gravity: 0.8,
  groundY: 1800,
  jumpForce: -18,

  obstacle: {
    spawnInterval: 90,
    minInterval: 30,
    speed: -9,
    speedIncrease: 0.001
  }
}

// Store scale factor for rendering (don't modify CONFIG values)
let scaleFactor = 1
let canvasWidth = BASE_WIDTH
let canvasHeight = BASE_HEIGHT

// Google Brand Colors
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
  phase: 'PLAYING',
  frameCount: 0,
  spawnTimer: 0,
  gameSpeed: 1
}

// ============================================
// ENTITIES
// ============================================
let player = null
let obstacles = []
let particles = []

// Gradient renderer
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

  // Create gradient renderer
  maskedRenderer = new SimpleGradientRenderer(this)

  initGame()
}

function initGame() {
  state.score = 0
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.spawnTimer = 0
  state.gameSpeed = 1

  setupPlayer()
  obstacles = []
  particles = []
}

function setupPlayer() {
  player = {
    x: 200,  // Adjusted for wider canvas (portrait)
    y: CONFIG.groundY - 100,
    width: 100,    // Larger for 1200px width
    height: 100,   // Larger for better visibility in portrait
    vx: 0,
    vy: 0,
    onGround: true,
    gol: new GoLEngine(8, 8, 12),  // Larger grid for bigger player
    cellSize: 13,
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density for organic shape
  seedRadialDensity(player.gol, 0.85, 0.0)

  // Add accent pattern
  player.gol.setPattern(Patterns.BLINKER, 3, 3)
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
    updateParticlesOnly()
  }

  renderGame()
  renderUI()

  // Update gradient animation
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    // Only show Game Over screen in standalone mode
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

function updateGame() {
  // Update player
  updatePlayer()

  // Spawn obstacles
  state.spawnTimer++
  const currentInterval = Math.max(
    CONFIG.obstacle.minInterval,
    CONFIG.obstacle.spawnInterval - Math.floor(state.score / 100)
  )

  if (state.spawnTimer >= currentInterval) {
    spawnObstacle()
    state.spawnTimer = 0
  }

  // Update obstacles (Visual Only GoL)
  obstacles.forEach(obs => {
    obs.x += obs.vx * state.gameSpeed

    // Visual Only: maintain density without evolution
    if (state.frameCount % 8 === 0) {
      maintainDensity(obs, 0.65)
    }

    if (obs.x < -50) {
      obs.dead = true
      state.score += 10
    }
  })

  obstacles = obstacles.filter(obs => !obs.dead)

  // Update particles (Pure GoL)
  updateParticlesOnly()

  // Check collisions
  checkCollisions()

  // Increase difficulty
  state.gameSpeed += CONFIG.obstacle.speedIncrease

  // Increment score
  if (state.frameCount % 6 === 0) {
    state.score++
  }
}

function updatePlayer() {
  // Jump input
  if (keyIsDown(32) || keyIsDown(UP_ARROW) || keyIsDown(87)) {  // SPACE, UP, or W
    if (player.onGround) {
      player.vy = CONFIG.jumpForce
      player.onGround = false
    }
  }

  // Apply gravity
  player.vy += CONFIG.gravity
  player.y += player.vy

  // Ground collision
  if (player.y >= CONFIG.groundY - player.height) {
    player.y = CONFIG.groundY - player.height
    player.vy = 0
    player.onGround = true
  } else {
    player.onGround = false
  }

  // Update GoL (Modified GoL with life force)
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function spawnObstacle() {
  // Diverse obstacle types with different sizes and forms
  const types = [
    // Small cactus (similar to bullet size)
    { name: 'small', width: 30, height: 40, gradient: GRADIENT_PRESETS.ENEMY_HOT, density: 0.8 },

    // Medium cactus (same as player/invader)
    { name: 'medium', width: 60, height: 60, gradient: GRADIENT_PRESETS.ENEMY_COLD, density: 0.75 },

    // Tall thin cactus
    { name: 'tall', width: 40, height: 80, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW, density: 0.7 },

    // Wide short cactus
    { name: 'wide', width: 80, height: 40, gradient: GRADIENT_PRESETS.ENEMY_HOT, density: 0.8 },

    // Double cactus
    { name: 'double', width: 50, height: 70, gradient: GRADIENT_PRESETS.ENEMY_COLD, density: 0.65 },

    // Tiny obstacle
    { name: 'tiny', width: 20, height: 30, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW, density: 0.85 }
  ]

  const typeInfo = random(types)

  const obstacle = {
    x: BASE_WIDTH,
    y: CONFIG.groundY - typeInfo.height,
    width: typeInfo.width,
    height: typeInfo.height,
    vx: CONFIG.obstacle.speed,
    gol: new GoLEngine(
      Math.floor(typeInfo.width / 10),   // cellSize 10 for consistency
      Math.floor(typeInfo.height / 10),
      15
    ),
    cellSize: 10,  // Same as player and Space Invaders
    gradient: typeInfo.gradient,
    dead: false
  }

  // Seed with variable radial density for diverse shapes
  seedRadialDensity(obstacle.gol, typeInfo.density, 0.0)

  obstacles.push(obstacle)
}

function updateParticlesOnly() {
  particles = updateParticles(particles, state.frameCount)
}

function checkCollisions() {
  obstacles.forEach(obs => {
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      obs.x, obs.y, obs.width, obs.height
    )) {
      // Game over
      if (state.phase !== 'GAMEOVER') {
        state.phase = 'GAMEOVER'

        // Spawn explosion
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
      width: 60,   // Same as Space Invaders explosions
      height: 60,  // Same as Space Invaders explosions
      gol: new GoLEngine(6, 6, 30),  // Same as Space Invaders
      cellSize: 10,  // Same as Space Invaders
      gradient: GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    // Seed with radial density
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

  // Ground line
  stroke(CONFIG.ui.textColor)
  strokeWeight(2)
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

  // Render obstacles with gradients
  obstacles.forEach(obs => {
    maskedRenderer.renderMaskedGrid(
      obs.gol,
      obs.x,
      obs.y,
      obs.cellSize,
      obs.gradient
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
    'SPACE or ↑: Jump'
  ])

  pop()
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    // Only allow restart in standalone mode
    if (window.parent === window) {
      initGame()
    }
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

// Export for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
