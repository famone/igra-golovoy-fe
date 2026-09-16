<script setup lang="ts">
import { useRouter } from 'vue-router';
import { ArrowLeftIcon } from '@lucide/vue';
import GameCard from '@/components/game/GameCard.vue';
import UiChip from '@/components/ui/UiChip.vue';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import UiSectionHeader from '@/components/ui/UiSectionHeader.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useTelegramBackButton } from '@/composables/useTelegramBackButton';
import { ACTION_CARDS, DECK_SUMMARY } from '@/constants/deck';

/** Краткая выжимка правил. Полная версия — на igragolovoy.ru/rules. */
const router = useRouter();

const steps = [
  {
    title: 'Собери поле',
    text: 'Три карты рубашкой вверх — по одной каждого типа: Позиция, Страна/Континент, Факт.',
  },
  {
    title: 'Раздай карты',
    text: 'Остальное перемешай в общую колоду и раздай по 7 карт каждому.',
  },
  {
    title: 'Вскрой поле и отвечай',
    text: 'За 30 секунд назови футболиста, подходящего сразу под все три карты.',
  },
  {
    title: 'Скинь или возьми',
    text: 'Верно — скинь карту того же типа на поле. Нет ответа — возьми 2 карты и всё равно положи одну.',
  },
  {
    title: 'Побеждай',
    text: 'Ход идёт по часовой стрелке. Кто первым избавился от всех карт — победил.',
  },
];

const deckGroups = [
  { label: 'География', count: DECK_SUMMARY.geography, sample: 'geo-spain' },
  { label: 'Позиции', count: DECK_SUMMARY.position, sample: 'pos-forward' },
  { label: 'Факты', count: DECK_SUMMARY.fact, sample: 'fact-ballon-dor' },
  { label: 'Действия', count: DECK_SUMMARY.action, sample: 'action-red-card' },
];

function goBack() {
  router.back();
}

useTelegramBackButton(goBack);
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header
      class="sticky top-0 z-30 flex items-center gap-3 border-b-[2.4px] border-ink bg-cream px-4 py-3"
      :style="{ paddingTop: 'calc(0.75rem + var(--tg-safe-top))' }"
    >
      <UiIconButton
        label="Назад"
        size="small"
        @click="goBack"
      >
        <ArrowLeftIcon class="size-4" />
      </UiIconButton>

      <h1 class="min-w-0 flex-1 truncate text-base">Правила</h1>
    </header>

    <div
      class="flex flex-col gap-5 px-4 py-4"
      :style="{ paddingBottom: 'calc(1.5rem + var(--tg-safe-bottom))' }"
    >
      <UiSurface color="pitch">
        <p class="font-mono text-[10px] tracking-widest uppercase opacity-75">Суть</p>
        <p class="mt-1 text-sm leading-relaxed">
          На поле три карты — Позиция, Страна/Континент и Факт.
          За 30 секунд назови футболиста, который подходит сразу под все три.
        </p>
      </UiSurface>

      <section class="flex flex-col gap-3">
        <UiSectionHeader
          eyebrow="Как играть"
          title="Пять шагов до первого гола"
        />

        <UiSurface
          v-for="(step, index) in steps"
          :key="step.title"
          padding="tight"
          shadow="sm"
          class="flex gap-3"
        >
          <span class="font-display text-lg leading-none font-black text-flame">
            {{ String(index + 1).padStart(2, '0') }}
          </span>
          <div class="min-w-0">
            <p class="text-sm font-bold">{{ step.title }}</p>
            <p class="mt-0.5 text-xs leading-relaxed text-ink-soft">{{ step.text }}</p>
          </div>
        </UiSurface>
      </section>

      <section class="flex flex-col gap-3">
        <UiSectionHeader
          eyebrow="Колода"
          :title="`${DECK_SUMMARY.total} карт`"
        />

        <div class="grid grid-cols-4 gap-2">
          <div
            v-for="group in deckGroups"
            :key="group.label"
            class="flex flex-col items-center gap-1.5"
          >
            <GameCard
              :card-id="group.sample"
              size="xs"
            />
            <span class="font-mono text-[9px] tracking-wide text-ink-muted uppercase">
              {{ group.label }}
            </span>
            <UiChip size="small">{{ group.count }}</UiChip>
          </div>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <UiSectionHeader
          eyebrow="Особые карты"
          title="Меняют ход игры"
        />

        <UiSurface
          v-for="card in ACTION_CARDS"
          :key="card.id"
          padding="tight"
          shadow="sm"
          class="flex flex-col gap-1"
        >
          <div class="flex items-center gap-2">
            <p class="text-sm font-bold">{{ card.title }}</p>
            <UiChip
              :color="card.effect === 'self' ? 'pitch' : 'flame'"
              size="small"
            >
              {{ card.effect === 'self' ? 'Себе' : 'По сопернику' }}
            </UiChip>
          </div>
          <p class="text-xs leading-relaxed text-ink-soft">{{ card.description }}</p>
        </UiSurface>
      </section>

      <a
        href="https://igragolovoy.ru/rules"
        target="_blank"
        rel="noopener"
        class="text-center text-sm font-bold text-flame underline decoration-2 underline-offset-4"
      >
        Полные правила на сайте →
      </a>
    </div>
  </div>
</template>
