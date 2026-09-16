function readBoolean(value: unknown, fallback: boolean): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === true;
}

/**
 * Единая точка чтения переменных окружения.
 * Прямые обращения к `import.meta.env` в коде приложения не используем —
 * так проще подменять значения в тестах и находить все флаги разом.
 */
export const env = {
  apiUrl: (import.meta.env.VITE_API_URL as string | undefined) ?? '/api/v1',
  wsUrl: (import.meta.env.VITE_WS_URL as string | undefined) ?? '',
  /** Пока бэкенда нет — сторы падают на моки при любой сетевой ошибке. */
  useMocks: readBoolean(import.meta.env.VITE_USE_MOCKS, true),
  /** Имитация окружения Telegram при разработке в обычном браузере. */
  mockTelegram: readBoolean(import.meta.env.VITE_MOCK_TELEGRAM, import.meta.env.DEV),
  isDev: import.meta.env.DEV,
  yandexApiKey: (import.meta.env.VITE_YANDEX_API_KEY as string | undefined) ?? '',
  yandexFolderId: (import.meta.env.VITE_YANDEX_FOLDER_ID as string | undefined) ?? '',
};
