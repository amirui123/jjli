# Pillar 09 Blueprint: Ultra-Low-Size & Rust-Grade Web Stack Architecture

## 1. The Winning "Surgical Hybrid" Formula (`14–28 KB` Initial Gzipped Payload)
1. **Layer A — Fine-Grained Zero-VDOM UI Shell (`1.0 KB – 6.8 KB` gzipped):**
   - **Svelte 5 Runes (`$state`, `$derived`, `$effect`):** `~2.5–3.6 KB` runtime; compiles templates to surgical DOM operations.
   - **SolidJS 2.0 (`@solidjs/signals` + `alien-signals` push-pull graph):** `~4.5–6.8 KB` runtime; `#1` reactivity throughput in `krausest/js-framework-benchmark`.
   - **VanJS (`vanjs-org/van`):** `1.0 KB` gzipped reactive DOM for single-file tools.
   - **Astro 5/6 Islands:** `0 KB` default JS for static/marketing sections.
2. **Layer B — Surgical Wasm Compute Kernels (`107 B – 6 KB` gzipped):**
   - **MoonBit (`moonbitlang`):** `107 B` minimum Wasm output; `27 KB` full engine footprint.
   - **Zig (`wasm32-freestanding -O ReleaseSmall`):** `232 B – 4 KB` zero-libc SIMD128 kernels for audio, particles, and pixel framebuffers.
   - **Rust (`#![no_std]` + `#[wasm_bindgen]` + `wasm-opt -Oz`):** `1.5–4.7 KB` memory-safe kernels (`johnthagen/min-sized-rust`, `ealmloff/sledgehammer_bindgen`).
3. **Layer C — Zero-Copy Shared Memory Bridge (`WebAssembly.Memory`):**
   - Read/write directly into `new Float32Array(wasmMemory.buffer, ptr, len)` and `new Uint8ClampedArray(wasmMemory.buffer, fbPtr, w * h * 4)`.
4. **Layer D — All-Rust Compiler Pipeline (`Vite 8 + Rolldown + Oxc + LightningCSS + Tailwind v4 Oxide`).**
