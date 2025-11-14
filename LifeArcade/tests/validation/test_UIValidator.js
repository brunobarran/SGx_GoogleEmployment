/**
 * Unit tests for UIValidator.
 * Tests UI consistency and Google brand guidelines compliance.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect } from 'vitest'
import { UIValidator } from '../../src/validation/ui-validator.js'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const gamesDir = join(__dirname, '..', '..', 'games')

describe('UIValidator - Static Analysis', () => {
  describe('Score display check', () => {
    test('passes when score is displayed', () => {
      const code = `
        function renderUI() {
          text('SCORE: ' + state.score, 20, 20)
        }
        background('#FFFFFF')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('passes with uppercase SCORE', () => {
      const code = `
        text('SCORE: ' + score, 20, 20)
        background('#FFFFFF')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('passes with Score (title case)', () => {
      const code = `
        text('Score: ' + gameScore, 20, 20)
        background('#FFFFFF')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('fails when score is not displayed', () => {
      const code = `
        function renderUI() {
          text('Lives: ' + lives, 20, 20)
        }
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(false)
      expect(result.errors).toContain('❌ Game must display score')
    })
  })

  describe('Google brand colors check', () => {
    test('passes when Google Gray is used', () => {
      const code = `
        const CONFIG = {
          ui: {
            textColor: '#5f6368'
          }
        }
        const score = 0
        background('#FFFFFF')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('passes when Google Blue is used', () => {
      const code = `
        const accentColor = '#4285f4'
        const score = 0
        background('#4285f4')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('passes when white background is used', () => {
      const code = `
        const score = 0
        background('#ffffff')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('passes when black is used', () => {
      const code = `
        const score = 0
        fill('#000000')
        background('#000000')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('is case-insensitive for hex codes', () => {
      const code = `
        const score = 0
        const color = '#FFFFFF'
        const text = '#5F6368'
        background(color)
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('warns when no Google colors are used', () => {
      const code = `
        fill('#ff0000')
        stroke('#00ff00')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('Google brand colors'))).toBe(true)
    })
  })

  describe('Minimal UI check', () => {
    test('passes with reasonable gradient count', () => {
      const code = `
        const score = 0
        const gradient1 = createGradient()
        const gradient2 = createGradient()
        background('#FFFFFF')
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('warns when too many gradients are used', () => {
      const gradientCode = Array(45).fill('const g = createGradient()').join('\n')
      const result = UIValidator.validate(gradientCode)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('too many gradients'))).toBe(true)
    })
  })

  describe('Background check', () => {
    test('passes when background() is called', () => {
      const code = `
        const score = 0
        function draw() {
          background('#FFFFFF')
        }
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(true)
    })

    test('warns when no background call is present', () => {
      const code = `
        function draw() {
          rect(10, 10, 50, 50)
        }
      `
      const result = UIValidator.validate(code)

      expect(result.valid).toBe(false)
      expect(result.errors.some(e => e.includes('background()'))).toBe(true)
    })
  })

  describe('Complete game validation', () => {
    test('passes for valid game UI', () => {
      const validUI = `
        const CONFIG = {
          ui: {
            backgroundColor: '#FFFFFF',
            textColor: '#5f6368',
            accentColor: '#4285f4'
          }
        }

        const state = {
          score: 0
        }

        function draw() {
          background(CONFIG.ui.backgroundColor)
        }

        function renderUI() {
          fill(CONFIG.ui.textColor)
          text('SCORE: ' + state.score, 20, 20)
        }
      `

      const result = UIValidator.validate(validUI)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    test('accumulates multiple UI errors', () => {
      const invalidUI = `
        function draw() {
          // No background call
          fill('#ff00ff')  // Non-Google color
          text('Lives: 3', 20, 20)  // No score
        }
      `

      const result = UIValidator.validate(invalidUI)
      expect(result.valid).toBe(false)
      expect(result.errors.length).toBeGreaterThan(1)
    })

    test('distinguishes errors from warnings', () => {
      const codeWithWarnings = `
        const state = { score: 0 }
        function renderUI() {
          text('SCORE: ' + state.score, 20, 20)
        }
        // Missing background and Google colors
      `

      const result = UIValidator.validate(codeWithWarnings)
      expect(result.valid).toBe(false)

      const warnings = result.errors.filter(e => e.startsWith('⚠️'))
      const errors = result.errors.filter(e => e.startsWith('❌'))

      expect(warnings.length).toBeGreaterThan(0)
    })
  })
})

describe('UIValidator - File validation', () => {
  test('validateFile is async', async () => {
    expect(typeof UIValidator.validateFile).toBe('function')
    expect(UIValidator.validateFile.constructor.name).toBe('AsyncFunction')
  })

  test('handles non-existent files gracefully', async () => {
    const result = await UIValidator.validateFile('non-existent-file.js')

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
    expect(result.errors[0]).toContain('Failed to read file')
  })
})

describe('UIValidator - Integration with example games', () => {
  test('dino-runner.js should pass UI validation', async () => {
    const result = await UIValidator.validateFile(join(gamesDir, 'dino-runner.js'))

    expect(result.valid).toBe(true)
  })

  test('space-invaders-ca.js should pass UI validation', async () => {
    const result = await UIValidator.validateFile(join(gamesDir, 'space-invaders.js'))

    expect(result.valid).toBe(true)
  })

  test('breakout.js should pass UI validation', async () => {
    const result = await UIValidator.validateFile(join(gamesDir, 'breakout.js'))

    expect(result.valid).toBe(true)
  })
})

describe('UIValidator - Edge cases', () => {
  test('handles empty code', () => {
    const result = UIValidator.validate('')

    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })

  test('handles code with only comments', () => {
    const code = `
      // This is a comment
      /* Multi-line
         comment */
    `
    const result = UIValidator.validate(code)

    expect(result.valid).toBe(false)
  })

  test('handles very large code files', () => {
    const largeCode = Array(10000).fill('const x = 1;').join('\n') +
      '\nconst score = 0;\nbackground("#FFFFFF");\ntext("SCORE: " + score, 20, 20);'

    const result = UIValidator.validate(largeCode)
    expect(result.valid).toBe(true)
  })
})
