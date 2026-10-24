"""Generate each module's markdown documentation.

Every module gets `docs/modules/<name>.md` with four parts: the maths, the
references, the parameters, and a gallery. The **maths is written by hand and
never touched**; the other three are regenerated in place between HTML-comment
markers, so the parameter table and gallery cannot drift from the code while the
prose stays yours.

References live as a `REFERENCES` list in the module source, so a citation sits
next to the code implementing it — the paper and its implementation move
together or not at all.

The gallery comes from run records in `examples/`. `aperiodics keep <run> --into
examples` promotes an output, and it appears here with its full parameter set on
the next `aperiodics docs` — so the exploration writes its own documentation.
"""

from __future__ import annotations

import importlib
import json
import os
import re
from pathlib import Path
from typing import Any

from .run import REGISTRY, SketchSpec, names

DOCS_ROOT = Path("docs/modules")
EXAMPLES_ROOT = Path("examples")
IMAGES_ROOT = Path("docs/images")

_MARK = "aperiodics:{}"


def _block(kind: str, body: str) -> str:
    return f"<!-- {_MARK.format(kind)} -->\n{body}\n<!-- /{_MARK.format(kind)} -->"


def _replace_block(text: str, kind: str, body: str) -> str:
    open_m, close_m = _MARK.format(kind), "/" + _MARK.format(kind)
    pat = re.compile(rf"<!--\s*{re.escape(open_m)}\s*-->.*?<!--\s*{re.escape(close_m)}\s*-->",
                     re.DOTALL)
    new = _block(kind, body)
    return pat.sub(lambda _: new, text) if pat.search(text) else text.rstrip() + "\n\n" + new + "\n"


def _module_of(spec: SketchSpec):
    return importlib.import_module(spec.cls.__module__)


def _format_reference(ref: dict[str, Any]) -> str:
    bits = []
    who = str(ref.get("authors", ""))
    if ref.get("year"):
        who = f"{who} ({ref['year']})".strip()
    if who:
        bits.append(who)
    title = ref.get("title", "")
    if ref.get("url"):
        title = f"[{title}]({ref['url']})"
    bits.append(f'"{title}"' if title else "")
    if ref.get("where"):
        bits.append(f"*{ref['where']}*")
    return "- " + ", ".join(b for b in bits if b) + "."


def render_references(spec: SketchSpec) -> str:
    mod = _module_of(spec)
    refs = list(getattr(mod, "REFERENCES", []))
    see = list(getattr(mod, "SEE_ALSO", []))
    if not refs and not see:
        return ("*No references recorded yet. Add a `REFERENCES` list to "
                f"`{spec.cls.__module__.replace('.', '/')}.py`.*")
    out = []
    if refs:
        out.append("\n".join(_format_reference(r) for r in refs))
    if see:
        out.append("**Also worth looking at**\n\n"
                   + "\n".join(_format_reference(r) for r in see))
    return "\n\n".join(out)


def render_params(spec: SketchSpec) -> str:
    rows = ["| flag | type | default | meaning |", "|---|---|---|---|"]
    for name, ps in spec.params.items():
        doc = ps.param.doc or ""
        if ps.param.unit:
            doc += f" ({ps.param.unit})"
        if ps.param.choices:
            doc += " — one of " + ", ".join(f"`{c}`" for c in ps.param.choices)
        elif ps.param.min is not None:
            doc += f" — usually {ps.param.min:g}…{ps.param.max:g}"
        rows.append(f"| `--{name.replace('_', '-')}` | {ps.type.__name__} | "
                    f"`{ps.default!r}` | {doc.strip()} |")
    return "\n".join(rows)


def _example_records(sketch: str, root: Path) -> list[tuple[dict[str, Any], Path]]:
    out = []
    for p in sorted(root.glob("**/*.json")):
        try:
            rec = json.loads(p.read_text())
        except (OSError, json.JSONDecodeError):
            continue
        if rec.get("sketch") == sketch:
            out.append((rec, p))
    return out


