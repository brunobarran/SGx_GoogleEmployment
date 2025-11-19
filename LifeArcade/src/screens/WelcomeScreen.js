/**
 * WelcomeScreen - Welcome/Title screen
 *
 * Displays title and "Press SPACE to start" prompt
 * Pure HTML/CSS, no p5.js
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class WelcomeScreen {
  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM element
    this.element = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create DOM and add event listeners
   */
  show() {
    console.log('WelcomeScreen: Show')

    // Calculate responsive dimensions
    const aspectRatio = 1200 / 1920  // 0.625 (10:16 portrait)
    const containerHeight = window.innerHeight
    const containerWidth = Math.floor(containerHeight * aspectRatio)

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'welcome-screen'
    this.element.innerHTML = `
      <div class="welcome-container">
        <h1 class="welcome-title">GAME OF LIFE ARCADE</h1>
        <p class="welcome-subtitle">Conway's Cellular Automaton Games</p>
        <p class="welcome-prompt">Press SPACE to start</p>
      </div>
    `

    // Add styles with responsive dimensions
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
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 100;
      animation: fadeIn 0.5s ease-in;
      overflow: hidden;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS keyframes if not already added
    if (!document.getElementById('welcome-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'welcome-screen-styles'
      style.textContent = `
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .welcome-container {
          text-align: center;
          font-family: 'Google Sans', Arial, sans-serif;
        }

        .welcome-title {
          font-size: clamp(24px, 3.33vh, 64px);
          font-weight: 700;
          color: #4285F4;
          margin: 0 0 clamp(8px, 1.04vh, 20px) 0;
          letter-spacing: 2px;
        }

        .welcome-subtitle {
          font-size: clamp(14px, 1.25vh, 24px);
          color: #5f6368;
          margin: 0 0 clamp(24px, 3.13vh, 60px) 0;
          font-weight: 400;
        }

        .welcome-prompt {
          font-size: clamp(16px, 1.46vh, 28px);
          color: #5f6368;
          margin: 0;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `
      document.head.appendChild(style)
    }

    // Listen for Space key
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('WelcomeScreen: Active')
  }

  /**
   * Hide screen - Remove DOM and event listeners
   */
  hide() {
    console.log('WelcomeScreen: Hide')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    console.log('WelcomeScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Space key advances to Gallery screen
    if (key === ' ') {
      console.log('WelcomeScreen: Space pressed - advancing to Gallery')
      this.appState.transition('gallery')
    }
    // Escape returns to Idle
    else if (key === 'Escape') {
      console.log('WelcomeScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }
}
