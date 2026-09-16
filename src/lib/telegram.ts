import {
  backButton,
  hapticFeedback,
  init,
  isTMA,
  miniApp,
  mockTelegramEnv,
  retrieveLaunchParams,
  retrieveRawInitData,
  themeParams,
  viewport,
} from '@tma.js/sdk-vue';
import { env } from '@/lib/env';
import type { TelegramIdentity } from '@/types/user';

let isInsideTelegram = false;
let isInitialised = false;

/** Фейковый пользователь для разработки в обычном браузере. */
const DEV_IDENTITY: TelegramIdentity = {
  telegramId: 100_500,
  username: 'dev_user',
  firstName: 'Локальный',
  lastName: 'Игрок',
};

const BRAND_BG = '#fbf7ef';

function installDevEnvironment() {
  const tgWebAppData = new URLSearchParams([
    ['user', JSON.stringify({
      id: DEV_IDENTITY.telegramId,
      first_name: DEV_IDENTITY.firstName,
      last_name: DEV_IDENTITY.lastName,
      username: DEV_IDENTITY.username,
      language_code: 'ru',
    })],
    ['hash', 'dev-hash'],
    ['signature', 'dev-signature'],
    ['auth_date', String(Math.floor(Date.now() / 1000))],
  ]).toString();

  mockTelegramEnv({
    launchParams: {
      tgWebAppData,
      tgWebAppPlatform: 'tdesktop',
      tgWebAppVersion: '8.0',
      tgWebAppThemeParams: {
        bg_color: BRAND_BG,
        text_color: '#16130f',
        button_color: '#ff6a2b',
        button_text_color: '#ffffff',
      },
    },
  });
}

/** Любой вызов SDK может упасть на старой версии клиента — это не повод ронять приложение. */
function safely(fn: () => void) {
  try {
    fn();
  }
  catch {
    // Возможность не поддерживается этой версией Telegram — работаем без неё.
  }
}

/**
 * Поднимает мост Telegram и синхронизирует системные зоны с CSS-переменными.
 * Вне Telegram (обычный браузер) молча деградирует до заглушки,
 * чтобы приложение оставалось разрабатываемым локально.
 */
export function initTelegram() {
  if (isInitialised) return;
  isInitialised = true;

  if (!isTMA() && env.mockTelegram) {
    installDevEnvironment();
  }

  if (!isTMA()) return;

  safely(() => {
    init();
    isInsideTelegram = true;
  });

  if (!isInsideTelegram) return;

  safely(() => {
    themeParams.mount.ifAvailable();
    miniApp.mount.ifAvailable();
    miniApp.setHeaderColor.ifAvailable(BRAND_BG);
    miniApp.setBgColor.ifAvailable(BRAND_BG);
    miniApp.setBottomBarColor.ifAvailable(BRAND_BG);
  });

  safely(() => backButton.mount.ifAvailable());

  safely(() => {
    const mounted = viewport.mount.ifAvailable();
    if (mounted.ok) {
      void Promise.resolve(mounted.data).then(applySafeArea).catch(() => {});
    }
    viewport.expand.ifAvailable();
    viewport.bindCssVars.ifAvailable();
  });

  safely(() => miniApp.ready.ifAvailable());
}

/**
 * Прокидывает системные отступы Telegram в CSS: шапку прижимаем ниже
 * статус-бара, нижнее меню — выше домашней полоски.
 */
function applySafeArea() {
  safely(() => {
    const root = document.documentElement;
    const top = viewport.safeAreaInsetTop() + viewport.contentSafeAreaInsetTop();
    const bottom = viewport.safeAreaInsetBottom() + viewport.contentSafeAreaInsetBottom();
    root.style.setProperty('--tg-safe-top', `${top}px`);
    root.style.setProperty('--tg-safe-bottom', `${bottom}px`);
  });
}

export function isTelegramEnvironment() {
  return isInsideTelegram;
}

export function getTelegramIdentity(): TelegramIdentity | null {
  try {
    const user = retrieveLaunchParams().tgWebAppData?.user;
    if (!user) return env.mockTelegram ? DEV_IDENTITY : null;

    return {
      telegramId: user.id,
      username: user.username,
      firstName: user.first_name,
      lastName: user.last_name,
      photoUrl: user.photo_url,
      isPremium: user.is_premium,
    };
  }
  catch {
    return env.mockTelegram ? DEV_IDENTITY : null;
  }
}

/** Сырая строка initData — её бэкенд проверяет подписью бота. */
export function getRawInitData(): string | null {
  try {
    return retrieveRawInitData() ?? null;
  }
  catch {
    return null;
  }
}

/**
 * Показывает системную кнопку «Назад» и возвращает функцию отписки.
 * Вне Telegram возвращает no-op, поэтому вызывающий код не ветвится.
 */
export function showTelegramBackButton(onClick: () => void): () => void {
  if (!isInsideTelegram) return () => {};

  let off: () => void = () => {};
  safely(() => {
    backButton.show.ifAvailable();
    const result = backButton.onClick.ifAvailable(onClick);
    if (result.ok && typeof result.data === 'function') {
      off = result.data;
    }
  });

  return () => {
    off();
    safely(() => backButton.hide.ifAvailable());
  };
}

export const haptics = {
  tap() {
    safely(() => hapticFeedback.impactOccurred.ifAvailable('light'));
  },
  select() {
    safely(() => hapticFeedback.selectionChanged.ifAvailable());
  },
  success() {
    safely(() => hapticFeedback.notificationOccurred.ifAvailable('success'));
  },
  error() {
    safely(() => hapticFeedback.notificationOccurred.ifAvailable('error'));
  },
};
