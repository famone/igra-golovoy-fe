import type { ActionId, CardInstance, FieldCardType } from '@/types/cards';
import type { User } from '@/types/user';

/** Форматы победы из правил: на очки в три раунда или на вылет. */
export type GameFormat = 'points' | 'knockout';

/** В простом варианте карта кладётся до ответа, а штраф на карту больше. */
export type GameDifficulty = 'standard' | 'simple';

export type RoomVisibility = 'public' | 'private';

export type RoomStatus = 'waiting' | 'playing' | 'finished';

export interface RoomSettings {
  format: GameFormat;
  difficulty: GameDifficulty;
  /** Базовое время на ход в секундах, по правилам — 30. */
  turnSeconds: number;
  maxPlayers: number;
  /** Хардкор: игрока нельзя назвать повторно во всех трёх раундах. */
  hardcoreRepeats: boolean;
}

export interface RoomPlayer {
  user: User;
  isHost: boolean;
  isReady: boolean;
  /** Игрок отвалился, но место за ним сохраняется. */
  isConnected: boolean;
}

export interface Room {
  id: string;
  code: string;
  title: string;
  status: RoomStatus;
  visibility: RoomVisibility;
  settings: RoomSettings;
  players: RoomPlayer[];
  createdAt: string;
  /** Заполняется бэкендом, чтобы не считать на клиенте. */
  playersCount: number;
  spectatorsCount: number;
}

export interface CreateRoomPayload {
  title: string;
  visibility: RoomVisibility;
  settings: RoomSettings;
}

/** Живое состояние партии — то, что приходит по WebSocket. */
export interface GamePlayer {
  user: User;
  handCount: number;
  /** Очки в формате «на очки». */
  score: number;
  /** Место в формате «на вылет», пока играет — undefined. */
  place?: number;
  isConnected: boolean;
  /** Игрок объявил «Выхожу один на один!». */
  declaredLastCard: boolean;
}

export interface FieldSlot {
  type: FieldCardType;
  card: CardInstance;
  /** Слот закрыт картой «Блок» на текущий ход. */
  isBlocked: boolean;
}

export type TurnPhase =
  | 'idle'
  | 'revealing'
  | 'answering'
  | 'validating'
  | 'discarding'
  | 'finished';

export interface TurnState {
  phase: TurnPhase;
  activePlayerId: string;
  /** Метка окончания хода, чтобы таймер переживал переподключение. */
  deadlineAt: string | null;
  /** Сколько секунд отведено с учётом «Ферги-тайма». */
  totalSeconds: number;
  /** Карта действия, сыгранная в этом ходу — за ход можно только одну. */
  playedAction: ActionId | null;
  answer: string | null;
  /** Ход передан «Трансфером» от этого игрока. */
  transferredFrom: string | null;
}

export interface GameState {
  roomId: string;
  status: RoomStatus;
  settings: RoomSettings;
  round: number;
  /** Порядок хода по часовой стрелке. */
  order: string[];
  players: GamePlayer[];
  field: FieldSlot[];
  turn: TurnState;
  /** Карты на руке текущего клиента — остальным они не видны. */
  hand: CardInstance[];
  deckCount: number;
  /** Уже названные футболисты: повтор запрещён. */
  namedPlayers: string[];
  log: GameLogEntry[];
}

export interface GameLogEntry {
  id: string;
  at: string;
  playerId: string;
  kind: 'answer' | 'penalty' | 'action' | 'join' | 'leave' | 'round' | 'offside';
  text: string;
}

export interface GameResultRow {
  place: number;
  user: User;
  score: number;
  ratingDelta: number;
}
