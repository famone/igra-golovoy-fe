import { buildFullDeck, findCard, FIELD_SLOT_ORDER } from '@/constants/deck';
import { MOCK_ROOMS } from '@/stores/arena/mocks';
import type { CardInstance, FieldCardType } from '@/types/cards';
import type {
  FieldSlot,
  GameLogEntry,
  GamePlayer,
  GameResultRow,
  GameState,
  Room,
} from '@/types/game';
import type { ClientEvent, ServerEvent } from '@/types/realtime';

const HAND_SIZE = 7;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

function cardTypeOf(cardId: string): FieldCardType | 'action' {
  const card = findCard(cardId);
  if (!card || card.type === 'action') return 'action';
  return card.type;
}

/**
 * Локальный движок партии на время, пока нет игрового сервера.
 *
 * Он намеренно реализует только костяк правил (раздача, поле, ход по кругу,
 * штраф за отсутствие ответа). Валидация «подходит ли футболист под комбинацию»
 * невозможна на клиенте — здесь любой непустой и ещё не названный ответ
 * считается верным. Полный набор правил уезжает на бэкенд, см. TODO.md.
 */
export class MockGameEngine {
  private state: GameState;
  private deck: string[];
  private instanceCounter = 0;
  /** Руки соперников движок держит у себя: клиенту уходит только их размер. */
  private hands = new Map<string, CardInstance[]>();
  private room: Room;

  constructor(roomId: string, private readonly viewerId: string) {
    this.room = MOCK_ROOMS.find((item) => item.id === roomId) ?? MOCK_ROOMS[0]!;
    this.deck = shuffle(buildFullDeck());
    this.state = this.deal();
  }

  handle(event: ClientEvent): ServerEvent[] {
    switch (event.type) {
      case 'room:join':
        return [{ type: 'room:updated', payload: this.room }, this.stateEvent()];

      case 'room:start':
        this.state.status = 'playing';
        this.state.turn.phase = 'answering';
        this.state.turn.deadlineAt = this.nextDeadline();
        return [this.stateEvent()];

      case 'turn:answer':
        return this.answer(event.payload.answer);

      case 'turn:skip':
        return this.skip();

      case 'turn:discard':
        return this.discard(event.payload.instanceId);

      case 'turn:action':
        return this.playAction(event.payload.actionId);

      case 'turn:declare-last-card':
        this.playerById(this.viewerId).declaredLastCard = true;
        return [this.stateEvent()];

      case 'ping':
        return [{ type: 'pong', payload: {} }];

      default:
        return [];
    }
  }

  private deal(): GameState {
    const players = this.room.players.slice(0, this.room.settings.maxPlayers);
    const order = players.map((player) => player.user.id);

    // Гость смотрит партию своими глазами: подменяем первого игрока на него.
    if (!order.includes(this.viewerId) && order.length) {
      order[0] = this.viewerId;
    }

    for (const playerId of order) {
      this.hands.set(playerId, this.draw(HAND_SIZE));
    }

    const gamePlayers: GamePlayer[] = players.map((player, index) => ({
      user: index === 0 ? { ...player.user, id: this.viewerId } : player.user,
      handCount: HAND_SIZE,
      score: 0,
      isConnected: player.isConnected,
      declaredLastCard: false,
    }));

    return {
      roomId: this.room.id,
      status: 'playing',
      settings: this.room.settings,
      round: 1,
      order,
      players: gamePlayers,
      field: this.buildField(),
      turn: {
        phase: 'answering',
        activePlayerId: order[0] ?? this.viewerId,
        deadlineAt: this.nextDeadline(),
        totalSeconds: this.room.settings.turnSeconds,
        playedAction: null,
        answer: null,
        transferredFrom: null,
      },
      hand: this.hands.get(this.viewerId) ?? [],
      deckCount: this.deck.length,
      namedPlayers: [],
      log: [this.logEntry(this.viewerId, 'round', 'Раунд 1 начался — поле вскрыто')],
    };
  }

  /** Поле собирается из карт нужного типа: по одной на каждый слот. */
  private buildField(): FieldSlot[] {
    return FIELD_SLOT_ORDER.map((type) => ({
      type,
      card: this.drawOfType(type),
      isBlocked: false,
    }));
  }

  private draw(count: number): CardInstance[] {
    const drawn: CardInstance[] = [];
    for (let i = 0; i < count; i += 1) {
      const cardId = this.deck.pop();
      if (!cardId) break;
      drawn.push(this.instanceOf(cardId));
    }
    return drawn;
  }

  private drawOfType(type: FieldCardType): CardInstance {
    const index = this.deck.findIndex((cardId) => cardTypeOf(cardId) === type);
    const cardId = index >= 0 ? this.deck.splice(index, 1)[0]! : `${type}-fallback`;
    return this.instanceOf(cardId);
  }

  private instanceOf(cardId: string): CardInstance {
    this.instanceCounter += 1;
    return { instanceId: `${cardId}#${this.instanceCounter}`, cardId };
  }

  private answer(answer: string): ServerEvent[] {
    const trimmed = answer.trim();
    const isRepeat = this.state.namedPlayers.some(
      (named) => named.toLowerCase() === trimmed.toLowerCase(),
    );

    if (!trimmed || isRepeat) {
      return [
        {
          type: 'error',
          payload: {
            code: isRepeat ? 'answer_repeated' : 'answer_empty',
            message: isRepeat ? 'Этого футболиста уже называли' : 'Введите имя футболиста',
          },
        },
      ];
    }

    this.state.namedPlayers = [...this.state.namedPlayers, trimmed];
    this.state.turn.answer = trimmed;
    // Ответ принят — теперь игрок должен скинуть карту с руки на поле.
    this.state.turn.phase = 'discarding';

    const log = this.logEntry(this.state.turn.activePlayerId, 'answer', `Ответ принят: ${trimmed}`);
    this.state.log = [...this.state.log, log];

    return [this.stateEvent(), { type: 'game:log', payload: log }];
  }

