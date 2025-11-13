// ===== IMPORTS (Standard - DO NOT MODIFY) =====
import { GoLEngine } from '../src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '../src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../src/utils/GradientPresets.js'
import { Collision } from '../src/utils/Collision.js'
import { Patterns } from '../src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '../src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '../src/utils/ParticleHelpers.js'
import { renderGameUI } from '../src/utils/UIHelpers.js' // renderGameOver not needed

// ===== CONFIG =====
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
  // --- Game-specific config ---
  PADDLE_WIDTH: 60,
  PADDLE_HEIGHT: 180, // 3 segments of 60px
  PADDLE_SPEED: 6,
  BALL_SIZE: 60,
  INITIAL_BALL_SPEED: 5,
  MAX_BALL_SPEED: 10,
  BALL_SPEED_INCREASE: 0.5,
  AI_SPEED_FACTOR: 0.7,
  WINNING_SCORE: 5,
}

// ===== STATE =====
const state = {
  playerScore: 0,
  aiScore: 0,
  lives: 1, // ALWAYS 1
  phase: 'PLAYING', // PLAYING | WIN | LOSE
  frameCount: 0,
  winner: null,
}

// ===== ENTITIES =====
let playerPaddle = null
let aiPaddle = null
let ball = null
let maskedRenderer = null
// No particles needed for this game

// ===== HELPER FUNCTIONS =====

/**
 * Creates a paddle object with three 60x60 segments.
 * @param {number} x - The x-coordinate of the paddle.
 * @param {Array<number>} gradient - The gradient preset to use for rendering.
 * @returns {object} The created paddle object.
 */
function createPaddle(x, gradient) {
  const paddle = {
    x: x,
    y: CONFIG.height / 2 - CONFIG.PADDLE_HEIGHT / 2,
    width: CONFIG.PADDLE_WIDTH,
    height: CONFIG.PADDLE_HEIGHT,
    segments: [],
  }

  for (let i = 0; i < 3; i++) {
    const segment = {
      width: CONFIG.PADDLE_WIDTH,
      height: CONFIG.PADDLE_WIDTH, // Segments are 60x60
      cellSize: 10,
      gol: new GoLEngine(6, 6, 12), // Modified GoL with life force
      gradient: gradient,
    }
    seedRadialDensity(segment.gol, 0.85, 0.0)
    paddle.segments.push(segment)
  }
  return paddle
}

/**
 * Resets the ball to the center with a random direction.
 */
function resetBall() {
  ball = {
    x: CONFIG.width / 2 - CONFIG.BALL_SIZE / 2,
    y: CONFIG.height / 2 - CONFIG.BALL_SIZE / 2,
    width: CONFIG.BALL_SIZE,
    height: CONFIG.BALL_SIZE,
    cellSize: 10,
    speed: CONFIG.INITIAL_BALL_SPEED,
    vx: 0,
    vy: 0,
    gol: new GoLEngine(6, 6, 0), // Visual only
    gradient: GRADIENT_PRESETS.BULLET,
  }
  seedRadialDensity(ball.gol, 0.9, 0.0)

  // Set initial velocity
  let angle = random(-PI / 4, PI / 4) // Angle towards players
  ball.vx = ball.speed * cos(angle)
  ball.vy = ball.speed * sin(angle)

  // Randomly serve to player or AI
  if (random() > 0.5) {
    ball.vx *= -1
  }
}

/**
 * Renders the custom end screen message.
 */
function renderEndScreen() {
  textAlign(CENTER, CENTER)
  textSize(64)
  fill(CONFIG.ui.accentColor)
  text(state.winner, CONFIG.width / 2, CONFIG.height / 2 - 40)

  textSize(CONFIG.ui.fontSize)
  fill(CONFIG.ui.textColor)
  text('Press SPACE to restart', CONFIG.width / 2, CONFIG.height / 2 + 20)
}

/**
 * Renders a paddle by drawing its three segments.
 * @param {object} paddle - The paddle object to render.
 */
function renderPaddle(paddle) {
  for (let i = 0; i < 3; i++) {
    const segment = paddle.segments[i]
    const x = paddle.x
    const y = paddle.y + i * segment.height
    maskedRenderer.renderMaskedGrid(segment.gol, x, y, segment.cellSize, segment.gradient)
  }
}

// ===== GAME LOGIC =====

/**
 * Initializes the game state, creating paddles and the ball.
 */
function initGame() {
  state.playerScore = 0
  state.aiScore = 0
  state.phase = 'PLAYING'
  state.winner = null

  playerPaddle = createPaddle(30, GRADIENT_PRESETS.PLAYER)
  aiPaddle = createPaddle(CONFIG.width - CONFIG.PADDLE_WIDTH - 30, GRADIENT_PRESETS.ENEMY_HOT)
  resetBall()
}

/**
 * Updates the player paddle's position based on input.
 */
function updatePlayerPaddle() {
  if (keyIsDown(87) || keyIsDown(UP_ARROW)) { // W or Up Arrow
    playerPaddle.y -= CONFIG.PADDLE_SPEED
  }
  if (keyIsDown(83) || keyIsDown(DOWN_ARROW)) { // S or Down Arrow
    playerPaddle.y += CONFIG.PADDLE_SPEED
  }
  playerPaddle.y = Collision.clamp(playerPaddle.y, 0, CONFIG.height - CONFIG.PADDLE_HEIGHT)

  playerPaddle.segments.forEach(segment => {
    segment.gol.updateThrottled(state.frameCount)
    applyLifeForce(segment)
  })
}

