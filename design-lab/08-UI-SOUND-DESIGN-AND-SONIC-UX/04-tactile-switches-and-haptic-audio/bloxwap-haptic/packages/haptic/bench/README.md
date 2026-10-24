# Haptic performance benchmark

Run `npm run bench` from the repository root with Node 24 and installed workspace
dependencies. It rebuilds dist, prints Markdown tables, and writes the environment,
configuration, summary measurements, per-cycle heap values, diagnostic counts, and
printed tables to `bench/results/latest.json` (ignored by git). Run twice on an idle
host and compare matching rows. No new dependencies or network access are needed.
The package's publication allowlist excludes this entire directory.

`run.mjs` coordinates bundles and isolated workers. `worker.mjs` runs SSR/client
scenarios; `lib/` holds sampling, subprocess capture, bundling, and resource probes.

- **Bundles:** esbuild bundles built dist for ES2020 with React external, minifies,
  then measures bytes with Node's default gzip/Brotli compression. Full ESM/CJS
  entries retain all exports. Single exports use `import { X }; console.log(X)`
  to permit tree shaking. The two direct web-haptics imports isolate its presets
  and its public engine class (including all class methods). Dependency bytes are
  uncompressed `bytesInOutput` from esbuild, not attributable compressed bytes.
- **Cold imports:** nine fresh production Node processes after three discarded
  runs per entry. The clock surrounds `await import()`, including dependencies
  but excluding process startup. CJS uses Node's dynamic import interoperability.
  React alone is the baseline; filesystem caches remain warm.
- **SSR:** production `renderToString` of preconstructed 1/100/1000-target trees.
  `ms/render` is whole-tree latency; ops/sec is 1000 divided by median latency.
- **Client timings:** ordinary production React, no StrictMode, jsdom,
  `createRoot` + `flushSync`. Production React 19 has no `act`; each update awaits
  a timer macrotask, an immediate, and another timer, then flushes again. This settles passive
  effects and the iOS routing update. These waits are included in the latency
  and introduce an approximately two-millisecond floor. Mount includes root/
  container creation and settling; unmount includes cleanup, settling, and host
  removal. Both vibration and iOS mount/unmount use 100 and 1000 instances.
  Rerenders create fresh elements/children, retaining stable option references
  except for the named prop. Feedback alternates presets; option objects change
  identity with unchanged fields. Each row has three warmups and nine samples.
- **Commits/renders:** an independent, untimed worker uses React's production
  profiling renderer and a React `<Profiler>` around the tree. A temporary copy
  of dist increments a counter at HapticTarget function entry to count actual
  component invocations (Profiler alone counts tree commits, not invocations).
  Counters are reset for each mount. Counts are reported as observed, not
  asserted, so optimizations that remove renders do not break the benchmark;
  only the iOS switch count is checked to confirm the iOS route ran.
  The copied file is removed in `finally`; timed workers import untouched dist.
- **Warmed taps:** nine batches after three warmups, each dispatching 200 clicks
  on one mounted instance; elapsed time including settling is divided by 200.
  iOS clicks target its overlay label, activating the switch and host action.
  Host actions and vibration calls are asserted. Imperative timing uses batches
  of 1000 awaited `triggerHaptic` calls. These are dispatch costs, not physical
  latency. The desktop warmed batch repeatedly restarts one engine's pattern;
  it does not represent 200 completed animations.
- **Routing:** each mode runs in its own process. Navigator is stubbed before
  importing dist because `WebHaptics.isSupported` is static at module evaluation.
  Vibration returns true; iOS has no vibration and uses iPhone/AppleWebKit;
  desktop has no vibration, Linux platform, and a UA without iPhone.
- **Resources:** a separate production 100-instance mount instruments listener
  registration and MutationObserver creation. DOM counts include elements and
  text nodes below body, excluding the root container. Body node deltas after
  taps include engine nodes outside the React tree. Desktop's hidden engine
  label contains text and a switch: three nodes per engine. First-tap deltas
  refer to one instance; cumulative deltas follow one tap on each of 100 distinct
  instances. Labels with `for="web-haptics-*"` independently count desktop engines.
  Vibration engines create no labels; constructor counts therefore use the
  separate instrumented dist worker (reported as `n/a` if the construction
  site in dist changes). No allocation-per-tap estimate is attempted.
- **rAF and first-use costs:** only the resource pass substitutes a queued rAF
  scheduler and drains each selection pattern with synthetic 60Hz timestamps.
  Counts include every scheduled callback through completion (not just the
  initial request). First-tap and remaining-99 average costs include dispatch,
  instrumentation, and synchronous frame draining, excluding node census and
  wall-clock animation waits. The remaining-99 average includes target lookup.
  These single observations have no percentile and can be noisy. Actual frame
  counts depend on pattern, refresh rate, throttling, and interruptions.
- **Cleanup:** unmount reports remaining observers/body nodes and listener
  registrations. Adds/removes are API call counts, while retained counts track
  unique target/type/callback/capture registrations. React retains delegated
  listeners on detached root containers; these are collectible and their balance
  is not evidence of a leak. Connected document/window listeners are separated.
  Probes begin after framework setup and restore globals before heap sampling.
- **Memory:** vibration only, `--expose-gc`, three warmup mount/unmount cycles of
  1000 untapped instances, then eight measured cycles with GC after each. The
  displayed byte delta is final minus initial heap, not a median or percentile;
  all cycle values are saved. This is a noisy retention signal, not leak proof.

Median and nearest-rank p95 use nine samples; p95 is therefore the maximum.
Compare runs on matching hardware, Node, and dependency versions. Two runs can
show repeatability but cannot establish statistical variance or causality.
jsdom has no layout/paint or real hardware: synthetic clicks cannot establish
trusted iOS activation, tactile delivery, browser frame budgets, or accessibility
behavior. Profiling and resource observations explain work performed, but are
not additive timing attribution. Source optimizations require separate A/B
measurements and browser/hydration/accessibility regression checks.
