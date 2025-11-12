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

// ============================================
// CONFIGURATION
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

  gravity: 0.8,
  groundY: 500,
  jumpForce: -16,

  obstacle: {
    spawnInterval: 90,  // frames
    minInterval: 30,
    speed: -7,
    speedIncrease: 0.001
  }
}

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
// p5.js SETUP
// ============================================
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
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
    x: 100,
    y: CONFIG.groundY - 60,
    width: 60,    // Same as Space Invaders player
    height: 60,   // Same as Space Invaders player
    vx: 0,
    vy: 0,
    onGround: true,
    gol: new GoLEngine(6, 6, 12),  // Same as Space Invaders
    cellSize: 10,  // Same as Space Invaders
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density for organic shape
  seedRadialDensity(player.gol, 0.85, 0.0)

  // Add accent pattern
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
    updateParticlesOnly()
  }

  renderGame()
  renderUI()

  // Update gradient animation
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    renderGameOver()
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
    x: CONFIG.width,
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
  particles.forEach(p => {
    p.gol.updateThrottled(state.frameCount)
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 4
    if (p.alpha <= 0) p.dead = true
  })

  particles = particles.filter(p => !p.dead)
}

function checkCollisions() {
  obstacles.forEach(obs => {
    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      obs.x, obs.y, obs.width, obs.height
    )) {
      // Game over
      state.phase = 'GAMEOVER'

      // Spawn explosion
      spawnExplosion(player.x + player.width / 2, player.y + player.height / 2)
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

function applyLifeForce(entity) {
  if (!entity.gol) return

  const engine = entity.gol
  const totalCells = engine.cols * engine.rows
  const aliveCount = engine.countAliveCells()
  const density = aliveCount / totalCells

  // Maintain at least 35% density
  if (density < 0.35) {
    const cellsToInject = Math.floor(totalCells * 0.15)
    for (let i = 0; i < cellsToInject; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 1)
    }
  }
}

function maintainDensity(entity, targetDensity = 0.6) {
  if (!entity.gol) return

  const engine = entity.gol
  const totalCells = engine.cols * engine.rows
  const aliveCount = engine.countAliveCells()
  const currentDensity = aliveCount / totalCells

  if (currentDensity < targetDensity) {
    const cellsToRevive = Math.floor(totalCells * (targetDensity - currentDensity))
    for (let i = 0; i < cellsToRevive; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 1)
    }
  }
}

/**
 * Seed GoL grid with radial density gradient.
 * Creates organic, irregular edges by placing more cells in center, fewer at edges.
 */
function seedRadialDensity(engine, centerDensity = 0.7, edgeDensity = 0.1) {
  const centerX = engine.cols / 2
  const centerY = engine.rows / 2
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

  for (let x = 0; x < engine.cols; x++) {
    for (let y = 0; y < engine.rows; y++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)
      const normalizedDistance = distance / maxDistance
      const density = centerDensity + (edgeDensity - centerDensity) * normalizedDistance

      if (Math.random() < density) {
        engine.setCell(x, y, 1)
      }
    }
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  // Ground line
  stroke(CONFIG.ui.textColor)
  strokeWeight(2)
  line(0, CONFIG.groundY, CONFIG.width, CONFIG.groundY)

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
  particles.forEach(p => {
    if (p.alpha > 0) {
      push()
      drawingContext.globalAlpha = p.alpha / 255
      maskedRenderer.renderMaskedGrid(
        p.gol,
        p.x,
        p.y,
        p.cellSize,
        p.gradient
      )
      pop()
    }
  })
}

function renderUI() {
  fill(CONFIG.ui.textColor)
  noStroke()
  textFont(CONFIG.ui.font)
  textStyle(NORMAL)
  textSize(CONFIG.ui.fontSize)
  textAlign(LEFT, TOP)

  text(`SCORE: ${state.score}`, 20, 20)

  // Instructions
  textAlign(RIGHT, TOP)
  text('SPACE or ↑: Jump', CONFIG.width - 20, 20)
}

function renderGameOver() {
  fill(0, 0, 0, 180)
  noStroke()
  rect(0, 0, width, height)

  fill(255)
  noStroke()
  textStyle(NORMAL)
  textAlign(CENTER, CENTER)
  textSize(48)
  text('GAME OVER', width/2, height/2 - 40)

  textSize(24)
  text(`Final Score: ${state.score}`, width/2, height/2 + 40)

  textSize(16)
  text('Press SPACE to restart', width/2, height/2 + 100)
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    initGame()
  }
}

// Export for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
