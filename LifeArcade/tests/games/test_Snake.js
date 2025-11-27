import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'snake.js')

describe('Snake (Trail of Life) - File Structure', () => {
  let gameCode

  test('game file exists and is readable', () => {
    expect(() => {
      gameCode = readFileSync(GAME_PATH, 'utf-8')
    }).not.toThrow()
    expect(gameCode).toBeTruthy()
    expect(gameCode.length).toBeGreaterThan(100)
  })

  test('uses p5.js global mode (no "this.")', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).not.toContain('this.createCanvas')
    expect(gameCode).not.toContain('this.background')
    expect(gameCode).not.toContain('this.fill')
    expect(gameCode).not.toContain('this.rect')
  })

  test('has required p5.js function exports', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('window.setup = setup')
    expect(gameCode).toContain('window.draw = draw')
    expect(gameCode).toContain('window.keyPressed = keyPressed')
    expect(gameCode).toContain('window.windowResized = windowResized')
  })

  test('file has no syntax errors (basic validation)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    const openBraces = (gameCode.match(/\{/g) || []).length
    const closeBraces = (gameCode.match(/\}/g) || []).length
    expect(openBraces).toBe(closeBraces)

    const openParens = (gameCode.match(/\(/g) || []).length
    const closeParens = (gameCode.match(/\)/g) || []).length
    expect(openParens).toBe(closeParens)
  })

  test('file has proper header comment', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Trail of Life')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

describe('Snake - GoL Integration', () => {
  let gameCode

  test('imports GoLEngine from core', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { GoLEngine }")
    expect(gameCode).toContain("from '/src/core/GoLEngine.js'")
  })

  test('imports VideoGradientRenderer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { VideoGradientRenderer }")
    expect(gameCode).toContain("from '/src/rendering/VideoGradientRenderer.js'")
  })

  test('imports GRADIENT_PRESETS', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { GRADIENT_PRESETS }")
    expect(gameCode).toContain("from '/src/utils/GradientPresets.js'")
  })

  test('imports Patterns and stampPattern', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Patterns, stampPattern }")
    expect(gameCode).toContain("from '/src/utils/Patterns.js'")
  })

  test('imports PatternRenderer utilities', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { createPatternRenderer")
    expect(gameCode).toContain("RenderMode")
    expect(gameCode).toContain("PatternName")
  })

  test('uses createPatternRenderer for segments', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createPatternRenderer({')
  })
})

describe('Snake - Configuration', () => {
  let gameCode

  test('has CONFIG object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const CONFIG = createGameConfig(')
  })

  test('uses portrait dimensions (GAME_DIMENSIONS)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('has grid configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('grid:')
    expect(gameCode).toContain('cols: 40')
    expect(gameCode).toContain('rows: 64')
    expect(gameCode).toContain('cellSize: 30')
  })

  test('has snake configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('snake:')
    expect(gameCode).toContain('initialLength:')
    expect(gameCode).toContain('baseSpeed:')
    expect(gameCode).toContain('maxSpeed:')
    expect(gameCode).toContain('speedIncrement:')
  })

  test('has food configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('food:')
    expect(gameCode).toContain('spawnMargin:')
  })

  test('has GoL cell size for rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('golCellSize:')
  })

  test('has loopUpdateRate for oscillators', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('loopUpdateRate:')
  })
})

describe('Snake - Food Patterns', () => {
  let gameCode

  test('has FOOD_PATTERNS array defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const FOOD_PATTERNS = [')
  })

  test('includes still life patterns (BLOCK, BEEHIVE, TUB, BOAT)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.BLOCK')
    expect(gameCode).toContain('PatternName.BEEHIVE')
    expect(gameCode).toContain('PatternName.TUB')
    expect(gameCode).toContain('PatternName.BOAT')
  })

  test('includes oscillator patterns (BLINKER, BEACON)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.BLINKER')
    expect(gameCode).toContain('PatternName.BEACON')
  })

  test('patterns have isOscillator flag', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('isOscillator: false')
    expect(gameCode).toContain('isOscillator: true')
  })

  test('patterns have gradient (no individual scoreValue - uses CONFIG)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS')
    // Score value now comes from CONFIG.food.scoreValue, not per-pattern
    expect(gameCode).toContain('CONFIG.food.scoreValue')
  })
})

describe('Snake - Spaceship Patterns', () => {
  let gameCode

  test('has SPACESHIP_PATTERNS array defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const SPACESHIP_PATTERNS = [')
  })

  test('includes GLIDER spaceship', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.GLIDER')
  })

  test('includes LWSS spaceship', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.LIGHTWEIGHT_SPACESHIP')
  })

  test('spaceship score value comes from CONFIG', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('CONFIG.spaceship.scoreValue')
    expect(gameCode).toContain('scoreValue: 250')
  })
})

