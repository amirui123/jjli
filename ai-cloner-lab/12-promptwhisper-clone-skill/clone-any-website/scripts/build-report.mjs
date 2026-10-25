import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/gu, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);

function relative(outputDirectory, file) {
  return file ? path.relative(outputDirectory, file).split(path.sep).join('/') : null;
}

function imageOrPlaceholder(label, source, className = '') {
  return source
    ? `<img class="${className}" src="${escapeHtml(source)}" alt="${escapeHtml(label)}">`
    : `<div class="placeholder">${escapeHtml(label)} unavailable</div>`;
}

function auditSection(label, audit = {}) {
  const groups = [
    ['Console errors', audit.console_errors], ['Page errors', audit.page_errors],
    ['Request failures', audit.request_failures], ['HTTP failures', audit.http_status_failures],
    ['Target-origin requests', audit.forbidden_target_requests], ['Blocked origins', audit.blocked_origins], ['Unlisted origins', audit.unlisted_origins],
  ];
  return `<section><h2>${escapeHtml(label)} audit</h2>${groups.map(([name, items = []]) => `<details${items.length ? ' open' : ''}><summary>${escapeHtml(name)} <span>${items.length}</span></summary><pre>${escapeHtml(JSON.stringify(items, null, 2))}</pre></details>`).join('')}</section>`;
}

function stateCard(state, outputDirectory) {
  const target = relative(outputDirectory, state.target_image);
  const clone = relative(outputDirectory, state.clone_image);
  const heatmap = relative(outputDirectory, state.heatmap);
  const metrics = state.metrics ?? {};
  const media = [...(state.target_metadata?.action_results ?? []), ...(state.clone_metadata?.action_results ?? [])].filter((entry) => entry.type === 'set_media_time');
  return `<article class="state"><header><div><p class="eyebrow">${escapeHtml(state.viewport)}</p><h3>${escapeHtml(state.state)}</h3></div><span class="pill ${escapeHtml(state.status)}">${escapeHtml(state.status)}</span></header>
    <div class="metrics"><span>Mismatch <b>${metrics.mismatch_ratio ?? '—'}</b></span><span>MAE <b>${metrics.mae_rgb ?? '—'}</b></span><span>RMSE <b>${metrics.rmse_rgb ?? '—'}</b></span><span>P95 <b>${metrics.p95_max_channel_delta ?? '—'}</b></span><span>Gate <b>${metrics.passed === null || metrics.passed === undefined ? 'unverified' : metrics.passed ? 'pass' : 'fail'}</b></span></div>
    ${target && clone ? `<div class="compare"><div class="base">${imageOrPlaceholder('Clone', clone)}</div><div class="overlay">${imageOrPlaceholder('Target', target)}</div><input aria-label="Before and after split" type="range" min="0" max="100" value="50"></div>` : `<div class="pair">${imageOrPlaceholder('Target', target)}${imageOrPlaceholder('Clone', clone)}</div>`}
    <div class="heat"><h4>Heatmap</h4>${imageOrPlaceholder('Heatmap', heatmap)}</div>
    <details><summary>Actions and metadata</summary><pre>${escapeHtml(JSON.stringify({ actions: state.actions ?? [], failure: state.reason ?? null, media }, null, 2))}</pre></details>
  </article>`;
}

export function createReport({ config, startedAt, completedAt, captures, comparisons, audit, checks, failures, skipped, status }) {
  const targetCaptured = new Set((captures.target?.states ?? []).filter((entry) => entry.status === 'captured').map((entry) => `${entry.viewport}/${entry.state}`));
  const cloneCaptured = new Set((captures.clone?.states ?? []).filter((entry) => entry.status === 'captured').map((entry) => `${entry.viewport}/${entry.state}`));
  const requiresClone = Boolean(captures.clone);
  const capturedStates = config.states.filter((state) => targetCaptured.has(`${state.viewport}/${state.name}`) && (!requiresClone || cloneCaptured.has(`${state.viewport}/${state.name}`))).length;
  return {
    version: 1,
    status,
    target_url: config.target.url,
    clone_url: config.clone.url,
    started_at: startedAt,
    completed_at: completedAt,
    summary: {
      states_total: config.states.length,
      states_captured: capturedStates,
      states_compared: comparisons.filter((entry) => entry.metrics).length,
      states_passed: comparisons.filter((entry) => entry.passed === true).length,
      states_failed: comparisons.filter((entry) => entry.passed === false || entry.status === 'failed').length,
      console_errors: (audit.target?.console_errors.length ?? 0) + (audit.clone?.console_errors.length ?? 0),
      page_errors: (audit.target?.page_errors.length ?? 0) + (audit.clone?.page_errors.length ?? 0),
      request_failures: (audit.target?.request_failures.length ?? 0) + (audit.clone?.request_failures.length ?? 0),
      forbidden_target_requests: audit.clone?.forbidden_target_requests.length ?? 0,
    },
    states: comparisons,
    audit,
    checks,
    approximations: [...config.approximations, ...config.states.filter((state) => state.approximation).map((state) => `${state.name}: ${state.approximation}`)],
    failures,
    skipped,
  };
}

