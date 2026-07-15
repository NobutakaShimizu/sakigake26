<script setup lang="ts">
withDefaults(defineProps<{
  pose?: 'observer' | 'guts'
}>(), {
  pose: 'observer',
})
</script>

<template>
  <svg
    class="prg-person-svg"
    viewBox="0 0 64 88"
    aria-hidden="true"
  >
    <template v-if="pose === 'observer'">
      <!-- 視線（左の y, ỹ を見る） -->
      <path
        class="prg-gaze"
        d="M18 28 C8 24, 2 20, 0 16"
        fill="none"
        stroke-width="1.4"
        stroke-dasharray="2 2"
      />
      <path
        class="prg-gaze"
        d="M18 32 C8 34, 2 38, 0 42"
        fill="none"
        stroke-width="1.4"
        stroke-dasharray="2 2"
      />
    </template>

    <!-- 頭 -->
    <circle cx="34" cy="22" r="14" class="prg-skin" />
    <!-- 髪 -->
    <path
      d="M20 20 C22 8, 46 8, 48 20 C42 14, 26 14, 20 20 Z"
      class="prg-hair"
    />
    <!-- 目 -->
    <ellipse cx="27" cy="22" rx="2.2" ry="2.6" class="prg-eye" />
    <ellipse cx="36" cy="22" rx="2.2" ry="2.6" class="prg-eye" />
    <circle
      :cx="pose === 'observer' ? 26.2 : 27"
      cy="22.2"
      r="0.9"
      class="prg-pupil"
    />
    <circle
      :cx="pose === 'observer' ? 35.2 : 36"
      cy="22.2"
      r="0.9"
      class="prg-pupil"
    />

    <!-- 口 -->
    <path
      v-if="pose === 'observer'"
      d="M28 30 Q34 27 40 30"
      fill="none"
      stroke-width="1.6"
      stroke-linecap="round"
      class="prg-mouth"
    />
    <path
      v-else
      d="M27 29 Q34 34 41 29"
      fill="none"
      stroke-width="1.6"
      stroke-linecap="round"
      class="prg-mouth prg-mouth--smile"
    />

    <!-- 体 -->
    <path
      d="M22 40 C22 38, 46 38, 46 40 L50 70 C50 76, 18 76, 18 70 Z"
      class="prg-body"
    />

    <template v-if="pose === 'observer'">
      <!-- 腕（考える／見るポーズ） -->
      <path
        d="M22 46 C12 48, 8 40, 14 36"
        fill="none"
        stroke-width="3.2"
        stroke-linecap="round"
        class="prg-arm"
      />
      <path
        d="M46 46 C54 50, 56 58, 52 62"
        fill="none"
        stroke-width="3.2"
        stroke-linecap="round"
        class="prg-arm"
      />
    </template>
    <template v-else>
      <!-- 腕（ガッツポーズ） -->
      <path
        d="M22 46 C14 36, 10 18, 14 10"
        fill="none"
        stroke-width="3.2"
        stroke-linecap="round"
        class="prg-arm"
      />
      <circle cx="14" cy="8" r="4.2" class="prg-fist" />
      <path
        d="M46 46 C52 34, 56 16, 50 8"
        fill="none"
        stroke-width="3.2"
        stroke-linecap="round"
        class="prg-arm"
      />
      <circle cx="50" cy="6" r="4.2" class="prg-fist" />
    </template>
  </svg>
</template>

<style scoped>
.prg-person-svg {
  width: 3.4rem;
  height: 4.7rem;
  overflow: visible;
}

.prg-skin {
  fill: #ffe0b2;
  stroke: #f57c00;
  stroke-width: 1.4;
}

.prg-hair {
  fill: #5d4037;
}

.prg-eye {
  fill: #fff;
  stroke: #37474f;
  stroke-width: 0.8;
}

.prg-pupil {
  fill: #263238;
}

.prg-mouth {
  stroke: #e65100;
}

.prg-mouth--smile {
  stroke: #ef6c00;
}

.prg-body {
  fill: #fff3e0;
  stroke: #ef6c00;
  stroke-width: 1.6;
}

.prg-arm {
  stroke: #ffe0b2;
}

.prg-fist {
  fill: #ffe0b2;
  stroke: #f57c00;
  stroke-width: 1.4;
}

.prg-gaze {
  stroke: #90a4ae;
  opacity: 0.85;
}
</style>
