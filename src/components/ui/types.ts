/** Акцентные цвета из палитры igragolovoy.ru. */
export type BrandColor = 'flame' | 'pitch' | 'sky' | 'grape' | 'lemon' | 'ink';

export type ControlSize = 'small' | 'default' | 'large';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
  /** Счётчик справа от подписи — например, число комнат в фильтре. */
  count?: number;
}

export interface ListRow {
  id: string;
  title: string;
  subtitle?: string;
}
