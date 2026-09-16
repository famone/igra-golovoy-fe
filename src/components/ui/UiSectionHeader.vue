<script setup lang="ts">
import { cn } from '@/lib/utils';

defineProps<{
  title: string;
  /** Мелкая надпись-рубрика над заголовком, как на сайте. */
  eyebrow?: string;
  class?: string;
}>();
</script>

<template>
  <div :class="cn('flex items-end justify-between gap-3', $props.class)">
    <div class="min-w-0">
      <p
        v-if="eyebrow"
        class="font-mono text-[10px] font-semibold tracking-widest text-ink-muted uppercase"
      >
        {{ eyebrow }}
      </p>
      <h2 class="truncate text-base">{{ title }}</h2>
    </div>

    <div class="shrink-0">
      <slot name="action" />
    </div>
  </div>
</template>
