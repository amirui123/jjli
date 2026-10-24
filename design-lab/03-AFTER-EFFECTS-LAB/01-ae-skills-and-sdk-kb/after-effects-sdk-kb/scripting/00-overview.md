---
source: https://ae-scripting.docsforadobe.dev/
scraped: 2026-04-19
api_provider: Adobe
coverage: AE 9.0–26.0 (January 2026)
tags: [after-effects, extendscript, scripting, javascript, sdk, reference]
created: 2026-04-19
created-by: agent
created-session: 2026-04-19
---

# Adobe After Effects ExtendScript — Navigator Overview

ExtendScript is Adobe's scripting layer for After Effects. It is a dialect of ECMA-262 3rd Edition (ES3) JavaScript, extended with Adobe-specific host objects and interprocess communication bindings. Scripts use the `.jsx` extension and run inside a sandboxed interpreter embedded in the application — no Node, no browser APIs, no ES6+ syntax unless polyfilled manually. The complete API reference lives at [`01-extendscript-complete-reference.md`](01-extendscript-complete-reference.md).

---

## What ExtendScript Is (and Is Not)

**Is:** A scripting language that talks directly to the AE object model. You can create compositions, import footage, add layers, keyframe properties, trigger renders, read and write metadata, query font information, and control most of the application UI — all from a `.jsx` file running inside AE.

**Is not:** A plugin. Scripts cannot add custom effects to the render pipeline, expose new UI panels via native widgets, or call platform system libraries. For those capabilities you need either the C++ SDK (via AEGPs/AEPX plugins) or UXP.

---

## When to Use ExtendScript vs C++ SDK vs UXP

| Need | Tool |
|------|------|
| Automate repetitive AE workflows | ExtendScript |
| Batch-process compositions, set up render queues | ExtendScript |
| Read/write layer properties, keyframes, text, masks | ExtendScript |
| Build dockable UI panels inside AE | ExtendScript (ScriptUI) |
| Add custom video/audio effects to the render pipeline | C++ SDK (AEGP/AEIO/Artisan) |
| Access GPU, raw frame buffers, codec integration | C++ SDK |
| Modern HTML/CSS/React panels with persistent storage | UXP (After Effects 23.0+) |
| Cross-app panels shared with Premiere Pro / Photoshop | UXP |
| Distribute through Adobe Exchange marketplace | UXP (preferred post-2023) |

**Rule of thumb:** If it is something a user could do manually in the AE UI and you want to automate it in bulk, ExtendScript is the right tool. If you need to hook into the render engine or build a production-grade installable plugin, use the C++ SDK. If you are building a modern panel with a web-tech frontend and want Adobe marketplace distribution, use UXP.

---

## How to Run Scripts

### Ad-hoc execution

`File > Scripts > Run Script File…` opens a file picker. Select any `.jsx` file. The script runs immediately in the main thread — AE is blocked until it completes.

### Script menu items

Place `.jsx` files in:

```
macOS: /Applications/Adobe After Effects <version>/Scripts/ScriptUI Panels/
Windows: C:\Program Files\Adobe\Adobe After Effects <version>\Support Files\Scripts\ScriptUI Panels\
```

Scripts in **ScriptUI Panels** appear under `Window` and can be docked as panels. Scripts placed directly in the **Scripts** folder appear under `File > Scripts` as menu items.

### Auto-run on startup

Place a `.jsx` file named `AEScriptsAndPresetsStartup.jsx` (or any file) in:

```
macOS: ~/Library/Application Support/Adobe/After Effects/<version>/Scripts/Startup/
```

AE runs all `.jsx` files in the Startup folder on launch.

### From the command line

```bash
afterfx -r /path/to/script.jsx
afterfx -s "app.project.activeItem.name"   # inline script string
```

### Enabling `Write` access

By default scripts can read but cannot write files or access the network. Enable write access at:

`After Effects > Preferences > Scripting & Expressions > Allow Scripts to Write Files and Access Network`

This is required for any script that calls `system.callSystem()`, writes via `File` objects, or uses `socket`.

---

## The Global Entry Point

Every script starts with the global `app` object:

```javascript
var proj = app.project;                          // Project object
var comp = proj.activeItem;                      // Active CompItem (or null)
var layer = comp.layers.byName("Background");    // Layer by name
var opacity = layer.property("Opacity");         // PropertyBase
opacity.setValueAtTime(0, 0);
opacity.setValueAtTime(1, 100);
```

The full object hierarchy: `app` → `project` → `items[]` → `layers[]` → `properties[]`.

---

## Debugger Setup

**ExtendScript Toolkit (ESTK) is deprecated.** Adobe discontinued ESTK in 2022. It no longer ships with Creative Cloud apps and should not be used for new development.

**Current approach: VS Code + ExtendScript Debugger extension**

1. Install the [ExtendScript Debugger](https://marketplace.visualstudio.com/items?itemName=Adobe.extendscript-debug) extension from Adobe in VS Code.
2. Open your `.jsx` project folder in VS Code.
3. Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "extendscript-debug",
      "request": "launch",
      "name": "Run in After Effects",
      "program": "${file}",
      "hostAppSpecifier": "aftereffects"
    }
  ]
}
```

4. Press `F5` with a `.jsx` file open. The extension injects the script into the running AE instance and maps breakpoints, the call stack, and variable inspection back into VS Code.

**`$.writeln()` for quick logging:**

```javascript
$.writeln("Layer count: " + comp.numLayers);
// Output appears in VS Code Debug Console
```

---

## Key AE 26.0 Additions (January 2026)

Three new API surfaces added in AE 26.0:

| Addition | Object | Description |
|----------|--------|-------------|
| `addVariableFontAxis(axisName)` | `PropertyGroup` | Adds a variable font axis animator to a text animator's properties group. Returns the new `Property`. |
| `propertyParameters` | `Property` | Read-only. Returns the options array for a Dropdown Menu Control effect property. |
| `valueText` | `Property` | Read-only. Returns the currently selected item label string for a Dropdown Menu Control property. |

---

## Related Files in This Vault

| File | Contents |
|------|----------|
| [`01-extendscript-complete-reference.md`](01-extendscript-complete-reference.md) | Full API reference — all objects, methods, properties, code examples, match names, changelog |
| [`../../final/MASTER-AE-SDK-REFERENCE.md`](../../final/MASTER-AE-SDK-REFERENCE.md) | C++ SDK reference (AEGPs, AEIO, Artisan, PF_Suite) |
| [`../../SOURCES.md`](../../SOURCES.md) | Source registry and scraping session log |
