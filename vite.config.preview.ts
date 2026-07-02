import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteSingleFile } from 'vite-plugin-singlefile'

// Build especial: empaqueta toda la app en un único HTML autocontenido
// (JS + CSS inline) para previsualizarla como artifact.
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    outDir: 'preview-dist',
    assetsInlineLimit: 100000000,
    cssCodeSplit: false,
  },
})
