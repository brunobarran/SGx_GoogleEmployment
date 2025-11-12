/**
 * GAME TEMPLATE - Use this as starting point for new games
 *
 * This template demonstrates the standard pattern for all GoL Arcade games.
 * Copy this file and modify the marked sections to create your game.
 *
 * FEATURES:
 * - Uses helper functions (GoLHelpers, ParticleHelpers, UIHelpers)
 * - Consistent 60×60 sizing for main entities
 * - Standardized GoL evolution speeds
 * - Animated gradient rendering
 * - Simple, LLM-friendly structure
 *
 * CRITICAL: p5.js GLOBAL MODE
 * - This framework uses p5.js global mode (NOT instance mode)
 * - NEVER use 'this' or 'p5.' prefix for p5.js functions
 * - Use fill(), rect(), random() directly
 * - Helper functions do NOT receive 'this' parameter
 * - EXCEPTION: SimpleGradientRenderer constructor needs 'this'
 *
 * @author Game of Life Arcade
 * @license ISC
 */

// ============================================
// IMPORTS - Standard imports for all games
// ============================================
import { GoLEngine } from './GoLEngine.js'
import { SimpleGradientRenderer } from './SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from './utils/GradientPresets.js'
import { Collision } from './utils/Collision.js'
import { Patterns } from './utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from './utils/GoLHelpers.js'
import { updateParticles, renderParticles } from './utils/ParticleHelpers.js'
import { renderGameUI, renderGameOver } from './utils/UIHelpers.js'

// ============================================
// CONFIGURATION - Customize for your game
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

  // Game-specific config (CUSTOMIZE THIS)
  player: {
    width: 60,        // Standard: 60×60 for main entities
    height: 60,
    cellSize: 10,     // Standard: cellSize 10
    speed: 6
  }

  // Add your game-specific config here
  // enemy: { width: 60, height: 60, cellSize: 10, ... },
  // projectile: { width: 30, height: 30, cellSize: 10, ... },
}

// ============================================
// GAME STATE - Customize for your game
// ============================================
const state = {
  score: 0,
  lives: 1,           // Standard: 1 life
  phase: 'PLAYING',   // PLAYING | GAMEOVER | WIN
  frameCount: 0

  // Add game-specific state here
  // level: 1,
  // difficulty: 1,
}

// ============================================
// ENTITIES - Define your game entities
// ============================================
let player = null
let enemies = []
let projectiles = []
let particles = []

// Gradient renderer (DO NOT MODIFY)
let maskedRenderer = null

// ============================================
// p5.js SETUP - Standard setup (rarely needs modification)
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
  state.phase = 'PLAYING'
  state.frameCount = 0

  // Initialize your entities
  setupPlayer()
  // setupEnemies()

  enemies = []
  projectiles = []
  particles = []
}

// ============================================
// ENTITY SETUP - Create your entities with GoL
// ============================================

/**
 * STANDARD SIZES AND CONFIGURATIONS:
 *
 * Player/Main entities: 60×60, cellSize 10, GoLEngine(6, 6, 12)
 * Enemies/Bricks: 60×60, cellSize 10, GoLEngine(6, 6, 15)
 * Bullets/Projectiles: 30×30, cellSize 10, GoLEngine(3, 3, 0 or 15)
 * Explosions: 30×30 or 60×60, cellSize 10, GoLEngine(3-6, 3-6, 30)
 *
 * GRADIENTS: Use GRADIENT_PRESETS
 * - GRADIENT_PRESETS.PLAYER (blue)
 * - GRADIENT_PRESETS.ENEMY_HOT (red-orange)
 * - GRADIENT_PRESETS.ENEMY_COLD (blue-purple)
 * - GRADIENT_PRESETS.ENEMY_RAINBOW (multi-color)
 * - GRADIENT_PRESETS.BULLET (yellow)
 * - GRADIENT_PRESETS.EXPLOSION (red-yellow)
 */

function setupPlayer() {
  player = {
    x: CONFIG.width / 2,
    y: CONFIG.height - 100,
    width: CONFIG.player.width,
    height: CONFIG.player.height,
    cellSize: CONFIG.player.cellSize,

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
// UPDATE LOOP - Main game logic
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
  // Update player
  updatePlayer()

  // Update enemies (example)
  // enemies.forEach(enemy => {
  //   enemy.gol.updateThrottled(state.frameCount)
  //   applyLifeForce(enemy)
  // })

  // Update particles
  particles = updateParticles(particles, state.frameCount)

  // Check collisions
  // checkCollisions()

  // Update score
  state.score++
}

function updatePlayer() {
  // Player movement
  if (keyIsDown(LEFT_ARROW) || keyIsDown(65)) {  // A
    player.x -= CONFIG.player.speed
  }
  if (keyIsDown(RIGHT_ARROW) || keyIsDown(68)) {  // D
    player.x += CONFIG.player.speed
  }

  // Clamp to screen
  player.x = Collision.clamp(player.x, 0, CONFIG.width - player.width)

  // Update GoL with life force
  player.gol.updateThrottled(state.frameCount)
  applyLifeForce(player)
}

// ============================================
// RENDERING - Draw all game elements
// ============================================
function renderGame() {
  // Render player (hide during game over)
  if (state.phase !== 'GAMEOVER') {
    maskedRenderer.renderMaskedGrid(
      player.gol,
      player.x,
      player.y,
      player.cellSize,
      player.gradient
    )
  }

  // Render enemies (example)
  // enemies.forEach(enemy => {
  //   maskedRenderer.renderMaskedGrid(
  //     enemy.gol,
  //     enemy.x,
  //     enemy.y,
  //     enemy.cellSize,
  //     enemy.gradient
  //   )
  // })

  // Render particles with alpha
  renderParticles(particles, maskedRenderer)
}

function renderUI() {
  renderGameUI(CONFIG, state, [
    '← → or A/D: Move'
    // Add more control instructions here
  ])
}

// ============================================
// GAME LOGIC - Your game-specific functions
// ============================================

// Example: Spawn explosion particles
// function spawnExplosion(x, y) {
//   for (let i = 0; i < 6; i++) {
//     const particle = {
//       x: x + random(-10, 10),
//       y: y + random(-10, 10),
//       vx: random(-3, 3),
//       vy: random(-3, 3),
//       alpha: 255,
//       width: 30,
//       height: 30,
//       gol: new GoLEngine(3, 3, 30),
//       cellSize: 10,
//       gradient: GRADIENT_PRESETS.EXPLOSION,
//       dead: false
//     }
//     seedRadialDensity(particle.gol, 0.8, 0.0)
//     particles.push(particle)
//   }
// }

// Example: Check collisions
// function checkCollisions() {
//   enemies.forEach(enemy => {
//     if (Collision.rectRect(
//       player.x, player.y, player.width, player.height,
//       enemy.x, enemy.y, enemy.width, enemy.height
//     )) {
//       state.phase = 'GAMEOVER'
//       spawnExplosion(player.x + player.width/2, player.y + player.height/2)
//     }
//   })
// }

// ============================================
// INPUT HANDLING
// ============================================
function keyPressed() {
  if (key === ' ' && state.phase === 'GAMEOVER') {
    initGame()
  }
}

// ============================================
// EXPORTS - Make functions available to p5.js
// ============================================
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
