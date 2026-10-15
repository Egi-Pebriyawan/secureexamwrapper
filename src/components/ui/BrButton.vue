<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'lime'
    size?: 'sm' | 'md' | 'lg'
    disabled?: boolean
    type?: 'button' | 'submit' | 'reset'
    block?: boolean
  }>(),
  {
    variant: 'primary',
    size: 'md',
    disabled: false,
    type: 'button',
    block: false,
  }
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-blue text-white hover:bg-[#2020ca]'
    case 'secondary':
      return 'bg-white text-ink hover:bg-neutral-100'
    case 'danger':
      return 'bg-danger text-white hover:bg-red-700'
    case 'lime':
      return 'bg-lime text-ink hover:bg-[#cbf134]'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs font-bold tracking-wider'
    case 'lg':
      return 'px-6 py-3.5 text-lg font-black tracking-wider'
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm font-bold tracking-wider'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    @click="(e) => !disabled && emit('click', e)"
    :class="[
      'inline-flex items-center justify-center font-heading uppercase transition-all duration-100 select-none cursor-pointer',
      'border-[3px] border-ink',
      'shadow-[4px_4px_0px_0px_#0A0A0A] active:shadow-none active:translate-x-[4px] active:translate-y-[4px]',
      'hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[5px_5px_0px_0px_#0A0A0A]',
      'focus:outline-none focus:ring-4 focus:ring-blue/40',
      'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0 disabled:hover:shadow-[4px_4px_0px_0px_#0A0A0A]',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
    ]"
  >
    <slot />
  </button>
</template>
