# Contributing

This list earns trust by being small, current, and verifiable. A pull request is welcome when it makes the list more useful to someone choosing a tool tomorrow.

## An entry qualifies when

- It links to the **primary source** — the official repo or docs, not a blog post about it.
- It does **one job better** than what is already listed, stated in one sentence.
- It shows **recent maintenance** (commits or releases in the last six months) and a clear license.
- Risky capabilities — payments, trading, health, autonomous actions — name their **human approval gate**.

## Not accepted

Affiliate or referral links, product pitches, private workflow exports, unverified claims, bulk skill dumps.

## Format

```markdown
- [Name](https://primary-url) - What it does, in one sentence.
```

Table rows follow the columns already in that section. Keep alphabetical order where the section uses it.

## Checks

Every PR runs the link checker and `skills-validate`. Skills in `skills/` need a folder name equal to the frontmatter `name` (kebab-case) and a description of *when the skill fires*, under 1024 characters.

By contributing you dedicate your contribution to the public domain under [CC0 1.0](LICENSE).
