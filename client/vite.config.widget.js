import { defineConfig } from 'vite'
import { resolve } from 'path'

export default defineConfig({
  build: {
    outDir: 'dist-widget',
    lib: {
      entry: resolve(__dirname, 'src/widget.tsx'),
      name: 'ReflectWidget',
      fileName: 'widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // Ensure we get a single file output
        entryFileNames: 'widget.js',
        chunkFileNames: 'widget.js',
        assetFileNames: 'widget.js',
        // Bundle everything into a single file
        manualChunks: undefined
      }
    },
    target: 'es2015',
    minify: 'esbuild', // Use esbuild instead of terser
    sourcemap: false,
    // Ensure all CSS is inlined
    cssCodeSplit: false
  },
  define: {
    // Remove any process.env references that might cause issues
    'process.env.NODE_ENV': '"production"'
  },
  // Don't include dev dependencies
  optimizeDeps: {
    exclude: ['@tanstack/react-query', 'react', 'react-dom']
  }
})
