<script setup lang="ts">
import { useId } from 'vue';
import { cn } from '@/lib/utils';
import { haptics } from '@/lib/telegram';

const model = defineModel<boolean>({ default: false });

const props = withDefaults(
  defineProps<{
    label: string;
    hint?: string;
    disabled?: boolean;
    class?: string;
  }>(),
  {
    disabled: false,
  },
);

const switchId = useId();

function toggle() {
  if (props.disabled) return;
  haptics.select();
  model.value = !model.value;
}
</script>

<template>
  <div :class="cn('flex items-center justify-between gap-4', $props.class)">
    <label
      :for="switchId"
      class="min-w-0"
    >
      <span class="block text-sm font-bold text-ink">{{ label }}</span>
      <span
        v-if="hint"
        class="mt-0.5 block text-xs text-ink-muted"
      >{{ hint }}</span>
    </label>

    <!--
      Дорожка — flex-контейнер с паддингом. Кружок живёт внутри padding-box
      и при включении уезжает на оставшееся место через `ml-auto`.
      Так он не может вылезти за рамку, какой бы ни была толщина border.
    -->
    <button
      :id="switchId"
      type="button"
      role="switch"
      :aria-checked="model"
      :disabled="disabled"
      :class="cn(
        'box-border flex h-7 w-12 shrink-0 cursor-pointer items-center overflow-hidden rounded-full p-[3px]',
        'border-2 border-ink transition-colors duration-150',
        'disabled:cursor-not-allowed disabled:opacity-45',
        model ? 'bg-pitch' : 'bg-cream-3',
      )"
      @click="toggle"
    >
      <span
        :class="cn(
          'block size-[18px] shrink-0 rounded-full bg-white transition-[margin] duration-150',
          model && 'ml-auto',
        )"
        aria-hidden="true"
      />
    </button>
  </div>
</template>
