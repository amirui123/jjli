---
name: sonicproof
description: Listen to AI-generated sound before handing it over. Use whenever you generate or pick sound effects, ambience or music (Stable Audio or any text-to-audio tool) — generate several takes, check them against the prompt and for technical problems with Sonicproof, retry with new seeds or a rephrased prompt, and deliver the best take with its scorecard. Also for "does this sound fit the picture", finding sounds in a local library, and cleaning duplicate files.
---

# Sonicproof: generate → check → retry → pick

You cannot hear. Sonicproof can: it scores how much a clip sounds like its prompt (EmbeddingGemma 2, any
language) and measures what needs no ears (loudness, peaks, clipping, silence, clicks, phase, loop seams).
Use it on every generated sound before you show it to the user — never deliver an unchecked take.

## Setup

Sonicproof is an MCP server (tools `check`, `rank`, `qc`, `report`, `fit`, `search`, `dedupe`, `index`).

1. **Download the model once, in a terminal** (~1.5 GB, no Hugging Face account or token). The MCP server does
   not download inside a tool call; if the model is missing, tools fail with a message asking for this step:

   ```bash
   uvx --from "sonicproof[model]" sonicproof doctor --load
   ```

2. **Add the server:**

   ```bash
   claude mcp add sonicproof -e HF_HOME="${HF_HOME:-$HOME/.cache/huggingface}" -- uvx --from "sonicproof[model]" sonicproof mcp
   ```

   `HF_HOME` makes the server use the same model cache as the terminal (MCP servers get a reduced environment).
   On Windows (PowerShell / cmd) that syntax doesn't work and isn't needed: the server finds the default cache
   itself, so run `claude mcp add sonicproof -- uvx --from "sonicproof[model]" sonicproof mcp`, adding
   `-e HF_HOME=<absolute path>` only if the user set `HF_HOME` (or `-e HF_HUB_CACHE=…` for that one).

Before Sonicproof is on PyPI, `uvx --from "sonicproof[model]"` fails. Use a clone instead: `uv sync --extra model`
inside it, then replace `uvx --from "sonicproof[model]" sonicproof` with
`uv run --project /absolute/path/to/sonicproof --extra model sonicproof` in both commands above.

Without MCP, the CLI does the same with `--json`: `sp rank "prompt" a.wav b.wav --json`,
`sp report f.wav "prompt" --json`, `sp qc f.wav --json`. Exit codes: 0 done (whatever the verdict), 1 `qc` found
a failure, 2 bad input (missing / unreadable / empty file), 3 setup problem (model extra, model download,
ffmpeg). With `--json`, an error prints `{"error": {"code", "message", "file"}}`.

**Pass absolute paths.** Relative paths resolve against the server's working directory, not yours. If the
generator returns files on another machine, download them first.

## How to read the results

- `score` is in σ (standard deviations above chance). Verdict: **strong** ≥ 2.0, **plausible** ≥ 1.1,
  **weak** ≥ 0.3, **miss** below. Treat strong/plausible as "sounds like the prompt".
- `heard_as` = what the clip sounds like instead (vocabulary descriptions; `agrees: true` = same meaning as
  the prompt). This is your ears — use it to explain a miss and to rephrase.
- Technical checks: `qc` always returns a list, one record per file, each with `status` and `checks[]`
  (`report` has the same under `qc.status` / `qc.checks[]`). Each check has `status` — `fail` must be fixed,
  `warn` should be mentioned, `info` / `pass` are fine — and `hint`, the one-line fix. A file that could not
  be read has `status: "error"` and an `error` object.
- `report.overall`: **ship** / **review** / **redo** — the final word; it combines the verdict and `qc`.
- A silent file (nothing above −60 dBFS; short clicks do not count as silent) is always `verdict: "miss"` with `note: "silent"` and ranks last. Treat it as
  a failed generation and regenerate.
- Very short transients (clicks, door slams, gunshots, UI blips) and textures made of them (crackling fire,
  sparks) are the model's weak spot — scores there are noisy and often weak even for a good take. Say so
  instead of over-trusting a number. It is a second opinion; the user should still listen.
