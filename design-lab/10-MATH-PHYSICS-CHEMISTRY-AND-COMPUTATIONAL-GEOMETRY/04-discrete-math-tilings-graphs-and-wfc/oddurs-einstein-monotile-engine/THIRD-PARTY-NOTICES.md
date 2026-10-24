# Third-party notices

## hatviz — Craig S. Kaplan

Portions of this project are derived from **[isohedral/hatviz](https://github.com/isohedral/hatviz)**,
the reference implementation accompanying Smith, Myers, Kaplan &
Goodman-Strauss, *An aperiodic monotile* ([arXiv:2303.10798](https://arxiv.org/abs/2303.10798)).

**Derived files:**

| File | What was taken |
| --- | --- |
| `src/internal/affine.ts` | Port of the affine helpers in `geometry.js` — `mul`, `inv`, `matchSeg`, `matchTwo`, `intersect`, `trot`, `ttrans`, `rotAbout`, `transPt`, `hexPt` |
| `src/internal/hat-data.ts` | The hat outline, the H/T/P/F metatile outlines and their level-0 hat placements, and the 29-entry substitution rule table, from `hat.js` |
| `src/internal/substitution.ts` | Port of `constructPatch` and `constructMetatiles` from `hat.js` |

The port is deliberately faithful, so that this project's output provably agrees
with the reference implementation.

Everything else — the exact half-Eisenstein lattice arithmetic
(`src/eisenstein.ts`), the hexagonal isometry algebra (`src/isometry.ts`), the
public patch API and the float→exact snapping (`src/patch.ts`), the render
boundary (`src/render.ts`), the test suite, and all documentation — is original
work under this project's MIT license.

### License

```
BSD 3-Clause License

Copyright (c) 2023, Craig S. Kaplan

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

1. Redistributions of source code must retain the above copyright notice, this
   list of conditions and the following disclaimer.

2. Redistributions in binary form must reproduce the above copyright notice,
   this list of conditions and the following disclaimer in the documentation
   and/or other materials provided with the distribution.

3. Neither the name of the copyright holder nor the names of its
   contributors may be used to endorse or promote products derived from
   this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## Computer Modern — the SIL Open Font License

The piece is set in **CMU Serif**, self-hosted in `public/fonts/` as two Latin
subsets (roman and italic, 21 KB together).

Computer Modern is Donald Knuth's family for TeX, described in *Computer Modern
Typefaces* (1986) and released by him into the public domain. **CMU** — Computer
Modern Unicode — is the Type 1 family's conversion to modern outline formats,
begun by Andrey V. Panov, which extends it to a far wider character set.

The CMU fonts are licensed under the **SIL Open Font License 1.1**, which permits
use, study, modification and redistribution, including bundling with a work such
as this one. Two conditions bind us and are met: the fonts are not sold on their
own, and they are not distributed under a reserved name with modifications — the
files here are subsets, unmodified in outline or metrics, served under the
original name.

Full licence: <https://scripts.sil.org/OFL>

## Imagery and figures

Figures and animations on Craig Kaplan's [hat](https://cs.uwaterloo.ca/~csk/hat/)
and [spectre](https://cs.uwaterloo.ca/~csk/spectre/) pages are licensed
**CC BY 4.0**. Any reuse in this project must carry attribution. None is
currently used.

## The shapes themselves

The hat and the spectre are mathematical objects and are not copyrightable. We
credit **David Smith, Joseph Samuel Myers, Craig S. Kaplan and Chaim
Goodman-Strauss** regardless — the credit is part of the story this project
exists to tell.
