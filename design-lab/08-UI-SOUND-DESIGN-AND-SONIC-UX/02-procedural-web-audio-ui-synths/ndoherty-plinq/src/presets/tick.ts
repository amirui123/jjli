import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: { type: "oscillator", waveform: "sine", frequency: 740 },
      envelope: { attack: 0.007, decay: 0.11 },
      gain: 0.15,
    },
  ],
};

export function tick(options?: PresetOptions): void {
  playSound(config, options);
}
