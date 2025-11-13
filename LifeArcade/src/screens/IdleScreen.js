/**
 * IdleScreen - Idle/Attract screen with GoL background
 *
 * Full-screen GoL animation
 * Advances on Space key press (no timeout)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLBackground } from '../rendering/GoLBackground.js'
import { SimpleGradientRenderer } from '../rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from '../utils/GradientPresets.js'

export class IdleScreen {
  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // p5.js instance
    this.p5Instance = null

    // GoL background
    this.golBackground = null

    // Animation state
    this.frameCount = 0
    this.isActive = false

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Initialize p5.js canvas and start animation
   */
  show() {
    console.log('IdleScreen: Show')
    this.isActive = true

    // Create p5.js instance
    this.p5Instance = new p5((p) => {
      // Setup
      p.setup = () => {
        // Calculate responsive canvas size (maintain 1200:1920 aspect ratio)
        const aspectRatio = 1200 / 1920  // 0.625
        const canvasHeight = p.windowHeight
        const canvasWidth = canvasHeight * aspectRatio

        const canvas = p.createCanvas(canvasWidth, canvasHeight)
        p.frameRate(60)

        // Style canvas for proper display
        canvas.style('position', 'fixed')
        canvas.style('top', '50%')
        canvas.style('left', '50%')
        canvas.style('transform', 'translate(-50%, -50%)')
        canvas.style('max-width', '100vw')
        canvas.style('max-height', '100vh')
        canvas.style('width', 'auto')
        canvas.style('height', 'auto')
        canvas.style('aspect-ratio', 'auto 1200 / 1920')
        canvas.style('object-fit', 'contain')
        canvas.style('z-index', '1')

        // Create GoL background with SimpleGradientRenderer
        this.golBackground = new GoLBackground(p, {
          cols: 40,
          rows: 64,
          updateRate: 10,
          renderer: new SimpleGradientRenderer(p),
          debug: false  // Set to true for debug overlay
        })

        // Seed with random pattern (~30% density)
        this.golBackground.randomSeed(0.3)

        console.log('IdleScreen: p5.js setup complete')
      }

      // Draw
      p.draw = () => {
        if (!this.isActive) {
          p.noLoop()
          return
        }

        // Update frame count
        this.frameCount++

        // Clear background
        p.background(255)

        // Update GoL background
        this.golBackground.update(this.frameCount)

        // Render GoL background with gradient
        // Calculate cellSize dynamically based on canvas width
        const cellSize = p.width / 40  // 40 columns
        this.golBackground.render(
          0,                          // x offset
          0,                          // y offset
          cellSize,                   // Dynamic cell size
          GRADIENT_PRESETS.PLAYER     // Use player gradient
        )
      }
    })

    // Listen for Space key
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('IdleScreen: Active')
  }

  /**
   * Hide screen - Stop animation and clean up
   */
  hide() {
    console.log('IdleScreen: Hide')
    this.isActive = false

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove p5.js instance
    if (this.p5Instance) {
      this.p5Instance.remove()
      this.p5Instance = null
    }

    // Clear references
    this.golBackground = null
    this.frameCount = 0

    console.log('IdleScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Space key advances to Welcome screen
    if (key === ' ') {
      console.log('IdleScreen: Space pressed - advancing to Welcome')
      this.appState.transition('welcome')
    }
  }
}
