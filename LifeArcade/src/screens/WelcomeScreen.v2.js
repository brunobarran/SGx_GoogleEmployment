/**
 * WelcomeScreen v2 - Welcome/Title screen (Figma design)
 *
 * Displays title and colorful subtitle with cascade animation
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
        <h1 class="welcome-title">Welcome to<br/>Conway's Arcade</h1>
        <div class="welcome-subtitle">
          <span class="line line-1">This is where <span class="highlight green">prompts</span> become <span class="highlight yellow">games</span>,</span>
          <span class="line line-2">patterns become <span class="highlight red">play</span>, and AI</span>
          <span class="line line-3">becomes pure <span class="highlight blue">arcade energy</span>.</span>
        </div>
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
      align-items: flex-start;
      justify-content: flex-start;
      padding-top: clamp(48px, 5vh, 96px);
      z-index: 100;
      overflow: hidden;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS keyframes if not already added
    if (!document.getElementById('welcome-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'welcome-screen-styles'
      style.textContent = `
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .welcome-container {
          width: 100%;
          padding: 0 clamp(40px, 9vw, 108px);
          font-family: 'Google Sans', Arial, sans-serif;
        }

        .welcome-title {
          font-size: clamp(36px, 5vh, 95px);
          font-weight: 500;
          color: #202124;
          margin: 0 0 clamp(32px, 4vh, 76px) 0;
          line-height: 1;
          opacity: 0;
          animation: slideUp 0.8s ease-out 0.2s forwards;
        }

        .welcome-subtitle {
          font-size: clamp(36px, 5vh, 95px);
          font-weight: 500;
          line-height: 1;
          color: #202124;
          display: flex;
          flex-direction: column;
          gap: 0;
        }

        .welcome-subtitle .line {
          display: block;
          opacity: 0;
        }

        .welcome-subtitle .line-1 {
          animation: slideUp 0.8s ease-out 0.6s forwards;
        }

        .welcome-subtitle .line-2 {
          animation: slideUp 0.8s ease-out 0.9s forwards;
        }

        .welcome-subtitle .line-3 {
          animation: slideUp 0.8s ease-out 1.2s forwards;
        }

        .welcome-subtitle .highlight.green {
          color: #38A952;
        }

        .welcome-subtitle .highlight.yellow {
          color: #F7B200;
        }

        .welcome-subtitle .highlight.red {
          color: #FF5145;
        }

        .welcome-subtitle .highlight.blue {
          color: #438FF0;
        }
      `
      document.head.appendChild(style)
    }

    // Listen for any key
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
    // Any key advances to Gallery screen
    console.log('WelcomeScreen: Key pressed - advancing to Gallery')
    this.appState.transition('gallery')
  }
}
