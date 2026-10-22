import { translate, WIKIPEDIA } from 'iuliia';

const CYRILLIC = /\p{Script=Cyrillic}/u;

/**
 * Live Football ищет только латиницей.
 * Кириллицу переводим схемой Википедии из iuliia, латиницу не трогаем.
 */
export function latinSearchQuery(input: string): string {
  const query = input.trim();
  if (!query || !CYRILLIC.test(query)) return query;
  return translate(query, WIKIPEDIA);
}
