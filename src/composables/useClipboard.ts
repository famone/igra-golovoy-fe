import { ref } from 'vue';
import { toast } from 'vue3-toastify';
import { haptics } from '@/lib/telegram';

/** Копирование кода комнаты и реферальной ссылки. */
export function useClipboard(successMessage = 'Скопировано') {
  const copied = ref(false);
  let resetTimer: number | null = null;

  async function copy(value: string) {
    try {
      await navigator.clipboard.writeText(value);
      copied.value = true;
      haptics.success();
      toast.success(successMessage);

      if (resetTimer !== null) window.clearTimeout(resetTimer);
      resetTimer = window.setTimeout(() => {
        copied.value = false;
      }, 2000);

      return true;
    }
    catch {
      haptics.error();
      toast.error('Не удалось скопировать');
      return false;
    }
  }

  return { copied, copy };
}
