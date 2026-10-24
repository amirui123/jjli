# Reference: site-sections.html (graders only)

Eval agents must not read this file.

## Probe results (Chromium, `references/page-probe.md`, 2026-10-08)
| Measure | 375×812 | 1440×900 |
| :--- | :--- | :--- |
| `overflowX` | 0 | 0 |
| `wide` | `div.deco`, `clipped: true`, `clippedBy: div.clip` | same |
| `targets` | `checked: 13`, `under44: 13`, `omitted: 1` | same |
| `targets.list` (own box, first 12) | "Read the case" 90×16 `stretched`; "Commodity price index" 265×27; "Explore this product" 141×17; "method note" `inline: true`; "Open" 39×17 `inline: false`; "Edit"/"Delete" three times (plain row, "Alice" row, "Alexandria Catherine Johnson" row), all `inline: false`; "Shifted action" 97×21. The 13th, "Open the price index", is the one `omitted` counts | same entries |
| `needsHitTest` | "Read the case" (overlay about 343×190); "Open the price index" (own 0×0, overlay about the tile, 322×122) | same, "Read the case" overlay about 370×190 |
| `conformanceCandidates` | the two stretched links (`stretched: true`), "Explore this product", "Open", all three Edit/Delete pairs, "Shifted action": all pass the spacing test; "method note" absent (inline) | same |
| collapsed panels | "Hidden action", its paragraph and image, and both bordered panels' contents ("Bordered hidden action", an alt-less image) are absent from every list and count | same |
| axis clip | "Shifted action" is present (its box is below the 20px `overflow-x: clip` container, whose y axis is visible) | same |
| `lineLength.blocks` | p.padded 2 lines / 46; p.normal 2 / 47; p.mixed 2 / 41, `estimate: true`; p.bridge 1 / 45, `estimate: true`; p.spaced 1 / **10**; p.merge 1 / 49, `estimate: true`; p.contents 2 / 35; p.hidden-prose 1 / 4, text "Open"; bullets 1 line, 37–38 | p.padded **1 line / 92**; p.normal **1 / 93**; p.mixed **1 / 82**, `estimate: true`; p.bridge **1** / 45, `estimate: true`; p.spaced 1 / 10; p.merge **1** / 49, `estimate: true`; p.contents 1 / 70; p.hidden-prose 1 / 4; bullets 1 line, 37–38 |
| `lineLength.long` | none | `p.padded`, `p.normal` |
| `smallText`, `imagesWithoutAlt` | `sup.hi 9px`, `span.tiny 9px` (the bridge and merge cases), 0 | same |

Several rows pin later fixes; the code before each fix fails them in Chromium:
- **Round 3.** The probe counted p.bridge as 2 lines (its superscript rect, 1076–1086, touches only the larger span's rect, 1081–1111, and not the baseline text, 1091–1108), measured p.spaced as 9 characters, marked the "Alexandria Catherine Johnson" links `inline: true`, dropped "Shifted action", and counted the collapsed panel's image in `imagesWithoutAlt`.
- **Round 4.** The probe counted p.merge as 2 lines (baseline 53–70 and lowered span 63–80 overlap too little; the small span, 64.5–74.5, sorts after both and joined only the first), dropped p.contents entirely (its text sits in a `display: contents` wrapper with no box), marked "Open" `inline: true` on the strength of hidden words, and showed the bordered panels' button and image (their border box is 2px high, but the clipping area inside the border is 0).

Exact widths depend on the font the browser substitutes for Arial; the counts, flags and statuses do not.

## What a good audit shows
- **Coverage:** one page × two viewports, both measured with the probe.
- **Law 2 (Fitts):** at most a Warning, for the 17px-tall "Explore this product", "Open", "Edit" and "Delete" links, the 21px "Shifted action" button and the 27px heading link. Both stretched links ("Read the case", and the empty "Open the price index" anchor) come from `needsHitTest`. Each is graded only after a hit-test (its card) or reported with its overlay labelled a static estimate. Neither is dropped, and neither is counted as small on its own box alone.
- **Law 4 (Proximity):** Warning with spacing evidence. Inside each `#proximity .band` the heading and its body are 160px apart (`column-gap`), while consecutive bands are 4px apart. On the `.alt` band the heading sits on the right, nearer the following band's text than its own body. A finding that cites only "the heading is on the right", without the spacing, is unsupported.
- **Law 19 (Occam) or law 13 (Similarity):** Warning for the heading link and the "Explore this product" link to the same `/price-index` href.
- **Overflow:** none. The decoration is clipped and the page doesn't scroll sideways.
- **Line length:** not a grade. The 92–93 character lines at 1440 are at most an unscored note.
- **Hidden UI:** the collapsed panels' contents, bordered or not, aren't graded as visible. If the auditor opens it, that's a separate measurement.
- **Conformance note:** the undersized targets all pass the spacing test, so there is no 2.5.8 failure. The stretched ones are confirmed only after their hit-test. The inline "method note" link is excluded under the inline exception but stays in the usability results.
