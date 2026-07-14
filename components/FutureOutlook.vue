<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const { $clicks } = useSlideContext()

const branches = [
  {
    title: '応用への展開',
    detail:
      'Hutchinson 推定で得た数理基盤を, ベクトル量子化, 近似最近傍探索などへと広げていく.',
  },
  {
    title: '次世代基盤の構築',
    detail:
      '古典的な線形代数に計算量的擬似ランダム性を導入し, 予測・制御計算を支えるランダム化手法の次世代基盤を築く.',
  },
  {
    title: '国際的な研究潮流へ',
    detail:
      '理論計算機科学, 乱択線形代数, 数値線形代数の研究者との国際共同研究を通じて発展させる.',
  },
] as const

/**
 * shown: 表示する分岐数 (1〜3)
 * click 0→1つ目, click 1→2つ目, click 2→3つ目
 */
const shown = ref(0)
let token = 0

function delay(ms: number, t: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(() => {
      if (t === token)
        resolve()
    }, ms)
  })
}

async function goTo(target: number) {
  const t = ++token
  const next = Math.max(0, Math.min(3, target))
  if (next === shown.value)
    return

  if (shown.value === 0 && next >= 1) {
    await delay(40, t)
    if (t !== token)
      return
  }

  if (next > shown.value) {
    for (let i = shown.value + 1; i <= next; i++) {
      if (t !== token)
        return
      shown.value = i
      if (i < next)
        await delay(320, t)
    }
  }
  else {
    shown.value = next
  }
}

watch(
  $clicks,
  (current) => {
    const target = Math.min(3, Math.max(1, (current ?? 0) + 1))
    goTo(target)
  },
  { immediate: true },
)

onUnmounted(() => {
  token += 1
})

const trunkOn = computed(() => shown.value >= 1)
const branchOn = (i: number) => shown.value > i
</script>

<template>
  <div class="fo">
    <div class="fo-clicks" aria-hidden="true">
      <div v-click />
      <div v-click />
    </div>

    <div class="fo-layout">
      <div class="fo-left">
        <svg class="fo-svg" viewBox="0 0 160 320" preserveAspectRatio="none" aria-hidden="true">
          <!-- 縦幹: 上端から分岐点へ -->
          <path
            class="fo-path fo-path--trunk"
            :class="{ 'is-on': trunkOn }"
            d="M28 8 V160"
            fill="none"
            stroke-linecap="round"
          />
          <!-- 上分岐（右へ） -->
          <path
            class="fo-path fo-path--branch"
            :class="{ 'is-on': branchOn(0) }"
            d="M28 160 C48 160 58 48 100 48 H148"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <!-- 中分岐 -->
          <path
            class="fo-path fo-path--branch"
            :class="{ 'is-on': branchOn(1) }"
            d="M28 160 H148"
            fill="none"
            stroke-linecap="round"
          />
          <!-- 下分岐 -->
          <path
            class="fo-path fo-path--branch"
            :class="{ 'is-on': branchOn(2) }"
            d="M28 160 C48 160 58 272 100 272 H148"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
          <polygon
            v-for="(y, i) in [48, 160, 272]"
            :key="y"
            class="fo-head"
            :class="{ 'is-on': branchOn(i) }"
            :points="`148,${y - 11} 160,${y} 148,${y + 11}`"
          />
        </svg>
      </div>

      <div class="fo-branches">
        <div
          v-for="(item, i) in branches"
          :key="item.title"
          class="fo-card"
          :class="{ 'is-on': branchOn(i) }"
        >
          <div class="fo-card-title">{{ item.title }}</div>
          <div class="fo-card-detail">{{ item.detail }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.fo {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  padding: 0.2rem 0.25rem 0.1rem;
  box-sizing: border-box;
}

.fo-clicks {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.fo-layout {
  flex: 1 1 auto;
  min-height: 0;
  display: grid;
  grid-template-columns: 10.5rem 1fr;
  gap: 0.35rem;
  align-items: stretch;
}

.fo-left {
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.fo-svg {
  flex: 1 1 auto;
  width: 100%;
  min-height: 0;
  overflow: visible;
}

.fo-path {
  stroke: #c2410c;
  stroke-width: 8;
  fill: none;
}

.fo-path--trunk {
  stroke-dasharray: 180;
  stroke-dashoffset: 180;
  transition: stroke-dashoffset 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.fo-path--branch {
  stroke-dasharray: 220;
  stroke-dashoffset: 220;
  transition: stroke-dashoffset 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.fo-path.is-on {
  stroke-dashoffset: 0;
}

.fo-head {
  fill: #c2410c;
  opacity: 0;
  transition: opacity 0.22s ease 0.28s;
}

.fo-head.is-on {
  opacity: 1;
}

.fo-branches {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 0;
  padding: 0.9rem 0 0.55rem;
}

.fo-card {
  padding: 0.55rem 0.75rem;
  border-radius: 10px;
  border: 2px solid #fdba74;
  background: rgba(255, 247, 237, 0.95);
  opacity: 0;
  transform: translateX(-0.5rem);
  transition:
    opacity 0.4s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease,
    box-shadow 0.35s ease;
  pointer-events: none;
}

.fo-card.is-on {
  opacity: 1;
  transform: translateX(0);
  border-color: #ea580c;
  box-shadow: 0 1px 8px rgba(234, 88, 12, 0.12);
  pointer-events: auto;
}

.fo-card-title {
  font-weight: 800;
  font-size: 1.08rem;
  color: #c2410c;
  line-height: 1.3;
  margin-bottom: 0.22rem;
}

.fo-card-detail {
  font-size: 0.88rem;
  line-height: 1.45;
  color: #4b5563;
  font-weight: 400;
}
</style>
