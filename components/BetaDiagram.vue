<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import betaRaw from '../images/beta.svg?raw'

function extractGElement(svg: string, className: string): string | null {
  const classIdx = svg.indexOf(className)
  if (classIdx < 0)
    return null

  const openStart = svg.lastIndexOf('<g', classIdx)
  if (openStart < 0)
    return null

  let i = openStart
  let depth = 0
  while (i < svg.length) {
    if (svg.startsWith('<g', i) && (svg[i + 2] === ' ' || svg[i + 2] === '>')) {
      depth += 1
      i += 2
      continue
    }
    if (svg.startsWith('</g>', i)) {
      depth -= 1
      if (depth === 0)
        return svg.slice(openStart, i + 4)
      i += 4
      continue
    }
    i += 1
  }
  return null
}

function extractGByCellId(svg: string, cellId: string): string | null {
  return extractGElement(svg, `data-cell-id="${cellId}"`)
}

function extractAllGByClass(svg: string, className: string) {
  const blocks: string[] = []
  let rest = svg
  while (true) {
    const block = extractGElement(rest, className)
    if (!block)
      break
    blocks.push(block)
    rest = rest.replace(block, '')
  }
  return { blocks, rest }
}

/** Waypoint dots (arrow endpoints) revealed with each segment click. */
const SEGMENT_WAYPOINTS = [
  ['9'],
  ['16'],
  ['19'],
  [],
]

const parsed = computed(() => {
  const svgStart = betaRaw.indexOf('<svg')
  const svgOpenEnd = betaRaw.indexOf('>', svgStart) + 1
  const svgClose = betaRaw.lastIndexOf('</svg>')
  let rest = betaRaw.slice(svgOpenEnd, svgClose)
  const segments: string[] = []

  for (let n = 1; n <= 3; n++) {
    const block = extractGElement(rest, `beta-plot-segment-${n}`)
    let segmentHtml = block ?? ''
    if (block)
      rest = rest.replace(block, '')

    for (const cellId of SEGMENT_WAYPOINTS[n - 1] ?? []) {
      const waypoint = extractGByCellId(rest, cellId)
      if (waypoint) {
        segmentHtml += waypoint
        rest = rest.replace(waypoint, '')
      }
    }

    if (segmentHtml)
      segments.push(segmentHtml)
  }

  const seg4 = extractAllGByClass(rest, 'beta-plot-segment-4')
  rest = seg4.rest
  if (seg4.blocks.length)
    segments.push(seg4.blocks.join(''))

  return { base: rest, segments }
})

const root = ref<HTMLElement | null>(null)

function pathLength(path: SVGPathElement) {
  try {
    return Math.ceil(path.getTotalLength())
  }
  catch {
    return 200
  }
}

function prepareDrawingSegment(segmentEl: Element) {
  segmentEl.querySelectorAll('path[fill="none"]').forEach((node) => {
    const path = node as SVGPathElement
    if (path.getAttribute('stroke-dasharray'))
      return
    path.style.setProperty('--beta-path-len', String(pathLength(path)))
  })
}

function syncDrawingState() {
  root.value?.querySelectorAll('.beta-plot-segment.slidev-vclick-current').forEach(prepareDrawingSegment)
}

onMounted(() => {
  nextTick(() => syncDrawingState())
  if (!root.value)
    return
  const observer = new MutationObserver(() => syncDrawingState())
  observer.observe(root.value, { attributes: true, attributeFilter: ['class'], subtree: true })
})
</script>

<template>
  <div ref="root" class="overview-arxiv-shot beta-diagram">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlns:xlink="http://www.w3.org/1999/xlink"
      version="1.1"
      viewBox="-0.5 -0.5 405 229"
      class="beta-diagram-svg"
      role="img"
      aria-label="Diagram for beta_t"
    >
      <g v-html="parsed.base" />
      <g
        v-for="(segment, index) in parsed.segments"
        :key="index"
        v-click="index + 1"
        class="beta-plot-segment"
        v-html="segment"
      />
    </svg>
  </div>
</template>

<style scoped>
.beta-diagram {
  position: relative;
}

.beta-diagram-svg {
  display: block;
  max-height: 15rem;
  width: 100%;
  max-width: 100%;
  border: 1px solid #cfd8dc;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
}

.beta-plot-segment :deep(path[fill="none"]:not([stroke-dasharray])) {
  --beta-path-len: 200;
}

.beta-plot-segment.slidev-vclick-current :deep(path[fill="none"]:not([stroke-dasharray])) {
  stroke-dasharray: var(--beta-path-len, 200);
  stroke-dashoffset: var(--beta-path-len, 200);
  animation: beta-line-draw 0.65s ease-out forwards;
}

.beta-plot-segment.slidev-vclick-current :deep(path[stroke-dasharray]) {
  opacity: 0;
  animation: beta-line-fade 0.55s ease-out forwards;
}

.beta-plot-segment.slidev-vclick-current :deep(path:not([fill="none"])) {
  opacity: 0;
  animation: beta-head-in 0.15s ease 0.58s forwards;
}

.beta-plot-segment.slidev-vclick-current :deep(ellipse) {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
  transform: scale(0);
  animation: beta-point-in 0.2s ease 0.58s forwards;
}

.slidev-vclick-prior.beta-plot-segment :deep(path:not([fill="none"])),
.slidev-vclick-prior.beta-plot-segment :deep(ellipse) {
  opacity: 1;
  transform: none;
}

@keyframes beta-line-draw {
  to {
    stroke-dashoffset: 0;
  }
}

@keyframes beta-line-fade {
  to {
    opacity: 1;
  }
}

@keyframes beta-head-in {
  to {
    opacity: 1;
  }
}

@keyframes beta-point-in {
  to {
    opacity: 1;
    transform: scale(1);
  }
}
</style>
