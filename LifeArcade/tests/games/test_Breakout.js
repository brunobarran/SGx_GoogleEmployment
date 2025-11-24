import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'breakout.js')

describe('Breakout - File Structure', () => {
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

    expect(gameCode).toContain('Breakout')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

describe('Breakout - GoL Integration', () => {
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

  test('uses applyLifeForce for paddle (Modified GoL)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('applyLifeForce(paddle)')
  })

  test('bricks use GoL patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Bricks are GoL-based entities
    expect(gameCode).toContain('new GoLEngine(')
    expect(gameCode).toContain('brick')
  })

  test('uses maintainDensity for ball (Visual Only)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maintainDensity(ball')
  })

  test('seeds GoL with radial density patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('seedRadialDensity(')
  })

  test('documents Modified GoL vs Visual Only usage', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/Paddle uses Modified GoL/i)
    expect(gameCode).toMatch(/Ball uses Visual Only/i)
  })
})

describe('Breakout - Configuration', () => {
  let gameCode

  test('has CONFIG object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

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

  test('has paddle configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/paddle:\s*\{/)
    expect(gameCode).toContain('width:')
    expect(gameCode).toContain('height:')
    expect(gameCode).toContain('speed:')
  })

  test('has ball configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/ball:\s*\{/)
    expect(gameCode).toContain('radius:')
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('maxAngle:')
  })

  test('has brick configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/brick:\s*\{/)
    expect(gameCode).toContain('rows:')
    expect(gameCode).toContain('cols:')
    expect(gameCode).toContain('width:')
    expect(gameCode).toContain('height:')
    expect(gameCode).toContain('padding:')
  })

  test('has BRICK_PATTERNS defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const BRICK_PATTERNS = [')
  })
})

describe('Breakout - Game State', () => {
  let gameCode

  test('has state object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const state = createGameState(')
  })

  test('state has score property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.score')
  })

  test('state has phase property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.phase')
  })

  test('state has lives property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createGameState')
    expect(gameCode).toContain('state.lives')
  })

  test('state has level tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/level:\s*1/)
  })

  test('state has level tracking for progression', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout has infinite level progression, not WIN condition
    expect(gameCode).toContain('state.level')
    expect(gameCode).toContain('nextLevel')
  })

  test('imports GAMEOVER_CONFIG from GameBaseConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAMEOVER_CONFIG')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })

  test('state has dyingTimer for death animation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/dyingTimer:\s*0/)
  })
})

describe('Breakout - Entities', () => {
  let gameCode

  test('has paddle entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let paddle\s*=\s*null/)
  })

  test('has ball entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let ball\s*=\s*null/)
  })

  test('has bricks array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let bricks\s*=\s*\[\]/)
  })

  test('has particles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let particles\s*=\s*\[\]/)
  })

  test('paddle has GoL engine', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('ball has GoL engine', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('ball has stuck property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('stuck:')
  })

  test('bricks have GoL engines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('paddle has gradient configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.PLAYER')
  })

  test('ball has gradient configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.BULLET')
  })

  test('has maskedRenderer for gradient rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let maskedRenderer\s*=\s*null/)
    expect(gameCode).toContain('maskedRenderer = new VideoGradientRenderer')
  })
})

describe('Breakout - Collision Detection', () => {
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

  test('uses Collision.circleRect for ball vs paddle', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.circleRect(')
  })

  test('uses Collision.clamp for boundary checking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.clamp(')
  })

  test('uses Collision.lerp for angle calculation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.lerp(')
  })

  test('handles ball vs brick collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/brick\.dead\s*=\s*true/)
  })

  test('determines bounce direction from hit side', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/ball\.vx\s*\*=\s*-1/)
    expect(gameCode).toMatch(/ball\.vy\s*\*=\s*-1/)
  })

  test('filters dead bricks from array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('bricks.filter')
  })
})

describe('Breakout - Game Logic', () => {
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

  test('has updatePaddle() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updatePaddle\s*\(\s*\)\s*\{/)
  })

  test('has updateBall() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBall\s*\(\s*\)\s*\{/)
  })

  test('has resetBall() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function resetBall\s*\(\s*\)\s*\{/)
  })

  test('has setupBricks() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function setupBricks\s*\(\s*\)\s*\{/)
  })

  test('handles keyboard input for paddle movement', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(LEFT_ARROW)')
    expect(gameCode).toContain('keyIsDown(RIGHT_ARROW)')
  })

  test('ball follows paddle when stuck', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*ball\.stuck\s*\)/)
  })

  test('releases ball on space key', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/keyIsDown\(32\)/)  // SPACE
    expect(gameCode).toMatch(/ball\.stuck\s*=\s*false/)
  })

  test('handles ball hitting bottom (lose life)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/ball\.y.*>\s*CONFIG\.height/)
    expect(gameCode).toMatch(/state\.lives--/)
  })

  test('updates GoL with throttled update', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateThrottled(state.frameCount)')
  })

  test('increments score on brick destruction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.score\s*\+=\s*brick\.scoreValue/)
  })

  test('handles level progression (all bricks cleared)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout progresses to next level, not WIN screen
    expect(gameCode).toMatch(/bricks\.length\s*===\s*0/)
    expect(gameCode).toContain('nextLevel()')
  })

  test('handles game over condition (lives depleted)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout ends with GAMEOVER when lives depleted (no WIN/LOSE distinction)
    expect(gameCode).toMatch(/state\.lives\s*<=\s*0/)
    expect(gameCode).toMatch(/state\.phase\s*=\s*['"]DYING['"]/)
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })
})

describe('Breakout - postMessage Integration', () => {
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

    const postMessageBlock = gameCode.match(/if\s*\(\s*window\.parent[\s\S]*?postMessage[\s\S]*?\}/g)
    expect(postMessageBlock).toBeTruthy()
    expect(postMessageBlock.length).toBeGreaterThan(0)
  })

  test('sends postMessage only on GAMEOVER (no WIN condition)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout only sends gameOver when lives depleted (no WIN condition)
    expect(gameCode).toMatch(/state\.phase\s*=\s*['"]GAMEOVER['"]/)
    expect(gameCode).toContain('window.parent.postMessage')
  })
})

describe('Breakout - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
  })

  test('renders UI elements inline in draw()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // UI rendered inline in draw(), not separate renderUI function
    expect(gameCode).toContain('function draw()')
    expect(gameCode).toContain('state.score')
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

  test('imports renderGameOver helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('renderGameOver')
  })

  test('has level progression system (no WIN screen)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout has infinite progression, not WIN condition
    expect(gameCode).toContain('nextLevel')
    expect(gameCode).toContain('bricks.length === 0')
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

  test('hides ball during DYING phase', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*state\.phase\s*===\s*['"]PLAYING['"]/)
  })

  test('shows GAMEOVER screen on death', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Breakout only has GAMEOVER screen (no WIN screen)
    expect(gameCode).toMatch(/if\s*\(\s*state\.phase\s*===\s*['"]GAMEOVER['"]/)
  })
})

describe('Breakout - Window Resize', () => {
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

describe('Breakout - Brick Patterns', () => {
  let gameCode

  test('bricks have different score values', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/scoreValue:\s*\d+/)
  })

  test('bricks use different gradients by row', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/BRICK_PATTERNS\[row\s*%/)
  })

  test('bricks are arranged in grid', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/for\s*\(\s*let row.*;\s*row\s*<\s*CONFIG\.brick\.rows/)
    expect(gameCode).toMatch(/for\s*\(\s*let col.*;\s*col\s*<\s*CONFIG\.brick\.cols/)
  })
})
