/**
 * IframeComm - iframe communication manager for Game Over events
 *
 * Handles postMessage communication from game iframes
 * Validates message format and triggers callbacks
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class IframeComm {
  /**
   * Expected message format from games:
   * { type: 'gameOver', payload: { score: number } }
   */
  static MESSAGE_TYPE = 'gameOver'

  /**
   * Default timeout (15 seconds) if no message received
   */
  static DEFAULT_TIMEOUT = 15000

  constructor() {
    // Game Over callbacks
    this.gameOverCallbacks = []

    // Timeout handle
    this.timeoutHandle = null

    // Bind event handler
    this.handleMessage = this.handleMessage.bind(this)

    // Not listening by default
    this.listening = false
  }

  /**
   * Start listening for postMessage events
   * @param {number} timeout - Optional timeout in milliseconds
   */
  startListening(timeout = IframeComm.DEFAULT_TIMEOUT) {
    if (this.listening) {
      console.warn('IframeComm already listening')
      return
    }

    window.addEventListener('message', this.handleMessage)
    this.listening = true

    // Set timeout
    if (timeout > 0) {
      this.timeoutHandle = setTimeout(() => {
        console.warn('IframeComm: Timeout - no gameOver message received')
        this.triggerTimeout()
      }, timeout)
    }

    console.log(`IframeComm: Listening for messages (timeout: ${timeout}ms)`)
  }

  /**
   * Stop listening for postMessage events
   */
  stopListening() {
    if (!this.listening) {
      return
    }

    window.removeEventListener('message', this.handleMessage)
    this.listening = false

    // Clear timeout
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }

    console.log('IframeComm: Stopped listening')
  }

  /**
   * Handle incoming postMessage
   * @param {MessageEvent} event
   */
  handleMessage(event) {
    // Validate message structure
    if (!event.data || typeof event.data !== 'object') {
      return  // Ignore invalid messages
    }

    const { type, payload } = event.data

    // Check if this is a gameOver message
    if (type !== IframeComm.MESSAGE_TYPE) {
      return  // Ignore other message types
    }

    // Validate payload
    if (!payload || typeof payload !== 'object') {
      console.error('Invalid gameOver payload:', payload)
      return
    }

    // Validate score
    if (typeof payload.score !== 'number' || payload.score < 0) {
      console.error('Invalid score in gameOver payload:', payload.score)
      return
    }

    console.log('IframeComm: Received gameOver message:', payload.score)

    // Clear timeout
    if (this.timeoutHandle) {
      clearTimeout(this.timeoutHandle)
      this.timeoutHandle = null
    }

    // Send acknowledgment back to game
    this.sendAcknowledgment(event.source)

    // Trigger callbacks
    this.triggerGameOverCallbacks(payload.score)

    // Stop listening (one message per session)
    this.stopListening()
  }

  /**
   * Send acknowledgment to game iframe
   * @param {Window} source - iframe window
   */
  sendAcknowledgment(source) {
    try {
      source.postMessage({
        type: 'acknowledged'
      }, '*')
      console.log('IframeComm: Sent acknowledgment to game')
    } catch (error) {
      console.error('Error sending acknowledgment:', error)
    }
  }

  /**
   * Register Game Over callback
   * @param {function} callback - Callback(score)
   */
  onGameOver(callback) {
    if (typeof callback !== 'function') {
      console.error('Callback must be a function')
      return
    }
    this.gameOverCallbacks.push(callback)
    console.log('IframeComm: Game Over callback registered')
  }

  /**
   * Remove Game Over callback
   * @param {function} callback - Callback to remove
   */
  offGameOver(callback) {
    const index = this.gameOverCallbacks.indexOf(callback)
    if (index > -1) {
      this.gameOverCallbacks.splice(index, 1)
    }
  }

  /**
   * Trigger all Game Over callbacks
   * @param {number} score - Final score
   */
  triggerGameOverCallbacks(score) {
    this.gameOverCallbacks.forEach(callback => {
      try {
        callback(score)
      } catch (error) {
        console.error('Game Over callback error:', error)
      }
    })
  }

  /**
   * Trigger timeout callbacks (no message received)
   */
  triggerTimeout() {
    console.log('IframeComm: Timeout triggered')

    // Trigger callbacks with null score to indicate timeout
    this.gameOverCallbacks.forEach(callback => {
      try {
        callback(null)
      } catch (error) {
        console.error('Game Over timeout callback error:', error)
      }
    })

    // Stop listening
    this.stopListening()
  }

  /**
   * Reset state and clear callbacks
   */
  reset() {
    this.stopListening()
    this.gameOverCallbacks = []
    console.log('IframeComm: Reset')
  }

  /**
   * Cleanup and remove event listeners
   */
  destroy() {
    this.stopListening()
    this.gameOverCallbacks = []
    console.log('IframeComm: Destroyed')
  }
}
