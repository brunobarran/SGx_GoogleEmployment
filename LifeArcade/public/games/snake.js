/**
 * Trail of Life - Snake with Game of Life Patterns
 *
 * Each snake segment is an authentic GoL pattern.
 * When the snake eats food, that pattern becomes the new tail segment.
 * Creates a visual "trail of life patterns" as the snake grows.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from '/src/core/GoLEngine.js'
import { VideoGradientRenderer } from '/src/rendering/VideoGradientRenderer.js'
import { GRADIENT_PRESETS } from '/src/utils/GradientPresets.js'
import { Patterns, stampPattern } from '/src/utils/Patterns.js'
import { updateParticles, renderParticles } from '/src/utils/ParticleHelpers.js'
import { renderGameOver } from '/src/utils/UIHelpers.js'
import { updateLoopPattern } from '/src/utils/LoopPatternHelpers.js'
import { createPatternRenderer, RenderMode, PatternName } from '/src/utils/PatternRenderer.js'
import { seedRadialDensity } from '/src/utils/GoLHelpers.js'
import {
  GAME_DIMENSIONS,
  GAMEOVER_CONFIG,
  createGameState,
  calculateCanvasDimensions,
  createGameConfig
} from '/src/utils/GameBaseConfig.js'
import { initThemeReceiver, getBackgroundColor, getTextColor } from '/src/utils/ThemeReceiver.js'

// ============================================
// GAME CONFIGURATION - BASE REFERENCE (10:16 ratio)
// All values are proportional to 1200×1920 reference resolution
// ============================================

const CONFIG = createGameConfig({
  grid: {
    cols: 40,           // Logical grid horizontal (1200 / 40 = 30px per cell)
    rows: 64,           // Logical grid vertical (1920 / 64 = 30px per cell)
    cellSize: 30,       // Visual size of each grid cell
    offsetY: 30         // Offset from top for header
  },

  snake: {
    initialLength: 3,         // Initial segments
    baseSpeed: 8,             // Moves per second (level 1)
    maxSpeed: 18,             // Maximum speed
    speedIncrement: 0.5,      // Increment per food eaten
    growthBase: 1,            // Segments added per food (level 1)
    growthIncrement: 1,       // Growth increment every 5 foods
    maxGrowth: 3              // Maximum growth per food
  },

  food: {
    spawnMargin: 2,           // Distance from edges in cells
    maxLifetime: 20 * 60,     // 20 seconds at 60fps
    batchInterval: 20 * 60,   // Spawn batch every 30 seconds at 60fps
    batchMin: 1,              // Minimum foods per batch
    batchMax: 3,              // Maximum foods per batch
    scoreValue: 100           // Points per food
  },

  // Spaceship configuration (real GoL movement)
  spaceship: {
    engineSize: 20,           // Grid size for spaceship engine (20x20 = 400 cells)
    updateFps: 10,            // GoL updates per second
    spawnPadding: 5,          // Margin from edges before despawn
    scoreThreshold: 500,      // Spawn spaceship every ~500 points
    scoreValue: 250           // Points per spaceship
  },

  // Loop pattern update rate (frames between phase changes)
  loopUpdateRate: 10,  // 10 fps

  // GoL cell size for rendering patterns inside grid cells
  golCellSize: 8       // ~4 GoL cells fit in 30px grid cell
})

// Store scale factor for rendering
let { scaleFactor, canvasWidth, canvasHeight } = calculateCanvasDimensions()

// ============================================
// FOOD PATTERNS (Normal food - still lifes and oscillators)
// All food scores 100 points (CONFIG.food.scoreValue)
// ============================================
const FOOD_PATTERNS = [
  // Still lifes (static)
  { name: PatternName.BLOCK, isOscillator: false, gradient: GRADIENT_PRESETS.ENEMY_HOT },
  { name: PatternName.BEEHIVE, isOscillator: false, gradient: GRADIENT_PRESETS.ENEMY_COLD },
  { name: PatternName.TUB, isOscillator: false, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW },
  { name: PatternName.BOAT, isOscillator: false, gradient: GRADIENT_PRESETS.EXPLOSION },
  // Oscillators (animated)
  { name: PatternName.BLINKER, isOscillator: true, gradient: GRADIENT_PRESETS.BULLET },
  { name: PatternName.BEACON, isOscillator: true, gradient: GRADIENT_PRESETS.PLAYER }
]

// ============================================
// SPACESHIP PATTERNS (Premium food - real GoL movement)
// Spaceships score 500 points (CONFIG.spaceship.scoreValue)
// ============================================
const SPACESHIP_PATTERNS = [
  { name: PatternName.GLIDER, gradient: GRADIENT_PRESETS.BULLET },
  { name: PatternName.LIGHTWEIGHT_SPACESHIP, gradient: GRADIENT_PRESETS.ENEMY_RAINBOW }
]

// ============================================
// GAME STATE
// ============================================
const state = createGameState({
  level: 1,
  foodEaten: 0,              // Total food counter
  currentSpeed: 8,           // Current speed (moves/second)
  currentGrowth: 1,          // Segments per food
  moveTimer: 0,              // Movement timer (frames)
  direction: { x: 1, y: 0 }, // Current direction (right initially)
  nextDirection: null,       // Next direction (input buffer)
  pendingGrowth: 0,          // Segments to add (simple counter)
  dyingTimer: 0
})

// ============================================
// ENTITIES
// ============================================
let snake = []
// Each segment: { gridX, gridY, patternName, gol, gradient }

let foods = []
// Array of food objects: { gridX, gridY, patternName, gol, gradient, isOscillator, isSpaceship, lifetime }

let spaceship = null
// Single spaceship: { gridX, gridY, patternName, engine, gradient, isSpaceship, lastCentroid }

let particles = []

// ============================================
// SPAWN TRACKING STATE
// ============================================
let lastBatchSpawnFrame = 0     // Frame count when last batch was spawned
let lastSpaceshipScoreCheck = 0 // Score at which last spaceship spawned

// Theme state
let currentTheme = 'day'

// Setup completion flag (prevents draw() from running before async setup completes)
let setupComplete = false

// Gradient renderer
let maskedRenderer = null

// ============================================
// RESPONSIVE CANVAS HELPERS
// ============================================
function calculateResponsiveSize() {
  const canvasHeight = windowHeight
  const canvasWidth = canvasHeight * GAME_DIMENSIONS.ASPECT_RATIO
  return { width: canvasWidth, height: canvasHeight }
}

function updateConfigScale() {
  scaleFactor = canvasHeight / GAME_DIMENSIONS.BASE_HEIGHT
}

// ============================================
// p5.js SETUP
// ============================================
async function setup() {
  // Calculate responsive canvas size
  const size = calculateResponsiveSize()
  canvasWidth = size.width
  canvasHeight = size.height

  // Update scale factor
  updateConfigScale()

  createCanvas(canvasWidth, canvasHeight)
  frameRate(60)

  // CSS fade-in: Start invisible, fade in after warmup
  const canvas = document.querySelector('canvas')
  canvas.style.opacity = '0'
  canvas.style.transition = 'opacity 300ms ease-in'

  // Create video gradient renderer
  maskedRenderer = new VideoGradientRenderer(this)

  // Initialize theme receiver
  initThemeReceiver((theme) => {
    currentTheme = theme
    CONFIG.ui.backgroundColor = getBackgroundColor(theme)
    CONFIG.ui.score.color = getTextColor(theme)
    console.log(`Trail of Life: Theme changed to ${theme}`)
  })

  // Pre-compile GPU shaders (eliminates first-run lag)
  await maskedRenderer.warmupShaders([
    GRADIENT_PRESETS.PLAYER,
    GRADIENT_PRESETS.ENEMY_HOT,
    GRADIENT_PRESETS.ENEMY_COLD,
    GRADIENT_PRESETS.ENEMY_RAINBOW,
    GRADIENT_PRESETS.BULLET,
    GRADIENT_PRESETS.EXPLOSION
  ])

  initGame()

  // Mark setup as complete and trigger fade-in
  setupComplete = true
  document.querySelector('canvas').style.opacity = '1'
}

function initGame() {
  state.score = 0
  state.lives = 1
  state.level = 1
  state.phase = 'PLAYING'
  state.frameCount = 0
  state.foodEaten = 0
  state.currentSpeed = CONFIG.snake.baseSpeed
  state.currentGrowth = CONFIG.snake.growthBase
  state.moveTimer = 0
  state.direction = { x: 1, y: 0 }
  state.nextDirection = null
  state.pendingGrowth = 0
  state.dyingTimer = 0

  snake = []
  foods = []
  spaceship = null
  particles = []

  // Reset spawn tracking
  lastBatchSpawnFrame = 0
  lastSpaceshipScoreCheck = 0

  setupSnake()

  // Spawn initial food batch
  spawnFoodBatch()
}

// ============================================
// SNAKE SETUP
// ============================================
function setupSnake() {
  // Start in center of grid
  const startX = Math.floor(CONFIG.grid.cols / 2)
  const startY = Math.floor(CONFIG.grid.rows / 2)

  // Create initial segments (head + body going left)
  for (let i = 0; i < CONFIG.snake.initialLength; i++) {
    const segment = createSegment(
      startX - i,
      startY,
      PatternName.BLOCK,
      i === 0 ? GRADIENT_PRESETS.PLAYER : GRADIENT_PRESETS.ENEMY_COLD
    )
    snake.push(segment)
  }
}

/**
 * Create a snake segment with GoL pattern
 * @param {number} gridX - Grid X position
 * @param {number} gridY - Grid Y position
 * @param {string} patternName - GoL pattern name
 * @param {Object} gradient - Gradient preset
 * @returns {Object} Segment object
 */
