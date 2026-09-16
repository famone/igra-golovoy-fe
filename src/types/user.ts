export interface TelegramIdentity {
  telegramId: number;
  username?: string;
  firstName: string;
  lastName?: string;
  photoUrl?: string;
  isPremium?: boolean;
}

export interface User {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  /** Рейтинг игрока, по нему строится таблица лидеров. */
  rating: number;
  createdAt?: string;
}

export interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  /** Доля верных ответов, 0..1. */
  accuracy: number;
  /** Среднее время ответа в секундах. */
  averageAnswerTime: number;
  bestStreak: number;
  favouritePlayer?: string;
}

export interface Profile extends User {
  stats: UserStats;
  achievements: Achievement[];
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlockedAt?: string;
}

export interface LeaderboardEntry {
  place: number;
  user: User;
  rating: number;
  gamesWon: number;
  /** Изменение места с прошлого пересчёта. */
  delta: number;
}

export type LeaderboardPeriod = 'week' | 'month' | 'all';
