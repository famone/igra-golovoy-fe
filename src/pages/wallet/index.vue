<script setup lang="ts">
import { useRouter } from 'vue-router';
import UIButton from '@/components/ui/UIButton.vue';
import UiEmptyState from '@/components/ui/UiEmptyState.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useWalletStore } from '@/stores/wallet';

/**
 * Раздел в разработке. Заглушка живёт здесь, а не в отдельном роуте,
 * чтобы при готовности бэкенда достаточно было включить `isAvailable`
 * и дописать реальный контент.
 */
const router = useRouter();
const walletStore = useWalletStore();

const plannedFeatures = [
  'Мячи за победы и серии',
  'Покупка колод и рубашек карт',
  'Ставки в приватных комнатах',
  'Вывод и пополнение через Telegram Stars',
];
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiEmptyState
      v-if="!walletStore.isAvailable"
      title="Кошелёк в разработке"
      description="Копим мячи, пилим экономику. Скоро здесь появятся награды за победы и магазин."
      icon="💎"
    />

    <UiSurface
      v-if="!walletStore.isAvailable"
      color="cream"
      class="flex flex-col gap-3"
    >
      <p class="font-mono text-[10px] tracking-widest text-ink-muted uppercase">Что будет</p>

      <ul class="flex flex-col gap-2">
        <li
          v-for="feature in plannedFeatures"
          :key="feature"
          class="flex items-start gap-2 text-sm"
        >
          <span
            class="mt-1.5 size-1.5 shrink-0 rounded-full bg-flame"
            aria-hidden="true"
          />
          {{ feature }}
        </li>
      </ul>
    </UiSurface>

    <UIButton
      block
      variant="outlined"
      color="ink"
      @click="router.push({ name: 'arena' })"
    >
      Пойти играть
    </UIButton>
  </div>
</template>
