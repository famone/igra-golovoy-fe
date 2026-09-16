<script setup lang="ts">
import lottie, { type AnimationItem } from 'lottie-web';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';

/**
 * Прелоадер один в один с igragolovoy.ru:
 * зелёное поле, дудл-паттерн, Lottie-мяч, затем уезд вверх.
 * Скрывается после загрузки шрифтов + первого кадра анимации,
 * но не раньше 900 мс и не позже 4 с.
 */
const hidden = ref(false);
const removed = ref(false);
const pageReady = ref(false);
const lottieReady = ref(false);
const stageRef = ref<HTMLElement | null>(null);

const startedAt = performance.now();

let animation: AnimationItem | null = null;
let hideWhenReadyTimer: number | null = null;
let fallbackTimer: number | null = null;
let removeTimer: number | null = null;

function markLottieReady() {
  lottieReady.value = true;
}

onMounted(() => {
  if (stageRef.value) {
    animation = lottie.loadAnimation({
      container: stageRef.value,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: '/brand/football.json',
    });
    animation.addEventListener('DOMLoaded', markLottieReady);
    animation.addEventListener('data_ready', markLottieReady);
  }

  void Promise.all([
    document.readyState === 'complete'
      ? Promise.resolve()
      : new Promise<void>((resolve) => {
        window.addEventListener('load', () => resolve(), { once: true });
      }),
    document.fonts?.ready ?? Promise.resolve(),
  ]).then(() => {
    pageReady.value = true;
  });

  fallbackTimer = window.setTimeout(() => {
    hidden.value = true;
  }, 4000);
});

watch(
  [hidden, pageReady, lottieReady],
  ([isHidden, isPageReady, isLottieReady]) => {
    if (hideWhenReadyTimer !== null) {
      window.clearTimeout(hideWhenReadyTimer);
      hideWhenReadyTimer = null;
    }
    if (isHidden || !isPageReady || !isLottieReady) return;

    const wait = Math.max(0, 900 - (performance.now() - startedAt));
    hideWhenReadyTimer = window.setTimeout(() => {
      hidden.value = true;
    }, wait);
  },
);

watch(hidden, (isHidden) => {
  if (!isHidden) return;
  removeTimer = window.setTimeout(() => {
    removed.value = true;
  }, 600);
});

onBeforeUnmount(() => {
  animation?.destroy();
  if (hideWhenReadyTimer !== null) window.clearTimeout(hideWhenReadyTimer);
  if (fallbackTimer !== null) window.clearTimeout(fallbackTimer);
  if (removeTimer !== null) window.clearTimeout(removeTimer);
});
</script>

<template>
  <div
    v-if="!removed"
    class="pre"
    :class="{ hide: hidden }"
    role="status"
    aria-label="Загрузка"
    :aria-hidden="hidden"
  >
    <div
      class="pre-doodle"
      aria-hidden="true"
    />

    <div
      ref="stageRef"
      class="stage"
      aria-hidden="true"
    />
  </div>
</template>

<style scoped>
.pre {
  z-index: 9999;
  will-change: opacity, transform;
  background: #3aaa35;
  justify-content: center;
  align-items: center;
  transition: opacity 0.5s, transform 0.55s cubic-bezier(0.7, 0, 0.3, 1);
  display: flex;
  position: fixed;
  inset: 0;
  overflow: hidden;
}

.pre.hide {
  opacity: 0;
  pointer-events: none;
  transform: translateY(-8%);
}

.pre-doodle {
  opacity: 0.07;
  background-image: url('/brand/pattern.svg');
  background-repeat: repeat;
  background-size: 640px;
  position: absolute;
  inset: 0;
}

.stage {
  justify-content: center;
  align-items: center;
  width: min(220px, 56vw);
  height: min(220px, 56vw);
  display: flex;
  position: relative;
}

.stage :deep(svg) {
  width: 100%;
  height: 100%;
}
</style>
