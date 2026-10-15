<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'lime' | 'ink' | 'danger' | 'ok' | 'blue' | 'cream'
    dot?: boolean
  }>(),
  {
    variant: 'lime',
    dot: true,
  }
)

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'lime':
      return 'bg-lime text-ink'
    case 'ink':
      return 'bg-ink text-white'
    case 'danger':
      return 'bg-danger text-white'
    case 'ok':
      return 'bg-ok text-white'
    case 'blue':
      return 'bg-blue text-white'
    case 'cream':
      return 'bg-cream text-ink'
  }
})

const dotColor = computed(() => {
  switch (props.variant) {
    case 'lime':
    case 'cream':
      return 'bg-ink'
    case 'ink':
      return 'bg-lime'
    case 'danger':
    case 'ok':
    case 'blue':
      return 'bg-white'
  }
})
</script>

<template>
  <span
    :class="[
      'inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-bold tracking-widest uppercase border-[2px] border-ink',
      variantClasses,
    ]"
  >
    <span v-if="dot" :class="['w-2 h-2 rounded-full shrink-0', dotColor]"></span>
    <slot />
  </span>
</template>
