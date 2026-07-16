<script setup lang="ts">
import { useNav, useSlideContext } from '@slidev/client'
import { onUnmounted, ref, watch } from 'vue'

const { $clicks } = useSlideContext()
const { isPrintMode } = useNav()

const lit = ref(0)
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
    lit.value = 3
    return
  }

  const t = ++token
  lit.value = 0
  await delay(120, t)
  for (let i = 1; i <= 3; i++) {
    if (t !== token)
      return
    lit.value = i
    await delay(480, t)
  }
}

function reset() {
  token += 1
  started = false
  lit.value = 0
}

watch(
  [$clicks, isPrintMode],
  ([current]) => {
    if (isPrintMode.value) {
      token += 1
      started = true
      lit.value = 3
      return
    }
    if ((current ?? 0) < 1) {
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
  <div class="ap" v-click>
    <div class="ap-track">
      <div class="ap-node" :class="{ 'is-on': lit >= 1, 'is-current': lit === 1 }">
        <div class="ap-node-icon ap-node-icon--assume">
          <svg viewBox="0 0 24 24" class="ap-svg" aria-hidden="true">
            <path
              d="M12 2 L4 6 V12 C4 17 7.5 21.2 12 22 C16.5 21.2 20 17 20 12 V6 Z"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
            />
            <path d="M9 12 L11 14 L15 9" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </div>
        <div class="ap-node-label">計算量的仮定</div>
        <div class="ap-node-sub">暗号の安全性など</div>
      </div>

      <div class="ap-arrow" :class="{ 'is-on': lit >= 2 }">→</div>

      <div class="ap-node" :class="{ 'is-on': lit >= 2, 'is-current': lit === 2 }">
        <div class="ap-node-icon ap-node-icon--prg">
          <Math tex="\widetilde{R}" />
        </div>
        <div class="ap-node-label">疑似ランダム行列</div>
        <div class="ap-node-sub">構造付きランダム</div>
      </div>

      <div class="ap-arrow" :class="{ 'is-on': lit >= 3 }">→</div>

      <div class="ap-node" :class="{ 'is-on': lit >= 3, 'is-current': lit === 3 }">
        <div class="ap-node-icon ap-node-icon--algo">
          <Math tex="A" />
        </div>
        <div class="ap-node-label">乱択線形代数</div>
        <div class="ap-node-sub">スケッチ・推定…</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ap {
  margin-top: 0.35rem;
  width: 100%;
}

.ap-track {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
}

.ap-node {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  width: 7.6rem;
  padding: 0.35rem 0.35rem 0.3rem;
  border-radius: 8px;
  border: 1.5px solid #cfd8dc;
  background: #f5f7f8;
  opacity: 0.28;
  transform: translateY(4px) scale(0.97);
  transition:
    opacity 0.35s ease,
    transform 0.35s ease,
    border-color 0.3s ease,
    background 0.3s ease,
    box-shadow 0.3s ease;
}

.ap-node.is-on {
  opacity: 1;
  transform: translateY(0) scale(1);
  border-color: #1976d2;
  background: linear-gradient(180deg, #e3f2fd 0%, #f7fbff 100%);
}

.ap-node.is-current {
  box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.2);
}

.ap-node-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.85rem;
  height: 1.85rem;
  border-radius: 50%;
  background: #fff;
  border: 1.5px solid #90caf9;
}

.ap-node-icon--assume {
  color: #ef6c00;
  border-color: #ffb74d;
  background: #fff8e1;
}

.ap-node-icon--prg {
  border-color: #ff9800;
  background: #fff3e0;
}

.ap-node-icon--prg :deep(.katex) {
  font-size: 0.85rem;
  font-weight: 700;
  color: #e65100;
}

.ap-node-icon--algo {
  border-color: #66bb6a;
  background: #e8f5e9;
}

.ap-node-icon--algo :deep(.katex) {
  font-size: 0.95rem;
  font-weight: 800;
  color: #2e7d32;
}

.ap-svg {
  width: 1rem;
  height: 1rem;
}

.ap-node-label {
  font-size: 0.68rem;
  font-weight: 800;
  color: #455a64;
  text-align: center;
  line-height: 1.2;
}

.ap-node.is-on .ap-node-label {
  color: #0d47a1;
}

.ap-node-sub {
  font-size: 0.5rem;
  font-weight: 600;
  color: #78909c;
  text-align: center;
  line-height: 1.2;
}

.ap-arrow {
  font-size: 1.05rem;
  color: #b0bec5;
  opacity: 0.3;
  transition: opacity 0.3s ease, color 0.3s ease;
}

.ap-arrow.is-on {
  opacity: 1;
  color: #1976d2;
}
</style>
