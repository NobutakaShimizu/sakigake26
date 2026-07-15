<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const COLS = 14

const { $clicks } = useSlideContext()

type Scene = 'idle' | 'gather' | 'formed' | 'compress'
const scene = ref<Scene>('idle')
const arrived = ref(0)
/** 下方向への移動 + 圧縮 0..1 */
const progress = ref(0)

let gatherToken = 0
let compressToken = 0
/** 登場アニメを開始済み / 完了済み（click に戻っても再実行しない、clicks<1 でのみ解除） */
let gatherStarted = false
let gatherDone = false
let compressStarted = false

function delay(ms: number, t: number, kind: 'g' | 'c') {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if ((kind === 'g' ? gatherToken : compressToken) === t)
        resolve()
    }, ms)
  })
}

function colHue(c: number) {
  return (14 + c * 19) % 360
}

function colStyle(c: number) {
  const hue = colHue(c)
  return {
    '--delay': `${c * 36}ms`,
    background: `
      linear-gradient(
        180deg,
        hsla(${hue}, 78%, 62%, 0.22) 0%,
        hsla(${hue}, 82%, 48%, 0.88) 48%,
        hsla(${hue}, 70%, 40%, 0.55) 100%
      )
    `,
  }
}

async function runGatherOnce() {
  if (gatherStarted || gatherDone)
    return
  gatherStarted = true

  const t = ++gatherToken
  scene.value = 'gather'
  arrived.value = 0
  progress.value = 0
  await delay(120, t, 'g')
  if (t !== gatherToken)
    return

  for (let c = 0; c < COLS; c++) {
    if (t !== gatherToken)
      return
    arrived.value = c + 1
    await delay(80, t, 'g')
  }

  gatherDone = true
  if (($clicks.value ?? 0) < 3 && !compressStarted)
    scene.value = 'formed'
}

async function runCompressOnce() {
  if (compressStarted)
    return
  compressStarted = true

  const t = ++compressToken
  if (!gatherDone) {
    gatherToken += 1
    gatherDone = true
    gatherStarted = true
    arrived.value = COLS
  }

  scene.value = 'compress'
  const steps = 28
  for (let i = 1; i <= steps; i++) {
    if (t !== compressToken)
      return
    const x = i / steps
    progress.value = 1 - (1 - x) * (1 - x)
    await delay(36, t, 'c')
  }
}

function resetToIdle() {
  gatherToken += 1
  compressToken += 1
  gatherStarted = false
  gatherDone = false
  compressStarted = false
  arrived.value = 0
  progress.value = 0
  scene.value = 'idle'
}

function undoCompress() {
  compressToken += 1
  compressStarted = false
  progress.value = 0
  scene.value = gatherDone ? 'formed' : (gatherStarted ? 'gather' : 'idle')
}

watch(
  $clicks,
  (current) => {
    const c = current ?? 0

    if (c < 1) {
      resetToIdle()
      return
    }

    runGatherOnce()

    if (c < 3) {
      undoCompress()
      return
    }

    runCompressOnce()
  },
  { immediate: true },
)

onUnmounted(() => {
  gatherToken += 1
  compressToken += 1
})

const clicks = computed(() => $clicks.value ?? 0)
const showPc = computed(() => clicks.value >= 2)
/** click=2: 困り顔 / click>=3: 喜び顔 */
const pcMood = computed<'worried' | 'happy'>(() =>
  clicks.value >= 3 ? 'happy' : 'worried',
)

const bundleStyle = computed(() => {
  const p = progress.value
  // 長い状態は短め・上寄せ → 下にパソコン君の余地
  const heightPct = 52 - 34 * p
  const topPct = 2 + 26 * p
  return {
    top: `${topPct}%`,
    height: `${heightPct}%`,
  }
})
</script>

