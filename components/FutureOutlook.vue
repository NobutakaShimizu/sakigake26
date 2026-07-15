<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { computed, onUnmounted, ref, watch } from 'vue'

const { $clicks } = useSlideContext()

const branches = [
  {
    title: '理論的なアルゴリズム設計の新たなパラダイム',
    detail: '「できない」を「できる」に転用',
    bullets: [
      '組合せ最適化',
      'グラフアルゴリズム',
      '対話証明系',
    ],
    icon: 'book' as const,
  },
  {
    title: '実用的なアルゴリズムの改善',
    detail: '「擬似」乱択線形代数が用いられるアルゴリズムへの実装.',
    bullets: [
      '量子化によるLLM学習や推論のKVキャッシュの改善',
      '乱択特異値分解効率化 (実装例: Pythonライブラリのscikit-learnなど)',
      'トレース推定の効率化 (実装例: PyTorchのCurvlinopsライブラリなど)',
    ],
    icon: 'tools' as const,
  },
  {
    title: '国際的な研究潮流へ',
    detail:
      '理論計算機科学, 乱択線形代数, 数値線形代数の研究者との国際共同研究を通じて発展させる.',
    icon: 'rocket' as const,
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
          <div class="fo-card-title">
            <svg
              v-if="item.icon === 'book'"
              class="fo-title-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M5 5.2 C5 5.2 9 3.8 12 5.8 C15 3.8 19 5.2 19 5.2 V17.2 C19 17.2 15 15.8 12 17.8 C9 15.8 5 17.2 5 17.2 Z"
                fill="#fff7ed"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M12 5.8 V17.8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
              />
              <path
                d="M8.2 8.2 H10.8 M13.2 8.2 H15.8 M8.2 11 H10.8 M13.2 11 H15.8"
                fill="none"
                stroke="currentColor"
                stroke-width="1.1"
                stroke-linecap="round"
                opacity="0.55"
              />
            </svg>
            <svg
              v-else-if="item.icon === 'tools'"
              class="fo-title-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <rect
                x="2"
                y="9"
                width="3"
                height="2.5"
                rx="0.5"
                fill="#fff7ed"
                stroke="currentColor"
                stroke-width="1.2"
              />
              <path
                d="M5 8 H16 C17.5 8 18 9 18 10.5 V11.5 C18 13 17.5 14 16 14 H8 C6.5 14 5.5 13 5.5 11.5 V10"
                fill="#fff7ed"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M18 9.5 H21.5 L22 10.5 L21.5 11.5 H18"
                fill="#fff7ed"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <path
                d="M8 14 V20 C8 21 9 21.5 10 21.5 H11.5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M10 14 L8.5 17"
                fill="none"
                stroke="currentColor"
                stroke-width="1.4"
                stroke-linecap="round"
              />
              <path
                d="M22 10.5 C23 12.5 22.5 14 21.5 15"
                fill="none"
                stroke="#fb923c"
                stroke-width="1.3"
                stroke-linecap="round"
              />
              <circle cx="21.5" cy="15.2" r="0.8" fill="#fb923c" />
            </svg>
            <svg
              v-else-if="item.icon === 'rocket'"
              class="fo-title-icon"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                d="M12 2.5 C12 2.5 8.2 8.2 8.2 13.8 V17.5 H15.8 V13.8 C15.8 8.2 12 2.5 12 2.5 Z"
                fill="#fff7ed"
                stroke="currentColor"
                stroke-width="1.7"
                stroke-linejoin="round"
              />
              <circle cx="12" cy="10.8" r="1.8" fill="currentColor" opacity="0.35" />
              <path
                d="M8.2 16.2 L5.5 20.5 H9.2 Z M15.8 16.2 L18.5 20.5 H14.8 Z"
                fill="currentColor"
                opacity="0.85"
              />
              <path
                d="M10.2 17.5 H13.8 L12 21.5 Z"
                fill="#fb923c"
                stroke="#ea580c"
                stroke-width="0.8"
                stroke-linejoin="round"
              />
            </svg>
            <span>{{ item.title }}</span>
          </div>
          <div class="fo-card-body">
            <div class="fo-card-detail">{{ item.detail }}</div>
            <ul v-if="'bullets' in item && item.bullets" class="fo-card-bullets">
              <li v-for="(line, j) in item.bullets" :key="j">{{ line }}</li>
            </ul>
          </div>
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
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-weight: 800;
  font-size: 1.08rem;
  color: #c2410c;
  line-height: 1.3;
  margin-bottom: 0.22rem;
}

.fo-title-icon {
  width: 1.45rem;
  height: 1.45rem;
  flex-shrink: 0;
  color: #c2410c;
}

.fo-card-detail {
  font-size: 0.88rem;
  line-height: 1.45;
  color: #4b5563;
  font-weight: 400;
}

.fo-card-bullets {
  margin: 0.2rem 0 0;
  padding-left: 1.15rem;
  list-style: disc;
}

.fo-card-bullets li {
  font-size: 0.84rem;
  line-height: 1.4;
  color: #4b5563;
  font-weight: 400;
  margin: 0.08rem 0;
}
</style>
