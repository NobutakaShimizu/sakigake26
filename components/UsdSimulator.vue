<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import MathTex from './Math.vue'
import {
  K_MAX,
  K_MAX_HALF_UNDECIDED,
  K_MIN,
  N_VERTICES,
  PP_BATCH_SIZE,
  botCount as countBot,
  countOpinions,
  decidedCount as countDecided,
  isConsensus,
  opinionColor,
  runUsdAsyncSimulation,
  runUsdSimulation,
  totalCounted,
  type Opinion,
  type UsdInitialMode,
} from './usdSim'

const props = withDefaults(defineProps<{
  variant?: UsdInitialMode
  updateMode?: 'sync' | 'async'
  chartOnly?: boolean
  nVertices?: number
  k?: number
  autoLoop?: boolean
  playbackIntervalMs?: number
  loopPauseMs?: number
}>(), {
  variant: 'balanced',
  updateMode: 'sync',
  chartOnly: false,
  autoLoop: false,
  playbackIntervalMs: undefined,
  loopPauseMs: 600,
})

const isAsync = computed(() => props.updateMode === 'async')
const batchSize = computed(() => (isAsync.value ? PP_BATCH_SIZE : 1))
const vertexCount = computed(() => props.nVertices ?? N_VERTICES)

const STEP_MS = 80
const AUTO_LOOP_STEP_MS = 450
const PP_SPEED_OPTIONS = [1, 2, 5, 10, 20, 50] as const
const LOOP_SEED = 260326

const playbackSpeed = ref<(typeof PP_SPEED_OPTIONS)[number]>(1)

const kMax = computed(() =>
  props.variant === 'halfUndecided' ? K_MAX_HALF_UNDECIDED : K_MAX,
)

const initialStatusLabel = computed(() =>
  props.variant === 'halfUndecided'
    ? 'Half undecided, half balanced initial configuration.'
    : 'Balanced initial configuration.',
)

const selectedK = ref(K_MIN)
const sliderK = ref(K_MIN)
const started = ref(false)
const history = ref<Opinion[][]>([])
const frameIndex = ref(0)
const playing = ref(false)
const reachedConsensus = ref(false)
const finalOpinion = ref<Opinion>(0)
const consensusTime = ref<number | null>(null)
const displayedConsensusTime = ref<number | null>(null)

let timer: ReturnType<typeof setInterval> | null = null
let countUpTimer: ReturnType<typeof setInterval> | null = null
let loopRestartTimer: ReturnType<typeof setTimeout> | null = null

function resolveK(k?: number) {
  if (k != null)
    return Math.min(kMax.value, Math.max(K_MIN, Math.round(k)))
  if (props.k != null)
    return Math.min(kMax.value, Math.max(K_MIN, Math.round(props.k)))
  if (props.chartOnly)
    return Math.max(K_MIN, Math.round(Math.sqrt(vertexCount.value)))
  return K_MIN
}

function playbackInterval() {
  if (props.playbackIntervalMs != null)
    return props.playbackIntervalMs
  if (props.autoLoop)
    return AUTO_LOOP_STEP_MS
  return STEP_MS
}

const currentConfig = computed(() => history.value[frameIndex.value] ?? [])
const maxFrame = computed(() => Math.max(history.value.length - 1, 0))

const opinionCounts = computed(() => {
  if (!started.value || currentConfig.value.length === 0)
    return []
  return countOpinions(currentConfig.value, selectedK.value)
})

const pieSlices = computed(() => {
  const counts = opinionCounts.value
  if (counts.length === 0)
    return []

  const slices: Array<{ key: string, label: string, count: number, color: string, isBot?: boolean }> = []

  for (let opinion = 1; opinion <= selectedK.value; opinion++) {
    slices.push({
      key: `op-${opinion}`,
      label: String(opinion),
      count: counts[opinion] ?? 0,
      color: opinionColor(opinion),
    })
  }

  slices.push({
    key: 'bot',
    label: '\\bot',
    count: counts[0] ?? 0,
    color: opinionColor(0),
    isBot: true,
  })

  return slices
})

const pieGradient = computed(() => {
  const slices = pieSlices.value.filter(slice => slice.count > 0)
  const total = totalVertices.value
  if (slices.length === 0 || total === 0)
    return 'conic-gradient(#eceff1 0deg 360deg)'

  let angle = 0
  const parts: string[] = []
  for (const slice of slices) {
    const sweep = (slice.count / total) * 360
    parts.push(`${slice.color} ${angle}deg ${angle + sweep}deg`)
    angle += sweep
  }

  return `conic-gradient(from -90deg, ${parts.join(', ')})`
})

