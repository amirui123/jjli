/*
 * Vision ops.
 *
 * Document.imageCapture renders any rectangle of the document to a PNG at a
 * chosen resolution - including the pasteboard, which exportFile cannot. It
 * is also far faster: measured on 30.8.1, 129ms for an 800x600 artboard
 * against 1084ms for exportFile PNG24. Resolution is the cost lever: 72 ppi is
 * one pixel per point, so the resolution is picked to land the long edge on
 * the size asked for - never below 72, the floor imageCapture accepts.
 */

function __mcp_captureRect(doc, bounds, fileName, longEdge) {
    var file = __mcp_safeCaptureFile(fileName);
    var w = bounds[2] - bounds[0], h = bounds[1] - bounds[3];
    if (w <= 0 || h <= 0) { throw new Error("Nothing to capture: the region is " + w + " x " + h + "pt"); }
    var ppi = 72 * Number(longEdge) / Math.max(w, h);
    // imageCapture refuses anything below 72 ppi - measured: "Specified value
    // less than minimum allowed value" at 71. A large artboard is rendered at
    // 72 and the Node side scales it down to longEdge.
    ppi = Math.max(72, Math.min(2400, ppi));

    var o = new ImageCaptureOptions();
    o.resolution = ppi;
    o.antiAliasing = true;
    o.transparency = true;

    var t0 = new Date().getTime();
    doc.imageCapture(file, bounds, o);
    if (!file.exists) { throw new Error("imageCapture produced no file"); }
    return {
        path: file.fsName, fileName: fileName,
        width: Math.round(w * ppi / 72), height: Math.round(h * ppi / 72),
        resolution: __mcp_round(ppi), ms: new Date().getTime() - t0
    };
}

function __mcp_padBounds(b, pad) {
    return [b[0] - pad, b[1] + pad, b[2] + pad, b[3] - pad];
}

/* True when a is b or sits anywhere inside b. */
function __mcp_isWithin(a, b) {
    var node = a;
    while (node && node.typename !== "Layer" && node.typename !== "Document") {
        if (node === b) { return true; }
        node = node.parent;
    }
    return false;
}

var __mcp_captureOps = {

    captureArtboard: function (args) {
        var doc = __mcp_doc();
        var ab = __mcp_artboardIndex(doc, args.artboard);
        var r = doc.artboards[ab].artboardRect;
        var out = __mcp_captureRect(doc, r, args.fileName, args.longEdge || 768);
        out.artboard = ab; out.artboardName = doc.artboards[ab].name;
        return out;
    },

    /* A rectangle in artboard space - for looking at one corner closely. */
    captureRegion: function (args) {
        var doc = __mcp_doc();
        var ab = __mcp_artboardIndex(doc, args.artboard);
        if (!__mcp_has(args.width) || !__mcp_has(args.height)) { throw new Error("region needs x, y, width, height"); }
        var b = __mcp_boundsFromBox(doc, ab, { x: args.x || 0, y: args.y || 0, width: args.width, height: args.height });
        var out = __mcp_captureRect(doc, b, args.fileName, args.longEdge || 768);
        out.artboard = ab;
        return out;
    },

    /*
     * One item, cropped to its visible bounds plus padding. isolated (default
     * true) hides everything else for the capture, which separates "drawn but
     * covered by something" from "not drawn at all".
     *
     * Locked artwork - usually the background - cannot be hidden while locked,
     * so it is unlocked, hidden and relocked, and items on locked layers are
     * reached by unlocking the layer for the capture. A hidden target, a hidden
     * group around it, or a hidden layer would make the capture come back empty,
     * so those are shown for the capture. Everything is put back exactly as it
     * was, and anything that still could not be hidden is reported rather than
     * claimed as isolated.
     */
    captureItem: function (args) {
        var doc = __mcp_doc();
        var it = __mcp_item(args.uuid);
        var pad = __mcp_has(args.padding) ? Number(args.padding) : 8;
        var isolated = args.isolated !== false;
        var hidden = [], relock = [], layersUnlocked = [], layersShown = [], shown = [], couldNotHide = [];

        var allLayers = function (scope, out) {
            for (var i = 0; i < scope.length; i++) { out.push(scope[i]); allLayers(scope[i].layers, out); }
            return out;
        };

        try {
            // The target and its ancestors must be visible, or nothing renders.
            var node = it;
            while (node && node.typename !== "Document") {
                if (node.typename === "Layer") {
                    if (!node.visible) { node.visible = true; layersShown.push(node); }
                } else if (node.hidden) {
                    node.hidden = false; shown.push(node);
                }
                node = node.parent;
            }

            if (isolated) {
                var layers = allLayers(doc.layers, []);
                for (var l = 0; l < layers.length; l++) {
                    if (layers[l].locked) { layers[l].locked = false; layersUnlocked.push(layers[l]); }
                }
                var all = doc.pageItems;
                for (var i = 0; i < all.length; i++) {
                    var p = all[i];
                    // Keep the target, its ancestors and its descendants.
                    if (__mcp_isWithin(it, p) || __mcp_isWithin(p, it)) { continue; }
                    if (p.hidden) { continue; }
                    try {
                        if (p.locked) { p.locked = false; relock.push(p); }
                        p.hidden = true; hidden.push(p);
                    } catch (e) {
                        couldNotHide.push({ uuid: __mcp_safe(function () { return p.uuid; }), type: p.typename, reason: String(e.message || e) });
                    }
                }
            }
            var bounds = __mcp_padBounds(it.visibleBounds, pad);
            var out = __mcp_captureRect(doc, bounds, args.fileName, args.longEdge || 512);
            out.uuid = it.uuid; out.type = it.typename;
            out.isolated = isolated && couldNotHide.length === 0;
            out.hiddenForCapture = hidden.length;
            if (couldNotHide.length) { out.couldNotHide = couldNotHide; }
            if (shown.length || layersShown.length) { out.shownForCapture = shown.length + layersShown.length; }
            return out;
        } finally {
            // Undo in reverse: unhide, relock items, relock layers, re-hide.
            for (var j = 0; j < hidden.length; j++) { try { hidden[j].hidden = false; } catch (e) {} }
            for (var r = 0; r < relock.length; r++) { try { relock[r].locked = true; } catch (e) {} }
            for (var u = 0; u < layersUnlocked.length; u++) { try { layersUnlocked[u].locked = true; } catch (e) {} }
            for (var h = 0; h < shown.length; h++) { try { shown[h].hidden = true; } catch (e) {} }
            for (var k = 0; k < layersShown.length; k++) { try { layersShown[k].visible = false; } catch (e) {} }
        }
    }
};
