"""Command line.

Every flag on `gen` is generated from the sketch's `param()` declarations, so a
new parameter needs no CLI work — which is the point of declaring them once
(PLAN.md 5).
"""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Any

from . import modules  # noqa: F401  -- importing registers every sketch
from .run import (REGISTRY, OUTPUT_ROOT, Context, RunRecord, execute, get,
                  names, sidecar)
from .run.runner import DEFAULT_VPYPE


def _add_sketch_args(parser: argparse.ArgumentParser, spec) -> None:
    for pname, ps in spec.params.items():
        flag = "--" + pname.replace("_", "-")
        if ps.type is bool:
            parser.add_argument(flag, dest=pname, default=None,
                                action=argparse.BooleanOptionalAction,
                                help=ps.help())
        else:
            parser.add_argument(flag, dest=pname, type=ps.type, default=None,
                                choices=ps.param.choices, help=ps.help())


def _collected(args: argparse.Namespace, spec) -> dict[str, Any]:
    return {p: getattr(args, p) for p in spec.params
            if getattr(args, p, None) is not None}


def _parse_assignments(items: list[str]) -> dict[str, str]:
    out: dict[str, str] = {}
    for it in items:
        if "=" not in it:
            raise SystemExit(f"expected key=value, got {it!r}")
        k, v = it.split("=", 1)
        out[k.strip().replace("-", "_")] = v.strip()
    return out


def _expand_sweep(value: str, ps) -> list[Any]:
    """`a:b:n` is n values from a to b inclusive; `a,b,c` is a literal list."""
    if ":" in value:
        bits = value.split(":")
        if len(bits) != 3:
            raise SystemExit(f"sweep range must be start:stop:count, got {value!r}")
        start, stop, count = float(bits[0]), float(bits[1]), int(bits[2])
        if count < 1:
            raise SystemExit("sweep count must be at least 1")
        if count == 1:
            return [ps.validate(start)]
        step = (stop - start) / (count - 1)
        return [ps.validate(start + i * step) for i in range(count)]
    return [ps.validate(v) for v in value.split(",")]


def _report(res, verbose: bool = False) -> None:
    st = res.record.stats
    bits = [f"{st.get('faces', 0)} faces", f"{st.get('items', 0)} items"]
    if "vertex_types" in st:
        bits.append(f"{st['vertex_types']} vertex types")
    print(f"{res.svg}  [{res.record.run_id}]  {', '.join(bits)}  "
          f"{res.record.elapsed_s:.2f}s")
    for extra in res.paths[1:]:
        print(f"  also: {extra}")
    if verbose:
        print(json.dumps(st, indent=2, default=str))


# -- commands ---------------------------------------------------------------

def cmd_gen(args: argparse.Namespace) -> int:
    spec = get(args.sketch)
    res = execute(spec, _collected(args, spec), out=args.out, name=args.name,
                  simplify_pipeline=args.simplify, png=args.png,
                  verbose=args.verbose)
    _report(res, args.verbose)
    return 0


def cmd_list(args: argparse.Namespace) -> int:
    if args.sketch:
        spec = get(args.sketch)
        print(f"{spec.name} — {spec.summary}\n")
        if spec.module_doc:
            print(spec.module_doc + "\n")
        width = max(len(p) for p in spec.params) if spec.params else 0
        for pname, ps in spec.params.items():
            print(f"  --{pname.replace('_','-'):<{width}}  "
                  f"{ps.type.__name__:<5} {ps.help()}")
        return 0
    for name in names():
        print(f"{name:<16} {REGISTRY[name].summary}")
    return 0