const botVertices = computed(() => countBot(opinionCounts.value))
const decidedVertices = computed(() => countDecided(opinionCounts.value))
const activeOpinions = computed(() => {
  const counts = opinionCounts.value
  if (counts.length === 0)
    return 0
  let active = 0
  for (let opinion = 1; opinion < counts.length; opinion++) {
    if ((counts[opinion] ?? 0) > 0)
      active++
  }
  return active
})
const totalVertices = computed(() => {
  if (currentConfig.value.length > 0)
    return currentConfig.value.length
  return totalCounted(opinionCounts.value)
})

const canStep = computed(() =>
  started.value
  && !playing.value
  && !reachedConsensus.value
  && frameIndex.value < maxFrame.value,
)

const canRunToEnd = computed(() =>
  started.value
  && !playing.value
  && !reachedConsensus.value
  && history.value.length > 1
  && frameIndex.value < history.value.length - 1,
)

const canPause = computed(() => started.value && playing.value)

const consensusTimeDisplay = computed(() => displayedConsensusTime.value)

const consensusTimeTex = computed(() => {
  if (consensusTimeDisplay.value === null)
    return null
  return formatConsensusTime(consensusTimeDisplay.value)
})

const statusText = computed(() => {
  if (!started.value)
    return 'Select k with the slider, then press Step or Run to end.'
  if (playing.value)
    return isAsync.value ? 'Running population protocol USD…' : 'Running synchronous USD…'
  if (reachedConsensus.value)
    return 'Consensus reached.'
  if (frameIndex.value >= maxFrame.value)
    return 'Stopped (step cap).'
  if (frameIndex.value === 0)
    return initialStatusLabel.value
  return 'Paused.'
})

function frameToTime(frame: number) {
  return frame * batchSize.value
}

function rawUpdateCount(frame: number) {
  return frame * batchSize.value
}

function parallelTimeFromFrame(frame: number) {
  return rawUpdateCount(frame) / vertexCount.value
}

function consensusTimeFromFrame(frame: number) {
  return isAsync.value ? parallelTimeFromFrame(frame) : frameToTime(frame)
}

function formatConsensusTime(value: number) {
  if (Math.abs(value - Math.round(value)) < 1e-9)
    return String(Math.round(value))
  return value.toFixed(1)
}

function syncConsensusTimeDisplay() {
  if (!started.value) {
    displayedConsensusTime.value = null
    return
  }

  if (isAsync.value) {
    displayedConsensusTime.value = parallelTimeFromFrame(frameIndex.value)
    return
  }

  if (reachedConsensus.value || playing.value)
    displayedConsensusTime.value = frameToTime(frameIndex.value)
  else
    displayedConsensusTime.value = null
}

function stopCountUp() {
  if (countUpTimer) {
    clearInterval(countUpTimer)
    countUpTimer = null
  }
}

function animateConsensusTime(target: number) {
  if (isAsync.value) {
    displayedConsensusTime.value = target
    return
  }

  stopCountUp()
  displayedConsensusTime.value = 0
  if (target === 0) {
    displayedConsensusTime.value = 0
    return
  }

  const steps = Math.min(target, 30)
  const increment = target / steps
  let tick = 0

  countUpTimer = setInterval(() => {
    tick++
    displayedConsensusTime.value = tick >= steps ? target : Math.round(increment * tick)
    if (tick >= steps)
      stopCountUp()
  }, 12)
}

function stopLoopRestart() {
  if (loopRestartTimer) {
    clearTimeout(loopRestartTimer)
    loopRestartTimer = null
  }
}

