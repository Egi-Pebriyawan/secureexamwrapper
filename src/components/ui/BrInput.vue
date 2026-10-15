<script setup lang="ts">
withDefaults(
  defineProps<{
    modelValue?: string | number
    label?: string
    type?: string
    placeholder?: string
    disabled?: boolean
    error?: string
    helpText?: string
    required?: boolean
    mono?: boolean
  }>(),
  {
    modelValue: '',
    type: 'text',
    placeholder: '',
    disabled: false,
    required: false,
    mono: false,
  }
)

defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="flex flex-col gap-1.5 w-full">
    <label v-if="label" class="font-mono text-xs uppercase font-bold tracking-wider text-ink flex items-center gap-1">
      {{ label }}
      <span v-if="required" class="text-danger">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        :class="[
          'w-full bg-white text-ink border-[3px] border-ink px-4 py-3 text-base',
          'shadow-[4px_4px_0px_0px_#0A0A0A]',
          'focus:outline-none focus:ring-4 focus:ring-blue/30 focus:border-ink',
          'placeholder:text-ink-soft/50',
          'disabled:bg-neutral-200 disabled:cursor-not-allowed',
          mono ? 'font-mono tracking-wider' : 'font-sans',
          error ? 'border-danger ring-2 ring-danger' : '',
        ]"
      />
    </div>
    <span v-if="error" class="font-mono text-xs font-bold text-danger">{{ error }}</span>
    <span v-else-if="helpText" class="font-mono text-xs text-ink-soft">{{ helpText }}</span>
  </div>
</template>
