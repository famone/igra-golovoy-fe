/** Обёртка над localStorage: в Telegram-вебвью он может быть недоступен. */
export function readStorage(key: string): string | null {
  try {
    return localStorage.getItem(key);
  }
  catch {
    return null;
  }
}

export function writeStorage(key: string, value: string | null) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, value);
  }
  catch {
    // Хранилище недоступно — значение просто не переживёт перезагрузку.
  }
}

export function readJson<T>(key: string, fallback: T): T {
  const raw = readStorage(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  }
  catch {
    return fallback;
  }
}

export function writeJson(key: string, value: unknown) {
  writeStorage(key, JSON.stringify(value));
}
