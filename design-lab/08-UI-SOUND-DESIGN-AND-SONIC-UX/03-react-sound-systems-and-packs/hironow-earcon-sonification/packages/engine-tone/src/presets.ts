/**
 * @earcon/engine-tone — トレーダー向けプリセット
 *
 * 前提:
 *   - すべて `await Tone.start()` 後（ユーザー操作内）に生成・再生すること
 *   - 連続音の intensity(0..1) は「レベル内での切迫度」。0 が最も穏やか、1 が最も切迫
 *   - ctx.out は出力先。エンジン側でウォレットごとの Panner / Gain を挟む想定
 *
 * 設計メモ:
 *   - 連続音は Tone.Transport ではなく Tone.Clock を使う。Transport の位置に依存せず、
 *     Worker クロックなので背景タブでも間隔が崩れにくい。frequency は Signal なので
 *     rampTo で滑らかにレートを変えられる（駐車センサーの「ピ、ピ、ピピピ」）
 */
import * as Tone from 'tone'
import type { ContinuousSound, OneShotSound } from '@earcon/core'
import { ticker } from './ticker'

// ---------------------------------------------------------------- contracts
// `ContinuousSound` / `OneShotSound` come from @earcon/core (spec appendix B).

export type { ContinuousSound, OneShotSound }

export interface SoundContext {
  out: Tone.InputNode
}

export interface OneShotOptions {
  transpose?: number // 半音。ウォレット識別や buy/sell の区別に
  velocity?: number
  time?: number // AudioContext 秒。省略時は now
}

export type ContinuousFactory = (ctx: SoundContext) => ContinuousSound
export type OneShotFactory = (ctx: SoundContext) => OneShotSound

// ---------------------------------------------------------------- helpers

const lerp = (a: number, b: number, t: number) => a + (b - a) * clamp01(t)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const semis = (note: string, n: number) =>
  Tone.Frequency(note).transpose(Math.round(n)).toFrequency()

// ================================================================ continuous
// 「近づいている」を鳴らす音。intensity で密度・高さが変わる

/** ソナー — watch 用。遠くで何かが動いている。3秒→0.7秒間隔、ピッチも少し上がる */
export const sonar: ContinuousFactory = ({ out }) => {
  const delay = new Tone.FeedbackDelay({ delayTime: 0.4, feedback: 0.45, wet: 0.45 }).connect(out)
  const synth = new Tone.FMSynth({
    harmonicity: 2,
    modulationIndex: 2.5,
    oscillator: { type: 'sine' },
    modulation: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.7, sustain: 0, release: 0.3 },
    modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.2 },
    volume: -6,
  }).connect(delay)
  const t = ticker(
    (time, i) => synth.triggerAttackRelease(semis('A5', i * 5), '8n', time),
    (i) => 1 / lerp(3.0, 0.7, i),
  )
  return { ...t, dispose: () => { t.dispose(); synth.dispose(); delay.dispose() } }
}

/** 駐車センサー — warn 用。0.9秒→0.09秒間隔。ピッチ固定、速さだけで距離を伝える */
export const parkingSensor: ContinuousFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.05, sustain: 0.3, release: 0.03 },
    volume: -10,
  }).connect(out)
  const t = ticker(
    (time) => synth.triggerAttackRelease('C6', 0.045, time),
    (i) => 1 / lerp(0.9, 0.09, i),
  )
  return { ...t, dispose: () => { t.dispose(); synth.dispose() } }
}

/** ガイガーカウンター — warn の代替。確率的なクリック。密度がリスク */
export const geiger: ContinuousFactory = ({ out }) => {
  const hp = new Tone.Filter(4000, 'highpass').connect(out)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.012, sustain: 0, release: 0.005 },
    volume: -6,
  }).connect(hp)
  const t = ticker(
    (time, i) => {
      if (Math.random() < lerp(0.04, 0.85, i * i)) noise.triggerAttackRelease(0.01, time)
    },
    () => 40, // 抽選レートは固定、密度は確率で制御
  )
  return { ...t, dispose: () => { t.dispose(); noise.dispose(); hp.dispose() } }
}

