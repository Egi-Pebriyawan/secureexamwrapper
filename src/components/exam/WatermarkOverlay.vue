<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    name: string
    refId?: string
    examCode: string
    opacity?: number
  }>(),
  {
    opacity: 0.15,
  }
)

const watermarkText = computed(() => {
  const parts = [props.name]
  if (props.refId) parts.push(props.refId)
  parts.push(props.examCode)
  return parts.join(' • ')
})
</script>

<template>
  <div
    id="sew-watermark-overlay"
    class="pointer-events-none fixed inset-0 z-30 select-none overflow-hidden flex flex-wrap content-around justify-around gap-16 p-8"
    :style="{
      opacity: opacity,
      mixBlendMode: 'difference',
    }"
  >
    <div
      v-for="i in 28"
      :key="i"
      class="font-mono text-sm sm:text-base font-black tracking-widest text-ink -rotate-25 whitespace-nowrap"
    >
      {{ watermarkText }}
    </div>
  </div>
</template>

