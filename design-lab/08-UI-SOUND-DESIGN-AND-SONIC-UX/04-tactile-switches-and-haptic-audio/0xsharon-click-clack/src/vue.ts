import { attachMechanicalAudio } from './index';
import { AttachOptions } from './types';

/**
 * Vue 3 directive for click-clack mechanical keyboard audio.
 *
 * @example
 * ```html
 * <script setup>
 * import { vClickClack } from '@0xsharon/click-clack/vue';
 * </script>
 *
 * <template>
 *   <textarea v-click-clack="{ profile: 'creamy', stereoPan: true }" />
 * </template>
 * ```
 */
export const vClickClack = {
  mounted(el: HTMLElement, binding: { value?: AttachOptions }) {
    const cleanup = attachMechanicalAudio(el, binding.value || {});
    // @ts-expect-error - store cleanup on element
    el._clickClackCleanup = cleanup;
  },
  unmounted(el: HTMLElement) {
    // @ts-expect-error - retrieve cleanup
    if (typeof el._clickClackCleanup === 'function') {
      // @ts-expect-error - call cleanup
      el._clickClackCleanup();
    }
  },
};
