/**
 * GalleryScreen.v2 - 3D Carousel Prompt Library
 *
 * Horizontal 3D slider showing game prompts
 * Each game displays the AI prompt used to create it
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { getResponsiveDimensions } from '../installation/ScreenHelper.js'

export class GalleryScreen {
  // Games with their AI creation prompts
  static GAMES = [
    {
      id: 'space-invaders',
      name: 'Gemini Invaders',
      prompt: `Create a 2D arcade game that merges classic Space Invaders with Conway's Game of Life.

The player controls a ship at the bottom of the screen, moving left and right and firing a single projectile upwards to destroy "alien" cells.

The top 70% of the screen is a grid where the Game of Life simulation runs, acting as the enemy organism.

This simulation follows standard GoL rules (B3/S23) but updates at a slow, fixed "tick" rate (e.g., every 2 seconds). Aliens are represented by "live" cells in the grid.

When a bullet hits a live cell, it destroys that cell and potentially creates chain reactions based on GoL rules. The player wins by clearing all aliens (live cells) or loses if aliens reach the bottom.`,
      path: 'games/game-wrapper.html?game=space-invaders',
      key: '1'
    },
    {
      id: 'dino-runner',
      name: 'GoL Runner',
      prompt: `Design an endless runner game inspired by Chrome's Dino Game, but with a Game of Life twist.

The player character is a simple dino sprite that automatically runs forward. The player can only jump (spacebar) to avoid obstacles.

Obstacles are procedurally generated using Conway's Game of Life patterns - still lifes (blocks, beehives) as ground obstacles and spaceships (gliders, LWSS) as flying obstacles.

The background features parallax layers of GoL still life patterns that scroll at different speeds to create depth. Speed increases gradually over time.

Game ends when the player collides with any obstacle. Score is based on distance traveled and obstacles cleared.`,
      path: 'games/game-wrapper.html?game=dino-runner',
      key: '2'
    },
    {
      id: 'breakout',
      name: 'Cell Breaker',
      prompt: `Create a Breakout/Arkanoid style game where bricks are replaced with Conway's Game of Life patterns.

The player controls a paddle at the bottom that bounces a ball upward. The top portion contains a grid of "bricks" that are actually live cells in a GoL simulation.

When the ball hits a live cell, it destroys that cell, potentially causing chain reactions as the GoL rules apply on each tick. Some patterns (oscillators, still lifes) create interesting destruction cascades.

The paddle and ball physics follow traditional Breakout mechanics. Special "power-up" patterns (pulsars, penta-decathlons) drop when destroyed, granting temporary abilities.

Win condition: Clear all live cells. Lose condition: Ball falls below paddle three times.`,
      path: 'games/game-wrapper.html?game=breakout',
      key: '3'
    },
    {
      id: 'flappy-bird',
      name: 'Flappy Life',
      prompt: `Implement a Flappy Bird clone where the environment is generated using Game of Life principles.

The player controls a bird that falls due to gravity and flaps upward when spacebar is pressed. The bird must navigate through gaps between pipe pairs.

Pipes are decorated with GoL patterns (blinkers, toads) that animate according to B3/S23 rules, creating visual interest. The gap size and pipe spacing create a challenging rhythm.

Background features multiple parallax layers with GoL still life patterns (blocks, beehives, boats) scrolling at different speeds.

Score increases with each pipe successfully passed. Game ends on collision with pipes or ground. Difficulty increases by narrowing gaps over time.`,
      path: 'games/game-wrapper.html?game=flappy-bird',
      key: '4'
    }
  ]

  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM elements
    this.element = null
    this.cardsContainer = null

    // Carousel state
    this.currentIndex = 0
    this.isAnimating = false

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create 3D carousel
   */
  show() {
    console.log('GalleryScreen: Show')

    // Calculate responsive dimensions (using ScreenHelper)
    const { containerWidth, containerHeight } = getResponsiveDimensions()

    // Create main container
    this.element = document.createElement('div')
    this.element.id = 'gallery-screen'
    this.element.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      max-width: 100vw;
      max-height: 100vh;
      aspect-ratio: 10 / 16;
      background: #FFFFFF;
      z-index: 100;
      overflow: hidden;
    `

    // Create title
    const title = document.createElement('div')
    title.innerHTML = `<span style="font-family: 'Google Sans Mono', monospace; font-weight: 600;">Prompt Library</span>`
    title.style.cssText = `
      position: absolute;
      top: clamp(60px, 6.1vh, 117px);
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: #202124;
      font-size: clamp(32px, 3.65vh, 70px);
      font-weight: 500;
      line-height: 1;
      z-index: 10;
    `

    // Create carousel container
    this.cardsContainer = document.createElement('div')
    this.cardsContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 100%;
      height: clamp(400px, 52vh, 1000px);
      display: flex;
      align-items: center;
      justify-content: center;
      perspective: 2000px;
    `

    // Create cards
    GalleryScreen.GAMES.forEach((game, index) => {
      const card = this.createCard(game, index)
      this.cardsContainer.appendChild(card)
    })

    // Create navigation arrows
    const navContainer = document.createElement('div')
    navContainer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 88.4%;
      min-width: 500px;
      max-width: 1061px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 10;
      pointer-events: none;
    `

    const leftArrow = this.createArrow('left')
    const rightArrow = this.createArrow('right')

    // Add click handlers
    leftArrow.addEventListener('click', () => this.navigate('left'))
    rightArrow.addEventListener('click', () => this.navigate('right'))

    navContainer.appendChild(leftArrow)
    navContainer.appendChild(rightArrow)

    // Append all elements
    this.element.appendChild(title)
    this.element.appendChild(this.cardsContainer)
    this.element.appendChild(navContainer)
    document.body.appendChild(this.element)

    // Add styles
    this.addStyles()

    // Update carousel position
    this.updateCarousel(false)

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('GalleryScreen: Active')
  }

  /**
   * Create a carousel card
   */
  createCard(game, index) {
    const card = document.createElement('div')
    card.className = 'gallery-card'
    card.dataset.index = index

    // Card title
    const cardTitle = document.createElement('div')
    cardTitle.className = 'gallery-card-title'
    cardTitle.textContent = game.name
    cardTitle.style.cssText = `
      text-align: center;
      color: #7D7D7D;
      font-size: clamp(20px, 2.12vh, 40.67px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      margin-bottom: clamp(30px, 3.44vh, 66px);
    `

    // Prompt container with gradient overlay
    const promptContainer = document.createElement('div')
    promptContainer.className = 'gallery-card-prompt-container'
    promptContainer.style.cssText = `
      position: relative;
      max-height: clamp(300px, 31.25vh, 600px);
      overflow: hidden;
    `

    const promptText = document.createElement('div')
    promptText.className = 'gallery-card-prompt'
    promptText.textContent = game.prompt
    promptText.style.cssText = `
      text-align: justify;
      color: #202124;
      font-size: clamp(20px, 2.34vh, 45px);
      font-family: 'Google Sans Mono', monospace;
      font-weight: 500;
      line-height: 1;
      white-space: pre-line;
      word-wrap: break-word;
    `

    // Gradient overlay for fade effect
    const gradientOverlay = document.createElement('div')
    gradientOverlay.style.cssText = `
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: clamp(80px, 10.42vh, 200px);
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 1) 100%);
      pointer-events: none;
    `

    promptContainer.appendChild(promptText)
    promptContainer.appendChild(gradientOverlay)

    card.appendChild(cardTitle)
    card.appendChild(promptContainer)

    card.style.cssText = `
      position: absolute;
      width: 70%;
      min-width: 350px;
      max-width: 840px;
      padding: clamp(30px, 3.28vh, 63px) clamp(30px, 3.65vh, 70px) clamp(40px, 4.53vh, 87px) clamp(30px, 3.65vh, 70px);
      background: #FFFFFF;
      border-radius: clamp(18px, 1.82vh, 35px);
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15);
      transition: all 0.3s ease;
      transform-style: preserve-3d;
    `

    return card
  }

  /**
   * Create navigation arrow
   */
  createArrow(direction) {
    const arrow = document.createElement('img')
    arrow.className = `gallery-arrow gallery-arrow-${direction}`
    arrow.src = 'img/arrow.png'
    arrow.style.cssText = `
      height: clamp(50px, 6.05vh, 116.1px);
      cursor: pointer;
      pointer-events: auto;
      transition: filter 0.2s ease;
      filter: brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%);
      ${direction === 'left' ? 'transform: scaleX(-1);' : ''}
    `

    arrow.addEventListener('mouseenter', () => {
      // Google Blue #4285F4
      arrow.style.filter = 'brightness(0) saturate(100%) invert(42%) sepia(98%) saturate(1721%) hue-rotate(203deg) brightness(100%) contrast(95%)'
    })
    arrow.addEventListener('mouseleave', () => {
      // Gray #7D7D7D
      arrow.style.filter = 'brightness(0) saturate(100%) invert(50%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(85%)'
    })

    return arrow
  }

  /**
   * Add CSS styles
   */
  addStyles() {
    if (document.getElementById('gallery-v2-styles')) return

    const style = document.createElement('style')
    style.id = 'gallery-v2-styles'
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #gallery-screen {
        animation: fadeIn 0.3s ease-in;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Update carousel 3D positions
   */
  updateCarousel(animate = true) {
    const cards = this.cardsContainer.querySelectorAll('.gallery-card')

    cards.forEach((card, index) => {
      const offset = index - this.currentIndex

      // Center card
      if (offset === 0) {
        card.style.transform = 'translateX(-50%) scale(1) translateZ(0)'
        card.style.left = '50%'
        card.style.opacity = '1'
        card.style.zIndex = '3'
        card.style.pointerEvents = 'auto'
      }
      // Left card
      else if (offset === -1) {
        card.style.transform = 'translateX(-50%) scale(0.85) translateZ(-200px) rotateY(25deg)'
        card.style.left = '-5%'
        card.style.opacity = '0.35'
        card.style.zIndex = '2'
        card.style.pointerEvents = 'none'
      }
      // Right card
      else if (offset === 1) {
        card.style.transform = 'translateX(-50%) scale(0.85) translateZ(-200px) rotateY(-25deg)'
        card.style.left = '105%'
        card.style.opacity = '0.35'
        card.style.zIndex = '2'
        card.style.pointerEvents = 'none'
      }
      // Hidden cards
      else if (offset < -1) {
        card.style.transform = 'translateX(-50%) scale(0.7) translateZ(-400px)'
        card.style.left = `${-100 * Math.abs(offset)}%`
        card.style.opacity = '0'
        card.style.zIndex = '1'
        card.style.pointerEvents = 'none'
      }
      else {
        card.style.transform = 'translateX(-50%) scale(0.7) translateZ(-400px)'
        card.style.left = `${100 + 100 * offset}%`
        card.style.opacity = '0'
        card.style.zIndex = '1'
        card.style.pointerEvents = 'none'
      }

      if (!animate) {
        card.style.transition = 'none'
        setTimeout(() => {
          card.style.transition = 'all 0.3s ease'
        }, 50)
      }
    })
  }

  /**
   * Navigate carousel
   */
  navigate(direction) {
    if (this.isAnimating) return

    this.isAnimating = true

    if (direction === 'left') {
      this.currentIndex = Math.max(0, this.currentIndex - 1)
    } else if (direction === 'right') {
      this.currentIndex = Math.min(GalleryScreen.GAMES.length - 1, this.currentIndex + 1)
    }

    this.updateCarousel()

    setTimeout(() => {
      this.isAnimating = false
    }, 300)

    console.log(`GalleryScreen: Navigated to game ${this.currentIndex + 1}`)
  }

  /**
   * Hide screen
   */
  hide() {
    console.log('GalleryScreen: Hide')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
      this.cardsContainer = null
    }

    console.log('GalleryScreen: Cleaned up')
  }

  /**
   * Handle key press
   */
  handleKeyPress(key) {
    // Arrow navigation
    if (key === 'ArrowLeft') {
      this.navigate('left')
    } else if (key === 'ArrowRight') {
      this.navigate('right')
    }
    // Number keys for quick select
    else if (key >= '1' && key <= '4') {
      const index = parseInt(key) - 1
      if (index < GalleryScreen.GAMES.length) {
        this.currentIndex = index
        this.updateCarousel()
      }
    }
    // Space confirms selection
    else if (key === ' ') {
      this.confirmSelection()
    }
    // Escape returns to Idle
    else if (key === 'Escape') {
      console.log('GalleryScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }

  /**
   * Confirm selection and advance to Code Animation
   */
  confirmSelection() {
    const selectedGame = GalleryScreen.GAMES[this.currentIndex]
    console.log(`GalleryScreen: Confirmed selection - ${selectedGame.name}`)

    // Store selected game in AppState
    this.appState.setGame(selectedGame)

    // Advance to Code Animation screen
    this.appState.transition('code')
  }
}
