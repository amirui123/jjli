import * as websfx from './src/index';

const { configure } = websfx;

type SoundName = Exclude<keyof typeof websfx, 'configure'>;

const GROUPS: Record<string, readonly string[]> = {
  Input: [
    'click',
    'hover',
    'focus',
    'press',
    'release',
    'longPress',
    'doubleClick',
    'drag',
    'drop',
    'type',
  ],
  State: ['select', 'deselect', 'open', 'close'],
  Navigation: ['back', 'forward'],
  Feedback: ['beep', 'success', 'error', 'warning', 'cancel', 'notification'],
  Clipboard: ['copy', 'paste'],
  Misc: ['remove', 'reaction'],
};

const isSoundName = (key: keyof typeof websfx): key is SoundName =>
  key !== 'configure' && typeof websfx[key] === 'function';

const soundNames = (Object.keys(websfx) as (keyof typeof websfx)[]).filter(
  isSoundName,
);

const snippetFor = (name: string): string =>
  name === 'beep' ? 'beep({ frequency: 440 })' : `${name}();`;

const cardFor = (name: SoundName): string => {
  const snippet = snippetFor(name);
  const copyText = `import { ${name} } from 'websfx';\n\n${snippet}`;
  return `<article class="rounded-xl border border-zinc-200 bg-white p-4 transition hover:border-emerald-300 dark:border-zinc-800 dark:bg-zinc-900/50 dark:hover:border-emerald-800">
    <button type="button" data-sound="${name}" class="w-full cursor-pointer rounded-lg text-left text-base font-medium text-zinc-800 transition hover:text-emerald-700 focus-visible:outline-2 focus-visible:outline-emerald-500 dark:text-zinc-100 dark:hover:text-emerald-400">${name}</button>
    <div class="mt-3 flex items-center justify-between gap-3">
      <code class="min-w-0 truncate font-mono text-xs text-emerald-700 dark:text-emerald-500">${snippet}</code>
      <button type="button" data-copy="${copyText}" class="shrink-0 cursor-pointer rounded border border-zinc-300 px-2 py-0.5 text-xs text-zinc-500 transition hover:border-zinc-400 hover:text-zinc-700 dark:border-zinc-700 dark:text-zinc-400 dark:hover:border-zinc-500 dark:hover:text-zinc-200">copy</button>
    </div>
  </article>`;
};

const container = document.getElementById('sounds');
if (container === null) throw new Error('websfx playground: missing #sounds');

const render = (): void => {
  const groupOf = new Map<string, string>();
  for (const [group, members] of Object.entries(GROUPS)) {
    for (const member of members) groupOf.set(member, group);
  }

  const buckets = new Map<string, SoundName[]>();
  for (const name of soundNames) {
    const group = groupOf.get(name) ?? 'Other';
    const bucket = buckets.get(group);
    if (bucket === undefined) buckets.set(group, [name]);
    else bucket.push(name);
  }

  const order = [...new Set([...Object.keys(GROUPS), 'Other'])].filter(
    (group) => buckets.has(group),
  );

  container.innerHTML = order
    .map((group) => {
      const items = buckets.get(group) ?? [];
      return `<section aria-label="${group}">
        <h2 class="mb-4 text-xs font-semibold tracking-widest text-zinc-600 uppercase dark:text-zinc-500">${group}</h2>
        <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">${items
          .map(cardFor)
          .join('')}</div>
      </section>`;
    })
    .join('');
};

const players = new Map<string, () => void>(
  soundNames.map((name) => [
    name,
    () => {
      websfx[name]();
    },
  ]),
);

const playSound = (button: Element): void => {
  const name = button.getAttribute('data-sound');
  if (name === null) return;
  const play = players.get(name);
  if (play === undefined) return;
  play();
  button.classList.add('is-playing');
  window.setTimeout(() => {
    button.classList.remove('is-playing');
  }, 300);
};

const writeClipboard = async (text: string): Promise<void> =>
  navigator.clipboard.writeText(text);

const flashLabel = (button: Element, label: string): void => {
  button.textContent = label;
  window.setTimeout(() => {
    button.textContent = 'copy';
  }, 1200);
};

const copySnippet = (button: Element): void => {
  const snippet = button.getAttribute('data-copy');
  if (snippet === null) return;
  void writeClipboard(snippet).then(
    () => {
      players.get('copy')?.();
      flashLabel(button, 'copied');
    },
    () => {
      flashLabel(button, 'not allowed');
    },
  );
};

const volumeInput = document.getElementById('volume');
const muteButton = document.getElementById('mute');
const readout = document.getElementById('readout');
if (
  !(volumeInput instanceof HTMLInputElement) ||
  !(muteButton instanceof HTMLButtonElement) ||
  !(readout instanceof HTMLOutputElement)
) {
  throw new Error('websfx playground: missing controls');
}

let rememberedVolume = 1;

const applyVolume = (volume: number): void => {
  const { volume: applied } = configure({ volume });
  readout.textContent = 'volume: ' + Math.round(applied * 100).toString() + '%';
  volumeInput.value = applied.toString();
  const muted = applied === 0;
  muteButton.textContent = muted ? 'Unmute' : 'Mute';
  muteButton.setAttribute('aria-pressed', String(muted));
};

volumeInput.addEventListener('input', () => {
  const volume = Number(volumeInput.value);
  if (volume > 0) rememberedVolume = volume;
  applyVolume(volume);
});

muteButton.addEventListener('click', () => {
  const { volume } = configure();
  if (volume > 0) {
    rememberedVolume = volume;
    applyVolume(0);
  } else {
    applyVolume(rememberedVolume > 0 ? rememberedVolume : 1);
  }
});

container.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const copyButton = target.closest('[data-copy]');
  if (copyButton !== null) {
    copySnippet(copyButton);
    return;
  }
  const playButton = target.closest('[data-sound]');
  if (playButton !== null) playSound(playButton);
});

render();
applyVolume(configure().volume);