def cmd_replay(args: argparse.Namespace) -> int:
    rec = RunRecord.load(_record_path(args.record))
    spec = get(rec.sketch)
    try:
        res = execute(spec, rec.params, out=args.out, name=args.name,
                      simplify_pipeline=args.simplify, png=args.png,
                      verbose=args.verbose)
    except KeyError as exc:
        # A rename is handled by `was=` on the parameter. This is the other
        # case: parameters that no longer exist in any form because the model
        # changed under them. Say so plainly, with what the record knows, rather
        # than leaving the reader to work out why their own file is rejected.
        gone = sorted(set(rec.params) - set(spec.params) - set(spec.aliases()))
        print(f"error: this record cannot be replayed as it stands.\n"
              f"  recorded by: aperiodics {rec.aperiodics_version}"
              f"{' (' + rec.git.get('commit', '')[:8] + ')' if rec.git.get('commit') else ''}"
              f" on {rec.created[:10]}\n"
              f"  parameters that no longer exist: {', '.join(gone)}\n"
              f"  the SVG and its settings are still readable; re-make it with\n"
              f"  current parameters, or check out the recorded commit.",
              file=sys.stderr)
        del exc
        return 2
    if res.record.run_id != rec.run_id:
        print(f"warning: reproduced as {res.record.run_id}, recorded as "
              f"{rec.run_id} — the sketch's parameters have changed since.",
              file=sys.stderr)
    _report(res, args.verbose)
    return 0


def cmd_vary(args: argparse.Namespace) -> int:
    rec = RunRecord.load(_record_path(args.record))
    spec = get(rec.sketch)
    changes = _parse_assignments(args.changes)
    unknown = set(changes) - set(spec.params)
    if unknown:
        raise SystemExit(f"unknown parameter(s): {sorted(unknown)}")
    params = {**rec.params, **{k: spec.params[k].validate(v)
                               for k, v in changes.items()}}
    res = execute(spec, params, out=args.out, name=args.name,
                  simplify_pipeline=args.simplify, png=args.png,
                  verbose=args.verbose)
    shown = ", ".join(f"{k}={params[k]}" for k in changes)
    print(f"varied from {rec.run_id}: {shown}")
    _report(res, args.verbose)
    return 0


def cmd_sweep(args: argparse.Namespace) -> int:
    import itertools

    spec = get(args.sketch)
    assignments = _parse_assignments(args.axes)
    unknown = set(assignments) - set(spec.params)
    if unknown:
        raise SystemExit(f"unknown parameter(s): {sorted(unknown)}")
    axes = {k: _expand_sweep(v, spec.params[k]) for k, v in assignments.items()}
    base = _collected(args, spec)

    combos = [dict(zip(axes, vals)) for vals in itertools.product(*axes.values())]
    print(f"sweeping {len(combos)} runs over "
          f"{', '.join(f'{k}({len(v)})' for k, v in axes.items())}")
    for i, combo in enumerate(combos, 1):
        res = execute(spec, {**base, **combo}, name=args.name,
                      simplify_pipeline=args.simplify, png=args.png)
        label = " ".join(f"{k}={v}" for k, v in combo.items())
        print(f"  [{i}/{len(combos)}] {label:<40} {res.svg.name}")
    return 0


def cmd_index(args: argparse.Namespace) -> int:
    from .output.index import build_index

    root = Path(args.root)
    path = build_index(root, out=Path(args.out) if args.out else None)
    if path is None:
        print(f"no run records under {root}")
        return 1
    print(path)
    return 0


def cmd_serve(args: argparse.Namespace) -> int:
    from .serve import serve

    serve(port=args.port, open_browser=not args.no_open)
    return 0


def cmd_gui(args: argparse.Namespace) -> int:
    from .gui.vsk import write_wrapper

    path = write_wrapper(args.sketch, args.out or "sketches",
                         size=args.size, landscape=not args.portrait)
    print(path)
    print(f"run it with:  vsk run {path}")
    return 0


def cmd_fields(args: argparse.Namespace) -> int:
    from .fields import DESCRIPTIONS
    from .fields import names as field_names
    from .fieldset import BUILTIN, MODE_HELP, builtin, load_stack

    if args.action == "export":
        stack = load_stack(args.name)
        text = json.dumps(stack.to_dict(), indent=2)
        dest = Path(args.out or f"{args.name}.json")
        dest.write_text(text + "\n")
        print(dest)
        return 0
    if args.action == "show":
        print(json.dumps(load_stack(args.name).to_dict(), indent=2))
        return 0

    print("Fields carry the SHAPE of a deformation. Every field works with every")
    print("ruleset, and all are normalised, so --strength is the only magnitude.\n")
    print("presets — one shape each:")
    for name in field_names():
        print(f"  {name:<11} {DESCRIPTIONS[name]}")
    print("\n  shaped by: --field-freq --field-phase --field-angle "
          "--field-fold --field-power")
    print("\nstacks — several presets combined:")
    for name in sorted(BUILTIN):
        s = builtin(name)
        print(f"  {name:<13} {len(s)} layers: {s.summary}")
    print("\ncombining modes:")
    for m, help_text in MODE_HELP.items():
        print(f"  {m:<9} {help_text}")
    return 0


