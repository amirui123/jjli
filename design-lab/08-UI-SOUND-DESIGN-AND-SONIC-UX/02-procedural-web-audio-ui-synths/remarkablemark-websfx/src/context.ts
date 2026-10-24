import type { Config } from './types';
import { clamp } from './utils';

/**
 * The shared audio graph that all sounds play through.
 */
interface AudioIO {
  context: AudioContext;
  master: GainNode;
}

let audio: AudioIO | undefined;
let config: Config = { volume: 1 };

/**
 * Returns the shared audio graph, creating the `AudioContext` lazily on
 * first use.
 *
 * @returns The audio graph, or `undefined` when Web Audio is unavailable
 * (for example during server-side rendering) or when the master volume
 * is `0`.
 */
export function getAudio(): AudioIO | undefined {
  if (config.volume <= 0) return undefined;
  const io = ensureAudio();
  if (io?.context.state === 'suspended') {
    void io.context.resume().catch(() => undefined);
  }
  return io;
}

/**
 * Reads or updates the global sound configuration.
 *
 * Called with a partial configuration it applies the update first. Always
 * returns the current configuration. Set `volume` to `0` to mute.
 *
 * @example
 * ```ts
 * configure({ volume: 0.5 });
 * configure({ volume: 0 }); // mute
 * const { volume } = configure();
 * ```
 *
 * @param options - Partial configuration to merge.
 * @returns The current configuration.
 */
export function configure(options?: Partial<Config>): Readonly<Config> {
  if (options?.volume !== undefined) {
    config = { volume: clamp(options.volume) };
    if (audio) {
      audio.master.gain.value = config.volume;
    }
  }
  return { ...config };
}

/**
 * Creates the `AudioContext` and master gain node on first use.
 *
 * @returns The audio graph, or `undefined` when Web Audio is unavailable.
 */
function ensureAudio(): AudioIO | undefined {
  if (audio) return audio;
  if (typeof AudioContext === 'undefined') return undefined;
  let context: AudioContext;
  try {
    context = new AudioContext();
  } catch {
    return undefined;
  }
  const master = context.createGain();
  master.gain.value = config.volume;
  master.connect(context.destination);
  audio = { context, master };
  return audio;
}

/**
 * Clears the memoized `AudioContext` and restores the default
 * configuration.
 *
 * @internal
 */
export function reset(): void {
  audio = undefined;
  config = { volume: 1 };
}
