/* Probe maps for the Hat, after @SlavisTon's article "Ein Stein, One Stone".
   Added on top of David Ryan's tiling explorer (MIT). Runs inside the hat
   worker: TilingCore.chunk() walks each chunk's box plus a margin, hands
   every tile to annotate(), and packs two extra words per tile.

   All geometry here is the hat's own shape, Tile(1, sqrt 3), in the worker's
   reference coordinates, so the colours stay attached to their tiles while
   the shape slider reshapes them. In these coordinates hats of one heading
   stack at 2*sqrt 3; the article's unit is half of ours (its "sqrt 3 apart"
   is our 2*sqrt 3). UNIT converts.

   Word A (bits):  0-2 role (0 H, 1 T, 2 P, 3 F, 4 H1 = flipped)
                   3-4 stack (0 unstacked, 1 end of pair/triple, 2 middle of triple, 3 flipped)
                   5-9 chain (0 off-river, else 1 + 3*heading + kind; kind 0 flip, 1 triple, 2 pair)
                  10-14 distance to nearest flip, 0..31 over 0..3 article units (31 = >= 3)
                  15-16 molecule (0 other, 1 flip, 2 three-shell)
                  17-22 grain phase at period 1 (legacy; the map uses word C)
                  23-30 neighbourhood-type rank (255 = not in the reference census)
   Word B:         0-19 supertile ancestry, 4 bits per level 1..5: role*4 + 2-bit hash of the supertile
                  20-22 flip-distance shell index (0 flip, 1.. discrete shells, 7 = other)
   Word C:         projection of the centroid on the 54° grain direction,
                   wrapped at GRAIN_WRAP article units, as a 32-bit fraction */
