# Realtime Specification

Delete this file when the target has no shared multi-client state.

## Scope

- Public join path:
- Room selector and capacity:
- Client labels used during research:
- Transport:
- Exact versus approximate protocol decision:
- Out-of-scope backend behavior:

## Actors and Authority

| Actor | Identity source | Can propose | Authority / acceptance | Observers | Disconnect behavior |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## Connection Lifecycle

| From | Trigger | To | Visible UI | Store change | Timeout / retry / cleanup |
| --- | --- | --- | --- | --- | --- |
| disconnected | page ready | connecting | | | |
| connecting | join accepted | joined | | | |
| joined | snapshot applied | ready | | | |
| ready | transport lost | reconnecting | | | |
| reconnecting | resync complete | ready | | | |

## Replicated State

| Field | Category | Proposer | Authority | Initial source | Update rule | Ordering / conflict | Presentation | Removal |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| | session / identity / room / durable / ephemeral / presentation-only | | | | | | | |

## Public Event Catalog

| Event | Direction | Trigger | Minimal payload shape | Scope | Acknowledgement | Observable effect |
| --- | --- | --- | --- | --- | --- | --- |
| join | client -> authority | | | | | |
| snapshot | authority -> client | | | | | |
| delta | both | | | | | |
| leave | authority -> client | | | | | |

## High-Frequency Updates

- Send rate and change threshold:
- Coordinate system:
- Timestamp or sequence owner:
- Buffer and interpolation delay:
- Prediction and reconciliation:
- Stale, duplicate, missing, and out-of-order handling:
- Teleport or large-delta behavior:
- Inactive participant timeout:

## Rooms and Isolation

- Join and leave semantics:
- Initial snapshot contents:
- Broadcast scope:
- Host or owner behavior:
- Cross-room isolation evidence:
- Full, missing, or expired room behavior:

## Reconnect and Persistence

- Identity resumes or resets:
- State resumes or resets:
- Resynchronization source:
- Duplicate prevention:
- Durable state boundary:

## Local Implementation Contract

- Client transport adapter:
- Local authority command:
- Safe default endpoint:
- Message validation:
- Fixture or bot mode, if any, and how it stays opt-in:
- Differences from the observed transport:

## Multi-Client Acceptance

| Scenario | Client A | Client B | Authority / network evidence | Expected shared state | Expected presentation | Status |
| --- | --- | --- | --- | --- | --- | --- |
| A joins | | | | | | Pending |
| B joins late | | | | | | Pending |
| A updates B | | | | | | Pending |
| B updates A | | | | | | Pending |
| Local-only state stays local | | | | | | Pending |
| Leave cleanup | | | | | | Pending |
| Reconnect | | | | | | Pending |
| Room isolation, if present | | | | | | Pending |

## Unknown or Approximate Behavior

| Behavior | Evidence | Decision | User-visible risk |
| --- | --- | --- | --- |
| | | | |
