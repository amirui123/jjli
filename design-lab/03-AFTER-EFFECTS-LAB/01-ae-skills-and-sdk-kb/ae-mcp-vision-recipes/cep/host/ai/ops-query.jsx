/*
 * Read ops. Nothing here changes the document.
 */

function __mcp_artboardList(doc) {
    var out = [];
    var active = doc.artboards.getActiveArtboardIndex();
    var origin = doc.artboards[0].artboardRect;
    for (var i = 0; i < doc.artboards.length; i++) {
        var r = doc.artboards[i].artboardRect;
        out.push({
            index: i, name: doc.artboards[i].name, active: i === active,
            width: __mcp_round(r[2] - r[0]), height: __mcp_round(r[1] - r[3]),
            // Where it sits relative to artboard 0's top-left, y down - what
            // ai_document setArtboard and addArtboard take.
            x: __mcp_round(r[0] - origin[0]), y: __mcp_round(origin[1] - r[1])
        });
    }
    return out;
}

/*
 * Walk a layer or group. depth counts levels of items below the layer, so
 * depth 1 lists a layer's top-level items and does not open groups.
 */
function __mcp_walkItems(doc, container, depth, budget) {
    var out = [];
    var items = container.pageItems;
    for (var i = 0; i < items.length; i++) {
        if (budget.left <= 0) { budget.truncated = true; break; }
        budget.left--;
        var it = items[i];
        var s = __mcp_summary(doc, it);
        if (it.typename === "GroupItem" && depth > 1) {
            s.items = __mcp_walkItems(doc, it, depth - 1, budget);
        }
        out.push(s);
    }
    return out;
}

function __mcp_walkLayers(doc, layers, depth, budget) {
    var out = [];
    for (var i = 0; i < layers.length; i++) {
        var l = layers[i];
        var entry = { name: l.name, path: __mcp_layerPath(l), visible: l.visible, locked: l.locked,
                      itemCount: l.pageItems.length };
        if (l.layers.length) { entry.sublayers = __mcp_walkLayers(doc, l.layers, depth, budget); }
        entry.items = __mcp_walkItems(doc, l, depth, budget);
        out.push(entry);
    }
    return out;
}

function __mcp_strokeInfo(it) {
    if (!it.stroked) { return null; }
    return {
        color: __mcp_describeColor(it.strokeColor), width: it.strokeWidth,
        cap: String(it.strokeCap).replace("StrokeCap.", ""),
        join: String(it.strokeJoin).replace("StrokeJoin.", ""),
        dashes: __mcp_safe(function () { var d = []; for (var i = 0; i < it.strokeDashes.length; i++) { d.push(it.strokeDashes[i]); } return d; }, [])
    };
}

function __mcp_textInfo(t) {
    // ONE textRange for both. Asking a frame for textRange again invalidates
    // attributes taken from the previous one - measured on 30.8.1: reading
    // paragraphAttributes made the earlier characterAttributes throw "the value
    // would result in an illegal text range", so every font, size and fill
    // came back null.
    var tr = t.textRange;
    var ca = tr.characterAttributes;
    var pa = __mcp_safe(function () { return tr.paragraphAttributes; });
    return {
        kind: String(t.kind).replace("TextType.", ""),
        contents: t.contents,
        font: __mcp_safe(function () { return ca.textFont.name; }),
        family: __mcp_safe(function () { return ca.textFont.family; }),
        style: __mcp_safe(function () { return ca.textFont.style; }),
        size: __mcp_safe(function () { return ca.size; }),
        leading: __mcp_safe(function () { return ca.autoLeading ? "auto" : ca.leading; }),
        tracking: __mcp_safe(function () { return ca.tracking; }),
        fill: __mcp_safe(function () { return __mcp_describeColor(ca.fillColor); }),
        justification: pa ? __mcp_safe(function () { return String(pa.justification).replace("Justification.", ""); }) : null,
        characters: __mcp_safe(function () { return t.characters.length; }),
        lines: __mcp_safe(function () { return t.lines.length; }),
        // Area text that does not fit: the frame holds fewer characters than
        // the story. The overflow is invisible in a capture, so say so here.
        overflows: t.kind === TextType.AREATEXT ? __mcp_safe(function () {
            var shown = 0;
            for (var i = 0; i < t.lines.length; i++) { shown += t.lines[i].characters.length; }
            return shown < t.characters.length;
        }, null) : false
    };
}

