/**
 * After Effects Motion DNA Inspector (`assets/inspect_aep_dna.jsx`)
 *
 * Inspects an After Effects project (.aep) or the currently active Composition
 * and extracts full Motion DNA:
 * - Comp resolution, frameRate, duration, bgColor hex, motionBlur
 * - Layer hierarchy (Text, Shape, Footage/Precomp, Camera, Null, 3D flags, blend modes)
 * - Typography (PostScript font, size, tracking, fill hex)
 * - Keyframe & Easing DNA (Bezier influence %, keyframe durations, stagger timing, expressions)
 * - Applied Effects (matchNames and display names)
 */

function _rgbFloatToHex(rgbArr) {
    if (!rgbArr || rgbArr.length < 3) return "#FFFFFF";
    function toH(v) {
        var n = Math.round(Math.max(0, Math.min(255, Number(v) * 255)));
        var s = n.toString(16);
        return s.length === 1 ? "0" + s : s;
    }
    return "#" + toH(rgbArr[0]) + toH(rgbArr[1]) + toH(rgbArr[2]);
}

function _esc(s) {
    if (s === null || s === undefined) return "";
    return String(s)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");
}

function _toJson(val) {
    if (val === null || val === undefined) return "null";
    if (typeof val === "number") return isFinite(val) ? String(val) : "null";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "string") return '"' + _esc(val) + '"';
    if (val instanceof Array) {
        var a = [];
        for (var i = 0; i < val.length; i++) a.push(_toJson(val[i]));
        return "[" + a.join(",") + "]";
    }
    if (typeof val === "object") {
        var o = [];
        for (var k in val) {
            if (val.hasOwnProperty(k)) o.push('"' + _esc(k) + '":' + _toJson(val[k]));
        }
        return "{" + o.join(",") + "}";
    }
    return "null";
}

function _inspectPropertyKeyframes(prop, propName) {
    if (!prop) return null;
    var hasKeys = prop.numKeys > 0;
    var hasExpr = false;
    try { hasExpr = Boolean(prop.expressionEnabled && prop.expression && prop.expression.length > 0); } catch (e) {}
    if (!hasKeys && !hasExpr) return null;

    var info = {
        property: propName,
        numKeys: prop.numKeys,
        expression: hasExpr ? String(prop.expression).substring(0, 200) : null,
        keyframes: []
    };

    var maxK = Math.min(prop.numKeys, 6);
    for (var k = 1; k <= maxK; k++) {
        var kf = {
            timeSec: Number(prop.keyTime(k).toFixed(3))
        };
        try {
            var inEase = prop.keyInTemporalEase(k);
            var outEase = prop.keyOutTemporalEase(k);
            if (inEase && inEase.length > 0) {
                kf.inInfluencePct = Math.round(inEase[0].influence);
            }
            if (outEase && outEase.length > 0) {
                kf.outInfluencePct = Math.round(outEase[0].influence);
            }
        } catch (e2) {}
        info.keyframes.push(kf);
    }
    return info;
}

