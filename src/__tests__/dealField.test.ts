import { describe, expect, it } from 'vitest';
import { FACT_CARDS, GEOGRAPHY_CARDS, POSITION_CARDS, findCard } from '@/constants/deck';
import { dealRandomField } from '@/lib/yandexJudge';

describe('dealRandomField', () => {
  it('берёт по одной карте из справочника позиции, географии и факта', () => {
    const field = dealRandomField();
    const ids = field.map((slot) => slot.card.cardId);

    expect(field.map((slot) => slot.type)).toEqual(['position', 'geography', 'fact']);
    expect(POSITION_CARDS.some((card) => card.id === ids[0])).toBe(true);
    expect(GEOGRAPHY_CARDS.some((card) => card.id === ids[1])).toBe(true);
    expect(FACT_CARDS.some((card) => card.id === ids[2])).toBe(true);
    expect(ids.every((id) => findCard(id))).toBe(true);
  });

  it('не повторяет ту же тройку на следующей раздаче', () => {
    const first = dealRandomField();
    const seen = new Set<string>();
    seen.add(first.map((slot) => slot.card.cardId).join('|'));

    for (let i = 0; i < 12; i += 1) {
      const next = dealRandomField(first);
      const key = next.map((slot) => slot.card.cardId).join('|');
      expect(key).not.toBe([...seen][0]);
    }
  });
});