function stopPlayback() {
  playing.value = false
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function scheduleLoopRestart() {
  if (!props.autoLoop)
    return

  stopPlayback()
  stopLoopRestart()
  loopRestartTimer = setTimeout(() => {
    loadSimulation(selectedK.value, LOOP_SEED)
    startPlayback()
  }, props.loopPauseMs)
}

function advancePlaybackFrames() {
  const rounds = isAsync.value ? playbackSpeed.value : 1

  for (let i = 0; i < rounds; i++) {
    if (frameIndex.value >= maxFrame.value) {
      if (props.autoLoop)
        scheduleLoopRestart()
      else
        stopPlayback()
      return
    }

    frameIndex.value++

    syncConsensusTimeDisplay()

    if (isConsensus(currentConfig.value)) {
      if (props.autoLoop) {
        scheduleLoopRestart()
        return
      }

      reachedConsensus.value = true
      consensusTime.value = consensusTimeFromFrame(frameIndex.value)
      animateConsensusTime(consensusTime.value)
      stopPlayback()
      return
    }
  }

  if (frameIndex.value >= maxFrame.value) {
    if (props.autoLoop)
      scheduleLoopRestart()
    else
      stopPlayback()
  }
}

function startPlayback() {
  stopPlayback()
  if (!props.autoLoop && frameIndex.value >= maxFrame.value)
    return

  playing.value = true
  timer = setInterval(advancePlaybackFrames, playbackInterval())
}

function setPlaybackSpeed(speed: (typeof PP_SPEED_OPTIONS)[number]) {
  playbackSpeed.value = speed
  if (playing.value)
    startPlayback()
}

function loadSimulation(k: number, seedOverride?: number) {
  stopPlayback()
  stopLoopRestart()
  stopCountUp()

  const safeK = resolveK(k)
  selectedK.value = safeK
  sliderK.value = safeK
  started.value = true

  const seed = seedOverride ?? ((safeK * 9973) ^ Date.now())
  const result = isAsync.value
    ? runUsdAsyncSimulation(safeK, seed, props.variant, PP_BATCH_SIZE, vertexCount.value)
    : runUsdSimulation(safeK, seed, props.variant, vertexCount.value)

  history.value = result.history
  frameIndex.value = 0
  reachedConsensus.value = false
  consensusTime.value = null
  displayedConsensusTime.value = null
  finalOpinion.value = result.finalOpinion

  if (result.reachedConsensus && result.history.length === 1) {
    reachedConsensus.value = true
    consensusTime.value = 0
    animateConsensusTime(0)
  }
  else {
    syncConsensusTimeDisplay()
  }
}

function markConsensusIfNeeded() {
  syncConsensusTimeDisplay()
  if (isConsensus(currentConfig.value)) {
    reachedConsensus.value = true
    consensusTime.value = consensusTimeFromFrame(frameIndex.value)
    animateConsensusTime(consensusTime.value)
  }
}

function stepOnce() {
  stopPlayback()
  if (!canStep.value)
    return

  frameIndex.value++
  markConsensusIfNeeded()
}

function runToEnd() {
  if (!canRunToEnd.value)
    return
  startPlayback()
}

const consensusTex = computed(() => {
  if (finalOpinion.value === 0)
    return '\\bot'
  return String(finalOpinion.value)
})

function onKChange() {
  loadSimulation(sliderK.value)
}

function pauseSimulation() {
  stopPlayback()
}

function resetSimulation() {
  loadSimulation(selectedK.value)
}

onMounted(() => {
  loadSimulation(resolveK(), props.autoLoop ? LOOP_SEED : undefined)
  if (props.autoLoop)
    startPlayback()
})

onUnmounted(() => {
  stopPlayback()
  stopLoopRestart()
  stopCountUp()
})
</script>

<template>
  <div class="usd-sim" :class="{ 'usd-sim--chart-only': chartOnly }">
    <div v-if="!chartOnly" class="usd-sim-controls">
      <div class="usd-sim-k-row">
        <span class="usd-sim-label">
          <MathTex tex="k" />:
        </span>
        <input
          v-model.number="sliderK"
          type="range"
          class="usd-sim-slider"
          :min="K_MIN"
          :max="kMax"
          step="1"
          @change="onKChange"
          @click.stop
        >
        <span class="usd-sim-k-value">
          <MathTex :tex="String(sliderK)" />
        </span>
      </div>

      <div class="usd-sim-actions">
        <button
          type="button"
          class="usd-sim-btn"
          :disabled="!canStep"
          @click.stop="stepOnce"
        >
          Step
        </button>
        <button
          type="button"
          class="usd-sim-btn"
          :disabled="!canRunToEnd"
          @click.stop="runToEnd"
        >
          Run to end
        </button>
        <button
          type="button"
          class="usd-sim-btn"
          :disabled="!canPause"
          @click.stop="pauseSimulation"
        >
          Pause
        </button>
        <button
          type="button"
          class="usd-sim-btn"
          :disabled="!started"
          @click.stop="resetSimulation"
        >
          Reset
        </button>
      </div>

      <div v-if="isAsync" class="usd-sim-speed-row">
        <span class="usd-sim-label">speed</span>
        <div class="usd-sim-speed-options">
          <button
            v-for="speed in PP_SPEED_OPTIONS"
            :key="speed"
            type="button"
            class="usd-sim-speed-btn"
            :class="{ active: playbackSpeed === speed }"
            @click.stop="setPlaybackSpeed(speed)"
          >
            ×{{ speed }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="!chartOnly" class="usd-sim-meta">
      <span class="usd-sim-time">
        <MathTex :tex="`t=${started ? frameToTime(frameIndex) : 0}`" />
      </span>
      <span
        class="usd-sim-consensus-time"
        :class="{ done: reachedConsensus, pending: playing && !reachedConsensus }"
      >
        <span class="usd-sim-consensus-time-label">
          {{ isAsync ? 'consensus time (parallel)' : 'consensus time' }}
        </span>
        <MathTex v-if="consensusTimeTex !== null" :tex="consensusTimeTex" />
        <span v-else class="usd-sim-consensus-pending">—</span>
      </span>
      <span class="usd-sim-status">{{ statusText }}</span>
      <span v-if="reachedConsensus" class="usd-sim-final">
        final color:
        <MathTex :tex="consensusTex" />
      </span>
    </div>

    <div class="usd-sim-chart">
      <div class="usd-sim-chart-title">
        Empirical distribution of colors
        <span class="usd-sim-chart-sub">
          (<MathTex :tex="`n=${vertexCount}`" />)
        </span>
      </div>

      <div class="usd-sim-chart-body">
        <div class="usd-sim-pie-wrap">
          <div
            v-if="started"
            class="usd-sim-pie"
            :style="{ background: pieGradient }"
            role="img"
            aria-label="Color pie chart"
          />
          <div v-else class="usd-sim-pie usd-sim-pie-placeholder">
            Loading…
          </div>
        </div>

        <div v-if="started" class="usd-sim-legend">
          <div class="usd-sim-legend-row usd-sim-legend-active">
            <span class="usd-sim-legend-label">
              <MathTex tex="\text{\# of colors in } [k]" />
            </span>
            <span class="usd-sim-legend-count">{{ activeOpinions }}</span>
          </div>
          <div class="usd-sim-legend-divider" />
          <div class="usd-sim-legend-row usd-sim-legend-total">
            <span class="usd-sim-swatch" :style="{ backgroundColor: opinionColor(1) }" />
            <span class="usd-sim-legend-label">decided</span>
            <span class="usd-sim-legend-count">{{ decidedVertices }}</span>
          </div>
          <div class="usd-sim-legend-row usd-sim-legend-total">
            <span
              class="usd-sim-swatch usd-sim-swatch-bot"
              :style="{ backgroundColor: opinionColor(0) }"
            />
            <span class="usd-sim-legend-label">
              <MathTex tex="\bot" />
            </span>
            <span class="usd-sim-legend-count">{{ botVertices }}</span>
          </div>
          <div class="usd-sim-legend-row usd-sim-legend-total">
            <span class="usd-sim-legend-label">total</span>
            <span class="usd-sim-legend-count">{{ totalVertices }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.usd-sim {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  margin-top: 0.1rem;
  flex: 1;
  min-height: 0;
  text-align: left;
}

.usd-sim-controls {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem 1rem;
}

.usd-sim-k-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  flex: 1;
  min-width: 14rem;
}

.usd-sim-label {
  font-weight: 600;
  color: #455a64;
  white-space: nowrap;
}

.usd-sim-slider {
  flex: 1;
  min-width: 8rem;
  max-width: 18rem;
  accent-color: #1976d2;
  cursor: pointer;
}

.usd-sim-k-value {
  min-width: 2rem;
  font-weight: 700;
  color: #1976d2;
}

.usd-sim-btn {
  border: 1px solid #b0bec5;
  background: #fff;
  color: #37474f;
  border-radius: 6px;
  padding: 0.2rem 0.55rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.usd-sim-btn:hover:not(:disabled) {
  border-color: #1976d2;
  color: #1976d2;
}

.usd-sim-btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.usd-sim-actions {
  display: flex;
  gap: 0.35rem;
}

.usd-sim-speed-row {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  flex-wrap: wrap;
}

.usd-sim-speed-options {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
}

.usd-sim-speed-btn {
  border: 1px solid #b0bec5;
  background: #fff;
  color: #546e7a;
  border-radius: 999px;
  padding: 0.12rem 0.45rem;
  font-size: 0.74rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}

.usd-sim-speed-btn:hover {
  border-color: #1976d2;
  color: #1976d2;
}

.usd-sim-speed-btn.active {
  border-color: #1976d2;
  background: #e3f2fd;
  color: #1565c0;
}

.usd-sim-meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem 1.2rem;
  font-size: 0.88rem;
  color: #546e7a;
}

.usd-sim-time {
  font-weight: 700;
  color: #37474f;
}

.usd-sim-consensus-time {
  display: inline-flex;
  align-items: baseline;
  gap: 0.35rem;
  padding: 0.12rem 0.55rem;
  border-radius: 999px;
  background: #eceff1;
  font-weight: 600;
  transition: background 0.35s ease, color 0.35s ease;
}

.usd-sim-consensus-time.done {
  background: #e8f5e9;
  color: #2e7d32;
}

.usd-sim-consensus-time.pending {
  background: #fff8e1;
  color: #f57c00;
}

.usd-sim-consensus-pending {
  font-weight: 700;
}

.usd-sim-consensus-time-label {
  font-size: 0.78rem;
  text-transform: lowercase;
  letter-spacing: 0.01em;
}

.usd-sim-final {
  color: #2e7d32;
  font-weight: 600;
}

.usd-sim-chart {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  padding: 0.55rem 0.75rem 0.65rem;
  border: 1px solid #cfd8dc;
  border-radius: 10px;
  background: #fff;
}

.usd-sim-chart-title {
  font-weight: 700;
  margin-bottom: 0.55rem;
  color: #455a64;
  font-size: 0.82rem;
}

.usd-sim-chart-sub {
  font-weight: 400;
  color: #78909c;
  margin-left: 0.35rem;
}

.usd-sim-chart-body {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2rem;
  flex-wrap: wrap;
  flex: 1;
  min-height: 17rem;
}

.usd-sim-pie-wrap {
  flex-shrink: 0;
}

.usd-sim-pie {
  width: 16.5rem;
  height: 16.5rem;
  border-radius: 50%;
  border: 2px solid #cfd8dc;
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.4);
  transition: background 0.08s ease;
}

.usd-sim-pie-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: #eceff1;
  color: #78909c;
  font-size: 0.85rem;
  text-align: center;
  padding: 0.5rem;
}

