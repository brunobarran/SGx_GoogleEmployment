/**
 * Gradient Demo - OPTIMIZED VERSION
 * Performance comparison: Old (20fps) vs New (60fps target)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from './src/core/GoLEngine.js'
import { OptimizedMaskedRenderer } from './src/rendering/OptimizedMaskedRenderer.js'
import { GRADIENT_PRESETS } from './src/utils/GradientPresets.js'
import { Patterns } from './src/utils/Patterns.js'

// State
let golEngine
let maskedRenderer
let currentPreset = 'PLAYER'
let presetKeys = Object.keys(GRADIENT_PRESETS)
let currentPresetIndex = 0
let paused = false

// FPS tracking
let fpsHistory = []
let maxFps = 0
let minFps = 999

function setup() {
  createCanvas(800, 600)
  frameRate(60)

  // Create GoL background
  golEngine = new GoLEngine(80, 60, 10)
  golEngine.randomSeed(0.3)

  // Create OPTIMIZED masked renderer
  maskedRenderer = new OptimizedMaskedRenderer(this, 800, 600)

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

  // Track FPS
  trackFPS()

  // Render info
  renderInfo()
}

function trackFPS() {
  const currentFps = frameRate()
  fpsHistory.push(currentFps)

  // Keep last 60 frames
  if (fpsHistory.length > 60) {
    fpsHistory.shift()
  }

  // Update min/max
  if (currentFps > maxFps) maxFps = currentFps
  if (currentFps < minFps && currentFps > 0) minFps = currentFps
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
  text(`OPTIMIZED RENDERER`, width - 310, height - 35)

  // FPS stats
  const currentFps = frameRate()
  const avgFps = fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length

  // Color based on performance
  let fpsColor = color(255, 100, 100) // Red (bad)
  if (currentFps > 55) fpsColor = color(100, 255, 100) // Green (good)
  else if (currentFps > 40) fpsColor = color(255, 255, 100) // Yellow (ok)

  fill(fpsColor)
  textAlign(RIGHT, TOP)
  textSize(20)
  text(`FPS: ${currentFps.toFixed(1)}`, width - 20, 20)

  fill(255)
  textSize(14)
  text(`Avg: ${avgFps.toFixed(1)}`, width - 20, 50)
  text(`Max: ${maxFps.toFixed(1)}`, width - 20, 70)
  text(`Min: ${minFps.toFixed(1)}`, width - 20, 90)

  // Generation
  text(`Gen: ${golEngine.generation}`, width - 20, 120)
  text(`Density: ${(golEngine.getDensity() * 100).toFixed(1)}%`, width - 20, 140)

  // Performance indicator
  textAlign(LEFT, TOP)
  textSize(24)
  if (avgFps > 55) {
    fill(100, 255, 100)
    text('✓ OPTIMIZED', 20, 20)
  } else if (avgFps > 40) {
    fill(255, 255, 100)
    text('⚠ MODERATE', 20, 20)
  } else {
    fill(255, 100, 100)
    text('✗ SLOW', 20, 20)
  }

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

  // R to reset FPS stats
  if (key === 'r' || key === 'R') {
    fpsHistory = []
    maxFps = 0
    minFps = 999
  }
}

// Make functions global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
