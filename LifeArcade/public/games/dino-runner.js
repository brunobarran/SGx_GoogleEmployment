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

import { GoLEngine } from '/src/core/GoLEngine.js'
import { SimpleGradientRenderer } from '/src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '/src/utils/GradientPresets.js'
import { Collision } from '/src/utils/Collision.js'
import { Patterns } from '/src/utils/Patterns.js'
import { seedRadialDensity, applyLifeForce, maintainDensity } from '/src/utils/GoLHelpers.js'
import { updateParticles, renderParticles } from '/src/utils/ParticleHelpers.js'
import { renderGameOver } from '/src/utils/UIHelpers.js'
import { createPatternRenderer, RenderMode, PatternName } from '/src/utils/PatternRenderer.js'
import { initHitboxDebug, drawHitboxRect, drawHitboxes } from '/src/debug/HitboxDebug.js'
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from '/src/utils/GameBaseConfig.js'

// ============================================
// CONFIGURATION - BASE REFERENCE (10:16 ratio)
// ============================================

const CONFIG = createGameConfig({
  gravity: 2.4,   // 0.8 × 3 = 2.4 (scaled for larger player)
  groundY: GAME_DIMENSIONS.BASE_HEIGHT * 0.6,  // 40% from bottom = 60% from top (1920 * 0.6 = 1152)
  horizonY: GAME_DIMENSIONS.BASE_HEIGHT * 0.6 - 15, // Visual horizon line (15px above ground)
  jumpForce: -54, // -18 × 3 = -54 (scaled for larger player)

  obstacle: {
    spawnInterval: 120,      // Increased from 90 to 120 (more spacing)
    minInterval: 45,         // Increased from 30 to 45
    speed: -18,              // Reduced from -27 (slower obstacles)
    speedIncrease: 0.001
  },

  parallax: {
    cloudDensity: 8,         // Number of clouds on screen
    cloudOpacity: 0.20,      // 20% opacity for subtle effect
    scrollSpeed: -1.5,       // Horizontal velocity (slower than obstacles)
    spawnInterval: 120,      // Every 2 seconds (120 frames)
    cellSize: 30,            // Cell size for cloud patterns
    patterns: [              // Still life patterns for clouds
      PatternName.BLOCK,
      PatternName.BEEHIVE,
      PatternName.LOAF,
      PatternName.BOAT,
      PatternName.TUB
    ]
  },

  obstaclePatterns: [
    // STILL LIFES (Period 1 - never change)
    {
      name: 'BLOCK',
      type: 'still-life',
      gridSize: { cols: 4, rows: 4 },      // 2×2 pattern + padding
      pattern: PatternName.BLOCK,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'BEEHIVE',
      type: 'still-life',
      gridSize: { cols: 6, rows: 5 },      // 4×3 pattern + padding
      pattern: PatternName.BEEHIVE,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    },
    {
      name: 'LOAF',
      type: 'still-life',
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.LOAF,
      gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
    },
    {
      name: 'BOAT',
      type: 'still-life',
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.BOAT,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'TUB',
      type: 'still-life',
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.TUB,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    },

    // OSCILLATORS (Static - phase 0 only, no animation)
    {
      name: 'BLINKER',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 5, rows: 5 },      // 3×3 pattern + padding
      pattern: PatternName.BLINKER,
      gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
    },
    {
      name: 'TOAD',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.TOAD,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'BEACON',
      type: 'still-life',  // Changed to still-life for static rendering
      gridSize: { cols: 6, rows: 6 },      // 4×4 pattern + padding
      pattern: PatternName.BEACON,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    }
  ],

  // Pterodactyl patterns (flying obstacles)
  pterodactylPatterns: [
    {
      name: 'LWSS_PHASE_2',
      type: 'flying',
      gridSize: { cols: 7, rows: 6 },      // LWSS is 5×4 + padding
      pattern: PatternName.LIGHTWEIGHT_SPACESHIP,
      phase: 2,  // Phase 2/4
      period: 4,
      gradient: GRADIENT_PRESETS.ENEMY_RAINBOW
    },
    {
      name: 'LWSS_PHASE_3',
      type: 'flying',
      gridSize: { cols: 7, rows: 6 },
      pattern: PatternName.LIGHTWEIGHT_SPACESHIP,
      phase: 3,  // Phase 3/4
      period: 4,
      gradient: GRADIENT_PRESETS.ENEMY_HOT
    },
    {
      name: 'LWSS_PHASE_4',
      type: 'flying',
      gridSize: { cols: 7, rows: 6 },
      pattern: PatternName.LIGHTWEIGHT_SPACESHIP,
      phase: 0,  // Phase 4/4 = Phase 0
      period: 4,
      gradient: GRADIENT_PRESETS.ENEMY_COLD
    }
  ]
})

