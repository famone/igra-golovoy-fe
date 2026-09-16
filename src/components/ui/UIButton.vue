<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '@/lib/utils';
import type { BrandColor, ControlSize } from '@/components/ui/types';

export type ButtonVariant = 'solid' | 'outlined' | 'ghost' | 'text';

const props = withDefaults(
  defineProps<{
    variant?: ButtonVariant;
    color?: BrandColor;
    size?: ControlSize;
    block?: boolean;
    disabled?: boolean;
    loading?: boolean;
    /** Скругление «таблеткой» — основной стиль кнопок на сайте. */
    pill?: boolean;
    type?: 'button' | 'submit' | 'reset';
    class?: string;
  }>(),
  {
    variant: 'solid',
    color: 'flame',
    size: 'default',
    block: false,
    disabled: false,
    loading: false,
    pill: true,
    type: 'button',
  },
);

const sizeClasses: Record<ControlSize, string> = {
  small: 'h-9 px-4 text-xs gap-1.5',
  default: 'h-12 px-5 text-sm gap-2',
  large: 'h-14 px-6 text-base gap-2.5',
};

const solidClasses: Record<BrandColor, string> = {
  flame: 'bg-flame text-white',
  pitch: 'bg-pitch text-white',
  sky: 'bg-sky text-white',
  grape: 'bg-grape text-white',
  lemon: 'bg-lemon text-ink',
  ink: 'bg-ink text-cream',
};

const textColorClasses: Record<BrandColor, string> = {
  flame: 'text-flame',
  pitch: 'text-pitch',
  sky: 'text-sky',
  grape: 'text-grape',
  lemon: 'text-ink',
  ink: 'text-ink',
};

const variantClasses = computed(() => {
  if (props.variant === 'solid') {
    return cn('border-ink-line shadow-hard press-hard', solidClasses[props.color]);
  }

  if (props.variant === 'outlined') {
    return cn('border-ink-line bg-white shadow-hard press-hard', textColorClasses[props.color]);
  }

  if (props.variant === 'ghost') {
    return cn('border-[2.4px] border-transparent bg-cream-2', textColorClasses[props.color]);
  }

  return cn('bg-transparent underline decoration-2 underline-offset-4', textColorClasses[props.color]);
});

const classes = computed(() =>
  cn(
    'inline-flex shrink-0 cursor-pointer items-center justify-center font-extrabold uppercase tracking-wide select-none',
    'disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-flame/30',
    props.pill ? 'rounded-pill' : 'rounded-card',
    sizeClasses[props.size],
    variantClasses.value,
    props.block && 'w-full',
    props.class,
  ),
);
</script>

<template>
  <button
    :type="type"
    :class="classes"
    :disabled="disabled || loading"
  >
    <span
      v-if="loading"
      class="size-4 animate-spin rounded-full border-2 border-current border-r-transparent"
      aria-hidden="true"
    />
    <slot name="leading" />
    <slot />
    <slot name="trailing" />
  </button>
</template>
