import { FACT_CARDS, GEOGRAPHY_CARDS, POSITION_CARDS, findCard } from '@/constants/deck';
import { DEAD_COMBOS } from '@/constants/combos';
import { env } from '@/lib/env';
import type { CardInstance, FactCard, GeographyCard, PositionCard } from '@/types/cards';
import type { FieldSlot } from '@/types/game';

const JUDGE_RULES = `═══ ОПРЕДЕЛЕНИЯ ПОЗИЦИЙ ═══
Дословно из правил игры, другой трактовки нет:
Вратарь.
Защитник: ЦЗ, ЛЗ, ПЗ, ЛФЗ, ПФЗ.
Полузащитник: ЦП, ЦОП, ЦАП, ПП, ЛП.
Нападающий: ФРВ, ЛФА, ПФА, ЦФД.

Фланговые игроки разделены по глубине роли:
ЛП / ПП (фланговый полузащитник) → карта «Полузащитник».
ЛФА / ПФА (фланговый атакующий) → карта «Нападающий».
ЛФЗ / ПФЗ (фланговый защитник) → карта «Защитник».

НЕСКОЛЬКО АМПЛУА ЗА КАРЬЕРУ:
Засчитывается любая позиция, на которой игрок реально выступал
значимую часть карьеры. Большинство вингеров играли и ЛП/ПП,
и ЛФА/ПФА — для них засчитываются обе карты.
Разовый выход не на своей позиции не считается.

Вратарь не засчитывается ни под одну полевую карту, и наоборот.

═══ ГЕОГРАФИЯ ═══
Определяется ГРАЖДАНСТВОМ, не местом рождения.
Двойное гражданство — засчитывается любое из них.
Если игрок выступает за сборную страны X — гражданство X засчитывается.

Континенты:
- Южная Америка
- Северная Америка (включая Мексику, Центральную Америку и Карибы)
- Африка
- Евразия (Европа и Азия вместе)

═══ ОПРЕДЕЛЕНИЯ ФАКТОВ ═══
Используй ТОЛЬКО эти определения. Не додумывай свои.

«Играл в Италии» / «Играл в Англии» / «Играл в Испании» /
«Играл в Германии» / «Играл во Франции» — числился в клубе
чемпионата этой страны в любой период карьеры, включая аренду.
Слухи, интерес клубов и несостоявшиеся трансферы не считаются.
Выступление в другой стране Европы НЕ даёт «Играл в Испании».

«Закончил карьеру» — не выступает профессионально на дату today.

«Выиграл трофей со сборной» — титул с национальной сборной:
чемпионат мира, чемпионат Европы, Кубок Америки, Кубок африканских
наций, Лига наций УЕФА, Золотой кубок КОНКАКАФ.
Молодёжные и юношеские турниры не считаются.

«Выиграл чемпионат страны» — был в составе чемпиона любой
национальной лиги.

«Выиграл еврокубок» — был в составе команды, выигравшей Лигу
чемпионов, Кубок европейских чемпионов, Лигу Европы, Кубок УЕФА,
Кубок кубков, Суперкубок УЕФА или Лигу конференций.
Это КОМАНДНЫЙ трофей. Индивидуальные награды игрока к этой карте
отношения не имеют.

«Обладатель Золотого мяча» — награда Ballon d'Or от France Football.
The Best FIFA, награды лиг и прочие призы не считаются.

«Забил в финале» — забивал гол в финале любого турнира на взрослом
уровне, клубного или в составе сборной.

«Капитан» — является или являлся капитаном клуба или национальной
сборной.

«Старше 30 лет» / «Младше 25 лет» — возраст на дату today,
включительно.

«Играл в трёх лигах и более» — выступал в чемпионатах минимум
трёх разных стран.

«Играл в пяти клубах и более» — пять и более взрослых клубов
за карьеру, аренды считаются отдельными клубами.

═══ ПРЕЗУМПЦИЯ В ПОЛЬЗУ ИГРОКА ═══
Если по карте нет однозначных данных, но ответ выглядит
правдоподобным — ставь pass:true и confidence:"low".
Судью зовут разрешить спор, а не искать повод отказать.

Если футболист тебе НЕ ИЗВЕСТЕН — не отказывай автоматически.
Ставь confidence:"low" и pass:true по тем картам, которые
не можешь опровергнуть.

Исключение — очевидное несоответствие, здесь pass:false:
вратарь на карте полевого игрока, итальянец на карте Бразилии,
игрок 20 лет на карте «Старше 30 лет».`;

