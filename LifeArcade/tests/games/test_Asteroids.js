import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'asteroids.js')

describe('Asteroids - File Structure', () => {
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

describe('Asteroids - GoL Integration', () => {
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

  test('imports PatternRenderer for static patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('import { createPatternRenderer')
    expect(gameCode).toContain("from '/src/utils/PatternRenderer.js'")
  })

  test('uses GLIDER pattern for player', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.GLIDER')
  })

  test('creates GoLEngine instances for bullets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new GoLEngine(')
  })

  test('uses PatternRenderer for asteroids', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('createPatternRenderer(')
  })
})

describe('Asteroids - Configuration', () => {
  let gameCode

  test('has CONFIG object defined via createGameConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const CONFIG = createGameConfig(')
  })

  test('uses GAME_DIMENSIONS for portrait dimensions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAME_DIMENSIONS')
  })

  test('imports GameBaseConfig helper', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAME_DIMENSIONS')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })

  test('uses ThemeReceiver for theme support', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('initThemeReceiver')
    expect(gameCode).toContain('getBackgroundColor')
    expect(gameCode).toContain('getTextColor')
  })

  test('has player configuration with rotation and thrust', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player:\s*\{/)
    expect(gameCode).toContain('rotationSpeed:')
    expect(gameCode).toContain('thrustPower:')
    expect(gameCode).toContain('maxSpeed:')
    expect(gameCode).toContain('friction:')
  })

  test('has bullet configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet:\s*\{/)
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('lifetime:')
  })

  test('has asteroid configuration with sizes', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/asteroid:\s*\{/)
    expect(gameCode).toContain('LARGE')
    expect(gameCode).toContain('MEDIUM')
    expect(gameCode).toContain('SMALL')
  })

  test('has globalCellSize configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('globalCellSize:')
  })
})

describe('Asteroids - Game State', () => {
  let gameCode

  test('has state object defined via createGameState', () => {
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

  test('state has player shoot cooldown', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('playerShootCooldown')
  })

  test('state has player invincibility timer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('playerInvincibility')
  })

  test('imports GAMEOVER_CONFIG from GameBaseConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAMEOVER_CONFIG')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })
})

describe('Asteroids - Entities', () => {
  let gameCode

  test('has player entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let player\s*=\s*null/)
  })

  test('has asteroids array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let asteroids\s*=\s*\[\]/)
  })

  test('has bullets array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let bullets\s*=\s*\[\]/)
  })

  test('has particles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let particles\s*=\s*\[\]/)
  })

  test('player has velocity properties (vx, vy)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('vx: 0')
    expect(gameCode).toContain('vy: 0')
  })

  test('player has angle property for rotation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('angle:')
  })

  test('player has render offset for centroid-based rotation pivot', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Centroid calculation for proper rotation around visual center
    expect(gameCode).toContain('renderOffsetX')
    expect(gameCode).toContain('renderOffsetY')
    expect(gameCode).toContain('centroidX')
    expect(gameCode).toContain('centroidY')
  })

  test('player has gradient configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gradient: GRADIENT_PRESETS.PLAYER')
  })

  test('has maskedRenderer for gradient rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let maskedRenderer\s*=\s*null/)
    expect(gameCode).toContain('maskedRenderer = new VideoGradientRenderer')
  })
})

describe('Asteroids - Physics System', () => {
  let gameCode

  test('has rotation input handling (LEFT/RIGHT arrows)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(LEFT_ARROW)')
    expect(gameCode).toContain('keyIsDown(RIGHT_ARROW)')
  })

  test('has WASD alternative input', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(65)')  // A
    expect(gameCode).toContain('keyIsDown(68)')  // D
    expect(gameCode).toContain('keyIsDown(87)')  // W
  })

  test('applies thrust in direction of angle', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Math.cos(player.angle)')
    expect(gameCode).toContain('Math.sin(player.angle)')
    expect(gameCode).toContain('thrustPower')
  })

  test('limits maximum speed', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maxSpeed')
    expect(gameCode).toContain('Math.sqrt(player.vx * player.vx + player.vy * player.vy)')
  })

  test('applies friction to velocity', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('friction')
    expect(gameCode).toMatch(/player\.vx\s*\*=/)
    expect(gameCode).toMatch(/player\.vy\s*\*=/)
  })

  test('updates position based on velocity', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player\.x\s*\+=\s*player\.vx/)
    expect(gameCode).toMatch(/player\.y\s*\+=\s*player\.vy/)
  })
})

describe('Asteroids - Screen Wrap', () => {
  let gameCode

  test('has wrapPosition function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function wrapPosition\s*\(/)
  })

  test('wraps horizontally when x < 0', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/entity\.x\s*<\s*0/)
    expect(gameCode).toContain('CONFIG.width')
  })

  test('wraps horizontally when x > width', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/entity\.x\s*>\s*CONFIG\.width/)
  })

  test('wraps vertically when y < 0', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/entity\.y\s*<\s*0/)
    expect(gameCode).toContain('CONFIG.height')
  })

  test('wraps vertically when y > height', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/entity\.y\s*>\s*CONFIG\.height/)
  })

  test('applies wrap to player', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('wrapPosition(player)')
  })

  test('applies wrap to asteroids', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('wrapPosition(asteroid)')
  })

  test('applies wrap to bullets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('wrapPosition(bullet)')
  })
})

