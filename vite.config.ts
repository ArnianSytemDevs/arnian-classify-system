import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest:{
        name:'Arnian classify',
        short_name:'Arn-classify',
        description: 'Classification system',
        start_url: '/',
        display: 'standalone',
        background_color: '#f0f0f0',
        theme_color:'#075985',
        orientation:'landscape',
        icons: [
          {
            src: "icons/pwa-48x48.png",
            sizes: "48x48",
            type: "image/png"
          },
          {
            src: "icons/pwa-72x72.png",
            sizes: "72x72",
            type: "image/png"
          },
          {
            src: "icons/pwa-96x96.png",
            sizes: "96x96",
            type: "image/png"
          },
          {
            src: "icons/pwa-128x128.png",
            sizes: "128x128",
            type: "image/png"
          },
          {
            src: "icons/pwa-144x144.png",
            sizes: "144x144",
            type: "image/png"
          },
          {
            src: "icons/pwa-152x152.png",
            sizes: "152x152",
            type: "image/png"
          },
          {
            src: "icons/pwa-192x192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icons/pwa-256x256.png",
            sizes: "256x256",
            type: "image/png"
          },
          {
            src: "icons/pwa-384x384.png",
            sizes: "384x384",
            type: "image/png"
          },
          {
            src: "icons/pwa-512x512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src:"assets/icon.ico",
            sizes: "256x256",
            type: "image/ico"
          },
          {
            src:"assets/logo.png",
            sizes: "1024x1024",
            type: "image/png"
          },
          {
            src:"/assets/logo.png",
            sizes: "1024x1024",
            type: "image/png"
          },
          {
            src:"/assets/logo_w.png",
            sizes: "1024x1024",
            type: "image/png"
          },
          {
            src:"/assets/ArnianLogo.png",
            sizes:"4167x2084",
            type: "image/png"
          }
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,jpg,svg}'],
        maximumFileSizeToCacheInBytes: 6000000,
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      }
    })
  ],
  server: {
    host: true,
    port: 5173,
  },
})
