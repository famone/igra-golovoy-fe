import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { toast } from 'vue3-toastify';
import { createTransport } from '@/lib/realtime';
import { haptics } from '@/lib/telegram';
import { useAuthStore } from '@/stores/auth';
import { MockGameEngine } from '@/stores/game/mocks';
import type { ActionId } from '@/types/cards';
import type { GameResultRow, GameState, Room } from '@/types/game';
import type { ConnectionStatus, RealtimeTransport } from '@/types/realtime';

export const useGameStore = defineStore('game', () => {
  const authStore = useAuthStore();

  const room = ref<Room | null>(null);
  const state = ref<GameState | null>(null);
  const results = ref<GameResultRow[] | null>(null);
  const connectionStatus = ref<ConnectionStatus>('idle');
  const lastError = ref<string | null>(null);

  let transport: RealtimeTransport | null = null;
  let disposers: (() => void)[] = [];

  const me = computed(() => {
    const myId = authStore.user?.id;
    return state.value?.players.find((player) => player.user.id === myId) ?? null;
  });

  const isMyTurn = computed(() => {
    const myId = authStore.user?.id;
    return Boolean(myId && state.value?.turn.activePlayerId === myId);
  });

  const activePlayer = computed(() => {
    const activeId = state.value?.turn.activePlayerId;
    return state.value?.players.find((player) => player.user.id === activeId) ?? null;
  });

  /** Карты руки, которые можно положить в слот поля прямо сейчас. */
  const canDiscard = computed(
    () => isMyTurn.value && state.value?.turn.phase === 'discarding',
  );

  const canAnswer = computed(
    () => isMyTurn.value && state.value?.turn.phase === 'answering',
  );

  /** По правилам объявить «один на один» нужно на предпоследней карте. */
  const shouldDeclareLastCard = computed(
    () => (me.value?.handCount ?? 0) === 2 && !me.value?.declaredLastCard,
  );

  function CONNECT(roomId: string) {
    DISCONNECT();

    const viewerId = authStore.user?.id ?? 'u-me';
    const engine = new MockGameEngine(roomId, viewerId);

    transport = createTransport({
      mock: {
        reduce: (event) => engine.handle(event),
        latencyMs: 140,
      },
    });

    disposers = [
      transport.onStatusChange((status) => {
        connectionStatus.value = status;
      }),
      transport.on('room:updated', (payload) => {
        room.value = payload;
      }),
      transport.on('game:state', (payload) => {
        state.value = payload;
      }),
      transport.on('game:log', (payload) => {
        if (!state.value) return;
        state.value.log = [...state.value.log, payload];
      }),
      transport.on('game:finished', (payload) => {
        results.value = payload.results;
        haptics.success();
      }),
      transport.on('error', (payload) => {
        lastError.value = payload.message;
        haptics.error();
        toast.error(payload.message);
      }),
    ];

    transport.connect();
    transport.send({ type: 'room:join', payload: { roomId } });
  }

  function DISCONNECT() {
    for (const dispose of disposers) dispose();
    disposers = [];
    transport?.disconnect();
    transport = null;
    connectionStatus.value = 'idle';
  }

  function RESET() {
    DISCONNECT();
    room.value = null;
    state.value = null;
    results.value = null;
    lastError.value = null;
  }

  function START_GAME() {
    transport?.send({ type: 'room:start', payload: {} });
  }

  function SUBMIT_ANSWER(answer: string) {
    lastError.value = null;
    haptics.tap();
    transport?.send({ type: 'turn:answer', payload: { answer } });
  }

  /** Время вышло или игрок сдался — берём штрафные карты. */
  function SKIP_TURN() {
    haptics.error();
    transport?.send({ type: 'turn:skip', payload: {} });
  }

  function DISCARD_CARD(instanceId: string) {
    haptics.tap();
    transport?.send({ type: 'turn:discard', payload: { instanceId } });
  }

  function PLAY_ACTION(actionId: ActionId, targetSlot?: number) {
    haptics.tap();
    transport?.send({ type: 'turn:action', payload: { actionId, targetSlot } });
  }

  function DECLARE_LAST_CARD() {
    haptics.success();
    transport?.send({ type: 'turn:declare-last-card', payload: {} });
  }

  function CALL_OFFSIDE(targetPlayerId: string) {
    haptics.tap();
    transport?.send({ type: 'turn:offside', payload: { targetPlayerId } });
  }

  return {
    room,
    state,
    results,
    connectionStatus,
    lastError,
    me,
    isMyTurn,
    activePlayer,
    canAnswer,
    canDiscard,
    shouldDeclareLastCard,
    CONNECT,
    DISCONNECT,
    RESET,
    START_GAME,
    SUBMIT_ANSWER,
    SKIP_TURN,
    DISCARD_CARD,
    PLAY_ACTION,
    DECLARE_LAST_CARD,
    CALL_OFFSIDE,
  };
});
