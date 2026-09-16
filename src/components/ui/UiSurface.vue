<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import type { BrandColor } from '@/components/ui/types';

/**
 * Базовая «плита» дизайн-системы: белый фон, чёрная обводка и жёсткая тень.
 * На ней строятся карточки комнат, блоки профиля и списки.
 */
const props = withDefaults(
  defineProps<{
    /** Цветная заливка вместо белой. */
    color?: BrandColor | 'white' | 'cream';
    padding?: 'none' | 'tight' | 'default' | 'loose';
    shadow?: 'none' | 'sm' | 'default' | 'lg';
    interactive?: boolean;
    /** Рендерит другой тег — например, `button` или `RouterLink`. */
    as?: string;
    class?: string;
  }>(),
  {
    color: 'white',
    padding: 'default',
    shadow: 'default',
    interactive: false,
    as: 'div',
  },
);

const colorClasses: Record<NonNullable<typeof props.color>, string> = {
  white: 'bg-white text-ink',
  cream: 'bg-cream-2 text-ink',
  flame: 'bg-flame text-white',
  pitch: 'bg-pitch text-white',
  sky: 'bg-sky text-white',
  grape: 'bg-grape text-white',
  lemon: 'bg-lemon text-ink',
  ink: 'bg-ink text-cream',
};

const paddingClasses = {
  none: '',
  tight: 'p-3',
  default: 'p-4',
  loose: 'p-5',
} as const;

const shadowClasses = {
  none: '',
  sm: 'shadow-hard-sm',
  default: 'shadow-hard',
  lg: 'shadow-hard-md',
} as const;

const classes = computed(() =>
  cn(
    'border-ink-line rounded-brand',
    colorClasses[props.color],
    paddingClasses[props.padding],
    shadowClasses[props.shadow],
    props.interactive && 'press-hard cursor-pointer text-left',
    props.class,
  ),
);
</script>

<template>
  <component
    :is="as"
    :class="classes"
  >
    <slot />
  </component>
</template>
