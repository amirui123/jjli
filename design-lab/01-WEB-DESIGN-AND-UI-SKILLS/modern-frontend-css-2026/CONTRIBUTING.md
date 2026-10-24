# Contributing

Thanks for your interest in improving the Modern Frontend Design skill.

## How to Contribute

### Improving the Skill

The skill lives in `skills/modern-frontend-design/SKILL.md`. When editing:

- Keep the file under 500 lines
- Explain *why* a design principle matters, not just *what* to do
- Avoid rigid MUST/NEVER rules — explain the reasoning so the agent can
  generalize
- Test your changes against the eval cases before submitting
- Keep the YAML frontmatter fields (`name`, `description`, `version`, `author`,
  `tags`) up to date — these are used by all agent platforms for triggering

### Cross-Agent Compatibility

This skill is designed to work across multiple AI coding agents (Claude Code,
Cursor, Windsurf, Cline, Codex, Aider, Gemini, and others). When contributing:

- Don't use agent-specific syntax in SKILL.md (no `<claude>` tags, etc.)
- Keep instructions in standard Markdown
- Test with at least 2 different agents if possible
- The YAML frontmatter `tags` field helps agents discover the skill

### Adding Test Cases

Test cases are in `skills/modern-frontend-design/evals/evals.json`. Good test
cases:

- Use realistic, detailed prompts (not "build a page")
- Cover different niches (AI, fintech, portfolio, etc.)
- Include 8-10 verifiable assertions each
- Test edge cases (vanilla HTML only, specific frameworks, dark/light themes)

### Adding Examples

Drop new examples in `examples/` as JSON files following the existing format:

```json
{
  "name": "Descriptive Name",
  "prompt": "The full user prompt",
  "expected": {
    "framework": "Tech stack",
    "styling": "CSS approach",
    "theme": "light or dark",
    "sections": ["list", "of", "sections"],
    "design_notes": "What makes the design appropriate for this niche"
  }
}
```

### Adding Design References

Reference documents go in `skills/modern-frontend-design/references/`. These
are loaded by the agent only when needed, so they can be longer than SKILL.md.
Include a table of contents for files over 300 lines.

## Development Setup

```bash
# Clone
git clone https://github.com/deveshpunjabi/modern-frontend-skill.git
cd modern-frontend-skill

# Validate the skill
python scripts/validate_skill.py skills/modern-frontend-design/SKILL.md

# Run tests
python -m pytest tests/ -v
```

## Pull Request Process

1. Fork and create a branch (`git checkout -b improve-typography-guidance`)
2. Make your changes
3. Run `python -m pytest tests/ -v` — all tests must pass
4. Run `python scripts/validate_skill.py skills/modern-frontend-design/SKILL.md`
5. Submit a PR with a clear description of what changed and why

## Code of Conduct

Be respectful. Focus on improving the quality of AI-generated frontends for
everyone.
