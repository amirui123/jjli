import type { ToastAppearance } from './types';

export type ResolvedToastAppearance = {
  appearance: ToastAppearance;
  /** Passed to toasts as default when per-toast `richColors` is omitted */
  effectiveRichColors: boolean | undefined;
};

/**
 * Preset styling for `<Toaster />`:
 * - `default` — Sonner-compatible (neutral unless `richColors` is on).
 * - `subtle` — Low-contrast type tints that blend with `--normal-bg` (ignores default richColors).
 * - `themed` — Colorful type surfaces; prefers `richColors` unless you set it explicitly.
 *   Rich surfaces read `--toast-*` CSS variables first (shadcn / app theme), then built-in fallbacks.
 *
 * Explicit `richColors` on `<Toaster />` always wins over these defaults.
 */
export function resolveToastAppearance(params: {
  toastAppearance?: ToastAppearance;
  richColors?: boolean;
}): ResolvedToastAppearance {
  const appearance = params.toastAppearance ?? 'default';

  if (params.richColors !== undefined) {
    return { appearance, effectiveRichColors: params.richColors };
  }

  switch (appearance) {
    case 'subtle':
      return { appearance, effectiveRichColors: false };
    case 'themed':
      return { appearance, effectiveRichColors: true };
    default:
      return { appearance, effectiveRichColors: false };
  }
}
