import { describe, test, expect } from 'vitest'
import { readFileSync } from 'fs'
import { join } from 'path'

const GAME_PATH = join(process.cwd(), 'public', 'games', 'galaga.js')

// ============================================
// FILE STRUCTURE
// ============================================

describe('Galaga (Cellship Strike) - File Structure', () => {
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

  test('has game header documentation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Cellship Strike')
    expect(gameCode).toContain('@author')
    expect(gameCode).toContain('@license')
  })
})

// ============================================
// GOL INTEGRATION
// ============================================

describe('Galaga - GoL Integration', () => {
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

  test('imports PatternRenderer for enemies and player', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("import { createPatternRenderer, RenderMode, PatternName }")
    expect(gameCode).toContain("from '/src/utils/PatternRenderer.js'")
  })

  test('creates GoLEngine instances', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('new GoLEngine(')
  })

  test('uses maintainDensity for bullets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('maintainDensity(bullet')
  })

  test('seeds GoL with radial density patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('seedRadialDensity(')
  })
})

// ============================================
// GAME CONFIGURATION
// ============================================

describe('Galaga - Configuration', () => {
  let gameCode

  test('has CONFIG object defined via createGameConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const CONFIG = createGameConfig(')
  })

  test('uses GAME_DIMENSIONS from GameBaseConfig', () => {
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

  test('has player configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/player:\s*\{/)
    expect(gameCode).toContain('speed:')
    expect(gameCode).toContain('shootCooldown:')
  })

  test('has bullet configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet:\s*\{/)
    expect(gameCode).toContain('speed:')
  })

  test('has spawn configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/spawn:\s*\{/)
    expect(gameCode).toContain('intervalStart:')
    expect(gameCode).toContain('intervalMin:')
    expect(gameCode).toContain('multiSpawnChance:')
  })

  test('has stars configuration for parallax background', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/stars:\s*\{/)
    expect(gameCode).toContain('count:')
    expect(gameCode).toContain('speedMin:')
    expect(gameCode).toContain('speedMax:')
  })

  test('has enemy configuration with 3 types', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/enemy:\s*\{/)
    expect(gameCode).toMatch(/small:\s*\{/)
    expect(gameCode).toMatch(/medium:\s*\{/)
    expect(gameCode).toMatch(/large:\s*\{/)
  })

  test('enemy types use correct GoL patterns', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.BLINKER')
    expect(gameCode).toContain('PatternName.BEACON')
    expect(gameCode).toContain('PatternName.GLIDER')
  })

  test('has hitbox configuration for all entity types', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/hitbox:\s*\{/)
    expect(gameCode).toMatch(/player:\s*\{\s*min:/)
    expect(gameCode).toMatch(/enemies:\s*\{\s*min:/)
    expect(gameCode).toMatch(/boss:\s*\{\s*min:/)
    expect(gameCode).toMatch(/bullets:\s*\{\s*min:/)
  })
})

// ============================================
// BOSS SYSTEM CONFIGURATION
// ============================================

describe('Galaga - Boss System Configuration', () => {
  let gameCode

  test('has boss configuration object', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/boss:\s*\{/)
  })

  test('has PULSAR boss configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/pulsar:\s*\{/)
    expect(gameCode).toContain('PatternName.PULSAR')
  })

  test('PULSAR boss has correct HP (2)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Extract pulsar config block
    const pulsarMatch = gameCode.match(/pulsar:\s*\{[^}]+hp:\s*(\d+)/)
    expect(pulsarMatch).toBeTruthy()
    expect(parseInt(pulsarMatch[1])).toBe(2)
  })

  test('PULSAR boss gives 100 points reward', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    const pulsarMatch = gameCode.match(/pulsar:\s*\{[^}]+scoreValue:\s*(\d+)/)
    expect(pulsarMatch).toBeTruthy()
    expect(parseInt(pulsarMatch[1])).toBe(100)
  })

  test('has DRAGON boss configuration', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/dragon:\s*\{/)
    expect(gameCode).toContain('PatternName.DRAGON_VERTICAL')
  })

  test('DRAGON boss has correct HP (4)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Extract dragon config block
    const dragonMatch = gameCode.match(/dragon:\s*\{[^}]+hp:\s*(\d+)/)
    expect(dragonMatch).toBeTruthy()
    expect(parseInt(dragonMatch[1])).toBe(4)
  })

  test('DRAGON boss gives 200 points reward', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    const dragonMatch = gameCode.match(/dragon:\s*\{[^}]+scoreValue:\s*(\d+)/)
    expect(dragonMatch).toBeTruthy()
    expect(parseInt(dragonMatch[1])).toBe(200)
  })

  test('has shared boss settings', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Shared boss settings after pulsar/dragon configs
    expect(gameCode).toMatch(/boss:\s*\{[\s\S]*speed:\s*\d+/)
    expect(gameCode).toMatch(/boss:\s*\{[\s\S]*shootInterval:\s*\d+/)
    expect(gameCode).toMatch(/boss:\s*\{[\s\S]*bulletSpeed:\s*\d+/)
    expect(gameCode).toMatch(/boss:\s*\{[\s\S]*bulletSpread:\s*[\d.]+/)
    expect(gameCode).toMatch(/boss:\s*\{[\s\S]*yPosition:\s*\d+/)
  })
})

// ============================================
// GAME STATE
// ============================================

describe('Galaga - Game State', () => {
  let gameCode

  test('has state object defined via createGameState', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('const state = createGameState(')
  })

  test('state has score property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.score')
  })

  test('state has phase property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.phase')
  })

  test('state has lives property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('state.lives')
  })

  test('state has spawn timer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('spawnTimer:')
    expect(gameCode).toContain('currentSpawnInterval:')
  })

  test('state has difficulty tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('difficultyLevel:')
  })

  test('state has boss tracking', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('lastBossScore:')
    expect(gameCode).toContain('bossShootTimer:')
  })

  test('imports GAMEOVER_CONFIG from GameBaseConfig', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('GAMEOVER_CONFIG')
    expect(gameCode).toContain("from '/src/utils/GameBaseConfig.js'")
  })
})

