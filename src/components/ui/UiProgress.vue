<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import type { BrandColor } from '@/components/ui/types';

const props = withDefaults(
  defineProps<{
    /** 0..1 */
    value: number;
    color?: BrandColor;
    size?: 'small' | 'default';
    class?: string;
  }>(),
  {
    color: 'pitch',
    size: 'default',
  },
);

const fillClasses: Record<BrandColor, string> = {
  flame: 'bg-flame',
  pitch: 'bg-pitch',
  sky: 'bg-sky',
  grape: 'bg-grape',
  lemon: 'bg-lemon',
  ink: 'bg-ink',
};

const percent = computed(() => Math.round(Math.min(1, Math.max(0, props.value)) * 100));
</script>

<template>
  <div
    role="progressbar"
    :aria-valuenow="percent"
    aria-valuemin="0"
    aria-valuemax="100"
    :class="cn(
      'w-full overflow-hidden rounded-pill border-ink-line bg-white',
      size === 'small' ? 'h-2.5' : 'h-4',
      $props.class,
    )"
  >
    <div
      :class="cn('h-full rounded-pill transition-[width] duration-300 ease-out', fillClasses[color])"
      :style="{ width: `${percent}%` }"
    />
  </div>
</template>
