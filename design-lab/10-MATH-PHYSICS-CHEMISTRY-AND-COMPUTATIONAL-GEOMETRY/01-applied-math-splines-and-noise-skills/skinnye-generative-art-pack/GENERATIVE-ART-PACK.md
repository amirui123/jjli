# 🎨 Generative Art Pack — твой набор для creative coding

Собран для работы в Claude Code. Это «студия генеративного искусства»: 6 агентов + 4 скила, которые ведут работу от идеи до готового результата — принта, видео-лупа или mint-ready серии. Сиквел [3D Web Pack](https://github.com/skinnye/3d-web-pack); агент `shader-artist` общий.

---

## 📦 Куда всё ставится

Агенты и скилы лежат в **глобальном** `~/.claude` — работают во всех проектах.
- **Агенты** → `~/.claude/agents/`
- **Скилы** → `~/.claude/skills/`
- **Этот гайд + демо** → в репозитории `generative-art-pack`.

Живое демо-галерея: **https://skinnye.github.io/generative-art-pack/** (каждая плитка генерится в браузере, кнопка ↻ — новый seed).

---

## 🤖 6 агентов

| Агент | За что отвечает | Когда звать |
|---|---|---|
| **generative-art-director** | Концепт, выбор техники, композиция, стратегия палитры, план seed'ов | В начале работы или серии |
| **p5-sketch-engine** | Реализация скетчей на p5.js / canvas (seeded, перезапускаемые) | Когда нужно писать сам скетч |
| **generative-systems** | Алгоритмы: flow fields, packing, клеточные автоматы, reaction-diffusion, аттракторы, WFC | Нужно закодить и настроить систему |
| **shader-artist** | Шейдеры GLSL и TSL (шум, raymarching) — **общий с 3D-паком** | GPU-визуал, текстуры |
| **color-composition** | Палитры, перцептивные OKLCH-градиенты, зерно, композиция | Картинка «плоская» / грязная / несбалансированная |
| **art-export-engineer** | Хай-рез принт, видео/GIF-лупы, hash-seeded серии (fxhash / Art Blocks) | Выпустить работу наружу |

Вызвать явно: «Используй агента `generative-systems`, сделай curl-noise flow field». Или просто опиши задачу — агент подхватится по смыслу.

---

## 🛠 4 скила

| Скил | Что делает |
|---|---|
| **/scaffold-sketch** | Новый чистый seeded-скетч (p5.js или vanilla canvas) |
| **/flow-field** | Фирменная техника — частицы по полю шума в текучие формы |
| **/export-art** | Принт-стиллы + идеальные видео/GIF-лупы (ffmpeg / WebCodecs) |
| **/generative-series** | Детерминированная серия по хешу с трейтами и редкостью |

---

## 🧱 Стек

- **Авторинг:** p5.js, HTML5 canvas, GLSL/шейдеры, three.js (для 3D).
- **Системы:** Perlin/simplex/curl noise, flow fields, packing, reaction-diffusion (Gray-Scott), клеточные автоматы, аттракторы (de Jong/Clifford/Lorenz), WFC.
- **Цвет:** перцептивные пространства OKLCH/OKLab, culori, палитра-из-изображения, dithering, зерно.
- **Экспорт:** хай-рез PNG/SVG, CCapture.js, WebCodecs, ffmpeg (лупы/GIF), fxhash, Art Blocks.

---

## 🔑 Главный принцип: воспроизводимость

Любая работа должна повторяться из одного seed/hash. Никогда не зови `Math.random()` напрямую в художественном коде — всё случайное идёт из seeded-PRNG. Тогда работу можно перегенерить, отдать в печать в любом разрешении или выпустить серией.

---

## 🚀 Типичный воркфлоу

1. **Концепт** → `generative-art-director`
2. **Старт** → `/scaffold-sketch`
3. **Алгоритм** → `generative-systems`
4. **Визуал (опц.)** → `shader-artist`
5. **Цвет/композиция** → `color-composition`
6. **Выпуск** → `/export-art` или `/generative-series`

---

## 💬 Примеры фраз

- «Спланируй спокойную работу на flow field в бирюзовой гамме» → *generative-art-director*
- «/flow-field, сделай шёлковую текстуру с длинными потоками»
- «Добавь reaction-diffusion (Gray-Scott) как отдельный модуль» → *generative-systems*
- «Подбери палитру и выправь композицию — сейчас плоско» → *color-composition*
- «Сделай идеальный 6-секундный луп и собери GIF» → *art-export-engineer* / `/export-art`
- «Преврати в серию на fxhash с трейтами» → `/generative-series`

---

## 📁 Карта файлов

```
~/.claude/agents/    generative-art-director, p5-sketch-engine, generative-systems,
                     shader-artist, color-composition, art-export-engineer
~/.claude/skills/    scaffold-sketch, flow-field, export-art, generative-series

generative-art-pack/ index.html + assets/ (живая галерея), agents/, skills/, README.md
```

---

### Связанные паки
- [**3D Web Pack**](https://github.com/skinnye/3d-web-pack) — Three.js, R3F, WebGPU, scroll-motion, ассеты. `shader-artist` общий.