function createSegment(gridX, gridY, patternName, gradient) {
  // All snake segments are STATIC (frozen) - they don't evolve
  // This preserves the visual "trail of life" showing eaten patterns
  const renderer = createPatternRenderer({
    mode: RenderMode.STATIC,
    pattern: patternName,
    globalCellSize: CONFIG.golCellSize,
    loopUpdateRate: CONFIG.loopUpdateRate
  })

  return {
    gridX,
    gridY,
    patternName,
    gol: renderer.gol,
    gradient
  }
}

// ============================================
// FOOD SYSTEM
// ============================================

/**
 * Spawn a batch of 1-3 normal foods.
 * Called every 30 seconds and at game start.
 */
function spawnFoodBatch() {
  const count = Math.floor(Math.random() * (CONFIG.food.batchMax - CONFIG.food.batchMin + 1)) + CONFIG.food.batchMin

  for (let i = 0; i < count; i++) {
    spawnSingleFood()
  }

  lastBatchSpawnFrame = state.frameCount
}

/**
 * Spawn a single normal food item.
 * Used when food is eaten or for batch spawning.
 */
function spawnSingleFood() {
  // Pick random pattern from available options
  const patternInfo = FOOD_PATTERNS[Math.floor(Math.random() * FOOD_PATTERNS.length)]

  // Find valid position (not on snake or other foods)
  let gridX, gridY
  let attempts = 0
  const maxAttempts = 100

  do {
    gridX = Math.floor(Math.random() * (CONFIG.grid.cols - 2 * CONFIG.food.spawnMargin)) + CONFIG.food.spawnMargin
    gridY = Math.floor(Math.random() * (CONFIG.grid.rows - 2 * CONFIG.food.spawnMargin)) + CONFIG.food.spawnMargin
    attempts++
  } while ((isOnSnake(gridX, gridY) || isOnFood(gridX, gridY)) && attempts < maxAttempts)

  // Create food with PatternRenderer
  const renderer = createPatternRenderer({
    mode: patternInfo.isOscillator ? RenderMode.LOOP : RenderMode.STATIC,
    pattern: patternInfo.name,
    globalCellSize: CONFIG.golCellSize,
    loopUpdateRate: CONFIG.loopUpdateRate
  })

  const food = {
    gridX,
    gridY,
    patternName: patternInfo.name,
    gol: renderer.gol,
    gradient: patternInfo.gradient,
    isOscillator: patternInfo.isOscillator,
    isSpaceship: false,
    lifetime: 0  // Frames since spawn
  }

  foods.push(food)
}

