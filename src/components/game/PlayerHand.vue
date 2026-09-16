<script setup lang="ts">
import { ref } from 'vue';
import GameCard from '@/components/game/GameCard.vue';
import { cn } from '@/lib/utils';
import type { CardInstance } from '@/types/cards';

/** Веер карт на руке с горизонтальным скроллом — под ширину телефона. */
const props = withDefaults(
  defineProps<{
    hand: CardInstance[];
    /** Карты можно класть на поле прямо сейчас. */
    playable?: boolean;
    class?: string;
  }>(),
  {
    playable: false,
  },
);

const emit = defineEmits<{
  play: [instanceId: string];
}>();

const selectedId = ref<string | null>(null);

function onSelect(instance: CardInstance) {
  if (!props.playable) return;

  // Первый тап выбирает карту, второй — подтверждает ход.
  if (selectedId.value === instance.instanceId) {
    emit('play', instance.instanceId);
    selectedId.value = null;
    return;
  }

  selectedId.value = instance.instanceId;
}
</script>

<template>
  <div :class="cn('-mx-4 flex gap-2 overflow-x-auto px-4 pt-4 pb-2 scrollbar-none', props.class)">
    <GameCard
      v-for="instance in hand"
      :key="instance.instanceId"
      :card-id="instance.cardId"
      size="small"
      interactive
      :disabled="!playable"
      :selected="selectedId === instance.instanceId"
      @select="onSelect(instance)"
    />
  </div>
</template>