def cmd_rules(args: argparse.Namespace) -> int:
    from .rules import BUILTIN, DIRECTION_HELP, READS_HELP, builtin, load_ruleset

    if args.action == "list":
        print("Rulesets say what a vertex DOES with the field value at its")
        print("position. None of them names a field.\n")
        for name in sorted(BUILTIN):
            rs = builtin(name)
            print(f"  {name:<9} {rs.summary}")
        print("\ndirections:")
        for d, help_text in DIRECTION_HELP.items():
            print(f"  {d:<11} {help_text}")
        print("\nreads (which aspect of the field drives the magnitude):")
        for r, help_text in READS_HELP.items():
            print(f"  {r:<11} {help_text}")
        return 0

    rs = load_ruleset(args.name)
    text = json.dumps(rs.to_dict(), indent=2)
    if args.action == "show":
        print(text)
        return 0
    dest = Path(args.out or f"{args.name}.json")
    dest.write_text(text + "\n")
    print(dest)
    return 0


def cmd_docs(args: argparse.Namespace) -> int:
    from .docs import build_all, build_module_doc

    paths = ([build_module_doc(args.sketch)] if args.sketch else build_all())
    for p in paths:
        print(p)
    return 0


def cmd_walkthrough(args: argparse.Namespace) -> int:
    from .docs import build_module_doc

    targets = [args.sketch] if args.sketch else names()
    for name in targets:
        print(f"running {name} walkthrough…")
        print(f"  {build_module_doc(name, walkthrough=True)}")
    return 0


def cmd_keep(args: argparse.Namespace) -> int:
    import shutil

    from .run.naming import DESIGNS_ROOT, run_stem, slug

    src = _record_path(args.record)
    rec = RunRecord.load(src)
    dest_dir = Path(args.into or DESIGNS_ROOT)
    dest_dir.mkdir(parents=True, exist_ok=True)
    stem = run_stem(rec.sketch, rec.run_id, args.name) if args.name else src.stem
    moved = []
    for ext in (".svg", ".json", ".png"):
        cand = src.with_suffix(ext)
        if cand.exists():
            dst = dest_dir / (stem + ext)
            shutil.copy2(cand, dst)
            moved.append(dst)
    if not moved:
        raise SystemExit(f"nothing to keep beside {src}")
    for m in moved:
        print(m)
    return 0


def cmd_plot(args: argparse.Namespace) -> int:
    """Send an SVG to the plotter named in `.env`.

    Takes a file, or a run — the sidecar, the SVG, or the bare stem, the same
    three things `replay` and `keep` take — so an archived run can be plotted
    without going to find its path.
    """
    from . import plotter as plot

    machine = plot.configured()
    if machine is None:
        print("error: no plotter configured. Put PLOTTER_URL in a .env "
              "(see .env.example), or set it in the environment.",
              file=sys.stderr)
        return 2
    if args.info:
        for key, value in plot.info(machine).items():
            print(f"{key}: {value}")
        return 0
    if not args.file:
        print("error: give an SVG, a run record, or --info", file=sys.stderr)
        return 2

    svg, label = _svg_to_send(args)
    design = plot.send(machine, svg, name=args.name or label, wait=args.wait,
                       **_plot_settings(args))
    print(plot.describe(design, machine))
    for warning in design.get("warnings") or []:
        print(f"warning: {warning}", file=sys.stderr)
    return 0 if design.get("status") != "error" else 1


