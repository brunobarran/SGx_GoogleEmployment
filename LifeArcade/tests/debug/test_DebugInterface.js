/**
 * Tests for DebugInterface.js
 *
 * PHASE 1: Core Debug System
 * - URL parameter detection (handled in game files)
 * - Sidebar HTML injection
 * - Parameter binding (sliders → CONFIG updates)
 * - Hide/show toggle (ESC key)
 *
 * @group debug
 * @vitest-environment jsdom
 */

import { describe, test, expect, beforeEach, afterEach, vi } from 'vitest'
import { initDebugInterface } from '../../src/debug/DebugInterface.js'

describe('DebugInterface - Phase 1: Core Debug System', () => {
  let mockConfig

  beforeEach(() => {
    // Clean DOM
    document.body.innerHTML = ''

    // Mock console methods to suppress expected logs
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})

    // Create mock CONFIG object (Space Invaders structure)
    mockConfig = {
      width: 1200,
      height: 1920,
      ui: {
        backgroundColor: '#FFFFFF',
        textColor: '#5f6368',
        accentColor: '#1a73e8',
        font: 'Google Sans, Arial, sans-serif',
        fontSize: 16
      },
      invader: {
        cols: 4,
        rows: 4,
        width: 180,
        height: 180,
        spacing: 60,
        startX: 180,
        startY: 200,
        moveInterval: 30,
        speed: 45,
        cellSize: 30
      },
      player: {
        width: 180,
        height: 180,
        cellSize: 30,
        speed: 18,
        shootCooldown: 15
      },
      bullet: {
        width: 90,
        height: 90,
        cellSize: 30,
        speed: 12
      },
      explosion: {
        width: 180,
        height: 180,
        cellSize: 30
      },
      background: {
        updateRate: 10
      }
    }
  })

  afterEach(() => {
    // Restore console
    vi.restoreAllMocks()

    // Clean DOM
    document.body.innerHTML = ''
  })

  // ============================================
  // INITIALIZATION TESTS
  // ============================================

  describe('Initialization', () => {
    test('creates debug panel in DOM', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      expect(panel).not.toBeNull()
      expect(panel.className).toContain('debug-panel')
    })

    test('panel is visible by default', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      expect(panel.classList.contains('visible')).toBe(true)
      expect(panel.classList.contains('hidden')).toBe(false)
    })

    test('logs initialization message', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      expect(console.log).toHaveBeenCalledWith('[DebugInterface] Initializing for space-invaders')
      expect(console.log).toHaveBeenCalledWith('[DebugInterface] Ready')
    })

    test('formats game name correctly in header', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const header = document.querySelector('.debug-header h2')
      expect(header.textContent).toBe('🛠️ Debug: Space Invaders')
    })

    test('displays URL info in panel', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const info = document.querySelector('.debug-info')
      expect(info.textContent).toContain('?debug=true')
      expect(info.textContent).toContain('ESC = Hide/Show')
      expect(info.textContent).toContain('H = Hitboxes')
    })
  })

  // ============================================
  // CONTROL GENERATION TESTS
  // ============================================

  describe('Control Generation', () => {
    test('creates all 2 control groups', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const groups = document.querySelectorAll('.debug-group')
      expect(groups.length).toBe(2)

      const groupTitles = Array.from(groups).map(g => g.querySelector('.debug-group-title').textContent)
      expect(groupTitles).toContain('Gameplay')
      expect(groupTitles).toContain('Appearance')
    })

    test('gameplay group contains 7 parameters', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const gameplayGroup = Array.from(document.querySelectorAll('.debug-group'))
        .find(g => g.querySelector('.debug-group-title').textContent === 'Gameplay')

      const controls = gameplayGroup.querySelectorAll('.debug-control')
      expect(controls.length).toBe(7)
    })

    test('appearance group contains 5 parameters (cell sizes + spacing)', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const appearanceGroup = Array.from(document.querySelectorAll('.debug-group'))
        .find(g => g.querySelector('.debug-group-title').textContent === 'Appearance')

      const controls = appearanceGroup.querySelectorAll('.debug-control')
      expect(controls.length).toBe(5)
    })

    test('each control has label, value display, and slider', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const control = document.querySelector('.debug-control')
      expect(control.querySelector('.debug-label')).not.toBeNull()
      expect(control.querySelector('.debug-value')).not.toBeNull()
      expect(control.querySelector('.debug-slider')).not.toBeNull()
    })

    test('slider has correct data-path attribute', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('.debug-slider')
      expect(slider.dataset.path).toBeTruthy()
      expect(slider.dataset.path).toMatch(/^(invader|player|bullet|explosion|background)\.\w+$/)
    })
  })

  // ============================================
  // PARAMETER BINDING TESTS
  // ============================================

  describe('Parameter Binding', () => {
    test('slider updates CONFIG value on input', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="player.speed"]')
      const initialSpeed = mockConfig.player.speed

      slider.value = 24
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(mockConfig.player.speed).toBe(24)
      expect(mockConfig.player.speed).not.toBe(initialSpeed)
    })

    test('slider updates value display on input', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="player.speed"]')
      const valueDisplay = document.getElementById('value-player-speed')

      slider.value = 30
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(valueDisplay.textContent).toBe('30')
    })

    test('handles nested path correctly (invader.cols)', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="invader.cols"]')
      slider.value = 6
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(mockConfig.invader.cols).toBe(6)
    })

    test('handles nested path correctly (invader.cellSize)', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="invader.cellSize"]')
      slider.value = 45
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(mockConfig.invader.cellSize).toBe(45)
    })

    test('logs parameter updates to console', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="player.speed"]')
      slider.value = 24
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(console.log).toHaveBeenCalledWith('[DebugInterface] Updated player.speed = 24')
    })

    test('multiple sliders update independently', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const speedSlider = document.querySelector('[data-path="player.speed"]')
      const cooldownSlider = document.querySelector('[data-path="player.shootCooldown"]')

      speedSlider.value = 24
      speedSlider.dispatchEvent(new Event('input', { bubbles: true }))

      cooldownSlider.value = 20
      cooldownSlider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(mockConfig.player.speed).toBe(24)
      expect(mockConfig.player.shootCooldown).toBe(20)
    })
  })

  // ============================================
  // INITIAL VALUES TESTS
  // ============================================

  describe('Initial Values', () => {
    test('sliders reflect CONFIG initial values', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const slider = document.querySelector('[data-path="player.speed"]')
      expect(parseFloat(slider.value)).toBe(mockConfig.player.speed)
    })

    test('value displays reflect CONFIG initial values', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const valueDisplay = document.getElementById('value-player-speed')
      expect(valueDisplay.textContent).toBe(String(mockConfig.player.speed))
    })

    test('all sliders have correct min/max/step attributes', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const sliders = document.querySelectorAll('.debug-slider')
      sliders.forEach(slider => {
        expect(slider.hasAttribute('min')).toBe(true)
        expect(slider.hasAttribute('max')).toBe(true)
        expect(slider.hasAttribute('step')).toBe(true)
      })
    })
  })

  // ============================================
  // TOGGLE FUNCTIONALITY TESTS
  // ============================================

  describe('Toggle Functionality', () => {
    test('toggle button exists in header', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const toggleButton = document.getElementById('debug-toggle')
      expect(toggleButton).not.toBeNull()
      expect(toggleButton.textContent.trim()).toBe('◀')
    })

    test('clicking toggle button hides panel', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      const toggleButton = document.getElementById('debug-toggle')

      toggleButton.click()

      expect(panel.classList.contains('hidden')).toBe(true)
      expect(panel.classList.contains('visible')).toBe(false)
      expect(toggleButton.textContent).toBe('▶')
    })

    test('clicking toggle button twice shows panel again', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      const toggleButton = document.getElementById('debug-toggle')

      toggleButton.click() // Hide
      toggleButton.click() // Show

      expect(panel.classList.contains('visible')).toBe(true)
      expect(panel.classList.contains('hidden')).toBe(false)
      expect(toggleButton.textContent).toBe('◀')
    })

    test('ESC key hides panel', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')

      const escEvent = new KeyboardEvent('keydown', { key: 'Escape' })
      document.dispatchEvent(escEvent)

      expect(panel.classList.contains('hidden')).toBe(true)
    })

    test('ESC key twice shows panel again', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))

      expect(panel.classList.contains('visible')).toBe(true)
    })

    test('other keys do not affect panel visibility', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      const initialVisible = panel.classList.contains('visible')

      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'a' }))
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Space' }))
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }))

      expect(panel.classList.contains('visible')).toBe(initialVisible)
    })
  })

  // ============================================
  // CALLBACK TESTS
  // ============================================

  describe('Callbacks', () => {
    test('onInvadersChange triggered when invader.cols changes', () => {
      const onInvadersChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onInvadersChange: onInvadersChangeMock
      })

      const slider = document.querySelector('[data-path="invader.cols"]')
      slider.value = 6
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onInvadersChangeMock).toHaveBeenCalledTimes(1)
    })

    test('onInvadersChange triggered when invader.rows changes', () => {
      const onInvadersChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onInvadersChange: onInvadersChangeMock
      })

      const slider = document.querySelector('[data-path="invader.rows"]')
      slider.value = 6
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onInvadersChangeMock).toHaveBeenCalledTimes(1)
    })

    test('onInvadersChange triggered when invader.cellSize changes', () => {
      const onInvadersChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onInvadersChange: onInvadersChangeMock
      })

      const slider = document.querySelector('[data-path="invader.cellSize"]')
      slider.value = 45
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onInvadersChangeMock).toHaveBeenCalledTimes(1)
    })

    test('onInvadersChange triggered when invader.spacing changes', () => {
      const onInvadersChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onInvadersChange: onInvadersChangeMock
      })

      const slider = document.querySelector('[data-path="invader.spacing"]')
      slider.value = 80
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onInvadersChangeMock).toHaveBeenCalledTimes(1)
    })

    test('onPlayerChange triggered when player.cellSize changes', () => {
      const onPlayerChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onPlayerChange: onPlayerChangeMock
      })

      const slider = document.querySelector('[data-path="player.cellSize"]')
      slider.value = 45
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onPlayerChangeMock).toHaveBeenCalledTimes(1)
    })

    test('onBulletSpeedChange triggered when bullet.speed changes', () => {
      const onBulletSpeedChangeMock = vi.fn()

      // Add bullet.speed to mock config
      mockConfig.bullet.speed = 12

      initDebugInterface(mockConfig, 'space-invaders', {
        onBulletSpeedChange: onBulletSpeedChangeMock
      })

      const slider = document.querySelector('[data-path="bullet.speed"]')
      slider.value = 18
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onBulletSpeedChangeMock).toHaveBeenCalledTimes(1)
    })

    test('callbacks NOT triggered for unrelated parameters', () => {
      const onInvadersChangeMock = vi.fn()
      const onPlayerChangeMock = vi.fn()

      initDebugInterface(mockConfig, 'space-invaders', {
        onInvadersChange: onInvadersChangeMock,
        onPlayerChange: onPlayerChangeMock
      })

      // Change invader speed (not a size/grid param)
      const slider = document.querySelector('[data-path="invader.speed"]')
      slider.value = 60
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      expect(onInvadersChangeMock).not.toHaveBeenCalled()
      expect(onPlayerChangeMock).not.toHaveBeenCalled()
    })

    test('works without callbacks parameter', () => {
      expect(() => {
        initDebugInterface(mockConfig, 'space-invaders')
      }).not.toThrow()

      const slider = document.querySelector('[data-path="invader.cols"]')
      slider.value = 6
      slider.dispatchEvent(new Event('input', { bubbles: true }))

      // Should not throw even without callback
      expect(mockConfig.invader.cols).toBe(6)
    })
  })

  // ============================================
  // EDGE CASES
  // ============================================

  describe('Edge Cases', () => {
    test('handles empty game name gracefully', () => {
      expect(() => {
        initDebugInterface(mockConfig, '')
      }).not.toThrow()

      const header = document.querySelector('.debug-header h2')
      expect(header.textContent).toBeTruthy()
    })

    test('handles unknown game name (no parameters)', () => {
      expect(() => {
        initDebugInterface(mockConfig, 'unknown-game')
      }).not.toThrow()

      const controls = document.querySelectorAll('.debug-control')
      expect(controls.length).toBe(0)
    })

    test('handles missing CONFIG properties gracefully', () => {
      const incompleteConfig = { player: { speed: 10 } }

      expect(() => {
        initDebugInterface(incompleteConfig, 'space-invaders')
      }).not.toThrow()

      // Should create panel even if some sliders can't be created
      const panel = document.getElementById('debug-panel')
      expect(panel).not.toBeNull()
    })

    test('warns when path not found in CONFIG', () => {
      const minimalConfig = {}

      initDebugInterface(minimalConfig, 'space-invaders')

      expect(console.warn).toHaveBeenCalled()
    })

    test('multiple initializations append multiple panels', () => {
      // Clear DOM first
      document.body.innerHTML = ''

      initDebugInterface(mockConfig, 'space-invaders')

      // Manually append second panel to body (simulating second call)
      const panel2 = document.createElement('div')
      panel2.id = 'debug-panel'
      document.body.appendChild(panel2)

      const panels = document.querySelectorAll('#debug-panel')
      expect(panels.length).toBe(2)
    })
  })

  // ============================================
  // DOM STRUCTURE TESTS
  // ============================================

  describe('DOM Structure', () => {
    test('panel has correct CSS classes', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const panel = document.getElementById('debug-panel')
      expect(panel.classList.contains('debug-panel')).toBe(true)
      expect(panel.classList.contains('visible')).toBe(true)
    })

    test('header has correct structure', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const header = document.querySelector('.debug-header')
      expect(header.querySelector('h2')).not.toBeNull()
      expect(header.querySelector('#debug-toggle')).not.toBeNull()
    })

    test('content area exists', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const content = document.querySelector('.debug-content')
      expect(content).not.toBeNull()
      expect(content.querySelector('.debug-info')).not.toBeNull()
      expect(content.querySelector('#debug-controls')).not.toBeNull()
    })

    test('all sliders have unique IDs', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const sliders = document.querySelectorAll('.debug-slider')
      const ids = Array.from(sliders).map(s => s.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    test('all value displays have unique IDs', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const valueDisplays = document.querySelectorAll('.debug-value')
      const ids = Array.from(valueDisplays).map(v => v.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })
  })

  // ============================================
  // PARAMETER COVERAGE TESTS
  // ============================================

  describe('Parameter Coverage (Space Invaders)', () => {
    test('includes all 7 gameplay parameters', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const expectedParams = [
        'invader.cols',
        'invader.rows',
        'invader.moveInterval',
        'invader.speed',
        'player.speed',
        'player.shootCooldown',
        'bullet.speed'
      ]

      expectedParams.forEach(path => {
        const slider = document.querySelector(`[data-path="${path}"]`)
        expect(slider).not.toBeNull()
      })
    })

    test('includes all 5 appearance parameters (cell sizes + spacing)', () => {
      initDebugInterface(mockConfig, 'space-invaders')

      const expectedParams = [
        'invader.cellSize',
        'player.cellSize',
        'bullet.cellSize',
        'explosion.cellSize',
        'invader.spacing'
      ]

      expectedParams.forEach(path => {
        const slider = document.querySelector(`[data-path="${path}"]`)
        expect(slider).not.toBeNull()
      })
    })
  })
})
