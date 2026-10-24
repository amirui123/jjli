#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { sfx, PRESETS } from '../index.js';

const args = process.argv.slice(2);
const command = args[0];

function printHelp() {
  console.log(`
🎛️  micro-sfx CLI — Zero-asset procedural sound generator

Usage:
  npx micro-sfx list                     List all built-in sound presets
  npx micro-sfx export <preset> [path]   Export preset to a RIFF WAV file
  npx micro-sfx export-all [dir]         Export all presets to a directory

Options:
  --pitch <float>   Pitch multiplier (default: 1.0)
  --volume <float>  Volume multiplier (default: 1.0)

Examples:
  npx micro-sfx export coin ./sounds/coin.wav
  npx micro-sfx export laser --pitch 1.5
  npx micro-sfx export-all ./public/sfx
`);
}

function parseFlags() {
  let pitch = 1.0;
  let volume = 1.0;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--pitch' && args[i + 1]) {
      pitch = parseFloat(args[i + 1]);
    }
    if (args[i] === '--volume' && args[i + 1]) {
      volume = parseFloat(args[i + 1]);
    }
  }
  return { pitch, volume };
}

if (!command || command === 'help' || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'list') {
  console.log('\n🎛️  Available Presets:\n');
  Object.keys(PRESETS).forEach(p => {
    const spec = PRESETS[p];
    console.log(`  • ${p.padEnd(12)} [${spec.waveform.padEnd(8)}] base: ${spec.frequency}Hz`);
  });
  console.log('\nRun "npx micro-sfx export <preset>" to generate a WAV file.\n');
  process.exit(0);
}

if (command === 'export') {
  const preset = args[1];
  if (!preset) {
    console.error('Error: Please specify a preset name to export. Run "npx micro-sfx list" to see options.');
    process.exit(1);
  }

  const { pitch, volume } = parseFlags();
  let targetPath = args[2] && !args[2].startsWith('--') ? args[2] : `${preset}.wav`;
  if (!targetPath.endsWith('.wav')) targetPath += '.wav';

  try {
    const wavBytes = sfx.encodeWAV(preset, { pitch, volume });
    const fullPath = path.resolve(process.cwd(), targetPath);
    const dir = path.dirname(fullPath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(fullPath, Buffer.from(wavBytes));
    console.log(`✨ Generated: ${targetPath} (${wavBytes.length} bytes, pitch: ${pitch}x, vol: ${volume}x)`);
  } catch (err) {
    console.error(`Error: ${(err as Error).message}`);
    process.exit(1);
  }
  process.exit(0);
}

if (command === 'export-all') {
  let targetDir = args[1] && !args[1].startsWith('--') ? args[1] : './sfx';
  const { pitch, volume } = parseFlags();
  const fullDir = path.resolve(process.cwd(), targetDir);

  if (!fs.existsSync(fullDir)) fs.mkdirSync(fullDir, { recursive: true });

  const presets = Object.keys(PRESETS);
  console.log(`\n📦 Exporting ${presets.length} presets to ${targetDir}...\n`);

  presets.forEach(p => {
    const wavBytes = sfx.encodeWAV(p, { pitch, volume });
    const filePath = path.join(fullDir, `${p}.wav`);
    fs.writeFileSync(filePath, Buffer.from(wavBytes));
    console.log(`  ✓ Exported ${p}.wav (${wavBytes.length} bytes)`);
  });

  console.log(`\n🎉 Successfully exported all sound presets to ${targetDir}/\n`);
  process.exit(0);
}

console.error(`Unknown command: ${command}`);
printHelp();
process.exit(1);
