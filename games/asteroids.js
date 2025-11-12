/**
 * Asteroids GOL - Classic asteroids game with Game of Life aesthetic
 *
 * Based on game-template.js
 * Player uses Modified GoL with life force
 * Asteroids use Modified GoL
 * Bullets use Visual Only GoL
 *
 * @author Game of Life Arcade
 * @license ISC
 */

// ============================================
// IMPORTS - Standard imports for all games
// ============================================
import { GoLEngine } from '../src/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from '../src/utils/UIHelpers.js'

// ============================================
// CONFIGURATION
// ============================================
const CONFIG = {
  width: 800,
  height: 600,

  // Standard UI config (DO NOT MODIFY)
  ui: {
    backgroundColor: '#FFFFFF',
    textColor: '#5f6368',
    accentColor: '#1a73e8',
    font: 'Google Sans, Arial, sans-serif',
    fontSize: 16
  },

  // Game-specific config
  player: {
    width: 60,
    height: 60,
    cellSize: 10,
    rotationSpeed: 0.1,
    thrustPower: 0.3,
    friction: 0.98,
    maxSpeed: 8
  },

  bullet: {
    width: 30,
    height: 30,
    cellSize: 10,
    speed: 10,
    lifetime: 60  // frames
  },

  asteroid: {
    large: { width: 60, height: 60, cellSize: 10, speed: 1.5, points: 20 },
    medium: { width: 40, height: 40, cellSize: 10, speed: 2.5, points: 50 },
    small: { width: 30, height: 30, cellSize: 10, speed: 3.5, points: 100 }
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
  asteroidSpawnTimer: 0
}

// ============================================
// ENTITIES
// ============================================
let player = null
let asteroids = []
let bullets = []
let particles = []

// Gradient renderer (DO NOT MODIFY)
let maskedRenderer = null

// ============================================
// p5.js SETUP
// ============================================
function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)
  maskedRenderer = new SimpleGradientRenderer(this)
  initGame()
}

function initGame() {
  state.score = 0
  state.lives = 1
  state.level = 1
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.asteroidSpawnTimer = 0

  setupPlayer()
  spawnAsteroids(4)  // Start with 4 large asteroids

  bullets = []
  particles = []
}

