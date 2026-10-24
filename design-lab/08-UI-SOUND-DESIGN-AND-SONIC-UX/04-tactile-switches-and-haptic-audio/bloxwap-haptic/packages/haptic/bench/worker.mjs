import { performance } from 'node:perf_hooks';
import { rows, sample, summarize } from './lib/stats.mjs';
import { measureResources } from './lib/resources.mjs';

const mode = process.argv[2];
const diagnostic = process.argv[3] === 'diagnostic';

if (mode === 'ssr') {
  const React = await import('react');
  const { renderToString } = await import('react-dom/server');
  const { HapticTarget } = await import('../dist/index.js');
  for (const count of [1, 100, 1000]) {
    const targets = Array.from({ length: count }, (_, key) => React.createElement(
      HapticTarget, { key }, React.createElement('button', null, 'Tap'),
    ));
    const tree = React.createElement(React.Fragment, null, ...targets);
    await sample(`SSR ${count}`, () => renderToString(tree), 'ms/render');
  }
} else {
  const { JSDOM } = await import('jsdom');
  const dom = new JSDOM('<!doctype html><html><body></body></html>', {
    pretendToBeVisual: true,
    url: 'https://bench.invalid',
  });
  for (const key of ['window', 'document', 'navigator', 'HTMLElement', 'Node', 'Event', 'MouseEvent', 'EventTarget', 'MutationObserver']) {
    Object.defineProperty(globalThis, key, {
      configurable: true,
      writable: true,
      value: dom.window[key],
    });
  }
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  const ios = mode === 'ios';
  let vibrations = 0;
  let activations = 0;
  // Stub before importing dist: WebHaptics.isSupported is evaluated once.
  Object.defineProperties(navigator, {
    vibrate: {
      configurable: true,
      value: mode === 'vibration' ? () => {
        vibrations++;
        return true;
      } : undefined,
    },
    platform: { configurable: true, value: ios ? 'iPhone' : 'Linux' },
    userAgent: { configurable: true, value: ios ? 'iPhone AppleWebKit/605.1.15' : 'bench' },
  });
  const React = await import('react');
  const { createRoot, flushSync: profilingFlushSync } = await import(diagnostic ? 'react-dom/profiling' : 'react-dom/client');
  const { flushSync: normalFlushSync } = await import('react-dom');
  const flushSync = diagnostic ? profilingFlushSync : normalFlushSync;
  // Production React has no act. Allow passive effects and their scheduled
  // state updates to settle across macrotasks after each synchronous commit.
  async function settleUpdates(action) {
    flushSync(action);
    await new Promise(resolve => setTimeout(resolve, 0));
    await new Promise(resolve => setImmediate(resolve));
    // Overlay mutations can enqueue another update through MutationObserver.
    await new Promise(resolve => setTimeout(resolve, 0));
    flushSync(() => {});
  }
  globalThis.__hapticBench = { renders: 0, engines: 0 };
  const { HapticTarget, triggerHaptic, isIOSWebKitWithoutVibration } = await import(
    diagnostic ? './results/instrumented.mjs' : '../dist/index.js'
  );
  if (isIOSWebKitWithoutVibration() !== ios) throw Error('Routing stub failed');
  const stable = {
    feedback: 'selection',
    triggerOptions: { intensity: 0.5 },
    webHapticsOptions: { debug: false },
  };
  function tree(count, props = stable) {
    const targets = Array.from({ length: count }, (_, key) => React.createElement(
      HapticTarget,
      { key, ...props },
      React.createElement('button', { onClick: () => activations++ }, 'Tap'),
    ));
    return React.createElement(React.Fragment, null, ...targets);
  }
  async function mount(n, props) {
    const host = document.createElement('div');
    document.body.append(host);
    const root = createRoot(host);
    await settleUpdates(() => root.render(tree(n, props)));
    return { root, host };
  }
  async function unmount({ root, host }) {
    await settleUpdates(() => root.unmount());
    host.remove();
  }
  if (diagnostic) {
    const diagnostics = [];
    for (const n of [100, 1000]) {
      let commits = 0;
      globalThis.__hapticBench.renders = 0;
      const host = document.createElement('div');
      document.body.append(host);
      const root = createRoot(host);
      await settleUpdates(() => root.render(React.createElement(React.Profiler, {
        id: mode,
        onRender: () => commits++,
      }, tree(n))));
      const rendersPerInstance = globalThis.__hapticBench.renders / n;
      // Report counts as measured; only check that the iOS route really rendered its switches.
      if (ios && host.querySelectorAll('input[switch]').length !== n) {
        throw Error(`iOS route did not render ${n} switches`);
      }
      diagnostics.push({ instances: n, commits, rendersPerInstance });
      await unmount({ root, host });
    }
    const item = await mount(100);
    const beforeEngines = globalThis.__hapticBench.engines;
    for (const target of item.host.querySelectorAll('button')) {
      target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    }
    const engines = globalThis.__hapticBench.engines - beforeEngines;
    await unmount(item);
    dom.window.close();
    console.log(JSON.stringify({ path: mode, diagnostics, engines }));
    process.exit(0);
  }
  if (mode === 'vibration' || ios) {
    for (const n of [100, 1000]) {
      const mounts = [];
      const unmounts = [];
      for (let i = 0; i < 12; i++) {
        const mountStarted = performance.now();
        const item = await mount(n);
        const mountMilliseconds = performance.now() - mountStarted;
        const unmountStarted = performance.now();
        await unmount(item);
        if (i >= 3) {
          mounts.push(mountMilliseconds);
          unmounts.push(performance.now() - unmountStarted);
        }
      }
      summarize(`${mode} client mount ${n}`, mounts);
      summarize(`${mode} client unmount ${n}`, unmounts);
    }
    const item = await mount(100);
    for (const kind of ['stable', 'feedback', 'triggerOptions', 'webHapticsOptions']) {
      let iteration = 0;
      await sample(`${mode} re-render 100 ${kind}`, () => {
        iteration++;
        const props = kind === 'stable' ? stable : {
          ...stable, [kind]: kind === 'feedback' ? (iteration % 2 ? 'light' : 'selection') : { ...stable[kind] }
        };
        return settleUpdates(() => item.root.render(tree(100, props)));
      }, 'ms');
    }
    await unmount(item);
  }
  const tapItem = await mount(1);
  const target = tapItem.host.querySelector(ios ? 'label' : 'button');
  if (!target) {
    throw Error('Missing tap target');
  }
  await sample(`${mode} ${ios ? 'label/switch' : 'button'} click`, async () => {
    await settleUpdates(() => {
      for (let i = 0; i < 200; i++) {
        target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      }
    });
  }, 'ms/tap', 9, 200);
  if (activations < 2400 || (mode === 'vibration' && vibrations < 2400)) {
    throw Error('Click batch did not exercise the expected path');
  }
  await unmount(tapItem);
  if (mode === 'vibration') {
    await sample('Imperative triggerHaptic', async () => {
      for (let i = 0; i < 1000; i++) {
        const result = await triggerHaptic();
        if (!result.delivered) {
          throw Error('Vibration rejected');
        }
      }
    }, 'ms/tap', 9, 1000);
  }
  if (!activations || (mode === 'vibration' && !vibrations)) {
    throw Error('Tap path did not execute');
  }
  const resources = await measureResources({ mount, unmount, ios, mode });
  if (mode === 'vibration') {
    if (!global.gc) {
      throw Error('Run with --expose-gc');
    }
    async function cycle() {
      const item = await mount(1000);
      await unmount(item);
      await new Promise(resolve => setImmediate(resolve));
    }
    for (let i = 0; i < 3; i++) {
      await cycle();
    }
    global.gc();
    const beforeHeap = process.memoryUsage().heapUsed;
    const heaps = [];
    for (let i = 0; i < 8; i++) {
      await cycle();
      global.gc();
      heaps.push(process.memoryUsage().heapUsed);
    }
    rows.push({
      name: 'Heap delta: 8 cycles × 1000',
      median: heaps.at(-1) - beforeHeap,
      p95: null,
      unit: 'bytes',
      samples: 8,
      heapBefore: beforeHeap,
      heapAfterEachCycle: heaps,
    });
  }
  dom.window.close();
  console.log(JSON.stringify({ rows, resources }));
}
if (mode === 'ssr') {
  console.log(JSON.stringify({ rows }));
}