describe('Asteroids - Asteroid System', () => {
  let gameCode

  test('has createAsteroid function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function createAsteroid\s*\(/)
  })

  test('has spawnAsteroidsForLevel function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnAsteroidsForLevel\s*\(/)
  })

  test('has destroyAsteroid function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function destroyAsteroid\s*\(/)
  })

  test('has spawnChildAsteroids function for division', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnChildAsteroids\s*\(/)
  })

  test('LARGE asteroids spawn MEDIUM on destruction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/asteroid\.size\s*===\s*['"]LARGE['"]/)
    expect(gameCode).toContain("spawnChildAsteroids(asteroid, 'MEDIUM'")
  })

  test('MEDIUM asteroids spawn SMALL on destruction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/asteroid\.size\s*===\s*['"]MEDIUM['"]/)
    expect(gameCode).toContain("spawnChildAsteroids(asteroid, 'SMALL'")
  })

  test('uses GoL still life patterns for asteroids', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.LOAF')
    expect(gameCode).toContain('PatternName.BOAT')
    expect(gameCode).toContain('PatternName.BLOCK')
  })

  test('spawns asteroids at screen edges', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('edge')
    expect(gameCode).toMatch(/case\s*0:/)  // Top
    expect(gameCode).toMatch(/case\s*1:/)  // Right
    expect(gameCode).toMatch(/case\s*2:/)  // Bottom
    expect(gameCode).toMatch(/case\s*3:/)  // Left
  })
})

describe('Asteroids - Bullet System', () => {
  let gameCode

  test('has shootBullet function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function shootBullet\s*\(\s*\)\s*\{/)
  })

  test('respects shoot cooldown', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('playerShootCooldown > 0')
    expect(gameCode).toContain('return')
  })

  test('spawns bullet at ship nose', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('noseDistance')
    expect(gameCode).toContain('Math.cos(player.angle)')
    expect(gameCode).toContain('Math.sin(player.angle)')
  })

  test('bullet inherits player momentum', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('player.vx')
    expect(gameCode).toContain('player.vy')
  })

  test('bullets have lifetime', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('lifetime:')
    expect(gameCode).toContain('bullet.lifetime')
  })

  test('bullets die when lifetime expires', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/lifetime\s*<=\s*0/)
    expect(gameCode).toMatch(/bullet\.dead\s*=\s*true/)
  })

  test('uses BLOCK pattern for bullets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Patterns.BLOCK')
  })
})

describe('Asteroids - Collision Detection', () => {
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

  test('uses circle-circle collision for bullets vs asteroids', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.circleCircle(')
  })

  test('uses circle-circle collision for player vs asteroids', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Multiple circleCircle calls expected
    const matches = gameCode.match(/Collision\.circleCircle\(/g)
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })

  test('respects player invincibility', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('playerInvincibility')
    expect(gameCode).toMatch(/playerInvincibility\s*<=\s*0/)
  })

  test('handles collision by marking entities dead', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet\.dead\s*=\s*true/)
    expect(gameCode).toMatch(/asteroid\.dead\s*=\s*true/)
  })

  test('filters dead entities from arrays', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('bullets.filter')
    expect(gameCode).toContain('asteroids.filter')
  })
})

describe('Asteroids - Game Logic', () => {
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

  test('has updateAsteroids() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateAsteroids\s*\(\s*\)\s*\{/)
  })

  test('has updateBullets() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBullets\s*\(\s*\)\s*\{/)
  })

  test('has checkLevelComplete() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function checkLevelComplete\s*\(\s*\)\s*\{/)
  })

  test('increments level when all asteroids destroyed', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('asteroids.length === 0')
    expect(gameCode).toContain('state.level++')
  })

  test('increments score on asteroid destruction', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.score\s*\+=/)
  })

  test('has destroyPlayer() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function destroyPlayer\s*\(\s*\)\s*\{/)
  })

  test('handles game over when player destroyed', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.lives\s*=\s*0/)
    expect(gameCode).toMatch(/state\.phase\s*=\s*['"]DYING['"]/)
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })

  test('has spawnPlayerExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnPlayerExplosion\s*\(\s*\)\s*\{/)
  })
})

describe('Asteroids - postMessage Integration', () => {
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
})

describe('Asteroids - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
  })

  test('uses maskedRenderer.renderMaskedGrid()', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maskedRenderer.renderMaskedGrid(')
  })

  test('applies rotation to player rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('translate(player.x, player.y)')
    expect(gameCode).toContain('rotate(player.angle')
  })

  test('has thrust effect rendering', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderThrustEffect\s*\(\s*\)\s*\{/)
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

  test('shows invincibility blinking effect', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('playerInvincibility')
    expect(gameCode).toContain('frameCount % ')
  })
})

describe('Asteroids - Window Resize', () => {
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
