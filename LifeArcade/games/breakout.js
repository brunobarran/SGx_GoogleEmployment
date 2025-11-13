/**
 * Breakout GOL - Classic brick breaker with Game of Life aesthetic
 *
 * Based on game-template.js
 * Paddle uses Modified GoL with life force
 * Ball uses Visual Only (maintains density)
 * Bricks use various GoL patterns
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
import { renderGameUI, renderGameOver, renderWin } from '../src/utils/UIHelpers.js'

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

  paddle: {
    width: 150,
    height: 25,
    speed: 10,
    y: 1850
  },

  ball: {
    radius: 40,
    speed: 6,
    maxAngle: Math.PI / 3
  },

  brick: {
    rows: 8,
    cols: 6,
    width: 80,
    height: 80,
    padding: 40,
    offsetX: 180,
    offsetY: 150
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

// Brick patterns with gradients
const BRICK_PATTERNS = [
  { name: 'SHIP', scoreValue: 30, gradient: GRADIENT_PRESETS.ENEMY_HOT },
  { name: 'BOAT', scoreValue: 40, gradient: GRADIENT_PRESETS.ENEMY_COLD },
  { name: 'TUB', scoreValue: 50, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW }
]

// ============================================
// GAME STATE
// ============================================
const state = {
  score: 0,
  lives: 1,
  level: 1,
  phase: 'PLAYING',
  frameCount: 0
}

// ============================================
// ENTITIES
// ============================================
let paddle = null
let ball = null
let bricks = []
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

  // Create gradient renderer
  maskedRenderer = new SimpleGradientRenderer(this)

  initGame()
}

function initGame() {
  state.score = 0
  state.lives = 1
  state.level = 1
  state.phase = 'PLAYING'
  state.frameCount = 0

  setupPaddle()
  setupBall()
  setupBricks()
  particles = []
}

function setupPaddle() {
  paddle = {
    x: CONFIG.width / 2 - CONFIG.paddle.width / 2,
    y: CONFIG.paddle.y,
    width: CONFIG.paddle.width,
    height: CONFIG.paddle.height,
    vx: 0,
    gol: new GoLEngine(
      Math.floor(CONFIG.paddle.width / 10),   // 10 cells for 100px width
      Math.floor(CONFIG.paddle.height / 10),  // 2 cells for 20px height
      12
    ),
    cellSize: 10,  // Same as Space Invaders
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density
  seedRadialDensity(paddle.gol, 0.85, 0.0)

  // Add accent pattern
  paddle.gol.setPattern(Patterns.BLINKER, 4, 0)
}

function setupBall() {
  ball = {
    x: CONFIG.width / 2,
    y: CONFIG.paddle.y - 40,
    radius: CONFIG.ball.radius,
    vx: CONFIG.ball.speed * (Math.random() > 0.5 ? 1 : -1),
    vy: -CONFIG.ball.speed,
    stuck: false,  // Ball starts moving
    gol: new GoLEngine(3, 3, 15),  // 3x3 grid (same as Space Invaders bullet)
    cellSize: 10,  // Same as Space Invaders
    gradient: GRADIENT_PRESETS.BULLET
  }

  // Seed with radial density
  seedRadialDensity(ball.gol, 0.9, 0.0)
}

function setupBricks() {
  bricks = []

  for (let row = 0; row < CONFIG.brick.rows; row++) {
    for (let col = 0; col < CONFIG.brick.cols; col++) {
      // Cycle through gradients
      const patternInfo = BRICK_PATTERNS[row % BRICK_PATTERNS.length]

      const brick = {
        x: CONFIG.brick.offsetX + col * (CONFIG.brick.width + CONFIG.brick.padding),
        y: CONFIG.brick.offsetY + row * (CONFIG.brick.height + CONFIG.brick.padding),
        width: CONFIG.brick.width,
        height: CONFIG.brick.height,
        row: row,
        col: col,
        scoreValue: patternInfo.scoreValue,
        gol: new GoLEngine(
          Math.floor(CONFIG.brick.width / 10),   // 6 cells for 60px
          Math.floor(CONFIG.brick.height / 10),  // 6 cells for 60px (square like invaders)
          15  // Same evolution speed as Space Invaders invaders
        ),
        cellSize: 10,  // Same as Space Invaders
        gradient: patternInfo.gradient,
        dead: false
      }

      // Seed with higher density to maintain more cells (same as invaders)
      seedRadialDensity(brick.gol, 0.75, 0.0)

      bricks.push(brick)
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

  // Update gradient animation
  maskedRenderer.updateAnimation()

  // Only show Game Over/Win screen in standalone mode
  if (state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  } else if (state.phase === 'WIN') {
    if (window.parent === window) {
      renderWin(width, height, state.score)
    }
  }
}

function updateGame() {
  // Update paddle
  updatePaddle()

  // Update ball
  updateBall()

  // Update bricks with life force to maintain density
  bricks.forEach(brick => {
    brick.gol.updateThrottled(state.frameCount)
    // Maintain minimum density to prevent bricks from disappearing
    applyLifeForce(brick)
  })

  // Update particles (Pure GoL for explosion effect)
  particles = updateParticles(particles, state.frameCount)

  // Check collisions
  checkCollisions()

  // Check win/lose
  if (bricks.length === 0) {
    state.phase = 'WIN'

    // Send postMessage to parent if in installation
    if (window.parent !== window) {
      window.parent.postMessage({
        type: 'gameOver',
        payload: { score: state.score }
      }, '*')
    }
  }

  if (state.lives <= 0 && state.phase !== 'GAMEOVER') {
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

function updatePaddle() {
  // Movement
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {  // A
    paddle.vx = -CONFIG.paddle.speed
  } else if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {  // D
    paddle.vx = CONFIG.paddle.speed
  } else {
    paddle.vx = 0
  }

  paddle.x += paddle.vx
  paddle.x = Collision.clamp(paddle.x, 0, CONFIG.width - paddle.width)

  // Update GoL (Modified GoL with life force)
  paddle.gol.updateThrottled(state.frameCount)
  applyLifeForce(paddle)
}

function updateBall() {
  if (ball.stuck) {
    // Ball follows paddle when stuck
    ball.x = paddle.x + paddle.width / 2
    ball.y = paddle.y - 40

    // Release on space
    if (keyIsDown(32)) {  // SPACE
      ball.stuck = false
      ball.vy = -CONFIG.ball.speed
      ball.vx = CONFIG.ball.speed * (Math.random() > 0.5 ? 1 : -1)
    }
  } else {
    // Normal movement
    ball.x += ball.vx
    ball.y += ball.vy

    // Use actual collision radius for wall collisions
    const actualRadius = ball.radius * 0.5

    // Wall collisions
    if (ball.x - actualRadius < 0 || ball.x + actualRadius > CONFIG.width) {
      ball.vx *= -1
      ball.x = Collision.clamp(ball.x, actualRadius, CONFIG.width - actualRadius)
    }

    if (ball.y - actualRadius < 0) {
      ball.vy *= -1
      ball.y = actualRadius
    }

    // Bottom edge - lose life
    if (ball.y - actualRadius > CONFIG.height) {
      state.lives--
      if (state.lives > 0) {
        resetBall()
      }
    }
  }

  // Update GoL (Visual Only - maintain predictable appearance)
  if (state.frameCount % 6 === 0) {
    maintainDensity(ball, 0.7)
  }
}

function resetBall() {
  ball.x = paddle.x + paddle.width / 2
  ball.y = paddle.y - 40
  ball.vx = 0
  ball.vy = 0
  ball.stuck = true
}

function checkCollisions() {
  // Ball center (ball position is top-left corner because we draw it offset by radius)
  const ballCenterX = ball.x
  const ballCenterY = ball.y
  const ballActualRadius = ball.radius * 0.5  // Use smaller collision radius (half visual size)

  // Ball vs paddle
  if (Collision.circleRect(
    ballCenterX, ballCenterY, ballActualRadius,
    paddle.x, paddle.y, paddle.width, paddle.height
  )) {
    // Bounce ball
    ball.vy = -Math.abs(ball.vy)
    ball.y = paddle.y - ballActualRadius  // Position ball above paddle

    // Angle based on hit position
    const hitPos = (ballCenterX - paddle.x) / paddle.width  // 0 to 1
    const angle = Collision.lerp(-CONFIG.ball.maxAngle, CONFIG.ball.maxAngle, hitPos)

    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    ball.vx = speed * Math.sin(angle)
    ball.vy = -speed * Math.cos(angle)

    // Ensure minimum vertical speed
    if (Math.abs(ball.vy) < CONFIG.ball.speed * 0.5) {
      ball.vy = -CONFIG.ball.speed * 0.7
    }
  }

  // Ball vs bricks
  bricks.forEach(brick => {
    if (Collision.circleRect(
      ballCenterX, ballCenterY, ballActualRadius,
      brick.x, brick.y, brick.width, brick.height
    )) {
      // Determine bounce direction based on hit side
      const brickCenterX = brick.x + brick.width / 2
      const brickCenterY = brick.y + brick.height / 2

      const dx = ballCenterX - brickCenterX
      const dy = ballCenterY - brickCenterY

      if (Math.abs(dx / brick.width) > Math.abs(dy / brick.height)) {
        // Hit left or right side
        ball.vx *= -1
      } else {
        // Hit top or bottom
        ball.vy *= -1
      }

      // Mark brick as dead
      brick.dead = true
      state.score += brick.scoreValue

      // Spawn explosion
      spawnExplosion(brick.x + brick.width / 2, brick.y + brick.height / 2, brick.gradient)
    }
  })

  bricks = bricks.filter(b => !b.dead)
}

function spawnExplosion(x, y, brickGradient) {
  for (let i = 0; i < 4; i++) {  // Fewer particles
    const particle = {
      x: x + random(-10, 10),
      y: y + random(-10, 10),
      vx: random(-2, 2),
      vy: random(-2, 2),
      alpha: 255,
      width: 30,   // Smaller explosions (3 cells x 10 cellSize)
      height: 30,
      gol: new GoLEngine(3, 3, 30),  // Smaller grid
      cellSize: 10,
      gradient: brickGradient || GRADIENT_PRESETS.EXPLOSION,
      dead: false
    }

    // Seed with radial density
    seedRadialDensity(particle.gol, 0.8, 0.0)

    particles.push(particle)
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  push()
  scale(scaleFactor)

  // Render paddle with gradient
  maskedRenderer.renderMaskedGrid(
    paddle.gol,
    paddle.x,
    paddle.y,
    paddle.cellSize,
    paddle.gradient
  )

  // Render ball with gradient
  maskedRenderer.renderMaskedGrid(
    ball.gol,
    ball.x - ball.radius,
    ball.y - ball.radius,
    ball.cellSize,
    ball.gradient
  )

  // Render bricks with gradients
  bricks.forEach(brick => {
    maskedRenderer.renderMaskedGrid(
      brick.gol,
      brick.x,
      brick.y,
      brick.cellSize,
      brick.gradient
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
    '← → or A/D: Move',
    'SPACE: Launch'
  ])

  pop()
}

// ============================================
// INPUT
// ============================================
function keyPressed() {
  if (key === ' ' && (state.phase === 'GAMEOVER' || state.phase === 'WIN')) {
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

// Export for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
