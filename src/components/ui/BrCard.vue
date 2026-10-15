<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'white' | 'cream' | 'ink'
    padded?: boolean
  }>(),
  {
    variant: 'white',
    padded: true,
  }
)
</script>

<template>
  <div
    :class="[
      'border-[3px] border-ink shadow-[4px_4px_0px_0px_#0A0A0A]',
      variant === 'white' ? 'bg-white text-ink' : '',
      variant === 'cream' ? 'bg-cream text-ink' : '',
      variant === 'ink' ? 'bg-ink text-white' : '',
      padded ? 'p-6' : '',
    ]"
  >
    <slot />
  </div>
</template>
