# websfx

[![NPM](https://nodei.co/npm/websfx.svg)](https://www.npmjs.com/package/websfx)

[![NPM version](https://img.shields.io/npm/v/websfx.svg)](https://www.npmjs.com/package/websfx)
[![build](https://github.com/remarkablemark/websfx/actions/workflows/build.yml/badge.svg)](https://github.com/remarkablemark/websfx/actions/workflows/build.yml)
[![codecov](https://codecov.io/gh/remarkablemark/websfx/graph/badge.svg?token=MOIv2v4Pd4)](https://codecov.io/gh/remarkablemark/websfx)

🔊 Play synthesized UI sound effects in the browser.

No dependencies. No audio assets. Sounds are generated at runtime with the [Web Audio API](https://developer.mozilla.org/docs/Web/API/Web_Audio_API). Import what you need with tree-shakable ESM.

## Demo

Try out the sound effects in the [playground](https://remarkablemark.org/websfx/).

## Quick Start

```ts
import { click, success, configure } from 'websfx';

configure({ volume: 0.5 });

click();
success();
```

## Install

[NPM](https://www.npmjs.com/package/websfx):

```sh
npm install websfx
```

[CDN](https://unpkg.com/browse/websfx/):

```html
<script src="https://unpkg.com/websfx@latest/dist/index.umd.min.js"></script>
```

## Usage

ES Modules:

```ts
import { click, success } from 'websfx';

click();
success();
```

CommonJS:

```js
const { click, success } = require('websfx');

click();
success();
```

UMD:

```html
<script src="https://unpkg.com/websfx@latest/dist/index.umd.js"></script>
<script>
  const { click } = window.websfx;

  click();
  websfx.success();
</script>
```

Every sound accepts optional overrides:

```ts
import { click } from 'websfx';

click({ volume: 0.5 }); // quieter
click({ pitch: 2 }); // one octave higher
```

## Configure

`configure()` applies partial updates:

```ts
import { beep, configure } from 'websfx';

configure({ volume: 0.8 }); // master volume from 0 to 1 (default 1)
configure({ volume: 0 }); // mute all sounds

beep({ volume: 0.2 }); // 0.2 * master volume
```

It returns the configuration:

```ts
const { volume } = configure();

console.log(volume); // 1
```

## Sounds

<!-- prettier-ignore-start -->

| Group | Sounds |
| --- | --- |
| Input | `click`, `hover`, `focus`, `press`, `release`, `longPress`, `doubleClick`, `drag`, `drop`, `type` |
| State | `select`, `deselect`, `open`, `close` |
| Navigation | `back`, `forward` |
| Feedback | `beep`, `success`, `error`, `warning`, `cancel`, `notification` |
| Clipboard | `copy`, `paste` |
| Misc | `remove`, `reaction` |

<!-- prettier-ignore-end -->

All sounds take optional `SoundOptions`:

```ts
interface SoundOptions {
  volume?: number; // 0 to 1 multiplier (default 1)
  pitch?: number; // frequency multiplier (default 1)
}
```

`beep` also accepts a tone frequency:

```ts
beep({ frequency: 440 });
```

## Notes

- The `AudioContext` is created lazily on the first sound and shared for the lifetime of the session.
- When the browser autoplay policy blocks audio, the context is resumed automatically on the next user gesture that plays a sound.
- Calling a sound in environments without Web Audio (SSR, Node.js) is a safe no-op.

## Release

Release is automated with [Release Please](https://github.com/googleapis/release-please).

## License

[MIT](https://github.com/remarkablemark/websfx/blob/master/LICENSE)
