import type {
  ClientEvent,
  ConnectionStatus,
  RealtimeTransport,
  ServerEvent,
  ServerEventHandler,
  ServerEventType,
} from '@/types/realtime';

type AnyHandler = (payload: never) => void;

export interface MockTransportOptions {
  /**
   * Локальная «серверная» логика: получает событие клиента и
   * возвращает события, которые надо отдать обратно.
   */
  reduce: (event: ClientEvent) => ServerEvent[];
  /** Искусственная задержка, чтобы интерфейс вёл себя как с реальной сетью. */
  latencyMs?: number;
}

/**
 * Заглушка транспорта на время, пока нет игрового сервера.
 * Реализует тот же интерфейс, что и `SocketTransport`, поэтому
 * переключение на настоящий WebSocket — это одна строка в `createTransport`.
 */
export class MockTransport implements RealtimeTransport {
  private handlers = new Map<ServerEventType, Set<AnyHandler>>();
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();
  private currentStatus: ConnectionStatus = 'idle';

  constructor(private readonly options: MockTransportOptions) {}

  get status(): ConnectionStatus {
    return this.currentStatus;
  }

  connect() {
    this.setStatus('connecting');
    window.setTimeout(() => this.setStatus('open'), this.options.latencyMs ?? 120);
  }

  disconnect() {
    this.setStatus('closed');
  }

  send(event: ClientEvent) {
    const responses = this.options.reduce(event);
    window.setTimeout(() => {
      for (const response of responses) {
        this.emit(response);
      }
    }, this.options.latencyMs ?? 120);
  }

  on<T extends ServerEventType>(type: T, handler: ServerEventHandler<T>) {
    const set = this.handlers.get(type) ?? new Set<AnyHandler>();
    set.add(handler as AnyHandler);
    this.handlers.set(type, set);

    return () => {
      set.delete(handler as AnyHandler);
    };
  }

  onStatusChange(handler: (status: ConnectionStatus) => void) {
    this.statusHandlers.add(handler);
    return () => {
      this.statusHandlers.delete(handler);
    };
  }

  /** Позволяет мокам инициировать события «со стороны сервера». */
  emit(event: ServerEvent) {
    const set = this.handlers.get(event.type);
    if (!set) return;
    for (const handler of set) {
      (handler as (payload: unknown) => void)(event.payload);
    }
  }

  private setStatus(status: ConnectionStatus) {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    for (const handler of this.statusHandlers) {
      handler(status);
    }
  }
}