/** 心拍モニター — ポジションの「生存」を示す。55→170 bpm。清算されたら flatline に切替える想定 */
export const heartbeat: ContinuousFactory = ({ out }) => {
  const drum = new Tone.MembraneSynth({
    pitchDecay: 0.03,
    octaves: 4,
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
    volume: -4,
  }).connect(out)
  const bpm = (i: number) => lerp(55, 170, i)
  const t = ticker(
    (time, i) => {
      const period = 60 / bpm(i)
      drum.triggerAttackRelease('A1', 0.12, time) // lub
      drum.triggerAttackRelease('G1', 0.1, time + Math.min(0.16, period * 0.3)) // dub
    },
    (i) => bpm(i) / 60,
  )
  return { ...t, dispose: () => { t.dispose(); drum.dispose() } }
}

/** カウントダウン — 時間ベース（funding まで、TWAP 完了まで）。常に 1Hz、終盤でピッチ上昇＋ダブルビープ */
export const countdown: ContinuousFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.003, decay: 0.08, sustain: 0.2, release: 0.05 },
    volume: -6,
  }).connect(out)
  const t = ticker(
    (time, i) => {
      const note = i < 0.7 ? 'C5' : i < 0.9 ? 'E5' : 'G5'
      synth.triggerAttackRelease(note, 0.08, time)
      if (i >= 0.9) synth.triggerAttackRelease(note, 0.08, time + 0.15)
    },
    () => 1,
  )
  return { ...t, dispose: () => { t.dispose(); synth.dispose() } }
}

/** ハイロー・サイレン — critical 用。二音交互。intensity で切替が速くなる */
export const hiLoSiren: ContinuousFactory = ({ out }) => {
  const lp = new Tone.Filter(1800, 'lowpass').connect(out)
  const osc = new Tone.Oscillator(440, 'sawtooth').connect(lp)
  osc.volume.value = -12
  let hi = false
  const t = ticker(
    (time, i) => {
      hi = !hi
      osc.frequency.setValueAtTime(semis(hi ? 'D5' : 'A4', i * 3), time)
    },
    (i) => lerp(1.6, 4, i),
  )
  return {
    start(i) {
      if (osc.state !== 'started') osc.start()
      t.start(i)
    },
    set: t.set,
    stop() {
      t.stop()
      osc.stop()
    },
    dispose() {
      t.dispose()
      osc.dispose()
      lp.dispose()
    },
  }
}

/** レッドアラート — critical の代替。上昇スイープの繰り返し。最も切迫感が強い */
export const redAlert: ContinuousFactory = ({ out }) => {
  const lp = new Tone.Filter(2500, 'lowpass').connect(out)
  const osc = new Tone.Oscillator(600, 'sawtooth').connect(lp)
  osc.volume.value = -14
  const lfo = new Tone.LFO({ frequency: 1.5, min: 500, max: 900, type: 'sawtooth' })
  lfo.connect(osc.frequency)
  const set = (i: number) => {
    lfo.frequency.rampTo(lerp(1.2, 3.5, i), 0.2)
    lfo.max = lerp(900, 1400, i)
  }
  return {
    start(i) {
      set(i)
      if (osc.state !== 'started') {
        osc.start()
        lfo.start()
      }
    },
    set,
    stop() {
      osc.stop()
      lfo.stop()
    },
    dispose() {
      lfo.dispose()
      osc.dispose()
      lp.dispose()
    },
  }
}


/** 失速警報クリッカー — 落ちる寸前。ブラウンノイズの等間隔連打 6→28 Hz、帯域が上がる */
export const stallWarning: ContinuousFactory = ({ out }) => {
  // pink noise keeps energy in the 700–1400 Hz band (brown noise lost ~30 dB there; measured)
  const bp = new Tone.Filter({ frequency: 900, type: 'bandpass', Q: 1 }).connect(out)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.01 },
    volume: 2,
  }).connect(bp)
  const t = ticker(
    (time, i) => {
      bp.frequency.setValueAtTime(lerp(700, 1400, i), time)
      noise.triggerAttackRelease(0.02, time)
    },
    (i) => lerp(6, 28, i),
  )
  return { ...t, dispose: () => { t.dispose(); noise.dispose(); bp.dispose() } }
}

/** ミサイルロックオン — 狙われている。矩形波ビープ 3→30 Hz、デューティ比が上がって最後は連続音に融合する */
export const rwrLock: ContinuousFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.002, decay: 0.01, sustain: 1, release: 0.01 },
    volume: -16,
  }).connect(out)
  const hz = (i: number) => lerp(3, 30, i)
  const t = ticker(
    (time, i) => {
      const period = 1 / hz(i)
      const duty = i >= 0.95 ? 1.05 : lerp(0.2, 0.9, i) // ≥ 0.95: notes overlap → one continuous tone
      synth.triggerAttackRelease(1200, period * duty, time)
    },
    hz,
  )
  return { ...t, dispose: () => { t.dispose(); synth.dispose() } }
}

