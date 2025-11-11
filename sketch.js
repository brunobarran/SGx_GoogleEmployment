/**
 * Main sketch for Game of Life Arcade - Phase 1.
 * Demonstrates Pure GoL background with authentic B3/S23 simulation.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import p5 from 'p5'
import { GoLBackground } from './src/rendering/GoLBackground.js'
import { VISUAL_CONFIG, PERFORMANCE_CONFIG } from './src/utils/Config.js'
import { Patterns } from './src/utils/Patterns.js'

// Global variables
let golBackground  // Renamed to avoid conflict with p5.background()
let showDebug = true  // Press 'd' to toggle debug info
let showFPS = true    // Press 'f' to toggle FPS counter

/**
 * p5.js sketch function.
 */
const sketch = (p) => {
  /**
   * Setup function - runs once at start.
   */
  p.setup = () => {
    // Create canvas that adapts to window size
    const canvasWidth = p.windowWidth
    const canvasHeight = p.windowHeight

    if (VISUAL_CONFIG.USE_WEBGL) {
      p.createCanvas(canvasWidth, canvasHeight, p.WEBGL)
    } else {
      p.createCanvas(canvasWidth, canvasHeight)
    }

    // Force 60 FPS explicitly
    p.frameRate(60)

    // Disable smoothing for better performance (optional)
    p.noSmooth()

    // Initialize GoL background
    golBackground = new GoLBackground(p)
    golBackground.centerOnCanvas()

    // Optional: Inject a known pattern for testing
    // Uncomment to see a Glider pattern in action
    // golBackground.setPattern(Patterns.GLIDER, 10, 10)

    console.log('Phase 1: GoL Engine and Background initialized')
    console.log(`Canvas: ${canvasWidth}x${canvasHeight}`)
    console.log(`Grid: ${VISUAL_CONFIG.GRID_COLS}x${VISUAL_CONFIG.GRID_ROWS} cells`)
    console.log(`Cell size: ${VISUAL_CONFIG.CELL_SIZE}px`)
    console.log(`Update rate: ${PERFORMANCE_CONFIG.BACKGROUND_UPDATE_RATE}fps`)
    console.log('Press SPACE to reseed, D for debug, F for FPS, P to inject patterns')
  }

  /**
   * Window resize handler - adapts canvas to new size.
   */
  p.windowResized = () => {
    p.resizeCanvas(p.windowWidth, p.windowHeight)
    golBackground.centerOnCanvas()
  }

  /**
   * Draw function - runs every frame at 60fps.
   */
  p.draw = () => {
    // Clear canvas
    p.background(VISUAL_CONFIG.BACKGROUND_COLOR)

    // In WEBGL mode, translate to fix coordinate system
    if (VISUAL_CONFIG.USE_WEBGL) {
      p.translate(-p.width / 2, -p.height / 2)
    }

    // Update and render GoL background
    golBackground.update()
    golBackground.render()

    // Render FPS if enabled (top left)
    if (showFPS) {
      renderFPS()
    }

    // Render debug info if enabled (below FPS)
    if (showDebug) {
      golBackground.renderDebugInfo(10, 40)
    }
  }

  /**
   * Keyboard input handler.
   */
  p.keyPressed = () => {
    // Space: Reseed with random cells
    if (p.key === ' ') {
      golBackground.randomSeed()
      console.log('Background reseeded with random cells')
    }

    // D: Toggle debug info
    if (p.key === 'd' || p.key === 'D') {
      showDebug = !showDebug
      console.log(`Debug info: ${showDebug ? 'ON' : 'OFF'}`)
    }

    // F: Toggle FPS counter
    if (p.key === 'f' || p.key === 'F') {
      showFPS = !showFPS
      console.log(`FPS counter: ${showFPS ? 'ON' : 'OFF'}`)
    }

    // P: Inject patterns for testing
    if (p.key === 'p' || p.key === 'P') {
      injectTestPatterns()
    }

    // C: Clear background
    if (p.key === 'c' || p.key === 'C') {
      golBackground.clear()
      console.log('Background cleared')
    }

    // 1-9: Inject specific patterns
    if (p.key === '1') {
      golBackground.setPattern(Patterns.GLIDER, 10, 10)
      console.log('Glider injected at (10, 10)')
    }
    if (p.key === '2') {
      golBackground.setPattern(Patterns.BLINKER, 15, 10)
      console.log('Blinker injected at (15, 10)')
    }
    if (p.key === '3') {
      golBackground.setPattern(Patterns.PULSAR, 20, 10)
      console.log('Pulsar injected at (20, 10)')
    }
    if (p.key === '4') {
      golBackground.setPattern(Patterns.R_PENTOMINO, 25, 15)
      console.log('R-Pentomino injected at (25, 15)')
    }
  }

  /**
   * Render FPS counter.
   */
  function renderFPS() {
    const fps = p.frameRate()
    const fpsColor = fps > 55 ? '#00FF00' : fps > 30 ? '#FFFF00' : '#FF0000'

    // Draw background for better readability
    p.fill(0, 0, 0, 180)
    p.noStroke()
    p.rect(5, 5, 90, 25)

    p.fill(fpsColor)
    p.textSize(16)
    p.textAlign(p.LEFT, p.TOP)
    p.textFont('monospace')
    p.text(`FPS: ${fps.toFixed(1)}`, 10, 10)
  }

  /**
   * Inject test patterns for verification.
   */
  function injectTestPatterns() {
    // Clear background first
    golBackground.clear()

    // Inject various patterns at different locations
    golBackground.setPattern(Patterns.GLIDER, 5, 5)
    golBackground.setPattern(Patterns.BLINKER, 15, 5)
    golBackground.setPattern(Patterns.BLOCK, 25, 5)
    golBackground.setPattern(Patterns.BEEHIVE, 35, 5)
    golBackground.setPattern(Patterns.TOAD, 45, 5)

    console.log('Test patterns injected:')
    console.log('  - Glider at (5, 5)')
    console.log('  - Blinker at (15, 5)')
    console.log('  - Block at (25, 5)')
    console.log('  - Beehive at (35, 5)')
    console.log('  - Toad at (45, 5)')
  }
}

// Create and mount p5 instance
new p5(sketch)

// Make golBackground globally accessible for testing
if (typeof window !== 'undefined') {
  window.getBackground = () => golBackground
}
