<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onUnmounted, ref, watch } from 'vue'

const ROWS = 5
const COLS = 6
const OUT = 5
const R_BATCH = 2
const R_TICK = 48
const AFTER_R_MS = 550
const ALGO_PULSE_MS = 900
const OUT_TICK = 180
const VERDICT_MS = 500

function hash01(i: number) {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

const trueAlphas = Float32Array.from(
  { length: ROWS * COLS },
  (_, i) => 0.2 + hash01(i * 7 + 2) * 0.8,
)

const prAlphas = new Float32Array(ROWS * COLS)
{
  const diag = Array.from(
    { length: ROWS + COLS - 1 },
    (_, k) => 0.22 + hash01(k * 13 + 5) * 0.75,
  )
  for (let i = 0; i < ROWS; i++) {
    for (let j = 0; j < COLS; j++)
      prAlphas[i * COLS + j] = diag[i - j + COLS - 1]!
  }
}

const trueOrder = Uint16Array.from(
  Array.from({ length: ROWS * COLS }, (_, i) => i).sort(
    (a, b) => hash01(a + 3) - hash01(b + 3),
  ),
)
const prOrder = Uint16Array.from(
  Array.from({ length: ROWS * COLS }, (_, i) => i).sort(
    (a, b) => hash01(a * 2 + 9) - hash01(b * 2 + 9),
  ),
)

const outAlphas = Float32Array.from(
  { length: OUT },
  (_, i) => 0.35 + hash01(i * 11 + 1) * 0.55,
)

const { $clicks } = useSlideContext()

const trueReveal = ref(0)
const prReveal = ref(0)
const showArrowIn = ref(false)
const showAlgo = ref(false)
const algoPulse = ref(false)
const showArrowOut = ref(false)
const outReveal = ref(0)
const showPerson = ref(false)
const indistinct = ref(false)

let token = 0
let pipelineStarted = false
let personStarted = false

function delay(ms: number, t: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (t === token)
        resolve()
    }, ms)
  })
}

function resetAll() {
  token += 1
  pipelineStarted = false
  personStarted = false
  trueReveal.value = 0
  prReveal.value = 0
  showArrowIn.value = false
  showAlgo.value = false
  algoPulse.value = false
  showArrowOut.value = false
  outReveal.value = 0
  showPerson.value = false
  indistinct.value = false
}

async function runPipelineOnce() {
  const t = ++token
  trueReveal.value = 0
  prReveal.value = 0
  showArrowIn.value = false
  showAlgo.value = false
  algoPulse.value = false
  showArrowOut.value = false
  outReveal.value = 0

  await delay(250, t)
  if (t !== token)
    return

  // 1. R / R̃
  const n = ROWS * COLS
  while (trueReveal.value < n || prReveal.value < n) {
    if (t !== token)
      return
    trueReveal.value = Math.min(n, trueReveal.value + R_BATCH)
    prReveal.value = Math.min(n, prReveal.value + R_BATCH)
    await delay(R_TICK, t)
  }

  await delay(AFTER_R_MS, t)
  if (t !== token)
    return

  // 2. 矢印 →
  showArrowIn.value = true
  await delay(380, t)
  if (t !== token)
    return

  // 3. A
  showAlgo.value = true
  await delay(280, t)
  if (t !== token)
    return
  algoPulse.value = true
  await delay(ALGO_PULSE_MS, t)
  if (t !== token)
    return

  // 4. 矢印 →
  showArrowOut.value = true
  await delay(380, t)
  if (t !== token)
    return

  // 5. y / ỹ
  while (outReveal.value < OUT) {
    if (t !== token)
      return
    outReveal.value += 1
    await delay(OUT_TICK, t)
  }
}

async function revealPerson() {
  const t = token
  showPerson.value = true
  indistinct.value = false
  await delay(VERDICT_MS, t)
  if (t !== token)
    return
  indistinct.value = true
}

const truePos = new Int16Array(ROWS * COLS)
const prPos = new Int16Array(ROWS * COLS)
for (let k = 0; k < trueOrder.length; k++) {
  truePos[trueOrder[k]!] = k
  prPos[prOrder[k]!] = k
}

