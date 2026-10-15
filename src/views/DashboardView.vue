<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'
import { supabase } from '@/lib/supabase'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
import BrBadge from '@/components/ui/BrBadge.vue'
import BrChip from '@/components/ui/BrChip.vue'
import BrStatCard from '@/components/ui/BrStatCard.vue'
import BrLangSwitch from '@/components/ui/BrLangSwitch.vue'

const router = useRouter()
const authStore = useAuthStore()
const i18n = useI18nStore()

interface Exam {
  id: string
  title: string
  code: string
  form_url: string
  status: 'draft' | 'scheduled' | 'ongoing' | 'finished'
  duration_min: number
  tolerance: number
  opens_at: string
  closes_at: string
  created_at: string
}

const exams = ref<Exam[]>([])
const loading = ref(true)

const fetchExams = async () => {
  try {
    loading.value = true
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    exams.value = data || []
  } catch (err: any) {
    console.error('Error fetching exams:', err)
  } finally {
    loading.value = false
  }
}

const handleSignOut = async () => {
  await authStore.signOut()
  router.push('/login')
}

onMounted(() => {
  fetchExams()
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <!-- Organizer Topbar -->
    <header class="border-b-[3px] border-ink bg-white sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue border-[3px] border-ink flex items-center justify-center text-white font-heading font-black text-lg">
              S
            </div>
            <span class="font-heading font-black text-xl tracking-tight uppercase">{{ i18n.t('app_title') }}</span>
          </router-link>
          <BrBadge variant="ink">{{ i18n.t('dashboard') }}</BrBadge>
        </div>

        <div class="flex items-center gap-4">
          <BrLangSwitch />
          <span class="font-mono text-xs hidden sm:inline text-ink-soft">
            {{ authStore.user?.email }}
          </span>
          <BrButton size="sm" variant="secondary" @click="handleSignOut">
            {{ i18n.t('logout') }}
          </BrButton>
        </div>
      </div>
    </header>

    <main class="flex-1 max-w-6xl mx-auto px-6 py-8 w-full space-y-8">
      <!-- Title & CTA -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-[3px] border-ink pb-6">
        <div>
          <h1 class="text-3xl sm:text-4xl font-black uppercase">{{ i18n.t('exam_management') }}</h1>
          <p class="font-mono text-xs text-ink-soft mt-1">
            {{ i18n.t('dashboard_subtitle') }}
          </p>
        </div>
        <div>
          <router-link to="/dashboard/exams/new">
            <BrButton variant="primary" size="md">
              {{ i18n.t('create_exam_btn') }}
            </BrButton>
          </router-link>
        </div>
      </div>

      <!-- Quick Metrics -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <BrStatCard
          :value="exams.length"
          :label="i18n.t('total_exams')"
          :sublabel="i18n.t('total_exams_sub')"
          variant="white"
        />
        <BrStatCard
          :value="exams.filter(e => e.status === 'ongoing').length"
          :label="i18n.t('ongoing_exams')"
          :sublabel="i18n.t('ongoing_exams_sub')"
          variant="lime"
        />
        <BrStatCard
          :value="exams.filter(e => e.status === 'finished').length"
          :label="i18n.t('finished_exams')"
          :sublabel="i18n.t('finished_exams_sub')"
          variant="cream"
        />
      </div>

      <!-- Exam List -->
      <section class="space-y-4">
        <h2 class="text-xl font-black uppercase">{{ i18n.t('your_exam_list') }}</h2>

        <div v-if="loading" class="text-center py-12 font-mono text-sm">
          {{ i18n.t('loading') }}
        </div>

        <div v-else-if="exams.length === 0" class="border-[3px] border-ink bg-white p-12 text-center shadow-[4px_4px_0px_0px_#0A0A0A] space-y-4">
          <div class="font-mono text-sm text-ink-soft">{{ i18n.t('empty_exams') }}</div>
          <router-link to="/dashboard/exams/new">
            <BrButton variant="primary">{{ i18n.t('create_first_exam') }}</BrButton>
          </router-link>
        </div>

        <div v-else class="space-y-4">
          <BrCard
            v-for="exam in exams"
            :key="exam.id"
            class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:translate-x-[2px] transition-transform"
          >
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <span class="font-mono text-xs font-black bg-ink text-white px-2 py-0.5 border border-ink">
                  CODE: {{ exam.code }}
                </span>
                <BrChip :status="exam.status" />
              </div>
              <h3 class="text-2xl font-black uppercase">{{ exam.title }}</h3>
              <div class="flex flex-wrap items-center gap-4 font-mono text-xs text-ink-soft">
                <span>⏱ {{ i18n.t('duration_label') }}: {{ exam.duration_min }} {{ i18n.t('minutes_label') }}</span>
                <span>•</span>
                <span>🛡 {{ i18n.t('tolerance_label') }}: {{ exam.tolerance }}x</span>
                <span>•</span>
                <span class="truncate max-w-xs">{{ exam.form_url }}</span>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <router-link :to="`/dashboard/exams/${exam.id}`">
                <BrButton variant="secondary" size="sm">{{ i18n.t('detail_participants_btn') }}</BrButton>
              </router-link>
              <router-link :to="`/dashboard/exams/${exam.id}/report`">
                <BrButton variant="lime" size="sm">{{ i18n.t('report_btn') }}</BrButton>
              </router-link>
            </div>
          </BrCard>
        </div>
      </section>
    </main>
  </div>
</template>