<template>
  <div class="mo" aria-hidden="true">
    <div class="mo-stage">
      <div
        class="mo-bundle"
        :class="{ 'is-compressing': scene === 'compress' }"
        :style="bundleStyle"
      >
        <div
          v-for="c in COLS"
          :key="c"
          class="mo-col"
          :class="{ 'is-in': arrived > c - 1 }"
          :style="colStyle(c - 1)"
        />
      </div>

      <div
        class="mo-pc"
        :class="{ 'is-in': showPc, [`is-${pcMood}`]: true }"
      >
        <svg class="mo-pc-svg" viewBox="0 0 88 96" aria-hidden="true">
          <!-- モニター本体 -->
          <rect
            x="10"
            y="8"
            width="68"
            height="52"
            rx="6"
            class="mo-pc-bezel"
          />
          <rect
            x="16"
            y="14"
            width="56"
            height="40"
            rx="3"
            class="mo-pc-screen"
          />

          <!-- 顔（画面内・PrgPerson 風） -->
          <g class="mo-pc-face" transform="translate(44 34)">
            <!-- 頭 -->
            <circle cx="0" cy="-2" r="13" class="mo-pc-skin" />
            <!-- 髪 -->
            <path
              d="M-13 -4 C-11 -15, 11 -15, 13 -4 C7 -9, -7 -9, -13 -4 Z"
              class="mo-pc-hair"
            />
            <!-- 目 -->
            <ellipse cx="-5" cy="-2" rx="2.1" ry="2.5" class="mo-pc-eye" />
            <ellipse cx="5" cy="-2" rx="2.1" ry="2.5" class="mo-pc-eye" />
            <!-- 瞳（困り: 上向き考え中 / 喜び: 正面） -->
            <circle
              cx="-5"
              :cy="pcMood === 'worried' ? -3.4 : -1.8"
              r="0.85"
              class="mo-pc-pupil"
            />
            <circle
              cx="5"
              :cy="pcMood === 'worried' ? -3.4 : -1.8"
              r="0.85"
              class="mo-pc-pupil"
            />
            <!-- 眉（困り: 考え中） -->
            <path
              v-if="pcMood === 'worried'"
              d="M-8 -7.2 L-2 -5.8"
              fill="none"
              stroke-width="1.5"
              stroke-linecap="round"
              class="mo-pc-brow"
            />
            <path
              v-if="pcMood === 'worried'"
              d="M8 -7.2 L2 -5.8"
              fill="none"
              stroke-width="1.5"
              stroke-linecap="round"
              class="mo-pc-brow"
            />
            <!-- 口 -->
            <path
              v-if="pcMood === 'worried'"
              d="M-5 6 Q0 4 5 6"
              fill="none"
              stroke-width="1.6"
              stroke-linecap="round"
              class="mo-pc-mouth"
            />
            <path
              v-else
              d="M-7 5 Q0 11 7 5"
              fill="none"
              stroke-width="1.6"
              stroke-linecap="round"
              class="mo-pc-mouth mo-pc-mouth--smile"
            />
            <!-- 考え中の手（あご） -->
            <g v-if="pcMood === 'worried'" class="mo-pc-think-hand">
              <circle cx="11" cy="8" r="3.6" class="mo-pc-skin" />
              <path
                d="M8 10 C10 14, 14 16, 16 14"
                fill="none"
                stroke-width="2.4"
                stroke-linecap="round"
                class="mo-pc-arm"
              />
            </g>
          </g>

          <!-- 汗アイコン（困り・考え中） -->
          <g v-if="pcMood === 'worried'" class="mo-pc-icon mo-pc-icon--sweat">
            <path
              d="M72 10 C72 10, 66 18, 66 22 C66 25.3, 68.7 28, 72 28 C75.3 28, 78 25.3, 78 22 C78 18, 72 10, 72 10 Z"
              class="mo-pc-sweat-drop"
            />
            <ellipse cx="70.2" cy="21" rx="1.4" ry="2" class="mo-pc-sweat-shine" />
          </g>

          <!-- ひらめきマーク（喜び） -->
          <g v-if="pcMood === 'happy'" class="mo-pc-icon mo-pc-icon--idea">
            <!-- 電球 -->
            <circle cx="74" cy="16" r="7" class="mo-pc-bulb" />
            <path
              d="M70 23 L70 26 L78 26 L78 23"
              class="mo-pc-bulb-base"
            />
            <line x1="71.5" y1="28" x2="76.5" y2="28" class="mo-pc-bulb-line" />
            <line x1="72" y1="30" x2="76" y2="30" class="mo-pc-bulb-line" />
            <!-- 光線 -->
            <line x1="74" y1="2" x2="74" y2="5.5" class="mo-pc-ray" />
            <line x1="84" y1="10" x2="87" y2="7" class="mo-pc-ray" />
            <line x1="64" y1="10" x2="61" y2="7" class="mo-pc-ray" />
            <line x1="85" y1="18" x2="88" y2="18" class="mo-pc-ray" />
            <line x1="63" y1="18" x2="60" y2="18" class="mo-pc-ray" />
          </g>

          <!-- スタンド -->
          <path
            d="M36 60 L52 60 L56 72 L32 72 Z"
            class="mo-pc-stand"
          />
          <rect
            x="24"
            y="72"
            width="40"
            height="6"
            rx="2"
            class="mo-pc-base"
          />

          <!-- キーボード（簡易） -->
          <rect
            x="14"
            y="82"
            width="60"
            height="10"
            rx="2"
            class="mo-pc-kbd"
          />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped>
.mo {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  min-height: 12.5rem;
  padding: 0.05rem 0;
  box-sizing: border-box;
}

