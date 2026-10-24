/* after-effects-extendscript · reusable helper block.
 * Paste the helpers you need into your script. ExtendScript is ES3:
 * var only, no const/let/arrow/template-literals. Every helper takes an
 * explicit parent/comp so it works inside any comp.
 */

// ---- color ----
function hexToRgb(hex) {
  hex = String(hex).replace(/^#/, "");
  if (hex.length === 3) hex = hex.charAt(0)+hex.charAt(0)+hex.charAt(1)+hex.charAt(1)+hex.charAt(2)+hex.charAt(2);
  return [parseInt(hex.substr(0,2),16)/255, parseInt(hex.substr(2,2),16)/255, parseInt(hex.substr(4,2),16)/255];
}

// ---- expression-string quoting (inject a JS string literal into an expression) ----
function q(s) { return '"' + String(s).replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"'; }

// ---- font resolve: family -> installed PostScript name, graceful fallback ----
// guesses = candidate PS names; fallbackPS used only if the font API is present and nothing matched.
function resolvePS(family, style, guesses, fallbackPS) {
  try {
    if (app.fonts && app.fonts.getFontsByFamilyNameAndStyleName) {
      var arr = app.fonts.getFontsByFamilyNameAndStyleName(family, style || "Regular");
      if (arr && arr.length) return arr[0].postScriptName;
    }
    if (app.fonts && app.fonts.allFonts) {
      var all = app.fonts.allFonts, i, g;
      for (i = 0; i < all.length; i++) { if (all[i].familyName === family) return all[i].postScriptName; }
      for (g = 0; g < guesses.length; g++) {
        for (i = 0; i < all.length; i++) { if (all[i].postScriptName === guesses[g]) return guesses[g]; }
      }
      return fallbackPS;
    }
  } catch (e) {}
  return guesses[0];   // no font API: trust the primary guess (AE substitutes if missing)
}

// ---- point text, styled, anchored at baseline-left origin [0,0] ----
function makeText(comp, name, str, fontPS, size, rgb) {
  var layer = comp.layers.addText(str);
  layer.name = name;
  var td = layer.property("ADBE Text Properties").property("ADBE Text Document");
  var doc = td.value;
  doc.fontSize = size;
  try { doc.font = fontPS; } catch (e) {}
  doc.applyFill = true; doc.fillColor = rgb; doc.applyStroke = false;
  doc.justification = ParagraphJustification.LEFT_JUSTIFY;
  doc.text = str;
  td.setValue(doc);
  layer.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]);
  return layer;
}

// rect relative to the anchor (set anchor [0,0] first); left edge in comp = position.x + rect.left
function rectOf(layer) { return layer.sourceRectAtTime(0, false); }

function setPos(layer, x, y) { layer.property("ADBE Transform Group").property("ADBE Position").setValue([x, y]); }
function opacProp(layer)    { return layer.property("ADBE Transform Group").property("ADBE Opacity"); }
function posProp(layer)     { return layer.property("ADBE Transform Group").property("ADBE Position"); }

// ---- easy-ease every key of a property (1D or multi-D) ----
function easeAll(prop) {
  // spatial props (Position) take ONE temporal-ease element regardless of
  // dimensionality; non-spatial multi-D props (Scale [x,y]) take one per dimension.
  // Passing 2 to a Position keyframe throws "Value array does not have 1 elements".
  var spatial = false; try { spatial = prop.isSpatial; } catch (e) {}
  var dim = spatial ? 1 : ((prop.value instanceof Array) ? prop.value.length : 1);
  for (var i = 1; i <= prop.numKeys; i++) {
    prop.setInterpolationTypeAtKey(i, KeyframeInterpolationType.BEZIER, KeyframeInterpolationType.BEZIER);
    var ein = [], eout = [], d;
    for (d = 0; d < dim; d++) { ein.push(new KeyframeEase(0, 33)); eout.push(new KeyframeEase(0, 33)); }
    prop.setTemporalEaseAtKey(i, ein, eout);
  }
}

