import { attachMechanicalAudio, isMuted, toggleMute } from './index';
import { AttachOptions, SwitchProfile } from './types';

const attachedMap = new WeakMap<HTMLElement, () => void>();

function parseOptions(el: HTMLElement): AttachOptions {
  const profile = (el.getAttribute('data-click-clack') || 'thock') as SwitchProfile;
  const volumeAttr = el.getAttribute('data-volume');
  const volume = volumeAttr ? parseFloat(volumeAttr) : 0.8;
  const stereoPan = el.getAttribute('data-stereo') !== 'false';
  const carriageBell = el.getAttribute('data-bell') === 'true';
  const wpmDynamics = el.getAttribute('data-wpm') === 'true';
  const deskmat = (el.getAttribute('data-deskmat') || 'none') as AttachOptions['deskmat'];

  return {
    profile,
    volume,
    stereoPan,
    carriageBell,
    wpmDynamics,
    deskmat,
  };
}

function attachElement(el: HTMLElement) {
  if (attachedMap.has(el)) return;
  const options = parseOptions(el);
  const cleanup = attachMechanicalAudio(el, options);
  attachedMap.set(el, cleanup);
}

/**
 * Automatically scans the document for elements with `[data-click-clack]`
 * and observes dynamically added elements via MutationObserver.
 */
export function autoInitClickClack(): () => void {
  if (typeof document === 'undefined') return () => {};

  const scanAndAttach = () => {
    // Check body or html tag for whole-page activation
    if (document.body.hasAttribute('data-click-clack')) {
      attachElement(document.body);
    }

    const elements = document.querySelectorAll<HTMLElement>('[data-click-clack]');
    elements.forEach(attachElement);
  };

  scanAndAttach();

  // Watch for dynamically inserted inputs / modals
  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node instanceof HTMLElement) {
          if (node.hasAttribute('data-click-clack')) {
            attachElement(node);
          }
          const children = node.querySelectorAll<HTMLElement>('[data-click-clack]');
          children.forEach(attachElement);
        }
      });
    }
  });

  observer.observe(document.body, { childList: true, subtree: true });

  // Global hotkey: Ctrl + Alt + M (or Cmd + Alt + M) to toggle sound
  const handleShortcut = (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.altKey && e.key.toLowerCase() === 'm') {
      const muted = toggleMute();
      showMuteNotification(muted);
    }
  };

  window.addEventListener('keydown', handleShortcut);

  return () => {
    observer.disconnect();
    window.removeEventListener('keydown', handleShortcut);
  };
}

function showMuteNotification(muted: boolean) {
  if (typeof document === 'undefined') return;

  const existing = document.getElementById('click-clack-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'click-clack-toast';
  toast.innerText = muted ? '🔇 click-clack Muted' : '🔊 click-clack Enabled';
  Object.assign(toast.style, {
    position: 'fixed',
    bottom: '24px',
    right: '24px',
    backgroundColor: '#161b22',
    color: muted ? '#f85149' : '#3fb950',
    border: '1px solid #30363d',
    borderRadius: '8px',
    padding: '10px 16px',
    fontFamily: 'monospace',
    fontSize: '13px',
    fontWeight: 'bold',
    boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
    zIndex: '999999',
    pointerEvents: 'none',
    transition: 'opacity 0.3s ease',
  });

  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 1800);
}

// Auto-run if loaded via browser script tag
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => autoInitClickClack());
  } else {
    autoInitClickClack();
  }
}
