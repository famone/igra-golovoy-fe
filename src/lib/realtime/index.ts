import { env } from '@/lib/env';
import { getToken } from '@/lib/http';
import { MockTransport, type MockTransportOptions } from '@/lib/realtime/mock';
import { SocketTransport } from '@/lib/realtime/socket';
import type { RealtimeTransport } from '@/types/realtime';

export { MockTransport } from '@/lib/realtime/mock';
export { SocketTransport } from '@/lib/realtime/socket';

export interface CreateTransportOptions {
  /** Локальная логика для режима моков. */
  mock: MockTransportOptions;
}

/**
 * Единственное место, где решается, какой транспорт использует приложение.
 * Когда игровой сервер будет готов — достаточно снять `VITE_USE_MOCKS`.
 */
export function createTransport(options: CreateTransportOptions): RealtimeTransport {
  if (env.useMocks || !env.wsUrl) {
    return new MockTransport(options.mock);
  }

  return new SocketTransport({
    url: env.wsUrl,
    getToken,
  });
}