/** パルスオキシメータ — 健全度そのものの低下。レートは一定、ピッチが 880→330 Hz に下がり、危険域で tremolo が乗る */
export const spo2Pulse: ContinuousFactory = ({ out }) => {
  const tremolo = new Tone.Tremolo({ frequency: 9, depth: 0 }).connect(out)
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.005, decay: 0.08, sustain: 0.2, release: 0.05 },
    volume: -8,
  }).connect(tremolo)
  const depthOf = (i: number) => (i > 0.6 ? lerp(0, 0.8, (i - 0.6) / 0.4) : 0)
  let tremoloOn = false
  const t = ticker(
    (time, i) => synth.triggerAttackRelease(lerp(880, 330, i), 0.1, time),
    () => 1.2, // 72 bpm, fixed
  )
  return {
    start(i) {
      if (!tremoloOn) {
        tremolo.start()
        tremoloOn = true
      }
      tremolo.depth.value = depthOf(i)
      t.start(i)
    },
    set(i) {
      tremolo.depth.rampTo(depthOf(i), 0.2)
      t.set(i)
    },
    stop() {
      t.stop()
      if (tremoloOn) {
        tremolo.stop()
        tremoloOn = false
      }
    },
    dispose() {
      t.dispose()
      synth.dispose()
      tremolo.dispose()
    },
  }
}

/** 車線逸脱ランブル — 想定レンジからの逸脱。低域ピンクノイズのバーストが 1.2 s→0.15 s 間隔に詰まり、少し明るくなる */
export const laneDeparture: ContinuousFactory = ({ out }) => {
  const lp = new Tone.Filter(400, 'lowpass').connect(out)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0.3, release: 0.05 },
    volume: -4,
  }).connect(lp)
  const t = ticker(
    (time, i) => {
      lp.frequency.setValueAtTime(lerp(300, 900, i), time)
      noise.triggerAttackRelease(0.15, time)
    },
    (i) => 1 / lerp(1.2, 0.15, i),
  )
  return { ...t, dispose: () => { t.dispose(); noise.dispose(); lp.dispose() } }
}

/** 霧笛 — 見えない接近。低い長音の間隔が 8 s→1.5 s に詰まり、基音 110→160 Hz、倍音が増える */
export const foghorn: ContinuousFactory = ({ out }) => {
  const synth = new Tone.FMSynth({
    harmonicity: 1,
    modulationIndex: 1.5,
    oscillator: { type: 'sine' },
    modulation: { type: 'square' },
    envelope: { attack: 0.3, decay: 0.2, sustain: 0.8, release: 0.8 },
    modulationEnvelope: { attack: 0.3, decay: 0.5, sustain: 0.5, release: 0.5 },
    volume: -8,
  }).connect(out)
  const hz = (i: number) => 1 / lerp(8, 1.5, i)
  const t = ticker(
    (time, i) => {
      synth.modulationIndex.setValueAtTime(lerp(1.5, 4, i), time)
      synth.triggerAttackRelease(lerp(110, 160, i), Math.min(1.2, (1 / hz(i)) * 0.6), time)
    },
    hz,
  )
  return { ...t, dispose: () => { t.dispose(); synth.dispose() } }
}

/** ケトルの笛 — 沸点直前。細い持続音が 2.2→3.4 kHz へ上がり、揺らぎが消えて音量が立ち上がる。クロックなし */
export const kettle: ContinuousFactory = ({ out }) => {
  const gain = new Tone.Gain(0).connect(out)
  const hp = new Tone.Filter(1500, 'highpass').connect(gain)
  const osc = new Tone.Oscillator(2600, 'sine').connect(hp)
  osc.volume.value = -14
  const lfo = new Tone.LFO({ frequency: 6, min: -40, max: 40, type: 'sine' })
  lfo.connect(osc.detune)
  const set = (i: number) => {
    osc.frequency.rampTo(lerp(2200, 3400, i), 0.3)
    lfo.amplitude.rampTo(1 - i, 0.3)
    gain.gain.rampTo(lerp(0.15, 1, i), 0.3)
  }
  return {
    start(i) {
      gain.gain.value = lerp(0.15, 1, i)
      if (osc.state !== 'started') {
        osc.start()
        lfo.start()
      }
      set(i)
    },
    set,
    stop() {
      osc.stop()
      lfo.stop()
    },
    dispose() {
      lfo.dispose()
      osc.dispose()
      hp.dispose()
      gain.dispose()
    },
  }
}

