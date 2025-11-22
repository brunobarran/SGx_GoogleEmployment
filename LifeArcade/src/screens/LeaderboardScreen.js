/**
 * LeaderboardScreen.v2 - Top 5 scores display (Figma design)
 *
 * Clean table layout with emphasis on rank 1
 * Footer with navigation links
 * Auto-timeout: 30 seconds to QR screen
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { getResponsiveDimensions } from '../installation/ScreenHelper.js'

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

    // Footer navigation state
    this.selectedOption = 0  // 0 = Create game (default), 1 = Play again

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Display top 5 scores
   */
  show() {
    console.log('LeaderboardScreen: Show')

    // Get state
    const state = this.appState.getState()
    const game = state.selectedGame
    const playerName = state.playerName
    const playerScore = state.currentScore
    const playerTimestamp = state.scoreTimestamp

    if (!game) {
      console.error('No game selected')
      this.appState.reset()
      return
    }

    // Load scores and prepare display list
    const allScores = this.storageManager.getScores(game.id)

    console.log('LeaderboardScreen DEBUG:')
    console.log('- Total scores:', allScores.length)
    console.log('- Looking for player:', playerName, playerScore, playerTimestamp)
    console.log('- All scores:', JSON.stringify(allScores.map(e => ({ name: e.name, score: e.score, date: e.date })), null, 2))

    // Find player's rank (1-based) - match by name, score AND timestamp for exact identification
    const playerRank = allScores.findIndex(entry =>
      entry.name === playerName &&
      entry.score === playerScore &&
      entry.date === playerTimestamp
    ) + 1

    console.log('- Player rank:', playerRank)

    // Build display list (max 5 entries)
    let scores = []
    if (playerRank === 0 || playerRank <= 5) {
      // Player not in leaderboard OR in top 5 → show top 5 normally
      scores = allScores.slice(0, 5)
      console.log('- Showing top 5 normally')
    } else {
      // Player rank > 5 → show top 4 + player (replacing rank 5)
      scores = [
        ...allScores.slice(0, 4),
        { ...allScores[playerRank - 1], displayRank: playerRank }  // Show with real rank
      ]
      console.log('- Showing top 4 + player at rank', playerRank)
    }

    console.log('- Display scores:', JSON.stringify(scores.map(e => ({ name: e.name, score: e.score, rank: e.displayRank || '(index)' })), null, 2))

    // Calculate responsive dimensions (using ScreenHelper)
    const { containerWidth, containerHeight } = getResponsiveDimensions()

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'leaderboard-screen'
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
      animation: fadeIn 0.5s ease-in;
      overflow: hidden;
      container-type: size; /* Enable Container Queries */
    `

    // Create title
    const title = document.createElement('div')
    title.textContent = game.name
    title.style.cssText = `
      position: absolute;
      top: clamp(60px, 6.1cqh, 117px);
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      color: #202124;
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
    `

    // Create table container
    const tableContainer = document.createElement('div')
    tableContainer.style.cssText = `
      position: absolute;
      top: clamp(250px, 29.3cqh, 562px);
      left: 50%;
      transform: translateX(-50%);
      width: 70%;
      min-width: 300px;
      max-width: 820px;
    `

    // Create table headers
    const headers = document.createElement('div')
    headers.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 clamp(10px, 1.56cqw, 30px);
      margin-bottom: clamp(20px, 4.1cqh, 79px);
    `

    const headerRank = document.createElement('div')
    headerRank.textContent = 'Rank'
    headerRank.style.cssText = `
      color: #7D7D7D;
      font-size: clamp(20px, 2.34cqh, 45px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    const headerScore = document.createElement('div')
    headerScore.textContent = 'Score'
    headerScore.style.cssText = `
      color: #7D7D7D;
      font-size: clamp(20px, 2.34cqh, 45px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 1;
      text-align: center;
    `

    const headerPlayer = document.createElement('div')
    headerPlayer.textContent = 'Player'
    headerPlayer.style.cssText = `
      color: #7D7D7D;
      font-size: clamp(20px, 2.34cqh, 45px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    headers.appendChild(headerRank)
    headers.appendChild(headerScore)
    headers.appendChild(headerPlayer)

    // Create rows
    const rowsContainer = document.createElement('div')
    rowsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
    `

    if (scores.length > 0) {
      scores.forEach((entry, index) => {
        const row = this.createRow(entry, index, playerName, playerScore, playerTimestamp)
        rowsContainer.appendChild(row)
      })
    } else {
      const emptyMessage = document.createElement('div')
      emptyMessage.textContent = 'No scores yet - Be the first!'
      emptyMessage.style.cssText = `
        text-align: center;
        font-size: clamp(18px, 1.46cqh, 28px);
        color: #5f6368;
        padding: clamp(30px, 3.13cqh, 60px) 0;
        font-family: 'Google Sans Flex', sans-serif;
      `
      rowsContainer.appendChild(emptyMessage)
    }

    tableContainer.appendChild(headers)
    tableContainer.appendChild(rowsContainer)

    // Create footer with navigation links
    const footer = document.createElement('div')
    footer.style.cssText = `
      position: absolute;
      bottom: clamp(80px, 10cqh, 192px);
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      gap: clamp(20px, 3.3cqw, 40px);
      align-items: center;
      white-space: nowrap;
    `

    this.createGameLink = document.createElement('div')
    this.createGameLink.className = 'footer-option'
    this.createGameLink.textContent = 'Create game'
    this.createGameLink.style.cssText = `
      color: #7D7D7D;
      font-size: clamp(18px, 2.08cqh, 40px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      text-decoration: underline;
      line-height: 1;
      cursor: pointer;
      transition: color 0.2s ease;
    `
    this.createGameLink.addEventListener('click', () => {
      this.selectedOption = 0
      this.confirmSelection()
    })

    this.playAgainLink = document.createElement('div')
    this.playAgainLink.className = 'footer-option'
    this.playAgainLink.textContent = 'Play again'
    this.playAgainLink.style.cssText = `
      color: #7D7D7D;
      font-size: clamp(18px, 2.08cqh, 40px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      opacity: 0.4;
      cursor: pointer;
      transition: opacity 0.2s ease, color 0.2s ease;
    `
    this.playAgainLink.addEventListener('click', () => {
      this.selectedOption = 1
      this.confirmSelection()
    })

    footer.appendChild(this.createGameLink)
    footer.appendChild(this.playAgainLink)

    // Update selection visual
    this.updateFooterSelection()

    // Append all elements
    this.element.appendChild(title)
    this.element.appendChild(tableContainer)
    this.element.appendChild(footer)
    document.body.appendChild(this.element)

    // Add styles
    this.addStyles()

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    // Set auto-advance timeout
    this.appState.setTimeout(LeaderboardScreen.AUTO_TIMEOUT, 'qr', 'leaderboard-timeout')

    console.log('LeaderboardScreen: Active (30s auto-advance)')
  }

  /**
   * Create a table row
   */
  createRow(entry, index, playerName, playerScore, playerTimestamp) {
    // Only current player's row is highlighted (black + arrow)
    // Match by name, score AND timestamp to avoid highlighting duplicates
    const isPlayerRow = entry.name === playerName &&
      entry.score === playerScore &&
      entry.date === playerTimestamp

    // Use displayRank if present (for player outside top 4), otherwise use index + 1
    const displayRank = entry.displayRank || (index + 1)

    // Container with arrow indicator
    const rowContainer = document.createElement('div')
    rowContainer.style.cssText = `
      position: relative;
      display: flex;
      align-items: center;
    `

    // Arrow indicator (outside table)
    if (isPlayerRow) {
      const arrow = document.createElement('div')
      arrow.textContent = '▶'
      arrow.style.cssText = `
        position: absolute;
        left: clamp(-80px, -3.3cqw, -80px);
        color: #202124;
        font-size: clamp(32px, 3.65cqh, 70px);
        font-family: 'Google Sans Flex', sans-serif;
        font-weight: 500;
        line-height: 1;
      `
      rowContainer.appendChild(arrow)
    }

    // Table row
    const row = document.createElement('div')
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: clamp(20px, 2.45cqh, 47px) clamp(10px, 1.56cqw, 30px);
      border-bottom: ${isPlayerRow ? '4px' : '3px'} solid ${isPlayerRow ? '#202124' : '#7D7D7D'};
      flex: 1;
    `

    // Rank column
    const rankCol = document.createElement('div')
    rankCol.textContent = `${displayRank}`
    rankCol.style.cssText = `
      color: ${isPlayerRow ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    // Score column
    const scoreCol = document.createElement('div')
    scoreCol.textContent = entry.score.toLocaleString()
    scoreCol.style.cssText = `
      color: ${isPlayerRow ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 1;
      text-align: center;
    `

    // Name column
    const nameCol = document.createElement('div')
    nameCol.textContent = entry.name
    nameCol.style.cssText = `
      color: ${isPlayerRow ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    row.appendChild(rankCol)
    row.appendChild(scoreCol)
    row.appendChild(nameCol)

    rowContainer.appendChild(row)

    return rowContainer
  }

  /**
   * Add CSS styles
   */
  addStyles() {
    if (document.getElementById('leaderboard-v2-styles')) return

    const style = document.createElement('style')
    style.id = 'leaderboard-v2-styles'
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #leaderboard-screen {
        animation: fadeIn 0.3s ease-in;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Update footer selection visual
   */
  updateFooterSelection() {
    if (!this.createGameLink || !this.playAgainLink) return

    if (this.selectedOption === 0) {
      // Create game selected (left, default)
      this.createGameLink.style.textDecoration = 'underline'
      this.createGameLink.style.opacity = '1'
      this.playAgainLink.style.textDecoration = 'none'
      this.playAgainLink.style.opacity = '0.4'
    } else {
      // Play again selected (right)
      this.createGameLink.style.textDecoration = 'none'
      this.createGameLink.style.opacity = '0.4'
      this.playAgainLink.style.textDecoration = 'underline'
      this.playAgainLink.style.opacity = '1'
    }
  }

  /**
   * Confirm selected option
   */
  confirmSelection() {
    if (this.selectedOption === 0) {
      console.log('LeaderboardScreen: Create game selected - advancing to QR screen')
      this.appState.transition('qr')
    } else {
      console.log('LeaderboardScreen: Play again selected - going to gallery')
      this.appState.transition('gallery')
    }
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

    // Reset state
    this.selectedOption = 0
    this.createGameLink = null
    this.playAgainLink = null

    console.log('LeaderboardScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    console.log('LeaderboardScreen: Key pressed:', key, 'Current selection:', this.selectedOption)

    // Arrow keys navigate footer options
    if (key === 'ArrowLeft') {
      console.log('LeaderboardScreen: ArrowLeft - selecting Create game')
      this.selectedOption = 0  // Create game
      this.updateFooterSelection()
    } else if (key === 'ArrowRight') {
      console.log('LeaderboardScreen: ArrowRight - selecting Play again')
      this.selectedOption = 1  // Play again
      this.updateFooterSelection()
    }
    // Space confirms selected option
    else if (key === ' ') {
      console.log('LeaderboardScreen: Space pressed - confirming selection', this.selectedOption)
      this.confirmSelection()
    }
    // Escape returns to Idle
    else if (key === 'Escape') {
      console.log('LeaderboardScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }
}
