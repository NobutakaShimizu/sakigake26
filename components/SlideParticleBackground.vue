<script setup lang="ts">
import { nextTick, onMounted, onUnmounted, ref } from 'vue'
import {
  getBombTimeProgress,
  getTimeDotColor,
  getTimeGradientBackground,
  getTimeGridBackground,
  getTimeLineRgb,
  getTimeOrbitBorder,
} from '../utils/bombTimeColors'

const props = withDefaults(defineProps<{
  density?: number
  animateColors?: boolean
}>(), {
  density: 0.7,
  animateColors: false,
})

const INCREASED_AREA_DIV = 18667
const INCREASED_MIN_DOTS = 58

const GRADIENT_PALETTE = [
  { r: 245, g: 158, b: 11 },
  { r: 251, g: 191, b: 36 },
  { r: 25, g: 118, b: 210 },
  { r: 66, g: 165, b: 245 },
  { r: 194, g: 24, b: 91 },
  { r: 126, g: 87, b: 194 },
  { r: 217, g: 119, b: 6 },
]

interface Dot {
  x: number
  y: number
  vx: number
  vy: number
  r: number
  phase: number
}

interface Rgb {
  r: number
  g: number
  b: number
}

const root = ref<HTMLElement | null>(null)
const canvas = ref<HTMLCanvasElement | null>(null)
const gradientRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)

let rafId = 0
let resizeObs: ResizeObserver | null = null

let w = 0
let h = 0
let dots: Dot[] = []
let ctx: CanvasRenderingContext2D | null = null
let dotColor = 'rgba(245, 158, 11, 0.42)'
let lineRgb = '180, 83, 9'

function parseHexColor(input: string): Rgb {
  const hex = input.trim().replace('#', '')
  if (hex.length === 3) {
    const r = Number.parseInt(hex[0] + hex[0], 16)
    const g = Number.parseInt(hex[1] + hex[1], 16)
    const b = Number.parseInt(hex[2] + hex[2], 16)
    return { r, g, b }
  }
  if (hex.length === 6) {
    const r = Number.parseInt(hex.slice(0, 2), 16)
    const g = Number.parseInt(hex.slice(2, 4), 16)
    const b = Number.parseInt(hex.slice(4, 6), 16)
    return { r, g, b }
  }
  return { r: 245, g: 158, b: 11 }
}

