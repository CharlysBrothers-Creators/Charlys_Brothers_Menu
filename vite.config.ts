import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'url';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    base: '/Charlys_Brothers_Menu/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'images/dbatule-hero.jpg',
          'images/restaurant-ambience.jpg',
        ],
        manifest: {
          id: '/Charlys_Brothers_Menu/',
          name: 'D’Batule Restaurante',
          short_name: 'D’Batule',
          description:
            'Catálogo digital interactivo y experiencia gastronÃ³mica de D’Batule Restaurante en La Habana, Cuba.',
          theme_color: '#1A1A1A',
          background_color: '#1A1A1A',
          display: 'standalone',
          orientation: 'portrait',
          start_url: '/Charlys_Brothers_Menu/',
          scope: '/Charlys_Brothers_Menu/',
          icons: [
            {
              src: '/Charlys_Brothers_Menu/pwa-192x192.png',
              sizes: '192x192',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/Charlys_Brothers_Menu/pwa-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'any',
  },
  {
    src: '/Charlys_Brothers_Menu/pwa-maskable-512x512.png',
    sizes: '512x512',
    type: 'image/png',
    purpose: 'maskable',
  },
],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
          globIgnores: ['**/assets/aistudio/**'],
          maximumFileSizeToCacheInBytes: 4 * 1024 * 1024,
        },
        devOptions: {
          enabled: true,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('.', import.meta.url)),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