.mo-stage {
  position: relative;
  flex: 1 1 auto;
  min-height: 11rem;
  overflow: hidden;
}

.mo-bundle {
  position: absolute;
  left: 0.15rem;
  right: 0.15rem;
  display: flex;
  flex-direction: row;
  align-items: stretch;
  gap: 0.11rem;
  transition:
    top 0.05s linear,
    height 0.05s linear;
  z-index: 1;
}

.mo-col {
  flex: 1 1 0;
  min-width: 0;
  border-radius: 999px;
  opacity: 0;
  transform: translateX(130%);
  filter: blur(0.35px);
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.12) inset,
    0 1px 4px rgba(194, 65, 12, 0.08);
  transition:
    transform 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.35s ease;
  transition-delay: var(--delay);
}

.mo-col.is-in {
  opacity: 1;
  transform: translateX(0);
}

/* パソコン君 */
.mo-pc {
  position: absolute;
  left: 50%;
  bottom: 0.05rem;
  transform: translateX(-50%) translateY(0.4rem);
  opacity: 0;
  z-index: 2;
  transition:
    opacity 0.4s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.mo-pc.is-in {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

.mo-pc-svg {
  width: 4.6rem;
  height: 5rem;
  overflow: visible;
  display: block;
}

.mo-pc-bezel {
  fill: #546e7a;
  stroke: #37474f;
  stroke-width: 1.4;
}

.mo-pc-screen {
  fill: #eceff1;
}

.mo-pc-skin {
  fill: #ffe0b2;
  stroke: #f57c00;
  stroke-width: 1.3;
}

.mo-pc-hair {
  fill: #5d4037;
}

.mo-pc-eye {
  fill: #fff;
  stroke: #37474f;
  stroke-width: 0.75;
}

.mo-pc-pupil {
  fill: #263238;
  transition: cy 0.35s ease;
}

.mo-pc-brow {
  stroke: #5d4037;
}

.mo-pc-mouth {
  stroke: #e65100;
}

.mo-pc-mouth--smile {
  stroke: #ef6c00;
}

.mo-pc-arm {
  stroke: #ffe0b2;
}

.mo-pc-icon {
  pointer-events: none;
}

.mo-pc-sweat-drop {
  fill: #4fc3f7;
  stroke: #0288d1;
  stroke-width: 1.2;
}

.mo-pc-sweat-shine {
  fill: #e1f5fe;
  opacity: 0.85;
}

.mo-pc-icon--sweat {
  animation: mo-pc-sweat-drop 0.9s ease-in-out infinite;
  transform-origin: 72px 20px;
}

.mo-pc-bulb {
  fill: #ffeb3b;
  stroke: #f9a825;
  stroke-width: 1.3;
}

.mo-pc-bulb-base {
  fill: #90a4ae;
  stroke: #607d8b;
  stroke-width: 0.8;
}

.mo-pc-bulb-line {
  stroke: #607d8b;
  stroke-width: 1.2;
  stroke-linecap: round;
}

.mo-pc-ray {
  stroke: #f9a825;
  stroke-width: 1.6;
  stroke-linecap: round;
}

.mo-pc-icon--idea {
  animation: mo-pc-idea-pop 0.55s cubic-bezier(0.22, 1, 0.36, 1) both;
  transform-origin: 74px 18px;
}

.mo-pc-stand {
  fill: #78909c;
  stroke: #546e7a;
  stroke-width: 1;
}

.mo-pc-base {
  fill: #607d8b;
}

.mo-pc-kbd {
  fill: #90a4ae;
  stroke: #607d8b;
  stroke-width: 1;
}

.mo-pc.is-worried .mo-pc-svg {
  animation: mo-pc-worry 1.1s ease-in-out infinite;
}

.mo-pc.is-happy .mo-pc-svg {
  animation: mo-pc-bounce 0.7s ease-in-out 2;
}

@keyframes mo-pc-worry {
  0%,
  100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(1px) rotate(1deg);
  }
}

@keyframes mo-pc-sweat-drop {
  0%,
  100% {
    transform: translateY(0) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(3px) scale(0.95);
    opacity: 0.75;
  }
}

@keyframes mo-pc-bounce {
  0%,
  100% {
    transform: translateY(0) scale(1);
  }
  40% {
    transform: translateY(-4px) scale(1.04);
  }
  70% {
    transform: translateY(0) scale(1);
  }
}

@keyframes mo-pc-idea-pop {
  0% {
    transform: scale(0.2) translateY(6px);
    opacity: 0;
  }
  70% {
    transform: scale(1.12) translateY(-1px);
    opacity: 1;
  }
  100% {
    transform: scale(1) translateY(0);
    opacity: 1;
  }
}
</style>