/**
 * Check if position is occupied by snake
 */
function isOnSnake(gridX, gridY) {
  return snake.some(segment => segment.gridX === gridX && segment.gridY === gridY)
}

/**
 * Check if position is occupied by existing food
 */
function isOnFood(gridX, gridY) {
  return foods.some(f => f.gridX === gridX && f.gridY === gridY)
}

/**
 * Update all food items - increment lifetime and remove expired ones.
 */
function updateFoods() {
  // Increment lifetime and filter out expired foods
  foods = foods.filter(food => {
    food.lifetime++
    return food.lifetime < CONFIG.food.maxLifetime
  })
}

// ============================================
// SPACESHIP SYSTEM (Real GoL Movement)
// ============================================

/**
 * Check if spaceship should spawn based on score.
 * Spawns every ~500 points (scoreThreshold).
 */
function checkSpaceshipSpawn() {
  // Only spawn if no spaceship exists
  if (spaceship) return

  // Check if we've crossed a score threshold
  const scoreThreshold = CONFIG.spaceship.scoreThreshold
  const scoresSinceLastCheck = state.score - lastSpaceshipScoreCheck

  if (scoresSinceLastCheck >= scoreThreshold) {
    const spawned = spawnSpaceship()
    if (spawned) {
      lastSpaceshipScoreCheck = state.score
    }
  }
}

