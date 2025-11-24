/**
 * GameRegistry - Central Game Catalog
 *
 * Single Source of Truth for all available games in the installation.
 * Each game includes its prompt (AI creation text) and thinking (code generation process).
 *
 * @module installation/GameRegistry
 * @author Game of Life Arcade
 * @license ISC
 */

// Import prompts (used by GalleryScreen)
import spaceInvadersPrompt from '../../public/games/space-invaders-prompt.txt?raw'
import dinoRunnerPrompt from '../../public/games/dino-runner-prompt.txt?raw'
import breakoutPrompt from '../../public/games/breakout-prompt.txt?raw'
import flappyBirdPrompt from '../../public/games/flappy-bird-prompt.txt?raw'

// Import thinking texts (used by CodeAnimationScreen)
import spaceInvadersThinking from '../../public/games/space-invaders-thinking.txt?raw'
import dinoRunnerThinking from '../../public/games/dino-runner-thinking.txt?raw'
import breakoutThinking from '../../public/games/breakout-thinking.txt?raw'
import flappyBirdThinking from '../../public/games/flappy-bird-thinking.txt?raw'

/**
 * All available games with their associated content
 *
 * @typedef {Object} Game
 * @property {string} id - Unique game identifier (matches game file name)
 * @property {string} name - Display name (used in all screens)
 * @property {string} prompt - AI prompt text (shown in Gallery carousel)
 * @property {string} thinking - Thinking process text (shown in Code Animation)
 * @property {string} path - iframe path to load the game
 * @property {string} key - Keyboard shortcut (1-4)
 */

/**
 * @type {Game[]}
 */
export const GAMES = [
  {
    id: 'space-invaders',
    name: 'Cellfront Command',
    prompt: spaceInvadersPrompt,
    thinking: spaceInvadersThinking,
    path: 'games/game-wrapper.html?game=space-invaders',
    key: '1'
  },
  {
    id: 'dino-runner',
    name: 'Automata Rush',
    prompt: dinoRunnerPrompt,
    thinking: dinoRunnerThinking,
    path: 'games/game-wrapper.html?game=dino-runner',
    key: '2'
  },
  {
    id: 'breakout',
    name: 'Cellular Shatter',
    prompt: breakoutPrompt,
    thinking: breakoutThinking,
    path: 'games/game-wrapper.html?game=breakout',
    key: '3'
  },
  {
    id: 'flappy-bird',
    name: 'Hoppy Glider',
    prompt: flappyBirdPrompt,
    thinking: flappyBirdThinking,
    path: 'games/game-wrapper.html?game=flappy-bird',
    key: '4'
  }
]

/**
 * Get game by ID
 *
 * @param {string} id - Game ID (e.g., 'space-invaders')
 * @returns {Game|null} Game object or null if not found
 *
 * @example
 * const game = getGameById('space-invaders')
 * if (game) {
 *   console.log(game.name) // 'CELLFRONT COMMAND'
 *   console.log(game.thinking) // Full thinking text
 * }
 */
export function getGameById(id) {
  return GAMES.find(game => game.id === id) || null
}

/**
 * Validate game object structure
 *
 * Checks that a game object has all required fields with valid values.
 * Used by screens to verify game data before use.
 *
 * @param {*} game - Game object to validate
 * @returns {boolean} True if valid, false otherwise
 *
 * @example
 * const game = appState.getState().selectedGame
 * if (!validateGame(game)) {
 *   console.error('Invalid game')
 *   appState.reset()
 *   return
 * }
 */
export function validateGame(game) {
  if (!game || typeof game !== 'object') {
    return false
  }

  // Required fields for all games
  const requiredFields = ['id', 'name', 'path', 'key']

  return requiredFields.every(field =>
    game.hasOwnProperty(field) &&
    game[field] !== null &&
    game[field] !== undefined &&
    typeof game[field] === 'string' &&
    game[field].length > 0
  )
}
