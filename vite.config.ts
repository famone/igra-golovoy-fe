import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
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
    },
  },
});
