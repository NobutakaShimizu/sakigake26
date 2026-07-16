<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const M = 6
const N = 14
const R_BATCH = 3
const R_TICK_MS = 16
const DOT_STEP_MS = 32
const AFTER_R_PAUSE_MS = 550
const BEFORE_BOX_MS = 220
const RX_PAUSE_MS = 120

const alphas = [
  0.9, 0.2, 0.7, 0.4, 0.85, 0.15, 0.6, 0.35, 0.75, 0.5, 0.25, 0.8, 0.45, 0.65,
  0.3, 0.95, 0.1, 0.55, 0.2, 0.7, 0.4, 0.85, 0.15, 0.6, 0.9, 0.35, 0.75, 0.5,
  0.65, 0.4, 0.8, 0.25, 0.55, 0.9, 0.2, 0.7, 0.45, 0.15, 0.6, 0.85, 0.3, 0.95,
  0.5, 0.75, 0.35, 0.85, 0.45, 0.2, 0.95, 0.3, 0.65, 0.8, 0.4, 0.15, 0.55, 0.7,
  0.25, 0.6, 0.88, 0.12, 0.72, 0.38, 0.52, 0.92, 0.28, 0.68, 0.42, 0.78, 0.18, 0.58,
  0.82, 0.33, 0.48, 0.77, 0.22, 0.63, 0.87, 0.16, 0.54, 0.91, 0.36, 0.69, 0.44, 0.26,
]

const cellOrder = Array.from({ length: M * N }, (_, i) => i).sort((a, b) => {
  const ha = Math.sin((a + 1) * 12.9898) * 43758.5453
  const hb = Math.sin((b + 1) * 12.9898) * 43758.5453
  return (ha - Math.floor(ha)) - (hb - Math.floor(hb))
})

const orderPos = Array.from({ length: M * N }, () => -1)
for (let k = 0; k < cellOrder.length; k++)
  orderPos[cellOrder[k]!] = k

const { $clicks } = useSlideContext()
const { isPrintMode } = useNav()

/** 何個目まで R を表示したか（セル個別 boolean は持たない） */
const rReveal = ref(0)
const rLabelVisible = ref(false)
/** 行列ベクトル積の走査位置。R セルは触らずオーバーレイだけで示す */
const scanRow = ref(-1)
const scanCol = ref(-1)
const rxReveal = ref(0)
const equalsVisible = ref(false)
const rxBoxed = ref(false)

let loopToken = 0
let started = false

const scanOverlayStyle = computed(() => {
  if (scanRow.value < 0 || scanCol.value < 0)
    return undefined
  return {
    '--sr': String(scanRow.value),
    '--sc': String(scanCol.value),
  }
})

function resetAll() {
  loopToken += 1
  started = false
  rReveal.value = 0
  rLabelVisible.value = false
  scanRow.value = -1
  scanCol.value = -1
  rxReveal.value = 0
  equalsVisible.value = false
  rxBoxed.value = false
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
  rReveal.value = 0
  rLabelVisible.value = false

  const n = cellOrder.length
  while (rReveal.value < n) {
    if (token !== loopToken)
      return
    rReveal.value = Math.min(n, rReveal.value + R_BATCH)
    await delay(R_TICK_MS, token)
  }

  await delay(80, token)
  if (token === loopToken)
    rLabelVisible.value = true
}

async function animateRxCompression(token: number) {
  rxReveal.value = 0
  rxBoxed.value = false
  equalsVisible.value = true
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
    rxReveal.value = row + 1
    await delay(RX_PAUSE_MS, token)
  }

  if (token !== loopToken)
    return

  scanRow.value = -1
  scanCol.value = -1
  await delay(BEFORE_BOX_MS, token)
  if (token === loopToken)
    rxBoxed.value = true
}

function applyPrintFinalState() {
  loopToken += 1
  started = true
  rReveal.value = M * N
  rLabelVisible.value = true
  scanRow.value = -1
  scanCol.value = -1
  rxReveal.value = M
  equalsVisible.value = true
  rxBoxed.value = true
}

async function runAnimationOnce() {
  if (isPrintMode.value) {
    applyPrintFinalState()
    return
  }

  const token = ++loopToken

  equalsVisible.value = false
  rxBoxed.value = false
  rxReveal.value = 0

  await animateRGeneration(token)
  if (token !== loopToken)
    return

  await delay(AFTER_R_PAUSE_MS, token)
  if (token !== loopToken)
    return
  await animateRxCompression(token)
}

