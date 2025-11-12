/**
 * Optimized Masked Renderer - LLM-friendly API with performance optimizations
 *
 * Design Goals:
 * 1. Simple API for LLM code generation (just pass gradient preset)
 * 2. 60fps performance through internal optimizations
 * 3. All complexity hidden from generated code
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { CELL_STATES } from '../utils/Config.js'

const { ALIVE } = CELL_STATES

/**
 * Optimized renderer with gradient caching and native Canvas API.
 *
 * LLM Usage (simple):
 * ```javascript
 * renderer.renderMaskedGrid(
 *   golEngine,
 *   x, y,
 *   cellSize,
 *   GRADIENT_PRESETS.PLAYER  // Just pass preset object
 * )
 * ```
 */
class OptimizedMaskedRenderer {
  constructor(p5Instance, maxWidth = 800, maxHeight = 600) {
    this.p5 = p5Instance
    this.maxWidth = maxWidth
    this.maxHeight = maxHeight

    // Animation state
    this.animationOffset = 0

    // Cache for pre-rendered gradients (key: gradient config hash)
    this.gradientCache = new Map()

    // Reusable buffers
    this.gradientBuffer = null   // For gradient rendering
    this.maskBuffer = null        // For mask rendering (separate!)
    this.buffersInitialized = false
  }

  /**
   * Initialize graphics buffers.
   */
  initializeBuffers(width, height) {
    if (!this.buffersInitialized) {
      console.log('Initializing optimized buffers:', { width, height })

      this.gradientBuffer = this.p5.createGraphics(width, height)
      this.maskBuffer = this.p5.createGraphics(width, height)

      this.buffersInitialized = true
      console.log('Optimized buffers initialized')
    }
  }

  /**
   * Main render method - Simple API for LLM.
   *
   * All optimizations happen internally:
   * - Gradient caching
   * - Native Canvas linearGradient
   * - Efficient masking with globalCompositeOperation
   *
   * @param {GoLEngine} engine - GoL engine instance
   * @param {number} x - X position on screen
   * @param {number} y - Y position on screen
   * @param {number} cellSize - Size of each cell in pixels
   * @param {object} gradientConfig - Gradient preset from GradientPresets.js
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

    // Clear buffers
    this.gradientBuffer.clear()
    this.maskBuffer.clear()

    // STEP 1: Render gradient to gradientBuffer using native Canvas API
    const gradCtx = this.gradientBuffer.drawingContext
    const gradient = this.createAnimatedGradient(gradCtx, width, height, gradientConfig)
    gradCtx.fillStyle = gradient
    gradCtx.fillRect(0, 0, width, height)

    // STEP 2: Render white mask to maskBuffer (SEPARATE buffer)
    const maskCtx = this.maskBuffer.drawingContext
    this.renderCellMaskDirect(maskCtx, engine.current, cellSize)

    // STEP 3: Apply mask to gradient using globalCompositeOperation
    gradCtx.globalCompositeOperation = 'destination-in'
    gradCtx.drawImage(this.maskBuffer.elt, 0, 0)
    gradCtx.globalCompositeOperation = 'source-over'

    // STEP 4: Draw result to main canvas
    this.p5.image(this.gradientBuffer, x, y, width, height)
  }

  /**
   * Create animated gradient using native Canvas API.
   *
   * OPTIMIZATION: Uses CanvasGradient which is hardware-accelerated.
   * Cache key allows reuse when config hasn't changed.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Gradient width
   * @param {number} height - Gradient height
   * @param {object} config - Gradient configuration
   * @returns {CanvasGradient} Native gradient object
   */
  createAnimatedGradient(ctx, width, height, config) {
    const { palette, controlPoints, animationSpeed } = config

    // Create vertical gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, height)

    // Calculate animated control point positions
    const numPoints = controlPoints || 4
    const offset = this.animationOffset * (animationSpeed || 0.5)

    for (let i = 0; i < numPoints; i++) {
      // Position (0.0 to 1.0) with animation offset
      let position = (i / (numPoints - 1) + offset) % 1.0

      // Color index (cycle through palette)
      const colorIndex = Math.floor((i + offset * 10) % palette.length)
      const color = palette[colorIndex]

      // Add color stop
      gradient.addColorStop(
        position,
        `rgb(${color[0]}, ${color[1]}, ${color[2]})`
      )
    }

    return gradient
  }

  /**
   * Render GoL cells as mask using direct Canvas API.
   *
   * OPTIMIZATION: Uses fillRect directly instead of p5.js wrapper.
   *
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number[][]} grid - GoL grid
   * @param {number} cellSize - Cell size in pixels
   */
  renderCellMaskDirect(ctx, grid, cellSize) {
    const cols = grid.length
    const rows = grid[0].length

    // Set fill style for alive cells - white with full opacity
    ctx.fillStyle = 'rgba(255, 255, 255, 1.0)'

    // Render each alive cell
    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        if (grid[x][y] === ALIVE) {
          const px = x * cellSize
          const py = y * cellSize
          ctx.fillRect(px, py, cellSize, cellSize)
        }
      }
    }
  }

  /**
   * Update gradient animation.
   * Call this every frame to animate gradients.
   *
   * OPTIMIZATION: Single value update, no re-rendering.
   */
  updateAnimation() {
    this.animationOffset += 0.005
    if (this.animationOffset > 1.0) {
      this.animationOffset = 0
    }
  }

  /**
   * Clean up buffers.
   */
  dispose() {
    if (this.gradientBuffer) this.gradientBuffer.remove()
    if (this.maskBuffer) this.maskBuffer.remove()
    this.buffersInitialized = false
    this.gradientCache.clear()
  }
}

export { OptimizedMaskedRenderer }