def _svg_to_send(args: argparse.Namespace) -> tuple[str, str]:
    """The bytes to upload, and a label — converting arcs where it can.

    The plotter's reader mishandles arcs inside a transformed group, and every
    file here is one when a motif is on. Where there is a run record the
    drawing is rebuilt from its parameters and written with curves instead,
    which is exact. Where there is only a loose SVG, the file goes as it is and
    says so — rewriting arcs in arbitrary path data is a parser, and a wrong
    guess at an arc's centre turns it inside out.
    """
    from .output.svg import to_string

    path = Path(args.file)
    if path.suffix == ".svg" and path.exists():
        record = path.with_suffix(".json")
    else:
        record = _record_path(args.file)
        path = record.with_suffix(".svg")
    if not path.exists() and not record.exists():
        raise SystemExit(f"no such file: {args.file}")

    if args.curves and record.exists():
        rec = RunRecord.load(record)
        spec = get(rec.sketch)
        ctx = Context(seed=int(rec.params.get("seed", 0)))
        drawing = spec.instantiate(spec.resolve(rec.params)).build(ctx)
        return to_string(drawing, curves=True), path.name

    svg = path.read_text()
    if args.curves and " A " in svg and "<g transform" in svg:
        print("note: this file has arcs inside a transformed group, which the "
              "plotter converts imperfectly, and there is no run record beside "
              "it to rebuild it from. Sending as it is.", file=sys.stderr)
    return svg, path.name


def _plot_settings(args: argparse.Namespace) -> dict:
    out = {}
    for key in ("paper", "frame", "scaling", "bleed", "optimisation", "layers",
                "bounds"):
        value = getattr(args, key, None)
        if value not in (None, ""):
            out[key] = value
    return out


def _record_path(arg: str) -> Path:
    """Accept the sidecar, the SVG, or the bare run stem."""
    p = Path(arg)
    if p.suffix in (".svg", ".png"):
        p = sidecar(p)
    if p.exists():
        return p
    matches = sorted(OUTPUT_ROOT.glob(f"**/*{arg}*.json"))
    if len(matches) == 1:
        return matches[0]
    if not matches:
        raise SystemExit(f"no run record matching {arg!r}")
    raise SystemExit(f"{arg!r} matches {len(matches)} records; be more specific")


# -- parser -----------------------------------------------------------------

