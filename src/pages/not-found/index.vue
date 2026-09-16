<script setup lang="ts">
import { useRouter } from 'vue-router';
import UIButton from '@/components/ui/UIButton.vue';
import UiEmptyState from '@/components/ui/UiEmptyState.vue';

const router = useRouter();
</script>

<template>
  <UiEmptyState
    title="Мяч ушёл за боковую"
    description="Такой страницы нет. Возвращаемся на поле."
    icon="🚩"
  >
    <UIButton @click="router.push({ name: 'arena' })">
      На арену
    </UIButton>
  </UiEmptyState>
</template>