// ============================================
// ENTITIES
// ============================================

describe('Galaga - Entities', () => {
  let gameCode

  test('has player entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let player\s*=\s*null/)
  })

  test('has enemies array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let enemies\s*=\s*\[\]/)
  })

  test('has bullets array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let bullets\s*=\s*\[\]/)
  })

  test('has particles array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let particles\s*=\s*\[\]/)
  })

  test('has stars array for parallax', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let stars\s*=\s*\[\]/)
  })

  test('has boss entity variable', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let boss\s*=\s*null/)
  })

  test('has bossBullets array', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/let bossBullets\s*=\s*\[\]/)
  })

  test('player has GoL engine via PatternRenderer', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('gol: renderer.gol')
  })

  test('player uses COPPERHEAD pattern', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('PatternName.COPPERHEAD')
    expect(gameCode).toContain('Patterns.COPPERHEAD')
  })

  test('player has pre-computed animation phases', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('phases: phases')
    expect(gameCode).toContain('currentPhase:')
    expect(gameCode).toContain('phaseTimer:')
    expect(gameCode).toContain('phaseDelay:')
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

// ============================================
// BOSS SYSTEM LOGIC
// ============================================

describe('Galaga - Boss System Logic', () => {
  let gameCode

  test('has spawnBoss function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnBoss\s*\(\s*bossType\s*\)/)
  })

  test('has updateBoss function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBoss\s*\(\s*\)/)
  })

  test('has shootBossBullets function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function shootBossBullets\s*\(\s*\)/)
  })

  test('has damageBoss function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function damageBoss\s*\(\s*\)/)
  })

  test('has updateBossSpawning function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBossSpawning\s*\(\s*\)/)
  })

  test('boss spawning alternates between pulsar and dragon', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check for boss type selection logic
    expect(gameCode).toContain("'pulsar'")
    expect(gameCode).toContain("'dragon'")
    expect(gameCode).toContain('bossType')
  })

  test('boss has flash effect when hit', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('flashTimer')
    expect(gameCode).toContain('boss.flashTimer')
  })

  test('boss shoots fan of bullets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check for multi-bullet shooting (fan pattern)
    expect(gameCode).toContain('bulletSpread')
    expect(gameCode).toContain('angles.forEach')
  })

  test('boss has entry animation', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('entering:')
    expect(gameCode).toContain('boss.entering')
    expect(gameCode).toContain('targetY')
  })

  test('has spawnBossExplosion function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnBossExplosion\s*\(\s*\)/)
  })
})

