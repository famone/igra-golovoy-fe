import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { http, withMockFallback } from '@/lib/http';
import { DEFAULT_ROOM_SETTINGS, MOCK_ROOMS } from '@/stores/arena/mocks';
import { useAuthStore } from '@/stores/auth';
import type { CreateRoomPayload, Room, RoomStatus } from '@/types/game';

/** Вкладки фильтра на «Арене». */
export type ArenaFilter = 'all' | 'waiting' | 'playing' | 'mine';

export const useArenaStore = defineStore('arena', () => {
  const rooms = ref<Room[]>([]);
  const filter = ref<ArenaFilter>('all');
  const loading = ref(false);
  const isLoaded = ref(false);

  const authStore = useAuthStore();

  function isMine(room: Room) {
    const myId = authStore.user?.id;
    if (!myId) return false;
    return room.players.some((player) => player.user.id === myId);
  }

  const visibleRooms = computed(() => {
    if (filter.value === 'mine') return rooms.value.filter(isMine);
    if (filter.value === 'all') return rooms.value;
    return rooms.value.filter((room) => room.status === (filter.value as RoomStatus));
  });

  const counts = computed(() => ({
    all: rooms.value.length,
    waiting: rooms.value.filter((room) => room.status === 'waiting').length,
    playing: rooms.value.filter((room) => room.status === 'playing').length,
    mine: rooms.value.filter(isMine).length,
  }));

  async function FETCH_ROOMS() {
    loading.value = true;
    try {
      rooms.value = await withMockFallback<Room[]>(
        async () => {
          const response = await http.get<Room[]>('/rooms');
          return response.data;
        },
        () => MOCK_ROOMS,
      );
      isLoaded.value = true;
      return rooms.value;
    }
    finally {
      loading.value = false;
    }
  }

  async function CREATE_ROOM(payload: CreateRoomPayload) {
    loading.value = true;
    try {
      const room = await withMockFallback<Room>(
        async () => {
          const response = await http.post<Room>('/rooms', payload);
          return response.data;
        },
        () => mockCreatedRoom(payload),
      );

      rooms.value = [room, ...rooms.value];
      return room;
    }
    finally {
      loading.value = false;
    }
  }

  /** Присоединение по шестизначному коду из приглашения. */
  async function JOIN_BY_CODE(code: string) {
    const normalized = code.trim().toUpperCase();

    return withMockFallback<Room | null>(
      async () => {
        const response = await http.post<Room>('/rooms/join', { code: normalized });
        return response.data;
      },
      () => rooms.value.find((room) => room.code === normalized) ?? null,
    );
  }

  function mockCreatedRoom(payload: CreateRoomPayload): Room {
    const me = authStore.user;
    const id = `room-${Date.now()}`;

    return {
      id,
      code: id.slice(-6).toUpperCase(),
      title: payload.title,
      status: 'waiting',
      visibility: payload.visibility,
      settings: { ...DEFAULT_ROOM_SETTINGS, ...payload.settings },
      players: me
        ? [{ user: me, isHost: true, isReady: true, isConnected: true }]
        : [],
      createdAt: new Date().toISOString(),
      playersCount: me ? 1 : 0,
      spectatorsCount: 0,
    };
  }

  function SET_FILTER(value: ArenaFilter) {
    filter.value = value;
  }

  return {
    rooms,
    filter,
    loading,
    isLoaded,
    visibleRooms,
    counts,
    FETCH_ROOMS,
    CREATE_ROOM,
    JOIN_BY_CODE,
    SET_FILTER,
  };
});
