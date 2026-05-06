import { existsSync } from 'node:fs'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const hasWorkspaceEnv =
  existsSync(fileURLToPath(new URL('./.env', import.meta.url))) ||
  existsSync(fileURLToPath(new URL('./.env.local', import.meta.url)))

export default defineConfig({
  envDir: hasWorkspaceEnv ? '.' : '..',
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      }
    }
  },
})
