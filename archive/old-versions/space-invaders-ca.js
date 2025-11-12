/**
 * Space Invaders with Cellular Automata
 *
 * Based on game-template.js
 * Invaders are GoL grids with animated gradients
 * Clean white background, Google brand colors
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from '../src/core/GoLEngine.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'

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
    cols: 11,
    rows: 5,
    width: 30,
    height: 30,
    spacing: 50,
    startX: 100,
    startY: 80,
    moveInterval: 30,  // frames
    speed: 15
  },

  player: {
    speed: 6,
    shootCooldown: 15  // frames
  }
}

// Google Brand Colors
const GOOGLE_COLORS = {
  BLUE: { r: 49, g: 134, b: 255 },
  RED: { r: 252, g: 65, b: 61 },
  GREEN: { r: 0, g: 175, b: 87 },
  YELLOW: { r: 255, g: 204, b: 0 }
}

// Gradient colors (Google palette)
const GRADIENT_COLORS = [
  GOOGLE_COLORS.BLUE,
  GOOGLE_COLORS.RED,
  GOOGLE_COLORS.GREEN,
  GOOGLE_COLORS.YELLOW,
  { r: 255, g: 255, b: 255 }   // White
]

// ============================================
// GAME STATE
// ============================================
const state = {
  score: 0,
  lives: 3,
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

// ============================================
// p5.js SETUP
// ============================================
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)
  initGame()
}

function initGame() {
  state.score = 0
  state.lives = 3
  state.level = 1
  state.invaderDirection = 1
  state.invaderMoveTimer = 0

  setupPlayer()
  setupInvaders()
  bullets = []
  particles = []
}

function setupPlayer() {
  player = {
    x: CONFIG.width / 2 - 20,
    y: CONFIG.height - 80,
    width: 40,
    height: 30,
    vx: 0,
    gol: new GoLEngine(13, 10, 12),
    cellSize: 3,
    color: GOOGLE_COLORS.BLUE,
    gradientOffset: 0
  }

  // Create spaceship-like shape with multiple patterns
  player.gol.setPattern(Patterns.POND, 2, 2)       // Body (symmetric square)
  player.gol.setPattern(Patterns.BLOCK, 6, 1)      // Cockpit
  player.gol.setPattern(Patterns.TUB, 1, 0)        // Left detail
  player.gol.setPattern(Patterns.TUB, 10, 0)       // Right detail
  player.gol.setPattern(Patterns.BLINKER, 1, 5)    // Left wing
  player.gol.setPattern(Patterns.BLINKER, 10, 5)   // Right wing
}

function setupInvaders() {
  invaders = []

  // Different patterns for each row - using diverse still lifes and oscillators
  const rowPatterns = [
    { pattern: Patterns.SHIP, scoreValue: 10, color: GOOGLE_COLORS.BLUE },
    { pattern: Patterns.BOAT, scoreValue: 15, color: GOOGLE_COLORS.GREEN },
    { pattern: Patterns.LOAF, scoreValue: 20, color: GOOGLE_COLORS.YELLOW },
    { pattern: Patterns.BEEHIVE, scoreValue: 25, color: GOOGLE_COLORS.RED },
    { pattern: Patterns.BEACON, scoreValue: 30, color: GOOGLE_COLORS.BLUE }
  ]

  for (let row = 0; row < CONFIG.invader.rows; row++) {
    const rowInfo = rowPatterns[row % rowPatterns.length]

    for (let col = 0; col < CONFIG.invader.cols; col++) {
      const invader = {
        x: CONFIG.invader.startX + col * CONFIG.invader.spacing,
        y: CONFIG.invader.startY + row * 40,
        width: CONFIG.invader.width,
        height: CONFIG.invader.height,
        gol: new GoLEngine(10, 10, 15),
        cellSize: 3,
        gradientOffset: Math.random() * Math.PI * 2,
        scoreValue: rowInfo.scoreValue,
        color: rowInfo.color,
        dead: false
      }

      // Stamp pattern in center with some variation
      const pattern = rowInfo.pattern
      const patternWidth = pattern[0]?.length || pattern.length
      const patternHeight = pattern.length
      const xOffset = Math.floor((10 - patternWidth) / 2)
      const yOffset = Math.floor((10 - patternHeight) / 2)
      invader.gol.setPattern(pattern, xOffset, yOffset)

      invaders.push(invader)
    }
  }
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

  if (state.phase === 'GAMEOVER') {
    renderGameOver()
  }
}

function updateGame() {
  // Update player
  updatePlayer()

  // Update invaders
  state.invaderMoveTimer++
  if (state.invaderMoveTimer >= CONFIG.invader.moveInterval) {
    moveInvaders()
    state.invaderMoveTimer = 0
  }

  invaders.forEach(inv => {
    inv.gol.updateThrottled(state.frameCount)
    applyLifeForce(inv)  // Keep invaders alive
    inv.gradientOffset += 0.02
  })

  // Update bullets (Visual Only - maintain density)
  bullets.forEach(bullet => {
    bullet.y += bullet.vy

    // Visual Only: maintain appearance without evolution
    if (state.frameCount % 5 === 0) {
      maintainDensity(bullet, 0.75)
    }

    // Off screen
    if (bullet.y < 0 || bullet.y > height) {
      bullet.dead = true
    }
  })

  bullets = bullets.filter(b => !b.dead)

  // Update particles (Pure GoL for explosion effect)
  particles.forEach(p => {
    p.gol.updateThrottled(state.frameCount)
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 4
    if (p.alpha <= 0) p.dead = true
  })

  particles = particles.filter(p => !p.dead)

  // Check collisions
  checkCollisions()

  // Check win/lose
  if (invaders.length === 0) {
    state.level++
    CONFIG.invader.moveInterval = Math.max(10, CONFIG.invader.moveInterval - 3)
    setupInvaders()
  }

  if (state.lives <= 0) {
    state.phase = 'GAMEOVER'
  }

  // Shoot cooldown
  if (state.playerShootCooldown > 0) {
    state.playerShootCooldown--
  }
}

function updatePlayer() {
  // Movement
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {  // A
    player.vx = -CONFIG.player.speed
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {  // D
    player.vx = CONFIG.player.speed
  } else {
    player.vx = 0
  }

  player.x += player.vx
  player.x = Collision.clamp(player.x, 0, CONFIG.width - player.width)

  // Shoot
  if ((keyIsDown(32) || keyIsDown(90)) && state.playerShootCooldown === 0) {  // SPACE or Z
    shootBullet()
    state.playerShootCooldown = CONFIG.player.shootCooldown
  }

  // Update GoL (Modified GoL with life force)
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
  player.gradientOffset += 0.03
}

function moveInvaders() {
  const hitEdge = invaders.some(inv =>
    (state.invaderDirection > 0 && inv.x > CONFIG.width - 80) ||
    (state.invaderDirection < 0 && inv.x < 50)
  )

  if (hitEdge) {
    invaders.forEach(inv => inv.y += 20)
    state.invaderDirection *= -1

    // Check if invaders reached bottom
    if (invaders.some(inv => inv.y > CONFIG.height - 150)) {
      state.lives = 0
    }
  } else {
    invaders.forEach(inv => inv.x += state.invaderDirection * CONFIG.invader.speed)
  }
}

function shootBullet() {
  const bullet = {
    x: player.x + player.width / 2 - 2,
    y: player.y,
    width: 4,
    height: 10,
    vy: -10,
    gol: new GoLEngine(2, 5, 30),
    cellSize: 2,
    color: GOOGLE_COLORS.BLUE,
    dead: false
  }

  bullet.gol.randomSeed(0.8)
  bullets.push(bullet)
}

function checkCollisions() {
  // Bullets vs invaders
  bullets.forEach(bullet => {
    invaders.forEach(invader => {
      if (Collision.circleRect(
        bullet.x, bullet.y, 5,
        invader.x, invader.y, invader.width, invader.height
      )) {
        bullet.dead = true
        invader.dead = true
        state.score += invader.scoreValue

        // Spawn explosion
        spawnExplosion(invader.x + invader.width / 2, invader.y + invader.height / 2)
      }
    })
  })

  invaders = invaders.filter(inv => !inv.dead)
}

function spawnExplosion(x, y) {
  // Use diverse methuselah patterns for varied explosions
  const explosionPatterns = [
    Patterns.R_PENTOMINO,
    Patterns.ACORN,
    Patterns.DIEHARD
  ]

  for (let i = 0; i < 6; i++) {
    const particle = {
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255,
      gol: new GoLEngine(8, 8, 30),
      cellSize: 2,
      color: GOOGLE_COLORS.RED,
      dead: false
    }

    // Use different methuselah patterns for variety
    const pattern = random(explosionPatterns)
    particle.gol.setPattern(pattern, 1, 1)
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
    const cellsToInject = Math.floor(totalCells * 0.15)  // Inject 15%
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

  // If density too low, revive random cells
  if (currentDensity < targetDensity) {
    const cellsToRevive = Math.floor(totalCells * (targetDensity - currentDensity))
    for (let i = 0; i < cellsToRevive; i++) {
      const x = Math.floor(Math.random() * engine.cols)
      const y = Math.floor(Math.random() * engine.rows)
      engine.setCell(x, y, 1)
    }
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  // Render player
  renderEntityWithGradient(player)

  // Render invaders
  invaders.forEach(inv => renderEntityWithGradient(inv))

  // Render bullets
  bullets.forEach(bullet => renderEntity(bullet))

  // Render particles
  particles.forEach(p => {
    push()
    tint(255, p.alpha)
    renderEntity(p)
    pop()
  })
}

function renderEntity(entity) {
  const grid = entity.gol.current
  const cellSize = entity.cellSize || 3

  // Use entity color or default to text color
  if (entity.color) {
    fill(entity.color.r, entity.color.g, entity.color.b)
  } else {
    fill(CONFIG.ui.textColor)
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

function renderEntityWithGradient(entity) {
  const grid = entity.gol.current
  const cellSize = entity.cellSize || 3
  const gradientOffset = entity.gradientOffset || 0

  noStroke()

  for (let x = 0; x < grid.length; x++) {
    for (let y = 0; y < grid[x].length; y++) {
      if (grid[x][y] === 1) {
        // Map y position to gradient
        const t = (y / grid[x].length + gradientOffset) % 1
        const color = lerpGradient(GRADIENT_COLORS, t)

        fill(color.r, color.g, color.b)
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

function lerpGradient(colors, t) {
  // Ensure t is in [0, 1] range (handle negative values from modulo)
  t = ((t % 1) + 1) % 1

  const scaled = t * (colors.length - 1)
  const index = Math.floor(scaled)
  const frac = scaled - index

  // Handle edge case: t = 1.0 or index at boundary
  if (index >= colors.length - 1) {
    return colors[colors.length - 1]
  }

  const c1 = colors[index]
  const c2 = colors[index + 1]

  return {
    r: Math.floor(c1.r + (c2.r - c1.r) * frac),
    g: Math.floor(c1.g + (c2.g - c1.g) * frac),
    b: Math.floor(c1.b + (c2.b - c1.b) * frac)
  }
}

function renderUI() {
  fill(CONFIG.ui.textColor)
  textFont(CONFIG.ui.font)
  textSize(CONFIG.ui.fontSize)
  textAlign(LEFT, TOP)

  text(`SCORE: ${state.score}`, 20, 20)
  text(`LIVES: ${state.lives}`, 20, 45)
  text(`LEVEL: ${state.level}`, 20, 70)

  // Controls hint
  textSize(12)
  fill(150)
  text('← → or A/D to move, SPACE or Z to shoot', 20, CONFIG.height - 25)
}

function renderGameOver() {
  fill(0, 0, 0, 150)
  rect(0, 0, width, height)

  fill(255)
  textAlign(CENTER, CENTER)
  textSize(48)
  text('GAME OVER', width / 2, height / 2 - 40)

  textSize(24)
  text(`Final Score: ${state.score}`, width / 2, height / 2 + 40)

  textSize(16)
  text('Press SPACE to restart', width / 2, height / 2 + 100)
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    initGame()
    state.phase = 'PLAYING'
  }
}

// Export for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