/** 秒針・時限装置 — 残り時間。厳密に等間隔のクリックが 1→8 Hz へ accelerando、後半は 2 拍ごとにアクセント */
export const tickingClock: ContinuousFactory = ({ out }) => {
  const wood = new Tone.MembraneSynth({
    pitchDecay: 0.005,
    octaves: 1,
    envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
    volume: -10,
  }).connect(out)
  const metal = new Tone.MetalSynth({
    harmonicity: 3,
    modulationIndex: 12,
    resonance: 2500,
    octaves: 0.5,
    envelope: { attack: 0.001, decay: 0.03, release: 0.01 },
    volume: -28,
  }).connect(out)
  let count = 0
  const t = ticker(
    (time, i) => {
      count++
      const accent = i > 0.5 && count % 2 === 0
      wood.triggerAttackRelease(accent ? 'A3' : 'E3', 0.03, time)
      metal.triggerAttackRelease(accent ? 'C6' : 'A5', 0.02, time, accent ? 0.6 : 0.3)
    },
    (i) => lerp(1, 8, i),
  )
  return { ...t, dispose: () => { t.dispose(); wood.dispose(); metal.dispose() } }
}

// ================================================================ one-shot
// 「起こった」「切り替わった」を1回で伝える音

/** 取引所のベル — 単打で長い余韻。セッション開始・大口約定など「節目」 */
export const bell: OneShotFactory = ({ out }) => {
  const synth = new Tone.FMSynth({
    harmonicity: 3.01,
    modulationIndex: 14,
    oscillator: { type: 'sine' },
    modulation: { type: 'sine' },
    envelope: { attack: 0.001, decay: 2.2, sustain: 0, release: 1.5 },
    modulationEnvelope: { attack: 0.001, decay: 0.9, sustain: 0, release: 0.5 },
    volume: -6,
  }).connect(out)
  return {
    play({ transpose = 0, velocity = 0.9, time = Tone.now() }: OneShotOptions = {}) {
      synth.triggerAttackRelease(semis('E5', transpose), 2.0, time, velocity)
    },
    dispose: () => synth.dispose(),
  }
}

/** レジ（チャリーン）— 利確・入金。引き出しのノイズ＋金属2音 */
export const register: OneShotFactory = ({ out }) => {
  const drawer = new Tone.NoiseSynth({
    noise: { type: 'pink' },
    envelope: { attack: 0.005, decay: 0.12, sustain: 0, release: 0.05 },
    volume: -12,
  }).connect(out)
  const ching = new Tone.MetalSynth({
    harmonicity: 5.1,
    modulationIndex: 20,
    resonance: 4000,
    octaves: 1.2,
    envelope: { attack: 0.001, decay: 0.6, release: 0.2 },
    volume: -14,
  }).connect(out)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      drawer.triggerAttackRelease(0.1, time)
      ching.triggerAttackRelease(semis('C6', transpose), 0.4, time + 0.09)
      ching.triggerAttackRelease(semis('E6', transpose), 0.5, time + 0.17)
    },
    dispose() {
      drawer.dispose()
      ching.dispose()
    },
  }
}

/** コイン — 小さな約定・小さな利益。上昇2音 */
export const coin: OneShotFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'triangle' },
    envelope: { attack: 0.002, decay: 0.15, sustain: 0.15, release: 0.2 },
    volume: -8,
  }).connect(out)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      synth.triggerAttackRelease(semis('C6', transpose), 0.07, time)
      synth.triggerAttackRelease(semis('G6', transpose), 0.25, time + 0.08)
    },
    dispose: () => synth.dispose(),
  }
}

/** ノック — stale 専用。データが途絶えた。他のどの音とも似せない低い2打 */
export const knock: OneShotFactory = ({ out }) => {
  const drum = new Tone.MembraneSynth({
    pitchDecay: 0.02,
    octaves: 2,
    envelope: { attack: 0.001, decay: 0.15, sustain: 0, release: 0.05 },
    volume: -4,
  }).connect(out)
  return {
    play({ time = Tone.now() }: OneShotOptions = {}) {
      drum.triggerAttackRelease('E2', 0.1, time)
      drum.triggerAttackRelease('E2', 0.1, time + 0.18)
    },
    dispose: () => drum.dispose(),
  }
}

