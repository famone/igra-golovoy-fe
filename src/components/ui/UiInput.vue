<script setup lang="ts">
import { computed, useAttrs, useId } from 'vue';
import { cn } from '@/lib/utils';
import type { ControlSize } from '@/components/ui/types';

defineOptions({ inheritAttrs: false });

const model = defineModel<string>({ default: '' });

const props = withDefaults(
  defineProps<{
    label?: string;
    hint?: string;
    placeholder?: string;
    type?: string;
    size?: ControlSize;
    disabled?: boolean;
    error?: boolean;
    errorMessages?: string | string[];
    hideDetails?: boolean;
    required?: boolean;
    /** Крупный моноширинный ввод — для кода комнаты. */
    mono?: boolean;
    class?: string;
  }>(),
  {
    type: 'text',
    size: 'default',
    disabled: false,
    error: false,
    hideDetails: false,
    required: false,
    mono: false,
  },
);

const attrs = useAttrs();
const inputId = useId();

const messages = computed(() => {
  if (!props.errorMessages) return [];
  return Array.isArray(props.errorMessages) ? props.errorMessages : [props.errorMessages];
});

const hasError = computed(() => props.error || messages.value.length > 0);

const sizeClasses: Record<ControlSize, string> = {
  small: 'h-10 px-3 text-sm',
  default: 'h-12 px-4 text-sm',
  large: 'h-14 px-5 text-base',
};

const inputClasses = computed(() =>
  cn(
    'w-full rounded-card border-ink-line bg-white font-semibold text-ink outline-none',
    'placeholder:font-medium placeholder:text-ink-muted',
    'transition-shadow duration-150 focus:shadow-hard',
    'disabled:cursor-not-allowed disabled:bg-cream-2 disabled:opacity-60',
    sizeClasses[props.size],
    props.mono && 'text-center font-mono text-lg tracking-[0.3em] uppercase',
    hasError.value && 'border-flame',
    props.class,
  ),
);
</script>

<template>
  <div class="flex w-full flex-col gap-1.5">
    <label
      v-if="label"
      :for="inputId"
      class="inline-flex items-center gap-1 text-xs font-extrabold tracking-wide text-ink-soft uppercase"
    >
      <span>{{ label }}</span>
      <span
        v-if="required"
        class="text-flame"
        aria-hidden="true"
      >*</span>
    </label>

    <input
      :id="inputId"
      v-model="model"
      :type="type"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="inputClasses"
      :aria-invalid="hasError || undefined"
      v-bind="attrs"
    >

    <p
      v-if="!hideDetails && messages.length"
      class="text-xs font-semibold text-flame-dark"
    >
      {{ messages[0] }}
    </p>
    <p
      v-else-if="!hideDetails && hint"
      class="text-xs text-ink-muted"
    >
      {{ hint }}
    </p>
  </div>
</template>
