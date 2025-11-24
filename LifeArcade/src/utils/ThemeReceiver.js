/**
 * ThemeReceiver - Listen for theme changes via postMessage
 *
 * Games use this to receive theme updates from the installation
 * and update their backgrounds accordingly
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Initialize theme receiver for a game
 * @param {function} onThemeChange - Callback when theme changes: (theme) => void
 * @returns {function} cleanup function
 */
export function initThemeReceiver(onThemeChange) {
  const handler = (event) => {
    // Only accept messages with themeChange type
    if (event.data && event.data.type === 'themeChange') {
      const theme = event.data.payload?.theme
      if (theme === 'day' || theme === 'night') {
        console.log(`ThemeReceiver: Received theme "${theme}"`)
        onThemeChange(theme)
      }
    }
  }

  window.addEventListener('message', handler)
  console.log('ThemeReceiver: Listening for theme changes')

  // Return cleanup function
  return () => {
    window.removeEventListener('message', handler)
    console.log('ThemeReceiver: Stopped listening')
  }
}

/**
 * Get background color for theme
 * @param {string} theme - 'day' or 'night'
 * @returns {string} Hex color
 */
export function getBackgroundColor(theme) {
  return theme === 'night' ? '#1A1A1A' : '#FFFFFF'
}

/**
 * Get text color for theme (RGB array for p5.js)
 * @param {string} theme - 'day' or 'night'
 * @returns {number[]} RGB array [r, g, b]
 */
export function getTextColor(theme) {
  return theme === 'night' ? [232, 234, 237] : [95, 99, 104]  // #E8EAED : #5f6368
}
