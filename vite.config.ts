import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev
export default defineConfig({
  base: '/', // Configured for root path deployment on your custom domain
  plugins: [
    tailwindcss(),
    vue()
  ],
})
