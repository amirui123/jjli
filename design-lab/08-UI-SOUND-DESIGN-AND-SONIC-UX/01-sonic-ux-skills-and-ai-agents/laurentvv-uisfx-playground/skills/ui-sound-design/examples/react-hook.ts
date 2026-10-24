import React, { createContext, useContext, useEffect, useRef, useState, useTransition } from 'react'
import { createUISFX, type CueName, type PackName, type PlayingSFX, type UISFXPlayer } from 'uisfx'

interface SoundContextValue {
  play: (cue: CueName) => PlayingSFX | null
  startLoop: (cue: CueName) => PlayingSFX | null
  stopLoop: (cue: CueName) => void
  setPack: (pack: PackName) => void
  currentPack: PackName
  setVolume: (volume: number) => void
  volume: number
  setEnabled: (enabled: boolean) => void
  isEnabled: boolean
}

const SoundContext = createContext<SoundContextValue | null>(null)

export const SoundProvider: React.FC<{ children: React.ReactNode; defaultPack?: PackName }> = ({
  children,
  defaultPack = 'minimal',
}) => {
  const playerRef = useRef<UISFXPlayer | null>(null)
  const activeLoopsRef = useRef<Map<string, PlayingSFX>>(new Map())

  const [currentPack, setCurrentPackState] = useState<PackName>(() => {
    try {
      return (localStorage.getItem('uisfx:pack') as PackName) || defaultPack
    } catch {
      return defaultPack
    }
  })

  const [volume, setVolumeState] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('uisfx:volume')
      return saved ? parseFloat(saved) : 0.3
    } catch {
      return 0.3
    }
  })

  const [isEnabled, setIsEnabledState] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('uisfx:enabled')
      return saved !== null ? JSON.parse(saved) : true
    } catch {
      return true
    }
  })

  // Initialize client-side player singleton
  useEffect(() => {
    if (typeof window === 'undefined') return

    const player = createUISFX({
      pack: currentPack,
      volume,
      enabled: isEnabled,
    })
    playerRef.current = player

    // First user gesture unlocks the Web Audio AudioContext
    const handleGesture = async () => {
      await player.unlock()
    }

    window.addEventListener('pointerdown', handleGesture, { once: true })
    window.addEventListener('keydown', handleGesture, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handleGesture)
      window.removeEventListener('keydown', handleGesture)
      player.destroy()
    }
  }, [])

  const play = (cue: CueName) => {
    return playerRef.current?.play(cue) ?? null
  }

  const startLoop = (cue: CueName) => {
    const existing = activeLoopsRef.current.get(cue)
    if (existing) return existing

    const handle = playerRef.current?.play(cue)
    if (handle) {
      activeLoopsRef.current.set(cue, handle)
    }
    return handle ?? null
  }

  const stopLoop = (cue: CueName) => {
    const handle = activeLoopsRef.current.get(cue)
    if (handle) {
      handle.stop()
      activeLoopsRef.current.delete(cue)
    }
  }

  const setPack = (pack: PackName) => {
    setCurrentPackState(pack)
    playerRef.current?.setPack(pack)
    try {
      localStorage.setItem('uisfx:pack', pack)
    } catch {}
  }

  const setVolume = (newVol: number) => {
    setVolumeState(newVol)
    playerRef.current?.setVolume(newVol)
    try {
      localStorage.setItem('uisfx:volume', newVol.toString())
    } catch {}
  }

  const setEnabled = (enabled: boolean) => {
    setIsEnabledState(enabled)
    if (!enabled) {
      // Clear all loops immediately on mute
      activeLoopsRef.current.forEach((h) => h.stop())
      activeLoopsRef.current.clear()
    }
    playerRef.current?.setEnabled(enabled)
    try {
      localStorage.setItem('uisfx:enabled', JSON.stringify(enabled))
    } catch {}
  }

  return (
    <SoundContext.Provider
      value={{
        play,
        startLoop,
        stopLoop,
        setPack,
        currentPack,
        setVolume,
        volume,
        setEnabled,
        isEnabled,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundEffect() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSoundEffect must be used within a SoundProvider')
  }
  return context
}
