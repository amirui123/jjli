import assert from "node:assert/strict";
import test from "node:test";
import { encodeWav } from "../../src/engines/wavEncoder.mjs";

function audioBuffer(channels, sampleRate = 44100) {
  return {
    numberOfChannels: channels.length,
    sampleRate,
    length: channels[0].length,
    getChannelData(channel) {
      return channels[channel];
    },
  };
}

test("writes stereo PCM header and interleaves left/right samples", async () => {
  const blob = encodeWav(
    audioBuffer([new Float32Array([-1, 0.5]), new Float32Array([1, -0.5])])
  );

  assert.equal(blob.type, "audio/wav");
  const bytes = await blob.arrayBuffer();
  const view = new DataView(bytes);

  assert.equal(view.getUint16(22, true), 2);
  assert.equal(view.getUint32(24, true), 44100);
  assert.equal(view.getUint32(28, true), 44100 * 4);
  assert.equal(view.getUint16(32, true), 4);
  assert.equal(view.getUint32(40, true), 8);
  assert.equal(view.getInt16(44, true), -32768);
  assert.equal(view.getInt16(46, true), 32767);
  assert.equal(view.getInt16(48, true), 16383);
  assert.equal(view.getInt16(50, true), -16384);
});

test("preserves mono buffers and clamps out-of-range samples", async () => {
  const blob = encodeWav(audioBuffer([new Float32Array([-2, 0, 2])], 22050));
  const view = new DataView(await blob.arrayBuffer());

  assert.equal(view.getUint16(22, true), 1);
  assert.equal(view.getUint32(24, true), 22050);
  assert.equal(view.getInt16(44, true), -32768);
  assert.equal(view.getInt16(48, true), 32767);
});
