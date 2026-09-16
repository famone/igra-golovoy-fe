import type {
  ActionCard,
  Card,
  CardType,
  FactCard,
  FieldCardType,
  GeographyCard,
  PositionCard,
} from '@/types/cards';

/** Цвет группы карт, как на igragolovoy.ru. */
export const CARD_TYPE_COLOR: Record<CardType, 'sky' | 'pitch' | 'grape' | 'flame'> = {
  geography: 'sky',
  position: 'pitch',
  fact: 'grape',
  action: 'flame',
};

export const CARD_TYPE_LABEL: Record<CardType, string> = {
  geography: 'Страна / Континент',
  position: 'Позиция',
  fact: 'Факт',
  action: 'Действие',
};

/** Порядок слотов на игровом поле. */
export const FIELD_SLOT_ORDER: FieldCardType[] = ['position', 'geography', 'fact'];

export const COUNTRY_CARDS: GeographyCard[] = [
  { id: 'geo-france', type: 'geography', scope: 'country', code: 'fr', title: 'Франция', copies: 3 },
  { id: 'geo-portugal', type: 'geography', scope: 'country', code: 'pt', title: 'Португалия', copies: 3 },
  { id: 'geo-argentina', type: 'geography', scope: 'country', code: 'ar', title: 'Аргентина', copies: 3 },
  { id: 'geo-england', type: 'geography', scope: 'country', code: 'gb-eng', title: 'Англия', copies: 3 },
  { id: 'geo-italy', type: 'geography', scope: 'country', code: 'it', title: 'Италия', copies: 3 },
  { id: 'geo-spain', type: 'geography', scope: 'country', code: 'es', title: 'Испания', copies: 3 },
  { id: 'geo-brazil', type: 'geography', scope: 'country', code: 'br', title: 'Бразилия', copies: 3 },
  { id: 'geo-netherlands', type: 'geography', scope: 'country', code: 'nl', title: 'Нидерланды', copies: 3 },
  { id: 'geo-germany', type: 'geography', scope: 'country', code: 'de', title: 'Германия', copies: 3 },
];

export const CONTINENT_CARDS: GeographyCard[] = [
  {
    id: 'geo-south-america',
    type: 'geography',
    scope: 'continent',
    title: 'Южная Америка',
    description: 'Подходит игроку из любой страны континента.',
    copies: 2,
  },
  {
    id: 'geo-north-america',
    type: 'geography',
    scope: 'continent',
    title: 'Северная Америка',
    description: 'Подходит игроку из любой страны континента.',
    copies: 2,
  },
  {
    id: 'geo-africa',
    type: 'geography',
    scope: 'continent',
    title: 'Африка',
    description: 'Подходит игроку из любой страны континента.',
    copies: 2,
  },
  {
    id: 'geo-eurasia',
    type: 'geography',
    scope: 'continent',
    title: 'Евразия',
    description: 'Европа и Азия вместе.',
    copies: 2,
  },
];

export const POSITION_CARDS: PositionCard[] = [
  {
    id: 'pos-goalkeeper',
    type: 'position',
    positionId: 'goalkeeper',
    title: 'Вратарь',
    shortTitle: 'ВРА',
    roles: ['ВР'],
    copies: 4,
  },
  {
    id: 'pos-defender',
    type: 'position',
    positionId: 'defender',
    title: 'Защитник',
    shortTitle: 'ЗАЩ',
    roles: ['ЦЗ', 'ЛЗ', 'ПЗ', 'ЛФЗ', 'ПФЗ'],
    copies: 4,
  },
  {
    id: 'pos-midfielder',
    type: 'position',
    positionId: 'midfielder',
    title: 'Полузащитник',
    shortTitle: 'ПЗЩ',
    roles: ['ЦП', 'ЦОП', 'ЦАП', 'ПП', 'ЛП'],
    copies: 4,
  },
  {
    id: 'pos-forward',
    type: 'position',
    positionId: 'forward',
    title: 'Нападающий',
    shortTitle: 'НАП',
    roles: ['ФРВ', 'ЛФА', 'ПФА', 'ЦФД'],
    copies: 4,
  },
];

