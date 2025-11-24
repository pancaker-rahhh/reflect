import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    react({
      jsxRuntime: 'automatic',
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
    dedupe: ['react', 'react-dom'],
  },

  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react/jsx-runtime',
      'react-router-dom',
      '@tanstack/react-query',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
    ],
    exclude: ['@preact/compat', 'preact'],
    esbuildOptions: {
      jsx: 'automatic',
    },
  },

  server: {
    strictPort: false,
    host: 'localhost',
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },

  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        widget: resolve(__dirname, 'src/widget.tsx'),
      },
      output: {
        entryFileNames: `assets/[name].js`,
        chunkFileNames: `assets/[name].js`,
        assetFileNames: `assets/[name].[ext]`,
        manualChunks(id) {
          // Vendor chunking for better caching and parallel loading
          // IMPORTANT: React must be isolated to prevent circular dependencies
          if (id.includes('node_modules')) {
            // React core - MUST be isolated (react, react-dom, react/jsx-runtime)
            if (
              (id.includes('/react/') || id.includes('\\react\\')) &&
              !id.includes('react-dom') &&
              !id.includes('react-router') &&
              !id.includes('react-hook-form') &&
              !id.includes('react-select') &&
              !id.includes('react-day-picker') &&
              !id.includes('react-helmet')
            ) {
              return 'vendor-react'
            }
            if (id.includes('react-dom')) {
              return 'vendor-react'
            }
            // React Router - depends on React
            if (id.includes('react-router')) {
              return 'vendor-react'
            }
            // React Helmet - depends on React
            if (id.includes('react-helmet')) {
              return 'vendor-react'
            }
            // Large UI libraries that depend on React
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            // Chart libraries
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            // Form libraries that depend on React
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms'
            }
            // React Select - depends on React
            if (id.includes('react-select')) {
              return 'vendor-forms'
            }
            // Animation libraries that depend on React
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            // Query libraries that depend on React
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            // Supabase - no React dependency
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            // Date libraries - react-day-picker depends on React
            if (id.includes('date-fns')) {
              return 'vendor-date'
            }
            if (id.includes('react-day-picker')) {
              return 'vendor-date'
            }
            // Icon libraries - split to avoid bloat
            if (id.includes('lucide-react')) {
              return 'vendor-icons'
            }
            // Analytics - lazy load
            if (id.includes('posthog-js')) {
              return 'vendor-analytics'
            }
            // Zustand - state management (might use React)
            if (id.includes('zustand')) {
              return 'vendor'
            }
            // Other vendor code (non-React dependencies)
            // Be careful - if any of these use React, they should be moved above
            return 'vendor'
          }
        },
      },
    },
  },
})
