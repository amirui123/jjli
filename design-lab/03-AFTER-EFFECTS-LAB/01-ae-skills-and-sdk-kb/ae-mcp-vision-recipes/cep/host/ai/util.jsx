/*
 * Addressing, coordinates and colour.
 *
 * ADDRESSING. Illustrator gives page items one stable handle: PageItem.uuid,
 * resolved with Document.getPageItemFromUuid(). It survives reordering,
 * regrouping and renaming, which an index or a name does not. Uuids are small
 * per-document integers (measured: "473", "474"), so they are only meaningful
 * together with a document - every op works on the ACTIVE document, and
 * ai_document activate switches it.
 *
 * Layers have no uuid. They are addressed by a name path from the top,
 * ["Layer 1"] or ["Layer 1", "Sublayer"], and an ambiguous name is an error
 * rather than a guess.
 *
 * COORDINATES. Scripting's document space has y growing UP, and where its
 * origin lands depends on the ruler settings - on a new 800x600 document the
 * first artboard measured [0, 600, 800, 0]. Every tool here instead speaks
 * ARTBOARD space: points from an artboard's top-left corner, y growing DOWN,
 * which is what the rulers and the Transform panel show. host.jsx pins
 * app.coordinateSystem to DOCUMENTCOORDINATESYSTEM for the duration of every
 * op so the conversion below is always from the same frame.
 */

function __mcp_captureDir() {
    var dir = new Folder(Folder.temp.fsName + "/illustrator-mcp-vision");
    if (!dir.exists) { dir.create(); }
    return dir;
}

/*
 * Capture output is confined to one app-owned directory and callers pass a bare
 * filename, never a path, so the capture op cannot be turned into an arbitrary
 * file write.
 */
function __mcp_safeCaptureFile(fileName) {
    if (!fileName) { throw new Error("capture requires fileName"); }
    fileName = String(fileName);
    if (!/^[A-Za-z0-9._-]+\.png$/.test(fileName) || fileName.indexOf("..") !== -1) {
        throw new Error("fileName must be a bare name matching [A-Za-z0-9._-]+.png");
    }
    return new File(__mcp_captureDir().fsName + "/" + fileName);
}

// e.line is not always present and touching it can itself throw.
function __mcp_line(e) {
    try { return (e && e.line !== undefined) ? e.line : null; } catch (x) { return null; }
}

function __mcp_has(v) { return v !== undefined && v !== null; }

function __mcp_doc() {
    if (!app.documents.length) { throw new Error("No document is open - use ai_document new or open"); }
    return app.activeDocument;
}

function __mcp_item(uuid) {
    if (!__mcp_has(uuid)) { throw new Error("uuid is required"); }
    var it = null;
    try { it = __mcp_doc().getPageItemFromUuid(String(uuid)); } catch (e) { it = null; }
    if (!it) { throw new Error("No item with uuid " + uuid + " in the active document"); }
    return it;
}

function __mcp_items(uuids) {
    if (!(uuids instanceof Array) || !uuids.length) { throw new Error("uuids must be a non-empty array"); }
    var out = [];
    for (var i = 0; i < uuids.length; i++) { out.push(__mcp_item(uuids[i])); }
    return out;
}

/* ---------- artboards and coordinates ---------- */

function __mcp_artboardIndex(doc, index) {
    if (__mcp_has(index)) {
        var n = Number(index);
        if (n < 0 || n >= doc.artboards.length || n !== Math.floor(n)) {
            throw new Error("artboard " + index + " does not exist (0-" + (doc.artboards.length - 1) + ")");
        }
        return n;
    }
    return doc.artboards.getActiveArtboardIndex();
}

/* Document-space [left, top, right, bottom] of an artboard. top > bottom. */
function __mcp_abRect(doc, index) {
    return doc.artboards[__mcp_artboardIndex(doc, index)].artboardRect;
}

/* Artboard point (y down) -> document point (y up). */
function __mcp_toDoc(doc, abIndex, x, y) {
    var r = __mcp_abRect(doc, abIndex);
    return [r[0] + Number(x), r[1] - Number(y)];
}

