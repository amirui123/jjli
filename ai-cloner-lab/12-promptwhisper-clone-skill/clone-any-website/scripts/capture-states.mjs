import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { attachPageAudit, createAudit, finalizeAudit, installOriginPolicy, redactText, redactUrl } from './audit-runtime.mjs';

const safeActions = (actions) => actions.map((action) => action.type === 'fill' ? { ...action, value: '[redacted]' } : action);

async function waitForPaints(page, count = 2) {
  await page.evaluate((paintCount) => new Promise((resolve) => {
    let remaining = paintCount;
    const paint = () => {
      remaining -= 1;
      if (remaining <= 0) resolve();
      else requestAnimationFrame(paint);
    };
    requestAnimationFrame(paint);
  }), count);
}

async function setMediaTime(locator, action) {
  return locator.evaluate(async (media, options) => {
    const timeoutMs = options.timeout_ms ?? 10000;
    const maxDelta = options.max_timestamp_delta ?? 0.1;
    const waitEvent = (name) => new Promise((resolve, reject) => {
      const timer = setTimeout(() => cleanup(new Error(`Timed out waiting for media ${name}`)), timeoutMs);
      const cleanup = (error) => {
        clearTimeout(timer);
        media.removeEventListener(name, onEvent);
        media.removeEventListener('error', onError);
        error ? reject(error) : resolve();
      };
      const onEvent = () => cleanup();
      const onError = () => cleanup(media.error || new Error(`Media failed before ${name}`));
      media.addEventListener(name, onEvent, { once: true });
      media.addEventListener('error', onError, { once: true });
    });
    const paints = (count = 2) => new Promise((resolve) => {
      const step = () => count-- <= 1 ? resolve() : requestAnimationFrame(step);
      requestAnimationFrame(step);
    });
    if (media.readyState < HTMLMediaElement.HAVE_METADATA) await waitEvent('loadedmetadata');
    if (media.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) await waitEvent('loadeddata');
    if (!Number.isFinite(media.duration) || media.duration <= 0) throw new Error('set_media_time requires finite VOD media');
    media.pause();
    const epsilon = 1 / 120;
    const requestedTime = options.time;
    const targetTime = Math.min(Math.max(0, requestedTime), Math.max(0, media.duration - epsilon));
    let framePromise = null;
    const needsSeek = Math.abs(media.currentTime - targetTime) > 0.0005 || media.seeking;
    const seekedPromise = needsSeek ? waitEvent('seeked') : Promise.resolve();
    if (needsSeek && typeof media.requestVideoFrameCallback === 'function') {
      framePromise = new Promise((resolve, reject) => {
        let callbackId;
        const timer = setTimeout(() => {
          if (callbackId !== undefined && typeof media.cancelVideoFrameCallback === 'function') media.cancelVideoFrameCallback(callbackId);
          reject(new Error('Timed out waiting for the target video frame'));
        }, timeoutMs);
        const onFrame = (_now, metadata) => {
          if (Math.abs(metadata.mediaTime - targetTime) <= maxDelta) {
            clearTimeout(timer);
            resolve(metadata.mediaTime);
          } else callbackId = media.requestVideoFrameCallback(onFrame);
        };
        callbackId = media.requestVideoFrameCallback(onFrame);
      });
    }
    media.currentTime = targetTime;
    await seekedPromise;
    let presentedMediaTime = null;
    let verificationMethod = 'two-browser-paints';
    if (framePromise) {
      presentedMediaTime = await framePromise;
      verificationMethod = 'requestVideoFrameCallback';
    } else {
      await paints(2);
    }
    if (Math.abs(media.currentTime - targetTime) > maxDelta) throw new Error('Presented media time could not be confirmed');
    return { requestedTime, targetTime, currentTime: media.currentTime, presentedMediaTime, verificationMethod };
  }, action);
}

async function performAction(page, action) {
  const timeout = action.timeout_ms ?? 10000;
  const locator = action.selector ? page.locator(action.selector).first() : null;
  switch (action.type) {
    case 'click': await locator.click({ timeout }); return null;
    case 'hover': await locator.hover({ timeout }); return null;
    case 'fill': await locator.fill(action.value, { timeout }); return null;
    case 'press':
      if (locator) await locator.press(action.key, { timeout });
      else await page.keyboard.press(action.key);
      return null;
    case 'scroll_to': await page.evaluate(({ x, y }) => window.scrollTo(x, y), action); return null;
    case 'scroll_by': await page.evaluate(({ delta_x, delta_y }) => window.scrollBy(delta_x, delta_y), action); return null;
    case 'wait_for_selector': await page.locator(action.selector).waitFor({ state: action.state ?? 'visible', timeout }); return null;
    case 'wait_for_timeout': await page.waitForTimeout(action.timeout_ms); return null;
    case 'wait_for_paints': await waitForPaints(page, action.count ?? 2); return null;
    case 'set_media_time': return setMediaTime(locator, action);
    case 'pause_media': await locator.evaluate((media) => media.pause()); return null;
    case 'play_media': await locator.evaluate(async (media) => { await media.play(); }); return null;
    default: throw new Error(`Unsupported action type: ${action.type}`);
  }
}

