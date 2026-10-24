/**
 * Options accepted by every sound effect.
 */
export interface SoundOptions {
  /**
   * Volume multiplier for this call from `0` to `1`.
   *
   * Multiplied with the master volume from `configure()`.
   *
   * @defaultValue 1
   */
  volume?: number;

  /**
   * Pitch multiplier applied to all frequencies in the sound.
   *
   * For example, `2` plays the sound one octave higher.
   *
   * @defaultValue 1
   */
  pitch?: number;
}

/**
 * Options accepted by the `beep` sound.
 */
export interface BeepOptions extends SoundOptions {
  /**
   * Frequency of the tone in hertz.
   *
   * @defaultValue 880
   */
  frequency?: number;
}

/**
 * Global sound configuration managed by `configure()`.
 */
export interface Config {
  /**
   * Master volume from `0` to `1`. Set to `0` to mute.
   */
  volume: number;
}
