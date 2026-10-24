import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 469,
        frequencyEnd: 459,
      },
      envelope: { attack: 0.006, decay: 0.09 },
      gain: 0.07,
    },
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 608,
        frequencyEnd: 591,
      },
      envelope: { attack: 0.001, decay: 0.13 },
      gain: 0.1,
      delay: 0.06,
    },
  ],
};

export function toggle(options?: PresetOptions): void {
  playSound(config, options);
}
