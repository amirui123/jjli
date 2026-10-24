/**
 * Live Foreground After Effects Composition, Shape, Kinetic Type & Keyframe Builder
 * (`assets/ae_comp_builder.jsx`) for `after-effects-motion-dna`.
 *
 * Designed so every composition, background, glow, vector shape card, kinetic text layer,
 * bezier easing curve, expression, and marker is built LIVE in the Composition Viewer
 * on both macOS and Windows.
 */

function hexToRgbFloat(hex) {
    var clean = String(hex || "#FFFFFF").replace("#", "");
    if (clean.length === 3) {
        clean = clean.charAt(0) + clean.charAt(0) + clean.charAt(1) + clean.charAt(1) + clean.charAt(2) + clean.charAt(2);
    }
    var num = parseInt(clean, 16);
    if (isNaN(num)) return [1.0, 1.0, 1.0];
    return [
        ((num >> 16) & 255) / 255.0,
        ((num >> 8) & 255) / 255.0,
        (num & 255) / 255.0
    ];
}

function escapeJsonStr(str) {
    if (str === null || str === undefined) return "";
    return String(str)
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"')
        .replace(/\r/g, "\\r")
        .replace(/\n/g, "\\n")
        .replace(/\t/g, "\\t");
}

function toJson(val) {
    if (val === null || val === undefined) return "null";
    if (typeof val === "number") return isFinite(val) ? String(val) : "null";
    if (typeof val === "boolean") return val ? "true" : "false";
    if (typeof val === "string") return '"' + escapeJsonStr(val) + '"';
    if (val instanceof Array) {
        var arr = [];
        for (var i = 0; i < val.length; i++) arr.push(toJson(val[i]));
        return "[" + arr.join(",") + "]";
    }
    if (typeof val === "object") {
        var obj = [];
        for (var k in val) {
            if (val.hasOwnProperty(k)) obj.push('"' + escapeJsonStr(k) + '":' + toJson(val[k]));
        }
        return "{" + obj.join(",") + "}";
    }
    return "null";
}

function findOrCreateComp(spec) {
    if (!app.project) app.newProject();
    var name = spec.name || "Motion_DNA_Comp";
    var w = Number(spec.width || 1080);
    var h = Number(spec.height || 1920);
    var fps = Number(spec.fps || 60);
    var dur = Number(spec.durationSec || 6.0);

    var comp = null;
    for (var i = 1; i <= app.project.numItems; i++) {
        var it = app.project.item(i);
        if ((it instanceof CompItem) && it.name === name) {
            comp = it;
            break;
        }
    }
    if (!comp) {
        comp = app.project.items.addComp(name, w, h, 1.0, dur, fps);
    } else {
        comp.width = w;
        comp.height = h;
        comp.frameRate = fps;
        comp.duration = dur;
    }

    if (spec.bgColor) {
        comp.bgColor = hexToRgbFloat(spec.bgColor);
    }
    comp.motionBlur = spec.motionBlur !== false;

    try { comp.openInViewer(); } catch (e) {}
    return comp;
}

function centerLayerAnchorPoint(layer, atTimeSec) {
    try {
        var t = atTimeSec !== undefined ? Number(atTimeSec) : layer.inPoint;
        var rect = layer.sourceRectAtTime(t, false);
        var cx = rect.left + rect.width / 2.0;
        var cy = rect.top + rect.height / 2.0;
        var tr = layer.property("ADBE Transform Group");
        tr.property("ADBE Anchor Point").setValue([cx, cy]);
    } catch (e) {}
}

function applyBezierEaseToProperty(prop, influenceInPct, influenceOutPct) {
    if (!prop || prop.numKeys < 2) return;
    var infIn = Math.max(1, Math.min(100, Number(influenceInPct || 75)));
    var infOut = Math.max(1, Math.min(100, Number(influenceOutPct || 80)));

    var dim = 1;
    try {
        var v = prop.keyValue(1);
        if (v instanceof Array) dim = v.length;
        // Spatial 2D/3D properties use 1D temporal ease array in AE
        if (prop.propertyValueType === PropertyValueType.TwoD_SPATIAL ||
            prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
            dim = 1;
        }
    } catch (e) {}

    var easeInArr = [];
    var easeOutArr = [];
    for (var d = 0; d < dim; d++) {
        easeInArr.push(new KeyframeEase(0, infIn));
        easeOutArr.push(new KeyframeEase(0, infOut));
    }

    for (var k = 1; k <= prop.numKeys; k++) {
        try {
            prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
            prop.setTemporalEaseAtKey(k, easeInArr, easeOutArr);
        } catch (e2) {}
    }
}

