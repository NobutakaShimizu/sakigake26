export const N_VERTICES = 200
export const MAX_STEPS = 2000
export const PP_BATCH_SIZE = 10
export const K_MIN = 2
export const K_MAX = N_VERTICES
export const K_MAX_HALF_UNDECIDED = Math.floor(N_VERTICES / 2)

export type UsdInitialMode = 'balanced' | 'halfUndecided'

/** 0 = undecided (⊥), 1..k = decided opinions */
export type Opinion = number

export const OPINION_COLORS = [
  '#bdbdbd',
  '#1976d2',
  '#c2185b',
  '#388e3c',
  '#f57c00',
  '#7b1fa2',
  '#00838f',
  '#5d4037',
  '#827717',
  '#6a1b9a',
  '#1565c0',
]

export function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6D2B79F5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function shuffle<T>(items: T[], rng: () => number) {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]]
  }
}

export function balancedConfiguration(n: number, k: number, rng: () => number): Opinion[] {
  const config: Opinion[] = []
  const base = Math.floor(n / k)
  const rem = n % k

  for (let opinion = 1; opinion <= k; opinion++) {
    const count = base + (opinion <= rem ? 1 : 0)
    for (let i = 0; i < count; i++)
      config.push(opinion)
  }

  shuffle(config, rng)
  return config
}

/** n/2 vertices ⊥, remaining n/2 balanced across [k]. */
export function halfUndecidedBalancedConfiguration(n: number, k: number, rng: () => number): Opinion[] {
  const decidedN = Math.floor(n / 2)
  const botN = n - decidedN
  const decided = balancedConfiguration(decidedN, k, rng)
  const config: Opinion[] = [
    ...Array.from({ length: botN }, () => 0),
    ...decided,
  ]
  shuffle(config, rng)
  return config
}

export function initialConfiguration(
  n: number,
  k: number,
  rng: () => number,
  mode: UsdInitialMode = 'balanced',
): Opinion[] {
  if (mode === 'halfUndecided')
    return halfUndecidedBalancedConfiguration(n, k, rng)
  return balancedConfiguration(n, k, rng)
}

export function isConsensus(config: Opinion[]): boolean {
  const first = config[0]
  return config.every(opinion => opinion === first)
}

export function consensusLabel(config: Opinion[]): string {
  if (config[0] === 0)
    return '\\bot'
  return String(config[0])
}

export function usdUpdate(u: Opinion, w: Opinion): Opinion {
  // Definition 3.1: update(σ1, σ2)
  // ⊥ if σ1, σ2 are distinct decided opinions in [k]
  if (u >= 1 && w >= 1 && u !== w)
    return 0
  // undecided copies sampled opinion as-is (including ⊥)
  if (u === 0)
    return w
  // decided with w = ⊥ or w = u: keep own opinion
  return u
}

export function usdStep(current: Opinion[], rng: () => number): Opinion[] {
  const n = current.length
  const samples = Array.from({ length: n }, () => Math.floor(rng() * n))
  const next = new Array<Opinion>(n)

  for (let u = 0; u < n; u++)
    next[u] = usdUpdate(current[u], current[samples[u]])

  return next
}

/** One population-protocol interaction: a single random vertex updates. */
export function usdAsyncMicroStep(current: Opinion[], rng: () => number): Opinion[] {
  const n = current.length
  const u = Math.floor(rng() * n)
  const w = Math.floor(rng() * n)
  const next = current.slice()
  next[u] = usdUpdate(current[u], current[w])
  return next
}

export function runUsdSimulation(
  k: number,
  seed: number,
  initial: UsdInitialMode = 'balanced',
  n: number = N_VERTICES,
) {
  const rng = mulberry32(seed)
  let current = initialConfiguration(n, k, rng, initial)
  const history: Opinion[][] = [current.slice()]
  let steps = 0

  while (!isConsensus(current) && steps < MAX_STEPS) {
    current = usdStep(current, rng)
    history.push(current.slice())
    steps++
  }

  return {
    history,
    steps,
    reachedConsensus: isConsensus(current),
    finalOpinion: current[0],
  }
}

export function runUsdAsyncSimulation(
  k: number,
  seed: number,
  initial: UsdInitialMode = 'balanced',
  batchSize = PP_BATCH_SIZE,
  n: number = N_VERTICES,
) {
  const rng = mulberry32(seed)
  let current = initialConfiguration(n, k, rng, initial)
  const history: Opinion[][] = [current.slice()]
  let totalUpdates = 0
  const maxUpdates = MAX_STEPS * n

  while (!isConsensus(current) && totalUpdates < maxUpdates) {
    for (let b = 0; b < batchSize && !isConsensus(current) && totalUpdates < maxUpdates; b++) {
      current = usdAsyncMicroStep(current, rng)
      totalUpdates++
    }
    history.push(current.slice())
  }

  return {
    history,
    steps: totalUpdates,
    reachedConsensus: isConsensus(current),
    finalOpinion: current[0],
  }
}

export function countOpinions(config: Opinion[], k: number) {
  const counts = Array.from({ length: k + 1 }, () => 0)
  for (const opinion of config) {
    if (opinion === 0)
      counts[0]++
    else if (opinion >= 1 && opinion <= k)
      counts[opinion]++
  }
  return counts
}

export function botCount(counts: number[]) {
  return counts[0] ?? 0
}

export function decidedCount(counts: number[]) {
  let total = 0
  for (let i = 1; i < counts.length; i++)
    total += counts[i] ?? 0
  return total
}

export function totalCounted(counts: number[]) {
  return botCount(counts) + decidedCount(counts)
}

export function opinionColor(opinion: Opinion) {
  if (opinion === 0)
    return OPINION_COLORS[0]
  if (opinion < OPINION_COLORS.length)
    return OPINION_COLORS[opinion]
  const hue = (opinion * 137.508) % 360
  return `hsl(${hue}, 58%, 46%)`
}
