'use client';

import React from 'react';
import ReactDOM from 'react-dom';

import { CloseIcon, getAsset, Loader } from './assets';
import { useIsDocumentHidden } from './hooks';
import { toast, ToastState } from './state';
import { resolveToastAppearance } from './toast-appearance';
import { sanitizeClassNames, sanitizeToasterId } from './security';
import './styles.css';
import {
  defaultPatterns,
  isHapticsSupported,
  triggerHaptic,
  useHapticsSupported,
  WebHaptics,
  type TriggerHapticOptions,
} from './haptics';
import {
  isAction,
  SwipeDirection,
  type ExternalToast,
  type HeightT,
  type HapticPattern,
  type HapticPatternName,
  type ToasterProps,
  type ToastProps,
  type ToastT,
  type ToastCloseReason,
  type ToastSystemConfig,
  type ToastToDismiss,
  type ToastTypes,
} from './types';

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3;

// Viewport padding
const VIEWPORT_OFFSET = '24px';

// Mobile viewport padding
const MOBILE_VIEWPORT_OFFSET = '16px';

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000;

// Default toast width
const TOAST_WIDTH = 356;

// Default gap between toasts
const GAP = 14;

// Threshold to dismiss a toast
const SWIPE_THRESHOLD = 45;

// Equal to exit animation duration
const TIME_BEFORE_UNMOUNT = 200;

function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

function getDefaultSwipeDirections(position: string): Array<SwipeDirection> {
  const [y, x] = position.split('-');
  const directions: Array<SwipeDirection> = [];

  if (y) {
    directions.push(y as SwipeDirection);
  }

  if (x) {
    directions.push(x as SwipeDirection);
  }

  return directions;
}

