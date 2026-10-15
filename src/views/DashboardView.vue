<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useI18nStore } from '@/stores/i18n'
import { supabase } from '@/lib/supabase'
import BrButton from '@/components/ui/BrButton.vue'
import BrCard from '@/components/ui/BrCard.vue'
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
const examToDelete = ref<Exam | null>(null)
const deleting = ref(false)

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

const formatSchedule = (opensAt: string, closesAt: string) => {
  if (!opensAt || !closesAt) return '-'
  const d1 = new Date(opensAt)
  const d2 = new Date(closesAt)
  
  const dateStr = d1.toLocaleDateString(i18n.currentLang === 'id' ? 'id-ID' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  })

  const t1 = d1.toLocaleTimeString(i18n.currentLang === 'id' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })
  const t2 = d2.toLocaleTimeString(i18n.currentLang === 'id' ? 'id-ID' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit'
  })

  return `${dateStr}, ${t1} - ${t2}`
}

const handleDeleteExam = async () => {
  if (!examToDelete.value) return
  try {
    deleting.value = true
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', examToDelete.value.id)

    if (error) throw error

    exams.value = exams.value.filter(e => e.id !== examToDelete.value?.id)
    examToDelete.value = null
  } catch (err: any) {
    alert(err.message || 'Gagal menghapus ujian')
  } finally {
    deleting.value = false
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
    <!-- Organizer Topbar (No bullet/dashboard badge beside title) -->
    <header class="border-b-[3px] border-ink bg-white sticky top-0 z-40">
      <div class="max-w-6xl mx-auto px-6 h-18 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <router-link to="/" class="flex items-center gap-2">
            <div class="w-8 h-8 bg-blue border-[3px] border-ink flex items-center justify-center text-white font-heading font-black text-lg">
              S
            </div>
            <span class="font-heading font-black text-xl tracking-tight uppercase">{{ i18n.t('app_title') }}</span>
          </router-link>
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
            class="flex flex-col lg:flex-row lg:items-center justify-between gap-6 hover:translate-x-[2px] transition-transform"
          >
            <div class="space-y-2 flex-1">
              <div class="flex flex-wrap items-center gap-3">
                <span class="font-mono text-xs font-black bg-ink text-white px-2 py-0.5 border border-ink">
                  CODE: {{ exam.code }}
                </span>
                <BrChip :status="exam.status" />
                <span class="font-mono text-xs font-bold text-blue bg-blue/10 px-2 py-0.5 border border-blue">
                  📅 {{ formatSchedule(exam.opens_at, exam.closes_at) }}
                </span>
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

            <!-- Action buttons for CRUD -->
            <div class="flex flex-wrap items-center gap-2">
              <router-link :to="`/dashboard/exams/${exam.id}`">
                <BrButton variant="secondary" size="sm">{{ i18n.t('detail_participants_btn') }}</BrButton>
              </router-link>
              <router-link :to="`/dashboard/exams/${exam.id}/edit`">
                <BrButton variant="secondary" size="sm">{{ i18n.t('edit_btn') }}</BrButton>
              </router-link>
              <router-link :to="`/dashboard/exams/${exam.id}/report`">
                <BrButton variant="lime" size="sm">{{ i18n.t('report_btn') }}</BrButton>
              </router-link>
              <BrButton variant="danger" size="sm" @click="examToDelete = exam">
                {{ i18n.t('delete_btn') }}
              </BrButton>
            </div>
          </BrCard>
        </div>
      </section>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="examToDelete"
      class="fixed inset-0 z-50 bg-ink/80 flex items-center justify-center p-4"
    >
      <BrCard class="max-w-md w-full space-y-4 text-ink">
        <h3 class="text-2xl font-black uppercase text-danger">{{ i18n.t('delete_confirm_title') }}</h3>
        <p class="text-sm text-ink-soft">
          {{ i18n.t('delete_confirm_desc', { title: examToDelete.title }) }}
        </p>
        <div class="flex gap-2 justify-end pt-2">
          <BrButton variant="secondary" size="md" @click="examToDelete = null" :disabled="deleting">
            {{ i18n.t('cancel') }}
          </BrButton>
          <BrButton variant="danger" size="md" @click="handleDeleteExam" :disabled="deleting">
            {{ deleting ? i18n.t('loading') : i18n.t('delete_btn') }}
          </BrButton>
        </div>
      </BrCard>
    </div>
  </div>
</template>
