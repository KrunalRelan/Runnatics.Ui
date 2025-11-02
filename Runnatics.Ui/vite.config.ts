import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // '@/components': path.resolve(__dirname, './src/main/src/components'),
      // '@/pages': path.resolve(__dirname, './src/main/src/pages'),
      // '@/hooks': path.resolve(__dirname, './src/main/src/hooks'),
      // '@/contexts': path.resolve(__dirname, './src/main/src/contexts'),
      // '@/utility': path.resolve(__dirname, './src/main/src/utility'),
      // '@/models': path.resolve(__dirname, './src/main/src/models'),
      // '@/types': path.resolve(__dirname, './src/main/src/types')
    }
  }
})