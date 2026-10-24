# UX Psychology

A Claude Agent Skill for auditing interfaces through **behavioral psychology + conventional UX/usability principles**.

It is designed to answer four practical questions:

- What is already working well?
- What needs minor improvement?
- What needs major improvement?
- What exactly should change, and why?

The skill is evidence-aware: it distinguishes **OBSERVED**, **INFERRED**, and **HYPOTHESIS** findings, avoids inventing analytics or user research, and protects good design from unnecessary redesign.

## What it evaluates

### Behavioral psychology

- Smart Defaults / Decision Fatigue
- Goal-Gradient Effect / Progress
- Reciprocity
- Endowment Effect + IKEA Effect
- Loss Aversion
- Contrast Effect / Anchoring

### General UX

- Visual and information hierarchy
- Cognitive load
- Discoverability and affordance
- Consistency and terminology
- Feedback and system status
- Error prevention and recovery
- Accessibility
- Mobile/responsive considerations
- Trust and perceived control
- Task continuity

## Output

A full audit can include:

1. Executive Summary
2. What's Already Strong
3. Minor Improvements
4. Major Improvements
5. Psychology Scorecard
6. Before → After Recommendations
7. UX Risks
8. What's NOT Worth Changing

Each meaningful finding can include:

- Element
- Observation
- Principle
- Why it matters
- Recommended change
- Before
- After
- Expected UX effect
- Confidence
- Evidence basis

## Ethical UX

The skill is intended for **clearer, easier, more trustworthy UX**, not manipulation.

It flags patterns such as:

- fake scarcity or urgency
- fake progress
- deceptive defaults
- hidden fees
- misleading CTA wording
- forced continuity
- asymmetric opt-out/cancellation
- fabricated social proof
- other dark patterns

When a dark pattern is found, the skill should explain the issue and recommend an honest alternative rather than reproduce the pattern as a "fix."

## Installation in Claude

Claude's current custom-skill upload flow is:

**Customize → Skills → + → Create skill → Upload a skill**

Upload the ZIP produced from this repository.

The ZIP must contain the skill folder as its root:

```text
ux-psychology.zip
└── ux-psychology/
    ├── SKILL.md
    ├── README.md
    └── references/
        ├── psychology-principles.md
        ├── ux-heuristics.md
        ├── ethical-ux.md
        └── testing-metrics.md
```

After uploading, enable the skill and test it with a screenshot or UI flow.

## Example prompts

```text
Review this UI using the UX Psychology skill.
```

```text
Audit this signup screen. Tell me what is perfect, what is minor, what is major, and exactly what I should change.
```

```text
Analyze this 5-screen onboarding flow and identify the point with the most psychological friction.
```

```text
Compare these two pricing designs and explain the UX/psychology tradeoffs.
```

```text
Why does this UI feel confusing? Audit it and give me concrete before → after changes.
```

## Repository structure

```text
ux-psychology/
├── SKILL.md
├── README.md
└── references/
    ├── psychology-principles.md
    ├── ux-heuristics.md
    ├── ethical-ux.md
    └── testing-metrics.md
```

## Design philosophy

This skill is intentionally **diagnostic, not redesign-everything**.

A good audit should preserve deliberate decisions that already work, reserve **MAJOR** for meaningful UX problems, and make uncertainty explicit when evidence is missing.

## Inspiration

The behavioral-psychology layer is based on concepts discussed in the referenced UX psychology video:

https://www.youtube.com/watch?v=2TlIg3VokY8

The skill is an independent implementation of those concepts combined with a broader usability-review framework. It is not affiliated with the video's creator.

## Version

**1.1.0**

### Changes in 1.1.0

- Fixed the skill description to comply with Claude's 200-character metadata limit.
- Clarified dark-pattern behavior: flag and recommend ethical alternatives.
- Added this README for Claude upload and GitHub distribution.
- Preserved the existing psychology, usability, evidence, severity, and testing framework.
