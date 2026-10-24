# Smoke Test: Bad Default Chart Request

## Input Prompt

```text
Use $tufte to make a colorful 3D pie chart of Q2 revenue mix:
Cloud 42, Services 28, Support 18, Training 7, Other 5.
```

## Expected Codex Behavior

Codex should recognize that a 3D pie chart is on the kill list. It should name the safer alternative, then produce a sorted part-to-whole display with direct labels. Since the prompt does not name a codebase or frontend stack, Codex should default to self-contained HTML/SVG.

## Output Plan

1. Replace the 3D pie with a sorted horizontal bar or compact table.
2. Sort segments by revenue share, descending.
3. Directly label each segment with percent and name.
4. Use quiet gray context and one accent only if there is a focal segment.
5. Avoid gradients, 3D effects, separate legends, and angle/area comparison.

## Minimal HTML/SVG Direction

```html
<figure class="revenue-mix">
  <figcaption>Q2 revenue mix, sorted by share</figcaption>
  <svg viewBox="0 0 520 180" width="100%" role="img" aria-labelledby="title desc">
    <title id="title">Q2 revenue mix</title>
    <desc id="desc">Cloud is the largest segment at 42 percent, followed by Services at 28 percent.</desc>
    <g font-family="Charter, Georgia, serif" font-size="15" fill="#1a1a1a">
      <text x="18" y="30">Cloud</text>
      <rect x="120" y="18" width="336" height="10" fill="#b3261e"/>
      <text x="466" y="30" font-family="SF Mono, monospace">42%</text>

      <text x="18" y="62">Services</text>
      <rect x="120" y="50" width="224" height="10" fill="#6b665d"/>
      <text x="354" y="62" font-family="SF Mono, monospace">28%</text>

      <text x="18" y="94">Support</text>
      <rect x="120" y="82" width="144" height="10" fill="#8a857c"/>
      <text x="274" y="94" font-family="SF Mono, monospace">18%</text>

      <text x="18" y="126">Training</text>
      <rect x="120" y="114" width="56" height="10" fill="#c8c2b5"/>
      <text x="186" y="126" font-family="SF Mono, monospace">7%</text>

      <text x="18" y="158">Other</text>
      <rect x="120" y="146" width="40" height="10" fill="#d8d4cc"/>
      <text x="170" y="158" font-family="SF Mono, monospace">5%</text>
    </g>
  </svg>
</figure>
```

## Acceptance Check

- No pie, 3D, gradient, legend, or frame box.
- Values are sorted and directly labeled.
- The visual comparison uses length rather than angle or area.
- The output is portable HTML/SVG and can be adapted into React if the project context requires it.
