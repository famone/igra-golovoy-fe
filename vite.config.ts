import { fileURLToPath, URL } from 'node:url';

import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const footballKey = env.FOOTBALL_API_KEY || '';

  return {
  plugins: [
    vue(),
    vueDevTools(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Telegram открывает мини-приложение по https-туннелю (ngrok/cloudflared),
    // поэтому хост из туннеля должен быть разрешён.
    allowedHosts: true,
    // Браузер не может бить в AI Studio из‑за CORS — проксируем только для /test-yandex.
    proxy: {
      '/yandex-ai': {
        target: 'https://ai.api.cloud.yandex.net',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yandex-ai/, ''),
      },
      '/api/football': {
        target: 'https://live-football-api.com',
        changeOrigin: true,
        rewrite: (path) => {
          const url = new URL(path, 'http://local');
          const action = url.pathname.split('/').filter(Boolean).pop();
          const params = new URLSearchParams({ api_key: footballKey });
          params.set('lang', url.searchParams.get('lang') || 'ru');
          if (action === 'search') {
            params.set('q', url.searchParams.get('q') ?? '');
            return `/api/v1/player_search?${params.toString()}`;
          }
          params.set('player_id', url.searchParams.get('player_id') ?? '');
          return `/api/v1/player?${params.toString()}`;
        },
      },
    },
  },
  };
});
