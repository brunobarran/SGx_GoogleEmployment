/**
 * Canonical Conway's Game of Life patterns from LifeWiki.
 * All patterns are authentic and documented in GoL literature.
 *
 * Pattern format: 2D array where 1 = alive, 0 = dead
 * Patterns are credited to their sources (LifeWiki, Golly, etc.)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Canonical Game of Life patterns.
 * All patterns sourced from LifeWiki: https://conwaylife.com/wiki/
 */
export const Patterns = {
  /**
   * BLOCK - 2x2 still life (never changes)
   * Source: https://conwaylife.com/wiki/Block
   * Period: Stable (still life)
   */
  BLOCK: [
    [1, 1],
    [1, 1]
  ],

  /**
   * BEEHIVE - 4x3 still life
   * Source: https://conwaylife.com/wiki/Beehive
   * Period: Stable (still life)
   */
  BEEHIVE: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 1, 0]
  ],

  /**
   * LOAF - 4x4 still life
   * Source: https://conwaylife.com/wiki/Loaf
   * Period: Stable (still life)
   */
  LOAF: [
    [0, 1, 1, 0],
    [1, 0, 0, 1],
    [0, 1, 0, 1],
    [0, 0, 1, 0]
  ],

  /**
   * BOAT - 3x3 still life
   * Source: https://conwaylife.com/wiki/Boat
   * Period: Stable (still life)
   */
  BOAT: [
    [1, 1, 0],
    [1, 0, 1],
    [0, 1, 0]
  ],

  /**
   * BLINKER - 3x1 oscillator (vertical orientation)
   * Source: https://conwaylife.com/wiki/Blinker
   * Period: 2 (oscillates between vertical and horizontal)
   */
  BLINKER: [
    [0, 1, 0],
    [0, 1, 0],
    [0, 1, 0]
  ],

  /**
   * TOAD - 4x2 oscillator
   * Source: https://conwaylife.com/wiki/Toad
   * Period: 2
   */
  TOAD: [
    [0, 1, 1, 1],
    [1, 1, 1, 0]
  ],

  /**
   * BEACON - 4x4 oscillator
   * Source: https://conwaylife.com/wiki/Beacon
   * Period: 2
   */
  BEACON: [
    [1, 1, 0, 0],
    [1, 1, 0, 0],
    [0, 0, 1, 1],
    [0, 0, 1, 1]
  ],

  /**
   * PULSAR - 13x13 oscillator (simplified 5x5 for performance)
   * Source: https://conwaylife.com/wiki/Pulsar
   * Period: 3
   * Note: Full 13x13 pattern available, using compact version for sprites
   */
  PULSAR: [
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1, 0, 0]
  ],

  /**
   * GLIDER - 3x3 spaceship (diagonal movement)
   * Source: https://conwaylife.com/wiki/Glider
   * Speed: c/4 (1 cell diagonally per 4 generations)
   * Direction: Southeast in this orientation
   */
  GLIDER: [
    [0, 1, 0],
    [0, 0, 1],
    [1, 1, 1]
  ],

  /**
   * LIGHTWEIGHT_SPACESHIP (LWSS) - 5x4 spaceship
   * Source: https://conwaylife.com/wiki/Lightweight_spaceship
   * Speed: c/2 (1 cell horizontally per 2 generations)
   * Direction: Rightward in this orientation
   */
  LIGHTWEIGHT_SPACESHIP: [
    [0, 1, 0, 0, 1],
    [1, 0, 0, 0, 0],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 0]
  ],

  /**
   * R_PENTOMINO - Methuselah pattern
   * Source: https://conwaylife.com/wiki/R-pentomino
   * Stabilizes after 1,103 generations into 116 cells
   * Great for explosion effects
   */
  R_PENTOMINO: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 1, 0]
  ],

  /**
   * ACORN - Methuselah pattern
   * Source: https://conwaylife.com/wiki/Acorn
   * Stabilizes after 5,206 generations
   * Great for long-running explosion effects
   */
  ACORN: [
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [1, 1, 0, 0, 1, 1, 1]
  ],

  /**
   * DIEHARD - Methuselah pattern
   * Source: https://conwaylife.com/wiki/Diehard
   * Stabilizes after 130 generations (dies completely)
   * Great for short explosion effects
   */
  DIEHARD: [
    [0, 0, 0, 0, 0, 0, 1, 0],
    [1, 1, 0, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 1, 1, 1]
  ]
}

/**
 * Stamp a pattern onto a grid at a specific location.
 *
 * @param {number[][]} grid - The target grid (modified in place)
 * @param {number[][]} pattern - The pattern to stamp
 * @param {number} startX - Starting column index
 * @param {number} startY - Starting row index
 * @param {number} cols - Number of columns in grid
 * @param {number} rows - Number of rows in grid
 */
export function stampPattern(grid, pattern, startX, startY, cols, rows) {
  for (let x = 0; x < pattern.length; x++) {
    for (let y = 0; y < pattern[x].length; y++) {
      const gridX = startX + x
      const gridY = startY + y
      if (gridX >= 0 && gridX < cols && gridY >= 0 && gridY < rows) {
        grid[gridX][gridY] = pattern[x][y]
      }
    }
  }
}

/**
 * Rotate a pattern 90 degrees clockwise.
 *
 * @param {number[][]} pattern - Pattern to rotate
 * @returns {number[][]} Rotated pattern
 */
export function rotatePattern90(pattern) {
  const rows = pattern.length
  const cols = pattern[0].length
  const rotated = []

  for (let y = 0; y < cols; y++) {
    rotated[y] = []
    for (let x = 0; x < rows; x++) {
      rotated[y][x] = pattern[rows - 1 - x][y]
    }
  }

  return rotated
}

/**
 * Flip a pattern horizontally.
 *
 * @param {number[][]} pattern - Pattern to flip
 * @returns {number[][]} Flipped pattern
 */
export function flipPatternHorizontal(pattern) {
  return pattern.map(row => [...row].reverse())
}

/**
 * Flip a pattern vertically.
 *
 * @param {number[][]} pattern - Pattern to flip
 * @returns {number[][]} Flipped pattern
 */
export function flipPatternVertical(pattern) {
  return [...pattern].reverse()
}
