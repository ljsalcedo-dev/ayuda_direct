import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  define: {
    // Stellar SDK references `global` in its Node.js build
    global: 'globalThis',
    'process.env': '{}',
  },
})
