import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
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
          if (id.includes('node_modules')) {
            // Large UI libraries
            if (id.includes('@radix-ui')) {
              return 'vendor-radix'
            }
            // React and React DOM
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react'
            }
            // Chart libraries
            if (id.includes('recharts')) {
              return 'vendor-charts'
            }
            // Form libraries
            if (id.includes('react-hook-form') || id.includes('@hookform')) {
              return 'vendor-forms'
            }
            // Animation libraries
            if (id.includes('framer-motion')) {
              return 'vendor-animation'
            }
            // Query libraries
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            // Supabase
            if (id.includes('@supabase')) {
              return 'vendor-supabase'
            }
            // Date libraries
            if (id.includes('date-fns') || id.includes('react-day-picker')) {
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
            // Other vendor code
            return 'vendor'
          }
        },
      },
    },
  },
})
