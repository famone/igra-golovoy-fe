<script setup lang="ts">
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    /** Готовые формы под типовые места загрузки. */
    shape?: 'line' | 'block' | 'card' | 'circle';
    class?: string;
  }>(),
  {
    shape: 'line',
  },
);

const shapeClasses = {
  line: 'h-4 w-full rounded-pill',
  block: 'h-20 w-full rounded-card',
  card: 'h-28 w-full rounded-brand',
  circle: 'size-11 rounded-full',
} as const;
</script>

<template>
  <div
    :class="cn('animate-pulse bg-ink/10', shapeClasses[shape], $props.class)"
    aria-hidden="true"
  />
</template>
