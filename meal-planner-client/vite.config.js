import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'favicon/favicon.svg',
        'favicon/favicon-96x96.png',
        'favicon/favicon.ico',
        'favicon/apple-touch-icon.png',
        'favicon/web-app-manifest-192x192.png',
        'favicon/web-app-manifest-512x512.png',
      ],
      manifest: {
        name: 'mealplanned',
        short_name: 'mealplanned',
        theme_color: '#7F9B82',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: '/favicon/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/favicon/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
    }),
  ],
})
