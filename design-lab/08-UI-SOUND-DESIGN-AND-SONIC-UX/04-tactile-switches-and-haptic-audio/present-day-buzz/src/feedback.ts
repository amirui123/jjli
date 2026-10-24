import {
  getHapticFeedbackEnabled,
  getSoundFeedbackEnabled,
  setHapticFeedbackEnabled,
  setSoundFeedbackEnabled,
  type StorageAdapter,
} from './preferences'
import {
  HAPTIC_PRESET,
  type HapticFeedbackPreset,
  INTERACTION_FEEDBACK_PRESET,
  SOUND_PRESET,
  type SoundFeedbackPreset,
} from './presets'

type HapticPresetConfig = {
  vibrate: number[]
}

type SoundPresetConfig = {
  gain: number
  intensity: number
}

export type TriggerInteractionFeedbackOptions = {
  preset?: (typeof INTERACTION_FEEDBACK_PRESET)[keyof typeof INTERACTION_FEEDBACK_PRESET]
  hapticPreset?: HapticFeedbackPreset
  soundPreset?: SoundFeedbackPreset
  hapticEnabled?: boolean
  soundEnabled?: boolean
  storageAdapter?: StorageAdapter
}

const HAPTIC_CONFIG: Record<HapticFeedbackPreset, HapticPresetConfig> = {
  [HAPTIC_PRESET.BUZZ]: { vibrate: [300] },
  [HAPTIC_PRESET.ERROR]: { vibrate: [50, 50, 50, 50, 50] },
  [HAPTIC_PRESET.HEAVY]: { vibrate: [50] },
  [HAPTIC_PRESET.LIGHT]: { vibrate: [20] },
  [HAPTIC_PRESET.MEDIUM]: { vibrate: [30] },
  [HAPTIC_PRESET.NUDGE]: { vibrate: [80, 100, 50] },
  [HAPTIC_PRESET.RIGID]: { vibrate: [15] },
  [HAPTIC_PRESET.SELECTION]: { vibrate: [12] },
  [HAPTIC_PRESET.SOFT]: { vibrate: [40] },
  [HAPTIC_PRESET.SUCCESS]: { vibrate: [30, 80, 50] },
  [HAPTIC_PRESET.WARNING]: { vibrate: [40, 120, 40] },
}

const SOUND_CONFIG: Record<SoundFeedbackPreset, SoundPresetConfig> = {
  [SOUND_PRESET.BUZZ]: { gain: 0.5, intensity: 1 },
  [SOUND_PRESET.ERROR]: { gain: 0.42, intensity: 0.85 },
  [SOUND_PRESET.HEAVY]: { gain: 0.5, intensity: 1 },
  [SOUND_PRESET.LIGHT]: { gain: 0.28, intensity: 0.35 },
  [SOUND_PRESET.MEDIUM]: { gain: 0.36, intensity: 0.6 },
  [SOUND_PRESET.NUDGE]: { gain: 0.32, intensity: 0.5 },
  [SOUND_PRESET.RIGID]: { gain: 0.44, intensity: 0.85 },
  [SOUND_PRESET.SELECTION]: { gain: 0.25, intensity: 0.2 },
  [SOUND_PRESET.SOFT]: { gain: 0.3, intensity: 0.4 },
  [SOUND_PRESET.SUCCESS]: { gain: 0.4, intensity: 0.7 },
  [SOUND_PRESET.WARNING]: { gain: 0.34, intensity: 0.6 },
}

const IOS_PATTERN = /iPhone|iPad|iPod/i

let iosHapticLabel: HTMLLabelElement | null = null
let iosHapticInput: HTMLInputElement | null = null
let audioContext: AudioContext | null = null

function isClient() {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined'
}

function isIOSDevice() {
  if (!isClient()) {
    return false
  }

  return (
    IOS_PATTERN.test(navigator.userAgent) ||
    (navigator.userAgent.includes('Macintosh') && navigator.maxTouchPoints > 1)
  )
}

function hasVibrationApi() {
  return isClient() && typeof navigator.vibrate === 'function'
}

function shouldPlayHaptics(enabledOverride?: boolean, storageAdapter?: StorageAdapter) {
  const enabled = enabledOverride ?? getHapticFeedbackEnabled(true, storageAdapter)
  return enabled && (hasVibrationApi() || isIOSDevice())
}

function shouldPlaySound(enabledOverride?: boolean, storageAdapter?: StorageAdapter) {
  const enabled = enabledOverride ?? getSoundFeedbackEnabled(true, storageAdapter)
  return enabled
}

function ensureIOSCheckboxSwitch() {
  if (!isIOSDevice() || iosHapticLabel || typeof document === 'undefined') {
    return
  }

  const id = 'buzz-ios-haptic-switch'
  const label = document.createElement('label')
  label.setAttribute('for', id)

  Object.assign(label.style, {
    position: 'fixed',
    top: '-9999px',
    left: '-9999px',
    width: '1px',
    height: '1px',
    opacity: '0',
    zIndex: '-1',
    pointerEvents: 'none',
  } satisfies Partial<CSSStyleDeclaration>)

  const input = document.createElement('input')
  input.type = 'checkbox'
  input.id = id
  input.setAttribute('switch', '')
  input.tabIndex = -1

  Object.assign(input.style, {
    all: 'initial',
    appearance: 'auto',
    width: '100%',
    height: '100%',
  } satisfies Partial<CSSStyleDeclaration>)

  label.appendChild(input)
  document.body.appendChild(label)
  iosHapticLabel = label
  iosHapticInput = input
}

