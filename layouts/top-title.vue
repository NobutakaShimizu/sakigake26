<script setup lang="js">
import { computed } from 'vue'
import { useSlideContext } from '@slidev/client'
import { slides } from '#slidev/slides'

const props = defineProps({
  color: {
    default: 'light',
  },
  align: {
    default: 'l',
  },
})

const { $page, $frontmatter } = useSlideContext()

/** 付録 (appendix: true) より前のスライド数を合計とする（例: 11ページ目以降が付録なら 10） */
const mainTotal = computed(() => {
  const list = slides.value
  const idx = list.findIndex(s => s.meta?.slide?.frontmatter?.appendix)
  return idx === -1 ? list.length : idx
})

const isAppendix = computed(() => {
  if ($frontmatter.appendix)
    return true
  return $page.value > mainTotal.value
})

const pageLabel = computed(() => {
  if (isAppendix.value)
    return ''
  return `${$page.value}/${mainTotal.value}`
})

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
        <div v-if="pageLabel" class="toptitle-page" aria-label="ページ番号">
          {{ pageLabel }}
        </div>
      </div>
    </div>
    <div class="slidev-layout toptitle content flex-1 min-h-0 w-full">
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
