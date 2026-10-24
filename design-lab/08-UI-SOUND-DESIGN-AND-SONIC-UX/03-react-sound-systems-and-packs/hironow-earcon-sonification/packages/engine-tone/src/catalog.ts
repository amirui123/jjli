/**
 * Preset ids and metadata. No Tone import: safe to use before `unlock()`
 * (settings UI, docs, synchronous `{ kind: 'preset', id }` validation).
 */

/** Monitor のレベル → 既定プリセット。JSON 設定からは id で参照する */
export const defaultLevelSounds = {
  watch: 'sonar',
  warn: 'parkingSensor',
  critical: 'hiLoSiren',
  stale: 'knock',
  exitDanger: 'allClear',
} as const

/** 設定 UI・ドキュメント用のカタログ */
export const catalog = [
  { id: 'sonar', kind: 'continuous', metaphor: 'ソナー', use: '遠い危険。監視レベル' },
  { id: 'parkingSensor', kind: 'continuous', metaphor: '駐車センサー', use: '接近中。警告レベル' },
  { id: 'geiger', kind: 'continuous', metaphor: 'ガイガーカウンター', use: '不確実な危険の密度' },
  { id: 'heartbeat', kind: 'continuous', metaphor: '心拍モニター', use: 'ポジションの健康度' },
  { id: 'countdown', kind: 'continuous', metaphor: 'カウントダウン', use: '時間ベースの締切' },
  { id: 'hiLoSiren', kind: 'continuous', metaphor: 'サイレン', use: '清算目前。危機レベル' },
  { id: 'redAlert', kind: 'continuous', metaphor: 'レッドアラート', use: '危機レベルの代替' },
  { id: 'bell', kind: 'oneShot', metaphor: '取引所のベル', use: 'セッション・節目' },
  { id: 'register', kind: 'oneShot', metaphor: 'レジ', use: '利確・入金' },
  { id: 'coin', kind: 'oneShot', metaphor: 'コイン', use: '小さな約定' },
  { id: 'knock', kind: 'oneShot', metaphor: 'ノック', use: 'データ途絶（stale）' },
  { id: 'allClear', kind: 'oneShot', metaphor: 'オールクリア', use: '危険域から離脱' },
  { id: 'buzzer', kind: 'oneShot', metaphor: 'ブザー', use: '拒否・エラー' },
  { id: 'chime', kind: 'oneShot', metaphor: 'チャイム', use: '情報通知' },
  // --- added 2026-09 (ADR-0005): metaphors people already know, chosen for discriminability
  { id: 'stallWarning', kind: 'continuous', metaphor: '失速警報', use: '落ちる寸前。資金効率の失速' },
  { id: 'rwrLock', kind: 'continuous', metaphor: 'ミサイルロックオン', use: '清算価格に狙われている' },
  { id: 'spo2Pulse', kind: 'continuous', metaphor: 'パルスオキシメータ', use: '健全度そのものの低下' },
  { id: 'laneDeparture', kind: 'continuous', metaphor: '車線逸脱', use: '想定レンジからの逸脱' },
  { id: 'foghorn', kind: 'continuous', metaphor: '霧笛', use: '見えない接近。流動性の枯渇' },
  { id: 'kettle', kind: 'continuous', metaphor: 'ケトルの笛', use: '沸点直前。執行直前' },
  { id: 'tickingClock', kind: 'continuous', metaphor: '秒針・時限装置', use: '期限までの残り時間' },
  { id: 'sosMorse', kind: 'oneShot', metaphor: 'SOS', use: '複数ウォレットが同時に危険域へ' },
  { id: 'gong', kind: 'oneShot', metaphor: 'ゴング', use: 'セッション・監視の開始' },
  { id: 'glassBreak', kind: 'oneShot', metaphor: 'ガラス割れ', use: '清算実行・損失確定' },
  { id: 'powerDown', kind: 'oneShot', metaphor: '電源断', use: '監視停止' },
  { id: 'squelch', kind: 'oneShot', metaphor: '無線スケルチ', use: '接続復帰（knock の対）' },
  { id: 'waterDrop', kind: 'oneShot', metaphor: '水滴', use: '小額イベント・部分約定' },
  { id: 'latchClick', kind: 'oneShot', metaphor: 'ラッチ', use: '注文確定・設定反映' },
] as const

