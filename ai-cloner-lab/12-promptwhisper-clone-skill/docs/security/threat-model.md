# Threat Model

## Assets and trust boundaries

The protected assets are local files and credentials, the operator's browser
identity, private network services, captured URLs, and the integrity of the
verification result. Target and clone pages, redirects, frames, responses,
scripts, media, canvas output, WebSocket messages, and report strings cross an
untrusted boundary.

The runner accepts one trusted local configuration. It may launch only the
explicit `clone.start_command`, then drives fresh Playwright contexts with a
fixed declarative action set. It never imports a user's Chrome profile.

## Threats and controls

| Threat | Primary controls | Residual risk |
| --- | --- | --- |
| Web prompt injection or hidden malicious text | Skill treats all page content as data; no page text becomes a command | A human can still copy unsafe instructions manually |
| Malicious HTML, iframe, canvas, video, source map, or socket message | Browser sandbox, clean context, origin logging, no arbitrary evaluate action | Browser vulnerabilities remain upstream risk |
| Page-suggested npm or shell command | Only configured `clone.start_command` can run; actions are Schema-whitelisted | A malicious command deliberately placed in trusted config has operator authority |
| Local file or credential exfiltration | No local-file action, no profile reuse, no request bodies/headers/cookies recorded | Clone code itself runs in a browser and must still be reviewed |
| Token or signed-URL disclosure | Query values, username, and password are redacted; bodies and credential headers are omitted | Tokens embedded in URL paths or free-form non-URL text may require manual review |
| Oversized automatic downloads | Runner captures browser traffic but does not mirror assets automatically | A public page can still consume bandwidth during an allowed capture |
| Unexpected redirect or third-party origin | Target `strict` policy blocks unlisted HTTP(S) origins; `report_only` records them | `report_only` intentionally permits traffic for reconnaissance |
| Clone continues to depend on target | Target-origin requests from the clone are blocked, recorded, and fail the Gate | Equivalent assets on unrelated origins need separate policy review |
| HTML report injection | All target URLs, titles, errors, and metadata are HTML-escaped; no remote scripts/CDNs | Opening reports in old or vulnerable browsers remains out of scope |
| Browser or server process leak | Browser and local runtime close in `finally`; process groups have bounded termination | Platform process-tree semantics vary, especially for commands spawning detached grandchildren |

## Safe operation

Prefer `target_capture_origin_policy: strict` for known, self-contained targets.
Use `report_only` only when CDNs must first be inventoried, then review and
explicitly allow required origins. Never use the runner to bypass login,
payment, CAPTCHA, DRM, signed delivery, or private APIs. Keep generated runs
ignored unless their content has been reviewed for publication.