/** オールクリア — 危険レベルから抜けた。長三和音の上昇アルペジオ */
export const allClear: OneShotFactory = ({ out }) => {
  const synth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.01, decay: 0.4, sustain: 0.1, release: 0.6 },
  }).connect(out)
  synth.volume.value = -10
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      ;['C5', 'E5', 'G5'].forEach((n, k) =>
        synth.triggerAttackRelease(semis(n, transpose), 0.5, time + k * 0.09),
      )
    },
    dispose: () => synth.dispose(),
  }
}

/** ブザー — 注文拒否・エラー。低い矩形波 */
export const buzzer: OneShotFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'square' },
    envelope: { attack: 0.005, decay: 0.05, sustain: 0.8, release: 0.05 },
    volume: -14,
  }).connect(out)
  return {
    play({ time = Tone.now() }: OneShotOptions = {}) {
      synth.triggerAttackRelease('A2', 0.25, time)
    },
    dispose: () => synth.dispose(),
  }
}

/** チャイム（ピンポン）— 情報通知。緊急性なし */
export const chime: OneShotFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.6, sustain: 0, release: 0.4 },
    volume: -8,
  }).connect(out)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      synth.triggerAttackRelease(semis('E5', transpose), 0.4, time)
      synth.triggerAttackRelease(semis('C5', transpose), 0.6, time + 0.35)
    },
    dispose: () => synth.dispose(),
  }
}


/** SOS — 複数ウォレットが同時に危険域へ。· · · — — — · · · のパターン自体が意味を持つ */
export const sosMorse: OneShotFactory = ({ out }) => {
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.005, decay: 0.02, sustain: 1, release: 0.02 },
    volume: -10,
  }).connect(out)
  const dot = 0.06
  const dash = 0.18
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      const f = semis('F5', transpose)
      let at = time
      const pattern: Array<'dot' | 'dash' | 'gap'> = ['dot', 'dot', 'dot', 'gap', 'dash', 'dash', 'dash', 'gap', 'dot', 'dot', 'dot']
      for (const p of pattern) {
        if (p === 'gap') {
          at += dash - dot // letter gap: 3 units minus the trailing unit
          continue
        }
        const len = p === 'dot' ? dot : dash
        synth.triggerAttackRelease(f, len, at)
        at += len + dot
      }
    },
    dispose: () => synth.dispose(),
  }
}

/** ゴング — セッション・監視の開始。低く長い減衰（bell の短く明るい減衰と対）。汎用ゴングとして合成 */
export const gong: OneShotFactory = ({ out }) => {
  const delay = new Tone.FeedbackDelay({ delayTime: 0.25, feedback: 0.2, wet: 0.15 }).connect(out)
  const synth = new Tone.MetalSynth({
    harmonicity: 1.4,
    modulationIndex: 16,
    resonance: 300,
    octaves: 1.5,
    envelope: { attack: 0.01, decay: 2.5, release: 3 },
    volume: -22, // MetalSynth is hot: -10 clipped at +5.6 dBFS (measured)
  }).connect(delay)
  return {
    play({ transpose = 0, velocity = 0.9, time = Tone.now() }: OneShotOptions = {}) {
      synth.triggerAttackRelease(semis('D2', transpose), 3, time, velocity)
    },
    dispose() {
      synth.dispose()
      delay.dispose()
    },
  }
}

/** ガラス割れ — 清算実行・損失確定。非周期の高域粒子。取り返しがつかない音 */
export const glassBreak: OneShotFactory = ({ out }) => {
  const hp = new Tone.Filter(2500, 'highpass').connect(out)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.25, sustain: 0, release: 0.1 },
    volume: -10,
  }).connect(hp)
  const shards = new Tone.MetalSynth({
    harmonicity: 8,
    modulationIndex: 30,
    resonance: 6000,
    octaves: 1,
    envelope: { attack: 0.001, decay: 0.12, release: 0.05 },
    volume: -20,
  }).connect(out)
  const offsets = [0.01, 0.04, 0.09, 0.13, 0.2]
  const notes = ['A6', 'C7', 'E7', 'G6', 'B6']
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      noise.triggerAttackRelease(0.25, time)
      offsets.forEach((o, k) => shards.triggerAttackRelease(semis(notes[k]!, transpose), 0.08, time + o, 0.5))
    },
    dispose() {
      noise.dispose()
      shards.dispose()
      hp.dispose()
    },
  }
}

