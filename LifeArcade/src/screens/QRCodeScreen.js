/**
 * QRCodeScreen - QR code display for web version
 *
 * Header: "PLAY ON THE WEB"
 * QR Code: Large, centered (placeholder for now)
 * URL: Display below QR code
 * Auto-timeout: 15 seconds to Idle
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class QRCodeScreen {
  /**
   * Auto-advance timeout (15 seconds)
   */
  static AUTO_TIMEOUT = 15000

  /**
   * Base URL for web version
   * TODO: Update with actual deployment URL
   */
  static BASE_URL = 'http://localhost:5173/games/'

  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM element
    this.element = null

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Display QR code and URL
   */
  show() {
    console.log('QRCodeScreen: Show')

    // Get selected game
    const state = this.appState.getState()
    const game = state.selectedGame

    if (!game) {
      console.error('No game selected')
      this.appState.reset()
      return
    }

    // Generate URL
    const gameUrl = QRCodeScreen.BASE_URL + game.id + '.html'

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'qr-screen'
    this.element.innerHTML = `
      <div class="qr-container">
        <h1 class="qr-title">PLAY ON THE WEB</h1>
        <div class="qr-placeholder">
          <div class="qr-icon">
            <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
              <rect x="20" y="20" width="70" height="70" fill="#4285F4"/>
              <rect x="110" y="20" width="70" height="70" fill="#EA4335"/>
              <rect x="20" y="110" width="70" height="70" fill="#34A853"/>
              <rect x="110" y="110" width="70" height="70" fill="#FBBC04"/>
              <rect x="50" y="50" width="10" height="10" fill="white"/>
              <rect x="140" y="50" width="10" height="10" fill="white"/>
              <rect x="50" y="140" width="10" height="10" fill="white"/>
              <rect x="140" y="140" width="10" height="10" fill="white"/>
            </svg>
          </div>
          <p class="qr-note">QR Code generation available in production</p>
        </div>
        <div class="qr-url-box">
          <p class="qr-url-label">Game URL:</p>
          <p class="qr-url">${gameUrl}</p>
        </div>
        <p class="qr-footer">Scan with your phone • Press SPACE to restart • Auto-restart in 15s</p>
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
    if (!document.getElementById('qr-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'qr-screen-styles'
      style.textContent = `
        .qr-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          font-family: 'Google Sans', Arial, sans-serif;
          padding: 60px;
        }

        .qr-title {
          font-size: 56px;
          font-weight: 700;
          color: #4285F4;
          margin: 0 0 80px 0;
          letter-spacing: 3px;
        }

        .qr-placeholder {
          width: 400px;
          height: 400px;
          background: #f8f9fa;
          border: 4px solid #dadce0;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          margin-bottom: 60px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.1);
        }

        .qr-icon {
          margin-bottom: 20px;
        }

        .qr-note {
          font-size: 16px;
          color: #5f6368;
          margin: 0;
          font-style: italic;
        }

        .qr-url-box {
          background: #f8f9fa;
          border-radius: 12px;
          padding: 30px 40px;
          margin-bottom: 60px;
          max-width: 800px;
        }

        .qr-url-label {
          font-size: 20px;
          color: #5f6368;
          margin: 0 0 12px 0;
          font-weight: 600;
        }

        .qr-url {
          font-size: 24px;
          font-family: 'Consolas', 'Monaco', monospace;
          color: #4285F4;
          margin: 0;
          word-break: break-all;
          font-weight: 600;
        }

        .qr-footer {
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

    // Set auto-advance timeout to Idle (loop complete)
    this.appState.setTimeout(QRCodeScreen.AUTO_TIMEOUT, 'idle', 'qr-timeout')

    console.log('QRCodeScreen: Active (15s auto-advance to Idle)')
  }

  /**
   * Hide screen - Remove DOM and event listeners
   */
  hide() {
    console.log('QRCodeScreen: Hide')

    // Clear auto-advance timeout
    this.appState.clearTimeout('qr-timeout')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    // Reset AppState (loop complete)
    if (this.appState.currentScreen === 'idle') {
      this.appState.selectedGame = null
      this.appState.currentScore = null
      this.appState.playerName = null
    }

    console.log('QRCodeScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Space or Escape returns to Idle (restart loop)
    if (key === ' ' || key === 'Escape') {
      console.log('QRCodeScreen: Key pressed - returning to Idle')
      this.appState.reset()
    }
  }
}
