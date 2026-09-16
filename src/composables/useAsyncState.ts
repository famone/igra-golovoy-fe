import { onMounted, readonly, ref, shallowRef } from 'vue';

export interface UseAsyncStateOptions {
  /** Запустить загрузку сразу при монтировании. */
  immediate?: boolean;
}

/**
 * Обёртка над разовой асинхронной загрузкой для страниц.
 * Сторы этим не пользуются — у них свои `loading` внутри экшенов;
 * это про локальные подгрузки в компонентах.
 */
export function useAsyncState<T>(
  loader: () => Promise<T>,
  initial: T,
  options: UseAsyncStateOptions = {},
) {
  const data = shallowRef<T>(initial);
  const loading = ref(false);
  const error = ref<unknown>(null);

  async function execute() {
    loading.value = true;
    error.value = null;
    try {
      data.value = await loader();
      return data.value;
    }
    catch (err) {
      error.value = err;
      return initial;
    }
    finally {
      loading.value = false;
    }
  }

  if (options.immediate !== false) {
    onMounted(execute);
  }

  return {
    data,
    loading: readonly(loading),
    error: readonly(error),
    execute,
  };
}
