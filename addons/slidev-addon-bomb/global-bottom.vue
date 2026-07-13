<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import BombIcon from './components/BombIcon.vue'
import './styles/index.css'

const route = useRoute()
const showSlideNum = $slidev.configs?.bomb?.slideNum ?? $slidev.configs?.rabbit?.slideNum ?? false

const bombVisualWidth = 48
const railRef = ref<HTMLElement | null>(null)
const railWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

const trackWidth = computed(() => Math.max(80, railWidth.value))

const total = computed(() => $slidev.nav.total)
const currentPage = computed(() => $slidev.nav.currentPage)

const timeMinutes = computed(() => {
  const raw = route.query.time
  const value = Array.isArray(raw) ? raw[0] : raw
  const parsed = Number(value)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
})

const enabled = computed(() => timeMinutes.value > 0 && route.query.print == null)

const timeProgress = ref(0)
const timerStarted = ref(false)
const ignited = ref(false)
const exploded = ref(false)
const finished = ref(false)
const screenFlashVisible = ref(false)
let intervalId: ReturnType<typeof setInterval> | null = null
let igniteTimeoutId: ReturnType<typeof setTimeout> | null = null
let flashTimeoutId: ReturnType<typeof setTimeout> | null = null
let finishedTimeoutId: ReturnType<typeof setTimeout> | null = null

function clearFlashTimeout() {
  if (flashTimeoutId) {
    clearTimeout(flashTimeoutId)
    flashTimeoutId = null
  }
}

function clearFinishedTimeout() {
  if (finishedTimeoutId) {
    clearTimeout(finishedTimeoutId)
    finishedTimeoutId = null
  }
}

function clearIgniteTimeout() {
  if (igniteTimeoutId) {
    clearTimeout(igniteTimeoutId)
    igniteTimeoutId = null
  }
}

function resetTimer() {
  timeProgress.value = 0
  timerStarted.value = false
  ignited.value = false
  exploded.value = false
  finished.value = false
  screenFlashVisible.value = false
  clearIgniteTimeout()
  clearFlashTimeout()
  clearFinishedTimeout()
  if (intervalId) {
    clearInterval(intervalId)
    intervalId = null
  }
}

function triggerExplosion() {
  ignited.value = true
  syncTimeProgressCss()
  clearIgniteTimeout()
  igniteTimeoutId = setTimeout(() => {
    exploded.value = true
    screenFlashVisible.value = true
    igniteTimeoutId = null
    clearFlashTimeout()
    flashTimeoutId = setTimeout(() => {
      screenFlashVisible.value = false
      flashTimeoutId = null
    }, 1000)
    clearFinishedTimeout()
    finishedTimeoutId = setTimeout(() => {
      finished.value = true
      finishedTimeoutId = null
    }, 1000)
  }, 400)
}

function startTimer() {
  if (intervalId || exploded.value || ignited.value)
    return

  const durationMs = timeMinutes.value * 60 * 1000
  const tickMs = 100
  const maxProgress = trackWidth.value
  const step = maxProgress / (durationMs / tickMs)

  intervalId = setInterval(() => {
    if (exploded.value || ignited.value)
      return

    if (timeProgress.value < maxProgress) {
      timeProgress.value = Math.min(maxProgress, timeProgress.value + step)
      syncTimeProgressCss()
      return
    }

    if (intervalId) {
      clearInterval(intervalId)
      intervalId = null
    }
    syncTimeProgressCss()
    triggerExplosion()
  }, tickMs)
}

function handleStart() {
  if (timerStarted.value || exploded.value || ignited.value)
    return
  timerStarted.value = true
  syncTimeProgressCss()
  startTimer()
}

const showStartButton = computed(
  () => enabled.value && currentPage.value === 1 && !timerStarted.value && !finished.value,
)

watch(enabled, (isEnabled) => {
  if (!isEnabled)
    resetTimer()
})

const burnPercent = computed(() => {
  if (ignited.value || exploded.value)
    return 100
  if (trackWidth.value <= 0)
    return 0
  return (timeProgress.value / trackWidth.value) * 100
})

const pagePercent = computed(() => {
  if (total.value <= 1)
    return 0
  return ((currentPage.value - 1) / (total.value - 1)) * 100
})

