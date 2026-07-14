<script setup lang="js">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'

const props = defineProps({
  color: {
    default: 'light',
  },
  align: {
    default: 'l',
  },
})

const { $page, $nav } = useSlideContext()

const pageLabel = computed(() => `${$page.value}/${$nav.value.total}`)

const alignment = computed(() => {
  switch (props.align) {
    case 'c':
      return 'ns-c-center ns-c-top'
    case 'r':
      return 'ns-c-right ns-c-top'
    case 'l':
    default:
      return 'ns-c-left ns-c-top'
  }
})

const colorscheme = computed(() => {
  return `neversink-${props.color}-scheme`
})
</script>

<template>
  <div class="flex flex-col h-full w-full">
    <div class="w-full h-fit min-h-13 pt-2 pb-2 slidecolor" :class="colorscheme">
      <div class="toptitle-bar ml-6 mr-6 flex items-center gap-4">
        <div class="slidev-layout toptitle title p-0 pt-0 mt-auto mb-auto flex-1 min-w-0" :class="alignment">
          <slot name="title" />
        </div>
        <div class="toptitle-page" aria-label="ページ番号">
          {{ pageLabel }}
        </div>
      </div>
    </div>
    <div class="slidev-layout toptitle content h-fit w-full">
      <slot name="content" />
    </div>
    <div v-if="$slots.default" class="slidev-layout default h-fit w-full">
      <slot name="default" />
    </div>
  </div>
</template>

<style scoped>
.toptitle-page {
  flex-shrink: 0;
  font-family: var(--neversink-title-font);
  font-weight: 600;
  font-size: 1.7em;
  line-height: 1.2;
  opacity: 0.85;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
</style>
