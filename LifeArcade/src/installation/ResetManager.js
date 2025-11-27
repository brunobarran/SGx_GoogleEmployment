/**
 * ResetManager - Global reset system with visual feedback
 *
 * Two reset levels:
 * - Soft Reset (N for 3s): Clear session, keep localStorage
 * - Hard Reset (N+M for 10s): Clear localStorage completely + session
 *
 * @author Game of Life Arcade
 * @license ISC
 */

import { debugLog, debugError } from '../utils/Logger.js'

export class ResetManager {
  /**
   * Reset configuration
   */
  static CONFIG = {
    SOFT_DURATION: 3000,   // 3 seconds
    HARD_DURATION: 10000,  // 10 seconds
    KEY_N: 'm',  // Primary reset key (M for soft reset) - INVERTED
    KEY_M: 'n'   // Secondary key (M+N for hard reset) - INVERTED
  }

  /**
   * Initialize reset manager
   * @param {InputManager} inputManager - Keyboard input manager
   * @param {AppState} appState - Application state manager
   * @param {StorageManager} storageManager - localStorage manager
   * @param {ResetCircleUI} resetCircleUI - Visual feedback component
   */
  constructor(inputManager, appState, storageManager, resetCircleUI) {
    if (!inputManager || !appState || !storageManager || !resetCircleUI) {
      throw new Error('ResetManager: Missing required dependencies')
    }

    this.inputManager = inputManager
    this.appState = appState
    this.storageManager = storageManager
    this.resetCircleUI = resetCircleUI

    // Reset state
    this.isResetting = false
    this.resetType = null        // 'soft' | 'hard' | null
    this.startTime = null        // Timestamp when reset started
    this.requiredDuration = null // Duration required (3000 or 10000)
    this.animationFrameId = null // requestAnimationFrame ID

    // Bind methods
    this.handleKeyDown = this.handleKeyDown.bind(this)
    this.handleKeyUp = this.handleKeyUp.bind(this)
    this.updateProgress = this.updateProgress.bind(this)

    debugLog('ResetManager: Initialized')
  }

  /**
   * Start listening for reset key combinations
   */
  startListening() {
    // Listen to keydown directly on window (works even when InputManager is stopped)
    // NOTE: Does NOT work in GameScreen when iframe has focus (events don't propagate from iframe)
    window.addEventListener('keydown', this.handleKeyDown)
    window.addEventListener('keyup', this.handleKeyUp)

    debugLog('ResetManager: Listening for M and M+N combinations')
  }

  /**
   * Stop listening for reset keys
   */
  stopListening() {
    window.removeEventListener('keydown', this.handleKeyDown)
    window.removeEventListener('keyup', this.handleKeyUp)

    // Cancel any active reset
    if (this.isResetting) {
      this.cancel()
    }

    debugLog('ResetManager: Stopped listening')
  }

  /**
   * Handle key down event
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    const key = event.key
    const keyLower = key.toLowerCase()

    // Only N or M keys can initiate reset
    if (keyLower !== ResetManager.CONFIG.KEY_N && keyLower !== ResetManager.CONFIG.KEY_M) {
      return
    }

    // Check if M is pressed (INVERTED: M is now reset key)
    const nPressed = this.inputManager.isPressed('m') || this.inputManager.isPressed('M') ||
                     keyLower === 'm'
    const mPressed = this.inputManager.isPressed('n') || this.inputManager.isPressed('N') ||
                     keyLower === 'n'

    // Determine reset type
    let newResetType = null

    if (nPressed && mPressed) {
      // Hard reset: N + M (allowed on all screens except GameScreen)
      newResetType = 'hard'
    } else if (nPressed && !mPressed) {
      // Soft reset: N only (NOT allowed on IdleScreen)
      const currentScreen = this.appState.getState().currentScreen
      if (currentScreen === 'idle') {
        return // Ignore soft reset on IdleScreen
      }
      newResetType = 'soft'
    } else {
      // M pressed first (without N) → ignore (M is now action key)
      return
    }

    // If already resetting, check if type changed
    if (this.isResetting) {
      if (this.resetType !== newResetType) {
        // Type changed (soft → hard), restart
        debugLog(`ResetManager: Transition ${this.resetType} → ${newResetType}`)
        this.cancel()
        this.startReset(newResetType)
      }
      // Same type, already running, do nothing
      return
    }

    // Start new reset
    this.startReset(newResetType)
  }

  /**
   * Handle key up event
   * @param {KeyboardEvent} event
   */
  handleKeyUp(event) {
    const key = event.key.toLowerCase()

    // Only care about N or M
    if (key !== ResetManager.CONFIG.KEY_N && key !== ResetManager.CONFIG.KEY_M) {
      return
    }

    // If not resetting, ignore
    if (!this.isResetting) {
      return
    }

    // Check if required keys are still pressed (INVERTED)
    const nPressed = this.inputManager.isPressed('m') || this.inputManager.isPressed('M')
    const mPressed = this.inputManager.isPressed('n') || this.inputManager.isPressed('N')

    // Soft reset: requires N only
    if (this.resetType === 'soft' && !nPressed) {
      debugLog('ResetManager: Soft reset canceled (N released)')
      this.cancel()
      return
    }

    // Hard reset: requires both N and M
    if (this.resetType === 'hard' && (!nPressed || !mPressed)) {
      debugLog('ResetManager: Hard reset canceled (N or M released)')
      this.cancel()
      return
    }
  }

