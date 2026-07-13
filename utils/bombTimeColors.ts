export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

export function rgba(r: number, g: number, b: number, a: number) {
  return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${a})`
}

export function lerpRgb(
  from: [number, number, number],
  to: [number, number, number],
  t: number,
): [number, number, number] {
  return [lerp(from[0], to[0], t), lerp(from[1], to[1], t), lerp(from[2], to[2], t)]
}

export function getBombTimeProgress(): number | null {
  if (!document.documentElement.classList.contains('bomb-time-mode'))
    return null
  const raw = getComputedStyle(document.documentElement).getPropertyValue('--bomb-time-progress').trim()
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? Math.min(1, Math.max(0, parsed)) : 0
}

const GRAD_SPOT_1_FROM: [number, number, number] = [147, 197, 253]
const GRAD_SPOT_1_TO: [number, number, number] = [252, 165, 165]
const GRAD_SPOT_2_FROM: [number, number, number] = [96, 165, 250]
const GRAD_SPOT_2_TO: [number, number, number] = [248, 113, 113]
const GRAD_SPOT_3_FROM: [number, number, number] = [59, 130, 246]
const GRAD_SPOT_3_TO: [number, number, number] = [239, 68, 68]

const LINE_FROM: [number, number, number] = [37, 99, 235]
const LINE_TO: [number, number, number] = [220, 38, 38]

export function getTimeGradientBackground(t: number) {
  const spot1 = lerpRgb(GRAD_SPOT_1_FROM, GRAD_SPOT_1_TO, t)
  const spot2 = lerpRgb(GRAD_SPOT_2_FROM, GRAD_SPOT_2_TO, t)
  const spot3 = lerpRgb(GRAD_SPOT_3_FROM, GRAD_SPOT_3_TO, t)

  return [
    `radial-gradient(circle at 12% 12%, ${rgba(spot1[0], spot1[1], spot1[2], lerp(0.28, 0.3, t))}, transparent 28%)`,
    `radial-gradient(circle at 85% 10%, ${rgba(spot2[0], spot2[1], spot2[2], lerp(0.22, 0.26, t))}, transparent 32%)`,
    `radial-gradient(circle at 54% 90%, ${rgba(spot3[0], spot3[1], spot3[2], lerp(0.16, 0.22, t))}, transparent 35%)`,
  ].join(', ')
}

export function getTimeGridBackground(t: number) {
  const rgb = lerpRgb(LINE_FROM, LINE_TO, t)
  const alpha = lerp(0.08, 0.1, t)
  const line = rgba(rgb[0], rgb[1], rgb[2], alpha)
  return `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`
}

export function getTimeOrbitBorder(t: number) {
  const rgb = lerpRgb(LINE_FROM, LINE_TO, t)
  return rgba(rgb[0], rgb[1], rgb[2], lerp(0.035, 0.055, t))
}

export function getTimeLineRgb(t: number) {
  const rgb = lerpRgb(LINE_FROM, LINE_TO, t)
  return `${rgb[0]}, ${rgb[1]}, ${rgb[2]}`
}

export function getTimeDotColor(t: number) {
  const rgb = lerpRgb(LINE_FROM, LINE_TO, t)
  return rgba(rgb[0], rgb[1], rgb[2], 0.42)
}
