<script setup lang="ts">
/**
 * Каркас без нижнего меню — для экранов, из которых нельзя уходить
 * случайным тапом: лобби комнаты, партия, экран правил.
 */
</script>

<template>
  <div class="flex min-h-dvh justify-center bg-cream">
    <div class="flex w-full max-w-shell flex-col bg-cream">
      <slot />
    </div>
  </div>
</template>
