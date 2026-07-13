<script setup lang="ts">
import { computed } from 'vue'
import MathTex from './Math.vue'

const props = withDefaults(defineProps<{
  uOpinion: number | 'bot'
  wOpinion: number
  edgeActive?: boolean
  edgeAnimate?: boolean
  opinionUpdated?: boolean
  /** @deprecated use edgeActive + opinionUpdated */
  updated?: boolean
}>(), {
  edgeActive: false,
  edgeAnimate: false,
  opinionUpdated: false,
  updated: false,
})

const NODE_R = 34
const U_CX = 58
const U_CY = 72
const W_CX = 282
const W_CY = 72

const edge = computed(() => {
  const dx = W_CX - U_CX
  const dy = W_CY - U_CY
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const x1 = U_CX + ux * NODE_R
  const y1 = U_CY + uy * NODE_R
  const x2 = W_CX - ux * NODE_R
  const y2 = W_CY - uy * NODE_R
  const length = Math.hypot(x2 - x1, y2 - y1)
  const angle = Math.atan2(uy, ux) * (180 / Math.PI)
  return { x1, y1, x2, y2, length, angle }
})

const showEdgeActive = computed(() => props.edgeActive || props.updated)
const showEdgeAnimate = computed(() => props.edgeAnimate)
const showOpinionUpdated = computed(() => props.opinionUpdated || props.updated)
const uIsBot = computed(() => props.uOpinion === 'bot')

function isBotOpinion(opinion: number | 'bot') {
  return opinion === 'bot'
}

function opinionClass(opinion: number | 'bot') {
  if (opinion === 'bot')
    return 'usd-opinion-bot'
  return `usd-opinion-${opinion}`
}
</script>

<template>
  <svg
    viewBox="0 0 340 160"
    class="usd-dynamics-panel"
    role="img"
    aria-label="USD update visualization"
  >
    <g
      v-if="showEdgeActive"
      class="usd-edge-group"
      :class="{ 'usd-edge-animate': showEdgeAnimate }"
      :style="{ '--edge-len': edge.length }"
    >
      <line
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        class="usd-edge usd-edge-active usd-edge-line"
      />
      <path
        class="usd-edge-head"
        d="M0,0 L-9,-5 L-9,5 Z"
        :transform="`translate(${edge.x2} ${edge.y2}) rotate(${edge.angle})`"
      />
    </g>

    <g class="usd-vertex usd-vertex-u" :class="{ 'usd-vertex-updated': showOpinionUpdated }">
      <circle
        cx="58"
        cy="72"
        r="34"
        class="usd-node"
        :class="uIsBot ? 'usd-node-undecided' : opinionClass(uOpinion)"
      />
      <foreignObject x="24" y="52" width="68" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" class="usd-opinion-wrap">
          <div class="usd-opinion-inner" :class="opinionClass(uOpinion)">
            <MathTex v-if="isBotOpinion(uOpinion)" tex="\bot" />
            <span v-else class="usd-opinion-num">{{ uOpinion }}</span>
          </div>
        </div>
      </foreignObject>
      <foreignObject x="42" y="112" width="32" height="28">
        <div xmlns="http://www.w3.org/1999/xhtml" class="usd-label-wrap">
          <MathTex tex="u" />
        </div>
      </foreignObject>
    </g>

    <g class="usd-vertex usd-vertex-w">
      <circle
        cx="282"
        cy="72"
        r="34"
        class="usd-node"
        :class="opinionClass(wOpinion)"
      />
      <foreignObject x="248" y="52" width="68" height="40">
        <div xmlns="http://www.w3.org/1999/xhtml" class="usd-opinion-wrap">
          <div class="usd-opinion-inner" :class="opinionClass(wOpinion)">
            <span class="usd-opinion-num">{{ wOpinion }}</span>
          </div>
        </div>
      </foreignObject>
      <foreignObject x="266" y="112" width="32" height="28">
        <div xmlns="http://www.w3.org/1999/xhtml" class="usd-label-wrap">
          <MathTex tex="w" />
        </div>
      </foreignObject>
    </g>
  </svg>
</template>