- Pick by the score of the raw takes. Trimming, mono or normalizing can move the score a little — after
  processing, re-check `qc`, don't chase the score.

## The loop

1. **Write a check prompt**: the sound's *source + action* in plain words ("an old wooden door, creaking
   open slowly"). Leave out mixing and space words ("close-up, dry, reverb") — they lower the score
   without saying anything about the sound. The generator prompt can be richer; check against the core.
2. **Generate 3–4 takes** of the same prompt (different seeds). With Stable Audio MCP: `generate_audio`
   with `variations: 3`; SFX fields `sound_source` / `sound_action` / `sound_material` / `sound_space`.
3. **Rank**: `rank(prompt, files)` → best first.
4. **Decide**
   - Best is strong/plausible → `report(best, prompt)`; trust `report.overall` over the rank alone (add `loop: true` for loops, `target_lufs` if the user
     has a loudness target). Fix `fail`s and obvious `warn`s (trim silence, fade a cut-off tail, normalize
     loudness — Stable Audio MCP: `process_audio`), re-run `qc` on the fixed file. Done.
   - All weak/miss → read the best take's `heard_as`:
     - it heard something *related but off* (prompt "door creak", heard "a cat meowing / geese honking")
       → rephrase the action/material to steer away (longer, lower, "wood groan", "squeaky hinges") and
       generate new seeds;
     - it heard something unrelated or noise → simplify: shorter, more common words for the source;
     - nothing changes after a rephrase → raise generator guidance (Stable Audio `cfg` 3–5) or new seeds.
   - Stop after **3 rounds**. Deliver the best take so far and say plainly that it is a weak match and why.
5. **Deliver**: file, verdict + score, the top `heard_as`, technical status and what you fixed. Mention
   the runners-up only if they are close. Never claim certainty.

Keep every round's files (they are the user's material); point to the pick.

## Example (Stable Audio MCP + Sonicproof MCP, real run)

```text
generate_audio(audio_type="sfx", sound_source="an old wooden door", sound_action="creaking open slowly",
               sound_material="dry wood, rusty metal hinges", sound_space="indoor, close",
               duration_seconds=4, variations=3, seed=7000, title="door_r1")
download_urls(paths=[...wav, ...json]) → curl into ./sfx/
rank("an old wooden door, creaking open slowly", [door_r1_v1.wav, door_r1_v2.wav, door_r1_v3.wav])
  → all weak (+1.09σ / +1.07σ / +0.72σ); heard as "an alarm clock ringing", "a comedic honk"
     → the hinge squeal reads as a tone. Rephrase the action, new seeds:
generate_audio(..., sound_action="slowly creaking open on squeaky hinges, a long high squeal", seed=7100, ...)
rank("an old wooden door, slowly creaking open on squeaky hinges, a long high squeal", [door_r2_v1..v3])
  → door_r2_v1.wav +1.19σ plausible
report(door_r2_v1.wav, same prompt) → SHIP, technically clean
```

(Paths shortened here; pass absolute paths in real calls.)
`examples/stable_audio_loop.py` in the Sonicproof repository runs this loop as a script (two MCP clients).

## Other jobs

- **Sound for a picture**: `fit(file, picture=frame.png | clip.mp4, scene="words about the scene")`;
  `pictured_as` says what the picture shows in sound words — a good prompt when the fit is weak.
  `fit(video.mp4)` alone judges a video's own soundtrack.
- **Find a sound the user already has**: `search(directory, query="rain on a tin roof")`, or
  `like=example.wav`, or `picture=frame.png`. `directory` is the user's sound folder (not their home folder).
  `search` and `dedupe` refresh the index themselves, but the first index of a big folder can take minutes and
  outlast an MCP tool timeout — for those, ask the user to run `sonicproof index /path/to/folder` in a terminal
  once.
- **Duplicates**: `dedupe(directory)` lists copies (re-encodes, level changes, trims) and which to keep.
  It never deletes — ask the user before removing anything.
- Humans can do all of this visually: `sonicproof serve` opens a local workbench (English / 日本語).
