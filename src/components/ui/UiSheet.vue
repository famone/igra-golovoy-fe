<script setup lang="ts">
import { useId } from 'vue';
import { XIcon } from '@lucide/vue';
import {
  DrawerContent,
  DrawerHandle,
  DrawerOverlay,
  DrawerPortal,
  DrawerRoot,
} from 'vaul-vue';
import { cn } from '@/lib/utils';

/**
 * Нижняя шторка. Жест и анимация — vaul-vue, как у shadcn Drawer.
 * Зума и смены фона страницы нет: should-scale-background выключен.
 */
const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    persistent?: boolean;
    tall?: boolean;
    class?: string;
  }>(),
  {
    persistent: false,
    tall: false,
  },
);

const emit = defineEmits<{
  'click:outside': [];
  'after-leave': [];
}>();

const titleId = useId();

function close() {
  open.value = false;
}

function onAnimationEnd(isOpen: boolean) {
  if (!isOpen) emit('after-leave');
}
</script>

<template>
  <DrawerRoot
    v-model:open="open"
    :should-scale-background="false"
    :set-background-color-on-scale="false"
    :dismissible="!persistent"
    @animation-end="onAnimationEnd"
  >
    <DrawerPortal>
      <DrawerOverlay
        class="fixed inset-0 z-50 bg-ink/55"
        @click="emit('click:outside')"
      />

      <DrawerContent
        role="dialog"
        aria-modal="true"
        :aria-labelledby="title ? titleId : undefined"
        :class="cn(
          'fixed inset-x-0 bottom-0 z-50 mx-auto flex w-full max-w-shell flex-col outline-none',
          'rounded-t-brand border-ink-line border-b-0 bg-cream',
          tall ? 'max-h-[92dvh]' : 'max-h-[80dvh]',
          props.class,
        )"
        :style="{ paddingBottom: 'var(--tg-safe-bottom)' }"
      >
        <DrawerHandle class="ui-sheet-handle" />

        <header
          v-if="title || $slots.title"
          class="flex shrink-0 items-start justify-between gap-3 px-5 pt-3 pb-4"
        >
          <slot name="title">
            <h2
              :id="titleId"
              class="text-lg leading-tight"
            >
              {{ title }}
            </h2>
          </slot>

          <button
            type="button"
            class="rounded-full border-ink-line bg-white p-1.5 press-hard shadow-hard-xs"
            aria-label="Закрыть"
            @click="close"
          >
            <XIcon class="size-4" />
          </button>
        </header>

        <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-5 scrollbar-none">
          <slot />
        </div>

        <footer
          v-if="$slots.actions"
          class="flex shrink-0 flex-col gap-2 border-t-[2.4px] border-ink/10 px-5 py-4"
        >
          <slot name="actions" />
        </footer>
      </DrawerContent>
    </DrawerPortal>
  </DrawerRoot>
</template>

<style scoped>
/* Перебиваем дефолтную серую полоску vaul под наш размер. */
.ui-sheet-handle[data-vaul-handle] {
  width: 48px;
  height: 6px;
  margin-top: 12px;
  margin-bottom: 4px;
  background: rgb(22 19 15 / 0.25);
  opacity: 1;
}
</style>
