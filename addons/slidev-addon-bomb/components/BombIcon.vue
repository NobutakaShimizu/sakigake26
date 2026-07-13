<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  heat: number
  exploded: boolean
  ignited: boolean
  current: number
  total: number
  showSlideNum: boolean
}>()

const heatClamped = computed(() => Math.min(1, Math.max(0, props.heat)))
const isCritical = computed(() => !props.exploded && (props.ignited || heatClamped.value >= 0.75))
const fuseGlow = computed(() => 0.2 + heatClamped.value * 0.8)
const flameOpacity = computed(() => {
  if (props.ignited)
    return 1
  return 0.15 + heatClamped.value * 0.85
})
const flameScale = computed(() => {
  if (props.ignited)
    return 1.4
  return 0.5 + heatClamped.value * 0.8
})
const glowStrength = computed(() => {
  if (props.ignited)
    return 1
  return heatClamped.value * 0.85
})

const sparkAngles = Array.from({ length: 48 }, (_, i) => i * (360 / 48))
const trailAngles = Array.from({ length: 32 }, (_, i) => i * (360 / 32) + 6)
const fireworkBursts = [
  { delay: '0s', x: '0px', y: '0px' },
  { delay: '0.08s', x: '-42px', y: '-48px' },
  { delay: '0.14s', x: '46px', y: '-36px' },
  { delay: '0.2s', x: '-28px', y: '32px' },
  { delay: '0.26s', x: '36px', y: '28px' },
  { delay: '0.32s', x: '-52px', y: '8px' },
  { delay: '0.38s', x: '18px', y: '-52px' },
]
</script>

<template>
  <div
    class="bomb-unit"
    :class="{
      'is-critical': isCritical,
      'is-ignited': ignited && !exploded,
      'is-exploded': exploded,
    }"
    :style="{ '--heat-glow': glowStrength, '--fuse-glow': fuseGlow }"
  >
    <div v-if="exploded" class="bomb-explosion" aria-hidden="true">
      <span class="fw-flash" />
      <span class="fw-ring fw-ring-1" />
      <span class="fw-ring fw-ring-2" />
      <span class="fw-ring fw-ring-3" />
      <span
        v-for="(angle, i) in sparkAngles"
        :key="`spark-${i}`"
        class="fw-spark"
        :class="`fw-spark-${i % 8}`"
        :style="{
          '--angle': `${angle}deg`,
          '--delay': `${(i % 9) * 0.03}s`,
          '--dist': `${58 + (i % 6) * 16}px`,
        }"
      />
      <span
        v-for="(angle, i) in trailAngles"
        :key="`trail-${i}`"
        class="fw-trail"
        :style="{
          '--angle': `${angle}deg`,
          '--delay': `${0.04 + (i % 6) * 0.025}s`,
          '--dist': `${90 + (i % 5) * 24}px`,
          '--trail-color': ['#ff1744', '#ff9100', '#ffea00', '#76ff03', '#2979ff', '#e040fb', '#ff4081', '#00e5ff'][i % 8],
        }"
      />
      <span
        v-for="(burst, i) in fireworkBursts"
        :key="`burst-${i}`"
        class="fw-secondary"
        :style="{
          '--delay': burst.delay,
          '--bx': burst.x,
          '--by': burst.y,
        }"
      />
    </div>

    <template v-else>
      <div class="bomb-glow" aria-hidden="true" />

      <svg
        viewBox="0 0 64 64"
        class="bomb-svg"
        aria-hidden="true"
      >
        <!-- 導火線（下のレールから爆弾へ接続） -->
        <path
          d="M 0 50 H 20"
          class="bomb-fuse-stub bomb-fuse-incoming"
        />
        <path
          d="M 20 50 Q 26 44 32 30"
          class="bomb-fuse-stub bomb-fuse-up"
        />
        <circle cx="32" cy="28" r="2.2" class="bomb-fuse-tip" />

        <!-- 黒い丸い爆弾 -->
        <circle cx="42" cy="40" r="16" class="bomb-body" />
        <ellipse cx="37" cy="35" rx="5" ry="3.5" class="bomb-shine" />
        <circle cx="42" cy="24" r="2.5" class="bomb-cap" />

        <text
          v-if="showSlideNum"
          x="42"
          y="44"
          text-anchor="middle"
          class="bomb-page-num"
        >
          {{ current }}/{{ total }}
        </text>

        <g transform="translate(32 28)">
          <g
            class="bomb-flames"
            :style="{
              opacity: flameOpacity,
              transform: `scale(${flameScale})`,
            }"
          >
            <path
              class="bomb-flame bomb-flame-1"
              d="M0 0 C-3 -4 -5 -8 -2 -11 C-5 -7 -6 -12 -3 -14 C-6 -9 0 -2 0 0 Z"
              fill="#e65100"
            />
            <path
              class="bomb-flame bomb-flame-2"
              d="M-2 -6 C-3 -9 -2 -11 0 -12 C-2 -10 -1 -8 -2 -6 Z"
              fill="#ff9800"
            />
            <path
              class="bomb-flame bomb-flame-3"
              d="M-1 -10 C-1.5 -12 0 -13 1 -14 C0 -12.5 0 -11 -1 -10 Z"
              fill="#ffca28"
            />
          </g>
        </g>
      </svg>
    </template>
  </div>
</template>
