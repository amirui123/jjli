import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 477,
        frequencyEnd: 163,
      },
      envelope: { attack: 0.014, decay: 0.22 },
      gain: 0.15,
    },
  ],
};

export function drop(options?: PresetOptions): void {
  playSound(config, options);
}
