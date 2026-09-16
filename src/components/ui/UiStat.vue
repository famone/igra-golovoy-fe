<script setup lang="ts">
import { cn } from '@/lib/utils';
import type { BrandColor } from '@/components/ui/types';

withDefaults(
  defineProps<{
    value: string | number;
    label: string;
    color?: BrandColor;
    class?: string;
  }>(),
  {
    color: 'ink',
  },
);

const valueColorClasses: Record<BrandColor, string> = {
  flame: 'text-flame',
  pitch: 'text-pitch-dark',
  sky: 'text-sky-dark',
  grape: 'text-grape-dark',
  lemon: 'text-ink',
  ink: 'text-ink',
};
</script>

<template>
  <div :class="cn('flex flex-col items-center gap-0.5 rounded-card border-ink-line bg-white px-2 py-3', $props.class)">
    <span :class="cn('font-display text-xl leading-none font-extrabold', valueColorClasses[color])">
      {{ value }}
    </span>
    <span class="text-center font-mono text-[9px] tracking-wide text-ink-muted uppercase">
      {{ label }}
    </span>
  </div>
</template>
