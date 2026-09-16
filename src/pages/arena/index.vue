<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { KeyRoundIcon } from '@lucide/vue';
import JoinByCodeSheet from '@/components/arena/JoinByCodeSheet.vue';
import RoomCard from '@/components/arena/RoomCard.vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiEmptyState from '@/components/ui/UiEmptyState.vue';
import UiSegmented from '@/components/ui/UiSegmented.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useArenaStore } from '@/stores/arena';
import { useAuthStore } from '@/stores/auth';
import type { ArenaFilter } from '@/stores/arena';
import type { Room } from '@/types/game';
import type { SegmentOption } from '@/components/ui/types';

const router = useRouter();
const arenaStore = useArenaStore();
const authStore = useAuthStore();

const isJoinOpen = ref(false);

const filterOptions = computed<SegmentOption<ArenaFilter>[]>(() => [
  { value: 'all', label: 'Все', count: arenaStore.counts.all },
  { value: 'waiting', label: 'Набор', count: arenaStore.counts.waiting },
  { value: 'playing', label: 'Идут', count: arenaStore.counts.playing },
  { value: 'mine', label: 'Мои', count: arenaStore.counts.mine },
]);

const filterModel = computed<ArenaFilter>({
  get: () => arenaStore.filter,
  set: (value) => arenaStore.SET_FILTER(value),
});

function openRoom(room: Room) {
  void router.push({ name: 'room', params: { id: room.id } });
}

onMounted(() => {
  if (arenaStore.isLoaded) return;
  void arenaStore.FETCH_ROOMS();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiSurface
      color="grape"
      class="flex items-center justify-between gap-3"
    >
      <div class="min-w-0">
        <p class="font-mono text-[10px] tracking-widest uppercase opacity-70">
          Привет, {{ authStore.displayName.split(' ')[0] }}
        </p>
        <h2 class="mt-0.5 text-base leading-tight">Назови футболиста за 30 секунд</h2>
      </div>

      <UIButton
        color="lemon"
        size="small"
        @click="isJoinOpen = true"
      >
        <template #leading>
          <KeyRoundIcon class="size-3.5" />
        </template>
        Код
      </UIButton>
    </UiSurface>

    <UiSegmented
      v-model="filterModel"
      :options="filterOptions"
    />

    <div
      v-if="arenaStore.loading && !arenaStore.isLoaded"
      class="flex flex-col gap-3"
    >
      <UiSkeleton
        v-for="index in 4"
        :key="index"
        shape="card"
      />
    </div>

    <UiEmptyState
      v-else-if="!arenaStore.visibleRooms.length"
      title="Пока пусто"
      description="Создай свою комнату кнопкой снизу или зайди по коду от друга."
      icon="🥅"
    />

    <div
      v-else
      class="flex flex-col gap-3"
    >
      <RoomCard
        v-for="room in arenaStore.visibleRooms"
        :key="room.id"
        :room="room"
        @open="openRoom"
      />
    </div>

    <JoinByCodeSheet v-model="isJoinOpen" />
  </div>
</template>