function isTrueVisible(idx: number) {
  return truePos[idx]! < trueReveal.value
}
function isPrVisible(idx: number) {
  return prPos[idx]! < prReveal.value
}

watch(
  $clicks,
  (current) => {
    if (current < 1) {
      resetAll()
      return
    }

    // click 1: R → A → y / R̃ → A → ỹ
    if (!pipelineStarted) {
      pipelineStarted = true
      runPipelineOnce()
    }

    // click 2: 人間 + 吹き出し
    if (current >= 2) {
      if (!personStarted) {
        personStarted = true
        revealPerson()
      }
    }
    else {
      personStarted = false
      showPerson.value = false
      indistinct.value = false
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  resetAll()
})
</script>

<template>
  <!--
    click 1: パイプライン（〜 y, ỹ）
    click 2: 人間 + 吹き出し（不可視スロットでクリックだけ進める）
  -->
  <div class="prg-root">
    <div class="prg" v-click>
      <div class="prg-main">
        <div class="prg-pipelines">
          <!-- 真のランダム行 -->
          <div class="prg-row">
            <div class="prg-col" :class="{ 'is-stage-on': trueReveal > 0 }">
              <div class="prg-matrix-wrap prg-matrix-wrap--true">
                <div
                  class="prg-matrix"
                  :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }"
                >
                  <div
                    v-for="idx in ROWS * COLS"
                    :key="`t-${idx}`"
                    class="prg-cell"
                    :class="{ 'is-visible': isTrueVisible(idx - 1) }"
                    :style="{ '--a': trueAlphas[idx - 1] }"
                  />
                </div>
              </div>
              <div class="prg-caption">
                <Math tex="R" />
                <span>真のランダム</span>
              </div>
            </div>

            <div class="prg-arrow" :class="{ 'is-on': showArrowIn }">→</div>

            <div
              class="prg-algo"
              :class="{ 'is-on': showAlgo, 'is-pulse': algoPulse }"
            >
              <span class="prg-algo-name">A</span>
              <span class="prg-algo-sub">乱択線形代数</span>
            </div>

            <div class="prg-arrow" :class="{ 'is-on': showArrowOut }">→</div>

            <div class="prg-col prg-col--out" :class="{ 'is-stage-on': outReveal > 0 }">
              <div
                class="prg-vector"
                :class="{ 'is-boxed': outReveal >= OUT }"
                :style="{ gridTemplateRows: `repeat(${OUT}, 1fr)` }"
              >
                <div
                  v-for="k in OUT"
                  :key="`ty-${k}`"
                  class="prg-vcell"
                  :class="{ 'is-revealed': k <= outReveal }"
                  :style="{ '--a': outAlphas[k - 1] }"
                />
              </div>
              <div class="prg-caption prg-caption--out" :class="{ 'is-on': outReveal > 0 }">
                <Math tex="y" />
              </div>
            </div>
          </div>

          <!-- 疑似ランダム行 -->
          <div class="prg-row">
            <div class="prg-col" :class="{ 'is-stage-on': prReveal > 0 }">
              <div class="prg-matrix-wrap prg-matrix-wrap--pr">
                <div
                  class="prg-matrix"
                  :style="{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }"
                >
                  <div
                    v-for="idx in ROWS * COLS"
                    :key="`p-${idx}`"
                    class="prg-cell prg-cell--pr"
                    :class="{ 'is-visible': isPrVisible(idx - 1) }"
                    :style="{ '--a': prAlphas[idx - 1] }"
                  />
                </div>
              </div>
              <div class="prg-caption">
                <Math tex="\widetilde{R}" />
                <span>疑似ランダム</span>
              </div>
            </div>

            <div class="prg-arrow" :class="{ 'is-on': showArrowIn }">→</div>

            <div
              class="prg-algo"
              :class="{ 'is-on': showAlgo, 'is-pulse': algoPulse }"
            >
              <span class="prg-algo-name">A</span>
              <span class="prg-algo-sub">乱択線形代数</span>
            </div>

            <div class="prg-arrow" :class="{ 'is-on': showArrowOut }">→</div>

            <div class="prg-col prg-col--out" :class="{ 'is-stage-on': outReveal > 0 }">
              <div
                class="prg-vector prg-vector--pr"
                :class="{ 'is-boxed': outReveal >= OUT }"
                :style="{ gridTemplateRows: `repeat(${OUT}, 1fr)` }"
              >
                <div
                  v-for="k in OUT"
                  :key="`py-${k}`"
                  class="prg-vcell prg-vcell--pr"
                  :class="{ 'is-revealed': k <= outReveal }"
                  :style="{ '--a': outAlphas[k - 1] }"
                />
              </div>
              <div class="prg-caption prg-caption--out" :class="{ 'is-on': outReveal > 0 }">
                <Math tex="\widetilde{y}" />
              </div>
            </div>
          </div>
        </div>

        <div class="prg-right" :class="{ 'is-visible': showPerson }" :aria-hidden="!showPerson">
          <svg
            class="prg-fork"
            viewBox="0 0 48 120"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <path
              class="prg-fork-path"
              d="M0 28 H18 C28 28 28 60 38 60 H48"
              fill="none"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <path
              class="prg-fork-path"
              d="M0 92 H18 C28 92 28 60 38 60 H48"
              fill="none"
              stroke-width="2.2"
              stroke-linecap="round"
            />
          </svg>

          <div class="prg-person-wrap">
            <div class="prg-person">
              <svg
                class="prg-person-svg"
                viewBox="0 0 64 88"
                aria-hidden="true"
              >
                <!-- 視線（左の y, ỹ を見る） -->
                <path
                  class="prg-gaze"
                  d="M18 28 C8 24, 2 20, 0 16"
                  fill="none"
                  stroke-width="1.4"
                  stroke-dasharray="2 2"
                />
                <path
                  class="prg-gaze"
                  d="M18 32 C8 34, 2 38, 0 42"
                  fill="none"
                  stroke-width="1.4"
                  stroke-dasharray="2 2"
                />
                <!-- 頭 -->
                <circle cx="34" cy="22" r="14" class="prg-skin" />
                <!-- 髪 -->
                <path
                  d="M20 20 C22 8, 46 8, 48 20 C42 14, 26 14, 20 20 Z"
                  class="prg-hair"
                />
                <!-- 目（左向き） -->
                <ellipse cx="27" cy="22" rx="2.2" ry="2.6" class="prg-eye" />
                <ellipse cx="36" cy="22" rx="2.2" ry="2.6" class="prg-eye" />
                <circle cx="26.2" cy="22.2" r="0.9" class="prg-pupil" />
                <circle cx="35.2" cy="22.2" r="0.9" class="prg-pupil" />
                <!-- 口（困り気味） -->
                <path
                  d="M28 30 Q34 27 40 30"
                  fill="none"
                  stroke-width="1.6"
                  stroke-linecap="round"
                  class="prg-mouth"
                />
                <!-- 体 -->
                <path
                  d="M22 40 C22 38, 46 38, 46 40 L50 70 C50 76, 18 76, 18 70 Z"
                  class="prg-body"
                />
                <!-- 腕（考える／見るポーズ） -->
                <path
                  d="M22 46 C12 48, 8 40, 14 36"
                  fill="none"
                  stroke-width="3.2"
                  stroke-linecap="round"
                  class="prg-arm"
                />
                <path
                  d="M46 46 C54 50, 56 58, 52 62"
                  fill="none"
                  stroke-width="3.2"
                  stroke-linecap="round"
                  class="prg-arm"
                />
              </svg>
              <span class="prg-person-label">
                効率的アルゴリズム <Math tex="D" />
              </span>
            </div>

            <div class="prg-bubble" :class="{ 'is-on': indistinct }">
              <span class="prg-bubble-text">
                <Math tex="y" /> と <Math tex="\widetilde{y}" /> …
                <br>識別できない！
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-click class="prg-click-slot" aria-hidden="true" />
  </div>
