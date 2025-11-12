/**
 * Cell renderer with batch rendering optimization for p5.js.
 * Uses beginShape(QUADS) to batch all cells into a single draw call.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { CELL_STATES } from '../utils/Config.js'

const { ALIVE } = CELL_STATES

/**
 * Optimized cell renderer for Game of Life grids.
 */
class CellRenderer {
  /**
   * Create a cell renderer.
   *
   * @param {object} p5Instance - p5.js instance
   */
  constructor(p5Instance) {
    this.p5 = p5Instance
  }

  /**
   * Render a GoL grid with batch rendering optimization.
   * CRITICAL: Uses beginShape(QUADS) for performance.
   * Only renders alive cells (skips dead cells).
   *
   * @param {number[][]} grid - 2D array representing the grid
   * @param {number} offsetX - X offset for rendering position
   * @param {number} offsetY - Y offset for rendering position
   * @param {number} cellSize - Size of each cell in pixels
   * @param {string|number[]} color - Cell color (p5 color string or [r,g,b] array)
   * @param {number} alpha - Alpha transparency (0-255)
   */
  renderGrid(grid, offsetX = 0, offsetY = 0, cellSize = 10, color = '#FFFFFF', alpha = 255) {
    const cols = grid.length
    const rows = grid[0].length

    // Set fill color
    if (Array.isArray(color)) {
      this.p5.fill(color[0], color[1], color[2], alpha)
    } else {
      this.p5.fill(color)
      if (alpha !== 255) {
        // Apply alpha if not default
        const c = this.p5.color(color)
        c.setAlpha(alpha)
        this.p5.fill(c)
      }
    }

    this.p5.noStroke()

    // Batch render using QUADS for optimal performance
    this.p5.beginShape(this.p5.QUADS)

    for (let x = 0; x < cols; x++) {
      for (let y = 0; y < rows; y++) {
        // Only render alive cells
        if (grid[x][y] === ALIVE) {
          const px = offsetX + x * cellSize
          const py = offsetY + y * cellSize

          // Add quad vertices (4 corners of the cell)
          this.p5.vertex(px, py)
          this.p5.vertex(px + cellSize, py)
          this.p5.vertex(px + cellSize, py + cellSize)
          this.p5.vertex(px, py + cellSize)
        }
      }
    }

    this.p5.endShape()
  }

  /**
   * Render a single cell (useful for debugging or individual cell drawing).
   *
   * @param {number} x - X position in pixels
   * @param {number} y - Y position in pixels
   * @param {number} size - Cell size in pixels
   * @param {string|number[]} color - Cell color
   * @param {number} alpha - Alpha transparency (0-255)
   */
  renderCell(x, y, size, color = '#FFFFFF', alpha = 255) {
    if (Array.isArray(color)) {
      this.p5.fill(color[0], color[1], color[2], alpha)
    } else {
      this.p5.fill(color)
      if (alpha !== 255) {
        const c = this.p5.color(color)
        c.setAlpha(alpha)
        this.p5.fill(c)
      }
    }

    this.p5.noStroke()
    this.p5.rect(x, y, size, size)
  }

  /**
   * Render grid with camera offset for scrolling backgrounds.
   * Useful for future parallax effects.
   *
   * @param {number[][]} grid - 2D array representing the grid
   * @param {number} offsetX - X offset for rendering position
   * @param {number} offsetY - Y offset for rendering position
   * @param {number} cellSize - Size of each cell in pixels
   * @param {number} cameraX - Camera X offset
   * @param {number} cameraY - Camera Y offset
   * @param {string|number[]} color - Cell color
   * @param {number} alpha - Alpha transparency (0-255)
   */
  renderGridWithCamera(
    grid,
    offsetX = 0,
    offsetY = 0,
    cellSize = 10,
    cameraX = 0,
    cameraY = 0,
    color = '#FFFFFF',
    alpha = 255
  ) {
    // Apply camera offset
    const adjustedOffsetX = offsetX - cameraX
    const adjustedOffsetY = offsetY - cameraY

    this.renderGrid(grid, adjustedOffsetX, adjustedOffsetY, cellSize, color, alpha)
  }

  /**
   * Render grid outline (debug visualization).
   *
   * @param {number} cols - Number of columns
   * @param {number} rows - Number of rows
   * @param {number} offsetX - X offset
   * @param {number} offsetY - Y offset
   * @param {number} cellSize - Cell size
   * @param {string} color - Outline color
   */
  renderGridOutline(cols, rows, offsetX = 0, offsetY = 0, cellSize = 10, color = '#FF0000') {
    this.p5.noFill()
    this.p5.stroke(color)
    this.p5.strokeWeight(1)

    const width = cols * cellSize
    const height = rows * cellSize

    this.p5.rect(offsetX, offsetY, width, height)
  }

  /**
   * Render cell count overlay (debug visualization).
   *
   * @param {number} aliveCount - Number of alive cells
   * @param {number} totalCount - Total cell count
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  renderCellCount(aliveCount, totalCount, x = 10, y = 20) {
    this.p5.fill(255)
    this.p5.noStroke()
    this.p5.textSize(14)
    this.p5.textAlign(this.p5.LEFT, this.p5.TOP)
    this.p5.text(`Alive: ${aliveCount} / ${totalCount} (${((aliveCount / totalCount) * 100).toFixed(1)}%)`, x, y)
  }

  /**
   * Render FPS counter (debug visualization).
   *
   * @param {number} x - X position
   * @param {number} y - Y position
   */
  renderFPS(x = 10, y = 40) {
    const fps = this.p5.frameRate()
    this.p5.fill(fps > 55 ? '#00FF00' : fps > 30 ? '#FFFF00' : '#FF0000')
    this.p5.noStroke()
    this.p5.textSize(14)
    this.p5.textAlign(this.p5.LEFT, this.p5.TOP)
    this.p5.text(`FPS: ${fps.toFixed(1)}`, x, y)
  }
}

export { CellRenderer }
