<script setup lang="ts">
import type { ClicksContext } from '@slidev/types'
import type { InjectionKey, Ref } from 'vue'
import { onUnmounted, ref, watch } from 'vue'
import { injectLocal } from '@vueuse/core'

const M = 6
const N = 14
const STAGGER_MS = 10
const DOT_STEP_MS = 38
const LOOP_PAUSE_MS = 700

const pattern = [
  [0.9, 0.2, 0.7, 0.4, 0.85, 0.15, 0.6, 0.35, 0.75, 0.5, 0.25, 0.8, 0.45, 0.65],
  [0.3, 0.95, 0.1, 0.55, 0.2, 0.7, 0.4, 0.85, 0.15, 0.6, 0.9, 0.35, 0.75, 0.5],
  [0.65, 0.4, 0.8, 0.25, 0.55, 0.9, 0.2, 0.7, 0.45, 0.15, 0.6, 0.85, 0.3, 0.95],
  [0.5, 0.75, 0.35, 0.85, 0.45, 0.2, 0.95, 0.3, 0.65, 0.8, 0.4, 0.15, 0.55, 0.7],
  [0.25, 0.6, 0.88, 0.12, 0.72, 0.38, 0.52, 0.92, 0.28, 0.68, 0.42, 0.78, 0.18, 0.58],
  [0.82, 0.33, 0.48, 0.77, 0.22, 0.63, 0.87, 0.16, 0.54, 0.91, 0.36, 0.69, 0.44, 0.26],
]

function shuffledCellOrder(count: number) {
  return Array.from({ length: count }, (_, i) => i).sort((a, b) => {
    const ha = Math.sin((a + 1) * 12.9898) * 43758.5453
    const hb = Math.sin((b + 1) * 12.9898) * 43758.5453
    return (ha - Math.floor(ha)) - (hb - Math.floor(hb))
  })
}

const cellOrder = shuffledCellOrder(M * N)

const injectionClicksContext = '$$slidev-clicks-context' as unknown as InjectionKey<Ref<ClicksContext>>
const clicksContext = injectLocal(injectionClicksContext)

const rCellsVisible = ref(Array.from({ length: M * N }, () => false))
const rLabelVisible = ref(false)
const scanRow = ref(-1)
const scanCol = ref(-1)
const rxCellsVisible = ref(Array.from({ length: M }, () => false))

let loopToken = 0

function resetAll() {
  loopToken += 1
  rCellsVisible.value = Array.from({ length: M * N }, () => false)
  rLabelVisible.value = false
  scanRow.value = -1
  scanCol.value = -1
  rxCellsVisible.value = Array.from({ length: M }, () => false)
}

function delay(ms: number, token: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (token === loopToken)
        resolve()
    }, ms)
  })
}

async function animateRGeneration(token: number) {
  rCellsVisible.value = Array.from({ length: M * N }, () => false)
  rLabelVisible.value = false

  for (const cellIdx of cellOrder) {
    if (token !== loopToken)
      return
    rCellsVisible.value[cellIdx] = true
    await delay(STAGGER_MS, token)
  }

  await delay(80, token)
  if (token === loopToken)
    rLabelVisible.value = true
}

async function animateRxCompression(token: number) {
  rxCellsVisible.value = Array.from({ length: M }, () => false)
  scanRow.value = -1
  scanCol.value = -1

  for (let row = 0; row < M; row++) {
    if (token !== loopToken)
      return
    scanRow.value = row

    for (let col = 0; col < N; col++) {
      if (token !== loopToken)
        return
      scanCol.value = col
      await delay(DOT_STEP_MS, token)
    }

    if (token !== loopToken)
      return
    scanCol.value = -1
    rxCellsVisible.value[row] = true
    await delay(140, token)
  }

  if (token === loopToken) {
    scanRow.value = -1
    scanCol.value = -1
  }
}

async function runAnimationLoop(includeRx: boolean) {
  const token = ++loopToken

  while (token === loopToken) {
    await animateRGeneration(token)
    if (token !== loopToken)
      return

    if (includeRx) {
      await delay(200, token)
      if (token !== loopToken)
        return
      await animateRxCompression(token)
    }

    await delay(LOOP_PAUSE_MS, token)
  }
}

watch(
  () => clicksContext?.value?.current ?? 0,
  (current) => {
    resetAll()
    if (current === 1)
      runAnimationLoop(false)
    else if (current >= 2)
      runAnimationLoop(true)
  },
  { immediate: true },
)

onUnmounted(() => {
  resetAll()
})

