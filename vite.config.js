import { defineConfig } from 'vite'

export default defineConfig({
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
})