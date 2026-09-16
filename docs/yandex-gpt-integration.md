# Интеграция судьи хода с YandexGPT

Проверка ответа игрока (да/нет по трём картам) идёт **только с бэкенда**. Фронт по-прежнему шлёт `turn:answer` с `{ answer }`. Ключ API во Vue и в git не кладём.

Ориентиры: [консоль Cloud](https://console.cloud.yandex.ru), [AI Studio](https://aistudio.yandex.ru), [документация AI Studio](https://yandex.cloud/ru/docs/ai-studio/).

При ~1000 проверок в месяц на **Pro** расход порядка **800–900 ₽**.

---

## 1. Аккаунт и оплата

1. Открой [console.cloud.yandex.ru](https://console.cloud.yandex.ru) с Яндекс ID.
2. Создай облако (если его нет) и **платёжный аккаунт**.
3. Привяжи карту или счёт. Без биллинга модель вернёт ошибку квоты или оплаты.
4. Новый аккаунт часто даёт **грант** — при текущем объёме его хватит на несколько месяцев.
5. Создай **каталог** (folder), например `igra-golovoy`. Скопируй **Folder ID** (строка вроде `b1g...`) из шапки консоли или из URL:

   `https://aistudio.yandex.ru/platform/folders/<folder_id>`

---

## 2. Доступ к модели

Два рабочих пути. Для старта достаточно **AI Studio**.

### Короткий путь (AI Studio)

1. Открой [aistudio.yandex.ru](https://aistudio.yandex.ru), выбери тот же каталог.
2. **Создать API-ключ**.
3. Scope: **`yc.ai.languageModels.execute`**.
4. Создай и сразу скопируй секрет. Показывается один раз.

### Классический путь (IAM)

1. Сервисный аккаунт в каталоге.
2. Роль **`ai.languageModels.user`** (или `ai.playground.user`).
3. У аккаунта: создать API-ключ со scope `yc.ai.languageModels.execute`.

В env бэкенда:

```bash
YANDEX_API_KEY=AQVN...
YANDEX_FOLDER_ID=b1g...
```

Ключ **долгоживущий**, обновлять каждые 30 минут не нужно.

---

## 3. Проверка ключа

```http
GET https://ai.api.cloud.yandex.net/v1/models
Authorization: Api-Key <YANDEX_API_KEY>
```

Или сразу тестовый chat (подставь Folder ID):

```http
POST https://ai.api.cloud.yandex.net/v1/chat/completions
Authorization: Api-Key <ключ>
Content-Type: application/json
```

```json
{
  "model": "gpt://<FOLDER_ID>/yandexgpt/latest",
  "messages": [{ "role": "user", "content": "ping" }]
}
```

- `yandexgpt/latest` — **Pro** (для судьи).
- `yandexgpt-lite/latest` — Lite, дешевле и слабее.
- Если в каталоге явно есть 5.1: `gpt://<FOLDER_ID>/yandexgpt-5.1`.

Заголовок именно **`Api-Key`**, не `Bearer`. При необходимости добавь `x-folder-id: <FOLDER_ID>`.

---

## 4. Вызов судьи

Мастер-промпт один и тот же на каждый запрос (так дешевле за счёт повторяющегося префикса). В `user` — только текущий ход.

`POST https://ai.api.cloud.yandex.net/v1/chat/completions`

```json
{
  "model": "gpt://<FOLDER_ID>/yandexgpt/latest",
  "temperature": 0,
  "max_tokens": 120,
  "messages": [
    {
      "role": "system",
      "content": "Ты строгий судья настолки «Игра головой». Не поддакивай. Верни ТОЛЬКО JSON {\"valid\": boolean, \"canonicalName\": string, \"reason\": string}. valid=true только если футболист подходит под КАЖДУЮ карту. Не уверен — false. «Играл в стране» = клуб чемпионата этой страны, не сборная. Де Хеа + Играл в Германии = false. Месси + защитник = false."
    },
    {
      "role": "user",
      "content": "{\"today\":\"2026-09-14\",\"field\":{\"position\":\"Защитник\",\"geography\":\"Аргентина (гражданство)\",\"fact\":\"Обладатель Золотого мяча\"},\"answer\":\"месси\",\"alreadyNamed\":[]}"
    }
  ],
  "response_format": {
    "type": "json_schema",
    "json_schema": {
      "name": "judge_verdict",
      "schema": {
        "type": "object",
        "properties": {
          "valid": { "type": "boolean" },
          "canonicalName": { "type": "string" },
          "reason": { "type": "string" }
        },
        "required": ["valid", "canonicalName", "reason"],
        "additionalProperties": false
      },
      "strict": true
    }
  }
}
```

Ответ модели: `choices[0].message.content` → `JSON.parse` → поле `valid`.

Таймаут на ход держи **~3 с**. Нет JSON, 5xx или таймаут — считай ответ неверным, партию не стопори.

Тот же system + user можно прогнать руками в Playground AI Studio.

---

## 5. Пример на Node

```js
const SYSTEM_PROMPT = `Ты строгий судья настолки «Игра головой». Не поддакивай игроку.
Верни ТОЛЬКО JSON: {"valid": boolean, "canonicalName": string, "reason": string}
valid=true только если футболист подходит под КАЖДУЮ карту. Не уверен — false. Клубы не выдумывай.
«Играл в стране» = клуб чемпионата этой страны, не сборная.
Де Хеа + Играл в Германии = false. Нойер + Играл в Германии = true. Месси + защитник = false.`;

const folderId = process.env.YANDEX_FOLDER_ID;

export async function judgeTurn(turn) {
  const res = await fetch('https://ai.api.cloud.yandex.net/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${process.env.YANDEX_API_KEY}`,
      'x-folder-id': folderId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `gpt://${folderId}/yandexgpt/latest`,
      temperature: 0,
      max_tokens: 120,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: JSON.stringify(turn) },
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
    signal: AbortSignal.timeout(3000),
  });

  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}