// ============================================
// HITBOX SYSTEM
// ============================================

describe('Galaga - Hitbox System', () => {
  let gameCode

  test('has calculateClampedHitbox function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function calculateClampedHitbox\s*\(/)
  })

  test('calculateClampedHitbox accepts width, height, and entityType', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function calculateClampedHitbox\s*\(\s*spriteWidth\s*,\s*spriteHeight\s*,\s*entityType\s*\)/)
  })

  test('hitbox calculation returns width, height, and offsets', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    const hitboxFunction = gameCode.match(/function calculateClampedHitbox[\s\S]*?return\s*\{[\s\S]*?\}/m)
    expect(hitboxFunction).toBeTruthy()
    expect(hitboxFunction[0]).toContain('width:')
    expect(hitboxFunction[0]).toContain('height:')
    expect(hitboxFunction[0]).toContain('offsetX:')
    expect(hitboxFunction[0]).toContain('offsetY:')
  })

  test('hitbox is scaled to 70% of sprite size', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('* 0.7')
  })

  test('hitbox respects min/max limits from CONFIG', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('CONFIG.hitbox[entityType]')
    expect(gameCode).toContain('limits.min')
    expect(gameCode).toContain('limits.max')
  })

  test('entities have hitbox property', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check that entities are created with hitbox (assigned from calculateClampedHitbox result)
    expect(gameCode).toMatch(/hitbox:\s*hitbox/)
    // Verify calculateClampedHitbox is called to compute hitbox
    expect(gameCode).toContain('calculateClampedHitbox(')
  })
})

// ============================================
// COLLISION DETECTION
// ============================================

describe('Galaga - Collision Detection', () => {
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

  test('uses Collision.rectRect for collision checks', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.rectRect(')
  })

  test('uses hitbox offsets in collision checks', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('hitbox.offsetX')
    expect(gameCode).toContain('hitbox.offsetY')
    expect(gameCode).toContain('hitbox.width')
    expect(gameCode).toContain('hitbox.height')
  })

  test('checks bullets vs enemies collisions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Look for bullets vs enemies collision block
    expect(gameCode).toContain('Bullets vs Enemies')
    expect(gameCode).toContain('bullets.forEach')
    expect(gameCode).toContain('enemies.forEach')
  })

  test('checks bullets vs boss collisions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Bullets vs Boss')
    expect(gameCode).toContain('damageBoss()')
  })

  test('checks boss bullets vs player collisions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Boss bullets vs Player')
    expect(gameCode).toContain('bossBullets.forEach')
  })

  test('checks enemies vs player collisions', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Enemies vs Player')
  })

  test('checks boss vs player touch collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Boss vs Player')
  })

  test('handles collision by marking entities dead', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/bullet\.dead\s*=\s*true/)
    expect(gameCode).toMatch(/enemy\.dead\s*=\s*true/)
  })

  test('filters dead entities from arrays', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('bullets.filter')
    expect(gameCode).toContain('enemies.filter')
  })

  test('null check for boss in collision loop', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Important: boss can be set to null mid-loop when killed
    expect(gameCode).toMatch(/!bullet\.dead\s*&&\s*boss/)
  })
})

// ============================================
// PLAYER CONTROLS
// ============================================

describe('Galaga - Player Controls', () => {
  let gameCode

  test('handles keyboard input for 2D movement (WASD)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(87)')  // W
    expect(gameCode).toContain('keyIsDown(83)')  // S
    expect(gameCode).toContain('keyIsDown(65)')  // A
    expect(gameCode).toContain('keyIsDown(68)')  // D
  })

  test('handles arrow keys for movement', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(LEFT_ARROW)')
    expect(gameCode).toContain('keyIsDown(RIGHT_ARROW)')
    expect(gameCode).toContain('keyIsDown(UP_ARROW)')
    expect(gameCode).toContain('keyIsDown(DOWN_ARROW)')
  })

  test('handles space for shooting', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('keyIsDown(32)')  // Space
  })

  test('player wraps around screen horizontally', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Check for wrap-around logic
    expect(gameCode).toContain('player.x < -player.width')
    expect(gameCode).toContain('player.x > CONFIG.width')
  })

  test('player Y position is clamped vertically', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('Collision.clamp(player.y')
  })
})

