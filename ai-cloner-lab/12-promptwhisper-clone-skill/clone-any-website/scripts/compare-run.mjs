import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'compare-screenshots.py');

function runProcess(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => { stdout += chunk; });
    child.stderr.on('data', (chunk) => { stderr += chunk; });
    child.once('error', reject);
    child.once('exit', (code) => resolve({ code, stdout, stderr }));
  });
}

export async function compareCapturedStates(config, outputDirectory, targetCapture, cloneCapture) {
  const targetByKey = new Map(targetCapture.states.map((entry) => [`${entry.viewport}/${entry.state}`, entry]));
  const cloneByKey = new Map(cloneCapture.states.map((entry) => [`${entry.viewport}/${entry.state}`, entry]));
  const results = [];
  for (const state of config.states) {
    const key = `${state.viewport}/${state.name}`;
    const target = targetByKey.get(key);
    const clone = cloneByKey.get(key);
    if (!target || !clone || target.status !== 'captured' || clone.status !== 'captured') {
      results.push({ state: state.name, viewport: state.viewport, status: 'skipped', passed: false, reason: 'Target or clone capture is missing' });
      continue;
    }
    const heatmap = path.join(outputDirectory, 'diffs', state.viewport, `${state.name}.heatmap.png`);
    const metricsPath = path.join(outputDirectory, 'diffs', 'metrics', state.viewport, `${state.name}.json`);
    await mkdir(path.dirname(heatmap), { recursive: true });
    await mkdir(path.dirname(metricsPath), { recursive: true });
    const args = [scriptPath, target.image, clone.image, '--pixel-threshold', String(config.comparison.pixel_threshold)];
    if (config.comparison.write_heatmap) args.push('--output', heatmap);
    if (config.comparison.max_mismatch_ratio !== undefined) args.push('--max-mismatch-ratio', String(config.comparison.max_mismatch_ratio));
    if (config.comparison.max_mae !== undefined) args.push('--max-mae', String(config.comparison.max_mae));
    if (config.paths.mask) args.push('--mask', config.paths.mask);
    if (config.comparison.reference_crop) args.push('--reference-crop', ...config.comparison.reference_crop.map(String));
    if (config.comparison.candidate_crop) args.push('--candidate-crop', ...config.comparison.candidate_crop.map(String));
    if (config.comparison.resize_reference_to_candidate) args.push('--resize-reference-to-candidate');
    const execution = await runProcess(process.env.PYTHON ?? 'python3', args);
    if (![0, 1].includes(execution.code)) {
      results.push({ state: state.name, viewport: state.viewport, status: 'failed', passed: false, reason: execution.stderr.trim() || `Comparator exited ${execution.code}` });
      continue;
    }
    const metrics = JSON.parse(execution.stdout);
    metrics.reference = path.relative(outputDirectory, target.image).split(path.sep).join('/');
    metrics.candidate = path.relative(outputDirectory, clone.image).split(path.sep).join('/');
    metrics.heatmap = config.comparison.write_heatmap ? path.relative(outputDirectory, heatmap).split(path.sep).join('/') : null;
    await writeFile(metricsPath, `${JSON.stringify(metrics, null, 2)}\n`);
    results.push({
      state: state.name,
      viewport: state.viewport,
      status: metrics.passed === false ? 'failed' : metrics.passed === true ? (state.approximation ? 'approximate' : 'exact') : 'unverified',
      passed: metrics.passed,
      target_image: target.image,
      clone_image: clone.image,
      heatmap: config.comparison.write_heatmap ? heatmap : null,
      metrics_path: metricsPath,
      metrics,
      actions: state.actions.map((action) => action.type === 'fill' ? { ...action, value: '[redacted]' } : action),
      approximation: state.approximation ?? null,
      target_metadata: target.details,
      clone_metadata: clone.details,
    });
  }
  return results;
}
