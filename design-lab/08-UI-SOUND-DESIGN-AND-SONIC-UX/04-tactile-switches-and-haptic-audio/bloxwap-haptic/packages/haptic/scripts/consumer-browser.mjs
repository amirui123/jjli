import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { join } from 'node:path';
import { build } from 'esbuild';
import { chromium } from 'playwright';

export async function smokeConsumer(consumer, version) {
  const result = await build({
    entryPoints: ['test/browser/fixture.tsx'], bundle: true, write: false, format: 'esm', platform: 'browser',
    define: { 'process.env.NODE_ENV': '"development"' },
    alias: {
      '@bloxwap/haptic': join(consumer, 'node_modules/@bloxwap/haptic'),
      react: join(consumer, 'node_modules/react'),
      'react-dom': join(consumer, 'node_modules/react-dom'),
    },
  });
  const server = createServer((request, response) => {
    response.setHeader('Content-Type', request.url === '/fixture.js' ? 'text/javascript' : 'text/html');
    response.end(request.url === '/fixture.js' ? result.outputFiles[0].contents : '<!doctype html><html><body><main id="root"></main><script type="module" src="/fixture.js"></script></body></html>');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch();
    for (const native of [false, true]) {
      const page = await browser.newPage(); const errors = [];
      page.on('pageerror', error => errors.push(error.message));
      await page.addInitScript(native => {
        window.feedback = [];
        Object.defineProperties(navigator, {
          platform: { configurable: true, value: native ? 'iPhone' : 'Linux' },
          userAgent: { configurable: true, value: native ? 'iPhone AppleWebKit/605.1.15' : 'Chrome AppleWebKit/537.36' },
          maxTouchPoints: { configurable: true, value: native ? 5 : 0 },
          vibrate: { configurable: true, value: native ? undefined : input => { window.feedback.push(input); return true; } },
        });
      }, native);
      await page.goto(`http://127.0.0.1:${server.address().port}`);
      const target = page.getByRole('button', { name: 'Tap action', exact: true });
      await target.waitFor();
      if (native) await page.locator('input[switch]').first().waitFor({ state: 'attached' });
      const box = await target.boundingBox();
      await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
      await page.waitForFunction(() => document.querySelector('#actions').textContent === '1');
      assert.equal(await page.locator('#parent').textContent(), '1');
      await page.getByRole('button', { name: 'Focus target' }).click();
      assert.ok(await target.evaluate(element => document.activeElement === element));
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#actions').textContent === '2');
      const feedback = await page.evaluate(() => window.feedback);
      assert.deepEqual(feedback, native ? [] : [[2, 6], [2, 6]]);
      assert.deepEqual(errors, []);
      await page.close();
    }
    console.log(`React ${version}: installed package browser actions, ref/focus, keyboard, and native-route DOM passed (no hardware claim).`);
  } finally {
    await browser?.close();
    await new Promise(resolve => server.close(resolve));
  }
}
