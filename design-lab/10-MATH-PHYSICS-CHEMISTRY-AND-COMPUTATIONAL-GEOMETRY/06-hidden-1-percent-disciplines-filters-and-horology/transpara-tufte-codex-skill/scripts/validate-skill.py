#!/usr/bin/env python3
"""Validate the Codex-native Tufte skill package."""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path
from urllib.parse import unquote


EXPECTED_PATHS = [
    "SKILL.md",
    "README.md",
    "LICENSE",
    "principles.md",
    "chart-selection.md",
    "kill-list.md",
    "checklist.md",
    "report-voice.md",
    "presets/html-svg.md",
    "presets/react.md",
    "examples/smoke-test.md",
    "agents/openai.yaml",
]

SKILL_REFERENCES = [
    "principles.md",
    "chart-selection.md",
    "kill-list.md",
    "checklist.md",
    "report-voice.md",
    "presets/html-svg.md",
    "presets/react.md",
]

STALE_CLAUDE_PATTERNS = [
    r"~[/\\]\.claude",
    r"\.claude[/\\]skills",
    r"Claude Code",
    r"loaded by Claude",
    r"ask Claude",
    r"Tell Claude",
    r"Claude will",
    r"`/tufte`",
]

TEXT_EXTENSIONS = {".md", ".html", ".svg", ".yaml", ".yml", ".py"}


def rel(path: Path, root: Path) -> str:
    return path.relative_to(root).as_posix()


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def validate_frontmatter(root: Path, errors: list[str]) -> None:
    skill = root / "SKILL.md"
    text = read_text(skill)
    match = re.match(r"^---\n(.*?)\n---\n", text, re.DOTALL)
    if not match:
        errors.append("SKILL.md must start with YAML frontmatter.")
        return

    fields: dict[str, str] = {}
    for line in match.group(1).splitlines():
        if not line.strip():
            continue
        key, sep, value = line.partition(":")
        if not sep:
            errors.append(f"Invalid frontmatter line: {line}")
            continue
        fields[key.strip()] = value.strip().strip('"')

    allowed = {"name", "description"}
    unexpected = sorted(set(fields) - allowed)
    if unexpected:
        errors.append(f"Unexpected SKILL.md frontmatter fields: {', '.join(unexpected)}")

    name = fields.get("name")
    if not name:
        errors.append("SKILL.md frontmatter missing name.")
    elif not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", name):
        errors.append(f"Invalid skill name: {name}")

    description = fields.get("description", "")
    if not description:
        errors.append("SKILL.md frontmatter missing description.")
    elif len(description) > 1024:
        errors.append("SKILL.md description exceeds 1024 characters.")


def validate_expected_paths(root: Path, errors: list[str]) -> None:
    for expected in EXPECTED_PATHS:
        if not (root / expected).exists():
            errors.append(f"Missing expected path: {expected}")


def validate_skill_routing(root: Path, errors: list[str]) -> None:
    text = read_text(root / "SKILL.md")
    for required in SKILL_REFERENCES:
        if required not in text:
            errors.append(f"SKILL.md does not route to {required}")


def validate_attribution(root: Path, errors: list[str]) -> None:
    license_text = read_text(root / "LICENSE")
    readme_text = read_text(root / "README.md")
    if "MIT License" not in license_text:
        errors.append("LICENSE must retain the MIT License heading.")
    if "tufte-claude-skill contributors" not in license_text:
        errors.append("LICENSE must retain upstream contributor attribution.")
    if "aref-vc/tufte-claude-skill" not in readme_text:
        errors.append("README.md must retain upstream fork attribution.")
    if "MIT" not in readme_text:
        errors.append("README.md must mention the upstream MIT license.")


def iter_text_files(root: Path) -> list[Path]:
    return [
        path
        for path in sorted(root.rglob("*"))
        if path.is_file()
        and ".git" not in path.parts
        and ".adversarial-review" not in path.parts
        and path.suffix.lower() in TEXT_EXTENSIONS
    ]


def validate_stale_claude_paths(root: Path, errors: list[str]) -> None:
    skipped = {
        "LICENSE",
        "scripts/validate-skill.py",
    }
    for path in iter_text_files(root):
        relative = rel(path, root)
        if relative in skipped:
            continue
        text = read_text(path)
        for pattern in STALE_CLAUDE_PATTERNS:
            if re.search(pattern, text, flags=re.IGNORECASE):
                errors.append(f"Stale Claude-only wording in {relative}: {pattern}")


