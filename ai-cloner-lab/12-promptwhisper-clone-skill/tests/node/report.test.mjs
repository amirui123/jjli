import assert from 'node:assert/strict';
import { mkdtemp, readFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { writeReports } from '../../clone-any-website/scripts/build-report.mjs';

test('report HTML is self-contained, escaped, and tolerates missing images', async () => {
  const directory = await mkdtemp(path.join(os.tmpdir(), 'clone report space '));
  const report = {
    version: 1, status: 'failed_with_residuals', target_url: 'https://example.test/?token=%5Bredacted%5D', clone_url: 'http://localhost:1',
    started_at: 'start', completed_at: 'end', summary: { states_total: 1 },
    states: [{ state: '<img src=x onerror=alert(1)>', viewport: 'desktop', status: 'failed', passed: false, reason: '<script>alert(1)</script>' }],
    audit: {}, checks: { capture: 'failed' }, approximations: [], failures: ['<b>unsafe</b>'], skipped: ['visual'],
  };
  const paths = await writeReports(report, directory);
  const html = await readFile(paths.htmlPath, 'utf8');
  assert.match(html, /&lt;script&gt;alert\(1\)&lt;\/script&gt;/u);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/u);
  assert.doesNotMatch(html, /https?:\/\/[^"<]*\.(?:js|css)/u);
  assert.match(html, /unavailable/u);
});
