import React from 'react';
import type { HapticPattern } from './lib/web-haptics/types';

export type ToastTypes = 'normal' | 'action' | 'success' | 'info' | 'warning' | 'error' | 'loading' | 'default';

export type PromiseT<Data = any> = Promise<Data> | (() => Promise<Data>);

export type { HapticPattern } from './lib/web-haptics/types';

export interface PromiseIExtendedResult extends ExternalToast {
  message: React.ReactNode;
}

export type PromiseTExtendedResult<Data = any> =
  | PromiseIExtendedResult
  | ((data: Data) => PromiseIExtendedResult | Promise<PromiseIExtendedResult>);

export type PromiseTResult<Data = any> =
  | string
  | React.ReactNode
  | ((data: Data) => React.ReactNode | string | Promise<React.ReactNode | string>);

export type PromiseExternalToast = Omit<ExternalToast, 'description'>;

export type PromiseData<ToastData = any> = PromiseExternalToast & {
  loading?: string | React.ReactNode;
  success?: PromiseTResult<ToastData> | PromiseTExtendedResult<ToastData>;
  error?: PromiseTResult | PromiseTExtendedResult;
  description?: PromiseTResult;
  finally?: () => void | Promise<void>;
};

export interface ToastClassnames {
  toast?: string;
  title?: string;
  description?: string;
  loader?: string;
  closeButton?: string;
  cancelButton?: string;
  actionButton?: string;
  success?: string;
  error?: string;
  info?: string;
  warning?: string;
  loading?: string;
  default?: string;
  content?: string;
  icon?: string;
}

export interface ToastIcons {
  success?: React.ReactNode;
  info?: React.ReactNode;
  warning?: React.ReactNode;
  error?: React.ReactNode;
  loading?: React.ReactNode;
  close?: React.ReactNode;
}

export interface Action {
  label: React.ReactNode;
  onClick: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  actionButtonStyle?: React.CSSProperties;
}

export interface ToastT {
  id: number | string;
  toasterId?: string;
  /**
   * When `Toaster` system.dedupe.enabled is true, toasts sharing the same
   * `dedupeKey` (within the same toaster scope) will be updated instead of
   * appended as a new toast.
   */
  dedupeKey?: string;
  /**
   * Internal-only: set when the toast is dismissed with a known reason.
   * Powers `onClose` when that feature is enabled in `<Toaster system />`.
   */
  dismissReason?: ToastCloseReason;
  title?: (() => React.ReactNode) | React.ReactNode;
  type?: ToastTypes;
  icon?: React.ReactNode;
  jsx?: React.ReactNode;
  richColors?: boolean;
  invert?: boolean;
  closeButton?: boolean;
  dismissible?: boolean;
  description?: (() => React.ReactNode) | React.ReactNode;
  duration?: number;
  delete?: boolean;
  action?: Action | React.ReactNode;
  cancel?: Action | React.ReactNode;
  onDismiss?: (toast: ToastT) => void;
  /**
   * Called once when the toast is fully closed/dismissed, with a reason.
   * Default: disabled (must be enabled in `<Toaster system />`).
   */
  onClose?: (toast: ToastT, reason: ToastCloseReason) => void;
  onAutoClose?: (toast: ToastT) => void;
  promise?: PromiseT;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  unstyled?: boolean;
  className?: string;
  classNames?: ToastClassnames;
  descriptionClassName?: string;
  position?: Position;
  testId?: string;
  /**
   * When `false`, skip haptic feedback for this toast even if `<Toaster haptics />` is enabled.
   * When omitted, follows the toaster’s global `haptics` setting.
   */
  haptics?: boolean;
  /**
   * Per-toast vibration intensity 0–1 (overrides the toaster-level value).
   * 0.3 ≈ subtle, 0.7 ≈ firm, 1 ≈ maximum.
   */
  hapticIntensity?: number;
  /**
   * Per-toast pattern override: a preset name (`'success'`) or a raw ms array
   * (on/off alternating, e.g. `[80, 40, 80]`). Overrides `hapticPatternMap`.
   */
  hapticPattern?: HapticPatternName | HapticPattern;
}

export function isAction(action: Action | React.ReactNode): action is Action {
  return (action as Action).label !== undefined;
}

export type Position = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top-center' | 'bottom-center';
export interface HeightT {
  height: number;
  toastId: number | string;
  position: Position;
}

interface ToastOptions {
  className?: string;
  closeButton?: boolean;
  descriptionClassName?: string;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  unstyled?: boolean;
  classNames?: ToastClassnames;
  closeButtonAriaLabel?: string;
  toasterId?: string;
}

type Offset =
  | {
      top?: string | number;
      right?: string | number;
      bottom?: string | number;
      left?: string | number;
    }
  | string
  | number;

