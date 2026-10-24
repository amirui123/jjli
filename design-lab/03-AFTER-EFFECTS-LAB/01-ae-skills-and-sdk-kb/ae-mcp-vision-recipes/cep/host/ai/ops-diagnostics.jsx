/*
 * What is wrong with this document. Illustrator has no problems API, so this
 * assembles the checks that otherwise only show up as a bad print or a broken
 * handoff: missing links, overflowing text, artwork off every artboard, and
 * empty paths left behind by deleted content.
 */

var __mcp_diagnosticOps = {

    problems: function (args) {
        var doc = __mcp_doc();
        var limit = Number(args.limit || 50);
        var out = { missingLinks: [], overflowingText: [], offArtboard: [], emptyPaths: [], emptyText: [] };
        var push = function (key, v) { if (out[key].length < limit) { out[key].push(v); } };

        for (var i = 0; i < doc.placedItems.length; i++) {
            var pi = doc.placedItems[i];
            var path = null, ok = false;
            try { path = pi.file.fsName; ok = pi.file.exists; } catch (e) { ok = false; }
            if (!ok) { push("missingLinks", { uuid: pi.uuid, name: pi.name || null, file: path }); }
        }

        for (var t = 0; t < doc.textFrames.length; t++) {
            var tf = doc.textFrames[t];
            if (!String(tf.contents).replace(/\s/g, "").length) { push("emptyText", { uuid: tf.uuid }); continue; }
            if (tf.kind === TextType.AREATEXT) {
                var shown = 0;
                try { for (var ln = 0; ln < tf.lines.length; ln++) { shown += tf.lines[ln].characters.length; } } catch (e) {}
                if (shown < tf.characters.length) {
                    push("overflowingText", { uuid: tf.uuid, shown: shown, total: tf.characters.length,
                                              text: String(tf.contents).substr(0, 60) });
                }
            }
        }

        var all = doc.pageItems;
        for (var p = 0; p < all.length; p++) {
            var it = all[p];
            // Only top-level items: a group's children are covered by the group.
            if (it.parent.typename !== "Layer") { continue; }
            var gb = null;
            try { gb = it.geometricBounds; } catch (e) {}
            if (gb && __mcp_artboardOf(doc, gb) === null) {
                push("offArtboard", { uuid: it.uuid, type: it.typename, name: it.name || null });
            }
        }

        for (var q = 0; q < doc.pathItems.length; q++) {
            var pth = doc.pathItems[q];
            if (pth.pathPoints.length < 2 && !pth.guides) { push("emptyPaths", { uuid: pth.uuid, points: pth.pathPoints.length }); }
        }

        var total = 0;
        for (var key in out) { if (out.hasOwnProperty(key)) { total += out[key].length; } }
        out.total = total;
        out.fontsNote = "Missing fonts are not checked yet. Check Type > Find Font in the app.";
        return out;
    }
};
