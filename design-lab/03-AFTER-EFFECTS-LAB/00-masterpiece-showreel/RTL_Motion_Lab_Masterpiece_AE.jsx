/**
 * ============================================================================
 *  RTL MOTION LAB — MASTERPIECE AFTER EFFECTS SHOWREEL GENERATOR (.JSX)
 *  نسخهٔ استودیویی ۲۰۲۶ · ساخت خودکار تیزر ۱۰ ثانیه‌ای ۶۰ فریم در افتر افکت
 * ============================================================================
 */

(function () {
    var CONFIG = {
        compName: "RTL_Motion_Lab_Masterpiece_1080p60",
        width: 1920,
        height: 1080,
        fps: 60,
        duration: 10.0,

        colors: {
            bgTop: "#05070E",
            bgBottom: "#0D1326",
            surface1: "#0F1526",
            surface2: "#161E35",
            gold: "#F5B841",
            cyan: "#22D3EE",
            indigo: "#6366F1",
            emerald: "#34D399",
            rose: "#F43F5E",
            white: "#F8FAFC",
            muted: "#94A3B8"
        },

        strings: {
            titleMain: "\u062D\u0631\u06A9\u062A\u060C \u0632\u0628\u0627\u0646\u0650 \u0631\u0627\u0628\u0637\u0650 \u0641\u0627\u0631\u0633\u06CC \u0627\u0633\u062A",
            titleSub: "\u0622\u0632\u0645\u0627\u06CC\u0634\u06AF\u0627\u0647 \u0645\u0647\u0646\u062F\u0633\u06CC \u0645\u0648\u0634\u0646\u060C \u062A\u0627\u06CC\u067E\u0648\u06AF\u0631\u0627\u0641\u06CC \u0648 \u0634\u06CC\u062F\u0631",
            scene1Tag: "\u0635\u062D\u0646\u0647 \u06F0\u06F1 \u00B7 \u0647\u0646\u062F\u0633\u0647\u0654 \u0646\u0648\u0631 \u0648 \u0641\u06CC\u0632\u06CC\u06A9 \u0641\u0646\u0631",
            scene3Title: "\u0645\u0639\u0627\u062F\u0644\u0647\u0654 \u062F\u06CC\u0641\u0631\u0627\u0646\u0633\u06CC\u0644 \u0641\u0646\u0631",
            scene3Sub: "\u0646\u0648\u0633\u0627\u0646\u200C\u0646\u06AF\u0627\u0631 \u06F6\u06F0 \u0641\u0631\u06CC\u0645 \u0628\u0631 \u062B\u0627\u0646\u06CC\u0647 \u00B7 \u0645\u06CC\u0631\u0627\u06CC\u06CC \u0628\u062D\u0631\u0627\u0646\u06CC",
            card1Title: "\u06F4\u066C\u06F1\u06F9\u06F9 \u06A9\u0627\u0645\u067E\u0648\u0646\u0646\u062A \u0622\u0645\u0627\u062F\u0647",
            card1Sub: "\u06F1\u06F2 \u0631\u062C\u06CC\u0633\u062A\u0631\u06CC \u0645\u062F\u0631\u0646 \u06AF\u06CC\u062A\u200C\u0647\u0627\u0628",
            card2Title: "\u06F1\u06F7\u06F9 \u0627\u0633\u06A9\u06CC\u0644 + \u06F8\u06F4 \u0628\u0631\u0646\u062F",
            card2Sub: "\u0645\u062E\u0632\u0646 \u0645\u0647\u0646\u062F\u0633\u06CC \u0637\u0631\u0627\u062D\u06CC \u0648 \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC",
            card3Title: "\u06F1\u06F8 \u0634\u06CC\u062F\u0631 WebGL + \u06F2\u06F8\u06F5 \u0635\u062F\u0627",
            card3Sub: "\u0645\u0648\u062A\u0648\u0631 \u06AF\u0631\u0627\u0641\u06CC\u06A9\u06CC \u0648 \u0633\u06CC\u0646\u062A\u200C\u0633\u0627\u06CC\u0632\u0631 \u0628\u0648\u0645\u06CC",
            outroTitle: "\u0622\u0632\u0645\u0627\u06CC\u0634\u06AF\u0627\u0647 \u0645\u0648\u0634\u0646 \u0641\u0627\u0631\u0633\u06CC",
            outroBadge: "RTL MOTION LAB \u00B7 STUDIO EDITION 2026"
        }
    };

    function hexToRgb(hex) {
        var clean = String(hex || "#FFFFFF").replace("#", "");
        if (clean.length === 3) {
            clean = clean.charAt(0) + clean.charAt(0) +
                    clean.charAt(1) + clean.charAt(1) +
                    clean.charAt(2) + clean.charAt(2);
        }
        var num = parseInt(clean, 16);
        if (isNaN(num)) return [1.0, 1.0, 1.0];
        return [
            ((num >> 16) & 255) / 255.0,
            ((num >> 8) & 255) / 255.0,
            (num & 255) / 255.0
        ];
    }

    function resolvePersianFont() {
        var candidates = [
            "Vazirmatn-Bold", "Vazirmatn-ExtraBold", "Vazirmatn-Regular",
            "IRANSansX-Bold", "IRANSans-Bold", "Peyda-Bold", "Morabba-Bold",
            "Kalameh-Bold", "YekanBakh-Bold", "Dana-Bold", "Tahoma-Bold", "Arial-BoldMT"
        ];
        try {
            if (app.fonts && app.fonts.allFonts) {
                var all = app.fonts.allFonts;
                for (var c = 0; c < candidates.length; c++) {
                    for (var i = 0; i < all.length; i++) {
                        if (all[i].postScriptName === candidates[c]) {
                            return candidates[c];
                        }
                    }
                }
            }
        } catch (e) {}
        return "Tahoma-Bold";
    }

    function resolveMonoFont() {
        var candidates = ["JetBrainsMono-Bold", "Consolas-Bold", "Consolas", "CourierNewPS-BoldMT", "Arial-BoldMT"];
        try {
            if (app.fonts && app.fonts.allFonts) {
                var all = app.fonts.allFonts;
                for (var c = 0; c < candidates.length; c++) {
                    for (var i = 0; i < all.length; i++) {
                        if (all[i].postScriptName === candidates[c]) {
                            return candidates[c];
                        }
                    }
                }
            }
        } catch (e) {}
        return "Consolas";
    }

    function easeProperty(prop, infIn, infOut) {
        if (!prop || prop.numKeys < 2) return;
        var inPct = Math.max(1, Math.min(100, Number(infIn || 20)));
        var outPct = Math.max(1, Math.min(100, Number(infOut || 85)));

        var dim = 1;
        try {
            var isSpatial = false;
            try { isSpatial = prop.isSpatial; } catch (eS) {}
            if (isSpatial ||
                prop.propertyValueType === PropertyValueType.TwoD_SPATIAL ||
                prop.propertyValueType === PropertyValueType.ThreeD_SPATIAL) {
                dim = 1;
            } else {
                var v = prop.keyValue(1);
                if (v instanceof Array) dim = v.length;
            }
        } catch (eD) {
            dim = 1;
        }

        var easeInArr = [];
        var easeOutArr = [];
        for (var d = 0; d < dim; d++) {
            easeInArr.push(new KeyframeEase(0, inPct));
            easeOutArr.push(new KeyframeEase(0, outPct));
        }

        for (var k = 1; k <= prop.numKeys; k++) {
            try {
                prop.setInterpolationTypeAtKey(k, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
                prop.setTemporalEaseAtKey(k, easeInArr, easeOutArr);
            } catch (eK) {}
        }
    }

    function animateProp(prop, keyframes, infIn, infOut, expr) {
        if (!prop) return;
        for (var i = 0; i < keyframes.length; i++) {
            prop.setValueAtTime(keyframes[i][0], keyframes[i][1]);
        }
        if (keyframes.length >= 2) {
            easeProperty(prop, infIn || 20, infOut || 85);
        }
        if (expr) {
            try { prop.expression = expr; } catch (eEx) {}
        }
    }

    function centerAnchor(layer, atTime) {
        try {
            var rect = layer.sourceRectAtTime(atTime || 0.5, false);
            var cx = rect.left + rect.width / 2.0;
            var cy = rect.top + rect.height / 2.0;
            layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([cx, cy]);
        } catch (e) {}
    }

    function inertialSpringExpr(ampDefault, freqDefault, decayDefault) {
        var a = ampDefault || 0.08;
        var f = freqDefault || 2.8;
        var d = decayDefault || 5.2;
        return [
            "var amp = " + a + ";",
            "var freq = " + f + ";",
            "var decay = " + d + ";",
            "try {",
            "  var ctrl = thisComp.layer(\"00_CTRL_MASTER_RIG\");",
            "  amp = ctrl.effect(\"Spring Bounce Amp\")(\"Slider\") / 100;",
            "  freq = ctrl.effect(\"Spring Frequency Hz\")(\"Slider\");",
            "  decay = ctrl.effect(\"Spring Damping\")(\"Slider\");",
            "} catch (e) {}",
            "var n = 0;",
            "if (numKeys > 0) {",
            "  n = nearestKey(time).index;",
            "  if (key(n).time > time) n--;",
            "}",
            "if (n === 0) {",
            "  value;",
            "} else {",
            "  var t = time - key(n).time;",
            "  if (t > 0 && t < 1.5) {",
            "    var v = velocityAtTime(key(n).time - thisComp.frameDuration / 10);",
            "    value + v * amp * Math.sin(freq * t * 2 * Math.PI) / Math.exp(decay * t);",
            "  } else {",
            "    value;",
            "  }",
            "}"
        ].join("\r");
    }

    function createMasterRig(comp) {
        var rig = comp.layers.addNull(comp.duration);
        rig.name = "00_CTRL_MASTER_RIG";
        rig.label = 14;
        var fx = rig.property("ADBE Effect Parade");

        function addSlider(name, val) {
            try {
                var s = fx.addProperty("ADBE Slider Control");
                s.name = name;
                s.property("ADBE Slider Control-0001").setValue(val);
            } catch (e) {}
        }

        addSlider("Spring Bounce Amp", 7.5);
        addSlider("Spring Frequency Hz", 2.8);
        addSlider("Spring Damping", 5.2);
        addSlider("Ambient Pulse Speed", 0.65);
        return rig;
    }

    function createBackgroundAndOrbs(comp) {
        var bgSolid = comp.layers.addSolid(
            hexToRgb(CONFIG.colors.bgTop),
            "99_BG_Obsidian_Canvas",
            comp.width,
            comp.height,
            1.0,
            comp.duration
        );
        bgSolid.moveToEnd();
        try {
            var ramp = bgSolid.property("ADBE Effect Parade").addProperty("ADBE Ramp");
            ramp.property("ADBE Ramp-0001").setValue([comp.width * 0.5, 0]);
            ramp.property("ADBE Ramp-0002").setValue(hexToRgb(CONFIG.colors.bgTop));
            ramp.property("ADBE Ramp-0003").setValue([comp.width * 0.5, comp.height]);
            ramp.property("ADBE Ramp-0004").setValue(hexToRgb(CONFIG.colors.bgBottom));
        } catch (e) {}

        var orbs = [
            { name: "95_Glow_Saffron_Gold", x: 1420, y: 320, r: 440, col: CONFIG.colors.gold, op: 26 },
            { name: "96_Glow_Persian_Cyan", x: 480, y: 740, r: 420, col: CONFIG.colors.cyan, op: 24 },
            { name: "97_Glow_Royal_Indigo", x: 960, y: 540, r: 520, col: CONFIG.colors.indigo, op: 18 }
        ];

        for (var i = 0; i < orbs.length; i++) {
            var o = orbs[i];
            var shp = comp.layers.addShape();
            shp.name = o.name;
            shp.moveBefore(bgSolid);
            var vecs = shp.property("ADBE Root Vectors Group")
                .addProperty("ADBE Vector Group")
                .property("ADBE Vectors Group");
            var ell = vecs.addProperty("ADBE Vector Shape - Ellipse");
            ell.property("ADBE Vector Ellipse Size").setValue([o.r * 2, o.r * 2]);
            var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
            fill.property("ADBE Vector Fill Color").setValue(hexToRgb(o.col));

            var tr = shp.property("ADBE Transform Group");
            tr.property("ADBE Position").setValue([o.x, o.y]);
            tr.property("ADBE Opacity").setValue(o.op);
            try {
                tr.property("ADBE Position").expression =
                    "var sp = 0.55; [value[0] + Math.sin(time * sp * 2 * Math.PI + index) * 48, value[1] + Math.cos(time * sp * 2 * Math.PI + index) * 32];";
                tr.property("ADBE Scale").expression =
                    "var s = 100 + Math.sin(time * 1.2 + index) * 8; [s, s];";
            } catch (eEx) {}

            try {
                var blur = shp.property("ADBE Effect Parade").addProperty("ADBE Gaussian Blur 2");
                blur.property("ADBE Gaussian Blur 2-0001").setValue(210);
            } catch (eB) {}
            try { shp.blendingMode = BlendingMode.SCREEN; } catch (eM) {}
        }
    }

    function createTrimRing(comp, name, radius, strokeW, colorHex, inSec, outSec, rotSpeed) {
        var shp = comp.layers.addShape();
        shp.name = name;
        shp.motionBlur = true;
        shp.inPoint = inSec;
        shp.outPoint = outSec;

        var root = shp.property("ADBE Root Vectors Group");
        var grp = root.addProperty("ADBE Vector Group");
        var vecs = grp.property("ADBE Vectors Group");

        var ell = vecs.addProperty("ADBE Vector Shape - Ellipse");
        ell.property("ADBE Vector Ellipse Size").setValue([radius * 2, radius * 2]);

        var st = vecs.addProperty("ADBE Vector Graphic - Stroke");
        st.property("ADBE Vector Stroke Color").setValue(hexToRgb(colorHex));
        st.property("ADBE Vector Stroke Width").setValue(strokeW);

        var trim = root.addProperty("ADBE Vector Filter - Trim");
        var trimEnd = trim.property("ADBE Vector Trim End");
        animateProp(trimEnd, [
            [inSec, 0],
            [inSec + 0.85, 100]
        ], 15, 88);

        var tr = shp.property("ADBE Transform Group");
        tr.property("ADBE Position").setValue([comp.width / 2, comp.height / 2]);
        animateProp(tr.property("ADBE Scale"), [
            [inSec, [72, 72]],
            [inSec + 0.75, [100, 100]],
            [outSec - 0.45, [100, 100]],
            [outSec, [118, 118]]
        ], 18, 85, inertialSpringExpr(0.06, 2.6, 5.5));

        animateProp(tr.property("ADBE Opacity"), [
            [inSec, 0],
            [inSec + 0.35, 85],
            [outSec - 0.4, 85],
            [outSec, 0]
        ], 30, 70);

        if (rotSpeed) {
            try {
                tr.property("ADBE Rotate Z").expression = "time * " + rotSpeed + ";";
            } catch (eR) {}
        }
        return shp;
    }

    function createSparkle(comp, name, cx, cy, outerR, colorHex, popTime) {
        var s = comp.layers.addShape();
        s.name = name;
        s.motionBlur = true;
        s.inPoint = Math.max(0, popTime - 0.05);
        s.outPoint = Math.min(comp.duration, popTime + 0.85);

        var vecs = s.property("ADBE Root Vectors Group")
            .addProperty("ADBE Vector Group")
            .property("ADBE Vectors Group");
        var star = vecs.addProperty("ADBE Vector Shape - Star");
        star.property("ADBE Vector Star Type").setValue(1);
        star.property("ADBE Vector Star Points").setValue(4);
        star.property("ADBE Vector Star Outer Radius").setValue(outerR);
        star.property("ADBE Vector Star Inner Radius").setValue(outerR * 0.16);

        var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(hexToRgb(colorHex));

        var tr = s.property("ADBE Transform Group");
        tr.property("ADBE Position").setValue([cx, cy]);
        animateProp(tr.property("ADBE Scale"), [
            [popTime, [0, 0]],
            [popTime + 0.16, [130, 130]],
            [popTime + 0.65, [0, 0]]
        ], 20, 85);
        animateProp(tr.property("ADBE Rotate Z"), [
            [popTime, -35],
            [popTime + 0.65, 55]
        ], 25, 80);
        animateProp(tr.property("ADBE Opacity"), [
            [popTime, 0],
            [popTime + 0.08, 100],
            [popTime + 0.60, 0]
        ], 30, 70);
        return s;
    }

    function createCardLayer(comp, name, cx, cy, w, h, radius, fillHex, strokeHex, inSec, outSec) {
        var shp = comp.layers.addShape();
        shp.name = name;
        shp.motionBlur = true;
        shp.inPoint = inSec;
        shp.outPoint = outSec;

        var vecs = shp.property("ADBE Root Vectors Group")
            .addProperty("ADBE Vector Group")
            .property("ADBE Vectors Group");

        var rect = vecs.addProperty("ADBE Vector Shape - Rect");
        rect.property("ADBE Vector Rect Size").setValue([w, h]);
        rect.property("ADBE Vector Rect Roundness").setValue(radius);

        var fill = vecs.addProperty("ADBE Vector Graphic - Fill");
        fill.property("ADBE Vector Fill Color").setValue(hexToRgb(fillHex));
        fill.property("ADBE Vector Fill Opacity").setValue(92);

        var st = vecs.addProperty("ADBE Vector Graphic - Stroke");
        st.property("ADBE Vector Stroke Color").setValue(hexToRgb(strokeHex));
        st.property("ADBE Vector Stroke Width").setValue(2);

        try {
            var ds = shp.property("ADBE Effect Parade").addProperty("ADBE Drop Shadow");
            ds.property("ADBE Drop Shadow-0002").setValue(110);
            ds.property("ADBE Drop Shadow-0004").setValue(28);
            ds.property("ADBE Drop Shadow-0005").setValue(64);
        } catch (eDs) {}

        var tr = shp.property("ADBE Transform Group");
        animateProp(tr.property("ADBE Position"), [
            [inSec, [cx, cy + 70]],
            [inSec + 0.55, [cx, cy]],
            [outSec - 0.35, [cx, cy]],
            [outSec, [cx, cy - 45]]
        ], 18, 86, inertialSpringExpr(0.075, 2.7, 5.4));

        animateProp(tr.property("ADBE Scale"), [
            [inSec, [86, 86]],
            [inSec + 0.55, [100, 100]],
            [outSec - 0.35, [100, 100]],
            [outSec, [92, 92]]
        ], 18, 86, inertialSpringExpr(0.065, 2.8, 5.4));

        animateProp(tr.property("ADBE Opacity"), [
            [inSec, 0],
            [inSec + 0.30, 100],
            [outSec - 0.30, 100],
            [outSec, 0]
        ], 30, 75);

        return shp;
    }

    function createTextLayer(comp, name, str, fontPS, size, colorHex, cx, cy, inSec, outSec, trackingVal) {
        var lyr = comp.layers.addText(str);
        lyr.name = name;
        lyr.motionBlur = true;
        lyr.inPoint = inSec;
        lyr.outPoint = outSec;

        var tdProp = lyr.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tdProp.value;
        td.text = str;
        try { td.font = fontPS; } catch (eF) {}
        td.fontSize = size;
        td.applyFill = true;
        td.fillColor = hexToRgb(colorHex);
        td.applyStroke = false;
        td.tracking = trackingVal || 0;
        td.justification = ParagraphJustification.CENTER_JUSTIFY;
        tdProp.setValue(td);

        centerAnchor(lyr, inSec + 0.1);

        var tr = lyr.property("ADBE Transform Group");
        animateProp(tr.property("ADBE Position"), [
            [inSec, [cx, cy + 56]],
            [inSec + 0.52, [cx, cy]],
            [outSec - 0.35, [cx, cy]],
            [outSec, [cx, cy - 38]]
        ], 18, 86, inertialSpringExpr(0.08, 2.8, 5.2));

        animateProp(tr.property("ADBE Scale"), [
            [inSec, [88, 88]],
            [inSec + 0.52, [100, 100]],
            [outSec - 0.35, [100, 100]],
            [outSec, [94, 94]]
        ], 18, 86, inertialSpringExpr(0.06, 2.8, 5.4));

        animateProp(tr.property("ADBE Opacity"), [
            [inSec, 0],
            [inSec + 0.28, 100],
            [outSec - 0.28, 100],
            [outSec, 0]
        ], 30, 75);

        return lyr;
    }

    function createSpringOscilloscopeScene(comp, fontPS, monoPS, inSec, outSec) {
        createCardLayer(
            comp,
            "22_Scene03_Oscilloscope_Frame",
            960, 575, 1340, 470, 32,
            CONFIG.colors.surface1, CONFIG.colors.cyan,
            inSec, outSec
        );

        var baseLine = comp.layers.addShape();
        baseLine.name = "21_Scene03_Target_Baseline";
        baseLine.inPoint = inSec + 0.1;
        baseLine.outPoint = outSec;
        var bVecs = baseLine.property("ADBE Root Vectors Group")
            .addProperty("ADBE Vector Group")
            .property("ADBE Vectors Group");
        var bRect = bVecs.addProperty("ADBE Vector Shape - Rect");
        bRect.property("ADBE Vector Rect Size").setValue([1160, 2]);
        var bFill = bVecs.addProperty("ADBE Vector Graphic - Fill");
        bFill.property("ADBE Vector Fill Color").setValue(hexToRgb(CONFIG.colors.muted));
        bFill.property("ADBE Vector Fill Opacity").setValue(35);
        baseLine.property("ADBE Transform Group").property("ADBE Position").setValue([960, 560]);

        var waveLayer = comp.layers.addShape();
        waveLayer.name = "20_Scene03_Differential_Spring_Curve";
        waveLayer.motionBlur = true;
        waveLayer.inPoint = inSec + 0.15;
        waveLayer.outPoint = outSec;

        var wRoot = waveLayer.property("ADBE Root Vectors Group");
        var wGrp = wRoot.addProperty("ADBE Vector Group");
        var wVecs = wGrp.property("ADBE Vectors Group");
        var pathProp = wVecs.addProperty("ADBE Vector Shape - Group").property("ADBE Vector Shape");

        var myShape = new Shape();
        var verts = [];
        var inTangents = [];
        var outTangents = [];
        var steps = 48;
        var startX = -560;
        var spanX = 1120;
        var ampY = 185;
        var zeta = 0.22;
        var omega = 13.5;

        for (var i = 0; i <= steps; i++) {
            var u = i / steps;
            var x = startX + u * spanX;
            var decay = Math.exp(-zeta * omega * u);
            var y = decay * Math.cos(omega * u) * ampY;
            verts.push([x, y]);
            inTangents.push([0, 0]);
            outTangents.push([0, 0]);
        }
        myShape.vertices = verts;
        myShape.inTangents = inTangents;
        myShape.outTangents = outTangents;
        myShape.closed = false;
        pathProp.setValue(myShape);

        var wStroke = wVecs.addProperty("ADBE Vector Graphic - Stroke");
        wStroke.property("ADBE Vector Stroke Color").setValue(hexToRgb(CONFIG.colors.gold));
        wStroke.property("ADBE Vector Stroke Width").setValue(6);

        var wTrim = wRoot.addProperty("ADBE Vector Filter - Trim");
        animateProp(wTrim.property("ADBE Vector Trim End"), [
            [inSec + 0.20, 0],
            [inSec + 1.45, 100]
        ], 15, 85);

        var wTr = waveLayer.property("ADBE Transform Group");
        wTr.property("ADBE Position").setValue([960, 560]);
        animateProp(wTr.property("ADBE Opacity"), [
            [inSec + 0.15, 0],
            [inSec + 0.35, 100],
            [outSec - 0.30, 100],
            [outSec, 0]
        ], 30, 70);

        createTextLayer(
            comp, "19_Scene03_Title", CONFIG.strings.scene3Title,
            fontPS, 64, CONFIG.colors.white, 960, 220, inSec, outSec, 0
        );
        createTextLayer(
            comp, "18_Scene03_Subtitle", CONFIG.strings.scene3Sub,
            fontPS, 32, CONFIG.colors.cyan, 960, 295, inSec + 0.10, outSec, 0
        );
        createTextLayer(
            comp, "17_Scene03_Equation",
            "x''(t) + 2\u03B6\u03C9\u2080 x'(t) + \u03C9\u2080\u00B2 x(t) = 0   |   \u03B6 = 0.22   \u03C9\u2080 = 13.5 rad/s   60.0 FPS",
            monoPS, 24, CONFIG.colors.gold, 960, 755, inSec + 0.22, outSec, 40
        );
    }

    function createHudOverlay(comp, monoPS) {
        var hud = comp.layers.addText("HUD_TELEMETRY");
        hud.name = "02_HUD_Live_Timecode_Telemetry";
        var tdProp = hud.property("ADBE Text Properties").property("ADBE Text Document");
        var td = tdProp.value;
        try { td.font = monoPS; } catch (e) {}
        td.fontSize = 20;
        td.applyFill = true;
        td.fillColor = hexToRgb(CONFIG.colors.cyan);
        td.tracking = 80;
        td.justification = ParagraphJustification.LEFT_JUSTIFY;
        tdProp.setValue(td);

        var tr = hud.property("ADBE Transform Group");
        tr.property("ADBE Anchor Point").setValue([0, 0]);
        tr.property("ADBE Position").setValue([88, 76]);
        tr.property("ADBE Opacity").setValue(78);

        try {
            tdProp.expression = [
                "var f = Math.round(time / thisComp.frameDuration);",
                "var padF = (f < 10 ? '00' : (f < 100 ? '0' : '')) + f;",
                "'RTL MOTION LAB // REC 60.0 FPS // FRAME ' + padF + ' // T+' + time.toFixed(2) + 's';"
            ].join("\r");
        } catch (eEx) {}

        var bars = [
            { name: "01_Cinema_Letterbox_Top", y: 24 },
            { name: "01_Cinema_Letterbox_Bottom", y: comp.height - 24 }
        ];
        for (var i = 0; i < bars.length; i++) {
            var b = comp.layers.addShape();
            b.name = bars[i].name;
            var vecs = b.property("ADBE Root Vectors Group")
                .addProperty("ADBE Vector Group")
                .property("ADBE Vectors Group");
            var r = vecs.addProperty("ADBE Vector Shape - Rect");
            r.property("ADBE Vector Rect Size").setValue([comp.width, 48]);
            var f = vecs.addProperty("ADBE Vector Graphic - Fill");
            f.property("ADBE Vector Fill Color").setValue([0.01, 0.015, 0.03]);
            b.property("ADBE Transform Group").property("ADBE Position").setValue([comp.width / 2, bars[i].y]);
        }
    }

    function addSceneMarkers(comp) {
        var markers = [
            [0.0, "01 · IGNITION & GEOMETRY"],
            [2.0, "02 · KINETIC PERSIAN TYPE"],
            [4.4, "03 · SPRING OSCILLOSCOPE"],
            [6.8, "04 · BENTO TELEMETRY HUD"],
            [8.4, "05 · FINAL BRAND LOCKUP"]
        ];
        for (var i = 0; i < markers.length; i++) {
            try {
                var mv = new MarkerValue(markers[i][1]);
                comp.markerProperty.setValueAtTime(markers[i][0], mv);
            } catch (eM) {}
        }
    }

    app.beginUndoGroup("Build RTL Motion Lab Masterpiece Showreel");

    try {
        if (!app.project) app.newProject();

        for (var idx = app.project.numItems; idx >= 1; idx--) {
            var item = app.project.item(idx);
            if ((item instanceof CompItem) && item.name === CONFIG.compName) {
                item.remove();
            }
        }

        var comp = app.project.items.addComp(
            CONFIG.compName,
            CONFIG.width,
            CONFIG.height,
            1.0,
            CONFIG.duration,
            CONFIG.fps
        );
        comp.bgColor = hexToRgb(CONFIG.colors.bgTop);
        comp.motionBlur = true;

        var fontPS = resolvePersianFont();
        var monoPS = resolveMonoFont();

        createBackgroundAndOrbs(comp);
        createMasterRig(comp);

        createTrimRing(comp, "35_Scene01_Outer_Gold_Ring", 370, 3, CONFIG.colors.gold, 0.0, 2.35, 18);
        createTrimRing(comp, "34_Scene01_Mid_Cyan_Ring", 275, 4, CONFIG.colors.cyan, 0.12, 2.35, -26);
        createTrimRing(comp, "33_Scene01_Inner_Core_Ring", 180, 2, CONFIG.colors.indigo, 0.24, 2.35, 34);

        createSparkle(comp, "32_Sparkle_Gold_NE", 1290, 310, 42, CONFIG.colors.gold, 0.35);
        createSparkle(comp, "31_Sparkle_Cyan_SW", 630, 760, 36, CONFIG.colors.cyan, 0.48);
        createSparkle(comp, "30_Sparkle_Gold_NW", 660, 330, 30, CONFIG.colors.gold, 0.62);

        createTextLayer(
            comp, "29_Scene01_Badge", CONFIG.strings.scene1Tag,
            fontPS, 34, CONFIG.colors.gold, 960, 495, 0.18, 2.25, 0
        );
        createTextLayer(
            comp, "28_Scene01_Sub", "PERSIAN RTL MOTION ENGINEERING // 60 FPS",
            monoPS, 24, CONFIG.colors.cyan, 960, 565, 0.28, 2.25, 120
        );

        createCardLayer(
            comp, "27_Scene02_Hero_Glass_Card",
            960, 540, 1420, 430, 36,
            CONFIG.colors.surface1, CONFIG.colors.gold,
            2.0, 4.65
        );
        createTextLayer(
            comp, "26_Scene02_Eyebrow", "AWWWARDS-GRADE DESIGN SYSTEM & MOTION ENGINE",
            monoPS, 22, CONFIG.colors.cyan, 960, 405, 2.10, 4.60, 140
        );
        createTextLayer(
            comp, "25_Scene02_Hero_Main_Persian", CONFIG.strings.titleMain,
            fontPS, 88, CONFIG.colors.white, 960, 525, 2.18, 4.65, 0
        );
        createTextLayer(
            comp, "24_Scene02_Hero_Sub_Persian", CONFIG.strings.titleSub,
            fontPS, 38, CONFIG.colors.gold, 960, 645, 2.30, 4.65, 0
        );
        createSparkle(comp, "23_Scene02_Accent_Sparkle", 1560, 380, 46, CONFIG.colors.gold, 2.45);

        createSpringOscilloscopeScene(comp, fontPS, monoPS, 4.40, 7.05);

        var bentoSpecs = [
            {
                idx: "1", x: 1410, stroke: CONFIG.colors.gold,
                title: CONFIG.strings.card1Title, sub: CONFIG.strings.card1Sub,
                tag: "REGISTRY VAULT // 01", delay: 0.0
            },
            {
                idx: "2", x: 960, stroke: CONFIG.colors.cyan,
                title: CONFIG.strings.card2Title, sub: CONFIG.strings.card2Sub,
                tag: "DESIGN SKILLS // 02", delay: 0.12
            },
            {
                idx: "3", x: 510, stroke: CONFIG.colors.emerald,
                title: CONFIG.strings.card3Title, sub: CONFIG.strings.card3Sub,
                tag: "SHADER & AUDIO // 03", delay: 0.24
            }
        ];

        for (var b = 0; b < bentoSpecs.length; b++) {
            var bs = bentoSpecs[b];
            var tIn = 6.80 + bs.delay;
            var tOut = 8.75;
            createCardLayer(
                comp, "16_Scene04_Bento_Card_" + bs.idx,
                bs.x, 550, 410, 340, 28,
                CONFIG.colors.surface2, bs.stroke,
                tIn, tOut
            );
            createTextLayer(
                comp, "15_Scene04_Bento_Tag_" + bs.idx, bs.tag,
                monoPS, 18, bs.stroke, bs.x, 445, tIn + 0.08, tOut, 100
            );
            createTextLayer(
                comp, "14_Scene04_Bento_Title_" + bs.idx, bs.title,
                fontPS, 42, CONFIG.colors.white, bs.x, 545, tIn + 0.14, tOut, 0
            );
            createTextLayer(
                comp, "13_Scene04_Bento_Sub_" + bs.idx, bs.sub,
                fontPS, 25, CONFIG.colors.muted, bs.x, 625, tIn + 0.20, tOut, 0
            );
        }

        createTrimRing(comp, "10_Scene05_Final_Gold_Ring", 320, 4, CONFIG.colors.gold, 8.45, 10.0, 22);
        createTrimRing(comp, "09_Scene05_Final_Cyan_Ring", 230, 2, CONFIG.colors.cyan, 8.55, 10.0, -30);

        createCardLayer(
            comp, "08_Scene05_Final_Badge_Card",
            960, 540, 1180, 320, 36,
            CONFIG.colors.surface1, CONFIG.colors.gold,
            8.45, 10.0
        );
        createTextLayer(
            comp, "07_Scene05_Final_Persian_Title", CONFIG.strings.outroTitle,
            fontPS, 82, CONFIG.colors.white, 960, 505, 8.52, 10.0, 0
        );
        createTextLayer(
            comp, "06_Scene05_Final_Badge_Sub", CONFIG.strings.outroBadge,
            monoPS, 26, CONFIG.colors.gold, 960, 610, 8.62, 10.0, 160
        );

        createSparkle(comp, "05_Scene05_Star_R", 1480, 420, 52, CONFIG.colors.gold, 8.70);
        createSparkle(comp, "04_Scene05_Star_L", 440, 650, 48, CONFIG.colors.cyan, 8.80);

        createHudOverlay(comp, monoPS);
        addSceneMarkers(comp);

        comp.time = 2.85;
        try { comp.openInViewer(); } catch (eV) {}

        app.endUndoGroup();

        alert(
            "\u2705 \u0645\u0648\u0634\u0646 \u06AF\u0631\u0627\u0641\u06CC\u06A9 \u00AB\u0622\u0632\u0645\u0627\u06CC\u0634\u06AF\u0627\u0647 \u0645\u0648\u0634\u0646 \u0641\u0627\u0631\u0633\u06CC\u00BB \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u0633\u0627\u062E\u062A\u0647 \u0634\u062F!\n\n" +
            "\u2022 Composition: " + CONFIG.compName + " (1920x1080 @ 60fps, 10.0s)\n" +
            "\u2022 Active Persian Font: " + fontPS + "\n" +
            "\u2022 Layers Created: " + comp.numLayers + " Keyframed & Expression Layers"
        );
    } catch (err) {
        app.endUndoGroup();
        alert("After Effects Script Error:\n" + err.toString() + (err.line ? "\nLine: " + err.line : ""));
    }
})();
