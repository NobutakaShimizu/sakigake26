import { mulberry32 } from './usdSim'

export const VOTER_N = 20
export const VOTER_K = 4
export const VOTER_MAX_STEPS = 500

/** High-contrast palette for the voter demo (opinions 1..k). */
export const VOTER_OPINION_COLORS = [
  '',
  '#1565c0',
  '#d32f2f',
  '#2e7d32',
  '#f9a825',
]

/** Opinions in [k] = {1, …, k} */
export type VoterOpinion = number

export function voterOpinionColor(opinion: VoterOpinion) {
  if (opinion >= 1 && opinion < VOTER_OPINION_COLORS.length)
    return VOTER_OPINION_COLORS[opinion]
  const hue = (opinion * 137.508) % 360
  return `hsl(${hue}, 78%, 42%)`
}

export function randomConfiguration(
  n: number,
  k: number,
  rng: () => number,
): VoterOpinion[] {
  return Array.from({ length: n }, () => 1 + Math.floor(rng() * k))
}

export function isVoterConsensus(config: VoterOpinion[]): boolean {
  const first = config[0]
  return config.every(opinion => opinion === first)
}

/** Synchronous voter on K_n: each vertex copies a uniformly random vertex. */
export function voterStep(current: VoterOpinion[], rng: () => number): VoterOpinion[] {
  const n = current.length
  const next = new Array<VoterOpinion>(n)

  for (let u = 0; u < n; u++) {
    const w = Math.floor(rng() * n)
    next[u] = current[w]
  }

  return next
}

export function createVoterRng(seed?: number) {
  return mulberry32(seed ?? (Date.now() ^ (Math.random() * 0xFFFFFFFF)))
}
