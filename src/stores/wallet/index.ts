import { ref } from 'vue';
import { defineStore } from 'pinia';
import type { Transaction, WalletBalance } from '@/types/wallet';

/**
 * Кошелёк ещё в разработке: раздел показывает заглушку.
 * Стор заведён заранее, чтобы экран подключался без переписывания страницы —
 * останется заменить моки на реальные запросы.
 */
export const useWalletStore = defineStore('wallet', () => {
  const balance = ref<WalletBalance>({ coins: 0, locked: 0 });
  const transactions = ref<Transaction[]>([]);
  const loading = ref(false);

  /** Флаг «в разработке» держим в сторе: по нему страница выбирает заглушку. */
  const isAvailable = ref(false);

  async function FETCH_WALLET() {
    if (!isAvailable.value) return null;
    loading.value = true;
    try {
      // TODO: подключить /wallet и /wallet/transactions, когда появится бэкенд.
      return balance.value;
    }
    finally {
      loading.value = false;
    }
  }

  return {
    balance,
    transactions,
    loading,
    isAvailable,
    FETCH_WALLET,
  };
});
