export const config = {
  runtime: 'edge',
};

function footballKey(): string {
  return process.env.FOOTBALL_API_KEY ?? '';
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  const key = footballKey();
  if (!key) {
    return Response.json({ success: false, message: 'Нет FOOTBALL_API_KEY' }, { status: 500 });
  }

  const url = new URL(request.url);
  const action = url.pathname.split('/').filter(Boolean).pop();
  const upstream = new URL('https://live-football-api.com/api/v1/player_search');
  upstream.searchParams.set('api_key', key);
  upstream.searchParams.set('lang', 'ru');

  if (action === 'search') {
    const q = url.searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) {
      return Response.json({ success: true, data: { players: [] } });
    }
    upstream.pathname = '/api/v1/player_search';
    upstream.searchParams.set('q', q);
  }
  else if (action === 'player') {
    const playerId = url.searchParams.get('player_id')?.trim() ?? '';
    if (!playerId) {
      return Response.json({ success: false, message: 'Нет player_id' }, { status: 400 });
    }
    upstream.pathname = '/api/v1/player';
    upstream.searchParams.set('player_id', playerId);
  }
  else {
    return Response.json({ success: false, message: 'Unknown action' }, { status: 404 });
  }

  const remote = await fetch(upstream);
  const body = await remote.text();
  return new Response(body, {
    status: remote.status,
    headers: { 'content-type': remote.headers.get('content-type') ?? 'application/json' },
  });
}
