const STORAGE_PREFIX = 'BUZZ_'
const MOBILE_USER_AGENT_PATTERN =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i

export interface StorageAdapter {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

export class LocalStorageAdapter implements StorageAdapter {
  getItem(key: string): string | null {
    if (typeof window === 'undefined') {
      return null
    }
    try {
      return window.localStorage.getItem(key)
    } catch {
      return null
    }
  }

  setItem(key: string, value: string): void {
    if (typeof window === 'undefined') {
      return
    }
    try {
      window.localStorage.setItem(key, value)
    } catch {
      // Ignore storage write failures
    }
  }
}

const defaultStorageAdapter = new LocalStorageAdapter()

function getBooleanPreference(
  key: string, 
  fallback: boolean, 
  storageAdapter: StorageAdapter = defaultStorageAdapter
): boolean {
  try {
    const value = storageAdapter.getItem(key)

    if (value === 'true') {
      return true
    }

    if (value === 'false') {
      return false
    }

    return fallback
  } catch {
    return fallback
  }
}

function setBooleanPreference(
  key: string, 
  value: boolean, 
  storageAdapter: StorageAdapter = defaultStorageAdapter
) {
  try {
    storageAdapter.setItem(key, value ? 'true' : 'false')
  } catch {
    // Ignore storage write failures
  }
}

export function isLikelyMobileDevice() {
  if (typeof navigator === 'undefined') {
    return false
  }

  if (MOBILE_USER_AGENT_PATTERN.test(navigator.userAgent)) {
    return true
  }

  return navigator.maxTouchPoints > 1
}

export function getHapticFeedbackEnabled(
  fallback = true, 
  storageAdapter?: StorageAdapter
): boolean {
  return getBooleanPreference(
    `${STORAGE_PREFIX}HAPTIC_FEEDBACK_ENABLED`, 
    fallback, 
    storageAdapter
  )
}

export function setHapticFeedbackEnabled(
  enabled: boolean, 
  storageAdapter?: StorageAdapter
) {
  setBooleanPreference(
    `${STORAGE_PREFIX}HAPTIC_FEEDBACK_ENABLED`, 
    enabled, 
    storageAdapter
  )
}

export function getSoundFeedbackEnabled(
  fallback = true, 
  storageAdapter?: StorageAdapter
): boolean {
  return getBooleanPreference(
    `${STORAGE_PREFIX}SOUND_FEEDBACK_ENABLED`, 
    fallback, 
    storageAdapter
  )
}

export function setSoundFeedbackEnabled(
  enabled: boolean, 
  storageAdapter?: StorageAdapter
) {
  setBooleanPreference(
    `${STORAGE_PREFIX}SOUND_FEEDBACK_ENABLED`, 
    enabled, 
    storageAdapter
  )
}