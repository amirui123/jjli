import type { ArbiterPolicy, MonitorState } from './types'

/**
 * Which monitors should be audible right now. Pure and deterministic.
 * Safe, acknowledged and stale monitors are never candidates (stale has its own
 * one-shot path). Ranking: level index desc → intensity desc → id asc.
 */
export function selectAudible(
  states: readonly MonitorState[],
  levelIndexOf: (state: MonitorState) => number,
  policy: ArbiterPolicy,
): string[] {
  const ranked = states
    .filter((s) => s.level !== null && !s.acknowledged && !s.stale)
    .map((s) => ({ id: s.id, level: levelIndexOf(s), intensity: s.intensity }))
    .sort((a, b) => b.level - a.level || b.intensity - a.intensity || (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((s) => s.id)

  switch (policy.mode) {
    case 'all':
      return ranked
    case 'worst-only':
      return ranked.slice(0, 1)
    case 'top-n':
      return ranked.slice(0, Math.max(0, policy.n))
  }
}
