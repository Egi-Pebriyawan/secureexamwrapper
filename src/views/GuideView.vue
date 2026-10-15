<script setup lang="ts">
import { useI18nStore } from '@/stores/i18n'
import BrButton from '@/components/ui/BrButton.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'

const i18n = useI18nStore()
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Navbar -->
    <header class="border-b-[3px] border-ink bg-white sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <router-link to="/" class="flex items-center gap-3">
          <div class="w-8 h-8 bg-blue border-[3px] border-ink flex items-center justify-center text-white font-heading font-black text-lg">
            S
          </div>
          <span class="font-heading font-black text-xl tracking-tight uppercase">{{ i18n.t('app_title') }}</span>
        </router-link>

        <div class="flex items-center gap-4">
          <BrLangSwitch />
          <router-link to="/login">
            <BrButton size="sm" variant="primary">{{ i18n.t('login_organizer') }}</BrButton>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 max-w-4xl mx-auto px-6 py-12 space-y-10 w-full">
      <div class="border-b-[3px] border-ink pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <BrBadge variant="lime">{{ i18n.t('guide') }}</BrBadge>
          </div>
          <h1 class="text-4xl sm:text-5xl font-black uppercase">{{ i18n.t('guide_title') }}</h1>
          <p class="font-mono text-sm text-ink-soft mt-1">{{ i18n.t('guide_subtitle') }}</p>
        </div>
        <router-link to="/">
          <BrButton variant="secondary" size="sm">{{ i18n.t('back') }}</BrButton>
        </router-link>
      </div>

      <!-- Section: For Organizer -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <BrBadge variant="blue">{{ i18n.t('guide_for_organizer') }}</BrBadge>
        </div>
        <BrCard class="space-y-6">
          <div class="space-y-2 border-b-[2px] border-ink pb-4">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_org_step1_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_org_step1_desc') }}</p>
          </div>

          <div class="space-y-2 border-b-[2px] border-ink pb-4">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_org_step2_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_org_step2_desc') }}</p>
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_org_step3_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_org_step3_desc') }}</p>
          </div>
        </BrCard>
      </section>

      <!-- Section: For Participant -->
      <section class="space-y-4">
        <div class="flex items-center gap-2">
          <BrBadge variant="lime">{{ i18n.t('guide_for_participant') }}</BrBadge>
        </div>
        <BrCard class="space-y-6">
          <div class="space-y-2 border-b-[2px] border-ink pb-4">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_part_step1_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_part_step1_desc') }}</p>
          </div>

          <div class="space-y-2 border-b-[2px] border-ink pb-4">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_part_step2_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_part_step2_desc') }}</p>
          </div>

          <div class="space-y-2">
            <h3 class="text-xl font-black uppercase">{{ i18n.t('guide_part_step3_title') }}</h3>
            <p class="text-sm text-ink-soft leading-relaxed">{{ i18n.t('guide_part_step3_desc') }}</p>
          </div>
        </BrCard>
      </section>
    </main>

    <!-- Footer -->
    <footer class="border-t-[3px] border-ink bg-white py-6">
      <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <p>© 2026 {{ i18n.t('app_title') }}. {{ i18n.t('footer_rights') }}</p>
        <BrLangSwitch />
      </div>
    </footer>
  </div>
</template>

