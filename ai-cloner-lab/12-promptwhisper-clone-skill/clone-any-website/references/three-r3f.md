# Three.js and R3F

## Contents

- Recommended project shape and loading
- Measured rendering contract and pass order
- Materials, authored transforms, geometry, and animation
- GLB scene inspection and surgical asset editing
- Shared local, NPC, and remote rendering
- Camera-relative elements and physics
- Performance and canvas validation

Read this reference for WebGL, Three.js, React Three Fiber, skinned characters,
custom materials, or 3D physics.

## Recommended Shape

Use the existing project structure when one exists. For a new R3F project,
prefer:

```text
src/
  app/
  components/r3f/
  lib/<topic>/
    loaders/
    r3f/
    assets.ts
    audio.ts
public/<topic>/
  geometries/
  images/
  audio/
  libs/
docs/research/
```

Keep runtime paths behind one base-path helper so local development, a root
deployment, and a GitHub Pages subpath all resolve the same assets.

## Loading

- Load async scene assets through Suspense-aware hooks.
- Wrap independent NPCs or props in separate Suspense boundaries when streaming
  should not block the entire scene.
- Signal readiness from an effect after the rendered subtree commits.
- Preload only what the next interaction needs.
- Surface HTTP and decoder failures visibly during development.

## Renderer First

Match these before tuning object colors:

- output color space;
- tone mapping and exposure;
- DPR and antialiasing;
- clear color or sky;
- light intensities;
- postprocessing order.

A color mismatch at this level invalidates material-by-material tuning.

## Measured Rendering Contract

Treat the rendered style as one ordered system rather than a collection of
object colors. Create `docs/research/RENDERING_SPEC.md` from the bundled template
and fill it from browser observations, public assets, and client-delivered
constants before visual polish.

Lock the frame in this order:

1. canvas context options, output color space, tone mapping, and exposure;
2. CSS viewport, drawing-buffer resolution, DPR policy, and antialiasing owner;
3. projection, FOV or orthographic bounds, near/far planes, camera transform,
   target offsets, and follow smoothing;
4. clear color, sky, fog, lighting, and shadow frame;
5. authored geometry, transforms, layer counts, and scene density;
6. shared material families, texture sampling, and custom shader globals;
7. animation, environmental VFX, and transparent or screen-space layers;
8. postprocessing passes in exact order, including passes that are neutral or
   absent in the target;
9. device branches and the visual invariants they preserve.

Do not compensate for an incorrect camera with object scale, for incorrect
color management with per-material colors, or for a missing decoration layer
with heavier postprocessing. Those changes may improve one screenshot while
making the rendering model less faithful.

Keep a fixed target state while tuning each layer. Where practical, add
development-only toggles that isolate sky, fog, shadows, material shading,
decorations, and each post-process pass. Compare one gate at a time, then verify
the complete chain because passes interact.

### Postprocessing Order

Record both the pass order and buffer dependencies. Depth, normal, motion, and
history buffers can change cost and visible output even when the final pass has
the same name.

- Match whether antialiasing is native, post-process, both, or absent. Do not
  silently combine native MSAA with SMAA/FXAA/TAA when the target uses one owner.
- Apply outline, grade or LUT, grain, bloom, vignette, and antialiasing in the
  observed order.
- Treat an intensity of zero and an absent pass as meaningful evidence. Do not
  add grain, bloom, vignette, saturation, or comic grading merely because it
  seems consistent with the art direction.
- Re-check sampled colors after the full chain; a correct material color can be
  wrong in the final frame after grading.

When a coupled proprietary pass cannot be ported, reproduce its visible inputs
and thresholds with the smallest clean-room equivalent. Document missing buffer
semantics and compare silhouettes, depth breaks, surface breaks, and distance
fade separately.

## Atlases and Toon Materials

Small palette atlases often color terrain, clothing, and props through authored
UVs. Configure them with:

- nearest filtering;
- sRGB color space for color data;
- clamp-to-edge wrapping;
- no guessed per-mesh replacement colors.

