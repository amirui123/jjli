/*
 * The MCP tool surface: verb-dispatching tools, each covering several host ops.
 *
 * The same shape as the After Effects server this was forked from:
 *   - everything addressed by stable id (PageItem.uuid), never by index
 *   - a discovery chain (sessionInfo -> tree -> item -> set)
 *   - batch-shaped writes with per-item machine-readable errors
 *   - token cost stated in the description, because tree depth and image
 *     size are the two ways an agent burns a context window here
 *   - one coordinate convention everywhere - artboard space, points, y down -
 *     stated in every tool that takes a position
 */

const fs = require('fs');
const nodePath = require('path');
const { buildContactSheet, renderCapture } = require('./contact-sheet-illustrator.js');
const { bridgeInfo } = require('./bridge-info.js');

/*
 * Absolute path to the ExtendScript entry point. The Node side knows where it
 * lives; the host cannot reliably tell for a script CEP loaded via ScriptPath.
 */
const HOST_JSX = nodePath.join(__dirname, '..', 'host', 'ai', 'host.jsx');

const COORDS =
  'Positions and sizes are POINTS in artboard space: (0,0) is the top-left of the artboard, y grows DOWN - ' +
  'the same numbers the rulers and Transform panel show. x,y is always the top-left of the item\'s geometric ' +
  'bounds (the path itself, not including stroke width). artboard defaults to the active one.';

const COLOR_DOC =
  'Colour: "#RRGGBB", [r,g,b] on Illustrator\'s 0-255 scale (NOT 0-1), {cmyk:[c,m,y,k]} in percent, ' +
  '{gray:n}, {swatch:"Name"} for a document swatch (including spot colours), or "none".';

const colorSchema = { description: COLOR_DOC };
const uuidSchema = { type: 'string', description: 'Item uuid from ai_query.' };
const uuidsSchema = { type: 'array', items: { type: 'string' } };
const layerSchema = {
  type: 'array', items: { type: 'string' },
  description: 'Layer name path from the top, e.g. ["Layer 1"] or ["Artwork", "Icons"].',
};

function textContent(value) {
  return { content: [{ type: 'text', text: typeof value === 'string' ? value : JSON.stringify(value, null, 2) }] };
}

function errorContent(message) {
  return { content: [{ type: 'text', text: message }], isError: true };
}

const STYLE_PROPS = {
  fill: colorSchema,
  stroke: colorSchema,
  strokeWidth: { type: 'number', description: 'Points.' },
  strokeDashes: { type: 'array', items: { type: 'number' }, description: 'Dash and gap lengths, e.g. [6, 4]. [] for solid.' },
  strokeCap: { type: 'string', enum: ['butt', 'round', 'square'] },
  strokeJoin: { type: 'string', enum: ['miter', 'round', 'bevel'] },
  opacity: { type: 'number', description: '0-100.' },
  blendMode: { type: 'string', enum: ['normal', 'multiply', 'screen', 'overlay', 'softLight', 'hardLight', 'colorDodge', 'colorBurn', 'darken', 'lighten', 'difference', 'exclusion', 'hue', 'saturation', 'color', 'luminosity'] },
  font: { type: 'string', description: 'Text: PostScript name, e.g. "Helvetica-Bold". Find it with ai_query fonts.' },
  size: { type: 'number', description: 'Text: point size.' },
  justification: { type: 'string', enum: ['left', 'center', 'right', 'justify'] },
  tracking: { type: 'number', description: 'Text: thousandths of an em, as in the Character panel.' },
  leading: { description: 'Text: points, or "auto".' },
};

