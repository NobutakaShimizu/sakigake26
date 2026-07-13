<script setup lang="ts">
import type { ClicksContext } from '@slidev/types'
import type { InjectionKey, Ref } from 'vue'
import { computed } from 'vue'
import { injectLocal } from '@vueuse/core'

const props = defineProps<{
  from: number
  to: number
}>()

// Same key as @slidev/client/constants.ts (avoid subpath import resolution issues)
const injectionClicksContext = '$$slidev-clicks-context' as unknown as InjectionKey<Ref<ClicksContext>>

const clicksContext = injectLocal(injectionClicksContext)

const highlighted = computed(() => {
  if (!clicksContext?.value)
    return false
  const current = clicksContext.value.current
  return current >= props.from && current <= props.to
})
</script>

<template>
  <div class="usd-rule-step" :class="{ 'is-highlighted': highlighted }">
    <slot />
  </div>
</template>