// opacity keyframes + easy-ease. keys = [[t,val],...]
function opacityKeys(layer, keys) {
  var op = opacProp(layer), i;
  for (i = 0; i < keys.length; i++) op.setValueAtTime(keys[i][0], keys[i][1]);
  easeAll(op);
}

// ---- typing-on Source Text expression (apply AFTER measuring full text for layout) ----
// reveal +1 form: char i shows at ts+(i-1)*iv
function typingExpr(str, typeStart, interval) {
  return 'var s = ' + q(str) + ';\r' +
         'var ts = ' + typeStart + ';\r' +
         'var iv = ' + interval + ';\r' +
         'var n = (time < ts) ? 0 : Math.floor((time - ts) / iv) + 1;\r' +
         'if (n < 0) n = 0;\r' +
         'if (n > s.length) n = s.length;\r' +
         's.substr(0, n);';
}

// ---- track a follower's x to the right edge of another text layer (gap px) ----
function edgeTrackExpr(targetLayerName, gap) {
  return 'var W = thisComp.layer(' + q(targetLayerName) + ');\r' +
         'var wr = W.sourceRectAtTime(time, false);\r' +
         'var sr = sourceRectAtTime(time, false);\r' +
         'var x = W.position[0] + wr.left + wr.width + ' + gap + ' - sr.left;\r' +
         '[x, value[1]];';
}

// ---- 4-point sparkle (polystar) centered at (cx,cy) ----
function makeSparkle(comp, name, cx, cy, outerR, rgb) {
  var s = comp.layers.addShape(); s.name = name;
  var gc = s.property("ADBE Root Vectors Group").addProperty("ADBE Vector Group").property("ADBE Vectors Group");
  var star = gc.addProperty("ADBE Vector Shape - Star");
  star.property("ADBE Vector Star Type").setValue(1);
  star.property("ADBE Vector Star Points").setValue(4);
  star.property("ADBE Vector Star Outer Radius").setValue(outerR);
  star.property("ADBE Vector Star Inner Radius").setValue(outerR * 0.16);
  try { star.property("ADBE Vector Star Outer Roundess").setValue(0); } catch (e) {}
  try { star.property("ADBE Vector Star Inner Roundess").setValue(0); } catch (e) {}
  gc.addProperty("ADBE Vector Graphic - Fill").property("ADBE Vector Fill Color").setValue([rgb[0], rgb[1], rgb[2], 1]);
  s.property("ADBE Transform Group").property("ADBE Anchor Point").setValue([0, 0]);
  setPos(s, cx, cy);
  return s;
}

// pop a sparkle on a beat: scale 0->peak->0, slow turn, opacity flash
function animSparkle(layer, dt, mul) {
  mul = mul || 1;
  var tg = layer.property("ADBE Transform Group");
  var sc = tg.property("ADBE Scale"), ro = tg.property("ADBE Rotate Z"), op = tg.property("ADBE Opacity");
  var peak = 135 * mul;
  sc.setValueAtTime(dt, [0,0]); sc.setValueAtTime(dt + 0.13, [peak, peak]); sc.setValueAtTime(dt + 0.50, [0,0]);
  ro.setValueAtTime(dt, -25);   ro.setValueAtTime(dt + 0.50, 40);
  op.setValueAtTime(dt, 0);     op.setValueAtTime(dt + 0.07, 100); op.setValueAtTime(dt + 0.45, 0);
  easeAll(sc); easeAll(ro); easeAll(op);
}

// ---- import audio/footage (returns null if missing) ----
function importAudio(path) {
  var f = new File(path);
  if (!f.exists) return null;
  try { return app.project.importFile(new ImportOptions(f)); } catch (e) { return null; }
}

// ---- assets next to the running script ----
function scriptDir() { try { return (new File($.fileName)).parent.fsName + "/"; } catch (e) { return ""; } }
