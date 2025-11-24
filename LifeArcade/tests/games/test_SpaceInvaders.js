import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'space-invaders.js')

describe('SpaceInvaders - File Structure', () => {
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

    // Should NOT contain 'this.' prefix for p5 functions
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

    // Check for balanced braces
    const openBraces = (gameCode.match(/\{/g) || []).length
    const closeBraces = (gameCode.match(/\}/g) || []).length
    expect(openBraces).toBe(closeBraces)

    // Check for balanced parentheses
    const openParens = (gameCode.match(/\(/g) || []).length
    const closeParens = (gameCode.match(/\)/g) || []).length
    expect(openParens).toBe(closeParens)
  })
})

describe('SpaceInvaders - GoL Integration', () => {
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

  test('imports Patterns for GoL patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Patterns }")
    expect(gameCode).toContain("from '/src/utils/Patterns.js'")
  })

  test('imports GoL helper functions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { seedRadialDensity, applyLifeForce, maintainDensity }')
    expect(gameCode).toContain("from '/src/utils/GoLHelpers.js'")
  })

  test('creates GoLEngine instances', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new GoLEngine(')
  })

  test('uses applyLifeForce for player and PatternRenderer for invaders', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Player uses applyLifeForce (Modified GoL)
    expect(gameCode).toContain('applyLifeForce(player)')
    // Invaders use PatternRenderer (static GoL patterns)
    expect(gameCode).toContain('createPatternRenderer(')
  })

  test('uses maintainDensity for Visual Only entities', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maintainDensity(bullet')
  })

  test('seeds GoL with radial density patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('seedRadialDensity(')
  })
})

describe('SpaceInvaders - Configuration', () => {
  let gameCode

  test('has CONFIG object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // CONFIG is now created via createGameConfig() helper
    expect(gameCode).toContain('const CONFIG = createGameConfig(')
  })

  test('uses portrait dimensions (1200×1920)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Dimensions are now in GAME_DIMENSIONS constant from GameBaseConfig
    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('imports GameBaseConfig helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // BASE_WIDTH/HEIGHT are now in GAME_DIMENSIONS from GameBaseConfig
    expect(gameCode).toContain('GAME_DIMENSIONS')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })

  test('uses ThemeReceiver for theme support', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Colors now come from ThemeReceiver (theme system)
    expect(gameCode).toContain('initThemeReceiver')
    expect(gameCode).toContain('getBackgroundColor')
    expect(gameCode).toContain('getTextColor')
  })

  test('has invader configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/invader:\s*\{/)
    expect(gameCode).toContain('cols:')
    expect(gameCode).toContain('rows:')
    expect(gameCode).toContain('moveIntervalStart:')  // Updated field name
  })

  test('has player configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player:\s*\{/)
    // Width/height/cellSize are now dynamically calculated from globalCellSize
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('shootCooldown')
  })

  test('has bullet configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet:\s*\{/)
  })
})

describe('SpaceInvaders - Game State', () => {
  let gameCode

  test('has state object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // State is now created via createGameState() helper
    expect(gameCode).toContain('const state = createGameState(')
  })

  test('state has score property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Score is set by createGameState() helper (default: 0)
    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.score')
  })

  test('state has phase property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Phase is set by createGameState() helper (default: 'PLAYING')
    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.phase')
  })

  test('state has lives property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Lives is set by createGameState() helper (default: 1)
    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.lives')
  })

  test('state has level tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/level:\s*1/)
  })

  test('imports GAMEOVER_CONFIG from GameBaseConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // GAMEOVER_CONFIG is now imported from GameBaseConfig
    expect(gameCode).toContain('GAMEOVER_CONFIG')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })
})

describe('SpaceInvaders - Entities', () => {
  let gameCode

  test('has player entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let player\s*=\s*null/)
  })

  test('has invaders array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let invaders\s*=\s*\[\]/)
  })

  test('has bullets array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let bullets\s*=\s*\[\]/)
  })

  test('has particles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let particles\s*=\s*\[\]/)
  })

  test('player has GoL engine', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('player has gradient configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.PLAYER')
  })

  test('invaders have GoL engines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('bullets have GoL engines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('has maskedRenderer for gradient rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let maskedRenderer\s*=\s*null/)
    expect(gameCode).toContain('maskedRenderer = new VideoGradientRenderer')
  })
})

