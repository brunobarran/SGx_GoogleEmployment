/**
 * Unit tests for GoLValidator.
 * Tests static code analysis and runtime GoL validation.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach } from 'vitest'
import { GoLValidator } from '../../src/validation/gol-validator.js'
import { GoLEngine } from '../../src/core/GoLEngine.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const gamesDir = join(__dirname, '..', '..', 'public', 'games')

describe('GoLValidator - Static Analysis', () => {
  describe('GoLEngine import check', () => {
    test('passes when GoLEngine is imported with clean background', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        const engine = new GoLEngine(10, 10)
        background('#FFFFFF')
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('fails when GoLEngine is not imported', () => {
      const code = `
        const player = { x: 100, y: 200 }
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('❌ Game must import and use GoLEngine for visuals')
    })
  })

  describe('No hardcoded sprites check', () => {
    test('passes when no images are used', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        const player = new GoLEngine(10, 10)
        background('#FFFFFF')
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('fails when loadImage is used', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        const sprite = loadImage('player.png')
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('❌ Visuals must be procedural GoL cells, not static images')
    })

    test('fails when image file references are present', () => {
      const imageFormats = ['.png', '.jpg', '.jpeg', '.gif', '.svg']

      imageFormats.forEach(format => {
        const code = `
          import { GoLEngine } from '../core/GoLEngine.js'
          const img = 'assets/sprite${format}'
        `
        const result = GoLValidator.validate(code)

        expect(result.valid).toBe(false)
        expect(result.errors).toContain('❌ Visuals must be procedural GoL cells, not static images')
      })
    })
  })

  describe('Background check', () => {
    test('passes when GoLBackground is used', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        import { GoLBackground } from '../rendering/GoLBackground.js'
        const bg = new GoLBackground()
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('passes when clean white background is used', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        background('#FFFFFF')
      `
      const result = GoLValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('warns when no background is present', () => {
      const code = `
        import { GoLEngine } from '../core/GoLEngine.js'
        const player = new GoLEngine(10, 10)
      `
      const result = GoLValidator.validate(code)

      // Should have a warning about background
      const hasBackgroundWarning = result.errors.some(e =>
        e.includes('background') || e.includes('Background')
      )
      expect(hasBackgroundWarning).toBe(true)
    })
  })

  describe('Complete game validation', () => {
    test('passes for valid game code', () => {
      const validGame = `
        import { GoLEngine } from '../core/GoLEngine.js'
        import { Patterns } from '../utils/Patterns.js'

        const CONFIG = {
          ui: { backgroundColor: '#FFFFFF' }
        }

        function setup() {
          createCanvas(800, 600)
          background(CONFIG.ui.backgroundColor)
        }

        function draw() {
          background(CONFIG.ui.backgroundColor)
          player.gol.update()
        }

        const player = {
          gol: new GoLEngine(10, 10, 12)
        }
      `

      const result = GoLValidator.validate(validGame)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('accumulates multiple errors', () => {
      const invalidGame = `
        const sprite = loadImage('player.png')
        const enemy = loadImage('enemy.jpg')
      `

      const result = GoLValidator.validate(invalidGame)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })
  })
})

describe('GoLValidator - Runtime Validation', () => {
  let engine

  beforeEach(() => {
    engine = new GoLEngine(20, 20)
  })

  describe('BLINKER test', () => {
    test('passes when B3/S23 rules are correct', () => {
      const result = GoLValidator.validateRuntime(engine)

      expect(result.valid).toBe(true)
      expect(result.error).toBeNull()
    })

    test('validates vertical to horizontal oscillation', () => {
      // Set up vertical blinker manually
      engine.clearGrid()
      engine.setCell(5, 4, 1)
      engine.setCell(5, 5, 1)
      engine.setCell(5, 6, 1)

      // Should be vertical
      expect(engine.getCell(5, 4)).toBe(1)
      expect(engine.getCell(5, 5)).toBe(1)
      expect(engine.getCell(5, 6)).toBe(1)

      // Evolve 1 generation
      engine.update()

      // Should be horizontal
      expect(engine.getCell(4, 5)).toBe(1)
      expect(engine.getCell(5, 5)).toBe(1)
      expect(engine.getCell(6, 5)).toBe(1)

      // Original cells should be dead/alive according to B3/S23
      expect(engine.getCell(5, 4)).toBe(0)
      expect(engine.getCell(5, 6)).toBe(0)
    })
  })

  describe('BLOCK stability test', () => {
    test('validates block remains stable', () => {
      const result = GoLValidator.validateRuntime(engine)

      // BLOCK test is part of validateRuntime
      expect(result.valid).toBe(true)
    })

    test('block pattern never changes', () => {
      engine.clearGrid()

      // Set up 2x2 block
      engine.setCell(5, 5, 1)
      engine.setCell(5, 6, 1)
      engine.setCell(6, 5, 1)
      engine.setCell(6, 6, 1)

      const beforePattern = engine.getPattern()

      // Update 10 times
      for (let i = 0; i < 10; i++) {
        engine.update()
      }

      const afterPattern = engine.getPattern()

      // Pattern should be identical
      expect(afterPattern).toEqual(beforePattern)
    })
  })

  describe('Edge cases', () => {
    test('handles empty engine', () => {
      engine.clearGrid()
      const result = GoLValidator.validateRuntime(engine)

      // Should still validate B3/S23 rules correctly
      expect(result.valid).toBe(true)
    })

    test('handles small grids', () => {
      const smallEngine = new GoLEngine(10, 10)
      const result = GoLValidator.validateRuntime(smallEngine)

      expect(result.valid).toBe(true)
    })
  })
})

describe('GoLValidator - File validation', () => {
  test('validateFile is async', async () => {
    // This is a convenience method wrapper
    expect(typeof GoLValidator.validateFile).toBe('function')
    expect(GoLValidator.validateFile.constructor.name).toBe('AsyncFunction')
  })

  test('handles non-existent files gracefully', async () => {
    const result = await GoLValidator.validateFile('non-existent-file.js')

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Failed to read file')
  })
})

describe('GoLValidator - Integration with example games', () => {
  test('dino-runner.js should pass validation', async () => {
    const result = await GoLValidator.validateFile(join(gamesDir, 'dino-runner.js'))

    expect(result.valid).toBe(true)
  })

  test('space-invaders-ca.js should pass validation', async () => {
    const result = await GoLValidator.validateFile(join(gamesDir, 'space-invaders.js'))

    expect(result.valid).toBe(true)
  })

  test('breakout.js should pass validation', async () => {
    const result = await GoLValidator.validateFile(join(gamesDir, 'breakout.js'))

    expect(result.valid).toBe(true)
  })
})
