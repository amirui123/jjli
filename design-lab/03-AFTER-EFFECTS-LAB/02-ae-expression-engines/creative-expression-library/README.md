# Creative Expression Library

The Creative Expression Library makes complex expressions accessible to both novice and advanced users via a plug-and-play interface, and results in improved performance in both After Effects projects and Motion Graphics Templates (.mogrt).

For more info, check out the guides on Adobe Express:

- [Overview and Getting Started](https://express.adobe.com/page/z7ZLsCdt0MiDT/)
- [Glossary & In-Depth Usage](https://express.adobe.com/page/NVS7xYdyquXGO/)

This library is a collection of expression functions for Adobe After Effects. These functions are **self-documenting** with descriptions and examples displayed through expression errors.

All the included functions are designed to help with common animation tasks which utilize expressions, including:
 - Matching the size of one layer to another
 - Formatting numbers
 - Reading the true post-parent attributes of parented Layers
 - Looping paths
 - Linking individual keyframes to expression controls
 - Much more!

## Installation

1. Download the latest release of [CreativeExpressionLibrary-v2.1.jsx](https://github.com/jthomascolombo/creative-expression-library/releases/download/v2.1.0/CreativeExpressionLibrary-v2.1.jsx)
2. Import the CreativeExpressionLibrary-v2.1.jsx into After Effects as footage.
3. Drag the .jsx footage into the Composition where the expression library will be used. This will ensure that the .jsx file is included when the project assets are collected, as in the case of Collect Files, sending Compositions to AME, or exporting Motion Graphic Templates.

## Usage

> **_Important:_**  After Effects' expression engine must be set to JavaScript to use this library. Set the expression engine in File > Project Settings... > Expressions > Expression Engine.

To "import" the expression functions into an individual expression, pick-whip to the CreativeExpressionLibrary in the Project panel, then add `.sourceData` to create the following on line 1 on your expression:

```footage("CreativeExpressionLibrary.jsx").sourceData;```

After the library is imported, the functions within can be called on the `createLib` object:

```footage("CreativeExpressionLibrary.jsx").sourceData;
createLib.flipHorizontal();
```

## Help

This expression library and the functions within are "self-documenting" in that they can throw a helpful error describing their own usage.

To see a list of all functions contained within the library, use the `createLib.getInfo()` function without any arguments.

To see the help displayed for a specific function, you can either call `createLib.getInfo()` again with a function's name string as the only argument:

```createLib.getInfo( "functionNameString" )```

Or you can pass the string `"help"` as the *first* argument to any of the functions:

```createLib.formatNumber( "help" )```

In most properties, the help text will be displayed as an expression error. The only exception is a Source Text property; calling for help in a Source Text property will change the Source Text to the help text.

Some of the expressions contain warnings of possible unexpected behavior. Search for "@warning" to see them in the library itself. If a function from this library throws an error which mentions it is a warning, the error can be turned on by using:

```showWarnings = false```

on the line above where the function is being called. These warnings can also be disabled within the .jsx file itself by uncommenting the `return false` within the `showWarnings()` function declaration.

## Legal

© 2024 Adobe Incorporated
All Rights Reserved.
