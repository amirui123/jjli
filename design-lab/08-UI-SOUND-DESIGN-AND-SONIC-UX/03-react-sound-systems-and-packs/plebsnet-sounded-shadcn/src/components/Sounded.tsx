/**
 * Sounded wraps any interactive React element and enhances it with sound feedback.
 * - Uses global sound context from SoundedProvider.
 * - Can override default click/hover sounds using props.
 * - Respects the global muted state from SoundedContext.
 *
 * @prop soundType: 'click' | 'hover' - default sound trigger
 * @prop overrideClick: string        - optional custom click sound
 * @prop overrideHover: string        - optional custom hover sound
 */

'use client';

import React from 'react';
import { useSound } from '../hooks/useSound';
import { useSoundedContext } from '../context/SoundedContext';

// Props accepted by the Sounded component
type SoundedProps = {
  children: React.ReactElement<any>;
  overrideClick?: string;
  overrideHover?: string;
  sound?: boolean;
  clickSound?: boolean;
  hoverSound?: boolean;
};

// Sounded is a higher-order component that adds sound to any element on click or hover
export default function Sounded({
  children,
  overrideClick,
  overrideHover,
  sound,
  clickSound,
  hoverSound,
}: SoundedProps) {
  // Access global sound context including the current theme-based sound set
  const { sounds } = useSoundedContext();

  // Load the appropriate click sound, using override if provided
  const playClick = useSound([overrideClick || sounds.click]);
  // Load the appropriate hover sound, using override if provided
  const playHover = useSound([overrideHover || sounds.hover]);

  // Clone the child element and inject sound-playing handlers while preserving original ones
  return React.cloneElement(children, {
    ...(children.props || {}),
    onClick: (e: any) => {
      if (sound !== false && clickSound !== false) playClick();
      children.props?.onClick?.(e);
    },
    onMouseEnter: (e: any) => {
      if (sound !== false && hoverSound !== false) playHover();
      children.props?.onMouseEnter?.(e);
    },
  });
}