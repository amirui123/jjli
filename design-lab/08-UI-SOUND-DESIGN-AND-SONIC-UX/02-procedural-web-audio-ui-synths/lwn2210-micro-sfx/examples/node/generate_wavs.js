const fs = require('fs');
const path = require('path');
const { sfx, PRESETS } = require('../../dist/index.js');

const outDir = path.join(__dirname, 'output');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('🔊 Exporting all micro-sfx presets to WAV files...\n');

const presets = Object.keys(PRESETS);
for (const name of presets) {
  const wavBytes = sfx.encodeWAV(name);
  const filePath = path.join(outDir, `${name}.wav`);
  fs.writeFileSync(filePath, Buffer.from(wavBytes));
  console.log(`  ✓ Exported ${name}.wav (${wavBytes.length} bytes)`);
}

console.log(`\n🎉 Successfully exported ${presets.length} procedural WAV files to examples/node/output/`);