/* Document bounds [l, t, r, b] -> artboard box {x, y, width, height}. */
function __mcp_boxFromBounds(doc, abIndex, b) {
    var r = __mcp_abRect(doc, abIndex);
    return { x: __mcp_round(b[0] - r[0]), y: __mcp_round(r[1] - b[1]),
             width: __mcp_round(b[2] - b[0]), height: __mcp_round(b[1] - b[3]) };
}

/* Artboard box -> document bounds [l, t, r, b]. */
function __mcp_boundsFromBox(doc, abIndex, box) {
    var tl = __mcp_toDoc(doc, abIndex, box.x, box.y);
    return [tl[0], tl[1], tl[0] + Number(box.width), tl[1] - Number(box.height)];
}

function __mcp_round(n) { return Math.round(Number(n) * 1000) / 1000; }

/*
 * Which artboard an item belongs to: the one containing its centre, else the
 * one it overlaps most, else null (it sits on the pasteboard).
 */
function __mcp_artboardOf(doc, bounds) {
    var cx = (bounds[0] + bounds[2]) / 2, cy = (bounds[1] + bounds[3]) / 2;
    var best = null, bestArea = 0;
    for (var i = 0; i < doc.artboards.length; i++) {
        var r = doc.artboards[i].artboardRect;
        if (cx >= r[0] && cx <= r[2] && cy <= r[1] && cy >= r[3]) { return i; }
        var w = Math.min(r[2], bounds[2]) - Math.max(r[0], bounds[0]);
        var h = Math.min(r[1], bounds[1]) - Math.max(r[3], bounds[3]);
        if (w > 0 && h > 0 && w * h > bestArea) { bestArea = w * h; best = i; }
    }
    return best;
}

/* ---------- layers ---------- */

function __mcp_layerPath(layer) {
    var parts = [];
    var node = layer;
    while (node && node.typename === "Layer") { parts.unshift(node.name); node = node.parent; }
    return parts;
}

function __mcp_layerByPath(doc, path) {
    if (typeof path === "string") { path = [path]; }
    if (!(path instanceof Array) || !path.length) { throw new Error("layer must be a name path, e.g. [\"Layer 1\"]"); }
    var scope = doc.layers, found = null;
    for (var i = 0; i < path.length; i++) {
        found = null;
        var hits = 0;
        for (var j = 0; j < scope.length; j++) {
            if (scope[j].name === String(path[i])) { found = found || scope[j]; hits++; }
        }
        if (!found) { throw new Error("No layer named '" + path[i] + "' at depth " + i); }
        if (hits > 1) { throw new Error(hits + " layers are named '" + path[i] + "' at depth " + i + " - rename one first"); }
        scope = found.layers;
    }
    return found;
}

/* ---------- colour ---------- */

function __mcp_hex2(n) {
    var s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return s.length < 2 ? "0" + s : s;
}

/*
 * Accepted colour forms:
 *   "#RRGGBB" or "#RGB"        RGB
 *   [r, g, b]                  RGB, 0-255 - Illustrator's own scale, NOT 0-1
 *   {cmyk: [c, m, y, k]}       percentages 0-100
 *   {gray: n}                  percentage 0-100
 *   {swatch: "Name"}           a document swatch, including spot colours
 *   "none" or null             no paint
 */
function __mcp_color(doc, v) {
    if (v === null || v === "none" || v === false) { return new NoColor(); }
    var c;
    if (typeof v === "string") {
        var m = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(v);
        if (!m) { throw new Error("Colour string must be #RRGGBB, #RGB or \"none\", got " + v); }
        var h = m[1];
        if (h.length === 3) { h = h.charAt(0) + h.charAt(0) + h.charAt(1) + h.charAt(1) + h.charAt(2) + h.charAt(2); }
        c = new RGBColor();
        c.red = parseInt(h.substr(0, 2), 16); c.green = parseInt(h.substr(2, 2), 16); c.blue = parseInt(h.substr(4, 2), 16);
        return c;
    }
    if (v instanceof Array) {
        if (v.length < 3) { throw new Error("RGB array needs three channels, 0-255"); }
        c = new RGBColor(); c.red = Number(v[0]); c.green = Number(v[1]); c.blue = Number(v[2]);
        return c;
    }
    if (v.cmyk) {
        c = new CMYKColor(); c.cyan = Number(v.cmyk[0]); c.magenta = Number(v.cmyk[1]);
        c.yellow = Number(v.cmyk[2]); c.black = Number(v.cmyk[3]);
        return c;
    }
    if (__mcp_has(v.gray)) { c = new GrayColor(); c.gray = Number(v.gray); return c; }
    if (v.swatch) {
        var sw;
        try { sw = doc.swatches.getByName(String(v.swatch)); } catch (e) { sw = null; }
        if (!sw) { throw new Error("No swatch named '" + v.swatch + "'"); }
        return sw.color;
    }
    throw new Error("Unrecognised colour: " + JSON.stringify(v));
}

