import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [],
  css: {
    postcss: './postcss.config.js',
  },
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
        assetFileNames: (assetInfo) => {
          // Force CSS assets to be treated differently
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return '[name].css'
          }
          return '[name].[ext]'
        },
        // Bundle everything into a single file including React
        manualChunks: undefined,
        globals: {},
        // Inline assets to avoid separate CSS file
        inlineDynamicImports: true
      },
      // Bundle React and React-DOM into the widget for standalone use
      external: []
    },
    target: 'es2015',
    minify: 'esbuild',
    sourcemap: false,
    // Ensure all CSS is inlined
    cssCodeSplit: false,
    // Force inline CSS
    assetsInlineLimit: 100000000
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    global: 'globalThis',
  },
  esbuild: {
    // Configure JSX for Preact
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
  },
  optimizeDeps: {
    include: ['preact', 'preact/compat']
  }
})
