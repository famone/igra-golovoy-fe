<script setup lang="ts" generic="T extends string">
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/telegram';
import type { SegmentOption } from '@/components/ui/types';

/** Горизонтальные фильтры-«таблетки» со скроллом — как на главной sporim.games. */
const model = defineModel<T>({ required: true });

withDefaults(
  defineProps<{
    options: SegmentOption<T>[];
    /** Растянуть на всю ширину вместо горизонтального скролла. */
    fill?: boolean;
    class?: string;
  }>(),
  {
    fill: false,
  },
);

function select(value: T) {
  if (model.value === value) return;
  haptics.select();
  model.value = value;
}
</script>

<template>
  <div
    :class="cn(
      'flex gap-2',
      fill ? 'w-full' : '-mx-4 overflow-x-auto px-4 scrollbar-none',
      $props.class,
    )"
    role="tablist"
  >
    <button
      v-for="option in options"
      :key="option.value"
      type="button"
      role="tab"
      :aria-selected="model === option.value"
      :class="cn(
        'inline-flex shrink-0 items-center gap-1.5 rounded-pill border-ink-line px-4 py-2',
        'text-xs font-extrabold tracking-wide uppercase press-hard',
        fill && 'flex-1 justify-center',
        model === option.value
          ? 'bg-ink text-cream shadow-hard-xs'
          : 'bg-white text-ink-soft',
      )"
      @click="select(option.value)"
    >
      {{ option.label }}
      <span
        v-if="option.count !== undefined"
        :class="cn(
          'rounded-pill px-1.5 font-mono text-[10px]',
          model === option.value ? 'bg-cream/20' : 'bg-ink/10',
        )"
      >
        {{ option.count }}
      </span>
    </button>
  </div>
</template>
