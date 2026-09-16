<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeftIcon, CopyIcon } from '@lucide/vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiAvatar from '@/components/ui/UiAvatar.vue';
import UiChip from '@/components/ui/UiChip.vue';
import UiIconButton from '@/components/ui/UiIconButton.vue';
import UiSectionHeader from '@/components/ui/UiSectionHeader.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useClipboard } from '@/composables/useClipboard';
import { useTelegramBackButton } from '@/composables/useTelegramBackButton';
import { pluralWithCount } from '@/lib/format';
import { useArenaStore } from '@/stores/arena';
import { useGameStore } from '@/stores/game';

/** Лобби комнаты: состав игроков, настройки и запуск партии. */
const route = useRoute();
const router = useRouter();
const arenaStore = useArenaStore();
const gameStore = useGameStore();
const { copy } = useClipboard('Код комнаты скопирован');

const roomId = computed(() => String(route.params.id));

const room = computed(
  () => gameStore.room ?? arenaStore.rooms.find((item) => item.id === roomId.value) ?? null,
);

const settingsSummary = computed(() => {
  const settings = room.value?.settings;
  if (!settings) return [];

  return [
    settings.format === 'points' ? 'На очки, 3 раунда' : 'На вылет',
    settings.difficulty === 'simple' ? 'Простой вариант' : 'Обычный вариант',
    pluralWithCount(settings.turnSeconds, ['секунда', 'секунды', 'секунд']) + ' на ход',
    settings.hardcoreRepeats ? 'Хардкор: без повторов' : 'Повторы между раундами',
  ];
});

function goBack() {
  void router.push({ name: 'arena' });
}

function startGame() {
  gameStore.START_GAME();
  void router.push({ name: 'game', params: { id: roomId.value } });
}

useTelegramBackButton(goBack);

onMounted(() => {
  if (!arenaStore.isLoaded) void arenaStore.FETCH_ROOMS();
  gameStore.CONNECT(roomId.value);
});

onBeforeUnmount(() => {
  // Соединение живёт дальше только если игрок ушёл на экран партии.
  if (router.currentRoute.value.name !== 'game') gameStore.RESET();
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

      <h1 class="min-w-0 flex-1 truncate text-base">
        {{ room?.title ?? 'Комната' }}
      </h1>
    </header>

    <div class="flex flex-1 flex-col gap-4 px-4 py-4">
      <UiSurface
        v-if="room"
        color="ink"
        class="flex items-center justify-between gap-3"
      >
        <div>
          <p class="font-mono text-[10px] tracking-widest uppercase opacity-60">Код комнаты</p>
          <p class="font-display text-2xl leading-none font-black tracking-[0.2em]">
            {{ room.code }}
          </p>
        </div>

        <UiIconButton
          label="Скопировать код"
          color="lemon"
          @click="copy(room.code)"
        >
          <CopyIcon class="size-4" />
        </UiIconButton>
      </UiSurface>

      <div class="flex flex-wrap gap-1.5">
        <UiChip
          v-for="item in settingsSummary"
          :key="item"
          color="sky"
          size="small"
        >
          {{ item }}
        </UiChip>
      </div>

      <section
        v-if="room"
        class="flex flex-col gap-3"
      >
        <UiSectionHeader
          eyebrow="За столом"
          :title="`${room.playersCount} из ${room.settings.maxPlayers}`"
        />

        <UiSurface
          v-for="player in room.players"
          :key="player.user.id"
          padding="tight"
          shadow="sm"
          class="flex items-center gap-3"
        >
          <UiAvatar
            :name="player.user.name"
            :src="player.user.avatarUrl"
            size="small"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold">{{ player.user.name }}</p>
            <p class="font-mono text-[10px] text-ink-muted">
              Рейтинг {{ player.user.rating }}
            </p>
          </div>

          <UiChip
            v-if="player.isHost"
            color="flame"
            size="small"
          >
            Хост
          </UiChip>
          <UiChip
            v-else
            :color="player.isReady ? 'pitch' : 'ink'"
            size="small"
          >
            {{ player.isReady ? 'Готов' : 'Ждём' }}
          </UiChip>
        </UiSurface>
      </section>
    </div>

    <footer
      class="sticky bottom-0 border-t-[2.4px] border-ink bg-cream px-4 py-3"
      :style="{ paddingBottom: 'calc(0.75rem + var(--tg-safe-bottom))' }"
    >
      <UIButton
        block
        size="large"
        @click="startGame"
      >
        Начать партию
      </UIButton>
    </footer>
  </div>
</template>
