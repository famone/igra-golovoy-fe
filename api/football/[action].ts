interface FootballRequest {
  method?: string;
  query: Record<string, string | string[] | undefined>;
}

interface FootballResponse {
  status: (code: number) => FootballResponse;
  json: (body: unknown) => void;
  send: (body: string) => void;
  setHeader: (name: string, value: string) => void;
}

function queryValue(value: string | string[] | undefined): string {
  if (Array.isArray(value)) return value[0]?.trim() ?? '';
  return value?.trim() ?? '';
}

export default async function handler(req: FootballRequest, res: FootballResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ success: false, message: 'Method not allowed' });
    return;
  }

  const key = process.env.FOOTBALL_API_KEY ?? '';
  if (!key) {
    res.status(500).json({ success: false, message: 'Нет FOOTBALL_API_KEY' });
    return;
  }

  const action = queryValue(req.query.action);
  const upstream = new URL('https://live-football-api.com/api/v1/player_search');
  upstream.searchParams.set('api_key', key);
  upstream.searchParams.set('lang', 'ru');

  if (action === 'search') {
    const q = queryValue(req.query.q);
    if (q.length < 2) {
      res.status(200).json({ success: true, data: { players: [] } });
      return;
    }
    upstream.pathname = '/api/v1/player_search';
    upstream.searchParams.set('q', q);
  }
  else if (action === 'player') {
    const playerId = queryValue(req.query.player_id);
    if (!playerId) {
      res.status(400).json({ success: false, message: 'Нет player_id' });
      return;
    }
    upstream.pathname = '/api/v1/player';
    upstream.searchParams.set('player_id', playerId);
  }
  else {
    res.status(404).json({ success: false, message: 'Unknown action' });
    return;
  }

  const remote = await fetch(upstream);
  const body = await remote.text();
  res.status(remote.status).setHeader('content-type', remote.headers.get('content-type') ?? 'application/json');
  res.send(body);
}