watch(
  [$clicks, isPrintMode],
  ([current]) => {
    if (isPrintMode.value) {
      applyPrintFinalState()
      return
    }
    if ((current ?? 0) < 1) {
      resetAll()
      return
    }
    if (!started) {
      started = true
      runAnimationOnce()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  resetAll()
})

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
    v-click
  >
    <div class="sketch-compress-stage">
      <div class="sketch-compress-col sketch-compress-col-r">
        <div class="sketch-compress-col-shape">
          <div
            class="sketch-compress-matrix-wrap"
            :class="{ 'has-scan': scanRow >= 0 && scanCol >= 0 }"
            :style="scanOverlayStyle"
          >
            <div
              class="sketch-compress-matrix"
              :style="{ gridTemplateColumns: `repeat(${N}, 1fr)` }"
            >
              <div
                v-for="idx in M * N"
                :key="idx"
                class="sketch-compress-matrix-cell"
                :class="{ 'is-visible': orderPos[idx - 1]! < rReveal }"
                :style="{ '--cell-alpha': alphas[idx - 1] }"
              />
            </div>
            <div class="sketch-compress-scan-hl" aria-hidden="true" />
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
          <span class="sketch-compress-matrix-caption sketch-compress-caption-x">高次元ベクトル</span>
        </div>
      </div>

      <div class="sketch-compress-col sketch-compress-col-result">
        <div class="sketch-compress-col-shape sketch-compress-col-shape-result">
          <div
            class="sketch-compress-equals"
            :class="{ 'is-visible': equalsVisible }"
          >
            =
          </div>
          <div
            class="sketch-compress-vector sketch-compress-vector-rx"
            :class="{ 'is-boxed': rxBoxed }"
            :style="{ gridTemplateRows: `repeat(${M}, var(--sketch-cell-size))` }"
          >
            <div
              v-for="k in M"
              :key="`rx-${k}`"
              class="sketch-compress-vector-cell sketch-compress-vector-cell-rx"
              :class="{ 'is-revealed': k <= rxReveal }"
            />
          </div>
        </div>
        <div class="sketch-compress-col-label sketch-compress-col-label-result is-visible">
          <span class="sketch-compress-label-spacer" aria-hidden="true" />
          <div
            class="sketch-compress-symbol-label sketch-compress-symbol-label-rx"
            :class="{ 'is-revealed': rxBoxed }"
          >
            <Math tex="Rx" />
            <span class="sketch-compress-matrix-caption sketch-compress-caption-rx">圧縮後のベクトル</span>
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
  --sketch-label-height: 2.6rem;
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

/* 走査ハイライトはセル class 更新ではなく 1 枚のオーバーレイ */
.sketch-compress-scan-hl {
  display: none;
  position: absolute;
  top: calc(0.35rem + var(--sr) * (var(--sketch-cell-size) + 2px));
  left: calc(0.35rem + var(--sc) * (var(--sketch-cell-size) + 2px));
  width: var(--sketch-cell-size);
  height: var(--sketch-cell-size);
  border-radius: 2px;
  box-shadow: 0 0 0 2px #e65100;
  pointer-events: none;
  z-index: 2;
}

.sketch-compress-matrix-wrap.has-scan .sketch-compress-scan-hl {
  display: block;
}

.sketch-compress-matrix-caption {
  font-size: 0.65rem;
  font-weight: 700;
  color: #bf360c;
  letter-spacing: 0.06em;
  -webkit-font-smoothing: antialiased;
  white-space: nowrap;
}

.sketch-compress-caption-x {
  color: #1565c0;
}

.sketch-compress-caption-rx {
  color: #2e7d32;
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
  border: 2.5px solid transparent;
  background: transparent;
  box-shadow: none;
  transition:
    border-color 0.35s ease,
    background 0.35s ease,
    box-shadow 0.35s ease;
}

.sketch-compress-vector-rx.is-boxed {
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
  background: rgba(56, 142, 60, 0.42);
  border-color: rgba(56, 142, 60, 0.3);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.sketch-compress-vector-cell-rx.is-revealed {
  opacity: 1;
  transform: scale(1);
}

.sketch-compress-equals {
  font-size: 1.8rem;
  font-weight: 300;
  color: #455a64;
  line-height: 1;
  flex-shrink: 0;
  opacity: 0;
  transition: opacity 0.25s ease;
}

.sketch-compress-equals.is-visible {
  opacity: 1;
}

.sketch-compress-symbol-label-rx {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.08rem;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.sketch-compress-symbol-label-rx.is-revealed {
  opacity: 1;
}
</style>
