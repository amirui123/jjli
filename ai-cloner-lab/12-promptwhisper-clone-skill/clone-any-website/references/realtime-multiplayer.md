# Realtime and Multiplayer Websites

Read this reference when two or more visitors can see or affect shared state,
including rooms, presence, remote cursors, collaborative canvases, multiplayer
characters, shared reactions, and WebSocket, SSE, WebRTC, Socket.IO, hosted
realtime, or polling-backed experiences.

## Contents

- Scope and safety
- Two-client reconnaissance
- Authority and protocol specification
- Clean-room implementation
- Multi-client validation
- Common failures and handoff

## Scope and Safety

Apply the main skill boundaries before opening a connection. In addition:

- Observe only public, unauthenticated flows that the user is allowed to access.
- Use two controlled clients and an isolated or low-impact room when possible.
  Do not spam, impersonate, disturb, or collect content from unrelated visitors.
- Derive only the minimum public protocol shape needed to reproduce observable
  behavior. Do not retain other users' payloads, identifiers, analytics values,
  access tokens, private endpoints, or browser profiles.
- Reproduce the observed public experience with a local service or disclosed
  fixtures. Do not make the shipped clone depend on the original production
  realtime service.
- Treat authentication, moderation, persistence, matchmaking, billing, and
  anti-abuse systems as out of scope unless the user separately authorizes and
  specifies them.
- Do not infer hidden server rules from one successful path. Mark unobserved
  behavior as unknown or approximate.

## Two-Client Reconnaissance

A single browser can reveal rendering, but it cannot prove multiplayer behavior.
Use at least two independent browser contexts with separate session storage and
network connections. Label them `A` and `B` throughout the research notes.

Before acting, capture for each client:

- URL, room selector, query parameters, and public join path;
- viewport, device class, locale, and relevant feature flags;
- transport type and connection URL shape with secrets removed;
- whether identity is server-assigned, locally generated, or selected by the
  visitor;
- initial loading, connecting, connected, and ready indicators;
- the rendered local entity and any remote entities;
- storage keys that influence public session or room behavior, without copying
  personal or analytics identifiers.

Then run this minimal observation sequence:

1. Join with `A` and observe the empty or existing room state.
2. Join the same room with `B`. Check what `A` sees and what late-joining `B`
   receives immediately.
3. Change one property on `A`, such as position, outfit, cursor, reaction, or
   ready state. Observe the local result, outbound event, and remote result on
   `B`.
4. Change the same or a different property on `B` and verify the reverse path.
5. Trigger two independent changes close together when it is safe to do so.
   Observe ordering and conflict behavior.
6. Leave or close `A`. Measure when and how `B` removes or marks it offline.
7. Refresh or reconnect `A`. Determine whether identity and room state resume,
   reset, or create a new participant.
8. If rooms exist, place a third controlled client in another room and verify
   that state does not cross the boundary.

Wait for observable readiness conditions rather than fixed sleeps. Keep local
input, replicated state, and remote presentation separate in the notes. A local
animation that never reaches the other client is not a replicated behavior.

### Transport Inventory

Inspect browser network evidence and client-delivered code for:

- WebSocket upgrade requests and text or binary frames;
- Socket.IO or another library's handshake, namespace, and room clues;
- SSE streams and reconnect behavior;
- WebRTC signaling, data channels, and peer lifecycle;
- hosted realtime subscriptions or database change feeds;
- HTTP polling cadence and long-poll termination;
- heartbeats, acknowledgements, sequence numbers, timestamps, and version tags.

Store a derived message catalog rather than raw traffic:

| Event | Direction | Trigger | Minimal payload shape | Scope | Observable effect |
| --- | --- | --- | --- | --- | --- |
| join | client -> server | ready after load | `{room, publicProfile}` | room | participant appears |
| snapshot | server -> client | join or resync | `{participants[]}` | client | initial room populates |
| delta | both | input or state change | `{id, patch, seq}` | room | remote state changes |
| leave | server -> client | disconnect or timeout | `{id}` | room | participant disappears |

Use the target's actual event names only when they are useful public constants.
Replace opaque payload examples with field roles and types. For a binary
protocol, document the observable framing and decoded fields needed by the
clone; do not copy the original implementation.

## Authority and State Specification

Create `docs/research/REALTIME_SPEC.md` from the bundled template. Complete it
before implementing remote entities or collaborative state.

For every replicated field, decide:

| Question | Examples |
| --- | --- |
| Who proposes it? | owning client, any client, server timer |
| Who accepts it? | server, room host, peer, last writer |
| Who can observe it? | owner, room, team, everyone |
| How is it initialized? | join payload, room snapshot, local default |
| How is it updated? | full replacement, patch, command, event |
| How are conflicts resolved? | sequence, timestamp, server order, CRDT |
| How is it presented? | immediate, interpolated, predicted, animated |
| How is it removed? | explicit leave, timeout, tombstone, room reset |

Classify state explicitly:

- **Session state**: connection ID, readiness, heartbeat, transport status.
- **Identity state**: public player or collaborator identity. Do not confuse it
  with a socket connection ID or analytics identifier.
- **Room state**: membership, owner or host, shared phase, capacity.
- **Durable shared state**: data that survives a reconnect or new participant.
- **Ephemeral replicated state**: pose, cursor, velocity, typing, reaction.
- **Presentation-only state**: camera smoothing, hover, particle progress, local
  audio, and other effects that should not be transmitted.

Specify the lifecycle as observable transitions, for example:

```text
disconnected -> connecting -> joined -> snapshot-applied -> ready
ready -> reconnecting -> resynced -> ready
ready -> leaving -> disconnected
```

