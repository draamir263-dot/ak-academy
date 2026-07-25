import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // FIX: Increase limit to 20 MB so you can scale past 50,000 MCQs
      maximumFileSizeToCacheInBytes: 20 * 1024 * 1024, 
      includeAssets: ['favicon.ico', 'icon.png'],
      manifest: {
        name: 'AK Academy',
        short_name: 'AK Academy',
        description: 'Make MDCAT on Your Fingertips',
        theme_color: '#2563eb',
        background_color: '#f8fafc',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'icon.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'icon.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbench: {
        // This must be inside the 'workbench' object!
        maximumFileSizeToCacheInBytes: 20 * 1024 * 1024 // 20 MB limit
      }
    })
  ],
})