// Store scale factor for rendering (don't modify CONFIG values)
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

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
const state = createGameState({
  spawnTimer: 0,
  cloudSpawnTimer: 0,  // Timer for cloud spawning
  gameSpeed: 1,
  dyingTimer: 0
})

// ============================================
// ENTITIES
// ============================================
let player = null
let obstacles = []
let particles = []
let clouds = []  // Parallax background clouds

// Gradient renderer
let maskedRenderer = null

// PNG sprite for player (Phase 3.4)
let dinoSprite = null

// ============================================
// RESPONSIVE CANVAS HELPERS
// ============================================
function calculateResponsiveSize() {
  const canvasHeight = windowHeight
  const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  // Only update scaleFactor based on canvas size
  scaleFactor = canvasHeight / GAME_DIMENSIONS.BASE_HEIGHT
}

// ============================================
// p5.js PRELOAD (Phase 3.4)
// ============================================
function preload() {
  // Load PNG sprite for player
  console.log('[Dino Runner] Loading dino sprite from /img/dino.png')
  dinoSprite = loadImage('/img/dino.png',
    () => console.log('[Dino Runner] Sprite loaded successfully:', dinoSprite.width, 'x', dinoSprite.height),
    (err) => console.error('[Dino Runner] Failed to load sprite:', err)
  )
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

  // Initialize hitbox debugging (press H to toggle)
  initHitboxDebug()

  initGame()
}

function initGame() {
  state.score = 0
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.spawnTimer = 0
  state.cloudSpawnTimer = 0
  state.gameSpeed = 1

  setupPlayer()
  obstacles = []
  particles = []
  initParallax()
}

function setupPlayer() {
  // CRITICAL DEVIATION FROM AUTHENTICITY (Phase 3.4)
  // Client requirement: PNG sprite for player (dino.png 200×200px)
  // Rationale: Brand recognition over GoL authenticity
  // Date: 2025-11-18
  // Status: APPROVED BY CLIENT
  // Reference: CLAUDE.md Section 14

  player = {
    x: 200,
    y: CONFIG.groundY - 200,  // groundY - height (sprite sits on physics ground)

    // DIMENSIONS: Must match PNG sprite exactly for accurate hitbox
    width: 200,               // PNG sprite width
    height: 200,              // PNG sprite height

    // Physics
    vx: 0,
    vy: 0,
    onGround: true,

    // PNG sprite (replaces GoL rendering)
    sprite: dinoSprite

    // NO gol property - using static PNG instead
    // NO cellSize - not needed for PNG
    // NO gradient - not needed for PNG
  }
}

// ============================================
// PARALLAX BACKGROUND SYSTEM (Phase 3.4)
// ============================================

/**
 * Initialize parallax cloud system.
 * Pre-populates the screen with clouds for seamless effect.
 */
function initParallax() {
  clouds = []

  // Pre-populate screen with clouds
  const spacing = GAME_DIMENSIONS.BASE_WIDTH / CONFIG.parallax.cloudDensity

  for (let i = 0; i < CONFIG.parallax.cloudDensity; i++) {
    const cloud = spawnCloud()
    // Distribute clouds across screen width
    cloud.x = i * spacing + random(-spacing * 0.3, spacing * 0.3)
    clouds.push(cloud)
  }
}

/**
 * Create a new cloud with random still life pattern.
 * @returns {Object} Cloud entity
 */