const heat = computed(() => burnPercent.value / 100)

const FIREWORK_COLORS = ['#ff1744', '#ff9100', '#ffea00', '#76ff03', '#2979ff', '#e040fb', '#ff4081', '#00e5ff', '#fff176', '#69f0ae']
const FIREWORK_CENTERS = [
  { x: 50, y: 42 },
  { x: 22, y: 28 },
  { x: 78, y: 32 },
  { x: 35, y: 58 },
  { x: 68, y: 52 },
  { x: 12, y: 45 },
  { x: 88, y: 40 },
  { x: 55, y: 72 },
  { x: 30, y: 18 },
  { x: 72, y: 68 },
]

function buildScreenFireworks() {
  const particles: Array<{
    id: number
    cx: number
    cy: number
    angle: number
    dist: number
    color: string
    delay: number
    size: number
    kind: 'dot' | 'streak'
  }> = []
  let id = 0
  for (let c = 0; c < FIREWORK_CENTERS.length; c++) {
    const center = FIREWORK_CENTERS[c]
    for (let i = 0; i < 24; i++) {
      particles.push({
        id: id++,
        cx: center.x,
        cy: center.y,
        angle: (360 / 24) * i + c * 11,
        dist: 80 + (i % 8) * 42 + (c % 4) * 18,
        color: FIREWORK_COLORS[(id + c + i) % FIREWORK_COLORS.length],
        delay: c * 0.035 + (i % 6) * 0.018,
        size: 3 + (i % 4) * 2,
        kind: 'dot',
      })
    }
    for (let i = 0; i < 12; i++) {
      particles.push({
        id: id++,
        cx: center.x,
        cy: center.y,
        angle: (360 / 12) * i + c * 19 + 9,
        dist: 120 + (i % 5) * 55,
        color: FIREWORK_COLORS[(id + i) % FIREWORK_COLORS.length],
        delay: c * 0.04 + 0.05 + (i % 4) * 0.02,
        size: 2 + (i % 3),
        kind: 'streak',
      })
    }
  }
  return particles
}

const screenFireworks = buildScreenFireworks()

function syncTimeProgressCss() {
  if (!enabled.value) {
    document.documentElement.style.removeProperty('--bomb-time-progress')
    document.documentElement.classList.remove('bomb-time-mode')
    return
  }

  document.documentElement.classList.add('bomb-time-mode')
  const progress = timerStarted.value ? heat.value : 0
  document.documentElement.style.setProperty('--bomb-time-progress', String(progress))
}

watch([enabled, timerStarted, heat], syncTimeProgressCss, { immediate: true })

const fuseSparks = [
  { id: 0, angle: 250, dist: 16, delay: 0 },
  { id: 1, angle: 265, dist: 20, delay: 0.04 },
  { id: 2, angle: 280, dist: 14, delay: 0.09 },
  { id: 3, angle: 295, dist: 18, delay: 0.02 },
  { id: 4, angle: 310, dist: 15, delay: 0.07 },
  { id: 5, angle: 235, dist: 17, delay: 0.11 },
  { id: 6, angle: 220, dist: 13, delay: 0.05 },
  { id: 7, angle: 325, dist: 16, delay: 0.13 },
  { id: 8, angle: 272, dist: 22, delay: 0.08 },
  { id: 9, angle: 258, dist: 12, delay: 0.15 },
  { id: 10, angle: 288, dist: 19, delay: 0.03 },
  { id: 11, angle: 305, dist: 14, delay: 0.1 },
]

