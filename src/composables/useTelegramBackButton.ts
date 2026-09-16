import { onBeforeUnmount, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { showTelegramBackButton } from '@/lib/telegram';

/**
 * Привязывает системную кнопку «Назад» Telegram к экрану.
 * Вне Telegram ничего не делает — страницы используют этот composable
 * безусловно и не проверяют окружение сами.
 */
export function useTelegramBackButton(onBack?: () => void) {
  const router = useRouter();
  let dispose: (() => void) | null = null;

  onMounted(() => {
    dispose = showTelegramBackButton(() => {
      if (onBack) onBack();
      else router.back();
    });
  });

  onBeforeUnmount(() => {
    dispose?.();
    dispose = null;
  });
}
