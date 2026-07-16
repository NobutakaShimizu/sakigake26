<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { onUnmounted, ref, watch } from 'vue'

const { $clicks } = useSlideContext()
const { isPrintMode } = useNav()

const props = withDefaults(defineProps<{ clickAt?: number }>(), {
  clickAt: 1,
})

const phase = ref(0)
let token = 0
let started = false

function delay(ms: number, t: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (t === token)
        resolve()
    }, ms)
  })
}

async function run() {
  if (isPrintMode.value) {
    token += 1
    phase.value = 3
    return
  }

  const t = ++token
  phase.value = 1
  await delay(400, t)
  if (t !== token)
    return
  phase.value = 2
  await delay(520, t)
  if (t !== token)
    return
  phase.value = 3
}

function reset() {
  token += 1
  started = false
  phase.value = 0
}

watch(
  [$clicks, isPrintMode],
  ([current]) => {
    if (isPrintMode.value && (current ?? 0) >= props.clickAt) {
      token += 1
      started = true
      phase.value = 3
      return
    }
    if ((current ?? 0) < props.clickAt) {
      reset()
      return
    }
    if (!started) {
      started = true
      run()
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  reset()
})
</script>

<template>
  <div class="ww">
    <div class="ww-flow">
      <!-- 起点: A がうまくいく？ -->
      <div class="ww-ask" :class="{ 'is-on': phase >= 1 }">
        <span class="ww-ask-tex"><Math tex="A" /></span>
        <span>がうまくいく？</span>
      </div>

      <!-- 分岐矢印 + パターン縦並び -->
      <div class="ww-split">
        <svg class="ww-arrows" viewBox="0 0 56 120" preserveAspectRatio="none" aria-hidden="true">
          <path
            class="ww-arrow-path"
            :class="{ 'is-on': phase >= 2 }"
            d="M4 60 H18 C28 60 28 28 40 28 H52"
            fill="none"
            stroke-width="2.2"
            stroke-linecap="round"
          />
          <polygon
            class="ww-arrow-head"
            :class="{ 'is-on': phase >= 2 }"
            points="52,28 44,24 44,32"
          />
          <path
            class="ww-arrow-path ww-arrow-path--b"
            :class="{ 'is-on': phase >= 3 }"
            d="M4 60 H18 C28 60 28 92 40 92 H52"
            fill="none"
            stroke-width="2.2"
            stroke-linecap="round"
          />
          <polygon
            class="ww-arrow-head ww-arrow-head--b"
            :class="{ 'is-on': phase >= 3 }"
            points="52,92 44,88 44,96"
          />
        </svg>

        <div class="ww-patterns">
          <div class="ww-pattern ww-pattern--a" :class="{ 'is-on': phase >= 2 }">
            <div class="ww-pattern-badge">パターン A</div>
            <div class="ww-pattern-main">
              <div class="ww-pattern-title">うまくいく</div>
              <div class="ww-pattern-body">高速・省乱数の乱択線形代数が手に入る</div>
            </div>
            <div class="ww-pattern-result ww-pattern-result--ok">
              実用上の革新
              <span class="ww-hint ww-hint--ok">（汎用的な効率化）</span>
            </div>
          </div>

          <div class="ww-pattern ww-pattern--b" :class="{ 'is-on': phase >= 3 }">
            <div class="ww-pattern-badge ww-pattern-badge--b">パターン B</div>
            <div class="ww-pattern-main">
              <div class="ww-pattern-title">うまくいかない</div>
              <div class="ww-pattern-body">
                計算量的仮定が偽だった
              </div>
            </div>
            <div class="ww-pattern-result ww-pattern-result--break">
              理論上の革新
              <span class="ww-hint">（例: 暗号の不安全性証明）</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ww {
  margin-top: 0.4rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
}

.ww-flow {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.15rem;
  width: min(100%, 38rem);
}

.ww-ask {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.2rem;
  flex-shrink: 0;
  min-width: 7.2rem;
  padding: 0.55rem 0.65rem;
  border-radius: 10px;
  border: 2px solid #1565c0;
  background: linear-gradient(180deg, #e3f2fd 0%, #f5faff 100%);
  box-shadow: 0 2px 8px rgba(21, 101, 192, 0.12);
  font-size: 0.78rem;
  font-weight: 800;
  color: #0d47a1;
  opacity: 0;
  transform: translateX(-8px);
  cursor: default;
  transition: opacity 0.35s ease, transform 0.25s ease, box-shadow 0.25s ease;
}

.ww-ask.is-on {
  opacity: 1;
  transform: translateX(0);
}

.ww-ask.is-on:hover {
  transform: scale(1.06);
  z-index: 2;
  box-shadow: 0 4px 14px rgba(21, 101, 192, 0.2);
}

.ww-ask-tex :deep(.katex) {
  font-size: 1.15rem;
  font-weight: 800;
  color: #1565c0;
}

.ww-split {
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  gap: 0.1rem;
}

.ww-arrows {
  width: 2.6rem;
  height: 6.8rem;
  flex-shrink: 0;
  overflow: visible;
}

.ww-arrow-path {
  stroke: #90a4ae;
  opacity: 0.25;
  transition: opacity 0.35s ease, stroke 0.35s ease;
}

.ww-arrow-path.is-on {
  opacity: 1;
  stroke: #43a047;
}

.ww-arrow-path--b.is-on {
  stroke: #e53935;
}

.ww-arrow-head {
  fill: #90a4ae;
  opacity: 0.25;
  transition: opacity 0.35s ease, fill 0.35s ease;
}

.ww-arrow-head.is-on {
  opacity: 1;
  fill: #43a047;
}

.ww-arrow-head--b.is-on {
  fill: #e53935;
}

.ww-patterns {
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  flex: 1;
  min-width: 0;
}

.ww-pattern {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 0.55rem;
  padding: 0.4rem 0.55rem;
  border-radius: 9px;
  border: 1.5px solid #66bb6a;
  background: linear-gradient(90deg, #e8f5e9 0%, #f7faf5 100%);
  opacity: 0;
  transform: translateX(10px);
  transform-origin: center left;
  cursor: default;
  transition:
    opacity 0.4s ease,
    transform 0.25s cubic-bezier(0.22, 1, 0.36, 1),
    box-shadow 0.25s ease;
}

.ww-pattern.is-on {
  opacity: 1;
  transform: translateX(0) scale(1);
}

.ww-pattern.is-on:hover {
  transform: translateX(0) scale(1.045);
  z-index: 2;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
}

.ww-pattern--b {
  border-color: #ef5350;
  background: linear-gradient(90deg, #ffebee 0%, #fff8e1 100%);
}

.ww-pattern-badge {
  flex-shrink: 0;
  padding: 0.18rem 0.4rem;
  border-radius: 6px;
  font-size: 0.58rem;
  font-weight: 900;
  letter-spacing: 0.02em;
  color: #1b5e20;
  background: rgba(67, 160, 71, 0.2);
  white-space: nowrap;
}

.ww-pattern-badge--b {
  color: #b71c1c;
  background: rgba(229, 57, 53, 0.16);
}

.ww-pattern-main {
  min-width: 0;
  text-align: left;
}

.ww-pattern-title {
  font-size: 0.82rem;
  font-weight: 900;
  color: #2e7d32;
  line-height: 1.15;
}

.ww-pattern--b .ww-pattern-title {
  color: #c62828;
}

.ww-pattern-body {
  margin-top: 0.08rem;
  font-size: 0.58rem;
  font-weight: 600;
  color: #546e7a;
  line-height: 1.35;
}

.ww-pattern-result {
  flex-shrink: 0;
  padding: 0.25rem 0.45rem;
  border-radius: 6px;
  font-size: 0.62rem;
  font-weight: 900;
  line-height: 1.25;
  text-align: center;
  white-space: nowrap;
}

.ww-pattern-result--ok {
  color: #1b5e20;
  background: rgba(67, 160, 71, 0.16);
  display: flex;
  flex-direction: column;
  gap: 0.02rem;
  white-space: normal;
  max-width: 6.5rem;
}

.ww-pattern-result--break {
  color: #b71c1c;
  background: rgba(255, 152, 0, 0.22);
  display: flex;
  flex-direction: column;
  gap: 0.02rem;
  white-space: normal;
  max-width: 6.5rem;
}

.ww-hint {
  font-size: 0.45rem;
  font-weight: 700;
  color: #e65100;
}

.ww-hint--ok {
  color: #2e7d32;
}
</style>
