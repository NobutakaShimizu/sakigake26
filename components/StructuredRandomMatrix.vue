<script setup lang="ts">
import type { ClicksContext } from '@slidev/types'
import type { InjectionKey, Ref } from 'vue'
import { computed, onUnmounted, ref, watch } from 'vue'
import { injectLocal } from '@vueuse/core'

/** 8×8 に抑え、セル個別の ref は使わず reveal カウンタだけで描画する */
const SIZE = 8
const TICK_MS = 42
const HOLD_MS = 1100
const GAP_MS = 280
const BATCH = 2

type Pattern = {
  label: string
  values: Float32Array
  order: Uint16Array
}

function hash01(i: number) {
  const x = Math.sin((i + 1) * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

function buildSparse(): Pattern {
  const values = new Float32Array(SIZE * SIZE)
  const nonzero: number[] = []
  for (let i = 0; i < SIZE * SIZE; i++) {
    if (hash01(i * 3 + 7) < 0.22) {
      values[i] = 0.35 + hash01(i * 5 + 1) * 0.65
      nonzero.push(i)
    }
  }
  nonzero.sort((a, b) => hash01(a + 11) - hash01(b + 11))
  return { label: '疎な埋め込み', values, order: Uint16Array.from(nonzero) }
}

function buildToeplitz(): Pattern {
  const values = new Float32Array(SIZE * SIZE)
  // 対角ごと定数: T[i,j] = a_{i-j}（circulant のラップなし）
  const diag = Array.from(
    { length: 2 * SIZE - 1 },
    (_, k) => 0.25 + hash01(k * 17 + 3) * 0.75,
  )
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++)
      values[i * SIZE + j] = diag[i - j + SIZE - 1]!
  }
  // 1行目 → 以降の行を対角構造に沿って埋める
  const order: number[] = []
  for (let j = 0; j < SIZE; j++)
    order.push(j)
  for (let i = 1; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++)
      order.push(i * SIZE + j)
  }
  return { label: 'Toeplitz', values, order: Uint16Array.from(order) }
}

function buildHadamard(): Pattern {
  const values = new Float32Array(SIZE * SIZE)
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      let bit = i & j
      let odd = 0
      while (bit) {
        odd ^= bit & 1
        bit >>= 1
      }
      values[i * SIZE + j] = odd ? 0.28 : 0.92
    }
  }

  // Sylvester 構成: 左上 1→2→4→8 と拡張していく順
  const order: number[] = []
  const seen = new Set<number>()
  for (let n = 1; n <= SIZE; n <<= 1) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        const idx = i * SIZE + j
        if (!seen.has(idx)) {
          seen.add(idx)
          order.push(idx)
        }
      }
    }
  }
  return { label: 'Hadamard / Fourier 型', values, order: Uint16Array.from(order) }
}

const patterns: Pattern[] = [buildSparse(), buildToeplitz(), buildHadamard()]

const injectionClicksContext = '$$slidev-clicks-context' as unknown as InjectionKey<Ref<ClicksContext>>
const clicksContext = injectLocal(injectionClicksContext)

const patternIdx = ref(0)
const reveal = ref(0)
const showFrame = ref(false)
const active = ref(false)

let loopToken = 0

const current = computed(() => patterns[patternIdx.value]!)

/** order 内での出現位置。未登場は -1 */
const orderPos = computed(() => {
  const pos = new Int16Array(SIZE * SIZE).fill(-1)
  const ord = current.value.order
  for (let k = 0; k < ord.length; k++)
    pos[ord[k]!] = k
  return pos
})

function cellAlpha(idx: number) {
  return current.value.values[idx] ?? 0
}

function isZero(idx: number) {
  return cellAlpha(idx) === 0
}

function cellVisible(idx: number) {
  if (isZero(idx))
    return showFrame.value
  const p = orderPos.value[idx] ?? -1
  return p >= 0 && p < reveal.value
}

function delay(ms: number, token: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (token === loopToken)
        resolve()
    }, ms)
  })
}

async function runLoop() {
  const token = ++loopToken
  active.value = true

  while (token === loopToken) {
    for (let p = 0; p < patterns.length; p++) {
      if (token !== loopToken)
        return
      patternIdx.value = p
      reveal.value = 0
      showFrame.value = false
      await delay(GAP_MS, token)
      if (token !== loopToken)
        return
      showFrame.value = true

      const n = patterns[p]!.order.length
      while (reveal.value < n) {
        if (token !== loopToken)
          return
        reveal.value = Math.min(n, reveal.value + BATCH)
        await delay(TICK_MS, token)
      }

      await delay(HOLD_MS, token)
    }
  }
}

function stopLoop() {
  loopToken += 1
  active.value = false
  reveal.value = 0
  showFrame.value = false
  patternIdx.value = 0
}

watch(
  () => clicksContext?.value?.current ?? 0,
  (cur, prev) => {
    if (cur < 1) {
      stopLoop()
      return
    }
    if ((prev ?? 0) < 1)
      runLoop()
  },
  { immediate: true },
)

onUnmounted(() => {
  stopLoop()
})
</script>

<template>
  <div class="srm" :class="{ 'is-active': active }">
    <div class="srm-matrix-wrap">
      <div
        class="srm-matrix"
        :style="{ gridTemplateColumns: `repeat(${SIZE}, 1fr)` }"
      >
        <div
          v-for="idx in SIZE * SIZE"
          :key="idx"
          class="srm-cell"
          :class="{
            'is-zero': isZero(idx - 1),
            'is-visible': cellVisible(idx - 1),
          }"
          :style="{ '--a': cellAlpha(idx - 1) }"
        />
      </div>
    </div>
    <div class="srm-label">
      {{ current.label }}
    </div>
  </div>
</template>

<style scoped>
.srm {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.35rem;
  flex-shrink: 0;
  width: 7.5rem;
}

.srm-matrix-wrap {
  padding: 0.28rem;
  border: 1.5px solid rgba(245, 124, 0, 0.45);
  border-radius: 7px;
  background: linear-gradient(135deg, #fffdf8 0%, #fffaf3 100%);
  box-shadow: 0 1px 5px rgba(245, 124, 0, 0.07);
}

.srm-matrix {
  display: grid;
  gap: 1.5px;
  width: 6.4rem;
  aspect-ratio: 1;
}

.srm-cell {
  border-radius: 1.5px;
  background: rgba(245, 124, 0, calc(0.08 + var(--a) * 0.55));
  border: 1px solid rgba(230, 81, 0, 0.2);
  opacity: 0;
  transform: scale(0.55);
  transition: opacity 0.12s ease, transform 0.12s ease;
}

.srm-cell.is-zero {
  background: #fff;
  border-color: rgba(230, 81, 0, 0.4);
}

.srm-cell.is-visible {
  opacity: 1;
  transform: scale(1);
}

.srm-label {
  font-size: 0.62rem;
  font-weight: 700;
  color: #bf360c;
  letter-spacing: 0.02em;
  text-align: center;
  line-height: 1.2;
  min-height: 1.5em;
}
</style>
