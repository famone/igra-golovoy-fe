export interface PlayerSearchHit {
  id: string;
  name: string;
  photo: string;
  country: string;
}

export interface PlayerCareerEntry {
  team?: { id?: string; name?: string };
  date_start?: string;
  is_loaned?: boolean;
  seasons?: Array<{
    name?: string;
    competitions?: Array<{
      league?: { id?: string; name?: string };
      appearances?: number;
    }>;
  }>;
}

export interface PlayerProfile {
  player_id: string;
  name: string;
  first_name?: string;
  last_name?: string;
  photo?: string;
  position?: string;
  nationality?: string;
  birthdate?: string;
  current_team?: { id?: string; name?: string } | null;
  clubs_career?: PlayerCareerEntry[];
  internationals_career?: PlayerCareerEntry[];
}

interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data?: T;
}

const SEARCH_LIMIT = 10;

async function readApi<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const raw = await res.text();
  let body: ApiEnvelope<T>;
  try {
    body = JSON.parse(raw) as ApiEnvelope<T>;
  }
  catch {
    throw new Error('Поиск вернул не JSON. Проверь, что на Vercel задеплоена функция /api/football и задан FOOTBALL_API_KEY.');
  }
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Football API ${res.status}`);
  }
  if (!body.data) throw new Error('Пустой ответ Football API');
  return body.data;
}

export async function searchPlayers(query: string, signal?: AbortSignal): Promise<PlayerSearchHit[]> {
  const q = query.trim();
  if (q.length < 2) return [];
  const data = await readApi<{ players?: PlayerSearchHit[] }>(
    `/api/football/search?q=${encodeURIComponent(q)}&lang=ru`,
    signal,
  );
  if (signal?.aborted) return [];
  return (data.players ?? []).slice(0, SEARCH_LIMIT);
}

export async function fetchPlayer(playerId: string, signal?: AbortSignal): Promise<PlayerProfile> {
  return readApi<PlayerProfile>(
    `/api/football/player?player_id=${encodeURIComponent(playerId)}&lang=ru`,
    signal,
  );
}
