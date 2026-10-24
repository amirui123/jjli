# Profiling performance

Primordia does most of its work on the GPU. Start with a GPU timeline: a CPU profile dominated by waits does not
tell you which simulation kernel is expensive. Measure throughput separately, without the profiler attached.

## Repeatable throughput

Build with `cargo build --release --locked`, then run a fixed world, preset, seed, size and frame count:

```powershell
./target/release/primordia render -w physarum -p dendrites --seed 1 --width 1920 --height 1080 `
    --frames 1800 --max-fps 0 --json -o target/perf-physarum.png
```

The result's `secs` covers the frame loop and final capture, not opening the GPU and constructing the world. Divide
it by the frame count for elapsed time per frame; this is **not** a GPU timestamp measurement. Repeat runs and
alternate the original and changed binaries. Keep other GPU workloads closed and use the same adapter and backend.
Use the same frame count too: the cost of a particle neighbourhood can grow as the simulation forms dense clusters.

`--metrics target/perf.csv` includes the measurements used by the interactive window and exploration. Omitting it
measures a render without that work. The world still renders every frame, preserving trails and auto-contrast;
bloom, tonemapping and image readback run only for captured frames. A headless still therefore does not measure the
full interactive frame, which also has post-processing, egui, presentation and display pacing on every frame.

## NVIDIA Nsight Systems on Windows

The following captures Vulkan API calls and GPU pass ranges without requiring CPU sampling. It was verified with
Nsight Systems 2024.2.3 and an RTX 4090. Use a fresh PowerShell session, and adjust the installation path to your
version. No system environment or registry changes are needed.

```powershell
$nsight = 'C:/Program Files/NVIDIA Corporation/Nsight Systems 2024.2.3/target-windows-x64'
$env:WGPU_BACKEND = 'vulkan'
$env:WGPU_DEBUG = '1'
$env:VK_LAYER_PATH = "$nsight/vulkan-layers"
$env:VK_INSTANCE_LAYERS = 'VK_LAYER_NV_nsight-sys'
$env:ENABLE_VK_LAYER_NV_nsight_sys = '1'

& "$nsight/nsys.exe" profile --trace=vulkan,vulkan-annotations --sample=none --cpuctxsw=none `
    --vulkan-gpu-workload=individual --output=target/physarum-profile `
    target/release/primordia.exe render -w physarum --seed 1 --width 1920 --height 1080 `
    --frames 1800 --max-fps 0 --metrics target/physarum-profile.csv -o target/physarum-profile.png

& "$nsight/nsys.exe" stats --report vulkan_gpu_marker_sum,vulkan_api_sum `
    --format csv --output target/physarum-profile target/physarum-profile.nsys-rep
```

The explicit layer settings mattered on the tested installation: an initial capture without them produced a valid
report file but **no Vulkan events**. Check the report diagnostics and the exported tables before interpreting it.
`WGPU_DEBUG=1` exposes the pass names already present in the code, such as `physarum step`, `pl step` and `rd prepare`.
Use a new output name for another capture, or deliberately pass `--force-overwrite=true` to replace one.

Open the `.nsys-rep` in Nsight Systems for the timeline. The ranges identify passes; inspect the GPU workloads
within them for execution time. The Vulkan API summary includes CPU time waiting for the GPU and compiling
pipelines. Exclude one-off world setup,
Lenia's nursery (`lenia offline`) and an initial warm-up when comparing steady simulation costs. Check the number
of captured instances: this profiler version did not export timings for every submitted frame at process exit.

Nested debug ranges overlap: do not add a parent range to its children, or treat the summary's percentage of all
ranges as a share of frame time. On the tested profiler, labels inside a single compute pass attributed almost
all its duration to the first inner label. A range could also close before its final dispatch completed. The
range summary therefore understated some compute costs substantially. Use the actual GPU workload intervals,
including the final dispatch, or timestamp queries with appropriate GPU synchronisation. A temporary build with
one dispatch per named compute pass makes those workloads easier to identify; the label duration alone still
does not measure the dispatch. Splitting passes changes scheduling, so confirm any proposed improvement on the
normal build, without tracing, and remove the temporary pass splitting afterwards.

To profile the actual window, replace the headless command with `--world physarum --preset dendrites --seed 1
--exit-after 15`. This opens a window and exits automatically. Keep its resolution and simulation resolution fixed
across comparisons, and account for the frame cap and presentation waits separately from simulation time.

## Checking an optimisation

Compare state or decoded PNG pixels and measurement CSVs on the same GPU, driver and backend, with the same inputs.
Include several presets and small, uneven domain sizes that exercise torus edges. Preserve the simulation step
count, precision and rendering history unless changing their behaviour is the explicit purpose of the work.
Run the repository checks in [CONTRIBUTING.md](../CONTRIBUTING.md). Keep only changes that improve the measured
workload; replacing arithmetic with memory traffic can be slower, even when it removes repeated work.