function __mcp_describeColor(c) {
    try {
        switch (c.typename) {
            case "NoColor": return "none";
            case "RGBColor": return "#" + __mcp_hex2(c.red) + __mcp_hex2(c.green) + __mcp_hex2(c.blue);
            case "CMYKColor": return { cmyk: [__mcp_round(c.cyan), __mcp_round(c.magenta), __mcp_round(c.yellow), __mcp_round(c.black)] };
            case "GrayColor": return { gray: __mcp_round(c.gray) };
            case "SpotColor": return { spot: c.spot.name, tint: c.tint };
            case "GradientColor": return { gradient: c.gradient.name, type: String(c.gradient.type) };
            case "PatternColor": return { pattern: c.pattern.name };
            default: return { _type: c.typename };
        }
    } catch (e) { return { _unreadable: String(e) }; }
}

/* ---------- item summaries ---------- */

function __mcp_safe(fn, fallback) {
    try { return fn(); } catch (e) { return fallback === undefined ? null : fallback; }
}

/*
 * The compact form every listing returns. Deliberately small - a tree of a
 * real document can hold thousands of items - with the full picture left to
 * ai_query item.
 */
function __mcp_summary(doc, it) {
    var gb = __mcp_safe(function () { return it.geometricBounds; });
    var ab = gb ? __mcp_artboardOf(doc, gb) : null;
    var s = { uuid: it.uuid, type: it.typename, name: it.name || null };
    // Only set for items inside a group: a flat listing (find walks every
    // item, nested ones included) is otherwise impossible to read as a tree.
    if (it.parent && it.parent.typename !== "Layer") {
        s.parentUuid = __mcp_safe(function () { return it.parent.uuid; });
    }
    if (gb) {
        s.artboard = ab;
        s.box = __mcp_boxFromBounds(doc, ab === null ? undefined : ab, gb);
    }
    if (it.hidden) { s.hidden = true; }
    if (it.locked) { s.locked = true; }
    if (it.typename === "TextFrame") {
        var txt = __mcp_safe(function () { return it.contents; }, "");
        s.text = txt.length > 80 ? txt.substr(0, 80) + "..." : txt;
    }
    if (it.typename === "GroupItem") {
        s.children = it.pageItems.length;
        if (it.clipped) { s.clipped = true; }
    }
    return s;
}

var __MCP_BLEND = {
    normal: "NORMAL", multiply: "MULTIPLY", screen: "SCREEN", overlay: "OVERLAY",
    softLight: "SOFTLIGHT", hardLight: "HARDLIGHT", colorDodge: "COLORDODGE",
    colorBurn: "COLORBURN", darken: "DARKEN", lighten: "LIGHTEN", difference: "DIFFERENCE",
    exclusion: "EXCLUSION", hue: "HUE", saturation: "SATURATIONBLEND", color: "COLORBLEND",
    luminosity: "LUMINOSITY"
};

function __mcp_blendMode(name) {
    var k = __MCP_BLEND[name];
    if (!k) { throw new Error("Unknown blend mode " + name + ". Known: " + __mcp_keys(__MCP_BLEND).join(", ")); }
    return BlendModes[k];
}

function __mcp_keys(o) {
    var out = [];
    for (var k in o) { if (o.hasOwnProperty(k)) { out.push(k); } }
    return out;
}
