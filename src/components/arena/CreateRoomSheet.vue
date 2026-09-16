<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import UIButton from '@/components/ui/UIButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSegmented from '@/components/ui/UiSegmented.vue';
import UiSheet from '@/components/ui/UiSheet.vue';
import UiSwitch from '@/components/ui/UiSwitch.vue';
import { DEFAULT_ROOM_SETTINGS } from '@/stores/arena/mocks';
import { useArenaStore } from '@/stores/arena';
import type { GameDifficulty, GameFormat, RoomVisibility } from '@/types/game';
import type { SegmentOption } from '@/components/ui/types';

/** Шторка создания комнаты: вызывается из центральной кнопки нижнего меню. */
const open = defineModel<boolean>({ default: false });

const router = useRouter();
const arenaStore = useArenaStore();

const form = reactive({
  title: '',
  format: DEFAULT_ROOM_SETTINGS.format as GameFormat,
  difficulty: DEFAULT_ROOM_SETTINGS.difficulty as GameDifficulty,
  visibility: 'public' as RoomVisibility,
  turnSeconds: DEFAULT_ROOM_SETTINGS.turnSeconds,
  maxPlayers: DEFAULT_ROOM_SETTINGS.maxPlayers,
  hardcoreRepeats: DEFAULT_ROOM_SETTINGS.hardcoreRepeats,
});

const submitted = ref(false);

const formatOptions: SegmentOption<GameFormat>[] = [
  { value: 'knockout', label: 'На вылет' },
  { value: 'points', label: 'На очки' },
];

const difficultyOptions: SegmentOption<GameDifficulty>[] = [
  { value: 'standard', label: 'Обычный' },
  { value: 'simple', label: 'Простой' },
];

const visibilityOptions: SegmentOption<RoomVisibility>[] = [
  { value: 'public', label: 'Открытая' },
  { value: 'private', label: 'По коду' },
];

const turnOptions: SegmentOption<string>[] = [
  { value: '20', label: '20 сек' },
  { value: '30', label: '30 сек' },
  { value: '45', label: '45 сек' },
];

const playersOptions: SegmentOption<string>[] = [
  { value: '4', label: '4' },
  { value: '6', label: '6' },
  { value: '8', label: '8' },
];

const turnSecondsModel = computed({
  get: () => String(form.turnSeconds),
  set: (value: string) => {
    form.turnSeconds = Number(value); 
  },
});

const maxPlayersModel = computed({
  get: () => String(form.maxPlayers),
  set: (value: string) => {
    form.maxPlayers = Number(value); 
  },
});

const titleError = computed(() => {
  if (!submitted.value) return '';
  if (!form.title.trim()) return 'Придумайте название комнаты';
  return '';
});

watch(open, (isOpen) => {
  if (isOpen) return;
  submitted.value = false;
  form.title = '';
});

async function submit() {
  submitted.value = true;
  if (titleError.value) return;

  const room = await arenaStore.CREATE_ROOM({
    title: form.title.trim(),
    visibility: form.visibility,
    settings: {
      format: form.format,
      difficulty: form.difficulty,
      turnSeconds: form.turnSeconds,
      maxPlayers: form.maxPlayers,
      hardcoreRepeats: form.hardcoreRepeats,
    },
  });

  open.value = false;
  void router.push({ name: 'room', params: { id: room.id } });
}
</script>

<template>
  <UiSheet
    v-model="open"
    title="Новая игра"
    tall
  >
    <div class="flex flex-col gap-5">
      <UiInput
        v-model="form.title"
        label="Название"
        placeholder="Вечерний матч"
        :error-messages="titleError"
        required
      />

      <div class="flex flex-col gap-2">
        <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Формат</span>
        <UiSegmented
          v-model="form.format"
          :options="formatOptions"
          fill
        />
        <p class="text-xs text-ink-muted">
          {{ form.format === 'points'
            ? 'Три раунда, побеждает игрок с наибольшей суммой очков.'
            : 'Кто первым скинул все карты — тот и победил.' }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Вариант</span>
        <UiSegmented
          v-model="form.difficulty"
          :options="difficultyOptions"
          fill
        />
        <p class="text-xs text-ink-muted">
          {{ form.difficulty === 'simple'
            ? 'Сначала кладёшь карту, потом называешь футболиста. Повторы разрешены.'
            : 'Сначала ответ, потом карта. Каждого футболиста можно назвать один раз.' }}
        </p>
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Время на ход</span>
        <UiSegmented
          v-model="turnSecondsModel"
          :options="turnOptions"
          fill
        />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Игроков</span>
        <UiSegmented
          v-model="maxPlayersModel"
          :options="playersOptions"
          fill
        />
      </div>

      <div class="flex flex-col gap-2">
        <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">Доступ</span>
        <UiSegmented
          v-model="form.visibility"
          :options="visibilityOptions"
          fill
        />
      </div>

      <UiSwitch
        v-model="form.hardcoreRepeats"
        label="Хардкор-режим"
        hint="Футболиста нельзя назвать повторно за всю партию"
      />
    </div>

    <template #actions>
      <UIButton
        block
        size="large"
        :loading="arenaStore.loading"
        @click="submit"
      >
        Создать игру
      </UIButton>
    </template>
  </UiSheet>
</template>
