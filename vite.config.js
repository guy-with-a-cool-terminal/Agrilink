
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"

export default defineConfig(async ({ mode }) => {
  // Safely import lovable-tagger with fallback
  let componentTagger;
  try {
    const lovableTagger = await import("lovable-tagger");
    componentTagger = lovableTagger.componentTagger;
  } catch (error) {
    // Fallback if lovable-tagger is not available
    componentTagger = () => null;
  }

  return {
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
  }
})