function setupPlayer() {
  player = {
    x: CONFIG.width / 2,
    y: CONFIG.height / 2,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    cellSize: CONFIG.player.cellSize,

    // Physics
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,  // Point upward

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

function spawnAsteroids(count) {
  for (let i = 0; i < count; i++) {
    spawnAsteroid('large', null, null)
  }
}

function spawnAsteroid(size, x = null, y = null) {
  const config = CONFIG.asteroid[size]

  // If no position specified, spawn at random edge
  if (x === null || y === null) {
    const edge = Math.floor(Math.random() * 4)
    switch (edge) {
      case 0: x = Math.random() * CONFIG.width; y = -config.height; break  // Top
      case 1: x = CONFIG.width + config.width; y = Math.random() * CONFIG.height; break  // Right
      case 2: x = Math.random() * CONFIG.width; y = CONFIG.height + config.height; break  // Bottom
      case 3: x = -config.width; y = Math.random() * CONFIG.height; break  // Left
    }
  }

  const asteroid = {
    x,
    y,
    width: config.width,
    height: config.height,
    cellSize: config.cellSize,
    size,
    points: config.points,

    // Random velocity
    vx: (Math.random() - 0.5) * config.speed * 2,
    vy: (Math.random() - 0.5) * config.speed * 2,

    // Slow rotation
    rotation: 0,
    rotationSpeed: (Math.random() - 0.5) * 0.02,

    // GoL engine - Size depends on asteroid size
    gol: new GoLEngine(
      Math.floor(config.width / 10),
      Math.floor(config.height / 10),
      15  // 15fps for asteroids
    ),

    // Gradient based on size
    gradient: size === 'large' ? GRADIENT_PRESETS.ENEMY_HOT :
              size === 'medium' ? GRADIENT_PRESETS.ENEMY_COLD :
              GRADIENT_PRESETS.ENEMY_RAINBOW,

    dead: false
  }

  // Seed with radial density
  seedRadialDensity(asteroid.gol, 0.75, 0.0)

  asteroids.push(asteroid)
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

  if (state.phase === 'GAMEOVER') {
    renderGameOver(width, height, state.score)
  }
}

function updateGame() {
  updatePlayer()
  updateAsteroids()
  updateBullets()
  particles = updateParticles(particles, state.frameCount)
  checkCollisions()
  checkWinCondition()
}

function updatePlayer() {
  // Rotation
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {  // A
    player.angle -= CONFIG.player.rotationSpeed
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {  // D
    player.angle += CONFIG.player.rotationSpeed
  }

  // Thrust
  if (keyIsDown(UP_ARROW) || keyIsDown(87)) {  // W
    player.vx += Math.cos(player.angle) * CONFIG.player.thrustPower
    player.vy += Math.sin(player.angle) * CONFIG.player.thrustPower
  }

  // Apply friction
  player.vx *= CONFIG.player.friction
  player.vy *= CONFIG.player.friction

  // Limit max speed
  const speed = Math.sqrt(player.vx * player.vx + player.vy * player.vy)
  if (speed > CONFIG.player.maxSpeed) {
    player.vx = (player.vx / speed) * CONFIG.player.maxSpeed
    player.vy = (player.vy / speed) * CONFIG.player.maxSpeed
  }

  // Update position
  player.x += player.vx
  player.y += player.vy

  // Wrap around screen
  if (player.x < -player.width) player.x = CONFIG.width
  if (player.x > CONFIG.width) player.x = -player.width
  if (player.y < -player.height) player.y = CONFIG.height
  if (player.y > CONFIG.height) player.y = -player.height

  // Shoot
  if (keyIsDown(32)) {  // SPACE
    shootBullet()
  }

  // Update GoL with life force
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

function updateAsteroids() {
  asteroids.forEach(asteroid => {
    // Update position
    asteroid.x += asteroid.vx
    asteroid.y += asteroid.vy

    // Update rotation
    asteroid.rotation += asteroid.rotationSpeed

    // Wrap around screen
    if (asteroid.x < -asteroid.width) asteroid.x = CONFIG.width
    if (asteroid.x > CONFIG.width) asteroid.x = -asteroid.width
    if (asteroid.y < -asteroid.height) asteroid.y = CONFIG.height
    if (asteroid.y > CONFIG.height) asteroid.y = -asteroid.height

    // Update GoL
    asteroid.gol.updateThrottled(state.frameCount)
    applyLifeForce(asteroid)
  })
}

function updateBullets() {
  bullets.forEach(bullet => {
    bullet.x += bullet.vx
    bullet.y += bullet.vy
    bullet.lifetime--

    // Visual Only: maintain density
    if (state.frameCount % 5 === 0) {
      maintainDensity(bullet, 0.75)
    }

    // Remove if off screen or lifetime expired
    if (bullet.lifetime <= 0 ||
        bullet.x < 0 || bullet.x > CONFIG.width ||
        bullet.y < 0 || bullet.y > CONFIG.height) {
      bullet.dead = true
    }
  })

  bullets = bullets.filter(b => !b.dead)
}

function shootBullet() {
  // Limit fire rate (every 10 frames)
  if (state.frameCount % 10 !== 0) return

  const bullet = {
    x: player.x + Math.cos(player.angle) * player.width / 2,
    y: player.y + Math.sin(player.angle) * player.height / 2,
    width: CONFIG.bullet.width,
    height: CONFIG.bullet.height,
    cellSize: CONFIG.bullet.cellSize,

    vx: Math.cos(player.angle) * CONFIG.bullet.speed + player.vx,
    vy: Math.sin(player.angle) * CONFIG.bullet.speed + player.vy,

    lifetime: CONFIG.bullet.lifetime,

    // 3x3 grid for 30x30 visual size - Visual Only (0 fps)
    gol: new GoLEngine(3, 3, 0),
    gradient: GRADIENT_PRESETS.BULLET,
    dead: false
  }

  // Seed with radial density for organic bullet shape
  seedRadialDensity(bullet.gol, 0.9, 0.0)

  bullets.push(bullet)
}

function checkCollisions() {
  // Player vs Asteroids
  asteroids.forEach(asteroid => {
    if (Collision.rectRect(
      player.x - player.width/2, player.y - player.height/2, player.width, player.height,
      asteroid.x - asteroid.width/2, asteroid.y - asteroid.height/2, asteroid.width, asteroid.height
    )) {
      state.phase = 'GAMEOVER'
      spawnExplosion(player.x, player.y, GRADIENT_PRESETS.EXPLOSION)
    }
  })

  // Bullets vs Asteroids
  bullets.forEach(bullet => {
    asteroids.forEach(asteroid => {
      if (!bullet.dead && !asteroid.dead) {
        if (Collision.rectRect(
          bullet.x - bullet.width/2, bullet.y - bullet.height/2, bullet.width, bullet.height,
          asteroid.x - asteroid.width/2, asteroid.y - asteroid.height/2, asteroid.width, asteroid.height
        )) {
          bullet.dead = true
          asteroid.dead = true
          state.score += asteroid.points

          // Spawn explosion
          spawnExplosion(asteroid.x, asteroid.y, asteroid.gradient)

          // Split asteroid
          splitAsteroid(asteroid)
        }
      }
    })
  })

  asteroids = asteroids.filter(a => !a.dead)
}

function splitAsteroid(asteroid) {
  if (asteroid.size === 'large') {
    // Split into 2 medium asteroids
    for (let i = 0; i < 2; i++) {
      spawnAsteroid('medium', asteroid.x, asteroid.y)
    }
  } else if (asteroid.size === 'medium') {
    // Split into 2 small asteroids
    for (let i = 0; i < 2; i++) {
      spawnAsteroid('small', asteroid.x, asteroid.y)
    }
  }
  // Small asteroids don't split
}

function checkWinCondition() {
  // If all asteroids destroyed, next level
  if (asteroids.length === 0) {
    state.level++
    spawnAsteroids(4 + state.level)  // More asteroids each level
  }
}

function spawnExplosion(x, y, gradient) {
  for (let i = 0; i < 6; i++) {
    const particle = {
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-3, 3),
      vy: random(-3, 3),
      alpha: 255,
      width: 30,
      height: 30,
      gol: new GoLEngine(3, 3, 30),  // Fast evolution (30fps)
      cellSize: 10,
      gradient: gradient,
      dead: false
    }

    seedRadialDensity(particle.gol, 0.8, 0.0)
    particles.push(particle)
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  // Render player with gradient (hide during game over)
  if (state.phase !== 'GAMEOVER') {
    push()
    translate(player.x, player.y)
    rotate(player.angle + Math.PI / 2)  // Adjust for sprite orientation
    maskedRenderer.renderMaskedGrid(
      player.gol,
      -player.width / 2,
      -player.height / 2,
      player.cellSize,
      player.gradient
    )
    pop()
  }

  // Render asteroids with gradients
  asteroids.forEach(asteroid => {
    push()
    translate(asteroid.x, asteroid.y)
    rotate(asteroid.rotation)
    maskedRenderer.renderMaskedGrid(
      asteroid.gol,
      -asteroid.width / 2,
      -asteroid.height / 2,
      asteroid.cellSize,
      asteroid.gradient
    )
    pop()
  })

  // Render bullets with gradients
  bullets.forEach(bullet => {
    maskedRenderer.renderMaskedGrid(
      bullet.gol,
      bullet.x - bullet.width / 2,
      bullet.y - bullet.height / 2,
      bullet.cellSize,
      bullet.gradient
    )
  })

  // Render particles with gradients and alpha
  renderParticles(particles, maskedRenderer)
}

function renderUI() {
  renderGameUI(CONFIG, state, [
    '← → or A/D: Rotate',
    '↑ or W: Thrust',
    'SPACE: Shoot'
  ])
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
// EXPORTS
// ============================================
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