When a custom engine shader is too coupled to port, combine the same atlas with
a standard toon material, a small `DataTexture` gradient, and an independent
outline pass. Compare final pixels before deciding it is insufficient.

## Global Shading Contract

Make all material families participate in the same global color, fog, shadow,
and output-color contract. Built-in scene fog does not automatically affect a
custom `ShaderMaterial`; implement the observed fog function in water, foliage,
particles, curves, and other custom shaders. Include the correct output color
conversion when a raw shader bypasses the engine's normal chunks.

If the target uses a painted light/shadow pair, derive it from the sampled atlas
color or the observed shader transform rather than tuning a gray ambient light.
Keep the transform shared across terrain, characters, NPCs, and remote entities
unless the target exposes distinct thresholds.

For every texture, classify it as color data, linear data, normal data, mask,
LUT, or lookup atlas before setting color space, filtering, mipmaps, wrapping,
or anisotropy. A color atlas may require nearest sRGB sampling while a LUT or
noise texture must remain linear.

## Authored Transforms and Scene Completeness

Preserve authored world transforms and counts before adding procedural
placement. Do not normalize a position vector, snap it to a surface, recompute
rotation from a normal, or merge away a custom attribute unless evidence shows
the target does so. These seemingly reasonable operations can erase height,
heading, spacing, and entire entities whose projection misses a collider.

For every repeated environment or character set, record:

- expected entity and layer counts;
- source position, rotation, scale, coordinate system, and parent frame;
- whether the transform is authored, simulated, instanced, or projected;
- custom geometry attributes consumed by shaders or instance expansion;
- visible geometry versus collision or hit geometry;
- the clean-room behavior used when a private worker or packing format cannot
  be reproduced.

Validate scene density and silhouette before material polish. A beautiful
shader cannot compensate for missing foliage, NPCs, curves, foam, smoke, or
other authored layers.

## Skinned Meshes

- Rebuild the exact bone hierarchy.
- Preserve bind transforms and parent indices.
- Bind every clothing and body mesh to the intended skeleton.
- Call `normalizeSkinWeights()` after binding when decoded weights are not
  guaranteed to sum to one.
- Reuse clips deliberately; do not share mutable mixers accidentally.
- Dispose per-instance materials and mixers on unmount.

React Strict Mode can mount, clean up, and mount again. Make animation playback
self-healing:

```ts
if (!action.isRunning()) {
  action.reset().play();
}
```

## Shared Local, NPC, and Remote Rendering

When a multiplayer scene reuses the same character family, keep geometry,
skeleton construction, animation clips, atlas configuration, painted shading,
fog, outline, shadow, and outfit assembly on one shared rendering path. Give
each instance its own mutable mixer, actions, material uniforms, and cleanup.

Apply network interpolation outside the visual rig. The replicated pose should
move the remote instance, while its renderer remains visually equivalent to the
local and NPC versions. Do not replace remote participants with reduced meshes,
flat colors, missing accessories, or a second decoration stack unless the
target visibly does so.

Initialize multiplayer inside the normal fully decorated scene. Presence should
add remote entities to the existing environment, not switch the experience to
a visually cheaper or incomplete copy. Verify local, NPC, and remote entities
under the same camera, light, fog, outline, and postprocessing chain.

## Batched Geometry

Inspect actual attributes. If geometry represents multiple logical objects:

1. identify the per-vertex or per-face object id;
2. split triangles without losing material attributes;
3. recompute bounds and normals only when needed;
4. apply the source layout formula;
5. verify every element, not only the first.

## GLB Scene Inspection and Surgical Asset Editing

Visible labels, logos, and props may be baked geometry rather than DOM
or runtime text. Inspect the scene graph before adding an overlay. Record:

- node and mesh names;
- parent order, local translation, rotation, and scale;
- accessor bounds, indices, normals, UV ranges, and material name;
- `extras` / `userData` used by gameplay;
- collider children and physics naming conventions;
- compression extensions and the runtime-selected asset variant.

Prefer a surgical glTF edit over re-exporting the whole scene through another
authoring tool. Preserve unrelated nodes, hierarchy, materials, animations,
extras, and extension contracts. When the project ships both `model.glb` and a
compressed variant, update and load-test both or deliberately change the loader
to one documented source of truth.