def extract_markdown_links(text: str) -> list[str]:
    links = []
    for match in re.finditer(r"(?<!!)\[[^\]]+\]\(([^)]+)\)", text):
        links.append(match.group(1))
    for match in re.finditer(r"!\[[^\]]*\]\(([^)]+)\)", text):
        links.append(match.group(1))
    return links


def extract_html_links(text: str) -> list[str]:
    return re.findall(r"""(?:href|src)=["']([^"']+)["']""", text, flags=re.IGNORECASE)


def is_external(target: str) -> bool:
    return (
        not target
        or target.startswith("#")
        or target.startswith("http://")
        or target.startswith("https://")
        or target.startswith("mailto:")
        or target.startswith("data:")
    )


def normalize_link(target: str) -> str:
    target = target.strip()
    target = target.split("#", 1)[0]
    target = target.split("?", 1)[0]
    return unquote(target)


def validate_relative_links(root: Path, errors: list[str]) -> None:
    for path in iter_text_files(root):
        if path.name == "validate-skill.py":
            continue
        text = read_text(path)
        targets = extract_markdown_links(text)
        if path.suffix.lower() in {".html", ".svg", ".md"}:
            targets.extend(extract_html_links(text))
        for raw_target in targets:
            if is_external(raw_target):
                continue
            target = normalize_link(raw_target)
            if not target:
                continue
            candidate = (path.parent / target).resolve()
            try:
                candidate.relative_to(root.resolve())
            except ValueError:
                errors.append(f"Link escapes repo in {rel(path, root)}: {raw_target}")
                continue
            if not candidate.exists():
                errors.append(f"Broken relative link in {rel(path, root)}: {raw_target}")


def parse_simple_interface_yaml(text: str) -> dict[str, str]:
    """Parse the flat two-space `interface` block generated for this package."""
    fields: dict[str, str] = {}
    in_interface = False
    for line in text.splitlines():
        if line.strip() == "interface:":
            in_interface = True
            continue
        if not in_interface:
            continue
        if line and not line.startswith("  "):
            break
        stripped = line.strip()
        if not stripped:
            continue
        key, sep, value = stripped.partition(":")
        if not sep:
            continue
        fields[key] = value.strip().strip('"')
    return fields


def validate_openai_yaml(root: Path, errors: list[str]) -> None:
    path = root / "agents/openai.yaml"
    if not path.exists():
        return
    text = read_text(path)
    fields = parse_simple_interface_yaml(text)
    if not fields:
        errors.append("agents/openai.yaml must contain an interface block.")
        return

    for required in ("display_name", "short_description", "default_prompt"):
        if not fields.get(required):
            errors.append(f"agents/openai.yaml missing interface.{required}")

    if "short_description" in fields:
        length = len(fields["short_description"])
        if length < 25 or length > 64:
            errors.append("agents/openai.yaml short_description must be 25-64 chars.")

    default_prompt = fields.get("default_prompt", "")
    if "$tufte" not in default_prompt:
        errors.append("agents/openai.yaml default_prompt must mention $tufte.")

    brand_color = fields.get("brand_color")
    if brand_color and not re.fullmatch(r"#[0-9A-Fa-f]{6}", brand_color):
        errors.append("agents/openai.yaml brand_color must be a 6-digit hex color.")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("skill_dir", nargs="?", default=".", help="Skill directory to validate")
    args = parser.parse_args()

    root = Path(args.skill_dir).resolve()
    errors: list[str] = []

    if not root.is_dir():
        print(f"Not a directory: {root}", file=sys.stderr)
        return 2

    validate_expected_paths(root, errors)
    if (root / "SKILL.md").exists():
        validate_frontmatter(root, errors)
        validate_skill_routing(root, errors)
    if (root / "LICENSE").exists() and (root / "README.md").exists():
        validate_attribution(root, errors)
    validate_stale_claude_paths(root, errors)
    validate_relative_links(root, errors)
    validate_openai_yaml(root, errors)

    if errors:
        print("Skill validation failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Skill validation passed.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
