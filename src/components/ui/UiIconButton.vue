<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import type { BrandColor } from '@/components/ui/types';

const props = withDefaults(
  defineProps<{
    /** Обязательна: у кнопки нет текстовой подписи, отсюда берётся aria-label. */
    label: string;
    color?: BrandColor | 'white';
    size?: 'small' | 'default' | 'large';
    disabled?: boolean;
    round?: boolean;
    class?: string;
  }>(),
  {
    color: 'white',
    size: 'default',
    disabled: false,
    round: true,
  },
);

const sizeClasses = {
  small: 'size-9',
  default: 'size-11',
  large: 'size-14',
} as const;

const colorClasses: Record<NonNullable<typeof props.color>, string> = {
  white: 'bg-white text-ink',
  flame: 'bg-flame text-white',
  pitch: 'bg-pitch text-white',
  sky: 'bg-sky text-white',
  grape: 'bg-grape text-white',
  lemon: 'bg-lemon text-ink',
  ink: 'bg-ink text-cream',
};

const classes = computed(() =>
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center border-ink-line shadow-hard-sm press-hard',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
    props.round ? 'rounded-full' : 'rounded-card',
    sizeClasses[props.size],
    colorClasses[props.color],
    props.class,
  ),
);
</script>

<template>
  <button
    type="button"
    :aria-label="label"
    :title="label"
    :disabled="disabled"
    :class="classes"
  >
    <slot />
  </button>
</template>
