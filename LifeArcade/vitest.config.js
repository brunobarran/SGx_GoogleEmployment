import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    include: ['tests/**/*.js'],
    globals: true,
    environment: 'jsdom'
  }
})
