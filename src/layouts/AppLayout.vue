<script setup lang="ts">
import { ref } from 'vue';
import AppBottomNav from '@/components/layout/AppBottomNav.vue';
import AppHeader from '@/components/layout/AppHeader.vue';
import CreateRoomSheet from '@/components/arena/CreateRoomSheet.vue';

/**
 * Основной каркас: колонка фиксированной ширины по центру экрана.
 * На телефоне она занимает всю ширину, на десктопе — имитирует мини-приложение.
 */
const isCreateOpen = ref(false);
</script>

<template>
  <div class="flex min-h-dvh justify-center bg-cream">
    <div class="relative flex w-full max-w-shell flex-col bg-cream">
      <AppHeader />

      <main class="flex-1 px-4 pt-4 pb-[calc(var(--spacing-bottom-nav)+var(--tg-safe-bottom)+1.5rem)]">
        <slot />
      </main>

      <AppBottomNav @create="isCreateOpen = true" />
    </div>

    <CreateRoomSheet v-model="isCreateOpen" />
  </div>
</template>