```

Через SDK `openai`: `baseURL: 'https://ai.api.cloud.yandex.net/v1'`, `apiKey`, `project: folderId`.

### В игровом сервере

1. Пришёл `turn:answer` с `{ answer }`.
2. Пустой ответ или имя уже в `alreadyNamed` — без LLM, штраф.
3. Иначе `judgeTurn({ today, field, answer, alreadyNamed })`.
4. `valid === true` — засчитать `canonicalName`.
5. Иначе штраф.

Фронт не меняется: `transport.send({ type: 'turn:answer', payload: { answer } })`.

---

## 6. Ручные кейсы

| Ход | Ожидание |
| --- | --- |
| защитник + Аргентина + Золотой мяч + «месси» | `valid: false` |
| нападающий + Аргентина + Золотой мяч + «месси» | `valid: true` |
| то же + `alreadyNamed: ["Лионель Месси"]` | `valid: false` |
| «роналду» без имени | `valid: false` |

Расход смотри в биллинге Cloud и Usage AI Studio.

---

## 7. Типичные ошибки

| Что видишь | Что делать |
| --- | --- |
| 401 | не `Api-Key`, обрезанный ключ, `Bearer` вместо `Api-Key` |
| 403 | чужой `folder_id`, нет роли на модели, не тот каталог |
| модель не найдена | URI не `gpt://<тот же folder>/yandexgpt/latest` |
| 429 / quota | биллинг не привязан или грант кончился |
| не JSON | схема не принялась — убери `strict` или упрости `json_schema` |

---

## Кратко

Yandex Cloud → биллинг → каталог → API-ключ `languageModels.execute` → `POST https://ai.api.cloud.yandex.net/v1/chat/completions` с `Api-Key` и `json_schema` → поле `valid` в игровом сервере.