// ============================================
// GAME LOGIC FUNCTIONS
// ============================================

describe('Galaga - Game Logic', () => {
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

  test('has setupPlayer() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function setupPlayer\s*\(\s*\)\s*\{/)
  })

  test('has updateEnemies() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateEnemies\s*\(\s*\)\s*\{/)
  })

  test('has updateBullets() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateBullets\s*\(\s*\)\s*\{/)
  })

  test('has shootBullet() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function shootBullet\s*\(\s*\)\s*\{/)
  })

  test('has spawnEnemy() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnEnemy\s*\(\s*\)\s*\{/)
  })

  test('has selectEnemyType() function for weighted selection', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function selectEnemyType\s*\(\s*\)\s*\{/)
    expect(gameCode).toContain('weight')
  })

  test('has updateDifficulty() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateDifficulty\s*\(\s*\)\s*\{/)
  })

  test('updates GoL with throttled update', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('updateThrottled(state.frameCount)')
  })

  test('increments score on collision', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/state\.score\s*\+=/i)
  })

  test('has destroyPlayer() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function destroyPlayer\s*\(\s*\)\s*\{/)
  })

  test('handles game over when lives reach 0', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain("state.lives = 0")
    expect(gameCode).toContain("state.phase = 'DYING'")
  })

  test('has spawnExplosion() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function spawnExplosion\s*\(/)
  })
})

// ============================================
// STARS PARALLAX SYSTEM
// ============================================

describe('Galaga - Stars Parallax System', () => {
  let gameCode

  test('has initStars() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function initStars\s*\(\s*\)\s*\{/)
  })

  test('has createStar() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function createStar\s*\(/)
  })

  test('has updateStars() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function updateStars\s*\(\s*\)\s*\{/)
  })

  test('has renderStars() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderStars\s*\(\s*\)\s*\{/)
  })

  test('stars have depth-based parallax effect', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('depthFactor')
    expect(gameCode).toContain('brightness')
  })

  test('stars are theme-aware', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('currentTheme')
    expect(gameCode).toContain("currentTheme === 'night'")
  })
})

// ============================================
// POSTMESSAGE INTEGRATION
// ============================================

describe('Galaga - postMessage Integration', () => {
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

// ============================================
// RENDERING
// ============================================

describe('Galaga - Rendering', () => {
  let gameCode

  test('has renderGame() function', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toMatch(/function renderGame\s*\(\s*\)\s*\{/)
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

  test('renders stars as background', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('renderStars()')
  })

  test('renders player with gradient', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('player.gradient')
  })

  test('renders boss with flash effect', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Boss should skip rendering when flashing
    expect(gameCode).toContain('boss.flashTimer')
  })
})

// ============================================
// WINDOW RESIZE
// ============================================

describe('Galaga - Window Resize', () => {
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

// ============================================
// PRODUCTION READINESS
// ============================================

describe('Galaga - Production Readiness', () => {
  let gameCode

  test('no console.log statements (except warnings)', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Allow console.warn but not console.log
    const consoleLogCount = (gameCode.match(/console\.log\(/g) || []).length
    expect(consoleLogCount).toBe(0)
  })

  test('no debugger statements', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).not.toContain('debugger')
  })

  test('no TODO comments in production code', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    const todoCount = (gameCode.match(/\/\/\s*TODO/gi) || []).length
    expect(todoCount).toBe(0)
  })

  test('all required patterns are imported', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    // Verify all required patterns are accessible
    expect(gameCode).toContain('PatternName.COPPERHEAD')
    expect(gameCode).toContain('PatternName.BLINKER')
    expect(gameCode).toContain('PatternName.BEACON')
    expect(gameCode).toContain('PatternName.GLIDER')
    expect(gameCode).toContain('PatternName.PULSAR')
    expect(gameCode).toContain('PatternName.DRAGON_VERTICAL')
  })

  test('game has proper license and author', () => {
    gameCode = readFileSync(GAME_PATH, 'utf-8')

    expect(gameCode).toContain('@license ISC')
    expect(gameCode).toContain('Game of Life Arcade')
  })
})
