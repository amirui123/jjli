# Component or Scene Subsystem Specification

## Contract

- Name:
- Target file or module:
- Reference captures:
- Interaction model:
- Exact or approximate:
- Verification path:

## Structure and Ownership

- Parent and children:
- DOM, canvas, or renderer ownership:
- Shared dependencies:

## Geometry and Appearance

- Viewport and state used for extraction:
- Bounds, layout, and coordinate system:
- Typography, color, material, lighting, or postprocessing:
- Layering, overflow, and compositing:

## Content and Assets

| Role | Local path | Source record | Variant or state |
| --- | --- | --- | --- |
| | | | |

## States and Behavior

| State / transition | Trigger | Before | After | Timing / easing | Reset / interruption |
| --- | --- | --- | --- | --- | --- |
| | | | | | |

## Shared State

Delete this section when the subsystem is not replicated across clients.

- Proposer and authority:
- Replicated fields and presentation-only fields:
- Initial snapshot or late-join source:
- Ordering, interpolation, and conflict behavior:
- Leave, timeout, and reconnect cleanup:

## Responsive and Performance Branches

- Desktop:
- Tablet:
- Mobile:
- Reduced motion:
- Lower performance:

## Acceptance Criteria

- Visual:
- Interaction:
- Multi-client, when applicable:
- Network and console:
- Build or tests:

## Known Approximation

- Difference:
- Reason:
- Expected impact:
