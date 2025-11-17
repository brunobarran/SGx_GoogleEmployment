/**
 * DebugInterface.js
 *
 * Debug UI for rapid game iteration during development.
 * Provides real-time parameter tuning via sidebar panel.
 *
 * ACTIVATION: Add ?debug=true to game URL
 * EXAMPLE: http://localhost:5174/games/space-invaders.html?debug=true
 *
 * PHASE 1: Core Debug System
 * - URL parameter detection
 * - Sidebar HTML injection
 * - Parameter binding (sliders → CONFIG updates)
 * - Hide/show toggle (ESC key)
 *
 * PHASE 2: Appearance System
 * - Three appearance modes (Modified GoL, Static, Loop)
 * - Dropdown selectors per entity type
 * - Real-time appearance switching
 * - Loop pattern speed control
 *
 * PHASE 3: Unified Cell Size System
 * - Single globalCellSize slider for all entities
 * - Pattern-driven grid sizing (pattern dimensions determine grid size)
 * - Dynamic entity dimensions (width/height calculated from grid × cellSize)
 * - Hitbox scaling with visual appearance
 *
 * @module DebugInterface
 */

import {
  initAppearanceOverrides,
  getAppearanceOptions,
  parseAppearanceValue,
  updateAppearanceOverride
} from './DebugAppearance.js'

/**
 * Initialize debug interface for a game.
 *
 * @param {Object} config - Game CONFIG object (will be mutated)
 * @param {string} gameName - Game identifier ('space-invaders', 'dino-runner', etc.)
 * @param {Object} callbacks - Optional callbacks for parameter changes
 * @param {Function} callbacks.onInvadersChange - Called when invader properties change (cols, rows, spacing) or globalCellSize
 * @param {Function} callbacks.onPlayerChange - Called when player properties change or globalCellSize
 * @param {Function} callbacks.onBulletSpeedChange - Called when bullet speed changes (affects existing bullets)
 *
 * @example
 * const urlParams = new URLSearchParams(window.location.search)
 * if (urlParams.get('debug') === 'true') {
 *   import('../src/debug/DebugInterface.js').then(module => {
 *     module.initDebugInterface(CONFIG, 'space-invaders', {
 *       onInvadersChange: () => { invaders = []; setupInvaders() },
 *       onPlayerChange: () => setupPlayer(),
 *       onBulletSpeedChange: () => { }
 *     })
 *   })
 * }
 */
export function initDebugInterface(config, gameName, callbacks = {}) {
  console.log(`[DebugInterface] Initializing for ${gameName}`)

  // Initialize appearance override system (Phase 2)
  initAppearanceOverrides()

  // Create debug panel container
  const panel = createDebugPanel(gameName)
  document.body.appendChild(panel)

  // Populate controls based on game
  populateControls(panel, config, gameName, callbacks)

  // Setup keyboard shortcuts
  setupKeyboardShortcuts(panel)

  console.log(`[DebugInterface] Ready`)
}

/**
 * Create sidebar HTML structure.
 *
 * @param {string} gameName - Game identifier
 * @returns {HTMLElement} Debug panel element
 */
function createDebugPanel(gameName) {
  const panel = document.createElement('div')
  panel.id = 'debug-panel'
  panel.className = 'debug-panel visible'

  panel.innerHTML = `
    <div class="debug-header">
      <h2>🛠️ Debug: ${formatGameName(gameName)}</h2>
      <button id="debug-toggle" class="debug-button" title="Hide (ESC)">
        ◀
      </button>
    </div>

    <div class="debug-content">
      <div class="debug-info">
        <p><strong>URL:</strong> <code>?debug=true</code></p>
        <p><strong>Shortcuts:</strong> ESC = Hide/Show | H = Hitboxes</p>
      </div>

      <div id="debug-controls">
        <!-- Controls populated dynamically -->
      </div>
    </div>
  `

  return panel
}

