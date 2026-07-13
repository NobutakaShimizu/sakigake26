<script setup lang="ts">
import { computed } from 'vue'
import MathTex from './Math.vue'

const props = withDefaults(defineProps<{
  n?: number
}>(), {
  n: 200,
})

const K_START = 2

const kSqrtN = computed(() => Math.sqrt(props.n))
const kCbrtN = computed(() => props.n ** (1 / 3))

const chartW = 320
const chartH = 210
const padL = 52
const padR = 16
const padT = 22
const padB = 42
const plotW = chartW - padL - padR
const plotH = chartH - padT - padB

interface PanelSpec {
  id: 'population' | 'synchronous'
  title: string
  boundTex: string
  kMax: number
  kKnown: number
  kKnownLabelTex: string
  linePoints: string
  knownX: number
  cites: Array<{
    label: string
    href: string
    k: number
    y: number
    anchor: 'start' | 'middle' | 'end'
  }>
}

function xScale(k: number, kMax: number) {
  return padL + (k / kMax) * plotW
}

function yScale(value: number, yMax: number) {
  return padT + plotH - (value / yMax) * plotH
}

function linePath(kEnd: number, yMax: number) {
  const x1 = xScale(K_START, yMax)
  const y1 = yScale(K_START, yMax)
  const x2 = xScale(kEnd, yMax)
  const y2 = yScale(kEnd, yMax)
  return `M ${x1} ${y1} L ${x2} ${y2}`
}

function toOverlay(k: number, value: number, kMax: number, yMax: number) {
  return {
    left: `${(xScale(k, kMax) / chartW) * 100}%`,
    top: `${(yScale(value, yMax) / chartH) * 100}%`,
  }
}

const panels = computed<PanelSpec[]>(() => {
  const sqrtN = kSqrtN.value
  const cbrtN = kCbrtN.value

  const popKMax = sqrtN * 1.08
  const syncKMax = cbrtN * 1.12

  return [
    {
      id: 'population',
      title: 'Population protocol',
      boundTex: 'O(kn\\log n)',
      kMax: popKMax,
      kKnown: sqrtN,
      kKnownLabelTex: 'k=\\sqrt{n}',
      linePoints: linePath(sqrtN, popKMax),
      knownX: xScale(sqrtN, popKMax),
      cites: [
        {
          label: 'AAE07',
          href: 'https://dl.acm.org/doi/10.5555/2393794.2393801',
          k: 2.35,
          y: 2.15,
          anchor: 'start',
        },
        {
          label: 'CHKM17',
          href: 'https://link.springer.com/chapter/10.1007/978-3-319-66799-7_13',
          k: 3.15,
          y: 3.35,
          anchor: 'start',
        },
        {
          label: 'AABBHKL23',
          href: 'https://dl.acm.org/doi/10.1145/3583668.3594589',
          k: sqrtN * 0.58,
          y: sqrtN * 0.62,
          anchor: 'middle',
        },
      ],
    },
    {
      id: 'synchronous',
      title: 'Synchronous model',
      boundTex: 'O(k\\log n)',
      kMax: syncKMax,
      kKnown: cbrtN,
      kKnownLabelTex: 'k=n^{1/3}',
      linePoints: linePath(cbrtN, syncKMax),
      knownX: xScale(cbrtN, syncKMax),
      cites: [
        {
          label: 'CGGNPS18',
          href: 'https://drops.dagstuhl.de/entities/document/10.4230/LIPIcs.MFCS.2018.28',
          k: 2.25,
          y: 2.05,
          anchor: 'start',
        },
        {
          label: 'BCNPS15',
          href: 'https://dl.acm.org/doi/pdf/10.5555/2722129.2722156',
          k: cbrtN * 0.62,
          y: cbrtN * 0.68,
          anchor: 'middle',
        },
      ],
    },
  ]
})

function xTicks(kMax: number) {
  const ticks = [K_START]
  if (kMax > 6)
    ticks.push(Math.round(kMax / 2))
  ticks.push(Math.round(kMax * 10) / 10)
  return [...new Set(ticks)].sort((a, b) => a - b)
}

function yTicks(yMax: number) {
  const mid = Math.round((yMax / 2) * 10) / 10
  return [K_START, mid, Math.round(yMax * 10) / 10]
}
</script>

