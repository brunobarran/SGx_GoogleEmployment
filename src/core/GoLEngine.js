/**
 * Conway's Game of Life Engine with double buffer pattern.
 * Implements B3/S23 rules (Birth: 3 neighbors, Survival: 2 or 3 neighbors).
 *
 * @author Game of Life Arcade
 * @license ISC
 */

const ALIVE = 1
const DEAD = 0

/**
 * Game of Life Engine implementing Conway's B3/S23 rules with double buffer.
 */
class GoLEngine {
  /**
   * Create a new GoL engine.
   *
   * @param {number} cols - Number of columns in the grid
   * @param {number} rows - Number of rows in the grid
   * @param {number} updateRateFPS - Target update rate in frames per second (default: 10)
   */
  constructor(cols, rows, updateRateFPS = 10) {
    this.cols = cols
    this.rows = rows
    this.updateRateFPS = updateRateFPS
    this.framesBetweenUpdates = 60 / updateRateFPS  // Assuming 60fps main loop
    this.frameCounter = 0

    // Double buffer - CRITICAL for correct GoL implementation
    this.current = this.create2DArray(cols, rows)
    this.next = this.create2DArray(cols, rows)

    this.generation = 0
  }

  /**
   * Create a 2D array initialized with zeros (dead cells).
   *
   * @param {number} cols - Number of columns
   * @param {number} rows - Number of rows
   * @returns {number[][]} 2D array of dead cells
   */
  create2DArray(cols, rows) {
    const arr = new Array(cols)
    for (let i = 0; i < cols; i++) {
      arr[i] = new Array(rows).fill(DEAD)
    }
    return arr
  }

  /**
   * Set a specific cell to alive or dead.
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @param {number} state - ALIVE or DEAD
   */
  setCell(x, y, state) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      this.current[x][y] = state
    }
  }

  /**
   * Get the state of a specific cell.
   *
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {number} ALIVE or DEAD
   */
  getCell(x, y) {
    if (x >= 0 && x < this.cols && y >= 0 && y < this.rows) {
      return this.current[x][y]
    }
    return DEAD  // Out of bounds = dead
  }

  /**
   * Clear the grid (set all cells to dead).
   */
  clearGrid() {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.current[x][y] = DEAD
        this.next[x][y] = DEAD
      }
    }
    this.generation = 0
  }

  /**
   * Seed the grid with random cells (~30% density).
   *
   * @param {number} density - Probability of a cell being alive (default: 0.3)
   */
  randomSeed(density = 0.3) {
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        this.current[x][y] = Math.random() < density ? ALIVE : DEAD
      }
    }
    this.generation = 0
  }

  /**
   * Count live neighbors for a cell using Moore neighborhood (8 neighbors).
   *
   * @param {number[][]} grid - The grid to read from
   * @param {number} x - Column index
   * @param {number} y - Row index
   * @returns {number} Number of live neighbors (0-8)
   */
  countLiveNeighbors(grid, x, y) {
    let count = 0

    // Check all 8 neighbors (Moore neighborhood)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        // Skip the center cell
        if (dx === 0 && dy === 0) continue

        const nx = x + dx
        const ny = y + dy

        // Check bounds and count if alive
        if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows) {
          count += grid[nx][ny]
        }
        // Out of bounds cells are treated as dead (fixed boundary)
      }
    }

    return count
  }

  /**
   * Apply Conway's B3/S23 rules.
   * Birth: exactly 3 neighbors → becomes alive
   * Survival: 2 or 3 neighbors → stays alive
   * Death: < 2 (underpopulation) or > 3 (overpopulation) → dies
   *
   * @param {number} currentState - Current cell state (ALIVE or DEAD)
   * @param {number} neighbors - Number of live neighbors
   * @returns {number} Next state (ALIVE or DEAD)
   */
  applyB3S23Rules(currentState, neighbors) {
    if (currentState === ALIVE) {
      // Survival: 2 or 3 neighbors
      return (neighbors === 2 || neighbors === 3) ? ALIVE : DEAD
    } else {
      // Birth: exactly 3 neighbors
      return (neighbors === 3) ? ALIVE : DEAD
    }
  }

  /**
   * Update the grid to the next generation using double buffer pattern.
   * CRITICAL: Never modifies current grid while reading it.
   */
  update() {
    // Read from current, write to next
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        const neighbors = this.countLiveNeighbors(this.current, x, y)
        const currentState = this.current[x][y]
        this.next[x][y] = this.applyB3S23Rules(currentState, neighbors)
      }
    }

    // Swap buffers (pointer swap, not data copy)
    const temp = this.current
    this.current = this.next
    this.next = temp

    this.generation++
  }

  /**
   * Update with frame rate throttling.
   * Call this from your main draw() loop.
   *
   * @param {number} frameCount - Current frame count from p5.js
   * @returns {boolean} True if an update occurred
   */
  updateThrottled(frameCount) {
    if (frameCount % this.framesBetweenUpdates === 0) {
      this.update()
      return true
    }
    return false
  }

  /**
   * Set a pattern at a specific location.
   * Pattern format: pattern[row][col] where row=y, col=x
   *
   * @param {number[][]} pattern - 2D array where 1=alive, 0=dead (row-major format)
   * @param {number} startX - Starting column index
   * @param {number} startY - Starting row index
   */
  setPattern(pattern, startX = 0, startY = 0) {
    // Pattern is in row-major format: pattern[row][col]
    for (let row = 0; row < pattern.length; row++) {
      for (let col = 0; col < pattern[row].length; col++) {
        const gridX = startX + col
        const gridY = startY + row
        if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
          this.current[gridX][gridY] = pattern[row][col]
        }
      }
    }
  }

  /**
   * Get the current grid as a pattern (2D array).
   *
   * @returns {number[][]} Copy of the current grid
   */
  getPattern() {
    const pattern = []
    for (let x = 0; x < this.cols; x++) {
      pattern[x] = [...this.current[x]]
    }
    return pattern
  }

  /**
   * Get a region of the grid.
   *
   * @param {number} startX - Starting column
   * @param {number} startY - Starting row
   * @param {number} width - Width of region
   * @param {number} height - Height of region
   * @returns {number[][]} 2D array of the region
   */
  getRegion(startX, startY, width, height) {
    const region = []
    for (let x = 0; x < width; x++) {
      region[x] = []
      for (let y = 0; y < height; y++) {
        const gridX = startX + x
        const gridY = startY + y
        if (gridX >= 0 && gridX < this.cols && gridY >= 0 && gridY < this.rows) {
          region[x][y] = this.current[gridX][gridY]
        } else {
          region[x][y] = DEAD
        }
      }
    }
    return region
  }

  /**
   * Count total alive cells in the grid.
   *
   * @returns {number} Number of alive cells
   */
  countAliveCells() {
    let count = 0
    for (let x = 0; x < this.cols; x++) {
      for (let y = 0; y < this.rows; y++) {
        count += this.current[x][y]
      }
    }
    return count
  }

  /**
   * Get cell density (percentage of alive cells).
   *
   * @returns {number} Density as a value between 0 and 1
   */
  getDensity() {
    return this.countAliveCells() / (this.cols * this.rows)
  }
}

export { GoLEngine, ALIVE, DEAD }
