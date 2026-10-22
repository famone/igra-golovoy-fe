import { latinSearchQuery } from '@/lib/latinSearchQuery';

export interface PlayerSearchHit {
  id: string;
  name: string;
  photo: string;
  country: string;
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
    throw new Error('Поиск вернул не JSON. Проверь прокси /api/football и ключ Live Football API.');
  }
  if (!res.ok || body.success === false) {
    throw new Error(body.message || `Football API ${res.status}`);
  }
  if (!body.data) throw new Error('Пустой ответ Football API');
  return body.data;
}

export async function searchPlayers(query: string, signal?: AbortSignal): Promise<PlayerSearchHit[]> {
  const typed = query.trim();
  if (typed.length < 2) return [];
  const q = latinSearchQuery(typed);
  if (q.length < 2) return [];
  const data = await readApi<{ players?: PlayerSearchHit[] }>(
    `/api/football/search?q=${encodeURIComponent(q)}`,
    signal,
  );
  if (signal?.aborted) return [];
  return (data.players ?? []).slice(0, SEARCH_LIMIT);
}
