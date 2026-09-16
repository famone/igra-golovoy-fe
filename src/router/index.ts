import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

declare module 'vue-router' {
  interface RouteMeta {
    /** Каркас экрана: с нижним меню или без него. */
    layout?: 'app' | 'focus';
    title?: string;
  }
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => ({ top: 0 }),
  routes: [
    {
      path: '/',
      redirect: { name: 'arena' },
    },
    {
      path: '/arena',
      name: 'arena',
      meta: { layout: 'app', title: 'Арена' },
      component: () => import('@/pages/arena/index.vue'),
    },
    {
      path: '/rooms/:id',
      name: 'room',
      meta: { layout: 'focus', title: 'Комната' },
      component: () => import('@/pages/rooms/[id].vue'),
    },
    {
      path: '/rooms/:id/play',
      name: 'game',
      meta: { layout: 'focus', title: 'Партия' },
      component: () => import('@/pages/rooms/play.vue'),
    },
    {
      path: '/leaders',
      name: 'leaders',
      meta: { layout: 'app', title: 'Лидеры' },
      component: () => import('@/pages/leaders/index.vue'),
    },
    {
      path: '/wallet',
      name: 'wallet',
      meta: { layout: 'app', title: 'Кошелёк' },
      component: () => import('@/pages/wallet/index.vue'),
    },
    {
      path: '/profile',
      name: 'profile',
      meta: { layout: 'app', title: 'Профиль' },
      component: () => import('@/pages/profile/index.vue'),
    },
    {
      path: '/rules',
      name: 'rules',
      meta: { layout: 'focus', title: 'Правила' },
      component: () => import('@/pages/rules/index.vue'),
    },
    {
      path: '/test-yandex',
      name: 'test-yandex',
      meta: { layout: 'focus', title: 'Тест YandexGPT' },
      component: () => import('@/pages/test-yandex/index.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      meta: { layout: 'app', title: 'Не найдено' },
      component: () => import('@/pages/not-found/index.vue'),
    },
  ],
});

// Авторизация по Telegram initData выполняется один раз перед первым экраном:
// дальше `INIT` возвращается сразу по флагу `isReady`.
router.beforeEach(async () => {
  await useAuthStore().INIT();
  return true;
});

router.afterEach((to) => {
  document.title = to.meta.title ? `${to.meta.title} — Игра головой` : 'Игра головой';
});

export default router;