function cellIndex(row: number, col: number) {
  return row * N + col
}

function isRCellVisible(row: number, col: number) {
  return rCellsVisible.value[cellIndex(row, col)]
}

function isDotCurrent(row: number, col: number) {
  return scanRow.value === row && scanCol.value === col
}

function isDotDone(row: number, col: number) {
  return scanRow.value === row && scanCol.value >= 0 && col < scanCol.value
}

function isXDotCurrent(index: number) {
  return scanRow.value >= 0 && scanCol.value === index
}

function isXDotDone(index: number) {
  return scanRow.value >= 0 && scanCol.value >= 0 && index < scanCol.value
}
</script>

<template>
  <div
    class="sketch-compress"
    :class="{ 'is-compressing': scanRow >= 0 }"
  >
    <div class="sketch-compress-stage">
      <!-- click 1: random matrix R -->
      <div class="sketch-compress-col sketch-compress-col-r" v-click>
        <div class="sketch-compress-col-shape">
          <div class="sketch-compress-matrix-wrap">
            <div
              class="sketch-compress-matrix"
              :style="{ gridTemplateRows: `repeat(${M}, 1fr)`, gridTemplateColumns: `repeat(${N}, 1fr)` }"
            >
              <template v-for="(row, i) in pattern" :key="`row-${i}`">
                <div
                  v-for="(alpha, j) in row"
                  :key="`cell-${i}-${j}`"
                  class="sketch-compress-matrix-cell"
                  :class="{
                    'is-visible': isRCellVisible(i, j),
                    'is-dot-current': isDotCurrent(i, j),
                    'is-dot-done': isDotDone(i, j),
                  }"
                  :style="{ '--cell-alpha': alpha }"
                />
              </template>
            </div>
          </div>
        </div>
        <div
          class="sketch-compress-col-label"
          :class="{ 'is-visible': rLabelVisible }"
        >
          <Math tex="R" />
          <span class="sketch-compress-matrix-caption">ランダム行列</span>
        </div>
      </div>

      <!-- always visible: tall vector x -->
      <div class="sketch-compress-col">
        <div class="sketch-compress-col-shape">
          <div
            class="sketch-compress-vector sketch-compress-vector-x"
            :style="{ gridTemplateRows: `repeat(${N}, var(--sketch-cell-size))` }"
          >
            <div
              v-for="k in N"
              :key="`x-${k}`"
              class="sketch-compress-vector-cell"
              :class="{
                'is-dot-current': isXDotCurrent(k - 1),
                'is-dot-done': isXDotDone(k - 1),
              }"
            />
          </div>
        </div>
        <div class="sketch-compress-col-label is-visible">
          <Math tex="x" />
        </div>
      </div>

      <!-- click 2: = and compressed vector Rx -->
      <div class="sketch-compress-col sketch-compress-col-result" v-click>
        <div class="sketch-compress-col-shape sketch-compress-col-shape-result">
          <div class="sketch-compress-equals">=</div>
          <div
            class="sketch-compress-vector sketch-compress-vector-rx"
            :style="{ gridTemplateRows: `repeat(${M}, var(--sketch-cell-size))` }"
          >
            <div
              v-for="k in M"
              :key="`rx-${k}`"
              class="sketch-compress-vector-cell sketch-compress-vector-cell-rx"
              :class="{
                'is-revealed': rxCellsVisible[k - 1],
                'is-row-computing': scanRow === k - 1 && !rxCellsVisible[k - 1],
              }"
            />
          </div>
        </div>
        <div class="sketch-compress-col-label sketch-compress-col-label-result is-visible">
          <span class="sketch-compress-label-spacer" aria-hidden="true" />
          <div
            class="sketch-compress-symbol-label sketch-compress-symbol-label-rx"
            :class="{ 'is-revealed': rxCellsVisible.some(Boolean) }"
          >
            <Math tex="Rx" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.sketch-compress {
  --sketch-matrix-width: min(11rem, 23vw);
  --sketch-cell-size: calc((var(--sketch-matrix-width) - 13 * 2px) / 14);
  --sketch-shape-height: calc(0.7rem + 14 * var(--sketch-cell-size) + 26px);
  --sketch-label-height: 2.35rem;
  margin-top: 1.25rem;
  width: 100%;
}

.sketch-compress-stage {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  gap: 0.75rem;
  padding: 0.5rem 0;
}

.sketch-compress-col {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.sketch-compress-col-shape {
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--sketch-shape-height);
}

.sketch-compress-col-shape-result {
  flex-direction: row;
  gap: 0.65rem;
}

