<script setup lang="ts">
import { computed } from 'vue';
import { cardArtwork, cardBackArtwork } from '@/components/game/cardArtwork';
import { CARD_TYPE_COLOR, CARD_TYPE_LABEL, findCard } from '@/constants/deck';
import { cn } from '@/lib/utils';

/**
 * Одна игровая карта. Рамку, тень и подпись рисует компонент,
 * из папки с ассетами берётся только иллюстрация. Пока картинок нет,
 * показывается текстовая заглушка в цвете группы — экраны остаются рабочими.
 */
const props = withDefaults(
  defineProps<{
    cardId: string;
    size?: 'xs' | 'small' | 'default' | 'large';
    /** Рубашкой вверх — для карт соперников и нераскрытого поля. */
    faceDown?: boolean;
    selected?: boolean;
    disabled?: boolean;
    /** Карта закрыта «Блоком»: в этом ходу её признак не учитывается. */
    blocked?: boolean;
    interactive?: boolean;
    class?: string;
  }>(),
  {
    size: 'default',
    faceDown: false,
    selected: false,
    disabled: false,
    blocked: false,
    interactive: false,
  },
);

const emit = defineEmits<{
  select: [cardId: string];
}>();

const card = computed(() => findCard(props.cardId));

const color = computed(() => (card.value ? CARD_TYPE_COLOR[card.value.type] : 'ink'));

const artwork = computed(() => {
  if (!card.value) return undefined;
  return props.faceDown ? cardBackArtwork(card.value.type) : cardArtwork(props.cardId);
});

const sizeClasses = {
  xs: 'w-14 rounded-[8px] text-[8px]',
  small: 'w-20 rounded-[10px] text-[10px]',
  default: 'w-[104px] rounded-card text-xs',
  large: 'w-[132px] rounded-card text-sm',
} as const;

const fillClasses = {
  sky: 'bg-sky text-white',
  pitch: 'bg-pitch text-white',
  grape: 'bg-grape text-white',
  flame: 'bg-flame text-white',
  ink: 'bg-ink text-cream',
} as const;

const label = computed(() => card.value?.shortTitle ?? card.value?.title ?? '?');

function onClick() {
  if (props.disabled || !props.interactive) return;
  emit('select', props.cardId);
}
</script>

<template>
  <component
    :is="interactive ? 'button' : 'div'"
    :type="interactive ? 'button' : undefined"
    :disabled="interactive && disabled ? true : undefined"
    :aria-label="card?.title"
    :class="cn(
      'relative block aspect-[104/137] shrink-0 overflow-hidden border-ink-line bg-white',
      sizeClasses[size],
      interactive && !disabled && 'cursor-pointer press-hard shadow-hard-sm',
      selected && '-translate-y-2 shadow-hard',
      disabled && 'opacity-45',
      props.class,
    )"
    @click="onClick"
  >
    <img
      v-if="artwork"
      :src="artwork"
      :alt="faceDown ? 'Рубашка карты' : card?.title"
      class="size-full object-cover"
      draggable="false"
    >

    <!-- Заглушка до появления иллюстраций: цвет группы + название карты. -->
    <div
      v-else
      :class="cn(
        'flex size-full flex-col items-center justify-center gap-1 p-1.5 text-center',
        fillClasses[color],
      )"
    >
      <template v-if="faceDown">
        <span class="font-display text-lg leading-none font-black opacity-40">ИГ</span>
      </template>
      <template v-else>
        <span class="font-mono text-[7px] tracking-widest uppercase opacity-70">
          {{ card ? CARD_TYPE_LABEL[card.type] : '' }}
        </span>
        <span class="font-display leading-tight font-extrabold text-balance uppercase">
          {{ label }}
        </span>
      </template>
    </div>

    <span
      v-if="blocked"
      class="absolute inset-0 flex items-center justify-center bg-ink/70 font-display text-xs font-black text-cream uppercase"
    >
      Блок
    </span>
  </component>
</template>
