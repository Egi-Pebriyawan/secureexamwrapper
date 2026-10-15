<script setup lang="ts">
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrInput from '@/components/ui/BrInput.vue'
import BrStatCard from '@/components/ui/BrStatCard.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useI18nStore } from '@/stores/i18n'

const router = useRouter()
const i18n = useI18nStore()
const examCode = ref('')

const handleJoin = () => {
  if (!examCode.value) return
  router.push(`/exam/${examCode.value.toUpperCase().trim()}`)
}
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
          <router-link to="/guide" class="font-mono text-xs font-bold tracking-wider hover:underline text-ink">
            {{ i18n.t('guide') }}
          </router-link>
          <BrLangSwitch />
          <router-link to="/login">
            <BrButton size="sm" variant="primary">{{ i18n.t('login_organizer') }}</BrButton>
          </router-link>
        </div>
      </div>
    </header>

    <!-- Hero Content -->
    <main class="flex-1 max-w-6xl mx-auto px-6 py-12 lg:py-16 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
      <!-- Left Column: Landing / Entry -->
      <div class="lg:col-span-7 space-y-6">
        <div>
          <h1 class="text-4xl sm:text-6xl font-black uppercase leading-none tracking-tight">
            {{ i18n.t('hero_title_1') }} <br />
            <span class="text-blue">{{ i18n.t('hero_title_2') }}</span>
          </h1>
          <h2 class="text-3xl sm:text-5xl font-black uppercase text-stroke mt-1 leading-none tracking-tight">
            {{ i18n.t('hero_sub_title') }}
          </h2>
        </div>

        <p class="text-ink-soft text-lg max-w-xl leading-relaxed">
          {{ i18n.t('hero_desc') }}
        </p>

        <!-- Quick Entry for Participant -->
        <BrCard class="max-w-md">
          <form @submit.prevent="handleJoin" class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="font-mono text-xs font-bold uppercase tracking-wider">{{ i18n.t('participant_box_title') }}</span>
              <span class="font-mono text-xs font-bold text-blue uppercase">{{ i18n.t('quick_enter_badge') }}</span>
            </div>
            <BrInput
              v-model="examCode"
              :placeholder="i18n.t('enter_exam_code_placeholder')"
              mono
              required
            />
            <BrButton type="submit" variant="primary" block size="lg">
              {{ i18n.t('join_exam_btn') }}
            </BrButton>
          </form>
        </BrCard>
      </div>

      <!-- Right Column: Features stat cards -->
      <div class="lg:col-span-5 space-y-4">
        <BrStatCard
          :value="i18n.t('stat_watermark_title')"
          :label="i18n.t('stat_watermark_label')"
          :sublabel="i18n.t('stat_watermark_sub')"
          variant="lime"
        />
        <BrStatCard
          :value="i18n.t('stat_lock_title')"
          :label="i18n.t('stat_lock_label')"
          :sublabel="i18n.t('stat_lock_sub')"
          variant="white"
        />
        <BrStatCard
          :value="i18n.t('stat_report_title')"
          :label="i18n.t('stat_report_label')"
          :sublabel="i18n.t('stat_report_sub')"
          variant="cream"
        />
      </div>
    </main>

    <!-- Footer -->
    <footer class="border-t-[3px] border-ink bg-white py-6">
      <div class="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs">
        <p>© 2026 {{ i18n.t('app_title') }}. {{ i18n.t('footer_rights') }}</p>
        <div class="flex items-center gap-4">
          <router-link to="/guide" class="hover:underline">{{ i18n.t('guide') }}</router-link>
          <span>•</span>
          <BrLangSwitch />
        </div>
      </div>
    </footer>
  </div>
</template>
