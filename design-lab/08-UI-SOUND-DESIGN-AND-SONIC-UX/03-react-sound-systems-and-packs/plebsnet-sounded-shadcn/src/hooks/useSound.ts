/**
 * useSound - A React hook to play audio with support for volume, stereo pan, shuffle, lazy loading,
 * and one-shot context creation. Respects global mute state from SoundedContext.
 *
 * Supports loading multiple sound files and randomly selecting one on playback if shuffle is enabled.
 * Intended for UI interaction sound feedback.
 */

'use client';

// Configuration options for the useSound hook
import { useSoundedContext } from '../context/SoundedContext';
import { useEffect, useRef } from 'react';

type UseSoundOptions = {
  volume?: number;     // 0.0 - 1.0
  pan?: number;        // -1 (left) to 1 (right)
  lazyLoad?: boolean;  // load only on first interaction
  shuffle?: boolean;   // randomize which sound plays
  oneShot?: boolean;   // create new AudioContext per play
  onLoadError?: (url: string, error: unknown) => void; // optional callback for handling load errors
  fallbackToSilence?: boolean; // default true, false to throw if all sounds fail
};

// useSound returns a function that plays the loaded sound(s) based on given options
export function useSound(
  urls: string[],
  options: UseSoundOptions = {}
): () => void {
  // Extract sound playback options with defaults
  const {
    volume = 1.0,
    pan = 0,
    lazyLoad = false,
    shuffle = false,
    oneShot = false,
  } = options;

  const { muted } = useSoundedContext();

  // AudioContext and buffer references
  const contextRef = useRef<AudioContext | null>(null);
  const buffersRef = useRef<AudioBuffer[]>([]);
  const hasLoaded = useRef(false);

  // Load and decode all sound files into audio buffers
  const loadSounds = async () => {
    if (hasLoaded.current) return;
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    contextRef.current = context;

    const decoded = await Promise.all(
      urls.map(async (url) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error(`Failed to load sound: ${url}`);
          const arrayBuffer = await res.arrayBuffer();
          return await context.decodeAudioData(arrayBuffer);
        } catch (err) {
          console.warn(`[Sounded] Unable to load or decode sound at ${url}`, err);
          options.onLoadError?.(url, err);
          return null;
        }
      })
    );

    buffersRef.current = decoded.filter(Boolean) as AudioBuffer[];
    if (buffersRef.current.length === 0) {
      if (options.fallbackToSilence !== false) {
        console.warn('[Sounded] No valid sounds loaded. Using silent fallback.');
        const silence = context.createBuffer(1, 1, context.sampleRate);
        buffersRef.current = [silence];
      } else {
        throw new Error('[Sounded] No valid sounds loaded and fallbackToSilence is false.');
      }
    }
    hasLoaded.current = true;
  };

  // Preload sounds unless lazyLoad is true, and cleanup context on unmount
  useEffect(() => {
    if (!lazyLoad) loadSounds();
    return () => {
      contextRef.current?.close();
      contextRef.current = null;
      buffersRef.current = [];
    };
  }, []);

  // Playback function triggered by UI events
  const play = () => {
    // Skip playback if global mute is enabled
    if (muted) return;
    if (!hasLoaded.current && lazyLoad) {
      loadSounds().then(() => play());
      return;
    }

    // Use a fresh AudioContext or reuse existing one
    const context = oneShot
      ? new (window.AudioContext || (window as any).webkitAudioContext)()
      : contextRef.current;

    if (!context || buffersRef.current.length === 0) return;

    // Randomly select a buffer if shuffle is enabled
    const index = shuffle
      ? Math.floor(Math.random() * buffersRef.current.length)
      : 0;

    // Setup and connect audio nodes
    const source = context.createBufferSource();
    source.buffer = buffersRef.current[index];

    const gainNode = context.createGain();
    gainNode.gain.value = volume;

    const pannerNode = context.createStereoPanner();
    pannerNode.pan.value = pan;

    source.connect(gainNode).connect(pannerNode).connect(context.destination);
    source.start();

    // Close the one-shot context after playback ends
    if (oneShot) {
      source.onended = () => context.close();
    }
  };

  return play;
}