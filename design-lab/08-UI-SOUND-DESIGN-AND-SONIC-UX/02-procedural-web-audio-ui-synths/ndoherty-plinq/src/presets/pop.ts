import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 423,
        frequencyEnd: 311,
      },
      envelope: { attack: 0.001, decay: 0.21 },
      gain: 0.12,
    },
  ],
};

export function pop(options?: PresetOptions) {
  playSound(config, options);
}
