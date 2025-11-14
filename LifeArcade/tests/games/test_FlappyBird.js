import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'games', 'flappy-bird.js')

describe('FlappyBird - File Structure', () => {
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

    expect(gameCode).toContain('Flappy Bird')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

describe('FlappyBird - GoL Integration', () => {
  let gameCode

  test('imports GoLEngine from core', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { GoLEngine }")
    expect(gameCode).toContain("from '../src/core/GoLEngine.js'")
  })

  test('imports SimpleGradientRenderer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { SimpleGradientRenderer }")
    expect(gameCode).toContain("from '../src/rendering/SimpleGradientRenderer.js'")
  })

  test('imports GRADIENT_PRESETS', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { GRADIENT_PRESETS }")
    expect(gameCode).toContain("from '../src/utils/GradientPresets.js'")
  })

  test('imports Patterns for GoL patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Patterns }")
    expect(gameCode).toContain("from '../src/utils/Patterns.js'")
  })

  test('imports GoL helper functions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { seedRadialDensity, applyLifeForce, maintainDensity }')
    expect(gameCode).toContain("from '../src/utils/GoLHelpers.js'")
  })

  test('creates GoLEngine instances', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new GoLEngine(')
  })

  test('uses applyLifeForce for player (Modified GoL)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('applyLifeForce(player)')
  })

  test('uses maintainDensity for pipes (Visual Only)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maintainDensity(pipe')
  })

  test('seeds GoL with radial density patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('seedRadialDensity(')
  })

  test('documents Modified GoL vs Visual Only usage', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/Player uses Modified GoL/i)
    expect(gameCode).toMatch(/Pipes use Visual Only/i)
  })
})

describe('FlappyBird - Configuration', () => {
  let gameCode

  test('has CONFIG object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const CONFIG = {')
  })

  test('uses portrait dimensions (1200×1920)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('width: 1200')
    expect(gameCode).toContain('height: 1920')
  })

  test('has BASE_WIDTH and BASE_HEIGHT constants', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const BASE_WIDTH = 1200')
    expect(gameCode).toContain('const BASE_HEIGHT = 1920')
  })

  test('has Google brand UI colors', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("backgroundColor: '#FFFFFF'")
    expect(gameCode).toContain("textColor: '#5f6368'")
    expect(gameCode).toContain("accentColor: '#1a73e8'")
  })

  test('has player configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player:\s*\{/)
    expect(gameCode).toContain('width:')
    expect(gameCode).toContain('height:')
    expect(gameCode).toContain('cellSize:')
  })

  test('has gravity configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/gravity:\s*[\d.]+/)
  })

  test('has jumpForce configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/jumpForce:\s*-[\d.]+/)
  })

  test('has groundY and ceilingY configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/groundY:\s*\d+/)
    expect(gameCode).toMatch(/ceilingY:\s*\d+/)
  })

  test('has pipe configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/pipe:\s*\{/)
    expect(gameCode).toContain('width:')
    expect(gameCode).toContain('gap:')
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('spawnInterval:')
  })
})

describe('FlappyBird - Game State', () => {
  let gameCode

  test('has state object defined', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const state = {')
  })

  test('state has score property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('score: 0')
  })

  test('state has phase property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/phase:\s*['"]PLAYING['"]/)
  })

  test('state has lives property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/lives:\s*1/)
  })

  test('state tracks spawn timer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/spawnTimer:\s*0/)
  })

  test('has GAMEOVER_CONFIG with timing constants', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const GAMEOVER_CONFIG = {')
    expect(gameCode).toContain('MIN_DELAY:')
    expect(gameCode).toContain('MAX_WAIT:')
  })

  test('state has dyingTimer for death animation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/dyingTimer:\s*0/)
  })
})

describe('FlappyBird - Entities', () => {
  let gameCode

  test('has player entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let player\s*=\s*null/)
  })

  test('has pipes array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let pipes\s*=\s*\[\]/)
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
  })

  test('player has gradient configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.PLAYER')
  })

  test('pipes have GoL engines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: new GoLEngine(')
  })

  test('pipes have scored property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/scored:\s*false/)
  })

  test('has maskedRenderer for gradient rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let maskedRenderer\s*=\s*null/)
    expect(gameCode).toContain('maskedRenderer = new SimpleGradientRenderer')
  })
})