const Toast = (props: ToastProps) => {
  const {
    invert: ToasterInvert,
    toast,
    unstyled,
    interacting,
    setHeights,
    visibleToasts,
    heights,
    index,
    toasts,
    expanded,
    removeToast,
    dismissReasonEnabled,
    defaultRichColors,
    closeButton: closeButtonFromToaster,
    style,
    cancelButtonStyle,
    actionButtonStyle,
    className = '',
    descriptionClassName = '',
    duration: durationFromToaster,
    position,
    gap,
    expandByDefault,
    classNames,
    icons,
    closeButtonAriaLabel = 'Close toast',
  } = props;
  const [swipeDirection, setSwipeDirection] = React.useState<'x' | 'y' | null>(null);
  const [swipeOutDirection, setSwipeOutDirection] = React.useState<'left' | 'right' | 'up' | 'down' | null>(null);
  const [mounted, setMounted] = React.useState(false);
  const [removed, setRemoved] = React.useState(false);
  const [swiping, setSwiping] = React.useState(false);
  const [swipeOut, setSwipeOut] = React.useState(false);
  const [isSwiped, setIsSwiped] = React.useState(false);
  const [offsetBeforeRemove, setOffsetBeforeRemove] = React.useState(0);
  const [initialHeight, setInitialHeight] = React.useState(0);
  const remainingTime = React.useRef(toast.duration || durationFromToaster || TOAST_LIFETIME);
  const dragStartTime = React.useRef<Date | null>(null);
  const toastRef = React.useRef<HTMLLIElement>(null);
  const isFront = index === 0;
  const isVisible = index + 1 <= visibleToasts;
  const toastType = toast.type;
  const dismissible = toast.dismissible !== false;
  const toastClassname = toast.className || '';
  const toastDescriptionClassname = toast.descriptionClassName || '';
  // Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
  const heightIndex = React.useMemo(
    () => Math.max(0, heights.findIndex((height) => height.toastId === toast.id)),
    [heights, toast.id],
  );
  const closeButton = React.useMemo(
    () => toast.closeButton ?? closeButtonFromToaster,
    [toast.closeButton, closeButtonFromToaster],
  );
  const duration = React.useMemo(
    () => toast.duration || durationFromToaster || TOAST_LIFETIME,
    [toast.duration, durationFromToaster],
  );
  const closeTimerStartTimeRef = React.useRef(0);
  const offset = React.useRef(0);
  const lastCloseTimerStartTimeRef = React.useRef(0);
  const pointerStartRef = React.useRef<{ x: number; y: number } | null>(null);
  const didFireOnCloseRef = React.useRef(false);
  const [y, x] = position.split('-');
  const toastsHeightBefore = React.useMemo(() => {
    return heights.reduce((prev, curr, reducerIndex) => {
      // Calculate offset up until current toast
      if (reducerIndex >= heightIndex) {
        return prev;
      }

      return prev + curr.height;
    }, 0);
  }, [heights, heightIndex]);
  const isDocumentHidden = useIsDocumentHidden();

  const invert = toast.invert || ToasterInvert;
  const disabled = toastType === 'loading';

  const offsetValue = React.useMemo(
    () => heightIndex * gap + toastsHeightBefore,
    [heightIndex, toastsHeightBefore],
  );
  offset.current = offsetValue;

  React.useEffect(() => {
    remainingTime.current = duration;
  }, [duration]);

  React.useEffect(() => {
    // Trigger enter animation without using CSS animation
    setMounted(true);
  }, []);

  React.useEffect(() => {
    const toastNode = toastRef.current;
    if (toastNode) {
      const height = toastNode.getBoundingClientRect().height;
      // Add toast height to heights array after the toast is mounted
      setInitialHeight(height);
      setHeights((h) => [{ toastId: toast.id, height, position: toast.position }, ...h]);
      return () => setHeights((h) => h.filter((height) => height.toastId !== toast.id));
    }
  }, [setHeights, toast.id]);

  // Reset "onClose" bookkeeping whenever a new toast is mounted.
  React.useEffect(() => {
    didFireOnCloseRef.current = false;
  }, [toast.id]);

  React.useLayoutEffect(() => {
    // Keep height up to date with the content in case it updates
    if (!mounted) return;
    const toastNode = toastRef.current;
    const originalHeight = toastNode.style.height;
    toastNode.style.height = 'auto';
    const newHeight = toastNode.getBoundingClientRect().height;
    toastNode.style.height = originalHeight;

    setInitialHeight(newHeight);

    setHeights((heights) => {
      const alreadyExists = heights.find((height) => height.toastId === toast.id);
      if (!alreadyExists) {
        return [{ toastId: toast.id, height: newHeight, position: toast.position }, ...heights];
      } else {
        return heights.map((height) => (height.toastId === toast.id ? { ...height, height: newHeight } : height));
      }
    });
  }, [mounted, toast.title, toast.description, setHeights, toast.id, toast.jsx, toast.action, toast.cancel]);

  const deleteToast = React.useCallback(
    (reason?: ToastCloseReason) => {
      // Save the offset for the exit swipe animation
      setRemoved(true);
      setOffsetBeforeRemove(offset.current);
      setHeights((h) => h.filter((height) => height.toastId !== toast.id));

      setTimeout(() => {
        removeToast(toast, reason);
      }, TIME_BEFORE_UNMOUNT);
    },
    [toast, removeToast, setHeights, offset],
  );

  React.useEffect(() => {
    if ((toast.promise && toastType === 'loading') || toast.duration === Infinity || toast.type === 'loading') return;
    let timeoutId: NodeJS.Timeout;

    // Pause the timer on each hover
    const pauseTimer = () => {
      if (lastCloseTimerStartTimeRef.current < closeTimerStartTimeRef.current) {
        // Get the elapsed time since the timer started
        const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.current;

        remainingTime.current = remainingTime.current - elapsedTime;
      }

      lastCloseTimerStartTimeRef.current = new Date().getTime();
    };

    const startTimer = () => {
      // setTimeout(, Infinity) behaves as if the delay is 0.
      // As a result, the toast would be closed immediately, giving the appearance that it was never rendered.
      // See: https://github.com/denysdovhan/wtfjs?tab=readme-ov-file#an-infinite-timeout
      if (remainingTime.current === Infinity) return;

      closeTimerStartTimeRef.current = new Date().getTime();

      // Let the toast know it has started
      timeoutId = setTimeout(() => {
        toast.onAutoClose?.(toast);
        deleteToast('timeout');
      }, remainingTime.current);
    };

    if (expanded || interacting || isDocumentHidden) {
      pauseTimer();
    } else {
      startTimer();
    }

    return () => clearTimeout(timeoutId);
  }, [expanded, interacting, toast, toastType, isDocumentHidden, deleteToast]);

  React.useEffect(() => {
    if (toast.delete) {
      const reason = toast.dismissReason ?? 'dismiss';
      deleteToast(reason);
      toast.onDismiss?.(toast);
      if (dismissReasonEnabled && !didFireOnCloseRef.current) {
        didFireOnCloseRef.current = true;
        toast.onClose?.(toast, reason);
      }
    }
  }, [deleteToast, toast.delete, toast.dismissReason, toast.onDismiss, toast.onClose, dismissReasonEnabled]);

  function getLoadingIcon() {
    if (icons?.loading) {
      return (
        <div
          className={cn(classNames?.loader, toast?.classNames?.loader, 'sonner-loader')}
          data-visible={toastType === 'loading'}
        >
          {icons.loading}
        </div>
      );
    }

    return <Loader className={cn(classNames?.loader, toast?.classNames?.loader)} visible={toastType === 'loading'} />;
  }

  const icon = toast.icon || icons?.[toastType] || getAsset(toastType);

  return (
    <li
      tabIndex={0}
      ref={toastRef}
      className={cn(
        className,
        toastClassname,
        classNames?.toast,
        toast?.classNames?.toast,
        classNames?.default,
        classNames?.[toastType],
        toast?.classNames?.[toastType],
      )}
      data-sonner-toast=""
      data-rich-colors={toast.richColors ?? defaultRichColors}
      data-styled={!Boolean(toast.jsx || toast.unstyled || unstyled)}
      data-mounted={mounted}
      data-promise={Boolean(toast.promise)}
      data-swiped={isSwiped}
      data-removed={removed}
      data-visible={isVisible}
      data-y-position={y}
      data-x-position={x}
      data-index={index}
      data-front={isFront}
      data-swiping={swiping}
      data-dismissible={dismissible}
      data-type={toastType}
      data-invert={invert}
      data-swipe-out={swipeOut}
      data-swipe-direction={swipeOutDirection}
      data-expanded={Boolean(expanded || (expandByDefault && mounted))}
      data-testid={toast.testId}
      style={
        {
          '--index': index,
          '--toasts-before': index,
          '--z-index': toasts.length - index,
          '--offset': `${removed ? offsetBeforeRemove : offset.current}px`,
          '--initial-height': expandByDefault ? 'auto' : `${initialHeight}px`,
          ...style,
          ...toast.style,
        } as React.CSSProperties
      }
      onDragEnd={() => {
        setSwiping(false);
        setSwipeDirection(null);
        pointerStartRef.current = null;
      }}
      onPointerDown={(event) => {
        if (event.button === 2) return; // Return early on right click
        if (disabled || !dismissible) return;
        dragStartTime.current = new Date();
        setOffsetBeforeRemove(offset.current);
        // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
        (event.target as HTMLElement).setPointerCapture(event.pointerId);
        if ((event.target as HTMLElement).tagName === 'BUTTON') return;
        setSwiping(true);
        pointerStartRef.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={() => {
        if (swipeOut || !dismissible) return;

        pointerStartRef.current = null;
        const swipeAmountX = Number(
          toastRef.current?.style.getPropertyValue('--swipe-amount-x').replace('px', '') || 0,
        );
        const swipeAmountY = Number(
          toastRef.current?.style.getPropertyValue('--swipe-amount-y').replace('px', '') || 0,
        );
        const timeTaken = new Date().getTime() - dragStartTime.current?.getTime();

        const swipeAmount = swipeDirection === 'x' ? swipeAmountX : swipeAmountY;
        const velocity = Math.abs(swipeAmount) / timeTaken;

        if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
          setOffsetBeforeRemove(offset.current);

          toast.onDismiss?.(toast);

          if (swipeDirection === 'x') {
            setSwipeOutDirection(swipeAmountX > 0 ? 'right' : 'left');
          } else {
            setSwipeOutDirection(swipeAmountY > 0 ? 'down' : 'up');
          }

          deleteToast('swipe');
          setSwipeOut(true);

          return;
        } else {
          toastRef.current?.style.setProperty('--swipe-amount-x', `0px`);
          toastRef.current?.style.setProperty('--swipe-amount-y', `0px`);
        }
        setIsSwiped(false);
        setSwiping(false);
        setSwipeDirection(null);
      }}
      onPointerMove={(event) => {
        if (!pointerStartRef.current || !dismissible) return;

        const isHighlighted = window.getSelection()?.toString().length > 0;
        if (isHighlighted) return;

        const yDelta = event.clientY - pointerStartRef.current.y;
        const xDelta = event.clientX - pointerStartRef.current.x;

        const swipeDirections = props.swipeDirections ?? getDefaultSwipeDirections(position);

        // Determine swipe direction if not already locked
        if (!swipeDirection && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
          setSwipeDirection(Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y');
        }

        let swipeAmount = { x: 0, y: 0 };

        const getDampening = (delta: number) => {
          const factor = Math.abs(delta) / 20;

          return 1 / (1.5 + factor);
        };

        // Only apply swipe in the locked direction
        if (swipeDirection === 'y') {
          // Handle vertical swipes
          if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
            if ((swipeDirections.includes('top') && yDelta < 0) || (swipeDirections.includes('bottom') && yDelta > 0)) {
              swipeAmount.y = yDelta;
            } else {
              // Smoothly transition to dampened movement
              const dampenedDelta = yDelta * getDampening(yDelta);
              // Ensure we don't jump when transitioning to dampened movement
              swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
            }
          }
        } else if (swipeDirection === 'x') {
          // Handle horizontal swipes
          if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
            if ((swipeDirections.includes('left') && xDelta < 0) || (swipeDirections.includes('right') && xDelta > 0)) {
              swipeAmount.x = xDelta;
            } else {
              // Smoothly transition to dampened movement
              const dampenedDelta = xDelta * getDampening(xDelta);
              // Ensure we don't jump when transitioning to dampened movement
              swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
            }
          }
        }

        if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
          setIsSwiped(true);
        }

        // Apply transform using both x and y values
        toastRef.current?.style.setProperty('--swipe-amount-x', `${swipeAmount.x}px`);
        toastRef.current?.style.setProperty('--swipe-amount-y', `${swipeAmount.y}px`);
      }}
    >
      {closeButton && !toast.jsx && toastType !== 'loading' ? (
        <button
          aria-label={closeButtonAriaLabel}
          data-disabled={disabled}
          data-close-button
          onClick={
            disabled || !dismissible
              ? () => {}
              : () => {
                  deleteToast('close');
                  toast.onDismiss?.(toast);
                }
          }
          className={cn(classNames?.closeButton, toast?.classNames?.closeButton)}
        >
          {icons?.close ?? CloseIcon}
        </button>
      ) : null}
      {/* TODO: This can be cleaner */}
      {(toastType || toast.icon || toast.promise) &&
      toast.icon !== null &&
      (icons?.[toastType] !== null || toast.icon) ? (
        <div data-icon="" className={cn(classNames?.icon, toast?.classNames?.icon)}>
          {toast.promise || (toast.type === 'loading' && !toast.icon) ? toast.icon || getLoadingIcon() : null}
          {toast.type !== 'loading' ? icon : null}
        </div>
      ) : null}

      <div data-content="" className={cn(classNames?.content, toast?.classNames?.content)}>
        <div data-title="" className={cn(classNames?.title, toast?.classNames?.title)}>
          {toast.jsx ? toast.jsx : typeof toast.title === 'function' ? toast.title() : toast.title}
        </div>
        {toast.description ? (
          <div
            data-description=""
            className={cn(
              descriptionClassName,
              toastDescriptionClassname,
              classNames?.description,
              toast?.classNames?.description,
            )}
          >
            {typeof toast.description === 'function' ? toast.description() : toast.description}
          </div>
        ) : null}
      </div>
      {React.isValidElement(toast.cancel) ? (
        toast.cancel
      ) : toast.cancel && isAction(toast.cancel) ? (
        <button
          data-button
          data-cancel
          style={toast.cancelButtonStyle || cancelButtonStyle}
          onClick={(event) => {
            // We need to check twice because typescript
            if (!isAction(toast.cancel)) return;
            if (!dismissible) return;
            toast.cancel.onClick?.(event);
            deleteToast('cancel');
          }}
          className={cn(classNames?.cancelButton, toast?.classNames?.cancelButton)}
        >
          {toast.cancel.label}
        </button>
      ) : null}
      {React.isValidElement(toast.action) ? (
        toast.action
      ) : toast.action && isAction(toast.action) ? (
        <button
          data-button
          data-action
          style={toast.actionButtonStyle || actionButtonStyle}
          onClick={(event) => {
            // We need to check twice because typescript
            if (!isAction(toast.action)) return;
            toast.action.onClick?.(event);
            if (event.defaultPrevented) return;
            deleteToast('action');
          }}
          className={cn(classNames?.actionButton, toast?.classNames?.actionButton)}
        >
          {toast.action.label}
        </button>
      ) : null}
    </li>
  );
};

