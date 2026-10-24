import { playSound } from "../engine";
import type { SoundConfig, PresetOptions } from "../types";

const config: SoundConfig = {
  layers: [
    {
      source: { type: "oscillator", waveform: "sine", frequency: 508 },
      envelope: { attack: 0.002, decay: 0.25 },
      gain: 0.15,
    },
    {
      source: { type: "oscillator", waveform: "sine", frequency: 663 },
      envelope: { attack: 0.002, decay: 0.22 },
      gain: 0.14,
      delay: 0.04,
    },
    {
      source: { type: "oscillator", waveform: "sine", frequency: 794 },
      envelope: { attack: 0.003, decay: 0.4 },
      gain: 0.15,
      delay: 0.1,
    },
  ],
};

export function success(options?: PresetOptions): void {
  playSound(config, options);
}