function applyLayerAnimations(layer, animSpec, defaultInfluenceIn, defaultInfluenceOut) {
    if (!animSpec) return;
    var tr = layer.property("ADBE Transform Group");
    var map = {
        "position": "ADBE Position",
        "scale": "ADBE Scale",
        "opacity": "ADBE Opacity",
        "rotation": "ADBE Rotate Z"
    };

    for (var key in map) {
        if (animSpec.hasOwnProperty(key) && animSpec[key]) {
            var propSpec = animSpec[key];
            var prop = tr.property(map[key]);
            if (!prop) continue;

            var kfs = propSpec.keyframes || [];
            for (var i = 0; i < kfs.length; i++) {
                var kf = kfs[i];
                prop.setValueAtTime(Number(kf.timeSec || 0), kf.value);
            }
            if (kfs.length >= 2) {
                applyBezierEaseToProperty(
                    prop,
                    propSpec.influenceIn !== undefined ? propSpec.influenceIn : (defaultInfluenceIn || 75),
                    propSpec.influenceOut !== undefined ? propSpec.influenceOut : (defaultInfluenceOut || 82)
                );
            }
            if (propSpec.expression) {
                try { prop.expression = String(propSpec.expression); } catch (eEx) {}
            }
        }
    }
}

function addBackgroundSolid(comp, spec) {
    var col = hexToRgbFloat(spec.color || "#0B0F19");
    var solid = comp.layers.addSolid(col, spec.name || "06_Background_Solid", comp.width, comp.height, 1.0, comp.duration);
    solid.moveToEnd();

    if (spec.gradientTopColor && spec.gradientBottomColor) {
        try {
            var fxGrp = solid.property("ADBE Effect Parade");
            var ramp = fxGrp.addProperty("ADBE Ramp");
            ramp.property("ADBE Ramp-0001").setValue([comp.width / 2, 0]);
            ramp.property("ADBE Ramp-0002").setValue(hexToRgbFloat(spec.gradientTopColor));
            ramp.property("ADBE Ramp-0003").setValue([comp.width / 2, comp.height]);
            ramp.property("ADBE Ramp-0004").setValue(hexToRgbFloat(spec.gradientBottomColor));
        } catch (eR) {}
    }
    comp.time = 0.1;
    return solid;
}

function addAmbientGlowLayer(comp, spec) {
    var shp = comp.layers.addShape();
    shp.name = spec.name || "Ambient_Glow_Orb";
    var rootVec = shp.property("ADBE Root Vectors Group");
    var grp = rootVec.addProperty("ADBE Vector Group");
    grp.name = "Glow_Circle";
    var vecs = grp.property("ADBE Vectors Group");

    var ell = vecs.addProperty("ADBE Vector Shape - Ellipse");
    var diam = Number(spec.radius || 320) * 2;
    ell.property("ADBE Vector Ellipse Size").setValue([diam, diam]);

    var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(hexToRgbFloat(spec.color || "#38BDF8"));

    var tr = shp.property("ADBE Transform Group");
    tr.property("ADBE Position").setValue([Number(spec.x || comp.width / 2), Number(spec.y || comp.height / 2)]);
    tr.property("ADBE Opacity").setValue(Number(spec.opacity !== undefined ? spec.opacity : 35));

    try {
        var fx = shp.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
        fx.property("ADBE Gaussian Blur 2-0001").setValue(Number(spec.blur || 180));
    } catch (eB) {}

    try { shp.blendingMode = BlendingMode.SCREEN; } catch (eM) {}
    if (spec.pulse !== false) {
        try { tr.property("ADBE Scale").expression = "wiggle(0.6, 12)"; } catch (eW) {}
    }
    comp.time = Number(spec.inSec || 0.2);
    return shp;
}