Palette-atlas assets often use a constant UV for an entire mesh. Preserve that
UV on every generated vertex; assigning the material name without its authored
UV can sample the wrong palette color.

When editing Draco assets through glTF-Transform, register the matching decoder
and encoder. Inspect the written file again: newly generated non-indexed
primitives may remain uncompressed even when the rest of the file uses Draco.
Accept the size delta explicitly or run a compatible optimization pass.

## Camera-Relative Elements

For an element that stays in front of the camera while the world moves, keep it
in the scene and update it every frame:

```ts
position.copy(camera.position).addScaledVector(forward, distance);
quaternion.copy(camera.quaternion);
```

Do not assume an R3F camera is attached to the rendered scene graph. Parenting
an element to it can make the element disappear.

## Moving Lights and Shadow Stability

For a light or orthographic shadow window that follows a player, camera target,
or curved world, identify the exact reference frame. Do not make the light
inherit instantaneous avatar heading when it should follow the camera focus or
surface frame; that rotates shadows across the entire scene during a turn.

If the target has stable moving shadows, snap the shadow projection center to
its texel grid after computing the desired frame. Record shadow-map size,
orthographic extent, near/far, bias, normal bias, radius, and follow smoothing
together. Tuning only resolution will not fix crawling, acne, peter-panning, or
large-scale shadow rotation.

## Physics

- Match world units before tuning force.
- Separate visual geometry from simple collision geometry when appropriate.
- Match mass, damping, friction, restitution, sleeping, and solver step.
- Apply small impulses and verify the first contact before adding dramatic
  motion.
- Change damping after impact when the original settles quickly.
- Validate edge-on, sliced, or fractured faces with the intended material side.
- When replacing a visible physics-backed mesh, preserve its node name, extras,
  collider ownership, initial transform, and reset registration.

## Audio and Slow-Load Stability

Do not run per-frame audio setters against sounds that have not loaded. Some
audio libraries queue `rate`, `volume`, `mute`, or `seek` calls until readiness;
issuing them every render tick can produce a large deferred queue and recursive
overflow on a slow first load. Gate spatial/rate/volume updates on the library's
loaded state, then verify mute, blur/focus, and click-to-start audio unlock.

## Performance

- Merge truly static meshes by material.
- Reuse geometry and textures.
- Instance repeated props.
- Throttle noncritical raycasts.
- Cap DPR.
- Scale shadow maps by device tier.
- Reduce normal-pass, MSAA, outline, or particle cost only within an observed
  lower-tier branch.
- Add touch controls only when the target supports mobile interaction.
- Dispose render targets, materials, and generated geometry.
- Define an evidence-based frame-time, load-time, memory, or draw-call budget
  when performance is part of the observed experience; do not call a branch
  optimized without a recorded target and measurement.

Prefer reductions that preserve the scene's visual skeleton: adapt DPR within
the observed cap, lower shadow resolution, reduce normal-buffer work, and trim
secondary particles before removing participants, authored decoration layers,
camera behavior, silhouette edges, or gameplay systems. When an outline is
high-salience, a low tier can retain depth silhouettes while dropping the
normal-buffer contribution. Match the target's degradation policy when known.

## Canvas Validation

Confirm:

- the canvas contains nonbackground pixels;
- it remains nonblank after resize and interaction;
- the main subject stays framed at desktop and mobile sizes;
- authored entity counts and decoration layers remain complete;
- custom materials share the intended fog, color, shadow, and output contract;
- local, NPC, and remote variants use the same visual language when present;
- postprocessing order and antialiasing ownership match the measured contract;
- dynamic content moves between captures;
- WebGL-unavailable and context-loss behavior matches the observed target when
  it provides a fallback or recovery path;
- no UI overlaps the canvas incorrectly;
- all assets load from the clone's origin.

Use normal browser screenshots for WebGL. Avoid using `canvas.toDataURL()` as the
primary test when drawing-buffer preservation is disabled.
