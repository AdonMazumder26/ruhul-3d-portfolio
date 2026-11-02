import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  // This is a public browser value, not a secret. The explicit prefix makes
  // that intent clear and prevents unrelated environment variables from being
  // bundled into the client.
  envPrefix: 'PUBLIC_',
  build: {
    rollupOptions: {
      output: {
        // Keep the 3D runtime in its own chunk so the content shell loads first.
        manualChunks(id) {
          if (/node_modules[\\/](three|@react-three)[\\/]/.test(id)) return 'three'
          return undefined
        },
      },
    },
  },
})