  /**
   * Start reset timer and animation
   * @param {string} type - 'soft' or 'hard'
   */
  startReset(type) {
    this.isResetting = true
    this.resetType = type
    this.startTime = Date.now()
    this.requiredDuration = type === 'soft'
      ? ResetManager.CONFIG.SOFT_DURATION
      : ResetManager.CONFIG.HARD_DURATION

    // Show circle UI
    this.resetCircleUI.show(type, 0)

    // Start animation loop
    this.updateProgress()

    debugLog(`ResetManager: Started ${type} reset (${this.requiredDuration}ms)`)
  }

  /**
   * Update progress animation (called via requestAnimationFrame)
   */
  updateProgress() {
    if (!this.isResetting) {
      return
    }

    // Check if required keys are still pressed (INVERTED)
    const nPressed = this.inputManager.isPressed('m') || this.inputManager.isPressed('M')
    const mPressed = this.inputManager.isPressed('n') || this.inputManager.isPressed('N')

    // Cancel if required keys released
    if (this.resetType === 'soft' && !nPressed) {
      debugLog('ResetManager: Soft reset canceled (N released)')
      this.cancel()
      return
    }

    if (this.resetType === 'hard' && (!nPressed || !mPressed)) {
      debugLog('ResetManager: Hard reset canceled (N or M released)')
      this.cancel()
      return
    }

    const elapsed = Date.now() - this.startTime
    const progress = Math.min(elapsed / this.requiredDuration, 1)

    // Update UI
    this.resetCircleUI.updateProgress(progress)

    // Check if complete
    if (progress >= 1) {
      debugLog(`ResetManager: ${this.resetType} reset completed`)
      this.executeReset()
      return
    }

    // Continue animation
    this.animationFrameId = requestAnimationFrame(this.updateProgress)
  }

  /**
   * Execute the appropriate reset action
   */
  executeReset() {
    const type = this.resetType

    // Cancel animation
    this.cancel()

    // Execute based on type
    if (type === 'soft') {
      this.softReset()
    } else if (type === 'hard') {
      this.hardReset()
    }
  }

  /**
   * Soft Reset: Clear session, keep localStorage
   */
  softReset() {
    debugLog('ResetManager: Executing SOFT RESET')
    debugLog('- Clearing session data')
    debugLog('- Keeping localStorage')
    debugLog('- Transitioning to Idle screen')

    // Clear session via AppState
    this.appState.reset()

    debugLog('ResetManager: Soft reset complete')
  }

  /**
   * Hard Reset: Clear localStorage completely + session
   */
  hardReset() {
    debugLog('ResetManager: Executing HARD RESET')
    debugLog('- Clearing ALL localStorage')
    debugLog('- Clearing session data')
    debugLog('- Transitioning to Idle screen')

    // Clear localStorage
    try {
      localStorage.clear()
      debugLog('ResetManager: localStorage cleared')
    } catch (error) {
      debugError('ResetManager: Failed to clear localStorage:', error)
    }

    // Clear session via AppState
    this.appState.reset()

    debugLog('ResetManager: Hard reset complete')
  }

  /**
   * Cancel ongoing reset
   */
  cancel() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId)
      this.animationFrameId = null
    }

    this.resetCircleUI.hide()

    this.isResetting = false
    this.resetType = null
    this.startTime = null
    this.requiredDuration = null

    debugLog('ResetManager: Reset canceled')
  }

  /**
   * Get current reset state
   * @returns {object} - { type, progress, isResetting }
   */
  getResetState() {
    if (!this.isResetting) {
      return {
        type: null,
        progress: 0,
        isResetting: false
      }
    }

    const elapsed = Date.now() - this.startTime
    const progress = Math.min(elapsed / this.requiredDuration, 1)

    return {
      type: this.resetType,
      progress: progress,
      isResetting: true
    }
  }

  /**
   * Cleanup and destroy
   */
  destroy() {
    this.stopListening()
    this.resetCircleUI.destroy()
    debugLog('ResetManager: Destroyed')
  }
}