export const NAME_RECOGNITION_PROMPT = `Ты распознаёшь имена футболистов. Верни ТОЛЬКО JSON.

{"canonicalName": "...", "recognized": true|false}

ПРАВИЛА:

1. Исправляй опечатки, транслит и разговорные формы:
   «эрнан кресло» → «Эрнан Креспо»
   «аксель винсель» → «Аксель Витсель»
   «лендон донован» → «Лэндон Донован»

2. КРИТИЧЕСКИ ВАЖНО: если введённое имя САМО ПО СЕБЕ является
   реальным футболистом — верни именно его. НЕ заменяй на более
   известного футболиста с похожим именем.
   «фигу» → «Луиш Фигу». НЕ «Криштиану Роналду».
   «зидан» → «Зинедин Зидан». НЕ «Зинченко».

3. Фамилия без имени → самый известный носитель:
   «месси» → «Лионель Месси»
   «роналду» → «Криштиану Роналду»

4. Не знаешь такого футболиста:
   recognized: false, а в canonicalName — аккуратно оформленный
   ввод игрока с заглавных букв («беральдо» → «Беральдо»).
   НЕ подставляй похожего футболиста, которого знаешь.

5. canonicalName всегда на русском, в форме «Имя Фамилия».

Больше ничего не делай. Не суди, не проверяй факты, не комментируй.`;

export const JUDGE_SYSTEM_PROMPT = `Ты судья настольной игры «Игра Головой». Верни ТОЛЬКО JSON.

{
  "valid": true|false,
  "checks": {
    "position":   {"pass": true|false, "evidence": "..."},
    "geography":  {"pass": true|false, "evidence": "..."},
    "fact":       {"pass": true|false, "evidence": "..."}
  },
  "confidence": "high"|"medium"|"low"
}

valid = true ТОЛЬКО если pass=true во всех трёх checks.

В evidence — конкретика: клуб, турнир, год, гражданство, амплуа.
МАКСИМУМ 8 СЛОВ на evidence. Без вводных, без пояснений.
Правильно: «Бавария, Лига чемпионов 2019/20».
Неправильно: «Да, этот игрок действительно выигрывал, поскольку выступал за...».

${JUDGE_RULES}

═══ ПРИМЕРЫ ═══
Защитник + Северная Америка + Выиграл еврокубок + «Альфонсо Дэвис»
→ valid:true
  position: pass:true, «левый защитник»
  geography: pass:true, «гражданство Канады»
  fact: pass:true, «Бавария, Лига чемпионов 2019/20»

Защитник + Нидерланды + Играл во Франции + «Ян Пауль ван Хекке»
→ valid:false
  position: pass:true, «центральный защитник»
  geography: pass:true, «гражданство Нидерландов»
  fact: pass:false, «во французских клубах не выступал»

Нападающий + Португалия + Капитан + «Луиш Фигу»
→ valid:true
  position: pass:true, «правый вингер, играл ПФА»
  geography: pass:true, «гражданство Португалии»
  fact: pass:true, «капитан сборной Португалии»

Нападающий + Аргентина + Обладатель Золотого мяча + «Лионель Месси»
→ valid:true

Защитник + Аргентина + Обладатель Золотого мяча + «Лионель Месси»
→ valid:false
  position: pass:false, «нападающий и атакующий полузащитник»`;

export const SCAN_PLAYERS_PROMPT = `Подбери реальных футболистов под комбинацию карт настолки «Игра Головой».
Верни ТОЛЬКО JSON {"players": ["Имя Фамилия"]}.
До 5 имён. Подходящих нет — пустой список.
Не заполняй список игроками, в которых не уверен.

${JUDGE_RULES}`;

