import { MOCK_USERS } from '@/stores/auth/mocks';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/user';

/** Рейтинги по периодам расходятся, чтобы переключатель было видно в демо. */
const PERIOD_FACTOR: Record<LeaderboardPeriod, number> = {
  week: 0.32,
  month: 0.68,
  all: 1,
};

const DELTAS = [2, -1, 0, 3, -2, 1, 0, -3];

export function mockLeaderboard(period: LeaderboardPeriod): LeaderboardEntry[] {
  const factor = PERIOD_FACTOR[period];

  return MOCK_USERS
    .map((user, index) => ({
      user,
      rating: Math.round(user.rating * factor),
      gamesWon: Math.round((40 - index * 3) * factor),
      delta: DELTAS[index] ?? 0,
    }))
    .sort((a, b) => b.rating - a.rating)
    .map((entry, index) => ({ ...entry, place: index + 1 }));
}
