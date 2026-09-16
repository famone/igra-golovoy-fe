<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import AppLayout from '@/layouts/AppLayout.vue';
import AppPreloader from '@/components/layout/AppPreloader.vue';
import FocusLayout from '@/layouts/FocusLayout.vue';

const layouts = {
  app: AppLayout,
  focus: FocusLayout,
} as const;

type LayoutName = keyof typeof layouts;

const route = useRoute();

const layout = computed(() => layouts[(route.meta.layout as LayoutName) ?? 'app']);
</script>

<template>
  <AppPreloader />

  <component :is="layout">
    <RouterView v-slot="{ Component }">
      <Transition
        mode="out-in"
        enter-active-class="transition-opacity duration-150"
        leave-active-class="transition-opacity duration-100"
        enter-from-class="opacity-0"
        leave-to-class="opacity-0"
      >
        <component :is="Component" />
      </Transition>
    </RouterView>
  </component>
</template>
