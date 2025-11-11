/**
 * Pure GoL Background - 100% authentic B3/S23 simulation.
 * This showcases Conway's Game of Life without any modifications.
 *
 * AUTHENTICITY REQUIREMENTS:
 * - 100% Pure GoL - NO modifications allowed
 * - Follows B3/S23 rules without ANY tweaks
 * - Update rate: 10fps (performance optimization)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from '../core/GoLEngine.js'
import { CellRenderer } from './CellRenderer.js'
import { VISUAL_CONFIG, PERFORMANCE_CONFIG, DENSITY_CONFIG } from '../utils/Config.js'

/**
 * Pure GoL background showcasing authentic cellular automaton behavior.
 */
class GoLBackground {
  /**
   * Create a Pure GoL background.
   *
   * @param {object} p5Instance - p5.js instance
   * @param {number} cols - Number of columns (default: 60)
   * @param {number} rows - Number of rows (default: 40)
   */
  constructor(p5Instance, cols = VISUAL_CONFIG.GRID_COLS, rows = VISUAL_CONFIG.GRID_ROWS) {
    this.p5 = p5Instance
    this.cols = cols
    this.rows = rows

    // Initialize GoL engine with 10fps update rate
    this.engine = new GoLEngine(cols, rows, PERFORMANCE_CONFIG.BACKGROUND_UPDATE_RATE)

    // Initialize cell renderer
    this.renderer = new CellRenderer(p5Instance)

    // Visual settings
    this.cellSize = VISUAL_CONFIG.CELL_SIZE
    this.cellColor = VISUAL_CONFIG.CELL_COLOR
    this.cellAlpha = VISUAL_CONFIG.CELL_ALPHA

    // Position settings (centered on canvas)
    this.offsetX = 0
    this.offsetY = 0

    // Performance tracking
    this.lastUpdateTime = 0
    this.updateCount = 0

    // Initialize with random seed
    this.randomSeed()
  }

  /**
   * Seed the background with random cells (~30% density).
   *
   * @param {number} density - Cell density (default: 0.3)
   */
  randomSeed(density = DENSITY_CONFIG.RANDOM_SEED) {
    this.engine.randomSeed(density)
  }

  /**
   * Set a specific pattern at a location.
   *
   * @param {number[][]} pattern - Pattern to set
   * @param {number} x - Starting column
   * @param {number} y - Starting row
   */
  setPattern(pattern, x, y) {
    this.engine.setPattern(pattern, x, y)
  }

  /**
   * Clear the background (all cells dead).
   */
  clear() {
    this.engine.clearGrid()
  }

  /**
   * Update the GoL simulation with 10fps throttling.
   * This is called from the main draw() loop at 60fps,
   * but only updates the GoL every 6 frames.
   */
  update() {
    // Update engine with throttling (10fps = every 6 frames at 60fps)
    if (this.p5.frameCount % Math.floor(60 / PERFORMANCE_CONFIG.BACKGROUND_UPDATE_RATE) === 0) {
      const startTime = performance.now()

      this.engine.update()
      this.updateCount++

      const endTime = performance.now()
      this.lastUpdateTime = endTime - startTime

      // Optional: Log performance
      if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGGING) {
        if (this.updateCount % PERFORMANCE_CONFIG.PERFORMANCE_LOG_INTERVAL === 0) {
          console.log(`[GoLBackground] Update time: ${this.lastUpdateTime.toFixed(3)}ms`)
        }
      }
    }
  }

  /**
   * Render the background.
   */
  render() {
    const startTime = performance.now()

    this.renderer.renderGrid(
      this.engine.current,
      this.offsetX,
      this.offsetY,
      this.cellSize,
      this.cellColor,
      this.cellAlpha
    )

    const endTime = performance.now()
    const renderTime = endTime - startTime

    // Optional: Log performance
    if (PERFORMANCE_CONFIG.ENABLE_PERFORMANCE_LOGGING) {
      if (this.p5.frameCount % PERFORMANCE_CONFIG.PERFORMANCE_LOG_INTERVAL === 0) {
        console.log(`[GoLBackground] Render time: ${renderTime.toFixed(3)}ms`)
      }
    }
  }

  /**
   * Center the background on the canvas.
   */
  centerOnCanvas() {
    const gridWidth = this.cols * this.cellSize
    const gridHeight = this.rows * this.cellSize

    this.offsetX = (this.p5.width - gridWidth) / 2
    this.offsetY = (this.p5.height - gridHeight) / 2
  }

  /**
   * Get current cell density.
   *
   * @returns {number} Density as a value between 0 and 1
   */
  getDensity() {
    return this.engine.getDensity()
  }

  /**
   * Get number of alive cells.
   *
   * @returns {number} Count of alive cells
   */
  getAliveCount() {
    return this.engine.countAliveCells()
  }

  /**
   * Get current generation count.
   *
   * @returns {number} Generation number
   */
  getGeneration() {
    return this.engine.generation
  }

  /**
   * Get a region of the grid (for testing).
   *
   * @param {number} startX - Starting column
   * @param {number} startY - Starting row
   * @param {number} width - Width of region
   * @param {number} height - Height of region
   * @returns {number[][]} 2D array of the region
   */
  getRegion(startX, startY, width, height) {
    return this.engine.getRegion(startX, startY, width, height)
  }

  /**
   * Set position offset for rendering.
   *
   * @param {number} x - X offset
   * @param {number} y - Y offset
   */
  setOffset(x, y) {
    this.offsetX = x
    this.offsetY = y
  }

  /**
   * Get last update time in milliseconds.
   *
   * @returns {number} Last update time
   */
  getLastUpdateTime() {
    return this.lastUpdateTime
  }

  /**
   * Render debug information.
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  renderDebugInfo(x = 10, y = 40) {
    const aliveCount = this.getAliveCount()
    const totalCount = this.cols * this.rows
    const density = this.getDensity()

    // Draw semi-transparent background for better readability
    this.p5.fill(0, 0, 0, 180)
    this.p5.noStroke()
    this.p5.rect(x - 5, y - 5, 200, 95)

    // Render text with monospace font
    this.p5.fill(255)
    this.p5.textSize(16)
    this.p5.textAlign(this.p5.LEFT, this.p5.TOP)
    this.p5.textFont('monospace')

    this.p5.text(`Gen: ${this.getGeneration()}`, x, y)
    this.p5.text(`Alive: ${aliveCount}/${totalCount}`, x, y + 22)
    this.p5.text(`Density: ${(density * 100).toFixed(1)}%`, x, y + 44)
    this.p5.text(`Update: ${this.lastUpdateTime.toFixed(2)}ms`, x, y + 66)
  }
}

export { GoLBackground }
