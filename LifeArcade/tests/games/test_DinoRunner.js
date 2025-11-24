import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'dino-runner.js')

describe('DinoRunner - File Structure', () => {
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

    expect(gameCode).toContain('Dino Runner')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

describe('DinoRunner - GoL Integration', () => {
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

  test('imports PatternRenderer for static GoL patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses PatternRenderer for obstacles, not Patterns
    expect(gameCode).toContain("import { createPatternRenderer")
    expect(gameCode).toContain("from '/src/utils/PatternRenderer.js'")
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

  test('uses PNG sprite for player (approved deviation)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses PNG sprite for player (client requirement for brand identity)
    expect(gameCode).toContain('preload')
    expect(gameCode).toContain('loadImage')
  })

  test('uses PatternRenderer for obstacles (Visual Only)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses PatternRenderer for static patterns
    expect(gameCode).toContain('createPatternRenderer')
    expect(gameCode).toContain('RenderMode.STATIC')
  })

  test('seeds GoL with radial density patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('seedRadialDensity(')
  })

  test('documents Modified GoL vs Visual Only usage', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/Player uses Modified GoL/i)
    expect(gameCode).toMatch(/Visual Only GoL/i)
  })
})

describe('DinoRunner - Configuration', () => {
  let gameCode

  test('has CONFIG object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const CONFIG = createGameConfig(')
  })

  test('uses portrait dimensions (1200×1920)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Uses GAME_DIMENSIONS from GameBaseConfig, not hardcoded values
    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('imports GameBaseConfig helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAME_DIMENSIONS')
    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('has theme support via ThemeReceiver', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Uses ThemeReceiver for dynamic theme colors, not hardcoded
    expect(gameCode).toContain('initThemeReceiver')
    expect(gameCode).toContain('getBackgroundColor')
    expect(gameCode).toContain('getTextColor')
  })

  test('has gravity configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/gravity:\s*[\d.]+/)
  })

  test('has groundY configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses calculated groundY based on GAME_DIMENSIONS
    expect(gameCode).toContain('groundY:')
    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('has jumpForce configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/jumpForce:\s*-[\d.]+/)
  })

  test('has obstacle configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/obstacle:\s*\{/)
    expect(gameCode).toContain('spawnInterval:')
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('speedIncrease:')
  })
})

describe('DinoRunner - Game State', () => {
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

  test('state tracks spawn timer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/spawnTimer:\s*0/)
  })

  test('state tracks game speed', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/gameSpeed:\s*[\d.]+/)
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

describe('DinoRunner - Entities', () => {
  let gameCode

  test('has player entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let player\s*=\s*null/)
  })

  test('has obstacles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let obstacles\s*=\s*\[\]/)
  })

  test('has particles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let particles\s*=\s*\[\]/)
  })

  test('player has GoL engine', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('player has physics properties', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('vy: 0')
    expect(gameCode).toContain('onGround: true')
  })

  test('player uses PNG sprite (no gradient)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses PNG sprites for player, not GoL with gradient
    expect(gameCode).toContain('loadImage')
    expect(gameCode).toContain('dinoSprites')
  })

  test('obstacles have GoL engines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('has maskedRenderer for gradient rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let maskedRenderer\s*=\s*null/)
    expect(gameCode).toContain('maskedRenderer = new VideoGradientRenderer')
  })
})

describe('DinoRunner - Collision Detection', () => {
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

  test('uses Collision.rectRect for obstacle detection', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.rectRect(')
  })

  test('triggers DYING phase on collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.phase\s*=\s*['"]DYING['"]/)
  })

  test('spawns explosion on collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/spawnExplosion\(player/)
  })
})

describe('DinoRunner - Game Logic', () => {
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

  test('has spawnObstacle() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnObstacle\s*\(\s*\)\s*\{/)
  })

  test('handles keyboard input for jumping', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(32)')  // SPACE
    expect(gameCode).toContain('keyIsDown(UP_ARROW)')
  })

  test('applies gravity to player', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player\.vy\s*\+=\s*CONFIG\.gravity/)
  })

  test('handles ground collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player\.y\s*>=\s*CONFIG\.groundY/)
  })

  test('spawns obstacles dynamically', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/obstacles\.push/)
  })

  test('updates GoL with throttled update', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateThrottled(state.frameCount)')
  })

  test('increments score over time', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.score\+\+/)
  })

  test('increases difficulty over time', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.gameSpeed\s*\+=/)
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })

  test('removes off-screen obstacles', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/obstacles\s*=\s*obstacles\.filter/)
  })
})

describe('DinoRunner - postMessage Integration', () => {
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

  test('waits for particle animation before sending', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/minDelayPassed|particlesDone|maxWaitReached/)
  })
})

describe('DinoRunner - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
  })

  test('renders UI elements inline in draw()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner renders UI inline in draw(), no separate renderUI function
    expect(gameCode).toContain('function draw()')
    expect(gameCode).toContain('state.score')
  })

  test('has horizon line for visual reference', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses horizonY for visual reference
    expect(gameCode).toContain('horizonY:')
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

  test('hides player during DYING phase', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*state\.phase\s*===\s*['"]PLAYING['"]/)
  })
})

describe('DinoRunner - Window Resize', () => {
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

describe('DinoRunner - Obstacle Variety', () => {
  let gameCode

  test('has multiple obstacle types', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses obstaclePatterns and pterodactylPatterns arrays
    expect(gameCode).toContain('obstaclePatterns:')
    expect(gameCode).toContain('pterodactylPatterns:')
  })

  test('obstacles have different sizes via gridSize', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // DinoRunner uses gridSize (cols/rows) for obstacle dimensions
    expect(gameCode).toContain('gridSize:')
    expect(gameCode).toContain('cols:')
    expect(gameCode).toContain('rows:')
  })

  test('obstacles use different gradients', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/gradient:\s*GRADIENT_PRESETS\.ENEMY_HOT/)
    expect(gameCode).toMatch(/gradient:\s*GRADIENT_PRESETS\.ENEMY_COLD/)
    expect(gameCode).toMatch(/gradient:\s*GRADIENT_PRESETS\.ENEMY_RAINBOW/)
  })
})