// Haptic pattern names; must match defaultPatterns keys in lib/web-haptics/patterns.
export type HapticPatternName =
  | 'success'
  | 'error'
  | 'warning'
  | 'light'
  | 'medium'
  | 'heavy'
  | 'soft'
  | 'rigid'
  | 'selection'
  | 'nudge'
  | 'buzz';

/** Visual preset for default toast styling (`<Toaster toastAppearance />`). */
export type ToastAppearance = 'default' | 'subtle' | 'themed';

export interface ToasterProps {
  id?: string;
  invert?: boolean;
  theme?: 'light' | 'dark' | 'system';
  position?: Position;
  hotkey?: string[];
  richColors?: boolean;
  /**
   * Preset: `default` (neutral), `subtle` (soft type tints), `themed` (rich colors + `--toast-*` CSS overrides).
   * Explicit `richColors` overrides the preset default.
   */
  toastAppearance?: ToastAppearance;
  expand?: boolean;
  duration?: number;
  gap?: number;
  visibleToasts?: number;
  closeButton?: boolean;
  toastOptions?: ToastOptions;
  className?: string;
  style?: React.CSSProperties;
  offset?: Offset;
  mobileOffset?: Offset;
  dir?: 'rtl' | 'ltr' | 'auto';
  swipeDirections?: SwipeDirection[];
  icons?: ToastIcons;
  customAriaLabel?: string;
  containerAriaLabel?: string;
  /**
   * Central "system layer" feature flags for production behaviors.
   * Defaults to all features OFF to avoid breaking existing Sonner-like behavior.
   */
  system?: ToastSystemConfig;
  /**
   * Enable haptic feedback when toasts are shown (mobile / supported devices).
   * Uses web-haptics: success/error/warning/light patterns by toast type.
   * @default true
   */
  haptics?: boolean;
  /**
   * Optional map from toast type to haptic pattern. Values are preset names
   * (`'success'`) or raw ms arrays (on/off alternating, e.g. `[50, 30, 50]`).
   * Override which pattern is used for each type (e.g. info -> 'selection').
   */
  hapticPatternMap?: Partial<Record<ToastTypes, HapticPatternName | HapticPattern>>;
  /**
   * When true, play haptic pattern as sound on desktop so you can test without a device
   * (same as web-haptics debug mode). No effect on devices that support vibration.
   * @default false
   */
  hapticsDebug?: boolean;
  /**
   * When true, show the web-haptics toggle switch on screen (same as web-haptics showSwitch).
   * @default false
   */
  hapticsShowSwitch?: boolean;
}

export type SwipeDirection = 'top' | 'right' | 'bottom' | 'left';

export interface ToastSystemConfig {
  /**
   * Opinionated dedupe behavior. When enabled, any toast created with the same
   * `dedupeKey` will map to the same internal toast `id`, so it updates cleanly.
   *
   * Default: disabled.
   */
  dedupe?: {
    enabled?: boolean;
  };

  /**
   * Lifecycle intelligence: provide a dismissal reason to `toast.onClose`.
   * Default: disabled.
   */
  dismissReason?: {
    enabled?: boolean;
  };
}

export interface ToastProps {
  toast: ToastT;
  toasts: ToastT[];
  index: number;
  swipeDirections?: SwipeDirection[];
  expanded: boolean;
  invert: boolean;
  heights: HeightT[];
  setHeights: React.Dispatch<React.SetStateAction<HeightT[]>>;
  removeToast: (toast: ToastT, reason?: ToastCloseReason) => void;
  dismissReasonEnabled: boolean;
  gap?: number;
  position: Position;
  visibleToasts: number;
  expandByDefault: boolean;
  closeButton: boolean;
  interacting: boolean;
  style?: React.CSSProperties;
  cancelButtonStyle?: React.CSSProperties;
  actionButtonStyle?: React.CSSProperties;
  duration?: number;
  className?: string;
  unstyled?: boolean;
  descriptionClassName?: string;
  loadingIcon?: React.ReactNode;
  classNames?: ToastClassnames;
  icons?: ToastIcons;
  closeButtonAriaLabel?: string;
  defaultRichColors?: boolean;
}

export enum SwipeStateTypes {
  SwipedOut = 'SwipedOut',
  SwipedBack = 'SwipedBack',
  NotSwiped = 'NotSwiped',
}

export type Theme = 'light' | 'dark';

export interface ToastToDismiss {
  id: number | string;
  dismiss: boolean;
  reason?: ToastCloseReason;
}

export type ExternalToast = Omit<
  ToastT,
  'id' | 'type' | 'title' | 'jsx' | 'delete' | 'promise' | 'dismissReason'
> & {
  id?: number | string;
  toasterId?: string;
};

export type ToastCloseReason = 'timeout' | 'swipe' | 'close' | 'cancel' | 'action' | 'dismiss';