function getAudioContextConstructor():
  | (new (
      contextOptions?: AudioContextOptions,
    ) => AudioContext)
  | null {
  if (!isClient()) {
    return null
  }

  if (typeof AudioContext !== 'undefined') {
    return AudioContext
  }

  const windowWithWebkit = window as Window & {
    webkitAudioContext?: new (
      contextOptions?: AudioContextOptions,
    ) => AudioContext
  }

  return windowWithWebkit.webkitAudioContext ?? null
}

function playClickSound(profile: SoundPresetConfig) {
  if (!audioContext) {
    return
  }

  const intensity = profile.intensity
  const duration = 0.004 + intensity * 0.008
  const sampleRate = audioContext.sampleRate
  const bufferSize = Math.ceil(sampleRate * duration)
  const buffer = audioContext.createBuffer(1, bufferSize, sampleRate)
  const data = buffer.getChannelData(0)
  const decay = 25 + intensity * 50

  for (let i = 0; i < data.length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * Math.exp(-i / decay)
  }

  const filter = audioContext.createBiquadFilter()
  filter.type = 'bandpass'
  filter.frequency.value = 2000 + intensity * 3000
  filter.Q.value = 6 + intensity * 4

  const gain = audioContext.createGain()
  gain.gain.value = profile.gain

  const source = audioContext.createBufferSource()
  source.buffer = buffer

  source.connect(filter)
  filter.connect(gain)
  gain.connect(audioContext.destination)

  source.onended = () => {
    source.disconnect()
    filter.disconnect()
    gain.disconnect()
  }

  source.start()
}

function triggerHaptics(hapticPreset: HapticFeedbackPreset) {
  const config = HAPTIC_CONFIG[hapticPreset]
  if (!config) {
    return
  }

  if (hasVibrationApi()) {
    try {
      navigator.vibrate(config.vibrate)
    } catch {
      // Ignore vibrate errors on unsupported contexts.
    }
  }

  if (isIOSDevice()) {
    const previousActiveElement = document.activeElement
    ensureIOSCheckboxSwitch()
    iosHapticInput?.click()

    // iOS may focus the hidden switch after click(); immediately restore focus.
    if (document.activeElement === iosHapticInput) {
      iosHapticInput?.blur?.()
      if (
        previousActiveElement instanceof HTMLElement &&
        previousActiveElement.isConnected
      ) {
        previousActiveElement.focus({ preventScroll: true })
      }
    }
  }
}

function triggerSound(soundPreset: SoundFeedbackPreset) {
  const config = SOUND_CONFIG[soundPreset]
  if (!config) {
    return
  }

  const AudioContextConstructor = getAudioContextConstructor()
  if (!AudioContextConstructor) {
    return
  }

  if (!audioContext) {
    audioContext = new AudioContextConstructor()
  }

  const play = () => playClickSound(config)
  if (audioContext.state === 'suspended') {
    void audioContext
      .resume()
      .then(play)
      .catch(() => {
        // Ignore resume failures until next user gesture.
      })
    return
  }

  play()
}

export function isHapticFeedbackAvailable() {
  return hasVibrationApi() || isIOSDevice()
}

export function getInteractionFeedbackPreferences(storageAdapter?: StorageAdapter) {
  return {
    hapticEnabled: getHapticFeedbackEnabled(true, storageAdapter),
    soundEnabled: getSoundFeedbackEnabled(true, storageAdapter),
  }
}

export function setInteractionFeedbackPreferences(
  options: {
    hapticEnabled?: boolean
    soundEnabled?: boolean
  },
  storageAdapter?: StorageAdapter
) {
  if (typeof options.hapticEnabled === 'boolean') {
    setHapticFeedbackEnabled(options.hapticEnabled, storageAdapter)
  }

  if (typeof options.soundEnabled === 'boolean') {
    setSoundFeedbackEnabled(options.soundEnabled, storageAdapter)
  }
}

export function triggerInteractionFeedback(
  options: TriggerInteractionFeedbackOptions = {},
) {
  if (!isClient()) {
    return
  }

  const preset = options.preset ?? INTERACTION_FEEDBACK_PRESET.LIGHT
  const hapticPreset = options.hapticPreset ?? preset
  const soundPreset = options.soundPreset ?? preset

  if (shouldPlayHaptics(options.hapticEnabled, options.storageAdapter)) {
    triggerHaptics(hapticPreset)
  }

  if (shouldPlaySound(options.soundEnabled, options.storageAdapter)) {
    triggerSound(soundPreset)
  }
}

export function cancelInteractionFeedback() {
  if (!hasVibrationApi()) {
    return
  }

  navigator.vibrate(0)
}