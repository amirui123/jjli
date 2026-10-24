# Performance harness

From `packages/sfx`, run `npm run bench:perf`. Requires Node 24, workspace dependencies, and Playwright Chromium (`npx playwright install chromium`). Quick run: `BENCH_RUNS=3 npm run bench:perf`. For another Chromium installation, set `BENCH_CHROMIUM_EXECUTABLE` to its absolute executable path.

Output defaults to `packages/sfx/bench/perf/.out/`. Override with `BENCH_OUT` (absolute, or relative to the package directory regardless of working directory). Timestamped JSON and Chrome `.cpuprofile` files go to `<out>/raw/`; the combined report goes to `<out>/results.md` after all scripts succeed. Load profiles in Chrome DevTools. Custom output directories should be kept outside version control.

Individual scripts: `node bench/perf/node.bench.ts`, `node bench/perf/browser.bench.ts`, `node bench/perf/size.bench.ts`. Run `npm run build` first. The existing size budget gate and scheduling benchmark remain separate checks. Browser benchmarks reuse the server on port 3908 or start one, stopping only their own server.

## Compare builds

Each argument is `base` (the package's `dist/`) or a directory name under `packages/sfx/.perf-variants/` containing another build's dist output. For example, build another checkout, then copy its dist into this checkout with `mkdir -p .perf-variants && cp -r /path/to/other/packages/sfx/dist .perf-variants/main`. No source or dist patching is performed by the harness.

```sh
node bench/perf/variants.bench.ts base main
node bench/perf/wav.bench.ts base main
node bench/perf/react.bench.ts base
node bench/perf/react.bench.ts main
```

Chromium and WAV runs interleave variants with one discarded warmup. WAV renders each build's whole catalog once at 48 kHz, then measures whole-catalog `encodeWav` batches for 16/24/32-bit × mono/stereo, reporting median/p95. React measures 200 memoized consumers over 100 parent updates and also accepts a dist path relative to the package directory (or an absolute path). Arguments default to `base`.

Default: 15 measured runs (`BENCH_RUNS` overrides). p95 uses nearest rank; with three runs it is the maximum. Imports use fresh processes; cold browser measurements use fresh pages. Graph timing excludes context construction and rendering but includes initial noise allocation. Encoding excludes rendering. Noise remains unseeded to match production. MB and Msamples use decimal units and count output channel samples individually.

Main-thread timings are not audible latency. Browser timer resolution can produce zero for cheap calls. Heap deltas are allocation proxies affected by GC and callbacks, not native audio memory. Node also reports retained buffer bytes. Bind dispatch includes event creation and playback; diagnostic profiles run separately and exclude native audio-thread CPU. Compare on an idle machine with matching hardware and Node/browser versions.
