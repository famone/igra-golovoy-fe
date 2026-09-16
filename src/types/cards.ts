/**
 * Модель колоды «Игра головой» — 90 карт.
 * Состав описан в правилах: https://igragolovoy.ru/rules
 */

/** Тип карты определяет её цвет и слот на игровом поле. */
export type CardType = 'geography' | 'position' | 'fact' | 'action';

/** Только эти три типа занимают слоты на поле, действия играются поверх. */
export type FieldCardType = Extract<CardType, 'geography' | 'position' | 'fact'>;

export type GeographyScope = 'country' | 'continent';

export type PositionId = 'goalkeeper' | 'defender' | 'midfielder' | 'forward';

export type ActionId = 'block' | 'fergie-time' | 'transfer' | 'yellow-card' | 'red-card';

export interface BaseCard {
  /** Стабильный идентификатор вида карты (не экземпляра): `geo-spain`, `fact-ballon-dor`. */
  id: string;
  type: CardType;
  title: string;
  /** Короткая подпись на самой карте, если она отличается от полного названия. */
  shortTitle?: string;
  /** Пояснение из правил — показываем в подсказке. */
  description?: string;
  /** Сколько таких карт в физической колоде. */
  copies: number;
}

export interface GeographyCard extends BaseCard {
  type: 'geography';
  scope: GeographyScope;
  /** ISO-код для флага, у континентов отсутствует. */
  code?: string;
}

export interface PositionCard extends BaseCard {
  type: 'position';
  positionId: PositionId;
  /** Амплуа, которые закрывает карта: ЦЗ, ЛЗ, ПЗ… */
  roles: string[];
}

export interface FactCard extends BaseCard {
  type: 'fact';
}

export interface ActionCard extends BaseCard {
  type: 'action';
  actionId: ActionId;
  /** Помогает ходящему ответить или бьёт по сопернику. */
  effect: 'self' | 'opponent';
  /** Красную и жёлтую можно играть только после верного ответа. */
  requiresCorrectAnswer: boolean;
}

export type Card = GeographyCard | PositionCard | FactCard | ActionCard;

/** Экземпляр карты в конкретной партии: у одного вида карты бывает несколько копий. */
export interface CardInstance {
  /** Уникален в пределах партии. */
  instanceId: string;
  cardId: string;
}