async function captureMetadata(page, side, state, viewport, actionResults) {
  const pageData = await page.evaluate(() => {
    const focus = document.activeElement;
    return {
      viewport: { width: innerWidth, height: innerHeight },
      dpr: devicePixelRatio,
      scroll_x: scrollX,
      scroll_y: scrollY,
      ready_state: document.readyState,
      focus: focus ? { tag: focus.tagName.toLowerCase(), id: focus.id || null, name: focus.getAttribute('name'), role: focus.getAttribute('role') } : null,
    };
  });
  return {
    version: 1,
    side,
    state: state.name,
    viewport_name: viewport.name,
    final_url: redactUrl(page.url()),
    title: await page.title(),
    captured_at: new Date().toISOString(),
    ...pageData,
    actions: safeActions(state.actions),
    action_results: actionResults,
  };
}

async function readExistingCapture(imagePath, metadataPath, state, viewport) {
  try {
    const metadata = JSON.parse(await readFile(metadataPath, 'utf8'));
    await readFile(imagePath);
    return { state: state.name, viewport: viewport.name, status: 'captured', reused: true, image: imagePath, metadata: metadataPath, details: metadata };
  } catch {
    return null;
  }
}

export async function captureStates({ browser, side, config, outputDirectory, updateBaseline = false }) {
  const audit = createAudit(side, config);
  const results = [];
  const url = config[side].url;
  for (const viewport of config.viewports) {
    const states = config.states.filter((state) => state.viewport === viewport.name);
    if (!states.length) continue;
    const context = await browser.newContext({
      viewport: { width: viewport.width, height: viewport.height },
      deviceScaleFactor: viewport.device_scale_factor,
      isMobile: viewport.is_mobile,
      hasTouch: viewport.has_touch,
      locale: config.environment.locale,
      timezoneId: config.environment.timezone_id,
      colorScheme: config.environment.color_scheme,
      reducedMotion: config.environment.reduced_motion ? 'reduce' : 'no-preference',
    });
    await installOriginPolicy(context, side, config, audit);
    try {
      for (const state of states) {
        const imagePath = path.join(outputDirectory, side, viewport.name, `${state.name}.png`);
        const metadataPath = path.join(outputDirectory, side, 'metadata', viewport.name, `${state.name}.json`);
        if (side === 'target' && !updateBaseline) {
          const existing = await readExistingCapture(imagePath, metadataPath, state, viewport);
          if (existing) { results.push(existing); continue; }
        }
        await mkdir(path.dirname(imagePath), { recursive: true });
        await mkdir(path.dirname(metadataPath), { recursive: true });
        const page = await context.newPage();
        audit._state = state.name;
        attachPageAudit(page, audit, config);
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: config.clone.startup_timeout_ms });
          if (state.readiness) {
            await page.locator(state.readiness.selector).waitFor({ state: state.readiness.state ?? 'visible', timeout: state.readiness.timeout_ms ?? 10000 });
          }
          await page.evaluate(() => document.fonts.ready);
          const actionResults = [];
          for (const action of state.actions) actionResults.push({ type: action.type, result: await performAction(page, action) });
          await waitForPaints(page, 2);
          const metadata = await captureMetadata(page, side, state, viewport, actionResults);
          await page.screenshot({ path: imagePath, fullPage: false });
          await writeFile(metadataPath, `${JSON.stringify(metadata, null, 2)}\n`);
          results.push({ state: state.name, viewport: viewport.name, status: 'captured', reused: false, image: imagePath, metadata: metadataPath, details: metadata });
        } catch (error) {
          const safeError = redactText(error.message);
          const failure = { version: 1, side, state: state.name, viewport_name: viewport.name, captured_at: new Date().toISOString(), error: safeError, actions: safeActions(state.actions) };
          await writeFile(metadataPath, `${JSON.stringify(failure, null, 2)}\n`);
          results.push({ state: state.name, viewport: viewport.name, status: 'failed', image: null, metadata: metadataPath, error: safeError });
        } finally {
          await page.close().catch((error) => audit.page_errors.push({ state: state.name, message: `Page cleanup failed: ${redactText(error.message)}` }));
        }
      }
    } finally {
      await context.close();
    }
  }
  return { side, states: results, audit: finalizeAudit(audit) };
}
