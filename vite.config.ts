import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/SafeChart/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'SafeChart',
        short_name: 'SafeChart',
        theme_color: '#1A2B47',
        background_color: '#F5F0E8',
        icons: [{ src: '/icon-192.png', sizes: '192x192', type: 'image/png' }]
      }
    })
  ]
})
