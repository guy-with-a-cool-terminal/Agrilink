
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import { componentTagger } from "lovable-tagger"

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        admin: 'admin-dashboard.html',
        farmer: 'farmer-dashboard.html',
        consumer: 'consumer-dashboard.html',
        retailer: 'retailer-dashboard.html',
        logistics: 'logistics-dashboard.html',
        analytics: 'analytics.html'
      }
    }
  }
}))
