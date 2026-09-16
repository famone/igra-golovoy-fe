import { MOCK_USERS } from '@/stores/auth/mocks';
import type { Room, RoomPlayer, RoomSettings } from '@/types/game';

export const DEFAULT_ROOM_SETTINGS: RoomSettings = {
  format: 'knockout',
  difficulty: 'standard',
  turnSeconds: 30,
  maxPlayers: 6,
  hardcoreRepeats: false,
};

function playersFrom(indices: number[], hostIndex = 0): RoomPlayer[] {
  return indices.map((index, position) => ({
    user: MOCK_USERS[index]!,
    isHost: position === hostIndex,
    isReady: position !== indices.length - 1,
    isConnected: true,
  }));
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export const MOCK_ROOMS: Room[] = [
  {
    id: 'room-1',
    code: 'GOLOVA',
    title: 'Вечерний матч',
    status: 'waiting',
    visibility: 'public',
    settings: { ...DEFAULT_ROOM_SETTINGS, maxPlayers: 6 },
    players: playersFrom([0, 1, 2]),
    createdAt: minutesAgo(4),
    playersCount: 3,
    spectatorsCount: 2,
  },
  {
    id: 'room-2',
    code: 'FERGIE',
    title: 'На очки, три раунда',
    status: 'waiting',
    visibility: 'public',
    settings: { ...DEFAULT_ROOM_SETTINGS, format: 'points', maxPlayers: 4, hardcoreRepeats: true },
    players: playersFrom([3, 4]),
    createdAt: minutesAgo(11),
    playersCount: 2,
    spectatorsCount: 0,
  },
  {
    id: 'room-3',
    code: 'OFSIDE',
    title: 'Только хардкор',
    status: 'playing',
    visibility: 'public',
    settings: { ...DEFAULT_ROOM_SETTINGS, format: 'points', turnSeconds: 20, hardcoreRepeats: true },
    players: playersFrom([5, 6, 7, 0]),
    createdAt: minutesAgo(23),
    playersCount: 4,
    spectatorsCount: 7,
  },
  {
    id: 'room-4',
    code: 'NOVICE',
    title: 'Простой вариант, для новичков',
    status: 'waiting',
    visibility: 'public',
    settings: { ...DEFAULT_ROOM_SETTINGS, difficulty: 'simple', turnSeconds: 45, maxPlayers: 8 },
    players: playersFrom([2, 5]),
    createdAt: minutesAgo(2),
    playersCount: 2,
    spectatorsCount: 1,
  },
  {
    id: 'room-5',
    code: 'BLITZ7',
    title: 'Блиц на вылет',
    status: 'playing',
    visibility: 'public',
    settings: { ...DEFAULT_ROOM_SETTINGS, turnSeconds: 15, maxPlayers: 5 },
    players: playersFrom([1, 3, 6]),
    createdAt: minutesAgo(38),
    playersCount: 3,
    spectatorsCount: 4,
  },
];