  private skip(): ServerEvent[] {
    // Нет ответа за отведённое время — штраф две карты, но карту всё равно кладём.
    const penalty = this.state.settings.difficulty === 'simple' ? 3 : 2;
    const drawn = this.draw(penalty);
    const hand = this.hands.get(this.state.turn.activePlayerId) ?? [];
    this.hands.set(this.state.turn.activePlayerId, [...hand, ...drawn]);

    this.state.turn.phase = 'discarding';
    this.state.turn.answer = null;
    this.syncViewer();

    const log = this.logEntry(
      this.state.turn.activePlayerId,
      'penalty',
      `Нет ответа — штраф ${penalty} карты`,
    );
    this.state.log = [...this.state.log, log];

    return [this.stateEvent(), { type: 'game:log', payload: log }];
  }

  private discard(instanceId: string): ServerEvent[] {
    const playerId = this.state.turn.activePlayerId;
    const hand = this.hands.get(playerId) ?? [];
    const card = hand.find((item) => item.instanceId === instanceId);
    if (!card) {
      return [{ type: 'error', payload: { code: 'card_not_found', message: 'Карты нет на руке' } }];
    }

    const type = cardTypeOf(card.cardId);
    if (type === 'action') {
      return [{
        type: 'error',
        payload: { code: 'card_type_mismatch', message: 'Карту действия нельзя положить в слот поля' },
      }];
    }

    this.hands.set(playerId, hand.filter((item) => item.instanceId !== instanceId));
    this.state.field = this.state.field.map((slot) =>
      slot.type === type ? { ...slot, card, isBlocked: false } : slot,
    );

    this.syncViewer();

    if ((this.hands.get(playerId) ?? []).length === 0) {
      return this.finish(playerId);
    }

    this.passTurn();
    return [this.stateEvent()];
  }

  private playAction(actionId: string): ServerEvent[] {
    if (this.state.turn.playedAction) {
      return [{
        type: 'error',
        payload: { code: 'action_already_played', message: 'За ход можно сыграть только одну карту действия' },
      }];
    }

    this.state.turn.playedAction = actionId as GameState['turn']['playedAction'];

    if (actionId === 'fergie-time') {
      const deadline = this.state.turn.deadlineAt
        ? new Date(this.state.turn.deadlineAt).getTime()
        : Date.now();
      this.state.turn.deadlineAt = new Date(deadline + 30_000).toISOString();
      this.state.turn.totalSeconds += 30;
    }

    if (actionId === 'transfer') {
      this.state.turn.transferredFrom = this.state.turn.activePlayerId;
      this.passTurn({ keepField: true });
    }

    const card = findCard(`action-${actionId}`);
    const log = this.logEntry(
      this.state.turn.activePlayerId,
      'action',
      `Сыграна карта «${card?.title ?? actionId}»`,
    );
    this.state.log = [...this.state.log, log];

    return [this.stateEvent(), { type: 'game:log', payload: log }];
  }

  private passTurn(options: { keepField?: boolean } = {}) {
    const { order } = this.state;
    const currentIndex = order.indexOf(this.state.turn.activePlayerId);
    const nextId = order[(currentIndex + 1) % order.length] ?? order[0]!;

    this.state.turn = {
      phase: 'answering',
      activePlayerId: nextId,
      deadlineAt: this.nextDeadline(),
      totalSeconds: this.state.settings.turnSeconds,
      playedAction: null,
      answer: null,
      transferredFrom: options.keepField ? this.state.turn.transferredFrom : null,
    };
  }

  private finish(winnerId: string): ServerEvent[] {
    this.state.status = 'finished';
    this.state.turn.phase = 'finished';
    this.state.turn.deadlineAt = null;

    const results: GameResultRow[] = [...this.state.players]
      .sort((a, b) => (a.user.id === winnerId ? -1 : b.user.id === winnerId ? 1 : a.handCount - b.handCount))
      .map((player, index) => ({
        place: index + 1,
        user: player.user,
        score: HAND_SIZE - player.handCount,
        ratingDelta: index === 0 ? 25 : -8,
      }));

    return [this.stateEvent(), { type: 'game:finished', payload: { results } }];
  }

  /** Приводит публичные счётчики и руку зрителя в соответствие с внутренним состоянием. */
  private syncViewer() {
    this.state.players = this.state.players.map((player) => ({
      ...player,
      handCount: (this.hands.get(player.user.id) ?? []).length,
    }));
    this.state.hand = this.hands.get(this.viewerId) ?? [];
    this.state.deckCount = this.deck.length;
  }

  private playerById(id: string): GamePlayer {
    return this.state.players.find((player) => player.user.id === id) ?? this.state.players[0]!;
  }

  private nextDeadline(): string {
    return new Date(Date.now() + this.room.settings.turnSeconds * 1000).toISOString();
  }

  private logEntry(playerId: string, kind: GameLogEntry['kind'], text: string): GameLogEntry {
    return {
      id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      at: new Date().toISOString(),
      playerId,
      kind,
      text,
    };
  }

  private stateEvent(): ServerEvent {
    this.syncViewer();
    return { type: 'game:state', payload: structuredClone(this.state) };
  }
}
