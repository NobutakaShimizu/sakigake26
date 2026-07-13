<script setup lang="js">
import { computed } from 'vue'
import SlideParticleBackground from '../components/SlideParticleBackground.vue'

const props = defineProps({
  color: {
    default: 'white',
  },
})

const colorscheme = computed(() => {
  return `neversink-${props.color}-scheme`
})
</script>

<template>
  <div class="slidev-layout section h-full slidecolor slide-with-particles" :class="colorscheme">
    <SlideParticleBackground :density="0.7" />
    <div class="slide-particles-content my-auto">
      <slot />
    </div>
  </div>
</template>

<style>
.slidev-layout.section {
  font-family: var(--neversink-main-font);
  font-weight: 300;
}

.slidev-layout.section h1 {
  font-family: var(--neversink-title-font);
  font-weight: 500;
  font-size: 3em;
  line-height: normal;
  margin-bottom: 0.9rem;
  margin-top: 40px;
}

.slidev-layout.section h2 {
  font-family: var(--neversink-title-font);
  font-weight: 500;
  font-size: 2.5em;
  line-height: normal;
  margin-bottom: 0.9rem;
  margin-top: 40px;
}

.slidev-layout.section h3 {
  font-family: var(--neversink-title-font);
  font-weight: 500;
  font-size: 1.9em;
  line-height: normal;
  margin-bottom: 0.9rem;
  margin-top: 40px;
}

.slidev-layout.section h1,
.slidev-layout.section h2,
.slidev-layout.section h3 {
  padding-bottom: 0.3em;
  border-bottom: 1px solid var(--neversink-highlight-color);
}
</style>
