import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Vite Configuration
export default defineConfig({
  plugins: [
    react(), // Enables React JSX/TSX support
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'), // Simplified import paths using '@'
    },
  },
  define: {
    'process.env': {}, // Prevents "process is not defined" error
  },
  optimizeDeps: {
    include: ['buffer', 'process', 'crypto', 'stream'], // Polyfills for some Node.js packages
  },
  build: {
    target: 'esnext',
    sourcemap: true,
    outDir: 'dist', // Output directory (used when serving React from Express in prod)
  },
  server: {
    port: 5173, // Dev server port
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''), // Maps /api/foo -> /foo on backend
      },
    },
    host: true, // Allow the server to be accessed externally
    allowedHosts: [
      '832c-103-59-153-127.ngrok-free.app', // Add your ngrok URL here
      'localhost' // Optionally, you can also add 'localhost'
    ]
  }
});