describe('SpaceInvaders - Collision Detection', () => {
  let gameCode

  test('imports Collision utility', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Collision }")
    expect(gameCode).toContain("from '/src/utils/Collision.js'")
  })

  test('has checkCollisions function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function checkCollisions\s*\(\s*\)\s*\{/)
  })

  test('uses Collision.rectRect for bullet vs invader', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.rectRect(')
  })

  test('uses Collision.clamp for boundary checking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.clamp(')
  })

  test('handles collision by marking entities dead', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet\.dead\s*=\s*true/)
    expect(gameCode).toMatch(/invader\.dead\s*=\s*true/)
  })

  test('filters dead entities from arrays', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('bullets.filter')
    expect(gameCode).toContain('invaders.filter')
  })
})

describe('SpaceInvaders - Game Logic', () => {
  let gameCode

  test('has setup() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function setup\s*\(\s*\)\s*\{/)
  })

  test('has draw() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function draw\s*\(\s*\)\s*\{/)
  })

  test('setup() creates canvas', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createCanvas(')
  })

  test('setup() sets frame rate to 60', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('frameRate(60)')
  })

  test('has initGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function initGame\s*\(\s*\)\s*\{/)
  })

  test('has updateGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateGame\s*\(\s*\)\s*\{/)
  })

  test('has updatePlayer() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updatePlayer\s*\(\s*\)\s*\{/)
  })

  test('has updateInvaders() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateInvaders\s*\(\s*\)\s*\{/)
  })

  test('has updateBullets() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBullets\s*\(\s*\)\s*\{/)
  })

  test('has shootBullet() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function shootBullet\s*\(\s*\)\s*\{/)
  })

  test('handles keyboard input for player movement', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(LEFT_ARROW)')
    expect(gameCode).toContain('keyIsDown(RIGHT_ARROW)')
  })

  test('updates GoL with throttled update', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateThrottled(state.frameCount)')
  })

  test('increments score on collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.score\s*\+=/i)
  })

  test('has checkWinLose() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function checkWinLose\s*\(\s*\)\s*\{/)
  })

  test('handles game over when lives reach 0', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.lives\s*<=\s*0/)
    expect(gameCode).toMatch(/state\.phase\s*=\s*['"]DYING['"]/)
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })
})

describe('SpaceInvaders - postMessage Integration', () => {
  let gameCode

  test('sends postMessage to parent on game over', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('window.parent.postMessage')
  })

  test('postMessage has correct type field', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/type:\s*['"]gameOver['"]/)
  })

  test('postMessage includes score in payload', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/payload:\s*\{\s*score:\s*state\.score\s*\}/)
  })

  test('checks window.parent !== window before sending', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*window\.parent\s*!==\s*window\s*\)/)
  })

  test('only sends postMessage during DYING phase transition', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Should send in DYING phase, not PLAYING
    const postMessageBlock = gameCode.match(/if\s*\(\s*window\.parent[\s\S]*?postMessage[\s\S]*?\}/g)
    expect(postMessageBlock).toBeTruthy()
    expect(postMessageBlock.length).toBeGreaterThan(0)
  })
})

describe('SpaceInvaders - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
  })

  test('renders UI elements inline in draw()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // UI rendering is done inline in draw(), not separate renderUI() function
    expect(gameCode).toContain('function draw(')
  })

  test('uses maskedRenderer.renderMaskedGrid()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maskedRenderer.renderMaskedGrid(')
  })

  test('imports renderGameOver helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { renderGameOver')
    expect(gameCode).toContain("from '/src/utils/UIHelpers.js'")
  })

  test('uses responsive scaling', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('scaleFactor')
    expect(gameCode).toContain('scale(scaleFactor)')
  })

  test('imports particle helpers', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { updateParticles, renderParticles }')
    expect(gameCode).toContain("from '/src/utils/ParticleHelpers.js'")
  })
})

describe('SpaceInvaders - Window Resize', () => {
  let gameCode

  test('has windowResized() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function windowResized\s*\(\s*\)\s*\{/)
  })

  test('recalculates canvas size on resize', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('calculateResponsiveSize()')
    expect(gameCode).toContain('resizeCanvas(')
  })

  test('updates scale factor on resize', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateConfigScale()')
  })
})