function readColors() {
  const el = root.value?.closest('.slidecolor') ?? root.value?.parentElement
  if (!el)
    return
  const styles = getComputedStyle(el)
  const highlight = styles.getPropertyValue('--neversink-highlight-color') || '#f59e0b'
  const rgb = parseHexColor(highlight)
  dotColor = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.68)`
  lineRgb = `${rgb.r}, ${rgb.g}, ${rgb.b}`
}

function paletteColor(phase: number): Rgb {
  const palette = GRADIENT_PALETTE
  const normalized = ((phase % 1) + 1) % 1
  const pos = normalized * palette.length
  const index = Math.floor(pos) % palette.length
  const next = (index + 1) % palette.length
  const frac = pos - Math.floor(pos)
  const a = palette[index]
  const b = palette[next]
  return {
    r: Math.round(a.r + (b.r - a.r) * frac),
    g: Math.round(a.g + (b.g - a.g) * frac),
    b: Math.round(a.b + (b.b - a.b) * frac),
  }
}

function gradientPhase(x: number, y: number, t: number) {
  return (x / Math.max(w, 1)) * 0.58 + (y / Math.max(h, 1)) * 0.34 + t * 0.042
}

function rgba({ r, g, b }: Rgb, alpha: number) {
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

function resetBombTimeStyles() {
  if (gradientRef.value)
    gradientRef.value.style.background = ''
  if (gridRef.value)
    gridRef.value.style.backgroundImage = ''
  if (root.value) {
    for (const orbit of root.value.querySelectorAll('.slide-particle-orbit'))
      (orbit as HTMLElement).style.borderColor = ''
  }
}

function updateBombTimeStyles(t: number) {
  if (gradientRef.value)
    gradientRef.value.style.background = getTimeGradientBackground(t)
  if (gridRef.value)
    gridRef.value.style.backgroundImage = getTimeGridBackground(t)
  const orbitBorder = getTimeOrbitBorder(t)
  if (root.value) {
    for (const orbit of root.value.querySelectorAll('.slide-particle-orbit'))
      (orbit as HTMLElement).style.borderColor = orbitBorder
  }
  dotColor = getTimeDotColor(t)
  lineRgb = getTimeLineRgb(t)
}

function updateAnimatedLayers(t: number) {
  const host = root.value
  if (!host)
    return

  const drift = (t * 0.038) % 1
  const c1 = paletteColor(drift)
  const c2 = paletteColor(drift + 0.28)
  const c3 = paletteColor(drift + 0.56)
  host.style.setProperty('--particle-g1', `${c1.r}, ${c1.g}, ${c1.b}`)
  host.style.setProperty('--particle-g2', `${c2.r}, ${c2.g}, ${c2.b}`)
  host.style.setProperty('--particle-g3', `${c3.r}, ${c3.g}, ${c3.b}`)
  host.style.setProperty('--particle-grid-rgb', `${c2.r}, ${c2.g}, ${c2.b}`)
  host.style.setProperty('--particle-orbit-rgb', `${c3.r}, ${c3.g}, ${c3.b}`)
}

function syncColors(t?: number) {
  const progress = getBombTimeProgress()
  if (progress != null) {
    updateBombTimeStyles(progress)
    return true
  }

  resetBombTimeStyles()
  if (!props.animateColors)
    readColors()
  else if (t != null)
    updateAnimatedLayers(t)
  return false
}

function isRenderable() {
  const host = root.value
  if (!host)
    return false
  const rect = host.getBoundingClientRect()
  return rect.width > 8 && rect.height > 8
}

function initDots() {
  const scale = props.density
  const n = Math.max(
    Math.round(INCREASED_MIN_DOTS * scale),
    Math.floor((w * h) * scale / INCREASED_AREA_DIV),
  )
  dots = Array.from({ length: n }, (_, i) => ({
    x: (i * 129.972 + 37) % Math.max(w, 1),
    y: (i * 83.713 + 91) % Math.max(h, 1),
    vx: Math.sin(i * 12.989) * 0.22,
    vy: Math.cos(i * 78.233) * 0.18,
    r: 2.0 + (i % 6) * 0.38,
    phase: i * 0.67,
  }))
}

function resize() {
  const el = canvas.value
  const host = root.value
  if (!el || !host)
    return

  const rect = host.getBoundingClientRect()
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  w = Math.max(Math.floor(rect.width), 1)
  h = Math.max(Math.floor(rect.height), 1)
  el.width = Math.floor(w * dpr)
  el.height = Math.floor(h * dpr)
  el.style.width = `${w}px`
  el.style.height = `${h}px`
  ctx = el.getContext('2d')
  if (!ctx)
    return
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  initDots()
}

function draw(now: number) {
  rafId = requestAnimationFrame(draw)

  if (!isRenderable() || !ctx || document.hidden)
    return

  const t = now / 1000
  const bombMode = syncColors(t)

  ctx.clearRect(0, 0, w, h)
  const linkDist = Math.min(168, Math.max(125, Math.sqrt(w * h) / 7.5))

  for (const p of dots) {
    p.x += p.vx + 0.05 * Math.sin(t * 0.45 + p.phase)
    p.y += p.vy + 0.04 * Math.cos(t * 0.38 + p.phase)
    if (p.x < -20)
      p.x = w + 20
    if (p.x > w + 20)
      p.x = -20
    if (p.y < -20)
      p.y = h + 20
    if (p.y > h + 20)
      p.y = -20
  }

  for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const a = dots[i]
      const b = dots[j]
      const dx = a.x - b.x
      const dy = a.y - b.y
      const dist = Math.hypot(dx, dy)
      if (dist < linkDist) {
        const alpha = (1 - dist / linkDist) * 0.38
        if (bombMode || !props.animateColors) {
          ctx.strokeStyle = `rgba(${lineRgb}, ${alpha})`
        }
        else {
          const midX = (a.x + b.x) / 2
          const midY = (a.y + b.y) / 2
          const rgb = paletteColor(gradientPhase(midX, midY, t))
          ctx.strokeStyle = rgba(rgb, alpha)
        }
        ctx.lineWidth = 1.85
        ctx.beginPath()
        ctx.moveTo(a.x, a.y)
        ctx.lineTo(b.x, b.y)
        ctx.stroke()
      }
    }
  }

  for (const p of dots) {
    if (!bombMode && props.animateColors) {
      const rgb = paletteColor(gradientPhase(p.x, p.y, t))
      ctx.fillStyle = rgba(rgb, 0.72)
    }
    else {
      ctx.fillStyle = dotColor
    }
    ctx.beginPath()
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

function start() {
  syncColors()
  resize()
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(draw)
}

function stop() {
  cancelAnimationFrame(rafId)
}

onMounted(async () => {
  if (!root.value)
    return

  await nextTick()
  requestAnimationFrame(() => start())

  resizeObs = new ResizeObserver(() => {
    if (isRenderable())
      resize()
  })
  resizeObs.observe(root.value)
})

onUnmounted(() => {
  stop()
  resizeObs?.disconnect()
  resetBombTimeStyles()
})
</script>

<template>
  <div
    ref="root"
    class="slide-particle-bg"
    :class="{ 'is-color-animated': animateColors }"
    aria-hidden="true"
  >
    <div ref="gradientRef" class="slide-particle-bg-gradient" />
    <div ref="gridRef" class="slide-particle-bg-grid" />
    <canvas ref="canvas" class="slide-particle-bg-net" />
    <div class="slide-particle-orbit o1" />
    <div class="slide-particle-orbit o2" />
    <div class="slide-particle-orbit o3" />
  </div>
</template>
