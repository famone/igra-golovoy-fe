import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { getToken, http, setToken, withMockFallback } from '@/lib/http';
import { getRawInitData, getTelegramIdentity } from '@/lib/telegram';
import type { TelegramIdentity, User } from '@/types/user';

interface AuthResponse {
  token: string;
  user: User;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getToken());
  const user = ref<User | null>(null);
  const identity = ref<TelegramIdentity | null>(null);
  const loading = ref(false);
  const isReady = ref(false);

  const isAuthenticated = computed(() => Boolean(user.value));

  const displayName = computed(() => user.value?.name ?? 'Гость');

  function mockAuth(): AuthResponse {
    const tg = identity.value;
    const name = tg
      ? [tg.firstName, tg.lastName].filter(Boolean).join(' ')
      : 'Локальный Игрок';

    return {
      token: 'mock-token',
      user: {
        id: tg ? `tg-${tg.telegramId}` : 'u-me',
        name,
        username: tg?.username,
        avatarUrl: tg?.photoUrl,
        rating: 2180,
      },
    };
  }

  /**
   * Вход через Telegram: сырую `initData` проверяет бэкенд подписью бота.
   * Отдельной формы логина в мини-приложении нет.
   */
  async function LOGIN_WITH_TELEGRAM() {
    loading.value = true;
    try {
      identity.value = getTelegramIdentity();
      const initData = getRawInitData();

      const data = await withMockFallback<AuthResponse>(
        async () => {
          const response = await http.post<AuthResponse>('/auth/telegram', { initData });
          return response.data;
        },
        mockAuth,
      );

      token.value = data.token;
      setToken(data.token);
      user.value = data.user;
      return true;
    }
    finally {
      loading.value = false;
    }
  }

  async function FETCH_ME() {
    const data = await withMockFallback<User>(
      async () => {
        const response = await http.get<User>('/auth/me');
        return response.data;
      },
      () => mockAuth().user,
    );

    user.value = data;
    return data;
  }

  function LOGOUT() {
    token.value = null;
    user.value = null;
    setToken(null);
  }

  /** Точка входа приложения: вызывается один раз из `main.ts` до монтирования роутера. */
  async function INIT() {
    if (isReady.value) return;
    await LOGIN_WITH_TELEGRAM();
    isReady.value = true;
  }

  return {
    token,
    user,
    identity,
    loading,
    isReady,
    isAuthenticated,
    displayName,
    LOGIN_WITH_TELEGRAM,
    FETCH_ME,
    LOGOUT,
    INIT,
  };
});
