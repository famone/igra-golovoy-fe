import { describe, expect, it } from 'vitest';
import {
  ACTION_CARDS,
  ALL_CARDS,
  buildFullDeck,
  CONTINENT_CARDS,
  COUNTRY_CARDS,
  DECK_SUMMARY,
  FACT_CARDS,
  findCard,
  POSITION_CARDS,
} from '@/constants/deck';

describe('состав колоды', () => {
  it('содержит 90 карт', () => {
    expect(DECK_SUMMARY.total).toBe(90);
    expect(buildFullDeck()).toHaveLength(90);
  });

  it('раскладывается по группам как в правилах', () => {
    expect(DECK_SUMMARY.geography).toBe(35);
    expect(DECK_SUMMARY.position).toBe(16);
    expect(DECK_SUMMARY.fact).toBe(30);
    expect(DECK_SUMMARY.action).toBe(9);
  });

  it('содержит 27 карт стран и 8 карт континентов', () => {
    expect(COUNTRY_CARDS).toHaveLength(9);
    expect(COUNTRY_CARDS.every((card) => card.copies === 3)).toBe(true);
    expect(CONTINENT_CARDS).toHaveLength(4);
    expect(CONTINENT_CARDS.every((card) => card.copies === 2)).toBe(true);
  });

  it('описывает 4 позиции и 16 фактов', () => {
    expect(POSITION_CARDS).toHaveLength(4);
    expect(FACT_CARDS).toHaveLength(16);
    expect(ACTION_CARDS).toHaveLength(5);
  });

  it('не содержит дублирующихся идентификаторов', () => {
    const ids = new Set(ALL_CARDS.map((card) => card.id));
    expect(ids.size).toBe(ALL_CARDS.length);
  });

  it('находит карту по идентификатору', () => {
    expect(findCard('geo-spain')?.title).toBe('Испания');
    expect(findCard('нет-такой')).toBeUndefined();
  });

  it('красную карточку нельзя играть без верного ответа', () => {
    const red = ACTION_CARDS.find((card) => card.actionId === 'red-card');
    expect(red?.requiresCorrectAnswer).toBe(true);
  });
});
