/**
 * Particle System Helpers
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Update all particles in array (movement + fade + cleanup).
 *
 * USAGE: Call this every frame for explosion particles
 *
 * @param {Array} particles - Array of particle objects
 * @param {number} frameCount - Current frame count from state
 * @returns {Array} Filtered array (dead particles removed)
 *
 * @example
 * // In your updateGame() function:
 * particles = updateParticles(particles, state.frameCount)
 */
export function updateParticles(particles, frameCount) {
  particles.forEach(p => {
    p.gol.updateThrottled(frameCount)
    p.x += p.vx
    p.y += p.vy
    p.alpha -= 4
    if (p.alpha <= 0) p.dead = true
  })

  return particles.filter(p => !p.dead)
}

/**
 * Render particles with alpha transparency.
 *
 * @param {Array} particles - Array of particle objects
 * @param {SimpleGradientRenderer} renderer - Gradient renderer instance
 *
 * @example
 * // In your renderGame() function:
 * renderParticles(particles, maskedRenderer)
 */
export function renderParticles(particles, renderer) {
  particles.forEach(p => {
    if (p.alpha > 0) {
      push()
      drawingContext.globalAlpha = p.alpha / 255
      renderer.renderMaskedGrid(p.gol, p.x, p.y, p.cellSize, p.gradient)
      pop()
    }
  })
}
