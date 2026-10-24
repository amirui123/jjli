import { performance } from 'node:perf_hooks';

function bodyNodeCount() {
  const elements = [...document.body.querySelectorAll('*')];
  const textNodes = elements.reduce((total, element) => {
    return total + [...element.childNodes].filter(node => node.nodeType === 3).length;
  }, 0);
  return elements.length + textNodes;
}

export async function measureResources({ mount, unmount, ios, mode }) {
  // Instrument after React/jsdom initialization; keep tracking references out of the memory test.
  const proto = EventTarget.prototype;
  const add = proto.addEventListener;
  const remove = proto.removeEventListener;
  let adds = 0;
  let removes = 0;
  let created = 0;
  let disconnected = 0;
  const live = new Map();
  const capture = o => typeof o === 'boolean' ? o : !!o?.capture;
  proto.addEventListener = function (type, fn, options) {
    adds++;
    let records = live.get(this);
    if (!records) {
      live.set(this, records = []);
    }
    if (!records.some(r => r.type === type && r.fn === fn && r.capture === capture(options))) {
      records.push({ type, fn, capture: capture(options) });
    }
    return add.call(this, type, fn, options);
  };
  proto.removeEventListener = function (type, fn, options) {
    removes++;
    const records = live.get(this);
    if (records) {
      const i = records.findIndex(r => r.type === type && r.fn === fn && r.capture === capture(options));
      if (i >= 0) {
        records.splice(i, 1);
      }
    }
    return remove.call(this, type, fn, options);
  };
  const Original = globalThis.MutationObserver;
  const observers = new Set();
  globalThis.MutationObserver = class extends Original {
    constructor(cb) {
      super(cb);
      created++;
      observers.add(this);
    }
    disconnect() {
      disconnected++;
      observers.delete(this);
      return super.disconnect();
    }
  };
  const before = bodyNodeCount();
  const resourceItem = await mount(100);
  const mountNodes = bodyNodeCount() - before - 1;
  const mounted = { adds, removes, created };
  const preTap = bodyNodeCount();
  const tap = resourceItem.host.querySelector(ios ? 'label' : 'button');
  let scheduledFrames = 0;
  let nextFrame = 0;
  const frames = new Map();
  const originalRAF = globalThis.requestAnimationFrame;
  const originalCancel = globalThis.cancelAnimationFrame;
  globalThis.requestAnimationFrame = callback => {
    scheduledFrames++;
    frames.set(++nextFrame, callback);
    return nextFrame;
  };
  globalThis.cancelAnimationFrame = id => frames.delete(id);
  function tapAndDrain(target) {
    target.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
    // Simulate 60Hz frames until the selection pattern completes.
    let timestamp = 100;
    while (frames.size) {
      const pending = [...frames.values()];
      frames.clear();
      for (const callback of pending) {
        callback(timestamp);
      }
      timestamp += 1000 / 60;
      if (timestamp > 10000) {
        throw Error('Pattern did not finish');
      }
    }
  }
  const started = performance.now();
  tapAndDrain(tap);
  const firstTapMilliseconds = performance.now() - started;
  const firstTap = {
    nodes: bodyNodeCount() - preTap,
    listeners: adds - mounted.adds,
    observers: created - mounted.created,
    labels: document.body.querySelectorAll('label[for^="web-haptics-"]').length,
    raf: scheduledFrames,
    milliseconds: firstTapMilliseconds,
  };
  const remainingStarted = performance.now();
  for (const target of [...resourceItem.host.querySelectorAll(ios ? 'label' : 'button')].slice(1)) {
    tapAndDrain(target);
  }
  const remainingMilliseconds = performance.now() - remainingStarted;
  const allTaps = {
    nodes: bodyNodeCount() - preTap,
    labels: document.body.querySelectorAll('label[for^="web-haptics-"]').length,
    rafPerTap: scheduledFrames / 100,
    millisecondsPerTap: remainingMilliseconds / 99,
  };
  await unmount(resourceItem);
  let retainedOnDocument = 0;
  let retainedOnDetached = 0;
  for (const [target, records] of live) {
    if (target === window || target === document || target.isConnected) {
      retainedOnDocument += records.length;
    } else {
      retainedOnDetached += records.length;
    }
  }
  const resources = {
    path: mode,
    instances: 100,
    nodesPerInstance: mountNodes / 100,
    listenersAddedPerInstance: mounted.adds / 100,
    observersPerInstance: mounted.created / 100,
    firstTap,
    allTaps,
    afterUnmount: {
      adds,
      removes,
      balance: adds - removes,
      activeObservers: observers.size,
      observerDisconnects: disconnected,
      leftoverBodyNodes: bodyNodeCount() - before,
      retainedOnDocument,
      retainedOnDetached,
    },
  };
  globalThis.requestAnimationFrame = originalRAF;
  globalThis.cancelAnimationFrame = originalCancel;
  proto.addEventListener = add;
  proto.removeEventListener = remove;
  globalThis.MutationObserver = Original;
  live.clear();
  observers.clear();
  return resources;
}
