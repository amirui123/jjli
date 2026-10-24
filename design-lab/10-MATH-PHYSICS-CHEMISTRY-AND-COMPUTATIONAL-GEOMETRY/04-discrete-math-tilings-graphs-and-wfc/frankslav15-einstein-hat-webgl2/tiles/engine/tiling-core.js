/* Shared worker code for the tiling explorer. A tiling file (spectre/tiling.js,
   hat/tiling.js) builds a hierarchy of prototypes with the helpers here, then
   calls TilingCore.serve() to answer the page's requests.

   A prototype is a leaf (one tile, with its outline in local coordinates) or
   a supertile: a list of children, each with an affine transform. Prototypes
   are shared, so the whole plane is one small graph, and a request walks down
   it, skipping any branch whose bounding circle misses the region asked for.

   Every tile carries a level for each of its 14 edges and 14 corners: the
   highest supertile level whose boundary runs along that edge or through
   that corner, capped at LEVEL_CAP. The page draws supertile outlines from
   these numbers.

   Positions come in two parts, p and r, so a page can reshape its tiles
   live: a corner sits at a*p + b*zeta*r, where a and b are the two edge
   lengths and zeta turns r by 30 degrees. p and r are elements of Z[w],
   w = e^(i pi/3), stored as integer pairs (m, n) = m + n*w. The Hat's a and
   b are its two edge lengths. The Spectre's are the lengths of its edges at
   even and at odd multiples of 30 degrees, equal for the Spectre itself. */