/**
 * Spawn a spaceship with dedicated GoLEngine.
 * The spaceship moves with authentic B3/S23 rules.
 * Position is tracked in PIXELS for accurate collision detection.
 */
function spawnSpaceship() {
  // Pick random spaceship pattern
  const patternInfo = SPACESHIP_PATTERNS[Math.floor(Math.random() * SPACESHIP_PATTERNS.length)]

  // Find valid position (not on snake or food) in GRID coordinates
  let gridX, gridY
  let attempts = 0
  const maxAttempts = 100

  do {
    gridX = Math.floor(Math.random() * (CONFIG.grid.cols - 8)) + 4
    gridY = Math.floor(Math.random() * (CONFIG.grid.rows - 8)) + 4
    attempts++
  } while ((isOnSnake(gridX, gridY) || isOnFood(gridX, gridY)) && attempts < maxAttempts)

  // If we couldn't find a valid position, return false to retry next frame
  if (attempts >= maxAttempts) {
    return false
  }

  // Convert grid position to pixels
  const pixelX = gridX * CONFIG.grid.cellSize
  const pixelY = (gridY + 1) * CONFIG.grid.cellSize

  const engineSize = CONFIG.spaceship.engineSize

  // Create dedicated GoLEngine for this spaceship
  const engine = new GoLEngine(engineSize, engineSize, CONFIG.spaceship.updateFps)

  // Get pattern from Patterns library
  const pattern = Patterns[patternInfo.name]

  // Calculate center position to stamp pattern
  const patternHeight = pattern.length
  const patternWidth = pattern[0].length
  const centerX = Math.floor((engineSize - patternHeight) / 2)
  const centerY = Math.floor((engineSize - patternWidth) / 2)

  // Stamp pattern onto engine grid
  stampPattern(engine.current, pattern, centerX, centerY, engineSize, engineSize)

  // Calculate initial centroid for tracking movement
  const initialCentroid = calculateCentroid(engine)

  // Engine size in pixels: 20 cells * 8 pixels = 160px
  const sizeInPixels = engineSize * CONFIG.golCellSize

  spaceship = {
    pixelX,                          // Position in PIXELS (not grid)
    pixelY,
    width: sizeInPixels,             // 160 pixels
    height: sizeInPixels,            // 160 pixels
    patternName: patternInfo.name,
    engine,                          // GoLEngine for real B3/S23 simulation
    gradient: patternInfo.gradient,
    lastCentroid: initialCentroid,   // Track centroid for movement detection
    stallCounter: 0                  // Track frames without movement
  }

  return true
}

/**
 * Update spaceship with real GoL simulation.
 * Moves the spaceship position in PIXELS based on engine centroid movement.
 */
