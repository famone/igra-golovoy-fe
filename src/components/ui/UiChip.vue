<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import type { BrandColor } from '@/components/ui/types';

const props = withDefaults(
  defineProps<{
    color?: BrandColor;
    /** Заливка цветом против светлой подложки с цветным текстом. */
    variant?: 'solid' | 'soft' | 'outlined';
    size?: 'small' | 'default';
    class?: string;
  }>(),
  {
    color: 'ink',
    variant: 'soft',
    size: 'default',
  },
);

const solidClasses: Record<BrandColor, string> = {
  flame: 'bg-flame text-white',
  pitch: 'bg-pitch text-white',
  sky: 'bg-sky text-white',
  grape: 'bg-grape text-white',
  lemon: 'bg-lemon text-ink',
  ink: 'bg-ink text-cream',
};

const softClasses: Record<BrandColor, string> = {
  flame: 'bg-flame/15 text-flame-dark',
  pitch: 'bg-pitch/15 text-pitch-dark',
  sky: 'bg-sky/15 text-sky-dark',
  grape: 'bg-grape/15 text-grape-dark',
  lemon: 'bg-lemon/25 text-ink',
  ink: 'bg-ink/10 text-ink',
};

const outlinedClasses: Record<BrandColor, string> = {
  flame: 'border-ink-line bg-white text-flame-dark',
  pitch: 'border-ink-line bg-white text-pitch-dark',
  sky: 'border-ink-line bg-white text-sky-dark',
  grape: 'border-ink-line bg-white text-grape-dark',
  lemon: 'border-ink-line bg-white text-ink',
  ink: 'border-ink-line bg-white text-ink',
};

const classes = computed(() => {
  const byVariant = {
    solid: solidClasses,
    soft: softClasses,
    outlined: outlinedClasses,
  }[props.variant];

  return cn(
    'inline-flex items-center gap-1.5 rounded-pill font-mono font-semibold whitespace-nowrap uppercase',
    props.size === 'small' ? 'px-2 py-0.5 text-[10px]' : 'px-3 py-1 text-[11px]',
    byVariant[props.color],
    props.class,
  );
});
</script>

<template>
  <span :class="classes">
    <slot />
  </span>
</template>
