/**
 * Simple Gradient Renderer - KISS principle
 *
 * No fancy optimizations. Just works.
 * Pre-renders gradients once, reuses them.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { CELL_STATES } from '../utils/Config.js'

const { ALIVE } = CELL_STATES

/**
 * Ultra-simple gradient renderer with global background gradient.
 *
 * Philosophy:
 * - Single animated gradient covers entire screen
 * - GoL cells act as mask revealing the gradient
 * - Keep it stupid simple (KISS)
 */
class SimpleGradientRenderer {
  constructor(p5Instance) {
    this.p5 = p5Instance

    // Animation offset for gradient scrolling
    this.animationOffset = 0

    // Global gradient palette (Google colors)
    this.palette = [
      [66, 133, 244],   // Blue
      [234, 67, 53],    // Red
      [52, 168, 83],    // Green
      [251, 188, 4]     // Yellow
    ]

    // Control points for smooth gradient
    this.controlPoints = 20
  }

  /**
   * Get color from 2D animated noise field (like flowing clouds).
   *
   * @param {number} screenX - X position in screen coordinates
   * @param {number} screenY - Y position in screen coordinates
   * @returns {array} RGB color array [r, g, b]
   */
  getGradientColor(screenX, screenY) {
    // Noise scale - controls the "zoom" of the noise pattern
    // Smaller = larger, smoother blobs
    // Larger = smaller, more detailed variation
    const noiseScale = 0.002

    // Sample 2D Perlin noise with time dimension for animation
    const noiseValue = this.p5.noise(
      screenX * noiseScale,
      screenY * noiseScale,
      this.animationOffset * 0.5  // Time dimension for smooth animation
    )

    // Map noise (0.0 to 1.0) to color palette with smooth interpolation
    const t = noiseValue  // Direct use of noise value

    // Map to control points for smooth color transitions
    const colorIndex = t * (this.controlPoints - 1)
    const i1 = Math.floor(colorIndex) % this.palette.length
    const i2 = (i1 + 1) % this.palette.length
    const localT = colorIndex - Math.floor(colorIndex)

    // Interpolate between colors
    const c1 = this.palette[i1]
    const c2 = this.palette[i2]
    const r = this.p5.lerp(c1[0], c2[0], localT)
    const g = this.p5.lerp(c1[1], c2[1], localT)
    const b = this.p5.lerp(c1[2], c2[2], localT)

    return [r, g, b]
  }

  /**
   * Render GoL grid as mask revealing background gradient with noise.
   *
   * @param {GoLEngine} engine - GoL engine
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} cellSize - Cell size
   * @param {object} gradientConfig - Not used (kept for compatibility)
   */
  renderMaskedGrid(engine, x, y, cellSize, gradientConfig) {
    const cols = engine.cols
    const rows = engine.rows

    this.p5.push()
    this.p5.noStroke()

    for (let gx = 0; gx < cols; gx++) {
      for (let gy = 0; gy < rows; gy++) {
        if (engine.current[gx][gy] === ALIVE) {
          const px = x + gx * cellSize
          const py = y + gy * cellSize

          // Get color from global gradient with noise at screen position
          const [r, g, b] = this.getGradientColor(
            px + cellSize / 2,
            py + cellSize / 2
          )

          this.p5.fill(r, g, b)
          this.p5.rect(px, py, cellSize, cellSize)
        }
      }
    }

    this.p5.pop()
  }

  /**
   * Create gradient image.
   * Simple vertical gradient using p5.js.
   *
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {object} config - Gradient config
   * @returns {p5.Graphics} Gradient image
   */
  createGradient(width, height, config) {
    const { palette } = config
    const buffer = this.p5.createGraphics(width, height)

    buffer.noStroke()

    // Draw vertical gradient using simple color interpolation
    for (let y = 0; y < height; y++) {
      const t = y / height

      // Find which two colors to interpolate between
      const colorCount = palette.length
      const index = t * (colorCount - 1)
      const i1 = Math.floor(index)
      const i2 = Math.min(i1 + 1, colorCount - 1)
      const localT = index - i1

      // Interpolate
      const c1 = palette[i1]
      const c2 = palette[i2]
      const r = this.p5.lerp(c1[0], c2[0], localT)
      const g = this.p5.lerp(c1[1], c2[1], localT)
      const b = this.p5.lerp(c1[2], c2[2], localT)

      buffer.fill(r, g, b)
      buffer.rect(0, y, width, 1)
    }

    return buffer
  }

  /**
   * Update gradient animation offset
   */
  updateAnimation() {
    this.animationOffset += 0.005 // Slow, smooth animation
  }

  /**
   * Clear cache
   */
  dispose() {
    this.gradientCache.forEach(g => g.remove())
    this.gradientCache.clear()
  }
}

export { SimpleGradientRenderer }
