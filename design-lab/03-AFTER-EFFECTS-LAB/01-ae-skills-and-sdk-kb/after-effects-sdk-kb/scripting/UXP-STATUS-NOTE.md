---
created: 2026-04-19
tags: [type/reference, topic/after-effects, topic/uxp, status/monitoring]
source: Adobe developer blog + UXP version matrix
api_provider: Adobe UXP
---

# UXP for After Effects — Status Note

> **Short answer: UXP panels for After Effects are not yet available as of April 2026.** Use CEP + ExtendScript until Adobe ships AE UXP.

---

## Current State (2026-04-19)

| Product | UXP panels available? | Notes |
|---------|-----------------------|-------|
| Photoshop | Yes (production) | First app to ship UXP |
| InDesign | Yes (production) | Shipped 2024 |
| Premiere Pro | Yes (production) | Shipped v25.6, December 2025 |
| **After Effects** | **No** | AE is listed in UXP version matrix from AE 22.0 / UXP 5.5 for **scripting-only UXP APIs**, but there is no production UXP panel/plugin framework for AE |
| XD | Deprecated | UXP XD samples should be ignored |

AE still uses **CEP (Common Extensibility Platform) + ExtendScript** for panels. There is no official `developer.adobe.com/after-effects/uxp/` page — that URL 404s.

---

## What To Do If You Want a Panel for AE Today

1. **Use ExtendScript with ScriptUI panels** — see `scripting/01-extendscript-complete-reference.md`. Create a `.jsxbin` or `.jsx` in `ScriptUI Panels/` directory. Re-openable via Window menu.
2. **Use CEP (HTML panels)** — still fully supported in AE. [Adobe CEP docs](https://github.com/Adobe-CEP/Getting-Started-guides). This is what every commercial AE panel (Motion 4, BeatEdit, etc.) uses today.
3. **Write a C++ AEGP plugin** — if you need deeper integration than a panel can provide.

---

## When To Switch To UXP

Monitor these sources for AE UXP announcements:

- [Adobe Developer Blog](https://blog.developer.adobe.com/) — primary announcement channel
- [Applications Integrated with UXP (version matrix)](https://developer.adobe.com/xd/uxp/uxp/versions/) — will gain an AE panel column when shipped
- [UXP for AE — Adobe Community thread](https://community.adobe.com/t5/after-effects-discussions/uxp-for-after-effects/td-p/13360660) — ongoing community questions

The Premiere Pro UXP rollout (Dec 2025) is the closest architectural signal: if Adobe follows the same pattern for AE, expect a preview in a dot release first, then production in the subsequent major release.

---

## If You Want To Be Ready

- Study the Premiere Pro UXP samples: [AdobeDocs/uxp-premiere-pro-samples](https://github.com/AdobeDocs/uxp-premiere-pro-samples) — closest architectural analog
- Study the UXP boilerplate: [hyperbrew/bolt-uxp](https://github.com/hyperbrew/bolt-uxp) (Svelte/React/Vue scaffolding)
- UXP components library: [adobe/uxp-optimized](https://github.com/adobe/uxp-optimized)

---

*Revisit this note when Adobe announces AE UXP availability. Last verified: 2026-04-19.*
