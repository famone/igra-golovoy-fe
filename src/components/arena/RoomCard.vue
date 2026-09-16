<script setup lang="ts">
import { computed } from 'vue';
import { EyeIcon, UsersIcon } from '@lucide/vue';
import UiAvatar from '@/components/ui/UiAvatar.vue';
import UiChip from '@/components/ui/UiChip.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { pluralWithCount } from '@/lib/format';
import type { Room } from '@/types/game';
import type { BrandColor } from '@/components/ui/types';

const props = defineProps<{
  room: Room;
}>();

defineEmits<{
  open: [room: Room];
}>();

const statusMeta = computed<{ label: string; color: BrandColor }>(() => {
  switch (props.room.status) {
  case 'playing': return { label: 'Идёт игра', color: 'flame' };
  case 'finished': return { label: 'Завершена', color: 'ink' };
  default: return { label: 'Набор', color: 'pitch' };
  }
});

const formatLabel = computed(() =>
  props.room.settings.format === 'points' ? 'На очки' : 'На вылет',
);

const isFull = computed(() => props.room.playersCount >= props.room.settings.maxPlayers);

/** Больше четырёх аватаров не помещается — остальных сворачиваем в счётчик. */
const visiblePlayers = computed(() => props.room.players.slice(0, 4));
const hiddenCount = computed(() => Math.max(0, props.room.playersCount - visiblePlayers.value.length));
</script>

<template>
  <UiSurface
    as="button"
    interactive
    class="w-full"
    @click="$emit('open', room)"
  >
    <div class="flex items-start justify-between gap-2">
      <div class="flex flex-wrap items-center gap-1.5">
        <UiChip
          :color="statusMeta.color"
          variant="solid"
          size="small"
        >
          {{ statusMeta.label }}
        </UiChip>
        <UiChip
          color="sky"
          size="small"
        >
          {{ formatLabel }}
        </UiChip>
        <UiChip
          v-if="room.settings.difficulty === 'simple'"
          color="lemon"
          size="small"
        >
          Простой
        </UiChip>
        <UiChip
          v-if="room.settings.hardcoreRepeats"
          color="grape"
          size="small"
        >
          Хардкор
        </UiChip>
      </div>

      <span class="shrink-0 font-mono text-[11px] font-bold tracking-widest text-ink-muted">
        {{ room.code }}
      </span>
    </div>

    <h3 class="mt-2 truncate text-sm">{{ room.title }}</h3>

    <div class="mt-3 flex items-center justify-between gap-3">
      <div class="flex items-center -space-x-2">
        <UiAvatar
          v-for="player in visiblePlayers"
          :key="player.user.id"
          :name="player.user.name"
          :src="player.user.avatarUrl"
          size="xs"
        />
        <span
          v-if="hiddenCount"
          class="inline-flex size-7 items-center justify-center rounded-full border-ink-line bg-cream-2 font-mono text-[9px] font-bold"
        >
          +{{ hiddenCount }}
        </span>
      </div>

      <div class="flex items-center gap-3 font-mono text-[11px] text-ink-soft">
        <span
          class="inline-flex items-center gap-1"
          :class="isFull && 'text-flame'"
        >
          <UsersIcon class="size-3.5" />
          {{ room.playersCount }}/{{ room.settings.maxPlayers }}
        </span>
        <span class="inline-flex items-center gap-1">
          <EyeIcon class="size-3.5" />
          {{ room.spectatorsCount }}
        </span>
        <span>{{ pluralWithCount(room.settings.turnSeconds, ['сек', 'сек', 'сек']) }}</span>
      </div>
    </div>
  </UiSurface>
</template>
