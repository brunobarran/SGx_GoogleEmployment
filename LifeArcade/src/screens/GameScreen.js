/**
 * GameScreen - Fullscreen iframe container for game
 *
 * Loads selected game in iframe
 * Listens for postMessage (Game Over)
 * Handles Escape key to exit early
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { getResponsiveDimensions } from '../installation/ScreenHelper.js'

export class GameScreen {
  /**
   * Maximum game time (30 minutes) before timeout
   */
  static MAX_GAME_TIME = 30 * 60 * 1000  // 30 minutes

  constructor(appState, inputManager, iframeComm, themeManager) {
    this.appState = appState
    this.inputManager = inputManager
    this.iframeComm = iframeComm
    this.themeManager = themeManager

    // DOM elements
    this.element = null
    this.iframe = null

    // Timeout handle
    this.gameTimeoutHandle = null

    // Game message handler (postMessage from iframe)
    this.gameMessageHandler = null

    // Theme observer handle
    this.themeObserverCleanup = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
    this.handleGameOver = this.handleGameOver.bind(this)
    this.handleThemeChange = this.handleThemeChange.bind(this)
  }

  /**
   * Show screen - Create iframe and load game
   */
  show() {
    console.log('GameScreen: Show')

    // Get selected game
    const game = this.appState.getState().selectedGame
    if (!game) {
      console.error('No game selected')
      this.appState.reset()
      return
    }

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'game-screen'

    // Calculate responsive dimensions (using ScreenHelper)
    const { containerWidth, containerHeight } = getResponsiveDimensions()

    // Create iframe
    this.iframe = document.createElement('iframe')

    // Add current theme to URL to prevent white flash on load
    const currentTheme = this.themeManager.getTheme()
    const separator = game.path.includes('?') ? '&' : '?'
    this.iframe.src = `${game.path}${separator}theme=${currentTheme}`

    this.iframe.tabIndex = 0  // Make iframe focusable
    this.iframe.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${containerWidth}px;
      height: ${containerHeight}px;
      max-width: 100vw;
      max-height: 100vh;
      aspect-ratio: 10 / 16;
      border: none;
      object-fit: contain;
      z-index: 100;
      container-type: size; /* Enable Container Queries */
    `

    // Auto-focus iframe when loaded so keyboard events work immediately
    this.iframe.onload = () => {
      try {
        // Focus iframe immediately (no delay needed - theme already applied via URL)
        this.iframe.focus()

        // Also focus the content window for better compatibility
        if (this.iframe.contentWindow) {
          this.iframe.contentWindow.focus()
        }

        // Simulate a click on the iframe to ensure it gets focus
        this.iframe.click()

        console.log('GameScreen: Iframe focused - keyboard events ready')
        console.log('GameScreen: Active element:', document.activeElement)

        // Note: Theme already applied via URL parameter (synchronous)
        // No need to send postMessage here - theme is set before first render
      } catch (error) {
        console.warn('GameScreen: Could not auto-focus iframe:', error)
      }
    }

    // Also focus on click
    this.iframe.addEventListener('click', () => {
      this.iframe.focus()
      if (this.iframe.contentWindow) {
        this.iframe.contentWindow.focus()
      }
    })

    // Add iframe to element
    this.element.appendChild(this.iframe)

    // Add element styles
    this.element.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: var(--bg-primary);
      z-index: 99;
      overflow: hidden;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Start listening for postMessage
    this.iframeComm.onGameOver(this.handleGameOver)
    this.iframeComm.startListening(GameScreen.MAX_GAME_TIME)

    // IMPORTANT: Stop InputManager from intercepting keys while game is active
    // This allows iframe to receive all keyboard events directly
    this.inputManager.stopListening()
    console.log('GameScreen: InputManager disabled - iframe has full keyboard control')

    // Listen for postMessages from game-wrapper (exitGame, themeChangeFromGame)
    this.gameMessageHandler = (event) => {
      // Only accept messages from same origin
      if (event.origin !== window.location.origin) {
        return
      }

      // Handle exit game (Escape key from game-wrapper)
      if (event.data && event.data.type === 'exitGame') {
        console.log('GameScreen: Received exitGame message from iframe')
        this.exitToIdle()
        return
      }

      // Handle theme change from game (keys 1-8 from game-wrapper)
      if (event.data && event.data.type === 'themeChangeFromGame') {
        const theme = event.data.payload?.theme
        if (theme === 'day' || theme === 'night') {
          console.log(`GameScreen: Received themeChangeFromGame message - changing to ${theme}`)
          this.themeManager.setTheme(theme)
          // Note: ThemeManager will broadcast back to iframe, but that's OK (idempotent)
        }
        return
      }
    }
    window.addEventListener('message', this.gameMessageHandler)

    // Set game timeout
    this.gameTimeoutHandle = setTimeout(() => {
      console.warn('GameScreen: Game timeout reached (30 min)')
      this.exitToIdle()
    }, GameScreen.MAX_GAME_TIME)

    // Listen for theme changes and forward to game
    this.themeManager.addObserver(this.handleThemeChange)

    console.log(`GameScreen: Loading ${game.name}`)
  }

  /**
   * Handle theme change - Send to iframe
   * @param {string} theme - 'day' or 'night'
   */
  handleThemeChange(theme) {
    console.log(`GameScreen: Theme changed to ${theme} - notifying game`)
    this.sendThemeToGame(theme)
  }

  /**
   * Send theme to game via postMessage
   * @param {string} theme - 'day' or 'night'
   */
  sendThemeToGame(theme) {
    if (this.iframe && this.iframe.contentWindow) {
      this.iframe.contentWindow.postMessage({
        type: 'themeChange',
        payload: { theme }
      }, '*')
      console.log(`GameScreen: Sent theme "${theme}" to game`)
    }
  }

  /**
   * Hide screen - Clean up iframe and listeners
   */
  hide() {
    console.log('GameScreen: Hide')

    // Stop listening for postMessage
    this.iframeComm.stopListening()
    this.iframeComm.offGameOver(this.handleGameOver)

    // Stop listening for theme changes
    if (this.themeManager) {
      this.themeManager.removeObserver(this.handleThemeChange)
    }

    // Re-enable InputManager for other screens
    this.inputManager.startListening()
    console.log('GameScreen: InputManager re-enabled')

    // Remove game message listener (postMessage from iframe)
    if (this.gameMessageHandler) {
      window.removeEventListener('message', this.gameMessageHandler)
      this.gameMessageHandler = null
    }

    // Clear timeout
    if (this.gameTimeoutHandle) {
      clearTimeout(this.gameTimeoutHandle)
      this.gameTimeoutHandle = null
    }

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
      this.iframe = null
    }

    console.log('GameScreen: Cleaned up')
  }

  /**
   * Handle Game Over postMessage
   * @param {number|null} score - Final score (null if timeout)
   */
  handleGameOver(score) {
    console.log('GameScreen: Game Over received, score:', score)

    // If score is null (timeout), exit to idle
    if (score === null) {
      console.warn('GameScreen: No score received (timeout)')
      this.exitToIdle()
      return
    }

    // Validate score
    if (typeof score !== 'number' || score < 0) {
      console.error('GameScreen: Invalid score:', score)
      this.exitToIdle()
      return
    }

    // Store score in AppState
    this.appState.setScore(score)

    // Advance to Score Entry screen
    this.appState.transition('score')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Escape exits to Idle (no score)
    if (key === 'Escape') {
      console.log('GameScreen: Escape pressed - exiting to Idle')
      this.exitToIdle()
    }
  }

  /**
   * Exit to Idle (no score saved)
   */
  exitToIdle() {
    console.log('GameScreen: Exiting to Idle')
    this.appState.reset()
  }
}