/**
 * Updates the AI paddle's position to follow the ball.
 */
function updateAiPaddle() {
  const paddleCenterY = aiPaddle.y + aiPaddle.height / 2
  const ballCenterY = ball.y + ball.height / 2
  const distance = ballCenterY - paddleCenterY

  // Move towards ball with damping
  aiPaddle.y += distance * CONFIG.AI_SPEED_FACTOR * 0.15 // Adjust multiplier for smoother movement

  aiPaddle.y = Collision.clamp(aiPaddle.y, 0, CONFIG.height - CONFIG.PADDLE_HEIGHT)

  aiPaddle.segments.forEach(segment => {
    segment.gol.updateThrottled(state.frameCount)
    applyLifeForce(segment)
  })
}

/**
 * Updates the ball's position and handles all collisions.
 */
function updateBall() {
  // Move ball
  ball.x += ball.vx
  ball.y += ball.vy

  // Maintain visual density
  if (state.frameCount % 5 === 0) {
    maintainDensity(ball, 0.75)
  }

  // Wall collisions (top/bottom)
  if (ball.y <= 0 || ball.y + ball.height >= CONFIG.height) {
    ball.vy *= -1
  }

  // Scoring
  if (ball.x + ball.width < 0) {
    state.aiScore++
    resetBall()
  } else if (ball.x > CONFIG.width) {
    state.playerScore++
    resetBall()
  }

  // Check for winner
  if (state.playerScore >= CONFIG.WINNING_SCORE) {
    state.phase = 'WIN'
    state.winner = 'YOU WIN!'
  } else if (state.aiScore >= CONFIG.WINNING_SCORE) {
    state.phase = 'LOSE'
    state.winner = 'AI WINS!'
  }

  // Paddle collisions
  const ballRadius = ball.width / 2
  const ballCenterX = ball.x + ballRadius
  const ballCenterY = ball.y + ballRadius

  // Player paddle collision
  if (Collision.circleRect(ballCenterX, ballCenterY, ballRadius, playerPaddle.x, playerPaddle.y, playerPaddle.width, playerPaddle.height)) {
    ball.vx *= -1
    ball.x = playerPaddle.x + playerPaddle.width // prevent sticking
    ball.speed = min(CONFIG.MAX_BALL_SPEED, ball.speed + CONFIG.BALL_SPEED_INCREASE)
    const speedMagnitude = sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    ball.vx = (ball.vx / speedMagnitude) * ball.speed
    ball.vy = (ball.vy / speedMagnitude) * ball.speed
  }

  // AI paddle collision
  if (Collision.circleRect(ballCenterX, ballCenterY, ballRadius, aiPaddle.x, aiPaddle.y, aiPaddle.width, aiPaddle.height)) {
    ball.vx *= -1
    ball.x = aiPaddle.x - ball.width // prevent sticking
    ball.speed = min(CONFIG.MAX_BALL_SPEED, ball.speed + CONFIG.BALL_SPEED_INCREASE)
    const speedMagnitude = sqrt(ball.vx * ball.vx + ball.vy * ball.vy)
    ball.vx = (ball.vx / speedMagnitude) * ball.speed
    ball.vy = (ball.vy / speedMagnitude) * ball.speed
  }
}

/**
 * Main update function called when the game is playing.
 */
function updateGame() {
  updatePlayerPaddle()
  updateAiPaddle()
  updateBall()
}

/**
 * Renders all game entities.
 */
function renderGame() {
  // Draw center line
  stroke(CONFIG.ui.textColor)
  strokeWeight(4)
  drawingContext.setLineDash([10, 15])
  line(CONFIG.width / 2, 0, CONFIG.width / 2, CONFIG.height)
  noStroke()
  drawingContext.setLineDash([])

  // Render entities
  renderPaddle(playerPaddle)
  renderPaddle(aiPaddle)
  maskedRenderer.renderMaskedGrid(ball.gol, ball.x, ball.y, ball.cellSize, ball.gradient)
}

/**
 * Renders the UI elements like score and controls.
 */
function renderUI() {
  // Render standard controls UI
  renderGameUI(CONFIG, state, ['W/S or ↑↓: Move', 'SPACE: Restart'])

  // Render score
  fill(CONFIG.ui.textColor)
  textSize(32)
  textAlign(CENTER, TOP)
  textFont(CONFIG.ui.font)
  text(`PLAYER: ${state.playerScore} | AI: ${state.aiScore}`, CONFIG.width / 2, 10)
}

// ===== P5.js MAIN FUNCTIONS =====

function setup() {
  createCanvas(CONFIG.width, CONFIG.height)
  frameRate(60)
  maskedRenderer = new SimpleGradientRenderer(this)
  initGame()
}

function draw() {
  state.frameCount++
  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  }

  renderGame()
  renderUI()
  maskedRenderer.updateAnimation()

  if (state.phase === 'WIN' || state.phase === 'LOSE') {
    renderEndScreen()
  }
}

function keyPressed() {
  if (keyCode === 32 && (state.phase === 'WIN' || state.phase === 'LOSE')) { // Space bar
    initGame()
  }
}

// ===== EXPORTS =====
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
