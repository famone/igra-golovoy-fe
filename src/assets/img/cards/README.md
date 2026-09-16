# Картинки карт

Раскладка папок повторяет группы колоды из `src/constants/deck.ts`.
Файл называется по `id` карты — тогда реестр `src/components/game/cardArtwork.ts`
подхватит картинку автоматически, без ручной правки кода.

```
cards/
├─ geography/
│  ├─ countries/     geo-france.png, geo-spain.png, …      (9 файлов)
│  └─ continents/    geo-africa.png, geo-eurasia.png, …    (4 файла)
├─ positions/        pos-goalkeeper.png, pos-defender.png, … (4 файла)
├─ facts/            fact-ballon-dor.png, fact-captain.png, … (16 файлов)
├─ actions/          action-block.png, action-red-card.png, … (5 файлов)
└─ backs/            geography.png, position.png, fact.png, action.png
```

Требования к файлам:

- формат `.png` с прозрачным фоном либо `.webp`;
- пропорции **104 × 137** (≈ 1 : 1.32) — как у печатной карты;
- ширина от 480 px, чтобы не мылилось на плотных экранах;
- рамку и тень рисует компонент `GameCard.vue`, в картинке они не нужны.

Пока файлов нет, `GameCard.vue` рисует текстовую заглушку в цвете группы,
так что приложение работает и с пустыми папками.
