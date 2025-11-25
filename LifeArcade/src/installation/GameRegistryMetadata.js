/**
 * GameRegistryMetadata - Game Metadata (LIGHTWEIGHT VERSION)
 *
 * Contains ONLY core game metadata without text content.
 * Used by game-wrapper.html to avoid loading .txt files.
 *
 * ARCHITECTURE PATTERN:
 * - This file: Lightweight metadata only (~2KB) - for iframes
 * - GameRegistry.js: Full data with prompt/thinking texts (~500KB+) - for screens
 *
 * USAGE:
 * - game-wrapper.html: Use this file (only needs game title/paths)
 * - Screens: Use GameRegistry.js instead (needs full prompt/thinking texts)
 *
 * CONSISTENCY:
 * GameRegistry.js imports and extends this file, ensuring single source of truth.
 *
 * @module installation/GameRegistryMetadata
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Game metadata (without prompt/thinking content)
 *
 * @typedef {Object} GameMetadata
 * @property {string} id - Unique game identifier
 * @property {string} name - Display name
 * @property {string} path - iframe path
 * @property {string} key - Keyboard shortcut (1-4)
 * @property {string} promptPath - Path to prompt .txt file
 * @property {string} thinkingPath - Path to thinking .txt file
 */

/**
 * @type {GameMetadata[]}
 */
export const GAMES_METADATA = [
  {
    id: 'space-invaders',
    name: 'Cellfront Command',
    path: 'games/game-wrapper.html?game=space-invaders',
    key: '1',
    promptPath: '/games/space-invaders-prompt.txt',
    thinkingPath: '/games/space-invaders-thinking.txt'
  },
  {
    id: 'dino-runner',
    name: 'Automata Rush',
    path: 'games/game-wrapper.html?game=dino-runner',
    key: '2',
    promptPath: '/games/dino-runner-prompt.txt',
    thinkingPath: '/games/dino-runner-thinking.txt'
  },
  {
    id: 'breakout',
    name: 'Cellular Shatter',
    path: 'games/game-wrapper.html?game=breakout',
    key: '3',
    promptPath: '/games/breakout-prompt.txt',
    thinkingPath: '/games/breakout-thinking.txt'
  },
  {
    id: 'flappy-bird',
    name: 'Hoppy Glider',
    path: 'games/game-wrapper.html?game=flappy-bird',
    key: '4',
    promptPath: '/games/flappy-bird-prompt.txt',
    thinkingPath: '/games/flappy-bird-thinking.txt'
  },
  {
    id: 'galaga',
    name: 'Cellship Strike',
    path: 'games/game-wrapper.html?game=galaga',
    key: '5',
    promptPath: '/games/galaga-prompt.txt',
    thinkingPath: '/games/galaga-thinking.txt'
  },
  {
    id: 'snake',
    name: 'Trail of Life',
    path: 'games/game-wrapper.html?game=snake',
    key: '6',
    promptPath: '/games/snake-prompt.txt',
    thinkingPath: '/games/snake-thinking.txt'
  }
]

/**
 * Get game metadata by ID
 *
 * @param {string} id - Game ID
 * @returns {GameMetadata|null}
 *
 * @example
 * const game = getGameMetadataById('space-invaders')
 * console.log(game.name) // 'Cellfront Command'
 */
export function getGameMetadataById(id) {
  return GAMES_METADATA.find(game => game.id === id) || null
}

/**
 * Validate game metadata object
 *
 * @param {*} game - Game metadata to validate
 * @returns {boolean}
 *
 * @example
 * const game = getGameMetadataById('space-invaders')
 * if (validateGameMetadata(game)) {
 *   console.log('Valid metadata')
 * }
 */
export function validateGameMetadata(game) {
  if (!game || typeof game !== 'object') {
    return false
  }

  const requiredFields = ['id', 'name', 'path', 'key']

  return requiredFields.every(field =>
    game.hasOwnProperty(field) &&
    game[field] !== null &&
    game[field] !== undefined &&
    typeof game[field] === 'string' &&
    game[field].length > 0
  )
}
