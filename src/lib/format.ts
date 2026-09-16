const pluralRules = new Intl.PluralRules('ru-RU');

/** plural(2, ['игрок', 'игрока', 'игроков']) -> 'игрока' */
export function plural(count: number, forms: [string, string, string]): string {
  const category = pluralRules.select(count);
  if (category === 'one') return forms[0];
  if (category === 'few') return forms[1];
  return forms[2];
}

export function pluralWithCount(count: number, forms: [string, string, string]): string {
  return `${count} ${plural(count, forms)}`;
}

/** Секунды -> `M:SS` для таймера хода. */
export function formatClock(totalSeconds: number): string {
  const safe = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(safe / 60);
  const seconds = safe % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat('ru-RU').format(value);
}

export function formatRelativeTime(iso: string): string {
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (diffMinutes < 1) return 'только что';
  if (diffMinutes < 60) return `${diffMinutes} мин назад`;

  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours} ${plural(diffHours, ['час', 'часа', 'часов'])} назад`;

  const diffDays = Math.round(diffHours / 24);
  return `${diffDays} ${plural(diffDays, ['день', 'дня', 'дней'])} назад`;
}

export function initialsOf(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}
