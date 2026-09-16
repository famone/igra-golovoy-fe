<script setup lang="ts">
import { onBeforeUnmount, useId, watch } from 'vue';
import { XIcon } from '@lucide/vue';
import { cn } from '@/lib/utils';

/** Центральный модал — для коротких подтверждений и результатов партии. */
const open = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    title?: string;
    persistent?: boolean;
    hideClose?: boolean;
    class?: string;
  }>(),
  {
    persistent: false,
    hideClose: false,
  },
);

const emit = defineEmits<{
  'click:outside': [];
}>();

const titleId = useId();

function close() {
  open.value = false;
}

function onOverlayClick() {
  emit('click:outside');
  if (!props.persistent) close();
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && open.value && !props.persistent) {
    event.preventDefault();
    close();
  }
}

watch(open, (isOpen) => {
  if (typeof document === 'undefined') return;

  if (isOpen) {
    document.addEventListener('keydown', onKeydown);
    document.body.style.overflow = 'hidden';
  }
  else {
    document.removeEventListener('keydown', onKeydown);
    document.body.style.overflow = '';
  }
});

onBeforeUnmount(() => {
  document.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      leave-active-class="transition-opacity duration-150"
      enter-from-class="opacity-0"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 flex items-center justify-center p-5"
        role="presentation"
      >
        <div
          class="absolute inset-0 bg-ink/55"
          aria-hidden="true"
          @click="onOverlayClick"
        />

        <div
          role="dialog"
          aria-modal="true"
          :aria-labelledby="title ? titleId : undefined"
          :class="cn(
            'relative z-10 flex max-h-[85dvh] w-full max-w-sm flex-col rounded-brand border-ink-line bg-cream shadow-hard-lg',
            props.class,
          )"
          @click.stop
        >
          <header
            v-if="title || $slots.title || !hideClose"
            class="flex shrink-0 items-start justify-between gap-3 px-5 pt-5"
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
              v-if="!hideClose"
              type="button"
              class="rounded-full border-ink-line bg-white p-1.5 press-hard shadow-hard-xs"
              aria-label="Закрыть"
              @click="close"
            >
              <XIcon class="size-4" />
            </button>
          </header>

          <div class="min-h-0 flex-1 overflow-y-auto px-5 py-4 scrollbar-none">
            <slot />
          </div>

          <footer
            v-if="$slots.actions"
            class="flex shrink-0 flex-col gap-2 px-5 pb-5"
          >
            <slot name="actions" />
          </footer>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
