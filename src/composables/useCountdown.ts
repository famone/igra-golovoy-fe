import { computed, onBeforeUnmount, readonly, ref, watch, type MaybeRefOrGetter, toValue } from 'vue';

export interface UseCountdownOptions {
  /** Частота обновления, мс. 100 достаточно для плавной шкалы. */
  tickMs?: number;
  onExpire?: () => void;
}

/**
 * Обратный отсчёт до абсолютной метки времени.
 *
 * Считаем именно от `deadlineAt`, а не от «осталось N секунд»: так таймер
 * переживает сворачивание мини-приложения и переподключение к сокету —
 * после возврата он покажет реальный остаток, а не замороженный.
 */
export function useCountdown(
  deadlineAt: MaybeRefOrGetter<string | null>,
  totalSeconds: MaybeRefOrGetter<number>,
  options: UseCountdownOptions = {},
) {
  const remainingMs = ref(0);
  let timer: number | null = null;
  let hasExpired = false;

  function stop() {
    if (timer !== null) {
      window.clearInterval(timer);
      timer = null;
    }
  }

  function tick() {
    const deadline = toValue(deadlineAt);
    if (!deadline) {
      remainingMs.value = 0;
      return;
    }

    const left = new Date(deadline).getTime() - Date.now();
    remainingMs.value = Math.max(0, left);

    if (left <= 0 && !hasExpired) {
      hasExpired = true;
      stop();
      options.onExpire?.();
    }
  }

  function start() {
    stop();
    hasExpired = false;
    tick();
    if (!toValue(deadlineAt)) return;
    timer = window.setInterval(tick, options.tickMs ?? 100);
  }

  watch(() => toValue(deadlineAt), start, { immediate: true });

  onBeforeUnmount(stop);

  const remainingSeconds = computed(() => Math.ceil(remainingMs.value / 1000));

  const progress = computed(() => {
    const total = toValue(totalSeconds) * 1000;
    if (total <= 0) return 0;
    return Math.min(1, Math.max(0, remainingMs.value / total));
  });

  return {
    remainingMs: readonly(remainingMs),
    remainingSeconds,
    progress,
    /** Последние 10 секунд — интерфейс переходит в тревожное состояние. */
    isCritical: computed(() => remainingMs.value > 0 && remainingMs.value <= 10_000),
    isExpired: computed(() => Boolean(toValue(deadlineAt)) && remainingMs.value === 0),
    start,
    stop,
  };
}