For each transition, define its trigger, timeout, retry rule, visible UI, store
mutation, and cleanup. Describe unknown server-only semantics as approximate.

### Motion and High-Frequency State

If the target replicates movement, cursors, drawing, or another high-rate signal,
extract:

- send rate and change threshold;
- coordinate system and normalization;
- timestamp or sequence ownership;
- buffering and interpolation delay;
- prediction and reconciliation, only when observed;
- teleport or large-delta behavior;
- stale, duplicated, missing, and out-of-order update handling;
- inactive or disconnected entity timeout.

Do not tie network send rate directly to render frame rate unless the target
does. Keep transport updates, authoritative state, and visual interpolation as
separate layers.

## Clean-Room Implementation

Prefer the smallest local architecture that reproduces the observed semantics:

```text
input -> local intent -> transport adapter -> room authority
                                      |             |
                                      v             v
                                acknowledgements  snapshot/deltas
                                      |             |
                                      +------> replicated store -> renderer
```

The authority may be a small local WebSocket service, an in-process fixture for
tests, or an authorized backend integration. Keep the client behind a transport
adapter so visual components do not depend on production endpoints or wire
formats.

Implement in this order:

1. Define validated message types and the replicated store.
2. Establish connection, identity, room join, and readiness.
3. Send a full initial snapshot to a late joiner.
4. Replicate one bidirectional state change end to end.
5. Render remote participants from the replicated store.
6. Add patch ordering, rate limits, interpolation, or reconciliation that was
   observed.
7. Implement leave, timeout cleanup, reconnect, and resynchronization.
8. Add room isolation and capacity behavior when present.
9. Add remaining reactions, cosmetics, shared phase, and secondary polish.

Maintain these invariants:

- The server or room authority validates room, participant, event, and payload
  shape before mutating shared state.
- A late joiner receives enough state to match existing clients without waiting
  for every participant to move again.
- A participant mutation cannot update another participant unless the observed
  experience explicitly allows it.
- Room keys scope every broadcast and store lookup.
- Disconnect cleanup is idempotent; refreshes and retries do not create permanent
  ghosts or duplicate entities.
- Stale updates cannot overwrite a newer accepted state.
- Reconnect behavior follows the observed identity and persistence model.
- The normal visitor path uses real independent connections. Deterministic bots,
  fixed participants, and scripted states are opt-in development or test
  fixtures, never substitutes for the multiplayer implementation.
- Runtime configuration points to the clone's local or authorized service, and
  the built application contains no original production endpoint or secret.

When the original protocol is complex, reproduce only the observable subset.
For example, a local JSON protocol may replace an opaque binary service if join,
presence, updates, smoothing, leave, and reconnect remain faithful. Document the
transport difference and its user-visible risk.

## Multi-Client Validation

Use `A` and `B` as independent browser contexts against the same built clone.
Shared local storage or two viewports rendered by one page is not sufficient.
Prove distinct live connections through safe test instrumentation, the local
server's connection count, or derived network evidence.

Validate at least the observed scenarios:

1. `A` joins and reaches ready.
2. `B` joins late and immediately receives `A` through a snapshot or equivalent.
3. An action by `A` appears once on `B` with the correct scope and presentation.
4. An action by `B` appears once on `A`.
5. Local-only UI on either client does not leak to the other.
6. Simultaneous or rapid updates settle according to the specified ordering
   rule.
7. Leaving, closing, or timing out removes the participant correctly.
8. Reconnect produces the observed resume or new-session behavior without
   duplicates.
9. Separate rooms remain isolated when rooms are part of the target.

For each scenario, assert three layers where possible:

- **Transport**: the intended connection or event occurred.
- **State**: the receiver's replicated store reached the expected value.
- **Presentation**: the remote participant or shared surface visibly reflected
  that value.

Run the scenario in both directions. A clone that only animates a fake remote
participant or only supports owner-to-observer updates has not reproduced a
two-way experience.

Test failure paths that the public target visibly defines:

- initial connection unavailable;
- temporary disconnect and retry;
- stale connection timeout;
- malformed or unauthorized mutation rejection;
- room full or missing;
- context refresh while another client remains connected.

Do not add user-visible failures that were not observed solely to fill a matrix.
Internal validation and safe input rejection are still required.

## Common Failures

| Symptom | Likely cause | Check |
| --- | --- | --- |
| Both players look correct but never diverge | One page renders two local avatars | Use two independent connections and mutate each side |
| Late joiner sees an empty room | Only deltas are broadcast | Send and apply an initial room snapshot |
| A remote avatar jumps or trails badly | Render loop consumes raw network deltas | Separate accepted state from interpolation |
| Old movement overwrites new movement | No sequence or server ordering rule | Reject stale updates |
| A refresh creates duplicate players | Identity and connection IDs are conflated | Specify resume versus new-session semantics |
| Ghost players remain | Disconnect and timeout cleanup differ | Make both paths idempotent |
| State leaks between rooms | Broadcast or store lacks a room key | Scope subscriptions, writes, and cleanup |
| Cosmetics update locally only | UI mutates presentation but not replicated state | Route the accepted change through the shared store |
| QA passes only with a fake second player | Fixture replaced the visitor path | Keep fixtures opt-in and validate real clients |
| Clone contacts the original service | Endpoint embedded in bundle or fallback | Make endpoint local/configurable and inspect the built network log |

## Handoff

Leave the project with:

- `REALTIME_SPEC.md` and the completed multi-client validation matrix;
- commands to start both the client and the local realtime authority;
- documented environment variables with safe local defaults;
- a description of exact and approximate protocol semantics;
- automated state or protocol tests where the repository supports them;
- no captured user payloads, production endpoints, credentials, fake default
  participants, or research traffic in the shipped application.
