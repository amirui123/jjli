import type { ToastClassnames } from './types';

/**
 * Defensive helpers for values that end up in the DOM. React already escapes text
 * nodes and most attributes; these reduce odd edge cases (e.g. NUL in class strings)
 * and unsafe toaster scope ids.
 */

const TOASTER_ID_RE = /^[-a-zA-Z0-9_]{1,128}$/;

/** Strip characters that must not appear in HTML `class` tokens (defense in depth). */
export function sanitizeClassNameString(value: string | undefined): string {
  if (!value) return '';
  return value.replace(/\0/g, '');
}

export function sanitizeClassNames(classNames: ToastClassnames | undefined): ToastClassnames | undefined {
  if (!classNames) return undefined;
  const out: ToastClassnames = { ...classNames };
  (Object.keys(out) as (keyof ToastClassnames)[]).forEach((key) => {
    const v = out[key];
    if (typeof v === 'string') {
      out[key] = sanitizeClassNameString(v);
    }
  });
  return out;
}

/**
 * Multi-toaster scope id: only allow safe `id` characters so values cannot break out
 * of expected string usage. Invalid ids are ignored with a dev warning.
 */
export function sanitizeToasterId(id: string | undefined): string | undefined {
  if (id === undefined || id === null) return undefined;
  const s = String(id).trim();
  if (!TOASTER_ID_RE.test(s)) {
    if (typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production') {
      console.warn(
        '[web-haptics-toast] `id` must be 1–128 chars: letters, numbers, underscore, hyphen. Value ignored.',
      );
    }
    return undefined;
  }
  return s;
}
