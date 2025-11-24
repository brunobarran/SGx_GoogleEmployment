/**
 * CodeAnimationScreen v2 - Terminal-style code animation (Figma design)
 *
 * Displays LLM-style text generation with colored keywords
 * Dark terminal background (#33333E)
 * Rectangular blinking cursor
 * Auto-scrolls as text appears
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { getResponsiveDimensions } from '../installation/ScreenHelper.js'

// Import thinking text
import spaceInvadersThinking from '../../tests/games/space-invaders-thinking.txt?raw'
import dinoRunnerThinking from '../../tests/games/dino-runner-thinking.txt?raw'
import breakoutThinking from '../../tests/games/breakout-thinking.txt?raw'
import flappyBirdThinking from '../../tests/games/flappy-bird-thinking.txt?raw'

const THINKING_TEXTS = {
  'space-invaders': spaceInvadersThinking,
  'dino-runner': dinoRunnerThinking,
  'breakout': breakoutThinking,
  'flappy-bird': flappyBirdThinking
}

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

    // Mock text with colored keywords (from Figma)
    // Get thinking text for the selected game
    this.targetText = THINKING_TEXTS[game.id] || THINKING_TEXTS['space-invaders']

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'code-screen'
    this.element.innerHTML = `
      <div class="code-container">
        <div class="code-display">
          <div class="code-content"></div>
        </div>
      </div>
    `

    // Calculate responsive dimensions (using ScreenHelper)
    const { containerWidth, containerHeight } = getResponsiveDimensions()

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
      background: #33333E;
      z-index: 100;
      animation: fadeIn 0.3s ease-in;
      overflow: hidden;
      container-type: size; /* Enable Container Queries */
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('code-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'code-screen-styles'
      style.textContent = `
        .code-container {
          padding: clamp(80px, 10.3cqh, 198px) clamp(30px, 5cqw, 60px);
          font-family: 'Google Sans Mono', 'Consolas', 'Monaco', 'Courier New', monospace;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .code-display {
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
          font-size: clamp(18px, 2.34cqh, 45px);
          line-height: 1.2;
          color: #FFFFFF;
          white-space: pre-wrap;
          word-wrap: break-word;
          font-weight: 400;
        }

        .code-content .highlight {
          font-weight: 600;
        }

        .code-content .highlight.red {
          color: #FF5145;
        }

        .code-content .highlight.green {
          color: #38A952;
        }

        .code-content .highlight.blue {
          color: #438FF0;
        }

        .code-content .highlight.yellow {
          color: #F7B200;
        }

        .code-content .cursor {
          display: inline-block;
          width: 0.6em;
          height: 1em;
          background: #FFFFFF;
          animation: blink 0.8s infinite;
          vertical-align: text-bottom;
          margin-left: 2px;
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

    // Update every 20ms (~50 chars/sec, faster terminal effect)
    this.intervalHandle = setInterval(() => {
      if (this.currentChar < this.targetText.length) {
        const char = this.targetText[this.currentChar]

        // If we hit an opening tag, skip to the end of it instantly
        if (char === '<') {
          const closingBracket = this.targetText.indexOf('>', this.currentChar)
          if (closingBracket !== -1) {
            // Copy entire tag instantly (from < to >)
            this.currentText += this.targetText.substring(this.currentChar, closingBracket + 1)
            this.currentChar = closingBracket + 1
          } else {
            // No closing bracket found, just add the char
            this.currentText += char
            this.currentChar++
          }
        } else {
          // Normal character, add it
          this.currentText += char
          this.currentChar++
        }

        // Update display
        const codeContent = this.element.querySelector('.code-content')
        if (codeContent) {
          // Set HTML to preserve span tags for colored text
          codeContent.innerHTML = this.currentText + '<span class="cursor"></span>'

          // Auto-scroll like terminal (keep bottom visible)
          const codeDisplay = this.element.querySelector('.code-display')
          if (codeDisplay) {
            codeDisplay.scrollTop = codeDisplay.scrollHeight
          }
        }
      } else {
        // Animation complete
        clearInterval(this.intervalHandle)
        this.intervalHandle = null

        // Keep cursor blinking at end for 1 second, then remove and auto-advance
        this.timeoutHandle = setTimeout(() => {
          const codeContent = this.element.querySelector('.code-content')
          if (codeContent) {
            // Remove cursor
            codeContent.innerHTML = this.currentText
          }

          // Auto-advance after cursor disappears
          setTimeout(() => {
            this.advanceToGame()
          }, 500)
        }, 1000)
      }
    }, 15)
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
