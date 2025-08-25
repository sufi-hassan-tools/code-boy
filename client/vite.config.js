/* eslint-env node */
/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: ["5173-ir9r7ynopmk7aad5w8lmt-631abee1.manusvm.computer"],
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.NODE_ENV === 'production' ? 'https://moohaarapp.onrender.com' : 'http://localhost:5000'),
  },
  optimizeDeps: {
    include: ['browser-image-compression']
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Code Boy App',
        short_name: 'CodeBoy',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#000000',
        icons: [
          {
            src: 'icon-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'icon-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ]
});