var __mcp_queryOps = {

    sessionInfo: function () {
        var docs = [];
        for (var i = 0; i < app.documents.length; i++) {
            var d = app.documents[i];
            docs.push({
                name: d.name,
                // An untitled document has an empty path; fullName then names nothing real.
                path: __mcp_safe(function () { return d.path && d.path.fsName ? d.fullName.fsName : null; }),
                active: app.activeDocument === d,
                saved: d.saved,
                colorSpace: String(d.documentColorSpace).replace("DocumentColorSpace.", ""),
                artboards: d.artboards.length,
                layers: d.layers.length,
                items: d.pageItems.length
            });
        }
        var out = { appVersion: app.version, documents: docs };
        if (app.documents.length) {
            var doc = app.activeDocument;
            out.active = { name: doc.name, artboards: __mcp_artboardList(doc), selectionCount: doc.selection.length };
        }
        return out;
    },

    /*
     * Layers and their items. depth 1 = each layer's top-level items; raise it
     * to open groups. maxItems caps the whole walk - a real document can hold
     * tens of thousands of paths, and the listing says when it stopped short.
     */
    tree: function (args) {
        var doc = __mcp_doc();
        var depth = Math.max(1, Math.min(8, Number(args.depth || 1)));
        var budget = { left: Number(args.maxItems || 300), truncated: false };
        if (__mcp_has(args.uuid)) {
            var g = __mcp_item(args.uuid);
            if (g.typename !== "GroupItem") { throw new Error(args.uuid + " is a " + g.typename + ", not a group"); }
            return { uuid: g.uuid, items: __mcp_walkItems(doc, g, depth, budget), truncated: budget.truncated };
        }
        var layers = __mcp_has(args.layer) ? [__mcp_layerByPath(doc, args.layer)] : doc.layers;
        return { document: doc.name, layers: __mcp_walkLayers(doc, layers, depth, budget), truncated: budget.truncated };
    },

    find: function (args) {
        var doc = __mcp_doc();
        var needle = args.name ? String(args.name).toLowerCase() : null;
        var text = args.text ? String(args.text).toLowerCase() : null;
        var limit = Number(args.limit || 100);
        var out = [];
        var all = doc.pageItems;
        for (var i = 0; i < all.length && out.length < limit; i++) {
            var it = all[i];
            if (args.topLevel === true && it.parent.typename !== "Layer") { continue; }
            if (args.type && it.typename !== args.type) { continue; }
            if (needle && String(it.name || "").toLowerCase().indexOf(needle) === -1) { continue; }
            if (text && (it.typename !== "TextFrame" || String(it.contents).toLowerCase().indexOf(text) === -1)) { continue; }
            if (__mcp_has(args.artboard)) {
                var gb = __mcp_safe(function () { return it.geometricBounds; });
                if (!gb || __mcp_artboardOf(doc, gb) !== Number(args.artboard)) { continue; }
            }
            out.push(__mcp_summary(doc, it));
        }
        return { count: out.length, limited: out.length >= limit, items: out };
    },

    /* Everything about one item. */
    item: function (args) {
        var doc = __mcp_doc();
        var it = __mcp_item(args.uuid);
        var gb = it.geometricBounds, vb = it.visibleBounds;
        var ab = __mcp_has(args.artboard) ? Number(args.artboard) : __mcp_artboardOf(doc, gb);
        var abArg = ab === null ? undefined : ab;
        var out = {
            uuid: it.uuid, type: it.typename, name: it.name || null,
            artboard: ab,
            // geometric = the path itself; visible = including stroke width.
            box: __mcp_boxFromBounds(doc, abArg, gb),
            visibleBox: __mcp_boxFromBounds(doc, abArg, vb),
            layer: __mcp_layerPath(it.layer),
            parentUuid: it.parent.typename === "Layer" ? null : __mcp_safe(function () { return it.parent.uuid; }),
            zIndex: __mcp_safe(function () { return it.zOrderPosition; }),
            hidden: it.hidden, locked: it.locked,
            opacity: __mcp_safe(function () { return it.opacity; }),
            blendMode: __mcp_safe(function () { return String(it.blendingMode).replace("BlendModes.", ""); })
        };
        if (it.typename === "PathItem") {
            out.path = {
                closed: it.closed, points: it.pathPoints.length, area: __mcp_round(Math.abs(it.area)),
                fill: it.filled ? __mcp_describeColor(it.fillColor) : "none",
                stroke: __mcp_strokeInfo(it), clipping: it.clipping, guides: it.guides
            };
            if (args.points) {
                var pts = [], r = __mcp_abRect(doc, abArg);
                for (var p = 0; p < it.pathPoints.length; p++) {
                    var pp = it.pathPoints[p];
                    var f = function (a) { return [__mcp_round(a[0] - r[0]), __mcp_round(r[1] - a[1])]; };
                    pts.push({ anchor: f(pp.anchor), left: f(pp.leftDirection), right: f(pp.rightDirection) });
                }
                out.path.pointList = pts;
            }
        } else if (it.typename === "CompoundPathItem") {
            var first = it.pathItems.length ? it.pathItems[0] : null;
            out.compound = { paths: it.pathItems.length,
                             fill: first && first.filled ? __mcp_describeColor(first.fillColor) : "none",
                             stroke: first ? __mcp_strokeInfo(first) : null };
        } else if (it.typename === "TextFrame") {
            out.text = __mcp_textInfo(it);
        } else if (it.typename === "GroupItem") {
            out.group = { children: it.pageItems.length, clipped: it.clipped };
        } else if (it.typename === "PlacedItem" || it.typename === "RasterItem") {
            out.image = {
                file: __mcp_safe(function () { return it.file.fsName; }),
                embedded: it.typename === "RasterItem" ? __mcp_safe(function () { return it.embedded; }) : false
            };
        } else if (it.typename === "SymbolItem") {
            out.symbol = __mcp_safe(function () { return it.symbol.name; });
        }
        return out;
    },

    selection: function () {
        var doc = __mcp_doc();
        var sel = doc.selection, out = [];
        // A text cursor inside a frame makes selection a TextRange, not an array.
        if (!(sel instanceof Array)) {
            return { count: 0, textSelection: true, note: "The user is editing text; there is no item selection." };
        }
        for (var i = 0; i < sel.length; i++) { out.push(__mcp_summary(doc, sel[i])); }
        return { count: out.length, items: out };
    },

    /*
     * Installed fonts matching a substring. app.textFonts is thousands of
     * entries and touching all of them is slow - measured: an AppleEvent timed
     * out at 120s on this machine's font list - so a filter is required and
     * the scan stops at limit.
     */
    fonts: function (args) {
        if (!args.name) { throw new Error("fonts needs name: a substring of the family or PostScript name"); }
        var needle = String(args.name).toLowerCase();
        var limit = Number(args.limit || 40), out = [];
        var fonts = app.textFonts;
        for (var i = 0; i < fonts.length && out.length < limit; i++) {
            var f = fonts[i];
            if (f.name.toLowerCase().indexOf(needle) === -1 && f.family.toLowerCase().indexOf(needle) === -1) { continue; }
            out.push({ name: f.name, family: f.family, style: f.style });
        }
        return { count: out.length, limited: out.length >= limit, fonts: out };
    },

    swatches: function () {
        var doc = __mcp_doc(), out = [];
        for (var i = 0; i < doc.swatches.length; i++) {
            var s = doc.swatches[i];
            out.push({ name: s.name, color: __mcp_describeColor(s.color) });
        }
        return { count: out.length, swatches: out };
    }
};
