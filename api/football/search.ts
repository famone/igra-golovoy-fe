const LIVE_FOOTBALL_SEARCH = 'https://live-football-api.com/api/v1/player_search';

interface LivePlayer {
  id?: string;
  name?: string;
  photo?: string;
  country?: string;
}

interface LiveSearch {
  success?: boolean;
  message?: string;
  data?: { players?: LivePlayer[] };
}

function json(body: unknown, status = 200): Response {
  return Response.json(body, { status });
}

export async function searchFromLiveFootball(apiKey: string, query: string): Promise<Response> {
  const q = query.trim();
  if (!apiKey.trim()) return json({ success: false, message: 'Нет FOOTBALL_API_KEY' }, 500);
  if (q.length < 2) return json({ success: true, data: { players: [] } });

  const url = new URL(LIVE_FOOTBALL_SEARCH);
  url.searchParams.set('api_key', apiKey.trim());
  url.searchParams.set('q', q);
  url.searchParams.set('lang', 'ru');

  const upstream = await fetch(url);
  const body = (await upstream.json()) as LiveSearch;
  if (!upstream.ok || body.success === false) {
    return json({ success: false, message: body.message || `Football API ${upstream.status}` }, upstream.status || 502);
  }

  const players = (body.data?.players ?? [])
    .slice(0, 10)
    .map((player) => ({
      id: player.id ?? '',
      name: player.name ?? '',
      photo: player.photo ?? '',
      country: player.country ?? '',
    }))
    .filter((player) => player.id && player.name);

  return json({ success: true, data: { players } });
}

export const config = { runtime: 'edge' };

export default function handler(request: Request): Promise<Response> {
  const query = new URL(request.url).searchParams.get('q') ?? '';
  return searchFromLiveFootball(process.env.FOOTBALL_API_KEY ?? '', query);
}