function inspectAeProjectOrComp(aepPath) {
    try {
        if (aepPath && aepPath.length > 0) {
            var f = new File(aepPath);
            if (!f.exists) {
                return _toJson({ status: "error", message: "AEP file not found: " + aepPath });
            }
            app.open(f);
        }

        if (!app.project) {
            return _toJson({ status: "error", message: "No project open in After Effects." });
        }

        var comps = [];
        var activeComp = app.project.activeItem;
        if (activeComp && (activeComp instanceof CompItem)) {
            comps.push(activeComp);
        }
        for (var i = 1; i <= app.project.numItems; i++) {
            var it = app.project.item(i);
            if ((it instanceof CompItem) && it !== activeComp && comps.length < 5) {
                comps.push(it);
            }
        }

        if (comps.length === 0) {
            return _toJson({ status: "error", message: "No Composition found in After Effects project." });
        }

        var compReports = [];
        var allFonts = {};
        var allColors = {};
        var allInfluences = [];

        for (var cIdx = 0; cIdx < comps.length; cIdx++) {
            var comp = comps[cIdx];
            var bgHex = _rgbFloatToHex(comp.bgColor);
            allColors[bgHex] = (allColors[bgHex] || 0) + 1;

            var layers = [];
            for (var l = 1; l <= Math.min(comp.numLayers, 40); l++) {
                var lyr = comp.layer(l);
                var lType = "AVLayer";
                if (lyr instanceof TextLayer) lType = "TextLayer";
                else if (lyr instanceof ShapeLayer) lType = "ShapeLayer";
                else if (lyr instanceof CameraLayer) lType = "CameraLayer";
                else if (lyr instanceof LightLayer) lType = "LightLayer";
                else if (lyr.nullLayer) lType = "NullLayer";

                var lInfo = {
                    index: l,
                    name: lyr.name,
                    type: lType,
                    inPointSec: Number(lyr.inPoint.toFixed(3)),
                    outPointSec: Number(lyr.outPoint.toFixed(3)),
                    threeDLayer: Boolean(lyr.threeDLayer),
                    motionBlur: Boolean(lyr.motionBlur)
                };

                if (lyr instanceof TextLayer) {
                    try {
                        var td = lyr.property("ADBE Text Properties").property("ADBE Text Document").value;
                        var fName = String(td.font || "");
                        var fSize = Math.round(Number(td.fontSize || 48));
                        var fHex = td.applyFill ? _rgbFloatToHex(td.fillColor) : null;
                        if (fName) allFonts[fName] = (allFonts[fName] || 0) + 1;
                        if (fHex) allColors[fHex] = (allColors[fHex] || 0) + 1;
                        lInfo.textSpec = {
                            text: String(td.text || "").substring(0, 100),
                            font: fName,
                            sizePx: fSize,
                            fillHex: fHex,
                            tracking: Number(td.tracking || 0)
                        };
                    } catch (eT) {}
                }

                // Inspect Transform keyframes & easing
                var anims = [];
                try {
                    var tr = lyr.property("ADBE Transform Group");
                    var propNames = ["ADBE Position", "ADBE Scale", "ADBE Rotate Z", "ADBE Opacity"];
                    for (var p = 0; p < propNames.length; p++) {
                        var pr = tr.property(propNames[p]);
                        var kInfo = _inspectPropertyKeyframes(pr, propNames[p]);
                        if (kInfo) {
                            anims.push(kInfo);
                            for (var ki = 0; ki < kInfo.keyframes.length; ki++) {
                                if (kInfo.keyframes[ki].outInfluencePct) {
                                    allInfluences.push(kInfo.keyframes[ki].outInfluencePct);
                                }
                            }
                        }
                    }
                } catch (eTr) {}
                lInfo.animations = anims;

                // Inspect Effects
                var fxList = [];
                try {
                    var fxGrp = lyr.property("ADBE Effect Parade");
                    if (fxGrp) {
                        for (var fxi = 1; fxi <= fxGrp.numProperties; fxi++) {
                            var fx = fxGrp.property(fxi);
                            fxList.push({ name: fx.name, matchName: fx.matchName });
                        }
                    }
                } catch (eFx) {}
                lInfo.effects = fxList;

                layers.push(lInfo);
            }

            compReports.push({
                name: comp.name,
                width: comp.width,
                height: comp.height,
                frameRate: Number(comp.frameRate.toFixed(2)),
                durationSec: Number(comp.duration.toFixed(2)),
                bgColorHex: bgHex,
                motionBlur: comp.motionBlur,
                layerCount: comp.numLayers,
                layers: layers
            });
        }

        var avgInf = 75;
        if (allInfluences.length > 0) {
            var s = 0;
            for (var ii = 0; ii < allInfluences.length; ii++) s += allInfluences[ii];
            avgInf = Math.round(s / allInfluences.length);
        }

        return _toJson({
            status: "success",
            compositions: compReports,
            detectedFonts: allFonts,
            detectedColors: allColors,
            recommendedBezierInfluencePct: avgInf
        });
    } catch (err) {
        return _toJson({ status: "error", message: String(err) + " (line " + err.line + ")" });
    }
}