(function (global) {
  'use strict';
  var C = global.TilingCore || (typeof globalThis !== 'undefined' && globalThis.TilingCore);
  var r3 = Math.sqrt(3), h = r3 / 2;
  var UNIT = 2;                 // our units per article unit
  var STACK_D = 2 * r3;         // same-heading stack spacing (verified empirically)
  var TOL = 1e-3;
  var GRAIN_DEG = 54, GRAIN_PERIOD = 1;  // article units; see notes/explorations.md
  var GRAIN_WRAP = 1024;        // article units; must be a multiple of every period offered
  var CENSUS_R = 4.5;           // our units: the ring of touching neighbours
  var MARGIN = 16;
  var ROLE = { H: 0, T: 1, P: 2, F: 3 };

  function ev(x) {
    var P = C.zw.val(x.p), R = C.zw.val(x.r);
    return [P[0] + r3 * (h * R[0] - 0.5 * R[1]), P[1] + r3 * (0.5 * R[0] + h * R[1])];
  }
  // Area centroid. Corners are taken relative to the first one, since
  // coordinates reach 10^7 and the shoelace sum would cancel badly.
  function centroid(pts) {
    var A = 0, cx = 0, cy = 0, ox = pts[0][0], oy = pts[0][1];
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i], q = pts[(i + 1) % pts.length];
      var ax = p[0] - ox, ay = p[1] - oy, bx = q[0] - ox, by = q[1] - oy, c = ax * by - bx * ay;
      A += c; cx += (ax + bx) * c; cy += (ay + by) * c;
    }
    return [ox + cx / 3 / A, oy + cy / 3 / A];
  }
  function hash2(x, y) {
    var s = Math.round(x * 64) * 73856093 ^ Math.round(y * 64) * 19349663;
    s = (s ^ (s >>> 13)) * 1274126177;
    return (s >>> 7) & 3;
  }

  // The discrete flip-distance shells (article units), measured in a large
  // patch; used for word B's shell index and the legend.
  var SHELLS = [1.561, 1.732, 2.291, 2.598, 2.634, 2.704, 3.031];

  /* Make tile records from walk callbacks. */
  function record(HAT_TP, M, T, anc, inside) {
    var pts = HAT_TP.map(function (q) { return ev(C.tpApply(T, q)); });
    var a = anc[anc.length - 1].node;
    var lv = [];
    for (var L = 1; L <= 5; L++) {
      var hit = null;
      for (var i = anc.length - 1; i >= 0; i--) if (anc[i].node.level === L) { hit = anc[i]; break; }
      lv.push(hit ? (ROLE[hit.node.role] || 0) * 4 + hash2(hit.M[2], hit.M[5]) : 0);
    }
    return { k: T.k, f: T.f, c: centroid(pts), role: a.role, lv: lv, inside: inside };
  }

  function SpatialHash(tiles, G) {
    var grid = new Map();
    function key(x, y) { return Math.floor(x / G) + ',' + Math.floor(y / G); }
    tiles.forEach(function (t, i) {
      var k = key(t.c[0], t.c[1]);
      var l = grid.get(k); if (!l) grid.set(k, l = []);
      l.push(i);
    });
    this.near = function (i, R) {
      var t = tiles[i], out = [], gx = Math.floor(t.c[0] / G), gy = Math.floor(t.c[1] / G), n = Math.ceil(R / G);
      for (var a = -n; a <= n; a++) for (var b = -n; b <= n; b++) {
        var l = grid.get((gx + a) + ',' + (gy + b));
        if (!l) continue;
        for (var q = 0; q < l.length; q++) {
          var j = l[q]; if (j === i) continue;
          var d = Math.hypot(tiles[j].c[0] - t.c[0], tiles[j].c[1] - t.c[1]);
          if (d < R) out.push([j, d]);
        }
      }
      return out;
    };
  }

  // Neighbourhood signature in the tile's own frame.
  function signature(tiles, sh, i) {
    var t = tiles[i], ang = -t.k * Math.PI / 3, co = Math.cos(ang), si = Math.sin(ang);
    return sh.near(i, CENSUS_R).map(function (e) {
      var u = tiles[e[0]];
      var dx = u.c[0] - t.c[0], dy = u.c[1] - t.c[1];
      var x = co * dx - si * dy, y = si * dx + co * dy;
      if (t.f) y = -y;
      var rk = ((t.f ? t.k - u.k : u.k - t.k) % 6 + 6) % 6;
      return Math.round(x * 20) + ':' + Math.round(y * 20) + ':' + rk + ':' + (t.f ^ u.f);
    }).sort().join('|');
  }

  /* Analyse a list of tile records; fill a and b (Uint32 per tile). */
  function analyse(tiles, census) {
    var N = tiles.length, sh = new SpatialHash(tiles, 8);
    var A = new Uint32Array(N), B = new Uint32Array(N), Cw = new Uint32Array(N);
    var adj = tiles.map(function () { return []; });
    var nb = new Array(N);
    for (var i = 0; i < N; i++) nb[i] = sh.near(i, 7.2);
    // stacks: unflipped, same heading, centroids STACK_D apart
    for (i = 0; i < N; i++) {
      if (tiles[i].f) continue;
      nb[i].forEach(function (e) {
        var u = tiles[e[0]];
        if (!u.f && u.k === tiles[i].k && Math.abs(e[1] - STACK_D) < TOL) adj[i].push(e[0]);
      });
    }
    var comp = new Int32Array(N).fill(-1), csize = [];
    for (i = 0; i < N; i++) {
      if (tiles[i].f || comp[i] >= 0) continue;
      var st = [i], id = csize.length, n = 0; comp[i] = id;
      while (st.length) { var x = st.pop(); n++; adj[x].forEach(function (y) { if (comp[y] < 0) { comp[y] = id; st.push(y); } }); }
      csize.push(n);
    }
    // rivers: each flip joins the stacks of its two nearest unflipped tiles
    var river = new Int32Array(csize.length).fill(-1), flipDir = new Int32Array(N).fill(-1);
    var shellOf = new Uint8Array(N);
    for (i = 0; i < N; i++) {
      if (!tiles[i].f) continue;
      var un = nb[i].filter(function (e) { return !tiles[e[0]].f; }).sort(function (p, q) { return p[1] - q[1]; });
      if (un.length < 3) continue;
      var d0 = un[0][1];
      var two = un.filter(function (e) { return Math.abs(e[1] - d0) < TOL; });
      if (two.length === 2 && tiles[two[0][0]].k === tiles[two[1][0]].k) {
        flipDir[i] = tiles[two[0][0]].k;
        two.forEach(function (e) { river[comp[e[0]]] = tiles[e[0]].k; });
      }
      // three-shell: the three nearest unflipped tiles (2 at d0, 1 next)
      un.slice(0, 3).forEach(function (e) { shellOf[e[0]] = 1; });
    }
    var cA = Math.cos(GRAIN_DEG * Math.PI / 180), sA = Math.sin(GRAIN_DEG * Math.PI / 180);
    for (i = 0; i < N; i++) {
      var t = tiles[i];
      if (!t.inside) continue;
      var role = t.f ? 4 : ROLE[t.role] || 0;
      var stack = t.f ? 3 : adj[i].length === 0 ? 0 : adj[i].length === 1 ? 1 : 2;
      var chain = 0;
      if (t.f) { if (flipDir[i] >= 0) chain = 1 + 3 * flipDir[i]; }
      else if (river[comp[i]] >= 0) chain = 1 + 3 * river[comp[i]] + (csize[comp[i]] >= 3 ? 1 : 2);
      var dist = 0, shell = 0;
      if (!t.f) {
        var dm = Infinity;
        nb[i].forEach(function (e) { if (tiles[e[0]].f && e[1] < dm) dm = e[1]; });
        if (dm === Infinity) dm = 7.2;
        dm /= UNIT;
        dist = Math.min(31, Math.max(1, Math.round(dm / 3 * 31)));
        shell = 7;
        for (var s = 0; s < SHELLS.length; s++) if (Math.abs(dm - SHELLS[s]) < 2e-3) { shell = s + 1; break; }
      }
      var mol = t.f ? 1 : shellOf[i] ? 2 : 0;
      var ph = ((t.c[0] * cA + t.c[1] * sA) / UNIT / GRAIN_PERIOD) % 1; if (ph < 0) ph += 1;
      var grain = Math.floor(ph * 64) & 63;
      var rank = 255;
      if (census) { var r = census.get(signature(tiles, sh, i)); if (r !== undefined) rank = Math.min(254, r); }
      A[i] = role | stack << 3 | chain << 5 | dist << 10 | mol << 15 | grain << 17 | rank << 23;
      var b = 0;
      for (var L = 0; L < 5; L++) b |= (t.lv[L] & 15) << (4 * L);
      b |= shell << 20;
      B[i] = b >>> 0;
      // Word C: the projection on the grain direction, wrapped at GRAIN_WRAP
      // article units, as a 32-bit fraction. The shader rescales it by the
      // live period (u_grainMul = GRAIN_WRAP / period).
      var pw = ((t.c[0] * cA + t.c[1] * sA) / UNIT / GRAIN_WRAP) % 1; if (pw < 0) pw += 1;
      Cw[i] = Math.floor(pw * 4294967296) >>> 0;
      A[i] = A[i] >>> 0;
    }
    return { A: A, B: B, C: Cw, csize: csize, comp: comp, adj: adj, sh: sh };
  }

  function gather(ctx, HAT_TP, box, margin) {
    var tiles = [], ms = [];
    var x0 = box[0], y0 = box[1], x1 = box[2], y1 = box[3];
    C.walk(ctx.root, ctx.rootM, [x0 - margin, y0 - margin, x1 + margin, y1 + margin], function (M, T, e, v, leaf, anc) {
      var c = [M[0] * leaf.c[0] + M[1] * leaf.c[1] + M[2], M[3] * leaf.c[0] + M[4] * leaf.c[1] + M[5]];
      var inside = c[0] >= x0 && c[0] < x1 && c[1] >= y0 && c[1] < y1;
      tiles.push(record(HAT_TP, M, T, anc, inside));
      ms.push({ M: M, T: T, e: e, v: v, inside: inside });
    });
    return { tiles: tiles, ms: ms };
  }

  /* Attach the probe machinery to a hat build ctx. */
  function attach(ctx, HAT_TP) {
    ctx.extraWords = 3;
    ctx.margin = MARGIN;
    // Reference census around the start tile: signatures ranked by count.
    var s = ctx.info.start, P = s.P, R = s.R;
    var cx = P[0] + r3 * (h * R[0] - 0.5 * R[1]), cy = P[1] + r3 * (0.5 * R[0] + h * R[1]);
    var Rc = 110;
    var g = gather(ctx, HAT_TP, [cx - Rc, cy - Rc, cx + Rc, cy + Rc], 6);
    var sh = new SpatialHash(g.tiles, 8), counts = new Map(), total = 0;
    g.tiles.forEach(function (t, i) {
      if (!t.inside) return;
      var sig = signature(g.tiles, sh, i);
      counts.set(sig, (counts.get(sig) || 0) + 1); total++;
    });
    var list = Array.from(counts.entries()).sort(function (a, b) { return b[1] - a[1] || (a[0] < b[0] ? -1 : 1); });
    var census = new Map();
    list.forEach(function (e, i) { census.set(e[0], i); });
    ctx.census = census;
    ctx.info.census = { total: total, kinds: list.length, counts: list.map(function (e) { return e[1]; }) };
    ctx.annotate = function (tiles) { return analyse(tiles, census); };
    ctx.record = function (M, T, anc, inside) { return record(HAT_TP, M, T, anc, inside); };
    ctx.ask = function (m) {
      if (m.what === 'stats') return stats(ctx, HAT_TP, m);
      if (m.what === 'diffraction') return diffraction(ctx, HAT_TP, m);
      return null;
    };
    ctx.info.probes = { shells: SHELLS, unit: UNIT, grainDeg: GRAIN_DEG, grainWrap: GRAIN_WRAP };
  }

  /* Census of a square patch of half-size m.half around m.ref (reference coords). */
  function stats(ctx, HAT_TP, m) {
    var hs = m.half || 120, c = m.ref;
    var g = gather(ctx, HAT_TP, [c[0] - hs, c[1] - hs, c[0] + hs, c[1] + hs], MARGIN);
    var res = analyse(g.tiles, ctx.census);
    var out = { n: 0, flips: 0, roles: [0, 0, 0, 0, 0], axes: [0, 0, 0], stack: [0, 0, 0], pairs: 0, triples: 0,
                loners: 0, onRiver: 0, flipsOk: 0, shells: [0, 0, 0, 0, 0, 0, 0, 0], shellShared: 0, distMin: Infinity, distMax: 0,
                kinds: new Set(), half: hs };
    var seen = new Set();
    g.tiles.forEach(function (t, i) {
      if (!t.inside) return;
      var a = res.A[i], b = res.B[i];
      out.n++;
      if (t.f) out.flips++; else out.axes[t.k % 3]++;
      out.roles[a & 7]++;
      var st = (a >> 3) & 3; if (st < 3) out.stack[st]++;
      if (!t.f && !seen.has(res.comp[i])) {
        seen.add(res.comp[i]);
        var cs = res.csize[res.comp[i]];
        if (cs === 2) out.pairs++; else if (cs === 3) out.triples++; else if (cs === 1) out.loners++; else out.longer = (out.longer || 0) + 1;
      }
      if (((a >> 5) & 31) !== 0) out.onRiver++;
      var sh = (b >> 20) & 7; out.shells[sh]++;
      if (!t.f) {
        var d = SHELLS[sh - 1];
        if (d) { out.distMin = Math.min(out.distMin, d); out.distMax = Math.max(out.distMax, d); }
      }
      out.kinds.add((a >>> 23) & 255);
    });
    out.kinds = out.kinds.size;
    out.mol = 0;
    g.tiles.forEach(function (t, i) { if (t.inside && ((res.A[i] >> 15) & 3) === 2) out.mol++; });
    return out;
  }

  /* Diffraction: |sum exp(i k.x)|^2 over tile centroids in a disc, on a k grid.
     k in reciprocal article units. */
  function diffraction(ctx, HAT_TP, m) {
    var Rr = m.radius || 70, c = m.ref, n = m.n || 160, K = m.kmax || 8;
    var g = gather(ctx, HAT_TP, [c[0] - Rr, c[1] - Rr, c[0] + Rr, c[1] + Rr], 0);
    var xs = [], ys = [], ws = [];
    g.tiles.forEach(function (t) {
      var dx = (t.c[0] - c[0]) / UNIT, dy = (t.c[1] - c[1]) / UNIT, rr = Math.hypot(dx, dy) / (Rr / UNIT);
      if (rr >= 1 || (m.only === 'flips' && !t.f)) return;
      xs.push(dx); ys.push(dy); ws.push(0.5 + 0.5 * Math.cos(Math.PI * rr));   // Hann taper
    });
    var img = new Float32Array(n * n), N = xs.length;
    // Separable trick: exp(i(kx x + ky y)) = exp(i kx x) exp(i ky y)
    var ex = new Float32Array(n * N * 2), ey = new Float32Array(n * N * 2);
    for (var a = 0; a < n; a++) {
      var k = -K + 2 * K * a / (n - 1);
      for (var j = 0; j < N; j++) {
        ex[2 * (a * N + j)] = Math.cos(k * xs[j]) * ws[j]; ex[2 * (a * N + j) + 1] = Math.sin(k * xs[j]) * ws[j];
        ey[2 * (a * N + j)] = Math.cos(k * ys[j]); ey[2 * (a * N + j) + 1] = Math.sin(k * ys[j]);
      }
    }
    var mx = 0;
    for (var b = 0; b < n; b++) for (a = 0; a < n; a++) {
      var re = 0, im = 0, oa = a * N * 2, ob = b * N * 2;
      for (j = 0; j < N; j++) {
        var xr = ex[oa + 2 * j], xi = ex[oa + 2 * j + 1], yr = ey[ob + 2 * j], yi = ey[ob + 2 * j + 1];
        re += xr * yr - xi * yi; im += xr * yi + xi * yr;
      }
      var I = re * re + im * im; img[b * n + a] = I;
      if (!(Math.abs(a - (n - 1) / 2) < 2 && Math.abs(b - (n - 1) / 2) < 2) && I > mx) mx = I;
    }
    return { n: n, K: K, count: N, img: img, max: mx };
  }

  var api = { attach: attach, analyse: analyse, SHELLS: SHELLS, UNIT: UNIT };
  global.HatProbes = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof self !== 'undefined' ? self : this);
