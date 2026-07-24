import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // FORCE NETWORK FIRST: Always check Vercel for new MCQs before using cache
        runtimeCaching: [
          {
            urlPattern: ({url}) => url.pathname === '/' || url.pathname.endsWith('.html'),
            handler: 'NetworkFirst',
            options: { cacheName: 'html-cache' },
          },
          {
            urlPattern: ({url}) => url.pathname.endsWith('.js'),
            handler: 'NetworkFirst',
            options: { cacheName: 'js-cache' },
          }
        ]
      },
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
      }
    })
  ],
})