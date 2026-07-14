<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const { $clicks } = useSlideContext()

const items = [
  {
    year: '1年目',
    text: '乱択線形代数におけるランダム性の計算量的定式化',
    bullets: [
      '乱択線形代数における真のランダム性の役割を検証',
      '計算量的識別困難性の観点から疑似ランダム性に置き換える定式化を与える',
    ],
  },
  {
    year: '2年目',
    text: 'Hutchinson 型トレース推定における擬似ランダム性の導入',
    bullets: [
      'トレース推定を具体的な試金石として疑似ランダム性に基づくアルゴリズムを構築する',
      '疑似ランダム性をいかに効率性に転用するか?',
      'そのためにどのような計算量仮定が必要か?',
    ],
  },
  {
    year: '3年目',
    text: '乱択線形代数における擬似ランダム性の理論基盤化',
    bullets: [
      '計算量的疑似ランダム性の原理を, トレース推定に特化させず, 汎用的な乱択線形代数アルゴリズムに展開',
      'トレース推定の研究で得られた原理の適用範囲をさぐる',
      '具体的な応用(スペクトル推定, 低ランク近似, 対数行列推定, ベクトル量子化)',
    ],
  },
] as const

/**
 * shown: 0=なし, 1〜3=各年, 4=国際的優位性
 * click 0→1年目, 1→2年目, 2→3年目, 3→優位性ボックス
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
  const next = Math.max(0, Math.min(4, target))
  if (next === shown.value)
    return

  if (shown.value === 0 && next >= 1) {
    await delay(50, t)
    if (t !== token)
      return
  }

  if (next > shown.value) {
    for (let i = shown.value + 1; i <= next; i++) {
      if (t !== token)
        return
      shown.value = i
      if (i < next)
        await delay(280, t)
    }
  }
  else {
    shown.value = next
  }
}

watch(
  $clicks,
  (current) => {
    const target = Math.min(4, Math.max(1, (current ?? 0) + 1))
    goTo(target)
  },
  { immediate: true },
)

onUnmounted(() => {
  token += 1
})

/**
 * 年次は上部に密集, 3年目表示時点で矢印は最下部まで伸ばす
 * 1〜2年目 ≈ 14% / 28%, 3年目以降 ≈ 92%
 */
const shaftPct = computed(() => {
  if (shown.value <= 0)
    return 0
  if (shown.value === 1)
    return 14
  if (shown.value === 2)
    return 28
  return 92
})

const shaftStyle = computed(() => ({ height: `${shaftPct.value}%` }))
const headStyle = computed(() => ({ top: `${shaftPct.value}%` }))
</script>

