import {
  cancelInteractionFeedback,
  getInteractionFeedbackPreferences,
  HAPTIC_PRESET,
  isHapticFeedbackAvailable,
  isLikelyMobileDevice,
  setInteractionFeedbackPreferences,
  triggerInteractionFeedback,
} from '../src/index'
import type { HapticFeedbackPreset, SoundFeedbackPreset } from '../src/presets'

const PRESET_LIST: readonly HapticFeedbackPreset[] = [
  HAPTIC_PRESET.LIGHT,
  HAPTIC_PRESET.MEDIUM,
  HAPTIC_PRESET.HEAVY,
  HAPTIC_PRESET.SOFT,
  HAPTIC_PRESET.RIGID,
  HAPTIC_PRESET.SELECTION,
  HAPTIC_PRESET.NUDGE,
  HAPTIC_PRESET.BUZZ,
  HAPTIC_PRESET.SUCCESS,
  HAPTIC_PRESET.WARNING,
  HAPTIC_PRESET.ERROR,
]

type Mode = 'both' | 'haptic' | 'sound'

function runPreset(
  preset: HapticFeedbackPreset,
  mode: Mode,
) {
  if (mode === 'both') {
    triggerInteractionFeedback({ preset })
    return
  }
  if (mode === 'haptic') {
    triggerInteractionFeedback({
      preset,
      hapticEnabled: true,
      soundEnabled: false,
      hapticPreset: preset,
      soundPreset: preset as SoundFeedbackPreset,
    })
    return
  }
  triggerInteractionFeedback({
    preset,
    hapticEnabled: false,
    soundEnabled: true,
    hapticPreset: preset,
    soundPreset: preset as SoundFeedbackPreset,
  })
}

function formatLabel(preset: HapticFeedbackPreset) {
  return preset.replace(/^\w/, (c) => c.toUpperCase())
}

function main() {
  const mobileBar = document.getElementById('mobile-warning')!
  const mobileDismiss = document.getElementById('mobile-warning-dismiss')!
  const hapticAvailableEl = document.getElementById('haptic-available')!
  const presetRoot = document.getElementById('preset-list')!
  const cancelBtn = document.getElementById('btn-cancel')!
  const hapticToggle = document.getElementById('toggle-haptic') as HTMLInputElement
  const soundToggle = document.getElementById('toggle-sound') as HTMLInputElement

  if (isLikelyMobileDevice()) {
    mobileBar.hidden = false
  }

  const dismissed = sessionStorage.getItem('buzz-playground-dismiss-mobile') === '1'
  if (dismissed) {
    mobileBar.hidden = true
  }

  mobileDismiss.addEventListener('click', () => {
    sessionStorage.setItem('buzz-playground-dismiss-mobile', '1')
    mobileBar.hidden = true
  })

  hapticAvailableEl.textContent = isHapticFeedbackAvailable() ? 'Yes' : 'No'

  const syncToggles = () => {
    const p = getInteractionFeedbackPreferences()
    hapticToggle.checked = p.hapticEnabled
    soundToggle.checked = p.soundEnabled
  }
  syncToggles()

  hapticToggle.addEventListener('change', () => {
    setInteractionFeedbackPreferences({ hapticEnabled: hapticToggle.checked })
    syncToggles()
  })
  soundToggle.addEventListener('change', () => {
    setInteractionFeedbackPreferences({ soundEnabled: soundToggle.checked })
    syncToggles()
  })

  for (const preset of PRESET_LIST) {
    const row = document.createElement('div')
    row.className = 'preset-row'
    const title = document.createElement('div')
    title.className = 'preset-title'
    title.textContent = formatLabel(preset)
    row.appendChild(title)

    const actions = document.createElement('div')
    actions.className = 'preset-actions'

    const addBtn = (label: string, mode: Mode) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.textContent = label
      b.addEventListener('click', () => runPreset(preset, mode))
      actions.appendChild(b)
    }

    addBtn('Both', 'both')
    addBtn('Haptic', 'haptic')
    addBtn('Sound', 'sound')
    row.appendChild(actions)
    presetRoot.appendChild(row)
  }

  cancelBtn.addEventListener('click', () => {
    cancelInteractionFeedback()
  })
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', main)
} else {
  void main()
}