<template>
  <div class="consensus-bounds-plot">
    <div
      v-for="panel in panels"
      :key="panel.id"
      class="consensus-bounds-panel"
    >
      <div class="consensus-bounds-panel-head">
        <span class="consensus-bounds-panel-title">{{ panel.title }}</span>
        <span class="consensus-bounds-panel-bound">
          <MathTex :tex="panel.boundTex" />
        </span>
      </div>

      <div class="consensus-bounds-chart">
        <svg
          class="consensus-bounds-svg"
          :viewBox="`0 0 ${chartW} ${chartH}`"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          :aria-label="`${panel.title} consensus time bound`"
        >
          <!-- axes -->
          <line
            :x1="padL"
            :y1="padT"
            :x2="padL"
            :y2="padT + plotH"
            class="consensus-bounds-axis"
          />
          <line
            :x1="padL"
            :y1="padT + plotH"
            :x2="padL + plotW"
            :y2="padT + plotH"
            class="consensus-bounds-axis"
          />

          <!-- known-range boundary -->
          <line
            :x1="panel.knownX"
            :y1="padT"
            :x2="panel.knownX"
            :y2="padT + plotH"
            class="consensus-bounds-known-line"
          />

          <!-- bound line -->
          <path
            :d="panel.linePoints"
            class="consensus-bounds-line"
          />

          <!-- x ticks -->
          <g v-for="tick in xTicks(panel.kMax)" :key="`x-${panel.id}-${tick}`">
            <line
              :x1="xScale(tick, panel.kMax)"
              :y1="padT + plotH"
              :x2="xScale(tick, panel.kMax)"
              :y2="padT + plotH + 5"
              class="consensus-bounds-tick"
            />
            <text
              :x="xScale(tick, panel.kMax)"
              :y="padT + plotH + 18"
              text-anchor="middle"
              class="consensus-bounds-tick-label"
            >
              {{ tick }}
            </text>
          </g>

          <!-- y ticks -->
          <g v-for="tick in yTicks(panel.kMax)" :key="`y-${panel.id}-${tick}`">
            <line
              :x1="padL - 5"
              :y1="yScale(tick, panel.kMax)"
              :x2="padL"
              :y2="yScale(tick, panel.kMax)"
              class="consensus-bounds-tick"
            />
            <text
              :x="padL - 8"
              :y="yScale(tick, panel.kMax) + 4"
              text-anchor="end"
              class="consensus-bounds-tick-label"
            >
              {{ tick }}
            </text>
          </g>

          <!-- axis labels -->
          <foreignObject
            :x="padL + plotW / 2 - 18"
            :y="padT + plotH + 24"
            width="36"
            height="20"
          >
            <MathTex tex="k" />
          </foreignObject>
          <foreignObject
            :x="8"
            :y="padT + plotH / 2 - 44"
            width="40"
            height="88"
          >
            <div class="consensus-bounds-y-label">
              consensus time
            </div>
          </foreignObject>

          <!-- known-range label -->
          <foreignObject
            :x="panel.knownX - 34"
            :y="padT + 2"
            width="68"
            height="22"
          >
            <div class="consensus-bounds-known-label">
              <MathTex :tex="panel.kKnownLabelTex" />
            </div>
          </foreignObject>
        </svg>

        <a
          v-for="cite in panel.cites"
          :key="`${panel.id}-${cite.label}`"
          class="consensus-bounds-cite"
          :class="`consensus-bounds-cite-${cite.anchor}`"
          :href="cite.href"
          target="_blank"
          rel="noopener noreferrer"
          :style="toOverlay(cite.k, cite.y, panel.kMax, panel.kMax)"
        >
          {{ cite.label }}
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.consensus-bounds-plot {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 100%;
  margin-top: 0.15rem;
}

.consensus-bounds-panel {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
  min-width: 0;
  padding: 0.55rem 0.65rem 0.45rem;
  border: 1px solid #cfd8dc;
  border-radius: 10px;
  background: #fff;
}

.consensus-bounds-panel-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0 0.15rem;
}

.consensus-bounds-panel-title {
  font-size: 0.92rem;
  font-weight: 700;
  color: #37474f;
}

.consensus-bounds-panel-bound {
  font-size: 0.82rem;
  color: #546e7a;
}

.consensus-bounds-chart {
  position: relative;
  width: 100%;
}

.consensus-bounds-svg {
  display: block;
  width: 100%;
  height: auto;
}

.consensus-bounds-axis {
  stroke: #455a64;
  stroke-width: 1.5;
}

.consensus-bounds-tick {
  stroke: #90a4ae;
  stroke-width: 1;
}

.consensus-bounds-tick-label {
  font-size: 10px;
  fill: #607d8b;
  font-family: 'Roboto', sans-serif;
}

.consensus-bounds-known-line {
  stroke: #ffb74d;
  stroke-width: 1.2;
  stroke-dasharray: 4 3;
}

.consensus-bounds-line {
  fill: none;
  stroke: #1976d2;
  stroke-width: 2.6;
  stroke-linecap: round;
}

.consensus-bounds-y-label {
  transform: rotate(-90deg);
  transform-origin: center center;
  font-size: 0.68rem;
  font-weight: 600;
  color: #546e7a;
  text-align: center;
  white-space: nowrap;
  line-height: 1.2;
}

.consensus-bounds-known-label {
  font-size: 0.62rem;
  color: #ef6c00;
  text-align: center;
  white-space: nowrap;
}

.consensus-bounds-cite {
  position: absolute;
  transform: translate(-50%, -120%);
  font-size: 0.58rem;
  font-weight: 600;
  color: #1565c0;
  text-decoration: none;
  white-space: nowrap;
  padding: 0.05rem 0.2rem;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.88);
  line-height: 1.2;
  pointer-events: auto;
}

.consensus-bounds-cite-start {
  transform: translate(0, -115%);
}

.consensus-bounds-cite-end {
  transform: translate(-100%, -115%);
}

.consensus-bounds-cite:hover {
  background: rgba(25, 118, 210, 0.1);
}
</style>
