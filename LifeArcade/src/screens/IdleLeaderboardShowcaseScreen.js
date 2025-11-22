/**
 * IdleLeaderboardShowcaseScreen - Auto-display leaderboard during Idle inactivity
 *
 * Triggered after 2 minutes of inactivity on IdleScreen
 * Shows top 5 scores for a random game
 * Auto-closes after 20 seconds or on any key press
 *
 * NOT part of the 8-screen installation flow - this is a "floating" screen
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { getResponsiveDimensions } from '../installation/ScreenHelper.js'

export class IdleLeaderboardShowcaseScreen {
  /**
   * Auto-close timeout (20 seconds)
   */
  static AUTO_CLOSE_TIMEOUT = 20000

  /**
   * Available games (must match GalleryScreen.GAMES)
   */
  static AVAILABLE_GAMES = [
    { id: 'space-invaders', name: 'Gemini Invaders' },
    { id: 'dino-runner', name: 'GoL Runner' },
    { id: 'breakout', name: 'Cell Breaker' },
    { id: 'flappy-bird', name: 'Flappy Life' }
  ]

  constructor(appState, inputManager, storageManager, onCloseCallback) {
    this.appState = appState
    this.inputManager = inputManager
    this.storageManager = storageManager
    this.onCloseCallback = onCloseCallback

    // DOM elements
    this.element = null

    // State
    this.isActive = false
    this.selectedGame = null

    // Timer handle for auto-close
    this.autoCloseTimerHandle = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Select random game with saved scores
   * @returns {object|null} - Game object { id, name } or null
   */
  selectRandomGame() {
    // Filter to games with scores
    const gamesWithScores = IdleLeaderboardShowcaseScreen.AVAILABLE_GAMES.filter(game => {
      const scores = this.storageManager.getScores(game.id)
      return scores.length > 0
    })

    if (gamesWithScores.length === 0) {
      return null
    }

    // Select random
    const randomIndex = Math.floor(Math.random() * gamesWithScores.length)
    return gamesWithScores[randomIndex]
  }

  /**
   * Show screen - Select random game and display top 5
   */
  show() {
    console.log('IdleLeaderboardShowcaseScreen: Show')

    // Select random game with scores
    this.selectedGame = this.selectRandomGame()

    if (!this.selectedGame) {
      console.log('IdleLeaderboardShowcaseScreen: No games with scores - aborting')
      this.close()
      return
    }

    console.log('IdleLeaderboardShowcaseScreen: Showing', this.selectedGame.name)

    this.isActive = true

    // Create DOM
    this.createDOM()

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    // Set auto-close timer (20 seconds) - using native setTimeout
    this.autoCloseTimerHandle = setTimeout(() => {
      console.log('IdleLeaderboardShowcaseScreen: Auto-close timeout reached')
      this.close()
    }, IdleLeaderboardShowcaseScreen.AUTO_CLOSE_TIMEOUT)

    console.log('IdleLeaderboardShowcaseScreen: Active (20s auto-close)')
  }

  /**
   * Create DOM elements
   */
  createDOM() {
    const { containerWidth, containerHeight } = getResponsiveDimensions()

    // Main container (overlay on top of IdleScreen)
    this.element = document.createElement('div')
    this.element.id = 'idle-leaderboard-showcase'
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
      z-index: 200;
      animation: fadeIn 0.5s ease-in;
      overflow: hidden;
      container-type: size; /* Enable Container Queries */
    `

    // Title: "Top players of [Game Name]"
    const title = document.createElement('div')
    title.textContent = `Top players of ${this.selectedGame.name}`
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
      width: 90%;
    `

    // Table container
    const tableContainer = this.createTable()

    // Append
    this.element.appendChild(title)
    this.element.appendChild(tableContainer)
    document.body.appendChild(this.element)

    // Add styles
    this.addStyles()
  }

  /**
   * Create leaderboard table (top 5 only)
   */
  createTable() {
    const scores = this.storageManager.getScores(this.selectedGame.id).slice(0, 5)

    const container = document.createElement('div')
    container.style.cssText = `
      position: absolute;
      top: clamp(250px, 29.3cqh, 562px);
      left: 50%;
      transform: translateX(-50%);
      width: 70%;
      min-width: 300px;
      max-width: 820px;
    `

    // Headers
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

    // Rows
    const rowsContainer = document.createElement('div')
    rowsContainer.style.cssText = `
      display: flex;
      flex-direction: column;
    `

    if (scores.length > 0) {
      scores.forEach((entry, index) => {
        const row = this.createRow(entry, index + 1)
        rowsContainer.appendChild(row)
      })
    } else {
      const emptyMessage = document.createElement('div')
      emptyMessage.textContent = 'No scores yet'
      emptyMessage.style.cssText = `
        text-align: center;
        font-size: clamp(18px, 1.46cqh, 28px);
        color: #5f6368;
        padding: clamp(30px, 3.13cqh, 60px) 0;
        font-family: 'Google Sans Flex', sans-serif;
      `
      rowsContainer.appendChild(emptyMessage)
    }

    container.appendChild(headers)
    container.appendChild(rowsContainer)

    return container
  }

  /**
   * Create table row (rank 1 highlighted in black)
   * @param {object} entry - Score entry { name, score, date }
   * @param {number} rank - Rank number (1-5)
   */
  createRow(entry, rank) {
    // Highlight rank 1 (top player) in black
    const isTopPlayer = rank === 1

    const row = document.createElement('div')
    row.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: clamp(20px, 2.45cqh, 47px) clamp(10px, 1.56cqw, 30px);
      border-bottom: ${isTopPlayer ? '4px' : '3px'} solid ${isTopPlayer ? '#202124' : '#CACACA'};
    `

    // Rank
    const rankCol = document.createElement('div')
    rankCol.textContent = `${rank}`
    rankCol.style.cssText = `
      color: ${isTopPlayer ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    // Score
    const scoreCol = document.createElement('div')
    scoreCol.textContent = entry.score.toLocaleString()
    scoreCol.style.cssText = `
      color: ${isTopPlayer ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 1;
      text-align: center;
    `

    // Name
    const nameCol = document.createElement('div')
    nameCol.textContent = entry.name
    nameCol.style.cssText = `
      color: ${isTopPlayer ? '#202124' : '#CACACA'};
      font-size: clamp(32px, 3.65cqh, 70px);
      font-family: 'Google Sans Flex', sans-serif;
      font-weight: 500;
      line-height: 1;
      flex: 0 0 auto;
    `

    row.appendChild(rankCol)
    row.appendChild(scoreCol)
    row.appendChild(nameCol)

    return row
  }

  /**
   * Add CSS styles
   */
  addStyles() {
    if (document.getElementById('idle-showcase-styles')) return

    const style = document.createElement('style')
    style.id = 'idle-showcase-styles'
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      #idle-leaderboard-showcase {
        animation: fadeIn 0.5s ease-in;
      }
    `
    document.head.appendChild(style)
  }

  /**
   * Handle key press - ANY key closes showcase
   */
  handleKeyPress(key) {
    console.log('IdleLeaderboardShowcaseScreen: Key pressed - closing')
    this.close()
  }

  /**
   * Close showcase and return to IdleScreen
   */
  close() {
    console.log('IdleLeaderboardShowcaseScreen: Closing')
    this.hide()

    // Notify parent (IdleScreen) that we closed
    if (this.onCloseCallback) {
      this.onCloseCallback()
    }
  }

  /**
   * Hide screen - Clean up
   */
  hide() {
    console.log('IdleLeaderboardShowcaseScreen: Hide')
    this.isActive = false

    // Clear auto-close timer
    if (this.autoCloseTimerHandle) {
      clearTimeout(this.autoCloseTimerHandle)
      this.autoCloseTimerHandle = null
    }

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    console.log('IdleLeaderboardShowcaseScreen: Cleaned up')
  }
}