</template>

<style scoped>
.prg-root {
  position: relative;
}

.prg-click-slot {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  opacity: 0;
  pointer-events: none;
}

.prg {
  margin-top: 0.75rem;
  width: 100%;
  display: flex;
  justify-content: center;
}

.prg-main {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
}

.prg-pipelines {
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}

.prg-row {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
}

.prg-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  opacity: 0;
  transform: translateX(-6px);
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.prg-col.is-stage-on {
  opacity: 1;
  transform: translateX(0);
}

.prg-col--out {
  width: 1.6rem;
}

.prg-matrix-wrap {
  padding: 0.22rem;
  border-radius: 6px;
  border: 1.5px solid rgba(245, 124, 0, 0.45);
  background: linear-gradient(135deg, #fffdf8 0%, #fffaf3 100%);
}

.prg-matrix-wrap--pr {
  border-color: rgba(25, 118, 210, 0.4);
  background: linear-gradient(135deg, #f5faff 0%, #eef5fc 100%);
}

.prg-matrix {
  display: grid;
  gap: 1.5px;
  width: 5.1rem;
  aspect-ratio: 6 / 5;
}

.prg-cell {
  border-radius: 1.5px;
  background: rgba(245, 124, 0, calc(0.08 + var(--a) * 0.55));
  border: 1px solid rgba(230, 81, 0, 0.15);
  opacity: 0;
  transform: scale(0.55);
  transition: opacity 0.1s ease, transform 0.1s ease;
}

.prg-cell--pr {
  background: rgba(25, 118, 210, calc(0.08 + var(--a) * 0.5));
  border-color: rgba(25, 118, 210, 0.18);
}

.prg-cell.is-visible {
  opacity: 1;
  transform: scale(1);
}

.prg-caption {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.02rem;
  font-size: 0.55rem;
  font-weight: 700;
  color: #bf360c;
  line-height: 1.15;
  min-height: 1.7em;
}

.prg-caption :deep(.katex) {
  font-size: 0.9rem;
  font-weight: 700;
}

.prg-row:nth-child(2) .prg-caption {
  color: #1565c0;
}

.prg-caption--out {
  opacity: 0;
  transition: opacity 0.25s ease;
  color: #2e7d32;
}

.prg-caption--out.is-on {
  opacity: 1;
}

.prg-arrow {
  font-size: 1.1rem;
  color: #546e7a;
  opacity: 0;
  transform: scale(0.85);
  transition: opacity 0.3s ease, color 0.25s ease, transform 0.3s ease;
  margin-bottom: 1.1rem;
}

.prg-arrow.is-on {
  opacity: 1;
  transform: scale(1);
}

.prg-algo {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.05rem;
  min-width: 4.2rem;
  padding: 0.4rem 0.5rem;
  border-radius: 8px;
  border: 2px solid #78909c;
  background: #eceff1;
  margin-bottom: 1.1rem;
  opacity: 0;
  transform: translateX(-6px) scale(0.94);
  transition:
    opacity 0.35s ease,
    transform 0.35s ease,
    border-color 0.25s ease,
    background 0.25s ease,
    box-shadow 0.25s ease;
}

.prg-algo.is-on {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.prg-algo.is-pulse {
  border-color: #455a64;
  background: #cfd8dc;
  box-shadow: 0 0 0 3px rgba(69, 90, 100, 0.18);
}

.prg-algo-name {
  font-size: 1.05rem;
  font-weight: 800;
  color: #37474f;
  line-height: 1;
}

.prg-algo-sub {
  font-size: 0.5rem;
  font-weight: 700;
  color: #607d8b;
  letter-spacing: 0.02em;
}

.prg-vector {
  display: grid;
  gap: 1.5px;
  width: 0.8rem;
  height: 3.9rem;
  padding: 0.18rem;
  border-radius: 5px;
  border: 2px solid transparent;
  background: transparent;
  transition: border-color 0.3s ease, background 0.3s ease, box-shadow 0.3s ease;
}

.prg-vector.is-boxed {
  border-color: #388e3c;
  background: linear-gradient(180deg, #e8f5e9 0%, #f1f8e9 100%);
  box-shadow: 0 1px 6px rgba(56, 142, 60, 0.12);
}

.prg-vector--pr.is-boxed {
  border-color: #1976d2;
  background: linear-gradient(180deg, #e3f2fd 0%, #f5faff 100%);
  box-shadow: 0 1px 6px rgba(25, 118, 210, 0.12);
}

.prg-vcell {
  border-radius: 1.5px;
  background: rgba(56, 142, 60, calc(0.25 + var(--a) * 0.45));
  border: 1px solid rgba(56, 142, 60, 0.25);
  opacity: 0;
  transform: scale(0.5);
  transition: opacity 0.15s ease, transform 0.15s ease;
}

.prg-vcell--pr {
  background: rgba(25, 118, 210, calc(0.25 + var(--a) * 0.45));
  border-color: rgba(25, 118, 210, 0.25);
}

.prg-vcell.is-revealed {
  opacity: 1;
  transform: scale(1);
}

.prg-right {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  align-self: stretch;
  margin-left: 0.1rem;
  /* 最初から幅を確保し、表示時に図が動かないようにする */
  visibility: hidden;
  opacity: 0;
  pointer-events: none;
}

.prg-right.is-visible {
  visibility: visible;
  opacity: 1;
  pointer-events: auto;
  transition: opacity 0.35s ease;
}

.prg-fork {
  width: 2.4rem;
  height: 100%;
  min-height: 7.5rem;
  overflow: visible;
}

.prg-fork-path {
  stroke: #546e7a;
}

.prg-person-wrap {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.55rem;
  min-width: 11.2rem;
}

.prg-person {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  flex-shrink: 0;
}

.prg-person-svg {
  width: 3.4rem;
  height: 4.7rem;
  overflow: visible;
}

.prg-skin {
  fill: #ffe0b2;
  stroke: #f57c00;
  stroke-width: 1.4;
}

.prg-hair {
  fill: #5d4037;
}

.prg-eye {
  fill: #fff;
  stroke: #37474f;
  stroke-width: 0.8;
}

.prg-pupil {
  fill: #263238;
}

.prg-mouth {
  stroke: #e65100;
}

.prg-body {
  fill: #fff3e0;
  stroke: #ef6c00;
  stroke-width: 1.6;
}

.prg-arm {
  stroke: #ffe0b2;
}

.prg-gaze {
  stroke: #90a4ae;
  opacity: 0.85;
}

.prg-person-label {
  display: inline-flex;
  align-items: baseline;
  gap: 0.2em;
  font-size: 0.52rem;
  font-weight: 700;
  color: #ef6c00;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.prg-person-label :deep(.katex) {
  font-size: 1.05em;
  font-weight: 700;
  color: #e65100;
}

.prg-bubble {
  position: relative;
  margin-top: 0.55rem;
  min-width: 5.8rem;
  padding: 0.4rem 0.55rem;
  border-radius: 14px;
  background: #e8f5e9;
  border: 1.5px solid #66bb6a;
  box-shadow: 0 2px 8px rgba(46, 125, 50, 0.12);
  opacity: 0;
  transform: scale(0.88) translateX(-4px);
  transition: opacity 0.35s ease, transform 0.35s ease;
  flex-shrink: 0;
}

.prg-bubble.is-on {
  opacity: 1;
  transform: scale(1) translateX(0);
}

/* 人物側を指す吹き出しのしっぽ（左向き） */
.prg-bubble::before {
  content: '';
  position: absolute;
  left: -9px;
  top: 42%;
  transform: translateY(-50%);
  border-style: solid;
  border-width: 7px 9px 7px 0;
  border-color: transparent #66bb6a transparent transparent;
}

.prg-bubble::after {
  content: '';
  position: absolute;
  left: -6.5px;
  top: 42%;
  transform: translateY(-50%);
  border-style: solid;
  border-width: 5.5px 7px 5.5px 0;
  border-color: transparent #e8f5e9 transparent transparent;
}

.prg-bubble-text {
  display: block;
  font-size: 0.72rem;
  font-weight: 800;
  color: #1b5e20;
  line-height: 1.35;
  text-align: center;
}

.prg-bubble-text :deep(.katex) {
  font-size: 0.85em;
  font-weight: 700;
}
</style>
