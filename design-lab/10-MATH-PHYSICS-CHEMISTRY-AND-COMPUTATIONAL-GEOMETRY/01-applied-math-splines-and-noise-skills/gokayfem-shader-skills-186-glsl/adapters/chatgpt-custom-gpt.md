# ChatGPT Custom GPT

1. Create a GPT and paste `adapters/universal-system-prompt.md` (the part below the line) into **Instructions**.
2. Under **Knowledge**, upload:
   - `skills/shader-art-coding/references/library-index.md`
   - `skills/shader-art-coding/references/subject-routing.md`
   - `skills/shader-art-coding/references/sdf-library-guide.md`
   - `skills/shader-art-coding/references/rendering-pipeline.md`
   - every file in `skills/shader-art-coding/glsl/` (rename `*.glsl` to `*.txt` if the uploader rejects them)
   - optionally the templates in `skills/shader-art-coding/templates/`
3. Add this line to the instructions:

> The uploaded `glsl` files are a tested function library. Copy functions from them verbatim (with their dependencies,
> in the module order common, hash, noise, pattern, sdf3d, sdf2d, operators, domain, raymarch, intersect, camera,
> shading, color, tonemap, volume, atmosphere, post, debug) instead of rewriting them. Use `library-index.md` to find
> them and `subject-routing.md` to choose techniques.

4. With **Code Interpreter** enabled, also upload `skills/shader-art-coding/scripts/glsl_tools.py` and the `glsl/`
   folder as a zip. The GPT can then run `python3 glsl_tools.py bundle shader.glsl` to inline dependencies itself.
