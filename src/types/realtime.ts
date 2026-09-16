import type { ActionId } from '@/types/cards';
import type { GameLogEntry, GameResultRow, GameState, Room } from '@/types/game';

export type ConnectionStatus = 'idle' | 'connecting' | 'open' | 'reconnecting' | 'closed';

/** Что клиент отправляет на сервер. */
export type ClientEvent =
  | { type: 'room:join'; payload: { roomId: string } }
  | { type: 'room:leave'; payload: { roomId: string } }
  | { type: 'room:ready'; payload: { isReady: boolean } }
  | { type: 'room:start'; payload: Record<string, never> }
  | { type: 'turn:answer'; payload: { answer: string } }
  | { type: 'turn:skip'; payload: Record<string, never> }
  | { type: 'turn:discard'; payload: { instanceId: string } }
  | { type: 'turn:action'; payload: { actionId: ActionId; targetSlot?: number } }
  | { type: 'turn:declare-last-card'; payload: Record<string, never> }
  | { type: 'turn:offside'; payload: { targetPlayerId: string } }
  | { type: 'ping'; payload: Record<string, never> };

/** Что сервер присылает клиенту. */
export type ServerEvent =
  | { type: 'room:updated'; payload: Room }
  | { type: 'game:state'; payload: GameState }
  | { type: 'game:log'; payload: GameLogEntry }
  | { type: 'game:finished'; payload: { results: GameResultRow[] } }
  | { type: 'error'; payload: { code: string; message: string } }
  | { type: 'pong'; payload: Record<string, never> };

export type ServerEventType = ServerEvent['type'];

export type ServerEventPayload<T extends ServerEventType> = Extract<
  ServerEvent,
  { type: T }
>['payload'];

export type ServerEventHandler<T extends ServerEventType> = (
  payload: ServerEventPayload<T>,
) => void;

/**
 * Контракт транспорта. За ним стоит либо настоящий WebSocket,
 * либо локальная имитация — сторы про разницу не знают.
 */
export interface RealtimeTransport {
  readonly status: ConnectionStatus;
  connect(): void;
  disconnect(): void;
  send(event: ClientEvent): void;
  on<T extends ServerEventType>(type: T, handler: ServerEventHandler<T>): () => void;
  onStatusChange(handler: (status: ConnectionStatus) => void): () => void;
}
