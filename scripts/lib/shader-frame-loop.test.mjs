import assert from "node:assert/strict";
import test from "node:test";
import { ShaderFrameLoop } from "../../src/engines/shaderFrameLoop.mjs";

function harness() {
  let nextId = 0;
  const pending = new Map();
  const cancelled = [];
  let active = true;
  let draws = 0;
  const loop = new ShaderFrameLoop({
    requestFrame(callback) {
      const id = ++nextId;
      pending.set(id, callback);
      return id;
    },
    cancelFrame(id) {
      cancelled.push(id);
      pending.delete(id);
    },
    isActive: () => active,
    draw: () => { draws += 1; },
  });
  return {
    loop, pending, cancelled,
    setActive(value) { active = value; },
    get draws() { return draws; },
    tick(id = pending.keys().next().value) {
      const callback = pending.get(id);
      assert.ok(callback, `frame ${id} should be pending`);
      pending.delete(id);
      callback(16 * id);
    },
  };
}

test("keeps exactly one pending frame and continues while active", () => {
  const h = harness();
  h.loop.refresh();
  h.loop.refresh();
  assert.equal(h.pending.size, 1);
  h.tick();
  assert.equal(h.draws, 1);
  assert.equal(h.pending.size, 1);
  h.loop.dispose();
  assert.equal(h.pending.size, 0);
});

test("cancels the pending frame on pause and resumes on refresh", () => {
  const h = harness();
  h.loop.refresh();
  const pendingId = [...h.pending.keys()][0];
  h.setActive(false);
  h.loop.refresh();
  assert.equal(h.pending.size, 0);
  assert.deepEqual(h.cancelled, [pendingId]);
  h.setActive(true);
  h.loop.refresh();
  assert.equal(h.pending.size, 1);
  h.tick();
  assert.equal(h.draws, 1);
});

test("does not draw or reschedule if activity ends before a callback", () => {
  const h = harness();
  h.loop.refresh();
  h.setActive(false);
  h.tick();
  assert.equal(h.draws, 0);
  assert.equal(h.pending.size, 0);
});

test("dispose is idempotent and prevents future scheduling", () => {
  const h = harness();
  h.loop.refresh();
  h.loop.dispose();
  h.loop.dispose();
  h.loop.refresh();
  assert.equal(h.pending.size, 0);
});