def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        prog="aperiodics",
        description="Explore mathematical constructions and turn them into "
                    "fabricable output.")
    sub = parser.add_subparsers(dest="command")

    def common(p: argparse.ArgumentParser, out: bool = True) -> None:
        if out:
            p.add_argument("--out", help="explicit output path; otherwise "
                                         "output/<date>/<sketch>-<hash>.svg")
        p.add_argument("--name", help="readable label in the filename")
        p.add_argument("--simplify", nargs="?", const=DEFAULT_VPYPE, default=None,
                       metavar="PIPELINE",
                       help=f"run a vpype pipeline into a sibling file "
                            f"(default: {DEFAULT_VPYPE!r}). The exact original "
                            f"is always kept")
        p.add_argument("--png", action="store_true",
                       help="also write a PNG (needs the 'raster' extra)")
        p.add_argument("-v", "--verbose", action="store_true")

    for name in names():
        spec = REGISTRY[name]
        p = sub.add_parser(name, help=spec.summary,
                           description=spec.summary,
                           formatter_class=argparse.RawDescriptionHelpFormatter)
        _add_sketch_args(p, spec)
        common(p)
        p.set_defaults(func=cmd_gen, sketch=name)

    lst = sub.add_parser("list", help="list sketches, or one sketch's parameters")
    lst.add_argument("sketch", nargs="?")
    lst.set_defaults(func=cmd_list)

    rep = sub.add_parser("replay", help="reproduce a recorded run exactly")
    rep.add_argument("record", help="a run's .json, its .svg, or its hash")
    common(rep)
    rep.set_defaults(func=cmd_replay)

    var = sub.add_parser("vary", help="branch from a run, changing parameters")
    var.add_argument("record")
    var.add_argument("changes", nargs="+", metavar="KEY=VALUE")
    common(var)
    var.set_defaults(func=cmd_vary)

    swp = sub.add_parser("sweep", help="cartesian product over parameter ranges")
    swp.add_argument("sketch", choices=names())
    swp.add_argument("axes", nargs="+", metavar="KEY=START:STOP:N|KEY=A,B,C")
    swp.set_defaults(func=cmd_sweep)

    idx = sub.add_parser("index", help="build a contact sheet of every run")
    idx.add_argument("--root", default=str(OUTPUT_ROOT))
    idx.add_argument("--out", help="default: <root>/index.html")
    idx.set_defaults(func=cmd_index)

    srv = sub.add_parser("serve", help="local web GUI: sliders and a live SVG pane")
    srv.add_argument("--port", type=int, default=8731)
    srv.add_argument("--no-open", action="store_true",
                     help="do not open a browser window")
    srv.set_defaults(func=cmd_serve)

    gui = sub.add_parser("gui", help="write a vsketch wrapper for live tweaking")
    gui.add_argument("sketch", choices=names())
    gui.add_argument("--out", help="file or directory (default sketches/)")
    gui.add_argument("--size", default="a3", help="page size (default a3)")
    gui.add_argument("--portrait", action="store_true")
    gui.set_defaults(func=cmd_gui)

    fld = sub.add_parser("fields", help="list, show or export field shapes")
    fld.add_argument("action", nargs="?", default="list",
                     choices=("list", "show", "export"))
    fld.add_argument("name", nargs="?", default="",
                     help="a preset, a built-in stack, or a JSON path")
    fld.add_argument("--out", help="destination for export")
    fld.set_defaults(func=cmd_fields)

    rls = sub.add_parser("rules", help="list, show or export deformation rulesets")
    rls.add_argument("action", choices=("list", "show", "export"))
    rls.add_argument("name", nargs="?", default="",
                     help="built-in name or path to a JSON ruleset")
    rls.add_argument("--out", help="destination for export (default <name>.json)")
    rls.set_defaults(func=cmd_rules)

    dcs = sub.add_parser("docs", help="regenerate module documentation")
    dcs.add_argument("sketch", nargs="?", choices=names())
    dcs.set_defaults(func=cmd_docs)

    wt = sub.add_parser("walkthrough",
                        help="run a module's step-by-step explainer and write "
                             "its images into the docs")
    wt.add_argument("sketch", nargs="?", choices=names())
    wt.set_defaults(func=cmd_walkthrough)

    plt = sub.add_parser("plot", help="send an SVG to the plotter in .env")
    plt.add_argument("file", nargs="?",
                     help="an SVG, or a run: its record, its SVG, or its stem")
    plt.add_argument("--name", help="label in the plotter's library")
    plt.add_argument("--wait", type=float, default=0,
                     help="hold until it has converted, up to 120s, so a "
                          "problem surfaces here rather than in the library")
    plt.add_argument("--info", action="store_true",
                     help="ask the plotter its name and presets, and stop")
    plt.add_argument("--no-curves", dest="curves", action="store_false",
                     help="send arcs as arcs. The default converts them to "
                          "Beziers, because the plotter's reader mishandles "
                          "arcs inside a transformed group and every file here "
                          "is one")
    for key, help_text in (("paper", "paper preset"), ("frame", "frame preset"),
                           ("scaling", "fit, fill or fill_crop"),
                           ("bleed", "push past the frame, in mm"),
                           ("optimisation", "none, sort only, standard, aggressive"),
                           ("layers", "auto, single or layers"),
                           ("bounds", "lines or document")):
        plt.add_argument(f"--{key}", help=help_text)
    plt.set_defaults(func=cmd_plot, curves=True)

    kp = sub.add_parser("keep", help="promote a run to designs/")
    kp.add_argument("record")
    kp.add_argument("--name", help="rename with a readable label")
    kp.add_argument("--into", help="destination directory (default designs/)")
    kp.set_defaults(func=cmd_keep)

    return parser


def main(argv: list[str] | None = None) -> int:
    parser = build_parser()
    # `sweep` takes free-form assignments; let it through without sketch flags.
    args, extra = parser.parse_known_args(argv)
    if getattr(args, "func", None) is None:
        parser.print_help()
        return 1
    if args.func is cmd_sweep:
        base = build_parser()
        spec = get(args.sketch)
        sp = argparse.ArgumentParser(add_help=False)
        _add_sketch_args(sp, spec)
        sp.add_argument("--name")
        sp.add_argument("--simplify", nargs="?", const=DEFAULT_VPYPE, default=None)
        sp.add_argument("--png", action="store_true")
        sp.add_argument("-v", "--verbose", action="store_true")
        known, _ = sp.parse_known_args(extra)
        for k, v in vars(known).items():
            setattr(args, k, v)
        del base
    elif extra:
        parser.error(f"unrecognised arguments: {' '.join(extra)}")
    try:
        return args.func(args)
    except (KeyError, ValueError) as exc:
        print(f"error: {exc}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    raise SystemExit(main())
