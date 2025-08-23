import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    target: 'esnext' // ✅ ensures modern build output
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@shared': path.resolve(__dirname, 'shared')
    }
  },
  server: {
    port: 5000,
    host: '0.0.0.0'
  },
  preview: {
    port: 5000,
    host: '0.0.0.0'
  },
  esbuild: {
    jsxInject: `import React from 'react'`, // ✅ ensures React is injected globally
    jsx: 'automatic' // ✅ makes sure new JSX transform works properly
  }
})
