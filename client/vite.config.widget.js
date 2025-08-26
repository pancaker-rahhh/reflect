import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      'react': 'preact/compat',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
  build: {
    outDir: 'dist-widget',
    lib: {
      entry: fileURLToPath(new URL('./src/widget.tsx', import.meta.url)),
      name: 'ReflectWidget',
      fileName: 'widget',
      formats: ['iife']
    },
    rollupOptions: {
      output: {
        // Ensure we get a single file output
        entryFileNames: 'widget.js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        // Bundle everything into a single file including React
        manualChunks: undefined,
        globals: {}
      },
      // Bundle React and React-DOM into the widget for standalone use
      external: []
    },
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    // Ensure all CSS is inlined
    cssCodeSplit: false
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  esbuild: {
    // Configure JSX for Preact
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'preact'`,
  }
})
