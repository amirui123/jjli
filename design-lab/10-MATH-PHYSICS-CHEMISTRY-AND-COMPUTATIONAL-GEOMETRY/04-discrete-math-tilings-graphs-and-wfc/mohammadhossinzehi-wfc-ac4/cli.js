#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { OverlappingModel, TiledModel, generate, toText } from './src/index.js';

const USAGE = `usage:
  node cli.js overlapping <sample.txt> [options]
  node cli.js tiled <tileset.json> [options]

options:
  --width <n>        output width  (pixels for overlapping, tiles for tiled)   default 48 / 16
  --height <n>       output height                                               default 24 / 8
  --seed <n>         RNG seed                                                    default 1
  --periodic         wrap the output around both axes
  --N <n>            pattern size for the overlapping model                      default 3
  --symmetry <1..8>  how many rotations/reflections to learn                     default 8
  --no-wrap-input    do not wrap the sample when extracting patterns
  --attempts <n>     restarts allowed if backtracking gives up                   default 10
  --stats            print solver statistics to stderr`;

function parseArgs(argv) {
  const opts = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (!a.startsWith('--')) {
      opts._.push(a);
      continue;
    }
    const key = a.slice(2);
    if (['periodic', 'stats', 'no-wrap-input', 'help'].includes(key)) {
      opts[key] = true;
    } else {
      const v = argv[++i];
      if (v === undefined) throw new Error(`missing value for ${a}`);
      opts[key] = Number(v);
      if (!Number.isFinite(opts[key])) throw new Error(`${a} expects a number, got ${v}`);
    }
  }
  return opts;
}

function main() {
  let opts;
  try {
    opts = parseArgs(process.argv.slice(2));
  } catch (e) {
    console.error(e.message + '\n\n' + USAGE);
    return 2;
  }
  const [kind, file] = opts._;
  if (opts.help || !kind || !file) {
    console.error(USAGE);
    return opts.help ? 0 : 2;
  }

  let model;
  let defaults;
  if (kind === 'overlapping') {
    model = OverlappingModel.fromText(readFileSync(file, 'utf8'), {
      N: opts.N ?? 3,
      symmetry: opts.symmetry ?? 8,
      periodicInput: !opts['no-wrap-input'],
    });
    defaults = [48, 24];
  } else if (kind === 'tiled') {
    model = new TiledModel(JSON.parse(readFileSync(file, 'utf8')));
    defaults = [16, 8];
  } else {
    console.error(`unknown model "${kind}"\n\n${USAGE}`);
    return 2;
  }

  const started = process.hrtime.bigint();
  try {
    const result = generate(model, {
      width: opts.width ?? defaults[0],
      height: opts.height ?? defaults[1],
      seed: opts.seed ?? 1,
      periodic: !!opts.periodic,
      attempts: opts.attempts ?? 10,
    });
    console.log(toText(result.image));
    if (opts.stats) {
      const ms = Number(process.hrtime.bigint() - started) / 1e6;
      console.error(
        `patterns=${model.weights.length} attempts=${result.attempts} observations=${result.stats.observations} ` +
          `bans=${result.stats.bans} backtracks=${result.stats.backtracks} time=${ms.toFixed(1)}ms`,
      );
    }
    return 0;
  } catch (e) {
    console.error(e.message);
    return 1;
  }
}

process.exitCode = main();
