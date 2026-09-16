import type { Achievement, Profile, User, UserStats } from '@/types/user';

/** Общий пул игроков для всех моков: арена, лидеры и партия ссылаются сюда. */
export const MOCK_USERS: User[] = [
  { id: 'u-1', name: 'Никита Панов', username: 'nikita', rating: 2480 },
  { id: 'u-2', name: 'Артём Кайгородов', username: 'kaygor', rating: 2415 },
  { id: 'u-3', name: 'Женя Про', username: 'zhenya', rating: 2270 },
  { id: 'u-4', name: 'Стас Авто', username: 'stas', rating: 2185 },
  { id: 'u-5', name: 'Марина Гол', username: 'marina', rating: 2090 },
  { id: 'u-6', name: 'Илья Бек', username: 'ilya', rating: 1975 },
  { id: 'u-7', name: 'Тимур Десятка', username: 'timur', rating: 1880 },
  { id: 'u-8', name: 'Оля Пас', username: 'olya', rating: 1790 },
];

export const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'ach-first-goal',
    title: 'Первый гол',
    description: 'Выиграй свою первую партию',
    icon: '⚽',
    unlockedAt: '2026-07-21T10:12:00.000Z',
  },
  {
    id: 'ach-hat-trick',
    title: 'Хет-трик',
    description: 'Выиграй три партии подряд',
    icon: '🎩',
    unlockedAt: '2026-08-02T19:40:00.000Z',
  },
  {
    id: 'ach-clean-sheet',
    title: 'Сухой матч',
    description: 'Пройди партию без единого штрафа',
    icon: '🧤',
  },
  {
    id: 'ach-fergie',
    title: 'Ферги-тайм',
    description: 'Ответь верно в последнюю секунду',
    icon: '⏱',
    unlockedAt: '2026-08-15T21:03:00.000Z',
  },
  {
    id: 'ach-encyclopedia',
    title: 'Энциклопедия',
    description: 'Назови 250 разных футболистов',
    icon: '📚',
  },
  {
    id: 'ach-golden-ball',
    title: 'Золотой мяч',
    description: 'Займи первое место в недельном рейтинге',
    icon: '🏆',
  },
];

const MOCK_STATS: UserStats = {
  gamesPlayed: 64,
  gamesWon: 27,
  accuracy: 0.71,
  averageAnswerTime: 12.4,
  bestStreak: 9,
  favouritePlayer: 'Лаутаро Мартинес',
};

export function mockProfile(user: User): Profile {
  return {
    ...user,
    stats: MOCK_STATS,
    achievements: MOCK_ACHIEVEMENTS,
  };
}
