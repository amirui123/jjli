# Changelog

Only changes that an embedder of `<ca-background>` could notice are listed here. The
site itself is not versioned; the element has no version number either (see the spec's
non-goals), so this file is the record of what changed and when, and `git log` is the
detail. Entries are dated, newest first.

## 2026-09-03 — first release of the element

- `https://ca.davidyc.com/element.js` defines `<ca-background>`.
- Attributes: `sim`, `theme`, `speed`, `paused`, `interactive`, `options`, `fallback`.
  All live, all mirrored as properties. One method, `reseed()`; one read-only property,
  `current`.
- Pointer coordinates are translated into the element's box, so it works anywhere on a
  page, not only full-viewport.
- The loop stops while the tab is hidden and while the element is scrolled out of view.
- Failure policy: warn on the console and mount `fallback`; never throw into the host.
- `/element.js`, `/src/*` and `/nca/*` carry `Access-Control-Allow-Origin: *`; code
  revalidates on every request so a page always gets a consistent set of modules.
- Documentation and live demo: `https://ca.davidyc.com/embed.html`.

### Rollback

Production is a Cloudflare Worker with static assets. `npx wrangler@4.128.0 rollback`
returns to the previous deployment; `npx wrangler@4.128.0 deployments list` shows what
is there. Because nothing is content-hashed and every module revalidates, a rollback is
visible to embedders on their next page load.
