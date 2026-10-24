import type { WindFieldConfig } from './types';

export class WindVelocityEvaluator {
  static evaluate(config: WindFieldConfig, position: [number, number, number], time: number): [number, number, number] {
    const gust = Math.sin(time * config.gustFrequency + position[0] * 0.5 + position[2] * 0.3) * config.gustAmplitude;
    return [
      config.baseVelocity[0] + gust,
      config.baseVelocity[1] + gust * 0.2,
      config.baseVelocity[2] + gust * 0.4,
    ];
  }
}
