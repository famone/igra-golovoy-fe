<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftIcon } from '@lucide/vue';
import GameField from '@/components/game/GameField.vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useTelegramBackButton } from '@/composables/useTelegramBackButton';
import { findCard } from '@/constants/deck';
import { fetchPlayer, searchPlayers, type PlayerProfile, type PlayerSearchHit } from '@/lib/footballApi';
import { dealRandomField, hasYandexJudgeCredentials, judgeAnswer, type JudgeVerdict } from '@/lib/yandexJudge';
import type { FieldSlot } from '@/types/game';

/**
 * Песочница судьи: три случайные карты → ответ игрока → YandexGPT → новая раздача.
 * Игрового бэкенда нет, в проде этот экран не использовать: ключ светится во фронте.
 */
const router = useRouter();
const field = ref<FieldSlot[]>([]);
const answer = ref('');
const selected = ref<PlayerSearchHit | null>(null);
const suggestions = ref<PlayerSearchHit[]>([]);
const searchOpen = ref(false);
const searchError = ref('');
const isSearching = ref(false);
const isLoading = ref(false);
const error = ref('');
const verdict = ref<JudgeVerdict | null>(null);
let searchTimer = 0;
let searchAbort: AbortController | null = null;

const hasCredentials = computed(() => hasYandexJudgeCredentials());
const credentialsHint = computed(() => {
  if (import.meta.env.PROD) {
    return 'На Vercel нужны env: `YANDEX_API_KEY`, `YANDEX_FOLDER_ID`, `VITE_YANDEX_FOLDER_ID`.';
  }
  return 'В `.env` нет `VITE_YANDEX_API_KEY` / `VITE_YANDEX_FOLDER_ID`. Добавь и перезапусти `npm run dev`.';
});
const canSubmit = computed(() => Boolean(selected.value) && !isLoading.value && !verdict.value && hasCredentials.value);

function onAnswerInput(value: string) {
  answer.value = value;
  if (selected.value && selected.value.name !== value) selected.value = null;
  searchError.value = '';
}

async function runSearch(query: string) {
  searchAbort?.abort();
  if (query.trim().length < 2 || selected.value?.name === query) {
    suggestions.value = [];
    searchOpen.value = false;
    isSearching.value = false;
    return;
  }
  const abort = new AbortController();
  searchAbort = abort;
  isSearching.value = true;
  searchOpen.value = true;
  try {
    suggestions.value = await searchPlayers(query, abort.signal);
    searchError.value = '';
  }
  catch (caught) {
    if (abort.signal.aborted) return;
    suggestions.value = [];
    searchError.value = caught instanceof Error ? caught.message : 'Поиск не удался';
  }
  finally {
    if (!abort.signal.aborted) isSearching.value = false;
  }
}

watch(answer, (value) => {
  window.clearTimeout(searchTimer);
  if (verdict.value || isLoading.value) return;
  searchTimer = window.setTimeout(() => {
    void runSearch(value);
  }, 300);
});

function pickPlayer(player: PlayerSearchHit) {
  selected.value = player;
  answer.value = player.name;
  suggestions.value = [];
  searchOpen.value = false;
  searchError.value = '';
}

function closeSearch() {
  searchOpen.value = false;
}

function goBack() {
  void router.push({ name: 'arena' });
}

const fieldKey = computed(() => field.value.map((slot) => slot.card.instanceId).join('-'));

const fieldTitles = computed(() =>
  field.value.map((slot) => findCard(slot.card.cardId)?.title ?? slot.card.cardId).join(' · '),
);

function startRound() {
  field.value = dealRandomField(field.value);
  answer.value = '';
  selected.value = null;
  suggestions.value = [];
  searchOpen.value = false;
  searchError.value = '';
  error.value = '';
  verdict.value = null;
  isLoading.value = false;
}

async function submit() {
  if (!canSubmit.value) return;
  const player = selected.value;
  if (!player) return;
  isLoading.value = true;
  error.value = '';
  searchOpen.value = false;
  try {
    const profile: PlayerProfile = await fetchPlayer(player.id);
    verdict.value = await judgeAnswer(field.value, profile);
  }
  catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Не удалось спросить модель';
  }
  finally {
    isLoading.value = false;
  }
}

