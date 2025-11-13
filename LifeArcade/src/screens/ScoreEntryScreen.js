/**
 * ScoreEntryScreen - Arcade-style 3-letter name input
 *
 * Display: "GAME OVER" + Final Score
 * Input: 3 letter boxes (A-Z only)
 * Controls: ↑↓ to change, → to move, Space to confirm
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class ScoreEntryScreen {
  constructor(appState, inputManager, storageManager) {
    this.appState = appState
    this.inputManager = inputManager
    this.storageManager = storageManager

    // DOM element
    this.element = null

    // Name state
    this.letters = ['A', 'A', 'A']  // Start with AAA
    this.currentPosition = 0         // Current letter position (0-2)

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create DOM and add event listeners
   */
  show() {
    console.log('ScoreEntryScreen: Show')

    // Get score from AppState
    const state = this.appState.getState()
    const score = state.currentScore
    const game = state.selectedGame

    if (score === null || !game) {
      console.error('No score or game available')
      this.appState.reset()
      return
    }

    // Reset name state
    this.letters = ['A', 'A', 'A']
    this.currentPosition = 0

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'score-entry-screen'
    this.element.innerHTML = `
      <div class="score-entry-container">
        <h1 class="score-entry-title">GAME OVER</h1>
        <div class="score-entry-score">${score.toLocaleString()}</div>
        <p class="score-entry-prompt">ENTER YOUR NAME</p>
        <div class="score-entry-letters">
          ${this.letters.map((letter, index) => `
            <div class="score-entry-letter ${index === this.currentPosition ? 'active' : ''}">${letter}</div>
          `).join('')}
        </div>
        <p class="score-entry-instructions">↑↓: Change Letter • ←→: Navigate • SPACE: Confirm</p>
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
      animation: fadeIn 0.5s ease-in;
      overflow: hidden;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('score-entry-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'score-entry-screen-styles'
      style.textContent = `
        .score-entry-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-family: 'Google Sans', Arial, sans-serif;
        }

        .score-entry-title {
          font-size: 72px;
          font-weight: 700;
          color: #EA4335;
          margin: 0 0 40px 0;
          letter-spacing: 4px;
        }

        .score-entry-score {
          font-size: 96px;
          font-weight: 700;
          color: #4285F4;
          margin: 0 0 80px 0;
        }

        .score-entry-prompt {
          font-size: 32px;
          color: #5f6368;
          margin: 0 0 40px 0;
          font-weight: 600;
        }

        .score-entry-letters {
          display: flex;
          gap: 30px;
          margin-bottom: 60px;
        }

        .score-entry-letter {
          width: 120px;
          height: 160px;
          background: #f8f9fa;
          border: 4px solid #dadce0;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 96px;
          font-weight: 700;
          color: #202124;
          transition: all 0.3s ease;
        }

        .score-entry-letter.active {
          background: #e8f0fe;
          border-color: #4285F4;
          transform: scale(1.1);
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3);
        }

        .score-entry-instructions {
          font-size: 24px;
          color: #5f6368;
          margin: 0;
        }
      `
      document.head.appendChild(style)
    }

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('ScoreEntryScreen: Active')
  }

  /**
   * Hide screen - Remove DOM and event listeners
   */
  hide() {
    console.log('ScoreEntryScreen: Hide')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    console.log('ScoreEntryScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Arrow Up - Increment letter
    if (key === 'ArrowUp' || key === 'w' || key === 'W') {
      this.changeLetter(1)
    }
    // Arrow Down - Decrement letter
    else if (key === 'ArrowDown' || key === 's' || key === 'S') {
      this.changeLetter(-1)
    }
    // Arrow Right or Space - Move to next letter
    else if (key === 'ArrowRight' || key === ' ') {
      this.nextLetter()
    }
    // Arrow Left - Move to previous letter
    else if (key === 'ArrowLeft') {
      this.previousLetter()
    }
    // Escape - Return to Idle
    else if (key === 'Escape') {
      console.log('ScoreEntryScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }

  /**
   * Change current letter
   * @param {number} direction - 1 for next letter, -1 for previous
   */
  changeLetter(direction) {
    const currentLetter = this.letters[this.currentPosition]
    const currentCode = currentLetter.charCodeAt(0)

    // Calculate new letter (A=65, Z=90)
    let newCode = currentCode + direction

    // Wrap around
    if (newCode < 65) newCode = 90  // Wrap Z -> A
    if (newCode > 90) newCode = 65  // Wrap A -> Z

    // Update letter
    this.letters[this.currentPosition] = String.fromCharCode(newCode)

    // Update display
    this.updateDisplay()
  }

  /**
   * Move to next letter or confirm if all 3 entered
   */
  nextLetter() {
    if (this.currentPosition < 2) {
      // Move to next letter
      this.currentPosition++
      this.updateDisplay()
    } else {
      // All 3 letters entered - confirm
      this.confirmName()
    }
  }

  /**
   * Move to previous letter
   */
  previousLetter() {
    if (this.currentPosition > 0) {
      // Move to previous letter
      this.currentPosition--
      this.updateDisplay()
    }
  }

  /**
   * Update visual display
   */
  updateDisplay() {
    if (!this.element) return

    // Update letter boxes
    const letterElements = this.element.querySelectorAll('.score-entry-letter')
    letterElements.forEach((el, index) => {
      el.textContent = this.letters[index]
      if (index === this.currentPosition) {
        el.classList.add('active')
      } else {
        el.classList.remove('active')
      }
    })
  }

  /**
   * Confirm name and save score
   */
  confirmName() {
    const name = this.letters.join('')
    console.log(`ScoreEntryScreen: Confirmed name - ${name}`)

    // Store in AppState
    this.appState.setPlayerName(name)

    // Save score to localStorage
    const state = this.appState.getState()
    const success = this.storageManager.saveScore(
      state.selectedGame.id,
      name,
      state.currentScore
    )

    if (success) {
      console.log('Score saved successfully')
    } else {
      console.error('Failed to save score')
    }

    // Advance to Leaderboard
    this.appState.transition('leaderboard')
  }
}
