import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useGameStore } from '@/stores/game';

/** Подпись и цвет индикатора соединения для шапки экрана партии. */
export function useRealtimeStatus() {
  const gameStore = useGameStore();
  const { connectionStatus } = storeToRefs(gameStore);

  const label = computed(() => {
    switch (connectionStatus.value) {
      case 'open': return 'На связи';
      case 'connecting': return 'Подключение…';
      case 'reconnecting': return 'Переподключение…';
      case 'closed': return 'Нет связи';
      default: return 'Ожидание';
    }
  });

  return {
    status: connectionStatus,
    label,
    isOnline: computed(() => connectionStatus.value === 'open'),
    isDegraded: computed(
      () => connectionStatus.value === 'reconnecting' || connectionStatus.value === 'closed',
    ),
  };
}