function getDocumentDirection(): ToasterProps['dir'] {
  if (typeof window === 'undefined') return 'ltr';
  if (typeof document === 'undefined') return 'ltr'; // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute('dir');

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement).direction as ToasterProps['dir'];
  }

  return dirAttribute as ToasterProps['dir'];
}

function assignOffset(defaultOffset: ToasterProps['offset'], mobileOffset: ToasterProps['mobileOffset']) {
  const styles = {} as React.CSSProperties;

  [defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1;
    const prefix = isMobile ? '--mobile-offset' : '--offset';
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET;

    function assignAll(offset: string | number) {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        styles[`${prefix}-${key}`] = typeof offset === 'number' ? `${offset}px` : offset;
      });
    }

    if (typeof offset === 'number' || typeof offset === 'string') {
      assignAll(offset);
    } else if (typeof offset === 'object') {
      ['top', 'right', 'bottom', 'left'].forEach((key) => {
        if (offset[key] === undefined) {
          styles[`${prefix}-${key}`] = defaultValue;
        } else {
          styles[`${prefix}-${key}`] = typeof offset[key] === 'number' ? `${offset[key]}px` : offset[key];
        }
      });
    } else {
      assignAll(defaultValue);
    }
  });

  return styles;
}

function useSonner() {
  const [activeToasts, setActiveToasts] = React.useState<ToastT[]>([]);

  React.useEffect(() => {
    return ToastState.subscribe((toast) => {
      if ((toast as ToastToDismiss).dismiss) {
        setTimeout(() => {
          ReactDOM.flushSync(() => {
            setActiveToasts((toasts) => toasts.filter((t) => t.id !== toast.id));
          });
        });
        return;
      }

      // Prevent batching, temp solution.
      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setActiveToasts((toasts) => {
            const indexOfExistingToast = toasts.findIndex((t) => t.id === toast.id);

            // Update the toast if it already exists
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts.slice(0, indexOfExistingToast),
                { ...toasts[indexOfExistingToast], ...toast },
                ...toasts.slice(indexOfExistingToast + 1),
              ];
            }

            return [toast, ...toasts];
          });
        });
      });
    });
  }, []);

  return {
    toasts: activeToasts,
  };
}