export async function writeReports(report, outputDirectory) {
  await mkdir(outputDirectory, { recursive: true });
  const jsonPath = path.join(outputDirectory, 'report.json');
  const htmlPath = path.join(outputDirectory, 'report.html');
  const portable = structuredClone(report);
  for (const state of portable.states) {
    for (const key of ['target_image', 'clone_image', 'heatmap', 'metrics_path']) state[key] = relative(outputDirectory, state[key]);
    if (state.metrics) {
      for (const key of ['reference', 'candidate', 'heatmap']) {
        if (state.metrics[key] && path.isAbsolute(state.metrics[key])) state.metrics[key] = relative(outputDirectory, state.metrics[key]);
      }
    }
  }
  await writeFile(jsonPath, `${JSON.stringify(portable, null, 2)}\n`);
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Verified Reconstruction Report</title><style>
  :root{font-family:Inter,ui-sans-serif,system-ui,sans-serif;color:#18201e;background:#f4f2ec}*{box-sizing:border-box}body{margin:0}main{width:min(1180px,calc(100% - 32px));margin:40px auto 80px}h1{font:600 clamp(2rem,5vw,4.7rem)/.98 Georgia,serif;margin:.2em 0}.eyebrow{text-transform:uppercase;letter-spacing:.12em;font-size:.72rem;color:#66706c}.hero,.state,section{background:#fff;border:1px solid #d9ddd8;border-radius:16px;padding:24px;margin:18px 0;box-shadow:0 8px 28px #20302a0a}.status{display:inline-block;padding:7px 12px;border-radius:99px;background:#e8eee9}.summary,.metrics{display:flex;gap:12px;flex-wrap:wrap}.summary span,.metrics span{background:#f1f3f0;padding:9px 12px;border-radius:8px}.state header{display:flex;align-items:start;justify-content:space-between}.state h3{margin:0 0 14px}.pill{padding:6px 10px;border-radius:99px;background:#e6e9e7}.pill.failed,.pill.unverified,.pill.skipped{background:#f5ddd8}.compare{position:relative;overflow:hidden;margin-top:16px;background:#eceeeb;min-height:220px}.compare img,.pair img,.heat img{width:100%;display:block}.compare .overlay{position:absolute;inset:0;clip-path:inset(0 50% 0 0)}.compare input{position:absolute;left:12px;right:12px;bottom:12px;width:calc(100% - 24px)}.pair{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}.placeholder{display:grid;place-items:center;min-height:220px;background:#eceeeb;color:#68716d}.heat{margin-top:16px}.heat img{max-width:700px}details{margin-top:12px;border-top:1px solid #e5e7e4;padding-top:10px}summary{cursor:pointer}pre{white-space:pre-wrap;overflow-wrap:anywhere;background:#17201d;color:#e7eee9;padding:14px;border-radius:8px;font-size:.75rem}a{color:inherit}@media(max-width:700px){.pair{grid-template-columns:1fr}.hero,.state,section{padding:18px}}
  </style></head><body><main><div class="hero"><p class="eyebrow">Clone Any Website · v0.2</p><h1>Verified Reconstruction</h1><p class="status">${escapeHtml(report.status)}</p><p><b>Target</b> ${escapeHtml(report.target_url)}<br><b>Clone</b> ${escapeHtml(report.clone_url)}<br><b>Run</b> ${escapeHtml(report.started_at)} — ${escapeHtml(report.completed_at)}</p><div class="summary">${Object.entries(report.summary).map(([key,value]) => `<span>${escapeHtml(key)} <b>${escapeHtml(value)}</b></span>`).join('')}</div></div>
  <section><h2>Checks</h2><div class="summary">${Object.entries(report.checks).map(([key,value]) => `<span>${escapeHtml(key)} <b>${escapeHtml(value)}</b></span>`).join('')}</div><h3>Failures</h3><pre>${escapeHtml(JSON.stringify(report.failures, null, 2))}</pre><h3>Skipped / unverified</h3><pre>${escapeHtml(JSON.stringify(report.skipped, null, 2))}</pre></section>
  ${report.states.map((state) => stateCard(state, outputDirectory)).join('')}${auditSection('Target', report.audit.target)}${auditSection('Clone', report.audit.clone)}</main><script>document.querySelectorAll('.compare').forEach(c=>{const r=c.querySelector('input'),o=c.querySelector('.overlay');r.addEventListener('input',()=>o.style.clipPath='inset(0 '+(100-r.value)+'% 0 0)')})</script></body></html>`;
  await writeFile(htmlPath, html);
  return { jsonPath, htmlPath };
}
