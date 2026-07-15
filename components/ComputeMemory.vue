<script setup lang="ts">
import { useSlideContext } from '@slidev/client'
import { onUnmounted, ref, watch } from 'vue'

const props = withDefaults(defineProps<{
  /** 計算機上・メモリ下の縦積み（右カラム向け） */
  stacked?: boolean
}>(), {
  stacked: false,
})

const MEMORY_ROWS = 3
const MEMORY_COLS = 10

const { $clicks } = useSlideContext()

const phase = ref<'read' | 'write'>('read')
let timer: ReturnType<typeof setInterval> | null = null

function stopTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  stopTimer()
  timer = setInterval(() => {
    phase.value = phase.value === 'read' ? 'write' : 'read'
  }, 2200)
}

watch(
  $clicks,
  (current) => {
    if ((current ?? 0) >= 1)
      startTimer()
    else
      stopTimer()
  },
  { immediate: true },
)

onUnmounted(stopTimer)
</script>

<template>
  <div class="cm" :class="{ 'is-stacked': stacked }" aria-hidden="true">
    <div class="cm-row">
      <div class="cm-cpu">
        <div class="cm-cpu-box">
          <svg class="cm-cpu-icon" viewBox="0 0 24 24">
            <rect x="5" y="5" width="14" height="14" rx="2" fill="#fff7ed" stroke="currentColor" stroke-width="1.6" />
            <rect x="8.5" y="8.5" width="7" height="7" rx="1" fill="currentColor" opacity="0.18" />
            <path
              d="M12 2 V5 M12 19 V22 M2 12 H5 M19 12 H22 M5.5 5.5 L7.5 7.5 M16.5 16.5 L18.5 18.5 M18.5 5.5 L16.5 7.5 M7.5 16.5 L5.5 18.5"
              fill="none"
              stroke="currentColor"
              stroke-width="1.4"
              stroke-linecap="round"
            />
          </svg>
        </div>
        <span class="cm-label">計算機</span>
      </div>

      <div class="cm-bus">
        <div class="cm-bus-caption">巨大なデータ</div>
        <div class="cm-bus-track">
          <div class="cm-bus-line" />
          <div class="cm-packets" :class="`is-${phase}`">
            <span v-for="i in 5" :key="i" class="cm-packet" :style="{ '--i': i }" />
          </div>
        </div>
      </div>

      <div class="cm-mem">
        <span class="cm-label">メモリ</span>
        <div class="cm-mem-box">
          <div class="cm-mem-grid">
            <span
              v-for="n in MEMORY_ROWS * MEMORY_COLS"
              :key="n"
              class="cm-mem-cell"
              :class="{ 'is-active': phase === 'read' ? n % 3 === 0 : n % 4 === 1 }"
              :style="{ '--d': `${(n % 7) * 0.08}s` }"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cm {
  width: 100%;
  margin-top: 0.45rem;
  padding: 0.15rem 0;
}

.cm.is-stacked {
  width: 7.6rem;
  max-width: 100%;
  margin-top: 0;
  margin-left: auto;
  margin-right: auto;
  padding: 0;
}

.cm-row {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  width: 100%;
}

.cm.is-stacked .cm-row {
  flex-direction: column;
  gap: 0.18rem;
}

.cm-cpu,
.cm-mem {
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 0.32rem;
  flex-shrink: 0;
}

.cm.is-stacked .cm-cpu,
.cm.is-stacked .cm-mem {
  flex-direction: column;
  gap: 0.12rem;
  width: 100%;
}

.cm-cpu-box,
.cm-mem-box {
  border: 1.5px solid #ea580c;
  border-radius: 7px;
  background: rgba(255, 247, 237, 0.95);
  box-shadow: 0 1px 4px rgba(234, 88, 12, 0.08);
}

.cm-cpu-box {
  width: 2.35rem;
  height: 2.35rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c2410c;
  flex-shrink: 0;
}

.cm.is-stacked .cm-cpu-box {
  width: 1.85rem;
  height: 1.85rem;
}

.cm-cpu-icon {
  width: 1.45rem;
  height: 1.45rem;
}

.cm.is-stacked .cm-cpu-icon {
  width: 1.15rem;
  height: 1.15rem;
}

.cm-mem-box {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.22rem 0.28rem;
}