useTelegramBackButton(goBack);
onMounted(startRound);
onBeforeUnmount(() => {
  window.clearTimeout(searchTimer);
  searchAbort?.abort();
});
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header
      class="flex items-center gap-3 border-b-[2.4px] border-ink bg-cream px-4 py-3"
      :style="{ paddingTop: 'calc(0.75rem + var(--tg-safe-top))' }"
    >
      <UiIconButton
        label="Назад"
        size="small"
        @click="goBack"
      >
        <ArrowLeftIcon class="size-4" />
      </UiIconButton>
      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold">Тест YandexGPT</p>
        <p class="font-mono text-[10px] text-ink-muted">три карты → судья → новая игра</p>
      </div>
    </header>

    <div class="flex flex-1 flex-col gap-4 px-4 py-4">
      <UiSurface
        v-if="!hasCredentials"
        color="flame"
        padding="tight"
        class="text-sm font-bold text-white"
      >
        {{ credentialsHint }}
      </UiSurface>

      <GameField
        v-if="field.length"
        :key="fieldKey"
        :field="field"
      />

      <p
        v-if="fieldTitles"
        class="text-center text-sm font-bold text-ink"
      >
        {{ fieldTitles }}
      </p>

      <form
        class="flex flex-col gap-3"
        @submit.prevent="submit"
      >
        <div class="relative">
          <UiInput
            :model-value="answer"
            label="Футболист"
            placeholder="начни вводить фамилию на английском"
            :disabled="Boolean(verdict) || isLoading"
            autocomplete="off"
            @update:model-value="onAnswerInput"
            @focus="searchOpen = suggestions.length > 0"
            @blur="closeSearch"
          />
          <ul
            v-if="searchOpen && answer.trim().length >= 2 && selected?.name !== answer"
            class="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-card border-[2.4px] border-ink bg-white shadow-hard"
          >
            <li
              v-if="isSearching"
              class="px-3 py-2 text-sm text-ink-muted"
            >
              Ищем…
            </li>
            <li
              v-else-if="searchError"
              class="px-3 py-2 text-sm font-semibold text-flame"
            >
              {{ searchError }}
            </li>
            <li
              v-for="player in suggestions"
              :key="player.id"
            >
              <button
                type="button"
                class="flex w-full items-center gap-3 px-3 py-2 text-left hover:bg-cream"
                @mousedown.prevent="pickPlayer(player)"
              >
                <img
                  v-if="player.photo"
                  :src="player.photo"
                  alt=""
                  class="size-8 rounded-full border border-ink object-cover"
                >
                <span class="min-w-0">
                  <span class="block truncate text-sm font-bold">{{ player.name }}</span>
                  <span class="block truncate text-xs text-ink-muted">{{ player.country }}</span>
                </span>
              </button>
            </li>
            <li
              v-if="!isSearching && !searchError && !suggestions.length"
              class="px-3 py-2 text-sm text-ink-muted"
            >
              Никого не нашли
            </li>
          </ul>
        </div>

        <UIButton
          type="submit"
          block
          :loading="isLoading"
          :disabled="!canSubmit"
        >
          Проверить
        </UIButton>
      </form>

      <UiSurface
        v-if="error"
        padding="tight"
        class="text-sm font-bold text-flame"
      >
        {{ error }}
      </UiSurface>

      <UiSurface
        v-if="verdict"
        :color="verdict.valid ? 'pitch' : 'flame'"
        padding="default"
        class="text-white"
      >
        <p class="font-display text-2xl font-black uppercase">
          {{ verdict.valid ? 'Ты прав' : 'Ты не прав' }}
        </p>
        <p
          v-if="verdict.canonicalName"
          class="mt-2 text-sm font-bold"
        >
          {{ verdict.canonicalName }}
        </p>
        <p
          v-if="verdict.unverifiedName"
          class="mt-1 text-xs text-white/80"
        >
          имя не подтверждено
        </p>
        <ul class="mt-2 space-y-1 text-sm text-white/90">
          <li>Позиция: {{ verdict.checks.position.evidence }} {{ verdict.checks.position.pass ? '✓' : '✗' }}</li>
          <li>Страна: {{ verdict.checks.geography.evidence }} {{ verdict.checks.geography.pass ? '✓' : '✗' }}</li>
          <li>Факт: {{ verdict.checks.fact.evidence }} {{ verdict.checks.fact.pass ? '✓' : '✗' }}</li>
        </ul>
      </UiSurface>

      <UIButton
        variant="outlined"
        color="ink"
        block
        :disabled="isLoading"
        @click="startRound"
      >
        Новая игра
      </UIButton>
    </div>
  </div>
</template>
