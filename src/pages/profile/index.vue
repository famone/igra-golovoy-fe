<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { BookOpenIcon, ShareIcon } from '@lucide/vue';
import UIButton from '@/components/ui/UIButton.vue';
import UiAvatar from '@/components/ui/UiAvatar.vue';
import UiProgress from '@/components/ui/UiProgress.vue';
import UiSectionHeader from '@/components/ui/UiSectionHeader.vue';
import UiSkeleton from '@/components/ui/UiSkeleton.vue';
import UiStat from '@/components/ui/UiStat.vue';
import UiSurface from '@/components/ui/UiSurface.vue';
import { useClipboard } from '@/composables/useClipboard';
import { formatNumber } from '@/lib/format';
import { cn } from '@/lib/utils';
import { useProfileStore } from '@/stores/profile';

const router = useRouter();
const profileStore = useProfileStore();
const { copy } = useClipboard('Ссылка скопирована');

const profile = computed(() => profileStore.profile);

const winRatePercent = computed(() => Math.round(profileStore.winRate * 100));

function share() {
  void copy(window.location.origin);
}

onMounted(() => {
  if (profileStore.profile) return;
  void profileStore.FETCH_PROFILE();
});
</script>

<template>
  <div class="flex flex-col gap-4">
    <template v-if="profileStore.loading && !profile">
      <UiSkeleton shape="card" />
      <UiSkeleton shape="block" />
    </template>

    <template v-else-if="profile">
      <UiSurface class="flex items-center gap-4">
        <UiAvatar
          :name="profile.name"
          :src="profile.avatarUrl"
          size="large"
        />

        <div class="min-w-0 flex-1">
          <h2 class="truncate text-base leading-tight">{{ profile.name }}</h2>
          <p
            v-if="profile.username"
            class="font-mono text-[11px] text-ink-muted"
          >
            @{{ profile.username }}
          </p>
          <p class="mt-1 font-display text-lg leading-none font-black text-flame">
            {{ formatNumber(profile.rating) }}
          </p>
        </div>
      </UiSurface>

      <div class="grid grid-cols-4 gap-2">
        <UiStat
          :value="profile.stats.gamesPlayed"
          label="Партий"
        />
        <UiStat
          :value="profile.stats.gamesWon"
          label="Побед"
          color="pitch"
        />
        <UiStat
          :value="`${Math.round(profile.stats.accuracy * 100)}%`"
          label="Точность"
          color="sky"
        />
        <UiStat
          :value="profile.stats.bestStreak"
          label="Серия"
          color="flame"
        />
      </div>

      <UiSurface
        padding="tight"
        shadow="sm"
        class="flex flex-col gap-2"
      >
        <div class="flex items-baseline justify-between">
          <span class="text-xs font-extrabold tracking-wide text-ink-soft uppercase">
            Доля побед
          </span>
          <span class="font-mono text-sm font-bold">{{ winRatePercent }}%</span>
        </div>
        <UiProgress
          :value="profileStore.winRate"
          size="small"
        />
        <p class="text-xs text-ink-muted">
          Среднее время ответа — {{ profile.stats.averageAnswerTime }} сек
        </p>
      </UiSurface>

      <section class="flex flex-col gap-3">
        <UiSectionHeader
          eyebrow="Коллекция"
          :title="`Достижения ${profileStore.unlockedAchievements.length}/${profile.achievements.length}`"
        />

        <div class="grid grid-cols-3 gap-2">
          <div
            v-for="achievement in profile.achievements"
            :key="achievement.id"
            :class="cn(
              'flex flex-col items-center gap-1 rounded-card border-ink-line px-2 py-3 text-center',
              achievement.unlockedAt ? 'bg-white shadow-hard-xs' : 'bg-cream-2 opacity-55',
            )"
            :title="achievement.description"
          >
            <span class="text-2xl">{{ achievement.icon }}</span>
            <span class="text-[10px] leading-tight font-bold text-balance">
              {{ achievement.title }}
            </span>
          </div>
        </div>
      </section>

      <div class="flex flex-col gap-2">
        <UIButton
          block
          variant="outlined"
          color="ink"
          @click="router.push({ name: 'rules' })"
        >
          <template #leading>
            <BookOpenIcon class="size-4" />
          </template>
          Правила игры
        </UIButton>

        <UIButton
          block
          variant="ghost"
          color="ink"
          @click="share"
        >
          <template #leading>
            <ShareIcon class="size-4" />
          </template>
          Позвать друзей
        </UIButton>
      </div>
    </template>
  </div>
</template>