.cm.is-stacked .cm-mem-box {
  width: 100%;
  padding: 0.16rem 0.18rem;
}

.cm-mem {
  flex: 1 1 auto;
  min-width: 0;
}

.cm.is-stacked .cm-mem {
  flex: 0 0 auto;
}

.cm-mem-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(3, 1fr);
  gap: 0.1rem;
}

.cm.is-stacked .cm-mem-grid {
  gap: 0.07rem;
}

.cm-mem-cell {
  height: 0.42rem;
  border-radius: 1px;
  background: #fed7aa;
  border: 1px solid #fdba74;
  transition: background 0.35s ease, opacity 0.35s ease;
}

.cm.is-stacked .cm-mem-cell {
  height: 0.32rem;
}

.cm-mem-cell.is-active {
  background: #fb923c;
  border-color: #ea580c;
  animation: cm-cell-pulse 0.9s ease-in-out infinite;
  animation-delay: var(--d);
}

@keyframes cm-cell-pulse {
  0%,
  100% {
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
}

.cm-label {
  font-size: 0.68rem;
  font-weight: 700;
  color: #c2410c;
  white-space: nowrap;
}

.cm.is-stacked .cm-label {
  font-size: 0.58rem;
}

.cm-bus {
  flex: 1.4 1 auto;
  min-width: 4.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.12rem;
}

.cm.is-stacked .cm-bus {
  flex: 0 0 auto;
  min-width: 0;
  width: 100%;
  align-items: center;
  gap: 0.06rem;
}

.cm-bus-caption {
  text-align: center;
  font-size: 0.58rem;
  font-weight: 600;
  color: #9a3412;
  opacity: 0.75;
  white-space: nowrap;
  line-height: 1;
}

.cm.is-stacked .cm-bus-caption {
  font-size: 0.5rem;
}

.cm-bus-track {
  position: relative;
  height: 0.55rem;
}

.cm.is-stacked .cm-bus-track {
  width: 0.55rem;
  height: 1.35rem;
}

.cm-bus-line {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 2px;
  transform: translateY(-50%);
  border-radius: 999px;
  background: linear-gradient(90deg, #fdba74, #fb923c, #fdba74);
  opacity: 0.55;
}

.cm.is-stacked .cm-bus-line {
  left: 50%;
  right: auto;
  top: 0;
  bottom: 0;
  width: 2px;
  height: auto;
  transform: translateX(-50%);
  background: linear-gradient(180deg, #fdba74, #fb923c, #fdba74);
}

.cm-packets {
  position: absolute;
  inset: 0;
}

.cm-packet {
  position: absolute;
  top: calc(50% - 0.18rem);
  width: 0.36rem;
  height: 0.36rem;
  border-radius: 1px;
  background: #ea580c;
  opacity: 0;
}

.cm.is-stacked .cm-packet {
  left: calc(50% - 0.14rem);
  top: auto;
  width: 0.28rem;
  height: 0.28rem;
}

.cm-packets.is-read .cm-packet {
  animation: cm-packet-read 1.1s linear infinite;
  animation-delay: calc((var(--i) - 1) * 0.15s);
}

.cm-packets.is-write .cm-packet {
  animation: cm-packet-write 1.1s linear infinite;
  animation-delay: calc((var(--i) - 1) * 0.15s);
}

.cm.is-stacked .cm-packets.is-read .cm-packet {
  animation-name: cm-packet-read-v;
}

.cm.is-stacked .cm-packets.is-write .cm-packet {
  animation-name: cm-packet-write-v;
}

@keyframes cm-packet-read {
  0% {
    left: 88%;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  92% {
    opacity: 1;
  }
  100% {
    left: 0;
    opacity: 0;
  }
}

@keyframes cm-packet-write {
  0% {
    left: 0;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  92% {
    opacity: 1;
  }
  100% {
    left: 88%;
    opacity: 0;
  }
}

@keyframes cm-packet-read-v {
  0% {
    top: 88%;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  92% {
    opacity: 1;
  }
  100% {
    top: 0;
    opacity: 0;
  }
}

@keyframes cm-packet-write-v {
  0% {
    top: 0;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  92% {
    opacity: 1;
  }
  100% {
    top: 88%;
    opacity: 0;
  }
}
</style>