/**
 * Populate control groups based on game configuration.
 *
 * @param {HTMLElement} panel - Debug panel container
 * @param {Object} config - Game CONFIG object
 * @param {string} gameName - Game identifier
 * @param {Object} callbacks - Optional callbacks for parameter changes
 */
function populateControls(panel, config, gameName, callbacks) {
  const controlsContainer = panel.querySelector('#debug-controls')

  // Get parameter definitions for this game
  const params = getGameParameters(gameName)

  // Group controls by category
  const groups = {
    gameplay: [],
    'entity-appearances': []
  }

  params.forEach(param => {
    // Ensure group exists before pushing
    if (!groups[param.group]) {
      groups[param.group] = []
    }
    groups[param.group].push(param)
  })

  // Render each group (except entity-appearances, which is handled specially)
  Object.entries(groups).forEach(([groupName, groupParams]) => {
    if (groupName === 'entity-appearances') {
      // Skip - will be merged with appearance dropdowns below
      return
    }
    if (groupParams.length > 0) {
      const groupElement = createControlGroup(groupName, groupParams, config, callbacks)
      controlsContainer.appendChild(groupElement)
    }
  })

  // Add unified appearance group (sliders + dropdowns)
  const appearanceGroup = createAppearanceGroup(gameName, config, callbacks, groups['entity-appearances'])
  controlsContainer.appendChild(appearanceGroup)
}

/**
 * Create a control group with sliders.
 *
 * @param {string} groupName - Group identifier ('gameplay', 'sizes', etc.)
 * @param {Array} params - Parameter definitions
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Optional callbacks for parameter changes
 * @returns {HTMLElement} Control group element
 */
function createControlGroup(groupName, params, config, callbacks) {
  const group = document.createElement('div')
  group.className = 'debug-group'

  const title = document.createElement('h3')
  title.className = 'debug-group-title'
  title.textContent = formatGroupName(groupName)
  group.appendChild(title)

  params.forEach(param => {
    const control = createSliderControl(param, config, callbacks)
    group.appendChild(control)
  })

  return group
}

/**
 * Create slider control for a single parameter.
 *
 * @param {Object} param - Parameter definition
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Optional callbacks for parameter changes
 * @returns {HTMLElement} Control element
 */
function createSliderControl(param, config, callbacks) {
  const control = document.createElement('div')
  control.className = 'debug-control'

  // Get current value from CONFIG
  const currentValue = getNestedValue(config, param.path)

  control.innerHTML = `
    <label class="debug-label">
      <span class="debug-label-text">${param.label}</span>
      <span class="debug-value" id="value-${param.id}">${currentValue}</span>
    </label>
    <input
      type="range"
      class="debug-slider"
      id="slider-${param.id}"
      min="${param.min}"
      max="${param.max}"
      step="${param.step}"
      value="${currentValue}"
      data-path="${param.path}"
    />
  `

  // Bind slider to CONFIG
  const slider = control.querySelector('.debug-slider')
  const valueDisplay = control.querySelector('.debug-value')

  slider.addEventListener('input', (e) => {
    const newValue = parseFloat(e.target.value)
    setNestedValue(config, param.path, newValue)
    valueDisplay.textContent = newValue
    console.log(`[DebugInterface] Updated ${param.path} = ${newValue}`)

    // Trigger appropriate callbacks based on parameter changed
    triggerCallbacks(param.path, callbacks)
  })

  return control
}

/**
 * Trigger appropriate callbacks based on parameter path.
 *
 * @param {string} path - Parameter path that changed
 * @param {Object} callbacks - Callbacks object
 */