describe('Snake - Game State', () => {
  let gameCode

  test('has state object with createGameState', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const state = createGameState(')
  })

  test('has phase states for game flow', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PLAYING')
    expect(gameCode).toContain('DYING')
    expect(gameCode).toContain('GAMEOVER')
  })

  test('has direction state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('direction:')
    expect(gameCode).toContain('nextDirection:')
  })

  test('has speed and growth state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('currentSpeed:')
    expect(gameCode).toContain('currentGrowth:')
  })

  test('has movement timer state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('moveTimer:')
  })

  test('has pendingGrowth state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('pendingGrowth:')
  })

  test('has foodEaten counter', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('foodEaten:')
  })
})

describe('Snake - Entity Management', () => {
  let gameCode

  test('has snake array for segments', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let snake = []')
  })

  test('has foods array for multiple food items', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let foods = []')
  })

  test('has spaceship variable for premium food', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let spaceship = null')
  })

  test('has particles array for explosions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let particles = []')
  })

  test('has spawn tracking state variables', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let lastBatchSpawnFrame = 0')
    expect(gameCode).toContain('let lastSpaceshipScoreCheck = 0')
  })

  test('snake segments have expected properties', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check comment describing segment structure
    expect(gameCode).toContain('gridX')
    expect(gameCode).toContain('gridY')
    expect(gameCode).toContain('patternName')
    expect(gameCode).toContain('gol')
    expect(gameCode).toContain('gradient')
  })
})

describe('Snake - Game Functions', () => {
  let gameCode

  test('has initGame function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function initGame()')
  })

  test('has setupSnake function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function setupSnake()')
  })

  test('has createSegment function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function createSegment(')
  })

  test('has spawnSingleFood function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function spawnSingleFood()')
  })

  test('has spawnFoodBatch function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function spawnFoodBatch()')
  })

  test('has moveSnake function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function moveSnake()')
  })

  test('has processInput function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function processInput()')
  })

  test('has updateGame function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updateGame()')
  })

  test('has updatePatterns function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updatePatterns()')
  })

  test('has updateDifficulty function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updateDifficulty()')
  })
})

describe('Snake - Collision Detection', () => {
  let gameCode

  test('has isOnSnake function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function isOnSnake(')
  })

  test('has isOnFood function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function isOnFood(')
  })

  test('has checkSelfCollision function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function checkSelfCollision(')
  })

  test('has checkWallCollision function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function checkWallCollision(')
  })

  test('implements wrap-around for walls', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check for wrap logic
    expect(gameCode).toContain('if (newX < 0)')
    expect(gameCode).toContain('if (newX >= CONFIG.grid.cols)')
    expect(gameCode).toContain('if (newY < 1)')
    expect(gameCode).toContain('if (newY >= CONFIG.grid.rows)')
  })

  test('detects food collision using findIndex', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('eatenFoodIndex')
    expect(gameCode).toContain('foods.findIndex')
  })

  test('detects spaceship collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('spaceship.gridX')
    expect(gameCode).toContain('spaceship.gridY')
  })
})

describe('Snake - Food System', () => {
  let gameCode

  test('has onFoodEaten function with food parameter', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function onFoodEaten(food)')
  })

  test('has onSpaceshipEaten function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function onSpaceshipEaten()')
  })

  test('increments score on food eaten using CONFIG values', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.score += CONFIG.food.scoreValue')
    expect(gameCode).toContain('state.score += CONFIG.spaceship.scoreValue')
  })

  test('queues growth on food eaten', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.pendingGrowth +=')
  })

  test('spawns replacement food after eating', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check that spawnSingleFood is called after eating
    expect(gameCode).toContain('spawnSingleFood()')
  })

  test('food spawn respects margin from edges', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('CONFIG.food.spawnMargin')
  })

  test('has updateFoods function for lifetime tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updateFoods()')
    expect(gameCode).toContain('food.lifetime++')
    expect(gameCode).toContain('CONFIG.food.maxLifetime')
  })

  test('CONFIG.food has batch spawn settings', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maxLifetime:')
    expect(gameCode).toContain('batchInterval:')
    expect(gameCode).toContain('batchMin:')
    expect(gameCode).toContain('batchMax:')
    expect(gameCode).toContain('scoreValue: 100')
  })
})

