import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http, withMockFallback } from '@/lib/http';
import { mockLeaderboard } from '@/stores/leaders/mocks';
import { useAuthStore } from '@/stores/auth';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/user';

export const useLeadersStore = defineStore('leaders', () => {
  const authStore = useAuthStore();

  const entries = ref<LeaderboardEntry[]>([]);
  const period = ref<LeaderboardPeriod>('week');
  const loading = ref(false);

  /** Первые три места выносятся на подиум, остальные идут списком. */
  const podium = computed(() => entries.value.slice(0, 3));
  const rest = computed(() => entries.value.slice(3));

  const myEntry = computed(() => {
    const myId = authStore.user?.id;
    if (!myId) return null;
    return entries.value.find((entry) => entry.user.id === myId) ?? null;
  });

  async function FETCH_LEADERBOARD(nextPeriod: LeaderboardPeriod = period.value) {
    period.value = nextPeriod;
    loading.value = true;
    try {
      entries.value = await withMockFallback<LeaderboardEntry[]>(
        async () => {
          const response = await http.get<LeaderboardEntry[]>('/leaderboard', {
            params: { period: nextPeriod },
          });
          return response.data;
        },
        () => mockLeaderboard(nextPeriod),
      );
      return entries.value;
    }
    finally {
      loading.value = false;
    }
  }

  return {
    entries,
    period,
    loading,
    podium,
    rest,
    myEntry,
    FETCH_LEADERBOARD,
  };
});