const TOOLS = [
  {
    name: 'ai_query',
    description:
      'Read the open Illustrator document. START HERE - run sessionInfo first to see which documents and ' +
      'artboards are open, then tree to find items.\n\n' +
      'Commands:\n' +
      '- sessionInfo: Illustrator version, every open document, and the active one\'s artboards with sizes.\n' +
      '- tree: layers and their items. depth 1 (default) lists each layer\'s top-level items without opening ' +
      'groups; raise it to open groups, or pass uuid to walk one group. maxItems (default 300) caps the ' +
      'walk and the result says truncated:true when it stopped - a real document can hold tens of ' +
      'thousands of paths, so start shallow.\n' +
      '- find: items by name substring, type (PathItem, TextFrame, GroupItem, CompoundPathItem, PlacedItem, ' +
      'RasterItem, SymbolItem), text content, and/or artboard. It searches EVERY item, including ones inside ' +
      'groups; those carry parentUuid. topLevel:true keeps only items directly on a layer - what you want ' +
      'when copying or moving a whole piece of artwork.\n' +
      '- item: everything about one item - box, visible box, fill, stroke, text attributes, whether area ' +
      'text overflows its frame. points:true adds a path\'s anchor and handle coordinates.\n' +
      '- selection: what the user has selected right now.\n' +
      '- fonts: installed fonts matching name (required). Returns PostScript names for ai_set font.\n' +
      '- swatches: the document\'s swatches.\n' +
      '- describe: the live schema of a tool ({tool:"ai_create"}), straight from this server - for when a ' +
      'command you expect is missing from a cached tool list.\n\n' +
      'Every item comes back with a uuid. It is stable across reordering, grouping and renaming; always ' +
      'address items by it. Items on the pasteboard report artboard:null and a box relative to the active ' +
      'artboard.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['sessionInfo', 'tree', 'find', 'item', 'selection', 'fonts', 'swatches', 'describe'] },
        tool: { type: 'string', description: 'describe: tool name. Omit to list every tool.' },
        uuid: uuidSchema,
        layer: layerSchema,
        depth: { type: 'number', description: 'tree: 1-8. Default 1.' },
        maxItems: { type: 'number', description: 'tree: cap on items listed. Default 300.' },
        name: { type: 'string', description: 'find: name substring. fonts: family or PostScript substring.' },
        type: { type: 'string', description: 'find: item typename.' },
        text: { type: 'string', description: 'find: text frames containing this.' },
        artboard: { type: 'number', description: 'find: only items on this artboard. item: measure against this artboard.' },
        topLevel: { type: 'boolean', description: 'find: only items directly on a layer, not inside a group.' },
        points: { type: 'boolean', description: 'item: include path point coordinates.' },
        limit: { type: 'number' },
      },
      required: ['command'],
    },
  },
  {
    name: 'ai_document',
    description:
      'Documents and artboards. Prefer the document the user already has open over creating one.\n\n' +
      '- new: width x height points (default 1080x1080), colorSpace RGB (default) or CMYK.\n' +
      '- open: an absolute path. activate: switch the active document by name (from sessionInfo) - every ' +
      'other tool works on the active document.\n' +
      '- save: in place for a document that has a file; an untitled one needs path (absolute, .ai). Never ' +
      'overwrites an existing file without overwrite:true.\n' +
      '- close: refuses a document with unsaved changes unless discardUnsaved:true. It never saves on ' +
      'close. Pass name to close exactly that document - without it, close acts on whichever is active, and ' +
      'the user may have clicked into their own file.\n' +
      '- addArtboard / setArtboard / removeArtboard: artboard x,y are relative to artboard 0\'s top-left, ' +
      'y down. addArtboard without x places it 40pt right of the rightmost artboard. Artboard 0 cannot be ' +
      'moved or removed, because it is the origin the others are measured from. setArtboard active:true ' +
      'makes it the active artboard.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['new', 'open', 'save', 'close', 'activate', 'addArtboard', 'setArtboard', 'removeArtboard'] },
        path: { type: 'string', description: 'open/save: absolute path.' },
        name: { type: 'string', description: 'activate/close: document name. add/setArtboard: artboard name.' },
        width: { type: 'number' },
        height: { type: 'number' },
        colorSpace: { type: 'string', enum: ['RGB', 'CMYK'] },
        x: { type: 'number' },
        y: { type: 'number' },
        index: { type: 'number', description: 'set/removeArtboard: 0-based artboard index.' },
        active: { type: 'boolean', description: 'setArtboard: make it the active artboard.' },
        overwrite: { type: 'boolean', description: 'save: replace an existing file.' },
        discardUnsaved: { type: 'boolean', description: 'close: required to close with unsaved changes.' },
      },
      required: ['command'],
    },
  },
  {
    name: 'ai_create',
    description:
      'Create one item and get its uuid back. ' + COORDS + '\n\n' +
      'Kinds:\n' +
      '- rect: x, y, width, height, optional cornerRadius. ellipse: x, y, width, height.\n' +
      '- polygon: centerX, centerY, radius, sides. star: centerX, centerY, radius, innerRadius, points.\n' +
      '- line: points [[x1,y1],[x2,y2]]; stroked black 1pt unless you say otherwise, never filled.\n' +
      '- path: points, 2 or more. Each is [x,y] for a corner, or {anchor:[x,y], left:[x,y], right:[x,y]} ' +
      'with bezier handles in the same space. closed defaults to true.\n' +
      '- text: POINT text - one line per paragraph, never wraps. x,y is the top-left of the text box, not ' +
      'the baseline.\n' +
      '- areaText: text that wraps inside x, y, width, height. If it does not fit, the rest is hidden, not ' +
      'shrunk - check ai_query item text.overflows, or ai_diagnostics.\n' +
      '- image: place a file (png, jpg, psd, tif, svg, pdf, ai) from an absolute path. Give width AND height ' +
      'to fit it inside that box, proportions kept and centred - how a logo drops into a slot; give one to ' +
      'scale to it; neither keeps the file\'s size. keepRatio:false stretches. Embedded by default so the ' +
      'document does not depend on a path on this machine; embed:false links instead. Fill and stroke do ' +
      'not apply.\n\n' +
      'Fill defaults to black and stroke to none - explicit, never inherited from the user\'s toolbar. ' +
      COLOR_DOC + '\n\n' +
      'It goes on the active layer unless you pass layer, or groupUuid to put it inside a group. A locked or ' +
      'hidden layer is refused with a message naming it.',
    inputSchema: {
      type: 'object',
      properties: {
        kind: { type: 'string', enum: ['rect', 'ellipse', 'polygon', 'star', 'line', 'path', 'text', 'areaText', 'image'] },
        path: { type: 'string', description: 'image: absolute path to the file to place.' },
        embed: { type: 'boolean', description: 'image: embed (default true) or link.' },
        keepRatio: { type: 'boolean', description: 'image: false stretches to width x height.' },
        artboard: { type: 'number' },
        x: { type: 'number' }, y: { type: 'number' },
        width: { type: 'number' }, height: { type: 'number' },
        cornerRadius: { type: 'number' },
        centerX: { type: 'number' }, centerY: { type: 'number' },
        radius: { type: 'number' }, innerRadius: { type: 'number' },
        sides: { type: 'number' }, points: { description: 'star: number of points (a number). line/path: the point list.' },
        closed: { type: 'boolean' },
        contents: { type: 'string', description: 'text/areaText. "\\r" starts a new paragraph.' },
        name: { type: 'string' },
        layer: layerSchema,
        groupUuid: uuidSchema,
        ...STYLE_PROPS,
      },
      required: ['kind'],
    },
  },
  {
    name: 'ai_set',
    description:
      'Change existing items. Batch-shaped: pass every change in ONE call - each call is a round trip into ' +
      'Illustrator, and the whole batch is one undo step.\n\n' +
      'Each write is {uuid, ...properties}. The order they are applied in is fixed so you cannot get it ' +
      'wrong: unlock/show, name, text contents, style, path points, size, rotation, position, then lock/hide.\n\n' +
      '- x, y: move the top-left of the geometric box there. ' + COORDS + '\n' +
      '- moveBy: [dx, dy] relative, y down.\n' +
      '- width, height: resize from the top-left. keepRatio:true derives the missing one. Stroke weight is ' +
      'kept unless scaleStrokes:true.\n' +
      '- rotateBy: degrees, about the centre, counter-clockwise. Illustrator does not keep an absolute ' +
      'rotation, so there is no "set rotation to" - read the box instead.\n' +
      '- points / closed: replace a path\'s points, same forms as ai_create path.\n' +
      '- contents and the text style properties apply to text frames. Point text keeps its top-left when ' +
      'its contents, size or justification change - Illustrator itself re-anchors it around the baseline, ' +
      'which moved a centred line 113pt.\n' +
      '- fill/stroke on a group or compound path paint every path inside it.\n' +
      '- hidden, locked, name, opacity, blendMode.\n\n' +
      COLOR_DOC + '\n\n' +
      'A locked item refuses changes unless the same write has locked:false. Partial success is normal: the ' +
      'response lists applied items with their new box, and errors with codes (unknown_uuid, locked, ' +
      'type_mismatch, bad_value, failed).',
    inputSchema: {
      type: 'object',
      properties: {
        writes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              uuid: uuidSchema,
              artboard: { type: 'number', description: 'Measure x,y against this artboard. Default: the one the item is on.' },
              x: { type: 'number' }, y: { type: 'number' },
              moveBy: { type: 'array', items: { type: 'number' } },
              width: { type: 'number' }, height: { type: 'number' },
              keepRatio: { type: 'boolean' }, scaleStrokes: { type: 'boolean' },
              rotateBy: { type: 'number' },
              points: { type: 'array' }, closed: { type: 'boolean' },
              contents: { type: 'string' },
              name: { type: 'string' }, hidden: { type: 'boolean' }, locked: { type: 'boolean' },
              ...STYLE_PROPS,
            },
            required: ['uuid'],
          },
        },
      },
      required: ['writes'],
    },
  },
  {
    name: 'ai_items',
    description:
      'Structure: delete, duplicate, group, clip, ungroup, move to a layer, stacking order, selection.\n\n' +
      '- group: the new group sits where the topmost member was, members keep their stacking order. ' +
      'Returns the group\'s uuid.\n' +
      '- clip: a clipping mask. The FIRST uuid is the mask shape (a path or compound path); the rest are ' +
      'clipped to it. This is how artwork is cropped to a shape without editing it.\n' +
      '- ungroup: releases the children in their stacking order and returns their uuids.\n' +
      '- duplicate: offset [dx, dy] in points, y down.\n' +
      '- arrange: bringToFront, bringForward, sendBackward, sendToBack - within the item\'s own layer or group.\n' +
      '- select: replace the user\'s selection with these uuids ([] clears it) - useful for handing ' +
      'something back to a human to look at.\n' +
      '- outlineText: convert a text frame to outlines. Irreversible except by undo; returns the new group.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['delete', 'duplicate', 'group', 'clip', 'ungroup', 'moveToLayer', 'arrange', 'select', 'outlineText'] },
        uuid: uuidSchema,
        uuids: uuidsSchema,
        name: { type: 'string' },
        offset: { type: 'array', items: { type: 'number' } },
        layer: layerSchema,
        order: { type: 'string', enum: ['bringToFront', 'bringForward', 'sendBackward', 'sendToBack'] },
      },
      required: ['command'],
    },
  },
  {
    name: 'ai_layers',
    description:
      'Layers, addressed by name path (["Layer 1"], or ["Parent", "Child"] for a sublayer). Two layers with ' +
      'the same name at the same level are an error rather than a guess - rename one.\n\n' +
      'create (parent for a sublayer), rename, setVisible, setLocked, setActive (where ai_create puts new ' +
      'items by default), arrange, delete. delete refuses a layer that still holds artwork - its sublayers included - ' +
      'unless deleteContents:true.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['create', 'rename', 'delete', 'setVisible', 'setLocked', 'setActive', 'arrange'] },
        layer: layerSchema,
        parent: layerSchema,
        name: { type: 'string' },
        visible: { type: 'boolean' },
        locked: { type: 'boolean' },
        order: { type: 'string', enum: ['bringToFront', 'bringForward', 'sendBackward', 'sendToBack'] },
        deleteContents: { type: 'boolean' },
      },
      required: ['command'],
    },
  },
  {
    name: 'ai_layout',
    description:
      'Align, distribute and stack. Illustrator\'s Align panel is not reachable from scripting, so these do ' +
      'the arithmetic. They measure geometric bounds, like the Align panel with Use Preview Bounds off; ' +
      'bounds:"visible" includes stroke width instead.\n\n' +
      '- align: edge left, centerX, right, top, centerY, bottom, or center (both). relativeTo "selection" ' +
      '(the items\' combined box - default for 2+ items), "artboard" (default for one item), or a key ' +
      'item\'s uuid, which stays put.\n' +
      '- distribute: by "gaps" (equal space between boxes - usually what "evenly spaced" means) or ' +
      '"centers". The two outermost stay put, unless gap is given: then the first stays and the rest follow ' +
      'at exactly that gap.\n' +
      '- stack: row, column or grid in the order given, from x,y (artboard space) or where the first item ' +
      'is. Grid cells are the size of the largest item.\n\n' +
      'Each returns every item\'s new box, so there is no need to re-query.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['align', 'distribute', 'stack'] },
        uuids: uuidsSchema,
        edge: { type: 'string', enum: ['left', 'centerX', 'right', 'top', 'centerY', 'bottom', 'center'] },
        relativeTo: { type: 'string', description: '"selection", "artboard", or a key item uuid.' },
        artboard: { type: 'number' },
        axis: { type: 'string', enum: ['horizontal', 'vertical'] },
        by: { type: 'string', enum: ['gaps', 'centers'] },
        gap: { type: 'number' },
        gapY: { type: 'number', description: 'stack column/grid: vertical gap if different.' },
        direction: { type: 'string', enum: ['row', 'column', 'grid'] },
        columns: { type: 'number' },
        x: { type: 'number' }, y: { type: 'number' },
        bounds: { type: 'string', enum: ['geometric', 'visible'] },
      },
      required: ['command', 'uuids'],
    },
  },
  {
    name: 'ai_capture',
    description:
      'LOOK at what is actually drawn, rather than inferring it from the object tree. Returns a real image.\n\n' +
      '- artboard: one artboard. longEdge defaults to 768px - enough to judge layout, alignment and colour. ' +
      'Ask for more only to read small type; cost scales with image area.\n' +
      '- artboards: several artboards (all by default) on ONE labelled contact sheet - the way to review a ' +
      'set of sizes together for a fraction of the context of separate images. longEdge is per cell, ' +
      'default 320.\n' +
      '- region: x, y, width, height in artboard space - for looking closely at one part.\n' +
      '- item: one item cropped to its visible bounds plus padding. isolated (default true) hides everything ' +
      'else for the capture, which separates "drawn but covered by something" from "not drawn at all". Locked ' +
      'art is unlocked, hidden and relocked; a hidden target or group around it is shown for the shot. Anything ' +
      'that still could not be hidden is listed in couldNotHide, and isolated is then false. Every state is ' +
      'restored exactly.\n\n' +
      'Captures render on mid grey by default, so transparent areas are not mistaken for a white fill. ' +
      'background:"white" shows it as the artboard looks on screen.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['artboard', 'artboards', 'region', 'item'] },
        artboard: { type: 'number' },
        artboards: { type: 'array', items: { type: 'number' }, description: 'artboards: indices. Default all.' },
        uuid: uuidSchema,
        x: { type: 'number' }, y: { type: 'number' },
        width: { type: 'number' }, height: { type: 'number' },
        padding: { type: 'number', description: 'item: points around the item. Default 8.' },
        isolated: { type: 'boolean' },
        longEdge: { type: 'number' },
        columns: { type: 'number', description: 'artboards: sheet columns.' },
        background: { type: 'string', enum: ['grey', 'white', 'transparent'] },
      },
      required: ['command'],
    },
  },
  {
    name: 'ai_export',
    description:
      'Write a deliverable file from one artboard: png, jpg or svg, chosen by the path\'s extension. ' +
      'ai_capture is for looking; this is for output.\n\n' +
      'path must be absolute and is exactly the file you get (Illustrator renames exports itself; this does ' +
      'not); missing folders are created; an existing file is never replaced without overwrite:true. scale is a percentage for png/jpg (200 = 2x). png is transparent unless ' +
      'transparent:false. svg references fonts by name unless outlineText:true.\n\n' +
      'The open document is left pointing at its own file. Illustrator\'s plain SVG export re-points the ' +
      'document at the .svg and marks it saved, so SVG goes through Export for Screens instead. PDF is not ' +
      'offered for the same reason: scripting can only produce one by re-pointing the document.',
    inputSchema: {
      type: 'object',
      properties: {
        path: { type: 'string' },
        format: { type: 'string', enum: ['png', 'jpg', 'svg'], description: 'Default: from the extension.' },
        artboard: { type: 'number' },
        scale: { type: 'number' },
        quality: { type: 'number', description: 'jpg: 0-100. Default 85.' },
        transparent: { type: 'boolean' },
        outlineText: { type: 'boolean' },
        overwrite: { type: 'boolean' },
      },
      required: ['path'],
    },
  },
  {
    name: 'ai_diagnostics',
    description:
      'What is wrong with this document: linked images whose files are missing, area text that overflows ' +
      'its frame (the hidden text is invisible in a capture), top-level artwork sitting off every artboard, ' +
      'empty text frames, and stray single-point paths. Run it before handing a file off.\n\n' +
      'reloadHost re-reads the ExtendScript host from disk - CEP loads it once per start, so host edits are ' +
      'otherwise invisible until Illustrator restarts.',
    inputSchema: {
      type: 'object',
      properties: {
        command: { type: 'string', enum: ['problems', 'reloadHost'], description: 'Default problems.' },
        limit: { type: 'number', description: 'Cap per category. Default 50.' },
      },
    },
  },
];