describe('Snake - Death System', () => {
  let gameCode

  test('has onDeath function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function onDeath()')
  })

  test('transitions to DYING phase on death', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("state.phase = 'DYING'")
  })

  test('has spawnExplosion function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function spawnExplosion(')
  })

  test('spawns explosions for each segment on death', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('snake.forEach')
    expect(gameCode).toContain('spawnExplosion')
  })

  test('sends postMessage on game over', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("type: 'gameOver'")
    expect(gameCode).toContain('payload: { score:')
    expect(gameCode).toContain('window.parent.postMessage')
  })
})

describe('Snake - Rendering', () => {
  let gameCode

  test('has renderGame function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderGame()')
  })

  test('has renderSnake function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderSnake()')
  })

  test('has renderFoods function for food array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderFoods()')
  })

  test('has renderSpaceship function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderSpaceship()')
  })

  test('uses maskedRenderer for snake segments', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maskedRenderer.renderMaskedGrid')
  })

  test('renders snake from tail to head (head on top)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check for reverse iteration
    expect(gameCode).toContain('snake.length - 1')
    expect(gameCode).toContain('i >= 0')
    expect(gameCode).toContain('i--')
  })

  test('uses scale factor for responsive rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('scale(scaleFactor)')
  })

  test('imports and uses renderParticles helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { updateParticles, renderParticles }")
    expect(gameCode).toContain('renderParticles(particles')
  })
})

describe('Snake - Input Handling', () => {
  let gameCode

  test('handles arrow keys for direction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('UP_ARROW')
    expect(gameCode).toContain('DOWN_ARROW')
    expect(gameCode).toContain('LEFT_ARROW')
    expect(gameCode).toContain('RIGHT_ARROW')
  })

  test('handles WASD for direction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // W=87, A=65, S=83, D=68
    expect(gameCode).toContain('87')
    expect(gameCode).toContain('65')
    expect(gameCode).toContain('83')
    expect(gameCode).toContain('68')
  })

  test('prevents 180-degree turns (perpendicular only)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('dir.y === 0')
    expect(gameCode).toContain('dir.x === 0')
  })

  test('buffers next direction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.nextDirection')
  })

  test('handles restart input on game over', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("state.phase === 'GAMEOVER'")
    expect(gameCode).toContain("key === ' '")
  })
})

describe('Snake - Theme Support', () => {
  let gameCode

  test('imports theme receiver', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('initThemeReceiver')
    expect(gameCode).toContain('getBackgroundColor')
    expect(gameCode).toContain('getTextColor')
  })

  test('initializes theme receiver in setup', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('initThemeReceiver((theme)')
  })

  test('updates CONFIG colors on theme change', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('CONFIG.ui.backgroundColor = getBackgroundColor')
    expect(gameCode).toContain('CONFIG.ui.score.color = getTextColor')
  })

  test('has currentTheme variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("let currentTheme = 'day'")
  })
})

describe('Snake - Difficulty Progression', () => {
  let gameCode

  test('increases speed as food is eaten', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.currentSpeed')
    expect(gameCode).toContain('CONFIG.snake.maxSpeed')
    expect(gameCode).toContain('CONFIG.snake.speedIncrement')
  })

  test('increases growth rate over time', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.currentGrowth')
    expect(gameCode).toContain('CONFIG.snake.maxGrowth')
    expect(gameCode).toContain('CONFIG.snake.growthIncrement')
  })

  test('has level system', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.level')
  })

  test('level affects score multiplier', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('* state.level')
  })
})

describe('Snake - Setup and Initialization', () => {
  let gameCode

  test('has async setup function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('async function setup()')
  })

  test('creates VideoGradientRenderer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new VideoGradientRenderer(')
  })

  test('warms up shaders before gameplay', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('await maskedRenderer.warmupShaders')
  })

  test('has setupComplete flag to prevent early draw', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('let setupComplete = false')
    expect(gameCode).toContain('if (!setupComplete) return')
  })

  test('implements CSS fade-in for smooth start', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("canvas.style.opacity = '0'")
    expect(gameCode).toContain("canvas.style.transition")
    // Final opacity set via document.querySelector
    expect(gameCode).toContain(".style.opacity = '1'")
  })
})

describe('Snake - Window Resize', () => {
  let gameCode

  test('has windowResized function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function windowResized()')
  })

  test('recalculates scale factor on resize', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateConfigScale()')
  })

  test('calls resizeCanvas', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('resizeCanvas(')
  })
})

describe('Snake - Score Display', () => {
  let gameCode

  test('updates score in HTML header', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("getElementById('score-value')")
    expect(gameCode).toContain('scoreElement.textContent = state.score')
  })

  test('imports renderGameOver helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { renderGameOver }")
    expect(gameCode).toContain("from '/src/utils/UIHelpers.js'")
  })

  test('renders game over when standalone', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('window.parent === window')
    expect(gameCode).toContain('renderGameOver(')
  })
})

