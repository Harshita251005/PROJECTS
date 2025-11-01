import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 🍴 Harshita Food Hub — Vite Config for Frontend
// This proxy connects frontend to backend running on localhost:5000

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000' // Backend API for Harshita Food Hub
    }
  }
})