(function (global) {
  'use strict';

  var LEVEL_CAP = 5;
  var H3 = Math.sqrt(3) / 2;
  var IDENT = [1, 0, 0, 0, 1, 0];

  function mul(A, B) {
    return [
      A[0] * B[0] + A[1] * B[3], A[0] * B[1] + A[1] * B[4], A[0] * B[2] + A[1] * B[5] + A[2],
      A[3] * B[0] + A[4] * B[3], A[3] * B[1] + A[4] * B[4], A[3] * B[2] + A[4] * B[5] + A[5]
    ];
  }
  function transPt(M, p) { return [M[0] * p[0] + M[1] * p[1] + M[2], M[3] * p[0] + M[4] * p[1] + M[5]]; }
  function scaleOf(M) { return Math.sqrt(Math.abs(M[0] * M[4] - M[1] * M[3])); }
  function key(p) { return Math.round(p[0] * 1024) + ',' + Math.round(p[1] * 1024); }

  /* ------------------------------------------------------------ Z[w] */

  var zw = {
    add: function (x, y) { return [x[0] + y[0], x[1] + y[1]]; },
    sub: function (x, y) { return [x[0] - y[0], x[1] - y[1]]; },
    // Multiply by w^k: w * (m + n w) = -n + (m + n) w.
    rot: function (x, k) {
      k = ((k % 6) + 6) % 6;
      var m = x[0], n = x[1];
      for (var i = 0; i < k; i++) { var t = -n; n = m + n; m = t; }
      return [m, n];
    },
    conj: function (x) { return [x[0] + x[1], -x[1]]; },
    val: function (x) { return [x[0] + 0.5 * x[1], H3 * x[1]]; }
  };

  /* A two-part transform {k, f, p, r}: reflect first when f is 1, then turn by
     k * 60 degrees, then add (p, r). Turning or reflecting the plane acts on
     p directly, and on r through zeta, which is why a reflection sends r to
     w^-1 * conj(r). The Spectre also needs 30-degree turns, so a transform
     may carry h = 1 for one more 30-degree turn. That turn sends
     p + zeta*r to w*r + zeta*p: the parts swap, and the new p gains a w. */
  function linP(k, f, p) { return zw.rot(f ? zw.conj(p) : p, k); }
  function linR(k, f, r) { return zw.rot(f ? zw.rot(zw.conj(r), -1) : r, k); }
  function tpApply(T, x) {
    if (!T.h) return { p: zw.add(linP(T.k, T.f, x.p), T.p), r: zw.add(linR(T.k, T.f, x.r), T.r) };
    var p = linP(T.k, T.f, x.p), r = linR(T.k, T.f, x.r);
    return { p: zw.add(zw.rot(r, 1), T.p), r: zw.add(p, T.r) };
  }
  function tpCompose(A, B) {
    var t = tpApply(A, B);
    // Turns in 30-degree steps: a reflection in A reverses B's turn.
    var jA = 2 * A.k + (A.h || 0), jB = 2 * B.k + (B.h || 0);
    var j = ((A.f ? jA - jB : jA + jB) % 12 + 12) % 12;
    var out = { k: j >> 1, f: A.f ^ B.f, p: t.p, r: t.r };
    if (j & 1) out.h = 1;
    return out;
  }
  function tpLinear(M) {
    var f = M[0] * M[4] - M[1] * M[3] < 0 ? 1 : 0;
    var k = ((Math.round(Math.atan2(M[3], M[0]) / (Math.PI / 3)) % 6) + 6) % 6;
    return { k: k, f: f, p: [0, 0], r: [0, 0] };
  }
  var TP_IDENT = { k: 0, f: 0, p: [0, 0], r: [0, 0] };

  /* ------------------------------------------------------ prototypes */

  function makeLeaf(outline, extra) {
    var n = outline.length, sx = 0, sy = 0;
    outline.forEach(function (p) { sx += p[0]; sy += p[1]; });
    var c = [sx / n, sy / n], r = 0;
    outline.forEach(function (p) { r = Math.max(r, Math.hypot(p[0] - c[0], p[1] - c[1])); });
    var edges = outline.map(function (p, i) { return [i, (i + 1) % n]; });
    var leaf = { leaf: true, level: 0, verts: outline.slice(), edges: edges, c: c, r: r };
    for (var k in extra || {}) leaf[k] = extra[k];
    return leaf;
  }

  function mids(node) {
    return node.edges.map(function (e) {
      var a = node.verts[e[0]], b = node.verts[e[1]];
      return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    });
  }

  /* A supertile. Its boundary is recorded as its boundary corners and its
     boundary edges, as index pairs into the corner list, in local
     coordinates. For each child, edgeMaps and vertMaps send the child's own
     boundary indices to the supertile's, or to -1 where the child's edge or
     corner lies inside the supertile. */
  function makeMeta(children, transforms, level, withBoundary) {
    var node = { leaf: false, level: level, children: children, transforms: transforms };
    var x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    var cs = children.map(function (ch, i) {
      var p = transPt(transforms[i], ch.c), rr = ch.r * scaleOf(transforms[i]);
      x0 = Math.min(x0, p[0] - rr); x1 = Math.max(x1, p[0] + rr);
      y0 = Math.min(y0, p[1] - rr); y1 = Math.max(y1, p[1] + rr);
      return [p, rr];
    });
    node.c = [(x0 + x1) / 2, (y0 + y1) / 2];
    node.r = 0;
    cs.forEach(function (pr) {
      node.r = Math.max(node.r, Math.hypot(pr[0][0] - node.c[0], pr[0][1] - node.c[1]) + pr[1]);
    });
    if (!withBoundary) return node;

    // An edge lies on the boundary when exactly one child has it.
    var count = new Map();
    var edgeKeys = children.map(function (ch, i) {
      return mids(ch).map(function (m) {
        var k = key(transPt(transforms[i], m));
        count.set(k, (count.get(k) || 0) + 1);
        return k;
      });
    });
    var verts = [], vertIndex = new Map(), edges = [], edgeIndex = new Map();
    function vert(p) {
      var k = key(p);
      if (!vertIndex.has(k)) { vertIndex.set(k, verts.length); verts.push(p); }
      return vertIndex.get(k);
    }
    children.forEach(function (ch, i) {
      ch.edges.forEach(function (e, j) {
        var k = edgeKeys[i][j];
        if (count.get(k) !== 1) return;
        edgeIndex.set(k, edges.length);
        edges.push([vert(transPt(transforms[i], ch.verts[e[0]])), vert(transPt(transforms[i], ch.verts[e[1]]))]);
      });
    });
    node.verts = verts;
    node.edges = edges;
    node.edgeMaps = edgeKeys.map(function (keys) {
      return Int32Array.from(keys, function (k) { return count.get(k) === 1 ? edgeIndex.get(k) : -1; });
    });
    // A corner lies on the boundary when it ends a boundary edge.
    node.vertMaps = children.map(function (ch, i) {
      return Int32Array.from(ch.verts, function (v) {
        var k = key(transPt(transforms[i], v));
        return vertIndex.has(k) ? vertIndex.get(k) : -1;
      });
    });
    return node;
  }

  /* --------------------------------------------------------------- walk */

  /* Call emit(M, T, edgeLevels, cornerLevels, leaf) for every tile whose
     centre lies in the box [x0, x1) x [y0, y1). M is the float transform and
     T the two-part one, or null when the tiling has none. A branch is
     skipped before its level arrays are built, since a level-4 supertile can
     have thousands of boundary edges. */
  function walk(root, rootM, box, emit) {
    var x0 = box[0], y0 = box[1], x1 = box[2], y1 = box[3];
    function inside(node, M) {
      var c = node.c;
      var cx = M[0] * c[0] + M[1] * c[1] + M[2], cy = M[3] * c[0] + M[4] * c[1] + M[5];
      if (node.leaf) return cx >= x0 && cx < x1 && cy >= y0 && cy < y1;
      var dx = Math.max(x0 - cx, 0, cx - x1), dy = Math.max(y0 - cy, 0, cy - y1);
      var rr = node.r * scaleOf(M);
      return dx * dx + dy * dy <= rr * rr;
    }
    // anc: the chain of supertiles above the current node, outermost first,
    // as {node, M}. (Added for the probe maps: substitution roles and
    // supertile ancestry.)
    var anc = [];
    function visit(node, M, T, eLv, vLv) {
      if (node.leaf) { emit(M, T, eLv, vLv, node, anc); return; }
      anc.push({ node: node, M: M });
      for (var i = 0; i < node.children.length; i++) {
        var ch = node.children[i];
        var CM = mul(M, node.transforms[i]);
        if (!inside(ch, CM)) continue;
        var ce = null, cv = null;
        if (node.level <= LEVEL_CAP) {
          // A child's boundary edge keeps this node's level for it where the
          // edge is on this node's boundary too, and takes its own otherwise.
          var own = ch.level, em = node.edgeMaps[i], vm = node.vertMaps[i], j;
          ce = new Uint8Array(em.length);
          for (j = 0; j < em.length; j++) ce[j] = em[j] < 0 ? own : (eLv ? eLv[em[j]] : LEVEL_CAP);
          cv = new Uint8Array(vm.length);
          for (j = 0; j < vm.length; j++) cv[j] = vm[j] < 0 ? own : (vLv ? vLv[vm[j]] : LEVEL_CAP);
        }
        visit(ch, CM, T && node.TP ? tpCompose(T, node.TP[i]) : null, ce, cv);
      }
      anc.pop();
    }
    if (inside(root, rootM)) visit(root, rootM, root.TP ? TP_IDENT : null, null, null);
  }

  /* ------------------------------------------------------------ chunks */

  /* One tile packs into seven 32-bit words: p and r as two float pairs,
     relative to the chunk's own origin (p0, r0), then three words of bit
     fields. Word 4 holds the turn in 30-degree steps (4 bits), the reflection
     flag (1 bit, then 3 spare) and edges 0 to 7 (3 bits each). Word 5 holds
     edges 8 to 13 and corners 0 to 3. Word 6 holds corners 4 to 13.

     place(M, T) returns the tile's {p, r} as integer pairs, or {P, R} as
     plain vectors when the tiling has no exact form, plus turn and flip. */
  /* A tiling may add ctx.extraWords (2 for the Hat probe maps) after the
     seven words, filled by ctx.annotate(records), which sees every tile in
     the box plus ctx.margin so neighbour-based maps are right at chunk
     edges. (Probe-map extension; without it the format is unchanged.) */
  function chunk(ctx, box) {
    var XW = ctx.extraWords || 0, WPT = 7 + XW, BPT = 4 * WPT;
    var cap = 256, buf = new ArrayBuffer(cap * BPT), f = new Float32Array(buf), u = new Uint32Array(buf);
    var n = 0, origin = null;
    var lo = [Infinity, Infinity, Infinity, Infinity], hi = [-Infinity, -Infinity, -Infinity, -Infinity];
    var items = [], extra = null;
    if (XW && ctx.annotate) {
      var mg = ctx.margin || 0, recs = [];
      walk(ctx.root, ctx.rootM, [box[0] - mg, box[1] - mg, box[2] + mg, box[3] + mg], function (M, T, e, v, leaf, anc) {
        var cx = M[0] * leaf.c[0] + M[1] * leaf.c[1] + M[2], cy = M[3] * leaf.c[0] + M[4] * leaf.c[1] + M[5];
        var inside = cx >= box[0] && cx < box[2] && cy >= box[1] && cy < box[3];
        recs.push(ctx.record(M, T, anc, inside));
        items.push(inside ? [M, T, e, v] : null);
      });
      var res = ctx.annotate(recs);
      extra = [res.A, res.B, res.C];
    } else {
      walk(ctx.root, ctx.rootM, box, function (M, T, e, v) { items.push([M, T, e, v]); });
    }
    items.forEach(function (it, idx) {
      if (!it) return;
      var M = it[0], T = it[1], e = it[2], v = it[3];
      var pl = ctx.place(M, T);
      if (!origin) origin = pl;
      if (n === cap) {
        cap *= 2;
        var nb = new ArrayBuffer(cap * BPT);
        new Uint32Array(nb).set(u);
        buf = nb; f = new Float32Array(buf); u = new Uint32Array(buf);
      }
      var P, R;
      if (pl.p) {
        P = zw.val(zw.sub(pl.p, origin.p));
        R = zw.val(zw.sub(pl.r, origin.r));
      } else {
        P = [pl.P[0] - origin.P[0], pl.P[1] - origin.P[1]];
        R = [0, 0];
      }
      var ZR = [H3 * R[0] - 0.5 * R[1], 0.5 * R[0] + H3 * R[1]];
      var q = [P[0], P[1], ZR[0], ZR[1]];
      for (var i = 0; i < 4; i++) { if (q[i] < lo[i]) lo[i] = q[i]; if (q[i] > hi[i]) hi[i] = q[i]; }
      var b = n * WPT, j;
      f[b] = P[0]; f[b + 1] = P[1]; f[b + 2] = R[0]; f[b + 3] = R[1];
      var w4 = (pl.turn & 15) | (pl.flip ? 16 : 0);
      for (j = 0; j < 8; j++) w4 |= e[j] << (8 + 3 * j);
      var w5 = 0;
      for (j = 8; j < 14; j++) w5 |= e[j] << (3 * (j - 8));
      for (j = 0; j < 4; j++) w5 |= v[j] << (18 + 3 * j);
      var w6 = 0;
      for (j = 4; j < 14; j++) w6 |= v[j] << (3 * (j - 4));
      u[b + 4] = w4; u[b + 5] = w5; u[b + 6] = w6;
      for (j = 0; j < XW; j++) u[b + 7 + j] = extra ? extra[j][idx] : 0;
      n++;
    });
    var P0 = [0, 0], R0 = [0, 0];
    if (origin && origin.p) { P0 = zw.val(origin.p); R0 = zw.val(origin.r); }
    else if (origin) { P0 = origin.P; }
    return { buffer: buf.slice(0, n * BPT), count: n, P0: P0, R0: R0, lo: lo, hi: hi };
  }

  /* The corner nearest a point, for the grid tool. The worker looks in a
     small box around ref, the point in the tiling's own coordinates, and
     measures true distance at the page's current edge lengths. */
  function nearestCorner(ctx, ref, world, ab, radius) {
    var best = null, bestD = Infinity;
    var box = [ref[0] - radius, ref[1] - radius, ref[0] + radius, ref[1] + radius];
    walk(ctx.root, ctx.rootM, box, function (M, T, e, v, leaf) {
      var pts = ctx.corners(M, T, leaf);
      pts.forEach(function (c) {
        var w = [ab[0] * c.P[0] + ab[1] * (H3 * c.R[0] - 0.5 * c.R[1]), ab[0] * c.P[1] + ab[1] * (0.5 * c.R[0] + H3 * c.R[1])];
        var d = Math.hypot(w[0] - world[0], w[1] - world[1]);
        if (d < bestD) { bestD = d; best = { P: c.P, R: c.R, world: w }; }
      });
    });
    return best;
  }

  /* ----------------------------------------------------------- serving */

  // Answer the page. Builds the tiling on 'init', then serves chunks and
  // corner lookups. ctx comes from the tiling file's build().
  function serve(build) {
    var ctx = null;
    function handle(m, reply) {
      if (m.type === 'init') {
        ctx = build(m.options || {});
        reply({ type: 'ready', info: ctx.info });
      } else if (m.type === 'chunk') {
        var res = chunk(ctx, [m.i * m.size, m.j * m.size, (m.i + 1) * m.size, (m.j + 1) * m.size]);
        reply({ type: 'chunk', i: m.i, j: m.j, count: res.count, buffer: res.buffer,
                P0: res.P0, R0: res.R0, lo: res.lo, hi: res.hi }, [res.buffer]);
      } else if (m.type === 'corner') {
        reply({ type: 'corner', id: m.id, corner: nearestCorner(ctx, m.ref, m.world, m.ab, m.radius) });
      } else if (m.type === 'ask') {
        // Probe-map extension: a tiling may answer free-form questions.
        var ans = null, err = null;
        try { ans = ctx.ask ? ctx.ask(m) : null; } catch (ex) { err = String(ex && ex.stack || ex); }
        reply({ type: 'answer', id: m.id, answer: ans, error: err });
      }
    }
    if (typeof importScripts === 'function' && typeof window === 'undefined') {
      global.onmessage = function (ev) {
        handle(ev.data, function (msg, transfer) { global.postMessage(msg, transfer || []); });
      };
    }
    return handle;
  }

  var api = {
    LEVEL_CAP: LEVEL_CAP, IDENT: IDENT, H3: H3,
    mul: mul, transPt: transPt, scaleOf: scaleOf, key: key,
    zw: zw, linP: linP, linR: linR, tpApply: tpApply, tpCompose: tpCompose, tpLinear: tpLinear, TP_IDENT: TP_IDENT,
    makeLeaf: makeLeaf, makeMeta: makeMeta, walk: walk, chunk: chunk, nearestCorner: nearestCorner, serve: serve
  };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.TilingCore = api;
})(typeof self !== 'undefined' ? self : this);
