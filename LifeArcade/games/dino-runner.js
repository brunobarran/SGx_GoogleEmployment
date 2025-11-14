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

  gravity: 2.4,   // 0.8 × 3 = 2.4 (scaled for larger player)
  groundY: 1800,  // Keep same (relative to canvas height)
  jumpForce: -54, // -18 × 3 = -54 (scaled for larger player)

  obstacle: {
    spawnInterval: 90,
    minInterval: 30,
    speed: -27,  // -9 × 3 = -27 (scaled)
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
  phase: 'PLAYING',
  frameCount: 0,
  spawnTimer: 0,
  gameSpeed: 1,
  dyingTimer: 0
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
    x: 200,  // Keep same (relative positioning)
    y: CONFIG.groundY - 240,  // 80 × 3 = 240 (scaled height)
    width: 240,    // 8 cells × 30px (scaled 3x from 80px)
    height: 240,   // 8 cells × 30px
    vx: 0,
    vy: 0,
    onGround: true,
    gol: new GoLEngine(8, 8, 12),  // 8×8 grid maintained
    cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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
  } else if (state.phase === 'DYING') {
    // Continue updating particles during death animation
    state.dyingTimer++
    updateParticlesOnly()

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

    if (obs.x < -150) {  // Scaled: -50 × 3 = -150
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
  // Diverse obstacle types with different sizes and forms (all scaled 3x)
  const types = [
    // Small cactus
    { name: 'small', width: 90, height: 120, gradient: GRADIENT_PRESETS.ENEMY_HOT, density: 0.8 },  // 30×40 × 3

    // Medium cactus
    { name: 'medium', width: 180, height: 180, gradient: GRADIENT_PRESETS.ENEMY_COLD, density: 0.75 },  // 60×60 × 3

    // Tall thin cactus
    { name: 'tall', width: 120, height: 240, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW, density: 0.7 },  // 40×80 × 3

    // Wide short cactus
    { name: 'wide', width: 240, height: 120, gradient: GRADIENT_PRESETS.ENEMY_HOT, density: 0.8 },  // 80×40 × 3

    // Double cactus
    { name: 'double', width: 150, height: 210, gradient: GRADIENT_PRESETS.ENEMY_COLD, density: 0.65 },  // 50×70 × 3

    // Tiny obstacle
    { name: 'tiny', width: 60, height: 90, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW, density: 0.85 }  // 20×30 × 3
  ]

  const typeInfo = random(types)

  const obstacle = {
    x: BASE_WIDTH,
    y: CONFIG.groundY - typeInfo.height,
    width: typeInfo.width,
    height: typeInfo.height,
    vx: CONFIG.obstacle.speed,
    gol: new GoLEngine(
      Math.floor(typeInfo.width / 30),   // cellSize 30 (scaled from 10)
      Math.floor(typeInfo.height / 30),
      15
    ),
    cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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
      if (state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
        state.phase = 'DYING'
        state.dyingTimer = 0

        // Spawn explosion
        spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)

        // Note: postMessage will be sent after particle animation completes
      }
    }
  })
}

function spawnExplosion(x, y) {
  for (let i = 0; i < 8; i++) {
    const particle = {
      x: x + random(-30, 30),  // Scaled: -10 to 10 × 3
      y: y + random(-30, 30),
      vx: random(-9, 9),       // Scaled: -3 to 3 × 3
      vy: random(-9, 9),
      alpha: 255,
      width: 180,   // 60 × 3 = 180 (scaled)
      height: 180,  // 60 × 3 = 180
      gol: new GoLEngine(6, 6, 30),  // 6×6 grid maintained
      cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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