/** What the ear should listen for. Shown next to each preset so the catalog can be learned (ADR-0005). */
export const presetHint: Record<string, string> = {
  sonar: 'ping の間隔が 3 s → 0.7 s に詰まり、少し高くなる',
  parkingSensor: 'ピッチ固定。0.9 s → 0.09 s 間隔、速さだけで距離を伝える',
  geiger: '抽選レート固定。クリックの密度が確率で上がる',
  heartbeat: 'lub-dub が 55 → 170 bpm',
  countdown: '常に 1 Hz。終盤でピッチが上がりダブルビープ',
  hiLoSiren: '二音交互。切替が 1.6 → 4 Hz に速まり、少し高くなる',
  redAlert: '上昇スイープの反復。1.2 → 3.5 Hz、上端が高くなる',
  stallWarning: 'ノイズの連打 6 → 28 Hz、帯域が上がる',
  rwrLock: 'ビープ 3 → 30 Hz。デューティ比が上がり、最後は連続音に融合',
  spo2Pulse: 'レート固定 72 bpm。ピッチが 880 → 330 Hz へ下がり、危険域で震える',
  laneDeparture: '低域ノイズのバースト 1.2 s → 0.15 s 間隔',
  foghorn: '長音の間隔 8 s → 1.5 s、基音 110 → 160 Hz',
  kettle: '持続音。2.2 → 3.4 kHz へ上がり、揺らぎが消える',
  tickingClock: '等間隔クリック 1 → 8 Hz、後半は 2 拍ごとにアクセント',
  bell: '単打、長い余韻',
  register: '引き出しのノイズ + 金属 2 音',
  coin: '上昇 2 音',
  knock: '低い 2 打',
  allClear: '長三和音の上昇アルペジオ',
  buzzer: '低い矩形波 0.25 s',
  chime: 'ピンポン（下降 2 音）',
  sosMorse: '· · · — — — · · ·',
  gong: '低い一打、3 s の減衰',
  glassBreak: 'ノイズ + 高域の粒 5 つ',
  powerDown: '0.8 s の下降スイープ',
  squelch: '40 ms のノイズ、フィルタが開く',
  waterDrop: '短いピッチ上昇 + 小さなエコー',
  latchClick: '極短の打撃 2 層',
}

export type PresetKind = (typeof catalog)[number]['kind']
export type PresetId = (typeof catalog)[number]['id']

/** Tick-rate range (Hz) of each continuous preset at intensity 0 → 1, for UI. */
export const presetRate: Record<string, { minHz: number; maxHz: number; note?: string }> = {
  sonar: { minHz: 1 / 3, maxHz: 1 / 0.7 },
  parkingSensor: { minHz: 1 / 0.9, maxHz: 1 / 0.09 },
  geiger: { minHz: 40 * 0.04, maxHz: 40 * 0.85, note: 'stochastic density' },
  heartbeat: { minHz: 55 / 60, maxHz: 170 / 60 },
  countdown: { minHz: 1, maxHz: 1 },
  hiLoSiren: { minHz: 1.6, maxHz: 4 },
  redAlert: { minHz: 1.2, maxHz: 3.5, note: 'sweep rate' },
  stallWarning: { minHz: 6, maxHz: 28 },
  rwrLock: { minHz: 3, maxHz: 30 },
  spo2Pulse: { minHz: 1.2, maxHz: 1.2 },
  laneDeparture: { minHz: 1 / 1.2, maxHz: 1 / 0.15 },
  foghorn: { minHz: 1 / 8, maxHz: 1 / 1.5 },
  kettle: { minHz: 0, maxHz: 0, note: 'sustained' },
  tickingClock: { minHz: 1, maxHz: 8 },
}

export const presetIds = {
  continuous: catalog.filter((p) => p.kind === 'continuous').map((p) => p.id),
  oneShot: catalog.filter((p) => p.kind === 'oneShot').map((p) => p.id),
}
