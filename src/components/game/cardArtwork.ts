import type { CardType } from '@/types/cards';

/**
 * Реестр картинок карт.
 *
 * Файлы подхватываются по имени: `src/assets/img/cards/**\/geo-spain.png`
 * становится картинкой карты с `id: 'geo-spain'`. Добавление новой картинки
 * не требует правок кода — достаточно положить файл в нужную папку,
 * раскладка описана в `src/assets/img/cards/README.md`.
 */
const artworkModules = import.meta.glob<string>(
  '@/assets/img/cards/**/*.{png,webp,jpg,svg}',
  { eager: true, import: 'default', query: '?url' },
);

function buildRegistry() {
  const byName = new Map<string, string>();

  for (const [path, url] of Object.entries(artworkModules)) {
    const fileName = path.split('/').pop();
    if (!fileName) continue;
    const name = fileName.replace(/\.(png|webp|jpg|svg)$/, '');
    byName.set(name, url);
  }

  return byName;
}

const registry = buildRegistry();

export function cardArtwork(cardId: string): string | undefined {
  return registry.get(cardId);
}

/** Рубашка своя у каждой группы карт — лежит в `cards/backs/<type>.png`. */
export function cardBackArtwork(type: CardType): string | undefined {
  return registry.get(type);
}

export function hasArtwork(): boolean {
  return registry.size > 0;
}
