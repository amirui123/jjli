---
source: 'https://ae-scripting.docsforadobe.dev/'
scraped: '2026-04-19'
api_provider: 'Adobe After Effects ExtendScript'
coverage: 'AE 26.0 (January 2026)'
tags: [type/reference, topic/after-effects, topic/extendscript, topic/scripting]
created: 2026-04-19
created-by: agent
created-session: 2026-04-19
---

# Adobe After Effects ExtendScript API — Complete Reference

Adobe ExtendScript is an extended variant of JavaScript (ECMA-262 3rd Edition) used to automate and control After Effects from scripts. Unlike the C++ SDK (which creates compiled plugins), ExtendScript scripts run directly inside AE without compilation — via File > Scripts, ScriptUI panels, or command-line invocation. This document covers all scripting objects available through AE 26.0 (January 2026).

---

## Table of Contents

1. [Introduction & Overview](#introduction--overview)
2. [General — Globals, Application, Project, System](#general)
3. [Items — Item, ItemCollection, AVItem, CompItem, FolderItem, FootageItem](#items)
4. [Layers — Layer, LayerCollection, AVLayer, CameraLayer, LightLayer, ShapeLayer, TextLayer, ThreeDModelLayer](#layers)
5. [Properties — PropertyBase, Property, PropertyGroup, MaskPropertyGroup](#properties)
6. [Render Queue — RenderQueue, RQItemCollection, RenderQueueItem, OMCollection, OutputModule](#render-queue)
7. [Sources — FootageSource, FileSource, SolidSource, PlaceholderSource](#sources)
8. [Text — TextDocument, FontObject, FontsObject, CharacterRange, ParagraphRange, ComposedLineRange](#text)
9. [Other — Collection, ImportOptions, KeyframeEase, MarkerValue, Shape, View, Viewer, ViewOptions, Preferences, Settings](#other)
10. [Match Names Reference](#match-names-reference)
11. [Changelog](#changelog)

---

## Introduction & Overview

### What is ExtendScript?

ExtendScript is Adobe's extended JavaScript variant for scripting creative applications. After Effects uses it to expose its object model for automation — compositions, layers, properties, the render queue, and more. Scripts use the `.jsx` extension (binary `.jsxbin` also supported).

The object model mirrors the UI hierarchy: `app` → `project` → `items` → `layers` → `properties`.

**Key distinction:** "expressions" describe _what_ a property value is; scripts _direct_ the application to perform actions.

### Running Scripts

| Method | Details |
|--------|---------|
| File > Scripts menu | Scripts in the Scripts folder load at startup |
| File > Scripts > Run Script File | Run an unloaded script |
| Command line (Windows) | `afterfx.exe -r script.jsx` or `afterfx.exe -s "alert('hello')"` |
| AppleScript (Mac) | `tell application "Adobe After Effects" DoScript "..."` |
| Startup/Shutdown folders | Auto-run alphabetically on launch/quit |
| ScriptUI Panels folder | Appear in Window menu as dockable panels |

### ScriptUI Panel Pattern

```javascript
// Supports both Window and Panel (dockable) contexts
var myPanel = (thisObj instanceof Panel) ? thisObj : new Window("palette", "My Tools", [100, 100, 300, 300]);
myPanel.add("button", [10, 10, 100, 30], "Tool #1");
```

### Activating Full Features

Enable file/network access: Edit > Preferences > General > "Allow Scripts To Write Files And Access Network".

---

## General

### Global Functions

| Function | Added | Description |
|----------|-------|-------------|
| `clearOutput()` | — | Removes text from the Info panel |
| `currentFormatToTime(formattedTime, fps, isDuration)` | — | Converts frame-time string to seconds |
| `generateRandomNumber()` | AE 13.6 | Thread-safe pseudo-random value 0–1 (prefer over `Math.random()`) |
| `getEnumAsString(enumValue)` | AE 24.0 | Returns string representation of an enum |
| `isValid(obj)` | — | Tests whether an AE object still exists |
| `timeToCurrentFormat(time, fps, isDuration)` | — | Converts seconds to formatted frame-time string |
| `write(text)` | — | Outputs text to Info panel without line termination |
| `writeLn(text)` | — | Outputs text to Info panel with line termination |

---

### Application Object (`app`)

The single global object providing access to all After Effects functionality.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `activeViewer` | Viewer or null | AE 11.0 | Currently focused viewer panel |
| `availableGPUAccelTypes` | Array of GpuAccelType | AE 14.0 | Available GPU acceleration options (CUDA, Metal, OPENCL, SOFTWARE) |
| `buildName` | String | — | Internal build name |
| `buildNumber` | Integer | — | Internal build number |
| `disableRendering` | Boolean | AE 16.0 | Set `true` to disable rendering (like Caps Lock) |
| `effects` | Array | — | Available effects; each has `displayName`, `category`, `matchName`, `version` |
| `exitAfterLaunchAndEval` | Boolean | — | Exit after command-line script (Windows only) |
| `exitCode` | Integer | — | Numeric status code for external scripts; set positive integer to indicate error |
| `fonts` | Fonts object | AE 24.0 | Access all system fonts |
| `isoLanguage` | String | AE 9.0 | Locale string (e.g., `en_US`, `de_DE`, `ja_JP`) |
| `isRenderEngine` | Boolean | — | True if running as render engine |
| `isWatchFolder` | Boolean | — | True if Watch Folder dialog is active |
| `memoryInUse` | Number | — | Bytes of memory in use |
| `onError` | Function name or null | — | Callback invoked on errors; receives error string and severity |
| `preferences` | Preferences object | — | AE application preferences |
| `project` | Project object | — | Currently loaded project |
| `saveProjectOnCrash` | Boolean | — | Whether to prompt save on unexpected quit |
| `settings` | Settings object | — | Currently loaded script settings |
| `version` | String | AE 12.0 | After Effects version string |

#### Methods

**`app.activate()`**
Opens and brings the application to the front.
- Returns: Nothing

**`app.beginSuppressDialogs()`**
Begins suppression of error dialog boxes. Pair with `endSuppressDialogs()`.
- Returns: Nothing

**`app.beginUndoGroup(undoString)`**
Marks start of an undoable action group.

| Parameter | Type | Description |
|-----------|------|-------------|
| `undoString` | String | Text shown in Edit > Undo menu |

- Returns: Nothing

**`app.cancelTask(taskID)`**
Removes a scheduled task.

| Parameter | Type | Description |
|-----------|------|-------------|
| `taskID` | Integer | ID from `scheduleTask()` |

- Returns: Nothing

**`app.endSuppressDialogs(alert)`**

| Parameter | Type | Description |
|-----------|------|-------------|
| `alert` | Boolean | Show errors that occurred during suppression |

- Returns: Nothing

**`app.endUndoGroup()`**
Closes the undo group. Automatic at script end.
- Returns: Nothing

**`app.endWatchFolder()`**
Ends Watch Folder mode.
- Returns: Nothing

**`app.executeCommand(id)`**
Executes a menu command by ID number.

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | Integer | Menu command ID |

```javascript
app.executeCommand(4162); // Convert to Bezier Path
```

**`app.findMenuCommandId(command)`**
Returns the ID for a menu command text.

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | String | Exact menu text as shown in UI |

- Returns: Integer

**`app.newProject()`**
Creates a new project (prompts to save if current project has edits).
- Returns: Project object or `null`

```javascript
app.project.close(CloseOptions.DO_NOT_SAVE_CHANGES);
app.newProject();
```

**`app.open([file])`**
Opens a project.

| Parameter | Type | Description |
|-----------|------|-------------|
| `file` | File (optional) | Project file; prompts user if omitted |

- Returns: Project object or `null`

**`app.openFast(file)`** *(Undocumented — use with caution)*
Opens a project faster by skipping validation checks.
- Returns: Project object

**`app.parseSwatchFile(file)`**
Loads color swatch data from an ASE file.
- Returns: Swatch data object with `majorVersion`, `minorVersion`, `values` array

**`app.pauseWatchFolder(pause)`**
Pauses or resumes Watch Folder monitoring.

| Parameter | Type | Description |
|-----------|------|-------------|
| `pause` | Boolean | `true` to pause |

**`app.purge(target)`**
Purges unused data. Updated in AE 24.3: `ALL_CACHES` now also clears disk cache; `ALL_MEMORY_CACHES` clears RAM only.

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | PurgeTarget | `ALL_CACHES`, `ALL_MEMORY_CACHES` (24.3+), `UNDO_CACHES`, `SNAPSHOT_CACHES`, `IMAGE_CACHES` |

**`app.quit()`** — Quits After Effects.

**`app.restart()`** *(Added AE 25.4)* — Restarts After Effects.

**`app.scheduleTask(stringToExecute, delay, repeat)`**
Schedules JavaScript for delayed execution.

| Parameter | Type | Description |
|-----------|------|-------------|
| `stringToExecute` | String | JavaScript to execute |
| `delay` | Float | Milliseconds to wait |
| `repeat` | Boolean | `true` for repeated execution |

- Returns: Integer (task ID)

**`app.setMemoryUsageLimits(imageCachePercentage, maximumMemoryPercentage)`**
Sets memory usage limits.

**`app.setMultiFrameRenderingConfig(mfr_on, max_cpu_perc)`** *(Added AE 22.0)*
Sets Multi-Frame Rendering configuration for next render.

| Parameter | Type | Description |
|-----------|------|-------------|
| `mfr_on` | Boolean | Enable Multi-Frame Rendering |
| `max_cpu_perc` | Float [1..100] | Max CPU percentage; pass 100 if disabled |

**`app.setSavePreferencesOnQuit(doSave)`**
Sets whether preferences save on quit.

**`app.watchFolder(folder_object_to_watch)`**
Starts Watch Folder monitoring.

```javascript
var theFolder = new Folder("c:/renders");
app.watchFolder(theFolder);
```

---

### Project Object (`app.project`)

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `activeItem` | Item or null | — | Currently active item |
| `bitsPerChannel` | Integer (8/16/32) | — | Project color depth |
| `compensateForSceneReferredProfiles` | Boolean | AE 16.0 | Scene-referred profiles compensation |
| `dirty` | Boolean | AE 17.5 | True if project modified since last save |
| `displayStartFrame` | Integer (0 or 1) | — | Frame Count display start |
| `expressionEngine` | String | AE 16.0 | `"extendscript"` or `"javascript-1.0"` |
| `feetFramesFilmType` | FeetFramesFilmType | — | `MM16` or `MM35` |
| `file` | File or null | — | Project file |
| `footageTimecodeDisplayStartType` | FootageTimecodeDisplayStartType | — | `FTCS_START_0` or `FTCS_USE_SOURCE_MEDIA` |
| `framesCountType` | FramesCountType | — | `FC_START_1`, `FC_START_0`, `FC_TIMECODE_CONVERSION` |
| `framesUseFeetFrames` | Boolean | — | Feet+Frames vs Frames display |
| `gpuAccelType` | GpuAccelType | AE 13.8 | CUDA, Metal, OPENCL, SOFTWARE |
| `items` | ItemCollection | — | All project items |
| `linearBlending` | Boolean | — | Linear blending enabled |
| `linearizeWorkingSpace` | Boolean | AE 16.0 | Linearize Working Space enabled |
| `numItems` | Integer | — | Total item count |
| `renderQueue` | RenderQueue | — | Project render queue |
| `revision` | Integer | — | Project revision number |
| `rootFolder` | FolderItem | — | Root project folder |
| `selection` | Array of Item | — | Selected items in Project panel |
| `timeDisplayType` | TimeDisplayType | — | `FRAMES` or `TIMECODE` |
| `toolType` | ToolType | AE 14.0 | Currently active tool |
| `transparencyGridThumbnails` | Boolean | — | Transparency checkerboard in thumbnails |
| `usedFonts` | Array of Objects | AE 24.5 | Fonts used in project with layer references |
| `workingGamma` | 2.2 or 2.4 | — | Working gamma (ignored if color space set) |
| `workingSpace` | String | AE 16.0 | Color profile description |
| `xmpPacket` | String | AE 9.0 | Project XMP metadata (RDF/XML) |

#### Methods

**`project.autoFixExpressions(oldText, newText)`**
Replaces text in broken expressions.

**`project.close(closeOptions)`**
Closes the project. `closeOptions`: `DO_NOT_SAVE_CHANGES`, `PROMPT_TO_SAVE_CHANGES`, `SAVE_CHANGES`.
- Returns: Boolean

**`project.consolidateFootage()`**
Consolidates all footage (File > Consolidate All Footage).
- Returns: Integer (number removed)

**`project.importFile(importOptions)`**
Imports a file.

```javascript
app.project.importFile(new ImportOptions(new File("sample.psd")));
```

- Returns: FootageItem

**`project.importFileWithDialog()`**
Shows Import File dialog.
- Returns: Array of Item objects or `null`

**`project.importPlaceholder(name, width, height, frameRate, duration)`**
Creates a PlaceholderItem.
- Returns: PlaceholderItem

**`project.item(index)`** — Returns Item at index (1-based).

**`project.itemByID(id)`** *(Added AE 13.0)* — Returns Item by ID.

**`project.layerByID(id)`** *(Added AE 22.0)* — Returns Layer by ID.

```javascript
var firstLayer = app.project.item(1).layer(1);
var id = firstLayer.id;
if (app.project.layerByID(id) === firstLayer) alert("Got layer by ID!");
```

**`project.listColorProfiles()`**
- Returns: Array of color profile description strings

**`project.reduceProject(array_of_items)`**
Removes all items except specified ones.
- Returns: Integer (number removed)

**`project.removeUnusedFootage()`**
- Returns: Integer (number removed)

**`project.replaceFont(fromFont, toFont, [noFontLocking])`** *(Added AE 24.5)*
Replaces all usages of one font with another.

```javascript
var fromFont = app.project.usedFonts[0].font;
var toFont = app.fonts.getFontsByPostScriptName("TimesNewRomanPSMT")[0];
app.project.replaceFont(fromFont, toFont);
```

- Returns: Boolean (true if any layer changed)

**`project.save([file])`** — Saves project.

**`project.saveWithDialog()`** — Shows Save dialog. Returns: Boolean.

**`project.setDefaultImportFolder([folder])`**
Sets default import folder. Call without params to disable.

```javascript
app.project.setDefaultImportFolder(Folder.desktop);
```

- Returns: Boolean

**`project.showWindow(doShow)`** — Shows/hides Project panel.

#### Team Projects Methods *(Added AE 14.2)*

| Method | Returns | Description |
|--------|---------|-------------|
| `newTeamProject(name, [desc])` | Boolean | Creates team project |
| `openTeamProject(name)` | Boolean | Opens team project |
| `shareTeamProject([comment])` | Boolean | Shares open team project |
| `syncTeamProject()` | Boolean | Syncs open team project |
| `closeTeamProject()` | Boolean | Closes team project |
| `convertTeamProjectToProject(file)` | Boolean | Converts to local .aep |
| `listTeamProjects()` | String[] | Lists available team projects |
| `isTeamProjectOpen(name)` | Boolean | Checks if specific project is open |
| `isAnyTeamProjectOpen()` | Boolean | Checks if any team project is open |
| `isTeamProjectEnabled()` | Boolean | Checks if team projects enabled |
| `isLoggedInToTeamProject()` | Boolean | Checks login status |
| `isSyncCommandEnabled()` | Boolean | Sync command available |
| `isShareCommandEnabled()` | Boolean | Share command available |
| `isResolveCommandEnabled()` | Boolean | Resolve command available |
| `resolveConflict(ResolveType)` | Boolean | Resolves conflict (ACCEPT_THEIRS, ACCEPT_YOURS, ACCEPT_THEIRS_AND_COPY) |

---

### System Object (`system`)

Global `system` object for OS-level information.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `machineName` | String | Computer name |
| `osName` | String | OS name (blank on Windows 7+; use `$.os` instead) |
| `osVersion` | String | OS version number |
| `userName` | String | Currently logged-in user name |

#### Methods

**`system.callSystem(cmdLineToExecute)`**
Executes a system command.

| Parameter | Type | Description |
|-----------|------|-------------|
| `cmdLineToExecute` | String | Command to execute |

- Returns: String (command output)

```javascript
var timeStr = system.callSystem("cmd.exe /c \"time /t\"");
alert("Current time: " + timeStr);
```

---

## Items

### Item Object

Base class for all Project panel items. Access: `app.project.item(index)` (1-based).

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `comment` | String | User comment (up to 15,999 bytes) |
| `dynamicLinkGUID` | String | Unique persistent ID for dynamic linking |
| `guides` | Array | Guide objects with `orientationType`, `positionType`, `position` (AE 16.1+) |
| `id` | Integer | Unique persistent identifier |
| `label` | Integer (0–16) | Label color (0=None) |
| `name` | String | Display name |
| `parentFolder` | FolderItem | Containing folder; set to move item |
| `selected` | Boolean | Selection state |
| `typeName` | String | Locale-specific type name ("Composition", "Folder", "Footage") |

#### Methods

**`item.addGuide(orientationType, position)`** *(Added AE 16.1)*
Creates a guide. `orientationType`: 0=horizontal, 1=vertical.
- Returns: Integer (guide index)

**`item.remove()`** — Deletes item from project.

**`item.removeGuide(guideIndex)`** *(Added AE 16.1)*
Removes guide at index.

**`item.setGuide(position, guideIndex)`** *(Added AE 16.1)*
Modifies guide position.

---

### ItemCollection Object

Access: `app.project.items` or `folderItem.items`.

#### Methods

**`items.addComp(name, width, height, pixelAspect, duration, frameRate)`**

| Parameter | Type | Range |
|-----------|------|-------|
| `name` | String | — |
| `width` | Integer | 4–30000 |
| `height` | Integer | 4–30000 |
| `pixelAspect` | Float | 0.01–100.0 |
| `duration` | Float | 0.0–10800.0 |
| `frameRate` | Float | 1.0–99.0 |

- Returns: CompItem

**`items.addFolder(name)`**
- Returns: FolderItem

```javascript
var compFolder = app.project.items.addFolder("comps");
for (var i = 1; i <= app.project.numItems; i++) {
    if (app.project.item(i) instanceof CompItem) {
        app.project.item(i).parentFolder = compFolder;
    }
}
```

---

### AVItem Object

Base class for CompItem and FootageItem. Access: `app.project.item(index)`.

#### Attributes

| Attribute | Type | Access | Description |
|-----------|------|--------|-------------|
| `duration` | Float [0–10800] | CompItem: R/W; FootageItem: R/O | Duration in seconds |
| `footageMissing` | Boolean | R/O | Placeholder or missing source |
| `frameDuration` | Float | FootageItem: R/O; else R/W | Frame duration in seconds |
| `frameRate` | Float [1–99] | FootageItem: R/O; else R/W | Frames per second |
| `hasAudio` | Boolean | R/O | Contains audio |
| `hasVideo` | Boolean | R/O | Contains video |
| `height` | Integer [1–30000] | R/W (some restrictions) | Height in pixels |
| `isMediaReplacementCompatible` | Boolean | R/O | Supports alternate source (AE 18.0+) |
| `name` | String | R/W | Display name |
| `pixelAspect` | Float [0.01–100] | R/W | Pixel aspect ratio |
| `proxySource` | FootageSource | R/O | Current proxy source |
| `time` | Float | R/W | Current preview time |
| `usedIn` | CompItem[] | R/O | Compositions using this item |
| `useProxy` | Boolean | R/W | Proxy active |
| `width` | Integer [1–30000] | R/W (some restrictions) | Width in pixels |

#### Methods

**`avItem.setProxy(file)`** — Sets proxy source.

**`avItem.setProxyToNone()`** — Removes proxy.

**`avItem.setProxyWithPlaceholder(name, width, height, frameRate, duration)`**

**`avItem.setProxyWithSequence(file, forceAlphabetical)`**

**`avItem.setProxyWithSolid(color, name, width, height, pixelAspect)`**
- `color`: `[R, G, B]` values 0.0–1.0

---

### CompItem Object

Represents a composition. Subclass of AVItem. Access: `app.project.item(index)`.

#### Key Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `activeCamera` | CameraLayer or null | Frontmost enabled camera |
| `bgColor` | Array [R,G,B] | Background color [0..1] |
| `displayStartFrame` | Integer | Frame value at comp start (AE 17.1.1+) |
| `displayStartTime` | Float | Comp start time in seconds |
| `draft3d` | Boolean | Draft 3D mode |
| `dropFrame` | Boolean | Drop frame timecode (AE 10.5+) |
| `frameBlending` | Boolean | Frame blending |
| `frameDuration` | Float | Single frame duration |
| `layers` | LayerCollection | All layers |
| `markerProperty` | PropertyGroup | Composition markers (AE 14.0+) |
| `motionBlur` | Boolean | Motion blur |
| `motionGraphicsTemplateName` | String | .mogrt template name (AE 15.0+) |
| `motionGraphicsTemplateControllerCount` | Integer | EGP controller count (AE 16.1+) |
| `numLayers` | Integer | Layer count |
| `selectedLayers` | Array | Selected layers |
| `selectedProperties` | Array | Selected properties |
| `workAreaDuration` | Float | Work area duration |
| `workAreaStart` | Float | Work area start time |

#### Methods

**`comp.layer(index)`** / **`comp.layer(name)`** / **`comp.layer(otherLayer, relIndex)`**
- Returns: Layer

**`comp.duplicate()`**
- Returns: CompItem

**`comp.exportAsMotionGraphicsTemplate(overwrite[, path])`** *(Added AE 15.0)*
- Returns: Boolean (true if saved)

**`comp.getMotionGraphicsTemplateControllerName(index)`** *(Added AE 16.1)*
- Returns: String

**`comp.openInEssentialGraphics()`** *(Added AE 15.0)*

**`comp.openInViewer()`** *(Added AE 11.0)*
- Returns: Viewer or null

**`comp.setMotionGraphicsControllerName(index, newName)`** *(Added AE 16.1)*

```javascript
// Add composition markers
var comp = app.project.items.addComp("mycomp", 1920, 1080, 1.0, 5, 29.97);
var marker = new MarkerValue("Marker text");
marker.duration = 1;
comp.markerProperty.setValueAtTime(1, marker);
```

---

### FolderItem Object

Represents a folder in the Project panel.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `items` | ItemCollection | Top-level folder contents |
| `numItems` | Integer | Item count (nested folders count as 1) |

#### Methods

**`folderItem.item(subIndex)`** — Returns item at index.

```javascript
var folder = app.project.item(2);
for (var i = 1; i <= folder.numItems; i++) {
    alert(folder.item(i).name);
}
```

---

### FootageItem Object

Represents imported footage. Subclass of AVItem.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `file` | File or null | Source file (same as `mainSource.file` for FileSource) |
| `mainSource` | FootageSource | All source settings and interpretation |

#### Methods

**`footageItem.openInViewer()`**
Opens in Footage panel (works with missing footage).
- Returns: Viewer or null

**`footageItem.replace(file)`**
Replaces source; preserves interpretation.

**`footageItem.replaceWithPlaceholder(name, width, height, frameRate, duration)`**

**`footageItem.replaceWithSequence(file, forceAlphabetical)`**

**`footageItem.replaceWithSolid(color, name, width, height, pixelAspect)`**

---

## Layers

### Layer Object

Base class for all layers. Access: `app.project.item(index).layer(index)`.

Layer is a subclass of PropertyGroup (which is a subclass of PropertyBase).

#### Attributes

| Attribute | Type | Access | Description |
|-----------|------|--------|-------------|
| `autoOrient` | AutoOrientType | R/W | ALONG_PATH, CAMERA_OR_POINT_OF_INTEREST, CHARACTERS_TOWARD_CAMERA, NO_AUTO_ORIENT |
| `comment` | String | R/W | Descriptive comment |
| `containingComp` | CompItem | R/O | Containing composition |
| `hasVideo` | Boolean | R/O | Has video switch (eyeball) |
| `id` | Integer | R/O | Unique persistent ID (AE 22.0+) |
| `index` | Integer | R/O | Position [1..numLayers] |
| `inPoint` | Float | R/W | In point in comp time (seconds) |
| `isNameSet` | Boolean | R/O | Name was set explicitly |
| `label` | Integer | R/W | Label color (0=None, 1–16=preset) |
| `locked` | Boolean | R/W | Layer locked |
| `marker` | PropertyGroup | R/O | Layer markers container |
| `nullLayer` | Boolean | R/O | Created as null object |
| `outPoint` | Float | R/W | Out point in comp time |
| `parent` | Layer or null | R/W | Parent layer |
| `selectedProperties` | PropertyBase[] | R/O | Selected properties |
| `shy` | Boolean | R/W | Hidden when "Hide all shy layers" enabled |
| `solo` | Boolean | R/W | Soloed |
| `startTime` | Float | R/W | Start time in comp time |
| `stretch` | Float | R/W | Time stretch % (100=no stretch) [-9900..9900] |
| `time` | Float | R/O | Current layer time in comp time |

#### Methods

**`layer.activeAtTime(time)`**
- Returns: Boolean

**`layer.applyPreset(presetName)`**
Applies an animation preset file.

**`layer.copyToComp(intoComp)`**
Copies layer to another composition.

**`layer.doSceneEditDetection(applyOptions)`** *(Added AE 22.3)*
Runs Scene Edit Detection.
- `applyOptions`: MARKERS, SPLIT, SPLIT_PRECOMP, or NONE
- Returns: Array of Float (detected edit times)

**`layer.duplicate()`** — Returns: Layer

**`layer.moveAfter(layer)`** / **`layer.moveBefore(layer)`**

**`layer.moveToBeginning()`** / **`layer.moveToEnd()`**

**`layer.remove()`**

**`layer.setParentWithJump([newParent])`**
Sets parent without transform adjustment (may cause visual jump).

---

### LayerCollection Object

Access: `app.project.item(index).layers`.

#### Methods

**`layers.add(item[, duration])`**
Creates AVLayer from item.
- Returns: AVLayer

**`layers.addBoxText([width, height])`**
Creates paragraph text layer (horizontal).
- Returns: TextLayer

**`layers.addCamera(name, centerPoint)`**
- Returns: CameraLayer

**`layers.addLight(name, centerPoint)`**
- Returns: LightLayer

**`layers.addNull([duration])`**
- Returns: AVLayer

**`layers.addShape()`**
- Returns: ShapeLayer

**`layers.addSolid(color, name, width, height, pixelAspect[, duration])`**
- `color`: `[R, G, B]` values [0..1]
- Returns: AVLayer

**`layers.addText([sourceText])`**
Creates point text layer (horizontal).
- Returns: TextLayer

**`layers.addVerticalBoxText([width, height])`** *(Added AE 24.2)*
- Returns: TextLayer

**`layers.addVerticalText([sourceText])`** *(Added AE 24.2)*
- Returns: TextLayer

**`layers.byName(name)`**
Returns first (topmost) layer with given name.
- Returns: Layer or null

**`layers.precompose(layerIndices, name[, moveAllAttributes])`**
Precomposes specified layers.

| Parameter | Type | Description |
|-----------|------|-------------|
| `layerIndices` | Integer[] | Layer position indexes |
| `name` | String | New comp name |
| `moveAllAttributes` | Boolean | Keep attributes in new comp (default true) |

- Returns: CompItem

---

### AVLayer Object

Represents AV layers (footage, solid, null, text, shape). Subclass of Layer.

#### Attributes

| Attribute | Type | Access | Added | Description |
|-----------|------|--------|-------|-------------|
| `adjustmentLayer` | Boolean | R/W | — | Adjustment layer |
| `audioActive` | Boolean | R/O | — | Audio active at current time |
| `audioEnabled` | Boolean | R/W | — | Audio toggle |
| `blendingMode` | BlendingMode | R/W | — | Blend mode |
| `collapseTransformation` | Boolean | R/W | — | Collapse transformation |
| `effectsActive` | Boolean | R/W | — | Effects enabled |
| `environmentLayer` | Boolean | R/W | AE 11.0 | 3D environment layer |
| `frameBlending` | Boolean | R/O | — | Frame blending |
| `frameBlendingType` | FrameBlendingType | R/W | — | FRAME_MIX, NO_FRAME_BLEND, PIXEL_MOTION |
| `guideLayer` | Boolean | R/W | — | Guide layer |
| `hasAudio` | Boolean | R/O | — | Has audio |
| `hasTrackMatte` | Boolean | R/O | — | Track matte applied |
| `height` | Float | R/O | — | Layer height in pixels |
| `isNameFromSource` | Boolean | R/O | — | Name from source |
| `isTrackMatte` | Boolean | R/O | — | Used as track matte |
| `motionBlur` | Boolean | R/W | — | Motion blur |
| `preserveTransparency` | Boolean | R/W | — | Preserve transparency |
| `quality` | LayerQuality | R/W | — | BEST, DRAFT, WIREFRAME |
| `samplingQuality` | LayerSamplingQuality | R/W | AE 12.0 | BICUBIC, BILINEAR |
| `source` | AVItem | R/O | — | Source item |
| `threeDLayer` | Boolean | R/W | — | 3D layer |
| `threeDPerChar` | Boolean | R/W | — | Per-character 3D (text) |
| `timeRemapEnabled` | Boolean | R/W | — | Time remapping active |
| `trackMatteLayer` | AVLayer | R/O | AE 23.0 | Track matte layer |
| `trackMatteType` | TrackMatteType | R/W | — | ALPHA, ALPHA_INVERTED, LUMA, LUMA_INVERTED, NO_TRACK_MATTE |
| `width` | Float | R/O | — | Layer width in pixels |

#### Methods

**`avLayer.audioActiveAtTime(time)`** — Returns: Boolean

**`avLayer.calculateTransformFromPoints(pointTopLeft, pointTopRight, pointBottomRight)`**
Computes transformation from three reference points.
- Returns: Transform object

**`avLayer.compPointToSource(point)`** *(Added CC 2014.2)*
Converts comp coordinates to layer coordinates.
- Returns: `[x, y]`

**`avLayer.openInViewer()`** *(Added AE 11.0)* — Returns: Viewer or null

**`avLayer.replaceSource(newSource, fixExpressions)`**
Substitutes layer source.

**`avLayer.sourcePointToComp(point)`** *(Added CC 2014.2)*
Converts layer coordinates to comp coordinates.
- Returns: `[x, y]`

**`avLayer.sourceRectAtTime(timeT, extents)`**
Retrieves layer bounds at time.
- Returns: `{top, left, width, height}`

**Track Matte Methods** *(Added AE 23.0)*

**`avLayer.setTrackMatte(trackMatteLayer, trackMatteType)`**
- `trackMatteLayer`: AVLayer or null (null removes matte)

**`avLayer.removeTrackMatte()`**

**Motion Graphics Template Methods** *(Added AE 18.0)*

**`avLayer.canAddToMotionGraphicsTemplate(comp)`** — Returns: Boolean

**`avLayer.addToMotionGraphicsTemplate(comp)`** — Returns: Boolean

**`avLayer.addToMotionGraphicsTemplateAs(comp, name)`** — Returns: Boolean

```javascript
// Track matte example
myLayer.setTrackMatte(otherLayer, TrackMatteType.ALPHA);
myLayer.removeTrackMatte();
```

---

### CameraLayer Object

Subclass of Layer. Created with `layers.addCamera()`.

No additional attributes. Property groups: Transform (Point of Interest, Position, Orientation, X/Y Rotation, Opacity), Camera Options (Zoom, Depth of Field, Focus Distance, Aperture, Blur Level, Iris settings), Marker.

---

### LightLayer Object

Subclass of Layer. Created with `layers.addLight()`.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `lightSource` | Layer or null | AE 24.3 | Source layer when `lightType` is ENVIRONMENT (expanded to all 2D layers in AE 25.2) |
| `lightType` | LightType | — | PARALLEL, SPOT, POINT, AMBIENT, ENVIRONMENT (24.3+) |

Property groups: Transform, Light Options (Intensity, Color, Cone Angle, Cone Feather, Falloff, Shadow Darkness, Shadow Diffusion), Marker.

---

### ShapeLayer Object

Subclass of AVLayer. Created with `layers.addShape()`. No additional attributes. All AVLayer and Layer methods available.

Property groups: Contents, Transform. See Match Names Reference for shape property match names.

---

### TextLayer Object

Subclass of AVLayer. Created with `layers.addText()`.

No additional attributes. Property groups: Text (Source Text, Path Options, More Options, Animators), Transform, Effects, Masks.

**Note:** The following AVLayer properties are not applicable to text layers: `canSetTimeRemapEnabled`, `timeRemapEnabled`, `trackMatteType`, `isTrackMatte`, `hasTrackMatte`.

---

### ThreeDModelLayer Object

> **New in AE 26.0 (actually 24.4):** ThreeDModelLayer added in AE 24.4.

Subclass of AVLayer for 3D model layers. Inherits all AVLayer attributes and methods.

```javascript
var modelLayer = app.project.item(1).layer(1);
if (modelLayer instanceof ThreeDModelLayer) {
    // work with 3D model
}
```

---

## Properties

### PropertyBase Object

Base class for both Property and PropertyGroup.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `active` | Boolean | For layers: video active at current time; for properties: same as enabled |
| `canSetEnabled` | Boolean | Whether `enabled` can be modified |
| `elided` | Boolean | Hidden organizing group |
| `enabled` | Boolean | Video switch / eyeball state |
| `isEffect` | Boolean | Is an effect PropertyGroup |
| `isMask` | Boolean | Is a mask PropertyGroup |
| `isModified` | Boolean | Changed since creation |
| `matchName` | String | Stable non-localized identifier |
| `name` | String | Display name (R/W for indexed group children only) |
| `parentProperty` | PropertyGroup or null | Immediate parent group |
| `propertyDepth` | Integer | Depth in hierarchy (0 for layers) |
| `propertyIndex` | Integer | Position index within parent |
| `propertyType` | PropertyType | PROPERTY, INDEXED_GROUP, NAMED_GROUP |
| `selected` | Boolean | Selection state |

#### Methods

**`propertyBase.duplicate()`**
Copies property (indexed group children only).
- Returns: PropertyBase

**`propertyBase.moveTo(newIndex)`**
Relocates within parent indexed group. **Warning:** invalidates references to other children.

**`propertyBase.propertyGroup([countUp])`**
Retrieves ancestor group.

| Parameter | Type | Description |
|-----------|------|-------------|
| `countUp` | Integer [1..propertyDepth] | Levels to ascend; default 1 |

- Returns: PropertyGroup or Layer

**`propertyBase.remove()`**
Deletes from indexed group.

---

### Property Object

Subclass of PropertyBase. Represents an animatable value.

> **New in AE 26.0:** `Property.propertyParameters` and `Property.valueText` added.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `alternateSource` | AVItem or null | AE 18.0 | Media replacement source |
| `canSetAlternateSource` | Boolean | AE 18.0 | Supports media replacement |
| `canSetExpression` | Boolean | AE 11.0 | Expression can be set |
| `canVaryOverTime` | Boolean | — | Keyframes/expressions can be written |
| `dimensionsSeparated` | Boolean | AE 9.0 | Multi-dim shown as separate properties |
| `essentialPropertySource` | Property or AVLayer | AE 22.0 | Original source for Essential Property |
| `expression` | String | — | Expression string |
| `expressionEnabled` | Boolean | — | Expression evaluation toggle |
| `expressionError` | String | — | Expression evaluation error |
| `hasMax` | Boolean | — | Has maximum constraint |
| `hasMin` | Boolean | — | Has minimum constraint |
| `isDropdownEffect` | Boolean | AE 17.0.1 | Is Dropdown Menu Control's Menu property |
| `isSeparationFollower` | Boolean | AE 9.0 | Represents separated dimension |
| `isSeparationLeader` | Boolean | AE 9.0 | Can be dimensionally separated |
| `isSpatial` | Boolean | — | Spatial value (e.g., position) |
| `isTimeVarying` | Boolean | — | Has keyframes or enabled expression |
| `maxValue` | — | — | Maximum constraint value |
| `minValue` | — | — | Minimum constraint value |
| `numKeys` | Integer | — | Number of keyframes |
| `propertyIndex` | Integer | — | Position index (starts at 1) |
| `propertyParameters` | Array of String | **AE 26.0** | Dropdown menu items array |
| `propertyValueType` | PropertyValueType | — | Type of stored value |
| `selectedKeys` | Integer[] | — | Indices of selected keyframes |
| `separationDimension` | Integer | AE 9.0 | Dimension number for follower |
| `separationLeader` | Property | AE 9.0 | Original multidimensional property |
| `unitsText` | String | — | Text description of value units |
| `value` | varies | — | Current value at present time |
| `valueText` | String | **AE 26.0** | Text of selected dropdown item |

> **New in AE 26.0:** `valueText` returns the currently selected string from a Dropdown Menu Control. `propertyParameters` returns the full array of dropdown options.

```javascript
// AE 26.0: Read dropdown menu selection
var fx = lyr.property("ADBE Effect Parade").property("Dropdown Menu Control");
var menuProp = fx.property("Menu");
var selectedText = menuProp.valueText; // Current selection string
var allOptions = menuProp.propertyParameters; // Array of all options
```

#### PropertyValueType Enumeration

| Enum | Description |
|------|-------------|
| `NO_VALUE` | No data |
| `ThreeD_SPATIAL` | [x, y, z] positional |
| `ThreeD` | [a, b, c] quantitative |
| `TwoD_SPATIAL` | [x, y] positional |
| `TwoD` | [a, b] quantitative |
| `OneD` | Single float |
| `COLOR` | [r, g, b, alpha] 0.0–1.0 |
| `CUSTOM_VALUE` | Custom (e.g., Histogram) |
| `MARKER` | MarkerValue object |
| `LAYER_INDEX` | Integer (0=no layer) |
| `MASK_INDEX` | Integer (0=no mask) |
| `SHAPE` | Shape object |
| `TEXT_DOCUMENT` | TextDocument object |

#### Value Methods

**`property.setValue(newValue)`** — Sets static value.

**`property.setValueAtTime(time, newValue)`** — Creates keyframe if needed.

**`property.setValueAtKey(keyIndex, newValue)`** — Sets existing keyframe value.

**`property.setValuesAtTimes(times, newValues)`** — Batch set.

**`property.valueAtTime(time, preExpression)`**
- `preExpression`: true = pre-expression value, false = with expression applied
- Returns: property value

#### Keyframe Methods

**`property.addKey(time)`** — Returns: Integer (key index)

**`property.removeKey(keyIndex)`**

**`property.nearestKeyIndex(time)`** — Returns: Integer

**`property.keyTime(keyIndex)`** — Returns: Float

**`property.keyValue(keyIndex)`** — Returns: property value

**`property.keySelected(keyIndex)`** — Returns: Boolean

**`property.setSelectedAtKey(keyIndex, onOff)`**

**`property.keyLabel(keyIndex)`** *(Added AE 22.6)* — Returns: Integer (label color 0–16)

**`property.setLabelAtKey(keyIndex, labelIndex)`** *(Added AE 22.6)*

#### Interpolation Methods

**`property.isInterpolationTypeValid(type)`** — Returns: Boolean

**`property.keyInInterpolationType(keyIndex)`** — Returns: KeyframeInterpolationType

**`property.keyOutInterpolationType(keyIndex)`** — Returns: KeyframeInterpolationType

**`property.setInterpolationTypeAtKey(keyIndex, inType[, outType])`**
Types: LINEAR, BEZIER, HOLD

#### Spatial Methods (TwoD_SPATIAL / ThreeD_SPATIAL only)

**`property.keyInSpatialTangent(keyIndex)`** — Returns: `[x, y]` or `[x, y, z]`

**`property.keyOutSpatialTangent(keyIndex)`** — Returns: `[x, y]` or `[x, y, z]`

**`property.setSpatialTangentsAtKey(keyIndex, inTangent[, outTangent])`**

**`property.keySpatialContinuous(keyIndex)`** — Returns: Boolean

**`property.setSpatialContinuousAtKey(keyIndex, newVal)`**

**`property.keySpatialAutoBezier(keyIndex)`** — Returns: Boolean

**`property.setSpatialAutoBezierAtKey(keyIndex, newVal)`**

**`property.keyRoving(keyIndex)`** — Returns: Boolean

**`property.setRovingAtKey(keyIndex, newVal)`** (Not available for first/last keyframes)

#### Temporal Ease Methods

**`property.keyInTemporalEase(keyIndex)`** — Returns: `[KeyframeEase]` array

**`property.keyOutTemporalEase(keyIndex)`** — Returns: `[KeyframeEase]` array

**`property.setTemporalEaseAtKey(keyIndex, inTemporalEase[, outTemporalEase])`**

**`property.keyTemporalContinuous(keyIndex)`** — Returns: Boolean

**`property.setTemporalContinuousAtKey(keyIndex, newVal)`**

**`property.keyTemporalAutoBezier(keyIndex)`** — Returns: Boolean

**`property.setTemporalAutoBezierAtKey(keyIndex, newVal)`**

#### Dimension Methods *(Added AE 9.0)*

**`property.getSeparationFollower(dim)`** — Returns: Property (separated dimension)

#### Dropdown Menu Methods *(Added AE 17.0.1)*

**`property.setPropertyParameters(items)`**
Sets Dropdown Menu Control items. Use `"(-"` for separator.

```javascript
var dropdownEffect = layer.property("ADBE Effect Parade").addProperty("ADBE Dropdown Control");
var menuProp = dropdownEffect.property(1);
if (menuProp.isDropdownEffect) {
    menuProp.setPropertyParameters(["First", "Second", "(-", "Third"]);
}
```

#### Motion Graphics Methods *(Added AE 15.0+)*

**`property.canAddToMotionGraphicsTemplate(comp)`** — Returns: Boolean

**`property.addToMotionGraphicsTemplate(comp)`** — Returns: Boolean

**`property.addToMotionGraphicsTemplateAs(comp, name)`** *(Added AE 16.1)* — Returns: Boolean

#### Media Replacement *(Added AE 18.0)*

**`property.setAlternateSource(newSource)`**

#### Code Examples

```javascript
// Set opacity
myLayer.property("Opacity").setValue(50);

// Animate position
var pos = myLayer.property("Position");
pos.setValueAtTime(0, [0, 0, 0]);
pos.setValueAtTime(5, [1920, 1080, 0]);

// Evaluate at time
var val = myLayer.property("Scale").valueAtTime(3.5, false);

// Mask shape manipulation
var myMask = myLayer.mask(1);
var myShape = myMask.maskPath.value;
myShape.closed = false;
myMask.maskPath.setValue(myShape);

// Text keyframes
var textProp = myTextLayer.property("Source Text");
textProp.setValueAtKey(1, new TextDocument("frame one"));
textProp.setValueAtKey(2, new TextDocument("frame two"));

// Essential property source (AE 22.0+)
var opacityProp = comp.layer(1).property("Transform").property("Opacity");
opacityProp.addToMotionGraphicsTemplate(comp);
```

---

### PropertyGroup Object

Subclass of PropertyBase. Container for Property and PropertyGroup objects.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `numProperties` | Integer | Count of indexed properties (layers: 3 for mask, effect, motion tracker groups) |

#### Methods

**`propertyGroup.addProperty(name)`**
Creates and adds a property.

| Parameter | Type | Description |
|-----------|------|-------------|
| `name` | String | Display name, match name, or effect name (e.g., `"ADBE Mask Atom"`, `"ADBE Bulge"`) |

**Warning:** Adding to an indexed group invalidates existing references. Store `propertyIndex` before adding more properties.

```javascript
var effectsGroup = layer.property("ADBE Effect Parade");
var slider = effectsGroup.addProperty("ADBE Slider Control");
var sliderIdx = slider.propertyIndex;
effectsGroup.addProperty("ADBE Color Control");
// re-access slider by stored index:
var sl = effectsGroup.property(sliderIdx).property("ADBE Slider Control-0001");
```

**`propertyGroup.canAddProperty(name)`** — Returns: Boolean

**`propertyGroup.addVariableFontAxis(axisTag)`** *(Added AE 26.0)*

> **New in AE 26.0:** Creates a variable font axis property in a text animator's properties group.

Applies only to the `"ADBE Text Animator Properties"` group. Animating variable font axes may change character widths; use `"ADBE Text Variable Font Spacing"` in More Options to compensate.

| Parameter | Type | Description |
|-----------|------|-------------|
| `axisTag` | String | 4-character axis tag: `"wght"` (weight), `"wdth"` (width), `"slnt"` (slant), `"ital"` (italic), `"opsz"` (optical size), or custom 4-char uppercase tag |

- Returns: Property

```javascript
var comp = app.project.items.addComp("VarFont Demo", 1920, 1080, 1, 30, 30);
var textLayer = comp.layers.addText("Hello World!");

// Set variable font
var textDoc = textLayer.property("Source Text").value;
textDoc.font = 'ShantellSans';
textLayer.property("Source Text").setValue(textDoc);

// Add text animator
var animators = textLayer.property("Text").property("Animators");
var animator = animators.addProperty("ADBE Text Animator");
var animatorProps = animator.property("ADBE Text Animator Properties");

// Add weight axis and animate it
var weightAxis = animatorProps.addVariableFontAxis("wght");
weightAxis.setValueAtTime(0, 300);  // Light
weightAxis.setValueAtTime(2, 900);  // Heavy
```

**`propertyGroup.property(index)`** / **`propertyGroup.property(name)`**
Returns child property.

| Name Forms Accepted |
|---------------------|
| Match name: `"ADBE Mask Atom"`, `"ADBE Bulge"` |
| Expression/intercap style: `"position"`, `"anchorPoint"`, `"maskPath"` |
| Display name: `"Position"`, `"Mask Path"` |

**Properties Accessible by Name:**

| Layer Type | Properties |
|------------|-----------|
| Any Layer | `"Masks"`, `"Effects"`, `"Motion Trackers"` |
| AVLayer | `"anchorPoint"`, `"position"`, `"scale"`, `"rotation"`, `"opacity"`, `"marker"`, `"timeRemapEnabled"`, `"audioLevels"` |
| Camera | `"zoom"`, `"depthOfField"`, `"focusDistance"`, `"aperture"`, `"blurLevel"` |
| Light | `"intensity"`, `"color"`, `"coneAngle"`, `"coneFeather"`, `"shadowDarkness"`, `"shadowDiffusion"`, `"castsShadows"` |
| 3D Layer | `"acceptsShadows"`, `"acceptsLights"`, `"ambient"`, `"diffuse"`, `"specular"`, `"shininess"`, `"castsShadows"`, `"lightTransmission"`, `"metal"` |
| Camera/Light/3D | `"xRotation"`, `"yRotation"`, `"orientation"` |
| Text Layer | `"source Text"`, `"text"` |

---

### MaskPropertyGroup Object

Subclass of PropertyGroup. Access: `layer.mask(index)`.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `color` | Array [R, G, B] [0..1] | Mask outline color in UI |
| `inverted` | Boolean | Mask inverted |
| `locked` | Boolean | Locked (cannot edit in UI) |
| `maskFeatherFalloff` | MaskFeatherFalloff | FFO_LINEAR or FFO_SMOOTH |
| `maskMode` | MaskMode | NONE, ADD, SUBTRACT, INTERSECT, LIGHTEN, DARKEN, DIFFERENCE |
| `maskMotionBlur` | MaskMotionBlur | SAME_AS_LAYER, ON, OFF |
| `rotoBezier` | Boolean | RotoBezier shape |

---

## Render Queue

### RenderQueue Object (`app.project.renderQueue`)

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `canQueueInAME` | Boolean | AE 14.0 | Queued items exist for AME |
| `items` | RQItemCollection | — | All render queue items |
| `numItems` | Integer | — | Item count |
| `queueNotify` | Boolean | AE 22.0 | Notify checkbox state |
| `rendering` | Boolean | — | Rendering in progress or paused |

#### Methods

**`renderQueue.item(index)`** — Returns: RenderQueueItem

**`renderQueue.render()`** — Starts rendering (blocking until complete).

**`renderQueue.pauseRendering(pause)`**

**`renderQueue.stopRendering()`**

**`renderQueue.showWindow(doShow)`**

**`renderQueue.queueInAME(render_immediately_in_AME)`** *(Added AE 14.0)*
Requires AME CC 2017 (11.0)+.

```javascript
if (app.project.renderQueue.canQueueInAME) {
    app.project.renderQueue.queueInAME(false);
}
```

---

### RQItemCollection Object

Access: `app.project.renderQueue.items`.

**`rqItems.add(comp)`**
Adds composition to render queue.
- Returns: RenderQueueItem

---

### RenderQueueItem Object

Access: `app.project.renderQueue.item(index)`.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `comp` | CompItem | — | Composition being rendered |
| `elapsedSeconds` | Integer or null | — | Seconds spent rendering |
| `logType` | LogType | — | ERRORS_ONLY, ERRORS_AND_SETTINGS, ERRORS_AND_PER_FRAME_INFO |
| `numOutputModules` | Integer | — | Output module count |
| `onStatusChanged` | Function name | — | Callback on status change |
| `outputModules` | OMCollection | — | Output modules |
| `queueItemNotify` | Boolean | AE 22.0 | Notify checkbox |
| `render` | Boolean | — | Renders when queue starts (setting true → QUEUED) |
| `skipFrames` | Integer [0–99] | — | Frames to skip |
| `startTime` | Date or null | — | When rendering began |
| `status` | RQItemStatus | — | Current render status |
| `templates` | String[] | — | Available render settings templates |
| `timeSpanDuration` | Float | — | Duration to render (seconds) |
| `timeSpanStart` | Float | — | Render start time (seconds) |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `applyTemplate(templateName)` | Nothing | Apply render settings template |
| `duplicate()` | RenderQueueItem | Duplicate item |
| `getSetting(key)` | Value | Get setting (AE 13.0+) |
| `getSettings(format)` | Object | Get all settings (AE 13.0+) |
| `outputModule(index)` | OutputModule | Access output module |
| `remove()` | Nothing | Remove from queue |
| `saveAsTemplate(name)` | Nothing | Save as template |
| `setSetting(key, value)` | Nothing | Set setting (AE 13.0+) |
| `setSettings(object)` | Nothing | Set multiple settings (AE 13.0+) |

---

### OutputModule Object

Access: `app.project.renderQueue.item(index).outputModule(index)`.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `file` | File | Output file destination |
| `includeSourceXMP` | Boolean | Write source XMP metadata |
| `name` | String | Display name |
| `postRenderAction` | PostRenderAction | NONE, IMPORT, IMPORT_AND_REPLACE_USAGE, SET_PROXY |
| `templates` | String[] | Available output module templates |

#### Methods

**`outputModule.applyTemplate(templateName)`**

**`outputModule.getSetting()`** *(Added AE 13.0)*

**`outputModule.getSettings([format])`** *(Added AE 13.0)* — format: `GetSettingsFormat.STRING` or `NUMBER`

**`outputModule.remove()`**

**`outputModule.saveAsTemplate(name)`**

**`outputModule.setSetting()`** *(Added AE 13.0)*

**`outputModule.setSettings(object)`** *(Added AE 13.0)* **Note:** Bug invalidates OutputModule object after modification — retrieve fresh reference.

---

## Sources

### FootageSource Object

Base class for SolidSource. Access: `footageItem.mainSource` or `item.proxySource`.

#### Attributes

| Attribute | Type | Access | Description |
|-----------|------|--------|-------------|
| `alphaMode` | AlphaMode | R/W | IGNORE, STRAIGHT, PREMULTIPLIED |
| `conformFrameRate` | Float [0–99] | R/W | Override frame rate (0=use native) |
| `displayFrameRate` | Float | R/O | Effective display frame rate |
| `fieldSeparationType` | FieldSeparationType | R/W | OFF, UPPER_FIELD_FIRST, LOWER_FIELD_FIRST |
| `hasAlpha` | Boolean | R/O | Has alpha channel |
| `highQualityFieldSeparation` | Boolean | R/W | High quality field separation |
| `invertAlpha` | Boolean | R/W | Invert alpha |
| `isStill` | Boolean | R/O | Still (vs. time-based) footage |
| `loop` | Integer [1–9999] | R/W | Loop count |
| `nativeFrameRate` | Float | R/O | Original frame rate |
| `premulColor` | Array [R,G,B] | R/W | Premultiply color |
| `removePulldown` | PulldownPhase | R/W | Pulldown removal |

#### Methods

**`footageSource.guessAlphaMode()`** — Estimates alphaMode, premulColor, invertAlpha.

**`footageSource.guessPulldown(method)`**
- `method`: `PulldownMethod.PULLDOWN_3_2` or `ADVANCE_24P`

---

### FileSource Object

Subclass of FootageSource. Represents file-based footage.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `file` | File | Source file (read-only) |
| `missingFootagePath` | String | Path of missing footage |

#### Methods

**`fileSource.reload()`** — Reloads from source file (mainSource only).

---

### SolidSource Object

Subclass of FootageSource. Represents solid-color footage.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `color` | Array [R, G, B] [0..1] | Solid color |

---

### PlaceholderSource Object

Subclass of FootageSource. No additional attributes or methods.

---

## Text

### TextDocument Object

Stores text content and formatting for a TextLayer's Source Text property.

**Constructor:** `new TextDocument(docText)`
**Access:** `textLayer.property("Source Text").value`

#### Core Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `text` | String | Text content |

#### Character Formatting

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `allCaps` | Boolean | AE 13.2 | Read-only; use `fontCapsOption` to set |
| `applyFill` | Boolean | — | Fill display enabled |
| `applyStroke` | Boolean | — | Stroke display enabled |
| `autoKernType` | AutoKernType | AE 24.0 | NO_AUTO_KERN, METRIC_KERN, OPTICAL_KERN |
| `baselineDirection` | BaselineDirection | AE 24.0 | BASELINE_WITH_STREAM, BASELINE_VERTICAL_ROTATED, BASELINE_VERTICAL_CROSS_STREAM |
| `baselineLocs` | Array | AE 13.6 | [x_start, y_start, x_end, y_end, ...] per line |
| `baselineShift` | Float | AE 13.2 | Baseline shift in pixels |
| `digitSet` | DigitSet | AE 24.0 | DEFAULT_DIGITS, ARABIC_DIGITS, HINDI_DIGITS, FARSI_DIGITS, ARABIC_DIGITS_RTL |
| `fauxBold` | Boolean | AE 24.0 (R/W) | Faux bold |
| `fauxItalic` | Boolean | AE 24.0 (R/W) | Faux italic |
| `fillColor` | Array [r,g,b] | — | Fill color |
| `font` | String | — | PostScript font name |
| `fontBaselineOption` | FontBaselineOption | AE 24.0 | FONT_NORMAL_BASELINE, FONT_FAUXED_SUPERSCRIPT, FONT_FAUXED_SUBSCRIPT |
| `fontCapsOption` | FontCapsOption | AE 24.0 | FONT_NORMAL_CAPS, FONT_SMALL_CAPS, FONT_ALL_CAPS, FONT_ALL_SMALL_CAPS |
| `fontFamily` | String | AE 13.1 | Font family name (read-only) |
| `fontLocation` | String | AE 13.1 | Path to font file (read-only) |
| `fontObject` | Font object | AE 24.0 | R/W font reference |
| `fontSize` | Float [0.1–1296] | — | Font size in pixels |
| `fontStyle` | String | AE 13.1 | Style (e.g., "bold", "italic") (read-only) |
| `horizontalScale` | Float | AE 13.2 | Horizontal scale |
| `kerning` | Integer | AE 24.0 | Kerning value |
| `leading` | Float | AE 14.2 | Line spacing |
| `ligature` | Boolean | AE 24.0 | Ligature enabled |
| `lineJoinType` | LineJoinType | AE 24.0 | LINE_JOIN_MITER, LINE_JOIN_ROUND, LINE_JOIN_BEVEL |
| `noBreak` | Boolean | AE 24.0 | No break attribute |
| `smallCaps` | Boolean | AE 13.2 | Read-only; use `fontCapsOption` |
| `strokeColor` | Array [r,g,b] | — | Stroke color |
| `strokeOverFill` | Boolean | — | Stroke renders over fill |
| `strokeWidth` | Float [0–1000] | — | Stroke thickness in pixels |
| `subscript` | Boolean | AE 13.2 | Read-only; use `fontBaselineOption` |
| `superscript` | Boolean | AE 13.2 | Read-only; use `fontBaselineOption` |
| `tracking` | Float | — | Character spacing |
| `tsume` | Float [0–1] | AE 13.2 | Tsume percentage |
| `verticalScale` | Float | AE 13.2 | Vertical scale |

#### Paragraph Formatting

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `autoHyphenate` | Boolean | AE 24.0 | Auto hyphenation |
| `autoLeading` | Boolean | — | Auto leading |
| `composedLineCount` | Integer | AE 24.3 | Number of composed lines |
| `composerEngine` | ComposerEngine | AE 24.0 | LATIN_CJK_ENGINE or UNIVERSAL_TYPE_ENGINE |
| `direction` | ParagraphDirection | AE 24.0 | DIRECTION_LEFT_TO_RIGHT, DIRECTION_RIGHT_TO_LEFT |
| `endIndent` | Float | AE 24.0 | Paragraph end indent |
| `everyLineComposer` | Boolean | AE 24.0 | Every-Line vs Single-Line Composer |
| `firstLineIndent` | Float | AE 24.0 | First line indent |
| `hangingRoman` | Boolean | AE 24.0 | Roman Hanging Punctuation |
| `justification` | ParagraphJustification | AE 24.0 | LEFT_JUSTIFY, RIGHT_JUSTIFY, CENTER_JUSTIFY, FULL_JUSTIFY, MULTIPLE_JUSTIFICATIONS |
| `leadingType` | LeadingType | AE 24.0 | ROMAN_LEADING_TYPE, JAPANESE_LEADING_TYPE |
| `lineOrientation` | LineOrientation | AE 24.2 | HORIZONTAL, VERTICAL_RIGHT_TO_LEFT, VERTICAL_LEFT_TO_RIGHT |
| `paragraphCount` | Integer | AE 24.3 | Number of paragraphs |
| `spaceAfter` | Float | AE 24.0 | Space after paragraph |
| `spaceBefore` | Float | AE 24.0 | Space before paragraph |
| `startIndent` | Float | AE 24.0 | Paragraph start indent |

#### Box Text Properties

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `boxAutoFitPolicy` | BoxAutoFitPolicy | AE 24.6 | AUTO_FIT modes |
| `boxFirstBaselineAlignment` | BoxFirstBaselineAlignment | AE 24.6 | First line alignment |
| `boxFirstBaselineAlignmentMinimum` | Float | AE 24.6 | Manual first line offset |
| `boxInsetSpacing` | Float | AE 24.6 | Inner space from box bounds |
| `boxOverflow` | Boolean | AE 24.6 | Text doesn't fit in box |
| `boxText` | Boolean | AE 10.5 | Is paragraph text (read-only) |
| `boxTextPos` | Array [x,y] | AE 13.2 | Box position from anchor |
| `boxTextSize` | Array [w,h] | AE 10.5 | Box dimensions |
| `boxVerticalAlignment` | BoxVerticalAlignment | AE 24.6 | TOP, CENTER, BOTTOM, JUSTIFY |
| `pointText` | Boolean | AE 10.5 | Is point text (read-only) |

#### Methods

**`textDocument.characterRange(characterStart, [signedCharacterEnd])`** *(Added AE 24.3)*
- Returns: CharacterRange

**`textDocument.composedLineRange(composedLineIndexStart, [signedComposedLineIndexEnd])`** *(Added AE 24.3)*
- Returns: ComposedLineRange

**`textDocument.paragraphRange(paragraphIndexStart, [signedParagraphIndexEnd])`** *(Added AE 24.3)*
- Returns: ParagraphRange

**`textDocument.composedLineCharacterIndexesAt(characterIndex)`** *(Added AE 24.3)*
- Returns: `{start, end}`

**`textDocument.paragraphCharacterIndexesAt(characterIndex)`** *(Added AE 24.3)*
- Returns: `{start, end}`

**`textDocument.resetCharStyle()`** — Restores default character settings.

**`textDocument.resetParagraphStyle()`** — Restores default paragraph settings.

#### Code Examples

```javascript
// Basic text creation
var myDoc = new TextDocument("Hello World");
myTextLayer.property("Source Text").setValue(myDoc);

// Full formatting
var doc = myTextLayer.property("Source Text").value;
doc.resetCharStyle();
doc.fontSize = 60;
doc.fillColor = [1, 0, 0];
doc.strokeColor = [0, 1, 0];
doc.strokeWidth = 2;
doc.font = "Times New Roman PSMT";
doc.applyStroke = true;
doc.applyFill = true;
doc.text = "Happy holidays!";
doc.justification = ParagraphJustification.CENTER_JUSTIFY;
myTextLayer.property("Source Text").setValue(doc);

// Keyframed text
var textProp = myTextLayer.property("Source Text");
textProp.setValueAtTime(0, new TextDocument("First"));
textProp.setValueAtTime(1, new TextDocument("Second"));

// Range styling (AE 24.3+)
var doc = myTextLayer.property("Source Text").value;
var range = doc.characterRange(0, 1);
range.fontSize = range.fontSize + 10;
doc.characterRange(1, -1).fontSize = 40; // rest of text
```

---

### FontObject

> **Added AE 24.0.** Provides detailed information about a specific font.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `designAxesData` | Array | AE 24.0 | Axis objects with `name`, `tag`, `min`, `max`, `default` (variable fonts only) |
| `designVector` | Array | AE 24.0 | Current axis values (variable fonts only) |
| `familyName` | String | AE 24.0 | ASCII family name |
| `familyPrefix` | String | AE 24.0 | Variable font PostScript prefix |
| `fontID` | Integer | AE 24.2 | Session-unique identifier |
| `fullName` | String | AE 24.0 | ASCII family + style |
| `hasDesignAxes` | Boolean | AE 24.0 | Is variable font |
| `hasSameDict(fontObject)` | — | AE 24.0 | Method: shares variable font dictionary |
| `isFromAdobeFonts` | Boolean | AE 24.0 | From Adobe Fonts |
| `isSubstitute` | Boolean | AE 24.0 | Missing/substituted font |
| `location` | String | AE 24.0 | File system path |
| `nativeFamilyName` | String | AE 24.0 | Unicode family name |
| `nativeFullName` | String | AE 24.0 | Unicode full name |
| `nativeStyleName` | String | AE 24.0 | Unicode style name |
| `otherFontsWithSameDict` | Array | AE 25.1 | Fonts sharing same dictionary |
| `postScriptName` | String | AE 24.0 | PostScript identifier |
| `styleName` | String | AE 24.0 | ASCII style name |
| `technology` | CTFontTechnology | AE 24.0 | Type1, TrueType, CID, Bitmap, ATC, Type3, SVG |
| `type` | CTFontType | AE 24.0 | Internal classification |
| `version` | String | AE 24.0 | Version string |
| `writingScripts` | CTScript[] | AE 24.0 | Supported character sets |

#### Methods

**`fontObject.hasGlyphsFor(charString)`** *(Added AE 25.1)*
- Returns: Boolean (true if font has glyphs for every character)

**`fontObject.hasSameDict(fontObject)`**
- Returns: Boolean

**`fontObject.postScriptNameForDesignVector([...vectorValues])`**
- Returns: String

```javascript
var textDoc = textLayer.property("Source Text").value;
var font = textDoc.fontObject;
if (font && font.designAxesData) {
    font.designAxesData.forEach(function(axis) {
        // axis.tag, axis.name, axis.min, axis.max, axis.default
    });
}
```

---

### FontsObject (`app.fonts`)

> **Added AE 24.0.** Access and manage all system fonts.

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `allFonts` | Array of Arrays | AE 24.0 | All fonts grouped by family |
| `favoriteFontFamilyList` | String[] | AE 24.6 | R/W favorites list |
| `fontsDuplicateByPostScriptName` | Array of Arrays | AE 24.6 | Fonts with duplicate PS names |
| `fontServerRevision` | Number | AE 24.2 | Font environment change counter |
| `fontsWithDefaultDesignAxes` | Array | AE 24.0 | Variable fonts with default axes |
| `freezeSyncSubstitutedFonts` | Boolean | AE 24.6 | Control Adobe Fonts sync |
| `missingOrSubstitutedFonts` | Array | AE 24.0 | Project's missing/substituted fonts |
| `mruFontFamilyList` | String[] | AE 24.6 | R/W most recently used list |
| `substitutedFontReplacementMatchPolicy` | Enum | AE 24.6 | POSTSCRIPT_NAME (default), CTFI_EQUAL, DISABLED |

#### Methods

**`fonts.getFontByID(fontID)`** *(Added AE 24.2)* — Returns: Font or undefined

**`fonts.getFontsByFamilyNameAndStyleName(familyName, styleName)`** — Returns: Font[]

**`fonts.getFontsByPostScriptName(postscriptName)`** — Returns: Font[]

**`fonts.getCTScriptForString(charString, preferredCTScript)`** *(Added AE 25.1)* — Returns: script assignments with character counts

**`fonts.getDefaultFontForCTScript(ctScript)`** *(Added AE 25.1)* — Returns: Font

**`fonts.setDefaultFontForCTScript(ctScript, font)`** *(Added AE 25.1)* — Returns: Boolean

**`fonts.pollForAndPushNonSystemFontFoldersChanges()`** *(Added AE 24.6)* — Checks non-system font folder changes

```javascript
// Find font by PostScript name
var fonts = app.fonts.getFontsByPostScriptName("MyriadPro-Regular");
alert(fonts.length + " fonts found");

// Access first font family
var firstGroup = app.fonts.allFonts[0];
alert(firstGroup[0].familyName + " " + firstGroup[0].styleName);
```

---

### CharacterRange Object

> **Added AE 24.3.** Access character-level styling across a range.

Access: `textDocument.characterRange(characterStart, [signedCharacterEnd])`

- `characterEnd - characterStart` = number of characters
- When attributes differ across range: returns `undefined`
- Zero-length ranges valid for most attributes

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `characterEnd` | Integer | Calculated end position (read-only) |
| `characterStart` | Integer | Calculated start position (read-only) |
| `fillColor` | Array [r,g,b] | Fill color (`undefined` if mixed) |
| `isRangeValid` | Boolean | Range within TextDocument bounds |
| `kerning` | Integer | Manual kerning (`undefined` if auto-kern or mixed) |
| `strokeColor` | Array [r,g,b] | Stroke color (`undefined` if mixed) |
| `strokeOverFill` | Boolean | Rendering order (`undefined` if mixed) |
| `text` | String | Character content |

#### Methods

**`characterRange.pasteFrom(characterRange)`** *(Added AE 25.1)*
Copies text and styling from source range.

**`characterRange.toString()`** — Returns: String (safe even if invalid)

```javascript
var doc = layer.property("Source Text").value;
var r = doc.characterRange(0, 1);
r.fontSize = r.fontSize + 5;
doc.characterRange(1, -1).fontSize = 40; // -1 = to end
```

---

### ParagraphRange Object

> **Added AE 24.3.** Access paragraph-level ranges within TextDocument.

Access: `textDocument.paragraphRange(paragraphIndexStart, [signedParagraphIndexEnd])`

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `characterEnd` | Integer | Position after last character (read-only) |
| `characterStart` | Integer | First character index (read-only) |
| `isRangeValid` | Boolean | Range within bounds |

#### Methods

**`paragraphRange.characterRange()`** — Returns: CharacterRange

**`paragraphRange.toString()`** — Returns: String

```javascript
var doc = layer.property("Source Text").value;
var para0 = doc.paragraphRange(0, 1);
para0.characterRange().fontSize = 40;
```

---

### ComposedLineRange Object

> **Added AE 24.3.** Access composed-line ranges. Static — doesn't recompose when document is modified.

Access: `textDocument.composedLineRange(composedLineIndexStart, [signedComposedLineIndexEnd])`

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `characterEnd` | Integer | Calculated end position (read-only) |
| `characterStart` | Integer | Calculated start position (read-only) |
| `isRangeValid` | Boolean | Range within bounds |

#### Methods

**`composedLineRange.characterRange()`** — Returns: CharacterRange

**`composedLineRange.toString()`** — Returns: String

```javascript
var doc = layer.property("Source Text").value;
doc.composedLineRange(0, 1).characterRange().fillColor = [1.0, 0, 0];
doc.composedLineRange(1, -1).characterRange().fillColor = [0, 0, 1.0];
```

---

## Other

### Collection Object

Base class for ItemCollection, LayerCollection, OMCollection, RQItemCollection.

**Important:** Collections are 1-indexed, not 0-indexed.

| Attribute | Description |
|-----------|-------------|
| `length` | Count of objects |

Access items via `collection[index]` (1-based).

---

### ImportOptions Object

**Constructor:** `new ImportOptions()` or `new ImportOptions(file)`

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `file` | File | File to import |
| `forceAlphabetical` | Boolean | Force alphabetical ordering |
| `importAs` | ImportAsType | COMP_CROPPED_LAYERS, FOOTAGE, COMP, PROJECT |
| `rangeEnd` | Integer | End of clipping range for sequences |
| `rangeStart` | Integer | Start of clipping range |
| `sequence` | Boolean | Import as sequence |

#### Methods

**`importOptions.canImportAs(type)`** — Returns: Boolean

**`importOptions.isFileNameNumbered(file)`** — Returns: `{isNumbered: Boolean, num: Integer}`

```javascript
var io = new ImportOptions(new File("c:\\myFile.psd"));
if (io.canImportAs(ImportAsType.COMP)) {
    io.importAs = ImportAsType.COMP;
}
app.project.importFile(io);

// Sequence import (frames 10–30)
var io2 = new ImportOptions();
io2.file = new File("~/sequence/image_000.png");
io2.sequence = true;
io2.rangeStart = 10;
io2.rangeEnd = 30;
app.project.importFile(io2);
```

---

### KeyframeEase Object

**Constructor:** `new KeyframeEase(speed, influence)`

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `speed` | Float | — | Speed value |
| `influence` | Float | 0.1–100.0 | Influence percentage |

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `speed` | Float | Speed value |
| `influence` | Float [0.1–100] | Influence value |

```javascript
var easeIn = new KeyframeEase(0.5, 50);
var easeOut = new KeyframeEase(0.75, 85);
myLayer.property("Position").setTemporalEaseAtKey(2, [easeIn], [easeOut]);

// Multi-dimensional (Scale)
myLayer.property("Scale").setTemporalEaseAtKey(2,
    [easeIn, easeIn, easeIn],
    [easeOut, easeOut, easeOut]
);
```

---

### MarkerValue Object

**Constructor:** `new MarkerValue(comment[, chapter, url, frameTarget, cuePointName, params])`

#### Attributes

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `chapter` | String | — | QuickTime chapter link |
| `comment` | String | — | Timeline display text |
| `cuePointName` | String | — | Flash Video cue point name |
| `duration` | Float | AE 9.0 | Marker duration in seconds |
| `eventCuePoint` | Boolean | — | Event vs navigation cue point |
| `frameTarget` | String | — | Web page frame target |
| `label` | Integer (0–16) | AE 16.0 | Label color |
| `protectedRegion` | Boolean | AE 16.0 | Protected region |
| `url` | String | — | Web page link |

#### Methods

**`markerValue.getParameters()`** — Returns: Object (key-value pairs)

**`markerValue.setParameters(keyValuePairs)`**

```javascript
// Layer marker
var mv = new MarkerValue("Scene change");
mv.duration = 1;
myLayer.property("Marker").setValueAtTime(2, mv);

// Composition marker
comp.markerProperty.setValueAtTime(5, new MarkerValue("Act 2"));
```

---

### Shape Object

**Constructor:** `new Shape()`

Represents mask path or shape layer path values.

#### Attributes

| Attribute | Type | Description |
|-----------|------|-------------|
| `closed` | Boolean | First and last vertices connected |
| `vertices` | Array of [x,y] | Anchor points |
| `inTangents` | Array of [x,y] | Incoming direction handles |
| `outTangents` | Array of [x,y] | Outgoing direction handles |
| `featherSegLocs` | Integer[] | Segment containing each feather point |
| `featherRelSegLocs` | Float[] | Position along segment [0–1] |
| `featherRadii` | Float[] | Feather amounts (negative=inner) |
| `featherTypes` | Integer[] | 0=outer, 1=inner |
| `featherTensions` | Float[] | Tension [0–1] |
| `featherInterps` | Integer[] | 0=non-Hold, 1=Hold |
| `featherRelCornerAngles` | Float[] | Corner angle percentages [0–100] |

**Note:** RotoBezier masks auto-calculate tangents; set `inTangents`/`outTangents` to `null`.

```javascript
// Square mask
var s = new Shape();
s.vertices = [[0,0], [0,100], [100,100], [100,0]];
s.closed = true;

// Oval with tangents
var oval = new Shape();
oval.vertices = [[300,50], [200,150], [300,250], [400,150]];
oval.inTangents = [[55.23,0], [0,-55.23], [-55.23,0], [0,55.23]];
oval.outTangents = [[-55.23,0], [0,55.23], [55.23,0], [0,-55.23]];
oval.closed = true;
```

---

### View Object

Access: `app.activeViewer.views[0]`

| Attribute | Type | Description |
|-----------|------|-------------|
| `active` | Boolean | Panel frontmost and focused |
| `options` | ViewOptions | Display settings |

**`view.setActive()`** — Brings view to front. Returns: Boolean

---

### Viewer Object

Access: `app.activeViewer`

| Attribute | Type | Description |
|-----------|------|-------------|
| `active` | Boolean | Panel focused |
| `activeViewIndex` | Integer | Current active View index |
| `maximized` | Boolean | Maximized state |
| `type` | ViewerType | VIEWER_COMPOSITION, VIEWER_LAYER, VIEWER_FOOTAGE |
| `views` | View[] | All View objects |

**`viewer.setActive()`** — Returns: Boolean

```javascript
var viewer = app.activeViewer;
viewer.maximized = true;
if (viewer.type === ViewerType.VIEWER_COMPOSITION) {
    alert("Comp panel active");
}
```

---

### ViewOptions Object

Access: `app.activeViewer.views[0].options`

| Attribute | Type | Added | Description |
|-----------|------|-------|-------------|
| `channels` | ChannelType | — | Channel display (CHANNEL_RGB, CHANNEL_RED, etc.) |
| `checkerboards` | Boolean | — | Transparency grid |
| `exposure` | Float [-40..40] | — | Exposure adjustment |
| `fastPreview` | FastPreviewType | AE 12.0 | FP_OFF, FP_ADAPTIVE_RESOLUTION, FP_DRAFT, FP_FAST_DRAFT, FP_WIREFRAME |
| `guidesLocked` | Boolean | AE 16.1 | Guides locked |
| `guidesSnap` | Boolean | AE 16.1 | Snap to guides |
| `guidesVisibility` | Boolean | AE 16.1 | Guide visibility |
| `rulers` | Boolean | AE 16.1 | Show rulers |
| `zoom` | Float [0.01..16] | — | Zoom level (1.0 = 100%) |

---

### Preferences Object (`app.preferences`)

Manages After Effects internal preferences.

#### PREFType Enum Values

| Value | File |
|-------|------|
| `PREF_Type_MACHINE_SPECIFIC` | AE Prefs.txt |
| `PREF_Type_MACHINE_INDEPENDENT` | AE Prefs-indep-general.txt |
| `PREF_Type_MACHINE_INDEPENDENT_RENDER` | AE Prefs-indep-render.txt |
| `PREF_Type_MACHINE_INDEPENDENT_OUTPUT` | AE Prefs-indep-output.txt |
| `PREF_Type_MACHINE_INDEPENDENT_COMPOSITION` | AE Prefs-indep-composition.txt |
| `PREF_Type_MACHINE_SPECIFIC_TEXT` | AE Prefs-text.txt |
| `PREF_Type_MACHINE_SPECIFIC_PAINT` | AE Prefs-paint.txt |

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `deletePref(section, key[, prefType])` | Nothing | Deletes preference |
| `getPrefAsBool(section, key[, prefType])` | Boolean | Read boolean pref |
| `getPrefAsFloat(section, key[, prefType])` | Float | Read float pref |
| `getPrefAsLong(section, key[, prefType])` | Long | Read long/integer pref |
| `getPrefAsString(section, key[, prefType])` | String | Read string pref |
| `havePref(section, key[, prefType])` | Boolean | Check if pref exists |
| `reload()` | Nothing | Reload preferences file |
| `savePrefAsBool(section, key, value[, prefType])` | Nothing | Save boolean pref |
| `savePrefAsFloat(section, key, value[, prefType])` | Nothing | Save float pref |
| `savePrefAsLong(section, key, value[, prefType])` | Nothing | Save long pref |
| `savePrefAsString(section, key, value[, prefType])` | Nothing | Save string pref |
| `saveToDisk()` | Nothing | Persist preferences to disk |

```javascript
var debuggerOn = app.preferences.getPrefAsBool(
    "Main Pref Section v2",
    "Pref_JAVASCRIPT_DEBUGGER",
    PREFType.PREF_Type_MACHINE_INDEPENDENT
);
```

---

### Settings Object (`app.settings`)

Persistent script settings stored in AE preferences file.

- All values stored as strings
- Section names prepended internally with `"Settings_"`
- Maximum value: 1999 bytes

#### Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getSetting(section, key[, prefType])` | String | Read setting |
| `haveSetting(section, key[, prefType])` | Boolean | Check if setting exists |
| `saveSetting(section, key, value[, prefType])` | Nothing | Save setting |

```javascript
app.settings.saveSetting("MyScript", "lastUsedFolder", "C:/Projects");
var folder = app.settings.getSetting("MyScript", "lastUsedFolder");
```

---

## Match Names Reference

Match names are stable identifiers that don't change with locale or version updates. Always prefer match names over display names in production scripts.

### AV Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE AV Layer` | (AV layer base) |
| `ADBE Marker` | Marker |
| `ADBE Time Remapping` | Time Remap |
| `ADBE MTrackers` | Motion Trackers |
| `ADBE Mask Parade` | Masks |
| `ADBE Effect Parade` | Effects |
| `ADBE Layer Overrides` | Essential Properties |
| `ADBE Transform Group` | Transform |
| `ADBE Anchor Point` | Anchor Point |
| `ADBE Position` | Position |
| `ADBE Position_0` | X Position |
| `ADBE Position_1` | Y Position |
| `ADBE Position_2` | Z Position |
| `ADBE Scale` | Scale |
| `ADBE Orientation` | Orientation |
| `ADBE Rotate X` | X Rotation |
| `ADBE Rotate Y` | Y Rotation |
| `ADBE Rotate Z` | Rotation (Z) |
| `ADBE Opacity` | Opacity |
| `ADBE Audio Group` | Audio |
| `ADBE Audio Levels` | Audio Levels |
| `ADBE Layer Source Alternate` | Layer Source Alternate |

### 3D Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Plane Options Group` | Geometry Options |
| `ADBE Plane Curvature` | Curvature |
| `ADBE Plane Subdivision` | Segments |
| `ADBE Extrsn Options Group` | Extrusion Options |
| `ADBE Bevel Depth` | Bevel Depth |
| `ADBE Hole Bevel Depth` | Hole Bevel Depth |
| `ADBE Extrsn Depth` | Extrusion Depth |
| `ADBE Material Options Group` | Material Options |
| `ADBE Ambient Coefficient` | Ambient |
| `ADBE Diffuse Coefficient` | Diffuse |
| `ADBE Specular Coefficient` | Specular |
| `ADBE Shininess Coefficient` | Shininess |
| `ADBE Metal Coefficient` | Metal |
| `ADBE Reflection Coefficient` | Reflection |
| `ADBE Glossiness Coefficient` | Glossiness |
| `ADBE Fresnel Coefficient` | Fresnel |
| `ADBE Transparency Coefficient` | Transparency |
| `ADBE Transp Rolloff` | Transparency Rolloff |
| `ADBE Index of Refraction` | Index of Refraction |
| `ADBE Light Transmission` | Light Transmission |

### Camera Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Camera Layer` | (Camera layer base) |
| `ADBE Camera Options Group` | Camera Options |
| `ADBE Camera Zoom` | Zoom |
| `ADBE Camera Depth of Field` | Depth of Field |
| `ADBE Camera Focus Distance` | Focus Distance |
| `ADBE Camera Aperture` | Aperture |
| `ADBE Camera Blur Level` | Blur Level |
| `ADBE Iris Shape` | Iris Shape |
| `ADBE Iris Rotation` | Iris Rotation |
| `ADBE Iris Roundness` | Iris Roundness |
| `ADBE Iris Aspect Ratio` | Iris Aspect Ratio |
| `ADBE Iris Diffraction Fringe` | Iris Diffraction Fringe |
| `ADBE Iris Highlight Gain` | Highlight Gain |
| `ADBE Iris Highlight Threshold` | Highlight Threshold |
| `ADBE Iris Hightlight Saturation` | Highlight Saturation |

### Light Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Light Layer` | (Light layer base) |
| `ADBE Light Options Group` | Light Options |
| `ADBE Light Intensity` | Intensity |
| `ADBE Light Color` | Color |
| `ADBE Light Cone Angle` | Cone Angle |
| `ADBE Light Cone Feather 2` | Cone Feather |
| `ADBE Light Falloff Type` | Falloff |
| `ADBE Light Falloff Start` | Radius |
| `ADBE Light Falloff Distance` | Falloff Distance |
| `ADBE Light Shadow Darkness` | Shadow Darkness |
| `ADBE Light Shadow Diffusion` | Shadow Diffusion |

### Text Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Text Layer` | (Text layer base) |
| `ADBE Text Properties` | Text |
| `ADBE Text Document` | Source Text |
| `ADBE Text Path Options` | Path Options |
| `ADBE Text Reverse Path` | Reverse Path |
| `ADBE Text Perpendicular To Path` | Perpendicular To Path |
| `ADBE Text Force Align Path` | Force Alignment |
| `ADBE Text First Margin` | First Margin |
| `ADBE Text Last Margin` | Last Margin |
| `ADBE Text More Options` | More Options |
| `ADBE Text Variable Font Spacing` | Variable Font Spacing |
| `ADBE Text Anchor Point Align` | Grouping Alignment |
| `ADBE Text Animators` | Animators |

### Shape Layer Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Vector Layer` | Shape Layer |
| `ADBE Root Vectors Group` | Contents |
| `ADBE Vector Group` | Group |
| `ADBE Vector Blend Mode` | Blend Mode |
| `ADBE Vectors Group` | (Group) Contents |
| `ADBE Vector Transform Group` | Transform |
| `ADBE Vector Anchor` | Anchor Point |
| `ADBE Vector Position` | Position |
| `ADBE Vector Scale` | Scale |
| `ADBE Vector Skew` | Skew |
| `ADBE Vector Skew Axis` | Skew Axis |
| `ADBE Vector Rotation` | Rotation |
| `ADBE Vector Group Opacity` | Opacity |
| `ADBE Vector Shape - Rect` | Rectangle |
| `ADBE Vector Rect Size` | Size |
| `ADBE Vector Rect Position` | Position |
| `ADBE Vector Rect Roundness` | Roundness |
| `ADBE Vector Shape - Ellipse` | Ellipse |
| `ADBE Vector Ellipse Size` | Size |
| `ADBE Vector Ellipse Position` | Position |
| `ADBE Vector Shape - Star` | Polystar |
| `ADBE Vector Star Type` | Type |
| `ADBE Vector Star Points` | Points |
| `ADBE Vector Star Position` | Position |
| `ADBE Vector Star Rotation` | Rotation |
| `ADBE Vector Star Inner Radius` | Inner Radius |
| `ADBE Vector Star Outer Radius` | Outer Radius |
| `ADBE Vector Shape - Group` | Path |
| `ADBE Vector Shape` | Path |
| `ADBE Vector Graphic - Fill` | Fill |
| `ADBE Vector Fill Rule` | Fill Rule |
| `ADBE Vector Fill Color` | Color |
| `ADBE Vector Fill Opacity` | Opacity |
| `ADBE Vector Graphic - Stroke` | Stroke |
| `ADBE Vector Stroke Color` | Color |
| `ADBE Vector Stroke Opacity` | Opacity |
| `ADBE Vector Stroke Width` | Stroke Width |
| `ADBE Vector Stroke Line Cap` | Line Cap |
| `ADBE Vector Stroke Line Join` | Line Join |
| `ADBE Vector Stroke Miter Limit` | Miter Limit |
| `ADBE Vector Stroke Dashes` | Dashes |
| `ADBE Vector Stroke Offset` | Offset |
| `ADBE Vector Stroke Taper` | Taper |
| `ADBE Vector Stroke Wave` | Wave |
| `ADBE Vector Graphic - G-Fill` | Gradient Fill |
| `ADBE Vector Grad Type` | Type |
| `ADBE Vector Grad Start Pt` | Start Point |
| `ADBE Vector Grad End Pt` | End Point |
| `ADBE Vector Grad Colors` | Colors |
| `ADBE Vector Graphic - G-Stroke` | Gradient Stroke |
| `ADBE Vector Filter - Merge` | Merge Paths |
| `ADBE Vector Filter - Offset` | Offset Paths |
| `ADBE Vector Offset Amount` | Amount |
| `ADBE Vector Offset Copies` | Copies |
| `ADBE Vector Offset Copy Offset` | Copy Offset |
| `ADBE Vector Filter - PB` | Pucker & Bloat |
| `ADBE Vector Filter - Repeater` | Repeater |
| `ADBE Vector Filter - RC` | Round Corners |
| `ADBE Vector Filter - Trim` | Trim Paths |
| `ADBE Vector Trim Start` | Start |
| `ADBE Vector Trim End` | End |
| `ADBE Vector Trim Offset` | Offset |
| `ADBE Vector Filter - Twist` | Twist |
| `ADBE Vector Filter - Roughen` | Wiggle Paths |
| `ADBE Vector Filter - Wiggler` | Wiggle Transform |
| `ADBE Vector Filter - Zigzag` | Zig Zag |

### Layer Styles Match Names

| Match Name | Display Name |
|---|---|
| `ADBE Blend Options Group` | Blending Options |
| `ADBE Global Angle2` | Global Light Angle |
| `ADBE Global Altitude2` | Global Light Altitude |
| `dropShadow/enabled` | Drop Shadow |
| `dropShadow/mode2` | Blend Mode |
| `dropShadow/color` | Color |
| `dropShadow/opacity` | Opacity |
| `dropShadow/distance` | Distance |
| `dropShadow/blur` | Size |
| `innerShadow/enabled` | Inner Shadow |
| `outerGlow/enabled` | Outer Glow |
| `innerGlow/enabled` | Inner Glow |
| `bevelEmboss/enabled` | Bevel and Emboss |
| `chromeFX/enabled` | Satin |
| `solidFill/enabled` | Color Overlay |
| `gradientFill/enabled` | Gradient Overlay |
| `patternFill/enabled` | Pattern Overlay |
| `frameFX/enabled` | Stroke |

### Effect Match Names (First-Party)

#### Expression Controls

| Match Name | Display Name |
|---|---|
| `ADBE Point3D Control` | 3D Point Control |
| `ADBE Angle Control` | Angle Control |
| `ADBE Checkbox Control` | Checkbox Control |
| `ADBE Color Control` | Color Control |
| `ADBE Dropdown Control` | Dropdown Control |
| `ADBE Layer Control` | Layer Control |
| `ADBE Point Control` | Point Control |
| `ADBE Slider Control` | Slider Control |

#### Common Effects

| Match Name | Display Name | BPC | GPU |
|---|---|---|---|
| `ADBE Gaussian Blur 2` | Gaussian Blur | 32 | 13.8 |
| `ADBE Box Blur2` | Fast Box Blur | 32 | 14.2 |
| `ADBE Motion Blur` | Directional Blur | 32 | 15.0 |
| `ADBE HUE SATURATION` | Hue/Saturation | 32 | 14.1 |
| `ADBE Lumetri` | Lumetri Color | 32 | 13.8 |
| `ADBE CurvesCustom` | Curves | 32 | — |
| `ADBE Easy Levels2` | Levels | 32 | 14.2 |
| `ADBE Drop Shadow` | Drop Shadow | 32 | 14.2 |
| `ADBE Glo2` | Glow | 32 | 14.1 |
| `ADBE Fractal Noise` | Fractal Noise | 32 | 14.2 |
| `ADBE Corner Pin` | Corner Pin | 32 | — |
| `ADBE SubspaceStabilizer` | Warp Stabilizer VFX | 32 | — |
| `ADBE 3D Tracker` | 3D Camera Tracker | 32 | — |
| `ADBE Turbulent Displace` | Turbulent Displace | 32 | — |
| `Keylight 906` | Keylight (1.2) | 32 | — |

> **See the complete effect match names table** in the source documentation at https://ae-scripting.docsforadobe.dev/matchnames/effects/firstparty/ — the full list covers 200+ effects across 3D Channel, Audio, Blur, Channel, Color Correction, Distort, Generate, Keying, Matte, Noise, Perspective, Simulation, Stylize, Text, Time, Transition, and Utility categories.

---

## Changelog

### After Effects 26.0 (January 2026)

> **New in AE 26.0:**

- `PropertyGroup.addVariableFontAxis()` — Adds variable font axis property to text animator
- `Property.propertyParameters` — Read-only array of dropdown menu items
- `Property.valueText` — Read-only text of currently selected dropdown item

### After Effects 25.4 (August 2025)
- `app.restart()`

### After Effects 25.2 (April 2025)
- `LightLayer.lightSource` — Expanded to all 2D layer types (previously HDR/EXR only)

### After Effects 25.1 (December 2024)
- `CharacterRange.pasteFrom()`
- `FontObject.hasGlyphsFor()`
- `FontObject.otherFontsWithSameDict`
- `FontsObject.getCTScriptForString()`
- `FontsObject.getDefaultFontForCTScript()`
- `FontsObject.setDefaultFontForCTScript()`

### After Effects 24.6 (August 2024)
- `FontsObject.favoriteFontFamilyList`
- `FontsObject.fontsDuplicateByPostScriptName`
- `FontsObject.freezeSyncSubstitutedFonts`
- `FontsObject.mruFontFamilyList`
- `FontsObject.substitutedFontReplacementMatchPolicy`
- `FontsObject.pollForAndPushNonSystemFontFoldersChanges()`
- `TextDocument.boxAutoFitPolicy`
- `TextDocument.boxFirstBaselineAlignment`
- `TextDocument.boxFirstBaselineAlignmentMinimum`
- `TextDocument.boxInsetSpacing`
- `TextDocument.boxOverflow`
- `TextDocument.boxVerticalAlignment`

### After Effects 24.5 (May 2024)
- `Project.replaceFont()`
- `Project.usedFonts`

### After Effects 24.4 (May 2024)
- `ThreeDModelLayer` object

### After Effects 24.3 (March 2024)
- `CharacterRange` object
- `ParagraphRange` object
- `ComposedLineRange` object
- `TextDocument.characterRange()`
- `TextDocument.composedLineCharacterIndexesAt()`
- `TextDocument.composedLineCount`
- `TextDocument.composedLineRange()`
- `TextDocument.paragraphCharacterIndexesAt()`
- `TextDocument.paragraphCount`
- `TextDocument.paragraphRange()`
- `app.purge()` updated — `ALL_CACHES` now includes disk cache
- `LightLayer.lightSource` (initial, HDR/EXR only)
- `LightType.ENVIRONMENT`

### After Effects 24.2 (February 2024)
- `LayerCollection.addVerticalText()`
- `LayerCollection.addVerticalBoxText()`
- `TextDocument.lineOrientation`
- `FontsObject.fontServerRevision`
- `FontsObject.getFontByID()`
- `FontObject.fontID`

### After Effects 24.0 (October 2023)
- `getEnumAsString()` global function
- `app.fonts`
- `FontsObject` object + all methods/attributes
- `FontObject` object + all attributes
- Extensive `TextDocument` typography properties (autoHyphenate, autoKernType, baselineDirection, composerEngine, digitSet, direction, endIndent, everyLineComposer, firstLineIndent, fontBaselineOption, fontCapsOption, fontObject, hangingRoman, kerning, leadingType, ligature, lineJoinType, noBreak, spaceAfter, spaceBefore, startIndent, updated fauxBold/fauxItalic/justification)

### After Effects 23.0 (October 2022)
- `AVLayer.setTrackMatte()`
- `AVLayer.removeTrackMatte()`
- `AVLayer.trackMatteLayer`
- Updated `AVLayer.trackMatteType`, `isTrackMatte`, `hasTrackMatte`

### After Effects 22.6 (August 2022)
- `Property.keyLabel()`
- `Property.setLabelAtKey()`

### After Effects 22.3 (April 2022)
- `Layer.doSceneEditDetection()`

### After Effects 22.0 (October 2021)
- `Layer.id`
- `Project.layerByID()`
- `Property.essentialPropertySource`
- `app.setMultiFrameRenderingConfig()`
- `RenderQueue.queueNotify`
- `RenderQueueItem.queueItemNotify`

### After Effects 18.0 (March 2021)
- `AVItem.isMediaReplacementCompatible`
- `AVLayer.addToMotionGraphicsTemplate()`
- `AVLayer.addToMotionGraphicsTemplateAs()`
- `AVLayer.canAddToMotionGraphicsTemplate()`
- `Property.alternateSource`
- `Property.canSetAlternateSource`
- `Property.setAlternateSource()`

### After Effects 17.1.1 (May 2020)
- `CompItem.displayStartFrame`

### After Effects 17.0.1 (November 2019)
- `Property.isDropdownEffect`
- `Property.setPropertyParameters()`

### After Effects 16.1 (CC 2019 mid-cycle)
- `ViewOptions.guidesLocked`, `guidesSnap`, `guidesVisibility`, `rulers`
- `Item.addGuide()`, `removeGuide()`, `setGuide()`
- `CompItem.motionGraphicsTemplateControllerCount`
- `CompItem.getMotionGraphicsTemplateControllerName()`
- `CompItem.setMotionGraphicsControllerName()`
- `Property.addToMotionGraphicsTemplateAs()`

### After Effects 16.0 (October 2018)
- `MarkerValue.label`, `protectedRegion`
- `Project.workingSpace`, `workingGamma`, `listColorProfiles()`, `linearizeWorkingSpace`, `compensateForSceneReferredProfiles`
- `Project.expressionEngine`
- `Project.setDefaultImportFolder()`
- `app.disableRendering`

### After Effects 15.0 (October 2017)
- `CompItem.motionGraphicsTemplateName`
- `CompItem.exportAsMotionGraphicsTemplate()`
- `CompItem.openInEssentialGraphics()`
- `Property.addToMotionGraphicsTemplate()`
- `Property.canAddToMotionGraphicsTemplate()`

### After Effects 14.2 (CC 2017.1, April 2017)
- `TextDocument.leading`
- Full Team Projects API (15 methods on Project object)

### After Effects 14.0 (CC 2017, November 2016)
- `Project.toolType`
- `CompItem.markerProperty`
- `RenderQueue.queueInAME()`
- `app.availableGPUAccelTypes`

### After Effects 13.8 (CC 2015.3, June 2016)
- `Project.gpuAccelType`

### After Effects 13.6 (CC 2015, November 2015)
- `TextDocument.baselineLocs`
- `generateRandomNumber()`

### After Effects 13.2 (CC 2014.2, December 2014)
- `TextDocument.fauxBold/fauxItalic/allCaps/smallCaps/superscript/subscript` (read-only)
- `TextDocument.verticalScale/horizontalScale/baselineShift/tsume` (read-only)
- `TextDocument.boxTextPos`
- `AVLayer.sourcePointToComp()`, `compPointToSource()`

### After Effects 13.0 (CC 2014, June 2014)
- `RenderQueueItem.getSetting/setSetting/getSettings/setSettings()`
- `OutputModule.getSetting/setSetting/getSettings/setSettings()`
- `Project.itemByID()`

### After Effects 12.0 (CC, June 2013)
- `app.effects` version attribute
- `ViewOptions.fastPreview`
- `AVLayer.samplingQuality`

### After Effects 11.0 (CS6, April 2012)
- `app.activeViewer`
- `AVLayer.openInViewer()`, `CompItem.openInViewer()`, `FootageItem.openInViewer()`
- `Property.canSetExpression`
- `AVLayer.environmentLayer`
- `MaskPropertyGroup.maskFeatherFalloff`
- Shape feather properties

### After Effects 10.5 (CS5.5, April 2011)
- Project timecode properties
- `CompItem.dropFrame`
- `LayerCollection.addBoxText()`
- `TextDocument.boxText/pointText/boxTextSize`
- `LightLayer.lightType`

### After Effects 9.0 (CS4, September 2008)
- `app.isoLanguage`
- `MarkerValue.duration`
- `OutputModule.includeSourceXMP`
- `Project.xmpPacket`
- Property dimension separation (`dimensionsSeparated`, `getSeparationFollower`, etc.)
- `TextDocument` object initial release

---

*Source: https://ae-scripting.docsforadobe.dev/*
*Scraped: 2026-04-19*
*Coverage: AE 26.0 (January 2026)*
