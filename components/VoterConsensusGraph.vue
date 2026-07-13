<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MathTex from './Math.vue'
import {
  VOTER_K,
  VOTER_MAX_STEPS,
  VOTER_N,
  createVoterRng,
  isVoterConsensus,
  randomConfiguration,
  voterOpinionColor,
  voterStep,
  type VoterOpinion,
} from './voterSim'

const props = withDefaults(defineProps<{
  n?: number
  k?: number
  stepMs?: number
  restartMs?: number
  autoplay?: boolean
  startOnClick?: boolean
}>(), {
  n: VOTER_N,
  k: VOTER_K,
  stepMs: 260,
  restartMs: 1800,
  autoplay: true,
  startOnClick: false,
})

const config = ref<VoterOpinion[]>([])
const round = ref(0)
const consensus = ref(false)
const started = ref(false)

const waitingForClick = computed(() => props.startOnClick && !started.value)

let rng = createVoterRng()
let stepTimer: ReturnType<typeof setInterval> | null = null
let restartTimer: ReturnType<typeof setTimeout> | null = null

const size = 360
const center = size / 2
const orbitRadius = 142
const nodeRadius = 11

const nodes = computed(() =>
  Array.from({ length: props.n }, (_, i) => {
    const angle = (2 * Math.PI * i) / props.n - Math.PI / 2
    const opinion = config.value[i] ?? 1
    return {
      id: i,
      x: center + orbitRadius * Math.cos(angle),
      y: center + orbitRadius * Math.sin(angle),
      opinion,
      fill: voterOpinionColor(opinion),
      stroke: darken(voterOpinionColor(opinion), 0.22),
    }
  }),
)

const edges = computed(() => {
  const list: Array<{ x1: number, y1: number, x2: number, y2: number }> = []
  const pts = nodes.value
  for (let i = 0; i < pts.length; i++) {
    for (let j = i + 1; j < pts.length; j++) {
      list.push({
        x1: pts[i].x,
        y1: pts[i].y,
        x2: pts[j].x,
        y2: pts[j].y,
      })
    }
  }
  return list
})

function darken(hex: string, amount: number) {
  const value = hex.replace('#', '')
  if (value.length !== 6)
    return '#37474f'
  const r = Math.max(0, Number.parseInt(value.slice(0, 2), 16) * (1 - amount))
  const g = Math.max(0, Number.parseInt(value.slice(2, 4), 16) * (1 - amount))
  const b = Math.max(0, Number.parseInt(value.slice(4, 6), 16) * (1 - amount))
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`
}

function clearTimers() {
  if (stepTimer) {
    clearInterval(stepTimer)
    stepTimer = null
  }
  if (restartTimer) {
    clearTimeout(restartTimer)
    restartTimer = null
  }
}

function initConfiguration() {
  config.value = randomConfiguration(props.n, props.k, rng)
  round.value = 0
  consensus.value = isVoterConsensus(config.value)
}

function beginRun() {
  initConfiguration()
  started.value = true

  if (consensus.value)
    scheduleRestart()
  else
    startStepping()
}

function startFromCurrent() {
  started.value = true

  if (consensus.value)
    return

  if (isVoterConsensus(config.value)) {
    consensus.value = true
    return
  }

  startStepping()
}

function onGraphClick() {
  if (!props.startOnClick || started.value)
    return
  startFromCurrent()
}

function scheduleRestart() {
  clearTimers()
  consensus.value = true
  if (!props.autoplay)
    return

  restartTimer = setTimeout(() => {
    rng = createVoterRng()
    beginRun()
  }, props.restartMs)
}

function startStepping() {
  clearTimers()
  consensus.value = false

  stepTimer = setInterval(() => {
    if (consensus.value)
      return

    config.value = voterStep(config.value, rng)
    round.value++

    if (isVoterConsensus(config.value) || round.value >= VOTER_MAX_STEPS) {
      clearTimers()
      scheduleRestart()
    }
  }, props.stepMs)
}

function repeatSimulation() {
  clearTimers()
  rng = createVoterRng()
  beginRun()
}

onMounted(() => {
  if (props.startOnClick) {
    initConfiguration()
    return
  }
  beginRun()
})

onUnmounted(() => {
  clearTimers()
})
</script>

<template>
  <div
    class="voter-graph-wrap"
    :class="{ 'is-waiting-click': waitingForClick }"
    @click="onGraphClick"
  >
    <div class="voter-graph" :class="{ 'is-consensus': consensus }">
      <div class="voter-graph-round">
        <MathTex :tex="`t=${round}`" />
      </div>
      <svg
        :viewBox="`0 0 ${size} ${size}`"
        class="voter-graph-svg"
        role="img"
        aria-label="Voter model on complete graph"
      >
        <g class="voter-graph-edges" aria-hidden="true">
          <line
            v-for="(edge, idx) in edges"
            :key="`e-${idx}`"
            :x1="edge.x1"
            :y1="edge.y1"
            :x2="edge.x2"
            :y2="edge.y2"
          />
        </g>

        <g class="voter-graph-nodes">
          <g
            v-for="node in nodes"
            :key="node.id"
            class="voter-graph-node"
          >
            <circle
              :cx="node.x"
              :cy="node.y"
              :r="nodeRadius"
              :fill="node.fill"
              :stroke="node.stroke"
            />
          </g>
        </g>
      </svg>
    </div>

    <button
      type="button"
      class="voter-graph-repeat"
      @click.stop="repeatSimulation"
    >
      Repeat
    </button>
  </div>
</template>

<style scoped>
.voter-graph-wrap.is-waiting-click {
  cursor: pointer;
}

.voter-graph-wrap.is-waiting-click .voter-graph {
  box-shadow: inset 0 0 0 1px rgb(25 118 210 / 18%);
}

.voter-graph-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
}

.voter-graph {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.35rem;
  border: 1px solid #cfd8dc;
  border-radius: 10px;
  background: #fff;
  transition: box-shadow 0.35s ease, border-color 0.35s ease;
}

.voter-graph-round {
  position: absolute;
  top: 0.4rem;
  left: 0.55rem;
  z-index: 1;
  font-size: 0.88rem;
  font-weight: 700;
  color: #37474f;
  line-height: 1;
  pointer-events: none;
}

.voter-graph.is-consensus {
  border-color: #81c784;
  box-shadow: 0 0 0 2px rgba(129, 199, 132, 0.25);
}

.voter-graph-svg {
  width: 100%;
  max-width: 21rem;
  height: auto;
  display: block;
}

.voter-graph-edges line {
  stroke: #b0bec5;
  stroke-width: 0.9;
  opacity: 0.28;
}

.voter-graph-node circle {
  stroke-width: 2.5;
  transition: fill 0.18s ease, stroke 0.25s ease;
}

.voter-graph.is-consensus .voter-graph-node circle {
  stroke-width: 3;
  filter: drop-shadow(0 0 4px rgba(46, 125, 50, 0.35));
}

.voter-graph-repeat {
  border: 1px solid #b0bec5;
  background: #fff;
  color: #37474f;
  border-radius: 6px;
  padding: 0.22rem 0.75rem;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.voter-graph-repeat:hover {
  border-color: #1976d2;
  color: #1976d2;
}
</style>
