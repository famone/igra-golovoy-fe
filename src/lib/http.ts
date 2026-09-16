import axios, { type AxiosError } from 'axios';
import { toast } from 'vue3-toastify';
import { env } from '@/lib/env';
import { readStorage, writeStorage } from '@/lib/storage';

const TOKEN_KEY = 'ig_token';

export function getToken() {
  return readStorage(TOKEN_KEY);
}

export function setToken(token: string | null) {
  writeStorage(TOKEN_KEY, token);
}

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter: string) => letter.toUpperCase());
}

export function convertKeysToCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(convertKeysToCamelCase);
  }
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date) && !(obj instanceof Blob)) {
    return Object.fromEntries(
      Object.entries(obj as Record<string, unknown>).map(([key, value]) => [
        snakeToCamel(key),
        convertKeysToCamelCase(value),
      ]),
    );
  }
  return obj;
}

export const http = axios.create({
  baseURL: env.apiUrl,
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

type ApiErrorBody = { message?: string; errors?: Record<string, string[]> };

function extractErrorMessage(error: AxiosError<ApiErrorBody>) {
  const data = error.response?.data;
  if (data?.message) return data.message;
  if (data?.errors) {
    const first = Object.values(data.errors)[0];
    if (first?.[0]) return first[0];
  }
  if (error.response?.status === 401) return 'Нужно войти заново';
  if (error.response?.status === 403) return 'Недостаточно прав';
  if (error.response?.status === 404) return 'Не найдено';
  if (error.response?.status === 409) return 'Действие уже неактуально';
  if (error.response?.status === 422) return 'Ошибка валидации';
  return error.message || 'Ошибка запроса';
}

http.interceptors.response.use(
  (response) => {
    if (response.data) {
      response.data = convertKeysToCamelCase(response.data);
    }
    return response;
  },
  (error: AxiosError<ApiErrorBody>) => {
    // Пока живём на моках, глобальные тосты об ошибках сети только мешают.
    const skipToast = Boolean(error.config?.headers?.['X-Skip-Error-Toast']) || env.useMocks;
    if (!skipToast) {
      toast.error(extractErrorMessage(error));
    }
    return Promise.reject(error);
  },
);

export function isEmptyPayload(payload: unknown): boolean {
  if (payload == null) return true;
  if (Array.isArray(payload)) return payload.length === 0;
  if (typeof payload === 'object') {
    return Object.keys(payload as object).length === 0;
  }
  return false;
}

export function isHttpError(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response != null;
}

/**
 * Единый способ пережить отсутствие бэкенда: пробуем реальный запрос,
 * при любой проблеме отдаём моки. Когда API появится — достаточно
 * выключить VITE_USE_MOCKS, код сторов менять не нужно.
 */
export async function withMockFallback<T>(
  request: () => Promise<T>,
  mock: () => T | Promise<T>,
): Promise<T> {
  if (!env.apiUrl || env.useMocks) {
    return mock();
  }

  try {
    const data = await request();
    if (isEmptyPayload(data)) return mock();
    return data;
  }
  catch {
    return mock();
  }
}
