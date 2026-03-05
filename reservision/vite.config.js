import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    allowedHosts: [
      'delphia-nonperverted-celena.ngrok-free.dev',
      'localhost',
      '127.0.0.1'
    ]
  }
})