const fuseEmbers = [
  { id: 0, ex: -20, ey: -12, delay: 0, duration: 0.48 },
  { id: 1, ex: -26, ey: -3, delay: 0.06, duration: 0.42 },
  { id: 2, ex: -16, ey: 8, delay: 0.12, duration: 0.5 },
  { id: 3, ex: -24, ey: -8, delay: 0.03, duration: 0.44 },
  { id: 4, ex: -18, ey: 11, delay: 0.09, duration: 0.46 },
  { id: 5, ex: -28, ey: 2, delay: 0.15, duration: 0.4 },
  { id: 6, ex: -14, ey: -14, delay: 0.02, duration: 0.52 },
  { id: 7, ex: -22, ey: 6, delay: 0.11, duration: 0.43 },
  { id: 8, ex: -30, ey: -6, delay: 0.07, duration: 0.45 },
  { id: 9, ex: -12, ey: -5, delay: 0.14, duration: 0.47 },
  { id: 10, ex: -19, ey: 14, delay: 0.05, duration: 0.49 },
  { id: 11, ex: -25, ey: -11, delay: 0.1, duration: 0.41 },
  { id: 12, ex: -17, ey: -16, delay: 0.08, duration: 0.5 },
  { id: 13, ex: -23, ey: 9, delay: 0.13, duration: 0.44 },
  { id: 14, ex: -15, ey: 4, delay: 0.01, duration: 0.46 },
  { id: 15, ex: -21, ey: -9, delay: 0.16, duration: 0.42 },
]

onMounted(() => {
  if (!railRef.value)
    return
  resizeObserver = new ResizeObserver(([entry]) => {
    railWidth.value = Math.round(entry.contentRect.width)
  })
  resizeObserver.observe(railRef.value)
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  document.documentElement.style.removeProperty('--bomb-time-progress')
  document.documentElement.classList.remove('bomb-time-mode')
  resetTimer()
})
</script>

<template>
  <button
    v-if="showStartButton"
    type="button"
    class="bomb-start-button"
    @click="handleStart"
  >
    START ({{ timeMinutes }}min)
  </button>

  <footer v-if="enabled && !finished" class="bomb-timer-footer">
    <div
      v-if="screenFlashVisible"
      class="bomb-screen-fireworks"
      aria-hidden="true"
    >
      <span
        v-for="particle in screenFireworks"
        :key="`fw-${particle.id}`"
        :class="particle.kind === 'streak' ? 'bomb-screen-fw-streak' : 'bomb-screen-fw-particle'"
        :style="{
          left: `${particle.cx}%`,
          top: `${particle.cy}%`,
          '--angle': `${particle.angle}deg`,
          '--dist': `${particle.dist}px`,
          '--color': particle.color,
          '--size': `${particle.size}px`,
          animationDelay: `${particle.delay}s`,
        }"
      />
    </div>

    <div
      v-if="screenFlashVisible"
      class="bomb-screen-flash"
      aria-hidden="true"
    />

    <div class="bomb-timer-track">
      <div
        v-if="!exploded"
        ref="railRef"
        class="bomb-timer-rail-wrap"
      >
        <div class="bomb-timer-rail">
          <div
            class="bomb-rope-line"
            :style="{
              left: `${burnPercent}%`,
              width: `${100 - burnPercent}%`,
            }"
          />
          <div
            v-if="timeProgress > 0 || ignited"
            class="bomb-spark-host"
            :class="{ 'is-ignited': ignited }"
            :style="{ left: `${burnPercent}%` }"
          >
            <span class="bomb-spark-glow" aria-hidden="true" />
            <span class="bomb-spark-cross-h" />
            <span class="bomb-spark-cross-v" />
            <span class="bomb-timer-spark" />
            <span
              v-for="spark in fuseSparks"
              :key="`spark-${spark.id}`"
              class="bomb-fuse-streak"
              :style="{
                '--angle': `${spark.angle}deg`,
                '--dist': `${spark.dist}px`,
                animationDelay: `${spark.delay}s`,
              }"
            />
            <span
              v-for="ember in fuseEmbers"
              :key="`ember-${ember.id}`"
              class="bomb-fuse-ember"
              :style="{
                '--ex': `${ember.ex}px`,
                '--ey': `${ember.ey}px`,
                animationDelay: `${ember.delay}s`,
                animationDuration: `${ember.duration}s`,
              }"
            />
          </div>
          <div
            class="bomb-timer-page"
            :style="{ left: `${pagePercent}%` }"
          />
        </div>
      </div>

      <BombIcon
        :heat="heat"
        :ignited="ignited"
        :exploded="exploded"
        :current="currentPage"
        :total="total"
        :show-slide-num="showSlideNum"
      />
    </div>
  </footer>
</template>