.sketch-compress-col-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 0.08rem;
  height: var(--sketch-label-height);
  padding-top: 0.35rem;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.sketch-compress-col-label.is-visible {
  opacity: 1;
}

.sketch-compress-col-label-result {
  flex-direction: row;
  align-items: flex-start;
  gap: 0.65rem;
}

.sketch-compress-label-spacer {
  flex-shrink: 0;
  width: 1.8rem;
}

.sketch-compress-symbol-label :deep(.katex) {
  font-size: 1.1rem;
  font-weight: 700;
}

.sketch-compress-col-label :deep(.katex) {
  font-size: 1.1rem;
  font-weight: 700;
  color: #1565c0;
}

.sketch-compress-col-r .sketch-compress-col-label :deep(.katex) {
  font-size: 1.3rem;
  color: #d84315;
}

.sketch-compress-symbol-label-rx :deep(.katex) {
  color: #2e7d32;
}

/* matrix R */
.sketch-compress-matrix-wrap {
  position: relative;
  padding: 0.35rem;
  border: 1.5px solid rgba(245, 124, 0, 0.45);
  border-radius: 8px;
  background: linear-gradient(135deg, #fffdf8 0%, #fffaf3 100%);
  box-shadow: 0 1px 6px rgba(245, 124, 0, 0.07);
}

.sketch-compress-matrix {
  display: grid;
  gap: 2px;
  width: var(--sketch-matrix-width);
  aspect-ratio: 14 / 6;
}

.sketch-compress-matrix-cell {
  border-radius: 2px;
  background: rgba(245, 124, 0, calc(0.06 + var(--cell-alpha) * 0.28));
  border: 1px solid rgba(230, 81, 0, 0.1);
  opacity: 0;
  transform: scale(0.6);
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.sketch-compress-matrix-cell.is-visible {
  opacity: 1;
  transform: scale(1);
}

.sketch-compress-matrix-cell.is-dot-done {
  background: rgba(245, 124, 0, calc(0.1 + var(--cell-alpha) * 0.34));
}

.sketch-compress-matrix-cell.is-dot-current {
  box-shadow: 0 0 0 2px #e65100;
  filter: brightness(1.25);
  z-index: 2;
}

.sketch-compress-matrix-caption {
  font-size: 0.65rem;
  font-weight: 700;
  color: #bf360c;
  letter-spacing: 0.06em;
  -webkit-font-smoothing: antialiased;
}

.sketch-compress-vector {
  display: grid;
  grid-template-columns: var(--sketch-cell-size);
  gap: 2px;
  padding: 0.35rem;
  border: 2.5px solid #1976d2;
  border-radius: 8px;
  background: linear-gradient(180deg, #e3f2fd 0%, #f5faff 100%);
  box-shadow: 0 2px 10px rgba(25, 118, 210, 0.12);
}

.sketch-compress-vector-x .sketch-compress-vector-cell {
  transition: background 0.08s ease, box-shadow 0.08s ease;
}

.sketch-compress-vector-x .sketch-compress-vector-cell.is-dot-done {
  background: rgba(25, 118, 210, 0.48);
}

.sketch-compress-vector-x .sketch-compress-vector-cell.is-dot-current {
  background: rgba(25, 118, 210, 0.78);
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.55);
}

.sketch-compress-vector-rx {
  border-color: #388e3c;
  background: linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 100%);
  box-shadow: 0 2px 10px rgba(56, 142, 60, 0.12);
}

.sketch-compress-vector-cell {
  width: var(--sketch-cell-size);
  height: var(--sketch-cell-size);
  border-radius: 2px;
  background: rgba(25, 118, 210, 0.35);
  border: 1px solid rgba(25, 118, 210, 0.25);
}

.sketch-compress-vector-cell-rx {
  background: rgba(56, 142, 60, 0.08);
  border-color: rgba(56, 142, 60, 0.15);
  opacity: 0.35;
  transform: scale(0.5);
  transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease;
}

.sketch-compress-vector-cell-rx.is-row-computing {
  opacity: 0.55;
  transform: scale(0.82);
  background: rgba(56, 142, 60, 0.18);
  border-color: rgba(56, 142, 60, 0.35);
}

.sketch-compress-vector-cell-rx.is-revealed {
  opacity: 1;
  transform: scale(1);
  background: rgba(56, 142, 60, 0.42);
  animation: none;
}

.sketch-compress-equals {
  font-size: 1.8rem;
  font-weight: 300;
  color: #455a64;
  line-height: 1;
  flex-shrink: 0;
}
</style>
