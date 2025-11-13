/**
 * Configuration constants for Game of Life Arcade.
 *
 * @author Game of Life Arcade
 * @license ISC
 */

/**
 * Visual configuration for rendering.
 */
export const VISUAL_CONFIG = {
  // Canvas dimensions (1200×1920 portrait for physical installation)
  CANVAS_WIDTH: 1200,
  CANVAS_HEIGHT: 1920,

  // Cell size and spacing
  CELL_SIZE: 30,  // Size of each cell in pixels (1200/40 = 30)
  CELL_SPACING: 0,  // Spacing between cells (0 for solid grid)

  // Grid dimensions (portrait 40×64 grid)
  GRID_COLS: 40,  // 40 columns (1200 / 30 = 40)
  GRID_ROWS: 64,  // 64 rows (1920 / 30 = 64)

  // Colors (monochrome base, gradients applied via renderer)
  BACKGROUND_COLOR: '#FFFFFF',  // White background
  CELL_COLOR: '#FFFFFF',  // White cells (gradients override this)
  CELL_ALPHA: 255,  // Full opacity

  // Rendering mode
  USE_WEBGL: false  // Use WEBGL for hardware acceleration (keep false for now - 2D mode works better)
}

/**
 * Performance configuration for update rates and frame budgets.
 */
export const PERFORMANCE_CONFIG = {
  // Target frame rates
  TARGET_FPS: 60,  // Main loop target

  // GoL update rates (in fps)
  BACKGROUND_UPDATE_RATE: 10,  // Background updates per second
  SPRITE_UPDATE_RATE: 12,  // Sprite GoL updates per second
  EXPLOSION_UPDATE_RATE: 30,  // Explosion effects update rate

  // Performance budgets (in milliseconds per frame)
  GOL_SIMULATION_BUDGET: 1.0,  // Total GoL simulation time per frame
  GAME_LOGIC_BUDGET: 5.0,  // Game logic (physics, collision, AI)
  RENDERING_BUDGET: 10.0,  // Rendering budget
  FRAME_BUDGET: 16.67,  // Total frame time (1000ms / 60fps)

  // Enable performance monitoring
  ENABLE_PERFORMANCE_LOGGING: false,  // Set to true to log frame times
  PERFORMANCE_LOG_INTERVAL: 60  // Log every N frames
}

/**
 * Game configuration (placeholder for future use).
 */
export const GAME_CONFIG = {
  // Physics constants (to be defined in Phase 2)
  GRAVITY: 0.6,
  JUMP_FORCE: -12,

  // Collision detection
  COLLISION_METHOD: 'circle',  // 'circle' or 'rectangle'

  // Player settings (to be defined in Phase 2)
  PLAYER_SPEED: 5,
  PLAYER_SIZE: 20,

  // Enemy settings (to be defined in Phase 2)
  ENEMY_SPEED: 3,
  ENEMY_SPAWN_INTERVAL: 120  // frames
}

/**
 * GoL cell states.
 */
export const CELL_STATES = {
  ALIVE: 1,
  DEAD: 0
}

/**
 * Pattern density ranges for different contexts.
 */
export const DENSITY_CONFIG = {
  RANDOM_SEED: 0.3,  // 30% density for random seeding
  MIN_DENSITY: 0.1,  // 10% minimum to avoid extinction
  MAX_DENSITY: 0.7,  // 70% maximum to avoid overcrowding
  TARGET_DENSITY: 0.4  // 40% target for stable patterns
}
