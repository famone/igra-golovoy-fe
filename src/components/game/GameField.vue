<script setup lang="ts">
import GameCard from '@/components/game/GameCard.vue';
import { CARD_TYPE_LABEL } from '@/constants/deck';
import { cn } from '@/lib/utils';
import type { FieldSlot } from '@/types/game';

/** Три карты на поле: Позиция — Страна/Континент — Факт. */
withDefaults(
  defineProps<{
    field: FieldSlot[];
    /** Поле ещё не вскрыто — карты лежат рубашкой вверх. */
    faceDown?: boolean;
    class?: string;
  }>(),
  {
    faceDown: false,
  },
);
</script>

<template>
  <div
    :class="cn(
      'flex items-start justify-center gap-2 rounded-brand border-ink-line bg-pitch bg-pitch-stripes p-4 shadow-hard',
      $props.class,
    )"
  >
    <div
      v-for="slot in field"
      :key="slot.type"
      class="flex flex-col items-center gap-2"
    >
      <GameCard
        :card-id="slot.card.cardId"
        :face-down="faceDown"
        :blocked="slot.isBlocked"
      />
      <span class="font-mono text-[9px] tracking-wide text-white/80 uppercase">
        {{ CARD_TYPE_LABEL[slot.type] }}
      </span>
    </div>
  </div>
</template>