function updateSpaceship() {
  if (!spaceship) return

  // Throttle updates based on configured FPS
  const framesPerUpdate = Math.floor(60 / CONFIG.spaceship.updateFps)
  if (state.frameCount % framesPerUpdate !== 0) return

  // Run one generation of GoL
  spaceship.engine.update()

  // Calculate new centroid
  const newCentroid = calculateCentroid(spaceship.engine)

  // If no cells alive (spaceship died), remove it
  if (!newCentroid) {
    spaceship = null
    return
  }

  // Calculate movement delta in ENGINE coordinates (0-20)
  const deltaX = newCentroid.x - spaceship.lastCentroid.x
  const deltaY = newCentroid.y - spaceship.lastCentroid.y

  // STALL DETECTION: If no movement, increment counter
  if (deltaX === 0 && deltaY === 0) {
    spaceship.stallCounter++
    // If stalled for 0.5 seconds (30 frames at 60fps), remove it
    if (spaceship.stallCounter >= 30) {
      spaceship = null
      return
    }
  } else {
    spaceship.stallCounter = 0
  }

  // Convert engine delta to PIXEL delta
  const pixelDeltaX = deltaX * CONFIG.golCellSize  // deltaX * 8px
  const pixelDeltaY = deltaY * CONFIG.golCellSize  // deltaY * 8px

  // Update spaceship position in PIXELS
  spaceship.pixelX += pixelDeltaX
  spaceship.pixelY += pixelDeltaY
  spaceship.lastCentroid = newCentroid

  // Check collision with snake head (in case spaceship moved into head)
  if (snake.length > 0 && checkSpaceshipCollision(snake[0].gridX, snake[0].gridY)) {
    onSpaceshipEaten()
    return
  }

  // Check if spaceship left the screen (in pixels)
  const margin = 200  // Allow some off-screen movement
  if (spaceship.pixelX < -margin || spaceship.pixelX > GAME_DIMENSIONS.BASE_WIDTH + margin ||
    spaceship.pixelY < -margin || spaceship.pixelY > GAME_DIMENSIONS.BASE_HEIGHT + margin) {
    spaceship = null
  }
}

/**
 * Calculate centroid (center of mass) of alive cells in engine.
 *
 * @param {GoLEngine} engine - GoL engine to analyze
 * @returns {{ x: number, y: number } | null} Centroid coordinates or null if no cells
 *
 * @example
 * const centroid = calculateCentroid(food.engine)
 * if (centroid) {
 *   console.log(`Center at (${centroid.x}, ${centroid.y})`)
 * }
 */
function calculateCentroid(engine) {
  const grid = engine.current
  let sumX = 0
  let sumY = 0
  let count = 0

  for (let x = 0; x < engine.cols; x++) {
    for (let y = 0; y < engine.rows; y++) {
      if (grid[x][y] === 1) {
        sumX += x
        sumY += y
        count++
      }
    }
  }

  if (count === 0) return null

  return {
    x: Math.floor(sumX / count),
    y: Math.floor(sumY / count)
  }
}

/**
 * Check if food position is outside valid game bounds.
 *
 * @param {number} gridX - Grid X position
 * @param {number} gridY - Grid Y position
 * @returns {boolean} True if out of bounds
 */
function isOutOfBounds(gridX, gridY) {
  const margin = CONFIG.spaceship.spawnPadding
  return (
    gridX < -margin ||
    gridX >= CONFIG.grid.cols + margin ||
    gridY < -margin ||
    gridY >= CONFIG.grid.rows + margin
  )
}

/**
 * Check AABB (Axis-Aligned Bounding Box) collision between two rectangles.
 * Used for spaceship collision detection.
 *
 * @param {number} x1 - First rectangle X position (pixels)
 * @param {number} y1 - First rectangle Y position (pixels)
 * @param {number} w1 - First rectangle width (pixels)
 * @param {number} h1 - First rectangle height (pixels)
 * @param {number} x2 - Second rectangle X position (pixels)
 * @param {number} y2 - Second rectangle Y position (pixels)
 * @param {number} w2 - Second rectangle width (pixels)
 * @param {number} h2 - Second rectangle height (pixels)
 * @returns {boolean} True if rectangles overlap
 */
function checkAABBCollision(x1, y1, w1, h1, x2, y2, w2, h2) {
  return !(x1 + w1 < x2 || x1 > x2 + w2 ||
    y1 + h1 < y2 || y1 > y2 + h2)
}

/**
 * Check if a grid position collides with the spaceship.
 * Uses AABB collision in pixel space.
 *
 * @param {number} gridX - Grid X position to check (snake head position)
 * @param {number} gridY - Grid Y position to check (snake head position)
 * @returns {boolean} True if the position collides with spaceship
 */
