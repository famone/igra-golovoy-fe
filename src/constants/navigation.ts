import {
  GamepadIcon,
  TrophyIcon,
  UserIcon,
  WalletIcon,
  type LucideIcon,
} from '@lucide/vue';

export interface NavItem {
  /** Имя маршрута — по нему подсвечивается активный пункт. */
  name: string;
  label: string;
  icon: LucideIcon;
  /** Раздел ещё не готов: показываем метку и ведём на заглушку. */
  isSoon?: boolean;
}

/**
 * Нижнее меню мини-приложения. Между второй и третьей позицией
 * рендерится центральная кнопка «Создать игру» — она не является пунктом меню.
 */
export const NAV_ITEMS: NavItem[] = [
  { name: 'arena', label: 'Арена', icon: GamepadIcon },
  { name: 'leaders', label: 'Лидеры', icon: TrophyIcon },
  { name: 'wallet', label: 'Кошелёк', icon: WalletIcon, isSoon: true },
  { name: 'profile', label: 'Профиль', icon: UserIcon },
];