function spawnCloud() {
  // Select random pattern from still lifes
  const patternName = random(CONFIG.parallax.patterns)

  // Select random multicolor gradient for variety
  const gradients = [
    GRADIENT_PRESETS.ENEMY_HOT,
    GRADIENT_PRESETS.ENEMY_COLD,
    GRADIENT_PRESETS.ENEMY_RAINBOW
  ]
  const randomGradient = random(gradients)

  // Create renderer with static mode (still lifes don't evolve)
  const renderer = createPatternRenderer({
    mode: RenderMode.STATIC,
    pattern: patternName,
    phase: 0,  // Still lifes are always phase 0
    globalCellSize: CONFIG.parallax.cellSize,
    loopUpdateRate: 10  // Not used for static mode, but required
  })

  const dims = renderer.dimensions

  const cloud = {
    x: GAME_DIMENSIONS.BASE_WIDTH,  // Start off-screen right
    y: random(100, 800),  // Random vertical position
    vx: CONFIG.parallax.scrollSpeed,
    pattern: patternName,
    gol: renderer.gol,
    width: dims.width,
    height: dims.height,
    cellSize: CONFIG.parallax.cellSize,
    gradient: randomGradient,  // Multicolor gradient
    dead: false
  }

  return cloud
}

/**
 * Update all clouds in parallax background.
 * Handles movement, cleanup, and spawning.
 */
function updateClouds() {
  // Move clouds
  clouds.forEach(cloud => {
    cloud.x += cloud.vx

    // Mark as dead if off-screen left
    if (cloud.x < -cloud.width) {
      cloud.dead = true
    }
  })

  // Remove dead clouds
  clouds = clouds.filter(c => !c.dead)

  // Spawn new cloud if timer reached
  state.cloudSpawnTimer++
  if (state.cloudSpawnTimer >= CONFIG.parallax.spawnInterval) {
    clouds.push(spawnCloud())
    state.cloudSpawnTimer = 0
  }
}

/**
 * Render parallax clouds with opacity.
 * Must be called BEFORE rendering other entities (background layer).
 */