function addVectorCardShape(comp, spec) {
    var shp = comp.layers.addShape();
    shp.name = spec.name || "Vector_UI_Card";
    shp.motionBlur = true;

    var rootVec = shp.property("ADBE Root Vectors Group");
    var grp = rootVec.addProperty("ADBE Vector Group");
    grp.name = "Card_Rect";
    var vecs = grp.property("ADBE Vectors Group");

    var rect = vecs.addProperty("ADBE Vector Shape - Rect");
    rect.property("ADBE Vector Rect Size").setValue([Number(spec.width || 860), Number(spec.height || 320)]);
    rect.property("ADBE Vector Rect Roundness").setValue(Number(spec.radius !== undefined ? spec.radius : 28));

    var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
    fill.property("ADBE Vector Fill Color").setValue(hexToRgbFloat(spec.fillColor || "#1E293B"));
    if (spec.fillOpacity !== undefined) {
        fill.property("ADBE Vector Fill Opacity").setValue(Number(spec.fillOpacity));
    }

    if (spec.strokeColor && Number(spec.strokeWidth || 0) > 0) {
        var st = vecs.addProperty("ADBE Vector Graphic - Stroke");
        st.property("ADBE Vector Stroke Color").setValue(hexToRgbFloat(spec.strokeColor));
        st.property("ADBE Vector Stroke Width").setValue(Number(spec.strokeWidth));
    }

    if (spec.inSec !== undefined) shp.inPoint = Number(spec.inSec);
    if (spec.outSec !== undefined) shp.outPoint = Number(spec.outSec);

    var tr = shp.property("ADBE Transform Group");
    tr.property("ADBE Position").setValue([Number(spec.x || comp.width / 2), Number(spec.y || comp.height / 2)]);

    if (spec.dropShadow !== false) {
        try {
            var ds = shp.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            ds.property("ADBE Drop Shadow-0002").setValue(95); // Opacity (0-255)
            ds.property("ADBE Drop Shadow-0004").setValue(24); // Distance
            ds.property("ADBE Drop Shadow-0005").setValue(48); // Softness
        } catch (eDs) {}
    }

    if (spec.animations) {
        applyLayerAnimations(shp, spec.animations, spec.influenceIn, spec.influenceOut);
    }
    comp.time = Number(spec.inSec || 0.4) + 0.35;
    return shp;
}

function addKineticTextLayer(comp, spec) {
    var rawText = String(spec.text || "MOTION DNA").replace(/\n/g, "\r");
    if (spec.allCaps) rawText = rawText.toUpperCase();

    var txtLyr = comp.layers.addText(rawText);
    txtLyr.name = spec.name || rawText.substring(0, 28);
    txtLyr.motionBlur = true;

    var textProp = txtLyr.property("ADBE Text Properties").property("ADBE Text Document");
    var td = textProp.value;
    td.text = rawText;
    if (spec.font) {
        try { td.font = String(spec.font); } catch (eF) {}
    }
    td.fontSize = Number(spec.size || 72);
    td.applyFill = true;
    td.fillColor = hexToRgbFloat(spec.color || "#F8FAFC");
    if (spec.tracking !== undefined) td.tracking = Number(spec.tracking);
    if (spec.leading !== undefined) {
        td.autoLeading = false;
        td.leading = Number(spec.leading);
    }

    var align = String(spec.align || "center").toLowerCase();
    if (align === "left") td.justification = ParagraphJustification.LEFT_JUSTIFY;
    else if (align === "right") td.justification = ParagraphJustification.RIGHT_JUSTIFY;
    else td.justification = ParagraphJustification.CENTER_JUSTIFY;

    textProp.setValue(td);

    if (spec.inSec !== undefined) txtLyr.inPoint = Number(spec.inSec);
    if (spec.outSec !== undefined) txtLyr.outPoint = Number(spec.outSec);

    centerLayerAnchorPoint(txtLyr, Number(spec.inSec || 0) + 0.05);

    var tr = txtLyr.property("ADBE Transform Group");
    tr.property("ADBE Position").setValue([Number(spec.x || comp.width / 2), Number(spec.y || comp.height / 2)]);

    if (spec.animations) {
        applyLayerAnimations(txtLyr, spec.animations, spec.influenceIn, spec.influenceOut);
    }

    comp.time = Number(spec.inSec || 0.2) + 0.40;
    return txtLyr;
}

function addCompMarker(comp, spec) {
    try {
        var mv = new MarkerValue(String(spec.name || "Beat"));
        if (spec.comment) mv.comment = String(spec.comment);
        comp.markerProperty.setValueAtTime(Number(spec.timeSec || 0), mv);
    } catch (e) {}
}

function savePreviewFramePng(comp, timeSec, outPngPath) {
    try {
        var f = new File(outPngPath);
        if (f.parent && !f.parent.exists) f.parent.create();
        comp.time = Number(timeSec || 1.0);
        comp.saveFrameToPng(Number(timeSec || 1.0), f);
        return f.fsName;
    } catch (e) {
        return null;
    }
}

function saveProjectAep(outAepPath) {
    try {
        var f = new File(outAepPath);
        if (f.parent && !f.parent.exists) f.parent.create();
        app.project.save(f);
        return f.fsName;
    } catch (e) {
        return null;
    }
}
