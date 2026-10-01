function footballKey(): string {
  return process.env.FOOTBALL_API_KEY ?? '';
}

export async function proxyFootball(request: Request, kind: 'search' | 'player'): Promise<Response> {
  if (request.method !== 'GET') {
    return Response.json({ success: false, message: 'Method not allowed' }, { status: 405 });
  }

  const key = footballKey();
  if (!key) {
    return Response.json({ success: false, message: 'Нет FOOTBALL_API_KEY' }, { status: 500 });
  }

  const incoming = new URL(request.url);
  const upstream = new URL(
    kind === 'search'
      ? 'https://live-football-api.com/api/v1/player_search'
      : 'https://live-football-api.com/api/v1/player',
  );
  upstream.searchParams.set('api_key', key);
  upstream.searchParams.set('lang', incoming.searchParams.get('lang') || 'ru');

  if (kind === 'search') {
    const q = incoming.searchParams.get('q')?.trim() ?? '';
    if (q.length < 2) {
      return Response.json({ success: true, data: { players: [] } });
    }
    upstream.searchParams.set('q', q);
  }
  else {
    const playerId = incoming.searchParams.get('player_id')?.trim() ?? '';
    if (!playerId) {
      return Response.json({ success: false, message: 'Нет player_id' }, { status: 400 });
    }
    upstream.searchParams.set('player_id', playerId);
  }

  const remote = await fetch(upstream);
  const body = await remote.text();
  return new Response(body, {
    status: remote.status,
    headers: { 'content-type': remote.headers.get('content-type') ?? 'application/json' },
  });
}