describe('Snake - GoL Authenticity', () => {
  let gameCode

  test('snake segments use STATIC render mode (frozen patterns)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('RenderMode.STATIC')
  })

  test('food oscillators use LOOP render mode', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('RenderMode.LOOP')
  })

  test('imports updateLoopPattern for oscillator animation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { updateLoopPattern }")
  })

  test('uses seedRadialDensity for explosion particles', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { seedRadialDensity }")
    expect(gameCode).toContain('seedRadialDensity(')
  })

  test('head always uses PLAYER gradient', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GRADIENT_PRESETS.PLAYER')
  })

  test('body segments use different gradient from head', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GRADIENT_PRESETS.ENEMY_COLD')
  })
})

// ============================================
// Spaceship System Tests (Real GoL Movement)
// ============================================

describe('Snake - Spaceship System', () => {
  let gameCode

  beforeEach(() => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')
  })

  test('has checkSpaceshipSpawn function', () => {
    expect(gameCode).toContain('function checkSpaceshipSpawn()')
  })

  test('has spawnSpaceship function', () => {
    expect(gameCode).toContain('function spawnSpaceship()')
  })

  test('spawnSpaceship creates GoLEngine', () => {
    expect(gameCode).toContain('new GoLEngine(engineSize, engineSize')
  })

  test('spawnSpaceship stamps pattern onto engine', () => {
    expect(gameCode).toContain('stampPattern(engine.current')
  })

  test('spawnSpaceship tracks initial centroid', () => {
    expect(gameCode).toContain('lastCentroid: initialCentroid')
  })

  test('has updateSpaceship function', () => {
    expect(gameCode).toContain('function updateSpaceship()')
  })

  test('updateSpaceship calls engine.update()', () => {
    expect(gameCode).toContain('spaceship.engine.update()')
  })

  test('updateSpaceship calculates movement delta', () => {
    expect(gameCode).toContain('deltaX = newCentroid.x - spaceship.lastCentroid.x')
    expect(gameCode).toContain('deltaY = newCentroid.y - spaceship.lastCentroid.y')
  })

  test('updateSpaceship removes spaceship when no cells alive', () => {
    expect(gameCode).toContain('if (!newCentroid)')
    expect(gameCode).toContain('spaceship = null')
  })

  test('updateSpaceship removes spaceship when out of bounds', () => {
    expect(gameCode).toContain('if (isOutOfBounds(spaceship.gridX, spaceship.gridY))')
  })

  test('has calculateCentroid function', () => {
    expect(gameCode).toContain('function calculateCentroid')
  })

  test('calculateCentroid returns x,y coordinates', () => {
    expect(gameCode).toContain('sumX += x')
    expect(gameCode).toContain('sumY += y')
    expect(gameCode).toContain('return {')
  })

  test('has isOutOfBounds function', () => {
    expect(gameCode).toContain('function isOutOfBounds')
  })

  test('isOutOfBounds uses spawnPadding margin', () => {
    expect(gameCode).toContain('CONFIG.spaceship.spawnPadding')
  })

  test('updateSpaceship is called in game loop', () => {
    expect(gameCode).toContain('updateSpaceship()')
  })

  test('checkSpaceshipSpawn is called in game loop', () => {
    expect(gameCode).toContain('checkSpaceshipSpawn()')
  })

  test('spaceship spawn uses scoreThreshold', () => {
    expect(gameCode).toContain('CONFIG.spaceship.scoreThreshold')
    expect(gameCode).toContain('scoreThreshold: 500')
  })

  test('imports stampPattern from Patterns', () => {
    expect(gameCode).toContain('stampPattern')
    expect(gameCode).toContain("from '/src/utils/Patterns.js'")
  })

  test('CONFIG has spaceship settings', () => {
    expect(gameCode).toContain('spaceship:')
    expect(gameCode).toContain('engineSize:')
    expect(gameCode).toContain('updateFps:')
    expect(gameCode).toContain('spawnPadding:')
  })

  test('no old GoL system architecture', () => {
    // These should NOT exist (old system)
    expect(gameCode).not.toContain('let golSystemEngine')
    expect(gameCode).not.toContain('let activeSystems')
    expect(gameCode).not.toContain('function updateGoLSystems')
    expect(gameCode).not.toContain('function checkCellCollision')
  })

  test('normal food has isSpaceship: false flag', () => {
    expect(gameCode).toContain('isSpaceship: false')
  })

  test('spaceship has isSpaceship: true flag', () => {
    expect(gameCode).toContain('isSpaceship: true')
  })
})