function renderClouds() {
  push()

  // Create a graphics buffer for clouds with opacity
  const cloudGraphics = createGraphics(GAME_DIMENSIONS.BASE_WIDTH, GAME_DIMENSIONS.BASE_HEIGHT)
  cloudGraphics.clear()

  clouds.forEach(cloud => {
    // Render each cell with multicolor gradient and transparency
    const grid = cloud.gol.current
    const cols = cloud.gol.cols
    const rows = cloud.gol.rows

    cloudGraphics.noStroke()

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y] === 1) {
          const px = cloud.x + x * cloud.cellSize
          const py = cloud.y + y * cloud.cellSize

          // Get gradient color from maskedRenderer (uses Perlin noise)
          const [r, g, b] = maskedRenderer.getGradientColor(
            px + cloud.cellSize / 2,
            py + cloud.cellSize / 2
          )

          // Apply opacity to the gradient color
          cloudGraphics.fill(r, g, b, CONFIG.parallax.cloudOpacity * 255)
          cloudGraphics.rect(px, py, cloud.cellSize, cloud.cellSize)
        }
      }
    }
  })

  // Draw the buffer to main canvas
  image(cloudGraphics, 0, 0)
  cloudGraphics.remove()  // Clean up

  pop()
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

  // Update score in header (if element exists)
  const scoreElement = document.getElementById('score-value')
  if (scoreElement) {
    scoreElement.textContent = state.score
  }

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
  // Update parallax background (BEFORE other entities)
  updateClouds()

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

  // Update obstacles (Phase 3.4: GoL patterns + static pterodactyls)
  obstacles.forEach(obs => {
    obs.x += obs.vx * state.gameSpeed

    // Update GoL according to type
    if (obs.type === 'oscillator') {
      // Only oscillators animate (BLINKER, TOAD, BEACON)
      obs.gol.updateThrottled(state.frameCount)
    }
    // Still lifes and flying pterodactyls are static
    // They are frozen by PatternRenderer with RenderMode.STATIC

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

  // NO GoL update - player uses static PNG sprite (Phase 3.4)
}

function spawnObstacle() {
  // Phase 3.4: Randomly choose between ground obstacles and flying pterodactyls
  const spawnFlying = random() < 0.3  // 30% chance of pterodactyl
  const patternConfig = spawnFlying
    ? random(CONFIG.pterodactylPatterns)
    : random(CONFIG.obstaclePatterns)

  // Create renderer using PatternRenderer
  const renderer = createPatternRenderer({
    mode: (patternConfig.type === 'still-life' || patternConfig.type === 'flying') ? RenderMode.STATIC : RenderMode.LOOP,
    pattern: patternConfig.pattern,
    phase: patternConfig.phase !== undefined ? patternConfig.phase : undefined,
    globalCellSize: 30,
    loopUpdateRate: 10  // 10fps for oscillators only
  })

  const dims = renderer.dimensions

  // Position based on obstacle type
  let obstacleY
  if (spawnFlying) {
    // Flying obstacles: random height above horizon line
    obstacleY = CONFIG.horizonY - 300
  } else {
    // Ground obstacles: centered on horizon line
    obstacleY = CONFIG.horizonY - dims.height * 0.5
  }

  // Reduce hitbox for flying pterodactyls (KISS: 60% of visual size)
  let hitboxWidth = dims.width
  let hitboxHeight = dims.height
  let hitboxOffsetX = 0
  let hitboxOffsetY = 0

  if (spawnFlying) {
    // LWSS has padding - reduce hitbox to 60% and center it
    hitboxWidth = dims.width * 0.6
    hitboxHeight = dims.height * 0.6
    hitboxOffsetX = (dims.width - hitboxWidth) / 2
    hitboxOffsetY = (dims.height - hitboxHeight) / 2
  }

  const obstacle = {
    x: GAME_DIMENSIONS.BASE_WIDTH,
    y: obstacleY,
    width: dims.width,      // Visual width (full pattern)
    height: dims.height,    // Visual height (full pattern)
    hitboxWidth,            // Collision width (tighter for pterodactyls)
    hitboxHeight,           // Collision height (tighter for pterodactyls)
    hitboxOffsetX,          // Hitbox offset from x
    hitboxOffsetY,          // Hitbox offset from y
    vx: CONFIG.obstacle.speed,
    gol: renderer.gol,
    cellSize: 30,
    gradient: patternConfig.gradient,
    type: patternConfig.type,  // 'still-life', 'oscillator', or 'flying'
    name: patternConfig.name,
    dead: false,
    isFlying: spawnFlying  // Track if this is a flying obstacle
  }

  obstacles.push(obstacle)
}

function updateParticlesOnly() {
  particles = updateParticles(particles, state.frameCount)
}

function checkCollisions() {
  obstacles.forEach(obs => {
    // Use custom hitbox dimensions if available (for pterodactyls)
    const obsHitboxX = obs.x + (obs.hitboxOffsetX || 0)
    const obsHitboxY = obs.y + (obs.hitboxOffsetY || 0)
    const obsHitboxWidth = obs.hitboxWidth || obs.width
    const obsHitboxHeight = obs.hitboxHeight || obs.height

    if (Collision.rectRect(
      player.x, player.y, player.width, player.height,
      obsHitboxX, obsHitboxY, obsHitboxWidth, obsHitboxHeight
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

  // Render parallax clouds (BEFORE all other entities - background layer)
  renderClouds()

  // Horizon line (aesthetic - drawn above physics ground)
  stroke(CONFIG.ui.textColor)
  strokeWeight(2)
  line(0, CONFIG.horizonY, GAME_DIMENSIONS.BASE_WIDTH, CONFIG.horizonY)

  // Render player with PNG sprite (hide during DYING and GAMEOVER)
  // Phase 3.4: Using static PNG instead of GoL
  if (state.phase === 'PLAYING' && player.sprite) {
    image(
      player.sprite,
      player.x,
      player.y,
      player.width,   // 200px - matches hitbox exactly
      player.height   // 200px - matches hitbox exactly
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
  // Note: ParticleHelpers uses globalCellSize parameter, but particles have individual cellSize
  // We pass 30 as the standard cellSize for dino-runner particles
  renderParticles(particles, maskedRenderer, 30)

  // Debug: Draw hitboxes (press H to toggle)
  drawHitboxRect(player.x, player.y, player.width, player.height, 'player', '#00FF00')

  // Draw obstacle hitboxes (using custom hitbox dimensions for pterodactyls)
  obstacles.forEach((obs, index) => {
    const obsHitboxX = obs.x + (obs.hitboxOffsetX || 0)
    const obsHitboxY = obs.y + (obs.hitboxOffsetY || 0)
    const obsHitboxWidth = obs.hitboxWidth || obs.width
    const obsHitboxHeight = obs.hitboxHeight || obs.height
    drawHitboxRect(obsHitboxX, obsHitboxY, obsHitboxWidth, obsHitboxHeight, `obstacle ${index}`, '#FF0000')
  })

  pop()
}

// UI rendering removed - now handled by game-wrapper.html overlay

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
window.preload = preload
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
