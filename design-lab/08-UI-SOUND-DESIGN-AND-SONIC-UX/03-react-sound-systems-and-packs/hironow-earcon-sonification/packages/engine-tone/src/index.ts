export { createToneEngine } from './engine'
export type { ToneEngineOptions } from './engine'
export { catalog, defaultLevelSounds, presetHint, presetIds, presetRate } from './catalog'
// `fromSpec` imports Tone statically; it lives behind the `./from-spec` subpath so the
// main entry stays Tone-free (spec §4.1). `{ kind: 'synth' }` specs reach it lazily.
export type { PresetId, PresetKind } from './catalog'
export type {
  ContinuousFactory,
  ContinuousPresetId,
  OneShotFactory,
  OneShotOptions,
  OneShotPresetId,
  SoundContext,
} from './presets'
