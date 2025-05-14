import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

console.log("hello",path.resolve('src'));

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, 'index.html'),
      },
      output: {
        entryFileNames: 'assets/[name].js',
      }
    }
  }
})
