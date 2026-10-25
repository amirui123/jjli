# Validation Matrix

## Acceptance Method

- Spatial tolerance:
- Timing tolerance:
- Animation or physics tolerance:
- Nondeterministic regions and masking rules:
- Browser, zoom, DPR, locale, and motion preference:

| Viewport | State / interaction | Original capture | Clone capture | Largest delta | Status |
| --- | --- | --- | --- | --- | --- |
| 1440 × 900 | Initial | | | | Pending |
| 390 × 844 | Initial | | | | Pending |

## Multi-Client Scenarios

Delete this section when the target has no shared state. Use independent browser
contexts and include transport, replicated-store, and visible remote evidence.

| Scenario | Client A | Client B | Authority / network evidence | Expected result | Status |
| --- | --- | --- | --- | --- | --- |
| A joins | | | | | Pending |
| B joins late and receives current state | | | | | Pending |
| A updates B | | | | | Pending |
| B updates A | | | | | Pending |
| Leave cleanup | | | | | Pending |
| Reconnect without ghosts or duplicates | | | | | Pending |
| Room isolation, if present | | | | | Pending |

## Runtime Checks

| Check | Command or evidence | Status | Notes |
| --- | --- | --- | --- |
| Console and network | | Pending | |
| Original-host requests | | Pending | |
| Renderer, camera, atmosphere, and post chain, if present | | Pending | |
| Authored scene-layer completeness, if present | | Pending | |
| Local / NPC / remote render parity, if present | | Pending | |
| Realtime connection and initial snapshot, if present | | Pending | |
| Bidirectional state, cleanup, and reconnect, if present | | Pending | |
| Lint | | Pending | |
| Typecheck | | Pending | |
| Tests | | Pending | |
| Production build | | Pending | |
| Built deployment | | Pending | |
