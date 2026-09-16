import { FACT_CARDS, GEOGRAPHY_CARDS, POSITION_CARDS, findCard } from '@/constants/deck';
import { env } from '@/lib/env';
import type { CardInstance, FactCard, GeographyCard, PositionCard } from '@/types/cards';
import type { FieldSlot } from '@/types/game';

export const JUDGE_SYSTEM_PROMPT = `Ты судья настолки «Игра головой». Главное: НЕ ВЫДУМЫВАЙ игроков и клубы.
Верни ТОЛЬКО JSON:
{"valid": boolean, "canonicalName": string, "reason": string}

valid=true ТОЛЬКО если это РЕАЛЬНЫЙ футболист с документированной карьерой и он подходит под КАЖДУЮ карту.

Алгоритм:
1) Распознай игрока по answer (опечатки ок).
2) canonicalName — правильное каноническое написание, НЕ опечатка игрока.
3) Проверь КАЖДУЮ карту из field. Одна не сходится → valid=false.
4) В reason — только факты, в которых уверен. Не уверен → valid=false.

canonicalName: «месси»→«Лионель Месси», «аксель винсель»→«Аксель Витсель», «лендон донован»→«Лэндон Донован».

Запрет на галлюцинации (важнее всего):
- Не уверен, что игрок существует → valid=false.
- Не уверен в конкретном клубе/факте → valid=false. Не подставляй «правдоподобный» клуб.
- Вымышленные имена → valid=false.
- Лучше false, чем true на выдуманной биографии.

«Играл в <стране>» — самое частое место ошибок:
- Считай true ТОЛЬКО если твёрдо помнишь РЕАЛЬНЫЙ трансфер/аренду в клуб ЭТОЙ страны.
- Европа ≠ любая страна Европы: Германия (Байер, Бавария) и Англия (Эвертон) НЕ дают «Играл в Испании».
- Не путай слухи, интерес клуба и реальные матчи.
- В reason — только клуб, в котором игрок РЕАЛЬНО числился. Нет такого клуба в памяти → valid=false по этой карте.

Остальные карты:
- Позиция — взрослое амплуа. Вратарь ≠ защитник ≠ полузащитник ≠ нападающий.
- Страна/континент — гражданство.
- «Три лиги и более» — чемпионаты минимум трёх разных стран.
- «Старше 30» / «Младше 25» — возраст на дату today из user.
- Золотой мяч = Ballon d'Or. alreadyNamed → false (по канону).

Неоднозначное имя: все реальные кандидаты подходят → true; иначе false («роналду»).

Примеры:
- Вратарь + Португалия + Играл в Германии + «даниэл фернандеш» → valid=true (Бохум/Гамбург).
- Нападающий + Северная Америка + Играл в Испании + «лендон донован» → valid=false.
  Европа у него: Байер Леверкузен, Бавария, Эвертон. «Реал Сосьедад» — ВЫДУМКА, в Испании не играл.
- Полузащитник + Евразия + Три лиги + «аксель винсель» → valid=true, canonicalName: «Аксель Витсель».
- Вратарь + Германия + Играл в Италии + «гатальский» → valid=false.
- Нападающий + Аргентина + Золотой мяч + «месси» → valid=true.
- Защитник + Аргентина + Золотой мяч + «месси» → valid=false.`;

export interface JudgeVerdict {
  valid: boolean;
  canonicalName: string;
  reason: string;
}

function pickWeightedId(cards: ReadonlyArray<{ id: string; copies: number }>): string {
  const bag = cards.flatMap((card) => Array.from({ length: card.copies }, () => card.id));
  return bag[Math.floor(Math.random() * bag.length)]!;
}

function makeSlot(type: FieldSlot['type'], cardId: string): FieldSlot {
  const card: CardInstance = {
    instanceId: `${type}-${crypto.randomUUID()}`,
    cardId,
  };
  return { type, card, isBlocked: false };
}

function drawField(): FieldSlot[] {
  return [
    makeSlot('position', pickWeightedId(POSITION_CARDS)),
    makeSlot('geography', pickWeightedId(GEOGRAPHY_CARDS)),
    makeSlot('fact', pickWeightedId(FACT_CARDS)),
  ];
}

function fieldCardIds(field: FieldSlot[]): string {
  return field.map((slot) => slot.card.cardId).join('|');
}

/**
 * Три слота поля из полного справочника колоды (4 позиции, 9 стран + 4 континента, 16 фактов).
 * Тираж как в `copies`. Новая раздача не повторяет предыдущую тройку.
 */
export function dealRandomField(previous?: FieldSlot[]): FieldSlot[] {
  let next = drawField();
  if (!previous?.length) return next;

  const previousIds = fieldCardIds(previous);
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (fieldCardIds(next) !== previousIds) return next;
    next = drawField();
  }
  return next;
}

export function geographyPromptLabel(card: GeographyCard): string {
  if (card.scope === 'continent') return `${card.title} (континент, гражданство)`;
  return `${card.title} (гражданство)`;
}

export function fieldToJudgePayload(field: FieldSlot[], answer: string) {
  const position = findCard(field.find((slot) => slot.type === 'position')!.card.cardId) as PositionCard;
  const geography = findCard(field.find((slot) => slot.type === 'geography')!.card.cardId) as GeographyCard;
  const fact = findCard(field.find((slot) => slot.type === 'fact')!.card.cardId) as FactCard;

  return {
    today: new Date().toISOString().slice(0, 10),
    field: {
      position: position.title,
      geography: geographyPromptLabel(geography),
      fact: fact.description ? `${fact.title}. ${fact.description}` : fact.title,
    },
    answer: answer.trim(),
    alreadyNamed: [] as string[],
  };
}

function parseVerdict(raw: string): JudgeVerdict {
  const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
  const parsed = JSON.parse(trimmed) as Partial<JudgeVerdict>;
  if (typeof parsed.valid !== 'boolean') {
    throw new Error('В ответе модели нет поля valid');
  }
  return {
    valid: parsed.valid,
    canonicalName: parsed.canonicalName ?? '',
    reason: parsed.reason ?? '',
  };
}

/**
 * Вызов YandexGPT с браузера. В dev идёт через прокси Vite `/yandex-ai`,
 * потому что api.cloud.yandex.net не отдаёт CORS.
 */
export async function judgeAnswer(field: FieldSlot[], answer: string): Promise<JudgeVerdict> {
  const apiKey = env.yandexApiKey;
  const folderId = env.yandexFolderId;
  if (!apiKey || !folderId) {
    throw new Error('Нет VITE_YANDEX_API_KEY или VITE_YANDEX_FOLDER_ID в .env');
  }

  const res = await fetch('/yandex-ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      'x-folder-id': folderId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `gpt://${folderId}/yandexgpt/latest`,
      temperature: 0,
      max_tokens: 160,
      messages: [
        { role: 'system', content: JUDGE_SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(fieldToJudgePayload(field, answer)) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'judge_verdict',
          schema: {
            type: 'object',
            properties: {
              valid: { type: 'boolean' },
              canonicalName: { type: 'string' },
              reason: { type: 'string' },
            },
            required: ['valid', 'canonicalName', 'reason'],
            additionalProperties: false,
          },
          strict: true,
        },
      },
    }),
    signal: AbortSignal.timeout(15000),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };

  if (!res.ok) {
    throw new Error(data.error?.message ?? `YandexGPT ${res.status}`);
  }

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error('Пустой ответ модели');
  return parseVerdict(content);
}
