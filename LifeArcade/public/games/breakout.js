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
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from '../src/utils/GameBaseConfig.js'

// ============================================
// CONFIGURATION - Using GameBaseConfig
// ============================================
const CONFIG = createGameConfig({

  paddle: {
    width: 450,   // 150 × 3 = 450
    height: 75,   // 25 × 3 = 75
    speed: 30,    // 10 × 3 = 30
    y: 1850
  },

  ball: {
    radius: 120,  // 40 × 3 = 120
    speed: 18,    // 6 × 3 = 18
    maxAngle: Math.PI / 3
  },

  brick: {
    rows: 3,      // 3 rows for cleaner layout
    cols: 3,      // 3 columns for balanced grid
    width: 240,   // 80 × 3 = 240
    height: 240,  // 80 × 3 = 240
    padding: 60,  // Unified spacing: 60px (same as Space Invaders for visual consistency)
    offsetX: 180, // Centered: 3×240 + 2×60 = 720 + 120 = 840px, (1200-840)/2 = 180px
    offsetY: 200  // Unified starting position with Space Invaders (same as startY)
  }
})

// Store scale factor for rendering (using GameBaseConfig)
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

// Brick patterns with gradients
const BRICK_PATTERNS = [
  { name: 'SHIP', scoreValue: 30, gradient: GRADIENT_PRESETS.ENEMY_HOT },
  { name: 'BOAT', scoreValue: 40, gradient: GRADIENT_PRESETS.ENEMY_COLD },
  { name: 'TUB', scoreValue: 50, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW }
]

// ============================================
// GAME STATE (using GameBaseConfig)
// ============================================
const state = createGameState({
  level: 1,
  dyingTimer: 0,
  isWin: false
})

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
// RESPONSIVE CANVAS HELPERS (using GameBaseConfig)
// ============================================
function calculateResponsiveSize() {
  const canvasHeight = windowHeight
  const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size, don't modify CONFIG values
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
      Math.floor(CONFIG.paddle.width / 30),   // 15 cells for 450px width (450/30 = 15)
      Math.floor(CONFIG.paddle.height / 30),  // 2-3 cells for 75px height (75/30 = 2.5)
      12
    ),
    cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
    gradient: GRADIENT_PRESETS.PLAYER
  }

  // Seed with radial density
  seedRadialDensity(paddle.gol, 0.85, 0.0)

  // Add accent pattern
  paddle.gol.setPattern(Patterns.BLINKER, 7, 0)  // Scaled: 4 × 1.75 ≈ 7 (centered in 15 cols)
}

function setupBall() {
  ball = {
    x: CONFIG.width / 2,
    y: CONFIG.paddle.y - 120,  // 40 × 3 = 120
    radius: CONFIG.ball.radius,
    vx: CONFIG.ball.speed * (Math.random() > 0.5 ? 1 : -1),
    vy: -CONFIG.ball.speed,
    stuck: false,  // Ball starts moving
    gol: new GoLEngine(3, 3, 15),  // 3×3 grid maintained
    cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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
          Math.floor(CONFIG.brick.width / 30),   // 8 cells for 240px (240/30 = 8)
          Math.floor(CONFIG.brick.height / 30),  // 8 cells for 240px (square)
          15  // Same evolution speed as Space Invaders
        ),
        cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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
  } else if (state.phase === 'DYING') {
    // Continue updating particles during death animation
    state.dyingTimer++
    particles = updateParticles(particles, state.frameCount)

    // Transition to GAMEOVER/WIN when particles done or timeout reached
    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = state.isWin ? 'WIN' : 'GAMEOVER'

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
  if (bricks.length === 0 && state.phase !== 'DYING' && state.phase !== 'WIN') {
    state.phase = 'DYING'
    state.dyingTimer = 0
    state.isWin = true  // Flag to show WIN screen instead of GAMEOVER
    // Note: postMessage will be sent after particle animation completes
  }

  if (state.lives <= 0 && state.phase !== 'GAMEOVER' && state.phase !== 'DYING') {
    state.phase = 'DYING'
    state.dyingTimer = 0
    state.isWin = false  // Flag to show GAMEOVER screen
    // Note: postMessage will be sent after particle animation completes
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
  ball.y = paddle.y - 120  // 40 × 3 = 120
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
      x: x + random(-30, 30),  // -10 to 10 × 3
      y: y + random(-30, 30),
      vx: random(-6, 6),       // -2 to 2 × 3
      vy: random(-6, 6),
      alpha: 255,
      width: 90,   // 30 × 3 = 90 (3 cells × 30 cellSize)
      height: 90,
      gol: new GoLEngine(3, 3, 30),  // 3×3 grid maintained
      cellSize: 30,  // Scaled to 30px (3x from 10px baseline)
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

  // Render ball with gradient (hide during DYING, GAMEOVER, and WIN)
  if (state.phase === 'PLAYING') {
    maskedRenderer.renderMaskedGrid(
      ball.gol,
      ball.x - ball.radius,
      ball.y - ball.radius,
      ball.cellSize,
      ball.gradient
    )
  }

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