<template>
  <div class="yp">
    <div class="yp-clicks" aria-hidden="true">
      <div v-click />
      <div v-click />
      <div v-click />
    </div>

    <div class="yp-main">
      <div class="yp-rail" aria-hidden="true">
        <div class="yp-track">
          <div class="yp-shaft" :style="shaftStyle" />
          <div class="yp-head" :class="{ 'is-on': shown >= 1 }" :style="headStyle" />
        </div>
      </div>

      <div class="yp-years">
        <div
          v-for="(item, i) in items"
          :key="item.year"
          class="yp-row"
          :class="{ 'is-on': shown > i }"
        >
          <div
            class="yp-dot"
            :class="{ 'is-on': shown > i, 'is-current': shown === i + 1 }"
          />
          <div class="yp-body">
            <div class="yp-year">{{ item.year }}</div>
            <div class="yp-copy">
              <div class="yp-text">{{ item.text }}</div>
              <ul v-if="'bullets' in item && item.bullets" class="yp-bullets">
                <li v-for="(line, j) in item.bullets" :key="j">{{ line }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div class="yp-advantage" :class="{ 'is-on': shown >= 4 }">
        <div
          class="topic-box yp-topic"
          data-callout-title="本研究における申請者の国際的優位性"
        >
          <div class="yp-topic-lead">理論計算機科学の主要国際会議(SODA,STOC,FOCS)への多くの採択経験</div>
          <ul class="yp-topic-list">
            <li>計算困難性の理論研究 (SODA21, FOCS22, STOC23, STOC24, STOC26)</li>
            <li>線形代数的な問題の研究 (STOC25, STOC26, FOCS26)</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.yp {
  position: relative;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
  padding: 0.25rem 0.35rem 0.1rem;
  box-sizing: border-box;
}

.yp-clicks {
  position: absolute;
  width: 0;
  height: 0;
  overflow: hidden;
  pointer-events: none;
}

.yp-main {
  position: relative;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 0.15rem 0 0.25rem;
}

.yp-rail {
  position: absolute;
  left: 0;
  top: 0.45rem;
  bottom: 0.45rem;
  width: 2.4rem;
  pointer-events: none;
  z-index: 0;
}

.yp-track {
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  width: 0.72rem;
  transform: translateX(-50%);
}

.yp-shaft {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  border-radius: 999px 999px 0 0;
  background: linear-gradient(180deg, #fb923c 0%, #ea580c 70%, #c2410c 100%);
  box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.18);
  transition: height 0.55s cubic-bezier(0.22, 1, 0.36, 1);
}

.yp-head {
  position: absolute;
  left: 50%;
  width: 0;
  height: 0;
  transform: translate(-50%, -2px);
  border-left: 1.05rem solid transparent;
  border-right: 1.05rem solid transparent;
  border-top: 1.25rem solid #c2410c;
  opacity: 0;
  transition:
    top 0.55s cubic-bezier(0.22, 1, 0.36, 1),
    opacity 0.25s ease;
  filter: drop-shadow(0 1px 1px rgba(194, 65, 12, 0.25));
}

.yp-head.is-on {
  opacity: 1;
}

.yp-years {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
  flex: 0 0 auto;
  padding-top: 0.1rem;
}

.yp-row,
.yp-advantage {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.95rem;
  opacity: 0;
  transform: translateX(-0.45rem);
  transition:
    opacity 0.4s ease,
    transform 0.45s cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.yp-row.is-on,
.yp-advantage.is-on {
  opacity: 1;
  transform: translateX(0);
  pointer-events: auto;
}

.yp-advantage {
  flex: 0 0 auto;
  margin-top: auto;
  padding-bottom: 0.1rem;
  padding-left: 2.55rem;
  align-items: stretch;
}

.yp-dot {
  flex-shrink: 0;
  width: 1.15rem;
  height: 1.15rem;
  margin-left: 0.62rem;
  margin-top: 0.18rem;
  border-radius: 50%;
  background: #fff7ed;
  border: 3px solid #fdba74;
  box-sizing: border-box;
  opacity: 0.35;
  transform: scale(0.85);
  transition:
    opacity 0.35s ease,
    transform 0.35s cubic-bezier(0.22, 1, 0.36, 1),
    border-color 0.35s ease,
    background 0.35s ease,
    box-shadow 0.35s ease;
  z-index: 2;
}

.yp-dot.is-on {
  opacity: 1;
  transform: scale(1);
  border-color: #ea580c;
  background: #fff;
  box-shadow: 0 0 0 3px rgba(234, 88, 12, 0.2);
}

.yp-dot.is-current {
  background: #ea580c;
  border-color: #c2410c;
  box-shadow: 0 0 0 4px rgba(234, 88, 12, 0.28);
}

.yp-body {
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1 1 auto;
  min-width: 0;
}

.yp-year {
  flex-shrink: 0;
  font-weight: 800;
  font-size: 1.05rem;
  color: #c2410c;
  letter-spacing: 0.02em;
  line-height: 1.35;
  min-width: 3.4rem;
  padding-top: 0.05rem;
}

.yp-copy {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
  flex: 1 1 auto;
}

.yp-text {
  font-size: 1.02rem;
  line-height: 1.4;
  color: #1f2937;
  font-weight: 600;
}

.yp-bullets {
  margin: 0.08rem 0 0;
  padding-left: 1.1rem;
  list-style: disc;
}

.yp-bullets li {
  font-size: 0.82rem;
  line-height: 1.4;
  color: #6b7280;
  font-weight: 400;
  margin: 0.06rem 0;
}

.yp-topic {
  flex: 1 1 auto;
  min-width: 0;
  margin: 0 !important;
}

.yp-topic-lead {
  font-size: 0.95rem;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  margin-bottom: 0.2rem;
}

.yp-topic-list {
  margin: 0 0 0.35rem;
  padding-left: 1.15rem;
  list-style: disc;
}

.yp-topic-list li {
  font-size: 0.88rem;
  line-height: 1.45;
  color: #374151;
  font-weight: 400;
  margin: 0.15rem 0;
}
</style>
