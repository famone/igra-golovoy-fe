const OPENAI_API = 'https://api.openai.com/v1/chat/completions';
const DEFAULT_MODEL = 'gpt-6-luna';

export function openAiModel(): string {
  return (process.env.OPENAI_MODEL || DEFAULT_MODEL).trim() || DEFAULT_MODEL;
}

export async function completeOpenAI(apiKey: string, body: string): Promise<Response> {
  if (!apiKey.trim()) {
    return Response.json({ error: { message: 'Нет OPENAI_API_KEY' } }, { status: 500 });
  }

  let payload: Record<string, unknown>;
  try {
    payload = JSON.parse(body) as Record<string, unknown>;
  }
  catch {
    return Response.json({ error: { message: 'Некорректный JSON' } }, { status: 400 });
  }

  const upstream = await fetch(OPENAI_API, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey.trim()}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ...payload, model: openAiModel() }),
  });

  const text = await upstream.text();
  return new Response(text, {
    status: upstream.status,
    headers: { 'content-type': upstream.headers.get('content-type') ?? 'application/json' },
  });
}

export const config = { runtime: 'edge' };

export default function handler(request: Request): Promise<Response> {
  if (request.method !== 'POST') {
    return Promise.resolve(Response.json({ error: { message: 'Method not allowed' } }, { status: 405 }));
  }
  return request.text().then((body) => completeOpenAI(process.env.OPENAI_API_KEY ?? '', body));
}