export const NAME_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    canonicalName: { type: 'string' },
    recognized: { type: 'boolean' },
  },
  required: ['canonicalName', 'recognized'],
} as const;

export const JUDGE_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    valid: { type: 'boolean' },
    checks: {
      type: 'object',
      properties: {
        position: {
          type: 'object',
          properties: {
            pass: { type: 'boolean' },
            evidence: { type: 'string' },
          },
          required: ['pass', 'evidence'],
        },
        geography: {
          type: 'object',
          properties: {
            pass: { type: 'boolean' },
            evidence: { type: 'string' },
          },
          required: ['pass', 'evidence'],
        },
        fact: {
          type: 'object',
          properties: {
            pass: { type: 'boolean' },
            evidence: { type: 'string' },
          },
          required: ['pass', 'evidence'],
        },
      },
      required: ['position', 'geography', 'fact'],
    },
    confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
  },
  required: ['valid', 'checks', 'confidence'],
} as const;

export const SCAN_RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    players: {
      type: 'array',
      items: { type: 'string' },
    },
  },
  required: ['players'],
} as const;

export interface CheckResult {
  pass: boolean;
  evidence: string;
}

export interface JudgeVerdict {
  valid: boolean;
  checks: {
    position: CheckResult;
    geography: CheckResult;
    fact: CheckResult;
  };
  confidence: 'high' | 'medium' | 'low';
  /** Из вызова распознавания, не из вердикта модели. */
  canonicalName: string;
  /** Модель не узнала имя или вызов распознавания упал. Ход всё равно судится. */
  unverifiedName: boolean;
}

export interface RegressionCase {
  id: number;
  cards: string;
  answer: string;
  expectedValid: true | false | 'true-or-unverified' | 'review';
  canonicalName?: string;
  note: string;
}

/** Кейсы, на которых ломалась прошлая версия судьи. */
export const REGRESSION_CASES: RegressionCase[] = [
  {
    id: 1,
    cards: 'Защитник · Северная Америка · Выиграл еврокубок',
    answer: 'Альфонсо Дэвис',
    expectedValid: true,
    note: 'Командный трофей, не индивидуальные награды',
  },
  {
    id: 2,
    cards: 'Нападающий · Северная Америка · Выиграл еврокубок',
    answer: 'Пулишич',
    expectedValid: true,
    note: 'Вингер проходит «Нападающий». evidence — игрок был в составе',
  },
  {
    id: 3,
    cards: 'Защитник · Нидерланды · Играл во Франции',
    answer: 'Ван Хекке',
    expectedValid: false,
    note: 'Не выдумывать клуб «Осер» и имя «Йерун»',
  },
  {
    id: 4,
    cards: 'Нападающий · Аргентина · Играл в Испании',
    answer: 'эрнан кресло',
    expectedValid: false,
    canonicalName: 'Эрнан Креспо',
    note: 'Раньше «игрок не найден»',
  },
  {
    id: 5,
    cards: 'Нападающий · Португалия · Капитан',
    answer: 'фигу',
    expectedValid: true,
    canonicalName: 'Луиш Фигу',
    note: 'Не подменять на Криштиану Роналду',
  },
  {
    id: 6,
    cards: 'Защитник · Южная Америка · Играл во Франции',
    answer: 'беральдо',
    expectedValid: 'true-or-unverified',
    note: 'Отказ false — провал. Незнание модели не приговор',
  },
  {
    id: 7,
    cards: 'Полузащитник · Португалия · Выиграл еврокубок',
    answer: 'данило перейра',
    expectedValid: 'review',
    note: 'evidence «ЛЧ с Порту в 2011» — выдумка',
  },
  {
    id: 8,
    cards: 'Нападающий · Португалия · Играл в трёх лигах и более',
    answer: 'гонсалу рамуш',
    expectedValid: true,
    note: 'Вердикт true, evidence не выдумывать целиком',
  },
];

const UNAVAILABLE_EVIDENCE = 'проверка недоступна';
const MISSING_EVIDENCE = 'данных нет';
const MIN_EVIDENCE_LENGTH = 3;

