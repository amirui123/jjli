import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: {
        type: "oscillator",
        waveform: "sine",
        frequency: 523,
        frequencyEnd: 654,
      },
      envelope: { attack: 0.007, decay: 0.11 },
      gain: 0.13,
      filter: { type: "lowpass", frequency: 393, Q: 5.5 },
    },
  ],
};

export function click(options?: PresetOptions) {
  playSound(config, options);
}
