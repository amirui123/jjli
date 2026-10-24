import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 353,
        frequencyEnd: 218,
      },
      envelope: { attack: 0.011, decay: 0.12 },
      gain: 0.17,
    },
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 245,
        frequencyEnd: 179,
      },
      envelope: { attack: 0.012, decay: 0.22 },
      gain: 0.16,
      delay: 0.1,
    },
  ],
};

export function error(options?: PresetOptions) {
  playSound(config, options);
}
