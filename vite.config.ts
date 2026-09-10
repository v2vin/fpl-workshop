import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Installable on iOS and Android from the site itself (CLAUDE.md, "Mobile apps").
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'favicon.ico', 'icons/apple-touch-icon.png', 'brand/*.svg'],
      manifest: {
        name: 'FPL Workshop',
        short_name: 'FPL Workshop',
        description:
          'A private Fantasy Premier League mini league with a monthly draw for handmade pine gifts.',
        lang: 'en-GB',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#1b4d31',
        background_color: '#fbf7ee',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: '/icons/icon-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Firebase Hosting serves the Google sign-in handler under /__/; never answer it from cache.
        navigateFallbackDenylist: [/^\/__\//],
        // Build assets only. Gift photos and Firestore traffic go to the network as usual.
        globPatterns: ['**/*.{js,css,html,svg,png}'],
        globIgnores: ['**/gifts/**'],
      },
    }),
  ],
  server: {
    watch: {
      // Emulator exports are written while `npm run dev` is running. Watching them would trigger
      // reloads and, on Windows, hold directory handles that make the CLI's export rename fail.
      ignored: ['**/emulator-data/**', '**/firebase-export-*/**', '**/*.log'],
    },
  },
})
