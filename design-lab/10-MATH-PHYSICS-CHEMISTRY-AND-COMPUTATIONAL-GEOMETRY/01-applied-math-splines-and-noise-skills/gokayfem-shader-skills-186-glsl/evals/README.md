# Evals

Does the `shader-art-coding` skill make Claude's shaders better? This suite measures it with
[`claude plugin eval`](https://code.claude.com/docs/en/plugin-evals). Each case runs with this plugin loaded and
again with no plugin, and the report shows both scores and their difference, `Δ`.

> **Running it costs money.** Every agent run and every judge call is a real model call on your account: billed to
> your API key, or counted against your plan. Validating the files is free; see [Validate](#validate-free).

## Cases

Six positive cases should trigger the skill. Three near-miss negatives sound shader-adjacent but should not.

| Case | Kind | The prompt asks for | Case-specific graders |
|---|---|---|---|
| `sdf-still-life` | positive | a raymarched bowl and fruit on a table | |
| `terrain-flyover` | positive | a camera flight over eroded desert mountains at sunset | |
| `cloud-layer` | positive | sunlit cumulus clouds drifting over a blue sky | |
| `poster-2d` | positive | a flat 2D poster: sun disc, mountain silhouettes, frame, halftone | |
| `fix-twist-holes` | positive, repair | a fix for a twisted column with holes. The prompt includes the shader, whose `map()` twists a box at 3 rad/unit with no Lipschitz correction | `twist-corrected` (judge) |
| `port-webgl1` | positive, repair | a port of a WebGL1 shader that uses `#version 100`, uniforms, `texture2D`, `gl_FragColor` and a sine hash | `samples-ichannel0`, `no-webgl1-io` |
| `neg-css-gradient` | negative | a "shader demo" animated gradient in plain CSS | `css-gradient`, `css-keyframes` |
| `neg-hlsl-compute` | negative | a Unity HLSL compute shader for a separable Gaussian blur | `hlsl-kernels`, `no-glsl` |
| `neg-matplotlib-noise` | negative | a Perlin-noise heatmap with matplotlib | `uses-matplotlib`, `saves-figure` |

Each positive prompt asks for the finished shader in `final.glsl`. Every positive case carries these five graders:

| Grader | Check | Counts toward the score |
|---|---|---|
| `mainimage` | `final.glsl` exists and has `void mainImage(out vec4 …, in vec2 …)` | yes, both arms |
| `no-banned-constructs` | `final.glsl` has no `gl_FragColor`, `texture2D(`, `#version` or `fract(sin(` outside `//` comments | yes, both arms |
| `ran-check` | the agent ran `glsl_tools.py check` on a `.glsl` file | no: with-plugin indicator (`arm: with-only`) |
| `check-clean` | the last checker output in the transcript was `0 error(s)` | no: with-plugin indicator (`arm: with-only`) |
| `skill-fired` | Claude invoked the `shader-art-coding` skill | no: excluded automatically, like every `tool_used: Skill` grader |

Each negative case has `skill-not-fired` (`tool_used: Skill`, `min: 0`, `max: 0`, `arm: both`), which counts in both
arms. Its other graders check that the agent did the non-shader task it was given.

### Why three positive graders do not count toward the score

`ran-check`, `check-clean` and `skill-fired` can never pass without the plugin, because without it the script and the
skill don't exist. Counting them would push the no-plugin score toward zero and inflate `Δ`. So `Δ` on positives
comes only from the output graders, and the indicators show in the with-plugin runs as the skill-trigger rate and the
clean-check rate. Under `--ablation none` all graders count.

### What "compile rate" means here

`claude plugin eval` has no custom-code graders, so a grader cannot compile the shader. The scored graders catch the
constructs that break Shadertoy and WebGL2 in both arms. A real glslang compile shows up only in the with-plugin
arm, through `check-clean`, and only when `glslangValidator` is on `PATH`; without it, `check` only lints. To get a
compile rate for both arms, run with `--keep-temp` and run
`python3 skills/shader-art-coding/scripts/glsl_tools.py check <run dir>/final.glsl` on each kept run.

## Requirements

- Claude Code v2.1.269 or later (`claude --version`) and git 2.31 or later.
- Credentials: export `ANTHROPIC_API_KEY`, or use the account or cloud-provider variables your normal sessions use.
- Recommended: `glslangValidator` (`brew install glslang` or `apt install glslang-tools`), so the skill's checker
  compiles as well as lints.
- Linux: `bubblewrap` and `socat` for the Bash sandbox. On Ubuntu 24.04 and later, bubblewrap also needs the
  AppArmor profile from the [sandboxing docs](https://code.claude.com/docs/en/sandboxing). The CI workflow installs it.

## Validate (free)

```bash
python3 tests/check_evals.py
```

This checks every `prompt.md` and grader against the documented fields and this suite's conventions. It also runs
the grader regexes on real inputs: the gallery shaders, the fixture shaders in the prompts, and real
`glsl_tools.py check` output. It makes no model calls. CI runs it in `checks.yml`.

## Run

Run from the repository root, which is the plugin root. Put the target `.` first and `--allow-tools` last, since it
takes a list. The cases need `Write` and `Edit` to save their output and `Bash` for the skill's checker. Without the
grant those tools are removed from the session and the positives fail. Granted Bash runs under the OS sandbox.

Smoke test: one case, one run, no baseline.

```bash
claude plugin eval . --case sdf-still-life --runs 1 --ablation none --max-cost-usd 2 --allow-tools Write Edit Bash
```

For scale: on the default model, one run of `port-webgl1` took 23 s and cost $0.15, and one run of
`neg-css-gradient` took 30 s and cost $0.15.

Full comparison: 9 cases × 3 runs × 2 arms = 54 agent sessions. Positive runs allow up to 40 turns. Add 3 judge calls
for each of the 6 `fix-twist-holes` runs. Set a ceiling you're comfortable with:

```bash
claude plugin eval . --model claude-sonnet-5-5 --judge-model claude-haiku-5-5 --threshold 0.8 --max-cost-usd 30 --allow-tools Write Edit Bash
```

Filters: `--tag positive`, `--tag negative`, `--tag repair`, or `--case 'neg-*'`. The first run in a terminal asks
`Trust this plugin directory?`. Answer `y`, or pass `--trust-plugin`.

Results go to `evals/results/<timestamp>/`, which is gitignored: `report.html` plus `aggregate-result.json`. When you're
signed in with a claude.ai subscription that has artifacts, the report is also published privately and the command
prints a `Published:` link. Pass
`--no-publish` to keep it local.

## Reading the result

- **Positives:** `WITH` is the share of output graders passed with the skill, and `W/OUT` is the same without it. A
  positive `Δ` means the skill improved output-rule adherence. Open the report to see the with-plugin
  `skill-fired`, `ran-check` and `check-clean` indicators per run.
- **Negatives:** `Δ` below 0 means the skill fired, or derailed the task, where it shouldn't have.
- **Exit code:** the default `--threshold` is `1.0`, so the command exits 1 when any case scores below perfect.
  `Δ` never changes the exit code.

## CI

[`.github/workflows/evals.yml`](../.github/workflows/evals.yml) runs the suite on manual dispatch only. Add an
`ANTHROPIC_API_KEY` repository secret, then go to Actions → evals → Run workflow. The inputs set the case glob, runs,
models, threshold and cost ceiling. The job uploads `eval-results` (report and JSON) and writes a per-case table to
the run summary.

## Adding a case

1. Create `evals/<name>/prompt.md`. Use only the documented frontmatter fields (`description`, `tags`, `runs`,
   `expected_outcome`, `model`, `max_turns`, `timeout_seconds`, `allowed_tools`, `append_system_prompt`, `env`, …).
   Double-quote any value that contains `: ` or ` #`. Write the body the way a user would type it, and name the output
   file in backticks.
2. Tag the case `positive` or `negative`. Copy the five shared graders into a positive case unchanged; a negative case
   needs `skill-not-fired.md`. Add graders for the case's own outcome. Prefer regex graders over long files and keep
   `llm` graders for short outputs.
3. Run `python3 tests/check_evals.py`, then a smoke run of the new case.

## Troubleshooting

- **`not granted` in the progress output:** add `--allow-tools Write Edit Bash`, after the target.
- **No `W/OUT` column, or "ablation requested but no plugin resolved":** add `plugins: ["../.."]` to the case's
  `prompt.md`.
- **`ran-check` passes, but `check-clean` fails and the transcript shows a permission error on `glsl_tools.py`:**
  eval runs make your home directory unreadable to shell commands, so the sandbox may block the plugin's script when
  the checkout lives under your home directory. Copy the repository outside it (for example to `/tmp/shader-skills`)
  and run from there. The CI workflow does the same. On macOS with v2.1.299, a checkout under `/Users` worked: the
  plugin directory stayed readable to sandboxed Bash.
- **`couldn't create cache file '…/xcrun_db-…' (errno=Operation not permitted)` in a macOS transcript:** the
  `/usr/bin/python3` shim tries to write an Xcode cache that the sandbox blocks. The checker still runs and prints its
  `N error(s)` line, so the noise does not affect any grader.
- **`check-clean` fails although the checker passed:** the regex reads the whole transcript. If Claude's own text
  after the last clean check quotes an earlier non-zero count like `2 error(s)`, the grader fails.
