import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'url'
import path from 'path'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Copy manifest and icons after build
function copyManifestAndIcons() {
  return {
    name: 'copy-manifest-and-icons',
    closeBundle: () => {
      // Copy manifest
      fs.copyFileSync('manifest.json', 'dist/manifest.json')
      
      // Copy single icon for demo
      if (fs.existsSync('public/icon.png')) {
        fs.copyFileSync('public/icon.png', 'dist/icon16.png');
        fs.copyFileSync('public/icon.png', 'dist/icon32.png');
        fs.copyFileSync('public/icon.png', 'dist/icon48.png');
        fs.copyFileSync('public/icon.png', 'dist/icon128.png');
      }
    }
  }
}

export default defineConfig({
  plugins: [react(), copyManifestAndIcons()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
        background: path.resolve(__dirname, 'src/background.js'),
        content: path.resolve(__dirname, 'src/content.js')
      },
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  base: './',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  }
})