/*
 * Every tool takes an optional document name. Uuids are per-document integers,
 * so a write aimed at one document can land on an unrelated item in another
 * if the user switched in between; passing the name makes that an error.
 */
for (const t of TOOLS) {
  t.inputSchema.properties.document = {
    type: 'string',
    description: 'Optional: the document name from sessionInfo. The call is refused if a different document is ' +
      'active - uuids are per document, so this stops a write landing in the wrong file. Every result reports ' +
      'the document it ran in.',
  };
}

const BACKGROUNDS = { grey: '#4a4a4a', white: '#ffffff' };

/**
 * @param {(op:string,args:object,timeoutMs?:number)=>Promise<object>} callHost
 */
function createToolRegistry(callHost) {
  // Exports of a large document can take many seconds; so can a sheet of
  // dozens of artboards.
  const LONG_OPS = { exportFile: 5 * 60 * 1000, captureArtboard: 2 * 60 * 1000 };

  async function host(op, args) {
    const res = await callHost(op, args, LONG_OPS[op]);
    if (!res.ok) {
      const e = res.error || {};
      throw new Error(`${e.code || 'error'}: ${e.message || 'unknown host failure'}`);
    }
    return res.result;
  }

  function renderOpts(args, defaultEdge) {
    const bg = args.background === 'transparent' ? null : (BACKGROUNDS[args.background] || BACKGROUNDS.grey);
    return { background: bg, maxEdge: args.longEdge || defaultEdge };
  }

  async function capture(args) {
    const command = args.command;
    const stamp = Date.now();

    if (command === 'artboards') {
      const session = await host('sessionInfo', { document: args.document });
      if (!session.active) throw new Error('No document is open');
      const all = session.active.artboards.map((a) => a.index);
      const wanted = Array.isArray(args.artboards) && args.artboards.length ? args.artboards : all;
      const shots = [];
      const errors = [];
      for (const index of wanted) {
        try {
          const s = await host('captureArtboard', { artboard: index, longEdge: args.longEdge || 320, fileName: `ab${stamp}_${index}.png`, document: args.document });
          shots.push({ path: s.path, label: `${index}  ${s.artboardName}`, meta: s });
        } catch (err) {
          errors.push({ artboard: index, message: String(err.message || err) });
        }
      }
      if (!shots.length) throw new Error(`No artboards captured: ${JSON.stringify(errors)}`);
      try {
        const sheet = await buildContactSheet(shots, { columns: args.columns, maxEdge: args.longEdge || 320 });
        return {
          content: [
            { type: 'image', data: sheet.base64, mimeType: 'image/png' },
            { type: 'text', text: JSON.stringify({
              artboards: shots.map((s) => ({ index: s.meta.artboard, name: s.meta.artboardName })),
              sheet: { width: sheet.width, height: sheet.height, columns: sheet.columns, rows: sheet.rows },
              errors }, null, 2) },
          ],
        };
      } finally {
        shots.forEach((s) => { try { fs.unlinkSync(s.path); } catch (e) {} });
      }
    }

    const ops = { artboard: 'captureArtboard', region: 'captureRegion', item: 'captureItem' };
    const op = ops[command];
    if (!op) throw new Error(`Unknown capture command ${command}. Known: artboard, artboards, region, item`);
    const defaultEdge = command === 'item' ? 512 : 768;
    const shot = await host(op, { ...args, longEdge: args.longEdge || defaultEdge, fileName: `cap${stamp}.png` });
    try {
      const img = await renderCapture(shot.path, renderOpts(args, defaultEdge));
      const { path, fileName, ...meta } = shot;
      // Report the size of the image actually returned, not the render.
      if (img.width) { meta.width = img.width; meta.height = img.height; }
      return {
        content: [
          { type: 'image', data: img.base64, mimeType: 'image/png' },
          { type: 'text', text: JSON.stringify(meta, null, 2) },
        ],
      };
    } finally {
      try { fs.unlinkSync(shot.path); } catch (e) {}
    }
  }

  // ai_query commands are host ops of the same name. Listed explicitly so a
  // command name can never reach a mutating op through the read-only tool.
  const QUERY_OPS = { sessionInfo: 1, tree: 1, find: 1, item: 1, selection: 1, fonts: 1, swatches: 1 };

  const handlers = {
    ai_query: async (a) => {
      // The live schema, from this server. A client that cached tool
      // definitions at session start can still find new commands and args.
      if (a.command === 'describe') {
        if (!a.tool) return textContent({ tools: TOOLS.map((t) => t.name), bridge: bridgeInfo() });
        const def = TOOLS.find((t) => t.name === a.tool);
        if (!def) return errorContent(`No tool named ${a.tool}. Known: ${TOOLS.map((t) => t.name).join(', ')}`);
        return textContent({ ...def, bridge: bridgeInfo() });
      }
      if (!QUERY_OPS[a.command]) return errorContent(`Unknown ai_query command ${a.command}`);
      const out = await host(a.command, a);
      // Lets a client notice a stale tool list: compare this with what it expects.
      if (a.command === 'sessionInfo' && out && typeof out === 'object') out.bridge = bridgeInfo();
      return textContent(out);
    },
    ai_document: (a) => host('document', a).then(textContent),
    ai_create: (a) => host('create', a).then(textContent),
    ai_set: (a) => host('set', a).then(textContent),
    ai_items: (a) => host('items', a).then(textContent),
    ai_layers: (a) => host('layers', a).then(textContent),
    ai_layout: (a) => {
      if (!['align', 'distribute', 'stack'].includes(a.command)) return errorContent(`Unknown ai_layout command ${a.command}`);
      return host(a.command, a).then(textContent);
    },
    ai_capture: capture,
    ai_export: (a) => host('exportFile', a).then(textContent),
    ai_diagnostics: async (a) => {
      if (a.command !== 'reloadHost') return textContent(await host('problems', a));
      // Report a reload only if the host's load stamp actually changed.
      const before = await host('hostInfo', {});
      const after = await host('reloadHost', { hostPath: HOST_JSX });
      const reloaded = !after.reloadError && after.loadedAt !== before.loadedAt;
      return textContent({
        reloaded,
        file: HOST_JSX,
        loadedAt: after.loadedAt,
        previousLoadedAt: before.loadedAt,
        opCount: after.opCount,
        error: after.reloadError || (reloaded ? null : 'the host was not re-evaluated - restart Illustrator'),
      });
    },
  };

  return {
    tools: TOOLS,
    async callTool(name, args) {
      const handler = handlers[name];
      if (!handler) return errorContent(`Unknown tool: ${name}`);
      try {
        return await handler(args || {});
      } catch (err) {
        return errorContent(String((err && err.message) || err));
      }
    },
  };
}

module.exports = { createToolRegistry, TOOLS };
