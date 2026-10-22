import { fileURLToPath, URL } from 'node:url';

import { completeOpenAI } from './api/openai/completions';
import { searchFromLiveFootball } from './api/football/search';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      vue(),
      vueDevTools(),
      tailwindcss(),
      {
        name: 'judge-dev-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const rawUrl = req.url ?? '';
            if (!rawUrl.startsWith('/api/football/') && !rawUrl.startsWith('/api/openai/')) return next();
            try {
              const url = new URL(rawUrl, 'http://local');
              if (rawUrl.startsWith('/api/football/') && !url.pathname.endsWith('/search')) {
                res.statusCode = 404;
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({ success: false, message: 'Неизвестный маршрут' }));
                return;
              }
              const response = rawUrl.startsWith('/api/openai/')
                ? await readBody(req).then((body) => completeOpenAI(env.OPENAI_API_KEY ?? '', body))
                : await searchFromLiveFootball(env.FOOTBALL_API_KEY ?? '', url.searchParams.get('q') ?? '');
              const text = await response.text();
              res.statusCode = response.status;
              res.setHeader('content-type', 'application/json');
              res.end(text);
            }
            catch (error) {
              res.statusCode = 502;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({
                success: false,
                message: error instanceof Error ? error.message : 'Прокси судьи недоступен',
              }));
            }
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      allowedHosts: true,
    },
  };
});

function readBody(req: import('node:http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}
