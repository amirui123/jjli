# Claude (claude.ai Projects)

Prefer the skill: zip the `skills/shader-art-coding/` folder and upload it under **Settings > Capabilities > Skills**.
Claude then loads `SKILL.md`, the references and the library on demand, and can run `scripts/glsl_tools.py` in its
code environment to bundle and check shaders.

Without skills, use a Project:

1. Paste `adapters/universal-system-prompt.md` (the part below the line) into the project instructions.
2. Add to project knowledge: `references/library-index.md`, `references/subject-routing.md`,
   `references/sdf-library-guide.md`, `references/rendering-pipeline.md`, and the `glsl/*.glsl` files.
3. Add: "Copy library functions verbatim with their dependencies instead of rewriting them."

For Claude Code, install the plugin or copy the skill folder (see the repository README).
