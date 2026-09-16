<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { ChevronDownIcon, ChevronUpIcon, MinusIcon } from '@lucide/vue';
import UiAvatar from '@/components/ui/UiAvatar.vue';
import UiSegmented from '@/components/ui/UiSegmented.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { formatNumber } from '@/lib/format';
import { useLeadersStore } from '@/stores/leaders';
import type { LeaderboardPeriod } from '@/types/user';
import type { SegmentOption } from '@/components/ui/types';

const leadersStore = useLeadersStore();

const periodOptions: SegmentOption<LeaderboardPeriod>[] = [
  { value: 'week', label: 'Неделя' },
  { value: 'month', label: 'Месяц' },
  { value: 'all', label: 'За всё время' },
];

const periodModel = computed<LeaderboardPeriod>({
  get: () => leadersStore.period,
  set: (value) => {
    void leadersStore.FETCH_LEADERBOARD(value); 
  },
});

/** Классический подиум: второе место слева, первое по центру, третье справа. */
const podiumOrder = computed(() => {
  const [first, second, third] = leadersStore.podium;
  return [second, first, third].filter(Boolean);
});

const podiumHeights: Record<number, string> = {
  1: 'h-24 bg-lemon',
  2: 'h-18 bg-cream-3',
  3: 'h-14 bg-flame/40',
};

onMounted(() => {
  if (leadersStore.entries.length) return;
  void leadersStore.FETCH_LEADERBOARD();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <UiSegmented
      v-model="periodModel"
      :options="periodOptions"
      fill
    />

    <div
      v-if="leadersStore.loading && !leadersStore.entries.length"
      class="flex flex-col gap-3"
    >
      <UiSkeleton shape="card" />
      <UiSkeleton
        v-for="index in 5"
        :key="index"
        shape="block"
      />
    </div>

    <template v-else>
      <div class="flex items-end justify-center gap-2">
        <div
          v-for="entry in podiumOrder"
          :key="entry!.user.id"
          class="flex w-full max-w-24 flex-col items-center gap-2"
        >
          <UiAvatar
            :name="entry!.user.name"
            :src="entry!.user.avatarUrl"
            :size="entry!.place === 1 ? 'large' : 'default'"
          />
          <span class="w-full truncate text-center text-[11px] font-bold">
            {{ entry!.user.name.split(' ')[0] }}
          </span>
          <div
            class="flex w-full items-start justify-center rounded-t-card border-ink-line border-b-0 pt-2 font-display text-xl font-black"
            :class="podiumHeights[entry!.place]"
          >
            {{ entry!.place }}
          </div>
        </div>
      </div>

      <UiSurface
        v-if="leadersStore.myEntry"
        color="grape"
        padding="tight"
        class="flex items-center gap-3"
      >
        <span class="font-display text-lg font-black">#{{ leadersStore.myEntry.place }}</span>
        <span class="min-w-0 flex-1 truncate text-sm font-bold">Ты</span>
        <span class="font-mono text-sm">{{ formatNumber(leadersStore.myEntry.rating) }}</span>
      </UiSurface>

      <div class="flex flex-col gap-2">
        <UiSurface
          v-for="entry in leadersStore.rest"
          :key="entry.user.id"
          padding="tight"
          shadow="sm"
          class="flex items-center gap-3"
        >
          <span class="w-6 shrink-0 text-center font-display text-sm font-black text-ink-muted">
            {{ entry.place }}
          </span>

          <UiAvatar
            :name="entry.user.name"
            :src="entry.user.avatarUrl"
            size="small"
          />

          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold">{{ entry.user.name }}</p>
            <p class="font-mono text-[10px] text-ink-muted">
              {{ entry.gamesWon }} побед
            </p>
          </div>

          <span class="font-mono text-sm font-bold">{{ formatNumber(entry.rating) }}</span>

          <span
            class="flex w-5 justify-center"
            :class="entry.delta > 0 ? 'text-pitch-dark' : entry.delta < 0 ? 'text-flame' : 'text-ink-muted'"
          >
            <ChevronUpIcon
              v-if="entry.delta > 0"
              class="size-4"
            />
            <ChevronDownIcon
              v-else-if="entry.delta < 0"
              class="size-4"
            />
            <MinusIcon
              v-else
              class="size-4"
            />
          </span>
        </UiSurface>
      </div>
    </template>
  </div>
</template>
