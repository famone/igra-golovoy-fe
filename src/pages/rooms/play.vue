<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeftIcon, MegaphoneIcon } from '@lucide/vue';
import GameField from '@/components/game/GameField.vue';
import PlayerHand from '@/components/game/PlayerHand.vue';
import PlayersStrip from '@/components/game/PlayersStrip.vue';
import TurnTimer from '@/components/game/TurnTimer.vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiChip from '@/components/ui/UiChip.vue';
import UiDialog from '@/components/ui/UiDialog.vue';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import UiInput from '@/components/ui/UiInput.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useRealtimeStatus } from '@/composables/useRealtimeStatus';
import { useTelegramBackButton } from '@/composables/useTelegramBackButton';
import { useGameStore } from '@/stores/game';

/**
 * Экран партии. Сейчас работает на локальном движке-заглушке:
 * правильность ответа не проверяется, засчитывается любой новый футболист.
 * Полная валидация — задача бэкенда, см. TODO.md.
 */
const route = useRoute();
const router = useRouter();
const gameStore = useGameStore();
const { label: connectionLabel, isDegraded } = useRealtimeStatus();

const roomId = computed(() => String(route.params.id));
const answer = ref('');
const isResultsOpen = ref(false);

const state = computed(() => gameStore.state);
const turn = computed(() => state.value?.turn ?? null);

const phaseHint = computed(() => {
  if (!gameStore.isMyTurn) return `Ходит ${gameStore.activePlayer?.user.name ?? 'соперник'}`;
  if (gameStore.canAnswer) return 'Назови футболиста под все три карты';
  if (gameStore.canDiscard) return 'Скинь карту с руки на поле — тапни дважды';
  return 'Ждём…';
});

function goBack() {
  void router.push({ name: 'arena' });
}

function submitAnswer() {
  if (!answer.value.trim()) return;
  gameStore.SUBMIT_ANSWER(answer.value);
  answer.value = '';
}

watch(() => gameStore.results, (results) => {
  if (results) isResultsOpen.value = true;
});

useTelegramBackButton(goBack);

onMounted(() => {
  if (!gameStore.state) gameStore.CONNECT(roomId.value);
});

onBeforeUnmount(() => {
  gameStore.RESET();
});
</script>

<template>
  <div class="flex min-h-dvh flex-col">
    <header
      class="flex items-center gap-3 border-b-[2.4px] border-ink bg-cream px-4 py-3"
      :style="{ paddingTop: 'calc(0.75rem + var(--tg-safe-top))' }"
    >
      <UiIconButton
        label="Выйти из партии"
        size="small"
        @click="goBack"
      >
        <ArrowLeftIcon class="size-4" />
      </UiIconButton>

      <div class="min-w-0 flex-1">
        <p class="truncate text-sm font-bold">Раунд {{ state?.round ?? 1 }}</p>
        <p class="font-mono text-[10px] text-ink-muted">
          В колоде {{ state?.deckCount ?? 0 }}
        </p>
      </div>

      <UiChip
        :color="isDegraded ? 'flame' : 'pitch'"
        size="small"
      >
        {{ connectionLabel }}
      </UiChip>
    </header>

    <div class="flex flex-1 flex-col gap-4 px-4 py-4">
      <PlayersStrip
        v-if="state"
        :players="state.players"
        :active-player-id="state.turn.activePlayerId"
      />

      <TurnTimer
        v-if="turn"
        :deadline-at="turn.deadlineAt"
        :total-seconds="turn.totalSeconds"
        :is-active="gameStore.isMyTurn"
        @expire="gameStore.isMyTurn && gameStore.SKIP_TURN()"
      />

      <GameField
        v-if="state"
        :field="state.field"
      />

      <UiSurface
        padding="tight"
        shadow="sm"
        class="text-center text-sm font-bold"
      >
        {{ phaseHint }}
      </UiSurface>

      <div
        v-if="gameStore.canAnswer"
        class="flex items-end gap-2"
      >
        <UiInput
          v-model="answer"
          placeholder="Лаутаро Мартинес"
          hide-details
          autocomplete="off"
          @keyup.enter="submitAnswer"
        />
        <UIButton
          size="default"
          :disabled="!answer.trim()"
          @click="submitAnswer"
        >
          Ответ
        </UIButton>
      </div>

      <UIButton
        v-if="gameStore.canAnswer"
        variant="ghost"
        color="ink"
        block
        size="small"
        @click="gameStore.SKIP_TURN()"
      >
        Не знаю — беру штраф
      </UIButton>

      <UIButton
        v-if="gameStore.shouldDeclareLastCard"
        color="lemon"
        block
        @click="gameStore.DECLARE_LAST_CARD()"
      >
        <template #leading>
          <MegaphoneIcon class="size-4" />
        </template>
        Выхожу один на один!
      </UIButton>
    </div>

    <footer
      class="sticky bottom-0 border-t-[2.4px] border-ink bg-cream px-4"
      :style="{ paddingBottom: 'calc(0.5rem + var(--tg-safe-bottom))' }"
    >
      <PlayerHand
        v-if="state"
        :hand="state.hand"
        :playable="gameStore.canDiscard"
        @play="gameStore.DISCARD_CARD($event)"
      />
    </footer>

    <UiDialog
      v-model="isResultsOpen"
      title="Партия окончена"
    >
      <ol class="flex flex-col gap-2">
        <li
          v-for="row in gameStore.results ?? []"
          :key="row.user.id"
          class="flex items-center justify-between gap-3 rounded-card border-ink-line bg-white px-3 py-2"
        >
          <span class="font-display text-sm font-black">{{ row.place }}</span>
          <span class="min-w-0 flex-1 truncate text-sm font-bold">{{ row.user.name }}</span>
          <span
            class="font-mono text-xs"
            :class="row.ratingDelta >= 0 ? 'text-pitch-dark' : 'text-flame'"
          >
            {{ row.ratingDelta >= 0 ? '+' : '' }}{{ row.ratingDelta }}
          </span>
        </li>
      </ol>

      <template #actions>
        <UIButton
          block
          @click="goBack"
        >
          На арену
        </UIButton>
      </template>
    </UiDialog>
  </div>
</template>