function checkSpaceshipCollision(gridX, gridY) {
  if (!spaceship) return false

  // Convert snake head position to pixels
  const headPixelX = gridX * CONFIG.grid.cellSize
  const headPixelY = (gridY + 1) * CONFIG.grid.cellSize
  const headSize = CONFIG.grid.cellSize  // 30px

  // Check AABB collision
  return checkAABBCollision(
    headPixelX, headPixelY, headSize, headSize,
    spaceship.pixelX, spaceship.pixelY, spaceship.width, spaceship.height
  )
}

// ============================================
// UPDATE LOOP
// ============================================
function draw() {
  if (!setupComplete) return

  state.frameCount++

  background(CONFIG.ui.backgroundColor)

  if (state.phase === 'PLAYING') {
    updateGame()
  } else if (state.phase === 'DYING') {
    state.dyingTimer++
    particles = updateParticles(particles, state.frameCount, CONFIG.loopUpdateRate)

    // Transition to GAMEOVER
    const minDelayPassed = state.dyingTimer >= GAMEOVER_CONFIG.MIN_DELAY
    const particlesDone = particles.length === 0
    const maxWaitReached = state.dyingTimer >= GAMEOVER_CONFIG.MAX_WAIT

    if ((particlesDone && minDelayPassed) || maxWaitReached) {
      state.phase = 'GAMEOVER'

      // Send postMessage to parent
      if (window.parent !== window) {
        window.parent.postMessage({
          type: 'gameOver',
          payload: { score: state.score }
        }, '*')
      }
    }
  }

  renderGame()

  // Update score in header
  const scoreElement = document.getElementById('score-value')
  if (scoreElement) {
    scoreElement.textContent = state.score
  }

  // Update gradient animations
  maskedRenderer.updateAnimation()

  if (state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      renderGameOver(width, height, state.score)
    }
  }
}

function updateGame() {
  // Process input (buffer next direction)
  processInput()

  // Movement timer
  const framesPerMove = Math.floor(60 / state.currentSpeed)
  state.moveTimer++

  if (state.moveTimer >= framesPerMove) {
    state.moveTimer = 0
    moveSnake()
  }

  // Update food lifetimes and remove expired
  updateFoods()

  // Spawn batch every 30 seconds
  const framesSinceLastBatch = state.frameCount - lastBatchSpawnFrame
  if (framesSinceLastBatch >= CONFIG.food.batchInterval) {
    spawnFoodBatch()
  }

  // Check if spaceship should spawn (every ~500 points)
  checkSpaceshipSpawn()

  // Update spaceship (real GoL movement)
  updateSpaceship()

  // Update oscillating patterns
  updatePatterns()

  // Update particles
  particles = updateParticles(particles, state.frameCount, CONFIG.loopUpdateRate)
}

function processInput() {
  // Only allow perpendicular direction changes
  const dir = state.direction

  if ((keyIsDown(UP_ARROW) || keyIsDown(87)) && dir.y === 0) { // W
    state.nextDirection = { x: 0, y: -1 }
  } else if ((keyIsDown(DOWN_ARROW) || keyIsDown(83)) && dir.y === 0) { // S
    state.nextDirection = { x: 0, y: 1 }
  } else if ((keyIsDown(LEFT_ARROW) || keyIsDown(65)) && dir.x === 0) { // A
    state.nextDirection = { x: -1, y: 0 }
  } else if ((keyIsDown(RIGHT_ARROW) || keyIsDown(68)) && dir.x === 0) { // D
    state.nextDirection = { x: 1, y: 0 }
  }
}

