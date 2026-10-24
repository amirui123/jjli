# Gemini Gem

1. Create a Gem and paste `adapters/universal-system-prompt.md` (the part below the line) into its instructions.
2. Add as knowledge files: `references/library-index.md`, `references/subject-routing.md`,
   `references/sdf-library-guide.md`, `references/rendering-pipeline.md` and the `glsl/*.glsl` files from
   `skills/shader-art-coding/` (rename to `.txt` if needed).
3. Tell the Gem to copy library functions verbatim with their dependencies instead of rewriting them.

For Gemini CLI, install the skill directly (see the repository README); the CLI reads `SKILL.md` folders.
