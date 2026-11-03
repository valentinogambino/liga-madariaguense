import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'escudos/*.png'],
      manifest: {
        name: 'Liga Madariaguense de Fútbol',
        short_name: 'Liga Madariaguense',
        description: 'Resultados, posiciones, clubes y jugadores de la Liga Madariaguense de Fútbol.',
        lang: 'es-AR',
        theme_color: '#0c110e',
        background_color: '#0c110e',
        display: 'standalone',
        start_url: '/',
        icons: [
          { src: '/iconos/icono-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/iconos/icono-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/iconos/icono-512-maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,svg,woff2}'] }
    })
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          animacion: ['motion', 'gsap']
        }
      }
    }
  },
  server: { port: 5180 },
  preview: { port: 5181 }
});