/** 電源断 — 監視停止。600→80 Hz の下降スイープ、同時にフィルタが閉じる（coin の上昇 2 音の鏡像） */
export const powerDown: OneShotFactory = ({ out }) => {
  const lp = new Tone.Filter(3000, 'lowpass').connect(out)
  const synth = new Tone.Synth({
    oscillator: { type: 'sawtooth' },
    envelope: { attack: 0.01, decay: 0.1, sustain: 0.8, release: 0.2 },
    volume: -14,
  }).connect(lp)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      const from = semis('D5', transpose)
      synth.triggerAttack(from, time)
      synth.frequency.setValueAtTime(from, time)
      synth.frequency.exponentialRampToValueAtTime(from / 7.5, time + 0.8)
      lp.frequency.setValueAtTime(3000, time)
      lp.frequency.exponentialRampToValueAtTime(200, time + 0.8)
      synth.triggerRelease(time + 0.8)
    },
    dispose() {
      synth.dispose()
      lp.dispose()
    },
  }
}

/** 無線スケルチ — 接続復帰（knock の対）。40 ms のノイズにフィルタを素早く開く */
export const squelch: OneShotFactory = ({ out }) => {
  const bp = new Tone.Filter({ frequency: 1800, type: 'bandpass', Q: 0.7 }).connect(out)
  const noise = new Tone.NoiseSynth({
    noise: { type: 'white' },
    envelope: { attack: 0.001, decay: 0.06, sustain: 0, release: 0.01 },
    volume: 0,
  }).connect(bp)
  return {
    play({ time = Tone.now() }: OneShotOptions = {}) {
      bp.frequency.setValueAtTime(600, time)
      bp.frequency.exponentialRampToValueAtTime(3500, time + 0.04)
      noise.triggerAttackRelease(0.04, time)
    },
    dispose() {
      noise.dispose()
      bp.dispose()
    },
  }
}

/** 水滴 — 小額イベント・部分約定。控えめで頻発に耐える。短いピッチ上昇 + 小さなエコー */
export const waterDrop: OneShotFactory = ({ out }) => {
  const delay = new Tone.FeedbackDelay({ delayTime: 0.18, feedback: 0.25, wet: 0.25 }).connect(out)
  const synth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.002, decay: 0.12, sustain: 0, release: 0.1 },
    volume: -12,
  }).connect(delay)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      const f = semis('E5', transpose)
      synth.triggerAttackRelease(f, 0.08, time)
      synth.frequency.setValueAtTime(f, time)
      synth.frequency.exponentialRampToValueAtTime(f * 2, time + 0.03)
    },
    dispose() {
      synth.dispose()
      delay.dispose()
    },
  }
}

/** ラッチのカチッ — 注文確定・設定反映。極短の非トーナル打撃 */
export const latchClick: OneShotFactory = ({ out }) => {
  const body = new Tone.MembraneSynth({
    pitchDecay: 0.002,
    octaves: 0.5,
    envelope: { attack: 0.001, decay: 0.02, sustain: 0, release: 0.01 },
    volume: -8,
  }).connect(out)
  const tip = new Tone.MetalSynth({
    harmonicity: 5,
    modulationIndex: 20,
    resonance: 4000,
    octaves: 0.5,
    envelope: { attack: 0.001, decay: 0.015, release: 0.005 },
    volume: -26,
  }).connect(out)
  return {
    play({ transpose = 0, time = Tone.now() }: OneShotOptions = {}) {
      body.triggerAttackRelease('G3', 0.02, time)
      tip.triggerAttackRelease(semis('C7', transpose), 0.01, time + 0.004, 0.7)
    },
    dispose() {
      body.dispose()
      tip.dispose()
    },
  }
}

// ================================================================ registry

export const continuous = {
  sonar,
  parkingSensor,
  geiger,
  heartbeat,
  countdown,
  hiLoSiren,
  redAlert,
  stallWarning,
  rwrLock,
  spo2Pulse,
  laneDeparture,
  foghorn,
  kettle,
  tickingClock,
} satisfies Record<string, ContinuousFactory>

export const oneShot = {
  bell,
  register,
  coin,
  knock,
  allClear,
  buzzer,
  chime,
  sosMorse,
  gong,
  glassBreak,
  powerDown,
  squelch,
  waterDrop,
  latchClick,
} satisfies Record<string, OneShotFactory>

export type ContinuousPresetId = keyof typeof continuous
export type OneShotPresetId = keyof typeof oneShot

export { catalog, defaultLevelSounds } from './catalog'
export { fromSpec } from './fromSpec'
