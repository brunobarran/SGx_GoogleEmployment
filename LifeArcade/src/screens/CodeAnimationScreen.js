/**
 * CodeAnimationScreen - Code animation with typewriter effect
 *
 * Displays "GENERATING: {game-name}.js" header
 * Shows simple code snippet with typewriter animation
 * Auto-advances when complete (~3-5 seconds)
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class CodeAnimationScreen {
  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM elements
    this.element = null

    // Animation state
    this.currentText = ''
    this.targetText = ''
    this.currentChar = 0
    this.intervalHandle = null
    this.timeoutHandle = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create DOM and start typewriter animation
   */
  async show() {
    console.log('CodeAnimationScreen: Show')

    // Get selected game
    const game = this.appState.getState().selectedGame
    if (!game) {
      console.error('No game selected')
      this.appState.reset()
      return
    }

    // Load game code dynamically from .js file
    // Convert path from .html to .js (e.g., "games/space-invaders.html" -> "games/space-invaders.js")
    const jsPath = game.path.replace('.html', '.js')

    try {
      const response = await fetch(jsPath)
      if (!response.ok) {
        throw new Error(`Failed to load ${jsPath}`)
      }
      const fullText = await response.text()

      // Take only first 2000 characters for shorter animation
      this.targetText = fullText.substring(0, 2000)
    } catch (error) {
      console.error('Error loading game code:', error)
      this.targetText = `// Error loading game code\n// ${error.message}`
    }

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'code-screen'
    this.element.innerHTML = `
      <div class="code-container">
        <pre class="code-display"><code class="code-content"></code></pre>
      </div>
    `

    // Add styles
    this.element.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 1200px;
      height: 1920px;
      max-width: 100vw;
      max-height: 100vh;
      aspect-ratio: auto 1200 / 1920;
      background: #FFFFFF;
      z-index: 100;
      animation: fadeIn 0.3s ease-in;
      overflow: hidden;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('code-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'code-screen-styles'
      style.textContent = `
        .code-container {
          padding: 60px;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .code-display {
          margin: 0;
          padding: 0;
          flex: 1;
          overflow-y: auto;
          /* Hide scrollbar for all browsers */
          scrollbar-width: none; /* Firefox */
          -ms-overflow-style: none; /* IE and Edge */
        }

        .code-display::-webkit-scrollbar {
          display: none; /* Chrome, Safari, Opera */
        }

        .code-content {
          font-size: 20px;
          line-height: 1.8;
          color: #202124;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-weight: 400;
        }

        .code-content::after {
          content: '|';
          color: #4285F4;
          animation: blink 0.8s infinite;
          font-weight: 300;
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `
      document.head.appendChild(style)
    }

    // Start typewriter animation
    this.startTypewriter()

    // Listen for keys (allow skip with Space)
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('CodeAnimationScreen: Active')
  }

  /**
   * Hide screen - Stop animation and clean up
   */
  hide() {
    console.log('CodeAnimationScreen: Hide')

    // Stop animation
    if (this.intervalHandle) {
      clearInterval(this.intervalHandle)
      this.intervalHandle = null
    }

    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    // Reset state
    this.currentText = ''
    this.targetText = ''
    this.currentChar = 0

    console.log('CodeAnimationScreen: Cleaned up')
  }

  /**
   * Start typewriter animation
   */
  startTypewriter() {
    this.currentChar = 0
    this.currentText = ''

    // Update every 10ms (~100 chars/sec, similar to LLM streaming)
    this.intervalHandle = setInterval(() => {
      if (this.currentChar < this.targetText.length) {
        this.currentText += this.targetText[this.currentChar]
        this.currentChar++

        // Update display
        const codeContent = this.element.querySelector('.code-content')
        if (codeContent) {
          codeContent.textContent = this.currentText

          // Auto-scroll like MS-DOS terminal (keep bottom visible)
          const codeDisplay = this.element.querySelector('.code-display')
          if (codeDisplay) {
            // Scroll to bottom automatically as text is added
            codeDisplay.scrollTop = codeDisplay.scrollHeight
          }
        }
      } else {
        // Animation complete
        clearInterval(this.intervalHandle)
        this.intervalHandle = null

        // Auto-advance after 2 seconds (wait for user to see complete code)
        this.timeoutHandle = setTimeout(() => {
          this.advanceToGame()
        }, 2000)
      }
    }, 10)
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Space skips animation
    if (key === ' ') {
      console.log('CodeAnimationScreen: Space pressed - skipping animation')
      this.advanceToGame()
    }
    // Escape returns to Idle
    else if (key === 'Escape') {
      console.log('CodeAnimationScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }

  /**
   * Advance to Game screen
   */
  advanceToGame() {
    console.log('CodeAnimationScreen: Advancing to Game')
    this.appState.transition('game')
  }
}
