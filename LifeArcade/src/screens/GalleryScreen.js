/**
 * GalleryScreen - Game selection gallery
 *
 * 2×4 grid of game tiles
 * Keyboard navigation: 1-4 for quick select, Arrows + Space
 *
 * @author Game of Life Arcade
 * @license ISC
 */

export class GalleryScreen {
  // Available games (only 4 games in project)
  static GAMES = [
    {
      id: 'space-invaders',
      name: 'Space Invaders',
      description: 'Classic alien shooter',
      path: 'games/game-wrapper.html?game=space-invaders',
      key: '1'
    },
    {
      id: 'dino-runner',
      name: 'Dino Runner',
      description: 'Endless obstacle jumper',
      path: 'games/game-wrapper.html?game=dino-runner',
      key: '2'
    },
    {
      id: 'breakout',
      name: 'Breakout',
      description: 'Brick breaking classic',
      path: 'games/game-wrapper.html?game=breakout',
      key: '3'
    },
    {
      id: 'flappy-bird',
      name: 'Flappy Bird',
      description: 'Tap to fly through pipes',
      path: 'games/game-wrapper.html?game=flappy-bird',
      key: '4'
    }
  ]

  constructor(appState, inputManager) {
    this.appState = appState
    this.inputManager = inputManager

    // DOM element
    this.element = null

    // Current selection (0-3)
    this.selectedIndex = 0

    // Bind methods
    this.handleKeyPress = this.handleKeyPress.bind(this)
  }

  /**
   * Show screen - Create DOM and add event listeners
   */
  show() {
    console.log('GalleryScreen: Show')

    // Create screen element
    this.element = document.createElement('div')
    this.element.id = 'gallery-screen'
    this.element.innerHTML = `
      <div class="gallery-container">
        <h1 class="gallery-title">SELECT GAME</h1>
        <div class="gallery-grid">
          ${GalleryScreen.GAMES.map((game, index) => `
            <div class="gallery-item ${index === this.selectedIndex ? 'selected' : ''}" data-index="${index}">
              <div class="gallery-item-number">${game.key}</div>
              <h2 class="gallery-item-name">${game.name}</h2>
              <p class="gallery-item-desc">${game.description}</p>
            </div>
          `).join('')}
        </div>
        <p class="gallery-instructions">1-4: Quick Select • Arrows: Navigate • Space: Confirm • Esc: Back</p>
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
      overflow-y: auto;
    `

    // Add to DOM
    document.body.appendChild(this.element)

    // Add CSS if not already added
    if (!document.getElementById('gallery-screen-styles')) {
      const style = document.createElement('style')
      style.id = 'gallery-screen-styles'
      style.textContent = `
        .gallery-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 80px 50px;
          font-family: 'Google Sans', Arial, sans-serif;
        }

        .gallery-title {
          font-size: 48px;
          font-weight: 700;
          color: #4285F4;
          text-align: center;
          margin: 0 0 60px 0;
          letter-spacing: 2px;
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 40px;
          margin-bottom: 60px;
        }

        .gallery-item {
          background: #f8f9fa;
          border: 4px solid transparent;
          border-radius: 16px;
          padding: 40px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
        }

        .gallery-item:hover {
          background: #f1f3f4;
          transform: translateY(-4px);
          box-shadow: 0 8px 16px rgba(0,0,0,0.1);
        }

        .gallery-item.selected {
          border-color: #4285F4;
          background: #e8f0fe;
          box-shadow: 0 8px 24px rgba(66, 133, 244, 0.3);
        }

        .gallery-item-number {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 40px;
          height: 40px;
          background: #4285F4;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
          font-weight: 700;
        }

        .gallery-item-name {
          font-size: 32px;
          font-weight: 600;
          color: #202124;
          margin: 0 0 12px 0;
        }

        .gallery-item-desc {
          font-size: 18px;
          color: #5f6368;
          margin: 0;
          line-height: 1.5;
        }

        .gallery-instructions {
          text-align: center;
          font-size: 20px;
          color: #5f6368;
          margin: 0;
        }
      `
      document.head.appendChild(style)
    }

    // Listen for keys
    this.inputManager.onKeyPress(this.handleKeyPress)

    console.log('GalleryScreen: Active')
  }

  /**
   * Hide screen - Remove DOM and event listeners
   */
  hide() {
    console.log('GalleryScreen: Hide')

    // Stop listening for keys
    this.inputManager.offKeyPress(this.handleKeyPress)

    // Remove element
    if (this.element) {
      this.element.remove()
      this.element = null
    }

    console.log('GalleryScreen: Cleaned up')
  }

  /**
   * Handle key press
   * @param {string} key - Pressed key
   */
  handleKeyPress(key) {
    // Quick select with number keys
    if (key >= '1' && key <= '4') {
      const index = parseInt(key) - 1
      if (index < GalleryScreen.GAMES.length) {
        this.selectGame(index)
        this.confirmSelection()
      }
      return
    }

    // Arrow navigation
    if (key === 'ArrowUp') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 2)
      this.updateSelection()
    } else if (key === 'ArrowDown') {
      this.selectedIndex = Math.min(GalleryScreen.GAMES.length - 1, this.selectedIndex + 2)
      this.updateSelection()
    } else if (key === 'ArrowLeft') {
      this.selectedIndex = Math.max(0, this.selectedIndex - 1)
      this.updateSelection()
    } else if (key === 'ArrowRight') {
      this.selectedIndex = Math.min(GalleryScreen.GAMES.length - 1, this.selectedIndex + 1)
      this.updateSelection()
    }
    // Space confirms selection
    else if (key === ' ') {
      this.confirmSelection()
    }
    // Escape returns to Welcome
    else if (key === 'Escape') {
      console.log('GalleryScreen: Escape pressed - returning to Idle')
      this.appState.reset()
    }
  }

  /**
   * Select game by index
   * @param {number} index - Game index (0-3)
   */
  selectGame(index) {
    this.selectedIndex = index
    this.updateSelection()
  }

  /**
   * Update visual selection
   */
  updateSelection() {
    if (!this.element) return

    // Remove all selected classes
    const items = this.element.querySelectorAll('.gallery-item')
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add('selected')
      } else {
        item.classList.remove('selected')
      }
    })

    console.log(`GalleryScreen: Selected game ${this.selectedIndex + 1}`)
  }

  /**
   * Confirm selection and advance to Code Animation
   */
  confirmSelection() {
    const selectedGame = GalleryScreen.GAMES[this.selectedIndex]
    console.log(`GalleryScreen: Confirmed selection - ${selectedGame.name}`)

    // Store selected game in AppState
    this.appState.setGame(selectedGame)

    // Advance to Code Animation screen
    this.appState.transition('code')
  }
}
