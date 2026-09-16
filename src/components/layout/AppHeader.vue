<script setup lang="ts">
import { RouterLink } from 'vue-router';
import { BookOpenIcon } from '@lucide/vue';
import UiAvatar from '@/components/ui/UiAvatar.vue';
import { useAuthStore } from '@/stores/auth';

/** Шапка мини-приложения: логотип, ссылка на правила и аватар игрока. */
const authStore = useAuthStore();
</script>

<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between gap-3 border-b-[2.4px] border-ink bg-cream px-4 py-3"
    :style="{ paddingTop: 'calc(0.75rem + var(--tg-safe-top))' }"
  >
    <RouterLink
      :to="{ name: 'arena' }"
      class="block shrink-0"
      aria-label="Игра головой — на главную"
    >
      <img
        src="/brand/logo.png"
        alt="Игра головой"
        width="900"
        height="505"
        class="h-8 w-auto"
      >
    </RouterLink>

    <div class="flex items-center gap-2">
      <RouterLink
        :to="{ name: 'rules' }"
        class="flex size-9 items-center justify-center rounded-full border-ink-line bg-white press-hard shadow-hard-xs"
        aria-label="Правила игры"
      >
        <BookOpenIcon class="size-4" />
      </RouterLink>

      <RouterLink
        :to="{ name: 'profile' }"
        aria-label="Профиль"
      >
        <UiAvatar
          :name="authStore.displayName"
          :src="authStore.user?.avatarUrl"
          size="small"
        />
      </RouterLink>
    </div>
  </header>
</template>