function moveSnake() {
  // Apply buffered direction
  if (state.nextDirection) {
    state.direction = state.nextDirection
    state.nextDirection = null
  }

  // Calculate new head position
  const head = snake[0]
  let newX = head.gridX + state.direction.x
  let newY = head.gridY + state.direction.y

  // WRAP AROUND: If hit wall, appear on opposite side
  if (newX < 0) newX = CONFIG.grid.cols - 1
  if (newX >= CONFIG.grid.cols) newX = 0
  if (newY < 1) newY = CONFIG.grid.rows - 1  // Row 0 is header
  if (newY >= CONFIG.grid.rows) newY = 1

  // Check ONLY self collision (walls wrap around)
  const selfHit = checkSelfCollision(newX, newY)

  if (selfHit) {
    console.log(`DEATH: self collision at (${newX},${newY})`)
    onDeath()
    return
  }

  // Check food collision (find which food was eaten, if any)
  const eatenFoodIndex = foods.findIndex(f => f.gridX === newX && f.gridY === newY)
  if (eatenFoodIndex >= 0) {
    onFoodEaten(foods[eatenFoodIndex])
    foods.splice(eatenFoodIndex, 1)  // Remove eaten food
    spawnFoodBatch()                  // Spawn 1-3 new foods
  }

  // Check spaceship collision (area-based - checks all live cells in engine)
  if (checkSpaceshipCollision(newX, newY)) {
    onSpaceshipEaten()
  }

  // Create new head segment (always BLOCK with PLAYER gradient)
  const newHead = createSegment(
    newX,
    newY,
    PatternName.BLOCK,
    GRADIENT_PRESETS.PLAYER
  )

  // Add new head at front
  snake.unshift(newHead)

  // Update old head to body gradient
  if (snake.length > 1) {
    snake[1].gradient = GRADIENT_PRESETS.ENEMY_COLD
  }

  // Growth logic: if pending growth, don't remove tail
  if (state.pendingGrowth > 0) {
    state.pendingGrowth--
  } else {
    snake.pop()
  }
}

function checkWallCollision(x, y) {
  return x < 0 || x >= CONFIG.grid.cols || y < 1 || y >= CONFIG.grid.rows
}

function checkSelfCollision(x, y) {
  // Check against all body segments (skip head since we're checking new position)
  return snake.some((segment, index) => {
    if (index === 0) return false // Skip current head
    return segment.gridX === x && segment.gridY === y
  })
}

/**
 * Called when snake eats a normal food item.
 * @param {Object} food - The food object that was eaten
 */
function onFoodEaten(food) {
  // Score (food scores 100 points * level)
  state.score += CONFIG.food.scoreValue * state.level
  state.foodEaten++

  // Queue growth (simple counter)
  state.pendingGrowth += state.currentGrowth

  // Update difficulty
  updateDifficulty()
}

/**
 * Called when snake eats a spaceship.
 */
function onSpaceshipEaten() {
  // Score (spaceship scores 500 points * level)
  state.score += CONFIG.spaceship.scoreValue * state.level
  state.foodEaten++

  // Queue growth (extra growth for spaceship)
  state.pendingGrowth += state.currentGrowth * 2

  // Update difficulty
  updateDifficulty()

  // Remove spaceship
  spaceship = null
}

function updateDifficulty() {
  // Increase speed
  state.currentSpeed = Math.min(
    CONFIG.snake.maxSpeed,
    CONFIG.snake.baseSpeed + (state.foodEaten * CONFIG.snake.speedIncrement)
  )

  // Increase growth rate every 5 foods
  state.currentGrowth = Math.min(
    CONFIG.snake.maxGrowth,
    CONFIG.snake.growthBase + Math.floor(state.foodEaten / 5) * CONFIG.snake.growthIncrement
  )

  // Level up every 10 foods
  state.level = Math.floor(state.foodEaten / 10) + 1
}

function onDeath() {
  state.phase = 'DYING'
  state.dyingTimer = 0

  // Spawn explosions for each segment (staggered)
  snake.forEach((segment, index) => {
    // Create explosion immediately but with staggered visual
    spawnExplosion(segment.gridX, segment.gridY, segment.gradient, index * 3)
  })
}

function updatePatterns() {
  // Snake segments are STATIC (frozen) - no updates needed
  // This creates a visual "trail" of different patterns

  // Update oscillating foods (BLINKER, BEACON animate to attract attention)
  for (const food of foods) {
    if (food.isOscillator && food.gol.isLoopPattern) {
      updateLoopPattern(food.gol, CONFIG.loopUpdateRate, true)
    }
  }
}

