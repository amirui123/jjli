# Security Policy

## Supported Versions

We actively maintain and provide security updates for the latest major version of `@0xsharon/click-clack`.

| Version | Supported          |
| :------ | :----------------- |
| 1.x.x   | :white_check_mark: |
| < 1.0.0 | :x:                |

---

## Security Architecture & Guarantees

`@0xsharon/click-clack` is engineered with a strict minimal-surface security philosophy:

1. **Zero Runtime Dependencies:**  
   The library has exactly **0 production dependencies**. It does not download, require, or link against any third-party npm packages at runtime, eliminating 100% of external supply-chain attack vectors.

2. **No Network Access or Telemetry:**  
   The library contains zero network requests (`fetch`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`). No user data, keystrokes, timing metrics, or analytics are ever logged, persisted, or transmitted.

3. **No Dynamic Code Evaluation:**  
   The codebase contains zero instances of `eval()`, `new Function()`, `setTimeout(string)`, or dynamic script injection.

4. **Pure Web Audio API & DOM Event Handling:**  
   All audio is generated strictly client-side using browser-native `AudioContext` oscillator and biquad filter nodes.

5. **Resource & Battery Protection:**  
   Audio contexts are automatically suspended when the browser tab is hidden (`document.visibilityState === 'hidden'`) and audio buffers are pre-allocated once to prevent memory leaks or garbage collector spikes.

---

## Reporting a Vulnerability

If you discover a security vulnerability within `@0xsharon/click-clack`, please report it responsibly:

- **Do NOT open a public GitHub issue.**
- Submit an advisory report through [GitHub Private Vulnerability Reporting](https://github.com/0xSHARON/click-clack/security/advisories/new).
- Or email the maintainer directly at: `security@0xsharon.dev` (or open a confidential inquiry).

Please include:
1. Description of the issue and potential impact
2. Steps to reproduce or proof-of-concept
3. Affected versions

We will acknowledge receipt within 24–48 hours, investigate promptly, and release a patch via a coordinated disclosure timeline.