/*
  16 видов фактов на 30 карт. Точные тиражи каждого факта в печатной колоде
  ещё нужно сверить с продакшеном — см. TODO.md.
*/
export const FACT_CARDS: FactCard[] = [
  { id: 'fact-played-italy', type: 'fact', title: 'Играл в Италии', description: 'Выступал за клуб из Италии в любой период карьеры.', copies: 2 },
  { id: 'fact-played-england', type: 'fact', title: 'Играл в Англии', description: 'Выступал за клуб из Англии в любой период карьеры.', copies: 2 },
  { id: 'fact-played-spain', type: 'fact', title: 'Играл в Испании', description: 'Выступал за клуб из Испании в любой период карьеры.', copies: 2 },
  { id: 'fact-played-germany', type: 'fact', title: 'Играл в Германии', description: 'Выступал за клуб из Германии в любой период карьеры.', copies: 2 },
  { id: 'fact-played-france', type: 'fact', title: 'Играл во Франции', description: 'Выступал за клуб из Франции в любой период карьеры.', copies: 2 },
  { id: 'fact-retired', type: 'fact', title: 'Закончил карьеру', description: 'Завершил профессиональные выступления.', copies: 2 },
  { id: 'fact-national-trophy', type: 'fact', title: 'Выиграл трофей со сборной', description: 'ЧМ, ЧЕ, Кубок Америки, Лига наций и т.п.', copies: 2 },
  { id: 'fact-league-champion', type: 'fact', title: 'Выиграл чемпионат страны', description: 'Становился чемпионом любой национальной лиги.', copies: 2 },
  { id: 'fact-euro-cup', type: 'fact', title: 'Выиграл еврокубок', description: 'Лига чемпионов, Лига Европы, Суперкубок УЕФА и т.п.', copies: 2 },
  { id: 'fact-ballon-dor', type: 'fact', title: 'Обладатель Золотого мяча', copies: 2 },
  { id: 'fact-scored-final', type: 'fact', title: 'Забил в финале', description: 'В финале любого турнира на взрослом уровне.', copies: 2 },
  { id: 'fact-captain', type: 'fact', title: 'Капитан', description: 'Является или являлся капитаном клуба или сборной.', copies: 2 },
  { id: 'fact-over-30', type: 'fact', title: 'Старше 30 лет', description: 'На текущий момент игроку 30 и больше.', copies: 2 },
  { id: 'fact-under-25', type: 'fact', title: 'Младше 25 лет', description: 'На текущий момент игроку 25 и меньше.', copies: 2 },
  { id: 'fact-three-leagues', type: 'fact', title: 'Играл в трёх лигах и более', description: 'Выступал в чемпионатах минимум трёх разных стран.', copies: 1 },
  { id: 'fact-five-clubs', type: 'fact', title: 'Играл в пяти клубах и более', description: 'За карьеру сменил пять и более клубов.', copies: 1 },
];

export const ACTION_CARDS: ActionCard[] = [
  {
    id: 'action-block',
    type: 'action',
    actionId: 'block',
    title: 'Блок',
    effect: 'self',
    requiresCorrectAnswer: false,
    description: 'Закрой одну из трёх карт поля и отвечай только по двум оставшимся.',
    copies: 2,
  },
  {
    id: 'action-fergie-time',
    type: 'action',
    actionId: 'fergie-time',
    title: 'Ферги-тайм',
    effect: 'self',
    requiresCorrectAnswer: false,
    description: '+30 секунд ко времени ответа. Играется до того, как вышло основное время.',
    copies: 2,
  },
  {
    id: 'action-transfer',
    type: 'action',
    actionId: 'transfer',
    title: 'Трансфер',
    effect: 'self',
    requiresCorrectAnswer: false,
    description: 'Передай ту же комбинацию следующему игроку и избеги штрафа.',
    copies: 2,
  },
  {
    id: 'action-yellow-card',
    type: 'action',
    actionId: 'yellow-card',
    title: 'Жёлтая карточка',
    effect: 'opponent',
    requiresCorrectAnswer: true,
    description: 'Следующий игрок берёт 1 карту и пропускает ход.',
    copies: 2,
  },
  {
    id: 'action-red-card',
    type: 'action',
    actionId: 'red-card',
    title: 'Красная карточка',
    effect: 'opponent',
    requiresCorrectAnswer: true,
    description: 'Следующий игрок берёт 3 карты и пропускает ход.',
    copies: 1,
  },
];

export const GEOGRAPHY_CARDS: GeographyCard[] = [...COUNTRY_CARDS, ...CONTINENT_CARDS];

export const ALL_CARDS: Card[] = [
  ...GEOGRAPHY_CARDS,
  ...POSITION_CARDS,
  ...FACT_CARDS,
  ...ACTION_CARDS,
];

const CARDS_BY_ID = new Map<string, Card>(ALL_CARDS.map((card) => [card.id, card]));

export function findCard(cardId: string): Card | undefined {
  return CARDS_BY_ID.get(cardId);
}

export function countCards(cards: readonly Card[]): number {
  return cards.reduce((total, card) => total + card.copies, 0);
}

/** Разворачивает виды карт в полную колоду из 90 экземпляров. */
export function buildFullDeck(): string[] {
  return ALL_CARDS.flatMap((card) => Array.from({ length: card.copies }, () => card.id));
}

export const DECK_SUMMARY = {
  geography: countCards(GEOGRAPHY_CARDS),
  position: countCards(POSITION_CARDS),
  fact: countCards(FACT_CARDS),
  action: countCards(ACTION_CARDS),
  total: countCards(ALL_CARDS),
} as const;