const CHECK_KEYS = ['position', 'geography', 'fact'] as const;

function unavailableChecks(): JudgeVerdict['checks'] {
  return {
    position: { pass: true, evidence: UNAVAILABLE_EVIDENCE },
    geography: { pass: true, evidence: UNAVAILABLE_EVIDENCE },
    fact: { pass: true, evidence: UNAVAILABLE_EVIDENCE },
  };
}

export function technicalFailureVerdict(canonicalName = '', unverifiedName = true): JudgeVerdict {
  return {
    valid: true,
    checks: unavailableChecks(),
    confidence: 'low',
    canonicalName,
    unverifiedName,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function readCheck(value: unknown): CheckResult | null {
  if (!isRecord(value) || typeof value.pass !== 'boolean' || typeof value.evidence !== 'string') {
    return null;
  }
  return { pass: value.pass, evidence: value.evidence };
}

/** Битый JSON и дырявая схема не роняют ход: засчитываем и пишем в консоль. */
export function parseVerdict(raw: string): Omit<JudgeVerdict, 'canonicalName' | 'unverifiedName'> {
  try {
    const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isRecord(parsed) || typeof parsed.valid !== 'boolean' || !isRecord(parsed.checks)) {
      throw new Error('нет valid или checks');
    }
    const position = readCheck(parsed.checks.position);
    const geography = readCheck(parsed.checks.geography);
    const fact = readCheck(parsed.checks.fact);
    const confidence = parsed.confidence;
    if (!position || !geography || !fact) throw new Error('битый checks');
    if (confidence !== 'high' && confidence !== 'medium' && confidence !== 'low') {
      throw new Error('битый confidence');
    }
    return applyVerdictGuards({ valid: parsed.valid, checks: { position, geography, fact }, confidence });
  }
  catch (error) {
    console.error('Судья: не разобрали вердикт', error, raw);
    return {
      valid: true,
      checks: unavailableChecks(),
      confidence: 'low',
    };
  }
}

export function applyVerdictGuards(
  verdict: Omit<JudgeVerdict, 'canonicalName' | 'unverifiedName'>,
): Omit<JudgeVerdict, 'canonicalName' | 'unverifiedName'> {
  let confidence = verdict.confidence;
  const checks = { ...verdict.checks };

  for (const key of CHECK_KEYS) {
    const evidence = checks[key].evidence.trim();
    if (evidence.length < MIN_EVIDENCE_LENGTH) {
      checks[key] = { pass: checks[key].pass, evidence: MISSING_EVIDENCE };
      confidence = 'low';
    }
    else {
      checks[key] = { pass: checks[key].pass, evidence };
    }
  }

  const allPassed = CHECK_KEYS.every((key) => checks[key].pass);
  const valid = verdict.valid && allPassed;

  return { valid, checks, confidence };
}

export interface NameRecognition {
  canonicalName: string;
  recognized: boolean;
}

export function parseNameRecognition(raw: string): NameRecognition | null {
  try {
    const trimmed = raw.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    const parsed = JSON.parse(trimmed) as unknown;
    if (!isRecord(parsed) || typeof parsed.canonicalName !== 'string' || typeof parsed.recognized !== 'boolean') {
      return null;
    }
    const canonicalName = parsed.canonicalName.trim();
    if (!canonicalName) return null;
    return { canonicalName, recognized: parsed.recognized };
  }
  catch (error) {
    console.error('Судья: не разобрали имя', error, raw);
    return null;
  }
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

export function fieldComboKey(field: FieldSlot[]): string {
  return field.map((slot) => slot.card.cardId).join('|');
}

export function isDeadCombo(key: string): boolean {
  return DEAD_COMBOS.includes(key);
}

/**
 * Три слота поля из справочника колоды.
 * Тираж как в `copies`. Не повторяет предыдущую тройку и не берёт DEAD_COMBOS.
 */
export function dealRandomField(previous?: FieldSlot[]): FieldSlot[] {
  const previousKey = previous?.length ? fieldComboKey(previous) : '';
  let next = drawField();

  for (let attempt = 0; attempt < 100; attempt += 1) {
    const key = fieldComboKey(next);
    if (key !== previousKey && !isDeadCombo(key)) return next;
    next = drawField();
  }
  return next;
}

export function fieldToJudgePayload(field: FieldSlot[], player: string) {
  const position = findCard(field.find((slot) => slot.type === 'position')!.card.cardId) as PositionCard;
  const geography = findCard(field.find((slot) => slot.type === 'geography')!.card.cardId) as GeographyCard;
  const fact = findCard(field.find((slot) => slot.type === 'fact')!.card.cardId) as FactCard;

  return {
    today: new Date().toISOString().slice(0, 10),
    field: {
      position: position.title,
      geography: geography.title,
      fact: fact.title,
    },
    player: player.trim(),
  };
}

export function hasYandexJudgeCredentials(): boolean {
  const folderId = env.yandexFolderId.trim();
  if (!folderId) return false;
  if (import.meta.env.PROD) return true;
  return Boolean(env.yandexApiKey.trim());
}

function resolveYandexEndpoint(): string {
  if (import.meta.env.PROD) return '/api/yandex/completions';
  return '/yandex-ai/v1/chat/completions';
}

function resolveYandexHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!import.meta.env.PROD) {
    headers.Authorization = `Api-Key ${env.yandexApiKey}`;
    headers['x-folder-id'] = env.yandexFolderId;
  }
  return headers;
}

