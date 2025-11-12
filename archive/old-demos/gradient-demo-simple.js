/**
 * Simple Gradient Demo - KISS approach
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { GoLEngine } from './src/core/GoLEngine.js'
import { SimpleGradientRenderer } from './src/rendering/SimpleGradientRenderer.js'
import { GRADIENT_PRESETS } from './src/utils/GradientPresets.js'
import { Patterns } from './src/utils/Patterns.js'

// State
let golEngine
let gradientRenderer
let paused = false

function setup() {
  createCanvas(800, 600)
  frameRate(60)

  // Create GoL background
  golEngine = new GoLEngine(80, 60, 10)
  golEngine.randomSeed(0.3)

  // Create SIMPLE gradient renderer
  gradientRenderer = new SimpleGradientRenderer(this)

  // Add patterns
  golEngine.setPattern(Patterns.GLIDER, 10, 10)
  golEngine.setPattern(Patterns.PULSAR, 40, 20)
  golEngine.setPattern(Patterns.LIGHTWEIGHT_SPACESHIP, 60, 40)

  console.log('Simple gradient renderer initialized')
}

function draw() {
  background(255)

  // Update GoL
  if (!paused && frameCount % 6 === 0) {
    golEngine.update()
  }

  // Render with gradient (NO ANIMATION - static gradient)
  const preset = GRADIENT_PRESETS.PLAYER
  gradientRenderer.renderMaskedGrid(
    golEngine,
    0,
    0,
    10, // cellSize
    preset
  )

  // Show FPS
  fill(0)
  noStroke()
  textSize(20)
  textAlign(RIGHT, TOP)
  text(`FPS: ${frameRate().toFixed(1)}`, width - 20, 20)

  // Info
  fill(0)
  textAlign(LEFT, TOP)
  textSize(16)
  text('SIMPLE GRADIENT (KISS)', 20, 20)
  text('Static gradient, pre-rendered, cached', 20, 45)
  text(`Gen: ${golEngine.generation}`, 20, 70)

  if (paused) {
    fill(255, 0, 0)
    textAlign(CENTER, CENTER)
    textSize(48)
    text('PAUSED', width/2, height/2)
  }
}

function keyPressed() {
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
}

// Make global for p5.js
window.setup = setup
window.draw = draw
window.keyPressed = keyPressed
