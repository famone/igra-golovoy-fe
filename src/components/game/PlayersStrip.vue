<script setup lang="ts">
import UiAvatar from '@/components/ui/UiAvatar.vue';
import { cn } from '@/lib/utils';
import type { GamePlayer } from '@/types/game';

/** Полоска соперников: аватар, число карт на руке и отметка хода. */
defineProps<{
  players: GamePlayer[];
  activePlayerId: string;
  class?: string;
}>();
</script>

<template>
  <div :class="cn('-mx-4 flex gap-3 overflow-x-auto px-4 scrollbar-none', $props.class)">
    <div
      v-for="player in players"
      :key="player.user.id"
      :class="cn(
        'flex w-16 shrink-0 flex-col items-center gap-1 rounded-card border-ink-line px-1 py-2',
        player.user.id === activePlayerId ? 'bg-lemon shadow-hard-xs' : 'bg-white',
        !player.isConnected && 'opacity-50',
      )"
    >
      <div class="relative">
        <UiAvatar
          :name="player.user.name"
          :src="player.user.avatarUrl"
          size="small"
        />
        <span
          class="absolute -right-1.5 -bottom-1 rounded-pill border-[2px] border-ink bg-white px-1 font-mono text-[9px] font-bold"
        >
          {{ player.handCount }}
        </span>
      </div>

      <span class="w-full truncate text-center text-[10px] font-bold">
        {{ player.user.name.split(' ')[0] }}
      </span>

      <span
        v-if="player.declaredLastCard"
        class="font-mono text-[8px] tracking-wide text-flame uppercase"
      >
        1×1
      </span>
    </div>
  </div>
</template>
