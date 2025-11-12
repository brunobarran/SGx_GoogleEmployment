/**
 * Masked renderer - Combines animated gradients with GoL cell masks.
 * Renders gradients that are revealed only where GoL cells are alive.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GradientRenderer } from './GradientRenderer.js'
import { CellRenderer } from './CellRenderer.js'
import { CELL_STATES } from '../utils/Config.js'

const { ALIVE } = CELL_STATES

/**
 * Renders GoL grids with animated gradient backgrounds using masking.
 */
class MaskedRenderer {
  /**
   * Create a masked renderer.
   *
   * @param {object} p5Instance - p5.js instance
   * @param {number} maxWidth - Maximum width for buffers
   * @param {number} maxHeight - Maximum height for buffers
   */
  constructor(p5Instance, maxWidth = 800, maxHeight = 600) {
    this.p5 = p5Instance
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight

    // Create gradient and cell renderers
    this.gradientRenderer = new GradientRenderer(p5Instance)
    this.cellRenderer = new CellRenderer(p5Instance)

    // Create graphics buffers for compositing
    // These are reused across frames for performance
    this.gradientBuffer = null
    this.maskBuffer = null
    this.resultBuffer = null

    // Initialize buffers on first render
    this.buffersInitialized = false
  }

  /**
   * Initialize graphics buffers.
   * Called automatically on first render.
   *
   * @param {number} width - Buffer width
   * @param {number} height - Buffer height
   */
  initializeBuffers(width, height) {
    if (!this.buffersInitialized) {
      console.log('Initializing buffers:', { width, height })

      this.gradientBuffer = this.p5.createGraphics(width, height)
      this.maskBuffer = this.p5.createGraphics(width, height)
      this.resultBuffer = this.p5.createGraphics(width, height)

      // Set willReadFrequently for better performance
      if (this.gradientBuffer.drawingContext) {
        this.gradientBuffer.drawingContext.willReadFrequently = true
      }
      if (this.maskBuffer.drawingContext) {
        this.maskBuffer.drawingContext.willReadFrequently = true
      }

      this.buffersInitialized = true
      console.log('Buffers initialized successfully')
    }
  }

  /**
   * Render a GoL grid with masked gradient.
   * The gradient is only visible where GoL cells are alive.
   *
   * @param {GoLEngine} engine - GoL engine instance
   * @param {number} x - X position on screen
   * @param {number} y - Y position on screen
   * @param {number} cellSize - Size of each cell in pixels
   * @param {object} gradientConfig - Gradient configuration (from GradientPresets)
   */
  renderMaskedGrid(engine, x, y, cellSize, gradientConfig) {
    const cols = engine.cols
    const rows = engine.rows
    const width = cols * cellSize
    const height = rows * cellSize

    // Initialize buffers if needed
    if (!this.buffersInitialized ||
        width > this.gradientBuffer.width ||
        height > this.gradientBuffer.height) {
      this.initializeBuffers(
        Math.max(width, this.maxWidth),
        Math.max(height, this.maxHeight)
      )
    }

    // Verify buffers exist
    if (!this.gradientBuffer || !this.maskBuffer) {
      console.error('Buffers not initialized!')
      return
    }

    // Clear buffers
    this.gradientBuffer.clear()
    this.maskBuffer.clear()

    // 1. Render gradient to buffer
    if (gradientConfig.perColumn) {
      this.gradientRenderer.renderPerColumnGradient(
        this.gradientBuffer,
        0, 0,
        width, height,
        cellSize,
        gradientConfig.palette,
        gradientConfig.controlPoints,
        gradientConfig.animationSpeed
      )
    } else {
      this.gradientRenderer.renderVerticalGradient(
        this.gradientBuffer,
        0, 0,
        width, height,
        gradientConfig.palette,
        gradientConfig.controlPoints,
        gradientConfig.animationSpeed
      )
    }

    // 2. Render GoL cells as white mask
    this.renderCellMask(engine.current, this.maskBuffer, cellSize)

    // 3. Apply mask to gradient manually
    // Load pixels from both buffers
    this.gradientBuffer.loadPixels()
    this.maskBuffer.loadPixels()

    // Manual masking: set alpha channel based on mask
    const gradPixels = this.gradientBuffer.pixels
    const maskPixels = this.maskBuffer.pixels

    for (let i = 0; i < gradPixels.length; i += 4) {
      // Mask value (grayscale, so any channel works)
      const maskValue = maskPixels[i]
      // Set alpha of gradient based on mask (white=255=opaque, black=0=transparent)
      gradPixels[i + 3] = maskValue
    }

    this.gradientBuffer.updatePixels()

    // 4. Draw result to main canvas
    this.p5.image(this.gradientBuffer, x, y, width, height)
  }

  /**
   * Render GoL cells as a white/transparent mask.
   * White = cell alive, black = cell dead (for p5.js mask).
   *
   * @param {number[][]} grid - GoL grid
   * @param {object} buffer - Graphics buffer to render to
   * @param {number} cellSize - Cell size in pixels
   */
  renderCellMask(grid, buffer, cellSize) {
    const cols = grid.length
    const rows = grid[0].length

    // Clear with black background (p5.js mask uses black = transparent)
    buffer.background(0)
    buffer.fill(255) // White for alive cells (visible)
    buffer.noStroke()

    // Render each alive cell
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y] === ALIVE) {
          const px = x * cellSize
          const py = y * cellSize
          buffer.rect(px, py, cellSize, cellSize)
        }
      }
    }
  }

  /**
   * Update gradient animation.
   * Call this every frame to animate gradients.
   */
  updateAnimation() {
    // Update with speed from current gradient config
    // (speed will be applied per entity in renderMaskedGrid)
    this.gradientRenderer.updateAnimation()
  }

  /**
   * Render debug visualization showing buffers.
   * Useful for debugging masking issues.
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} scale - Scale factor for debug view
   */
  renderDebug(x, y, scale = 0.3) {
    if (!this.buffersInitialized) return

    const w = this.gradientBuffer.width * scale
    const h = this.gradientBuffer.height * scale

    // Draw gradient buffer
    this.p5.image(this.gradientBuffer, x, y, w, h)
    this.p5.fill(255)
    this.p5.noStroke()
    this.p5.textSize(10)
    this.p5.text('Gradient', x, y + h + 10)

    // Draw mask buffer
    this.p5.image(this.maskBuffer, x + w + 10, y, w, h)
    this.p5.text('Mask', x + w + 10, y + h + 10)

    // Draw result
    const resultX = x + (w + 10) * 2
    this.p5.image(this.gradientBuffer, resultX, y, w, h)
    this.p5.text('Result', resultX, y + h + 10)
  }

  /**
   * Clean up buffers (call when done with renderer).
   */
  dispose() {
    if (this.gradientBuffer) this.gradientBuffer.remove()
    if (this.maskBuffer) this.maskBuffer.remove()
    if (this.resultBuffer) this.resultBuffer.remove()
    this.buffersInitialized = false
  }
}

export { MaskedRenderer }
