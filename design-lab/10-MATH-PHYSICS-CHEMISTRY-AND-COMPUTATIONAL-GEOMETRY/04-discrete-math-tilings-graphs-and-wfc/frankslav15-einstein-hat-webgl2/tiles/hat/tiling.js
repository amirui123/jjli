/* Hat tiling generator, run as a Web Worker by index.html. The shared
   machinery lives in ../engine/tiling-core.js; this file holds the Hat's own
   rules.

   The construction follows Craig Kaplan's hatviz code for the Hat paper
   (Smith, Myers, Kaplan and Goodman-Strauss, 2023): four metatiles, H, T, P
   and F, each holding a few hats, compose into larger H, T, P and F
   metatiles, level after level. One patch rule here, for child 26, differs
   from the version first remembered. Testing every alternative for overlaps
   across three levels pinned it down, and sampling then found every point
   covered exactly once.

   Kaplan places hats at one shape, Tile(1, sqrt 3). To reshape them live,
   every hat also gets a two-part position (see tiling-core.js): its corners
   sit at a*p + b*zeta*r for any edge lengths a and b. The two-part offsets
   between neighbouring pieces come from their shared hat edges, so the
   reshaped tiling stays a tiling for every a and b. */
(function (global) {
  'use strict';

  if (typeof importScripts === 'function' && typeof window === 'undefined' && !global.TilingCore) {
    importScripts('../engine/tiling-core.js');
  }
  // Probe maps (SlavisTon's article), loaded only by the probe page's workers.
  if (typeof importScripts === 'function' && typeof window === 'undefined' && !global.HatProbes &&
      /[?&]probes=1/.test(global.location && global.location.search || '')) {
    importScripts('probes.js');
  }
  var C = global.TilingCore || require('../engine/tiling-core.js');
  var zw = C.zw, IDENT = C.IDENT;

  var r3 = Math.sqrt(3), hr3 = r3 / 2, PI = Math.PI;
  // Kaplan level 16 spans about 10^7 hat widths; the plane is one H metatile.
  var TOP_LEVEL = 16;

  /* --------------------------------------------- Kaplan's construction */

  function pt(x, y) { return { x: x, y: y }; }
  function hexPt(x, y) { return pt(x + 0.5 * y, hr3 * y); }
  function inv(T) {
    var det = T[0] * T[4] - T[1] * T[3];
    return [T[4] / det, -T[1] / det, (T[1] * T[5] - T[2] * T[4]) / det,
            -T[3] / det, T[0] / det, (T[2] * T[3] - T[0] * T[5]) / det];
  }
  var mul = C.mul;
  function padd(p, q) { return pt(p.x + q.x, p.y + q.y); }
  function psub(p, q) { return pt(p.x - q.x, p.y - q.y); }
  function trot(a) { var c = Math.cos(a), s = Math.sin(a); return [c, -s, 0, s, c, 0]; }
  function ttrans(x, y) { return [1, 0, x, 0, 1, y]; }
  function rotAbout(p, a) { return mul(ttrans(p.x, p.y), mul(trot(a), ttrans(-p.x, -p.y))); }
  function tp(M, P) { return pt(M[0] * P.x + M[1] * P.y + M[2], M[3] * P.x + M[4] * P.y + M[5]); }
  function matchSeg(p, q) { return [q.x - p.x, p.y - q.y, p.x, q.y - p.y, q.x - p.x, p.y]; }
  function matchTwo(p1, q1, p2, q2) { return mul(matchSeg(p2, q2), inv(matchSeg(p1, q1))); }
  function intersect(p1, q1, p2, q2) {
    var d = (q2.y - p2.y) * (q1.x - p1.x) - (q2.x - p2.x) * (q1.y - p1.y);
    var uA = ((q2.x - p2.x) * (p1.y - p2.y) - (q2.y - p2.y) * (p1.x - p2.x)) / d;
    return pt(p1.x + uA * (q1.x - p1.x), p1.y + uA * (q1.y - p1.y));
  }

  var HAT_OUTLINE = [
    hexPt(0, 0), hexPt(-1, -1), hexPt(0, -2), hexPt(2, -2),
    hexPt(2, -1), hexPt(4, -2), hexPt(5, -1), hexPt(4, 0),
    hexPt(3, 0), hexPt(2, 2), hexPt(0, 3), hexPt(0, 2),
    hexPt(-1, 2)];

  function Meta(shape) { this.shape = shape; this.children = []; }
  Meta.prototype.add = function (T, geom) { this.children.push({ T: T, geom: geom }); };
  Meta.prototype.evalChild = function (n, i) { return tp(this.children[n].T, this.children[n].geom.shape[i]); };
  Meta.prototype.recentre = function () {
    var cx = 0, cy = 0;
    this.shape.forEach(function (p) { cx += p.x; cy += p.y; });
    cx /= this.shape.length; cy /= this.shape.length;
    this.shape = this.shape.map(function (p) { return pt(p.x - cx, p.y - cy); });
    var M = ttrans(-cx, -cy);
    this.children.forEach(function (ch) { ch.T = mul(M, ch.T); });
  };
  var HAT = { hat: true };

  function initH() {
    var o = [pt(0, 0), pt(4, 0), pt(4.5, hr3), pt(2.5, 5 * hr3), pt(1.5, 5 * hr3), pt(-0.5, hr3)];
    var m = new Meta(o);
    m.add(matchTwo(HAT_OUTLINE[5], HAT_OUTLINE[7], o[5], o[0]), HAT);
    m.add(matchTwo(HAT_OUTLINE[9], HAT_OUTLINE[11], o[1], o[2]), HAT);
    m.add(matchTwo(HAT_OUTLINE[5], HAT_OUTLINE[7], o[3], o[4]), HAT);
    // The one mirrored hat in every H.
    m.add(mul(ttrans(2.5, hr3), mul([-0.5, -hr3, 0, hr3, -0.5, 0], [0.5, 0, 0, 0, -0.5, 0])), HAT);
    return m;
  }
  function initT() {
    var m = new Meta([pt(0, 0), pt(3, 0), pt(1.5, 3 * hr3)]);
    m.add([0.5, 0, 0.5, 0, 0.5, hr3], HAT);
    return m;
  }
  function initP() {
    var m = new Meta([pt(0, 0), pt(4, 0), pt(3, 2 * hr3), pt(-1, 2 * hr3)]);
    m.add([0.5, 0, 1.5, 0, 0.5, hr3], HAT);
    m.add(mul(ttrans(0, 2 * hr3), mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0])), HAT);
    return m;
  }
  function initF() {
    var m = new Meta([pt(0, 0), pt(3, 0), pt(3.5, hr3), pt(3, 2 * hr3), pt(-1, 2 * hr3)]);
    m.add([0.5, 0, 1.5, 0, 0.5, hr3], HAT);
    m.add(mul(ttrans(0, 2 * hr3), mul([0.5, hr3, 0, -hr3, 0.5, 0], [0.5, 0, 0, 0, 0.5, 0])), HAT);
    return m;
  }

  // Each rule places one metatile against an earlier one, edge to edge.
  var PATCH_RULES = [
    ['H'],
    [0, 0, 'P', 2], [1, 0, 'H', 2], [2, 0, 'P', 2], [3, 0, 'H', 2], [4, 4, 'P', 2],
    [0, 4, 'F', 3], [2, 4, 'F', 3], [4, 1, 3, 2, 'F', 0], [8, 3, 'H', 0], [9, 2, 'P', 0],
    [10, 2, 'H', 0], [11, 4, 'P', 2], [12, 0, 'H', 2], [13, 0, 'F', 3], [14, 2, 'F', 1],
    [15, 3, 'H', 4], [8, 2, 'F', 1], [17, 3, 'H', 0], [18, 2, 'P', 0], [19, 2, 'H', 2],
    [20, 4, 'F', 3], [20, 0, 'P', 2], [22, 0, 'H', 2], [23, 4, 'F', 3], [23, 0, 'F', 3],
    [16, 0, 'P', 2], [9, 4, 0, 2, 'T', 2], [4, 0, 'F', 3]
  ];

  function constructPatch(H, T, P, F) {
    var ret = new Meta([]), shapes = { H: H, T: T, P: P, F: F };
    PATCH_RULES.forEach(function (r) {
      var n, np;
      if (r.length === 1) {
        ret.add(IDENT, shapes[r[0]]);
      } else if (r.length === 4) {
        var c = ret.children[r[0]], poly = c.geom.shape;
        var P2 = tp(c.T, poly[(r[1] + 1) % poly.length]), Q = tp(c.T, poly[r[1]]);
        n = shapes[r[2]]; np = n.shape;
        ret.add(matchTwo(np[r[3]], np[(r[3] + 1) % np.length], P2, Q), n);
      } else {
        var cP = ret.children[r[0]], cQ = ret.children[r[2]];
        var P3 = tp(cQ.T, cQ.geom.shape[r[3]]), Q3 = tp(cP.T, cP.geom.shape[r[1]]);
        n = shapes[r[4]]; np = n.shape;
        ret.add(matchTwo(np[r[5]], np[(r[5] + 1) % np.length], P3, Q3), n);
      }
    });
    return ret;
  }

  function constructMetatiles(patch) {
    var bps1 = patch.evalChild(8, 2), bps2 = patch.evalChild(21, 2);
    var rbps = tp(rotAbout(bps1, -2 * PI / 3), bps2);
    var p72 = patch.evalChild(7, 2), p252 = patch.evalChild(25, 2);
    var llc = intersect(bps1, rbps, patch.evalChild(6, 2), p72);
    var w = psub(patch.evalChild(6, 2), llc);
    var Ho = [llc, bps1];
    w = tp(trot(-PI / 3), w);
    Ho.push(padd(Ho[1], w));
    Ho.push(patch.evalChild(14, 2));
    w = tp(trot(-PI / 3), w);
    Ho.push(psub(Ho[3], w));
    Ho.push(patch.evalChild(6, 2));
    function make(shape, list) {
      var m = new Meta(shape);
      list.forEach(function (ch) { m.add(patch.children[ch].T, patch.children[ch].geom); });
      return m;
    }
    var nH = make(Ho, [0, 9, 16, 27, 26, 6, 1, 8, 10, 15]);
    var nP = make([p72, padd(p72, psub(bps1, llc)), bps1, llc], [7, 2, 3, 4, 28]);
    var nF = make([bps2, patch.evalChild(24, 2), patch.evalChild(25, 0), p252, padd(p252, psub(llc, bps1))],
                  [21, 20, 22, 23, 24, 25]);
    var A = Ho[2], B = padd(Ho[1], psub(Ho[4], Ho[5])), Cc = tp(rotAbout(B, -PI / 3), A);
    var nT = make([B, Cc, A], [11]);
    [nH, nP, nF, nT].forEach(function (m) { m.recentre(); });
    return [nH, nT, nP, nF];
  }

  /* -------------------------------------------------- two-part positions */

  // The hat outline with its length-2 edge split, so each of the 14 edges is
  // one unit step: a-edges (directions 0, 60, ...) of length 1 and b-edges
  // (directions 30, 90, ...) of length sqrt 3.
  var HAT14 = [];
  HAT_OUTLINE.forEach(function (p, i) {
    var q = HAT_OUTLINE[(i + 1) % 13];
    HAT14.push([p.x, p.y]);
    if (Math.hypot(q.x - p.x, q.y - p.y) > 1.9) HAT14.push([(p.x + q.x) / 2, (p.y + q.y) / 2]);
  });
  var HAT_TP = [{ p: [0, 0], r: [0, 0] }];
  for (var e = 0; e < 13; e++) {
    var a0 = HAT14[e], a1 = HAT14[e + 1];
    var dir = Math.round(Math.atan2(a1[1] - a0[1], a1[0] - a0[0]) / (PI / 6));
    var cur = HAT_TP[e];
    HAT_TP.push(((dir % 2) + 2) % 2 === 0
      ? { p: zw.add(cur.p, zw.rot([1, 0], dir / 2)), r: cur.r }
      : { p: cur.p, r: zw.add(cur.r, zw.rot([1, 0], (dir - 1) / 2)) });
  }

  function fpt(M, p) { return [M[0] * p[0] + M[1] * p[1] + M[2], M[3] * p[0] + M[4] * p[1] + M[5]]; }

  // Hats of a node near point q (node frame), with float and two-part transforms.
  function hatsNear(node, F, T, q, rho, out) {
    if (node.leaf) { out.push({ F: F, T: T }); return out; }
    node.children.forEach(function (ch, i) {
      var Fc = mul(F, node.transforms[i]), c = fpt(Fc, ch.c), rr = ch.r * C.scaleOf(Fc);
      if (Math.hypot(c[0] - q[0], c[1] - q[1]) <= rho + rr) hatsNear(ch, Fc, C.tpCompose(T, node.TP[i]), q, rho, out);
    });
    return out;
  }

  // The two-part offset that makes a hat in Hj share an edge with a hat in
  // Hi, or null. Corners of Hi go in a hash, so wide searches stay fast.
  function cornerKey(p) { return Math.round(p[0] * 256) + ',' + Math.round(p[1] * 256); }
  function solveFromHats(Hi, Hj) {
    var table = new Map();
    Hi.forEach(function (hi) {
      var X = HAT14.map(function (p) { return fpt(hi.F, p); });
      X.forEach(function (x, u) {
        var k = cornerKey(x);
        if (!table.has(k)) table.set(k, []);
        table.get(k).push({ h: hi, u: u, next: X[(u + 1) % 14], prev: X[(u + 13) % 14] });
      });
    });
    for (var y = 0; y < Hj.length; y++) {
      var hj = Hj[y], Xj = HAT14.map(function (p) { return fpt(hj.F, p); });
      for (var v = 0; v < 14; v++) {
        var hits = table.get(cornerKey(Xj[v]));
        if (!hits) continue;
        for (var z = 0; z < hits.length; z++) {
          var hit = hits[z], v2 = -1, u2 = -1;
          // A shared edge: a neighbouring corner of each hat also coincides.
          [[1, 13], [1, 1], [13, 13], [13, 1]].forEach(function (d) {
            var a = d[0] === 1 ? hit.next : hit.prev, w = (v + d[1]) % 14;
            if (v2 < 0 && Math.hypot(a[0] - Xj[w][0], a[1] - Xj[w][1]) < 1e-3) { u2 = (hit.u + d[0]) % 14; v2 = w; }
          });
          if (v2 < 0) continue;
          var A = C.tpApply(hit.h.T, HAT_TP[hit.u]), B = C.tpApply(hj.T, HAT_TP[v]);
          var A2 = C.tpApply(hit.h.T, HAT_TP[u2]), B2 = C.tpApply(hj.T, HAT_TP[v2]);
          var t = { p: zw.sub(A.p, B.p), r: zw.sub(A.r, B.r) };
          if (zw.sub(A2.p, B2.p).join() !== t.p.join() || zw.sub(A2.r, B2.r).join() !== t.r.join()) {
            throw new Error('a shared hat edge gave two different offsets');
          }
          return t;
        }
      }
    }
    return null;
  }

  function outlineOverlaps(Pi, Pj) {
    var res = [];
    for (var a = 0; a < Pi.length; a++) {
      var A = Pi[a], B = Pi[(a + 1) % Pi.length], L = Math.hypot(B[0] - A[0], B[1] - A[1]);
      var ux = (B[0] - A[0]) / L, uy = (B[1] - A[1]) / L;
      for (var b = 0; b < Pj.length; b++) {
        var Cc = Pj[b], D = Pj[(b + 1) % Pj.length];
        var dc = (Cc[0] - A[0]) * uy - (Cc[1] - A[1]) * ux, dd = (D[0] - A[0]) * uy - (D[1] - A[1]) * ux;
        if (Math.abs(dc) > 1e-6 * L || Math.abs(dd) > 1e-6 * L) continue;
        var tc = (Cc[0] - A[0]) * ux + (Cc[1] - A[1]) * uy, td = (D[0] - A[0]) * ux + (D[1] - A[1]) * uy;
        var lo = Math.max(0, Math.min(tc, td)), hi = Math.min(L, Math.max(tc, td));
        if (hi - lo > 1e-6 * L) {
          res.push({ len: hi - lo, pts: [[A[0] + ux * (lo + hi) / 2, A[1] + uy * (lo + hi) / 2],
                                         [A[0] + ux * lo, A[1] + uy * lo], [A[0] + ux * hi, A[1] + uy * hi]] });
        }
      }
    }
    return res.sort(function (x, y) { return y.len - x.len; });
  }

  // Find two hats, one under a and one under b, that share an edge, by
  // descending both hierarchies together, nearest parts first. a and b are
  // {node, F, T}. Returns the two-part offset for b, or null.
  function findShared(a, b, budget) {
    function circle(x) { return { c: fpt(x.F, x.node.c), r: x.node.r * C.scaleOf(x.F) }; }
    function kids(x) {
      return x.node.children.map(function (ch, i) {
        return { node: ch, F: mul(x.F, x.node.transforms[i]), T: C.tpCompose(x.T, x.node.TP[i]) };
      });
    }
    function go(x, y) {
      if (budget.left-- <= 0) return null;
      if (x.node.leaf && y.node.leaf) return solveFromHats([{ F: x.F, T: x.T }], [{ F: y.F, T: y.T }]);
      var cx = circle(x), cy = circle(y);
      var splitX = !x.node.leaf && (y.node.leaf || cx.r >= cy.r);
      var list = kids(splitX ? x : y), other = splitX ? cy : cx;
      list = list.map(function (k) { var c = circle(k); return { k: k, d: Math.hypot(c.c[0] - other.c[0], c.c[1] - other.c[1]) - c.r }; })
                 .filter(function (e) { return e.d <= other.r + 1e-6; })
                 .sort(function (p, q) { return p.d - q.d; });
      for (var i = 0; i < list.length; i++) {
        var t = splitX ? go(list[i].k, y) : go(x, list[i].k);
        if (t) return t;
      }
      return null;
    }
    return go(a, b);
  }

  // Place each child of a node in two-part coordinates, starting from child
  // 0 and spreading out through shared hat edges. Metatile outlines only
  // approximate their hats, so the search looks first where two outlines
  // share an edge, then at points along the unplaced child's outline, with
  // a widening radius.
  function liftChildren(node) {
    var ch = node.children, F = node.transforms;
    node.TP = [];
    node.TP[0] = C.tpLinear(F[0]);
    var placed = [0], guard = 0;
    function tryPoints(i, j, pre, pts, radii) {
      for (var s = 0; s < pts.length; s++) {
        for (var r = 0; r < radii.length; r++) {
          var Hj = hatsNear(ch[j], F[j], pre, pts[s], radii[r], []);
          if (!Hj.length) continue;
          var t = solveFromHats(hatsNear(ch[i], F[i], node.TP[i], pts[s], radii[r], []), Hj);
          if (t) return t;
        }
      }
      return null;
    }
    while (placed.length < ch.length && guard++ < 50) {
      var progress = false;
      for (var j = 0; j < ch.length; j++) {
        if (node.TP[j]) continue;
        var pre = C.tpLinear(F[j]), t = null;
        if (ch[j].leaf) {
          for (var a = 0; a < placed.length && !t; a++) {
            t = solveFromHats([{ F: F[placed[a]], T: node.TP[placed[a]] }], [{ F: F[j], T: pre }]);
          }
        } else {
          var Pj = ch[j].shape.map(function (p) { return fpt(F[j], p); });
          for (var b = 0; b < placed.length && !t; b++) {
            var i = placed[b];
            var Pi = ch[i].shape.map(function (p) { return fpt(F[i], p); });
            var ovs = outlineOverlaps(Pi, Pj);
            for (var o = 0; o < ovs.length && !t; o++) t = tryPoints(i, j, pre, ovs[o].pts, [2.5, 5, 7.5]);
          }
          for (var d = 0; d < placed.length && !t; d++) {
            t = findShared({ node: ch[placed[d]], F: F[placed[d]], T: node.TP[placed[d]] },
                           { node: ch[j], F: F[j], T: pre }, { left: 20000 });
          }
          if (!t) {
            var samples = [];
            Pj.forEach(function (p, k) {
              var q = Pj[(k + 1) % Pj.length];
              [0, 0.25, 0.5, 0.75].forEach(function (f) { samples.push([p[0] + f * (q[0] - p[0]), p[1] + f * (q[1] - p[1])]); });
            });
            for (var c = 0; c < placed.length && !t; c++) t = tryPoints(placed[c], j, pre, samples, [4, 8, 16, 32]);
          }
        }
        if (t) { node.TP[j] = { k: pre.k, f: pre.f, p: t.p, r: t.r }; placed.push(j); progress = true; }
      }
      if (!progress) break;
    }
    if (placed.length < ch.length) {
      throw new Error('could not place every child in two-part coordinates at level ' + node.level +
                      ': placed ' + placed.join(',') + ' of ' + ch.length);
    }
  }

  /* --------------------------------------------------------------- build */

  function toNode(meta, level, cache, leaf) {
    if (meta === HAT) return leaf;
    var node = C.makeMeta(meta.children.map(function (c) { return cache.get(c.geom) || leaf; }),
                          meta.children.map(function (c) { return c.T; }), level, level <= C.LEVEL_CAP);
    node.shape = meta.shape.map(function (p) { return [p.x, p.y]; });
    liftChildren(node);
    cache.set(meta, node);
    return node;
  }

  function evalRef(x) {
    // a*p + b*zeta*r at the hat's own shape, a = 1 and b = sqrt 3.
    var P = zw.val(x.p), R = zw.val(x.r);
    return [P[0] + r3 * (hr3 * R[0] - 0.5 * R[1]), P[1] + r3 * (0.5 * R[0] + hr3 * R[1])];
  }

  function build() {
    var leaf = C.makeLeaf(HAT14);
    var cache = new Map();
    var tiles = [initH(), initT(), initP(), initF()];
    // Each metatile node also records its role, H, T, P or F, for the
    // probe maps (substitution roles, supertile ancestry).
    tiles.forEach(function (m, i) { toNode(m, 1, cache, leaf).role = 'HTPF'[i]; });
    for (var lv = 1; lv <= TOP_LEVEL; lv++) {
      tiles = constructMetatiles(constructPatch(tiles[0], tiles[1], tiles[2], tiles[3]));
      tiles.forEach(function (m, i) { toNode(m, lv + 1, cache, leaf).role = 'HTPF'[i]; });
    }
    var root = cache.get(tiles[0]);

    // Descend to the hat nearest the root's centre.
    var node = root, F = IDENT, T = C.TP_IDENT;
    while (!node.leaf) {
      var best = -1, bestD = Infinity;
      for (var i = 0; i < node.children.length; i++) {
        var q = fpt(mul(F, node.transforms[i]), node.children[i].c);
        var d = Math.hypot(q[0] - root.c[0], q[1] - root.c[1]);
        if (d < bestD) { bestD = d; best = i; }
      }
      F = mul(F, node.transforms[best]); T = C.tpCompose(T, node.TP[best]); node = node.children[best];
    }
    // Scale by 2 and shift so the walk's float coordinates equal the two-part
    // position at the hat's own shape. Hats then sit at unit scale.
    var ref = evalRef(C.tpApply(T, HAT_TP[0])), flt = fpt(F, HAT14[0]);
    var rootM = [2, 0, ref[0] - 2 * flt[0], 0, 2, ref[1] - 2 * flt[1]];
    var sp = [0, 0], sr = [0, 0];
    HAT_TP.forEach(function (v) {
      var x = C.tpApply(T, v), P = zw.val(x.p), R = zw.val(x.r);
      sp[0] += P[0] / 14; sp[1] += P[1] / 14; sr[0] += R[0] / 14; sr[1] += R[1] / 14;
    });

    // The large-scale slope between the two parts: p is close to kappa *
    // zeta * r for distant hats, with kappa a complex number. The page uses
    // it to guess where tiles land at other shapes.
    var ks = [0, 0], nk = 0;
    for (var a = 0; a < root.children.length; a++) for (var b = a + 1; b < root.children.length; b++) {
      var dp = zw.val(zw.sub(root.TP[b].p, root.TP[a].p)), dr0 = zw.val(zw.sub(root.TP[b].r, root.TP[a].r));
      var dr = [hr3 * dr0[0] - 0.5 * dr0[1], 0.5 * dr0[0] + hr3 * dr0[1]];
      var den = dr[0] * dr[0] + dr[1] * dr[1];
      if (den < 1) continue;
      ks[0] += (dp[0] * dr[0] + dp[1] * dr[1]) / den; ks[1] += (dp[1] * dr[0] - dp[0] * dr[1]) / den; nk++;
    }
    var kappa = [ks[0] / nk, ks[1] / nk];

    // How far single hats stray from that slope, measured over a level-5 H.
    var level5 = null;
    cache.forEach(function (n) { if (n.level === 5 && !level5 && n.children.length === 10) level5 = n; });
    var devs = [];
    (function collect(n, Tn) {
      if (n.leaf) {
        var P = zw.val(Tn.p), R0 = zw.val(Tn.r), R = [hr3 * R0[0] - 0.5 * R0[1], 0.5 * R0[0] + hr3 * R0[1]];
        devs.push([P[0] - (kappa[0] * R[0] - kappa[1] * R[1]), P[1] - (kappa[0] * R[1] + kappa[1] * R[0])]);
        return;
      }
      n.children.forEach(function (c, i) { collect(c, C.tpCompose(Tn, n.TP[i])); });
    })(level5 || root.children[0], C.TP_IDENT);
    var mx = 0, my = 0; devs.forEach(function (d) { mx += d[0] / devs.length; my += d[1] / devs.length; });
    var spread = 0; devs.forEach(function (d) { spread = Math.max(spread, Math.hypot(d[0] - mx, d[1] - my)); });

    return {
      root: root,
      rootM: rootM,
      place: function (M, Tt) { return { p: Tt.p, r: Tt.r, turn: 2 * Tt.k, flip: Tt.f }; },
      corners: function (M, Tt) {
        return HAT_TP.map(function (v) { var x = C.tpApply(Tt, v); return { P: zw.val(x.p), R: zw.val(x.r) }; });
      },
      info: {
        start: { P: sp, R: sr },
        kappa: kappa,
        spread: spread,
        outline: HAT_TP.map(function (v) { return { P: zw.val(v.p), R: zw.val(v.r) }; })
      }
    };
  }

  // With options.probes the build also carries the probe-map annotator.
  function buildWith(options) {
    var ctx = build(options);
    var HP = global.HatProbes || (typeof globalThis !== "undefined" && globalThis.HatProbes);
    if (options && options.probes && HP) HP.attach(ctx, HAT_TP);
    return ctx;
  }

  var api = { build: buildWith, HAT14: HAT14, HAT_TP: HAT_TP, TOP_LEVEL: TOP_LEVEL };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  global.HatTiling = api;
  if (typeof window === 'undefined') C.serve(buildWith);
})(typeof self !== 'undefined' ? self : this);
