<script setup lang="ts">
import { computed } from 'vue';
import { initialsOf } from '@/lib/format';
import { cn, hashString } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    name: string;
    src?: string;
    size?: 'xs' | 'small' | 'default' | 'large';
    /** Обводка и тень — для акцентных мест вроде подиума лидеров. */
    bordered?: boolean;
    class?: string;
  }>(),
  {
    size: 'default',
    bordered: true,
  },
);

const sizeClasses = {
  xs: 'size-7 text-[10px]',
  small: 'size-9 text-xs',
  default: 'size-11 text-sm',
  large: 'size-16 text-lg',
} as const;

/** Цвет подложки детерминирован по имени: один игрок — всегда один цвет. */
const palette = ['bg-flame', 'bg-pitch', 'bg-sky', 'bg-grape'] as const;

const fallbackColor = computed(() => palette[hashString(props.name) % palette.length]);

const classes = computed(() =>
  cn(
    'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full font-extrabold text-white',
    sizeClasses[props.size],
    props.bordered && 'border-ink-line',
    !props.src && fallbackColor.value,
    props.class,
  ),
);
</script>

<template>
  <span
    :class="classes"
    :title="name"
  >
    <img
      v-if="src"
      :src="src"
      :alt="name"
      class="size-full object-cover"
      loading="lazy"
    >
    <template v-else>{{ initialsOf(name) }}</template>
  </span>
</template>
