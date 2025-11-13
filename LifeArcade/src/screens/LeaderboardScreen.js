/**
 * LeaderboardScreen - Top 10 scores display
 *
 * Header: "{GAME_NAME} - TOP 10"
 * Table: Rank, Name, Score
 * Highlight: New entry (if just entered)
 * Auto-timeout: 30 seconds to QR screen
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class LeaderboardScreen {
  /**
   * Auto-advance timeout (30 seconds)
   */
  static AUTO_TIMEOUT = 30000

  constructor(appState, inputManager, storageManager) {
    this.appState = appState
    this.inputManager = inputManager
    this.storageManager = storageManager

    // DOM element
    this.element = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Display top 10 scores
   */
  show() {
    console.log('LeaderboardScreen: Show')

    // Get state
    const state = this.appState.getState()
    const game = state.selectedGame
    const playerName = state.playerName

    if (!game) {
      console.error('No game selected')
      this.appState.reset()
      return
    }

    // Load scores
    const scores = this.storageManager.getScores(game.id)

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'leaderboard-screen'
    this.element.innerHTML = `
      <div class="leaderboard-container">
        <h1 class="leaderboard-title">${game.name.toUpperCase()} - TOP 10</h1>
        <div class="leaderboard-table">
          <div class="leaderboard-header">
            <div class="leaderboard-col-rank">RANK</div>
            <div class="leaderboard-col-name">NAME</div>
            <div class="leaderboard-col-score">SCORE</div>
          </div>
          ${scores.length > 0 ? scores.map((entry, index) => `
            <div class="leaderboard-row ${entry.name === playerName ? 'highlight' : ''}">
              <div class="leaderboard-col-rank">${index + 1}</div>
              <div class="leaderboard-col-name">${entry.name === playerName ? '► ' + entry.name + ' ◄' : entry.name}</div>
              <div class="leaderboard-col-score">${entry.score.toLocaleString()}</div>
            </div>
          `).join('') : `
            <div class="leaderboard-empty">No scores yet - Be the first!</div>
          `}
        </div>
        <p class="leaderboard-footer">Press SPACE to continue (auto-advance in 30s)</p>
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
      overflow-y: auto;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('leaderboard-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'leaderboard-screen-styles'
      style.textContent = `
        .leaderboard-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 80px 50px;
          font-family: 'Google Sans', Arial, sans-serif;
        }

        .leaderboard-title {
          font-size: 48px;
          font-weight: 700;
          color: #4285F4;
          text-align: center;
          margin: 0 0 60px 0;
          letter-spacing: 2px;
        }

        .leaderboard-table {
          background: #f8f9fa;
          border-radius: 16px;
          padding: 40px;
          margin-bottom: 40px;
        }

        .leaderboard-header {
          display: grid;
          grid-template-columns: 100px 1fr 200px;
          gap: 20px;
          padding-bottom: 20px;
          border-bottom: 3px solid #dadce0;
          margin-bottom: 20px;
          font-size: 20px;
          font-weight: 700;
          color: #5f6368;
        }

        .leaderboard-row {
          display: grid;
          grid-template-columns: 100px 1fr 200px;
          gap: 20px;
          padding: 16px 0;
          border-bottom: 1px solid #e8eaed;
          font-size: 24px;
          transition: all 0.3s ease;
        }

        .leaderboard-row:last-child {
          border-bottom: none;
        }

        .leaderboard-row.highlight {
          background: #e8f0fe;
          border-radius: 8px;
          padding-left: 16px;
          padding-right: 16px;
          margin-left: -16px;
          margin-right: -16px;
          border-bottom: none;
          box-shadow: 0 2px 8px rgba(66, 133, 244, 0.3);
        }

        .leaderboard-col-rank {
          font-weight: 700;
          color: #4285F4;
        }

        .leaderboard-col-name {
          font-weight: 600;
          color: #202124;
        }

        .leaderboard-col-score {
          text-align: right;
          font-weight: 700;
          color: #34A853;
        }

        .leaderboard-row.highlight .leaderboard-col-name {
          color: #4285F4;
          font-weight: 700;
        }

        .leaderboard-empty {
          text-align: center;
          font-size: 28px;
          color: #5f6368;
          padding: 60px 0;
        }

        .leaderboard-footer {
          text-align: center;
          font-size: 24px;
          color: #5f6368;
          margin: 0;
        }
      `
      document.head.appendChild(style)
    }

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    // Set auto-advance timeout
    this.appState.setTimeout(LeaderboardScreen.AUTO_TIMEOUT, 'qr', 'leaderboard-timeout')

    console.log('LeaderboardScreen: Active (30s auto-advance)')
  }

  /**
   * Hide screen - Remove DOM and event listeners
   */
  hide() {
    console.log('LeaderboardScreen: Hide')

    // Clear auto-advance timeout
    this.appState.clearTimeout('leaderboard-timeout')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    console.log('LeaderboardScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Space advances to QR screen
    if (key === ' ') {
      console.log('LeaderboardScreen: Space pressed - advancing to QR')
      this.appState.transition('qr')
    }
    // Escape returns to Idle
    else if (key === 'Escape') {
      console.log('LeaderboardScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }
}