async function callModel(options: {
  model: string;
  system: string;
  user: string;
  schemaName: string;
  schema: object;
  maxTokens: number;
  timeoutMs: number;
}): Promise<string> {
  const res = await fetch(resolveYandexEndpoint(), {
    method: 'POST',
    headers: resolveYandexHeaders(),
    body: JSON.stringify({
      model: options.model,
      temperature: 0,
      max_tokens: options.maxTokens,
      messages: [
        { role: 'system', content: options.system },
        { role: 'user', content: options.user },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: options.schemaName,
          schema: options.schema,
          strict: true,
        },
      },
    }),
    signal: AbortSignal.timeout(options.timeoutMs),
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
  return content;
}

/**
 * Два вызова: lite узнаёт имя, Pro судит по картам.
 * Сбой любого вызова не отказывает игроку.
 */
export async function judgeAnswer(field: FieldSlot[], answer: string): Promise<JudgeVerdict> {
  const folderId = env.yandexFolderId.trim();
  if (!hasYandexJudgeCredentials()) {
    throw new Error('Нет настроек YandexGPT: folder id + api key (локально) или folder id (на Vercel)');
  }

  const rawAnswer = answer.trim();
  let canonicalName = rawAnswer;
  let unverifiedName = false;

  try {
    const recognizedRaw = await callModel({
      model: `gpt://${folderId}/yandexgpt-lite/latest`,
      system: NAME_RECOGNITION_PROMPT,
      user: JSON.stringify({ answer: rawAnswer }),
      schemaName: 'player_name',
      schema: NAME_RESPONSE_SCHEMA,
      maxTokens: 60,
      timeoutMs: 2000,
    });
    const recognized = parseNameRecognition(recognizedRaw);
    if (!recognized) {
      unverifiedName = true;
    }
    else {
      canonicalName = recognized.canonicalName;
      unverifiedName = !recognized.recognized;
    }
  }
  catch (error) {
    console.error('Судья: распознавание имени не удалось', error);
    unverifiedName = true;
  }

  try {
    const verdictRaw = await callModel({
      model: `gpt://${folderId}/yandexgpt/latest`,
      system: JUDGE_SYSTEM_PROMPT,
      user: JSON.stringify(fieldToJudgePayload(field, canonicalName)),
      schemaName: 'judge_verdict',
      schema: JUDGE_RESPONSE_SCHEMA,
      maxTokens: 220,
      timeoutMs: 3500,
    });
    const verdict = parseVerdict(verdictRaw);
    return { ...verdict, canonicalName, unverifiedName };
  }
  catch (error) {
    console.error('Судья: проверка хода не удалась', error);
    return technicalFailureVerdict(canonicalName, unverifiedName);
  }
}
