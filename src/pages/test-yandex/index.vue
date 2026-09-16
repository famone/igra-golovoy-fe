<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ArrowLeftIcon } from '@lucide/vue';
import GameField from '@/components/game/GameField.vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useTelegramBackButton } from '@/composables/useTelegramBackButton';
import { findCard } from '@/constants/deck';
import { env } from '@/lib/env';
import { dealRandomField, judgeAnswer, type JudgeVerdict } from '@/lib/yandexJudge';
import type { FieldSlot } from '@/types/game';

/**
 * Песочница судьи: три случайные карты → ответ игрока → YandexGPT → новая раздача.
 * Игрового бэкенда нет, в проде этот экран не использовать: ключ светится во фронте.
 */
const router = useRouter();
const field = ref<FieldSlot[]>([]);
const answer = ref('');
const isLoading = ref(false);
const error = ref('');
const verdict = ref<JudgeVerdict | null>(null);

const hasCredentials = computed(() => Boolean(env.yandexApiKey && env.yandexFolderId));
const canSubmit = computed(() => Boolean(answer.value.trim()) && !isLoading.value && !verdict.value && hasCredentials.value);

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
  error.value = '';
  verdict.value = null;
  isLoading.value = false;
}

async function submit() {
  if (!canSubmit.value) return;
  isLoading.value = true;
  error.value = '';
  try {
    verdict.value = await judgeAnswer(field.value, answer.value);
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
        В `.env` нет `VITE_YANDEX_API_KEY` / `VITE_YANDEX_FOLDER_ID`. Добавь и перезапусти `npm run dev`.
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
        <UiInput
          v-model="answer"
          label="Футболист"
          placeholder="например: Лионель Месси"
          :disabled="Boolean(verdict) || isLoading"
        />

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
        <p class="mt-1 text-sm text-white/90">
          {{ verdict.reason }}
        </p>
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
