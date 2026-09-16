<script setup lang="ts">
import { cn } from '@/lib/utils';

withDefaults(
  defineProps<{
    title: string;
    description?: string;
    /** Эмодзи или короткий символ в кружке над текстом. */
    icon?: string;
    class?: string;
  }>(),
  {
    icon: '⚽',
  },
);
</script>

<template>
  <div :class="cn('flex flex-col items-center gap-3 px-6 py-10 text-center', $props.class)">
    <span
      class="flex size-16 items-center justify-center rounded-full border-ink-line bg-cream-2 text-2xl shadow-hard-sm"
      aria-hidden="true"
    >
      {{ icon }}
    </span>

    <h3 class="text-base">{{ title }}</h3>

    <p
      v-if="description"
      class="max-w-[36ch] text-sm text-ink-soft"
    >
      {{ description }}
    </p>

    <slot />
  </div>
</template>
