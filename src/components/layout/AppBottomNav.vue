<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PlusIcon } from '@lucide/vue';
import { NAV_ITEMS } from '@/constants/navigation';
import { haptics } from '@/lib/telegram';
import { cn } from '@/lib/utils';

/**
 * Фиксированное нижнее меню с центральной кнопкой действия.
 * Ширина совпадает с мобильным контейнером, чтобы на десктопе
 * меню не растягивалось на весь экран.
 */
const emit = defineEmits<{
  create: [];
}>();

const route = useRoute();
const router = useRouter();

const activeName = computed(() => {
  // Вложенные экраны подсвечивают свой корневой раздел.
  const matched = route.matched.map((item) => item.name).filter(Boolean);
  return NAV_ITEMS.find((item) => matched.includes(item.name))?.name ?? route.name;
});

/** Пункты делятся пополам: центральная кнопка встаёт между ними. */
const leftItems = computed(() => NAV_ITEMS.slice(0, 2));
const rightItems = computed(() => NAV_ITEMS.slice(2));

function go(name: string) {
  if (name === activeName.value) return;
  haptics.select();
  void router.push({ name });
}

function onCreate() {
  haptics.tap();
  emit('create');
}
</script>

<template>
  <nav
    class="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center"
    aria-label="Основная навигация"
  >
    <div
      class="pointer-events-auto flex w-full max-w-shell items-stretch gap-1 border-t-[2.4px] border-ink bg-cream px-2 pt-2"
      :style="{ paddingBottom: 'calc(0.5rem + var(--tg-safe-bottom))' }"
    >
      <button
        v-for="item in leftItems"
        :key="item.name"
        type="button"
        :aria-current="activeName === item.name ? 'page' : undefined"
        :class="cn(
          'flex flex-1 flex-col items-center gap-0.5 rounded-card py-1.5 transition-colors',
          activeName === item.name ? 'text-flame' : 'text-ink-muted',
        )"
        @click="go(item.name)"
      >
        <component
          :is="item.icon"
          class="size-5"
          :stroke-width="activeName === item.name ? 2.75 : 2"
        />
        <span class="text-[10px] font-extrabold tracking-wide uppercase">{{ item.label }}</span>
      </button>

      <button
        type="button"
        class="-mt-7 flex size-14 shrink-0 items-center justify-center self-start rounded-full border-ink-line bg-flame text-white press-hard shadow-hard"
        aria-label="Создать игру"
        @click="onCreate"
      >
        <PlusIcon
          class="size-7"
          :stroke-width="3"
        />
      </button>

      <button
        v-for="item in rightItems"
        :key="item.name"
        type="button"
        :aria-current="activeName === item.name ? 'page' : undefined"
        :class="cn(
          'relative flex flex-1 flex-col items-center gap-0.5 rounded-card py-1.5 transition-colors',
          activeName === item.name ? 'text-flame' : 'text-ink-muted',
        )"
        @click="go(item.name)"
      >
        <component
          :is="item.icon"
          class="size-5"
          :stroke-width="activeName === item.name ? 2.75 : 2"
        />
        <span class="text-[10px] font-extrabold tracking-wide uppercase">{{ item.label }}</span>
        <span
          v-if="item.isSoon"
          class="absolute top-0 right-1.5 size-1.5 rounded-full bg-lemon ring-[1.5px] ring-ink"
          aria-hidden="true"
        />
      </button>
    </div>
  </nav>
</template>
