<script setup lang="ts">
import { computed, watch } from 'vue';
import { useCountdown } from '@/composables/useCountdown';
import { formatClock } from '@/lib/format';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/utils';

/** Таймер хода: 30 секунд по правилам, плюс 30 при «Ферги-тайме». */
const props = withDefaults(
  defineProps<{
    deadlineAt: string | null;
    totalSeconds: number;
    /** Отсчёт идёт для текущего клиента — тогда включаем вибрацию. */
    isActive?: boolean;
    class?: string;
  }>(),
  {
    isActive: false,
  },
);

const emit = defineEmits<{
  expire: [];
}>();

const { remainingSeconds, progress, isCritical } = useCountdown(
  () => props.deadlineAt,
  () => props.totalSeconds,
  {
    onExpire: () => {
      if (props.isActive) haptics.error();
      emit('expire');
    },
  },
);

// Короткая вибрация на каждой из последних секунд — как свисток на добавленном времени.
watch(remainingSeconds, (value, previous) => {
  if (!props.isActive || value === previous) return;
  if (value > 0 && value <= 5) haptics.tap();
});

const barColor = computed(() => {
  if (isCritical.value) return 'bg-flame';
  if (progress.value < 0.5) return 'bg-lemon';
  return 'bg-pitch';
});
</script>

<template>
  <div :class="cn('flex items-center gap-3', props.class)">
    <span
      :class="cn(
        'w-16 shrink-0 text-center font-mono text-2xl leading-none font-bold tabular-nums',
        isCritical ? 'animate-pulse text-flame' : 'text-ink',
      )"
    >
      {{ formatClock(remainingSeconds) }}
    </span>

    <div class="h-4 w-full overflow-hidden rounded-pill border-ink-line bg-white">
      <div
        :class="cn('h-full rounded-pill transition-[width] duration-100 ease-linear', barColor)"
        :style="{ width: `${progress * 100}%` }"
      />
    </div>
  </div>
</template>
