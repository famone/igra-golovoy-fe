import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http, withMockFallback } from '@/lib/http';
import { mockProfile } from '@/stores/auth/mocks';
import { useAuthStore } from '@/stores/auth';
import type { Profile } from '@/types/user';

export const useProfileStore = defineStore('profile', () => {
  const authStore = useAuthStore();

  const profile = ref<Profile | null>(null);
  const loading = ref(false);

  const winRate = computed(() => {
    const stats = profile.value?.stats;
    if (!stats?.gamesPlayed) return 0;
    return stats.gamesWon / stats.gamesPlayed;
  });

  const unlockedAchievements = computed(
    () => profile.value?.achievements.filter((item) => item.unlockedAt) ?? [],
  );

  async function FETCH_PROFILE() {
    loading.value = true;
    try {
      profile.value = await withMockFallback<Profile>(
        async () => {
          const response = await http.get<Profile>('/profile');
          return response.data;
        },
        () => mockProfile(authStore.user ?? {
          id: 'u-me',
          name: 'Локальный Игрок',
          rating: 2180,
        }),
      );
      return profile.value;
    }
    finally {
      loading.value = false;
    }
  }

  return {
    profile,
    loading,
    winRate,
    unlockedAchievements,
    FETCH_PROFILE,
  };
});