// Map toast type -> web-haptics pattern name (same as defaultPatterns keys).
const DEFAULT_HAPTIC_MAP: Partial<Record<ToastTypes, HapticPatternName>> = {
  success: 'success',
  error: 'error',
  warning: 'warning',
  info: 'light',
  loading: 'light',
  default: 'light',
  normal: 'light',
  action: 'light',
};

// Resolve which haptic pattern to use for a toast type; overridable via hapticPatternMap.
// Values may be preset names or raw ms arrays; per-toast hapticPattern wins over the map.
function getHapticPatternForType(
  type: ToastTypes | undefined,
  map?: Partial<Record<ToastTypes, HapticPatternName | HapticPattern>>,
  perToast?: HapticPatternName | HapticPattern,
): HapticPatternName | HapticPattern {
  if (perToast !== undefined) return perToast;
  const key = type ?? 'default';
  return (map?.[key] ?? DEFAULT_HAPTIC_MAP[key] ?? 'light') as HapticPatternName;
}

const Toaster = React.forwardRef<HTMLElement, ToasterProps>(function Toaster(props, ref) {
  const {
    id,
    invert,
    position = 'bottom-right',
    hotkey = ['altKey', 'KeyT'],
    expand,
    closeButton,
    className,
    offset,
    mobileOffset,
    theme = 'light',
    richColors,
    duration,
    style,
    visibleToasts = VISIBLE_TOASTS_AMOUNT,
    toastOptions,
    dir = getDocumentDirection(),
    gap = GAP,
    icons,
    customAriaLabel,
    containerAriaLabel = 'Notifications',
    haptics = true,
    hapticPatternMap,
    hapticsDebug = false,
    hapticsShowSwitch = false,
    system,
  } = props;
  // Multi-toaster scope id, validated to safe characters (invalid values are ignored).
  const safeId = sanitizeToasterId(id);
  const hapticsRef = React.useRef<WebHaptics | null>(null);
  const [toasts, setToasts] = React.useState<ToastT[]>([]);
  const filteredToasts = React.useMemo(() => {
    if (safeId) {
      return toasts.filter((toast) => toast.toasterId === safeId);
    }
    return toasts.filter((toast) => !toast.toasterId);
  }, [toasts, safeId]);
  const possiblePositions = React.useMemo(() => {
    return Array.from(
      new Set([position].concat(filteredToasts.filter((toast) => toast.position).map((toast) => toast.position))),
    );
  }, [filteredToasts, position]);
  const [heights, setHeights] = React.useState<HeightT[]>([]);
  const [expanded, setExpanded] = React.useState(false);
  const [interacting, setInteracting] = React.useState(false);
  const [actualTheme, setActualTheme] = React.useState<'light' | 'dark'>(
    theme !== 'system'
      ? theme
      : typeof window !== 'undefined'
      ? window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : 'light',
  );

  // `richColors` prop always wins; otherwise the `toastAppearance` preset decides.
  const defaultRichColors = React.useMemo(() => {
    const resolved = resolveToastAppearance({ toastAppearance: props.toastAppearance, richColors });
    return resolved.effectiveRichColors;
  }, [props.toastAppearance, richColors]);

  const listRef = React.useRef<HTMLOListElement>(null);
  const hotkeyLabel = hotkey.join('+').replace(/Key/g, '').replace(/Digit/g, '');
  const lastFocusedElementRef = React.useRef<HTMLElement>(null);
  const isFocusWithinRef = React.useRef(false);

  // One WebHaptics instance per Toaster when haptics enabled; destroyed on unmount or when haptics off.
  React.useEffect(() => {
    if (!haptics) return;
    const instance = new WebHaptics({ debug: hapticsDebug, showSwitch: hapticsShowSwitch });
    hapticsRef.current = instance;
    return () => {
      instance.destroy();
      hapticsRef.current = null;
    };
  }, [haptics, hapticsDebug, hapticsShowSwitch]);

  // Register system feature flags for this toaster.
  React.useEffect(() => {
    ToastState.setSystemConfig(safeId, system);
    return () => {
      ToastState.setSystemConfig(safeId, undefined);
    };
  }, [safeId, system]);

  const removeToast = React.useCallback((toastToRemove: ToastT, reason?: ToastCloseReason) => {
    setToasts((toasts) => {
      if (!toasts.find((toast) => toast.id === toastToRemove.id)?.delete) {
        ToastState.dismiss(toastToRemove.id, reason);
      }

      return toasts.filter(({ id }) => id !== toastToRemove.id);
    });
  }, []);

  React.useEffect(() => {
    return ToastState.subscribe((toast) => {
      if ((toast as ToastToDismiss).dismiss) {
        // Prevent batching of other state updates
        requestAnimationFrame(() => {
          setToasts((toasts) =>
            toasts.map((t) =>
              t.id === toast.id ? { ...t, delete: true, dismissReason: (toast as ToastToDismiss).reason } : t,
            ),
          );
        });
        return;
      }

      const t = toast as ToastT;
      if (haptics && hapticsRef.current && t.haptics !== false) {
        const pattern = getHapticPatternForType(t.type, hapticPatternMap, t.hapticPattern);
        const intensity = t.hapticIntensity !== undefined ? { intensity: t.hapticIntensity } : undefined;
        hapticsRef.current.trigger(pattern, intensity);
      }

      // Prevent batching (temp solution).
      setTimeout(() => {
        ReactDOM.flushSync(() => {
          setToasts((toasts) => {
            const indexOfExistingToast = toasts.findIndex((t) => t.id === toast.id);

            // Update the toast if it already exists
            if (indexOfExistingToast !== -1) {
              return [
                ...toasts.slice(0, indexOfExistingToast),
                { ...toasts[indexOfExistingToast], ...toast },
                ...toasts.slice(indexOfExistingToast + 1),
              ];
            }

            return [toast, ...toasts];
          });
        });
      });
    });
  }, [haptics, hapticPatternMap]);

  React.useEffect(() => {
    if (theme !== 'system') {
      setActualTheme(theme);
      return;
    }

    if (theme === 'system') {
      // check if current preference is dark
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        // it's currently dark
        setActualTheme('dark');
      } else {
        // it's not dark
        setActualTheme('light');
      }
    }

    if (typeof window === 'undefined') return;
    const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const onMediaChange = ({ matches }: MediaQueryListEvent) => {
      setActualTheme(matches ? 'dark' : 'light');
    };

    try {
      // Chrome & Firefox
      darkMediaQuery.addEventListener('change', onMediaChange);
    } catch {
      // Safari < 14
      darkMediaQuery.addListener(onMediaChange);
    }

    return () => {
      try {
        darkMediaQuery.removeEventListener('change', onMediaChange);
      } catch {
        darkMediaQuery.removeListener(onMediaChange);
      }
    };
  }, [theme]);

  React.useEffect(() => {
    // Ensure expanded is always false when no toasts are present / only one left
    if (toasts.length <= 1) {
      setExpanded(false);
    }
  }, [toasts]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isHotkeyPressed = hotkey.length > 0 && hotkey.every((key) => (event as any)[key] || event.code === key);

      if (isHotkeyPressed) {
        setExpanded(true);
        listRef.current?.focus();
      }

      if (
        event.code === 'Escape' &&
        (document.activeElement === listRef.current || listRef.current?.contains(document.activeElement))
      ) {
        setExpanded(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hotkey]);

  React.useEffect(() => {
    if (listRef.current) {
      return () => {
        if (lastFocusedElementRef.current) {
          lastFocusedElementRef.current.focus({ preventScroll: true });
          lastFocusedElementRef.current = null;
          isFocusWithinRef.current = false;
        }
      };
    }
  }, [listRef.current]);

  return (
    // Remove item from normal navigation flow, only available via hotkey
    <section
      ref={ref}
      aria-label={customAriaLabel ?? `${containerAriaLabel} ${hotkeyLabel}`}
      tabIndex={-1}
      aria-live="polite"
      aria-relevant="additions text"
      aria-atomic="false"
      suppressHydrationWarning
      data-react-aria-top-layer
    >
      {possiblePositions.map((position, index) => {
        const [y, x] = position.split('-');

        if (!filteredToasts.length) return null;

        return (
          <ol
            key={position}
            dir={dir === 'auto' ? getDocumentDirection() : dir}
            tabIndex={-1}
            ref={listRef}
            className={className}
            data-sonner-toaster
            data-sonner-theme={actualTheme}
            data-y-position={y}
            data-x-position={x}
            style={
              {
                '--front-toast-height': `${heights.find((h) => h.position === position)?.height || 0}px`,
                '--width': `${TOAST_WIDTH}px`,
                '--gap': `${gap}px`,
                ...style,
                ...assignOffset(offset, mobileOffset),
              } as React.CSSProperties
            }
            onBlur={(event) => {
              if (isFocusWithinRef.current && !event.currentTarget.contains(event.relatedTarget)) {
                isFocusWithinRef.current = false;
                if (lastFocusedElementRef.current) {
                  lastFocusedElementRef.current.focus({ preventScroll: true });
                  lastFocusedElementRef.current = null;
                }
              }
            }}
            onFocus={(event) => {
              const isNotDismissible =
                event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

              if (isNotDismissible) return;

              if (!isFocusWithinRef.current) {
                isFocusWithinRef.current = true;
                lastFocusedElementRef.current = event.relatedTarget as HTMLElement;
              }
            }}
            onMouseEnter={() => setExpanded(true)}
            onMouseMove={() => setExpanded(true)}
            onMouseLeave={() => {
              // Avoid setting expanded to false when interacting with a toast, e.g. swiping
              if (!interacting) {
                setExpanded(false);
              }
            }}
            onDragEnd={() => setExpanded(false)}
            onPointerDown={(event) => {
              const isNotDismissible =
                event.target instanceof HTMLElement && event.target.dataset.dismissible === 'false';

              if (isNotDismissible) return;
              setInteracting(true);
            }}
            onPointerUp={() => setInteracting(false)}
          >
            {filteredToasts
              .filter((toast) => (!toast.position && index === 0) || toast.position === position)
              .map((toast, index) => (
                <Toast
                  key={toast.id}
                  icons={icons}
                  index={index}
                  toast={toast}
                  defaultRichColors={defaultRichColors}
                  duration={toastOptions?.duration ?? duration}
                  className={toastOptions?.className}
                  descriptionClassName={toastOptions?.descriptionClassName}
                  invert={invert}
                  visibleToasts={visibleToasts}
                  closeButton={toastOptions?.closeButton ?? closeButton}
                  interacting={interacting}
                  position={position}
                  style={toastOptions?.style}
                  unstyled={toastOptions?.unstyled}
                  classNames={sanitizeClassNames(toastOptions?.classNames)}
                  cancelButtonStyle={toastOptions?.cancelButtonStyle}
                  actionButtonStyle={toastOptions?.actionButtonStyle}
                  closeButtonAriaLabel={toastOptions?.closeButtonAriaLabel}
                  removeToast={removeToast}
                  dismissReasonEnabled={system?.dismissReason?.enabled === true}
                  toasts={filteredToasts.filter((t) => t.position == toast.position)}
                  heights={heights.filter((h) => h.position == toast.position)}
                  setHeights={setHeights}
                  expandByDefault={expand}
                  gap={gap}
                  expanded={expanded}
                  swipeDirections={props.swipeDirections}
                />
              ))}
          </ol>
        );
      })}
    </section>
  );
});

export { toast, Toaster, useSonner, isHapticsSupported, useHapticsSupported, triggerHaptic, WebHaptics, defaultPatterns };
export type { TriggerHapticOptions } from './haptics';
export type { ExternalToast, ToastT, ToasterProps, ToastSystemConfig, HapticPatternName, ToastTypes };
export { type ToastClassnames, type ToastToDismiss, type Action } from './types';