// ============================================
// EXPLOSION SYSTEM
// ============================================
function spawnExplosion(gridX, gridY, gradient, delayFrames = 0) {
  const screenX = gridX * CONFIG.grid.cellSize + CONFIG.grid.cellSize / 2
  const screenY = (gridY + 1) * CONFIG.grid.cellSize + CONFIG.grid.cellSize / 2 // +1 for header offset

  const particleCount = 3

  for (let i = 0; i < particleCount; i++) {
    const particle = {
      x: screenX + (Math.random() * 2 - 1) * 20,
      y: screenY + (Math.random() * 2 - 1) * 20,
      vx: (Math.random() * 2 - 1) * 4,
      vy: (Math.random() * 2 - 1) * 4,
      alpha: 255,
      width: 90,
      height: 90,
      gol: new GoLEngine(3, 3, CONFIG.loopUpdateRate),
      gradient: gradient || GRADIENT_PRESETS.EXPLOSION,
      dead: false,
      delayFrames: delayFrames
    }

    seedRadialDensity(particle.gol, 0.7, 0.0)
    particle.gol.setPattern(Patterns.BLINKER, 0, 0)

    particles.push(particle)
  }
}

// ============================================
// RENDERING
// ============================================
function renderGame() {
  push()
  scale(scaleFactor)

  // Render grid lines (subtle, for debugging)
  // renderGridLines()

  // Render all foods (behind snake)
  if (state.phase === 'PLAYING') {
    renderFoods()
    renderSpaceship()
  }

  // Render snake
  if (state.phase !== 'GAMEOVER') {
    renderSnake()
  }

  // Render particles
  renderParticles(particles, maskedRenderer, CONFIG.golCellSize)

  pop()
}

function renderSnake() {
  // Render from tail to head so head is on top
  for (let i = snake.length - 1; i >= 0; i--) {
    const segment = snake[i]
    const screenX = segment.gridX * CONFIG.grid.cellSize
    const screenY = (segment.gridY + 1) * CONFIG.grid.cellSize // +1 for header offset

    // Center the GoL pattern within the grid cell
    const patternWidth = segment.gol.cols * CONFIG.golCellSize
    const patternHeight = segment.gol.rows * CONFIG.golCellSize
    const offsetX = (CONFIG.grid.cellSize - patternWidth) / 2
    const offsetY = (CONFIG.grid.cellSize - patternHeight) / 2

    maskedRenderer.renderMaskedGrid(
      segment.gol,
      screenX + offsetX,
      screenY + offsetY,
      CONFIG.golCellSize,
      segment.gradient
    )
  }
}

/**
 * Render all normal food items.
 */
function renderFoods() {
  for (const food of foods) {
    const screenX = food.gridX * CONFIG.grid.cellSize
    const screenY = (food.gridY + 1) * CONFIG.grid.cellSize // +1 for header offset

    // Center the GoL pattern within the grid cell
    const patternWidth = food.gol.cols * CONFIG.golCellSize
    const patternHeight = food.gol.rows * CONFIG.golCellSize
    const offsetX = (CONFIG.grid.cellSize - patternWidth) / 2
    const offsetY = (CONFIG.grid.cellSize - patternHeight) / 2

    maskedRenderer.renderMaskedGrid(
      food.gol,
      screenX + offsetX,
      screenY + offsetY,
      CONFIG.golCellSize,
      food.gradient
    )
  }
}

/**
 * Render the spaceship (if one exists).
 * Uses pixel coordinates directly (no conversion needed).
 */
function renderSpaceship() {
  if (!spaceship) return

  // Spaceship position is already in pixels - render directly
  maskedRenderer.renderMaskedGrid(
    spaceship.engine,
    spaceship.pixelX,
    spaceship.pixelY,
    CONFIG.golCellSize,
    spaceship.gradient
  )
}

function renderGridLines() {
  stroke(200, 200, 200, 50)
  strokeWeight(1)

  // Vertical lines
  for (let x = 0; x <= CONFIG.grid.cols; x++) {
    line(x * CONFIG.grid.cellSize, CONFIG.grid.cellSize, x * CONFIG.grid.cellSize, CONFIG.height)
  }

  // Horizontal lines
  for (let y = 1; y <= CONFIG.grid.rows; y++) {
    line(0, y * CONFIG.grid.cellSize, CONFIG.width, y * CONFIG.grid.cellSize)
  }

  noStroke()
}

// ============================================
// INPUT HANDLING
// ============================================
function keyPressed() {
  if ((key === ' ' || key === 'm' || key === 'M' || key === 'n' || key === 'N') && state.phase === 'GAMEOVER') {
    if (window.parent === window) {
      initGame()
      state.phase = 'PLAYING'
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
}

// Make functions global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
window.windowResized = windowResized
