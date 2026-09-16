export const config = {
  runtime: 'edge',
};

const YANDEX_API = 'https://ai.api.cloud.yandex.net/v1/chat/completions';

function readYandexEnv() {
  const yandexApiKey = process.env.YANDEX_API_KEY ?? process.env.VITE_YANDEX_API_KEY ?? '';
  const yandexFolderId = process.env.YANDEX_FOLDER_ID ?? process.env.VITE_YANDEX_FOLDER_ID ?? '';
  return { yandexApiKey, yandexFolderId };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  const { yandexApiKey, yandexFolderId } = readYandexEnv();
  if (!yandexApiKey || !yandexFolderId) {
    return Response.json({ error: 'Yandex proxy is not configured' }, { status: 500 });
  }

  const upstream = await fetch(YANDEX_API, {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${yandexApiKey}`,
      'x-folder-id': yandexFolderId,
      'Content-Type': 'application/json',
    },
    body: await request.text(),
  });

  const body = await upstream.text();
  return new Response(body, {
    status: upstream.status,
    headers: {
      'content-type': upstream.headers.get('content-type') ?? 'application/json',
    },
  });
}
