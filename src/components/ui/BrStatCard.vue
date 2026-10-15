<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    value: string | number
    label: string
    sublabel?: string
    variant?: 'white' | 'lime' | 'cream' | 'ink'
  }>(),
  {
    variant: 'white',
  }
)

const bgClasses = computed(() => {
  switch (props.variant) {
    case 'white':
      return 'bg-white text-ink'
    case 'lime':
      return 'bg-lime text-ink'
    case 'cream':
      return 'bg-cream text-ink'
    case 'ink':
      return 'bg-ink text-white'
  }
})
</script>

<template>
  <div :class="['border-[3px] border-ink shadow-[4px_4px_0px_0px_#0A0A0A] p-5 flex flex-col justify-between', bgClasses]">
    <div class="flex items-baseline justify-between gap-2 border-b-[3px] border-ink pb-3 mb-3">
      <span class="font-mono text-3xl sm:text-4xl font-extrabold tracking-tight">{{ value }}</span>
      <span class="font-mono text-xs font-bold tracking-widest uppercase opacity-80 text-right">{{ label }}</span>
    </div>
    <div v-if="sublabel" class="font-mono text-xs opacity-70">
      {{ sublabel }}
    </div>
  </div>
</template>