function triggerCallbacks(path, callbacks) {
  // PHASE 3: Global cell size change triggers ALL entity rebuilds
  if (path === 'globalCellSize') {
    console.log(`[DebugInterface] PHASE 3: Global cell size changed - rebuilding all entities...`)
    if (callbacks.onInvadersChange) callbacks.onInvadersChange()
    if (callbacks.onPlayerChange) callbacks.onPlayerChange()
    // Note: Bullets and explosions are created dynamically, will use new globalCellSize automatically
    return
  }

  // GoL Update Rate change triggers ALL entity rebuilds (affects GoL engine fps)
  if (path === 'loopUpdateRate') {
    console.log(`[DebugInterface] GoL Update Rate changed - rebuilding all entities...`)
    if (callbacks.onInvadersChange) callbacks.onInvadersChange()
    if (callbacks.onPlayerChange) callbacks.onPlayerChange()
    // Note: Bullets and explosions are created dynamically, will use new loopUpdateRate automatically
    return
  }

  // Invader changes (cols, rows, spacing)
  // Note: width/height are calculated automatically from globalCellSize
  const invaderParams = ['invader.cols', 'invader.rows', 'invader.spacing']
  if (invaderParams.includes(path) && callbacks.onInvadersChange) {
    console.log(`[DebugInterface] Triggering invaders rebuild...`)
    callbacks.onInvadersChange()
    return
  }

  // Bullet speed changes (affects NEW bullets only)
  if (path === 'bullet.speed' && callbacks.onBulletSpeedChange) {
    console.log(`[DebugInterface] Bullet speed changed (affects NEW bullets only)`)
    callbacks.onBulletSpeedChange()
    return
  }
}

/**
 * Create unified appearance group (Phase 3).
 * Combines sliders (e.g., Cell Size) with entity appearance dropdowns.
 *
 * @param {string} gameName - Game identifier
 * @param {Object} config - Game CONFIG object
 * @param {Object} callbacks - Callbacks object
 * @param {Array} sliderParams - Slider parameters for this group (e.g., globalCellSize)
 * @returns {HTMLElement} Appearance group element
 */
function createAppearanceGroup(gameName, config, callbacks, sliderParams = []) {
  const group = document.createElement('div')
  group.className = 'debug-group'

  const title = document.createElement('h3')
  title.className = 'debug-group-title'
  title.textContent = 'Appearance'
  group.appendChild(title)

  // Add sliders first (e.g., Cell Size)
  sliderParams.forEach(param => {
    const control = createSliderControl(param, config, callbacks)
    group.appendChild(control)
  })

  // Then add entity appearance dropdowns
  const entityTypes = getEntityTypes(gameName)

  entityTypes.forEach(entityType => {
    const dropdown = createAppearanceDropdown(entityType, callbacks)
    group.appendChild(dropdown)
  })

  return group
}

/**
 * Get entity types for a specific game.
 * NOTE: Explosions removed - always use Pure GoL (no dropdown needed)
 * NOTE: Bullets removed - always use Modified GoL (no dropdown needed)
 *
 * @param {string} gameName - Game identifier
 * @returns {Array} Entity type names
 */
function getEntityTypes(gameName) {
  const entityTypesByGame = {
    'space-invaders': ['player', 'invaders'],
    'dino-runner': ['player', 'obstacles'],
    'breakout': ['paddle', 'ball', 'bricks'],
    'flappy-bird': ['player', 'pipes']
  }

  return entityTypesByGame[gameName] || []
}

/**
 * Create appearance dropdown for an entity type.
 *
 * @param {string} entityType - Entity type name
 * @param {Object} callbacks - Callbacks object
 * @returns {HTMLElement} Dropdown control element
 */
