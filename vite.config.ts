import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  const apiTarget = env.VITE_API_URL || 'http://localhost:3001';

  return {
    server: {
      port: 3040,
      host: '0.0.0.0',
      proxy: {
        '/api': { target: apiTarget, changeOrigin: true },
        '/auth': { target: apiTarget, changeOrigin: true },
        '/users': { target: apiTarget, changeOrigin: true },
        '/uploads': { target: apiTarget, changeOrigin: true },
        '/whatsapp-inbox': { target: apiTarget, changeOrigin: true },
        '/socket.io': { target: apiTarget, ws: true, changeOrigin: true },
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: { enabled: false },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /\/api\/v1\/crm\/cases$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'crm-cases',
                expiration: { maxAgeSeconds: 3600 },
              },
            },
            {
              urlPattern: /\/whatsapp-inbox\/conversations$/,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'wa-conversations',
                expiration: { maxAgeSeconds: 300 },
              },
            },
            {
              urlPattern: /\/(api\/v1|whatsapp-inbox)\/.*/,
              handler: 'NetworkOnly',
            },
          ],
        },
        manifest: {
          name: 'Rentia Mobile',
          short_name: 'Rentia',
          description: 'CRM y Chat WhatsApp — Rentia',
          theme_color: '#2e3192',
          background_color: '#2e3192',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/',
          scope: '/',
          icons: [
            { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
            { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
            { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          ],
        },
      }),
    ],
    resolve: {
      alias: { '@': path.resolve(__dirname, 'src') },
    },
  };
});
