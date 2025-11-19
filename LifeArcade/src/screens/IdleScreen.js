/**
 * IdleScreen.v2 - Idle/Attract screen with centered text (Figma design)
 *
 * Clean white background with centered title and prompt
 * Advances on any key press
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class IdleScreen {
  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM elements
    this.element = null
    this.titleElement = null
    this.promptElement = null

    // Animation state
    this.isActive = false

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create and display idle screen
   */
  show() {
    console.log('IdleScreen: Show')
    this.isActive = true

    // Calculate responsive dimensions
    const aspectRatio = 1200 / 1920  // 0.625 (10:16 portrait)
    const containerHeight = window.innerHeight
    const containerWidth = Math.floor(containerHeight * aspectRatio)

    // Create main container
    this.element = document.createElement('div')
    this.element.id = 'idle-screen'
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
      flex-direction: column;
      justify-content: center;
      align-items: center;
      overflow: hidden;
      z-index: 100;
    `

    // Create title container
    const titleContainer = document.createElement('div')
    titleContainer.style.cssText = `
      width: clamp(300px, 61%, 732px);
      min-height: clamp(200px, 24.3vh, 467px);
      display: flex;
      justify-content: center;
      align-items: center;
      margin-bottom: clamp(20px, 5vh, 96px);
    `

    // Create title element
    this.titleElement = document.createElement('div')
    this.titleElement.textContent = "Conway's\nArcade"
    this.titleElement.style.cssText = `
      width: 100%;
      text-align: center;
      color: #202124;
      font-size: clamp(48px, 7vh, 134px);
      font-family: 'Google Sans', sans-serif;
      font-weight: 500;
      line-height: 1;
      white-space: pre-line;
      word-wrap: break-word;
    `

    titleContainer.appendChild(this.titleElement)

    // Create prompt container
    const promptContainer = document.createElement('div')
    promptContainer.style.cssText = `
      width: clamp(300px, 53.5%, 642px);
      min-height: clamp(80px, 11.5vh, 221px);
      display: flex;
      justify-content: center;
      align-items: center;
    `

    // Create prompt element
    this.promptElement = document.createElement('div')
    this.promptElement.textContent = 'Press any key to start'
    this.promptElement.style.cssText = `
      width: 100%;
      text-align: center;
      color: #7D7D7D;
      font-size: clamp(24px, 2.9vh, 55px);
      font-family: 'Google Sans', sans-serif;
      font-weight: 500;
      line-height: 1;
      word-wrap: break-word;
    `

    promptContainer.appendChild(this.promptElement)

    // Append all elements
    this.element.appendChild(titleContainer)
    this.element.appendChild(promptContainer)
    document.body.appendChild(this.element)

    // Listen for any key press
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('IdleScreen: Active')
  }

  /**
   * Hide screen - Clean up and remove elements
   */
  hide() {
    console.log('IdleScreen: Hide')
    this.isActive = false

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element)
    }

    // Clear references
    this.element = null
    this.titleElement = null
    this.promptElement = null

    console.log('IdleScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Any key advances to Welcome screen
    console.log(`IdleScreen: Key "${key}" pressed - advancing to Welcome`)
    this.appState.transition('welcome')
  }
}
