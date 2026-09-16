import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readYandexServerEnv } from '../../../_lib/env';

const YANDEX_API = 'https://ai.api.cloud.yandex.net/v1/chat/completions';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { yandexApiKey: apiKey, yandexFolderId: folderId } = readYandexServerEnv();
  if (!apiKey || !folderId) {
    return res.status(500).json({ error: 'Yandex proxy is not configured' });
  }

  const upstream = await fetch(YANDEX_API, {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      'x-folder-id': folderId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req.body),
  });

  const body = await upstream.text();
  const contentType = upstream.headers.get('content-type') ?? 'application/json';
  return res.status(upstream.status).setHeader('content-type', contentType).send(body);
}
