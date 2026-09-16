import type {
  ClientEvent,
  ConnectionStatus,
  RealtimeTransport,
  ServerEvent,
  ServerEventHandler,
  ServerEventType,
} from '@/types/realtime';

export interface SocketTransportOptions {
  url: string;
  /** Токен уходит query-параметром: заголовки в браузерном WebSocket недоступны. */
  getToken?: () => string | null;
  /** Интервал heartbeat, мс. Telegram-вебвью рвёт молчащие соединения. */
  heartbeatMs?: number;
  maxReconnectDelayMs?: number;
}

type AnyHandler = (payload: never) => void;

/**
 * WebSocket поверх нашего протокола `{ type, payload }`
 * с переподключением по экспоненциальной задержке и очередью исходящих
 * сообщений на время, пока соединение поднимается.
 */
export class SocketTransport implements RealtimeTransport {
  private socket: WebSocket | null = null;
  private handlers = new Map<ServerEventType, Set<AnyHandler>>();
  private statusHandlers = new Set<(status: ConnectionStatus) => void>();
  private queue: ClientEvent[] = [];
  private reconnectAttempt = 0;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private isClosedByUser = false;
  private currentStatus: ConnectionStatus = 'idle';

  constructor(private readonly options: SocketTransportOptions) {}

  get status(): ConnectionStatus {
    return this.currentStatus;
  }

  connect() {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.isClosedByUser = false;
    this.setStatus(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');

    const token = this.options.getToken?.();
    const url = token
      ? `${this.options.url}?token=${encodeURIComponent(token)}`
      : this.options.url;

    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.setStatus('open');
      this.startHeartbeat();
      this.flushQueue();
    };

    socket.onmessage = (event) => {
      this.handleMessage(event.data);
    };

    socket.onerror = () => {
      socket.close();
    };

    socket.onclose = () => {
      this.stopHeartbeat();
      this.socket = null;
      if (this.isClosedByUser) {
        this.setStatus('closed');
        return;
      }
      this.scheduleReconnect();
    };
  }

  disconnect() {
    this.isClosedByUser = true;
    this.clearReconnect();
    this.stopHeartbeat();
    this.queue = [];
    this.socket?.close();
    this.socket = null;
    this.setStatus('closed');
  }

  send(event: ClientEvent) {
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(event));
      return;
    }
    // Соединение ещё поднимается — отправим сразу после `open`.
    this.queue.push(event);
    this.connect();
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

  private handleMessage(raw: unknown) {
    if (typeof raw !== 'string') return;

    let event: ServerEvent;
    try {
      event = JSON.parse(raw) as ServerEvent;
    }
    catch {
      return;
    }

    if (!event?.type) return;

    const set = this.handlers.get(event.type);
    if (!set) return;

    for (const handler of set) {
      (handler as (payload: unknown) => void)(event.payload);
    }
  }

  private flushQueue() {
    const pending = this.queue;
    this.queue = [];
    for (const event of pending) {
      this.send(event);
    }
  }

  private setStatus(status: ConnectionStatus) {
    if (this.currentStatus === status) return;
    this.currentStatus = status;
    for (const handler of this.statusHandlers) {
      handler(status);
    }
  }

  private scheduleReconnect() {
    this.setStatus('reconnecting');
    const maxDelay = this.options.maxReconnectDelayMs ?? 15_000;
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, maxDelay);
    this.reconnectAttempt += 1;

    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.connect();
    }, delay);
  }

  private clearReconnect() {
    if (this.reconnectTimer !== null) {
      window.clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempt = 0;
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    const interval = this.options.heartbeatMs ?? 25_000;
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', payload: {} });
    }, interval);
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer !== null) {
      window.clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
}