function createAppearanceDropdown(entityType, callbacks) {
  const control = document.createElement('div')
  control.className = 'debug-control'

  // Get options for this entity type
  const options = getAppearanceOptions(entityType)

  // Group options by group
  const groupedOptions = {}
  options.forEach(opt => {
    if (!groupedOptions[opt.group]) {
      groupedOptions[opt.group] = []
    }
    groupedOptions[opt.group].push(opt)
  })

  // Build dropdown HTML
  let optionsHTML = ''
  Object.entries(groupedOptions).forEach(([groupName, groupOptions]) => {
    if (groupOptions.length === 1 && groupName === 'current') {
      // No optgroup for single "current" option
      optionsHTML += `<option value="${groupOptions[0].value}">${groupOptions[0].label}</option>`
    } else {
      optionsHTML += `<optgroup label="${groupName}">`
      groupOptions.forEach(opt => {
        optionsHTML += `<option value="${opt.value}">${opt.label}</option>`
      })
      optionsHTML += `</optgroup>`
    }
  })

  control.innerHTML = `
    <label class="debug-label">
      <span class="debug-label-text">${formatEntityName(entityType)} Appearance</span>
    </label>
    <select
      class="debug-dropdown"
      id="appearance-${entityType}"
      data-entity-type="${entityType}"
    >
      ${optionsHTML}
    </select>
  `

  // Bind dropdown to appearance override
  const dropdown = control.querySelector('.debug-dropdown')
  dropdown.addEventListener('change', (e) => {
    const value = e.target.value
    const { mode, pattern, period } = parseAppearanceValue(value)

    updateAppearanceOverride(entityType, mode, pattern, period)
    console.log(`[DebugInterface] Appearance changed for ${entityType}:`, { mode, pattern, period })

    // Trigger appropriate callback
    triggerAppearanceCallback(entityType, callbacks)
  })

  return control
}

/**
 * Trigger appearance change callback for entity type.
 *
 * @param {string} entityType - Entity type that changed
 * @param {Object} callbacks - Callbacks object
 */
function triggerAppearanceCallback(entityType, callbacks) {
  // Map entity types to appearance callbacks
  // NOTE: explosions removed - always Pure GoL, no appearance dropdown
  // NOTE: bullets removed - always Modified GoL, no appearance dropdown
  const callbackMap = {
    player: 'onPlayerAppearanceChange',
    invaders: 'onInvadersAppearanceChange',
    obstacles: 'onObstaclesAppearanceChange',
    paddle: 'onPaddleAppearanceChange',
    ball: 'onBallAppearanceChange',
    bricks: 'onBricksAppearanceChange',
    pipes: 'onPipesAppearanceChange'
  }

  const callbackName = callbackMap[entityType]
  if (callbackName && callbacks[callbackName]) {
    console.log(`[DebugInterface] Triggering ${callbackName} for ${entityType} appearance change...`)
    callbacks[callbackName]()
  } else {
    console.warn(`[DebugInterface] No callback found for ${entityType} appearance change (expected: ${callbackName})`)
  }
}

/**
 * Format entity type name for display.
 *
 * @param {string} entityType - Entity type identifier
 * @returns {string} Formatted name
 */
function formatEntityName(entityType) {
  return entityType.charAt(0).toUpperCase() + entityType.slice(1)
}

/**
 * Setup keyboard shortcuts for debug panel.
 *
 * @param {HTMLElement} panel - Debug panel container
 */
function setupKeyboardShortcuts(panel) {
  const toggleButton = panel.querySelector('#debug-toggle')

  // ESC key: Hide/show panel
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      togglePanel(panel, toggleButton)
      e.preventDefault()
    }
  })

  // Toggle button click
  toggleButton.addEventListener('click', () => {
    togglePanel(panel, toggleButton)
  })
}

/**
 * Toggle debug panel visibility.
 *
 * @param {HTMLElement} panel - Debug panel container
 * @param {HTMLElement} button - Toggle button
 */
function togglePanel(panel, button) {
  const isVisible = panel.classList.contains('visible')

  if (isVisible) {
    panel.classList.remove('visible')
    panel.classList.add('hidden')
    button.textContent = '▶'
    button.title = 'Show (ESC)'
  } else {
    panel.classList.remove('hidden')
    panel.classList.add('visible')
    button.textContent = '◀'
    button.title = 'Hide (ESC)'
  }
}

