/**
 * Офлайн-разметка 832 комбинаций. Запуск с локальной машины, не через прокси приложения:
 *   npm run scan:combos
 * Прогресс пишется в scripts/combo-scan-progress.json, можно продолжить после обрыва.
 * По завершении перезаписывает src/constants/combos.ts и scripts/combo-answers.json.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { FACT_CARDS, GEOGRAPHY_CARDS, POSITION_CARDS } from '../src/constants/deck';
import { SCAN_PLAYERS_PROMPT, SCAN_RESPONSE_SCHEMA } from '../src/lib/yandexJudge';

const PROGRESS_PATH = 'scripts/combo-scan-progress.json';
const ANSWERS_PATH = 'scripts/combo-answers.json';
const COMBOS_PATH = 'src/constants/combos.ts';

interface Progress {
  players: Record<string, string[]>;
}

function loadEnvFile() {
  if (!existsSync('.env')) return;
  for (const line of readFileSync('.env', 'utf8').split('\n')) {
    const match = line.match(/^([^#=\s]+)=(.*)$/);
    if (!match) continue;
    process.env[match[1]] = match[2].trim();
  }
}

function loadProgress(): Progress {
  if (!existsSync(PROGRESS_PATH)) return { players: {} };
  return JSON.parse(readFileSync(PROGRESS_PATH, 'utf8')) as Progress;
}

function comboKey(positionId: string, geographyId: string, factId: string) {
  return `${positionId}|${geographyId}|${factId}`;
}

async function askPlayers(key: string, titles: { position: string; geography: string; fact: string }) {
  const apiKey = process.env.YANDEX_API_KEY || process.env.VITE_YANDEX_API_KEY;
  const folderId = process.env.YANDEX_FOLDER_ID || process.env.VITE_YANDEX_FOLDER_ID;
  if (!apiKey || !folderId) {
    throw new Error('В .env нет YANDEX_API_KEY / YANDEX_FOLDER_ID');
  }

  const res = await fetch('https://ai.api.cloud.yandex.net/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Api-Key ${apiKey}`,
      'x-folder-id': folderId,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: `gpt://${folderId}/yandexgpt/latest`,
      temperature: 0,
      max_tokens: 180,
      messages: [
        { role: 'system', content: SCAN_PLAYERS_PROMPT },
        { role: 'user', content: JSON.stringify({ combo: key, field: titles }) },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: { name: 'combo_players', schema: SCAN_RESPONSE_SCHEMA, strict: true },
      },
    }),
  });

  const data = (await res.json()) as {
    error?: { message?: string };
    choices?: Array<{ message?: { content?: string } }>;
  };
  if (!res.ok) throw new Error(data.error?.message ?? `YandexGPT ${res.status}`);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Пустой ответ для ${key}`);
  const parsed = JSON.parse(content) as { players?: string[] };
  return (parsed.players ?? []).map((name) => name.trim()).filter(Boolean).slice(0, 5);
}

function writeOutputs(players: Record<string, string[]>) {
  const dead: string[] = [];
  const thin: string[] = [];
  for (const [key, names] of Object.entries(players)) {
    if (names.length === 0) dead.push(key);
    else if (names.length <= 2) thin.push(key);
  }
  dead.sort();
  thin.sort();

  const render = (ids: string[]) => ids.map((id) => `  '${id}',`).join('\n');
  writeFileSync(COMBOS_PATH, `/** Ключ — id карт из deck.ts через «|»: позиция|география|факт. */\nexport const DEAD_COMBOS: string[] = [\n${render(dead)}\n];\n\n/** Найдено 1–2 ответа — законный хардкор, из раздачи не убираем. */\nexport const THIN_COMBOS: string[] = [\n${render(thin)}\n];\n`);
  writeFileSync(ANSWERS_PATH, `${JSON.stringify(players, null, 2)}\n`);
}

async function main() {
  loadEnvFile();
  const progress = loadProgress();
  const combos: Array<{ key: string; position: string; geography: string; fact: string }> = [];

  for (const position of POSITION_CARDS) {
    for (const geography of GEOGRAPHY_CARDS) {
      for (const fact of FACT_CARDS) {
        combos.push({
          key: comboKey(position.id, geography.id, fact.id),
          position: position.title,
          geography: geography.title,
          fact: fact.title,
        });
      }
    }
  }

  console.log(`Комбинаций: ${combos.length}, уже размечено: ${Object.keys(progress.players).length}`);

  for (const combo of combos) {
    if (progress.players[combo.key]) continue;
    const names = await askPlayers(combo.key, combo);
    progress.players[combo.key] = names;
    writeFileSync(PROGRESS_PATH, `${JSON.stringify(progress)}\n`);
    console.log(`${combo.key} → ${names.length ? names.join(', ') : 'пусто'}`);
    await new Promise((resolve) => setTimeout(resolve, 400));
  }

  writeOutputs(progress.players);
  console.log(`Готово. Ответы: ${ANSWERS_PATH}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
