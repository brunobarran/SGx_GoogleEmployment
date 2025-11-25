import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'life-drop.js')

describe('Life Drop - File Structure', () => {
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

    expect(gameCode).toContain('Life Drop')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

describe('Life Drop - GoL Integration', () => {
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

  test('imports Patterns including stampPattern', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Patterns, stampPattern }")
    expect(gameCode).toContain("from '/src/utils/Patterns.js'")
  })

  test('creates GoLEngine instance', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new GoLEngine(')
  })

  test('uses R_PENTOMINO pattern', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('R_PENTOMINO')
    expect(gameCode).toContain('Patterns.R_PENTOMINO')
  })

  test('uses stampPattern to place patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('stampPattern(')
  })
})

describe('Life Drop - Configuration', () => {
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
    expect(gameCode).toContain('cols:')
    expect(gameCode).toContain('rows:')
    expect(gameCode).toContain('cellSize:')
  })

  test('has game configuration with maxDrops', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('game:')
    expect(gameCode).toContain('maxDrops:')
  })

  test('has simulation configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('simulationFps:')
    expect(gameCode).toContain('maxGenerations:')
    expect(gameCode).toContain('stabilityThreshold:')
  })
})

describe('Life Drop - Game State', () => {
  let gameCode

  test('has state object with createGameState', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const state = createGameState(')
  })

  test('has phase state for game flow', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("phase: 'PLACEMENT'")
    expect(gameCode).toContain('SIMULATION')
    expect(gameCode).toContain('GAMEOVER')
  })

  test('has dropsRemaining state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('dropsRemaining:')
  })

  test('has cursor position state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('cursor:')
  })

  test('has population tracking state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('population:')
    expect(gameCode).toContain('peakPopulation:')
  })

  test('has generation counter', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('generation:')
  })

  test('has stability tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('stabilityCounter:')
    expect(gameCode).toContain('lastPopulation:')
  })
})

describe('Life Drop - Game Functions', () => {
  let gameCode

  test('has initGame function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function initGame()')
  })

  test('has dropPattern function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function dropPattern()')
  })

  test('has countPopulation function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function countPopulation()')
  })

  test('has checkGameOver function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function checkGameOver()')
  })

  test('has updatePlacement function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updatePlacement()')
  })

  test('has updateSimulation function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function updateSimulation()')
  })

  test('has handleCursorMovement function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function handleCursorMovement()')
  })
})

describe('Life Drop - Game Over Conditions', () => {
  let gameCode

  test('checks for extinction (population === 0)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.population === 0')
  })

  test('checks for stability threshold', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('stabilityCounter')
    expect(gameCode).toContain('stabilityThreshold')
  })

  test('checks for max generations', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maxGenerations')
  })

  test('sets score to peak population', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.score = state.peakPopulation')
  })

  test('sends postMessage on game over', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("type: 'gameOver'")
    expect(gameCode).toContain('payload: { score:')
    expect(gameCode).toContain('window.parent.postMessage')
  })
})

describe('Life Drop - Rendering', () => {
  let gameCode

  test('has renderGame function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderGame()')
  })

  test('has renderGrid function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderGrid()')
  })

  test('has renderCursor function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderCursor()')
  })

  test('has renderDropsIndicator function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('function renderDropsIndicator()')
  })

  test('uses maskedRenderer for grid', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maskedRenderer.renderMaskedGrid')
  })
})

describe('Life Drop - Input Handling', () => {
  let gameCode

  test('handles arrow keys for cursor movement', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('LEFT_ARROW')
    expect(gameCode).toContain('RIGHT_ARROW')
    expect(gameCode).toContain('UP_ARROW')
    expect(gameCode).toContain('DOWN_ARROW')
  })

  test('handles WASD for cursor movement', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // A=65, D=68, W=87, S=83
    expect(gameCode).toContain('65')
    expect(gameCode).toContain('68')
    expect(gameCode).toContain('87')
    expect(gameCode).toContain('83')
  })

  test('handles Space for dropping pattern', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyCode === 32')
  })

  test('handles N key as alternative drop', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyCode === 78')
  })
})

describe('Life Drop - Theme Support', () => {
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
})

describe('Life Drop - Exports', () => {
  let gameCode

  test('exports CONFIG for testing', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('export {')
    expect(gameCode).toContain('CONFIG')
  })

  test('exports state for testing', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state')
  })

  test('exports key functions for testing', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('initGame')
    expect(gameCode).toContain('dropPattern')
    expect(gameCode).toContain('countPopulation')
    expect(gameCode).toContain('checkGameOver')
  })
})