/**
 * Get nested value from object using dot notation path.
 *
 * @param {Object} obj - Object to query
 * @param {string} path - Dot notation path (e.g., 'player.speed')
 * @returns {*} Value at path
 *
 * @example
 * getNestedValue(CONFIG, 'player.speed') // 18
 * getNestedValue(CONFIG, 'invader.cols') // 4
 */
function getNestedValue(obj, path) {
  const keys = path.split('.')
  let value = obj

  for (const key of keys) {
    value = value[key]
    if (value === undefined) {
      console.warn(`[DebugInterface] Path not found: ${path}`)
      return 0
    }
  }

  return value
}

/**
 * Set nested value in object using dot notation path.
 *
 * @param {Object} obj - Object to mutate
 * @param {string} path - Dot notation path
 * @param {*} value - New value
 *
 * @example
 * setNestedValue(CONFIG, 'player.speed', 24)
 */
function setNestedValue(obj, path, value) {
  const keys = path.split('.')
  let current = obj

  for (let i = 0; i < keys.length - 1; i++) {
    current = current[keys[i]]
  }

  current[keys[keys.length - 1]] = value
}

/**
 * Get parameter definitions for a specific game.
 *
 * PHASE 1: Only Space Invaders parameters.
 * PHASE 2+: Add other games.
 *
 * @param {string} gameName - Game identifier
 * @returns {Array} Parameter definitions
 */
function getGameParameters(gameName) {
  const parameterSets = {
    'space-invaders': [
      // GAMEPLAY (9 params)
      { id: 'inv-cols', label: 'Invader Columns', path: 'invader.cols', min: 2, max: 8, step: 1, group: 'gameplay' },
      { id: 'inv-rows', label: 'Invader Rows', path: 'invader.rows', min: 2, max: 8, step: 1, group: 'gameplay' },
      { id: 'inv-move-int', label: 'Invader Move Interval', path: 'invader.moveInterval', min: 10, max: 60, step: 5, group: 'gameplay' },
      { id: 'inv-speed', label: 'Invader Speed', path: 'invader.speed', min: 15, max: 90, step: 5, group: 'gameplay' },
      { id: 'inv-spacing', label: 'Invader Spacing', path: 'invader.spacing', min: 20, max: 120, step: 10, group: 'gameplay' },
      { id: 'player-speed', label: 'Player Speed', path: 'player.speed', min: 6, max: 36, step: 2, group: 'gameplay' },
      { id: 'shoot-cooldown', label: 'Shoot Cooldown', path: 'player.shootCooldown', min: 5, max: 30, step: 1, group: 'gameplay' },
      { id: 'bullet-speed', label: 'Bullet Speed', path: 'bullet.speed', min: 6, max: 30, step: 2, group: 'gameplay' },
      { id: 'loop-update-rate', label: 'GoL Update Rate (fps)', path: 'loopUpdateRate', min: 5, max: 40, step: 5, group: 'gameplay', description: 'Evolution speed for all GoL entities (Pure + Modified)' },

      // ENTITY APPEARANCES (1 param - PHASE 3: Unified cell size)
      { id: 'global-cell-size', label: 'Cell Size (All Entities)', path: 'globalCellSize', min: 15, max: 60, step: 1, group: 'entity-appearances', description: 'Pixel size of all GoL cells' }
    ],

    // Placeholder for other games (to be implemented in future phases)
    'dino-runner': [],
    'breakout': [],
    'flappy-bird': []
  }

  return parameterSets[gameName] || []
}

/**
 * Format game name for display.
 *
 * @param {string} gameName - Game identifier
 * @returns {string} Formatted name
 */
function formatGameName(gameName) {
  return gameName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

/**
 * Format group name for display.
 *
 * @param {string} groupName - Group identifier
 * @returns {string} Formatted name
 */
function formatGroupName(groupName) {
  // Special case: entity-appearances → Appearance
  if (groupName === 'entity-appearances') {
    return 'Appearance'
  }

  return groupName.charAt(0).toUpperCase() + groupName.slice(1)
}
