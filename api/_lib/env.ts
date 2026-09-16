/**
 * Env для Vercel serverless (`api/*`).
 * На проде — только YANDEX_* из дашборда Vercel.
 * Локально `vercel dev` подхватывает `.env`; fallback на VITE_* для удобства.
 */
export function readYandexServerEnv() {
  const yandexApiKey = process.env.YANDEX_API_KEY ?? process.env.VITE_YANDEX_API_KEY ?? '';
  const yandexFolderId = process.env.YANDEX_FOLDER_ID ?? process.env.VITE_YANDEX_FOLDER_ID ?? '';

  return { yandexApiKey, yandexFolderId };
}
