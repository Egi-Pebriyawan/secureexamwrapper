<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import BrButton from '@/components/ui/BrButton.vue'

const i18n = useI18nStore()
</script>

<template>
  <BrButton
    variant="secondary"
    size="sm"
    @click="i18n.toggleLanguage"
    class="flex items-center gap-1.5 font-mono text-xs"
  >
    <span>🌐</span>
    <span>{{ i18n.currentLang === 'id' ? 'ID (INDONESIA)' : 'EN (ENGLISH)' }}</span>
  </BrButton>
</template>

