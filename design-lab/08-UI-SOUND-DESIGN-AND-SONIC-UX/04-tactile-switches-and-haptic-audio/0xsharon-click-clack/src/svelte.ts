import { attachMechanicalAudio } from './index';
import { AttachOptions } from './types';

/**
 * Svelte action for click-clack mechanical keyboard audio.
 *
 * @example
 * ```svelte
 * <script>
 *   import { clickClack } from '@0xsharon/click-clack/svelte';
 * </script>
 *
 * <textarea use:clickClack={{ profile: 'creamy', stereoPan: true }} />
 * ```
 */
export function clickClack(node: HTMLElement, options: AttachOptions = {}) {
  let cleanup = attachMechanicalAudio(node, options);

  return {
    update(newOptions: AttachOptions) {
      cleanup();
      cleanup = attachMechanicalAudio(node, newOptions);
    },
    destroy() {
      cleanup();
    },
  };
}
