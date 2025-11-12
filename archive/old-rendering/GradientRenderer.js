/**
 * Gradient renderer for animated vertical gradients.
 * Creates smooth, animated gradients using Google brand colors.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Renders animated vertical gradients with configurable control points.
 */
class GradientRenderer {
  /**
   * Create a gradient renderer.
   *
   * @param {object} p5Instance - p5.js instance
   */
  constructor(p5Instance) {
    this.p5 = p5Instance
    this.animationOffset = 0
  }

  /**
   * Render a vertical gradient with animation.
   * Each column gets a slightly different gradient for visual variety.
   *
   * @param {object} buffer - p5.Graphics buffer to render to (or main canvas)
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width of gradient area
   * @param {number} height - Height of gradient area
   * @param {array} colorPalette - Array of RGB color arrays [[r,g,b], ...]
   * @param {number} controlPoints - Number of control points (4-8)
   * @param {number} animationSpeed - Animation speed multiplier
   */
  renderVerticalGradient(buffer, x, y, width, height, colorPalette, controlPoints = 6, animationSpeed = 0.5) {
    buffer.push()
    buffer.translate(x, y)
    buffer.noStroke()

    // Generate control points
    const points = this.generateControlPoints(colorPalette, controlPoints, height)

    // Render gradient by drawing horizontal strips
    for (let py = 0; py < height; py++) {
      // Add animation offset (wrapping)
      const animatedY = (py + this.animationOffset) % height

      // Find which control points to interpolate between
      const color = this.getColorAtPosition(animatedY, points, height)

      // Draw horizontal line at this Y position
      buffer.fill(color[0], color[1], color[2])
      buffer.rect(0, py, width, 1)
    }

    buffer.pop()
  }

  /**
   * Render gradient per column (for more organic variation).
   * Each column gets slightly offset control points.
   *
   * @param {object} buffer - p5.Graphics buffer
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} width - Width in pixels
   * @param {number} height - Height in pixels
   * @param {number} cellSize - Size of each cell/column
   * @param {array} colorPalette - Color palette
   * @param {number} controlPoints - Number of control points
   * @param {number} animationSpeed - Animation speed
   */
  renderPerColumnGradient(buffer, x, y, width, height, cellSize, colorPalette, controlPoints = 6, animationSpeed = 0.5) {
    buffer.push()
    buffer.translate(x, y)
    buffer.noStroke()

    const cols = Math.ceil(width / cellSize)

    for (let col = 0; col < cols; col++) {
      // Each column gets slightly different control points for variation
      const columnOffset = col * 0.1 // Slight phase offset per column
      const points = this.generateControlPoints(colorPalette, controlPoints, height, columnOffset)

      const colX = col * cellSize
      const colWidth = Math.min(cellSize, width - colX)

      // Render gradient for this column
      for (let py = 0; py < height; py++) {
        const animatedY = (py + this.animationOffset) % height
        const color = this.getColorAtPosition(animatedY, points, height)

        buffer.fill(color[0], color[1], color[2])
        buffer.rect(colX, py, colWidth, 1)
      }
    }

    buffer.pop()
  }

  /**
   * Generate control points for gradient.
   * Control points define where each color appears along the gradient.
   *
   * @param {array} colorPalette - Array of RGB colors
   * @param {number} count - Number of control points
   * @param {number} height - Height of gradient area
   * @param {number} offset - Phase offset for variation (default: 0)
   * @returns {array} Array of {position, color} objects
   */
  generateControlPoints(colorPalette, count, height, offset = 0) {
    const points = []

    // Ensure we have enough colors
    if (colorPalette.length < 2) {
      console.warn('GradientRenderer: Need at least 2 colors in palette')
      return [{position: 0, color: colorPalette[0] || [255, 255, 255]}]
    }

    // Distribute control points evenly
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1) // 0 to 1
      const position = (t * height + offset * height) % height

      // Pick color from palette (cycle through if needed)
      const colorIndex = Math.floor(t * (colorPalette.length - 1))
      const color = colorPalette[colorIndex % colorPalette.length]

      points.push({ position, color })
    }

    // Sort by position
    points.sort((a, b) => a.position - b.position)

    return points
  }

  /**
   * Get interpolated color at a specific Y position.
   *
   * @param {number} y - Y position
   * @param {array} controlPoints - Array of control points
   * @param {number} height - Total height
   * @returns {array} RGB color [r, g, b]
   */
  getColorAtPosition(y, controlPoints, height) {
    // Normalize y to 0-height range
    const normalizedY = y % height

    // Find the two control points to interpolate between
    let beforePoint = controlPoints[0]
    let afterPoint = controlPoints[controlPoints.length - 1]

    for (let i = 0; i < controlPoints.length - 1; i++) {
      if (normalizedY >= controlPoints[i].position && normalizedY <= controlPoints[i + 1].position) {
        beforePoint = controlPoints[i]
        afterPoint = controlPoints[i + 1]
        break
      }
    }

    // Handle wrapping (if y is before first point or after last point)
    if (normalizedY < controlPoints[0].position) {
      beforePoint = controlPoints[controlPoints.length - 1]
      afterPoint = controlPoints[0]
    } else if (normalizedY > controlPoints[controlPoints.length - 1].position) {
      beforePoint = controlPoints[controlPoints.length - 1]
      afterPoint = controlPoints[0]
    }

    // Calculate interpolation factor
    const range = afterPoint.position - beforePoint.position
    const t = range === 0 ? 0 : (normalizedY - beforePoint.position) / range

    // Interpolate between colors
    return this.lerpColor(beforePoint.color, afterPoint.color, t)
  }

  /**
   * Linear interpolation between two RGB colors.
   *
   * @param {array} color1 - First color [r, g, b]
   * @param {array} color2 - Second color [r, g, b]
   * @param {number} t - Interpolation factor (0-1)
   * @returns {array} Interpolated color [r, g, b]
   */
  lerpColor(color1, color2, t) {
    const r = Math.round(color1[0] + (color2[0] - color1[0]) * t)
    const g = Math.round(color1[1] + (color2[1] - color1[1]) * t)
    const b = Math.round(color1[2] + (color2[2] - color1[2]) * t)
    return [r, g, b]
  }

  /**
   * Update animation offset.
   * Call this every frame to animate gradients.
   *
   * @param {number} speed - Animation speed (pixels per frame)
   */
  updateAnimation(speed = 0.5) {
    this.animationOffset += speed
    // Keep offset bounded to prevent overflow
    if (this.animationOffset > 10000) {
      this.animationOffset = this.animationOffset % 1000
    }
  }

  /**
   * Reset animation offset.
   */
  resetAnimation() {
    this.animationOffset = 0
  }
}

export { GradientRenderer }
