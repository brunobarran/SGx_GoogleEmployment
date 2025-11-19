/**
 * QRCodeScreen v2 - Thank you screen with QR code (Figma design)
 *
 * Title: "Thank you LFC for playing Conway's Arcade!"
 * QR Code: Centered with blur circle background
 * Decorations: GoL patterns in corners
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
   * Show screen - Display QR code and thank you message
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

    // Calculate responsive dimensions
    const aspectRatio = 1200 / 1920  // 0.625 (10:16 portrait)
    const containerHeight = window.innerHeight
    const containerWidth = Math.floor(containerHeight * aspectRatio)

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
      z-index: 100;
      animation: fadeIn 0.5s ease-in;
      overflow: hidden;
    `

    this.element.innerHTML = `
      <div class="qr-container">
        <!-- Title at top -->
        <div class="qr-title-wrapper">
          <div class="qr-title">
            <span class="qr-title-text">Thank you </span><span class="qr-title-highlight">LFC</span><span class="qr-title-text"> for playing<br/>Conway's Arcade!</span>
          </div>
        </div>

        <!-- Center section with QR -->
        <div class="qr-center">
          <!-- Scan prompt above QR -->
          <div class="qr-scan-prompt">Scan to create your game</div>

          <!-- QR Code with blur circle -->
          <div class="qr-code-wrapper">
            <div class="qr-blur-circle"></div>
            <img src="./img/qr.png" alt="QR Code" class="qr-code-image" />
          </div>
        </div>

        <!-- Corner decorations (GoL patterns) -->
        <div class="qr-decoration qr-decoration-top-left"></div>
        <div class="qr-decoration qr-decoration-top-right"></div>
        <div class="qr-decoration qr-decoration-bottom-left"></div>
        <div class="qr-decoration qr-decoration-bottom-right"></div>
      </div>
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('qr-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'qr-screen-styles'
      style.textContent = `
        .qr-container {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          font-family: 'Google Sans', Arial, sans-serif;
          padding: clamp(60px, 6vh, 115px) clamp(45px, 7.7vw, 92px);
        }

        .qr-title-wrapper {
          width: 100%;
          max-width: clamp(500px, 84.7vw, 1016px);
          margin-bottom: 0;
          flex-shrink: 0;
        }

        .qr-title {
          font-size: clamp(36px, 4.43vh, 85px);
          font-weight: 500;
          line-height: 1.1;
          text-align: left;
        }

        .qr-title-text {
          color: #202124;
        }

        .qr-title-highlight {
          color: #FF5145;
        }

        .qr-center {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          flex: 1;
          width: 100%;
          gap: clamp(20px, 3vh, 60px);
        }

        .qr-scan-prompt {
          font-size: clamp(24px, 2.86vh, 55px);
          font-weight: 500;
          color: #7D7D7D;
          text-align: center;
          line-height: 1;
          margin: 0;
          padding: 0;
          background: transparent;
          z-index: 2;
        }

        .qr-code-wrapper {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          width: clamp(280px, 48vw, 577px);
          height: clamp(280px, 29.8vh, 572px);
        }

        .qr-blur-circle {
          position: absolute;
          width: clamp(350px, 61.8vw, 741px);
          height: clamp(350px, 38.6vh, 741px);
          border-radius: 50%;
          background: radial-gradient(circle, rgba(66, 133, 244, 0.15) 0%, rgba(66, 133, 244, 0.05) 50%, rgba(255, 255, 255, 0) 100%);
          filter: blur(40px);
          z-index: 1;
        }

        .qr-code-image {
          position: relative;
          width: 100%;
          height: 100%;
          object-fit: contain;
          z-index: 2;
        }

        /* Corner decorations */
        .qr-decoration {
          position: absolute;
          background: #E8E8E8;
          opacity: 0.6;
          border-radius: 8px;
        }

        .qr-decoration-top-left {
          width: clamp(40px, 7vw, 84px);
          height: clamp(20px, 2vh, 38px);
          left: clamp(56px, 9.4vw, 113px);
          top: clamp(242px, 24.2vh, 465px);
        }

        .qr-decoration-top-right {
          width: clamp(40px, 7vw, 84px);
          height: clamp(36px, 3.8vh, 73px);
          right: clamp(90px, 15vw, 182px);
          top: clamp(148px, 14.8vh, 285px);
        }

        .qr-decoration-bottom-left {
          width: clamp(100px, 17.3vw, 208px);
          height: clamp(121px, 12.1vh, 232px);
          left: clamp(151px, 25.3vw, 303px);
          bottom: clamp(171px, 17.1vh, 329px);
        }

        .qr-decoration-bottom-right {
          width: clamp(87px, 14.6vw, 175px);
          height: clamp(67px, 6.7vh, 129px);
          right: clamp(62px, 10.4vw, 125px);
          bottom: clamp(302px, 30.2vh, 583px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
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
