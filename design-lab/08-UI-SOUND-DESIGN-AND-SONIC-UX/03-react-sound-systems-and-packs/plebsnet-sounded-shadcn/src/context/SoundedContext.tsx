/**
 * SoundedContext provides global audio configuration for UI sound feedback.
 *
 * Features:
 * - Theme-based sound packs (light/dark)
 * - Global mute toggle with localStorage persistence
 * - Custom hook to access context safely
 */

'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect
} from 'react';

// Define sound URLs for each supported theme
const soundMap = {
  light: {
    hover: '/sounds/hover_light.mp3',
    click: '/sounds/click_light.mp3',
  },
  dark: {
    hover: '/sounds/hover_dark.mp3',
    click: '/sounds/click_dark.mp3',
  },
} as const;

// Shape of the context value provided to consumers
type SoundedContextType = {
  theme: 'light' | 'dark';
  muted: boolean;
  toggleMute: () => void;
  sounds: {
    click: string;
    hover: string;
    drag?: string;
    error?: string;
    success?: string;
  };
};

// Create the context with a nullable default
const SoundedContext = createContext<SoundedContextType | null>(null);

// Hook to safely consume the context with error protection
export const useSoundedContext = () => {
  const ctx = useContext(SoundedContext);
  if (!ctx) throw new Error('useSoundedContext must be used inside SoundedProvider');
  return ctx;
};

// Provider component to supply sound context to the React tree
export const SoundedProvider = ({
  children,
  theme = 'light',
}: {
  children: React.ReactNode;
  theme?: 'light' | 'dark';
}) => {
  // State for whether sounds are globally muted
  const [muted, setMuted] = useState(false);

  // Load initial mute setting from localStorage
  useEffect(() => {
    const storedMute = localStorage.getItem('plebs-muted');
    if (storedMute !== null) setMuted(storedMute === 'true');
  }, []);

  // Persist mute state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('plebs-muted', String(muted));
  }, [muted]);

  // Toggle mute state function for consumers
  const toggleMute = useCallback(() => setMuted((prev) => !prev), []);

  // Select sound pack based on the current theme
  const sounds = soundMap[theme];

  return (
    <SoundedContext.Provider value={{ theme, sounds, muted, toggleMute }}>
      {children}
    </SoundedContext.Provider>
  );
};