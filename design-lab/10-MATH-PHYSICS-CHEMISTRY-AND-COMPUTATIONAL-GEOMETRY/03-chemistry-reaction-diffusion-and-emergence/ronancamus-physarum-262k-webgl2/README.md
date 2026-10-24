# Physarum

A slime mould in raw WebGL2. No library: 262 144 agents living in two textures, growing a transport network out of noise, fed by your pointer.

![A slime mould growing a glowing network](preview.gif)

**Live:** https://ronancamus.github.io/physarum/

Move the pointer to feed it. Press and hold for a feast. Keys 1 to 4 change its temperament (veins, lace, coral, storm), H shifts the hue, space pauses, R starts over. Left alone, the meal wanders on its own.

## How it works

*Physarum polycephalum* explores by laying a chemical trail and following it. Jeff Jones reduced that to three rules in 2010, and three rules are enough:

1. **Sense and move.** Each agent reads the trail at three points ahead of it (straight, left, right), turns toward the strongest one, and takes a step. If the trail is stronger on both sides than ahead, it tosses a coin. A small random hesitation keeps the paths from locking.
2. **Deposit.** Each agent adds a little trail where it stands.
3. **Spread.** The trail blurs and fades. Food is just more trail, poured where the pointer is.

Agents are pixels of an `RGBA32F` texture (x, y, heading). The trail is a single `R16F` channel that wraps at the edges, so the network has no border. One simulation step is three draw calls: a full-screen pass over the agent texture, a `gl.POINTS` draw with one vertex per agent (position read with `texelFetch` in the vertex shader, additive blending), and a full-screen blur with four bilinear reads instead of nine. Sixty steps per second, fixed, whatever the display does.

Two details make the difference between a few fat tubes and a living network:

- **Crowding.** A sensor does not return the trail value `v` but `v * exp(-0.55 v)`: a vein that is already crowded attracts less, so agents spread into secondary paths instead of collapsing onto the strongest one.
- **Rebirth.** Each step, 0.15 % of the agents are reborn at a random place. They are the ones who open new veins when the old ones have been eaten.

Rendering maps trail density to a cyan, magenta, orange palette, with a hot white core in the thickest veins, a soft vignette and 3 % of grain against banding.

The whole thing is about 200 lines, shaders included. It was written for the playground of [ronancamus.com](https://ronancamus.com), where the same organism grows over a projection-mapped scene.

## Run it

Open `index.html` through any static server, for example:

```sh
npx serve .
```

It needs WebGL2 with `EXT_color_buffer_float`, which every current desktop and mobile browser has.

## License

MIT.
