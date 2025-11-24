import { defineConfig } from 'vite'
import { resolve } from 'path'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  server: {
    port: 5173
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'installation.html')
      }
    }
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'src',
          dest: '.'
        },
        {
          src: 'public/games/*.txt',
          dest: 'games'
        }
      ]
    })
  ]
})