describe('FlappyBird - Collision Detection', () => {
  let gameCode

  test('imports Collision utility', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { Collision }")
    expect(gameCode).toContain("from '../src/utils/Collision.js'")
  })

  test('has checkCollisions function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function checkCollisions\s*\(\s*\)\s*\{/)
  })

  test('uses Collision.rectRect for pipe detection', () => {
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

  test('checks ceiling and ground collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player\.y\s*<\s*CONFIG\.ceilingY/)
    expect(gameCode).toMatch(/player\.y\s*>\s*CONFIG\.groundY/)
  })
})

describe('FlappyBird - Game Logic', () => {
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

  test('has spawnPipes() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnPipes\s*\(\s*\)\s*\{/)
  })

  test('has updatePipes() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updatePipes\s*\(\s*\)\s*\{/)
  })

  test('handles keyboard input for jumping', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(32)')  // SPACE
    expect(gameCode).toContain('keyIsDown(UP_ARROW)')
    expect(gameCode).toContain('keyIsDown(87)')  // W
  })

  test('applies gravity to player', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player\.vy\s*\+=\s*CONFIG\.gravity/)
  })

  test('spawns pipe pairs', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/topPipe.*bottomPipe/)
    expect(gameCode).toMatch(/pipes\.push\(topPipe,\s*bottomPipe\)/)
  })

  test('generates random gap positions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/random\(minGapTop,\s*maxGapTop\)/)
  })

  test('updates GoL with throttled update', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateThrottled(state.frameCount)')
  })

  test('increments score when passing pipes', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/pipe\.scored/)
    expect(gameCode).toMatch(/state\.score\+\+/)
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })

  test('removes off-screen pipes', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/pipes\s*=\s*pipes\.filter/)
  })
})

describe('FlappyBird - postMessage Integration', () => {
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

describe('FlappyBird - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
  })

  test('has renderUI() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderUI\s*\(\s*\)\s*\{/)
  })

  test('draws ceiling and ground lines', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/line\(.*ceilingY/)
    expect(gameCode).toMatch(/line\(.*groundY/)
  })

  test('uses maskedRenderer.renderMaskedGrid()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maskedRenderer.renderMaskedGrid(')
  })

  test('imports renderGameUI helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { renderGameUI')
    expect(gameCode).toContain("from '../src/utils/UIHelpers.js'")
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
    expect(gameCode).toContain("from '../src/utils/ParticleHelpers.js'")
  })

  test('hides player during DYING phase', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*state\.phase\s*===\s*['"]PLAYING['"]/)
  })
})

describe('FlappyBird - Window Resize', () => {
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

describe('FlappyBird - Pipe Spawning', () => {
  let gameCode

  test('spawns pipes at intervals', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.spawnTimer\s*>=\s*CONFIG\.pipe\.spawnInterval/)
  })

  test('creates top and bottom pipes', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/const topPipe/)
    expect(gameCode).toMatch(/const bottomPipe/)
  })

  test('top pipe uses ENEMY_HOT gradient', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.ENEMY_HOT')
  })

  test('bottom pipe uses ENEMY_COLD gradient', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.ENEMY_COLD')
  })

  test('pipes have Visual Only GoL (evolution speed 0)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Pipes use evolution speed of 0 for Visual Only GoL
    expect(gameCode).toContain('0  // Visual Only')
  })
})

describe('FlappyBird - Scoring System', () => {
  let gameCode

  test('tracks pipe scoring state', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/scored:\s*false/)
  })

  test('increments score when player passes pipe', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/if\s*\(\s*!pipe\.scored.*pipe\.x.*<\s*player\.x/)
    expect(gameCode).toMatch(/pipe\.scored\s*=\s*true/)
  })

  test('only scores each pipe once', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/!pipe\.scored/)
  })
})
