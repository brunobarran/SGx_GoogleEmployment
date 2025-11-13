/**
 * Gradient Demo - Showcase of masked gradient system
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from './src/core/GoLEngine.js'
import { MaskedRenderer } from './src/rendering/MaskedRenderer.js'
import { GRADIENT_PRESETS } from './src/utils/GradientPresets.js'
import { Patterns } from './src/utils/Patterns.js'

// State
let golEngine
let maskedRenderer
let currentPreset = 'PLAYER'
let presetKeys = Object.keys(GRADIENT_PRESETS)
let currentPresetIndex = 0
let paused = false

function setup() {
  createCanvas(800, 600)
  frameRate(60)

  // Create GoL background
  golEngine = new GoLEngine(80, 60, 10)
  golEngine.randomSeed(0.3)

  // Create masked renderer
  maskedRenderer = new MaskedRenderer(this, 800, 600)

  // Add some interesting patterns
  golEngine.setPattern(Patterns.GLIDER, 10, 10)
  golEngine.setPattern(Patterns.PULSAR, 40, 20)
  golEngine.setPattern(Patterns.LIGHTWEIGHT_SPACESHIP, 60, 40)
}

function draw() {
  background(255)

  // Update GoL
  if (!paused) {
    if (frameCount % 6 === 0) {
      golEngine.update()
    }
  }

  // Update gradient animation
  if (!paused) {
    maskedRenderer.updateAnimation()
  }

  // Render with current gradient preset
  const preset = GRADIENT_PRESETS[currentPreset]
  maskedRenderer.renderMaskedGrid(
    golEngine,
    0,
    0,
    10, // cellSize
    preset
  )

  // Render info
  renderInfo()
}

function renderInfo() {
  // Current preset info
  fill(0, 0, 0, 180)
  noStroke()
  rect(width - 320, height - 120, 300, 100)

  fill(255)
  textSize(16)
  textAlign(LEFT, TOP)
  textFont('monospace')

  const preset = GRADIENT_PRESETS[currentPreset]
  text(`Preset: ${currentPreset}`, width - 310, height - 110)
  text(`Control Points: ${preset.controlPoints}`, width - 310, height - 85)
  text(`Animation Speed: ${preset.animationSpeed}`, width - 310, height - 60)
  text(`Per Column: ${preset.perColumn}`, width - 310, height - 35)

  // FPS
  const fps = frameRate()
  fill(fps > 55 ? '#00FF00' : fps > 30 ? '#FFFF00' : '#FF0000')
  textAlign(RIGHT, TOP)
  text(`FPS: ${fps.toFixed(1)}`, width - 20, 20)

  // Generation
  fill(255)
  text(`Gen: ${golEngine.generation}`, width - 20, 45)
  text(`Density: ${(golEngine.getDensity() * 100).toFixed(1)}%`, width - 20, 70)

  // Paused indicator
  if (paused) {
    fill(255, 100, 100)
    textAlign(CENTER, CENTER)
    textSize(48)
    text('PAUSED', width/2, height/2)
  }
}

function keyPressed() {
  // Number keys 1-9 to change preset
  if (key >= '1' && key <= '9') {
    const index = parseInt(key) - 1
    if (index < presetKeys.length) {
      currentPresetIndex = index
      currentPreset = presetKeys[currentPresetIndex]
    }
  }

  // Space to reseed
  if (key === ' ') {
    golEngine.randomSeed(0.3)
    golEngine.setPattern(Patterns.GLIDER, Math.floor(Math.random() * 70), Math.floor(Math.random() * 50))
    golEngine.setPattern(Patterns.PULSAR, Math.floor(Math.random() * 70), Math.floor(Math.random() * 50))
  }

  // P to pause
  if (key === 'p' || key === 'P') {
    paused = !paused
  }

  // Arrow keys to cycle presets
  if (keyCode === LEFT_ARROW) {
    currentPresetIndex = (currentPresetIndex - 1 + presetKeys.length) % presetKeys.length
    currentPreset = presetKeys[currentPresetIndex]
  }
  if (keyCode === RIGHT_ARROW) {
    currentPresetIndex = (currentPresetIndex + 1) % presetKeys.length
    currentPreset = presetKeys[currentPresetIndex]
  }
}

// Make functions global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
