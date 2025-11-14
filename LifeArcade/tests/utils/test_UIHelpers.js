/**
 * Unit tests for UIHelpers.
 * Tests UI rendering functions for game UI elements.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { describe, test, expect, beforeEach, vi } from 'vitest'
import { renderGameUI, renderGameOver, renderWin } from '../../src/utils/UIHelpers.js'

describe('UIHelpers - renderGameUI', () => {
  let p5Mock, config, state, controls

  beforeEach(() => {
    // Mock global p5.js functions
    global.fill = vi.fn()
    global.noStroke = vi.fn()
    global.textFont = vi.fn()
    global.textStyle = vi.fn()
    global.textSize = vi.fn()
    global.textAlign = vi.fn()
    global.text = vi.fn()
    global.LEFT = 'LEFT'
    global.TOP = 'TOP'
    global.RIGHT = 'RIGHT'
    global.NORMAL = 'NORMAL'

    config = {
      ui: {
        textColor: '#5f6368',
        font: 'Arial',
        fontSize: 16
      },
      width: 1200
    }

    state = {
      score: 12345
    }

    controls = [
      '← → or A/D: Move',
      'SPACE or Z: Shoot'
    ]
  })

  test('sets text properties correctly', () => {
    renderGameUI(config, state, controls)

    expect(global.fill).toHaveBeenCalledWith(config.ui.textColor)
    expect(global.noStroke).toHaveBeenCalled()
    expect(global.textFont).toHaveBeenCalledWith(config.ui.font)
    expect(global.textStyle).toHaveBeenCalledWith(global.NORMAL)
    expect(global.textSize).toHaveBeenCalledWith(config.ui.fontSize)
  })

  test('renders score on left side', () => {
    renderGameUI(config, state, controls)

    expect(global.textAlign).toHaveBeenCalledWith(global.LEFT, global.TOP)
    expect(global.text).toHaveBeenCalledWith('SCORE: 12345', 20, 20)
  })

  test('renders controls on right side', () => {
    renderGameUI(config, state, controls)

    expect(global.textAlign).toHaveBeenCalledWith(global.RIGHT, global.TOP)
    expect(global.text).toHaveBeenCalledWith('← → or A/D: Move', 1180, 20)
    expect(global.text).toHaveBeenCalledWith('SPACE or Z: Shoot', 1180, 45)
  })

  test('handles zero score', () => {
    state.score = 0

    renderGameUI(config, state, controls)

    expect(global.text).toHaveBeenCalledWith('SCORE: 0', 20, 20)
  })

  test('handles large score', () => {
    state.score = 999999

    renderGameUI(config, state, controls)

    expect(global.text).toHaveBeenCalledWith('SCORE: 999999', 20, 20)
  })

  test('handles single control', () => {
    controls = ['SPACE: Jump']

    renderGameUI(config, state, controls)

    expect(global.text).toHaveBeenCalledWith('SPACE: Jump', 1180, 20)
    // Should only call text 2 times (score + 1 control)
    expect(global.text).toHaveBeenCalledTimes(2)
  })

  test('handles multiple controls', () => {
    controls = [
      'Control 1',
      'Control 2',
      'Control 3',
      'Control 4'
    ]

    renderGameUI(config, state, controls)

    expect(global.text).toHaveBeenCalledWith('Control 1', 1180, 20)
    expect(global.text).toHaveBeenCalledWith('Control 2', 1180, 45)
    expect(global.text).toHaveBeenCalledWith('Control 3', 1180, 70)
    expect(global.text).toHaveBeenCalledWith('Control 4', 1180, 95)
  })

  test('handles empty controls array', () => {
    controls = []

    renderGameUI(config, state, controls)

    // Should only render score
    expect(global.text).toHaveBeenCalledTimes(1)
    expect(global.text).toHaveBeenCalledWith('SCORE: 12345', 20, 20)
  })

  test('spaces controls 25 pixels apart', () => {
    controls = ['Line 1', 'Line 2', 'Line 3']

    renderGameUI(config, state, controls)

    expect(global.text).toHaveBeenCalledWith('Line 1', 1180, 20)
    expect(global.text).toHaveBeenCalledWith('Line 2', 1180, 45)  // 20 + 25
    expect(global.text).toHaveBeenCalledWith('Line 3', 1180, 70)  // 20 + 50
  })
})

describe('UIHelpers - renderGameOver', () => {
  beforeEach(() => {
    global.fill = vi.fn()
    global.noStroke = vi.fn()
    global.rect = vi.fn()
    global.textStyle = vi.fn()
    global.textAlign = vi.fn()
    global.textSize = vi.fn()
    global.text = vi.fn()
    global.CENTER = 'CENTER'
    global.NORMAL = 'NORMAL'
  })

  test('draws semi-transparent overlay', () => {
    renderGameOver(1200, 1920, 5000)

    expect(global.fill).toHaveBeenCalledWith(0, 0, 0, 180)
    expect(global.noStroke).toHaveBeenCalled()
    expect(global.rect).toHaveBeenCalledWith(0, 0, 1200, 1920)
  })

  test('renders GAME OVER text', () => {
    renderGameOver(1200, 1920, 5000)

    expect(global.textSize).toHaveBeenCalledWith(48)
    expect(global.textAlign).toHaveBeenCalledWith(global.CENTER, global.CENTER)
    expect(global.text).toHaveBeenCalledWith('GAME OVER', 600, 920)
  })

  test('renders final score', () => {
    renderGameOver(1200, 1920, 5000)

    expect(global.textSize).toHaveBeenCalledWith(24)
    expect(global.text).toHaveBeenCalledWith('Final Score: 5000', 600, 1000)
  })

  test('renders restart instruction', () => {
    renderGameOver(1200, 1920, 5000)

    expect(global.textSize).toHaveBeenCalledWith(16)
    expect(global.text).toHaveBeenCalledWith('Press SPACE to restart', 600, 1060)
  })

  test('handles different canvas sizes', () => {
    renderGameOver(800, 600, 1000)

    expect(global.rect).toHaveBeenCalledWith(0, 0, 800, 600)
    expect(global.text).toHaveBeenCalledWith('GAME OVER', 400, 260)
    expect(global.text).toHaveBeenCalledWith('Final Score: 1000', 400, 340)
  })

  test('handles zero score', () => {
    renderGameOver(1200, 1920, 0)

    expect(global.text).toHaveBeenCalledWith('Final Score: 0', 600, 1000)
  })

  test('handles high score', () => {
    renderGameOver(1200, 1920, 999999)

    expect(global.text).toHaveBeenCalledWith('Final Score: 999999', 600, 1000)
  })

  test('sets white text color', () => {
    renderGameOver(1200, 1920, 5000)

    expect(global.fill).toHaveBeenCalledWith(255)
  })
})

describe('UIHelpers - renderWin', () => {
  beforeEach(() => {
    global.fill = vi.fn()
    global.noStroke = vi.fn()
    global.rect = vi.fn()
    global.textStyle = vi.fn()
    global.textAlign = vi.fn()
    global.textSize = vi.fn()
    global.text = vi.fn()
    global.CENTER = 'CENTER'
    global.NORMAL = 'NORMAL'
  })

  test('draws semi-transparent overlay', () => {
    renderWin(1200, 1920, 10000)

    expect(global.fill).toHaveBeenCalledWith(0, 0, 0, 180)
    expect(global.noStroke).toHaveBeenCalled()
    expect(global.rect).toHaveBeenCalledWith(0, 0, 1200, 1920)
  })

  test('renders YOU WIN text', () => {
    renderWin(1200, 1920, 10000)

    expect(global.textSize).toHaveBeenCalledWith(48)
    expect(global.textAlign).toHaveBeenCalledWith(global.CENTER, global.CENTER)
    expect(global.text).toHaveBeenCalledWith('YOU WIN!', 600, 920)
  })

  test('renders final score', () => {
    renderWin(1200, 1920, 10000)

    expect(global.textSize).toHaveBeenCalledWith(24)
    expect(global.text).toHaveBeenCalledWith('Final Score: 10000', 600, 1000)
  })

  test('renders restart instruction', () => {
    renderWin(1200, 1920, 10000)

    expect(global.textSize).toHaveBeenCalledWith(16)
    expect(global.text).toHaveBeenCalledWith('Press SPACE to restart', 600, 1060)
  })

  test('handles different canvas sizes', () => {
    renderWin(800, 600, 5000)

    expect(global.rect).toHaveBeenCalledWith(0, 0, 800, 600)
    expect(global.text).toHaveBeenCalledWith('YOU WIN!', 400, 260)
    expect(global.text).toHaveBeenCalledWith('Final Score: 5000', 400, 340)
  })

  test('handles zero score', () => {
    renderWin(1200, 1920, 0)

    expect(global.text).toHaveBeenCalledWith('Final Score: 0', 600, 1000)
  })

  test('sets white text color', () => {
    renderWin(1200, 1920, 10000)

    expect(global.fill).toHaveBeenCalledWith(255)
  })
})

describe('UIHelpers - Integration', () => {
  beforeEach(() => {
    global.fill = vi.fn()
    global.noStroke = vi.fn()
    global.rect = vi.fn()
    global.textFont = vi.fn()
    global.textStyle = vi.fn()
    global.textSize = vi.fn()
    global.textAlign = vi.fn()
    global.text = vi.fn()
    global.LEFT = 'LEFT'
    global.RIGHT = 'RIGHT'
    global.TOP = 'TOP'
    global.CENTER = 'CENTER'
    global.NORMAL = 'NORMAL'
  })

  test('game UI transitions to game over', () => {
    const config = {
      ui: { textColor: '#000', font: 'Arial', fontSize: 16 },
      width: 1200
    }
    const state = { score: 1000 }
    const controls = ['SPACE: Jump']

    // Render game UI
    renderGameUI(config, state, controls)
    expect(global.text).toHaveBeenCalledWith('SCORE: 1000', 20, 20)

    // Clear mocks
    vi.clearAllMocks()

    // Render game over
    renderGameOver(1200, 1920, 1000)
    expect(global.text).toHaveBeenCalledWith('GAME OVER', 600, 920)
    expect(global.text).toHaveBeenCalledWith('Final Score: 1000', 600, 1000)
  })

  test('game UI transitions to win screen', () => {
    const config = {
      ui: { textColor: '#000', font: 'Arial', fontSize: 16 },
      width: 1200
    }
    const state = { score: 5000 }
    const controls = ['Controls']

    // Render game UI
    renderGameUI(config, state, controls)
    expect(global.text).toHaveBeenCalledWith('SCORE: 5000', 20, 20)

    // Clear mocks
    vi.clearAllMocks()

    // Render win screen
    renderWin(1200, 1920, 5000)
    expect(global.text).toHaveBeenCalledWith('YOU WIN!', 600, 920)
    expect(global.text).toHaveBeenCalledWith('Final Score: 5000', 600, 1000)
  })

  test('all functions use consistent styling', () => {
    const config = {
      ui: { textColor: '#000', font: 'Arial', fontSize: 16 },
      width: 1200
    }

    renderGameUI(config, { score: 0 }, [])
    expect(global.textStyle).toHaveBeenCalledWith(global.NORMAL)

    vi.clearAllMocks()

    renderGameOver(1200, 1920, 0)
    expect(global.textStyle).toHaveBeenCalledWith(global.NORMAL)

    vi.clearAllMocks()

    renderWin(1200, 1920, 0)
    expect(global.textStyle).toHaveBeenCalledWith(global.NORMAL)
  })
})
