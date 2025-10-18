// lms-portal/vite.config.js

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // This tells Vite to forward any request starting with /api to your backend on port 5000
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Your running backend URL
        changeOrigin: true,
        secure: false, // Use false for http (non-HTTPS) development environment
      }
    }
  }
})