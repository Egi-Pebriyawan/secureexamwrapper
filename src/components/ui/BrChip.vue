<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    status: 'draft' | 'scheduled' | 'ongoing' | 'finished'
  }>(),
  {}
)

const config = computed(() => {
  switch (props.status) {
    case 'draft':
      return {
        label: 'DRAF',
        classes: 'bg-neutral-300 text-ink border-ink',
      }
    case 'scheduled':
      return {
        label: 'TERJADWAL',
        classes: 'bg-blue text-white border-ink',
      }
    case 'ongoing':
      return {
        label: 'BERLANGSUNG',
        classes: 'bg-lime text-ink border-ink animate-pulse',
      }
    case 'finished':
      return {
        label: 'SELESAI',
        classes: 'bg-ink text-white border-ink',
      }
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-3 py-1 font-mono text-xs font-black tracking-widest uppercase border-[2px]',
      config.classes,
    ]"
  >
    {{ config.label }}
  </span>
</template>