.usd-sim-legend {
  display: flex;
  flex-direction: column;
  gap: 0.28rem;
  min-width: 10.5rem;
  max-height: 16.5rem;
  overflow-y: auto;
}

.usd-sim-legend-row.usd-sim-legend-active {
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  font-weight: 700;
  color: #1976d2;
  padding: 0.1rem 0 0.2rem;
}

.usd-sim-legend-row.usd-sim-legend-active .usd-sim-legend-label {
  grid-column: 1;
  white-space: nowrap;
}

.usd-sim-legend-row.usd-sim-legend-active .usd-sim-legend-count {
  grid-column: 2;
  color: #1976d2;
  font-size: 0.95rem;
  min-width: 1.75rem;
  text-align: right;
}

.usd-sim-legend-row {
  display: grid;
  grid-template-columns: 0.9rem 1.5rem 1fr;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.82rem;
  color: #37474f;
  transition: opacity 0.35s ease;
}

.usd-sim-legend-divider {
  margin: 0.35rem 0 0.2rem;
  border-top: 1px solid #e0e0e0;
}

.usd-sim-legend-total {
  font-weight: 600;
}

.usd-sim-legend-total .usd-sim-legend-label {
  grid-column: 2;
}

.usd-sim-legend-total .usd-sim-legend-count {
  color: #37474f;
}

.usd-sim-swatch {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(0, 0, 0, 0.12);
}

.usd-sim-swatch-bot {
  border-style: dashed;
}

.usd-sim-legend-count {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: #546e7a;
}

.usd-sim.usd-sim--chart-only {
  margin-top: 0;
  width: 100%;
}

.usd-sim--chart-only .usd-sim-chart {
  flex: none;
  padding: 0.45rem 0.55rem 0.55rem;
}

.usd-sim--chart-only .usd-sim-chart-title {
  font-size: 0.78rem;
  margin-bottom: 0.4rem;
  text-align: center;
}

.usd-sim--chart-only .usd-sim-chart-body {
  min-height: 0;
  gap: 1rem;
}

.usd-sim--chart-only .usd-sim-pie {
  width: 11.5rem;
  height: 11.5rem;
  transition: background 0.35s ease;
}

.usd-sim--chart-only .usd-sim-legend {
  min-width: 8.5rem;
  max-height: 11.5rem;
  font-size: 0.78rem;
}
</style>