def _flag(spec: SketchSpec, key: str, value: Any) -> str:
    """Render one parameter as it would actually be typed."""
    name = key.replace("_", "-")
    if spec.params[key].type is bool:
        return f"--{name}" if value else f"--no-{name}"
    if isinstance(value, float) and value.is_integer():
        value = int(value)
    return f"--{name} {value}"


def render_gallery(spec: SketchSpec, root: Path, docs_dir: Path) -> str:
    records = _example_records(spec.name, root)
    if not records:
        return (f"*No examples yet. Make one, then promote it with* "
                f"`aperiodics keep <run> --into examples`.")
    defaults = spec.defaults()
    chunks = []
    for rec, path in records:
        stem = path.with_suffix("")
        img = stem.with_suffix(".png")
        img = img if img.exists() else stem.with_suffix(".svg")
        # Relative to the doc, which lives two levels down in docs/modules/.
        rel = Path(os.path.relpath(img.resolve(), docs_dir.resolve()))
        # Only the parameters that differ from the defaults -- the full table is
        # in the run record, and what matters here is what makes this one this.
        changed = {k: v for k, v in rec.get("params", {}).items()
                   if k in defaults and v != defaults[k]}
        flags = " ".join(_flag(spec, k, v) for k, v in changed.items())
        title = path.stem
        stats = rec.get("stats", {})
        facts = ", ".join(filter(None, [
            f"{stats['faces']} faces" if stats.get("faces") else "",
            f"{stats['vertex_types']} vertex types" if stats.get("vertex_types") else "",
        ]))
        chunks.append(
            f"### {title}\n\n"
            # Markdown image syntax rather than an <img> tag: plenty of
            # previewers do not render raw HTML in markdown, which makes the
            # gallery silently empty. Width control is not worth that.
            f"![{title}]({rel.as_posix()})\n\n"
            f"```bash\naperiodics {spec.name} {flags}\n```\n"
            + (f"\n{facts}.\n" if facts else "")
        )
    return "\n".join(chunks)


def render_walkthrough(spec: SketchSpec, images: Path) -> str:
    from .walkthrough import build as build_walkthrough

    body = build_walkthrough(spec.name, images=images)
    return body or ("*No walkthrough for this module. Add a `WALKTHROUGH` list "
                    f"to `{spec.cls.__module__.replace('.', '/')}.py`.*")


SKELETON = """# {name}

{summary}

## The maths

<!-- Written by hand. `aperiodics docs` never touches this section. -->

{doc}

## References

{references}

## Walkthrough

{walkthrough}

## Parameters

{params}

## Gallery

{gallery}
"""


def build_module_doc(sketch_name: str, *, docs_root: Path = DOCS_ROOT,
                     examples_root: Path = EXAMPLES_ROOT,
                     walkthrough: bool = False) -> Path:
    spec = REGISTRY[sketch_name]
    docs_root.mkdir(parents=True, exist_ok=True)
    path = docs_root / f"{sketch_name}.md"

    refs = render_references(spec)
    params = render_params(spec)
    gallery = render_gallery(spec, examples_root, docs_root)

    if path.exists():
        text = path.read_text()
        blocks = [("references", refs), ("params", params), ("gallery", gallery)]
        # Only when asked: a walkthrough re-runs every step, which is slow and
        # rewrites images, so it should not happen on every `docs` call.
        if walkthrough:
            blocks.append(("walkthrough",
                           render_walkthrough(spec, IMAGES_ROOT)))
        for kind, body in blocks:
            text = _replace_block(text, kind, body)
    else:
        mod = _module_of(spec)
        text = SKELETON.format(
            name=sketch_name, summary=spec.summary,
            doc=(mod.__doc__ or spec.module_doc or "").strip(),
            references=_block("references", refs),
            walkthrough=_block("walkthrough",
                               render_walkthrough(spec, IMAGES_ROOT)
                               if walkthrough else
                               "*Not generated yet. Run "
                               "`aperiodics walkthrough <module>`.*"),
            params=_block("params", params),
            gallery=_block("gallery", gallery),
        )
    path.write_text(text)
    return path


def build_all(**kw) -> list[Path]:
    return [build_module_doc(n, **kw) for n in names()]
