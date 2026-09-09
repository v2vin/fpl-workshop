import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      // Emulator exports are written while `npm run dev` is running. Watching them would trigger
      // reloads and, on Windows, hold directory handles that make the CLI's export rename fail.
      ignored: ['**/emulator-data/**', '**/firebase-export-*/**', '**/*.log'],
    },
  },
})
